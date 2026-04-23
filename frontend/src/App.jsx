import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import WarmupBanner from "./components/WarmupBanner";
import { BackendProvider } from "./context/BackendContext";
import Dashboard from "./pages/Dashboard";
import Screener from "./pages/Screener";
import Portfolio from "./pages/Portfolio";
import Backtest from "./pages/Backtest";
import Cases from "./pages/Cases";
import CaseStudy from "./pages/CaseStudy";

export default function App() {
  return (
    <BackendProvider>
      <div className="min-h-screen bg-surface">
        <NavBar />

        {/* Main content — offset for sidebar on desktop, bottom bar on mobile */}
        <main className="md:ml-56 pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <WarmupBanner />
            <Routes>
              <Route path="/"                element={<Dashboard />} />
              <Route path="/screener"        element={<Screener />} />
              <Route path="/portfolio"       element={<Portfolio />} />
              <Route path="/backtest"        element={<Backtest />} />
              <Route path="/cases"           element={<Cases />} />
              <Route path="/cases/:slug"     element={<CaseStudy />} />
            </Routes>
          </div>
        </main>
      </div>
    </BackendProvider>
  );
}
