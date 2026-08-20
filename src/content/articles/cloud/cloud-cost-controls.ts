import type { Article } from "../../types";

export const article: Article = {
  slug: "cloud-cost-controls",
  category: "cloud",
  contentType: "how-to",
  subcategory: "FinOps",
  title: "Cloud cost controls that work without slowing engineering down",
  seoTitle: "Cloud cost controls that work",
  metaDescription:
    "Why cloud cost programmes stall at the dashboard, where a control can actually sit, and what Azure Cost Management does and does not enforce.",
  standfirst:
    "The bill is a lagging indicator. By the time a cost appears in a report, the decision that caused it was made months earlier by someone who was not thinking about cost.",
  excerpt:
    "Visibility is not a control. Where cloud spend actually originates, the three points at which a control can sit, and the trade-off each one carries.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-20",
  lastReviewedAt: "2026-08-20",
  nextReviewAt: "2027-08-20",
  pillar: "Cost and FinOps",
  readingMinutes: 5,
  primaryKeyword: "cloud cost controls",
  secondaryKeywords: [
    "cloud cost optimisation",
    "finops practices",
    "reduce cloud spend",
    "azure cost management budgets",
  ],
  tags: ["Cloud", "FinOps", "Architecture", "Azure"],
  reviewStatus: "research-based",
  relatedSlugs: ["terraform-vs-opentofu"],
  methodology:
    "Written from Microsoft Cost Management documentation, the Azure Well-Architected Framework Cost Optimization pillar, Azure Advisor reference documentation and the FinOps Foundation's published principles, verified August 2026. Azure-specific behaviour is labelled as such and kept separate from general cloud principles. No pricing figures, savings percentages or customer spend data are used — those are contract-specific and would not survive contact with a reader's own agreement.",
  body: [
    {
      type: "p",
      text: "Cost programmes tend to start with a dashboard and end with nothing changing. The dashboard is rarely the problem; it is usually accurate. The problem is that a report tells you what was spent, and spending is the last event in a chain that began with an architecture decision, a default nobody set deliberately, or a resource with no owner. Visibility is a prerequisite for a control. It is not itself a control.",
    },
    {
      type: "p",
      text: "A control is something that changes what gets deployed, or what keeps running, without a person having to notice. Everything else is a report that generates a meeting.",
    },
    { type: "h2", id: "symptoms", text: "Symptoms are not causes" },
    {
      type: "p",
      text: "Cost investigations tend to stop at the symptom, because the symptom is what the tooling surfaces. The cause is usually one level down, and it is rarely a technical mistake — it is a decision made without a price attached to it.",
    },
    {
      type: "table",
      caption:
        "Patterns worth checking rather than measured frequencies: what the report shows, and what is often underneath it",
      head: ["Symptom", "Common root cause"],
      rows: [
        [
          "Non-production spend approaching production",
          "Environments cloned from production templates, inheriting production SKUs and redundancy nobody asked for",
        ],
        [
          "Storage or log spend growing steadily with no release",
          "A retention default set once, at the highest tier, then applied to everything by inheritance",
        ],
        [
          "A large line item for data transfer",
          "A placement decision — a chatty service split across zones or regions — priced only after the design was fixed",
        ],
        [
          "An oversized managed database at low utilisation",
          "Sized for a launch-day forecast that never arrived, and never revisited because nothing broke",
        ],
      ],
    },
    {
      type: "p",
      text: "The pattern is consistent. Each of these is cheap to prevent at design time, moderately expensive to correct at deploy time, and permanently expensive to manage at run time. That ordering is the entire argument for where to spend effort.",
    },
    { type: "h2", id: "where-controls-sit", text: "Where a control can actually sit" },
    {
      type: "p",
      text: "There are three places to intervene, and they are not interchangeable. Choosing the wrong one is why cost programmes acquire a reputation for slowing engineering down.",
    },
    {
      type: "table",
      caption: "The three intervention points and what each one costs you",
      head: ["Point", "What it looks like", "Trade-off"],
      rows: [
        [
          "Design time",
          "Cost stated as a non-functional requirement, priced alongside latency and availability",
          "Cheapest by far, but unenforceable — it depends on the decision being visible to someone who will ask",
        ],
        [
          "Deploy time",
          "Defaults and guardrails in templates and pipelines: permitted SKUs, required tags, retention ceilings",
          "Genuinely enforceable, but becomes a blocker the moment a guardrail is wrong and there is no fast exception path",
        ],
        [
          "Run time",
          "Budgets, anomaly alerts, right-sizing, scheduled shutdown of idle environments",
          "Always available and always reactive — it reduces the bill without addressing why the bill was that shape",
        ],
      ],
    },
    {
      type: "p",
      text: "Two failure modes are worth naming. The first is investing almost entirely at run time, because that is where the tooling is, and then wondering why the same overspend reappears next quarter under different resource names. The second is over-investing at deploy time without an exception path, which is how a guardrail becomes a ticket queue and engineering starts routing around it.",
    },
    {
      type: "p",
      text: "Deploy-time guardrails belong wherever infrastructure is actually defined, which for most estates means the same repository and review process as everything else. That is one reason the [choice of infrastructure-as-code tooling](/devops/terraform-vs-opentofu) carries governance consequences well beyond the tool itself.",
    },
    {
      type: "callout",
      variant: "note",
      title: "A cost-optimised workload is not a low-cost workload",
      text: "The Well-Architected Framework is explicit that optimisation means return on investment rather than minimum spend, and that tactical cuts reduce cost only in the short term. The distinction matters when reporting results: a programme measured purely on reduction will eventually cut something load-bearing.",
    },
    { type: "h2", id: "azure", text: "What Azure gives you, and where it stops" },
    {
      type: "p",
      text: "Microsoft Cost Management is a reporting and alerting layer rather than an enforcement layer, and reading its documentation with that distinction in mind saves a good deal of disappointment. It is available at billing account, subscription, resource group and management group scope — which means your reporting boundary is whatever your subscription and management group design already decided, long before anyone thought about cost.",
    },
    {
      type: "ul",
      items: [
        "Budget alerts fire on actual or forecast cost. Microsoft's guidance suggests thresholds at 90 percent of target, 100 percent and 110 percent, with the forecast alert set at 110 percent.",
        "Budgets created in the portal are defined by cost. The Consumption API also supports usage-based budgets, which is the route if you need to alert on quantity rather than spend.",
        "Subscription and resource group budgets can notify an action group. That is the one place the platform crosses from alerting into automated response.",
        "Anomaly detection runs daily against normalised usage, and is available for subscriptions only — not resource groups or management groups. If your teams are separated by resource group rather than subscription, this capability does not reach them.",
        "Tag inheritance can fill gaps where resources were deployed untagged, and allocation rules can redistribute shared costs. Neither changes the invoice; both change the report.",
        "Azure Advisor surfaces idle and underutilised resources. It is a reasonable starting inventory for right-sizing, not a substitute for knowing why the resource was that size.",
      ],
    },
    {
      type: "p",
      text: "The general principle underneath the Azure detail holds for any provider: the platform will tell you accurately what happened and alert you that it happened, but preventing a recurrence has to live in your own design and deployment process. No provider ships a control for an architecture choice.",
    },
    { type: "h2", id: "not-applicable", text: "Where this advice does not apply" },
    {
      type: "ul",
      items: [
        "Small estates with one team and one subscription. The coordination overhead of allocation, showback and guardrails exceeds the recoverable spend, and reviewing the bill monthly is genuinely sufficient.",
        "Workloads that are spiky by design — batch research, simulation, seasonal processing. Utilisation-based right-sizing produces the wrong answer when low average utilisation is the intended shape.",
        "Estates where SKU and region are dictated by regulation or a data residency commitment. Several rate levers are simply unavailable, and pretending otherwise wastes review cycles.",
        "Products still searching for fit, where speed of iteration is worth more than efficiency until the workload's shape is stable enough to be worth optimising.",
      ],
    },
    { type: "h2", id: "criteria", text: "Deciding what to build first" },
    {
      type: "p",
      text: "Two questions settle the sequencing for most organisations. First: can you attribute a majority of spend to an owning team today? If not, that is the only work worth starting, because every subsequent control depends on an alert reaching someone able to act on it. Second: is your largest cost line a rate problem or a usage problem?",
    },
    {
      type: "p",
      text: "Rate problems — paying list price for consumption that is predictable and continuous — are addressed by commitment purchasing, which is largely a finance exercise and trades flexibility for a lower unit price. Usage problems are addressed by changing what runs, and no purchasing decision will touch them. Confusing the two is the most expensive mistake in this area: committing to a multi-year discount on infrastructure that should not have been running at all locks in the waste and makes it materially harder to remove later.",
    },
  ],
  faq: [
    {
      question: "Should cloud cost optimisation be centralised?",
      answer:
        "The FinOps Foundation's published principles point deliberately both ways: the function is enabled centrally, while accountability for usage is pushed to the teams that own the workloads. In practice a central team should own tooling, defaults, reporting and negotiation, and the spending decisions should stay with engineering. Centralising the decisions produces approval queues that engineering routes around.",
    },
    {
      question: "Why do costs keep rising after a successful optimisation exercise?",
      answer:
        "Because an optimisation exercise is a run-time intervention. It removes waste that already exists without changing what gets deployed next, so the same categories reappear under new resource names. A one-off exercise is still worth doing, but it is best treated as evidence about which defaults to change rather than as the fix itself.",
    },
    {
      question: "Is showback enough, or do we need chargeback?",
      answer:
        "Showback is usually enough to change behaviour and much cheaper to operate, because it only needs allocation to be roughly right rather than defensible to finance. Chargeback earns its overhead when teams hold real budget authority and can genuinely trade cloud spend against something else they want.",
    },
    {
      question: "Do budget alerts stop spending?",
      answer:
        "Not by themselves — a budget alert notifies. In Azure, subscription and resource group budgets can trigger an action group, which is what allows an automated response to be attached. The automation and its blast radius are yours to design, and automatically stopping resources in production is rarely the right default.",
    },
  ],
  sources: [
    {
      title: "What is Microsoft Cost Management",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/cost-management-billing/costs/overview-cost-management",
    },
    {
      title: "Use cost alerts to monitor usage and spending",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/cost-management-billing/costs/cost-mgt-alerts-monitor-usage-spending",
    },
    {
      title: "Cost Optimization design principles — Azure Well-Architected Framework",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/well-architected/cost-optimization/principles",
    },
    {
      title: "Architecture strategies for collecting and reviewing cost data",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/well-architected/cost-optimization/collect-review-cost-data",
    },
    {
      title: "Azure Advisor cost recommendations",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/advisor/advisor-reference-cost-recommendations",
    },
    {
      title: "FinOps Principles",
      publisher: "FinOps Foundation",
      url: "https://www.finops.org/framework/principles/",
    },
  ],
};
