import type { Article } from "../../types";

export const article: Article = {
  slug: "saml-federation-security-risks-trust-boundaries",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Identity",
  title: "What SAML federation actually asks you to trust",
  seoTitle: "SAML federation security risks and trust boundaries",
  metaDescription:
    "SAML signatures are not the weak point. The trust boundaries are: a forgeable signing key, bearer assertions, and an SP that cannot see how you signed in.",
  standfirst:
    "Federation moves the lock to one door. That is the whole benefit, and it is also the whole risk.",
  excerpt:
    "SAML's cryptography is fine. The risks sit in what federation asks you to trust: the signing key, a bearer assertion in a browser, and a service provider that cannot tell how the user proved who they were.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  draft: false,
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "SAML federation security risks",
  secondaryKeywords: [
    "Golden SAML attack",
    "SAML assertion replay",
    "SAML audience restriction",
    "RequestedAuthnContext MFA",
    "identity provider compromise",
  ],
  tags: ["Security", "Identity", "SAML", "Federation", "Zero Trust", "Authentication"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "passkeys-enterprise-deployment-reality",
    "conditional-access-framework",
    "entra-id-vs-active-directory-differences",
  ],
  methodology:
    "Written from the OASIS SAML 2.0 specifications, MITRE ATT&CK technique T1606.002 and Microsoft Entra federation documentation, verified August 2026. Attribute names and conditions are quoted from the specification. Lifetime and rotation figures are labelled as recommendations, because the specification sets no value for either. No breach statistics are used.",
  body: [
    {
      type: "p",
      text: "SAML is what makes single sign-on work at most companies. One system checks who you are. Many apps then trust that answer. Nobody has to juggle forty passwords.",
    },
    {
      type: "p",
      text: "It is a genuine improvement on what came before, and the cryptography is not the problem. The problem is what federation asks you to trust, and how quietly those assumptions fail.",
    },
    {
      type: "p",
      text: "There are three worth understanding. A signing key that can mint any identity. A token that works for whoever holds it. And a service provider that cannot see how the user actually proved who they were.",
    },
    { type: "h2", id: "flow", text: "The flow, briefly" },
    {
      type: "p",
      text: "You need the shape of the exchange before the failure modes make sense.",
    },
    {
      type: "ol",
      items: [
        "The user asks a service provider for something. The SP does not know them.",
        "The SP builds an authentication request and redirects the browser to the identity provider.",
        "The IdP authenticates the user, ideally with something strong.",
        "The IdP builds an assertion: an XML document of claims about the user, signed with its private key.",
        "The browser posts that assertion to the SP.",
        "The SP checks the signature against the IdP's published key. If it holds, the user is in.",
      ],
    },
    {
      type: "p",
      text: "Notice what the SP verifies. It verifies that the IdP signed this. It does not verify anything else about how the user got there.",
    },
    { type: "h2", id: "golden-saml", text: "The signing key is the whole estate" },
    {
      type: "p",
      text: "Federation concentrates risk on purpose. That is the design. It also means the IdP's signing key is worth more than any single account, because the key can produce a valid assertion for anyone.",
    },
    {
      type: "p",
      text: "This is the Golden SAML attack, catalogued by MITRE as T1606.002. An attacker who obtains the signing key does not need a password, and does not need to defeat MFA. They forge an assertion for whichever user they want and present it. The SP checks the signature, finds it valid, and grants access.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Password resets do not help here",
      text: "A forged assertion never touches the user's credentials, so resetting them changes nothing. Recovery means rotating the signing certificate and re-establishing trust with every federated service provider. That is why the key belongs on hardware, and why exporting it should be an alarm rather than a log entry.",
    },
    {
      type: "p",
      text: "Practical defence is unglamorous. Protect IdP administrators with phishing-resistant authentication and restricted workstations. Alert on certificate export and on new federation trusts appearing. Both are rare, deliberate events, which makes them good signals.",
    },
    { type: "h2", id: "bearer", text: "An assertion is a bearer token" },
    {
      type: "p",
      text: "A signed assertion proves the IdP said something. It does not prove who is presenting it. Whoever holds a valid one can use it, which puts SAML in the same category as a session cookie.",
    },
    {
      type: "p",
      text: "The specification anticipates this. Assertions carry a `NotOnOrAfter` condition bounding their validity, an `Audience` naming the intended recipient, and a `OneTimeUse` condition where the IdP wants a single use.",
    },
    {
      type: "p",
      text: "Two of those are commonly weakened in the field.",
    },
    {
      type: "table",
      caption:
        "The conditions that limit a stolen assertion, and how each one is usually undermined",
      head: ["Condition", "What it does", "How it gets weakened"],
      rows: [
        [
          "NotOnOrAfter",
          "Bounds the replay window",
          "Widened to absorb clock skew, then left wide",
        ],
        [
          "Audience",
          "Ties the assertion to one SP",
          "Not strictly checked, so it travels between SPs",
        ],
        [
          "OneTimeUse",
          "Blocks a second use",
          "Relies on the SP keeping a replay cache; many do not",
        ],
      ],
    },
    {
      type: "p",
      text: "The replay cache is the one people miss. The condition is a request, not an enforcement — it only works if the service provider records the assertion ID and refuses to see it twice. That is the SP's job, and it is not visible from your side of the trust.",
    },
    {
      type: "p",
      text: "Keep the lifetime short, in minutes rather than an hour. Confirm the SP validates the audience exactly. Where the SP documents a replay cache, that is worth knowing; where it does not, assume there is not one.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The session usually outlives the assertion",
      text: "Once the SP accepts an assertion it issues its own session, and that session commonly lasts far longer than the assertion did. Tightening assertion lifetimes while leaving an eight-hour SP session in place moves the target rather than removing it. Session lifetime is part of the same control.",
    },
    { type: "h2", id: "mfa-gap", text: "The service provider cannot see your MFA" },
    {
      type: "p",
      text: "This is the gap that surprises people most, and it follows directly from the design.",
    },
    {
      type: "p",
      text: "SAML is deliberately agnostic about authentication. The IdP decides how to verify the user. The SP receives the outcome. Unless something is configured to say otherwise, the assertion carries identity claims and nothing about method.",
    },
    {
      type: "p",
      text: "So the SP cannot distinguish a user who passed a hardware key challenge from one who was let through by a trusted-network rule. Both arrive as a valid, signed assertion. Both look identical.",
    },
    {
      type: "p",
      text: "That matters because trusted-network exceptions are common and they age badly. An attacker on a machine inside the range inherits the exception. The SP has no way to notice.",
    },
    {
      type: "p",
      text: "Two mechanisms close it. The SP can send a `RequestedAuthnContext` with an `AuthnContextClassRef`, which asks the IdP for a specific authentication strength and forces a challenge regardless of local policy. Or the IdP can emit a claim describing the method, with the SP requiring it. Both need support at each end, which is the practical limit.",
    },
    { type: "h2", id: "scenario", text: "How this composes into a breach" },
    {
      type: "p",
      text: "None of these three is dramatic alone. Together they make a short, quiet chain.",
    },
    {
      type: "p",
      text: "An organisation federates an HR platform and exempts its office network from MFA. An attacker lands on a contractor's laptop inside that network. They open the HR platform, and the IdP sees a trusted address and issues an assertion without challenging anything.",
    },
    {
      type: "p",
      text: "The assertion is captured from the browser. Its lifetime is an hour, because that was the default nobody revisited. The attacker replays it from their own machine and gets a session on the HR platform.",
    },
    {
      type: "p",
      text: "No password was needed. No MFA prompt appeared. From the IdP's perspective, a legitimate user signed in from the office, which is exactly what the logs will say.",
    },
    { type: "h2", id: "mistakes", text: "Configuration mistakes worth auditing for" },
    {
      type: "ul",
      items: [
        "**SHA-1 signatures.** Older integrations still default to it. SHA-1 is not fit for signatures; both ends should be on SHA-256 or better.",
        "**Certificates nobody owns.** Federation is set up once and revisited when it expires, which is usually an outage rather than a plan. Rotation needs a calendar entry and a named owner.",
        "**Oversharing attributes.** Send the minimum the SP needs. Every extra claim raises the value of a stolen assertion and may carry data protection consequences.",
        "**No inventory.** If you cannot list every federated application, you cannot revoke trust quickly when one is breached or acquired.",
      ],
    },
    { type: "h2", id: "when", text: "SAML or something newer" },
    {
      type: "p",
      text: "SAML is not obsolete, and replacing working federation for its own sake is not a security improvement. It remains the right choice for mature SaaS that supports it, where you want central provisioning and attribute-driven authorisation.",
    },
    {
      type: "p",
      text: "For applications you are building now, OpenID Connect is generally the better fit. It is JSON rather than XML, behaves better on mobile, and gives finer control over scopes. The trust questions above do not disappear — a signing key still mints tokens, and tokens are still bearer credentials — but the tooling is more current.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Treat the signing key as the highest-value secret you hold. Hardware-backed, alarmed on export, rotated on a schedule.",
        "Shorten assertion lifetimes, then check the SP session lifetime too. The second one usually undoes the first.",
        "Verify audience validation on each SP rather than assuming it.",
        "Close the MFA gap with `RequestedAuthnContext` or a method claim, and review every trusted-network exception on the way.",
        "Keep an inventory of federated applications, with an owner and a revocation path for each.",
      ],
    },
    {
      type: "p",
      text: "Federation is worth having. It removes passwords, centralises joiners and leavers, and gives one place to enforce policy. The trade is that it also gives one place to attack. Making that trade knowingly — and closing the three gaps above — is the difference between single sign-on as a control and single sign-on as a single point of failure. Where the IdP policy itself is designed matters as much as the federation: [a Conditional Access framework](/microsoft-365-entra-id/conditional-access-framework) is where those rules live, and [passkeys](/cybersecurity-ciso/passkeys-enterprise-deployment-reality) are what make the IdP sign-in itself hard to phish.",
    },
  ],
  faq: [
    {
      question: "What is a Golden SAML attack?",
      answer:
        "An attacker steals the identity provider's signing key and forges assertions. They can then sign in as anyone, with no password and no MFA prompt. MITRE tracks it as T1606.002.",
    },
    {
      question: "Can a stolen SAML assertion be reused?",
      answer:
        "Often, yes. It is a bearer token, so it works for whoever holds it. Short lifetimes help. A true block needs the service provider to keep a replay cache, and not all of them do.",
    },
    {
      question: "Does the service provider know if I used MFA?",
      answer:
        "Not by default. SAML tells it who you are, not how you proved it. You have to ask for a specific method or send a claim that says which one was used.",
    },
    {
      question: "How long should a SAML assertion last?",
      answer:
        "Minutes, not an hour. The window mainly exists to absorb clock differences between the two systems. A long one just gives a stolen token more time to work.",
    },
    {
      question: "Should we replace SAML with OpenID Connect?",
      answer:
        "Not for the sake of it. SAML is fine where it works today. For new apps, OIDC is the better fit. The trust questions stay the same either way.",
    },
  ],
  sources: [
    {
      title: "Security Assertion Markup Language (SAML) v2.0 Technical Overview",
      publisher: "OASIS",
      url: "https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html",
    },
    {
      title: "Assertions and Protocols for SAML V2.0 (conditions, audience, one-time use)",
      publisher: "OASIS",
      url: "https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf",
    },
    {
      title: "Forge Web Credentials: SAML Tokens (T1606.002)",
      publisher: "MITRE ATT&CK",
      url: "https://attack.mitre.org/techniques/T1606/002/",
    },
    {
      title: "Single sign-on SAML protocol",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity-platform/single-sign-on-saml-protocol",
    },
    {
      title: "Digital Identity Guidelines: Authentication and Lifecycle Management (SP 800-63B)",
      publisher: "NIST",
      url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
    },
  ],
};
