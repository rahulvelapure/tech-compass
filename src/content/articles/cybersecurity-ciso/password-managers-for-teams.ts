import type { Article } from "../../types";

export const article: Article = {
  slug: "password-managers-for-teams",
  category: "cybersecurity-ciso",
  contentType: "decision-framework",
  subcategory: "Identity security",
  title: "Choosing a team password manager: the questions that decide it",
  seoTitle: "Choosing a team password manager",
  metaDescription:
    "An evaluation framework for team password managers: recovery model, provisioning, shared vault ownership, audit export and the browser extension.",
  standfirst:
    "The vault is the easy part. What decides this is what happens when someone leaves, and what happens when they lose every factor.",
  excerpt:
    "A framework for assessing any team password manager, built around recovery, provisioning, shared ownership and audit rather than feature lists.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-04",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-08-28",
  readingMinutes: 4,
  primaryKeyword: "team password manager",
  secondaryKeywords: [
    "shared vault ownership",
    "SCIM provisioning password manager",
    "password manager recovery model",
    "password manager audit log",
  ],
  tags: ["Security", "Identity", "Tooling"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "passkeys-enterprise-deployment-reality",
    "fido2-discoverable-credentials-resident-keys",
  ],
  draft: false,
  methodology:
    "An evaluation framework built from vendor documentation and published security architecture descriptions, verified August 2026. No product is scored, because scoring without standardised hands-on testing across every candidate would be misleading.",
  body: [
    {
      type: "p",
      text: "This is not a ranked list, and that is on purpose. Score products without testing them all the same way, and you get a number that looks solid but is not.",
    },
    {
      type: "p",
      text: "What follows is the assessment structure to apply to any candidate. Most of it has nothing to do with the vault, and that is the point.",
    },
    {
      type: "h2",
      id: "recovery",
      text: "Start with recovery, because it is the hardest to change",
    },
    {
      type: "p",
      text: "Ask what happens when a user loses every factor. If the vendor can restore access, they can also be compelled to. If they cannot, your organisation needs an internal recovery custodian and a documented process.",
    },
    {
      type: "p",
      text: "Both are defensible. Not knowing which one you have is not.",
    },
    {
      type: "p",
      text: "The choice runs deeper than support tickets. A product where the vendor can recover a vault has a key path you do not control. A product where only you can recover it puts that burden on a named person, and on the process that survives them leaving.",
    },
    {
      type: "p",
      text: "Whichever model you pick, write down who holds the recovery material, where it lives, and who is allowed to use it. Then test it. A recovery process nobody has run is a plan, not a capability.",
    },
    { type: "h2", id: "joiners", text: "Provisioning is a leaver problem, not a joiner problem" },
    {
      type: "p",
      text: "Adding people is easy in every product. Removing them is where the differences show, and a leaver with residual access is the failure that matters.",
    },
    {
      type: "ul",
      items: [
        "SCIM provisioning from your identity provider, so leavers lose access with the rest of their accounts.",
        "Shared vault ownership that survives an owner's departure without an administrator improvising.",
        "Enforced separation between personal and organisational items.",
      ],
    },
    {
      type: "p",
      text: "The second one is quietly the most important. Many products let an individual create a shared vault, which makes that person its owner. When they leave, the vault needs an owner, and someone with high privilege has to intervene by hand.",
    },
    {
      type: "p",
      text: "Look for group ownership, or ownership held by a role rather than a person. If the product cannot do that, you will be doing it manually every time someone resigns.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Deprovisioning does not revoke knowledge",
      text: "Removing an account stops future access. It does not undo the fact that the person has seen the credentials. For anything sensitive, treat a departure as a rotation trigger for the secrets that person could read, and make that list easy to produce.",
    },
    { type: "h2", id: "audit", text: "Audit output has to leave the product" },
    {
      type: "p",
      text: "Compliance work needs exportable logs of who accessed which shared secret and when, with retention you control.",
    },
    {
      type: "p",
      text: "A log visible only in a web console for 30 days will not satisfy an auditor. Check three things: what events are recorded, how you get them out, and how long they are kept.",
    },
    {
      type: "p",
      text: "The export matters more than the console. If the product streams to your SIEM, the retention question answers itself and the log survives the vendor relationship. If it does not, you are dependent on their window.",
    },
    { type: "h2", id: "extension", text: "The browser extension is the real attack surface" },
    {
      type: "p",
      text: "The extension is the largest attack surface in every one of these products. Review its permission model and update cadence as carefully as the vault architecture.",
    },
    {
      type: "p",
      text: "An extension that fills credentials has to read page content and inject into it, on every site. That is a lot of reach, and it is the component most exposed to hostile input.",
    },
    {
      type: "p",
      text: "So ask how autofill decides a page is the right one. Domain matching should be strict, and it should resist a lookalike domain. A product that fills on partial matches is doing the phishing for you.",
    },
    { type: "h2", id: "passkeys", text: "Where passkeys change the picture" },
    {
      type: "p",
      text: "Passkeys reduce how many passwords you need, and they do not remove the need for a manager. Plenty of systems will keep asking for a shared secret for years.",
    },
    {
      type: "p",
      text: "What matters here is whether the manager can hold passkeys as well, and what that implies. A synced passkey lives in the manager's account, so the manager becomes the thing protecting it. That is worth understanding before you commit, and the [enterprise passkey reality](/cybersecurity-ciso/passkeys-enterprise-deployment-reality) covers the wider deployment picture.",
    },
    {
      type: "p",
      text: "The same question applies in reverse. If your recovery model depends on a passkey, and that passkey lives in the vault you are recovering, you have a loop. Check for that before it matters.",
    },
    { type: "h2", id: "shortlist", text: "A short evaluation you can actually run" },
    {
      type: "ol",
      items: [
        "Create a shared vault, then delete the account that made it. Watch what happens to the vault.",
        "Deprovision a user in your identity provider and time how long access takes to disappear.",
        "Export the audit log. Check the format, the events it contains and how far back it goes.",
        "Try autofill on a lookalike domain and see whether the extension offers the credential.",
        "Run the recovery path end to end, with the person who would really do it, and write down how long it took.",
      ],
    },
    {
      type: "p",
      text: "Five tests, an afternoon each, and they separate products far better than a feature matrix does. Every one of them is a thing you will otherwise discover during an incident.",
    },
  ],
  faq: [
    {
      question: "Is a browser's built-in manager enough for a team?",
      answer:
        "Not usually. It cannot share a vault well, add and remove staff for you, or hand you an audit trail.",
    },
    {
      question: "Should the vendor be able to recover my vault?",
      answer: "Either answer works. Just know which one you bought. It decides who holds the risk.",
    },
    {
      question: "Do passkeys make this obsolete?",
      answer:
        "No. They cut how many passwords you hold. Shared secrets and legacy systems are not going away yet.",
    },
    {
      question: "What is the most common failure?",
      answer:
        "One person owns a shared vault. Then they leave. Check for group ownership before you buy.",
    },
    {
      question: "How long should audit logs be kept?",
      answer:
        "Long enough for your own rule. If the tool cannot export them, you are stuck with its window.",
    },
  ],
  sources: [
    {
      title: "Digital Identity Guidelines: Authentication and Lifecycle Management (SP 800-63B)",
      publisher: "NIST",
      url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
    },
    {
      title: "System for Cross-domain Identity Management (SCIM) Protocol, RFC 7644",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc7644",
    },
    {
      title: "Web Authentication: An API for accessing Public Key Credentials",
      publisher: "W3C",
      url: "https://www.w3.org/TR/webauthn-3/",
    },
  ],
};
