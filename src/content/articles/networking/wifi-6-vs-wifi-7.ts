import type { Article } from "../../types";

export const article: Article = {
  slug: "wifi-6-vs-wifi-7",
  category: "networking",
  contentType: "comparison",
  title: "Wi-Fi 6 vs Wi-Fi 7: what actually changes, and when to upgrade",
  seoTitle: "Wi-Fi 6 vs Wi-Fi 7: what actually changes",
  metaDescription:
    "Wi-Fi 7 is ratified and shipping, but the upgrade decision is decided by your spectrum allocation and client fleet — not by the access point you buy.",
  standfirst:
    "The standard is settled. What is not settled is whether your regulatory domain and your existing devices can give you any of what it promises.",
  excerpt:
    "The three mechanisms that separate Wi-Fi 7 from Wi-Fi 6, why the 6 GHz allocation in your country decides most of the outcome, and who should skip the upgrade.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-20",
  lastReviewedAt: "2026-08-20",
  nextReviewAt: "2027-08-20",
  readingMinutes: 5,
  primaryKeyword: "wifi 6 vs wifi 7",
  secondaryKeywords: [
    "is wifi 7 worth it",
    "320 MHz channel",
    "multi-link operation",
    "802.11be enterprise",
  ],
  tags: ["Networking", "Wi-Fi", "Hardware", "Enterprise IT"],
  reviewStatus: "research-based",
  relatedSlugs: ["windows-11-vs-windows-10-enterprise"],
  methodology:
    "Written from the IEEE 802.11be-2024 standard record, Wi-Fi Alliance certification material, and the EU implementing decision harmonising the lower 6 GHz band for RLAN use. The EU allocation is cited precisely because it is documented; allocations elsewhere are described in general terms rather than given as figures, because they vary by jurisdiction and continue to change — check the current position with your national regulator before planning channel width. No throughput testing was performed for this article, and no vendor performance claim is reproduced.",
  body: [
    {
      type: "p",
      text: "Wi-Fi 7 is no longer an emerging standard. IEEE Std 802.11be-2024 — formally Amendment 2, Enhancements for Extremely High Throughput — received board approval on 26 September 2024 and was published on 22 July 2025. The Wi-Fi Alliance introduced its Wi-Fi CERTIFIED 7 programme in 2024, ahead of that publication.",
    },
    {
      type: "p",
      text: "That ordering is routine for 802.11. Certification and ratification are separate milestones: the Alliance's badge attests that a product passed an interoperability programme, not that it implements a published IEEE amendment in full. The consequence is not that early hardware is defective, but that the badge alone does not tell you which optional capabilities a product supports.",
    },
    {
      type: "p",
      text: "So the interesting question is not whether the technology is real. It is whether the three mechanisms that distinguish it from Wi-Fi 6 can do anything useful in your building, in your country, for the devices you already own. For many readers, two of the three are unavailable and the third is the only one worth paying for.",
    },
    { type: "h2", id: "mechanisms", text: "The three mechanisms that matter" },
    {
      type: "table",
      caption: "What separates Wi-Fi 7 from Wi-Fi 6, and what each one demands",
      head: ["Mechanism", "What it does", "What it requires to deliver"],
      rows: [
        [
          "320 MHz channels",
          "Doubles the maximum channel width available under Wi-Fi 6E",
          "Enough contiguous 6 GHz spectrum to use it more than once across a site",
        ],
        [
          "Multi-Link Operation (MLO)",
          "Runs one logical connection across two bands at once",
          "Support at both ends; the only feature that improves consistency rather than peak rate",
        ],
        [
          "4096-QAM (4K-QAM)",
          "Carries more bits per symbol",
          "A very high signal-to-noise ratio, so in practice proximity to the access point",
        ],
      ],
    },
    {
      type: "p",
      text: "Treat headline throughput figures with suspicion. The specification's maximum is an aggregate laboratory ceiling across every band at once — not a rate any single client sees, and not a number to size a network against. Marketing figures are usually higher still, summing the theoretical maxima of every radio in the product.",
    },
    {
      type: "callout",
      variant: "note",
      title: "MLO is the mechanism worth buying for",
      text: "Wider channels and denser modulation raise peak throughput in good conditions. Multi-Link Operation reduces variance — fewer latency spikes when one band becomes congested, and faster recovery when it does. For video calls, remote desktop, VoIP and interactive applications, consistency is worth more than peak, and it is the benefit most likely to survive contact with a real building.",
    },
    { type: "h2", id: "spectrum", text: "Your regulator decides most of this" },
    {
      type: "p",
      text: "The 320 MHz channel is the feature that sells Wi-Fi 7 and the one most often unavailable. It requires 6 GHz spectrum, and the amount of 6 GHz spectrum released for unlicensed use varies sharply by jurisdiction.",
    },
    {
      type: "table",
      caption: "Why the same access point behaves differently in two countries",
      head: ["Allocation", "Harmonised for RLAN use", "Practical consequence for 320 MHz"],
      rows: [
        [
          "European Union",
          "5,945–6,425 MHz — 480 MHz, the lower part of the band",
          "Room for one 320 MHz channel, so it cannot be reused across adjacent APs",
        ],
        [
          "Jurisdictions that opened the whole band",
          "Substantially more, though the exact allocation varies",
          "Several non-overlapping 320 MHz channels, so reuse across a site is possible",
        ],
      ],
    },
    {
      type: "p",
      text: "The first row is the finding that should change a deployment plan. One 320 MHz channel serves one access point. The moment a second AP within earshot also wants 320 MHz, the two occupy the same spectrum and contend with each other, and the wide channel costs more in interference than it returns in throughput. In a multi-AP estate under the EU allocation, the correct configuration is usually a narrower channel — meaning the flagship feature is one you deliberately turn off.",
    },
    { type: "h2", id: "certification", text: "The badge is not a feature list" },
    {
      type: "p",
      text: "Two products can both carry Wi-Fi 7 branding and behave very differently, because several of the mechanisms above are conditional on hardware and on the bands a product supports. Multi-Link Operation in particular is a family of behaviours rather than a single switch, and 320 MHz support is meaningless on a device without a 6 GHz radio.",
    },
    {
      type: "p",
      text: "For a home purchase this rarely matters. For an estate refresh it does, because a mixed fleet behaves inconsistently in exactly the scenarios you bought the equipment to improve. Ask which bands the radio covers, which MLO behaviours are implemented, and whether 320 MHz is supported in your regulatory domain — in writing, not from a datasheet headline.",
    },
    { type: "h2", id: "clients", text: "The client fleet decides the outcome" },
    {
      type: "p",
      text: "None of these mechanisms work one-ended. A Wi-Fi 7 access point serving Wi-Fi 6 laptops delivers Wi-Fi 6 to those laptops. Older clients benefit only indirectly: as newer devices finish faster or move to 6 GHz, less contention is left behind. That is real, but second-order, and it does not justify a refresh on its own.",
    },
    {
      type: "p",
      text: "In practice an enterprise fleet's wireless generation turns over with the laptop replacement cycle rather than the network refresh, so the capability of your estate is largely decided by a procurement choice made for other reasons. Organisations already working through the [Windows 11 hardware refresh](/windows/windows-11-vs-windows-10-enterprise) are replacing clients anyway, and that is when specifying the wireless generation costs almost nothing. Buying access points ahead of that cycle means paying early for capability nothing can use.",
    },
    { type: "h2", id: "who-should", text: "Who should upgrade" },
    {
      type: "ul",
      items: [
        "Anyone replacing pre-Wi-Fi 6 equipment anyway. The price premium for the current generation has largely closed, and buying backwards is a false economy.",
        "Dense environments — lecture halls, open-plan floors, conference space — where 6 GHz is available and the client mix is genuinely modern.",
        "Sites where a multi-gigabit uplink and wired backhaul mean the wireless link is demonstrably the bottleneck, which is worth measuring rather than assuming.",
        "Deployments where latency consistency is the requirement, since MLO is the one mechanism that addresses it directly.",
      ],
    },
    { type: "h2", id: "who-should-not", text: "Who should not" },
    {
      type: "ul",
      items: [
        "Anyone whose internet connection is slower than their current wireless throughput. The constraint is upstream and a new access point will not move it.",
        "Sites where the complaint is coverage rather than speed. More access points, better placement and a survey beat a newer standard every time, and cost less.",
        "Estates whose clients are overwhelmingly Wi-Fi 5 or Wi-Fi 6, until the client refresh is at least underway.",
      ],
    },
    { type: "h2", id: "waiting", text: "Is it worth waiting for the next generation?" },
    {
      type: "p",
      text: "No, and the working group's own schedule is the reason. The next amendment, 802.11bn, was authorised in September 2023 and is still in draft — the published IEEE 802.11 project timeline shows Draft 2.0, with sponsor balloting ahead of it and Standards Board approval projected for May 2028. Its designation, Ultra High Reliability, signals where the effort is going: consistency rather than peak rate. A standard still two years from approval is longer than that from a mature client fleet, so deferring a needed refresh buys nothing you can deploy.",
    },
    { type: "h2", id: "recommendation", text: "Recommendation" },
    {
      type: "p",
      text: "Do not replace working Wi-Fi 6 or 6E equipment to obtain Wi-Fi 7. Do buy it when replacing anything older, weighting the decision towards Multi-Link Operation support, 6 GHz radio coverage and the quality of the wired backhaul rather than the advertised peak rate. Plan channel width for reuse across the site, not for the best single-AP number. Where 6 GHz is not meaningfully available, most of the generational gain is not either — and the budget is better spent on access point density and cabling.",
    },
  ],
  faq: [
    {
      question: "Is Wi-Fi 7 backwards compatible?",
      answer:
        "Yes. Wi-Fi 7 access points serve Wi-Fi 6, 5 and older clients, which continue to operate at their own generation's capability. Nothing needs replacing on day one.",
    },
    {
      question: "Do I need new devices to benefit from Wi-Fi 7?",
      answer:
        "Yes. The mechanisms are negotiated between both ends, so an older laptop on a Wi-Fi 7 access point does not become faster except incidentally, through reduced contention as newer devices clear the air more quickly.",
    },
    {
      question: "Does Wi-Fi 7 improve range?",
      answer:
        "Not materially. Range is governed by frequency, power limits and physical obstruction rather than by the generation of the standard, and 6 GHz propagates less well through walls than 5 GHz. Coverage problems are solved with more access points and better placement, not a newer standard.",
    },
  ],
  sources: [
    {
      title: "IEEE 802.11be-2024 standard",
      publisher: "IEEE",
      url: "https://standards.ieee.org/ieee/802.11be/7516/",
    },
    {
      title: "Wi-Fi CERTIFIED 7",
      publisher: "Wi-Fi Alliance",
      url: "https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7",
    },
    {
      title: "IEEE 802.11 Working Group project timelines",
      publisher: "IEEE 802.11",
      url: "https://www.ieee802.org/11/Reports/802.11_Timelines.htm",
    },
    {
      title:
        "Commission Implementing Decision (EU) 2021/1067 on the harmonised use of radio spectrum in the 5945-6425 MHz band",
      publisher: "EUR-Lex",
      url: "https://eur-lex.europa.eu/eli/dec_impl/2021/1067/oj",
    },
  ],
};
