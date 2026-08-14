import type { Article } from "../../types";

export const article: Article = {
  slug: "ai-agents-it-operations",
  category: "ai-enterprise-it",
  contentType: "analysis",
  subcategory: "Agents",
  title: "What AI agents can actually do in IT operations right now",
  metaDescription:
    "An assessment of where AI agents are useful in IT operations today — triage, summarisation and predictable remediation — and where they are not yet reliable.",
  standfirst:
    "Most IT teams are not ready for autonomous operations. The immediate value is narrower and less exciting, which is precisely why it works.",
  excerpt:
    "Autonomous remediation is the pitch. The realistic near-term value is reducing repetitive investigation, summarising alerts and automating predictable fixes.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-04",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "ai agents it operations",
  secondaryKeywords: ["AIOps reality", "AI for IT support", "agentic AI enterprise IT"],
  tags: ["AI", "Agents", "IT operations", "Automation"],
  reviewStatus: "opinion",
  methodology:
    "Analysis based on vendor documentation, published capability descriptions of current agent frameworks, and general practitioner experience with IT operations tooling. No benchmark results or product testing are claimed.",
  featured: true,
  body: [
    {
      type: "p",
      text: "The gap between what agent products demonstrate and what they can be trusted with is mostly a gap in state. An agent that can read a ticket, query a system and propose an action is genuinely useful. An agent that can change production configuration needs to be right about the current state of that system, and current state in most estates is spread across four tools that disagree with each other.",
    },
    { type: "h2", id: "works-now", text: "Where it works now" },
    {
      type: "ul",
      items: [
        "Alert and incident summarisation. Turning forty correlated alerts into one readable description of what changed is low-risk and saves real time.",
        "First-pass triage. Classifying, tagging and routing tickets, and attaching the relevant runbook, with a human accepting or rejecting.",
        'Retrieval over internal documentation. Answering "how do we do X here" against your own runbooks rather than the public internet.',
        "Drafting the boring artefacts: change records, post-incident timelines, customer-facing status updates.",
      ],
    },
    { type: "h2", id: "does-not", text: "Where it does not work yet" },
    {
      type: "ul",
      items: [
        "Anything requiring a correct model of network or dependency topology that is not written down anywhere.",
        "Unsupervised remediation on systems where a wrong action is expensive and hard to reverse.",
        "Root-cause analysis across tools that do not share identifiers for the same asset.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "The prerequisite is boring",
      text: "Agents inherit the quality of your asset inventory, identity model and documentation. Teams that get value from them almost always fixed those first — which is also why the value is often misattributed to the agent.",
    },
    { type: "h2", id: "how-to-start", text: "A reasonable way to start" },
    {
      type: "ol",
      items: [
        "Pick one repetitive investigation that a person performs several times a week and that has a written procedure.",
        "Have the agent produce the investigation output only — no actions — and compare against what the human concludes.",
        "Measure agreement over a few weeks. If agreement is not high on a task with a written procedure, it will not be high on anything harder.",
        "Only then allow the agent to execute the remediation, scoped to actions that are reversible and logged.",
      ],
    },
  ],
  faq: [
    {
      question: "Do AI agents reduce IT headcount?",
      answer:
        "There is no reliable evidence for that at present. The observable effect in most reported deployments is reallocation of time from investigation and writing to review and exception handling.",
    },
  ],
};
