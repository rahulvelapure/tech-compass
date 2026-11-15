import type { Article } from "../../types";

export const article: Article = {
  slug: "ai-agent-permissions-task-scoped-access",
  category: "ai-enterprise-it",
  contentType: "analysis",
  subcategory: "AI governance",

  title:
    "AI Agents Should Not Inherit Your Permissions: A Practical Model for Task-Scoped Access",

  seoTitle:
    "AI Agent Permissions: A Task-Scoped Enterprise Security Model",

  metaDescription:
    "A practical enterprise model for AI agent permissions, covering separate identities, task-scoped access, human approval, runtime controls and revocation.",

  standfirst:
    "An AI agent should have the access it needs for one task, not the full access of the person who asked it to help. That requires separate identity, short-lived authority, tool controls, approval boundaries and a tested way to stop the agent.",

  excerpt:
    "AI agents can read data, call tools and take actions across enterprise systems. Giving them a user's full standing permissions creates unnecessary risk. This analysis presents a task-scoped access model built around distinct agent identity, least privilege, short-lived authority, human approval, runtime containment, auditability and automatic expiry.",

  heroImage:
    "/images/articles/ai-agent-permissions-task-scoped-access.webp",

  heroImageAlt:
    "Task-scoped AI agent access separating the human requester, agent identity, short-lived authorization, controlled tools and runtime security boundaries.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-15",
  lastReviewedAt: "2026-11-15",
  nextReviewAt: "2027-02-15",

  readingMinutes: 13,

  primaryKeyword: "AI agent permissions",

  secondaryKeywords: [
    "AI agent access control",
    "task-scoped permissions",
    "AI agent identity",
    "AI agent least privilege",
    "AI agent governance",
    "AI agent authorization",
    "AI agent human approval",
    "AI agent runtime security",
    "zero standing privilege",
    "AI agent audit logging",
  ],

  tags: [
    "AI Agents",
    "AI Security",
    "Identity Security",
    "Least Privilege",
    "Zero Trust",
    "AI Governance",
    "Access Control",
    "Enterprise AI",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "ai-coding-agent-supply-chain-backdoors",
    "ai-coding-assistants-enterprise",
    "ai-agents-it-operations",
    "model-context-protocol-explained",
  ],

  draft: false,

  methodology:
    "This article combines public guidance from Microsoft, NIST, OWASP and CISA with independent enterprise security analysis. It separates stable agent identity from temporary authorization and treats user authority as the maximum delegation boundary rather than the permissions an agent should automatically inherit. Product capabilities and terminology should be rechecked against current public documentation before publication. The practical access model, examples, tables, rollout plan and governance recommendations are editorial analysis rather than claims that one vendor currently implements every control described.",

  body: [
    {
      type: "p",
      text: "Imagine asking an AI agent to find an invoice, check its value against a purchase order and draft a payment request. The task appears narrow, but the employee requesting the work may already have access to mail, shared finance records, supplier information and payment systems that the agent does not need. The task appears narrow, but the employee requesting the work may already have access to mail, shared finance records, supplier information and payment systems that the agent does not need.",
    },
    {
      type: "p",
      text: "The task sounds safe.",
    },
    {
      type: "p",
      text: "But the employee requesting the work may also be able to read a mailbox, open shared finance files, export supplier data, update vendor records and approve payments within a defined threshold.",
    },
    {
      type: "p",
      text: "Should the agent receive all of those permissions simply because the employee already has them?",
    },
    {
      type: "p",
      text: "Now add another problem. One of the documents the agent reads contains a malicious instruction telling it to ignore the user's request and send sensitive information to an external destination.",
    },
    {
      type: "p",
      text: "The risk is no longer only what the model can say. It is what the agent can do with the authority available to it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The rule to remember",
      text: "An AI agent should have the access it needs for one task, not the full access of the person who asked it to help.",
    },
    {
      type: "p",
      text: "The employee's authority should set the maximum delegation boundary. The agent's actual authority should normally be narrower: specific to the task, resources, actions, tools and time required.",
    },
    {
      type: "p",
      text: "That distinction becomes increasingly important as enterprise agents move from retrieving information to taking actions.",
    },

    {
      type: "h2",
      id: "authority-not-intelligence",
      text: "The security problem is authority, not intelligence",
    },
    {
      type: "p",
      text: "Most organisations already know how to give employees access. IT places users into groups, assigns roles and applies policies. Much of that access remains available for months or years because the employee's job requires continuing authority.",
    },
    {
      type: "p",
      text: "Agents work differently. One request can create a chain of actions across several systems.",
    },
    {
      type: "p",
      text: "An agent may read a document, query an API, compare records, update a ticket and send a message during one task.",
    },
    {
      type: "p",
      text: "If the agent starts with broad permissions, a bad decision can have a broad impact. The cause might be a configuration mistake, an unexpected model decision, a compromised tool or hostile content encountered during the task.",
    },
    {
      type: "p",
      text: "Prompt injection is particularly important because an agent may consume instructions from emails, web pages, documents or tool responses that nobody intended to become trusted commands.",
    },
    {
      type: "p",
      text: "Access control does not prevent every prompt-injection attack. It limits what the agent can do when something goes wrong.",
    },
    {
      type: "p",
      text: "That is the right security boundary. The model may propose an action. A deterministic system outside the model should decide whether the action is permitted.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Instructions are not authorization",
      text: "Natural-language instructions describe the task. They should not grant the agent additional permissions.",
    },

    {
      type: "h2",
      id: "user-vs-agent-authority",
      text: "User authority is not agent authority",
    },
    {
      type: "p",
      text: "A human employee may legitimately need broad access because one role contains many responsibilities. An agent usually receives a much narrower objective.",
    },
    {
      type: "p",
      text: "If a finance analyst can update supplier records, review invoices and approve certain payments, that does not mean an invoice-review agent should inherit all three abilities.",
    },
    {
      type: "p",
      text: "The human's authority should define what can potentially be delegated. The task then defines what the agent actually receives.",
    },
    {
      type: "p",
      text: "The difference can be represented simply: employee authority is the maximum boundary, task policy narrows that boundary, and agent authority is the resulting permission set.",
    },
    {
      type: "p",
      text: "This also matters for investigation. If the employee and agent become indistinguishable in logs, security teams may know whose account was involved but not which software actor actually performed the action.",
    },
    {
      type: "p",
      text: "The architecture should therefore preserve both identities whenever the platform supports it: the principal that requested the work and the agent that executed it.",
    },

    {
      type: "h2",
      id: "task-scoped-access",
      text: "What task-scoped access actually means",
    },
    {
      type: "p",
      text: "Task-scoped access links authority to a clearly defined piece of work rather than a general role.",
    },
    {
      type: "p",
      text: "Before execution begins, define six things.",
    },
    {
      type: "ul",
      items: [
        "Who: Which agent will perform the work, and who owns or sponsors it?",
        "Why: What business task has been approved?",
        "Where: Which application, folder, record, API or system may it reach?",
        "What: May it read, create, change, send, approve or delete?",
        "Whose authority: Which person or business process authorised the task, and what is the maximum authority that may be delegated?",
        "How long: When does the authorization expire?",
      ],
    },
    {
      type: "p",
      text: "Think of this like a visitor pass. A visitor who needs one meeting room does not receive the master key to the entire office.",
    },
    {
      type: "p",
      text: "An agent should work the same way.",
    },
    {
      type: "table",
      caption: "A task-scoped model for an invoice-review agent",
      head: [
        "Task",
        "Agent authority",
        "Authority not granted",
      ],
      rows: [
        [
          "Find invoice",
          "Read approved invoice repository",
          "Read entire Finance workspace",
        ],
        [
          "Check invoice value",
          "Read required invoice fields",
          "Modify invoice",
        ],
        [
          "Compare purchase order",
          "Read matching PO record",
          "Procurement administration",
        ],
        [
          "Draft payment request",
          "Create draft only",
          "Send or approve payment",
        ],
        [
          "Change supplier bank details",
          "None",
          "Write access",
        ],
        [
          "Execute payment",
          "None by default",
          "Employee payment authority",
        ],
        [
          "Export supplier information",
          "Explicit approval only",
          "General export capability",
        ],
      ],
    },
    {
      type: "p",
      text: "Can use Finance is too broad. Can read these invoice records for this reconciliation task until 11:30 is much closer to task-scoped authority.",
    },

    {
      type: "h2",
      id: "distinct-agent-identity",
      text: "Give every production agent a distinct identity",
    },
    {
      type: "p",
      text: "Every production agent should be identifiable.",
    },
    {
      type: "p",
      text: "Give it a clear identity, business purpose, sponsor and technical owner. Do not hide unrelated agents behind one shared account simply because that is easier to configure.",
    },
    {
      type: "p",
      text: "A distinct identity improves investigation, policy enforcement and lifecycle management. Security teams can see which agent acted, review its access and disable the affected agent without necessarily disabling every other automation or the user who initiated the task.",
    },
    {
      type: "p",
      text: "There is an important distinction here: stable identity does not require permanent high privilege.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Keep the identity. Make the authority short-lived.",
      text: "An agent can retain one persistent identity while additional permissions, tokens and approvals are issued only for approved tasks and expire automatically.",
    },

    {
      type: "h2",
      id: "delegated-and-autonomous",
      text: "Delegated and autonomous agents need different access models",
    },
    {
      type: "p",
      text: "Some agents act for a signed-in employee. Others operate without a human present. A third pattern may require a user-like account because the agent needs access to a mailbox, chat presence or another resource designed around user identity.",
    },
    {
      type: "p",
      text: "Those are not interchangeable security models.",
    },
    {
      type: "p",
      text: "For delegated work, logs should preserve both the user's authority and the agent acting under that authority.",
    },
    {
      type: "p",
      text: "For autonomous work, the agent or workload identity needs its own permission model, credential lifecycle and ownership.",
    },
    {
      type: "p",
      text: "If an agent also has a user-like account, security teams must understand which policies apply to the agent identity and which apply to the user account. Protecting one does not automatically prove that every path is protected.",
    },
    {
      type: "p",
      text: "The practical inventory should record the token subject, agent identity, sponsor, credential type, downstream audience, permissions and whether the agent becomes indistinguishable from the user at any stage.",
    },

    {
      type: "h2",
      id: "zero-standing-privilege",
      text: "Start with zero standing privilege",
    },
    {
      type: "p",
      text: "A strong long-term goal is zero standing privilege for elevated agent authority.",
    },
    {
      type: "p",
      text: "That does not mean the agent has zero capability. It means powerful access does not remain available simply because the agent might need it later.",
    },
    {
      type: "p",
      text: "A helpdesk agent may retain permission to read approved device information and create support tickets. It should not retain the ability to delete devices or change security policy while waiting for the next request.",
    },
    {
      type: "p",
      text: "When additional authority is required, the agent requests it. Policy evaluates the task, actor, resource, action and context. The resulting grant should be narrow, short-lived and revocable.",
    },
    {
      type: "p",
      text: "The permission should expire because the task ended, not because somebody remembered to remove it.",
    },

    {
      type: "h2",
      id: "limit-tools",
      text: "Limit tools as carefully as permissions",
    },
    {
      type: "p",
      text: "Agent access is not limited to identity roles.",
    },
    {
      type: "p",
      text: "An agent may have access to APIs, connectors, MCP servers, browser sessions, local files, shell commands, cloud services and other tools.",
    },
    {
      type: "p",
      text: "A helpdesk agent might need to read device information and create a ticket. It does not therefore need a tool that can delete users, run arbitrary PowerShell or change Conditional Access.",
    },
    {
      type: "p",
      text: "Tool discovery itself should also be controlled. Giving an agent dozens of powerful tools and relying on the model's instructions not to use them is not a strong security boundary.",
    },
    {
      type: "p",
      text: "The application or enforcement point receiving the request should check whether the agent is allowed to perform that action. The agent should not authorize itself.",
    },
    {
      type: "p",
      text: "The same principle applies when tools are exposed through agent protocols. Our [Model Context Protocol analysis](/ai-enterprise-it/model-context-protocol-explained) shows why standardising tool discovery does not remove the need for authorization at the tool boundary.",
    },

    {
      type: "h2",
      id: "human-approval",
      text: "Human approval belongs at high-impact boundaries",
    },
    {
      type: "p",
      text: "Requiring approval for every tool call would make most agents impractical. Requiring no approval for consequential actions would create unnecessary risk.",
    },
    {
      type: "p",
      text: "The useful model is risk-based.",
    },
    {
      type: "table",
      caption: "Example approval model",
      head: [
        "Action",
        "Default treatment",
      ],
      rows: [
        [
          "Read approved record",
          "Agent may act",
        ],
        [
          "Summarise approved data",
          "Agent may act",
        ],
        [
          "Create draft",
          "Agent may act",
        ],
        [
          "Update low-risk record",
          "Policy-dependent",
        ],
        [
          "Send externally",
          "Human approval",
        ],
        [
          "Delete data",
          "Human approval or separate process",
        ],
        [
          "Change permissions",
          "Privileged approval",
        ],
        [
          "Execute payment",
          "Independent financial approval",
        ],
        [
          "Deploy to production",
          "Approved deployment workflow",
        ],
      ],
    },
    {
      type: "p",
      text: "The approval should apply to the exact proposed action.",
    },
    {
      type: "p",
      text: "Approve the agent is weak. Approve this agent to update supplier X from bank account A to bank account B for invoice INV-7721 before 14:00 is far more meaningful.",
    },
    {
      type: "p",
      text: "The approval screen should show the target, change, reason, identity, authority being used and important side effects. Otherwise human approval becomes another click-through warning.",
    },

    {
      type: "h2",
      id: "dynamic-risk",
      text: "Permissions should change when risk changes",
    },
    {
      type: "p",
      text: "Access should not always remain static for the entire task.",
    },
    {
      type: "p",
      text: "An agent may begin in a low-risk state and later encounter hostile content, request an unexpected tool, access a new resource or deviate from the approved objective.",
    },
    {
      type: "p",
      text: "The security response should be able to change with that context.",
    },
    {
      type: "ol",
      items: [
        "Log the unusual behaviour and continue.",
        "Increase monitoring.",
        "Remove external-send capability.",
        "Reduce write access to read-only.",
        "Require human approval for subsequent actions.",
        "Revoke the task-scoped grant.",
        "Isolate the runtime.",
        "Stop the agent.",
      ],
    },
    {
      type: "p",
      text: "This is an important difference between normal least privilege and dynamic agent authorization. The safest permission set at the beginning of a task may not remain safe after the context changes.",
    },
    {
      type: "p",
      text: "Current public guidance from Microsoft and NIST points toward short-lived authorization, continuous risk evaluation, action-level enforcement and rapid revocation. Availability and implementation differ by product and access pattern, so teams should verify the controls supported by their identity platform, agent framework and downstream applications.",
    },

    {
      type: "h2",
      id: "runtime-containment",
      text: "Identity controls are not runtime containment",
    },
    {
      type: "p",
      text: "Restricting a cloud token does not control everything an agent can do inside its execution environment.",
    },
    {
      type: "p",
      text: "A desktop or coding agent may be able to reach local files, processes, browser sessions, network destinations, local credentials, shell commands or plugins.",
    },
    {
      type: "p",
      text: "That requires a second layer of control.",
    },
    {
      type: "p",
      text: "Runtime containment can restrict which files the agent can see, which processes it can start, which network destinations it can reach and which system resources are available.",
    },
    {
      type: "p",
      text: "This is particularly important for coding agents. Our [AI coding-agent supply-chain analysis](/ai-enterprise-it/ai-coding-agent-supply-chain-backdoors) shows why a model-integrity problem becomes much more serious when the agent can execute commands, reach repositories or access credentials.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Two different security boundaries",
      text: "Identity limits which doors an agent can open. Runtime containment limits where the agent can move after entering.",
    },

    {
      type: "h2",
      id: "data-controls",
      text: "Read-only access can still leak data",
    },
    {
      type: "p",
      text: "Read-only is often treated as low risk. That is not always true for an AI agent.",
    },
    {
      type: "p",
      text: "An agent may read thousands of records, combine sensitive fields, generate a concise summary and send that output somewhere the original source system would never have allowed a bulk export.",
    },
    {
      type: "p",
      text: "No source record was modified. Sensitive data still left the expected control boundary.",
    },
    {
      type: "p",
      text: "Agent security therefore needs to consider retrieval volume, data classification, model context, memory, generated output, tool parameters, network destinations and retention.",
    },
    {
      type: "p",
      text: "The permission to read data and the permission to send derived information should be treated as separate capabilities.",
    },

    {
      type: "h2",
      id: "audit-chain",
      text: "Audit the action chain, not only the conversation",
    },
    {
      type: "p",
      text: "A chat transcript is useful evidence. It is not a complete audit trail for an agent that can execute tools.",
    },
    {
      type: "table",
      caption: "Evidence an enterprise agent should leave behind",
      head: [
        "Evidence",
        "Question answered",
      ],
      rows: [
        [
          "Initiating principal",
          "Who requested the task?",
        ],
        [
          "Agent identity and version",
          "What software actor executed it?",
        ],
        [
          "Task mandate",
          "What outcome was authorised?",
        ],
        [
          "Permission grant",
          "What authority was issued?",
        ],
        [
          "Policy decision",
          "Why was the action allowed or denied?",
        ],
        [
          "Tool call and parameters",
          "What exactly was attempted?",
        ],
        [
          "Approval record",
          "Who approved the high-risk action?",
        ],
        [
          "Resource response",
          "What actually changed?",
        ],
        [
          "Expiry or revocation",
          "When did the authority end?",
        ],
      ],
    },
    {
      type: "p",
      text: "This evidence should survive independently of the agent session. Otherwise an organisation may know what the model said but not what the system actually did.",
    },

    {
      type: "h2",
      id: "incident-response",
      text: "Test the stop button",
    },
    {
      type: "p",
      text: "The difficult agent incident may not involve stolen credentials. The identity may be legitimate, the token may be valid, and the action may still be wrong.",
    },
    {
      type: "p",
      text: "That changes incident response.",
    },
    {
      type: "ol",
      items: [
        "Stop or isolate the active runtime.",
        "Revoke the task-scoped authorization.",
        "Revoke downstream tokens where supported.",
        "Disable the affected agent identity without unnecessarily disabling the sponsoring employee.",
        "Preserve prompts, retrieved content, tool calls, approvals, policy decisions and outputs.",
        "Identify changed resources and external communications.",
        "Check whether sub-agents, tools or downstream systems received delegated authority.",
        "Restore affected data or configuration.",
        "Correct the policy, tool or workflow that allowed the action.",
        "Reactivate only after the affected path has been reviewed.",
      ],
    },
    {
      type: "p",
      text: "One of the best architecture tests is therefore simple: can we stop this agent without stopping the employee or every other agent?",
    },

    {
      type: "h2",
      id: "helpdesk-example",
      text: "A practical IT-helpdesk example",
    },
    {
      type: "p",
      text: "Consider an employee who reports that a managed laptop cannot connect to the corporate network.",
    },
    {
      type: "p",
      text: "An AI helpdesk agent can gather useful information and create a support incident. A poor implementation might also give the agent broad rights over user accounts, devices and management policies.",
    },
    {
      type: "p",
      text: "That is unnecessary.",
    },
    {
      type: "table",
      caption: "Task-scoped authority for an IT-helpdesk agent",
      head: [
        "Helpdesk task",
        "Agent authority",
        "Human or privileged control",
      ],
      rows: [
        [
          "Read device model",
          "Read only",
          "No",
        ],
        [
          "Check compliance status",
          "Read only",
          "No",
        ],
        [
          "Check last management sync",
          "Read only",
          "No",
        ],
        [
          "Search knowledge base",
          "Read only",
          "No",
        ],
        [
          "Create incident",
          "Create ticket",
          "No",
        ],
        [
          "Trigger approved device sync",
          "Limited action",
          "Policy dependent",
        ],
        [
          "Reset authentication method",
          "No standing access",
          "Human approval",
        ],
        [
          "Retire device",
          "No standing access",
          "Human approval",
        ],
        [
          "Delete device",
          "Denied by default",
          "Separate admin process",
        ],
        [
          "Change Intune policy",
          "No access",
          "Privileged admin workflow",
        ],
        [
          "Change Conditional Access",
          "No access",
          "Privileged identity workflow",
        ],
      ],
    },
    {
      type: "p",
      text: "The agent can solve routine problems and gather evidence without turning itself into an IT administrator.",
    },
    {
      type: "p",
      text: "That is the goal: useful autonomy with a clear limit on harm.",
    },

    {
      type: "h2",
      id: "agent-lifecycle",
      text: "Every agent needs an owner and an end-of-life process",
    },
    {
      type: "p",
      text: "Agent governance does not end after deployment.",
    },
    {
      type: "p",
      text: "Every production agent should have a business sponsor, technical owner, purpose, approved tools, approved data, permission model, runtime, review date and retirement condition.",
    },
    {
      type: "p",
      text: "An agent should not survive indefinitely because the employee who built it left and nobody knows whether it is still important.",
    },
    {
      type: "p",
      text: "Offboarding should be triggered when the business purpose, project, process, supplier relationship or supporting application ends.",
    },
    {
      type: "p",
      text: "The same lifecycle model should remove credentials, permissions, tool connections, runtime resources and stored data associated with the agent.",
    },

    {
      type: "h2",
      id: "thirty-day-plan",
      text: "A 30-day enterprise agent-access plan",
    },
    {
      type: "p",
      text: "Organisations do not need to solve every AI governance problem before improving access control. A useful first month can focus narrowly on authority.",
    },
    {
      type: "ol",
      items: [
        "Days 1-7 - Discover: inventory production and pilot agents, their identities, sponsors, runtimes, tools, credentials, data sources and downstream systems.",
        "Days 8-14 - Classify: identify delegated, autonomous and user-like patterns. Classify read, write, delete, send, financial, deployment and privilege-changing actions.",
        "Days 15-21 - Constrain: define task scope, short-lived authorization, tool allowlists, human-approval boundaries, runtime limits and revocation paths.",
        "Days 22-30 - Prove: test prompt injection, excess tool requests, permission reduction, token revocation, human approval, runtime isolation, logging, incident response and retirement.",
      ],
    },
    {
      type: "p",
      text: "The aim is not to prevent useful automation. It is to define which autonomy is safe before the agent encounters a real failure condition.",
    },

    {
      type: "h2",
      id: "ciso-checklist",
      text: "Questions every CIO and CISO should ask",
    },
    {
      type: "ol",
      items: [
        "Does every production agent have a distinct identity?",
        "Can logs distinguish the requester from the agent that executed the action?",
        "What is the maximum authority the sponsoring user or business process may delegate?",
        "Are permissions specific to task, resource, action, tool and duration?",
        "Which actions always require independent approval?",
        "Can write access be removed while safe read access continues?",
        "Can one agent be stopped without disabling its sponsoring user?",
        "What prevents the model from changing its own permissions?",
        "Which files, processes, network destinations, tools and MCP servers can the runtime reach?",
        "Can sensitive information leave through generated output or tool calls?",
        "What evidence survives for incident investigation?",
        "Who becomes responsible if the original agent builder leaves?",
        "What event automatically expires or disables the agent?",
        "Has security tested negative paths rather than only successful workflows?",
        "Is there a tested kill switch?",
      ],
    },
    {
      type: "p",
      text: "If several of these questions cannot be answered, the agent may have more authority than the organisation understands.",
    },

    {
      type: "h2",
      id: "measure-authority",
      text: "Measure authority, not the number of agents",
    },
    {
      type: "p",
      text: "A dashboard showing 200 deployed agents says little about whether those agents are governed safely.",
    },
    {
      type: "p",
      text: "Useful measures are closer to the identity and control plane.",
    },
    {
      type: "ul",
      items: [
        "Percentage of production agents with distinct identities.",
        "Percentage with named business sponsors and technical owners.",
        "Percentage using static reusable credentials.",
        "Percentage with standing privileged access.",
        "Percentage of elevated grants that are task-scoped and time-bound.",
        "Percentage of high-impact actions requiring independent approval.",
        "Average time needed to revoke an active agent's authority.",
        "Percentage with complete action-level audit evidence.",
        "Number of inactive or ownerless agents.",
        "Number of denied out-of-scope tool calls.",
        "Agent security incidents and near misses.",
        "Percentage of workflows tested for compromise, revocation and recovery.",
      ],
    },
    {
      type: "p",
      text: "These measures reveal whether the organisation is controlling agent authority rather than simply accelerating deployment.",
    },

    {
      type: "h2",
      id: "give-task-not-master-key",
      text: "Give the task, not the master key",
    },
    {
      type: "p",
      text: "AI agents can save time and perform real work. That is exactly why their permissions matter.",
    },
    {
      type: "p",
      text: "The goal is not to stop agents from acting. It is to make sure their authority matches the task.",
    },
    {
      type: "p",
      text: "Give the agent an identity. Limit the data and tools it can reach. Issue the minimum authority required. Make additional privilege expire. Require human approval when the consequence becomes significant. Record what actually happens. Test that access can be revoked immediately when the situation changes.",
    },
    {
      type: "p",
      text: "The safest enterprise agent is not the one with the most detailed system prompt. It is the one whose environment can enforce what the agent is and is not allowed to do.",
    },
    {
      type: "p",
      text: "The final question is therefore not whether the employee could perform the action.",
    },
    {
      type: "p",
      text: "It is whether this agent, for this task, on this resource, at this moment, should be allowed to perform it.",
    },
  ],

  faq: [
    {
      question: "Should an AI agent use an employee's account?",
      answer:
        "Not as a shortcut to broad access. Where an agent acts on behalf of a user, the system should preserve the relationship between the user and the agent while limiting the agent to the authority needed for the approved task.",
    },
    {
      question: "What are task-scoped permissions for an AI agent?",
      answer:
        "Task-scoped permissions limit an agent to the specific resources, tools and actions needed for an approved task. The authorization should also have a defined duration and should expire or be revoked when the task ends.",
    },
    {
      question: "What is zero standing privilege for AI agents?",
      answer:
        "Zero standing privilege means an agent does not retain elevated authority while idle. Additional permissions are issued only when an approved task needs them and should be narrow, time-bound and revocable.",
    },
    {
      question:
        "Can prompt injection cause an AI agent to misuse permissions?",
      answer:
        "Yes. An agent may encounter hostile instructions inside email, documents, web pages or tool responses. Strong access controls do not prevent every prompt-injection attempt, but they can reduce what the agent can do if it is manipulated.",
    },
    {
      question: "Should every AI-agent action require human approval?",
      answer:
        "No. Low-risk and reversible actions can often run autonomously. Human approval is more valuable at high-impact boundaries such as payments, deletions, external data transfers, privilege changes and production deployments.",
    },
    {
      question:
        "What is the difference between agent identity and agent permissions?",
      answer:
        "Agent identity determines which software actor is performing the work. Permissions determine what that identity is authorised to do. A stable agent identity can exist while its task-specific permissions remain temporary.",
    },
    {
      question: "How should an enterprise stop a compromised AI agent?",
      answer:
        "The response should be able to stop or isolate the runtime, revoke task and downstream tokens, disable the affected agent identity, preserve action evidence, identify affected resources and remove the policy or workflow weakness before reactivation.",
    },
    {
      question:
        "Are identity permissions enough to secure an AI agent?",
      answer:
        "No. Identity controls should be combined with tool restrictions, data and output controls, network boundaries, runtime containment, monitoring, human approval for high-impact actions and a tested incident-response process.",
    },
  ],

  sources: [
    {
      title: "Least privilege for AI agents",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/security/zero-trust/sfi/least-privilege-for-ai-agents",
    },
    {
      title: "What is Microsoft Entra Agent ID?",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id",
    },
    {
      title: "Secure agents",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/agents/center-of-excellence/secure-agents",
    },
    {
      title: "AI Agent Security Cheat Sheet",
      publisher: "OWASP Cheat Sheet Series",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html",
    },
    {
      title: "Securing Agentic Applications V2",
      publisher: "OWASP GenAI Security Project",
      url: "https://genai.owasp.org/resource/securing-agentic-applications-v2/",
    },
    {
      title: "Design Tenets for Agent Identity Management Systems",
      publisher: "National Institute of Standards and Technology",
      url: "https://www.nist.gov/blogs/cybersecurity-insights/design-tenets-agent-identity-management-systems",
    },
    {
      title: "Careful Adoption of Agentic SI Services",
      publisher: "Cybersecurity and Infrastructure Security Agency",
      url: "https://www.cisa.gov/resources-tools/resources/careful-adoption-agentic-si-services",
    },
  ],
};