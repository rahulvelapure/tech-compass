import type { Article } from "../../types";

export const article: Article = {
  slug: "entra-external-id-b2b-b2c-cross-tenant-access",
  category: "microsoft-365-entra-id",
  contentType: "explainer",
  subcategory: "Identity",
  title: "A guest account is a trust decision about someone else's tenant",
  seoTitle: "Entra External ID: B2B and Cross-Tenant Access",
  metaDescription:
    "External ID is three different products. Guest access delegates authentication to a tenant you do not control, and cross-tenant settings decide what that costs you.",
  standfirst:
    "You cannot set a password policy on a guest. Their home tenant decides how strong their sign-in is, and by default you accept whatever that turns out to be.",
  excerpt:
    "B2B collaboration, cross-tenant access settings and customer identity are three distinct architectures under one name. Confusing them is how tenants end up with thousands of ungoverned guests.",
  authorId: "rahul-velapure",
  publishedAt: "2026-03-09",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 6,
  primaryKeyword: "Microsoft Entra External ID architecture",
  secondaryKeywords: [
    "cross-tenant access settings",
    "B2B collaboration guest access",
    "external identity governance",
    "guest user Conditional Access",
    "B2B direct connect",
  ],
  tags: ["Entra ID", "Identity", "Security", "Governance", "Microsoft 365"],
  reviewStatus: "research-based",
  relatedSlugs: ["conditional-access-framework", "saml-federation-security-risks-trust-boundaries"],
  methodology:
    "Written from Microsoft Learn documentation on external identities, cross-tenant access settings, Conditional Access for external users and the customer identity tenant type, verified August 2026. The source draft's monthly-active-user pricing tiers and per-seat costs were removed rather than repeated: Microsoft revises them, and a stale price is worse than none. Its invented breach narrative was replaced with the mechanism that made it plausible.",
  body: [
    {
      type: "p",
      text: "You invite a contractor as a guest. They accept, and they can now open the SharePoint site you shared.",
    },
    {
      type: "p",
      text: "Here is what you just agreed to. Their sign-in happens in their tenant, not yours. Their password policy, their MFA posture, their session lifetime, their offboarding process. You accepted all of it, and you cannot inspect most of it.",
    },
    {
      type: "p",
      text: "That is the actual security model of guest access, and it is why external identity is a trust decision rather than a sharing feature.",
    },
    { type: "h2", id: "three-products", text: "Three things wearing one name" },
    {
      type: "p",
      text: "External ID is an umbrella, and the pieces underneath it are not variations of each other.",
    },
    {
      type: "table",
      caption: "What each part is actually for",
      head: ["Component", "Who it is for", "Where the identity lives"],
      rows: [
        [
          "B2B collaboration",
          "Partners and contractors",
          "Their home tenant; a guest object in yours",
        ],
        ["Cross-tenant access settings", "Nobody — it is the policy layer over B2B", "n/a"],
        [
          "External ID for customers",
          "Consumers of your application",
          "A separate customer tenant",
        ],
      ],
    },
    {
      type: "p",
      text: "Conflating the first and the third is the common mistake. Guest access is built to let someone keep their own identity. Customer identity is built to give you identities you own and operate. Choosing the wrong one means either governing consumers as guests, or running a whole tenant for six contractors.",
    },
    { type: "h2", id: "guest-object", text: "What a guest object actually holds" },
    {
      type: "p",
      text: "When a guest redeems an invitation, a user object appears in your directory with `userType` set to Guest. It is a reference, not an account.",
    },
    {
      type: "p",
      text: "It stores a display name, an email address, and a pointer to where the identity came from. It does not store a credential. Every sign-in is delegated to the home tenant.",
    },
    {
      type: "p",
      text: "So your password policy does not apply. Your account lockout does not apply. If their tenant permits a weak password, that password now opens your resources. You have no visibility into which it is.",
    },
    {
      type: "p",
      text: "This is the same delegated-trust shape as federated sign-in, and it fails in the same direction: you are accepting an assertion from a system whose controls you cannot audit. The related failure modes are covered in [SAML federation and trust boundaries](/cybersecurity-ciso/saml-federation-security-risks-trust-boundaries).",
    },
    { type: "h2", id: "ctas", text: "Cross-tenant access settings, and the permissive default" },
    {
      type: "p",
      text: "Cross-tenant access settings are where you decide how much that delegated trust is worth. They work in two directions, and both matter.",
    },
    {
      type: "p",
      text: "**Inbound** controls which external tenants may send guests to you, and what those guests can do. It also holds the trust switches: whether you accept the home tenant's MFA claim, and whether you accept its device compliance signal.",
    },
    {
      type: "p",
      text: "**Outbound** controls which tenants your own users may be guests in. This one gets skipped almost universally, and it has a consequence people miss. When your user is a guest elsewhere, your Conditional Access does not govern what they do in that tenant. Outbound settings are the only place you constrain that.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The default is open, and silence looks like a decision",
      text: "If you have never configured cross-tenant access, the default settings apply, and they generally permit B2B collaboration broadly. That is not a misconfiguration you can find in a report — nothing is wrong, no policy is broken. It just means any tenant on the internet is a potential source of guests in your directory. Configure the default explicitly, then allow named partners.",
    },
    {
      type: "p",
      text: "The MFA trust setting is worth a second look. Accepting a partner's MFA claim removes a prompt for their users, which is genuinely better for them. It also means their assurance level becomes yours. Grant it per-tenant, to partners whose identity practices you actually know something about.",
    },
    { type: "h2", id: "conditional-access", text: "Guests and Conditional Access" },
    {
      type: "p",
      text: "This is the most common gap, and it is created deliberately by people trying to be helpful.",
    },
    {
      type: "p",
      text: "A team writes a Conditional Access policy scoped to all users. Partners complain about friction. Someone excludes guests to make the complaints stop. Now guests reach SharePoint, Teams and applications with no MFA requirement, no session control, and no device condition.",
    },
    {
      type: "p",
      text: "The fix is a policy written for guests rather than an exclusion from the policy written for staff. Guests are a different population with different risk, so they warrant their own rules.",
    },
    {
      type: "ul",
      items: [
        "**Require multifactor authentication.** Where you trust the partner tenant's claim, they will not be prompted again. Where you do not, they will be prompted by you.",
        "**Set a sign-in frequency.** Long-lived guest sessions are a large window for token theft, and you control this one entirely.",
        "**Scope access to named applications.** Guests should not inherit access to everything an internal user can reach.",
        "**Restrict directory visibility.** External collaboration settings can stop a guest enumerating your users and groups through Graph. Turn this on.",
      ],
    },
    {
      type: "p",
      text: "Device compliance is the one that does not work the way people hope. A guest's device is managed by their organisation, not by your Intune, so you cannot enforce your compliance policy on it. What you can do is accept a device signal from a partner tenant you have chosen to trust. That is a different and weaker control, and it should be recognised as such rather than ticked off as equivalent.",
    },
    { type: "h2", id: "sprawl", text: "Why guest sprawl is the default outcome" },
    {
      type: "p",
      text: "Invitations are easy and cheap. Removal is nobody's job. That asymmetry is the whole problem.",
    },
    {
      type: "p",
      text: "A contractor joins for a six-month engagement. The engagement ends. Nothing in the process removes their access, because the person who invited them has moved on and the account is not costing anyone anything. Repeat across a few years and the directory holds thousands of guests, each with some access somebody once needed.",
    },
    {
      type: "p",
      text: "The mechanism that makes this dangerous rather than merely untidy is that the identity lives elsewhere. Consider what happens when a partner company shuts down and its email domain lapses. Whoever registers that domain next can stand up a tenant for it. Your guest object still points at that domain.",
    },
    {
      type: "p",
      text: "You do not need an incident report to see the shape of that risk. It follows directly from delegating authentication to a party you no longer have a relationship with.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Access reviews are the control, and they need a licence",
      text: "Recurring access reviews are how guest access expires by default instead of persisting by default. Reviewers confirm continued need, and access is removed when nobody does. This sits in Entra ID Governance and needs the appropriate licensing, which is worth establishing early — a governance design that assumes access reviews and then discovers the licence gap has to be redone.",
    },
    { type: "h2", id: "customers", text: "When it is customers, not partners" },
    {
      type: "p",
      text: "External ID for customers, previously Azure AD B2C, is a different architecture for a different problem. Users are native to a separate customer tenant rather than guests in your corporate one.",
    },
    {
      type: "p",
      text: "That inversion is the point. You own the identities, so you control sign-up, the sign-in experience, branding and the attributes collected. You also carry the operational weight that comes with owning them.",
    },
    {
      type: "p",
      text: "Two things to establish before committing. The billing model is based on monthly active users rather than seats, so cost scales with engagement and should be modelled against your own projections rather than a figure from an article. And the custom policy framework is powerful enough to express almost any sign-in journey, which also makes it powerful enough to get wrong. Use built-in user flows unless a requirement genuinely cannot be met by one.",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "A guest object is a pointer, not an account. Their tenant sets the strength of the sign-in.",
        "Configure cross-tenant access explicitly. The default permits broad collaboration, and doing nothing is a choice.",
        "Set outbound policy too. Your Conditional Access does not follow your users into someone else's tenant.",
        "Grant MFA trust per partner, not globally. You are adopting their assurance level.",
        "Write a Conditional Access policy for guests instead of excluding them from the one you already have.",
        "You cannot enforce your device compliance on a guest device. Accepting a partner signal is weaker, and worth naming as such.",
        "Access reviews are what make guest access expire. Without them, sprawl is the default.",
        "Customers are not guests. If you need to own the identity, use the customer tenant model.",
      ],
    },
    {
      type: "p",
      text: "The useful reframing is that every invitation extends your identity perimeter into an organisation you do not run. That can be entirely reasonable. It should just be a decision someone made on purpose, with an expiry date attached.",
    },
  ],
  faq: [
    {
      question: "Can I enforce my password policy on a guest?",
      answer:
        "No. The guest object holds no password. Their home tenant handles the sign-in, so its rules are the ones that apply.",
    },
    {
      question: "What does cross-tenant access actually control?",
      answer:
        "Which outside tenants can send you guests, and what those guests may do. It also sets whether you accept their MFA and device signals, and where your own users may go.",
    },
    {
      question: "Why does outbound configuration matter?",
      answer:
        "Because your own sign-in rules stop at your tenant edge. Once a user is a guest elsewhere, the outbound setting is your only lever.",
    },
    {
      question: "Can I require a compliant device for guests?",
      answer:
        "Not with your own policy. Their device belongs to their employer. You can accept a device signal from a partner you trust, which is a weaker control.",
    },
    {
      question: "How do I stop guests browsing my directory?",
      answer:
        "There is a setting for this. Turn on the guest access restriction, so a guest sees only its own objects. It cannot then list your users or groups.",
    },
    {
      question: "Should customers be guests in my corporate tenant?",
      answer:
        "No. Use the customer tenant model. Guest access is built for partners who bring their own sign-in, not for consumers whose accounts you need to own.",
    },
  ],
  sources: [
    {
      title: "External Identities in Microsoft Entra ID: overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/external-id/external-identities-overview",
    },
    {
      title: "Cross-tenant access settings overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/external-id/cross-tenant-access-overview",
    },
    {
      title: "Conditional Access for external users",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/external-id/authentication-conditional-access",
    },
    {
      title: "Microsoft Entra External ID for customers",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/external-id/customers/",
    },
    {
      title: "Manage guest access with access reviews",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/id-governance/manage-guest-access-with-access-reviews",
    },
  ],
};
