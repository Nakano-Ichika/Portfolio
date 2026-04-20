import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Screener from "./pages/Screener";
import Portfolio from "./pages/Portfolio";
import Backtest from "./pages/Backtest";

export default function App() {
  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      {/* Main content — offset for sidebar on desktop, bottom bar on mobile */}
      <main className="md:ml-56 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/screener"  element={<Screener />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/backtest"  element={<Backtest />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
