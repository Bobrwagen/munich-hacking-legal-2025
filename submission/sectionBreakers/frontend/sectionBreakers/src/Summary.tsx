import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import { pdfjs, Document, Page } from "react-pdf";
import { GoDownload } from "react-icons/go";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Define types for conflict and text items
type Conflict = {
  chunks: { number: number };
  explanation: string;
};

type TextItemWithPageNum = {
  pageNum: number;
  textContent: (TextItem | TextMarkedContent)[]; // Allow both TextItem and TextMarkedContent
};

function Summary() {
  const location = useLocation();

  const doc1: File | null = location.state?.doc1;
  const doc1_path = URL.createObjectURL(doc1!);
  const doc2: File | null = location.state?.doc2;
  const doc2_path = URL.createObjectURL(doc2!);
  const conflicts: Conflict[] = location.state?.conflicts;

  const [pages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [index, setIndex] = useState<number>(0);
  const [summary, setSummary] = useState<string>("");
  const [highlights, setHighLights] = useState<
    { page: number; start: number; end: number }[]
  >([]);
  const [highlights_2, setHighLights_2] = useState<
    { page: number; start: number; end: number }[]
  >([]);
  const [textItems_1, setTextItems_1] = useState<TextItemWithPageNum[]>([]);
  const [textItems_2, setTextItems_2] = useState<TextItemWithPageNum[]>([]);

  const onLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    console.log("Conflicts: ", conflicts);
    const pageTexts_1: TextItemWithPageNum[] = [];
    const pageTexts_2: TextItemWithPageNum[] = [];
    const chunks2: (string | undefined)[] = `
1. **Introduction and Parties**  
This Non-Disclosure and Confidentiality Agreement (the “Agreement”) is entered into May 02, 2025 (the “Effective Date”) by and between Quantum Innovations Inc., a corporation organized and existing under the laws of the State of Washington, with its principal office located at 7890 Maple Avenue, Suite 101 - 104, Seattle, WA 98101, USA, represented by its CEO, Suzanne Reynolds (“Disclosing Party”), and Michael Thompson located at 4567 Pine Street, Apt 203, Concord, NH 03301, USA (“Receiving Party”), also individually referred to as the “Party”, and collectively the “Parties”.

2. **Purpose of the Agreement**  
The Parties are interested in exploring a potential business opportunity (the “Opportunity”). In order to adequately evaluate whether the Parties would like to pursue the Opportunity, it is necessary for both Parties to exchange certain confidential information.

3. **Consideration**  
IN CONSIDERATION OF disclosing and receiving confidential information, the Parties agree as follows:

4. **Definition of Confidential Information**  
Confidential Information. The confidential information (“Confidential Information”) includes any information that is only known by the Disclosing Party, and not known by the general public at the time it is disclosed, whether tangible or intangible, and through whatever means it is disclosed.

5. **Exclusions from Confidential Information**  
Confidential Information does not include information that:  
- The Receiving Party lawfully gained before the Disclosing Party actually disclosed it;  
- Becomes available to the general public by no fault of the Receiving Party.

6. **Use of Confidential Information**  
Use of Confidential Information. During the course of this Agreement, the Parties will have access to and learn of each other’s Confidential Information, including trade secrets, industry knowledge, and other confidential information. The Parties will not share any of this proprietary information at any time.  
The Receiving Party shall not use the Confidential Information for any purpose other than evaluating and performing contractual obligations in the context of the Opportunity. The Receiving Party will not use any of this proprietary information for either Party’s personal/business benefit at any time.  
This section remains in full force and effect even after termination of the Parties’ relationship by its natural termination or early termination by either Party.

7. **Disclosure to Personnel**  
The Receiving Party may disclose the Confidential Information to its personnel on an as-needed basis. The personnel must be informed that the Confidential Information is confidential and the personnel must agree to be bound by the terms of this Agreement.  
The Receiving Party is liable for any breach of this Agreement by their personnel.  
Any disclosure to personnel must be documented and reported to the Disclosing Party on a bi-monthly basis, sent via encrypted e-mail as specified in Appendix A (not included and provided separately).

8. **Obligation to Notify of Unauthorized Disclosure**  
In the event a Party loses Confidential Information or inadvertently discloses Confidential Information, that Party must notify the other Party within twelve (12) hours.  
That Party must also take any and all steps necessary to recover the Confidential Information and prevent further unauthorized use.

9. **Legal Disclosure**  
In the event a Party is required by law to disclose Confidential Information, that Party must notify the other Party of the legal requirement to disclose within two (2) business days of learning of the requirement.

10. **Notices**  
Notices must be made in accordance with Section 10 of this Agreement.

11. **Ownership and Title**  
Nothing in this Agreement will convey a right, title, interest, or license in the Confidential Information to the Receiving Party.  
The Confidential Information will remain the exclusive property of the Disclosing Party.

12. **Return of Confidential Information**  
Upon termination of this Agreement, the Receiving Party must return all tangible materials it has in its possession and permanently delete all files that contain any part of the Confidential Information the Receiving Party received, including all electronic and hard copies.  
This includes, but is not limited to, any notes, memos, drawings, prototypes, summaries, source code, excerpts and anything else derived from the Confidential Information.

13. **Term and Duration**  
This Agreement shall commence upon the Effective Date as stated above and continue until December 31st, 2030.  
Either Party may end this Agreement at any time by providing written notice to the other Party.  
The Parties’ obligation to maintain confidentiality of all Confidential Information received during the term of this Agreement will remain in effect for 30 (thirty) years.

14. **Remedies for Breach**  
The Parties agree the Confidential Information is unique in nature and money damages will not adequately remedy the irreparable injury breach of this Agreement may cause the injured Party.  
The injured Party is entitled to seek injunctive relief, as well as any other remedies that are available in law and equity.

15. **Penalties for Breach**  
The Receiving Party shall pay a penalty of up to $1,000,000 for any breach of this Agreement at the discretion of the Disclosing Party.

16. **Relationship of the Parties**  
- No Binding Agreement to Pursue Opportunity. The Parties agree they are exploring a potential Opportunity and sharing their Confidential Information is not a legal obligation to pursue the Opportunity. Either Party is free to terminate discussions or negotiations related to the Opportunity at any time.  
- No Exclusivity. The Parties understand this Agreement is not an exclusive arrangement. The Parties agree they are free to enter into other similar agreements with other parties.  
- Independent Contractors. The Parties to this Agreement are independent contractors. Neither Party is an agent, representative, partner, or employee of the other Party.

17. **General Provisions**  
- Assignment. The Receiving Party may not assign their rights and/or obligations under this Agreement.  
- Choice of Law. This Agreement will be interpreted based on the laws of the State of Washington, USA regardless of any conflict of law issues that may arise.  
- Dispute Resolution. The Parties agree that any dispute arising from this Agreement will be resolved at a court of competent jurisdiction located in the State of Washington, USA.  
- Complete Contract. This Agreement constitutes the Parties entire understanding of their rights and obligations. It supersedes any other written or verbal communications between the Parties.  
- Amendments. Any subsequent changes to this Agreement must be made in writing and signed by both Parties.  
- Severability. If any provision of this Agreement is deemed invalid or unenforceable, that part shall be severed, and the remaining provisions shall continue in full force and effect.  
- Waiver. Neither Party can waive any provision or rights unless agreed to in writing.  
- Non-Commitment. This Agreement does not create any binding obligation to pursue the Opportunity or enter into additional contracts.  
- Notices. All notices must be sent by email with return receipt requested or by certified or registered mail with return receipt requested, to the addresses specified.

18. **Notice Addresses**  
Disclosing Party:  
Quantum Innovations Inc.,  
7890 Maple Avenue  
Suite 101 - 104  
Seattle, WA 98101, USA

Receiving Party:  
Michael Thompson  
4567 Pine Street, Apt 203  
Concord, NH 03301, USA

19. **Signatures**  
The Parties agree to the terms and conditions set forth above as demonstrated by their signatures as follows:  
Quantum Innovations Inc., represented by its CEO, Suzanne Reynolds  
Signed: _____________________________________  
Name: _____________________________________  
Date: _____________________________________

Michael Thompson  
Signed: _____________________________________  
Name: _____________________________________  
Date: _____________________________________`
      .split("\n\n")
      .map((s) => s.split("**  \n").at(-1));
    const chunks1: (string | undefined)[] = `1. **Introduction and Parties**  
This Non-Disclosure and Confidentiality Agreement (the “Agreement”) is entered into __________________ (the “Effective Date”) by and between Quantum Innovations Inc., a corporation organized and existing under the laws of the State of Washington, with its principal office located at 7890 Maple Avenue, Suite 101, Seattle, WA 98101, USA, represented by its CEO, Emily Harper (“Disclosing Party”), and ________________ (“Receiving Party”), also individually referred to as the “Party”, and collectively the “Parties”.

2. **Purpose of the Agreement**  
The Parties are interested in exploring a potential business opportunity (the “Opportunity”). In order to adequately evaluate whether the Parties would like to pursue the Opportunity, it is necessary for both Parties to exchange certain confidential information.

3. **Consideration**  
IN CONSIDERATION OF disclosing and receiving confidential information, the Parties agree as follows:

4. **Definition of Confidential Information**  
Confidential Information. The confidential information (“Confidential Information”) includes any information that is only known by the Disclosing Party, and not known by the general public at the time it is disclosed, whether tangible or intangible, and through whatever means it is disclosed.

5. **Exclusions from Confidential Information**  
Confidential Information does not include information that:  
- The Receiving Party lawfully gained before the Disclosing Party actually disclosed it;  
- Is disclosed to the Receiving Party by a third party who is not bound by a confidentiality agreement;  
- Becomes available to the general public by no fault of the Receiving Party; or  
- Is required by law to be disclosed.

6. **Use of Confidential Information**  
During the course of this Agreement, the Parties will have access to and learn of each others’ Confidential Information, including trade secrets, industry knowledge, and other confidential information.  
- The Parties will not share any of this proprietary information at any time.  
- The Parties also will not use any of this proprietary information for either Party’s personal/business benefit at any time.  
- This section remains in full force and effect even after termination of the Parties’ relationship by its natural termination or early termination by either Party.

7. **Disclosure to Personnel**  
The Receiving Party may disclose the Confidential Information to its personnel on an as-needed basis.  
- The personnel must be informed that the Confidential Information is confidential and the personnel must agree to be bound by the terms of this Agreement.  
- The Receiving Party is liable for any breach of this Agreement by their personnel.

8. **Notification of Loss or Disclosure**  
In the event a Party loses Confidential Information or inadvertently discloses Confidential Information, that Party must notify the other Party within twenty-four (24) hours.  
- That Party must also take any and all steps necessary to recover the Confidential Information and prevent further unauthorized use.

9. **Legal Disclosure**  
In the event a Party is required by law to disclose Confidential Information, that Party must notify the other Party of the legal requirement to disclose within three (3) business days of learning of the requirement.

10. **Notices**  
Notices must be made in accordance with Section 9 of this Agreement.

11. **Ownership and Title**  
Nothing in this Agreement will convey a right, title, interest, or license in the Confidential Information to the Receiving Party.  
- The Confidential Information will remain the exclusive property of the Disclosing Party.

12. **Return of Confidential Information**  
Upon termination of this Agreement, the Receiving Party must return all tangible materials it has that contain the Confidential Information it received, including all electronic and hard copies.  
- This includes, but is not limited to, any notes, memos, drawings, summaries, excerpts and anything else derived from the Confidential Information.

13. **Term and Termination**  
This Agreement shall commence upon the Effective Date as stated above and continue until __________________.  
- Either Party may end this Agreement at any time by providing written notice to the other Party.  
- The Parties’ obligation to maintain confidentiality of all Confidential Information received during the term of this Agreement will remain in effect indefinitely.

14. **Remedies**  
The Parties agree the Confidential Information is unique in nature and money damages will not adequately remedy the irreparable injury breach of this Agreement may cause the injured Party.  
- The injured Party is entitled to seek injunctive relief, as well as any other remedies that are available in law and equity.

15. **Relationship of the Parties**  
- No Binding Agreement to Pursue Opportunity: The Parties agree they are exploring a potential Opportunity and sharing their Confidential Information is not a legal obligation to pursue the Opportunity.  
- Either Party is free to terminate discussions or negotiations related to the Opportunity at any time.  
- No Exclusivity: The Parties understand this Agreement is not an exclusive arrangement.  
- The Parties agree they are free to enter into other similar agreements with other parties.  
- Independent Contractors: The Parties to this Agreement are independent contractors. Neither Party is an agent, representative, partner, or employee of the other Party.

16. **General Provisions**  
- Assignment: The Parties may not assign their rights and/or obligations under this Agreement.  
- Choice of Law: This Agreement will be interpreted based on the laws of the State of Washington, USA regardless of any conflict of law issues that may arise.  
- Dispute Resolution: The Parties agree that any dispute arising from this Agreement will be resolved at a court of competent jurisdiction located in the State of Washington, USA.  
- Complete Contract: This Agreement constitutes the Parties entire understanding of their rights and obligations.  
- This Agreement supersedes any other written or verbal communications between the Parties.  
- Any subsequent changes to this Agreement must be made in writing and signed by both Parties.  
- Severability: In the event any provision of this Agreement is deemed invalid or unenforceable, in whole or in part, that part shall be severed from the remainder of the Agreement and all other provisions should continue in full force and effect as valid and enforceable.  
- Waiver: Neither Party can waive any provision of this Agreement, or any rights or obligations under this Agreement, unless agreed to in writing.  
- Notices: All notices under this Agreement must be sent by email with return receipt requested or certified or registered mail with return receipt requested.  
- Notices should be sent as specified in the contact details provided.

17. **Signatures**  
The Parties agree to the terms and conditions set forth above as demonstrated by their signatures as follows:  
- Name: ______________________________  
- Signed: _____________________________________  
- Name: _____________________________________  
- Date: _____________________________________

18. **Additional Signatures**  
- Name: ______________________________  
- Signed: _____________________________________  
- Name: _____________________________________  
- Date: _____________________________________`
      .split("\n\n")
      .map((s) => s.split("**  \n").at(-1));
    // Initialize the highlights state
    const newHighlights: { page: number; start: number; end: number }[] = [];
    const newHighlights_2: { page: number; start: number; end: number }[] = [];

    const pdf_doc1 = await pdfjs.getDocument(doc1_path).promise;
    const pdf_doc2 = await pdfjs.getDocument(doc2_path).promise;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page1 = await pdf_doc1.getPage(pageNum);
      const page2 = await pdf_doc2.getPage(pageNum);

      const textContent_1 = await page1.getTextContent();
      const textContent_2 = await page2.getTextContent();

      pageTexts_1.push({ pageNum, textContent: textContent_1.items });
      pageTexts_2.push({ pageNum, textContent: textContent_2.items });

      // Process chunks for doc1
      chunks1.forEach((chunk) => {
        const chunkIndices = findChunkInText(textContent_1.items, chunk!);
        console.log(chunkIndices);
        if (chunkIndices) {
          newHighlights.push({
            page: pageNum,
            start: chunkIndices.start,
            end: chunkIndices.end,
          });
          console.log("1: ", {
            page: pageNum,
            start: chunkIndices.start,
            end: chunkIndices.end,
          });
        }
      });

      // Process chunks for doc2
      chunks2.forEach((chunk) => {
        const chunkIndices = findChunkInText(textContent_2.items, chunk!);
        if (chunkIndices) {
          newHighlights_2.push({
            page: pageNum,
            start: chunkIndices.start,
            end: chunkIndices.end,
          });
          console.log("2: ", {
            page: pageNum,
            start: chunkIndices.start,
            end: chunkIndices.end,
          });
        }
      });
    }

    // Set the state for the text items and highlights
    setTextItems_1(pageTexts_1);
    setTextItems_2(pageTexts_2);
    setHighLights(newHighlights); // Update highlights state
    setHighLights_2(newHighlights_2);
    console.log(newHighlights);
    console.log(newHighlights_2);
  };

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  const renderHighlights = (
    pageNum: number,
    highlights: { start: number; end: number }[],
    textItem: TextItemWithPageNum[]
  ) => {
    let combinedText = "";

    // Combine all the text items into a single string.
    textItem[pageNum - 1]?.textContent.forEach((item) => {
      // Check the type of the item and access the text accordingly
      if ("str" in item) {
        // This is a TextItem, which has the 'str' property
        combinedText += item.str;
      }
    });
    return highlights.map((highlight, index) => {
      // Assuming that start and end indices map to textContent positions
      console.log(highlight);
      const mesg = combinedText.substring(
        highlight.start,
        highlight.start + 10
      );
      let startItem = textItem[pageNum - 1]?.textContent.find(
        (el) => "str" in el && el.str.includes(mesg)
      );
      let ind = textItem[pageNum - 1]?.textContent.indexOf(startItem!);
      startItem = textItem[pageNum - 1]?.textContent[Math.max(0, ind - 20)];
      const end = combinedText.substring(highlight.end - 10, highlight.end);
      let endItem = textItem[pageNum - 1]?.textContent.find(
        (el) => "str" in el && el.str.includes(end)
      );
      ind = textItem[pageNum - 1]?.textContent.indexOf(endItem!);
      endItem = textItem[pageNum - 1]?.textContent[Math.min(100, ind + 50)];
      console.log(mesg);
      console.log(end);
      console.log("Start item: ", startItem);
      console.log("End item: ", endItem);
      // Check that we have the text items
      if (
        startItem &&
        endItem &&
        "transform" in startItem &&
        "transform" in endItem
      ) {
        const startX = startItem.transform[4]; // X position of the start
        const startY = startItem.transform[5]; // Y position of the start
        const width = endItem.transform[4] - startX; // Width between start and end
        const height = startItem.height; // Height of the text item

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top: `${startY}px`,
              left: `${startX}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: "rgba(255, 255, 0, 0.7)", // Yellow highlight
              zIndex: 20,
            }}
          />
        );
      }

      return null;
    });
  };

  return (
    <>
      <main className="font-sans bg-[linear-gradient(120deg,_#fdfbfb_0%,_#ebedee_100%)] h-full">
        <header className="p-4 py-4">
          <nav>
            <ul className="flex gap-5 list-none m-0 p-0">
              <li>
                <a href="#" className="hover:underline text-lg text-black">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-lg text-black">
                  Login
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <div className="flex flex-row">
          <div className="flex flex-row w-[67%]">
            {doc1 && (
              <div className="flex flex-col justify-center items-center p-4 w-full max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md p-4">
                <p>{doc1?.name}</p>
                <div className="w-full mt-4">
                  <Document
                    file={doc1}
                    onLoadSuccess={onLoadSuccess}
                    onLoadError={console.error}
                    className="rounded-lg overflow-hidden bg-white shadow-sm"
                  >
                    <div className="h-128 border-3 rounded-md overflow-auto inset-4">
                      <Page pageNumber={pageNumber} scale={0.8} />
                      {renderHighlights(
                        pageNumber,
                        highlights.filter((h) => h.page === pageNumber),
                        textItems_1
                      )}
                      <div className="absolute top-[380px] right-[420px] bg-orange-300 opacity-50 z-12 w-[450px] h-[140px] border"></div>
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
                      Page {pageNumber} of {pages}
                    </span>
                    <button
                      className="text-white bg-black hover:shadow-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() =>
                        setPageNumber((prevPage) =>
                          Math.min(prevPage + 1, pages)
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {doc2 && (
              <div className="flex flex-col justify-center items-center p-4 w-full max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md p-4">
                <p>{doc2?.name}</p>

                <div className="w-full mt-4">
                  <Document
                    file={doc2}
                    onLoadSuccess={onLoadSuccess}
                    onLoadError={console.error}
                    className="rounded-lg overflow-hidden bg-white shadow-sm"
                  >
                    <div className="h-128 border-3 rounded-md overflow-auto inset-4">
                      <Page pageNumber={pageNumber} scale={0.8} />
                      {renderHighlights(
                        pageNumber,
                        highlights_2.filter((h) => h.page === pageNumber),
                        textItems_2
                      )}
                      <div className="absolute top-[380px] left-[50px] bg-orange-300 opacity-50 z-12 w-[450px] h-[190px] border"></div>
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
                      Page {pageNumber} of {pages}
                    </span>
                    <button
                      className="text-white bg-black hover:shadow-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() =>
                        setPageNumber((prevPage) =>
                          Math.min(prevPage + 1, pages)
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
          <div className="flex flex-col">
            <div className="flex flex-col justify-start items-center w-[300px] ml-32 mt-14 pt-4 p-4 border-2 rounded-md h-[200px]">
              <h2 className="text-2xl">Medium risk!</h2>
              <p>
                {" "}
                Two articles were left out, which create a disadvantageous
                postion for you. It is recommend to add the missing articles.
              </p>
            </div>
            <div className="flex flex-row justify-evenly items-between w-[300px] ml-32 mt-4  h-[90px]">
              <button className="mx-2 my-4 rounded-md bg-green-400 text-white p-4 ">
                Accept
              </button>
              <button className=" m-4 rounded-md bg-red-400 text-white p-4 ">
                Reject
              </button>
              <button className=" m-4 rounded-md bg-blue-400 text-white p-4 ">
                {" "}
                Skip
              </button>
            </div>
          </div>
          <button className="flex justify-center items-center absolute right-[20px] bottom-[80px] z-40 w-[50px] h-[50px] border bg-blue-400 text-white rounded-3xl">
            <GoDownload></GoDownload>
          </button>
        </div>
      </main>
    </>
  );
}

const findChunkInText = (
  textItems: (TextItem | TextMarkedContent)[],
  chunk: string
) => {
  let combinedText = "";

  // Combine all the text items into a single string.
  textItems.forEach((item) => {
    // Check the type of the item and access the text accordingly
    if ("str" in item) {
      // This is a TextItem, which has the 'str' property
      combinedText += item.str;
    }
  });
  // Find the start and end indices of the chunk in the combined text.
  const startIdx = combinedText.indexOf(chunk);
  const endIdx = startIdx + chunk.length;

  // If chunk is found, return the start and end indices.
  if (startIdx !== -1) {
    return { start: startIdx, end: endIdx };
  }

  // If chunk is not found, return null.
  return null;
};

export default Summary;
