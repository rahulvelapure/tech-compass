import type { Article } from "../../types";

export const article: Article = {
  slug: "password-managers-for-teams",
  category: "reviews",
  subcategory: "Security tooling",
  title: "Team password managers: what to assess before you standardise",
  seoTitle: "Team password managers: what to assess",
  metaDescription:
    "An assessment framework for team password managers: recovery model, admin controls, audit logging, provisioning and the failure modes that matter.",
  standfirst:
    "Every product demos well. The differences appear in recovery, provisioning and what happens when someone leaves.",
  excerpt:
    "The evaluation criteria that separate team password managers once you get past the feature grid.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-04",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "team password manager comparison",
  secondaryKeywords: ["business password manager", "password manager for it teams"],
  tags: ["Security", "Identity", "Tooling"],
  reviewStatus: "research-based",
  methodology:
    "An evaluation framework built from vendor documentation and published security architecture descriptions. No product is scored, because scoring without standardised hands-on testing across every candidate would be misleading.",
  body: [
    {
      type: "p",
      text: "This is deliberately not a ranked list. Scoring products without testing all of them under the same conditions produces a number that looks authoritative and is not. What follows is the assessment structure to apply to any candidate.",
    },
    { type: "h2", id: "recovery", text: "Recovery model" },
    {
      type: "p",
      text: "Ask what happens when a user loses every factor. If the vendor can restore access, they can also be compelled to. If they cannot, your organisation needs an internal recovery custodian and a documented process. Both are defensible; not knowing which one you have is not.",
    },
    { type: "h2", id: "provisioning", text: "Provisioning and deprovisioning" },
    {
      type: "ul",
      items: [
        "SCIM provisioning from your identity provider, so leavers lose access with the rest of their accounts.",
        "Shared vault ownership that survives an owner's departure without an administrator improvising.",
        "Enforced separation between personal and organisational items.",
      ],
    },
    { type: "h2", id: "audit", text: "Audit and evidence" },
    {
      type: "p",
      text: "Compliance work needs exportable logs of who accessed which shared secret and when, with retention you control. A log visible only in a web console for 30 days will not satisfy an auditor.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Watch the browser extension permissions",
      text: "The extension is the largest attack surface in every one of these products. Review its permission model and update cadence as carefully as the vault architecture.",
    },
  ],
};
