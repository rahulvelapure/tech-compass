import type { Article } from "../../types";

export const article: Article = {
  slug: "ai-coding-assistants-enterprise",
  category: "ai-enterprise-it",
  contentType: "how-to",
  subcategory: "Adoption",
  title: "Rolling out AI coding assistants without creating a review problem",
  seoTitle: "Rolling out AI coding assistants",
  metaDescription:
    "What changes when an engineering organisation adopts AI coding assistants: review load, data handling, licence risk and the metrics that mislead.",
  standfirst:
    "Code gets written faster on day one. The number of people who can review it does not change. That is where the cost lands.",
  excerpt:
    "The operational consequences of AI coding assistants at organisation scale, and the controls worth putting in place first.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-18",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-02-28",
  readingMinutes: 4,
  primaryKeyword: "ai coding assistant enterprise rollout",
  secondaryKeywords: [
    "copilot enterprise controls",
    "AI generated code review",
    "code provenance scanning",
    "AI assistant data handling",
  ],
  tags: ["AI", "Enterprise IT", "Software", "Governance"],
  reviewStatus: "opinion",
  relatedSlugs: [
    "enterprise-ai-agents-security-governance-reality",
    "eu-ai-act-obligations-timeline",
  ],
  draft: false,
  methodology:
    "Analysis based on published vendor documentation, licensing terms and widely reported engineering practice. Productivity figures are deliberately not claimed, because the published ones measure specific tasks in specific settings and do not transfer to an organisation.",
  body: [
    {
      type: "p",
      text: "Give every engineer an assistant and more code gets written. That part is easy to predict. The harder part is that the same reviewers now have more to read. Plan for the first and not the second, and the pipeline slows while everyone blames the tool.",
    },
    {
      type: "p",
      text: "That is the whole shape of the problem. Everything below is about where the work moves to, and what you should put in place before it does.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The bottleneck moves",
      text: "An assistant shifts the bottleneck; it does not remove it. Plan for where it moves to.",
    },
    { type: "h2", id: "review", text: "Review is the constraint, not typing" },
    {
      type: "p",
      text: "Writing a first draft was rarely the slow part of shipping software. Agreeing that the draft is correct, safe and consistent with the rest of the system was.",
    },
    {
      type: "p",
      text: "An assistant makes drafting much faster and leaves that second job exactly where it was. So the queue moves. Pull requests arrive sooner, sit longer, and grow larger while they wait.",
    },
    {
      type: "p",
      text: "Bigger pull requests are the part worth watching. Review quality falls as a change grows, and an assistant makes large changes cheap to produce. A team that reviewed 200-line changes well can review 800-line changes badly without noticing the shift.",
    },
    {
      type: "p",
      text: "Two habits help more than any tooling. Cap the size of a change, and hold the author responsible for explaining it. If the submitter cannot say why the code is right, the review has not started.",
    },
    { type: "h2", id: "controls", text: "Three controls worth having on day one" },
    {
      type: "p",
      text: "Most of the risk is manageable, but only if the controls exist before the tool is widely used. Retrofitting them is much harder than starting with them.",
    },
    {
      type: "ul",
      items: [
        "A clear statement of what may be sent to the provider, enforced by tenant settings rather than by policy documents.",
        "Licence and provenance scanning in the pipeline, because generated code can reproduce licensed material.",
        "Review expectations written down: authorship remains with the engineer who submits the change.",
      ],
    },
    {
      type: "p",
      text: "The first one is the one people get wrong. A policy page telling engineers not to paste secrets is not a control. The tenant setting that stops the request leaving is.",
    },
    { type: "h2", id: "data", text: "Where the code actually goes" },
    {
      type: "p",
      text: "Every assistant sends context somewhere. What varies is how much, to whom, and what happens to it afterwards.",
    },
    {
      type: "p",
      text: "Read the vendor's own documentation on three points, and get the answers in writing. Is your code used to train a model? How long is a prompt retained? And which of these change on a business tier rather than a consumer one?",
    },
    {
      type: "p",
      text: "The answers differ by product and by plan, and they change. That is why the tenant setting matters more than the policy: the setting is checked on every request, and the policy is checked when someone remembers it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The context window is wider than the file",
      text: "An assistant does not only send the line you are typing. Depending on the product and its settings, it can send surrounding files, open tabs and repository context. Judge exposure by what the tool can reach, not by what the engineer meant to share.",
    },
    { type: "h2", id: "licence", text: "Provenance is a real risk, and a checkable one" },
    {
      type: "p",
      text: "A model trained on public code can reproduce fragments of it, including fragments under licences you would not choose. Vendors offer filters that suppress suggestions matching public code, and those filters help. They are not a guarantee.",
    },
    {
      type: "p",
      text: "So treat it the way you already treat dependencies. Scan for licence and provenance in the pipeline, on every change, whoever wrote it. That check is cheap and it does not care whether a human or a model produced the line.",
    },
    {
      type: "p",
      text: "This also settles an argument that otherwise runs for months. If the scanner passes, the change proceeds. If it flags, someone looks. Nobody has to litigate whether the assistant was involved.",
    },
    { type: "h2", id: "metrics", text: "The metrics that mislead" },
    {
      type: "p",
      text: "Acceptance rate is the number vendors report and the number least worth managing to. It counts suggestions taken, not problems avoided or created.",
    },
    {
      type: "p",
      text: "Lines of code is worse. An assistant reliably increases it, and that tells you nothing about whether the system got better.",
    },
    {
      type: "p",
      text: "Watch delivery instead. Change lead time, review turnaround, change failure rate and the size distribution of pull requests will all tell you something real. If lead time rises while generation rises, you have found the queue.",
    },
    { type: "h2", id: "rollout", text: "A rollout order that does not create a backlog" },
    {
      type: "ol",
      items: [
        "Pick one team with healthy review habits. A team that already reviews badly will review generated code worse.",
        "Turn on the tenant controls first: data handling, public-code filtering, and which repositories are in scope.",
        "Add provenance and licence scanning to that team's pipeline before the assistant is enabled, so you have a baseline.",
        "Agree a maximum change size and write down that the submitter owns the code. Both are cultural, and both are easier to set early.",
        "Measure review turnaround for a few weeks before widening. If it is already slipping, fix that before adding teams.",
      ],
    },
    {
      type: "p",
      text: "The order matters more than the pace. Every control in that list is harder to introduce once a few hundred engineers are used to working without it.",
    },
    { type: "h2", id: "governance", text: "Where this meets the rest of your governance" },
    {
      type: "p",
      text: "An assistant is a supplier with access to source code, which puts it in scope for the reviews you already run. The same questions you ask of any processor apply here, and the [governance model for enterprise AI agents](/ai-enterprise-it/enterprise-ai-agents-security-governance-reality) is the right frame to reuse.",
    },
    {
      type: "p",
      text: "Regulatory scope is worth checking separately rather than assuming. A coding assistant used internally sits differently from a model embedded in a product you sell, and the [EU AI Act obligations timeline](/ai-enterprise-it/eu-ai-act-obligations-timeline) is the place to check which of those you are.",
    },
    {
      type: "p",
      text: "None of this is an argument against adoption. It is an argument for deciding the review, data and provenance questions while the answer is still cheap to change.",
    },
  ],
  faq: [
    {
      question: "Do these tools make engineers more productive?",
      answer:
        "No one has shown that at scale. What you can see is where the time goes. Less drafting. More review.",
    },
    {
      question: "Who owns the code an assistant wrote?",
      answer:
        "The engineer who submits it. Say so in writing, before the first rollout, not after the first incident.",
    },
    {
      question: "Is the public-code filter enough for licence risk?",
      answer:
        "No. It helps. Scan for provenance in the pipeline as well, on every change, whoever wrote it.",
    },
    {
      question: "Should we start with a small pilot?",
      answer:
        "Yes, with a team that already reviews well. A weak review culture gets weaker, not stronger.",
    },
    {
      question: "What is the first thing to turn on?",
      answer:
        "The tenant settings that decide what leaves your estate. Do that before anyone starts using the tool.",
    },
  ],
  sources: [
    {
      title: "GitHub Copilot documentation",
      publisher: "GitHub",
      url: "https://docs.github.com/en/copilot",
    },
    {
      title: "AI Risk Management Framework",
      publisher: "NIST",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
    },
    {
      title: "OWASP Top 10 for Large Language Model Applications",
      publisher: "OWASP",
      url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    },
  ],
};
