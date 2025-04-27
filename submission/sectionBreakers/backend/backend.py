from fastapi import FastAPI,HTTPException
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import logging
import os


os.environ["TOKENIZERS_PARALLELISM"] = "false"
CHUNK_PROMPT = """You are a legal assistant specialized in German law.
Your task is to split the following legal text into meaningful sections or clauses, based on semantic boundaries such as obligations, conditions, definitions, exceptions, or rights.

Each chunk should:
- Be self-contained and contextually coherent
- Include any related subpoints or sentences necessary to understand it
- Preserve the legal meaning without rewriting or summarizing

Return a list of chunks. Each chunk should be clearly separated by  two linebreaks "\n\n" and optionally include a short descriptive title (e.g., “Kündigungsfrist”, “Vertragsgegenstand”, etc.).
Text to process:"""

COMPARISON_PROMPT = """
ou are a lawyer specialized in German law and you worry about risk a lot and work diligently. Your task is to compare 5 pairs of legal text chunks (Chunk A and Chunk B), where Chunk A is the legally correct version. Chunk B must preserve the meaning, legal effect, and protective scope of Chunk A. Follow these steps for each pair:

Deviation Analysis: Identify any deviations in meaning, obligations, conditions, rights, exceptions, remedies, or risk allocation. Pay attention to:
Reductions or expansions of protections and obligations.
Introduction of exceptions or loss of remedies.
Increased ambiguity.
Risk Evaluation: Assess whether the deviation increases legal risk (e.g., reduced protections, expanded liabilities, vagueness, or lack of enforcement mechanisms).
Risk Classification: Classify the risk as Low, Medium, or High. i.E identical chunks are low risk.
Justification: Provide a concise justification (max 3 sentences).

Answer Format:

"Ja" for Medium/High risk, "Nein" for Low risk. + "\n"
Include risk classification but only in one word [Niedrig,Mittel,Hoch] + "\n" 
and justification in German.
Separate sections with "\n\n\n".

Repeat these steps for 5 pairs of text chunks.
Say Text A/B instead of Chunk A/B.

<IMPORTANT>
if two chunks are very similar or almost identical, then classify them as low risk
dont say chunk, say section instead
<IMPORTANT>
 Here are 5 pairs of Chunk A and Chunk B:

"""



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

origins = ["http://localhost:5173","https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js"]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)
client = OpenAI()
model_name = "sentence-transformers/all-MiniLM-L6-v2"
embeddings = HuggingFaceEmbeddings(model_name=model_name)

docs_inDB = ["Standard_NDA_2025.docx", "NDA_amended.docx"]

class DocumentModel(BaseModel):
    text: str
    name: str

class DocumentNamePair:
    name1: str
    name2: str

class DocumentQuery:
    query: str
    name: str

class Conflicts:
    conflicts: list[dict[int,int]]



@app.get("/")
def hi():
    print('Hello')

@app.post("/make-chunks")
async def make_chunks(document: DocumentModel) -> dict:
    try:
        if document.name not in docs_inDB:
            prompt = CHUNK_PROMPT + document.text
            logger.info("Creating prompt for chunking")
            response = client.responses.create(
                model="gpt-4.1-nano",
                input=[{"role": "user", "content": prompt}],
                temperature=0,
            )
            chunks = response.output_text
            # Remove file extension for consistent indexing and file naming
            name_without_extension = os.path.splitext(document.name)[0]
            txt_filename = f"./{name_without_extension}.txt"

            # Save chunks to text file
            with open(txt_filename, "w", encoding="utf-8") as f:
                f.write(chunks)
            logger.info(f"Stored chunked text in {txt_filename}")

            # Store chunks in FAISS index
            store_chunks(chunks.split("\n\n"), name_without_extension)
        return {"message": "Success"}

    except Exception as e:
        logger.error(f"Error in make_chunks: {e}")
        raise HTTPException(status_code=400, detail="Error during chunking")

def store_chunks(chunks: list[str], name: str) -> None:
    try:
        vectorstore = FAISS.from_texts(chunks, embedding=embeddings)
        vectorstore.save_local(f"faiss_db_{name}")
        logger.info(f"FAISS index stored for: {name}")
    except Exception as e:
        logger.error(f"Error storing FAISS index for {name}: {e}")
        raise HTTPException(status_code=500, detail="Error storing FAISS index")


def get_chunks(file : DocumentModel) -> list[str]:
    try:
        txt_filename = f"./{file.name.replace('.docx', '.txt').replace('.pdf', '.txt')}"
            
        with open(txt_filename, "r", encoding="utf-8") as f:
            text = f.read()
            return text.split("\n\n")
    except Exception as e:
        logger.debug(f"Got exception using get-chunks: {e}")




@app.get("/query_chunks")
def get_chunks_from_db(query : str, name : str) -> dict[str,list[str]]:
    try:
        vectorstore = FAISS.load_local(f"faiss_db_{name}", embeddings,allow_dangerous_deserialization=True)
        results = vectorstore.similarity_search(query, k=1)
        return { "chunks" : [doc.page_content for doc in results]}
    except Exception as e:
        logger.info(f"Got exception: {e}")
        raise HTTPException(
            status_code=400, detail= "Got an error while searching for chunks, the query might be invalid"
        )


@app.get("/get-conflicts")
async def get_conflicts(doc1: str = Query(), doc2: str = Query()) -> dict:
    try:
        doc1_model = DocumentModel(text="", name=doc1)
        doc2_model = DocumentModel(text="", name=doc2)

        # Retrieve chunks for both documents
        doc1_chunks = get_chunks(doc1_model)
        doc2_chunks = get_chunks(doc2_model)
        conflicts = []

        for j in range(0,10,5): #len(doc1_chunks),5):
            prompt = ""
            for i in range(5):
                if i + j >= len(doc1_chunks):
                    break
                similar_chunk = get_chunks_from_db(doc1_chunks[j+i], doc2)["chunks"][0]
                prompt += "Chunk A: \n" + doc1_chunks[j+i] + "\n\nChunk B: \n" + similar_chunk + "\n\n\n"
            records = checkConflict(prompt=prompt)
            # logger.info(records)
            for i in range(len(records)):
                if i + j >= len(doc1_chunks):
                    break
                if records[i]["text"]:
                    index = doc2_chunks.index(get_chunks_from_db(doc1_chunks[j+i], doc2)["chunks"][0])
                    conflicts.append({"chunks": {i + j: index}, "explanation": records[i]["text"]})
            logger.info(f"Added 5, current state is {j+5 } out of {len(doc1_chunks)}")

        return {"conflicts": conflicts}

    except Exception as e:
        logger.error(f"Error in get_conflicts: {e}")
        raise HTTPException(status_code=400, detail="Error comparing conflicts")

def checkConflict(prompt : str):
    try:
        prompt = COMPARISON_PROMPT + prompt
        response = client.responses.create(
                model="gpt-4.1-nano",
                input=[{"role": "user", "content": prompt}],
                temperature=0,
                )
        response : str = response.output_text
        return makeRecords(response=response)
    
    except Exception as e:
        logger.info(f"Got exception while comparing chunks: {e}")
        raise HTTPException(
            status_code=400, detail= "Got an error while comparing chunks"
        )

def makeRecords(response : str):
    responses = response.split("\n\n---\n\n")
    res = []
    for ans in responses:
        answer = ans.split("\n")
        if "Ja" in answer[0]:
            res.append({ "text" : answer[1] + "\n" + answer[2]})
        res.append({"text" : ""})
    return res




