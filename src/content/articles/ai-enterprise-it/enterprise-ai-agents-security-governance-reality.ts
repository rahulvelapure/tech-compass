import type { Article } from "../../types";

export const article: Article = {
  slug: "enterprise-ai-agents-security-governance-reality",
  category: "ai-enterprise-it",
  contentType: "explainer",
  subcategory: "Agents",
  title: "An agent with tools is not a chatbot, and cannot be secured like one",
  seoTitle: "Enterprise AI agents: the security and governance reality",
  metaDescription:
    "Give a language model tools and prompt injection stops being a text problem. Delegated auth, isolated memory and guardrails that sit outside the model.",
  standfirst:
    "A chatbot that is tricked says something wrong. An agent that is tricked does something wrong.",
  excerpt:
    "Once a model can call tools, prompt injection becomes an action rather than a bad answer. Why static keys and shared memory fail, and where the guardrails have to sit.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "enterprise AI agents security",
  secondaryKeywords: [
    "AI agent governance",
    "prompt injection tool use",
    "OAuth on-behalf-of AI agent",
    "RAG data leakage",
    "AI agent audit logging",
  ],
  tags: ["AI", "Agents", "Security", "Governance", "Enterprise IT", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["ai-agents-it-operations", "model-context-protocol-explained"],
  methodology:
    "Written from the OWASP Top 10 for LLM Applications, the NIST AI Risk Management Framework, Microsoft identity platform documentation on the on-behalf-of flow, and the Model Context Protocol specification, verified August 2026. Attack patterns are described structurally rather than as exploit recipes. Controls are labelled as recommendations where no standard mandates them, which is most of them — this area has practice but little settled regulation.",
  body: [
    {
      type: "p",
      text: "A chatbot answers. An agent acts. That is the whole difference, and it changes what a security failure costs.",
    },
    {
      type: "p",
      text: "Give a model a set of tools and it can query a database, send mail, restart a job, reset a password. The pitch is obvious and often real. So is the problem: you have given the ability to act to something that can be talked into things.",
    },
    {
      type: "p",
      text: "This is not the same as granting a person access. A person can be held to a policy. A model produces likely output, and a well-written instruction buried in data it reads is exactly the kind of thing that shifts what is likely.",
    },
    { type: "h2", id: "where-boundary", text: "Where the security boundary actually is" },
    {
      type: "p",
      text: "An agent has four parts worth naming, because people tend to guard the wrong one.",
    },
    {
      type: "table",
      caption: "The parts of an agent, and what each one contributes to risk",
      head: ["Part", "What it is", "Risk it carries"],
      rows: [
        [
          "Orchestrator",
          "The model deciding what to do next",
          "Can be steered by anything it reads",
        ],
        ["Tools", "The functions it may call", "Each one is real capability"],
        [
          "Memory",
          "Conversation and stored context, often a vector store",
          "Leaks between users if shared",
        ],
        [
          "Execution environment",
          "Where tool calls actually run",
          "Blast radius when something goes wrong",
        ],
      ],
    },
    {
      type: "p",
      text: "The model is usually a managed service, and it is not where your boundary sits. The boundary is the line between the orchestrator and the tools. That is the point where a suggestion turns into an action, and it is the only place you can enforce anything reliably.",
    },
    { type: "h2", id: "auth", text: "Static keys are the first thing to remove" },
    {
      type: "p",
      text: "The quickest way to make an agent work is to hand it a service account and an API key. It is also the pattern that turns one prompt injection into a full compromise.",
    },
    {
      type: "p",
      text: "If the agent holds broad standing credentials, then anything that steers the agent inherits them. The attacker does not need the key itself. They only need the agent to make the call for them.",
    },
    {
      type: "p",
      text: "Two better patterns exist, and which you need depends on whether a human is present.",
    },
    {
      type: "ul",
      items: [
        "**On-behalf-of, when a user is driving.** The agent calls tools with a token carrying the user's identity and permissions. If that person cannot reset that password, neither can the agent while acting for them. Authorisation stays where it already is.",
        "**Short-lived scoped credentials, when nothing human is present.** A scheduled agent should request narrow credentials just before it acts and let them expire immediately after. Nothing long-lived should sit in its context, because its context is exactly what an attacker is trying to influence.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "The useful test",
      text: "Ask what the agent can do that the person asking cannot. If the answer is anything, you have granted standing privilege, and prompt injection is now a privilege escalation path rather than a nuisance.",
    },
    { type: "h2", id: "memory", text: "Shared memory leaks across users" },
    {
      type: "p",
      text: "Agents keep context so they can be useful across turns. Stored badly, that memory becomes a route between people who should not see each other's data.",
    },
    {
      type: "p",
      text: "The shape is easy to picture. An HR agent answers a salary question for one employee and stores a summary so it can be helpful later. Another employee asks a general question about pay for their role. If retrieval searches one shared pool, the first answer is a plausible match, and it goes into the prompt.",
    },
    {
      type: "p",
      text: "Nothing was hacked. The retrieval worked exactly as built. That is what makes this class of fault easy to ship and hard to notice.",
    },
    {
      type: "p",
      text: "Treat the vector store as a database, because it is one. Filter by the current user's identity before retrieval, not after generation. Row-level or attribute-based rules belong here for the same reasons they belong in SQL, and a model asked politely not to reveal something is not an access control.",
    },
    { type: "h2", id: "injection", text: "Prompt injection, once tools exist" },
    {
      type: "p",
      text: "Prompt injection means input crafted to override the instructions an agent was given. In a chatbot the result is a bad answer. In an agent it is a tool call.",
    },
    {
      type: "p",
      text: "The important variant is indirect. The hostile text does not come from the person typing. It arrives inside something the agent reads — a log file, a ticket, a page it fetched, a document in the knowledge base. The user never sees it and has done nothing wrong.",
    },
    {
      type: "p",
      text: "This is why guardrails written as instructions do not hold. You are asking the model to reliably ignore a well-crafted instruction, which is the one thing it is built to be good at following.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Enforce outside the model, or not at all",
      text: "Any control that lives in the system prompt is advisory. Controls that hold are the ones a compromised orchestrator cannot reach: authorisation checked by the tool itself, a sandbox that cannot run arbitrary commands, and a human approving anything destructive.",
    },
    {
      type: "p",
      text: "Three things carry the weight in practice.",
    },
    {
      type: "ol",
      items: [
        "**The tool validates independently.** A tool must authorise its caller on its own terms, rather than assuming the agent had a good reason. It is an API, and it should behave like one exposed to the internet.",
        "**High-risk actions are proposed, not performed.** Anything destructive, external-facing or touching personal data should produce a proposal a human approves. This is slower, and it is the control that survives a bad day.",
        "**Parameters are constrained.** If a tool wants an identifier, it should receive an identifier and nothing else. Free-form strings reaching a shell are the difference between a bad answer and an incident.",
      ],
    },
    { type: "h2", id: "scenario", text: "How this composes" },
    {
      type: "p",
      text: "An engineering team gives an agent broad access to a cloud environment so it can read logs and restart failed pipeline jobs. Convenient, and the access is granted once so nobody revisits it.",
    },
    {
      type: "p",
      text: "A developer pastes a failing build log into the chat. Inside that log, from an earlier compromised step, sits text addressed to whatever reads it — instructions to copy a storage bucket somewhere else.",
    },
    {
      type: "p",
      text: "The agent has a shell tool and broad standing credentials. It follows the instruction. The developer asked about a build failure and set off data exfiltration, and the audit trail shows the agent's own service account doing it.",
    },
    {
      type: "p",
      text: "Every control above would have broken the chain somewhere. Scoped credentials limit what the call can reach. A sandbox without arbitrary shell access removes the mechanism. Approval on anything moving data stops it at the last step. No single one is sufficient, which is the actual argument for having several.",
    },
    { type: "h2", id: "governance", text: "What governance has to cover" },
    {
      type: "p",
      text: "Agents proliferate quietly, because building one is now a small piece of work. Four things are worth mandating before that happens rather than after.",
    },
    {
      type: "ul",
      items: [
        "**An inventory.** Every agent registered with its purpose, its tools and its data scope. You cannot review what nobody listed.",
        "**Tool vetting.** A new tool is a new capability, and it needs a security review of its own — authorisation, rate limits, and what it can destroy.",
        "**Audit logging.** The prompt, the reasoning, the tool called, the parameters and the result. Without the parameters you cannot answer what happened, which is the only question anyone asks afterwards.",
        "**Adversarial testing.** Test specifically for injection through data the agent reads, not only through what a user types. That is the path that gets missed.",
      ],
    },
    {
      type: "p",
      text: "Where tools are exposed through a standard interface, the same questions apply to the interface itself — [what the Model Context Protocol actually standardises](/ai-enterprise-it/model-context-protocol-explained) is worth understanding before wiring one in.",
    },
    { type: "h2", id: "when", text: "When an agent is the wrong answer" },
    {
      type: "table",
      caption: "A readiness check, not a maturity model",
      head: ["Reasonable when", "Not yet when"],
      rows: [
        [
          "The task is well defined and repetitive",
          "The task needs guaranteed correctness every time",
        ],
        [
          "Authorisation already exists on the underlying data",
          "Access control on the data is weak or absent",
        ],
        [
          "You can approve high-risk actions by hand",
          "The goal is removing human oversight entirely",
        ],
        ["You can log and replay what happened", "Nobody would notice a wrong action for days"],
      ],
    },
    {
      type: "p",
      text: "That second column is not a permanent no. It is a list of things to fix first, and most of them are worth fixing regardless of whether an agent ever ships.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Remove standing credentials. Use on-behalf-of where a person is present, and short-lived scoped credentials where one is not.",
        "Treat memory as a database with access rules, and filter retrieval by identity before it reaches the prompt.",
        "Put authorisation in the tool, never in the system prompt.",
        "Make destructive actions proposals that a human approves.",
        "Log parameters, not just outcomes, and test injection through data the agent reads.",
      ],
    },
    {
      type: "p",
      text: "None of this argues against agents. The narrower uses are already worth having, and [what agents can realistically do in IT operations](/ai-enterprise-it/ai-agents-it-operations) covers where the value is today. It argues for putting the controls at the tool boundary rather than in the prompt, because that is the only boundary an attacker cannot talk their way past.",
    },
  ],
  faq: [
    {
      question: "How is an AI agent different from a chatbot?",
      answer:
        "A chatbot writes text. An agent can call tools, so it can change things. That is why a trick that only caused a bad answer can now cause a bad action.",
    },
    {
      question: "What is indirect prompt injection?",
      answer:
        "Hostile instructions hidden in something the agent reads, such as a log, a ticket or a web page. The user never sees it and did nothing wrong, which is what makes it hard to spot.",
    },
    {
      question: "Can I stop injection by telling the model to ignore it?",
      answer:
        "No. That control lives in the prompt, and the prompt is what the attacker is aiming at. Put the check in the tool, where a steered model cannot reach it.",
    },
    {
      question: "Why can agent memory leak data between users?",
      answer:
        "Because it is one shared store unless you make it otherwise. Filter what you retrieve by who is asking, before it goes into the prompt. Treat it like any other database.",
    },
    {
      question: "Should an agent use a service account?",
      answer:
        "Not a broad one. If the agent can do more than the person asking, injection becomes a way to raise privilege. Act for the user, or use short-lived scoped credentials.",
    },
  ],
  sources: [
    {
      title: "OWASP Top 10 for Large Language Model Applications",
      publisher: "OWASP",
      url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    },
    {
      title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
      publisher: "NIST",
      url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    },
    {
      title: "Microsoft identity platform and OAuth 2.0 On-Behalf-Of flow",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-on-behalf-of-flow",
    },
    {
      title: "Model Context Protocol specification",
      publisher: "Anthropic",
      url: "https://modelcontextprotocol.io/specification",
    },
    {
      title: "Secure development and deployment guidance for AI systems",
      publisher: "NCSC",
      url: "https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development",
    },
  ],
};
