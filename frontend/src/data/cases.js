export const CASES = [
  {
    slug: "korean-shipbuilding-2025",
    title: "Korean Shipbuilding Cycle",
    company: "Hanwha Ocean",
    ticker: "042660.KS",
    industry: "Heavy Industry",
    type: "industry",
    date: "April 2025",
    status: "published",

    hook: {
      headline: "LNG orderbook surge: is Hanwha Ocean's margin recovery priced in?",
      oneliner:
        "IMO 2030 compliance is forcing early retirement of 3,200 vessels. Korean yards control 72% of LNG dual-fuel technology. The question is whether the revenue is reaching the bottom line.",
      keyMetric: { label: "Orderbook / Revenue", value: "2.8x", context: "as of 2024" },
    },

    recipe: {
      trigger:
        "LNG vessel order announcements kept appearing through late 2024 — yet Hanwha Ocean's share price was flat. The consensus bear case was China. I looked at the company instead.",
      context: [
        "Global LNG shipping demand is forecast to grow at 6–8% CAGR through 2030 (IEA, 2024).",
        "IMO 2030 carbon regulations will force approximately 3,200 vessels built in the early 2000s into early retirement.",
        "LNG dual-fuel propulsion technology is effectively monopolised by Korea's three major yards, which hold 72% combined market share.",
      ],
      question: "Can Hanwha Ocean convert this demand cycle into earnings?",
    },

    knife: {
      scq: {
        s: "Global LNG demand growth and IMO compliance mandates have driven a sustained orderbook surge for Korean shipbuilders. Hanwha Ocean holds a confirmed orderbook of 2.8x annual revenue, including the largest FLNG backlog in the world.",
        c: "Despite the order volume, Hanwha Ocean's operating margin sits at 2–3%. Rising steel plate costs, legacy low-price contracts signed during the 2020–2022 downturn, and labour shortages are compressing profitability despite record top-line growth.",
        q: "Will the new, higher-priced contracts translate into visible margin recovery by mid-2025?",
      },
      issueTree: [
        {
          branch: "Demand durability",
          hypothesis: "Structural LNG vessel demand holds through 2028",
          subIssues: [
            "IMO enforcement schedule and carbon intensity index thresholds",
            "US LNG export infrastructure expansion pace",
            "Chinese yards' ability to close the LNG dual-fuel technology gap",
          ],
          annotationId: "lng-orderbook",
        },
        {
          branch: "Cost structure improvement",
          hypothesis: "Margins become visible from 2025–2026 deliveries onward",
          subIssues: [
            "Legacy low-price contract runoff timeline (Q4 2024 target)",
            "Steel plate price hedging strategy",
            "Smart yard investment — measurable productivity gains",
          ],
          annotationId: "margin-recovery",
        },
        {
          branch: "Organisational readiness",
          hypothesis: "Hanwha Ocean can execute the technology transition despite significant internal friction",
          subIssues: [
            "Labour union resistance: history of strikes and organised opposition to automation investment",
            "Policy-to-strategy lag: government smart-manufacturing support exists, but capital allocation timelines are unclear",
            "Cross-functional gap: strategic roadmap designed without sufficient operational input from yard teams",
          ],
          annotationId: "org-risk",
        },
      ],
    },

    cooking: {
      findings: [
        {
          branch: "Demand durability",
          verdict: "✅ Supported",
          evidence:
            "187 LNG vessels were ordered globally in 2024 — up 34% year-on-year (Clarksons Research). US LNG export capacity is approved to reach 2.3x current levels by 2030 (DOE). Chinese yards still lack GTT membrane licensing for high-pressure LNG cargo tanks; independent development is estimated at 4–5 years.",
          risk: "If Chinese yards close the technology gap faster than expected, market share pressure could emerge after 2028.",
          annotationId: "lng-orderbook",
        },
        {
          branch: "Cost structure improvement",
          verdict: "⚠️ Conditional",
          evidence:
            "New LNG vessel contract prices averaged $240M in 2023–2024 — up 41% from the 2020 trough. Legacy low-price backlog was approximately 35% depleted as of Q3 2024, with full runoff by Q4 expected. Consensus operating margin forecast for 2025 deliveries sits at 6–8%.",
          risk: "Steel plate price re-acceleration in 2025 could delay margin recovery. Labour shortages may cause delivery slippage.",
          annotationId: "margin-recovery",
        },
        {
          branch: "Organisational readiness",
          verdict: "⚠️ Conditional",
          evidence:
            "Hanwha Ocean's labour unions have a documented history of coordinated industrial action — including a 51-day strike in 2022 that delayed deliveries. Smart-yard automation, the critical investment for defending cost position against future Chinese competition, directly threatens the jobs of the skilled welders and plate-cutters the union represents. Management has announced automation targets, but capex allocation to smart-yard programmes has lagged stated ambitions. Interviews and earnings transcripts reveal a consistent gap between what the strategic team describes as the technology roadmap and what yard-level commentary suggests is actually being implemented.",
          risk: "If management chooses industrial peace over technology investment — a rational short-term choice — the cost advantage that justifies the premium orderbook narrows as Chinese yards continue developing. The FLNG backlog is real. The question is whether it gets delivered on time and on budget given these internal constraints.",
          annotationId: "org-risk",
        },
      ],
      misalignment:
        "The market is watching China. The more immediate risk is internal. Labour friction, policy-to-execution lag, and a strategy-workforce communication gap are compressing the window in which Hanwha Ocean can deploy smart-yard investment before Chinese yards close the technology distance. The Q4 2024 earnings call is worth listening to not just for margin confirmation, but for how management discusses automation capex — that signals whether they are prioritising the technology window or managing labour relations.",
    },

    seasoning: {
      multiples: { per: 18.4, pbr: 0.92, roe: 5.1, evEbitda: 11.2 },
      priceReturn: { threeMonth: -4.2, oneYear: +12.8, vsIndex: +6.3, indexName: "KOSPI" },
      sharpe: 0.74,
      note: "PBR at 0.92x — trading below book value during a confirmed order boom. If ROE recovery materialises as consensus expects, the multiple re-rating case is straightforward.",
      annotationId: "pbr-context",
    },

    conclusion: {
      verdict: "Consider entry — pending Q1 2025 earnings confirmation.",
      thesis:
        "The demand structure is sound. Korea's technology monopoly on LNG dual-fuel vessels is durable for at least three to four years. The only question is timing: when do the higher-priced contracts reach the income statement? But there is a second question the market is not asking: can Hanwha Ocean execute the smart-yard transition fast enough to maintain its cost advantage before that technology window closes? The consensus bear case is China. The more proximate risk is internal — a labour structure that has historically resisted automation, and an organisation where strategic ambition and operational reality are not always in conversation. Both questions need a positive answer for the thesis to hold.",
      conditions: [
        "Q1 2025 operating margin ≥ 5%",
        "Smart-yard capex allocation confirmed in 2025 guidance — signals management is prioritising the technology window",
        "Steel plate prices remain stable or decline",
        "Orderbook coverage stays above 30 months",
      ],
      stopCondition:
        "Thesis breaks if: labour disputes materially delay the 2025–2026 delivery schedule; or smart-yard capex falls in 2025 guidance — signalling management has chosen industrial peace over technology investment; or Chinese yards announce GTT membrane licensing agreements ahead of schedule.",
    },

    annotations: [
      {
        id: "lng-orderbook",
        title: "LNG orderbook data",
        body: "Source: Clarksons Research, December 2024. 187 vessels represents the highest annual LNG order volume since 2013. The US DOE export capacity figure references approved projects under construction or with final investment decision, not speculative approvals.",
        type: "source",
      },
      {
        id: "margin-recovery",
        title: "Why margins lag the orderbook",
        body: "New vessel contract prices averaged $240M in 2023–2024, up 41% from the 2020 trough. The gap between orderbook strength and reported earnings is mechanical: steel and labour costs are real and current; the higher vessel prices exist in backlog but don't appear as revenue until delivery, typically 18–24 months after signing. The legacy low-price contracts — signed when yards were desperate for volume — are what's hitting the income statement now.",
        type: "source",
      },
      {
        id: "org-risk",
        title: "The internal execution risk",
        body: "Three mechanisms compound each other. First, labour: Hanwha Ocean's unions have historically opposed automation on the grounds of job displacement, and the 2022 strike — 51 days — is the most recent data point. Second, policy lag: the Korean government's K-Shipbuilding Renaissance Plan announced smart-manufacturing subsidies, but disbursement timelines and company-level implementation schedules diverge materially. Third, communication structure: strategic planning and yard operations work with limited cross-functional visibility, meaning technology investment decisions get made without full operational feedback. None of these is fatal individually. Together they create an execution risk that the market, focused on China, is not pricing.",
        type: "source",
      },
      {
        id: "pbr-context",
        title: "PBR in historical context",
        body: "During the 2007–2008 Korean shipbuilding boom, yard PBRs reached 2.5–3.0x as earnings surged on high-priced deliveries. The current 0.92x — below book value during a confirmed order boom — reflects market scepticism about the timing of margin recovery, not about the demand cycle itself. Historically, Korean yards have re-rated sharply once operating leverage kicks in on higher-priced contracts. The question is when, not whether.",
        type: "source",
      },
    ],
  },
];

export function getCaseBySlug(slug) {
  return CASES.find((c) => c.slug === slug) || null;
}

export function getPublishedCases() {
  return CASES.filter((c) => c.status === "published");
}
