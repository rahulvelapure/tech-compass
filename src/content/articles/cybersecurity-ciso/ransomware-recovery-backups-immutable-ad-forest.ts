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
    "A backup you can restore is only half the job. You also need clean identity, working DNS, and a rebuild order you have practised.",
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
      text: "The phrase “restore from backup” hides the hard part. A backup can hold your data safely while the thing you need in order to use that data is still owned by the attacker.",
    },
    {
      type: "p",
      text: "A real plan brings back more than files. It brings back identity, DNS, network control, privileged access, management systems, apps and data. And it does so in an order that avoids building on ground the attacker still holds.",
    },
    {
      type: "p",
      text: "That changes how you judge a backup design. The question is not just whether a backup exists. It is whether someone who owns production can also delete it, change it, or log in to the thing that guards it.",
    },
    {
      type: "h2",
      id: "scope",
      text: "What has to come back first",
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
      text: "The order is not the same everywhere. A cloud-native service may not touch Active Directory at all. A Windows estate may lean on AD for nearly everything. So write the dependencies down per service, and do it before you need them.",
    },
    {
      type: "h2",
      id: "immutable",
      text: "What immutability changes for the attacker",
    },
    {
      type: "p",
      text: "A backup repository wired into production is part of the attack surface. If a privileged credential can delete recovery points, the job can succeed every night and still leave you with nothing on the day.",
    },
    {
      type: "p",
      text: "S3 Object Lock holds retention at the storage layer. In Compliance mode nobody can overwrite or delete a protected object version until the retention period runs out. That includes the AWS account root user. Azure Backup offers a similar immutable vault, and its locked state makes the immutability irreversible.",
    },
    {
      type: "p",
      text: "The principle worth holding on to is this: enforce it below the backup app. If the app can delete the data, then taking over the app is a way to destroy the backups. Pushing the lock down to storage closes that route.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Immutability is not the same as isolation",
      text: "Immutable storage keeps recovery points from being deleted. It does nothing on its own for the management plane, the credentials, the network paths or the keys. So keep at least one way back that sits outside the same blast radius.",
    },
    {
      type: "h2",
      id: "airgap",
      text: "An air gap cuts the shared blast radius",
    },
    {
      type: "p",
      text: "An offline backup cannot be reached from the production network at all. A logically isolated copy can get close, so long as it uses its own account, its own credentials, and no network trust it does not need.",
    },
    {
      type: "p",
      text: "CISA recommends offline backups and regular restore testing. The reason is blunt. Ransomware crews go looking for backups they can reach, because wrecking them puts the victim under more pressure to pay.",
    },
    {
      type: "p",
      text: "Do not mistake a second backup job for a second trust boundary. Two repositories behind the same domain admin and the same console are still one failure domain.",
    },
    {
      type: "h2",
      id: "ad",
      text: "Recovering Active Directory is its own job",
    },
    {
      type: "p",
      text: "Once a forest is compromised, treat the first restored domain controller as a recovery asset. It is not just another server to plug back into the production network.",
    },
    {
      type: "p",
      text: "Microsoft documents forest recovery for Windows Server 2025 and the earlier supported releases. You restore the first writable domain controller. You check the restored state before you reconnect it. You reset the admin credentials. Then you bring back the rest of the domain controllers.",
    },
    {
      type: "p",
      text: "The krbtgt account signs Kerberos tickets, which is why it matters here. Microsoft says to reset its password twice during forest recovery. Wait 10 hours between the two resets under the default ticket lifetime. Wait longer if your policy sets a longer one.",
    },
    {
      type: "p",
      text: "The procedure also covers trust passwords, computer account passwords, global catalog state and metadata cleanup. That is a lot of steps in a fixed order. Treat the document as a runbook you can execute, not a paragraph in a policy.",
    },
    {
      type: "h2",
      id: "identity",
      text: "Cloud identity moves the boundary",
    },
    {
      type: "p",
      text: "Most estates now run Microsoft Entra ID, Okta or another cloud provider next to AD. So recovery has to cover the admin accounts, the application registrations, the privileged roles, Conditional Access, and how you revoke sessions.",
    },
    {
      type: "p",
      text: "Hybrid identity needs more care than either half alone. A compromised directory on-premises can reach the cloud through sync. A cloud compromise can hand out new app permissions or admin access without touching a domain controller at all.",
    },
    {
      type: "p",
      text: "Write one identity checklist that covers both planes. List the emergency access accounts. List the privileged roles, the sync settings and the application registrations. And write down how you kill the sessions the attacker holds.",
    },
    {
      type: "h2",
      id: "sequence",
      text: "An order that follows the dependencies",
    },
    {
      type: "p",
      text: "The order is deliberately cautious. A quicker one is no help if it plugs a compromised system back in and buys you a second recovery.",
    },
    {
      type: "h2",
      id: "testing",
      text: "A backup is only as good as the restore",
    },
    {
      type: "p",
      text: "CISA recommends testing backup availability and integrity on a regular basis. A real test goes past proving a file can be read. Restore a system that stands for the others. Check that it boots, that it authenticates, that it resolves what it needs, and that it behaves like the service it replaces.",
    },
    {
      type: "p",
      text: "For AD, run a forest recovery exercise. For cloud backup, restore into an isolated subscription or account where the service allows it. For apps, write down which secrets, certificates, DNS records and external APIs they need once they are back.",
    },
    {
      type: "p",
      text: "Keep the recovery docs outside the production identity system. If the network is down, a wiki that asks you to log in with the very thing you are rebuilding is not a recovery document.",
    },
    {
      type: "h2",
      id: "takeaway",
      text: "What to remember",
    },
    {
      type: "ul",
      items: [
        "Backups protect the data. They do not protect the environment you need to use it.",
        "Lock the recovery points at the storage layer, so a stolen admin account cannot delete them.",
        "A second copy only helps if it cuts the trust the two copies share.",
        "Forest recovery is a set procedure, and you have to rehearse it.",
        "Cloud identity and app registrations belong in the plan too.",
        "Test what the service depends on, not just that the backup file is there.",
      ],
    },
  ],
  faq: [
    {
      question: "Are immutable backups enough for ransomware recovery?",
      answer:
        "No. They stop the recovery points being wrecked. You still need clean identity, DNS, apps and a plan you have tested.",
    },
    {
      question: "Why is Active Directory part of backup recovery?",
      answer:
        "In a Windows estate, AD signs in your users and services and gates access. If it is dirty, a restored server can still be unusable or unsafe.",
    },
    {
      question: "How many times should krbtgt be reset during forest recovery?",
      answer:
        "Twice, says Microsoft. Wait between them, based on your Kerberos ticket lifetime. On the default settings that wait is 10 hours.",
    },
    {
      question: "Should one backup copy be offline?",
      answer:
        "CISA says yes, keep one offline. A separate account with its own sign-in can cut the shared blast radius too. Match the design to your threat model.",
    },
    {
      question: "How often should ransomware recovery be tested?",
      answer:
        "On a set date, and often. Test the restore. Test the identity plan too. Waiting for a real attack is not a schedule.",
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
