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
    <div className="space-y-8">

      {/* Editorial header */}
      <div>
        <h1 className="text-xl font-bold text-ink-primary">Research</h1>
        <p className="text-sm text-ink-secondary mt-1 leading-relaxed">
          Each case starts with a quantitative signal. The analysis works through
          to a structured recommendation.
        </p>
      </div>

      {/* Cases */}
      <div className="space-y-5">
        {published.map((c) => {
          const meta = TYPE_META[c.type] || TYPE_META.industry;
          const { Icon } = meta;
          const scq = c.knife?.scq;

          return (
            <Link
              key={c.slug}
              to={`/cases/${c.slug}`}
              className="card group hover:border-brand-300 transition-all duration-200 block px-6 py-5"
            >
              {/* Type badge */}
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border mb-4 ${meta.color}`}>
                <Icon size={11} />
                {meta.label}
              </span>

              {/* Headline */}
              <h2 className="text-xl font-bold text-ink-primary group-hover:text-brand-500 transition-colors leading-snug mb-2">
                {c.hook.headline}
              </h2>

              {/* One-liner */}
              <p className="text-sm text-ink-secondary leading-relaxed mb-5">
                {c.hook.oneliner}
              </p>

              {/* SCQ preview */}
              {scq && (
                <div className="space-y-2 mb-5 pl-3 border-l-2 border-border">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-tertiary mt-1.5 shrink-0" />
                    <p className="text-xs text-ink-secondary line-clamp-1">{scq.s}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <p className="text-xs text-ink-secondary line-clamp-1">{scq.c}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-brand-500 font-medium italic">{scq.q}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-ink-tertiary">
                  <span className="font-medium">{c.company}</span>
                  <span>·</span>
                  <span>{c.date}</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-brand-500 group-hover:gap-2 transition-all">
                  Read analysis
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {published.length === 0 && (
        <div className="card text-center py-12 text-ink-tertiary text-sm">
          Case studies coming soon.
        </div>
      )}

    </div>
  );
}
