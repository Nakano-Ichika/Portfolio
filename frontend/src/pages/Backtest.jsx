import { useEffect, useState } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart2, Percent, Shield } from "lucide-react";
import MetricCard from "../components/MetricCard";

const pct = (v) =>
  v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
const fmt2 = (v) =>
  v == null ? "—" : v.toFixed(2);

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-card-md space-y-1">
      <p className="text-ink-secondary font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-ink-secondary">{p.name}:</span>
          <span className="font-semibold text-ink-primary">
            {p.value?.toFixed(4)}
          </span>
          <span className={p.value >= 1 ? "text-positive" : "text-negative"}>
            ({((p.value - 1) * 100).toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Backtest() {
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
        if (!tsRes.ok || !statsRes.ok)
          throw new Error("バックテストデータが見つかりません。backtest.py を実行してください。");

        const ts = await tsRes.json();
        const st = await statsRes.json();

        // Thin out for chart performance
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

  const isPositive = (stats?.total_return ?? 0) >= 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-primary">バックテスト</h1>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="総収益率"
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
          label="最大DD"
          value={stats ? pct(stats.mdd) : "…"}
          negative
          sub="最大ドローダウン"
          icon={<Shield size={14} />}
        />
        <MetricCard
          label="Sharpe"
          value={stats ? fmt2(stats.sharpe) : "…"}
          positive={stats?.sharpe >= 1}
          negative={stats?.sharpe < 0}
          icon={<BarChart2 size={14} />}
        />
      </div>

      {/* Equity chart */}
      <div className="card">
        <p className="text-sm font-semibold text-ink-primary mb-4">
          累積収益率 — ポートフォリオ
        </p>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm animate-pulse">読み込み中…</span>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-ink-tertiary text-sm">データなし</span>
          </div>
        ) : (
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
                name="ポートフォリオ"
                stroke="#3182F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats detail table */}
      {stats && (
        <div className="card">
          <p className="text-sm font-semibold text-ink-primary mb-4">
            パフォーマンス詳細
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "計測期間 開始", value: stats.start_date },
              { label: "計測期間 終了",  value: stats.end_date },
              { label: "総収益率",        value: pct(stats.total_return) },
              { label: "CAGR (年換算)",  value: pct(stats.cagr) },
              { label: "最大ドローダウン", value: pct(stats.mdd) },
              { label: "Sharpe比",       value: fmt2(stats.sharpe) },
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
