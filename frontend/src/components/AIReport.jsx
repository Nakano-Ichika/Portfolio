import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, TrendingUp, TrendingDown, Eye, AlertTriangle } from "lucide-react";
import { API_BASE } from "../api";

const SIGNAL_CONFIG = {
  BUY:   { color: "bg-green-500",  text: "text-white", label: "BUY" },
  HOLD:  { color: "bg-amber-400",  text: "text-white", label: "HOLD" },
  SELL:  { color: "bg-red-500",    text: "text-white", label: "SELL" },
  WATCH: { color: "bg-slate-400",  text: "text-white", label: "WATCH" },
};

const CONFIDENCE_CONFIG = {
  HIGH:   { color: "text-positive", label: "High confidence" },
  MEDIUM: { color: "text-amber-600", label: "Medium confidence" },
  LOW:    { color: "text-negative",  label: "Low confidence" },
};

function SignalDots({ strength }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < strength ? "bg-current" : "bg-current opacity-20"}`}
        />
      ))}
    </div>
  );
}

function StructuredBrief({ data, stock }) {
  const signalCfg = SIGNAL_CONFIG[data.signal] ?? SIGNAL_CONFIG.WATCH;
  const confCfg = CONFIDENCE_CONFIG[data.confidence] ?? CONFIDENCE_CONFIG.MEDIUM;

  return (
    <div className="space-y-4">
      {/* Signal header */}
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${signalCfg.color} ${signalCfg.text}`}>
          {signalCfg.label}
        </span>
        <div className={`flex items-center gap-1.5 ${signalCfg.color.replace("bg-", "text-")}`}>
          <SignalDots strength={data.signal_strength ?? 3} />
          <span className="text-xs text-ink-secondary ml-1">
            Strength {data.signal_strength}/5
          </span>
        </div>
        <span className="text-xs text-ink-tertiary bg-surface px-2 py-0.5 rounded-full ml-auto">
          {stock?.code}
        </span>
      </div>

      {/* 4-section grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BriefSection icon={<TrendingUp size={13} />} title="Catalyst" color="blue">
          {data.catalyst}
        </BriefSection>
        <BriefSection icon={<Sparkles size={13} />} title="Thesis" color="green">
          {data.thesis}
        </BriefSection>
        <BriefSection icon={<AlertTriangle size={13} />} title="Bear Case" color="red">
          {data.bear_case}
        </BriefSection>
        <BriefSection icon={<Eye size={13} />} title="Valuation" color="default">
          {data.valuation_comment}
        </BriefSection>
      </div>

      {/* Confidence footer */}
      <div className={`text-xs ${confCfg.color} flex items-center gap-1.5`}>
        <span className="font-semibold">{confCfg.label}</span>
        <span className="text-ink-tertiary">—</span>
        <span className="text-ink-secondary">{data.confidence_rationale}</span>
      </div>
    </div>
  );
}

function BriefSection({ icon, title, color, children }) {
  const colors = {
    blue:    "border-l-blue-300 bg-blue-50/60",
    green:   "border-l-green-300 bg-green-50/60",
    red:     "border-l-red-300 bg-red-50/60",
    default: "border-l-border bg-surface",
  };
  return (
    <div className={`border-l-2 rounded-r-xl px-3 py-2.5 ${colors[color] ?? colors.default}`}>
      <div className="flex items-center gap-1 text-ink-secondary mb-1">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">{title}</span>
      </div>
      <p className="text-xs text-ink-primary leading-relaxed">{children}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-16 h-7 bg-surface rounded-lg" />
        <div className="w-24 h-4 bg-surface rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-surface rounded-xl" />
        ))}
      </div>
      <div className="w-48 h-3 bg-surface rounded" />
    </div>
  );
}

export default function AIReport({ stock }) {
  const [rawReport, setRawReport] = useState(null);
  const [parsedReport, setParsedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!stock) return;
    setLoading(true);
    setError(null);
    setRawReport(null);
    setParsedReport(null);

    try {
      const res = await fetch(API_BASE + "/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: stock.code,
          momentum_pct: stock.momentum_pct,
          per: stock.per ?? 0,
          pbr: stock.pbr ?? 0,
          roe: stock.roe ?? 0,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const text = data.report;

      try {
        setParsedReport(JSON.parse(text));
      } catch {
        setRawReport(text);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-500" />
          <span className="font-semibold text-ink-primary text-sm">AI Brief</span>
        </div>
        {(parsedReport || rawReport) && !loading && (
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
        )}
      </div>

      {/* Generate button — only shown before first generation */}
      {!parsedReport && !rawReport && !loading && (
        <button
          onClick={handleGenerate}
          disabled={!stock}
          className={[
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors",
            !stock
              ? "bg-surface text-ink-tertiary cursor-not-allowed"
              : "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
          ].join(" ")}
        >
          <Sparkles size={15} />
          {stock ? `Generate brief for ${stock.code}` : "Select a stock"}
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-negative bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {/* Loading skeleton */}
      {loading && <LoadingSkeleton />}

      {/* Structured output */}
      {!loading && parsedReport && (
        <StructuredBrief data={parsedReport} stock={stock} />
      )}

      {/* Raw text fallback */}
      {!loading && rawReport && (
        <div className="bg-surface rounded-xl px-4 py-3 text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
          {rawReport}
        </div>
      )}
    </div>
  );
}
