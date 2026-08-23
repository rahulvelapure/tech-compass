import type { Article } from "../../types";

export const article: Article = {
  slug: "entra-id-pim-implementation-failures",
  category: "microsoft-365-entra-id",
  contentType: "decision-framework",
  subcategory: "Identity",
  title: "PIM removes standing privilege. Most deployments give it back",
  seoTitle: "Entra ID PIM: why implementations fail and how to fix them",
  metaDescription:
    "Just-in-time admin access only helps if activation is a real check. The five configuration choices that hollow it out, and the accounts that must stay outside it.",
  standfirst:
    "Eligible instead of standing is the whole idea. If turning it on asks nothing, you have added a click and kept the risk.",
  excerpt:
    "PIM turns permanent admin rights into rights you activate. Whether that reduces risk depends entirely on what activation demands — and on which accounts you deliberately leave out of it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "Entra ID PIM",
  secondaryKeywords: [
    "just-in-time admin access",
    "PIM activation approval",
    "standing privilege",
    "PIM for groups",
    "privileged role administrator",
  ],
  tags: ["Entra ID", "Security", "Identity", "Governance", "Zero Trust"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "conditional-access-break-glass-accounts",
    "entra-id-authentication-context-step-up-mfa",
  ],
  methodology:
    "Written from Microsoft Learn documentation on Privileged Identity Management, role settings, PIM for groups and emergency access accounts, verified August 2026. Licensing requirements are stated because they gate the feature entirely. The configuration table is labelled a starting point rather than a standard — Microsoft publishes no prescribed durations, and the right values depend on how your administrators actually work.",
  body: [
    {
      type: "p",
      text: "A standing admin account is a standing target. Take it over and you own the tenant, at once and in silence.",
    },
    {
      type: "p",
      text: "Privileged Identity Management changes the shape of that. Instead of holding the role, someone is eligible for it and activates when they need it. Between activations they hold nothing.",
    },
    {
      type: "p",
      text: "That is a real improvement, and it is entirely conditional on what activation actually requires. Configure it so activation asks nothing meaningful and you have added a button, not a control.",
    },
    { type: "h2", id: "model", text: "Eligible, not active" },
    {
      type: "p",
      text: "The mechanism is simple enough. An assignment is eligible rather than active. To use the role, the user activates it, which can require any combination of a fresh authentication, approval from someone else, a written justification and a ticket reference.",
    },
    {
      type: "p",
      text: "The role then expires on its own. Everything — request, approval, activation, expiry — lands in the audit log.",
    },
    {
      type: "p",
      text: "It covers directory roles and Azure resource roles, and more recently group membership, which matters because a great deal of real access is granted through groups rather than roles.",
    },
    {
      type: "callout",
      variant: "note",
      title: "This is a licensed feature",
      text: "PIM needs Entra ID P2, or a licence that includes governance. Settle that before you design around it. Without it you fall back to standing roles with tighter watching, and that is a different design rather than a weaker version of this one.",
    },
    { type: "h2", id: "failures", text: "Five ways it gets hollowed out" },
    { type: "h3", id: "no-approval", text: "Activation that asks for nothing" },
    {
      type: "p",
      text: "The most common configuration is activation with no approver and no justification. Click, complete the authentication prompt, and the role is yours.",
    },
    {
      type: "p",
      text: "Standing privilege is genuinely gone, which is worth something. But an attacker holding a session that can satisfy the prompt can activate exactly as easily as the real user, and nobody is asked anything.",
    },
    {
      type: "p",
      text: "For the roles that own the tenant, activation should involve a second person. For everything else, a justification at minimum — it is a weak control on its own and it makes the audit log worth reading.",
    },
    { type: "h3", id: "duration", text: "Durations that outlast the work" },
    {
      type: "p",
      text: "A long activation window quietly restores the thing you removed. Someone activates in the morning, finishes the task in ten minutes, and holds the role until the evening.",
    },
    {
      type: "p",
      text: "Set the duration against the work rather than the working day. Most administrative tasks are short. If a role is routinely activated for the maximum, that is a signal about how it is being used.",
    },
    { type: "h3", id: "too-many", text: "Too many people eligible" },
    {
      type: "p",
      text: "PIM changes how privilege is exercised. It does not reduce how many people can exercise it.",
    },
    {
      type: "p",
      text: "If a large group is eligible for the highest role, each of those accounts is still a route in, and the attacker's job is now to compromise one and click a button. Eligibility needs reviewing on a schedule, and rarely-needed roles are better granted with an expiry date than left standing.",
    },
    { type: "h3", id: "azure-roles", text: "Covering directory roles and forgetting resources" },
    {
      type: "p",
      text: "This gap is common because the two are configured in different places.",
    },
    {
      type: "p",
      text: "Directory roles get the full treatment. Azure resource roles — the ones that let someone create infrastructure, reach data and change access — are left as permanent assignments. An attacker who lands on a subscription owner never encounters PIM at all.",
    },
    {
      type: "p",
      text: "If you are protecting one, protect both, and apply it high enough in the hierarchy that it is inherited rather than reapplied per subscription.",
    },
    { type: "h3", id: "no-alerting", text: "Nobody reads the activations" },
    {
      type: "p",
      text: "Activation events are logged in detail: who, which role, what justification, how long. That is only useful if something is watching.",
    },
    {
      type: "p",
      text: "An alert on activation of the highest roles is cheap and worth having. The useful signal is not activation itself but activation that looks unusual — at an odd hour, by someone who rarely does it, or with a justification that says nothing.",
    },
    { type: "h2", id: "break-glass", text: "The accounts that must stay outside PIM" },
    {
      type: "p",
      text: "This is the omission that turns a good privileged access design into an outage, and it follows directly from doing everything above correctly.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Emergency access accounts keep permanent assignment",
      text: "Suppose every admin is eligible-only and turning a role on needs sign-off. If no approver is around, nobody can act. Add a sign-in problem and you cannot turn anything on at all. Break-glass accounts exist for that case. They hold their role for good, and sit outside PIM and outside the policies that could block them.",
    },
    {
      type: "p",
      text: "That sounds like a contradiction of everything above, and it is not. The point of removing standing privilege is that ordinary administration does not carry it. A small, tightly controlled, heavily monitored exception is what makes the strict rule survivable everywhere else.",
    },
    {
      type: "p",
      text: "Those accounts need their own discipline — stored credentials, monitoring on any use, and periodic testing that they still work. [Break-glass accounts](/microsoft-365-entra-id/conditional-access-break-glass-accounts) covers what that involves.",
    },
    { type: "h2", id: "config", text: "A starting configuration" },
    {
      type: "p",
      text: "There is no official set of values for this. What follows is a defensible starting point to argue with, not a standard.",
    },
    {
      type: "table",
      caption: "A starting point, to be adjusted against how your administrators actually work",
      head: ["Role type", "Approval", "Justification", "Duration"],
      rows: [
        [
          "Tenant-wide administration",
          "Two approvers",
          "Required, with a ticket reference",
          "Short — hours, not a shift",
        ],
        ["Security administration", "One approver", "Required", "Short"],
        ["Workload administration", "Usually none", "Required", "Moderate"],
        ["Azure resource ownership", "One approver", "Required", "Short"],
        ["Emergency access", "Not applicable — excluded from PIM", "—", "Permanent"],
      ],
    },
    {
      type: "p",
      text: "The last row is the one people leave out of the table and then out of the design.",
    },
    { type: "h2", id: "beyond", text: "One thing that pairs well with it" },
    {
      type: "p",
      text: "PIM checks the person at the moment they take privilege. There is a related control that checks them at the moment they use it.",
    },
    {
      type: "p",
      text: "Turning a role on can be gated by an authentication context. Taking the role then requires meeting a set policy — a phishing-resistant method, a healthy device — whatever the session did earlier. That is covered in [authentication context and step-up](/microsoft-365-entra-id/entra-id-authentication-context-step-up-mfa), and this is one of the better places to use it.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Make turning a role on cost something. Sign-off for the top roles, a written reason for the rest.",
        "Set durations against the task. A role held all day is a standing assignment with extra steps.",
        "Check who is eligible on a schedule. For roles needed now and then, set an end date.",
        "Cover Azure resource roles as well as directory roles. The gap between them is where people stop.",
        "Leave break-glass accounts out on purpose. Write down why, and test that they still work.",
      ],
    },
    {
      type: "p",
      text: "The failure mode worth watching for is not a misconfiguration, it is a deployment that satisfies an audit without changing anything. PIM is enabled, roles are eligible, the report looks correct, and activation takes one click that nobody reviews. Whether it is doing anything comes down to a handful of settings — and to whether someone is reading the log it produces.",
    },
  ],
  faq: [
    {
      question: "What does PIM actually change?",
      answer:
        "Admins stop holding a role all the time. They ask for it when they need it, and it expires on its own. Between times they have nothing to steal.",
    },
    {
      question: "Is PIM included in my licence?",
      answer:
        "Only with Entra ID P2, or a licence that includes governance. Check that first. If you do not have it, you need a different plan.",
    },
    {
      question: "Should every admin role go through PIM?",
      answer:
        "Nearly all of them. Break-glass accounts are the exception. They keep the role for good, or a bad day turns into a lockout.",
    },
    {
      question: "How long should an activation last?",
      answer:
        "As long as the task, not as long as the day. If people always run to the limit, look at what they are actually doing.",
    },
    {
      question: "Is auto-approval good enough?",
      answer:
        "It removes standing rights, which helps. It asks nobody anything, so a stolen session turns the role on as easily as a real user. Use sign-off on the top roles.",
    },
  ],
  sources: [
    {
      title: "What is Microsoft Entra Privileged Identity Management?",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure",
    },
    {
      title: "Configure Microsoft Entra role settings in PIM",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings",
    },
    {
      title: "PIM for Groups",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/concept-pim-for-groups",
    },
    {
      title: "Manage emergency access accounts in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access",
    },
    {
      title: "Microsoft Entra built-in roles",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference",
    },
  ],
};
