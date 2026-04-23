import { useEffect, useState, useCallback } from "react";
import { useBackend } from "../context/BackendContext";
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart2, Percent, Shield, Trophy } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { API_BASE } from "../api";

const pct = (v) =>
  v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
const fmt2 = (v) =>
  v == null ? "—" : v.toFixed(2);

const MODE_CONFIG = {
  simple: {
    label: "In-Sample",
    description: "Equal-weight, full-period — selection uses the entire backtest window.",
    apiPath: "/api/backtest",
  },
  walkforward: {
    label: "Walk-Forward",
    description: "Out-of-sample — stocks re-selected every 6 months using only past data. No look-ahead bias.",
    apiPath: "/api/backtest/walkforward",
  },
};

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

export default function Backtest() {
  const { warm } = useBackend();
  const [mode, setMode] = useState("simple");
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [wfUnavailable, setWfUnavailable] = useState(false);
  const [error, setError] = useState(null);

  // Fetch stats + benchmark once
  useEffect(() => {
    if (!warm) return;
    const init = async () => {
      try {
        const [tsRes, statsRes, benchRes] = await Promise.all([
          fetch(API_BASE + "/api/backtest"),
          fetch(API_BASE + "/api/backtest/stats"),
          fetch(API_BASE + "/api/backtest/benchmark"),
        ]);
        if (!tsRes.ok || !statsRes.ok)
          throw new Error("Backtest data not found. Run backtest.py first.");

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
    init();
  }, [warm]);

  // Fetch walk-forward series on mode switch
  const switchToWalkForward = useCallback(async () => {
    setChartLoading(true);
    setWfUnavailable(false);
    try {
      const [wfRes, benchRes] = await Promise.all([
        fetch(API_BASE + "/api/backtest/walkforward"),
        fetch(API_BASE + "/api/backtest/benchmark"),
      ]);
      if (!wfRes.ok) {
        setWfUnavailable(true);
        return;
      }
      const wf = await wfRes.json();
      let benchMap = {};
      if (benchRes.ok) {
        const bench = await benchRes.json();
        bench.forEach((p) => { benchMap[p.date] = p.value; });
      }
      const step = Math.max(1, Math.floor(wf.length / 300));
      const merged = wf
        .filter((_, i) => i % step === 0 || i === wf.length - 1)
        .map((p) => ({ ...p, benchmark: benchMap[p.date] ?? null }));
      setSeries(merged);
    } catch {
      setWfUnavailable(true);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const switchToSimple = useCallback(async () => {
    setChartLoading(true);
    setWfUnavailable(false);
    try {
      const [tsRes, benchRes] = await Promise.all([
        fetch(API_BASE + "/api/backtest"),
        fetch(API_BASE + "/api/backtest/benchmark"),
      ]);
      if (!tsRes.ok) return;
      const ts = await tsRes.json();
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
    } finally {
      setChartLoading(false);
    }
  }, []);

  const handleModeChange = (m) => {
    if (m === mode) return;
    setMode(m);
    if (m === "walkforward") switchToWalkForward();
    else switchToSimple();
  };

  const isPositive = (stats?.total_return ?? 0) >= 0;
  const cfg = MODE_CONFIG[mode];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-primary">Backtest</h1>
        {stats && (
          <p className="text-sm text-ink-secondary mt-0.5">
            {stats.start_date} → {stats.end_date}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="card text-sm text-amber-700 bg-amber-50 border border-amber-200">
          {error}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          label="Total Return"
          value={stats ? pct(stats.total_return) : "…"}
          positive={isPositive}
          negative={!isPositive}
          icon={isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        />
        <MetricCard
          label="CAGR"
          value={stats ? pct(stats.cagr) : "…"}
          positive={stats?.cagr >= 0}
          negative={stats?.cagr < 0}
          icon={<Percent size={14} />}
        />
        <MetricCard
          label="Max Drawdown"
          value={stats ? pct(stats.mdd) : "…"}
          negative
          icon={<Shield size={14} />}
        />
        <MetricCard
          label="Sharpe Ratio"
          value={stats ? fmt2(stats.sharpe) : "…"}
          positive={stats?.sharpe >= 1}
          negative={stats?.sharpe < 0}
          icon={<BarChart2 size={14} />}
        />
        <MetricCard
          label="Calmar Ratio"
          value={stats ? fmt2(stats.calmar) : "…"}
          positive={stats?.calmar >= 0.5}
          negative={stats?.calmar < 0}
          sub="CAGR / |Max DD|"
          icon={<Trophy size={14} />}
        />
        <MetricCard
          label="Monthly Win Rate"
          value={stats ? `${stats.win_rate}%` : "…"}
          positive={stats?.win_rate >= 55}
          negative={stats?.win_rate < 45}
          icon={<TrendingUp size={14} />}
        />
      </div>

      {/* Equity chart */}
      <div className="card">
        {/* Mode toggle */}
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-ink-primary">
              Cumulative Return — {cfg.label}
            </p>
            <p className="text-xs text-ink-secondary mt-0.5 max-w-sm">
              {cfg.description}
            </p>
          </div>
          <div className="flex items-center bg-surface rounded-xl p-1 gap-1 shrink-0">
            {Object.entries(MODE_CONFIG).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={[
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  mode === key
                    ? "bg-card text-ink-primary shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {wfUnavailable && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-4">
            Walk-forward data not yet available. Run <code className="font-mono">backtest_wf.py</code> on the server to generate it.
          </div>
        )}

        {loading || chartLoading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm animate-pulse">Loading…</span>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm">No data</span>
          </div>
        ) : !wfUnavailable ? (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
              <Line
                type="monotone"
                dataKey="value"
                name="Portfolio"
                stroke="#3182F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
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
        ) : null}
      </div>

      {/* Stats detail table */}
      {stats && (
        <div className="card">
          <p className="text-sm font-semibold text-ink-primary mb-4">
            Performance Detail
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Period Start",     value: stats.start_date },
              { label: "Period End",       value: stats.end_date },
              { label: "Total Return",     value: pct(stats.total_return) },
              { label: "CAGR",             value: pct(stats.cagr) },
              { label: "Max Drawdown",     value: pct(stats.mdd) },
              { label: "Sharpe Ratio",     value: fmt2(stats.sharpe) },
              { label: "Calmar Ratio",     value: fmt2(stats.calmar) },
              { label: "Monthly Win Rate", value: `${stats.win_rate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-ink-tertiary font-medium uppercase mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-semibold text-ink-primary tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
