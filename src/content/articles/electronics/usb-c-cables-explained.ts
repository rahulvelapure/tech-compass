import type { Article } from "../../types";

export const article: Article = {
  slug: "usb-c-cables-explained",
  category: "electronics",
  contentType: "explainer",
  subcategory: "Standards",
  title: "USB-C, explained: why identical cables behave differently",
  seoTitle: "USB-C cables, explained",
  metaDescription:
    "Why USB-C cables that look identical differ in speed, power and video support, what an e-marker does, and how to buy one that works.",
  standfirst:
    "The plug is the standard. What the cable does through it is not, and two that look the same can be worlds apart.",
  excerpt:
    "A plain explanation of USB-C data rates, power delivery and alternate modes, and how to buy cables that do what you expect.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-22",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2028-08-28",
  readingMinutes: 4,
  primaryKeyword: "usb-c cable differences",
  secondaryKeywords: [
    "usb-c e-marker",
    "usb power delivery 240w",
    "displayport alt mode",
    "usb-c cable certification",
  ],
  tags: ["Electronics", "Hardware", "Standards"],
  reviewStatus: "research-based",
  draft: false,
  methodology:
    "Written from the published USB-IF specifications and connector certification documentation, verified August 2026. No cable is tested or recommended by brand, and no throughput measurements are quoted.",
  body: [
    {
      type: "p",
      text: "USB-C is a plug, not a promise. The same connector carries several sets of features that have little to do with each other. So two cables that look alike can differ ten times over in data rate, and five times over in power.",
    },
    {
      type: "p",
      text: "Nothing on the outside tells you which one you are holding. That is the whole problem, and it is why the same laptop charges quickly on one cable and slowly on another.",
    },
    { type: "h2", id: "three", text: "Three separate things travel down the same plug" },
    {
      type: "p",
      text: "It helps to stop thinking of a USB-C cable as one product. It is three capabilities that happen to share a connector, and a cable can be good at one and useless at another.",
    },
    {
      type: "ul",
      items: [
        "**Data.** Anything from USB 2.0 speeds up to the rates defined for USB4, depending on which wires are present.",
        "**Power.** From a basic default up to the 240 W that USB Power Delivery 3.1 defines, depending on the cable's rating.",
        "**Video.** DisplayPort Alt Mode, which reassigns some of the cable's high-speed pairs to carry a display signal.",
      ],
    },
    {
      type: "p",
      text: "A charging cable that came with a phone often carries only USB 2.0 data pairs. It will charge well and move files slowly, and it will not drive a monitor at all. That cable is not faulty. It was never built for the job.",
    },
    { type: "h2", id: "emarker", text: "The chip that decides how much power flows" },
    {
      type: "p",
      text: "Power is negotiated, not just supplied. The charger and the device agree a voltage and current before anything meaningful flows, and the cable gets a say.",
    },
    {
      type: "p",
      text: "Cables that carry more than 3 A contain an e-marker: a small chip that tells the devices what the cable can handle. Without it, the negotiation stays at the lower current, however capable the charger is.",
    },
    {
      type: "p",
      text: "This is why a 240 W charger can charge slowly. The charger is willing and the laptop is willing, but the cable in between has not declared that it can carry more, so both sides stay conservative. That behaviour is the standard working correctly.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Higher power came from higher voltage",
      text: "USB Power Delivery 3.1 added Extended Power Range, which reaches 240 W by raising the voltage to 48 V rather than pushing more current. Current stays at 5 A. That is why an EPR cable is specifically rated for it, and why an older 5 A cable is not automatically a 240 W cable.",
    },
    { type: "h2", id: "speed", text: "Why the fast cable is often the short one" },
    {
      type: "p",
      text: "High data rates are hard to hold over distance in a passive cable. Signal integrity falls off, and the specifications reflect that with shorter maximum lengths as the rate goes up.",
    },
    {
      type: "p",
      text: "So a two-metre passive cable and a half-metre passive cable can be built to different data capabilities on purpose. Longer runs at the top rates need an active cable, which contains electronics to keep the signal clean and costs more.",
    },
    {
      type: "p",
      text: "The practical version: if you want the highest speeds, buy short. If you need length, expect to buy an active cable and check what rate it claims.",
    },
    { type: "h2", id: "video", text: "Video needs the pairs that cheap cables leave out" },
    {
      type: "p",
      text: "DisplayPort Alt Mode works by handing some of the cable's high-speed pairs over to the display signal. A cable with no high-speed pairs has nothing to hand over.",
    },
    {
      type: "p",
      text: "That is the single most common reason a monitor does not appear. The port supports it, the monitor supports it, and the cable is a USB 2.0 charging lead.",
    },
    {
      type: "p",
      text: "A dock demands data, video and power simultaneously, so it is the first place an under-specified cable fails. A monitor that drops out under load or charges slowly is usually a cable problem, not a dock problem.",
    },
    { type: "h2", id: "buying", text: "How to buy without guessing" },
    {
      type: "p",
      text: "Certification is the only reliable signal at purchase. After that, a printed label on the cable saves more time than any amount of testing later.",
    },
    {
      type: "ol",
      items: [
        "Decide what the cable is for. Charging only, charging plus a monitor, or high-speed data. The answers lead to different cables.",
        "Look for USB-IF certification rather than a marketing claim. The certification logos state the data rate and the power rating.",
        "Match the power rating to your charger. A 100 W laptop needs a 5 A cable; a 240 W one needs an EPR-rated cable.",
        "Keep it short if you want top data rates, or buy an active cable and accept the cost.",
        "Label it the day it arrives. A marker pen on the connector housing outlasts any packaging.",
      ],
    },
    {
      type: "p",
      text: "For a managed fleet, standardise on one or two specifications and buy them centrally. Mixed cables in a shared drawer generate support tickets that look like hardware faults and are not.",
    },
    { type: "h2", id: "diagnose", text: "Diagnosing a suspect cable" },
    {
      type: "p",
      text: "Swap before you investigate. If a known-good cable fixes it, you are done, and you have learned more in thirty seconds than an hour of settings will teach you.",
    },
    {
      type: "p",
      text: "When you cannot swap, the symptoms separate cleanly. No video with working data means missing high-speed pairs. Slow charging with a capable charger means no e-marker or a lower rating. Data that drops at length means you are past what a passive cable holds.",
    },
  ],
  faq: [
    {
      question: "Why does my laptop charge slowly on one cable?",
      answer:
        "The cable is rated for less current, or it has no e-marker chip. Both sides then agree to stay low.",
    },
    {
      question: "Why does my monitor not work over USB-C?",
      answer:
        "The cable most likely has no high-speed pairs. A charging lead cannot carry a display signal.",
    },
    {
      question: "Does a thicker cable mean a faster one?",
      answer:
        "No. Thickness tells you about power and shielding. It says nothing about the data rate.",
    },
    {
      question: "Are all 240 W chargers the same?",
      answer: "The charger is only half of it. You need a cable rated for that range as well.",
    },
    {
      question: "Is an expensive cable always better?",
      answer: "No. Buy the rating you need. Look for the certification, not the price.",
    },
  ],
  sources: [
    {
      title: "USB Type-C Cable and Connector Specification",
      publisher: "USB Implementers Forum",
      url: "https://www.usb.org/document-library/usb-type-cr-cable-and-connector-specification-release-24",
    },
    {
      title: "USB Power Delivery",
      publisher: "USB Implementers Forum",
      url: "https://www.usb.org/document-library/usb-power-delivery",
    },
    {
      title: "USB-IF certified logo and product certification",
      publisher: "USB Implementers Forum",
      url: "https://www.usb.org/logo-license",
    },
  ],
};
