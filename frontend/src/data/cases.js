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
        "LNG vessel order announcements kept appearing through late 2024 — yet Hanwha Ocean's share price was flat. Either the market was missing something, or I was.",
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
          branch: "Competitive position",
          hypothesis: "Hanwha Ocean maintains share in high-value vessel classes",
          subIssues: [
            "FLNG and FSRU order pipeline depth",
            "Competitive dynamics among Korea's three major yards",
            "Welding labour shortage — structural constraint or cyclical?",
          ],
          annotationId: "hanwha-flng",
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
          branch: "Competitive position",
          verdict: "✅ Supported",
          evidence:
            "Hanwha Ocean holds the world's largest FLNG backlog at $8.3B. High-value vessel classes represented 68% of 2024 orders. The company has differentiated within the Korean triopoly by focusing on offshore — FLNG, FSRU — rather than competing directly on volume LNG carriers.",
          risk: "Offshore projects carry development delay and cost overrun risk by nature.",
          annotationId: "hanwha-flng",
        },
      ],
      misalignment:
        "The flat share price despite the orderbook surge reflects market uncertainty about the timing of legacy contract runoff. A margin inflection at the Q4 2024 or Q1 2025 earnings print would likely act as the rerating trigger.",
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
        "The demand structure is sound. Korea's technology monopoly on LNG dual-fuel vessels is durable for at least three to four years. The only question is timing: when do the higher-priced contracts reach the income statement? The legacy backlog runoff — expected through Q4 2024 — is the single gating factor. At 0.92x book during an order boom, the market is pricing in continued margin disappointment. One earnings print that confirms the inflection changes that narrative.",
      conditions: [
        "Q1 2025 operating margin ≥ 5%",
        "Steel plate prices remain stable or decline",
        "Orderbook coverage stays above 30 months",
      ],
      stopCondition:
        "Thesis breaks if Chinese yards achieve LNG dual-fuel commercialisation ahead of schedule, or if US LNG export policy reverses materially.",
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
        title: "Margin recovery timeline",
        body: "The July factor model tracked Hanwha Ocean's Sharpe ratio over rolling 252-day windows. The ratio improved from 0.31 (Q1 2024) to 0.74 (Q4 2024) — consistent with the market beginning to price in the margin recovery thesis before it appears in reported earnings.",
        type: "model",
      },
      {
        id: "hanwha-flng",
        title: "FLNG backlog detail",
        body: "The $8.3B FLNG backlog includes the Mozambique LNG Phase 2 FLNG unit (~$2.8B), multiple FSRU conversions, and proprietary offshore structures. No other single yard holds a comparable concentration of floating LNG assets.",
        type: "source",
      },
      {
        id: "pbr-context",
        title: "PBR in historical context",
        body: "During the 2007–2008 Korean shipbuilding boom, yard PBRs reached 2.5–3.0x. The current 0.92x reflects genuine market scepticism — not just a sector de-rating. The July factor model's inverse-volatility screener ranks Hanwha Ocean in the top tertile of its universe on risk-adjusted momentum, suggesting price action has stabilised relative to volatility even as absolute return has lagged.",
        type: "model",
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
