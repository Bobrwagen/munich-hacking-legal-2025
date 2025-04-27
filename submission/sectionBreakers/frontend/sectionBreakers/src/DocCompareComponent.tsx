import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { pdfjs, Document, Page } from "react-pdf";
import { useDocContext } from "./DocContext";
import { Link } from "react-router-dom";
// Pull in the worker entry (this is the bundler-friendly entrypoint)

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const SERVER_URL = "http://localhost:8000";

type Conflict = {
  chunks: { number: number };
  explanation: string;
};

export default function DocCompareComponent() {
  // --- state ---
  //const [doc1, setDoc1] = useState<File | null>(null);
  // const [doc2, setDoc2] = useState<File | null>(null);
  const [documentState, setDocumentState] = useState<string>("");
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showDifferences, setShowDifferences] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [draftPageNumber, setDraftpageNumber] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState(1);

  const navigate = useNavigate();

  // configure PDF.js worker once

  const { doc1, setDoc1, doc2, setDoc2 } = useDocContext();

  useEffect(() => {
    // Setze den Worker-URL als String
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "original" | "draft"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "original") setDoc1(file);
    else setDoc2(file);
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
  const findConflicts = async (d1: File, d2: File): Promise<Conflict[]> => {
    const resp = await fetch(
      `${SERVER_URL}/get-conflicts?doc1=${encodeURIComponent(
        d1.name
      )}&doc2=${encodeURIComponent(d2.name)}`
    );
    if (!resp.ok) return [];
    const { conflicts } = (await resp.json()) as { conflicts: Conflict[] };
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

  return (
    <>
      <div className="flex justify-evenly gap-10 mt-5 flex-wrap mt-32 bg-[linear-gradient(120deg,_#fdfbfb_0%,_#ebedee_100%)]">
        {/* Original File Upload */}
        <div className="flex flex-col items-center w-[40%]">
          <label
            className="bg-black text-white py-2 px-5 rounded-lg cursor-pointer mb-4
              hover:shadow-lg"
          >
            Upload Original
            <input
              type="file"
              accept="application/pdf"
              className="opacity-0 absolute"
              onChange={(e) => handleFileChange(e, "original")}
            />
          </label>
          {doc1 && (
            <div className="flex flex-col justify-center items-center p-4 w-full max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md">
              <p className="flex justify-between items-center w-full text-lg">
                <button
                  className="text-red-700 text-xl hover:text-red-800 focus:outline-none"
                  onClick={() => setDoc1(null)}
                >
                  x
                </button>
                <span className="ml-4 text-gray-900">{doc1.name}</span>
              </p>

              <div className="w-full mt-4">
                <Document
                  file={doc1}
                  onLoadSuccess={onLoadSuccess}
                  onLoadError={console.error}
                  className="rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <div className="h-128 border-3 rounded-md overflow-auto">
                    <Page pageNumber={pageNumber} scale={0.8} />
                  </div>
                </Document>

                <div className="flex justify-between items-center mt-8 h-[80px]">
                  <button
                    className="text-white bg-black hover:shadow-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() =>
                      setPageNumber((prevPage) => Math.max(prevPage - 1, 1))
                    }
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 mb-28">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    className="text-white bg-black hover:shadow-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() =>
                      setPageNumber((prevPage) =>
                        Math.min(prevPage + 1, numPages)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Draft File Upload */}
        <div className="flex flex-col items-center w-[40%]">
          <label
            className="bg-black text-white py-2 px-5 rounded-lg cursor-pointer mb-4
              hover:shadow-lg"
          >
            Upload Draft
            <input
              type="file"
              accept="application/pdf"
              className="opacity-0 absolute"
              onChange={(e) => handleFileChange(e, "draft")}
            />
          </label>
          {doc2 && (
            <div className="flex flex-col justify-center items-center p-4 w-full max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md">
              <p className="flex justify-between items-center w-full text-lg">
                <button
                  className="text-red-700 text-xl hover:text-red-800 focus:outline-none"
                  onClick={() => setDoc2(null)}
                >
                  x
                </button>
                <span className="ml-4 text-gray-900">{doc2.name}</span>
              </p>

              <div className="w-full mt-4">
                <Document
                  file={doc2}
                  onLoadSuccess={onLoadSuccess}
                  onLoadError={console.error}
                  className="rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <div className="h-128 border-3 rounded-md overflow-auto">
                    <Page pageNumber={draftPageNumber} scale={0.8} />
                  </div>
                </Document>

                <div className="flex justify-between items-center mt-8 h-[80px]">
                  <button
                    className="text-white bg-black hover:shadow-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() =>
                      setPageNumber((prevPage) => Math.max(prevPage - 1, 1))
                    }
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 mb-28">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    className="text-white bg-black hover:shadow-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() =>
                      setPageNumber((prevPage) =>
                        Math.min(prevPage + 1, numPages)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex justify-end p-4 r-0 b-0">
        <Link
          to="/main"
          state={{ doc1: doc1, doc2: doc2, conflicts: conflicts }}
          className="absolute bottom-[60px] inline-block bg-black hover:shadow-lg hover:bg-white hover:text-black text-white py-2 mb-16 px-6 text-base rounded-md transition-colors m-4"
        >
          Review ➔
        </Link>
      </div>
    </>
  );
}
