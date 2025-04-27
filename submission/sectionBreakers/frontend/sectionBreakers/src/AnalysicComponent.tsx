import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";



const SERVER_URL = "http://localhost:8000";

type Conflict = {
  chunks: { number: number };
  explanation: string;
};


function AnalysisComponent() {

    //const [doc1, setDoc1] = useState<File | null>(null);
      //const [doc2, setDoc2] = useState<File | null>(null);
      const [documentState, setDocumentState] = useState<string>("");
      const [conflicts, setConflicts] = useState<Conflict[]>([]);


      const analyzeDocs = async () => {
        setDocumentState("Chunking…");
        //const status = await chunkDocuments(getFile(), doc2);
        //setDocumentState(status);
    
        setDocumentState("Finding Conflicts…");
        const found = await findConflicts();
        setConflicts(found);
        setDocumentState("");
      };

 // send chunks to server
 const chunkDocuments = async (d1: File, d2: File): Promise<string> => {
    const t1 = await extractDocument(d1);
    const t2 = await extractDocument(d2);
    const res1 = await fetch(`${SERVER_URL}/make-chunks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t1, name: d1.name }),
    });
    const res2 = await fetch(`${SERVER_URL}/make-chunks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t2, name: d2.name }),
    });
    const j1 = await res1.json();
    const j2 = await res2.json();
    return j1.message === "Success" && j2.message === "Success"
      ? "Chunked"
      : "Failed";
  };

  // fetch conflicts
  const findConflicts = async (): Promise<Conflict[]> => {
    const resp = await fetch(
      `${SERVER_URL}/get-conflicts?doc1=${encodeURIComponent(
        "Standard_NDA_2025.docx"
      )}&doc2=${encodeURIComponent("NDA_amended.docx")}`
    );
    if (!resp.ok) return [];
    const { conflicts } = await resp.json() as { conflicts: Conflict[] };
    return conflicts;
  };

  // extract text from DOCX or PDF
  const extractDocument = (doc: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const ab = e.target?.result;
        if (!(ab instanceof ArrayBuffer)) return reject("Bad buffer");

        if (
          doc.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          try {
            const { value } = await mammoth.extractRawText({ arrayBuffer: ab });
            resolve(value);
          } catch (err) {
            reject(err);
          }
        } else if (doc.type === "application/pdf") {
          try {
            const loadingTask = pdfjsLib.getDocument(ab);
            const pdf = await loadingTask.promise;
            let full = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const strs = content.items
                .filter((it): it is TextItem => "str" in it)
                .map((it) => it.str)
                .join(" ");
              full += strs + "\n\n";
            }
            resolve(full);
          } catch (err) {
            reject(err);
          }
        } else {
          reject("Unsupported file type");
        }
      };
      reader.readAsArrayBuffer(doc);
    });
  };

    return (<>
     {/* Analyze Button */}
     <div className="text-center bg-[linear-gradient(120deg,_#fdfbfb_0%,_#ebedee_100%)]">
          </div>

          {/* Analysis Result */}
          <section className="review bg-[linear-gradient(120deg,_#fdfbfb_0%,_#ebedee_100%)]">
            <h2 className="text-2xl font-semibold text-center">Risk Assessment
              {documentState === "" ? null : ": " + documentState + "..." }
            </h2>

            <div className="text-center">
              <textarea
                id="legal-decision-result"
                readOnly
                value={
                  conflicts.length > 0 
                  ? conflicts.length + " conflict(s) found."
                  : ""
                }
                placeholder="Result will appear here after analysis..."
                className="w-[90%] h-[120px] p-5 bg-[#e0e0e0] shadow-sm border rounded-md border-gray-300 resize-none text-lg font-bold text-center"
              />
            </div>

            {/* Preview Button */}
            <div className="flex flex-col items-center text-center w-ful">
            <button
              onClick={analyzeDocs}
              className="bg-white hover:border-2 shadow-lg h-[40px] w-[23%] text-base px-6 text-lg rounded-md transition-colors mb-36 mt-2"
            >
              Analyze
            </button>
            
            </div>
          </section>
          <footer className="bottom-0 bg-black text-white text-center p-5 h-[100px]">
        <p>© 2025 Contract Analysis Tool</p>
      </footer>
    </>);


 

 
}

export default AnalysisComponent