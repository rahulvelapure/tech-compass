import type { Article } from "../../types";

export const article: Article = {
  slug: "ai-coding-assistants-enterprise",
  category: "ai-enterprise-it",
  subcategory: "Adoption",
  title: "Rolling out AI coding assistants without creating a review problem",
  seoTitle: "Rolling out AI coding assistants",
  metaDescription:
    "What changes when an engineering organisation adopts AI coding assistants: review load, data handling, licence risk and the metrics that mislead.",
  standfirst:
    "Generation capacity goes up immediately. Review capacity does not, and that is where the cost lands.",
  excerpt:
    "The operational consequences of AI coding assistants at organisation scale, and the controls worth putting in place first.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-18",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "ai coding assistant enterprise rollout",
  secondaryKeywords: ["ai code review risk", "copilot enterprise governance"],
  tags: ["AI", "Enterprise IT", "Software", "Governance"],
  reviewStatus: "opinion",
  methodology:
    "Analysis based on published vendor documentation, licensing terms and widely reported engineering practice. Productivity figures are deliberately not claimed.",
  body: [
    {
      type: "p",
      text: "The first-order effect of an assistant rollout is more code proposed per engineer. The second-order effect is more code needing review by the same number of reviewers. Organisations that plan only for the first get a slower pipeline and blame the tool.",
    },
    { type: "h2", id: "controls", text: "Controls to establish before rollout" },
    {
      type: "ul",
      items: [
        "A clear statement of what may be sent to the provider, enforced by tenant settings rather than by policy documents.",
        "Licence and provenance scanning in the pipeline, because generated code can reproduce licensed material.",
        "Review expectations written down: authorship remains with the engineer who submits the change.",
      ],
    },
    { type: "h2", id: "metrics", text: "Metrics that mislead" },
    {
      type: "table",
      caption: "What to measure instead",
      head: ["Tempting metric", "Problem", "Better signal"],
      rows: [
        ["Lines accepted", "Rewards volume", "Change failure rate"],
        ["Suggestions shown", "Measures the tool, not the work", "Lead time to production"],
        ["Seats active", "Licence usage, not value", "Review turnaround time"],
      ],
    },
    {
      type: "quote",
      text: "An assistant shifts the bottleneck; it does not remove it. Plan for where it moves to.",
    },
  ],
  faq: [
    {
      question: "Does an AI coding assistant reduce headcount needs?",
      answer:
        "There is no reliable public evidence for that at organisation scale. What is consistently observable is a shift in where engineering time is spent — less initial drafting, more review and verification.",
    },
  ],
};
