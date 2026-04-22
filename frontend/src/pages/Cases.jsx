import { Link } from "react-router-dom";
import { CASES } from "../data/cases";
import { ArrowRight, Factory, TrendingUp, AlertCircle, BarChart2, Layers } from "lucide-react";

const TYPE_META = {
  industry:    { label: "Industry",    color: "text-blue-500   bg-blue-50   border-blue-200",   Icon: Factory },
  performance: { label: "Performance", color: "text-green-500  bg-green-50  border-green-200",  Icon: TrendingUp },
  investment:  { label: "Investment",  color: "text-purple-500 bg-purple-50 border-purple-200", Icon: BarChart2 },
  growth:      { label: "Growth",      color: "text-orange-500 bg-orange-50 border-orange-200", Icon: Layers },
  crisis:      { label: "Crisis",      color: "text-red-500    bg-red-50    border-red-200",    Icon: AlertCircle },
};

export default function Cases() {
  const published = CASES.filter((c) => c.status === "published");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-primary">Research</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Structure the problem, validate with data, commit to a conclusion.
        </p>
      </div>

      {/* Cases grid */}
      <div className="grid gap-4">
        {published.map((c) => {
          const meta = TYPE_META[c.type] || TYPE_META.industry;
          const { Icon } = meta;
          return (
            <Link
              key={c.slug}
              to={`/cases/${c.slug}`}
              className="card group hover:border-brand-300 transition-all duration-200 block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Type badge */}
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border mb-3 ${meta.color}`}>
                    <Icon size={11} />
                    {meta.label}
                  </span>

                  {/* Title */}
                  <h2 className="text-base font-bold text-ink-primary group-hover:text-brand-500 transition-colors">
                    {c.hook.headline}
                  </h2>
                  <p className="text-sm text-ink-secondary mt-1 line-clamp-2">
                    {c.hook.oneliner}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="text-xs text-ink-tertiary font-medium">{c.title}</span>
                    <span className="text-ink-tertiary">·</span>
                    <span className="text-xs text-ink-tertiary">{c.company}</span>
                    <span className="text-ink-tertiary">·</span>
                    <span className="text-xs text-ink-tertiary">{c.date}</span>
                  </div>
                </div>

                {/* Key metric */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-brand-500">
                    {c.hook.keyMetric.value}
                  </div>
                  <div className="text-[10px] text-ink-tertiary mt-0.5">
                    {c.hook.keyMetric.label}
                  </div>
                  <ArrowRight
                    size={16}
                    className="ml-auto mt-2 text-ink-tertiary group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state for drafts hint */}
      {published.length === 0 && (
        <div className="card text-center py-12 text-ink-tertiary text-sm">
          Case studies coming soon.
        </div>
      )}
    </div>
  );
}
