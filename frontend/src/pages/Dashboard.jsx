import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBackend } from "../context/BackendContext";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, CartesianGrid,
} from "recharts";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { API_BASE } from "../api";

const pct = (v) =>
  v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
const fmt2 = (v) =>
  v == null ? "—" : v.toFixed(2);

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-card-md space-y-1">
      <p className="text-ink-secondary font-medium">{label}</p>
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

export default function Dashboard() {
  const { warm } = useBackend();
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [benchTotal, setBenchTotal] = useState(null);
  const [dataStatus, setDataStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!warm) return;
    const fetchAll = async () => {
      try {
        const [tsRes, statsRes, benchRes, statusRes] = await Promise.all([
          fetch(API_BASE + "/api/backtest"),
          fetch(API_BASE + "/api/backtest/stats"),
          fetch(API_BASE + "/api/backtest/benchmark"),
          fetch(API_BASE + "/api/data/status"),
        ]);

        if (!tsRes.ok || !statsRes.ok)
          throw new Error("Backtest data not found. Run backtest.py first.");

        const ts = await tsRes.json();
        const st = await statsRes.json();

        let benchMap = {};
        if (benchRes.ok) {
          const bench = await benchRes.json();
          if (bench.length > 0)
            setBenchTotal((bench[bench.length - 1].value - 1) * 100);
          bench.forEach((p) => { benchMap[p.date] = p.value; });
        }
        if (statusRes.ok) setDataStatus(await statusRes.json());

        const step = Math.max(1, Math.floor(ts.length / 300));
        setSeries(
          ts
            .filter((_, i) => i % step === 0 || i === ts.length - 1)
            .map((p) => ({ ...p, benchmark: benchMap[p.date] ?? null }))
        );
        setStats(st);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [warm]);

  const isPositive = (stats?.total_return ?? 0) >= 0;

  return (
    <div className="space-y-8">

      {/* Thesis */}
      <div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          I wanted to know if momentum and low-volatility factors generate consistent
          alpha in Japan's equity market. I didn't trust the first result. Here's what
          the data says — and what it can't tell you yet.
        </p>
        <p className="text-xs text-ink-tertiary mt-2">
          {dataStatus?.screener
            ? `Screener data as of ${dataStatus.screener}`
            : "Screener data"}
          {stats ? ` · Backtest: ${stats.start_date} → ${stats.end_date}` : ""}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      {/* Key numbers */}
      {!error && (
        <div className="flex items-end gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-tertiary mb-2">
              Portfolio
            </p>
            <p className={`text-5xl font-bold tabular-nums leading-none ${
              loading
                ? "text-ink-tertiary"
                : isPositive
                ? "text-positive"
                : "text-negative"
            }`}>
              {loading ? "—" : pct(stats?.total_return)}
            </p>
          </div>

          <p className="text-base text-ink-tertiary mb-1">vs</p>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-tertiary mb-2">
              N225
            </p>
            <p className="text-5xl font-bold tabular-nums leading-none text-ink-tertiary">
              {loading || benchTotal == null ? "—" : pct(benchTotal)}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm animate-pulse">Loading…</span>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm">No data</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182F6" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#3182F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 2" stroke="#E5E8EB" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#8B95A1" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8B95A1" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => (
                  <span className="text-xs text-ink-secondary">{v}</span>
                )}
              />
              <ReferenceLine y={1} stroke="#B0B8C1" strokeDasharray="4 2" />
              <Area
                type="monotone"
                dataKey="value"
                name="Portfolio"
                stroke="#3182F6"
                strokeWidth={2}
                fill="url(#portfolioGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#3182F6" }}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                name="N225"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two stats */}
      {!error && (
        <div className="card flex divide-x divide-border">
          <div className="flex-1 px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-widest text-ink-tertiary mb-1.5">
              CAGR
            </p>
            <p className={`text-2xl font-bold tabular-nums ${
              !stats
                ? "text-ink-tertiary"
                : (stats.cagr ?? 0) >= 0
                ? "text-positive"
                : "text-negative"
            }`}>
              {stats ? pct(stats.cagr) : "—"}
            </p>
          </div>
          <div className="flex-1 px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-widest text-ink-tertiary mb-1.5">
              Sharpe
            </p>
            <p className={`text-2xl font-bold tabular-nums ${
              !stats
                ? "text-ink-tertiary"
                : (stats.sharpe ?? 0) >= 1
                ? "text-positive"
                : (stats.sharpe ?? 0) < 0
                ? "text-negative"
                : "text-ink-primary"
            }`}>
              {stats ? fmt2(stats.sharpe) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Research link */}
      <Link
        to="/cases"
        className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:underline"
      >
        Explore the Research
        <ArrowRight size={14} />
      </Link>

    </div>
  );
}
