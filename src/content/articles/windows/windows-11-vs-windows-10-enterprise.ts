import type { Article } from "../../types";

export const article: Article = {
  slug: "windows-11-vs-windows-10-enterprise",
  category: "windows",
  contentType: "comparison",
  subcategory: "Deployment",
  title: "Windows 11 versus Windows 10 for enterprise fleets",
  seoTitle: "Windows 11 vs Windows 10 for enterprise",
  metaDescription:
    "Windows 10 support ended in October 2025. What the ESU runway covers, what it deliberately excludes, and where migration to Windows 11 actually gets blocked.",
  standfirst:
    "Windows 10 support ended in October 2025. For any fleet still running it, this stopped being a version comparison and became a countdown.",
  excerpt:
    "Windows 10 is out of support. What ESU covers, what it does not, and the hardware floor that turns this into a procurement project.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 3,
  primaryKeyword: "windows 11 vs windows 10 enterprise",
  secondaryKeywords: ["windows 11 migration", "windows 10 end of support"],
  tags: ["Windows", "Enterprise IT", "Endpoint Management"],
  reviewStatus: "research-based",
  relatedSlugs: ["group-policy-to-settings-catalog-migration", "entra-join-vs-hybrid-join"],
  methodology:
    "Compiled from Microsoft Learn lifecycle, ESU programme and enablement documentation, verified August 2026. Commercial ESU pricing is deliberately not quoted because it is contract- and channel-dependent; the structure of the programme is described instead. No benchmark figures are claimed.",
  body: [
    {
      type: "p",
      text: "This comparison changed character on 14 October 2025, when Windows 10 reached end of support. It is no longer a question of which version to standardise on. For any fleet still running Windows 10, the live questions are what the remaining devices cost, how long the paid runway lasts, and what the migration is actually blocked on.",
    },
    {
      type: "p",
      text: "The technical comparison still matters, because it explains why some devices cannot simply be upgraded in place. It is now the second question rather than the first.",
    },
    { type: "h2", id: "where-things-stand", text: "Where things stand" },
    {
      type: "table",
      caption: "Support position as at August 2026",
      head: ["Fleet position", "Status", "Consequence"],
      rows: [
        ["Windows 11, supported version", "In support", "Normal servicing"],
        [
          "Windows 10 22H2 with commercial ESU",
          "Paid security updates only",
          "No feature updates, no general technical support",
        ],
        [
          "Windows 10 22H2 without ESU",
          "Unsupported since 14 Oct 2025",
          "No security updates at all",
        ],
        [
          "Windows 10 LTSC/LTSB",
          "Separate lifecycle",
          "Not covered by the Windows 10 ESU programme",
        ],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "ESU is a runway, not a reprieve",
      text: "Extended Security Updates deliver Critical and Important security fixes and nothing else. No new features, no non-security quality updates, and no general technical support for Windows itself — support covers the ESU licensing and installation only.",
    },
    { type: "h2", id: "esu-mechanics", text: "What the ESU programme actually requires" },
    {
      type: "p",
      text: "The commercial path has prerequisites that are easy to miss, and getting them wrong is the usual reason a device silently stops receiving updates while still appearing enrolled.",
    },
    {
      type: "ul",
      items: [
        "The device must be running Windows 10 version 22H2. No other version is eligible.",
        "KB5066791 or later must be installed, and the ESU Licensing Preparation Package KB5072653 must be installed after it. The order matters.",
        "Coverage is sold by year and is cumulative. Year One began in November 2025; buying Year Two means paying for Year One as well. Partial periods cannot be purchased.",
        "Commercial and education organisations can receive updates for a maximum of three years past end of support.",
        "LTSC and LTSB releases are excluded — they run their own lifecycles and are not part of this programme.",
      ],
    },
    {
      type: "p",
      text: "Two exceptions change the arithmetic and are worth checking before buying anything. Windows 10 virtual machines in Azure Virtual Desktop are automatically eligible with no separate licence purchase, and existing Windows 365 Cloud PCs running 22H2 receive ESU at no additional cost. A physical device used only to connect to a licensed Cloud PC can inherit coverage that way.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The consumer programme is a different thing",
      text: "The consumer option — a one-off payment, 1,000 Microsoft Rewards points, or free by syncing PC settings with Windows Backup — requires a Microsoft Account and runs only to 13 October 2026. It explicitly excludes devices that are domain-joined, Entra-joined, in kiosk mode or MDM-managed. It is not a route for a managed fleet, and staff asking about it should be told so directly.",
    },
    {
      type: "h2",
      id: "technical-differences",
      text: "The differences that block an in-place upgrade",
    },
    {
      type: "table",
      caption: "Enterprise-relevant differences",
      head: ["Dimension", "Windows 10", "Windows 11"],
      rows: [
        [
          "Hardware floor",
          "Broad, older CPUs supported",
          "TPM 2.0, UEFI Secure Boot and a published CPU list",
        ],
        [
          "Virtualisation-based security",
          "Available, frequently off",
          "Enabled by default on supported hardware",
        ],
        ["Servicing", "Ended 14 Oct 2025", "Annual feature updates, in support"],
        [
          "Management surface",
          "MDM and Group Policy",
          "Same, with new settings reaching MDM first",
        ],
      ],
    },
    {
      type: "p",
      text: "The hardware floor is what turns a software migration into a procurement project. Devices failing the TPM or CPU check cannot be upgraded in place at all, and in most estates that group is larger than the first audit suggests — because the audit is usually run against an asset register rather than against what is actually checking in.",
    },
    { type: "h2", id: "migration-cost", text: "Where the migration effort actually is" },
    {
      type: "ol",
      items: [
        "Hardware eligibility auditing, run against devices that are actually reporting. The gap between that list and the asset register is itself the first finding.",
        "Kernel-mode application compatibility. Security agents, VPN clients and anything with a filter driver break first and are slowest to get vendor fixes.",
        "Re-baselining images, Autopilot profiles and configuration policies. Cheap if the build is already declarative, expensive if it depends on a captured image — and if settings still arrive by Group Policy, this is the moment the [migration to the settings catalog](/microsoft-intune/group-policy-to-settings-catalog-migration) stops being optional.",
        "The unsupported tail — appliances, lab machines, equipment controllers. Deciding whether each gets ESU, network isolation or replacement is a decision to make deliberately, not a discovery to make late.",
      ],
    },
    {
      type: "p",
      text: "For a fleet already past end of support, the honest sequencing is to establish which devices are covered today, isolate anything that is neither covered nor upgradeable, and treat the ESU spend as a countdown that is already running rather than a budget line that renews indefinitely.",
    },
  ],
  faq: [
    {
      question: "Is Windows 11 more secure than Windows 10?",
      answer:
        "On supported hardware it enables several protections by default that were optional on Windows 10, virtualisation-based security among them. Most can be configured on Windows 10 where the hardware allows, so the practical gap depends on how well the older fleet was hardened. The decisive difference now is simpler: Windows 10 receives no security updates at all without ESU.",
    },
    {
      question: "Can we keep Windows 10 on a few machines indefinitely?",
      answer:
        "Not with security updates. Commercial ESU covers a maximum of three years past end of support, is sold by year and is cumulative. Anything expected to run beyond that window needs either replacement or a containment plan that assumes the operating system is permanently unpatched.",
    },
    {
      question: "Does the consumer ESU option work for company laptops?",
      answer:
        "No. The consumer programme requires a Microsoft Account and explicitly excludes devices that are domain-joined, Entra-joined, kiosk-mode or MDM-managed. Managed devices must use the commercial licensing path.",
    },
    {
      question: "What happens to Windows 10 LTSC?",
      answer:
        "LTSC and LTSB releases have their own lifecycle dates and are not covered by the Windows 10 ESU programme. Each release needs checking individually against its Microsoft Lifecycle entry.",
    },
  ],
  sources: [
    {
      title: "Extended Security Updates (ESU) program for Windows 10",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/whats-new/extended-security-updates",
    },
    {
      title: "Enable Windows 10 Extended Security Updates (ESU) for physical machines",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/whats-new/enable-extended-security-updates",
    },
    {
      title: "Lifecycle FAQ - Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/lifecycle/faq/windows",
    },
    {
      title: "Windows 10 Consumer Extended Security Updates (ESU) program",
      publisher: "Microsoft",
      url: "https://www.microsoft.com/windows/extended-security-updates",
    },
  ],
};
