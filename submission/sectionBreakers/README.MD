# Legal Text Chunking API

This project is a FastAPI-based web service for processing legal texts, identifying conflicts, and performing chunking for German law documents. The API uses OpenAI's GPT models for text generation, and LangChain for embedding and vector search operations.

## Backend Functionality
--- 
The backend provides the following functionalities:
1. **Chunking Legal Texts**: The API can split large legal texts into semantically meaningful sections, making it easier to review clauses and obligations.
2. **Conflict Detection**: The service compares two legal documents and identifies potential conflicts between them, assessing the risks associated with each conflict.
3. **Similarity Search**: A search mechanism allows for retrieving related legal sections based on a user query.

The backend utilizes:
- **FastAPI** for the web framework
- **OpenAI API** for generating text and analyzing conflicts
- **FAISS** for vector storage and similarity search
- **HuggingFaceEmbeddings** for embedding the text chunks

## Setup Instructions

### 1. Clone the Repository

Start by cloning the repository:

```bash
git clone https://your-repository-url
cd your-repository-name
````
### 2. 2. Set Up the Virtual Environment
On Unix-based Systems (Linux/macOS):

```bash
python3 -m venv venv
source venv/bin/activate
````

On Windows:
```bash
python -m venv venv
.\venv\Scripts\activate
```

3. Install Dependencies
Once the virtual environment is activated, install the required packages from requirements.txt:
```bash
pip install -r requirements.txt
```

4. Export Your API Key
The OpenAI API requires you to set your API key as an environment variable.

On Unix-based Systems (Linux/macOS):

Run the following command to export the API key for the current terminal session:
export OPENAI_API_KEY="your-api-key-here"
5. Run the FastAPI Application
Once you have set up the environment and installed dependencies, you can run the FastAPI app using:
```bash
uvicorn app:app --reload
```

---

## Frontend functionality

For the frontend we used React with react routing. 
---

After starting the backend, we can now run our website! for that you have to switch to the frontend repository using:
```bash
cd ./frontend/sectionBreakers
```
Now you have to install the necessary dependencies for the site. To download them all and directly start the site, run:
```bash
npm install
npm run dev
```