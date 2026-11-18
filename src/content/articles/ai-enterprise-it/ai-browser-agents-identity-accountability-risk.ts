import type { Article } from "../../types";

export const article: Article = {
  slug: "ai-browser-agents-identity-accountability-risk",
  category: "ai-enterprise-it",
  contentType: "analysis",

  title: "Your AI Browser Can Act as You. But Can Anyone Prove It Wasn't You?",
  seoTitle: "AI Browser Agents: The Hidden Identity and Security Risk",

  metaDescription:
    "AI browser agents can click, type and act through business accounts. Learn the identity, prompt injection and access risks enterprises need to control.",

  standfirst:
    "AI browser agents can read websites, open email, fill forms and take actions. That creates a new security question. If an AI agent acts through your account, can your company prove that the action came from the agent and not from you?",

    excerpt:
    "AI browser security is not only about prompt injection. It is also about identity, access, approval and proving who actually performed an action.",

  heroImage: "/images/articles/ai-browser-agents-identity-accountability-risk.webp",

  heroImageAlt:
    "AI browser agent working across business applications while identity, permissions and audit controls separate the agent from the user.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-18",
  lastReviewedAt: "2026-11-18",
  nextReviewAt: "2027-02-18",

  readingMinutes: 12,

  primaryKeyword: "AI browser agent security",

  secondaryKeywords: [
    "AI browser agents",
    "agentic browser security",
    "indirect prompt injection",
    "AI agent identity",
    "AI agent permissions",
    "task-scoped access",
    "AI agent audit logs",
    "Microsoft Entra Agent ID",
    "AI agent accountability",
    "AI agent least privilege",
  ],

  tags: [
    "AI Agents",
    "AI Security",
    "Identity Security",
    "Prompt Injection",
    "Zero Trust",
    "Microsoft Entra",
    "Cybersecurity",
    "AI Governance",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "enterprise-ai-agents-security-governance-reality",
    "ai-agents-it-operations",
    "model-context-protocol-explained",
  ],

  draft: false,

  methodology:
    "This article uses public research and guidance from OpenAI, Google, Anthropic, Microsoft, NIST, OWASP, the IETF and academic research available on 18 November 2026. Research tests are not presented as real-world incident rates. Draft standards are identified as work in progress.",

  body: [
    {
      type: "h2",
      id: "the-browser-just-changed",
      text: "The browser just changed",
    },
    {
      type: "p",
      text: "For years, a browser did something simple. You opened a website and decided what to click.",
    },
    {
      type: "p",
      text: "AI is changing that.",
    },
    {
      type: "p",
      text: "A browser agent can read a page, open an email, fill a form, download a file and click a button for you. It can move between websites and business systems while completing a task.",
    },
    {
      type: "p",
      text: "That sounds useful. It is. But it also changes the security problem.",
    },
    {
      type: "p",
      text: "An AI assistant normally gives you an answer. You decide what to do with it. A browser agent may take the next step itself.",
    },
    {
      type: "p",
      text: "That means an AI mistake can become a business action.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The important difference",
      text: "An AI assistant can give you a bad answer. An AI agent can turn a bad decision into a real action.",
    },
    {
      type: "p",
      text: "This is why browser-agent security needs a wider discussion. Prompt injection matters, but it is only part of the problem.",
    },
    {
      type: "p",
      text: "We also need to ask who the agent is, what it can access, whose authority it is using and what the audit log will show after it acts.",
    },

    {
      type: "h2",
      id: "simple-example",
      text: "Start with a simple example",
    },
    {
      type: "p",
      text: "Imagine that you ask an AI browser agent to find an invoice from a supplier.",
    },
    {
      type: "p",
      text: "The agent opens your email. It searches for the supplier. It finds the message and downloads the invoice.",
    },
    {
      type: "p",
      text: "So far, the task is mostly about reading information.",
    },
    {
      type: "p",
      text: "Now change the request. You ask the agent to find all overdue invoices and send a reminder to each supplier.",
    },
    {
      type: "p",
      text: "The agent is no longer just finding information. It is communicating with people outside the company.",
    },
    {
      type: "p",
      text: "Now change the request again. You ask it to check a supplier request and update the supplier record in your ERP system.",
    },
    {
      type: "p",
      text: "The agent can now change business data.",
    },
    {
      type: "p",
      text: "The technology may look similar in all three cases. The business risk is not.",
    },

    {
      type: "h2",
      id: "prompt-injection",
      text: "The first problem: the agent reads things you do not control",
    },
    {
      type: "p",
      text: "A browser agent must read outside content to be useful. That content may come from a website, email, PDF, shared file or another system.",
    },
    {
      type: "p",
      text: "The problem is that outside content cannot always be trusted.",
    },
    {
      type: "p",
      text: "A page or document may contain text designed to influence the AI agent. The user did not write that instruction. The user may not even see it.",
    },
    {
      type: "p",
      text: "This is called indirect prompt injection.",
    },
    {
      type: "p",
      text: "The idea is easier to understand with an example. You ask an agent to review a document. The document contains instructions aimed at the AI rather than at you. The agent reads those instructions while doing its work.",
    },
    {
      type: "p",
      text: "If the agent only summarizes the document, the damage may be limited.",
    },
    {
      type: "p",
      text: "But what if the same agent can also read email, open company files and send information outside the business? The risk changes quickly.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The dangerous combination",
      text: "Untrusted content becomes much more serious when the same agent also has sensitive access and permission to take actions.",
    },

    {
      type: "h2",
      id: "research-shows-the-problem",
      text: "Research shows why this is difficult",
    },
    {
      type: "p",
      text: "Security researchers are actively testing how browser agents react to hostile content.",
    },
    {
      type: "p",
      text: "One useful example is BrowseSafe++. It is a research benchmark for prompt injection in web environments.",
    },
    {
      type: "p",
      text: "The dataset contains 38,675 pairs of clean and attacked web pages. It covers different website types, attack styles and places where hostile instructions can appear.",
    },
    {
      type: "p",
      text: "In controlled tests, some adaptive attacks became much more effective after they used feedback from the agent.",
    },
    {
      type: "p",
      text: "That result matters, but it needs context. It does not mean every commercial AI browser fails at the same rate. It also does not represent the rate of real attacks against companies.",
    },
    {
      type: "p",
      text: "It is a research result from a controlled test. The useful lesson is simpler: prompt injection is not a problem we should assume has been solved.",
    },

    {
      type: "h2",
      id: "identity-question",
      text: "But prompt injection is not the biggest question",
    },
    {
      type: "p",
      text: "There is another problem that gets less attention: identity.",
    },
    {
      type: "p",
      text: "Imagine that you are already signed in to Outlook, SharePoint, your CRM and your ERP system.",
    },
    {
      type: "p",
      text: "You then ask an AI browser agent to complete a task. The agent starts working inside your signed-in browser session.",
    },
    {
      type: "p",
      text: "It opens a business application and changes something.",
    },
    {
      type: "p",
      text: "What does the application see?",
    },
    {
      type: "p",
      text: "In some designs, it may simply see your account. The audit log may therefore say that you performed the action.",
    },
    {
      type: "p",
      text: "But that is not the full story.",
    },
    {
      type: "p",
      text: "You requested the task. The agent chose the steps. Outside content may have influenced the agent. The application accepted the final action.",
    },
    {
      type: "p",
      text: "Those are different events.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The accountability gap",
      text: "If the audit log only shows the employee account, the company may know which account was used without knowing who or what actually performed the action.",
    },

    {
      type: "h2",
      id: "four-parts",
      text: "Four things should not be treated as one",
    },
    {
      type: "p",
      text: "A safer design separates four parts.",
    },
    {
      type: "h3",
      id: "human",
      text: "1. The human",
    },
    {
      type: "p",
      text: "This is the person who asks for the work.",
    },
    {
      type: "h3",
      id: "agent",
      text: "2. The agent",
    },
    {
      type: "p",
      text: "This is the software that plans and performs the task.",
    },
    {
      type: "h3",
      id: "authority",
      text: "3. The authority",
    },
    {
      type: "p",
      text: "This defines exactly what the agent is allowed to do.",
    },
    {
      type: "h3",
      id: "application",
      text: "4. The application",
    },
    {
      type: "p",
      text: "This is the system that holds the data or accepts the action.",
    },
    {
      type: "p",
      text: "These four parts need to remain visible in the security design.",
    },
    {
      type: "p",
      text: "NIST's 2026 work on agent identity points in this direction. It discusses distinct agent identities, limited authority, short-lived access, clear links to the person or organization behind the task, and strong audit evidence.",
    },
    {
      type: "p",
      text: "Microsoft's Entra Agent ID guidance also separates agent identity from normal human identity. Microsoft describes different models for agents that act for users and agents that work on their own.",
    },
    {
      type: "p",
      text: "This matters because an agent should be something the company can identify, control, monitor and disable.",
    },

    {
      type: "h2",
      id: "permissions",
      text: "Your permissions should not automatically become the agent's permissions",
    },
    {
      type: "p",
      text: "This may be the most important practical point.",
    },
    {
      type: "p",
      text: "An employee may need access to hundreds of files and several business systems. An AI agent doing one task probably does not.",
    },
    {
      type: "p",
      text: "Suppose you can read finance files, send email, update supplier records and approve several types of transactions.",
    },
    {
      type: "p",
      text: "The agent only needs to check one invoice. Why should it receive everything you can access?",
    },
    {
      type: "p",
      text: "It should not.",
    },
    {
      type: "p",
      text: "A better model is task-scoped access. The agent gets only the access needed for the current job. That access should also expire when the job ends.",
    },
    {
      type: "p",
      text: "For example, the agent may receive permission to read invoices from one supplier for 15 minutes.",
    },
    {
      type: "p",
      text: "It cannot send email. It cannot change bank details. It cannot open unrelated folders. It cannot keep the access after the task is complete.",
    },
    {
      type: "p",
      text: "That is much safer than giving the agent the user's full session.",
    },

    {
      type: "h2",
      id: "temporary-ticket",
      text: "Think of access as a temporary ticket",
    },
    {
      type: "p",
      text: "Identity standards can become technical very quickly. The basic idea does not need to be.",
    },
    {
      type: "p",
      text: "Do not give an AI agent your permanent master key. Give it a temporary ticket.",
    },
    {
      type: "p",
      text: "The ticket should say what the agent can access, what it can do and when the permission expires.",
    },
    {
      type: "p",
      text: "If the task changes, the agent should ask for new authority. If the task ends, the ticket should stop working.",
    },
    {
      type: "p",
      text: "OAuth and modern identity systems already provide some of the building blocks for this model.",
    },
    {
      type: "p",
      text: "Standards for AI-agent delegation are still developing. Some IETF work in this area remains in draft form. It should not be treated as a final standard.",
    },

    {
      type: "h2",
      id: "supplier-example",
      text: "A supplier request shows how the risks can combine",
    },
    {
      type: "p",
      text: "Consider a fictional example.",
    },
    {
      type: "p",
      text: "An accounts employee receives an email asking for a change to a supplier's bank details.",
    },
    {
      type: "p",
      text: "The employee asks an AI browser agent to review the request and update the ERP system.",
    },
    {
      type: "p",
      text: "The agent reads the email and opens the attachment. The attachment contains instructions aimed at the AI agent.",
    },
    {
      type: "p",
      text: "The agent then opens the supplier record in the ERP system.",
    },
    {
      type: "p",
      text: "Now imagine four weak controls appearing at the same time.",
    },
    {
      type: "p",
      text: "First, the agent trusts instructions from the attachment.",
    },
    {
      type: "p",
      text: "Second, it has inherited the employee's permission to change supplier data.",
    },
    {
      type: "p",
      text: "Third, the change does not need a second person to approve it.",
    },
    {
      type: "p",
      text: "Fourth, the ERP log records only the employee account.",
    },
    {
      type: "p",
      text: "The problem is no longer just a bad AI response. It has become a business-control failure.",
    },

    {
      type: "h3",
      id: "safer-design",
      text: "A safer design",
    },
    {
      type: "p",
      text: "The agent can read the request and compare the details. It can prepare a proposed change.",
    },
    {
      type: "p",
      text: "But it cannot update the supplier master itself.",
    },
    {
      type: "p",
      text: "A second person verifies the bank details through an approved process. The ERP change then goes through normal maker-checker approval.",
    },
    {
      type: "p",
      text: "The audit record keeps the employee, agent and approver separate.",
    },
    {
      type: "p",
      text: "This is not about blocking AI. It is about keeping high-impact authority outside the AI model.",
    },

    {
      type: "h2",
      id: "blast-radius",
      text: "Five questions tell you how large the risk can become",
    },
    {
      type: "p",
      text: "I use five factors when thinking about the possible impact of an AI agent. This is a Tech Compass mental model. It is not an industry standard or a formal risk formula.",
    },

    {
      type: "h3",
      id: "blast-access",
      text: "1. What can it access?",
    },
    {
      type: "p",
      text: "Reading a public website is very different from accessing payroll, ERP data or cloud administration.",
    },

    {
      type: "h3",
      id: "blast-autonomy",
      text: "2. Can it act without approval?",
    },
    {
      type: "p",
      text: "An agent that prepares a draft has less power than one that can send, delete or approve.",
    },

    {
      type: "h3",
      id: "blast-connectivity",
      text: "3. How many systems can it connect?",
    },
    {
      type: "p",
      text: "Risk grows when one agent can move between email, files, CRM, ERP and external websites.",
    },

    {
      type: "h3",
      id: "blast-duration",
      text: "4. How long does the access last?",
    },
    {
      type: "p",
      text: "Access for ten minutes is easier to control than access that remains active for months.",
    },

    {
      type: "h3",
      id: "blast-reversibility",
      text: "5. Can the action be undone?",
    },
    {
      type: "p",
      text: "A draft can be deleted. A sent email, changed bank account or deleted cloud resource may be much harder to recover.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Do not turn this into a fake score",
      text: "Use these five questions to judge the control level. Do not multiply them into a number and pretend the result is scientific.",
    },

    {
      type: "h2",
      id: "provider-controls",
      text: "What AI providers are doing",
    },
    {
      type: "p",
      text: "The major AI providers know that browser agents create new risks. Their public security work shows an important pattern: they do not rely on one prompt filter.",
    },

    {
      type: "h3",
      id: "openai",
      text: "OpenAI",
    },
    {
      type: "p",
      text: "OpenAI describes several layers of protection. These include model training, monitoring, link checks, sandboxing, user approval for sensitive actions, limited network access and red-team testing.",
    },
    {
      type: "p",
      text: "Its security work also makes an important point. Systems should limit the damage an attack can cause even when the attack is not detected.",
    },

    {
      type: "h3",
      id: "google",
      text: "Google",
    },
    {
      type: "p",
      text: "Google has described controls for agent features in Chrome. These include separate checks on proposed actions, limits between web origins, confirmation before sensitive actions, threat detection and red-team testing.",
    },

    {
      type: "h3",
      id: "anthropic",
      text: "Anthropic",
    },
    {
      type: "p",
      text: "Anthropic has described model training, classifiers, action checks and red-team testing for browser use.",
    },
    {
      type: "p",
      text: "Anthropic also makes clear that prompt injection remains an open security problem.",
    },

    {
      type: "h3",
      id: "enterprise-responsibility",
      text: "The enterprise still owns the business risk",
    },
    {
      type: "p",
      text: "Provider controls are important. But they cannot decide how much access your finance team should give an agent.",
    },
    {
      type: "p",
      text: "They cannot decide whether your supplier process needs two-person approval. They cannot decide whether an agent should be allowed to delete a production resource.",
    },
    {
      type: "p",
      text: "Those decisions remain with the enterprise.",
    },

    {
      type: "h2",
      id: "before-deployment",
      text: "Before you deploy an AI agent",
    },
    {
      type: "p",
      text: "**1. Know what agents you have.** Keep an inventory. Record the owner, purpose, provider, connected systems and data it can reach.",
    },
    {
      type: "p",
      text: "**2. Give each agent an identity.** Avoid shared accounts where a separate agent identity is available.",
    },
    {
      type: "p",
      text: "**3. Start with read-only access.** Add write access only when the business case needs it.",
    },
    {
      type: "p",
      text: "**4. Define the task.** State what the agent may read, change, send or approve.",
    },
    {
      type: "p",
      text: "**5. Set a time limit.** Access should end when the task ends.",
    },
    {
      type: "p",
      text: "**6. Test hostile content.** Include websites, email, documents and other outside data in security testing.",
    },

    {
      type: "h2",
      id: "during-execution",
      text: "While the agent is working",
    },
    {
      type: "p",
      text: "**7. Keep access decisions outside the AI model.** The agent can ask to perform an action. A separate policy control should decide whether that action is allowed.",
    },
    {
      type: "p",
      text: "**8. Limit the tools.** Give the agent only the tools and systems needed for the task.",
    },
    {
      type: "p",
      text: "**9. Use short-lived access.** Avoid permanent credentials when temporary access will work.",
    },
    {
      type: "p",
      text: "**10. Ask for approval before high-impact actions.** This includes payments, supplier changes, external messages, deletions and privileged changes.",
    },
    {
      type: "p",
      text: "**11. Protect secrets.** Passwords, keys and tokens should not be placed in prompts or stored in agent memory.",
    },

    {
      type: "h2",
      id: "after-execution",
      text: "After the agent finishes",
    },
    {
      type: "p",
      text: "**12. Keep a useful audit trail.** Record who requested the task, which agent acted, what access it used and what it changed.",
    },
    {
      type: "p",
      text: "**13. Monitor unusual behavior.** Look for new destinations, unusual volumes, unexpected tools and actions outside the original task.",
    },
    {
      type: "p",
      text: "**14. Remove temporary access.** Do not let a short task create permanent permission.",
    },
    {
      type: "p",
      text: "**15. Plan for rollback.** Keep a way to reverse changes when the business process allows it.",
    },
    {
      type: "p",
      text: "**16. Offboard agents.** Agents need lifecycle controls just like other digital identities.",
    },

    {
      type: "h2",
      id: "employees",
      text: "What employees should do",
    },
    {
      type: "p",
      text: "Use only approved AI agents for company work.",
    },
    {
      type: "p",
      text: "Do not sign an agent into a sensitive system when the task does not need that access.",
    },
    {
      type: "p",
      text: "Check the exact action before you approve it. Pay special attention to recipients, bank details, file locations and records that will change.",
    },
    {
      type: "p",
      text: "Stop the task if the agent moves into an application that has nothing to do with your request.",
    },
    {
      type: "p",
      text: "Most of all, do not treat an approval screen as an annoying extra click. That approval may be the last control before the AI action becomes a business action.",
    },

    {
      type: "h2",
      id: "leaders",
      text: "What IT and security leaders should do",
    },
    {
      type: "p",
      text: "Do not start with a blanket ban. Start with the business use case.",
    },
    {
      type: "p",
      text: "An agent that summarizes public research is not the same as an agent that can change supplier data.",
    },
    {
      type: "p",
      text: "Group use cases by the actions they can take and the damage those actions could cause.",
    },
    {
      type: "p",
      text: "Then focus on controls that still work when the AI makes a mistake.",
    },
    {
      type: "p",
      text: "That means least privilege, read-only access, short-lived permissions, approval gates, transaction limits and strong audit logs.",
    },
    {
      type: "p",
      text: "Also make agent identity part of every design review. A security review that looks only at the model and the prompt is no longer enough.",
    },

    {
      type: "h2",
      id: "checklist",
      text: "10 questions to ask before trusting a browser agent",
    },
    {
      type: "p",
      text: "**1. Do we know which AI agents are being used?**",
    },
    {
      type: "p",
      text: "**2. Does each agent have a clear business owner?**",
    },
    {
      type: "p",
      text: "**3. Can we tell the agent apart from the employee in our logs?**",
    },
    {
      type: "p",
      text: "**4. Does the agent have only the access needed for its task?**",
    },
    {
      type: "p",
      text: "**5. Does that access expire when the task ends?**",
    },
    {
      type: "p",
      text: "**6. Do we treat websites, email and documents as untrusted input?**",
    },
    {
      type: "p",
      text: "**7. Does a separate policy control approve sensitive actions?**",
    },
    {
      type: "p",
      text: "**8. Does a person approve actions that can cause serious business impact?**",
    },
    {
      type: "p",
      text: "**9. Can we reconstruct what the agent did after an incident?**",
    },
    {
      type: "p",
      text: "**10. Can we disable the agent without disabling the employee?**",
    },
    {
      type: "p",
      text: "If several answers are no, the agent probably has more freedom than the business can safely manage.",
    },

    {
      type: "h2",
      id: "real-security-goal",
      text: "The real security goal is not perfect AI",
    },
    {
      type: "p",
      text: "It is tempting to think that better AI models will solve this problem. They will help.",
    },
    {
      type: "p",
      text: "Better models should make fewer mistakes. Better filters should catch more attacks. Better browser controls should stop more unsafe actions.",
    },
    {
      type: "p",
      text: "But enterprise security should not depend on the AI being perfect.",
    },
    {
      type: "p",
      text: "We do not design other security controls that way.",
    },
    {
      type: "p",
      text: "We assume passwords can be stolen. We assume devices can fail. We assume users can make mistakes.",
    },
    {
      type: "p",
      text: "We should make the same assumption about AI agents.",
    },
    {
      type: "p",
      text: "An agent may eventually misunderstand something or be influenced by content it should not trust.",
    },
    {
      type: "p",
      text: "The security design should limit what happens next.",
    },

    {
      type: "h2",
      id: "conclusion",
      text: "The question is no longer only who logged in",
    },
    {
      type: "p",
      text: "AI browser agents can save time. They can remove repetitive work and help people move faster across complex systems.",
    },
    {
      type: "p",
      text: "That value is real.",
    },
    {
      type: "p",
      text: "But the browser is changing from a tool that a person operates into a place where software can act for that person.",
    },
    {
      type: "p",
      text: "Our security model has to change with it.",
    },
    {
      type: "p",
      text: "The biggest risk is not simply that an AI agent may misunderstand a webpage.",
    },
    {
      type: "p",
      text: "The bigger risk is that it may act on that mistake using trusted business access.",
    },
    {
      type: "p",
      text: "After the action, the audit log may still point only to the employee.",
    },
    {
      type: "p",
      text: "That is why identity matters. That is why limited access matters. And that is why approval and audit evidence matter.",
    },
    {
      type: "p",
      text: "A company using AI agents should be able to answer five simple questions.",
    },
    {
      type: "p",
      text: "Who asked for the task?",
    },
    {
      type: "p",
      text: "Which agent performed it?",
    },
    {
      type: "p",
      text: "What was the agent allowed to do?",
    },
    {
      type: "p",
      text: "Who approved the important action?",
    },
    {
      type: "p",
      text: "And can we prove all of that later?",
    },
    {
      type: "callout",
      variant: "note",
      title: "The takeaway",
      text: "The security question is no longer only, \"Who logged in?\" We also need to ask, \"Who actually performed the action, under whose authority, and can we prove it?\"",
    },
  ],

  faq: [
    {
      question: "What is an AI browser agent?",
      answer:
        "An AI browser agent is software that can use a browser to complete tasks. It may open pages, read information, click buttons, fill forms and take actions for a user.",
    },
    {
      question: "How is a browser agent different from an AI assistant?",
      answer:
        "An AI assistant mainly gives you information. A browser agent can also take actions. That means a mistake can affect real systems and data.",
    },
    {
      question: "What is indirect prompt injection?",
      answer:
        "It happens when outside content contains instructions aimed at an AI agent. The content may come from a website, email or document. The user may never see or type the instruction.",
    },
    {
      question: "Can prompt injection be completely stopped?",
      answer:
        "Current research does not support that claim. Providers use several layers of protection, but enterprises should also limit what an agent can access and what actions it can take.",
    },
    {
      question: "Should an AI agent use all of my permissions?",
      answer:
        "No. An agent should receive only the access needed for its current task. That access should also expire when the task ends.",
    },
    {
      question: "Why should an AI agent have its own identity?",
      answer:
        "A separate identity makes it easier to control access, monitor activity, revoke permissions and prove whether an action came from the employee or the agent.",
    },
    {
      question: "Does BrowseSafe++ prove that AI browsers fail 95% of the time?",
      answer:
        "No. BrowseSafe++ is a controlled research benchmark. Some adaptive attacks reached high success rates under specific test conditions. Those results are not real-world incident rates for every AI browser.",
    },
  ],

  sources: [
    {
      title: "ChatGPT agent System Card",
      publisher: "OpenAI",
      url: "https://openai.com/index/chatgpt-agent-system-card/",
    },
    {
      title: "Architecting Security for Agentic Capabilities in Chrome",
      publisher: "Google",
      url: "https://blog.google/security/architecting-security-for-agentic/",
    },
    {
      title: "Mitigating the risk of prompt injections in browser use",
      publisher: "Anthropic",
      url: "https://www.anthropic.com/research/prompt-injection-defenses",
    },
    {
      title: "Design Tenets for Agent Identity Management Systems",
      publisher: "NIST",
      url: "https://www.nist.gov/blogs/cybersecurity-insights/design-tenets-agent-identity-management-systems",
    },
    {
      title: "Back to the Future: Why Agentic AI Needs a Strong Identity Foundation",
      publisher: "NIST",
      url: "https://www.nist.gov/blogs/cybersecurity-insights/back-future-why-agentic-ai-needs-strong-identity-foundation",
    },
    {
      title: "Plan your agent identity architecture",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/agent-id/how-to-plan-agent-identity-architecture",
    },
    {
      title: "Authorization in Microsoft Entra Agent ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/agent-id/authorization-agent-id",
    },
    {
      title: "OWASP Top 10 for Agentic Applications for 2026",
      publisher: "OWASP GenAI Security Project",
      url: "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/",
    },
    {
      title: "AI Agent Security Cheat Sheet",
      publisher: "OWASP Cheat Sheet Series",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html",
    },
    {
      title:
        "BrowseSafe++: Benchmarking Prompt Injection Detection Across Web Contexts, Languages, and Browser Views",
      publisher: "arXiv",
      url: "https://arxiv.org/abs/2610.17457",
    },
    {
      title: "AI Agent Authorization Integration Framework",
      publisher: "IETF Internet-Draft",
      url: "https://www.ietf.org/archive/id/draft-liu-ai-agent-authorization-integration-00.html",
    },
  ],
};