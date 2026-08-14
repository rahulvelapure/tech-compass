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
    "Most mobile security advice is noise. A short list of settings carries nearly all of the benefit.",
  excerpt:
    "The small set of phone settings and management controls that materially reduce risk on personal devices accessing work accounts.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-14",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "smartphone security settings work",
  secondaryKeywords: ["byod security", "personal phone work email risk"],
  tags: ["Smartphones", "Security", "Mobile", "Endpoint Management"],
  reviewStatus: "research-based",
  methodology:
    "Written from published platform security documentation for iOS and Android and from mobile application management documentation. No device or user data is described.",
  body: [
    {
      type: "p",
      text: "When a personal device accesses work email, the realistic threats are a lost unlocked phone, a reused password, and a malicious application with excessive permissions. Almost every meaningful control addresses one of those three.",
    },
    { type: "h2", id: "settings", text: "The short list" },
    {
      type: "ol",
      items: [
        "A device passcode of reasonable length with biometric unlock — the biometric is convenience, the passcode is the actual secret.",
        "Automatic OS updates enabled, because unpatched mobile platforms are exploited far more often than misconfigured ones.",
        "Phishing-resistant multi-factor authentication on the work account, not SMS.",
        "Application-level protection for work data so a wipe removes company data without touching personal content.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Full-device management is often the wrong tool",
      text: "For personal devices, application-scoped protection achieves most of the risk reduction with far less privacy intrusion and far fewer support conflicts.",
    },
    { type: "h2", id: "overrated", text: "Commonly recommended, rarely useful" },
    {
      type: "ul",
      items: [
        "Consumer antivirus applications on modern mobile platforms, which cannot see much of what they claim to protect against.",
        "Blanket VPN requirements for all traffic, which mainly move where the traffic is observed.",
        "Frequent forced passcode rotation, which pushes users toward predictable codes.",
      ],
    },
  ],
};
