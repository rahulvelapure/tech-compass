import type { Article } from "../../types";

export const article: Article = {
  slug: "microsoft-365-tenant-to-tenant-migration",
  category: "microsoft-365-entra-id",
  contentType: "decision-framework",
  subcategory: "Tenant Migration",
  title: "Microsoft 365 tenant-to-tenant migration: the technical reality",
  seoTitle: "Microsoft 365 Tenant Migration: Identity, Data, and Cutover Reality",
  metaDescription:
    "Tenant-to-tenant migration is an identity and workload reconstruction project. Learn how Exchange, OneDrive, SharePoint, Teams, domains and coexistence fit together.",
  standfirst:
    "A Microsoft 365 tenant migration is not a mailbox copy. It is a coordinated move of identities, data, permissions, domains and workload dependencies.",
  excerpt:
    "Microsoft now provides native cross-tenant tooling for several workloads, but the hard work remains identity mapping, coexistence, permissions, domain ownership and the parts that do not move cleanly.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "Microsoft 365 tenant migration",
  secondaryKeywords: [
    "cross-tenant mailbox migration",
    "Microsoft 365 consolidation",
    "cross-tenant OneDrive migration",
    "Microsoft 365 Migration Orchestrator",
  ],
  tags: ["Microsoft 365", "Entra ID", "Exchange Online", "SharePoint", "Teams", "Migration"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "entra-id-vs-active-directory-differences",
    "entra-join-vs-hybrid-join",
    "conditional-access-framework",
  ],
  draft: true,
  methodology:
    "Verified against Microsoft Learn tenant-to-tenant migration, cross-tenant mailbox, OneDrive, SharePoint, Cross-Tenant Synchronization and Migration Orchestrator documentation current in August 2026. Outdated claims about broken OneDrive links, Teams migration scope, free/busy via synchronization and fixed project timelines were replaced with the current workload model.",
  body: [
    {
      type: "p",
      text: "A Microsoft 365 tenant-to-tenant migration looks like a data move on a project plan. In practice, it is an identity and dependency reconstruction exercise.",
    },
    {
      type: "p",
      text: "The source and target tenants are separate security boundaries. A user can exist in both. A mailbox can move. A SharePoint site can move. But the relationships around those objects do not automatically become identical in the target.",
    },
    {
      type: "p",
      text: "That is why mergers, acquisitions, divestitures and tenant consolidations fail in predictable places. Identity mapping is incomplete. A target mailbox is provisioned too early. A domain is moved before dependencies are ready. A permission points at an object that has no equivalent target identity.",
    },
    {
      type: "h2",
      id: "scope",
      text: "Start with workloads, not users",
    },
    {
      type: "p",
      text: "Microsoft now documents tenant-to-tenant migration as a set of workload moves. Current Microsoft guidance includes Exchange Online mailboxes, OneDrive and SharePoint migrations, with Migration Orchestrator providing coordinated movement for supported user workloads. The exact workload scope matters because Teams chats and meetings have a different path from shared Teams and channels.",
    },
    {
      type: "table",
      caption: "A practical workload map",
      head: ["Workload", "What moves", "What needs separate planning"],
      rows: [
        [
          "Entra identities",
          "Target identities and mappings",
          "UPNs, groups, licenses, access policy and domain ownership",
        ],
        [
          "Exchange Online",
          "User-visible mailbox content",
          "Delegates, mail flow, holds, addresses and coexistence",
        ],
        [
          "OneDrive",
          "User files and site content",
          "Identity mapping, client transition and permissions",
        ],
        [
          "SharePoint",
          "Sites and content",
          "Identity mapping, permissions, customisation and links",
        ],
        [
          "Teams user data",
          "Supported chats and meetings in current orchestrator scope",
          "Duplicate threads, participant changes and out-of-scope shared data",
        ],
        [
          "Teams and channels",
          "Not the same as personal user data",
          "Shared channel and team data needs its own migration plan",
        ],
        [
          "Intune",
          "Not a tenant-to-tenant content copy",
          "Device re-enrollment and endpoint cutover",
        ],
      ],
    },
    {
      type: "h2",
      id: "identity",
      text: "Identity is the first dependency",
    },
    {
      type: "p",
      text: "Create the target identity model before moving production data. Decide how source users map to target users. Decide whether UPNs change. Decide which groups are recreated, which are synchronised temporarily and which are retired.",
    },
    {
      type: "p",
      text: "Microsoft Entra Cross-Tenant Synchronization can create and maintain B2B users between tenants. Current Microsoft documentation requires Entra ID P1 or P2 for cross-tenant user synchronization. It is useful for coexistence, but it is not a data migration engine.",
    },
    {
      type: "p",
      text: "The distinction matters. Synchronization creates an identity relationship. It does not move the source mailbox, SharePoint site or device management state. Those workloads have their own migration mechanics.",
    },
    {
      type: "h2",
      id: "exchange",
      text: "Exchange migration is more controlled than the old playbook suggests",
    },
    {
      type: "p",
      text: "Microsoft provides native cross-tenant mailbox migration through Exchange Online. The target user must be prepared correctly. The move requires the source and target configuration, identity mapping and the appropriate Cross Tenant User Data Migration license.",
    },
    {
      type: "p",
      text: "Current Microsoft documentation also lists important blockers. Mailboxes on hold are not migrated by the native cross-tenant mailbox feature. Only user-visible mailbox content and specified recoverable content moves. Teams chat folder content does not become migrated mailbox content.",
    },
    {
      type: "p",
      text: "Do not design cutover as a single MX-record flip. The migration has a preparation phase, a move phase and a coexistence phase. Mail routing, source MailUsers, verified domains and target addresses all need to be tested as a system.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not license the target mailbox too early",
      text: "Microsoft documents that assigning Exchange Online licensing before the target MailUser is correctly prepared can provision a new mailbox and break the expected move path. Identity mapping and ExchangeGUID preparation must precede that step.",
    },
    {
      type: "h2",
      id: "sharepoint-onedrive",
      text: "SharePoint and OneDrive are not simple file copies",
    },
    {
      type: "p",
      text: "The current Microsoft cross-tenant migration tooling is more capable than older migration guides suggest. In particular, migrated SharePoint file links can redirect to the target location when the migration and identity mapping are configured correctly.",
    },
    {
      type: "p",
      text: "That does not mean every dependency survives. Site permissions depend on identity mapping. External users need to exist in the target where required. Custom solutions, automation and integrations need separate validation.",
    },
    {
      type: "p",
      text: "OneDrive has a similar pattern. The content moves, but the user identity and client configuration still matter. A migration plan should test the target OneDrive site, permissions, sync client behaviour and application references before the source is retired.",
    },
    {
      type: "h2",
      id: "teams",
      text: "Teams has two very different migration problems",
    },
    {
      type: "p",
      text: "The first is personal user data. Microsoft Migration Orchestrator currently supports Teams chats and meetings in its supported workload set, with important caveats. Microsoft notes that source content remains, participant lists can change and duplicate threads can appear.",
    },
    {
      type: "p",
      text: "The second problem is shared Teams data. Teams and channels are not the same as a user chat history. Microsoft states that shared data such as Teams and channels is out of scope for the Cross-Tenant User Data Migration solution. That requires a separate plan.",
    },
    {
      type: "p",
      text: "This distinction fixes a common migration mistake. “Teams is migrated” is not a meaningful acceptance criterion. The project needs separate acceptance tests for chats, meetings, teams, channels, files, tabs, apps and permissions.",
    },
    {
      type: "h2",
      id: "security",
      text: "Security policy must be rebuilt deliberately",
    },
    {
      type: "p",
      text: "Conditional Access policies, authentication methods, administrative roles and application registrations belong to the target tenant security model. Treating them as copied configuration is dangerous because the target is a new trust boundary.",
    },
    {
      type: "p",
      text: "Build a policy inventory before cutover. Record policy intent, assignments, exclusions, authentication strengths and emergency access paths. Then recreate and test the target policy set before users are moved.",
    },
    {
      type: "p",
      text: "The same principle applies to Power Platform, enterprise applications, secrets, certificates and automation identities. A migration is complete only when the workload works under the target identity and security model.",
    },
    {
      type: "h2",
      id: "coexistence",
      text: "Coexistence is a design phase",
    },
    {
      type: "p",
      text: "Large migrations rarely move every user at once. Current Microsoft planning guidance supports phased migration and recommends planning mail routing, calendar sharing and Teams federation during coexistence.",
    },
    {
      type: "p",
      text: "Cross-tenant access policies are also changing how organisations manage collaboration between tenants. Microsoft now documents migration from older Exchange sharing mechanisms to Microsoft 365 Cross-Tenant Access Policies for free/busy, calendars and MailTips.",
    },
    {
      type: "p",
      text: "Coexistence therefore needs an explicit end date. Every temporary trust should have an owner, a purpose and a removal condition. Otherwise the migration leaves behind permanent cross-tenant access.",
    },
    {
      type: "h2",
      id: "devices",
      text: "Intune is a separate migration track",
    },
    {
      type: "p",
      text: "Tenant-to-tenant data migration does not transfer the device management authority of Intune. Devices enrolled in the source tenant need a target-tenant enrollment strategy. Depending on the device state, this can involve Entra join changes, Autopilot reassignment or a reset and re-enrollment workflow.",
    },
    {
      type: "p",
      text: "Treat endpoint migration as its own project. Test application deployment, BitLocker recovery, compliance, Conditional Access and user profile continuity. A mailbox cutover can be successful while the user is still unable to access the target environment from the managed device.",
    },
    {
      type: "h2",
      id: "sequence",
      text: "A safer migration sequence",
    },
    {
      type: "h2",
      id: "takeaway",
      text: "What to remember",
    },
    {
      type: "ul",
      items: [
        "Tenant migration is an identity project with workload-specific data moves.",
        "Cross-Tenant Synchronization is an identity mechanism, not a mailbox or SharePoint migration engine.",
        "Current Microsoft tooling supports more native migration than older guides imply, but Teams and channels still need separate treatment.",
        "Identity mapping determines whether permissions and links survive in a useful form.",
        "Do not provision target Exchange or OneDrive objects before the migration workflow says to.",
        "Treat Intune, Conditional Access and application integrations as separate cutover dependencies.",
      ],
    },
  ],
  faq: [
    {
      question: "Do users need new email addresses?",
      answer:
        "Not necessarily. An organisation can retain its production domain, but the domain transfer and target preparation must be coordinated with the migration sequence.",
    },
    {
      question: "Does Cross-Tenant Synchronization migrate mailboxes?",
      answer:
        "No. It synchronizes user identity information between tenants. Exchange, OneDrive and SharePoint have separate migration mechanisms.",
    },
    {
      question: "Do OneDrive links always break after a tenant move?",
      answer:
        "No. Current Microsoft cross-tenant OneDrive and SharePoint tooling can create redirects so migrated links continue to reach the target location when the migration is configured correctly.",
    },
    {
      question: "Can Teams chats be migrated?",
      answer:
        "Microsoft Migration Orchestrator supports Teams chats and meetings in its current supported workload set, but duplicate threads and participant changes can occur. Teams and channels are a separate scope.",
    },
    {
      question: "Can an Intune-enrolled device simply be moved to the new tenant?",
      answer:
        "No. Device management is a separate migration track. Plan target enrollment, application deployment, compliance and recovery workflows explicitly.",
    },
  ],
  sources: [
    {
      title: "Plan a Microsoft 365 tenant-to-tenant migration",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-tenant-to-tenant-migrations?view=o365-worldwide",
    },
    {
      title: "Cross-tenant mailbox migration",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/microsoft-365/migration/cross-tenant-mailbox-migration?view=o365-worldwide",
    },
    {
      title: "Migration orchestrator overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/microsoft-365/migration/migration-orchestrator-1-overview?view=o365-worldwide",
    },
    {
      title: "Cross-tenant OneDrive migration overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/microsoft-365/migration/cross-tenant-onedrive-migration?view=o365-worldwide",
    },
    {
      title: "Cross-tenant SharePoint migration FAQs",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/microsoft-365/migration/cross-tenant-sharepoint-migration-faqs?view=o365-worldwide",
    },
    {
      title: "Configure cross-tenant synchronization",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/cross-tenant-synchronization-configure",
    },
    {
      title: "Migrate to Microsoft 365 Cross-Tenant Access Policy",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/exchange/sharing/migrate-to-m365-xtap",
    },
  ],
};
