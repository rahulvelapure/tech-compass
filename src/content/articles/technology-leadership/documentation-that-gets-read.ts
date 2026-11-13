import type { Article } from "../../types";

export const article: Article = {
  slug: "documentation-that-gets-read",
  category: "technology-leadership",
  contentType: "how-to",
  subcategory: "Practice",
  title: "Writing internal documentation people actually read",
  seoTitle: "Internal documentation people read",
  metaDescription:
    "How to write internal technical documentation that gets used: choose the reader's moment, put the answer first, and give every page an owner.",
  standfirst:
    "Nobody reads a wiki for pleasure. They arrive mid-problem, and they leave in fifteen seconds if the answer is not on screen.",
  excerpt:
    "Why internal documentation goes unread, and the small number of habits that change it: answer first, one moment per page, and an owner on every one.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-10",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2028-08-28",
  readingMinutes: 3,
  primaryKeyword: "internal technical documentation",
  secondaryKeywords: [
    "runbook writing",
    "documentation ownership",
    "wiki maintenance",
    "answer first writing",
  ],
  tags: ["Leadership", "Practice", "Documentation"],
  reviewStatus: "opinion",
  draft: true,
  methodology:
    "Written from established technical-writing practice and widely used documentation frameworks. It is an opinion piece: no research findings are claimed, and no tooling is recommended.",
  body: [
    {
      type: "p",
      text: "Most of us write for a reader who has time. That reader does not exist. The real one is in the middle of an incident, a first week, or an approval. They will leave in fifteen seconds if the answer is not on the screen.",
    },
    {
      type: "p",
      text: "That is not impatience. It is a correct reading of the odds. Most internal pages have wasted their time before, so they scan, and if nothing looks like an answer they go and ask a person instead.",
    },
    { type: "h2", id: "answer", text: "Put the answer where the eye lands" },
    {
      type: "p",
      text: "Put the command, the decision or the number in the first screen. Background belongs underneath it, for the smaller number of readers who need to understand rather than act.",
    },
    {
      type: "p",
      text: "This inverts how most of us were taught to write. Context, then reasoning, then conclusion is how you build an argument. It is a poor way to answer a question at two in the morning.",
    },
    {
      type: "p",
      text: "The test is simple. Open the page, look only at what fits on screen, and ask whether someone could act on it. If they need to scroll to find the point, the point is in the wrong place.",
    },
    { type: "h2", id: "moment", text: "One page, one moment" },
    {
      type: "p",
      text: "Most unread pages are trying to serve several readers at once. A page that explains the architecture, lists the runbook steps and records the design decision serves none of them well.",
    },
    {
      type: "p",
      text: "Split by the moment someone arrives. Somebody restoring a service wants steps. Somebody joining the team wants the shape of the system. Somebody reviewing a proposal wants what was decided and why. Those are three pages.",
    },
    {
      type: "p",
      text: "Splitting also makes staleness visible. A runbook that has not been touched in a year is obviously suspect. The same content buried in an architecture overview just looks like background.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Write the title as the question",
      text: "People search with the problem they have, not the noun you filed it under. A page called “Certificate renewal” competes with everything else about certificates. A page called “Renewing the load balancer certificate” gets found by the person whose certificate expires tomorrow.",
    },
    { type: "h2", id: "trust", text: "Trust is the whole asset" },
    {
      type: "p",
      text: "A wiki people trust is small. A wiki people distrust is large, and the size is the reason.",
    },
    {
      type: "p",
      text: "Once a reader has been burned by a stale page, they discount every page. That is rational, and it is very hard to reverse. From then on they ask a colleague, which is slower for them and expensive for the colleague.",
    },
    {
      type: "p",
      text: "So the goal is not coverage. It is a smaller set of pages that are reliably right, and a clear signal about which parts nobody is maintaining.",
    },
    { type: "h2", id: "owner", text: "Three things every page needs" },
    {
      type: "ul",
      items: [
        "A named owner, so corrections have somewhere to go.",
        "A last-reviewed date, so readers can judge staleness without asking.",
        "A deletion policy, because an unmaintained page is worse than a missing one.",
      ],
    },
    {
      type: "p",
      text: "The owner should be a person, not a team. A team owns nothing in practice, because everyone assumes someone else has it.",
    },
    {
      type: "p",
      text: "The review date matters more than the edit date. An edit date tells you someone fixed a typo. A review date tells you someone read it and decided it was still true, which is the thing a reader actually needs to know.",
    },
    {
      type: "p",
      text: "Deletion is the habit teams find hardest and gain most from. If nobody will own a page, delete it. The information is not lost — it is in the repository, or in someone's head, exactly where it was before the page gave a false impression of currency.",
    },
    { type: "h2", id: "moment2", text: "Write it when you learn it" },
    {
      type: "p",
      text: "The best time to write a runbook is immediately after the incident, while the wrong turns are still fresh. A week later you will document the clean path and omit the two hours you lost.",
    },
    {
      type: "p",
      text: "Those wrong turns are the valuable part. The clean path is usually guessable. What saves the next person is knowing that the obvious fix does not work, and why.",
    },
    {
      type: "p",
      text: "The same applies to onboarding. The person who joined last month is the best writer of the joining guide, because they still remember what was confusing. Give that job to them before the knowledge disappears.",
    },
    { type: "h2", id: "start", text: "If your wiki is already too big" },
    {
      type: "ol",
      items: [
        "Find the twenty pages with the most traffic. Those are your real documentation.",
        "Give each one an owner and a review date, and fix anything wrong while you are there.",
        "Move the answer to the top of every one of them.",
        "Archive anything with no owner and no traffic. Do it visibly, so people see the standard.",
        "Then stop. Do not audit the rest. The point was never coverage.",
      ],
    },
    {
      type: "p",
      text: "Twenty reliable pages beat two hundred uncertain ones, because the reader can trust what they find. That trust is the only thing that makes anyone open the wiki instead of messaging a colleague.",
    },
  ],
  faq: [
    {
      question: "How long should a page be?",
      answer: "Long enough to answer one question. If it answers three, make it three pages.",
    },
    {
      question: "Who should own a page?",
      answer:
        "One person, by name. A team owns nothing, because everyone assumes someone else has it.",
    },
    {
      question: "Should we delete old pages?",
      answer: "Yes. A stale page costs you more than a missing one, because people trust it.",
    },
    {
      question: "When is the best time to write a runbook?",
      answer:
        "Right after the incident. A week later you will leave out the parts that went wrong.",
    },
    {
      question: "How do we fix a wiki nobody trusts?",
      answer: "Pick the twenty busiest pages. Make those right. Then stop, and let the rest go.",
    },
  ],
  sources: [
    {
      title: "The documentation system (Diátaxis)",
      publisher: "Diátaxis",
      url: "https://diataxis.fr/",
    },
    {
      title: "Google developer documentation style guide",
      publisher: "Google",
      url: "https://developers.google.com/style",
    },
    {
      title: "Microsoft Writing Style Guide",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/style-guide/welcome/",
    },
  ],
};
