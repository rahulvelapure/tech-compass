import type { Article } from "../../types";

export const article: Article = {
  slug: "ai-agents-it-operations",
  category: "ai-enterprise-it",
  contentType: "analysis",
  subcategory: "Agents",
  title: "What AI agents can actually do in IT operations right now",
  metaDescription:
    "Where AI agents are useful in IT operations today, where they are not yet reliable, and the identity decision most teams skip when wiring one into production.",
  standfirst:
    "Most IT teams are not ready for autonomous operations. The immediate value is narrower and less exciting, which is precisely why it works.",
  excerpt:
    "Autonomous remediation is the pitch. The realistic near-term value is reducing repetitive investigation, summarising alerts and automating predictable fixes.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 3,
  primaryKeyword: "ai agents it operations",
  secondaryKeywords: ["AIOps reality", "AI for IT support", "agentic AI enterprise IT"],
  tags: ["AI", "Agents", "IT operations", "Automation"],
  reviewStatus: "opinion",
  relatedSlugs: ["model-context-protocol-explained", "eu-ai-act-obligations-timeline"],
  methodology:
    "Analysis based on published capability descriptions of current agent frameworks, the NIST AI Risk Management Framework and OWASP guidance for LLM applications, together with general practitioner experience of IT operations tooling. No benchmark results or product testing are claimed, and no specific product is assessed.",
  featured: true,
  body: [
    {
      type: "p",
      text: "The gap between what agent products demonstrate and what they can be trusted with is mostly a gap in state. An agent that can read a ticket, query a system and propose an action is genuinely useful. An agent that can change production configuration needs to be right about the current state of that system, and current state in most estates is spread across four tools that disagree with each other.",
    },
    {
      type: "p",
      text: "That is not a model capability problem and it will not be solved by a better model. It is the same data-quality problem that has defeated every previous attempt at automated remediation, and it is worth being explicit about because it determines which tasks are worth attempting first.",
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
    {
      type: "p",
      text: "What these have in common is that a wrong answer is visible and cheap. A bad summary is discarded by the person reading it. A misrouted ticket is re-routed. The cost of an error stays close to the error, which is the property that makes a task safe to delegate before you trust the system.",
    },
    { type: "h2", id: "does-not", text: "Where it does not work yet" },
    {
      type: "ul",
      items: [
        "Anything requiring a correct model of network or dependency topology that is not written down anywhere.",
        "Unsupervised remediation on systems where a wrong action is expensive and hard to reverse.",
        "Root-cause analysis across tools that do not share identifiers for the same asset.",
        "Anything where the agent's confidence is reported but its uncertainty is not — a confident wrong answer in an incident is worse than no answer, because it redirects the humans.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "The prerequisite is boring",
      text: "Agents inherit the quality of your asset inventory, identity model and documentation. Teams that get value from them almost always fixed those first — which is also why the value is often misattributed to the agent.",
    },
    {
      type: "h2",
      id: "identity",
      text: "The part that gets skipped: whose authority does it act with?",
    },
    {
      type: "p",
      text: "An agent that performs actions needs an identity, and the choice of identity determines what the audit trail is worth. A single powerful service principal shared by the agent is the easy implementation and the one that makes every subsequent question unanswerable: who asked for this, were they entitled to it, and would the action have been permitted if they had done it themselves? The same question returns at the protocol layer, which is why [Model Context Protocol deployments](/ai-enterprise-it/model-context-protocol-explained) push the authorisation decision onto the server rather than the model.",
    },
    {
      type: "table",
      caption: "Two identity models, and what each costs",
      head: ["Model", "What the log shows", "Practical consequence"],
      rows: [
        [
          "Shared service identity",
          "The agent did it",
          "Agent can exceed the requester's own permissions; audit needs a second correlated system",
        ],
        [
          "Requester's delegated authority",
          "Who asked, and what ran",
          "Agent cannot exceed the person; audit is answerable from one log",
        ],
      ],
    },
    {
      type: "p",
      text: "Delegated authority is more work and constrains what the agent can do for less-privileged users. That constraint is the feature. It means the agent cannot become a privilege-escalation path, which is otherwise exactly what a broadly-permissioned automation account becomes.",
    },
    { type: "h2", id: "how-to-start", text: "A reasonable way to start" },
    {
      type: "ol",
      items: [
        "Pick one repetitive investigation that a person performs several times a week and that has a written procedure.",
        "Have the agent produce the investigation output only — no actions — and compare against what the human concludes.",
        "Measure agreement over a few weeks. If agreement is not high on a task with a written procedure, it will not be high on anything harder.",
        "Only then allow the agent to execute the remediation, scoped to actions that are reversible and logged.",
        "Keep the comparison running after you stop reading it daily. Agreement drifts when the underlying systems change, and nothing will tell you unless you are still measuring.",
      ],
    },
    {
      type: "p",
      text: "The step most often skipped is the second one. Running an agent in observation mode produces no headline and feels like delay, but it is the only cheap way to find out whether the task is actually well-defined — and a surprising number turn out not to be, which is a finding worth having before anything is automated.",
    },
  ],
  faq: [
    {
      question: "Do AI agents reduce IT headcount?",
      answer:
        "There is no reliable evidence for that at present. The observable effect in most reported deployments is reallocation of time from investigation and writing to review and exception handling.",
    },
    {
      question: "What is the most common reason an agent pilot fails?",
      answer:
        "The underlying data. Agents depend on asset inventory, identity and documentation being accurate, and in most estates at least one of the three is not. The pilot then produces plausible answers that are wrong in ways that are hard to spot.",
    },
    {
      question: "Should an agent be allowed to make changes automatically?",
      answer:
        "Only for actions that are reversible, logged, and scoped narrowly enough that the worst outcome is acceptable without escalation. That set is small at first and should grow on evidence, not on confidence.",
    },
  ],
  sources: [
    {
      title: "NIST AI Risk Management Framework 1.0",
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
