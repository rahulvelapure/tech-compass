import type { Article } from "../../types";

export const article: Article = {
  slug: "raspberry-pi-home-server",
  category: "gadgets",
  subcategory: "Home lab",
  title: "A small home server: what a single-board computer can and cannot do",
  seoTitle: "Single-board computer home servers",
  metaDescription:
    "An honest look at running a home server on a single-board computer: workloads that fit, the storage problem, and when to buy a used mini PC instead.",
  standfirst:
    "Single-board computers are excellent at a narrow set of always-on jobs and poor at almost everything storage-heavy.",
  excerpt:
    "Which home-server workloads genuinely suit a single-board computer, and where a used mini PC is the better purchase.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-06",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "raspberry pi home server",
  secondaryKeywords: ["single board computer home lab", "mini pc vs raspberry pi"],
  tags: ["Gadgets", "Home Lab", "Hardware"],
  reviewStatus: "research-based",
  methodology:
    "Written from published board specifications, interface bandwidth figures and power ratings. No benchmark results are claimed.",
  body: [
    {
      type: "p",
      text: "The appeal is real: low power draw, silence, and a board that costs less than a month of the cloud service it replaces. The limits are equally real, and nearly all of them are about storage bandwidth and memory.",
    },
    {
      type: "table",
      caption: "Workload suitability",
      head: ["Workload", "Suits a single-board computer?", "Why"],
      rows: [
        ["DNS filtering / ad blocking", "Yes", "Tiny resource footprint, benefits from always-on"],
        ["Home automation hub", "Yes", "Latency-sensitive, low throughput"],
        ["Lightweight VPN endpoint", "Yes", "Network-bound, modest CPU"],
        ["Media transcoding", "No", "Needs hardware encode and sustained throughput"],
        ["Large file server / NAS", "Marginal", "Storage bus and network bandwidth are the limits"],
        ["Local language models", "No", "Memory capacity and bandwidth are far too low"],
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Do not boot from a memory card",
      text: "Cards fail under sustained write load. Boot from an SSD over USB or a proper NVMe carrier if the board supports one.",
    },
    { type: "h2", id: "alternative", text: "When to buy a used mini PC instead" },
    {
      type: "p",
      text: "If the plan involves several containers, a database, or anything transcoding video, a second-hand small-form-factor business PC gives more memory, real SATA or NVMe storage and hardware media acceleration for a similar total cost. The power draw is higher but rarely decisive.",
    },
  ],
};
