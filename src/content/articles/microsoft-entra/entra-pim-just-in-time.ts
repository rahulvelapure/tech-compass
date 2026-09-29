import type { Article } from "../../types";

export const article: Article = {
slug: "entra-pim-just-in-time",
category: "microsoft-entra",
contentType: "how-to",
subcategory: "Privileged Identity Management",
title: "Microsoft Entra PIM: Design Just-in-Time Admin Access",
seoTitle: "Microsoft Entra PIM: Design Just-in-Time Admin Access",
metaDescription:
"Learn how Microsoft Entra PIM can give admins short and controlled access when they need it.",
standfirst:
"Give admin access only when it is needed. Use Microsoft Entra PIM to control when that access is active.",
excerpt:
"Use Microsoft Entra PIM to move admin access from always on to short, controlled access.",
authorId: "rahul-velapure",
publishedAt: "2026-09-28",
readingMinutes: 5,
primaryKeyword: "Microsoft Entra PIM",
secondaryKeywords: [
"just-in-time access",
"eligible role",
"PIM activation",
"privileged access",
],
tags: [
"Microsoft Entra",
"PIM",
"Identity Governance",
"Privileged Access",
],
reviewStatus: "research-based",
draft: false,
methodology:
"Based on current Microsoft Learn guidance for Microsoft Entra Privileged Identity Management. The article uses simple language while keeping key product terms.",
body: [
{
type: "p",
text: "Admin access is powerful. It should not stay active all day.",
},
{
type: "p",
text: "Microsoft Entra Privileged Identity Management, or PIM, helps control admin access. A user can stay eligible for a role without using it. The user activates the role only when the task needs it.",
},
{
  type: "h2",
  id: "why-pim",
  text: "Why use PIM?",
},
{
  type: "p",
  text: "A permanent admin role is always ready to use. This can increase risk. PIM lets you make the role active only for a set time.",
},
{
  type: "p",
  text: "This is called just-in-time access. The user gets the access when it is needed. The access can then expire after the set time.",
},

{
  type: "h2",
  id: "eligible-vs-active",
  text: "Eligible and active roles",
},
{
  type: "p",
  text: "An active role can be used at once. An eligible role is not active yet.",
},
{
  type: "p",
  text: "The user must activate an eligible role before using it. The activation can ask for MFA, a reason, or approval.",
},

{
  type: "h2",
  id: "how-activation-works",
  text: "How activation works",
},
{
  type: "ol",
  items: [
    "The user has an eligible role.",
    "The user opens PIM.",
    "The user selects the role.",
    "The user starts activation.",
    "The user completes the required checks.",
    "The role becomes active for the set time.",
    "The role becomes inactive when the time ends.",
  ],
},

{
  type: "h2",
  id: "core-controls",
  text: "Core PIM controls",
},
{
  type: "ul",
  items: [
    "MFA before activation.",
    "A reason for each request.",
    "Approval for key roles.",
    "A short activation time.",
    "Alerts for key events.",
    "Audit records for review.",
  ],
},

{
  type: "h2",
  id: "least-privilege",
  text: "Use the right admin role",
},
{
  type: "p",
  text: "PIM does not replace least privilege. Give the user only the role needed for the task.",
},
{
  type: "p",
  text: "Do not use Global Administrator for every task. Use a smaller role when one is enough.",
},

{
  type: "h2",
  id: "approval",
  text: "Use approval for key roles",
},
{
  type: "p",
  text: "Some roles can have an approval step. An approver checks the request before access starts.",
},
{
  type: "p",
  text: "Use this control for roles that can cause a high level of change. Keep the process simple for lower risk work.",
},

{
  type: "h2",
  id: "activation-time",
  text: "Keep the access window short",
},
{
  type: "p",
  text: "Set a time limit for role activation. The right limit depends on the task.",
},
{
  type: "p",
  text: "A short window reduces the time that the role can be used. It also makes access easier to review.",
},

{
  type: "h2",
  id: "pim-for-groups",
  text: "PIM for Groups",
},
{
  type: "p",
  text: "PIM can also control group membership and ownership. A user can become a member only when the access is needed.",
},
{
  type: "p",
  text: "This can help when group membership gives access to an app or other resource.",
},

{
  type: "h2",
  id: "review",
  text: "Review admin access",
},
{
  type: "p",
  text: "An eligible role can remain assigned for a long time. Review these assignments on a set schedule.",
},
{
  type: "p",
  text: "Remove access when the user no longer needs it. Review the audit data for key role events.",
},

{
  type: "callout",
  variant: "tip",
  title: "Protect emergency access",
  text: "Keep emergency access accounts outside normal admin work. Test them on a set schedule.",
},

{
  type: "h2",
  id: "common-mistakes",
  text: "Common mistakes",
},
{
  type: "ul",
  items: [
    "Keeping admin roles active all day.",
    "Giving every admin Global Administrator.",
    "Using long activation times.",
    "Skipping MFA.",
    "Never reviewing eligible roles.",
    "Not checking PIM audit data.",
  ],
},

{
  type: "h2",
  id: "simple-model",
  text: "A simple PIM model",
},
{
  type: "ol",
  items: [
    "Make admins eligible.",
    "Use the smallest role needed.",
    "Require MFA at activation.",
    "Use approval for key roles.",
    "Set a short time limit.",
    "Review role use on a set schedule.",
  ],
},

{
  type: "h2",
  id: "conclusion",
  text: "Conclusion",
},
{
  type: "p",
  text: "PIM can change admin access from always on to just in time. Give users the right role. Ask them to activate it when needed. Add MFA and approval where needed. Keep the access window short. Review the access on a set schedule.",
},
],

faq: [
  {
    question: "What is PIM?",
    answer: "PIM controls admin access. It lets users turn a role on when they need it. The role can use MFA and approval. The role can also have a time limit.",
  },
  {
    question: "What is an eligible role?",
    answer: "An eligible role is off until the user needs it. The user must turn it on before using it. This keeps the role off when it is not needed.",
  },
  {
    question: "Can PIM manage groups?",
    answer: "Yes. PIM can control group access. A user can join a group when access is needed. The user can lose that access when the time ends.",
  },
],

sources: [
{
title: "What is Privileged Identity Management?",
publisher: "Microsoft Learn",
url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure",
},
{
title: "Start using Privileged Identity Management",
publisher: "Microsoft Learn",
url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-getting-started",
},
{
title: "Activate a Microsoft Entra role in PIM",
publisher: "Microsoft Learn",
url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-activate-role",
},
{
title: "Plan a Privileged Identity Management deployment",
publisher: "Microsoft Learn",
url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-deployment-plan",
},
{
title: "Assign eligibility for a group in Privileged Identity Management",
publisher: "Microsoft Learn",
url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/groups-assign-member-owner",
},
],
};
