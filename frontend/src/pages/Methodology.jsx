import { useEffect, useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import { useBackend } from "../context/BackendContext";
import WarmupBanner from "../components/WarmupBanner";
import FactorPanel from "../components/FactorPanel";
import { API_BASE } from "../api";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 text-xs shadow-card-md space-y-1">
      <p className="text-ink-tertiary font-medium">{label}</p>
      {payload.map((p) => {
        if (p.value == null) return null;
        return (
          <div key={p.dataKey} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-ink-secondary">{p.name}:</span>
            <span className="font-semibold text-ink-primary">{p.value.toFixed(4)}</span>
            <span className={p.value >= 1 ? "text-positive" : "text-negative"}>
              ({((p.value - 1) * 100).toFixed(1)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Methodology() {
  const { warm } = useBackend();
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [importance, setImportance] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!warm) return;
    const fetchAll = async () => {
      try {
        const [tsRes, statsRes, benchRes, impRes, corrRes, screenerRes] = await Promise.all([
          fetch(API_BASE + "/api/backtest"),
          fetch(API_BASE + "/api/backtest/stats"),
          fetch(API_BASE + "/api/backtest/benchmark"),
          fetch(API_BASE + "/api/factor/importance"),
          fetch(API_BASE + "/api/factor/correlation"),
          fetch(API_BASE + "/api/screener"),
        ]);

        if (tsRes.ok && statsRes.ok) {
          const ts = await tsRes.json();
          const st = await statsRes.json();
          setStats(st);
          let benchMap = {};
          if (benchRes.ok) {
            const bench = await benchRes.json();
            bench.forEach((p) => { benchMap[p.date] = p.value; });
          }
          const step = Math.max(1, Math.floor(ts.length / 300));
          setSeries(
            ts.filter((_, i) => i % step === 0 || i === ts.length - 1)
              .map((p) => ({ ...p, benchmark: benchMap[p.date] ?? null }))
          );
        }
        if (impRes.ok) setImportance(await impRes.json());
        if (corrRes.ok) setCorrelation(await corrRes.json());
        if (screenerRes.ok) {
          const data = await screenerRes.json();
          setStocks(data.slice(0, 10));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [warm]);

  return (
    <div className="max-w-[780px] mx-auto px-6 pt-32 pb-32">
      <WarmupBanner />

      {/* Header */}
      <p className="text-[11px] uppercase tracking-[0.15em] text-ink-tertiary mb-4">
        July · Methodology
      </p>
      <h1 className="text-headline font-bold text-ink-primary mb-4">
        The model
      </h1>
      <p className="text-reading text-ink-secondary mb-16 max-w-[520px]">
        A systematic factor model screens TSE Prime equities by price momentum, annualised volatility,
        and fundamental quality. The outputs appear as supporting evidence in the research reports.
        This page shows the full model output.
      </p>

      {/* Backtest chart */}
      <section className="mb-16">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-[15px] font-semibold text-ink-primary">Backtest — cumulative return</h2>
          {stats && (
            <span className="text-[12px] text-ink-tertiary">
              {stats.start_date} → {stats.end_date}
            </span>
          )}
        </div>
        <p className="text-[13px] text-ink-tertiary mb-6">
          Equal-weight top-20 TSE Prime stocks by Sharpe ratio, rebalanced quarterly. In-sample.
        </p>

        {loading ? (
          <div className="h-56 bg-surface rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3182F6" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#3182F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 2" stroke="#E5E8EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-[11px] text-ink-secondary">{v}</span>} />
              <ReferenceLine y={1} stroke="#E5E8EB" strokeDasharray="4 2" />
              <Area type="monotone" dataKey="value" name="Portfolio" stroke="#3182F6" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 3 }} />
              <Line type="monotone" dataKey="benchmark" name="N225" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Stats strip */}
        {stats && (
          <div className="mt-6 flex flex-wrap gap-8 text-[13px]">
            {[
              { label: "Total return", value: `${stats.total_return >= 0 ? "+" : ""}${stats.total_return}%` },
              { label: "CAGR",         value: `${stats.cagr >= 0 ? "+" : ""}${stats.cagr}%` },
              { label: "Sharpe",       value: stats.sharpe.toFixed(2) },
              { label: "Max drawdown", value: `${stats.mdd}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-ink-tertiary mb-0.5">{label}</p>
                <p className="font-semibold text-ink-primary tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Factor analysis */}
      {(importance || correlation) && (
        <section className="mb-16">
          <h2 className="text-[15px] font-semibold text-ink-primary mb-2">Factor analysis</h2>
          <p className="text-[13px] text-ink-tertiary mb-6">
            RandomForest feature importance and cross-factor correlation matrix.
          </p>
          <FactorPanel importance={importance} correlation={correlation} />
        </section>
      )}

      {/* Screener top 10 */}
      {stocks.length > 0 && (
        <section className="mb-16">
          <h2 className="text-[15px] font-semibold text-ink-primary mb-2">Top 10 — screener output</h2>
          <p className="text-[13px] text-ink-tertiary mb-6">
            TSE Prime stocks ranked by Sharpe ratio. Equal-weight portfolio uses the top 20.
          </p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {["Code", "Sharpe", "Momentum", "Vol %"].map((h) => (
                  <th key={h} className="pb-2 text-left font-medium text-ink-tertiary pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stocks.map((s) => (
                <tr key={s.Code}>
                  <td className="py-2.5 font-medium text-ink-primary pr-6">{s.Code}</td>
                  <td className="py-2.5 tabular-nums text-ink-secondary pr-6">{s.Sharpe?.toFixed(2)}</td>
                  <td className={`py-2.5 tabular-nums pr-6 ${s.Momentum_pct >= 0 ? "text-positive" : "text-negative"}`}>
                    {s.Momentum_pct >= 0 ? "+" : ""}{s.Momentum_pct?.toFixed(1)}%
                  </td>
                  <td className="py-2.5 tabular-nums text-ink-secondary">{s.Volatility_pct?.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <div className="border-t border-border pt-8">
        <p className="text-[12px] text-ink-tertiary">
          Built with JQuants API · Python · FastAPI · React · Recharts
        </p>
      </div>
    </div>
  );
}
