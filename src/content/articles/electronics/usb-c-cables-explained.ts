import type { Article } from "../../types";

export const article: Article = {
  slug: "usb-c-cables-explained",
  category: "electronics",
  contentType: "explainer",
  subcategory: "Standards",
  title: "USB-C, explained: why identical cables behave differently",
  seoTitle: "USB-C cables, explained",
  metaDescription:
    "Why USB-C cables that look identical differ in speed, power delivery and video support — and how to tell which one you are holding.",
  standfirst: "The connector is standardised. Almost nothing behind it is.",
  excerpt:
    "A plain explanation of USB-C data rates, power delivery and alternate modes, and how to buy cables that do what you expect.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-22",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "usb-c cable differences",
  secondaryKeywords: ["usb c power delivery explained", "thunderbolt vs usb c"],
  tags: ["Electronics", "Hardware", "Standards"],
  reviewStatus: "research-based",
  methodology:
    "Written from the published USB-IF specifications and connector certification documentation.",
  body: [
    {
      type: "p",
      text: "A USB-C cable is a physical connector standard carrying any of several unrelated capability sets. Two cables with the same plug can differ by an order of magnitude in data rate and by a factor of five in power.",
    },
    {
      type: "table",
      caption: "What varies behind the same connector",
      head: ["Capability", "Range", "How to check"],
      rows: [
        [
          "Data rate",
          "USB 2.0 speeds up to Thunderbolt-class",
          "Cable markings or certification listing",
        ],
        ["Power delivery", "Up to 60 W, or up to 240 W with EPR cables", "Printed wattage rating"],
        [
          "Video output",
          "None, DisplayPort alt mode, or Thunderbolt",
          "Device and cable must both support it",
        ],
        [
          "Cable length",
          "Passive limits shorten as speed rises",
          "Active cables required beyond those limits",
        ],
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Buy certified, and label them",
      text: "Certification is the only reliable signal at purchase. After that, a printed label on the cable saves more time than any amount of testing later.",
    },
    { type: "h2", id: "docks", text: "Why docks expose the difference" },
    {
      type: "p",
      text: "A dock demands data, video and power simultaneously, so it is the first place an under-specified cable fails. A monitor that drops out under load or charges slowly is usually a cable problem, not a dock problem.",
    },
  ],
};
