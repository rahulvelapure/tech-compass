import type { Article } from "../../types";

export const article: Article = {
  slug: "conditional-access-break-glass-accounts",
  category: "microsoft-365-entra-id",
  subcategory: "Entra ID",
  title: "Break-glass accounts: the configuration most tenants get wrong",
  seoTitle: "Break-glass accounts in Entra ID",
  metaDescription:
    "How to configure emergency access accounts in Entra ID so a Conditional Access mistake cannot lock every administrator out of the tenant.",
  standfirst:
    "Emergency access accounts exist for one scenario, and that scenario is almost always caused by your own policy change.",
  excerpt:
    "What an emergency access account must be excluded from, what it must still be monitored for, and how to test it without weakening the tenant.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-20",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "break glass account entra id",
  secondaryKeywords: ["emergency access account Azure AD", "conditional access lockout"],
  tags: ["Entra ID", "Conditional Access", "Identity", "Microsoft 365"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Entra ID emergency access guidance and Conditional Access documentation. No tenant configuration is described.",
  body: [
    {
      type: "p",
      text: "Nearly every administrative lockout is self-inflicted: a Conditional Access policy scoped to All users, a compliant-device requirement applied before devices were compliant, or an MFA method retired while it was still the only method registered. Emergency access accounts are the control that makes those mistakes recoverable rather than a support ticket with your identity provider.",
    },
    { type: "h2", id: "what-to-exclude", text: "What to exclude, and only that" },
    {
      type: "ul",
      items: [
        "Exclude the accounts from every Conditional Access policy, including report-only ones you intend to enable later.",
        "Do not exclude them from logging, alerting or privileged access review — exclusion is from enforcement, not from oversight.",
        "Keep at least two accounts, configured differently, so a single failing dependency cannot take both out.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "A cloud-only account is the point",
      text: "If the emergency account depends on on-premises synchronisation, a directory sync outage removes exactly the account you need during a directory sync outage.",
    },
    { type: "h2", id: "monitoring", text: "Monitor every sign-in" },
    {
      type: "p",
      text: "Any successful sign-in by an emergency access account is either a genuine incident or a compromise. Both warrant an alert that reaches a human immediately, not a dashboard nobody opens. Sign-in logs should feed an alert rule with no threshold: one event, one page.",
    },
    { type: "h2", id: "testing", text: "Test on a schedule" },
    {
      type: "ol",
      items: [
        "Validate the credentials on a fixed cadence, and record who performed the check.",
        "Rotate the credential after each test, storing it split between two custodians.",
        "Re-verify exclusions after any Conditional Access change, because new policies default to including everyone.",
      ],
    },
  ],
  faq: [
    {
      question: "How many break-glass accounts should a tenant have?",
      answer:
        "At least two, configured with different authentication methods and stored separately, so that one failed dependency or one unavailable custodian does not remove access entirely.",
    },
  ],
  sources: [
    {
      title: "Manage emergency access accounts in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access",
    },
  ],
};
