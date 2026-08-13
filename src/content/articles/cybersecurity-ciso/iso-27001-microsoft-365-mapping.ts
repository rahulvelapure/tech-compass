import type { Article } from "../../types";

export const article: Article = {
  slug: "iso-27001-microsoft-365-mapping",
  category: "cybersecurity-ciso",
  subcategory: "Governance",
  title: "Mapping ISO 27001 Annex A controls to Microsoft 365 capabilities",
  metaDescription:
    "How to map ISO 27001:2022 Annex A controls onto Microsoft 365 and Entra ID capabilities without overstating what a technical control evidences.",
  standfirst:
    "A control is not implemented because a product feature exists. The mapping only holds if the configuration, the evidence and the review are all present.",
  excerpt:
    "A practical approach to mapping ISO 27001:2022 Annex A onto Microsoft 365 capabilities — and the mapping mistakes auditors reliably find.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-08",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "iso 27001 microsoft 365 mapping",
  secondaryKeywords: ["Annex A controls Microsoft", "ISO 27001 Entra ID"],
  tags: ["Compliance", "Governance", "Microsoft 365", "ISO 27001"],
  reviewStatus: "research-based",
  methodology:
    "Written from the published structure of ISO/IEC 27001:2022 Annex A and Microsoft's public product documentation. It is not certification advice and does not describe any organisation's implementation.",
  body: [
    {
      type: "p",
      text: "Mapping exercises fail in one specific way: a spreadsheet lists an Annex A control, names a Microsoft feature next to it, and marks the control implemented. The auditor then asks for the configuration, the evidence that it applies to everyone in scope, and the record of the last review — and two of the three do not exist.",
    },
    {
      type: "p",
      text: "Treat each mapping row as three obligations, not one.",
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
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Licensing determines what you can claim",
      text: "Several capabilities commonly used in mappings depend on specific licence tiers. Confirm the entitlement for the population in scope before recording a control as implemented — partial coverage is a finding.",
    },
    { type: "h2", id: "mistakes", text: "The mistakes auditors find" },
    {
      type: "ul",
      items: [
        "Policies in report-only mode recorded as enforcing controls.",
        "Exclusion groups that quietly remove a large part of the in-scope population.",
        "Evidence captured once at certification and never regenerated.",
        "Controls mapped to a capability that is licensed but not configured.",
      ],
    },
  ],
  sources: [
    {
      title: "ISO/IEC 27001:2022",
      publisher: "ISO",
      url: "https://www.iso.org/standard/27001",
    },
    {
      title: "Microsoft Purview compliance documentation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/purview/",
    },
  ],
};
