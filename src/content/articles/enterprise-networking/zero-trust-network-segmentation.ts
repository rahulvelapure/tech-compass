import type { Article } from "../../types";

export const article: Article = {
  slug: "zero-trust-network-segmentation",
  category: "enterprise-networking",
  contentType: "explainer",
  subcategory: "Zero Trust",
  title: "Network segmentation that survives contact with the business",
  seoTitle: "Network segmentation that works",
  metaDescription:
    "A practical approach to enterprise network segmentation: start from traffic you can observe, segment by blast radius, and avoid rules nobody can maintain.",
  standfirst:
    "Segmentation projects fail on maintenance, not design. The rule set has to be something an on-call engineer can reason about at 3am.",
  excerpt:
    "Why most segmentation designs collapse under change, and a staged approach that keeps the rule set small enough to maintain.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-16",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "network segmentation best practices",
  secondaryKeywords: ["zero trust segmentation", "microsegmentation enterprise"],
  tags: ["Networking", "Zero Trust", "Security Architecture"],
  reviewStatus: "research-based",
  methodology:
    "Based on published zero trust architecture guidance and vendor-neutral segmentation models. No client network is described.",
  body: [
    {
      type: "p",
      text: "The version of segmentation that works is unglamorous: a small number of zones with well-understood boundaries, chosen because a compromise in one should not reach the others. The version that fails is a per-application microsegmentation map produced once, never updated, and eventually bypassed by an any-any rule added during an outage.",
    },
    {
      type: "diagram",
      title: "Zone model by blast radius",
      ascii:
        "  [ User endpoints ]\n          |\n     (identity + posture)\n          v\n  [ Application tier ] ---- [ Management plane ]\n          |                        |\n     (service auth)          (jump / PAW only)\n          v                        v\n  [ Data tier ]            [ Backup + recovery ]",
      caption:
        "Boundaries are drawn where a compromise should stop, not where the org chart divides.",
    },
    { type: "h2", id: "observe-first", text: "Observe before you enforce" },
    {
      type: "p",
      text: "Every enforcement decision should be backed by flow data. Run the intended policy in monitor mode long enough to cover a full business cycle — month-end batch jobs are the classic thing that only appears once — then enforce.",
    },
    { type: "h2", id: "keep-it-small", text: "Keep the rule set legible" },
    {
      type: "table",
      caption: "Design choices and their maintenance cost",
      head: ["Choice", "Benefit", "Ongoing cost"],
      rows: [
        ["Few coarse zones", "Understandable, quick to audit", "Wider blast radius"],
        ["Per-application policy", "Tight containment", "High; drifts fast"],
        ["Identity-based policy", "Follows workloads", "Requires reliable identity for services"],
        ["IP-based policy", "Works everywhere", "Breaks on every re-addressing"],
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Write the exception process first",
      text: "Segmentation lives or dies on how exceptions are granted. If there is no fast, documented path, the fast undocumented path gets used instead.",
    },
  ],
};
