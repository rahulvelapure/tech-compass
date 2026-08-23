import type { Article } from "../../types";

export const article: Article = {
  slug: "ransomware-recovery-backups-immutable-ad-forest",
  category: "cybersecurity-ciso",
  contentType: "decision-framework",
  subcategory: "Resilience",
  title: "Ransomware recovery: why backups alone are not enough",
  seoTitle: "Ransomware Recovery: Backups, Identity, and Forest Recovery",
  metaDescription:
    "Backups are necessary for ransomware recovery, but they do not rebuild identity, DNS or application dependencies. Learn the recovery order that makes backups usable.",
  standfirst:
    "A recoverable backup is only one part of ransomware resilience. Recovery also depends on clean identity, DNS, management planes and a rehearsed rebuild sequence.",
  excerpt:
    "Ransomware recovery fails when teams restore data before they restore the systems that authenticate, resolve and control it. Build recovery around dependencies, not backup jobs alone.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 4,
  primaryKeyword: "ransomware recovery strategy",
  secondaryKeywords: [
    "immutable backups",
    "Active Directory forest recovery",
    "ransomware backup recovery",
    "backup air gap",
    "identity recovery",
  ],
  tags: [
    "Cybersecurity",
    "Ransomware",
    "Backup",
    "Active Directory",
    "Disaster Recovery",
    "Resilience",
  ],
  reviewStatus: "research-based",
  relatedSlugs: [
    "backup-restore-testing",
    "bitlocker-tpm-failure-recovery-enterprise",
    "entra-id-pim-implementation-failures",
  ],
  draft: true,
  methodology:
    "Verified against Microsoft Active Directory forest recovery guidance for Windows Server 2025, AWS S3 Object Lock documentation, current Azure Backup immutability guidance and CISA ransomware recovery guidance. Unsourced recovery timelines, generic attacker statistics and fixed dwell-time assumptions were removed.",
  body: [
    {
      type: "p",
      text: "The phrase “restore from backup” hides the hardest part of ransomware recovery. A backup can preserve data while the environment needed to use that data remains compromised.",
    },
    {
      type: "p",
      text: "A serious recovery plan must restore more than files. It must restore identity, DNS, network control, privileged access, management systems, applications and data in an order that avoids rebuilding on top of a compromised foundation.",
    },
    {
      type: "p",
      text: "That changes how backup architecture should be evaluated. The question is not only whether a backup exists. The question is whether an attacker who owns production can also destroy, alter or authenticate to the system that protects it.",
    },
    {
      type: "h2",
      id: "scope",
      text: "The recovery dependency chain",
    },
    {
      type: "table",
      caption: "What has to come back, and why",
      head: ["Layer", "Recovery purpose", "Typical dependency"],
      rows: [
        ["Identity", "Authenticate administrators and services", "AD or cloud identity"],
        ["DNS", "Resolve service names", "DNS servers and records"],
        ["Network", "Reach recovered systems", "Routers, firewalls and segmentation"],
        ["Management", "Deploy and control systems", "Backup, virtualization and endpoint tools"],
        ["Applications", "Restore business functions", "Databases, service accounts and APIs"],
        ["Data", "Recover business information", "Immutable and tested backups"],
      ],
    },
    {
      type: "p",
      text: "The order is not universal. A cloud-native service may not depend on Active Directory. A Windows enterprise may depend on AD for almost everything. The recovery plan should therefore document dependencies per critical service.",
    },
    {
      type: "h2",
      id: "immutable",
      text: "Immutability changes the attacker problem",
    },
    {
      type: "p",
      text: "A backup repository connected to production is still part of the attack surface. If privileged credentials can delete recovery points, the backup job can succeed every night and still fail when the incident arrives.",
    },
    {
      type: "p",
      text: "S3 Object Lock provides storage-layer retention. In Compliance mode, a protected object version cannot be overwritten or deleted by a user, including the AWS account root user, until the retention period expires. Azure Backup provides a similar immutable-vault model, with a locked state that makes immutability irreversible.",
    },
    {
      type: "p",
      text: "The important design principle is enforcement below the backup application. If the backup application can delete the data, compromising the application can become a backup-destruction path. Storage-level immutability narrows that path.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Immutability is not the same as isolation",
      text: "Immutable storage can protect recovery points from deletion. It does not automatically protect the management plane, credentials, network paths or encryption keys. Keep at least one recovery path outside the same administrative blast radius where practical.",
    },
    {
      type: "h2",
      id: "airgap",
      text: "Air gaps reduce shared blast radius",
    },
    {
      type: "p",
      text: "An offline backup is not reachable through the production network. A logically isolated copy can provide a similar property when it uses a separate account, separate credentials and no unnecessary network trust.",
    },
    {
      type: "p",
      text: "CISA recommends offline backups and regular restoration testing. The reason is simple. Ransomware operators deliberately search for accessible backups because destroying them increases pressure on the victim.",
    },
    {
      type: "p",
      text: "Do not confuse a second backup job with a second trust boundary. Two repositories using the same domain administrator and the same management console are still one administrative failure domain.",
    },
    {
      type: "h2",
      id: "ad",
      text: "Active Directory recovery is a specialised operation",
    },
    {
      type: "p",
      text: "When a forest is compromised, the first restored domain controller must be treated as a recovery asset, not as another server to join casually to the production network.",
    },
    {
      type: "p",
      text: "Microsoft documents forest recovery for Windows Server 2025 and earlier supported releases. The process includes restoring the first writable domain controller, verifying the restored state before reconnecting it, resetting administrative credentials and recovering the remaining domain controllers.",
    },
    {
      type: "p",
      text: "The krbtgt account is central to Kerberos ticket signing. Microsoft documents resetting its password twice during forest recovery. The current guidance says to wait 10 hours between resets under the default ticket lifetime settings, or longer if those policies are configured with a longer lifetime.",
    },
    {
      type: "p",
      text: "The recovery procedure also addresses trust passwords, computer account passwords, global catalog state and metadata cleanup. This is why a forest recovery document should be treated as an executable runbook rather than a paragraph in a disaster recovery policy.",
    },
    {
      type: "h2",
      id: "identity",
      text: "Cloud identity changes the recovery boundary",
    },
    {
      type: "p",
      text: "Modern enterprises often depend on Microsoft Entra ID, Okta or another cloud identity provider alongside AD. Recovery must therefore include administrative accounts, application registrations, privileged roles, Conditional Access and session revocation.",
    },
    {
      type: "p",
      text: "Hybrid identity needs extra care. A compromised on-premises directory can affect the cloud through synchronization. A cloud compromise can create new application permissions or administrative access without changing a domain controller.",
    },
    {
      type: "p",
      text: "Build an identity recovery checklist for both planes. Record emergency access accounts, privileged roles, synchronization configuration, application registrations and the process for invalidating attacker-controlled sessions.",
    },
    {
      type: "h2",
      id: "sequence",
      text: "A recovery sequence that follows dependencies",
    },
    {
      type: "p",
      text: "The sequence is intentionally conservative. A faster sequence is not better if it reconnects compromised systems and forces a second recovery.",
    },
    {
      type: "h2",
      id: "testing",
      text: "A backup is only useful if recovery is executable",
    },
    {
      type: "p",
      text: "CISA recommends regularly testing backup availability and integrity. A restore test should go beyond proving that a file can be read. Restore a representative system. Verify that it boots, authenticates, resolves dependencies and behaves like the service it is supposed to replace.",
    },
    {
      type: "p",
      text: "For AD, conduct a forest recovery exercise. For cloud backup, test recovery into an isolated subscription or account where the service supports it. For applications, document which secrets, certificates, DNS records and external APIs are required after restore.",
    },
    {
      type: "p",
      text: "Keep the recovery documentation outside the production identity system. If the network is unavailable, a wiki that requires the same identity system is not a recovery document.",
    },
    {
      type: "h2",
      id: "takeaway",
      text: "What to remember",
    },
    {
      type: "ul",
      items: [
        "Backups protect data, not the entire computing environment.",
        "Storage-level immutability reduces the risk that compromised administrators can delete recovery points.",
        "A second copy is valuable only when it reduces shared administrative and network trust.",
        "Active Directory forest recovery is a specialised procedure that must be rehearsed.",
        "Cloud identity and application registrations belong in the recovery plan.",
        "Recovery tests must validate dependencies, not just the existence of backup files.",
      ],
    },
  ],
  faq: [
    {
      question: "Are immutable backups enough for ransomware recovery?",
      answer:
        "No. They protect recovery points from destructive changes, but recovery still depends on clean identity, DNS, management systems, applications and tested procedures.",
    },
    {
      question: "Why is Active Directory part of backup recovery?",
      answer:
        "In many Windows environments, AD authenticates users and services and controls access to systems. If the identity foundation is compromised, restored servers may still be unusable or unsafe.",
    },
    {
      question: "How many times should krbtgt be reset during forest recovery?",
      answer:
        "Microsoft documents two resets, with a waiting period between them based on the configured Kerberos ticket lifetime. Under the default settings, the current guidance specifies 10 hours.",
    },
    {
      question: "Should one backup copy be offline?",
      answer:
        "CISA recommends offline backups. A separate account or environment with independent authentication can also reduce the shared blast radius, but the exact design should match the threat model.",
    },
    {
      question: "How often should ransomware recovery be tested?",
      answer:
        "The important requirement is regular testing. Critical organisations should exercise both backup restoration and the identity recovery procedure on a planned schedule rather than waiting for an incident.",
    },
  ],
  sources: [
    {
      title: "Active Directory Forest Recovery — Perform initial recovery",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-perform-initial-recovery",
    },
    {
      title: "Active Directory Forest Recovery — Reset the krbtgt password",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-reset-the-krbtgt-password",
    },
    {
      title: "Locking objects with Object Lock",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html",
    },
    {
      title: "Azure Backup Security Best Practices for Data Protection",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/backup/azure-backup-data-protection-best-practices",
    },
    {
      title: "#StopRansomware Guide",
      publisher: "CISA",
      url: "https://www.cisa.gov/stopransomware/ransomware-guide",
    },
  ],
};
