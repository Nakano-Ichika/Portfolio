import { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { RefreshCw } from "lucide-react";

// A palette of colours for the donut slices
const PALETTE = [
  "#3182F6", "#00C471", "#F04452", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#10B981",
  "#6366F1", "#F97316", "#14B8A6", "#EF4444",
  "#84CC16", "#A855F7", "#F43F5E", "#0EA5E9",
  "#22C55E", "#EAB308", "#7C3AED", "#DB2777",
];

function AllocationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-card-md">
      <p className="font-semibold text-ink-primary mb-1">{name}</p>
      <p className="text-ink-secondary">
        ウェイト: <span className="text-ink-primary font-medium">{(value * 100).toFixed(1)}%</span>
      </p>
      <p className="text-ink-secondary">
        金額: <span className="text-ink-primary font-medium">{p.position_yen?.toLocaleString("ja-JP")}円</span>
      </p>
    </div>
  );
}

export default function Portfolio() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capital, setCapital] = useState(1_000_000);
  const [inputCapital, setInputCapital] = useState("1000000");

  const fetchPortfolio = useCallback(async (cap) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolio?capital=${cap}`);
      if (!res.ok) throw new Error("ポートフォリオデータが見つかりません");
      const data = await res.json();
      setPositions(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio(capital);
  }, [capital, fetchPortfolio]);

  const handleApply = () => {
    const v = parseFloat(inputCapital.replace(/,/g, ""));
    if (!isNaN(v) && v > 0) setCapital(v);
  };

  // Prepare pie data
  const pieData = positions.map((p, i) => ({
    name: String(p.Code),
    value: p.weight,
    position_yen: p.position_yen,
    fill: PALETTE[i % PALETTE.length],
  }));

  const totalAllocated = positions.reduce((s, p) => s + p.position_yen, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-primary">ポートフォリオ</h1>
        <p className="text-sm text-ink-secondary mt-0.5">
          逆ボラティリティ加重 — ボラが低い銘柄ほど大きく配分
        </p>
      </div>

      {/* Capital input */}
      <div className="card flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            運用資金 (円)
          </label>
          <input
            type="text"
            value={inputCapital}
            onChange={(e) => setInputCapital(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-ink-primary focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <button
          onClick={handleApply}
          className="flex items-center gap-1.5 bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors mt-4"
        >
          <RefreshCw size={14} />
          再計算
        </button>
      </div>

      {error && (
        <div className="card text-sm text-negative bg-red-50">{error}</div>
      )}

      {loading ? (
        <div className="card h-64 animate-pulse bg-surface" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Donut chart */}
          <div className="card">
            <p className="text-sm font-semibold text-ink-primary mb-1">
              配分比率
            </p>
            <p className="text-xs text-ink-secondary mb-4">
              合計: {totalAllocated.toLocaleString("ja-JP")}円
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<AllocationTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(val) => (
                    <span className="text-xs text-ink-secondary">{val}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Position table */}
          <div className="card overflow-auto">
            <p className="text-sm font-semibold text-ink-primary mb-4">
              ポジション一覧
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["コード", "ボラ(%)", "ウェイト", "金額(円)"].map((h) => (
                    <th
                      key={h}
                      className="pb-2 text-left text-xs font-medium text-ink-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {positions.map((p, i) => (
                  <tr key={p.Code} className="hover:bg-surface transition-colors">
                    <td className="py-2.5 font-medium text-ink-primary flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: PALETTE[i % PALETTE.length] }}
                      />
                      {p.Code}
                    </td>
                    <td className="py-2.5 text-ink-secondary tabular-nums">
                      {p.Volatility_pct?.toFixed(1)}
                    </td>
                    <td className="py-2.5 tabular-nums">
                      <span className="font-medium text-brand-500">
                        {(p.weight * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-ink-primary tabular-nums font-medium">
                      {p.position_yen?.toLocaleString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
