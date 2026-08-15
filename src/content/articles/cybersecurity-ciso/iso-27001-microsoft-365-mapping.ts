import type { Article } from "../../types";

export const article: Article = {
  slug: "iso-27001-microsoft-365-mapping",
  category: "cybersecurity-ciso",
  contentType: "reference",
  subcategory: "Governance",
  title: "Mapping ISO 27001 Annex A controls to Microsoft 365 capabilities",
  metaDescription:
    "How to map ISO 27001:2022 Annex A controls onto Microsoft 365 and Entra ID capabilities without overstating what a technical control evidences.",
  standfirst:
    "A control is not implemented because a product feature exists. The mapping only holds if the configuration, the evidence and the review are all present.",
  excerpt:
    "A practical approach to mapping the 93 Annex A controls onto Microsoft 365 capabilities — and the mapping mistakes auditors reliably find.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-08-15",
  readingMinutes: 3,
  primaryKeyword: "iso 27001 microsoft 365 mapping",
  secondaryKeywords: ["Annex A controls Microsoft", "ISO 27001 Entra ID"],
  tags: ["Compliance", "Governance", "Microsoft 365", "ISO 27001"],
  reviewStatus: "research-based",
  relatedSlugs: ["conditional-access-framework", "eu-ai-act-obligations-timeline"],
  methodology:
    "Written from the published structure of ISO/IEC 27001:2022 Annex A and Microsoft's public product documentation. It is not certification advice and does not describe any organisation's implementation.",
  body: [
    {
      type: "p",
      text: "Mapping exercises fail in one specific way: a spreadsheet lists an Annex A control, names a Microsoft feature next to it, and marks the control implemented. The auditor then asks for the configuration, the evidence that it applies to everyone in scope, and the record of the last review — and two of the three do not exist.",
    },
    {
      type: "p",
      text: "A capability is not a control. The product feature is one of five things a defensible mapping row has to carry, and it is the easiest of the five to produce.",
    },
    { type: "h2", id: "structure", text: "What the 2022 revision changed" },
    {
      type: "p",
      text: "ISO/IEC 27001:2022 reorganised Annex A from 114 controls across 14 domains into 93 controls across four themes: Organisational, People, Physical and Technological. Eleven controls are entirely new, covering ground the 2013 edition predated — threat intelligence, cloud service security, data masking, secure development and monitoring activities among them.",
    },
    {
      type: "p",
      text: "The transition window closed on 31 October 2025, so 2013-based certificates are no longer valid. Any mapping spreadsheet still organised around the 14 old domains is mapping to a superseded structure, and that is worth checking before it is worth improving. Many teams are now running a second mapping alongside this one against [AI-specific obligations](/ai-enterprise-it/eu-ai-act-obligations-timeline); the evidence discipline below applies equally to both.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The new controls are where mappings are thinnest",
      text: "The eleven additions are the ones most often mapped to a licence rather than a configuration, because they are newest and the tooling story is least settled. They deserve the most scrutiny in a self-assessment, not the least.",
    },
    { type: "h2", id: "anatomy", text: "The anatomy of a mapping row" },
    {
      type: "p",
      text: "Treat each row as five obligations rather than one. If any column is empty, the control is not evidenced, whatever the spreadsheet says.",
    },
    {
      type: "table",
      caption: "What a defensible mapping row contains",
      head: ["Column", "Question it answers"],
      rows: [
        ["Control", "Which Annex A control is in scope"],
        ["Capability", "Which product feature implements it"],
        ["Configuration", "The specific setting, policy or scope applied"],
        ["Evidence", "The exportable artefact that demonstrates it"],
        ["Review", "Who checks it, how often, and when last"],
      ],
    },
    {
      type: "p",
      text: "The review column is the one that separates a live control from a snapshot. A configuration that was correct at certification and has drifted since is a finding, and drift is normal — policies get exclusions added, licences get reassigned, scopes get narrowed during an incident and never widened again.",
    },
    { type: "h2", id: "examples", text: "Representative mappings" },
    {
      type: "table",
      head: ["Annex A theme", "Capability", "Evidence to keep"],
      rows: [
        [
          "Identity and authentication",
          "Entra ID authentication methods and Conditional Access",
          "Policy export plus a sign-in report showing enforcement",
        ],
        [
          "Access control and review",
          "Entra ID access reviews and group governance",
          "Completed review records with decisions and reviewer",
        ],
        [
          "Endpoint protection",
          "Intune compliance policies and endpoint security baselines",
          "Compliance report by device with non-compliant exceptions",
        ],
        [
          "Logging and monitoring",
          "Unified audit log and retention configuration",
          "Retention settings plus a sample export for the period",
        ],
        [
          "Information classification",
          "Sensitivity labels and policies",
          "Label taxonomy, publication scope and usage report",
        ],
        [
          "Threat intelligence",
          "Defender threat analytics and incident reporting",
          "Record of what was reviewed, by whom, and what action followed",
        ],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Licensing determines what you can claim",
      text: "Several capabilities commonly used in mappings depend on specific licence tiers, and entitlement is frequently uneven across a workforce. Confirm the licence covers the whole population in scope before recording a control as implemented — partial coverage is a finding, not a rounding error.",
    },
    { type: "h2", id: "evidence", text: "Making the evidence reproducible" },
    {
      type: "p",
      text: "The practical test for an evidence artefact is whether someone else could regenerate it, six months from now, without asking you how. That rules out screenshots almost entirely, and it favours exports that carry their own scope and timestamp.",
    },
    {
      type: "ul",
      items: [
        "Prefer a policy export or an API query result over a portal screenshot. The export states what was configured; the screenshot states what one blade looked like.",
        'Capture the population the evidence covers, not just the setting. "MFA is required" and "MFA is required for these 1,430 of 1,430 in-scope accounts" answer different questions.',
        "Record the date and the person. An artefact with neither cannot support a claim about a review cycle.",
        "Store evidence outside the system it describes. Evidence held only in the tenant is unavailable during exactly the incident that makes someone ask for it.",
      ],
    },
    { type: "h2", id: "mistakes", text: "The mistakes auditors find" },
    {
      type: "ul",
      items: [
        "Policies in report-only mode recorded as enforcing controls.",
        "Exclusion groups that quietly remove a large part of the in-scope population.",
        "Evidence captured once at certification and never regenerated.",
        "Controls mapped to a capability that is licensed but not configured.",
        "One capability mapped to many controls, so a single misconfiguration silently invalidates a whole block of the statement of applicability.",
      ],
    },
    {
      type: "p",
      text: "That last one is the most expensive and the least visible. Conditional Access in particular tends to be named against a long list of controls; if it is, the configuration behind it needs evidence proportional to how much weight it is carrying, and a [deliberate policy framework](/microsoft-365-entra-id/conditional-access-framework) rather than an accumulation of individual rules.",
    },
  ],
  faq: [
    {
      question: "Does using Microsoft 365 make an organisation ISO 27001 compliant?",
      answer:
        "No. Microsoft's own certifications cover Microsoft's service, not your configuration of it. The controls in your statement of applicability are about how your organisation runs, and the evidence has to come from your tenant.",
    },
    {
      question: "Can one capability satisfy several Annex A controls?",
      answer:
        "Yes, and it commonly does — but each control still needs its own configuration, evidence and review entry. A shared capability concentrates risk: one misconfiguration then affects every control mapped to it.",
    },
    {
      question: "Is Compliance Manager enough on its own?",
      answer:
        "It is a useful starting inventory and a reasonable way to track improvement actions, but the score is generated from your tenant's configuration against a template. It does not decide scope, applicability or the adequacy of your evidence, and an auditor will ask about all three.",
    },
  ],
  sources: [
    {
      title: "ISO/IEC 27001:2022 Information security management systems",
      publisher: "ISO",
      url: "https://www.iso.org/standard/27001",
    },
    {
      title: "Microsoft Purview compliance documentation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/purview/",
    },
    {
      title: "ISO/IEC 27001:2022 — Microsoft compliance offering",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/compliance/regulatory/offering-iso-27001",
    },
  ],
};
