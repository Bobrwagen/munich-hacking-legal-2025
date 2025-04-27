import React, { useState } from "react";
import DocCompareComponent from "./DocCompareComponent";
import {TypeAnimation} from 'react-type-animation';
import AnalysisComponent from "./AnalysicComponent";

function Home() {

  const [analysisResult, setAnalysisResult] = useState("");


  const handleAnalyze = () => {
    console.log("Analyze clicked");
  };
  

  return (
    <>
      <div className="w-full h-lvh bg-[linear-gradient(120deg,_#fdfbfb_0%,_#ebedee_100%)]">
      <main className="font-sans bg-[linear-gradient(120deg,_#fdfbfb_0%,_#ebedee_100%)] ">
      <header className="p-4 sticky top-0 z-50 w-full backdrop-blur-md py-4">
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


        <section className="upload">
          <h2 className="text-shadow-sm text-3xl font-semibold mt-16 text-center">Upload Contracts and
          <TypeAnimation
      sequence={[
        ' analyze', 
        1500, 
        ' change', 
        1500, 
        ' improve',
        3000, 
        () => {
        },
      ]}
      wrapper="span"
      cursor={true}
      repeat={Infinity}
      style={{ fontSize: '5xl',color:"#2196F3", }}
    />
          </h2>

          
          <DocCompareComponent />
          <AnalysisComponent></AnalysisComponent>
        </section>
      </main>
      </div>
    </>
  );
}

export default Home;
