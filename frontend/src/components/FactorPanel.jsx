import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const FACTOR_LABELS = {
  Momentum_pct:  "Momentum",
  Volatility_pct: "Volatility",
  Sharpe:        "Sharpe",
  PER:           "PER",
  PBR:           "PBR",
  ROE:           "ROE",
};

function ImportanceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { factor, importance } = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-card-md">
      <p className="font-semibold text-ink-primary">{FACTOR_LABELS[factor] ?? factor}</p>
      <p className="text-ink-secondary">Importance: <span className="text-ink-primary font-medium">{(importance * 100).toFixed(1)}%</span></p>
    </div>
  );
}

function HeatmapCell({ value }) {
  // Interpolate: -1 → blue, 0 → white, +1 → red
  const abs = Math.abs(value);
  const r = value > 0 ? Math.round(255) : Math.round(255 - abs * 180);
  const g = Math.round(255 - abs * 180);
  const b = value < 0 ? Math.round(255) : Math.round(255 - abs * 180);
  const bg = `rgb(${r},${g},${b})`;
  const textColor = abs > 0.5 ? "#fff" : "#374151";

  return (
    <div
      className="flex items-center justify-center rounded text-[10px] font-semibold tabular-nums"
      style={{ background: bg, color: textColor, aspectRatio: "1" }}
    >
      {value.toFixed(2)}
    </div>
  );
}

export default function FactorPanel({ importance, correlation }) {
  const hasImportance = importance?.length > 0;
  const hasCorrelation = correlation?.matrix?.length > 0;

  const importanceData = importance?.map((d) => ({
    ...d,
    label: FACTOR_LABELS[d.factor] ?? d.factor,
  }));

  const { factors = [], matrix = [] } = correlation ?? {};
  const labels = factors.map((f) => FACTOR_LABELS[f] ?? f);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Feature Importance */}
      <div className="card">
        <p className="text-sm font-semibold text-ink-primary mb-0.5">
          What drives Sharpe?
        </p>
        <p className="text-xs text-ink-secondary mb-4">
          RandomForest feature importance — higher = stronger predictor
        </p>
        {hasImportance ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={importanceData}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#8B95A1" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                domain={[0, "dataMax"]}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "#4B5563" }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip content={<ImportanceTooltip />} cursor={{ fill: "#F4F6F8" }} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {importanceData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#3182F6" : "#93C5FD"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-ink-tertiary py-8 text-center">No data</p>
        )}
      </div>

      {/* Correlation Heatmap */}
      <div className="card">
        <p className="text-sm font-semibold text-ink-primary mb-0.5">
          Factor Correlation Matrix
        </p>
        <p className="text-xs text-ink-secondary mb-4">
          Pairwise Pearson correlation — red = positive, blue = negative
        </p>
        {hasCorrelation ? (
          <div className="overflow-x-auto">
            <div
              className="grid gap-1 min-w-max"
              style={{ gridTemplateColumns: `80px repeat(${factors.length}, 1fr)` }}
            >
              {/* Header row */}
              <div />
              {labels.map((l) => (
                <div key={l} className="text-[10px] text-ink-secondary font-medium text-center py-1 truncate">
                  {l}
                </div>
              ))}
              {/* Data rows */}
              {matrix.map((row, ri) => (
                <>
                  <div key={`label-${ri}`} className="text-[10px] text-ink-secondary font-medium flex items-center pr-1 truncate">
                    {labels[ri]}
                  </div>
                  {row.map((val, ci) => (
                    <HeatmapCell key={`${ri}-${ci}`} value={val} />
                  ))}
                </>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-tertiary py-8 text-center">No data</p>
        )}
      </div>
    </div>
  );
}
