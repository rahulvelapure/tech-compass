import type { Article } from "../../types";

export const article: Article = {
  slug: "windows-laps-entra-id-architecture-deployment",
  category: "microsoft-intune",
  contentType: "how-to",
  subcategory: "Windows",
  title: "Windows LAPS with Entra ID: what it does, and who can read the password",
  seoTitle: "Windows LAPS in Entra ID: architecture and deployment",
  metaDescription:
    "Cloud LAPS drops the AD schema extension and stores the password on the Entra device object. The roles that can read it, and the traps in a hybrid estate.",
  standfirst:
    "The hard part is no longer storing the password. It is deciding who gets to read it, and knowing what happens when the device object goes.",
  excerpt:
    "Windows LAPS backs the local admin password up to the Entra device object, with no schema extension and no domain controller. The architecture, the roles that can read it, and where hybrid estates go wrong.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  draft: false,
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "Windows LAPS Entra ID",
  secondaryKeywords: [
    "Windows LAPS Intune policy",
    "LAPS backup directory Entra",
    "deviceLocalCredentials permission",
    "Cloud Device Administrator LAPS",
    "LAPS hybrid joined devices",
  ],
  tags: ["Intune", "Windows", "Entra ID", "Security", "Endpoint Management"],
  reviewStatus: "research-based",
  relatedSlugs: ["entra-join-vs-hybrid-join", "entra-id-vs-active-directory-differences"],
  methodology:
    "Written from Microsoft Learn documentation on Windows LAPS: the key concepts page, the Entra ID scenario guide, Intune LAPS policy deployment, and the Entra device management guidance, verified August 2026. Permission names and role names are quoted from those pages. Event log IDs are deliberately not quoted, because they differ between backup targets and the documentation should be the reference.",
  body: [
    {
      type: "p",
      text: "Every Windows device has a built-in local admin account. If the password is the same on every machine, one stolen laptop opens all of them. LAPS fixes that. It gives each device its own password and changes it on a schedule.",
    },
    {
      type: "p",
      text: "The old version had a hard limit. It stored passwords in Active Directory, needed a schema extension, and arrived by Group Policy. A cloud-joined laptop that never sees a domain controller was simply out of scope.",
    },
    {
      type: "p",
      text: "Windows LAPS is built into Windows and can back the password up to Entra ID instead. No schema change, no domain controller. The mechanics are straightforward. The access model is where deployments go wrong.",
    },
    { type: "h2", id: "architecture", text: "How the pieces fit" },
    {
      type: "p",
      text: "Three parts, and it helps to be clear about which one does what.",
    },
    {
      type: "table",
      caption: "The three components and their responsibilities",
      head: ["Part", "What it does"],
      rows: [
        [
          "The LAPS CSP on the device",
          "Generates the password, rotates it on schedule, sends it to the backup target",
        ],
        ["Entra ID", "Stores the password against the device object, and gates who may read it"],
        [
          "Intune",
          "Delivers the policy: complexity, rotation interval, which account, which backup target",
        ],
      ],
    },
    {
      type: "p",
      text: "Passwords backed up to Entra ID are stored on the device object and retrieved through Microsoft Graph, over the `deviceLocalCredentials` collection. There is no directory attribute to delegate with an ACL, which is the habit worth unlearning from the old version.",
    },
    {
      type: "callout",
      variant: "note",
      title: "What the encryption does and does not mean",
      text: "Microsoft's documentation says the password is further encrypted before being persisted, and that this extra layer is removed before the password is returned to authorised clients. That is protection at rest, not end-to-end encryption to your organisation. Anyone stating that the provider cannot read it is describing the Active Directory encrypted-password feature, which is a different thing.",
    },
    { type: "h2", id: "vs-legacy", text: "What actually changed from the old LAPS" },
    {
      type: "table",
      caption: "Legacy LAPS and Windows LAPS with Entra backup",
      head: ["", "Legacy LAPS", "Windows LAPS, Entra backup"],
      rows: [
        ["Directory", "Active Directory, schema extension required", "Entra ID, no schema change"],
        ["Delivery", "Group Policy", "Intune policy through the LAPS CSP"],
        [
          "Storage",
          "A directory attribute, protected by ACLs",
          "The Entra device object, gated by roles",
        ],
        ["Retrieval", "Directory tools", "Microsoft Graph, Intune or the Entra portal"],
        ["Connectivity", "Needs a domain controller", "Needs Entra ID"],
      ],
    },
    {
      type: "p",
      text: "Dropping the schema extension is the change that unblocks most organisations. It was rarely the technical difficulty that stopped adoption — it was the change-control conversation about modifying the forest schema.",
    },
    { type: "h2", id: "access", text: "Who can read the password" },
    {
      type: "p",
      text: "This is the section worth reading twice, because the model is role-based and it is easy to get wrong in both directions.",
    },
    {
      type: "p",
      text: "Two Entra permissions matter, and they are deliberately separated.",
    },
    {
      type: "ul",
      items: [
        "`microsoft.directory/deviceLocalCredentials/standard/read` — metadata only. Device name, when the password last rotated, when it next expires. Fine for reporting and compliance.",
        "`microsoft.directory/deviceLocalCredentials/password/read` — the password itself. Sensitive, and it should be assigned deliberately.",
      ],
    },
    {
      type: "p",
      text: "By default the built-in roles that can retrieve the clear-text password are Global Administrator, Cloud Device Administrator and Intune Administrator. Metadata is visible to a wider set, including Helpdesk Administrator, Security Reader and Security Administrator.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Do not hand out Intune Administrator for this",
      text: "The common shortcut is giving the service desk a role that already includes password read. That grants far more than reading a local password. With Entra ID P1 or P2 you can build a custom role carrying only the password read permission, which is the least-privilege answer.",
    },
    {
      type: "p",
      text: "Retrieval through Graph uses different names again: `DeviceLocalCredential.ReadBasic.All` for metadata and `DeviceLocalCredential.Read.All` for the password, usually alongside `Device.Read.All` so a device name can be resolved to an id. If you are scripting with `Get-LapsAADPassword`, those are the permissions the app registration needs.",
    },
    { type: "h2", id: "hybrid", text: "Where hybrid estates get confusing" },
    {
      type: "p",
      text: "A mixed estate is where most support cases start, and the cause is usually that two management paths are both live.",
    },
    {
      type: "p",
      text: "Entra joined devices are simple. Policy arrives from Intune, the password goes to Entra ID, and the portal shows it.",
    },
    {
      type: "p",
      text: "Hybrid joined devices can be managed either way. Windows LAPS with Entra backup is supported by Group Policy for hybrid joined devices, and by Intune for Entra joined and hybrid joined co-managed devices. Both paths are legitimate, and running both without deciding which wins is what produces inconsistency.",
    },
    {
      type: "p",
      text: "Two settings decide the outcome, and they are worth checking explicitly rather than assuming: which backup target the policy names, and whether an older LAPS configuration is still applying to the same device. If a device is choosing the on-premises directory, the password will never appear in the cloud portal, and nothing is broken.",
    },
    {
      type: "p",
      text: "If you are unsure which join type a device actually has, that distinction drives more than LAPS — [Entra join and hybrid join compared](/microsoft-intune/entra-join-vs-hybrid-join) covers what each one changes.",
    },
    { type: "h2", id: "operational", text: "Operational facts worth knowing first" },
    {
      type: "p",
      text: "Three behaviours surprise people after deployment rather than during it.",
    },
    {
      type: "ol",
      items: [
        "**Deleting the device object destroys the password.** When a device is deleted in Entra ID, the credential tied to it goes with it, and there is no recovery path. If you need the password after decommissioning, you need to have exported it first.",
        "**Only one local account is managed at a time.** Point policy at a different account and the previous one stops being managed, and its details stop being visible. It is not two managed accounts; it is a handover.",
        "**Nothing happens instantly.** The CSP works on a schedule. A password will not appear the moment policy applies, and the usual mistake is declaring failure after ten minutes rather than letting a sync cycle complete.",
      ],
    },
    { type: "h2", id: "troubleshooting", text: "When the password does not appear" },
    {
      type: "p",
      text: "Work through it in this order. It resolves most cases without touching the policy.",
    },
    {
      type: "ul",
      items: [
        "**Confirm the policy applied.** Check the device's work or school account details for the configuration profile. If it is not there, this is a delivery problem, not a LAPS problem.",
        "**Read the LAPS operational log on the device.** It records backup attempts and their outcome, and it is the only place that tells you why one failed. Check the current event IDs in the documentation rather than trusting a number from an article — they differ by backup target.",
        "**Check your own permissions.** An account without the password read permission sees an error that reads like missing data rather than denied access. Confirm the role before concluding the backup failed.",
        "**Check the join type.** A registered personal device is not an Entra joined device and will not process device-targeted policy.",
        "**Check the backup target.** In a hybrid estate this is the single most common cause of a password that exists but is not where you are looking.",
      ],
    },
    { type: "h2", id: "hardening", text: "Two things worth doing alongside" },
    {
      type: "p",
      text: "LAPS solves the shared-password problem. It does not make the account uninteresting.",
    },
    {
      type: "p",
      text: "The account name is still predictable, so renaming it removes a free assumption for anyone attempting a brute-force. Policy can do this as part of the same configuration.",
    },
    {
      type: "p",
      text: "The roles that can read passwords are worth protecting too. Conditional Access can be scoped to the built-in roles, so recovering a password requires strong authentication. One limit is worth knowing: that scoping does not support custom roles or roles scoped to an administrative unit. It shapes how you design the delegation. All of it sits inside the same policy structure, covered in [a Conditional Access framework](/microsoft-365-entra-id/conditional-access-framework).",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Pick one management path per device and confirm the backup target explicitly. Ambiguity here is the main source of hybrid inconsistency.",
        "Build a custom role for password read rather than granting an administrator role that happens to include it.",
        "Separate metadata read from password read. Most reporting needs only the first.",
        "Remember that deleting the device object deletes the password, permanently.",
        "Rename the managed account, and protect the reader roles with Conditional Access.",
      ],
    },
    {
      type: "p",
      text: "Windows LAPS is one of the better security changes available for an endpoint estate, largely because it removes an entire class of lateral movement for a modest amount of configuration. Just treat the read permission as the sensitive part. Storing the password well is the easy half; deciding who can retrieve it, and proving that later, is the half that matters.",
    },
  ],
  faq: [
    {
      question: "Does Windows LAPS still need an Active Directory schema extension?",
      answer:
        "Not when you back up to Entra ID. The password is stored on the device object instead. That change is what makes it work for cloud-joined laptops.",
    },
    {
      question: "Who can see the local admin password?",
      answer:
        "Only three built-in roles can, by default. Everyone else sees just the dates and times, not the password. If you want a tighter grant, build a custom role that reads the password alone.",
    },
    {
      question: "Can Microsoft read the stored password?",
      answer:
        "The password is encrypted before it is stored, and that layer is removed before it is handed to an authorised caller. So treat it as protected at rest, not as sealed to your tenant alone.",
    },
    {
      question: "What happens to the password if I delete the device in Entra ID?",
      answer:
        "It goes when the device object goes, and you cannot get it back. Save it first if you might need it after a machine is retired.",
    },
    {
      question: "Why can I see the device but not its password?",
      answer:
        "Usually your account lacks the read permission. The error looks like missing data, not a denial. So people go and check the device when they should check the role.",
    },
  ],
  sources: [
    {
      title: "Key concepts in Windows LAPS",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-concepts-overview",
    },
    {
      title: "Get started with Windows LAPS and Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-scenarios-azure-active-directory",
    },
    {
      title: "Windows Local Administrator Password Solution in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/devices/howto-manage-local-admin-passwords",
    },
    {
      title: "Deploy Windows LAPS policy with Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/device-security/laps/deploy-policy",
    },
    {
      title: "Microsoft Intune support for Windows LAPS",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/device-security/laps/overview",
    },
  ],
};
