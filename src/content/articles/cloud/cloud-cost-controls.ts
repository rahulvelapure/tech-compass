import type { Article } from "../../types";

export const article: Article = {
  slug: "cloud-cost-controls",
  category: "cloud",
  subcategory: "FinOps",
  title: "Cloud cost controls that work without slowing engineering down",
  seoTitle: "Cloud cost controls that work",
  metaDescription:
    "Practical cloud cost controls: tagging you can enforce, budgets with owners, and the small number of architectural decisions that drive most of the bill.",
  standfirst:
    "Most cloud overspend comes from a handful of decisions, not from thousands of small inefficiencies.",
  excerpt:
    "Where cloud spend actually accumulates, and the controls that reduce it without adding approval queues.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-26",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "cloud cost optimisation",
  secondaryKeywords: ["finops practices", "reduce cloud spend"],
  tags: ["Cloud", "FinOps", "Architecture"],
  reviewStatus: "research-based",
  methodology:
    "Written from published cloud provider pricing models and FinOps Foundation practice guidance. No customer spend data is used.",
  body: [
    {
      type: "p",
      text: "Cost programmes tend to start with dashboards and end with nothing changing, because visibility is not a control. A control is something that changes what gets deployed by default.",
    },
    { type: "h2", id: "big-items", text: "The items that dominate the bill" },
    {
      type: "ol",
      items: [
        "Idle non-production environments left running outside working hours.",
        "Data egress and cross-zone traffic created by an architecture decision nobody priced.",
        "Over-provisioned managed databases sized for a launch-day estimate that never arrived.",
        "Log and metric retention set once, at the highest tier, for everything.",
      ],
    },
    { type: "h2", id: "controls", text: "Controls worth implementing" },
    {
      type: "table",
      caption: "Control, effort and typical effect",
      head: ["Control", "Effort", "Effect"],
      rows: [
        ["Mandatory owner tag enforced at deploy", "Low", "Makes every other control possible"],
        ["Scheduled shutdown for non-production", "Low", "Immediate, large"],
        ["Budget alerts routed to the owning team", "Low", "Behavioural, not automatic"],
        ["Committed-use discounts on steady baseline", "Medium", "Large, but reduces flexibility"],
        ["Right-sizing from observed utilisation", "Medium", "Steady, needs repetition"],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Attribute before you optimise",
      text: "Without reliable ownership tags, savings work becomes a central team arguing with every other team about whose resource it is.",
    },
  ],
  faq: [
    {
      question: "Should cost optimisation be centralised?",
      answer:
        "Central teams are well placed to build the tooling, defaults and reporting; the spending decisions belong with the teams that own the workloads. Centralising the decisions tends to create approval queues that engineering routes around.",
    },
  ],
};
