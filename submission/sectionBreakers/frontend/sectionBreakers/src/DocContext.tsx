import React, { createContext, useState, useContext, ReactNode } from "react";

type Conflict = {
  chunks: { number: number };
  explanation: string;
};

type DocContextType = {
  doc1: File | null;
  setDoc1: (file: File | null) => void;
  doc2: File | null;
  setDoc2: (file: File | null) => void;
  conflicts: Conflict[];
  setConflicts: (conflicts: Conflict[]) => void;
};

const DocContext = createContext<DocContextType | undefined>(undefined);

export const useDocContext = () => {
  const context = useContext(DocContext);
  if (!context) throw new Error("useDocContext must be used within DocProvider");
  return context;
};

export const DocProvider = ({ children }: { children: ReactNode }) => {
  const [doc1, setDoc1] = useState<File | null>(null);
  const [doc2, setDoc2] = useState<File | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  return (
    <DocContext.Provider
      value={{ doc1, setDoc1, doc2, setDoc2, conflicts, setConflicts }}
    >
      {children}
    </DocContext.Provider>
  );
};
