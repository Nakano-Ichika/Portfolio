import { Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav";
import { BackendProvider } from "./context/BackendContext";
import Landing from "./pages/Landing";
import Report from "./pages/Report";
import Methodology from "./pages/Methodology";
import AllResearch from "./pages/AllResearch";

export default function App() {
  return (
    <BackendProvider>
      <div className="min-h-screen bg-white">
        <TopNav />
        <Routes>
          <Route path="/"                element={<Landing />} />
          <Route path="/research"        element={<AllResearch />} />
          <Route path="/research/:slug"  element={<Report />} />
          <Route path="/methodology"     element={<Methodology />} />
        </Routes>
      </div>
    </BackendProvider>
  );
}
