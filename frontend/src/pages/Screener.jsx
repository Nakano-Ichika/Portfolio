import { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import StockCard from "../components/StockCard";
import AIReport from "../components/AIReport";
import FactorPanel from "../components/FactorPanel";
import { API_BASE } from "../api";


const SORT_OPTIONS = [
  { value: "sharpe",         label: "Sharpe" },
  { value: "momentum_pct",   label: "Momentum" },
  { value: "volatility_pct", label: "Volatility" },
];

export default function Screener() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [minMomentum, setMinMomentum] = useState(-100);
  const [sortBy, setSortBy] = useState("sharpe");
  const [filterOpen, setFilterOpen] = useState(false);

  // Selected stock for AI report
  const [selected, setSelected] = useState(null);

  // Factor analysis
  const [factorOpen, setFactorOpen] = useState(false);
  const [importance, setImportance] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [factorLoading, setFactorLoading] = useState(false);

  const loadFactors = async () => {
    if (importance) return; // already loaded
    setFactorLoading(true);
    try {
      const [impRes, corrRes] = await Promise.all([
        fetch(API_BASE + "/api/factor/importance"),
        fetch(API_BASE + "/api/factor/correlation"),
      ]);
      if (impRes.ok) setImportance(await impRes.json());
      if (corrRes.ok) setCorrelation(await corrRes.json());
    } finally {
      setFactorLoading(false);
    }
  };

  const toggleFactor = () => {
    if (!factorOpen) loadFactors();
    setFactorOpen((v) => !v);
  };

  useEffect(() => {
    fetch(API_BASE + "/api/screener")
      .then((r) => {
        if (!r.ok) throw new Error("Screener data not found. Run fundamentals.py first.");
        return r.json();
      })
      .then(setStocks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return stocks
      .filter((s) => {
        const matchSearch =
          !search || String(s.Code).includes(search);
        const matchMomentum = s.Momentum_pct >= minMomentum;
        return matchSearch && matchMomentum;
      })
      .sort((a, b) => {
        const key = sortBy === "volatility_pct" ? "Volatility_pct"
                  : sortBy === "momentum_pct"   ? "Momentum_pct"
                  : "Sharpe";
        // For volatility we sort ascending (lower = better); else descending
        return sortBy === "volatility_pct"
          ? a[key] - b[key]
          : b[key] - a[key];
      });
  }, [stocks, search, minMomentum, sortBy]);

  // Map API keys → StockCard props
  const toCardProps = (s) => ({
    code:          s.Code,
    momentum_pct:  s.Momentum_pct,
    volatility_pct: s.Volatility_pct,
    sharpe:        s.Sharpe,
    per:           s.PER ?? 0,
    pbr:           s.PBR ?? 0,
    roe:           s.ROE ?? 0,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-primary">Screener</h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            {loading ? "Loading…" : `${filtered.length} / ${stocks.length} stocks`}
          </p>
        </div>
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className={[
            "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl border transition-colors",
            filterOpen
              ? "bg-brand-50 text-brand-500 border-brand-100"
              : "bg-card text-ink-secondary border-border hover:border-brand-100",
          ].join(" ")}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Search by code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-500 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="card space-y-4">
          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5">
              Sort by
            </label>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={[
                    "px-3 py-1 rounded-lg text-xs font-medium border transition-colors",
                    sortBy === opt.value
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-surface text-ink-secondary border-border hover:border-brand-200",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Momentum slider */}
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-ink-secondary mb-1.5">
              Min Momentum
              <span className="text-brand-500 font-semibold">
                {minMomentum >= 0 ? "+" : ""}{minMomentum}%
              </span>
            </label>
            <input
              type="range"
              min={-100}
              max={200}
              step={5}
              value={minMomentum}
              onChange={(e) => setMinMomentum(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card text-sm text-negative bg-red-50">{error}</div>
      )}

      {/* Factor Analysis toggle */}
      <div>
        <button
          onClick={toggleFactor}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-brand-500 transition-colors px-1"
        >
          {factorOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Factor Analysis
          <span className="text-ink-tertiary font-normal ml-1">— what drives each stock's ranking</span>
        </button>
        {factorOpen && (
          <div className="mt-3">
            {factorLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card h-52 animate-pulse bg-surface" />
                <div className="card h-52 animate-pulse bg-surface" />
              </div>
            ) : (
              <FactorPanel importance={importance} correlation={correlation} />
            )}
          </div>
        )}
      </div>

      {/* AI Report panel (shown when a stock is selected) */}
      {selected && (
        <div className="sticky top-4 z-10">
          <AIReport stock={selected} />
        </div>
      )}

      {/* Stock grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <StockCard
              key={s.Code}
              {...toCardProps(s)}
              onSelect={setSelected}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-ink-tertiary text-sm py-12">
              No stocks match your filters. Try adjusting the momentum threshold or search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
