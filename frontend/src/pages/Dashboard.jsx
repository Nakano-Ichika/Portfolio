import { useEffect, useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { API_BASE } from "../api";

const pct = (v) => (v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`);
const fmt2 = (v) => (v == null ? "—" : v.toFixed(2));

function EquityTooltip({ active, payload, label }) {
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
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tsRes, statsRes, benchRes] = await Promise.all([
          fetch(API_BASE + "/api/backtest"),
          fetch(API_BASE + "/api/backtest/stats"),
          fetch(API_BASE + "/api/backtest/benchmark"),
        ]);

        if (!tsRes.ok || !statsRes.ok) {
          throw new Error("Backtest data not found. Run backtest.py first.");
        }

        const ts = await tsRes.json();
        const st = await statsRes.json();

        let benchMap = {};
        if (benchRes.ok) {
          const bench = await benchRes.json();
          bench.forEach((p) => { benchMap[p.date] = p.value; });
        }

        const step = Math.max(1, Math.floor(ts.length / 300));
        const merged = ts
          .filter((_, i) => i % step === 0 || i === ts.length - 1)
          .map((p) => ({ ...p, benchmark: benchMap[p.date] ?? null }));
        setSeries(merged);
        setStats(st);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const isPositive = stats ? stats.total_return >= 0 : true;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-primary">Dashboard</h1>
        {stats && (
          <p className="text-sm text-ink-secondary mt-0.5">
            {stats.start_date} → {stats.end_date}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      {!error && (
        <div className="card bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <p className="text-sm font-medium opacity-80 mb-1">Portfolio Cumulative Return</p>
          {loading ? (
            <div className="h-10 w-32 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold tabular-nums">
                {stats ? pct(stats.total_return) : "—"}
              </span>
              {stats && (
                <span className="text-sm opacity-80 mb-1 flex items-center gap-1">
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  vs N225 benchmark
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="CAGR"
          value={stats ? pct(stats.cagr) : "…"}
          positive={stats?.cagr >= 0}
          negative={stats?.cagr < 0}
          icon={<Activity size={14} />}
        />
        <MetricCard
          label="Sharpe"
          value={stats ? fmt2(stats.sharpe) : "…"}
          positive={stats?.sharpe >= 1}
          negative={stats?.sharpe < 0}
        />
        <MetricCard
          label="Max Drawdown"
          value={stats ? pct(stats.mdd) : "…"}
          negative
        />
        <MetricCard
          label="Total Return"
          value={stats ? pct(stats.total_return) : "…"}
          positive={stats?.total_return >= 0}
          negative={stats?.total_return < 0}
        />
      </div>

      <div className="card">
        <p className="text-sm font-semibold text-ink-primary mb-4">
          Cumulative Return — Portfolio vs N225
        </p>

        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm animate-pulse">Loading…</span>
          </div>
        ) : error ? (
          <div className="h-56 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm">No data</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182F6" stopOpacity={0.12} />
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
              <Tooltip content={<EquityTooltip />} />
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
    </div>
  );
}
