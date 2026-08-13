import type { Article } from "../../types";

export const article: Article = {
  slug: "wifi-6-vs-wifi-7",
  category: "comparisons",
  title: "Wi-Fi 6 vs Wi-Fi 7: what actually changes, and when to upgrade",
  metaDescription:
    "Wi-Fi 6 vs Wi-Fi 7 compared: 320 MHz channels, Multi-Link Operation and 4K-QAM explained, with a clear recommendation on when the upgrade is worth it.",
  standfirst:
    "Wi-Fi 7's headline numbers depend on conditions most homes and offices do not have. The features that matter in practice are less obvious.",
  excerpt:
    "The three real differences between Wi-Fi 6 and Wi-Fi 7, what each requires from your environment, and who should skip the upgrade entirely.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-01",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "wifi 6 vs wifi 7",
  secondaryKeywords: ["is wifi 7 worth it", "320 MHz channel", "multi-link operation"],
  tags: ["Networking", "Wi-Fi", "Hardware"],
  reviewStatus: "research-based",
  methodology:
    "Written from the IEEE 802.11be and 802.11ax specifications, Wi-Fi Alliance certification material and published regulatory spectrum allocations. No throughput testing was performed for this article.",
  body: [
    {
      type: "p",
      text: "Wi-Fi 7 (802.11be) is a real generational change, but almost every advertised figure assumes conditions that are rare outside a test chamber: a clean 320 MHz channel in the 6 GHz band, a client close to the access point, and a signal good enough for the highest modulation. Assess it on the three mechanisms instead.",
    },
    {
      type: "table",
      caption: "The three differences that matter",
      head: ["Mechanism", "What it does", "What it requires"],
      rows: [
        [
          "320 MHz channels",
          "Doubles maximum channel width over Wi-Fi 6E",
          "6 GHz spectrum availability, which varies by country",
        ],
        [
          "Multi-Link Operation",
          "Uses two bands simultaneously for one connection",
          "Client and AP support; the largest practical latency benefit",
        ],
        [
          "4K-QAM",
          "Packs more bits per symbol",
          "A very strong signal; benefit disappears with distance",
        ],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Multi-Link Operation is the interesting one",
      text: "Wider channels raise peak throughput in ideal conditions. MLO reduces the variance — fewer latency spikes when one band is congested. For video calls, remote desktop and gaming, consistency matters more than peak.",
    },
    { type: "h2", id: "who-should", text: "Who should upgrade" },
    {
      type: "ul",
      items: [
        "Anyone whose current equipment predates Wi-Fi 6 and who is replacing it anyway — buy the newer standard because the price gap is closing.",
        "Dense environments with many simultaneous clients, where 6 GHz spectrum is legally available and the building layout does not defeat it.",
        "Users with a multi-gigabit internet connection and wired backhaul who are currently limited by the wireless link.",
      ],
    },
    { type: "h2", id: "who-should-not", text: "Who should not" },
    {
      type: "ul",
      items: [
        "Anyone whose internet connection is slower than their current wireless throughput. The bottleneck is elsewhere.",
        "Homes where coverage, not speed, is the problem. More access points and better placement beat a newer standard.",
        "Estates whose client devices are overwhelmingly Wi-Fi 5 or Wi-Fi 6; the standard's benefits require capable clients.",
      ],
    },
    { type: "h2", id: "recommendation", text: "Recommendation" },
    {
      type: "p",
      text: "Do not replace working Wi-Fi 6 or 6E equipment to obtain Wi-Fi 7 today. Do buy Wi-Fi 7 when replacing older equipment, and prioritise Multi-Link Operation support and wired backhaul over the advertised peak figure. If 6 GHz is not available in your regulatory domain, most of the gain is not available either.",
    },
  ],
  faq: [
    {
      question: "Is Wi-Fi 7 backwards compatible?",
      answer:
        "Yes. Wi-Fi 7 access points serve Wi-Fi 6, 5 and older clients, which continue to operate at their own generation's capability.",
    },
    {
      question: "Do I need new devices to benefit from Wi-Fi 7?",
      answer:
        "Yes. The gains require Wi-Fi 7 clients. An older laptop connected to a Wi-Fi 7 access point does not become faster beyond incidental improvements from reduced contention.",
    },
  ],
  sources: [
    {
      title: "IEEE 802.11be overview",
      publisher: "IEEE",
      url: "https://standards.ieee.org/ieee/802.11be/7516/",
    },
    {
      title: "Wi-Fi CERTIFIED 7",
      publisher: "Wi-Fi Alliance",
      url: "https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7",
    },
  ],
};
