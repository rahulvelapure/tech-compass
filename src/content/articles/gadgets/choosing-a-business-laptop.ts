import type { Article } from "../../types";

export const article: Article = {
  slug: "choosing-a-business-laptop",
  category: "gadgets",
  contentType: "buying-guide",
  subcategory: "Laptops",
  title: "How to choose a business laptop fleet without regretting it",
  seoTitle: "Choosing a business laptop fleet",
  metaDescription:
    "A buying guide for business laptop fleets: the specifications that matter for managed devices, the ones that do not, and the total cost items people forget.",
  standfirst:
    "The specification sheet decides very little. Serviceability, firmware management and supply consistency decide most of it.",
  excerpt:
    "The criteria that actually determine whether a laptop fleet is cheap to run over three years.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-08",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "business laptop buying guide",
  secondaryKeywords: ["enterprise laptop fleet", "best business laptop specs"],
  tags: ["Laptops", "Hardware", "Procurement", "Endpoint Management"],
  reviewStatus: "research-based",
  methodology:
    "Written from published vendor specifications, firmware management documentation and standard enterprise procurement criteria. No pricing is quoted because it varies by region and contract.",
  body: [
    {
      type: "p",
      text: "A fleet purchase is a three-year operational commitment. The questions that matter are the ones a specification comparison does not answer: can you get the same model for the whole refresh window, can you manage firmware centrally, and how long does a warranty repair actually take where your people are.",
    },
    { type: "h2", id: "specs-that-matter", text: "Specifications worth paying for" },
    {
      type: "table",
      caption: "Where the money is well spent",
      head: ["Component", "Recommendation", "Why"],
      rows: [
        [
          "Memory",
          "16 GB minimum, 32 GB for engineering",
          "The most common cause of a device feeling old",
        ],
        ["Storage", "512 GB NVMe", "Encryption plus OS plus cache fills 256 GB quickly"],
        ["Display", "Matte, 300+ nits", "Comfort complaints drive early replacement requests"],
        ["Battery", "Replaceable by a service partner", "Batteries define real fleet lifespan"],
        [
          "Ports",
          "At least one USB-A, wired Ethernet via dock",
          "Meeting rooms and labs are not USB-C only",
        ],
      ],
    },
    { type: "h2", id: "management", text: "Manageability is the hidden requirement" },
    {
      type: "ul",
      items: [
        "Firmware and BIOS settings must be manageable from your existing tooling, not a separate console with its own agent.",
        "Zero-touch provisioning support with your identity provider — otherwise every device gets touched by a person.",
        "A published, stable model line so the image and driver set do not fork mid-refresh.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Buy the support tier, not the extra CPU",
      text: "Next-business-day onsite support changes the user experience of a failure far more than one processor tier does.",
    },
  ],
};
