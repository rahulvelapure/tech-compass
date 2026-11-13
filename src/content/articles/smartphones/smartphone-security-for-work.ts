import type { Article } from "../../types";

export const article: Article = {
  slug: "smartphone-security-for-work",
  category: "smartphones",
  contentType: "how-to",
  subcategory: "Mobile security",
  title: "Personal phones at work: the settings that actually reduce risk",
  seoTitle: "Personal phones at work: key settings",
  metaDescription:
    "Which smartphone settings meaningfully reduce risk when personal devices access work data, and which common recommendations do very little.",
  standfirst:
    "Most phone security advice is noise. A short list of settings does nearly all of the work.",
  excerpt:
    "The small set of phone settings and management controls that materially reduce risk on personal devices accessing work accounts.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-14",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-08-28",
  readingMinutes: 4,
  primaryKeyword: "smartphone security settings work",
  secondaryKeywords: [
    "BYOD mobile security",
    "app protection policy",
    "phishing-resistant MFA mobile",
    "personal device work email",
  ],
  tags: ["Smartphones", "Security", "Mobile", "Endpoint Management"],
  reviewStatus: "research-based",
  relatedSlugs: ["passkeys-enterprise-deployment-reality", "conditional-access-framework"],
  draft: true,
  methodology:
    "Written from published platform security documentation and vendor management guidance, verified August 2026. No breach statistics or product comparisons are quoted, because the available figures do not transfer between estates.",
  body: [
    {
      type: "p",
      text: "Put work email on a personal phone and three things can really go wrong. The phone is lost while unlocked. The password was used somewhere else too. Or an app asks for far more than it needs, and gets it.",
    },
    {
      type: "p",
      text: "Almost every meaningful control addresses one of those three. Most of the rest of the advice addresses none of them, which is why the list below is short.",
    },
    { type: "h2", id: "list", text: "The four that carry the weight" },
    {
      type: "ul",
      items: [
        "A device passcode of reasonable length with biometric unlock — the biometric is convenience, the passcode is the actual secret.",
        "Automatic OS updates enabled, because unpatched mobile platforms are exploited far more often than misconfigured ones.",
        "Phishing-resistant multi-factor authentication on the work account, not SMS.",
        "Application-level protection for work data so a wipe removes company data without touching personal content.",
      ],
    },
    {
      type: "p",
      text: "That is the whole list. Everything below explains why each one earns its place, and what it does not cover.",
    },
    { type: "h2", id: "passcode", text: "The passcode is the secret, the face is the shortcut" },
    {
      type: "p",
      text: "Biometrics are an unlock method, not a credential. Underneath, the device is still protected by the passcode, and the encryption keys are tied to it.",
    },
    {
      type: "p",
      text: "That is why a six-digit passcode is meaningfully better than four, and why a weak one undermines everything above it. The biometric only exists so people tolerate a longer passcode.",
    },
    {
      type: "p",
      text: "There is a legal dimension worth knowing too. In several jurisdictions, compelling a face or fingerprint is treated differently from compelling a memorised passcode. Knowing how to disable biometrics quickly is a useful thing for travelling staff to have been shown once.",
    },
    { type: "h2", id: "updates", text: "Updates beat almost everything else" },
    {
      type: "p",
      text: "Mobile platforms are attacked through unpatched flaws far more often than through misconfiguration. An out-of-date phone is the single largest risk on this list.",
    },
    {
      type: "p",
      text: "So automatic updates matter, and so does the device still being supported. A phone past its support window will never receive the fix, whatever the settings say.",
    },
    {
      type: "p",
      text: "For a work account, that turns into a policy question rather than a settings question. Decide the minimum OS version you will allow, and enforce it at sign-in. That check is the one thing that keeps genuinely old devices out.",
    },
    { type: "h2", id: "mfa", text: "Not all multi-factor is equal" },
    {
      type: "p",
      text: "SMS codes are better than nothing and worse than everything else. They can be intercepted, and more commonly they are simply read out to a convincing caller.",
    },
    {
      type: "p",
      text: "Phishing-resistant methods are bound to the site they were registered with, so a lookalike domain gets nothing. That property is what makes them different in kind rather than degree, and the [enterprise passkey picture](/cybersecurity-ciso/passkeys-enterprise-deployment-reality) covers how that plays out at scale.",
    },
    {
      type: "p",
      text: "Push approvals sit in between. They are convenient and they are vulnerable to fatigue, where someone taps approve on the tenth prompt at midnight. Number matching helps, and it is worth turning on.",
    },
    { type: "h2", id: "scope", text: "Manage the app, not the phone" },
    {
      type: "p",
      text: "For personal devices, application-scoped protection achieves most of the risk reduction with far less privacy intrusion and far fewer support conflicts.",
    },
    {
      type: "p",
      text: "Full device management on someone's own phone is a fight you will keep having. It gives the organisation powers over personal data, it makes people reluctant to enrol, and it produces a support queue about photos and personal apps.",
    },
    {
      type: "p",
      text: "App-level protection avoids most of that. Work data stays inside the managed apps, copy and paste out can be restricted, and a departure removes company data without touching anything personal.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Say what a wipe does, before anyone needs one",
      text: "The most common BYOD complaint is a person believing the organisation erased their phone. With app-level protection it did not — it removed the work container. Put that in writing when people enrol, in plain language, and the complaint mostly disappears.",
    },
    { type: "h2", id: "noise", text: "What does not earn its place" },
    {
      type: "ul",
      items: [
        "Consumer antivirus applications on modern mobile platforms, which cannot see much of what they claim to protect against.",
        "Blanket VPN requirements for all traffic, which mainly move where the traffic is observed.",
        "Forced password rotation on the work account, which pushes people towards weaker, more predictable choices.",
      ],
    },
    {
      type: "p",
      text: "None of these is harmful in itself. They cost attention and goodwill, though, and both are finite. Spending them here means having less of both when you need a control that matters.",
    },
    { type: "h2", id: "rollout", text: "How to introduce this without a revolt" },
    {
      type: "ol",
      items: [
        "Decide first whether personal devices are allowed at all. An unstated answer becomes yes by default.",
        "Set the minimum OS version and enforce it at sign-in, so the rule is visible rather than theoretical.",
        "Turn on phishing-resistant authentication for the work account before anything else on the phone.",
        "Deploy app-level protection rather than full enrolment, and say plainly what it can and cannot see.",
        "Publish what happens when someone leaves or loses the device, in one short page people can find.",
      ],
    },
    {
      type: "p",
      text: "The controls in that list are unremarkable, and that is the point. Mobile risk is not usually reduced by clever tooling. It is reduced by a current OS, a real second factor, and a clear boundary around work data.",
    },
  ],
  faq: [
    {
      question: "Is a fingerprint as safe as a passcode?",
      answer:
        "It is a shortcut to the passcode, not a replacement. The passcode is still the secret.",
    },
    {
      question: "Do phones need antivirus?",
      answer: "Not on a current platform. These apps cannot see much of what they claim to catch.",
    },
    {
      question: "Is SMS two-factor good enough?",
      answer:
        "It is better than nothing. It can be intercepted, and people can be talked into reading it out.",
    },
    {
      question: "Can my employer see my photos?",
      answer:
        "Not with app-level protection. It reaches the work apps, and nothing else on the phone.",
    },
    {
      question: "What if someone will not enrol their phone?",
      answer:
        "Then they use a work device, or they use webmail. Both are fine. Decide which, and say so.",
    },
  ],
  sources: [
    {
      title: "Apple Platform Security",
      publisher: "Apple",
      url: "https://support.apple.com/guide/security/welcome/web",
    },
    {
      title: "Android Enterprise security",
      publisher: "Google",
      url: "https://developers.google.com/android/work/requirements",
    },
    {
      title: "App protection policies overview",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/apps/app-protection-policy",
    },
    {
      title: "Digital Identity Guidelines: Authentication and Lifecycle Management (SP 800-63B)",
      publisher: "NIST",
      url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
    },
  ],
};
