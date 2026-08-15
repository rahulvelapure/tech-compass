import type { Article } from "../../types";

export const article: Article = {
  slug: "conditional-access-break-glass-accounts",
  category: "microsoft-365-entra-id",
  contentType: "how-to",
  subcategory: "Entra ID",
  title: "Break-glass accounts: the configuration most tenants get wrong",
  seoTitle: "Break-glass accounts in Entra ID",
  metaDescription:
    "How to configure emergency access accounts in Entra ID: the shift to phishing-resistant passwordless credentials, and which policies genuinely need an exclusion.",
  standfirst:
    "Emergency access accounts exist for one scenario, and that scenario is almost always caused by your own policy change.",
  excerpt:
    "What an emergency access account must be excluded from, why the long-password pattern no longer holds, and how to test it without weakening the tenant.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 3,
  primaryKeyword: "break glass account entra id",
  secondaryKeywords: ["emergency access account Azure AD", "conditional access lockout"],
  tags: ["Entra ID", "Conditional Access", "Identity", "Microsoft 365"],
  reviewStatus: "research-based",
  relatedSlugs: ["conditional-access-framework"],
  methodology:
    "Written from Microsoft Learn emergency access guidance, the Microsoft cloud security benchmark and Conditional Access documentation, verified August 2026. Guidance in this area changed with mandatory multifactor authentication requirements, so the date matters. No tenant configuration is described.",
  body: [
    {
      type: "p",
      text: "Nearly every administrative lockout is self-inflicted: a Conditional Access policy scoped to All users, a compliant-device requirement applied before devices were compliant, or an authentication method retired while it was still the only one registered. Emergency access accounts are the control that makes those mistakes recoverable rather than a support case with your identity provider.",
    },
    {
      type: "p",
      text: "The configuration guidance has moved, and a good deal of published advice has not moved with it. The older pattern — a long password, stored in a safe, excluded from everything — no longer survives contact with mandatory multifactor authentication requirements. The current shape is passwordless and phishing-resistant.",
    },
    { type: "h2", id: "what-the-account-is", text: "What the account has to be" },
    {
      type: "ul",
      items: [
        "Two or more accounts, so one unavailable custodian or one failed dependency does not remove access entirely.",
        "Cloud-only, on the tenant's own onmicrosoft.com domain. Not federated, not synchronised from on-premises.",
        "Permanently assigned Global Administrator, not eligible-but-inactive. An activation path that depends on the thing that is broken is not a recovery path.",
        "Not associated with an individual person, and not tied to any individual's phone, mailbox or device.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Cloud-only is the whole point",
      text: "If the emergency account depends on directory synchronisation or federation, then a synchronisation or federation outage removes precisely the account you need during a synchronisation or federation outage.",
    },
    { type: "h2", id: "credentials", text: "Credentials: passwordless, not a long password" },
    {
      type: "p",
      text: "Microsoft's current guidance is to register a phishing-resistant passwordless method on these accounts — a passkey (FIDO2) as the recommended option, or certificate-based authentication where a PKI already exists. This is what satisfies the mandatory MFA requirements without leaving the account dependent on a method that could itself be unavailable.",
    },
    {
      type: "p",
      text: "Credential diversity across the accounts matters more than the specific choice. A common arrangement is one account with a passkey and one with certificate-based authentication, with the physical keys held in separate fireproof safes at different sites, under a documented multi-person retrieval procedure.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The self-service password reset trap",
      text: "If self-service password reset is enabled for administrators, signing in to a break-glass account can trigger a registration prompt demanding Authenticator and a mobile number — which is exactly the personal dependency these accounts exist to avoid. The administrator SSPR policy cannot be edited, so the fix is to disable SSPR for administrator accounts at the authorisation-policy level. Changes can take around an hour to apply.",
    },
    { type: "h2", id: "what-to-exclude", text: "What to exclude, and what not to" },
    {
      type: "p",
      text: "Exclude the accounts from Conditional Access policies that block or restrict sign-in. The precision matters in both directions.",
    },
    {
      type: "ul",
      items: [
        "Create a dedicated security group — EmergencyAccess or similar — and exclude the group rather than the individual accounts. New policies then have one obvious thing to exclude, and the exclusion is auditable in one place.",
        "Report-only policies do not need an exclusion. They do not block access, and excluding them removes the very signal that would have warned you the policy was going to cause a lockout.",
        "Do not exclude the accounts from logging, alerting or access review. The exclusion is from enforcement, never from oversight.",
        "Re-verify exclusions after every Conditional Access change. A new policy includes everyone unless told otherwise, and that default is how tenants lock themselves out — which is why the exclusion belongs in the [Conditional Access design framework](/microsoft-365-entra-id/conditional-access-framework) rather than being remembered policy by policy.",
      ],
    },
    {
      type: "p",
      text: "It is also worth preparing contingency policies in advance — policies that are configured but disabled, ready to be enabled during an outage to restore access for a defined set of critical users. Writing them under time pressure, while locked out, is not a plan.",
    },
    { type: "h2", id: "monitoring", text: "Alert on every sign-in" },
    {
      type: "p",
      text: "Any successful sign-in by an emergency access account is either a genuine incident or a compromise. Both warrant an alert that reaches a person immediately, not a dashboard nobody has open. The alert rule should have no threshold and no aggregation window: one event, one page.",
    },
    {
      type: "p",
      text: "Build the rule against the accounts' object IDs rather than their display names or user principal names, so that renaming an account cannot silently disable the detection.",
    },
    { type: "h2", id: "testing", text: "Test on a schedule, and record it" },
    {
      type: "ol",
      items: [
        "Sign in with each account quarterly, against the live Conditional Access configuration. An account that worked when it was created is not evidence about the configuration as it stands today.",
        "Record who performed the check, when, and what the result was. The record is what makes this a control rather than an intention.",
        "Confirm during the test that the alert actually fired. An untested alert is an assumption.",
        "Review custodianship whenever the people holding the credentials change roles or leave.",
      ],
    },
    {
      type: "p",
      text: "The quarterly test is the part most often skipped and the part that most often finds the problem, because the thing that breaks these accounts is rarely the account itself — it is a policy someone added three weeks ago with the best of intentions.",
    },
  ],
  faq: [
    {
      question: "How many break-glass accounts should a tenant have?",
      answer:
        "At least two, registered with different phishing-resistant methods and stored separately, so that one failed dependency or one unavailable custodian does not remove access entirely.",
    },
    {
      question: "Should break-glass accounts be excluded from every Conditional Access policy?",
      answer:
        "From every policy that blocks or restricts sign-in, yes. Report-only policies are the exception: they do not block access, and leaving them in place preserves the signal that a new policy would have caused a lockout.",
    },
    {
      question: "Is a long password still acceptable instead of a passkey?",
      answer:
        "Current Microsoft guidance points to phishing-resistant passwordless methods — passkey (FIDO2), or certificate-based authentication where a PKI exists — because these satisfy mandatory multifactor authentication requirements. A password-only emergency account risks being unusable under those requirements at the moment it is needed.",
    },
    {
      question:
        "Should the accounts use Privileged Identity Management instead of permanent roles?",
      answer:
        "No. Eligible-but-not-active assignment introduces an activation dependency, and activation can require the very services that are unavailable during the incident. These accounts are the deliberate exception to just-in-time assignment, which is why the compensating control is alerting on every use.",
    },
  ],
  sources: [
    {
      title: "Manage emergency access accounts in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access",
    },
    {
      title: "Microsoft cloud security benchmark — Privileged Access (PA-5)",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/security/benchmark/azure/mcsb-v2-privileged-access",
    },
    {
      title: "Plan a Conditional Access deployment",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/plan-conditional-access",
    },
    {
      title: "Create a resilient access control management strategy",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/authentication/concept-resilient-controls",
    },
  ],
};
