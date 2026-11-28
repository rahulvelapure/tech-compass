import type { Article } from "../../types";

export const article: Article = {
  slug: "credentialed-agent-insider-threat",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "AI Agent Security",

  title:
    "The Credentialed Agent Is the New Insider Threat",

  seoTitle:
    "The Credentialed Agent Is the New Insider Threat",

  metaDescription:
    "Why valid credentials do not guarantee legitimate actions, and why AI agents need observability, governability and interruptibility at runtime.",

  standfirst:
    "For agentic AI, authentication establishes identity. It does not establish intent. The SAP and Mittwald incidents show why enterprises must govern what trusted agents do after authentication, not only which resources their credentials can reach.",

  excerpt:
    "SAP and Mittwald expose the gap between valid identity and legitimate action. This article explains three runtime controls AI agents need: observability, governability and interruptibility.",

  heroImage:
    "/images/articles/credentialed-agent-insider-threat.webp",

  heroImageAlt:
    "Pencil sketch showing a credentialed AI agent connected to trusted systems while one action crosses the expected control boundary.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-28",
  lastReviewedAt: "2026-11-28",
  nextReviewAt: "2026-12-28",

  readingMinutes: 14,

  primaryKeyword: "credentialed AI agent security",

  secondaryKeywords: [
    "MCP server security",
    "AI agent insider threat",
    "agent runtime security",
    "AI agent observability",
    "AI agent governability",
    "AI agent interruptibility",
    "AI agent credentials",
    "AI agent token security",
    "Model Context Protocol security",
    "behavioural governance for AI agents",
  ],

  tags: [
    "AI Agents",
    "Agentic AI",
    "MCP",
    "Identity Security",
    "Runtime Security",
    "Insider Threat",
    "Cybersecurity",
    "Token Security",
    "Security Operations",
    "CISO",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [],

  draft: false,

  methodology:
    "This article uses Mittwald primary incident disclosures, Cloud Security Alliance security research and carefully qualified secondary reporting on the SAP security incident. Confirmed facts, reported claims and analytical conclusions are separated throughout. Microsoft product-status references are time-sensitive and should be rechecked during future reviews. Visual in this article was generated with Microsoft Copilot.",

  body: [
    {
      type: "p",
      text: "For agentic AI, authentication establishes identity. It does not establish intent.",
    },
    {
      type: "p",
      text: "Two incidents in November 2026 made that distinction operational. SAP confirmed it had detected suspicious activity and taken measures to protect its environment. German hosting provider Mittwald separately disclosed that an attacker had entered through a flaw in its MCP server, read tokens the server used to act on behalf of users, and moved through customer projects for days before detection.",
    },
    {
      type: "p",
      text: "Both incidents expose a problem that authentication alone cannot solve. A valid credential or trusted integration can still become part of a harmful sequence of actions. Conventional identity controls cannot answer on their own whether a technically authorised action should be allowed to complete.",
    },
    {
      type: "p",
      text: "That question sits outside the scope of identity and access management. IAM verifies a principal and grants or denies access to a resource. It does not evaluate the sequence of actions a principal takes after access is granted, the context in which each action occurs, or whether the cumulative effect remains consistent with the principal's purpose.",
    },
    {
      type: "p",
      text: "For human users, this gap is partly covered by friction: hesitation, peer review and the social cost of suspicious behaviour. Agents that chain tool calls at machine speed and operate inside trusted execution paths have much less of that friction. From the control plane's perspective, a credentialed agent shares important characteristics with insider risk: legitimate access, trusted execution paths, valid credentials, and the ability to perform authorised actions for an unintended or unauthorised purpose.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The key distinction",
      text: "Authentication establishes who or what is acting. Runtime governance determines whether the specific action should be allowed to complete.",
    },

    {
      type: "h2",
      id: "sap-mittwald",
      text: "What we know about SAP and Mittwald",
    },
    {
      type: "h3",
      id: "sap",
      text: "SAP",
    },
    {
      type: "p",
      text: "SAP confirmed on 27 November 2026 that it had detected suspicious activity and taken immediate measures to protect customers and secure its services. The company said investigators had found no evidence of unauthorised access to customer business data at that stage.",
    },
    {
      type: "p",
      text: "Der Spiegel reported, citing a source, that attackers stole authentication tokens belonging to SAP employees and used them to alter and copy SAP-related source code hosted on GitHub. SAP has not publicly confirmed the token theft or the code changes. The affected repositories and the method of token theft have not been established in the public record.",
    },
    {
      type: "p",
      text: "Claims that attackers used AI agents in the SAP incident remain unconfirmed. Neither SAP nor a public technical disclosure has established a role for AI. The confirmed elements are the incident itself and the protective measures SAP described. The token theft, GitHub activity and AI attribution remain reported claims rather than primary-source-confirmed technical findings.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Keep the SAP attribution precise",
      text: "The SAP incident is confirmed. The reported token theft and GitHub activity have not been publicly confirmed by SAP, and AI-agent involvement remains unconfirmed.",
    },

    {
      type: "h3",
      id: "mittwald",
      text: "Mittwald",
    },
    {
      type: "p",
      text: "Mittwald's case is documented in the company's own postmortem and is technically more instructive.",
    },
    {
      type: "p",
      text: "Mittwald detected an attack on 4 November 2026. The company later established that the attacker had first tested a vulnerability in the MCP server on 21 October, began targeted exploitation on 27 October, and remained active until detection on 4 November, about eight days of dwell time. A second phase began on 9 November. During the night of 12 November, the attacker entered again through a previously unknown zero-day in the Neos CMS running the company's website.",
    },
    {
      type: "p",
      text: "In the first phase, Mittwald described a flaw in one of the MCP server's tools that allowed the attacker to execute arbitrary commands inside the server's container through shell injection. From there, the attacker read tokens the MCP server used to operate on behalf of users, including Mittwald employees.",
    },
    {
      type: "p",
      text: "With those tokens, the attacker created SSH users and API tokens in mStudio and copied configuration files and credentials from customer projects. The affected population was tied to the users of the MCP server and the projects their accounts could reach. Mittwald did not publish the complete code-level mechanics of the vulnerability.",
    },
    {
      type: "p",
      text: "The attacker did not need to compromise the downstream hosting platform directly. The MCP server already held tokens carrying the authority of the users it served. Reading those tokens gave the attacker a path into resources the integration was trusted to reach.",
    },
    {
      type: "p",
      text: "Mittwald described the speed of the attacker's movement between steps as a possible indication of AI-assisted tooling. The company also acknowledged that its evidence does not distinguish AI use from conventional automation. The confirmed technical facts are the shell injection, token exposure, downstream access and dwell time. The AI attribution is an inference, not a technical finding.",
    },

    {
      type: "h2",
      id: "mcp-privileged-integration",
      text: "Why an MCP server is a privileged integration, not a configuration detail",
    },
    {
      type: "p",
      text: "The Mittwald breach matters beyond one hosting provider because it exposes a mistake enterprise architecture can easily repeat. MCP servers may look like AI configuration: a convenient way to connect an assistant to a tool. The security boundary is much more significant.",
    },
    {
      type: "p",
      text: "An MCP server sits between an agent and a downstream system. It can broker or hold credentials. It exposes executable tools. It may act on behalf of multiple users with different access rights. When the integration is compromised, the attacker may not need to defeat every downstream identity separately. The attacker can target the credentials and trust relationships concentrated at the integration point.",
    },
    {
      type: "p",
      text: "This is what made the Mittwald architecture important. The server held tokens for users who had connected an assistant. Those tokens could support sensitive operations such as creating SSH users, issuing API tokens and reading project configuration. The effective blast radius was therefore defined by the resources the integration could reach.",
    },
    {
      type: "p",
      text: "Cloud Security Alliance research published in November 2026 describes related transport-trust problems in the MCP ecosystem. The research discusses cases where SDKs relied on insufficiently verified trust signals, where authorisation-server relationships required stronger validation, and where session or message isolation could fail between clients.",
    },
    {
      type: "p",
      text: "Updating vulnerable SDK versions is necessary when affected versions are present, but patching alone does not replace configuration. Operators also need to validate the expected issuer, enforce token audience checks, isolate sessions and understand exactly which credentials and downstream privileges an MCP server can broker.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Treat MCP servers as privileged integrations",
      text: "Inventory them, authenticate them, allowlist them, monitor them and review the credentials they can reach. An uncontrolled MCP server can become a privileged path into downstream systems.",
    },

    {
      type: "h2",
      id: "three-runtime-properties",
      text: "Three controls that begin where authentication ends",
    },
    {
      type: "p",
      text: "Once an agent has authenticated, the question changes. Identity controls can establish whether a principal may access a resource. Runtime governance must determine whether a particular action, in a particular context and sequence, should be allowed to complete.",
    },
    {
      type: "p",
      text: "Three engineering properties provide a useful model: observability, governability and interruptibility. Each addresses a different stage of the action lifecycle.",
    },

    {
      type: "h3",
      id: "observability",
      text: "Observability: Can we reconstruct exactly what the agent did?",
    },
    {
      type: "p",
      text: "Observability is more than sign-in logging. A sign-in record establishes that an identity authenticated. It does not necessarily show which tools the agent invoked, in what order, with what parameters, against which resources, using which token and on whose behalf.",
    },
    {
      type: "p",
      text: "Reconstructing agent behaviour requires a chain: agent identity, token, tool invocation, downstream resource and resulting action. Each link must be recorded and durable. If part of that chain is missing, investigators may know that an identity acted without being able to reconstruct why the action happened or what followed.",
    },
    {
      type: "p",
      text: "The public reporting around SAP demonstrates the problem from an investigative perspective. An incident is confirmed and token theft and source-code activity have been reported, yet the public record does not establish the full action sequence, affected repositories or token-theft mechanism. That uncertainty is exactly why action-level telemetry matters.",
    },
    {
      type: "p",
      text: "Many conventional identity logs focus on authentication events rather than complete tool-level and resource-level activity. Agent observability therefore needs deliberate correlation across identity, integration and application telemetry.",
    },

    {
      type: "h3",
      id: "governability",
      text: "Governability: Can we prevent a dangerous action at execution time?",
    },
    {
      type: "p",
      text: "Governability distinguishes runtime control from conventional IAM. IAM determines whether a principal possesses permission to access a resource. A runtime governance gate asks whether the specific action may commit under the current task, context and policy.",
    },
    {
      type: "p",
      text: "An execution-time gate could block a tool call that writes to production outside an approved change window. It could require human approval for a high-impact transaction. It could reject a request to widen an agent's authority. It could refuse tool use when the token, target resource or requested operation falls outside the approved context.",
    },
    {
      type: "p",
      text: "The important architectural principle is separation. The component deciding whether an action may complete should not be the same component deciding whether to attempt the action. A rule embedded only in the model's instructions is behavioural guidance. A security control needs an enforcement point outside the model's discretionary decision loop.",
    },
    {
      type: "p",
      text: "For a Mittwald-like scenario, a runtime gate evaluating token use against the requested resource, or requiring stronger authorisation before creation of new SSH users, could in principle limit downstream abuse after an integration is compromised. This is architectural analysis, not a claim about controls that Mittwald had deployed.",
    },
    {
      type: "p",
      text: "Likewise, in the reported SAP scenario, unusual token use against source-code modification could be a signal for an execution-time or detection decision. The point is not that a particular gate would certainly have prevented the incident. The point is that valid authentication alone cannot make that decision.",
    },

    {
      type: "h3",
      id: "interruptibility",
      text: "Interruptibility: Can we remove the agent's authority while it is operating?",
    },
    {
      type: "p",
      text: "Interruptibility is the ability to actually sever authority during execution. Terminating a visible process is not always enough if valid tokens, network paths, sessions or downstream credentials remain usable.",
    },
    {
      type: "p",
      text: "Asking an agent to stop is not a security boundary. An effective control operates outside the agent's decision loop. Depending on the architecture, that may mean revoking a token at the identity provider, disabling a credential, closing a network path, blocking an integration or terminating the execution environment.",
    },
    {
      type: "p",
      text: "Mittwald's containment response illustrates the principle. The company shut down the MCP server, revoked tokens, locked attacker-controlled accounts and isolated affected projects. Those are authority-severing actions rather than requests for the compromised path to behave differently.",
    },
    {
      type: "p",
      text: "The timing matters. If revoking an agent's authority takes longer than the fastest harmful action the agent can perform, the organisation may have a response procedure but not meaningful runtime interruptibility. The mechanism needs to be tested against realistic execution times.",
    },
    {
      type: "callout",
      variant: "note",
      title: "A simple runtime model",
      text: "Observability tells us what happened. Governability decides whether it may happen. Interruptibility lets us stop what is already happening.",
    },

    {
      type: "h2",
      id: "microsoft-runtime-controls",
      text: "The control plane is moving toward runtime intervention",
    },
    {
      type: "p",
      text: "Microsoft's Ignite 2026 security announcements point toward runtime intervention for agentic workloads. Microsoft Defender capabilities are expanding around detection and disruption of identity attacks involving AI agents. Microsoft Intune is adding controls around unapproved local agents, while Microsoft Purview is extending data-loss-prevention coverage toward local AI agents and developer-oriented agent tools.",
    },
    {
      type: "p",
      text: "Several of these capabilities remain in preview or are still rolling out. Product coverage, availability and operational maturity will change. That makes them useful signals of direction rather than a complete answer to the runtime-governance problem.",
    },
    {
      type: "p",
      text: "The broader architectural point is more important than any single product feature. Security platforms are moving from static identity decisions toward ongoing detection, policy enforcement and active disruption during an agent's execution.",
    },

    {
      type: "h2",
      id: "what-it-teams-should-do",
      text: "What IT teams should do now",
    },
    {
      type: "p",
      text: "These recommendations begin after authentication. They focus on what happens when an agent, integration or token is already inside a trusted path.",
    },

    {
      type: "h3",
      id: "immediate",
      text: "Immediate",
    },
    {
      type: "ul",
      items: [
        "Inventory MCP servers and other privileged integrations that agents can reach.",
        "For each integration, identify the tokens or credentials it holds or brokers.",
        "Map the downstream systems, repositories, projects and APIs reachable through those credentials.",
        "Prioritise agents with access to source-code platforms, identity systems, hosting administration, financial systems and other high-impact resources.",
        "Review token lifetime, audience, scope, rotation and storage for agent-related credentials.",
      ],
    },
    {
      type: "p",
      text: "The goal is to understand concentrated trust. A single integration can represent more risk than its own host because its credentials may cross project, account or system boundaries.",
    },

    {
      type: "h3",
      id: "short-term",
      text: "Short term",
    },
    {
      type: "ul",
      items: [
        "Detect anomalous token-use sequences, not only failed authentications.",
        "Authenticate and allowlist MCP servers used for enterprise workloads.",
        "Validate expected issuers and token audiences where the protocol and implementation support them.",
        "Isolate sessions so activity from one client cannot leak into another client's context.",
        "Pilot execution-time gating on a low-risk, high-volume workflow.",
        "Define which actions can proceed automatically and which require stronger policy checks or human approval.",
      ],
    },
    {
      type: "p",
      text: "A compromised agent or integration may authenticate successfully. The anomaly may appear only in what happens after authentication: an unusual workload using a token, an unexpected sequence of tool calls, a new target resource or a sensitive operation outside the workload's normal behaviour.",
    },

    {
      type: "h3",
      id: "strategic",
      text: "Strategic",
    },
    {
      type: "ul",
      items: [
        "Build and test an emergency authority-revocation mechanism.",
        "Measure how long it takes to revoke tokens, disable tool credentials, close network paths and terminate execution environments.",
        "Correlate agent, identity, token, tool, resource and action in telemetry.",
        "Keep the runtime policy decision outside the agent model.",
        "Assign every production agent a named owner responsible for purpose, permissions, integrations and retirement.",
      ],
    },
    {
      type: "p",
      text: "The telemetry model matters. Security teams should be able to move from a downstream action back through the tool, token and agent identity that caused it. Without that chain, investigations depend on inference and manual reconstruction.",
    },
    {
      type: "p",
      text: "Accountability also needs to exist before an incident. A production agent should have a human owner who can explain why the agent exists, which resources it needs, who approved its integrations and when its authority should be removed.",
    },

    {
      type: "h2",
      id: "what-remains-unresolved",
      text: "What remains unresolved",
    },
    {
      type: "p",
      text: "The Microsoft agent-security control surface is still developing. Preview features can change, and production detection coverage, operational cost and false-positive behaviour need to be evaluated in each environment rather than assumed from product announcements.",
    },
    {
      type: "p",
      text: "SAP may eventually disclose more technical detail about its November incident. Until that happens, the reported token theft, GitHub activity and AI-agent involvement should retain their current attribution rather than being promoted to confirmed technical facts.",
    },
    {
      type: "p",
      text: "MCP security is also evolving. Protocol improvements and SDK fixes matter, but deployment practice remains equally important. Expected-issuer configuration, audience validation, session isolation and credential scope determine whether the intended protections are active in a real environment.",
    },
    {
      type: "p",
      text: "The gap between protocol capability and deployment practice is a material attack surface to assess. It should not be treated as a prediction about which organisation will be attacked next.",
    },

    {
      type: "h2",
      id: "conclusion",
      text: "A valid credential is only the beginning of the security decision",
    },
    {
      type: "p",
      text: "Observability tells us what happened. Governability decides whether it may happen. Interruptibility lets us stop what is already happening.",
    },
    {
      type: "p",
      text: "SAP and Mittwald are useful operational examples of a wider structural problem. From the control plane's perspective, a sensitive agent or integration can share the characteristics that make insider risk difficult: legitimate access, trusted execution paths, valid credentials and the ability to perform authorised actions for an unintended or unauthorised purpose.",
    },
    {
      type: "p",
      text: "A valid credential does not make every subsequent action legitimate. The control that matters is not only whether the identity has permission, but whether this action, against this resource, in this sequence and at this moment, should be allowed to complete.",
    },
    {
      type: "p",
      text: "Organisations that build observability, governability and interruptibility into agent runtimes will be better placed to answer that question while an action is happening. Organisations that rely on identity controls alone may be left reconstructing the answer afterwards.",
    },

    {
      type: "h2",
      id: "faqs",
      text: "Frequently asked questions",
    },
  ],

  faq: [
    {
      question: "Why is a credentialed AI agent comparable to insider risk?",
      answer:
        "A credentialed agent can have legitimate access, valid tokens and trusted execution paths while still performing an action outside its intended purpose. The insider comparison describes these shared control characteristics; it does not mean every AI agent is literally an insider.",
    },
    {
      question: "Why is IAM not enough for AI agents?",
      answer:
        "IAM determines whether an identity may access a resource. It does not necessarily determine whether a particular sequence of authorised actions remains consistent with the agent's task or business purpose. Runtime controls need to evaluate and, where necessary, stop specific actions.",
    },
    {
      question: "What does observability mean for AI agents?",
      answer:
        "Observability means being able to reconstruct the chain from agent identity to token, tool invocation, downstream resource and resulting action. Sign-in logs alone usually provide only part of that picture.",
    },
    {
      question: "What is governability in agent security?",
      answer:
        "Governability is the ability to apply policy at execution time. A runtime gate can decide whether a specific tool call or high-impact operation should be allowed, denied or require additional approval before it commits.",
    },
    {
      question: "What is interruptibility?",
      answer:
        "Interruptibility is the ability to remove an agent's authority while it is operating. That can include revoking tokens, disabling credentials, blocking network access, shutting down an integration or terminating the execution environment.",
    },
    {
      question: "Why should MCP servers be treated as privileged integrations?",
      answer:
        "An MCP server can broker credentials, expose executable tools and reach downstream resources on behalf of users or agents. A compromise at that integration point can therefore affect resources beyond the MCP server itself.",
    },
    {
      question: "Was AI confirmed to be involved in the SAP incident?",
      answer:
        "No. SAP confirmed a security incident, but the reported token theft, GitHub activity and AI-agent involvement have not been publicly confirmed by SAP as technical findings. The article keeps those claims explicitly qualified.",
    },
    {
      question: "Was the Mittwald attacker confirmed to be using AI?",
      answer:
        "No. Mittwald described rapid attacker activity as a possible indication of AI-assisted tooling, while acknowledging that the evidence did not distinguish AI from conventional automation.",
    },
    {
      question: "What should IT teams do first?",
      answer:
        "Start by inventorying MCP servers and other agent integrations, mapping the credentials and downstream systems they can reach, and identifying agents with access to high-impact resources such as source code, identity administration, hosting management or financial systems.",
    },
  ],

  sources: [
    {
      title:
        "Postmortem: Wie ein Angreifer über unseren MCP-Server und Neos eindrang",
      publisher: "Mittwald",
      url:
        "https://www.mittwald.de/blog/mittwald/postmortem-wie-ein-angreifer-ueber-unseren-mcp-server-und-neos-eindrang",
    },
    {
      title:
        "Sicherheitsvorfall am MCP-Server: Was passiert ist, was wir wissen und wie wir damit umgehen",
      publisher: "Mittwald",
      url:
        "https://www.mittwald.de/blog/mittwald/sicherheitsvorfall-am-mcp-server",
    },
    {
      title:
        "MCP's Transport Trust Gap: Security Implications and Guidance",
      publisher: "Cloud Security Alliance",
      url:
        "https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-transport-trust-gap-20261109-csa-style/",
    },
    {
      title:
        "SAP Confirms Security Incident After Reported GitHub Token Theft and Code Alteration",
      publisher: "Mallory",
      url:
        "https://mallory.ai/stories/01a21b2f-3d0d-79d0-9366-edfbf4ab6a9e",
    },
    {
      title:
        "AI에 뚫렸나…유럽 1위 SW업체 SAP 보안사고",
      publisher: "Yonhap",
      url:
        "https://www.yna.co.kr/view/AKR20261127153300082",
    },
    {
      title:
        "Microsoft Ignite 2026: The Top 10 Security Announcements That Are Actually New",
      publisher: "Patriot Consulting",
      url:
        "https://www.patriotconsulting.com/blogs/2026/11/17/ignite-2026-top-10-new-security-announcements",
    },
  ],
};
