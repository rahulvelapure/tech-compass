import type { Article } from "../../types";

export const article: Article = {
  slug: "documentation-that-gets-read",
  category: "technology-leadership",
  subcategory: "Practice",
  title: "Writing internal documentation people actually read",
  seoTitle: "Internal documentation people read",
  metaDescription:
    "How to write internal technical documentation that gets used: choose the reader's moment, put the answer first, and give every page an owner.",
  standfirst: "Documentation fails for structural reasons, not because engineers dislike writing.",
  excerpt: "Why internal documentation goes unread, and the structural fixes that change it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-10",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "internal technical documentation",
  secondaryKeywords: ["engineering runbook practices", "documentation culture"],
  tags: ["Leadership", "Practice", "Documentation"],
  reviewStatus: "opinion",
  methodology:
    "An opinion piece drawing on established technical writing practice. No organisation is described.",
  body: [
    {
      type: "p",
      text: "The common failure is writing for an imagined reader with time. The real reader is mid-incident, mid-onboarding or mid-approval, and will leave within fifteen seconds if the page does not visibly contain their answer.",
    },
    { type: "h2", id: "structure", text: "Answer first, context second" },
    {
      type: "p",
      text: "Put the command, the decision or the number in the first screen. Background belongs underneath it, for the smaller number of readers who need to understand rather than act.",
    },
    { type: "h2", id: "ownership", text: "Every page needs an owner and a date" },
    {
      type: "ul",
      items: [
        "A named owner, so corrections have somewhere to go.",
        "A last-reviewed date, so readers can judge staleness without asking.",
        "A deletion policy, because an unmaintained page is worse than a missing one.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Delete aggressively",
      text: "A wiki people trust is small. A wiki people distrust is large, and the size is the reason.",
    },
  ],
};
