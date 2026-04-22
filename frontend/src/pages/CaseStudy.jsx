import { useParams, Link } from "react-router-dom";
import { getCaseBySlug } from "../data/cases";
import {
  ArrowLeft, CheckCircle, AlertTriangle, XCircle,
  TrendingUp, TrendingDown, BarChart2, Layers,
} from "lucide-react";

// ── Small helpers ────────────────────────────────────────────────────────

function SectionLabel({ num, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {num}
      </span>
      <h2 className="text-base font-bold text-ink-primary">{title}</h2>
    </div>
  );
}

function Tag({ text, color = "default" }) {
  const colors = {
    default: "bg-surface text-ink-secondary border-border",
    blue:    "bg-blue-50 text-blue-600 border-blue-200",
    green:   "bg-green-50 text-green-600 border-green-200",
    yellow:  "bg-amber-50 text-amber-600 border-amber-200",
    red:     "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded border ${colors[color]}`}>
      {text}
    </span>
  );
}

function VerdictIcon({ verdict }) {
  if (verdict.startsWith("✅")) return <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />;
  if (verdict.startsWith("⚠️")) return <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />;
  return <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />;
}

function MetricBlock({ label, value, sub, positive }) {
  return (
    <div className="bg-surface rounded-xl px-3 py-3">
      <p className="text-[10px] text-ink-tertiary font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${
        positive === true ? "text-green-500" :
        positive === false ? "text-red-500" :
        "text-ink-primary"
      }`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-ink-tertiary mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────

export default function CaseStudy() {
  const { slug } = useParams();
  const c = getCaseBySlug(slug);

  if (!c) {
    return (
      <div className="space-y-4">
        <Link to="/cases" className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary">
          <ArrowLeft size={14} /> Research
        </Link>
        <div className="card text-center py-12 text-ink-tertiary text-sm">
          Case not found.
        </div>
      </div>
    );
  }

  const { hook, recipe, knife, cooking, seasoning, conclusion } = c;

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Back */}
      <Link to="/cases" className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary transition-colors">
        <ArrowLeft size={14} /> 케이스 목록
      </Link>

      {/* ── 훅 ──────────────────────────────────────────────────────── */}
      <div className="card border-brand-200 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Tag text={c.industry} color="blue" />
              <Tag text={c.company} />
              <Tag text={c.date} />
            </div>
            <h1 className="text-xl font-bold text-ink-primary leading-snug">
              {hook.headline}
            </h1>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-brand-500">{hook.keyMetric.value}</div>
            <div className="text-[10px] text-ink-tertiary mt-0.5">{hook.keyMetric.label}</div>
            <div className="text-[10px] text-ink-tertiary">{hook.keyMetric.context}</div>
          </div>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">{hook.oneliner}</p>
      </div>

      {/* ── 01 레시피: 왜 이 문제인가 ──────────────────────────────── */}
      <div className="card">
        <SectionLabel num="01" title="레시피 — 왜 이 문제인가" />

        <div className="space-y-4">
          {/* Trigger */}
          <div>
            <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-1.5">촉발 계기</p>
            <p className="text-sm text-ink-secondary leading-relaxed bg-surface rounded-lg px-3 py-2.5 border border-border">
              {recipe.trigger}
            </p>
          </div>

          {/* Context */}
          <div>
            <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-1.5">맥락 & 수치</p>
            <ul className="space-y-1.5">
              {recipe.context.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Question */}
          <div className="bg-brand-50 border border-brand-200 rounded-lg px-3 py-2.5">
            <p className="text-[11px] font-semibold text-brand-500 uppercase tracking-wide mb-1">핵심 질문</p>
            <p className="text-sm font-semibold text-ink-primary">{recipe.question}</p>
          </div>
        </div>
      </div>

      {/* ── 02 식칼: SCQ + 이슈트리 ────────────────────────────────── */}
      <div className="card">
        <SectionLabel num="02" title="식칼 — 문제를 어떻게 잘랐나" />

        {/* SCQ */}
        <div className="space-y-3 mb-6">
          {[
            { label: "S — Situation", text: knife.scq.s, color: "border-l-blue-400" },
            { label: "C — Complication", text: knife.scq.c, color: "border-l-amber-400" },
            { label: "Q — Key Question", text: knife.scq.q, color: "border-l-brand-400" },
          ].map(({ label, text, color }) => (
            <div key={label} className={`pl-3 border-l-2 ${color}`}>
              <p className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm text-ink-secondary leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Issue Tree */}
        <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-3">이슈 트리 (MECE)</p>
        <div className="space-y-3">
          {knife.issueTree.map((branch, i) => (
            <div key={i} className="bg-surface rounded-xl px-3 py-3 border border-border">
              <div className="flex items-start gap-2 mb-2">
                <span className="w-5 h-5 rounded bg-brand-100 text-brand-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {String.fromCharCode(65 + i)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-primary">{branch.branch}</p>
                  <p className="text-xs text-ink-secondary mt-0.5 italic">"{branch.hypothesis}"</p>
                </div>
              </div>
              <ul className="ml-7 space-y-1">
                {branch.subIssues.map((s, j) => (
                  <li key={j} className="text-xs text-ink-tertiary flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-ink-tertiary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── 03 조리: 분석 결과 ──────────────────────────────────────── */}
      <div className="card">
        <SectionLabel num="03" title="조리 — 무엇을 발견했나" />

        <div className="space-y-4">
          {cooking.findings.map((f, i) => (
            <div key={i} className="border border-border rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <VerdictIcon verdict={f.verdict} />
                <div>
                  <p className="text-sm font-bold text-ink-primary">Branch {String.fromCharCode(65 + i)}: {f.branch}</p>
                  <p className="text-xs text-ink-secondary">{f.verdict.replace(/^[✅⚠️❌]\s*/, "")}</p>
                </div>
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed mb-2">{f.evidence}</p>
              <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{f.risk}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Misalignment */}
        <div className="mt-4 bg-surface border border-border rounded-xl px-3 py-3">
          <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-1.5">미스얼라인먼트 분석</p>
          <p className="text-sm text-ink-secondary leading-relaxed">{cooking.misalignment}</p>
        </div>
      </div>

      {/* ── 04 조미료: 퀀트 검증 ────────────────────────────────────── */}
      <div className="card">
        <SectionLabel num="04" title="조미료 — 숫자로 검증" />

        {/* Multiples */}
        <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-3">Valuation Multiples</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <MetricBlock label="PER" value={`${seasoning.multiples.per}x`} />
          <MetricBlock label="PBR" value={`${seasoning.multiples.pbr}x`} positive={seasoning.multiples.pbr < 1} />
          <MetricBlock label="ROE" value={`${seasoning.multiples.roe}%`} positive={seasoning.multiples.roe > 10} />
          <MetricBlock label="EV/EBITDA" value={`${seasoning.multiples.evEbitda}x`} />
        </div>

        {/* Price returns */}
        <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-3">Price Return</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          <MetricBlock
            label="3개월"
            value={`${seasoning.priceReturn.threeMonth >= 0 ? "+" : ""}${seasoning.priceReturn.threeMonth}%`}
            positive={seasoning.priceReturn.threeMonth >= 0}
          />
          <MetricBlock
            label="1년"
            value={`${seasoning.priceReturn.oneYear >= 0 ? "+" : ""}${seasoning.priceReturn.oneYear}%`}
            positive={seasoning.priceReturn.oneYear >= 0}
          />
          <MetricBlock
            label="vs KOSPI"
            value={`${seasoning.priceReturn.vsKospi >= 0 ? "+" : ""}${seasoning.priceReturn.vsKospi}%`}
            positive={seasoning.priceReturn.vsKospi >= 0}
          />
        </div>

        {/* Sharpe */}
        <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-3 py-3 mb-4">
          <BarChart2 size={18} className="text-brand-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-ink-tertiary font-semibold uppercase tracking-wide">Sharpe Ratio</p>
            <p className="text-lg font-bold text-ink-primary">{seasoning.sharpe}</p>
          </div>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">{seasoning.note}</p>
      </div>

      {/* ── 05 완성: 최종 결론 ──────────────────────────────────────── */}
      <div className="card border-2 border-brand-200">
        <SectionLabel num="05" title="완성 — 결론" />

        {/* Verdict */}
        <div className="bg-brand-500 rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-white font-bold text-base">{conclusion.verdict}</p>
        </div>

        {/* Thesis */}
        <p className="text-sm text-ink-secondary leading-relaxed mb-5">{conclusion.thesis}</p>

        {/* Conditions */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-2">투자 조건 (모두 충족 시)</p>
          <ul className="space-y-1.5">
            {conclusion.conditions.map((cond, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink-secondary">
                <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                {cond}
              </li>
            ))}
          </ul>
        </div>

        {/* Stop condition */}
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-0.5">thesis 파기 조건</p>
            <p className="text-xs text-red-700">{conclusion.stopCondition}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
