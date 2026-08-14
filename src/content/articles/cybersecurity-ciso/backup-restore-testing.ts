import type { Article } from "../../types";

export const article: Article = {
  slug: "backup-restore-testing",
  category: "cybersecurity-ciso",
  contentType: "how-to",
  subcategory: "Resilience",
  title: "How to test backups properly: a restore drill you can run quarterly",
  seoTitle: "How to test backups: a restore drill",
  metaDescription:
    "A repeatable quarterly restore drill: choose a realistic scenario, restore to an isolated environment, measure the time, and record what broke.",
  standfirst: "An untested backup is a hypothesis. The drill is what turns it into a capability.",
  excerpt:
    "A concrete restore drill you can run every quarter, including what to measure and what evidence to keep.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-02",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "backup restore testing",
  secondaryKeywords: ["restore drill procedure", "test backups regularly"],
  tags: ["Resilience", "Security", "Operations", "Troubleshooting"],
  reviewStatus: "research-based",
  methodology:
    "Built from published backup and disaster recovery guidance and standard resilience testing practice. No client environment is described.",
  body: [
    {
      type: "p",
      text: "Backup jobs report success against their own definition of success: bytes written. A restore drill measures the only thing that matters — whether a working system can be reconstructed inside the time the business assumes.",
    },
    { type: "h2", id: "scenario", text: "Pick one realistic scenario" },
    {
      type: "ul",
      items: [
        "A single deleted record set, restored to a point in time — the most common real request.",
        "A whole system lost, restored to different hardware or a different region.",
        "A ransomware scenario in which the most recent backups are assumed compromised.",
      ],
    },
    { type: "h2", id: "procedure", text: "The drill" },
    {
      type: "ol",
      items: [
        "Restore into an isolated network. Never restore over the live system to test it.",
        "Start the clock when the decision is made, not when the restore command runs — the delay before that is part of your real recovery time.",
        "Validate at the application layer: log in, run a transaction, check integrity. A mounted volume is not a restored service.",
        "Record the measured recovery time against the stated objective, and note every manual step that was needed.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Test the credentials too",
      text: "Recovery frequently stalls because the restore requires access to a system that is itself down, or a credential stored only in the environment being recovered.",
    },
    { type: "h2", id: "evidence", text: "Keep the evidence" },
    {
      type: "p",
      text: "A dated record of each drill — scenario, measured time, failures found, fixes made — is the artefact auditors ask for and the argument that funds the next improvement.",
    },
  ],
  faq: [
    {
      question: "How often should restores be tested?",
      answer:
        "Quarterly for critical systems is a common and defensible cadence, with an additional drill after any significant architecture or tooling change. The important part is that the interval is fixed and the results are recorded.",
    },
  ],
};
