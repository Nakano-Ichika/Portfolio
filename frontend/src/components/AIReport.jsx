import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";

/**
 * AIReport — generates and displays an AI investment report for a stock.
 *
 * Props: { stock: { code, momentum_pct, per, pbr, roe } }
 */
export default function AIReport({ stock }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const handleGenerate = async () => {
    if (!stock) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/report", {
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

      if (!res.ok) throw new Error(`APIエラー: ${res.status}`);
      const data = await res.json();
      setReport(data.report);
      setExpanded(true);
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
          <span className="font-semibold text-ink-primary">
            AIレポート
          </span>
          {stock && (
            <span className="text-xs text-ink-secondary bg-surface px-2 py-0.5 rounded-full">
              {stock.code}
            </span>
          )}
        </div>

        {report && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-ink-tertiary hover:text-ink-secondary"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !stock}
        className={[
          "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors",
          loading || !stock
            ? "bg-surface text-ink-tertiary cursor-not-allowed"
            : "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
        ].join(" ")}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            生成中…
          </>
        ) : (
          <>
            <Sparkles size={15} />
            {stock ? `${stock.code} のレポートを生成` : "銘柄を選択してください"}
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="text-xs text-negative bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Report content */}
      {report && expanded && (
        <div className="bg-surface rounded-xl px-4 py-3 text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
          {report}
        </div>
      )}
    </div>
  );
}
