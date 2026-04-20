import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import MetricCard from "../components/MetricCard";

// Format helpers
const pct = (v) => (v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`);
const fmt2 = (v) => (v == null ? "—" : v.toFixed(2));

// Custom tooltip for the equity chart
function EquityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  const gain = v != null ? ((v - 1) * 100).toFixed(2) : null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-card-md">
      <p className="text-ink-secondary mb-1">{label}</p>
      <p className="font-semibold text-ink-primary">
        {v != null ? v.toFixed(4) : "—"}
      </p>
      {gain != null && (
        <p className={parseFloat(gain) >= 0 ? "text-positive" : "text-negative"}>
          {gain >= 0 ? "+" : ""}{gain}%
        </p>
      )}
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
        const [tsRes, statsRes] = await Promise.all([
          fetch("/api/backtest"),
          fetch("/api/backtest/stats"),
        ]);

        if (!tsRes.ok || !statsRes.ok) {
          throw new Error("バックテストデータが見つかりません。backtest.py を実行してください。");
        }

        const ts = await tsRes.json();
        const st = await statsRes.json();

        // Thin out the series for performance (show max 300 points)
        const step = Math.max(1, Math.floor(ts.length / 300));
        setSeries(ts.filter((_, i) => i % step === 0 || i === ts.length - 1));
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
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-ink-primary">ダッシュボード</h1>
        {stats && (
          <p className="text-sm text-ink-secondary mt-0.5">
            {stats.start_date} → {stats.end_date}
          </p>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      {/* Hero card — Portfolio total return */}
      {!error && (
        <div className="card bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <p className="text-sm font-medium opacity-80 mb-1">ポートフォリオ累積収益率</p>
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

      {/* Metric cards */}
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
          label="最大DD"
          value={stats ? pct(stats.mdd) : "…"}
          negative
          sub="最大ドローダウン"
        />
        <MetricCard
          label="総収益率"
          value={stats ? pct(stats.total_return) : "…"}
          positive={stats?.total_return >= 0}
          negative={stats?.total_return < 0}
        />
      </div>

      {/* Equity curve */}
      <div className="card">
        <p className="text-sm font-semibold text-ink-primary mb-4">
          累積収益率チャート
        </p>

        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm">読み込み中…</span>
          </div>
        ) : error ? (
          <div className="h-56 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm">データなし</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3182F6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <ReferenceLine y={1} stroke="#E5E8EB" strokeDasharray="4 2" />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3182F6"
                strokeWidth={2}
                fill="url(#portfolioGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#3182F6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
