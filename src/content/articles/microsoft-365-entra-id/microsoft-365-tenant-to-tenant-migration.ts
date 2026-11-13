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
    "A tenant move is not just a mailbox copy. People, data, permissions and domains all have to land at once.",
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
  draft: false,
  methodology:
    "Verified against Microsoft Learn tenant-to-tenant migration, cross-tenant mailbox, OneDrive, SharePoint, Cross-Tenant Synchronization and Migration Orchestrator documentation current in August 2026. Outdated claims about broken OneDrive links, Teams migration scope, free/busy via synchronization and fixed project timelines were replaced with the current workload model.",
  body: [
    {
      type: "p",
      text: "It looks like a data move. On the plan, it is boxes and dates. In practice you are rebuilding identity, and everything that hangs off it.",
    },
    {
      type: "p",
      text: "Source and target are separate security boundaries. A user can exist in both. A mailbox can move, and so can a SharePoint site. What does not follow on its own is everything those objects were linked to.",
    },
    {
      type: "p",
      text: "That is why these projects fail in the same few places. The identity map has gaps. A target mailbox gets built too early. A domain moves before the things behind it are ready. Or a permission points at an object the target has no match for.",
    },
    {
      type: "h2",
      id: "scope",
      text: "Start with workloads, not users",
    },
    {
      type: "p",
      text: "Microsoft now frames this as a set of workload moves rather than one migration. The guidance covers Exchange Online mailboxes, OneDrive and SharePoint, and Migration Orchestrator ties the supported user workloads together. Scope matters here, because Teams chats and meetings take a different path from shared teams and channels.",
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
      text: "Identity comes first",
    },
    {
      type: "p",
      text: "Build the target identity model before you move any production data. Work out how each source user maps to a target user. Decide whether UPNs change. Then sort the groups into three piles: rebuilt, synced for now, and retired.",
    },
    {
      type: "p",
      text: "Microsoft Entra Cross-Tenant Synchronization can create and keep B2B users across the two tenants. Microsoft requires Entra ID P1 or P2 for it. It earns its place during coexistence, but it is not a migration engine.",
    },
    {
      type: "p",
      text: "That difference matters. Sync builds a link between two identities. It moves no mailbox, no SharePoint site and no device state. Each of those has its own way of moving.",
    },
    {
      type: "h2",
      id: "exchange",
      text: "Exchange has tighter rules than the old playbook says",
    },
    {
      type: "p",
      text: "Exchange Online can move mailboxes across tenants natively. The target user has to be prepared first. You also need both tenants configured, the identity mapping done, and the Cross Tenant User Data Migration licence in place.",
    },
    {
      type: "p",
      text: "Microsoft also lists the blockers, and they are worth reading early. A mailbox on hold does not move at all. Only user-visible content and the named recoverable items travel. Teams chat folder content does not come across as mailbox content.",
    },
    {
      type: "p",
      text: "Do not plan the cutover as one MX flip. There is a prepare phase, a move phase and a coexistence phase. Mail routing, source MailUsers, verified domains and target addresses all have to be tested together.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not license the target mailbox too early",
      text: "Microsoft is explicit about one order-of-operations trap. Assign the Exchange Online licence before the target MailUser is ready, and you get a brand new mailbox instead of a move. Do the identity mapping and the ExchangeGUID work first.",
    },
    {
      type: "h2",
      id: "sharepoint-onedrive",
      text: "SharePoint and OneDrive are not just file copies",
    },
    {
      type: "p",
      text: "The current tooling does more than older guides suggest. Migrated SharePoint file links can redirect to the target, so long as the migration and the identity mapping are set up correctly.",
    },
    {
      type: "p",
      text: "That does not mean everything survives. Site permissions ride on the identity map. External users have to exist in the target where you need them. Custom code, automation and integrations each need checking on their own.",
    },
    {
      type: "p",
      text: "OneDrive works much the same way. The content moves, but the user identity and the client setup still decide whether it works. Test the target site, the permissions, the sync client and any app references before you retire the source.",
    },
    {
      type: "h2",
      id: "teams",
      text: "Teams is really two problems",
    },
    {
      type: "p",
      text: "The first is personal data. Migration Orchestrator does support Teams chats and meetings, with caveats worth reading. The source content stays where it is, participant lists can change, and duplicate threads can show up.",
    },
    {
      type: "p",
      text: "The second is shared data. Teams and channels are not a user's chat history. Microsoft puts shared data like teams and channels out of scope for Cross-Tenant User Data Migration, so it needs its own plan.",
    },
    {
      type: "p",
      text: "That split kills a common mistake. â€œTeams is migratedâ€ means nothing as an acceptance test. Write one test each for chats, meetings, teams, channels, files, tabs, apps and permissions.",
    },
    {
      type: "h2",
      id: "security",
      text: "Rebuild the security rules on purpose",
    },
    {
      type: "p",
      text: "Conditional Access, authentication methods, admin roles and app registrations all belong to the target's own security model. Treat them as config to copy across and you miss the point: the target is a new trust boundary.",
    },
    {
      type: "p",
      text: "List the policies before cutover. Write down what each one is for, who it hits, who is excluded, the authentication strength, and how you get in when it all breaks. Then rebuild that set in the target and test it before anyone moves.",
    },
    {
      type: "p",
      text: "The same goes for Power Platform, enterprise apps, secrets, certificates and automation identities. The move is done when the workload runs under the target's identity and security model, not before.",
    },
    {
      type: "h2",
      id: "coexistence",
      text: "Coexistence is something you design",
    },
    {
      type: "p",
      text: "Big migrations rarely move everyone at once. Microsoft's planning guidance backs a phased move, and tells you to plan mail routing, calendar sharing and Teams federation for the period in between.",
    },
    {
      type: "p",
      text: "Cross-tenant access policies are changing how two tenants work together. Microsoft now documents the move off the older Exchange sharing setup. The new home is Microsoft 365 Cross-Tenant Access Policies, and it covers free/busy, calendars and MailTips.",
    },
    {
      type: "p",
      text: "So give coexistence an end date. Every temporary trust needs an owner, a reason, and the condition that removes it. Skip that and the migration leaves permanent cross-tenant access behind.",
    },
    {
      type: "h2",
      id: "devices",
      text: "Intune is its own track",
    },
    {
      type: "p",
      text: "Moving data across tenants does not move Intune's authority over the device. Anything enrolled in the source needs a plan for enrolling in the target. Depending on the device, that means changing the Entra join, reassigning Autopilot, or a reset and re-enrol.",
    },
    {
      type: "p",
      text: "Run endpoint migration as its own project. Test app deployment, BitLocker recovery, compliance, Conditional Access and whether the user profile survives. A mailbox cutover can go perfectly while the user still cannot get in from their managed laptop.",
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
        "A tenant move is an identity project first. The data moves hang off that.",
        "Cross-Tenant Synchronization handles identity. It does not move a mailbox or a SharePoint site.",
        "Current Microsoft tooling supports more native migration than older guides imply, but Teams and channels still need separate treatment.",
        "Identity mapping determines whether permissions and links survive in a useful form.",
        "Do not provision target Exchange or OneDrive objects before the migration workflow says to.",
        "Intune, Conditional Access and app integrations each cut over on their own. Plan them that way.",
      ],
    },
  ],
  faq: [
    {
      question: "Do users need new email addresses?",
      answer:
        "Not always. You can keep your domain. Just line up the domain transfer and the target prep with the rest of the move.",
    },
    {
      question: "Does Cross-Tenant Synchronization migrate mailboxes?",
      answer:
        "No. It only syncs who the user is. The data does not move. Exchange, OneDrive and SharePoint each go their own way.",
    },
    {
      question: "Do OneDrive links always break after a tenant move?",
      answer:
        "No. The tooling can add redirects, so old links still reach the file. That holds when the move is set up correctly.",
    },
    {
      question: "Can Teams chats be migrated?",
      answer:
        "Chats and meetings, yes. The tool is Migration Orchestrator. Expect a few threads to show up twice. Teams and channels are a separate job.",
    },
    {
      question: "Can an Intune-enrolled device simply be moved to the new tenant?",
      answer:
        "No. Devices are their own track. Plan how they enrol, how apps land, how compliance works, and how you recover them.",
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
