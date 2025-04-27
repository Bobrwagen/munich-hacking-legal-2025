import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home"
import { DocProvider } from "./DocContext";
import Summary from "./Summary";

function App() {
  return (
    <Router>
    <DocProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/main" element={<Summary />} />
      </Routes>
      </DocProvider>
      </Router>
  );
}

export default App;
