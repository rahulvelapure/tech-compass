import type { Article } from "../../types";

export const article: Article = {
  slug: "eu-ai-act-obligations-timeline",
  category: "ai-enterprise-it",
  contentType: "reference",
  subcategory: "AI governance",
  title: "The EU AI Act in practice: what applies now and what was pushed back",
  seoTitle: "EU AI Act timeline: what applies in 2026",
  metaDescription:
    "Most high-risk AI obligations were deferred to 2027 and 2028 in June 2026, but the transparency duties were not. A dated reference to what is in force.",
  standfirst:
    "The timeline changed in June 2026, and a great deal of published guidance still describes the old one. The distinction that matters is between the obligations that moved and the ones that did not.",
  excerpt:
    "High-risk obligations were deferred to December 2027 and August 2028. The Article 50 transparency duties were not deferred and apply now. Here is the current shape of the timeline.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 3,
  primaryKeyword: "eu ai act obligations timeline 2026",
  secondaryKeywords: [
    "ai act high risk delayed",
    "article 50 transparency obligations",
    "eu ai act compliance dates",
  ],
  tags: ["AI", "Governance", "Compliance", "EU AI Act"],
  reviewStatus: "research-based",
  relatedSlugs: ["model-context-protocol-explained", "iso-27001-microsoft-365-mapping"],
  methodology:
    "Compiled from the European Commission's published implementation timeline and the text of Regulation (EU) 2024/1689, together with reporting on the amendments approved in June 2026. This is a summary of published dates for planning purposes. It is not legal advice, and an organisation's actual obligations depend on its role and its systems.",
  body: [
    {
      type: "p",
      text: "On 16 June 2026 the European Parliament approved amendments that moved most high-risk obligations under the AI Act considerably later. A large amount of guidance written before that date is still in circulation and still describes August 2026 as the moment high-risk requirements begin. It is not, and planning against the old timeline produces both wasted effort and misplaced confidence.",
    },
    {
      type: "p",
      text: "What did not move is the transparency set. Those obligations are in force, and they apply to a much wider group of organisations than the high-risk regime does — including many that concluded the Act was not really about them.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "This is a planning summary, not legal advice",
      text: "Whether a given system is high-risk, and whether an organisation is a provider or a deployer, are determinations with significant consequences. Both should be made with qualified legal input rather than from a table.",
    },
    { type: "h2", id: "in-force", text: "In force now" },
    {
      type: "table",
      caption: "Obligations that apply as at August 2026",
      head: ["Obligation", "Applied from", "Notes"],
      rows: [
        ["Prohibitions on unacceptable-risk practices", "2 February 2025", "Already enforced"],
        ["General-purpose AI model obligations", "2 August 2025", "Legal effect from this date"],
        [
          "Commission enforcement powers for GPAI",
          "2 August 2026",
          "The enforcement toolkit, not the obligations themselves",
        ],
        [
          "Article 50 transparency duties",
          "2 August 2026",
          "Not deferred by the June 2026 amendments",
        ],
      ],
    },
    {
      type: "p",
      text: "The Article 50 duties are the ones most likely to touch an ordinary enterprise deployment. They cover disclosure that a person is interacting with an AI system rather than a human, machine-readable marking of AI-generated content, and labelling of deepfake material. A customer-facing chatbot, or a marketing function generating synthetic images, falls inside this without the organisation being a provider of anything high-risk.",
    },
    {
      type: "callout",
      variant: "note",
      title: "One carve-out worth knowing",
      text: "Systems already in service were given until 2 December 2026 to meet the machine-readable marking duty. New systems had no such grace period.",
    },
    { type: "h2", id: "deferred", text: "Deferred by the June 2026 amendments" },
    {
      type: "table",
      caption: "High-risk obligations and their revised dates",
      head: ["Category", "Examples", "Now applies from"],
      rows: [
        [
          "Annex III — stand-alone high-risk systems",
          "Hiring, credit scoring, education, critical infrastructure",
          "2 December 2027",
        ],
        [
          "Annex I — high-risk AI embedded in regulated products",
          "Medical devices, machinery, toys",
          "2 August 2028",
        ],
      ],
    },
    {
      type: "p",
      text: "The deferral is time, not cancellation. The substantive requirements — risk management, data governance, technical documentation, logging, human oversight, accuracy and robustness — are unchanged. For a system that will clearly be classified as high-risk, the sensible reading is that the design work stays on the same trajectory and the compliance deadline moved.",
    },
    { type: "h2", id: "roles", text: "The role question comes before the risk question" },
    {
      type: "p",
      text: "Most internal discussion of the Act starts by asking whether a system is high-risk. That is the second question. The first is which role the organisation occupies for that system, because the two roles carry different duties and an organisation is frequently both at once for different systems.",
    },
    {
      type: "table",
      caption: "Roles and where an enterprise typically lands",
      head: ["Role", "Broadly", "Typical enterprise position"],
      rows: [
        [
          "Provider",
          "Develops a system, or places one on the market under its own name",
          "Internally built tools, and bought systems that were rebranded",
        ],
        [
          "Deployer",
          "Uses a system under its own authority",
          "The common case for most purchased AI functionality",
        ],
      ],
    },
    {
      type: "p",
      text: "The distinction has a trap in it. Substantially modifying a purchased high-risk system, or putting your own name on it, can move an organisation from deployer to provider — and provider duties are the heavier set. Fine-tuning a model on internal data, or wrapping a vendor system in an internal product identity, are the kinds of ordinary engineering decisions that can change the classification without anyone raising it as a compliance question.",
    },
    { type: "h2", id: "what-to-do", text: "What this means for the next twelve months" },
    {
      type: "ol",
      items: [
        "Determine whether anything you operate falls under Article 50. This is the live obligation and it is frequently missed because the systems involved are not thought of as AI deployments.",
        "Check the 2 December 2026 date against any AI-generating system that was already in service, since that grace period ends this year.",
        "Keep building the inventory. Every route through this regulation begins with knowing which systems exist, what they do, and who owns them — and that work is the long pole regardless of which deadline applies.",
        "Do not stand down high-risk preparation. Two extra years is a planning benefit only if the work continues at a lower intensity rather than stopping.",
        "Re-verify the dates before acting on them. This timeline has already been amended once, and the amendment was substantial.",
      ],
    },
    {
      type: "p",
      text: "The broader lesson for IT is that the classification question arrives before the compliance question, and classification depends on facts about deployment that only the operating teams hold. That makes this an inventory and ownership problem long before it becomes a legal one — the same difficulty that [mapping a control framework onto a live estate](/cybersecurity-ciso/iso-27001-microsoft-365-mapping) runs into.",
    },
  ],
  faq: [
    {
      question: "Did the June 2026 amendments delay the whole AI Act?",
      answer:
        "No. They deferred most high-risk obligations to December 2027 and August 2028. The prohibitions, the general-purpose AI model obligations and the Article 50 transparency duties were not deferred and are in force.",
    },
    {
      question: "Does the Act apply to an organisation outside the EU?",
      answer:
        "It can. The regulation reaches providers and deployers whose systems are placed on the EU market or whose output is used in the EU, so geography of incorporation is not the deciding factor. This is a determination to take legal advice on.",
    },
    {
      question: "Does using a third-party AI product transfer the obligation?",
      answer:
        "Not entirely. The Act distinguishes providers from deployers and places duties on both. Buying a system rather than building one changes which obligations apply, not whether any do.",
    },
  ],
  sources: [
    {
      title: "Timeline for the implementation of the AI Act",
      publisher: "European Commission — AI Act Service Desk",
      url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act",
    },
    {
      title: "Regulation (EU) 2024/1689 laying down harmonised rules on artificial intelligence",
      publisher: "EUR-Lex",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    },
  ],
};
