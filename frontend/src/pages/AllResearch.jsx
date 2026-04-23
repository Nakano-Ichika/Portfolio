import { Link } from "react-router-dom";
import { getPublishedCases } from "../data/cases";

export default function AllResearch() {
  const cases = getPublishedCases();

  return (
    <div className="max-w-[680px] mx-auto px-6 pt-32 pb-32">
      <p className="text-[11px] uppercase tracking-[0.15em] text-ink-tertiary mb-12">
        July · All research
      </p>

      <div className="space-y-12">
        {cases.map((c) => (
          <Link
            key={c.slug}
            to={`/research/${c.slug}`}
            className="block group"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-tertiary mb-2">
              {c.company} · {c.industry} · {c.date}
            </p>
            <h2 className="text-[22px] font-bold text-ink-primary group-hover:text-brand-500 transition-colors leading-snug mb-3">
              {c.hook.headline}
            </h2>
            <p className="text-[15px] text-ink-secondary leading-relaxed">
              {c.hook.oneliner}
            </p>
          </Link>
        ))}
      </div>

      {cases.length === 0 && (
        <p className="text-ink-tertiary text-[15px]">Research coming soon.</p>
      )}

      <div className="mt-20 border-t border-border pt-8">
        <Link to="/" className="text-[14px] text-ink-tertiary hover:text-ink-primary transition-colors">
          ← Back
        </Link>
      </div>
    </div>
  );
}
