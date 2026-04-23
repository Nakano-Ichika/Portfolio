import { useState } from "react";
import { Link } from "react-router-dom";
import { CASES } from "../data/cases";
import AnnotationPanel from "../components/AnnotationPanel";

const c = CASES[0];

function VerdictMark({ verdict }) {
  if (verdict.startsWith("✅")) return <span className="text-positive font-semibold">Supported</span>;
  if (verdict.startsWith("⚠️")) return <span className="text-amber-500 font-semibold">Conditional</span>;
  return <span className="text-negative font-semibold">Not supported</span>;
}

function AnnotationTrigger({ id, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-amber-400 text-amber-500 text-[10px] font-bold ml-1.5 align-middle hover:bg-amber-50 transition-colors flex-shrink-0"
      title="View source / model detail"
    >
      ⊕
    </button>
  );
}

export default function Landing() {
  const [activeAnnotationId, setActiveAnnotationId] = useState(null);

  if (!c) return null;

  const { hook, recipe, knife, cooking, seasoning, conclusion, annotations } = c;

  const annotationMap = Object.fromEntries((annotations || []).map((a) => [a.id, a]));
  const activeAnnotation = activeAnnotationId ? annotationMap[activeAnnotationId] : null;

  const openAnnotation = (id) => setActiveAnnotationId(id);
  const closeAnnotation = () => setActiveAnnotationId(null);

  return (
    <>
      {/* ── Landing viewport ──────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-16 pb-24 relative">
        {/* Static "July" wordmark — visible before TopNav appears */}
        <div className="absolute top-6 left-8 md:left-16 lg:left-24">
          <span className="text-[17px] font-semibold text-ink-primary tracking-tight">July</span>
        </div>

        <div className="max-w-[720px]">
          {/* Meta */}
          <p className="text-[11px] uppercase tracking-[0.15em] text-ink-tertiary mb-6">
            {c.company} · {c.industry} · {c.date}
          </p>

          {/* Headline */}
          <h1 className="text-display font-bold text-ink-primary mb-8">
            {hook.headline}
          </h1>

          {/* One-liner */}
          <p className="text-[19px] leading-[1.6] text-ink-secondary max-w-[560px]">
            {hook.oneliner}
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-8 md:left-16 lg:left-24 flex flex-col items-start gap-1">
          <div className="w-px h-10 bg-border animate-pulse" />
        </div>
      </section>

      {/* ── Report body ───────────────────────────────────────────────── */}
      <article className="max-w-[680px] mx-auto px-6 pb-32">

        {/* ── 01  Situation ─────────────────────────────────────────── */}
        <Section num="01" title="Situation">
          <blockquote className="border-l-2 border-ink-tertiary pl-5 my-8 text-[18px] italic text-ink-primary leading-[1.6]">
            "{recipe.trigger}"
          </blockquote>
          {recipe.context.map((item, i) => (
            <p key={i} className="prose-reading mb-4">{item}</p>
          ))}
          <p className="text-[19px] font-semibold text-ink-primary mt-8 leading-snug">
            {recipe.question}
          </p>
        </Section>

        {/* ── 02  Problem structure ─────────────────────────────────── */}
        <Section num="02" title="Problem structure">
          {/* SCQ */}
          <div className="space-y-8 mb-12">
            {[
              { key: "S", text: knife.scq.s },
              { key: "C", text: knife.scq.c },
              { key: "Q", text: knife.scq.q, italic: true },
            ].map(({ key, text, italic }) => (
              <div key={key} className="flex gap-6">
                <span className="text-[40px] font-bold text-border leading-none flex-shrink-0 select-none hidden md:block">
                  {key}
                </span>
                <p className={`prose-reading ${italic ? "italic text-ink-primary font-medium" : ""} pt-1`}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* Issue tree */}
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-tertiary mb-6">
            Issue tree — MECE decomposition
          </p>
          <div className="space-y-8">
            {knife.issueTree.map((branch, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-[11px] font-bold text-ink-tertiary tabular-nums">{String.fromCharCode(65 + i)}</span>
                  <h3 className="text-[16px] font-semibold text-ink-primary">
                    {branch.branch}
                    {branch.annotationId && (
                      <AnnotationTrigger id={branch.annotationId} onClick={openAnnotation} />
                    )}
                  </h3>
                </div>
                <p className="text-[15px] italic text-ink-secondary mb-3 ml-5">
                  "{branch.hypothesis}"
                </p>
                <ul className="ml-5 space-y-1.5">
                  {branch.subIssues.map((s, j) => (
                    <li key={j} className="text-[14px] text-ink-tertiary flex items-start gap-2">
                      <span className="mt-[6px] w-1 h-1 rounded-full bg-ink-tertiary flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 03  Analysis ──────────────────────────────────────────── */}
        <Section num="03" title="Analysis">
          <div className="space-y-12">
            {cooking.findings.map((f, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-3">
                  <VerdictMark verdict={f.verdict} />
                  <span className="text-ink-tertiary text-[13px]">—</span>
                  <span className="text-[15px] font-semibold text-ink-primary">{f.branch}</span>
                </div>
                <p className="prose-reading mb-3">
                  {f.evidence}
                  {f.annotationId && (
                    <AnnotationTrigger id={f.annotationId} onClick={openAnnotation} />
                  )}
                </p>
                <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Risk: {f.risk}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <p className="text-[12px] uppercase tracking-[0.1em] text-ink-tertiary mb-3">
              Market misalignment
            </p>
            <p className="prose-reading">{cooking.misalignment}</p>
          </div>
        </Section>

        {/* ── 04  Numbers ───────────────────────────────────────────── */}
        <Section num="04" title="The numbers">
          {/* Prose intro with key numbers inline */}
          <p className="prose-reading mb-8">
            At current prices, Hanwha Ocean trades at{" "}
            <strong className="text-ink-primary">{seasoning.multiples.pbr}x book value</strong> — below
            NAV despite a confirmed orderbook of{" "}
            <strong className="text-ink-primary">{c.hook.keyMetric.value}</strong> annual revenue.
            The 12-month Sharpe ratio stands at{" "}
            <strong className="text-ink-primary">{seasoning.sharpe}</strong>.
            {seasoning.annotationId && (
              <AnnotationTrigger id={seasoning.annotationId} onClick={openAnnotation} />
            )}
          </p>

          {/* Multiples table */}
          <table className="w-full text-[14px] mb-8">
            <tbody className="divide-y divide-border">
              {[
                { label: "PER",       value: `${seasoning.multiples.per}x` },
                { label: "PBR",       value: `${seasoning.multiples.pbr}x`, note: "below book" },
                { label: "ROE",       value: `${seasoning.multiples.roe}%` },
                { label: "EV/EBITDA", value: `${seasoning.multiples.evEbitda}x` },
              ].map(({ label, value, note }) => (
                <tr key={label}>
                  <td className="py-2.5 text-ink-tertiary w-32">{label}</td>
                  <td className="py-2.5 text-ink-primary font-medium tabular-nums">
                    {value}
                    {note && <span className="ml-2 text-[12px] text-ink-tertiary font-normal">← {note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Price returns */}
          <div className="flex gap-8 text-[14px] mb-6">
            {[
              { label: "3-month",     value: seasoning.priceReturn.threeMonth },
              { label: "1-year",      value: seasoning.priceReturn.oneYear },
              { label: `vs ${seasoning.priceReturn.indexName}`, value: seasoning.priceReturn.vsIndex },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-ink-tertiary mb-0.5">{label}</p>
                <p className={`font-semibold tabular-nums ${value >= 0 ? "text-positive" : "text-negative"}`}>
                  {value >= 0 ? "+" : ""}{value}%
                </p>
              </div>
            ))}
          </div>

          <p className="text-[13px] text-ink-tertiary leading-relaxed">{seasoning.note}</p>
        </Section>

        {/* ── 05  Conclusion ────────────────────────────────────────── */}
        <Section num="05" title="Conclusion">
          <p className="text-[22px] font-bold text-ink-primary leading-snug mb-8">
            {conclusion.verdict}
          </p>
          <p className="prose-reading mb-8">{conclusion.thesis}</p>

          <p className="text-[12px] uppercase tracking-[0.1em] text-ink-tertiary mb-4">
            Conditions that must hold
          </p>
          <ul className="space-y-2 mb-8">
            {conclusion.conditions.map((cond, i) => (
              <li key={i} className="text-[15px] text-ink-secondary flex items-start gap-2">
                <span className="text-ink-tertiary mt-[1px]">→</span>
                {cond}
              </li>
            ))}
          </ul>

          <p className="text-[14px] text-ink-tertiary border-t border-border pt-6">
            <span className="font-medium text-ink-secondary">Thesis breaks if — </span>
            {conclusion.stopCondition}
          </p>
        </Section>

        {/* ── End of report ─────────────────────────────────────────── */}
        <div className="mt-24 pt-12 border-t border-border">
          <Link
            to="/research"
            className="text-[15px] text-ink-secondary hover:text-ink-primary transition-colors"
          >
            Other work →
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 mb-8 flex items-center gap-6 text-[12px] text-ink-tertiary">
          <Link to="/methodology" className="hover:text-ink-secondary transition-colors">
            Methodology
          </Link>
          <span>·</span>
          <span>July</span>
        </footer>
      </article>

      {/* Annotation panel */}
      {activeAnnotation && (
        <AnnotationPanel annotation={activeAnnotation} onClose={closeAnnotation} />
      )}
    </>
  );
}

function Section({ num, title, children }) {
  return (
    <section className="mt-20">
      <div className="flex items-center gap-4 mb-8 border-t border-border pt-8">
        <span className="text-[11px] font-mono text-ink-tertiary">{num}</span>
        <h2 className="text-[13px] uppercase tracking-[0.12em] text-ink-tertiary font-medium">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
