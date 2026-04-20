/**
 * MetricCard — displays a single KPI.
 *
 * Props:
 *   label      string    e.g. "CAGR"
 *   value      string    formatted value, e.g. "+12.4%"
 *   sub        string?   optional subtitle / date range
 *   positive   boolean?  green colouring for positive values
 *   negative   boolean?  red colouring for negative values
 *   icon       ReactNode? optional icon element
 */
export default function MetricCard({ label, value, sub, positive, negative, icon }) {
  const valueColor = positive
    ? "text-positive"
    : negative
    ? "text-negative"
    : "text-ink-primary";

  return (
    <div className="card flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-secondary uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span className="text-ink-tertiary">{icon}</span>
        )}
      </div>
      <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>
        {value ?? "—"}
      </span>
      {sub && (
        <span className="text-xs text-ink-tertiary">{sub}</span>
      )}
    </div>
  );
}
