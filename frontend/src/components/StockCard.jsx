import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * StockCard — compact card for a single screened stock.
 *
 * Props: { code, momentum_pct, volatility_pct, sharpe, per, pbr, roe, onSelect }
 */
export default function StockCard({ code, momentum_pct, volatility_pct, sharpe, per, pbr, roe, onSelect }) {
  const isPositive = momentum_pct >= 0;
  const momentumColor = isPositive ? "text-positive" : "text-negative";
  const bgAccent = isPositive ? "bg-green-50" : "bg-red-50";

  return (
    <button
      onClick={() => onSelect?.({ code, momentum_pct, per, pbr, roe })}
      className="card flex flex-col gap-3 text-left hover:shadow-card-md transition-shadow cursor-pointer w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-secondary font-medium">コード</p>
          <p className="text-lg font-bold text-ink-primary">{code}</p>
        </div>
        <span
          className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${bgAccent} ${momentumColor}`}
        >
          {isPositive ? (
            <TrendingUp size={14} strokeWidth={2} />
          ) : (
            <TrendingDown size={14} strokeWidth={2} />
          )}
          {isPositive ? "+" : ""}
          {momentum_pct?.toFixed(1)}%
        </span>
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Key metrics grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <MetricCell label="Sharpe" value={sharpe?.toFixed(2)} />
        <MetricCell label="ボラ" value={`${volatility_pct?.toFixed(1)}%`} />
        <MetricCell label="モメンタム" value={`${momentum_pct?.toFixed(1)}%`} highlight={isPositive} />
      </div>

      {/* Fundamentals (only shown if non-zero) */}
      {(per > 0 || pbr > 0 || roe > 0) && (
        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border">
          <MetricCell label="PER" value={per > 0 ? `${per}x` : "—"} />
          <MetricCell label="PBR" value={pbr > 0 ? `${pbr}x` : "—"} />
          <MetricCell label="ROE" value={roe > 0 ? `${roe}%` : "—"} />
        </div>
      )}
    </button>
  );
}

function MetricCell({ label, value, highlight }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-ink-tertiary font-medium uppercase">{label}</span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          highlight ? "text-positive" : "text-ink-primary"
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
