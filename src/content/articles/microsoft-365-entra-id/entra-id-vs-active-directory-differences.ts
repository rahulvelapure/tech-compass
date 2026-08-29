import type { Article } from "../../types";

export const article: Article = {
  slug: "entra-id-vs-active-directory-differences",
  category: "microsoft-365-entra-id",
  contentType: "comparison",
  subcategory: "Identity",
  title: "Entra ID and Active Directory are not the same system",
  seoTitle: "Entra ID vs Active Directory: the real differences",
  metaDescription:
    "Entra ID is not Active Directory in the cloud. How the two differ in structure, authentication and device management — and what that means for hybrid identity.",
  standfirst:
    "One is a tree you walk. The other is a flat list you query. Teams that miss this build the wrong thing twice.",
  excerpt:
    "Entra ID is not a cloud copy of Active Directory. The two differ in how they store objects, how they prove identity, and how they configure a device — and each difference changes a design decision.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-22",
  draft: false,
  lastReviewedAt: "2026-08-22",
  nextReviewAt: "2027-08-22",
  readingMinutes: 7,
  primaryKeyword: "Entra ID vs Active Directory",
  secondaryKeywords: [
    "hybrid identity",
    "Entra Connect password hash sync",
    "Active Directory Domain Services",
    "Entra ID vs AD DS",
    "pass-through authentication",
  ],
  tags: ["Entra ID", "Active Directory", "Identity", "Hybrid Identity", "Enterprise IT"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "entra-join-vs-hybrid-join",
    "conditional-access-framework",
    "group-policy-to-settings-catalog-migration",
  ],
  methodology:
    "Written from Microsoft Learn documentation on directory comparison, Entra Connect synchronisation, password hash sync internals and device identity, verified August 2026. Where the documentation describes a mechanism, it is reported as a mechanism. Where this article recommends a design, it says so. No performance figures or migration timings are given — those depend on directory size and are not generalisable.",
  body: [
    {
      type: "p",
      text: "Entra ID is often called Active Directory in the cloud. It is not. The two store objects in different ways. They prove who a user is with different protocols. They set up a device by different means. Carry the old model across and you get a design that looks right and behaves oddly.",
    },
    {
      type: "p",
      text: "The confusion is understandable. Both answer the same two questions: who is this, and what may they reach? They just answer them with different machinery, built for different networks, twenty years apart.",
    },
    { type: "h2", id: "short-answer", text: "The short answer" },
    {
      type: "p",
      text: "Active Directory Domain Services is a hierarchical directory for a network you own. It authenticates with Kerberos, answers queries over LDAP, and configures Windows through Group Policy. It assumes the user and the resource sit on the same network.",
    },
    {
      type: "p",
      text: "Entra ID is a flat, globally distributed identity platform for the web. It authenticates with SAML, OAuth 2.0 and OpenID Connect. It gates access with Conditional Access and configures devices through mobile device management. It assumes the internet sits between the user and the resource.",
    },
    {
      type: "table",
      caption: "The differences that change a design decision, not a feature list",
      head: ["", "Active Directory Domain Services", "Microsoft Entra ID"],
      rows: [
        ["Structure", "Forest, domain, nested OUs", "Tenant, flat objects, administrative units"],
        ["Authentication", "Kerberos and NTLM", "SAML, OAuth 2.0, OpenID Connect"],
        ["Directory queries", "LDAP", "Microsoft Graph"],
        ["Device configuration", "Group Policy, applied from SYSVOL", "MDM, applied through CSPs"],
        ["Access decision", "Where the object sits in the tree", "User, device and risk signals"],
        ["Network assumption", "User and resource share a network", "Public internet between them"],
      ],
    },
    { type: "h2", id: "structure", text: "A tree, and a flat list" },
    {
      type: "p",
      text: "Active Directory nests. A forest holds domains, a domain holds organisational units, and an OU can hold another OU. That nesting is not decoration. It is the boundary for Group Policy and for delegated administration. Put a computer in an OU and it inherits the policies linked above it.",
    },
    {
      type: "p",
      text: "Entra ID does not nest in that sense. A tenant holds users, groups and devices. There is no forest and no domain. Administrative units exist, and they delegate administration, but they are not OUs — nothing inherits policy by sitting inside one.",
    },
    {
      type: "p",
      text: "This is where migrations go wrong. A team rebuilds the OU tree as administrative units or as deep nested groups, then waits for inheritance that never arrives. Entra ID decides access from attributes, device state and risk. It does not care where an object sits, because there is no where.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The useful mental model",
      text: "Active Directory asks where the object lives. Entra ID asks what is true about it right now. Design for the second question and dynamic group rules do most of the work that OUs used to.",
    },
    { type: "h2", id: "authentication", text: "Tickets, and tokens" },
    {
      type: "p",
      text: "In Active Directory, Kerberos does the work. A user signs in to a domain-joined machine and the domain controller issues a ticket-granting ticket. To reach a file server, the machine trades that ticket for a service ticket and presents it. The exchange relies on shared secrets and on clocks that agree, and it is fast on a local network. Crossing to another network needs a trust relationship.",
    },
    {
      type: "p",
      text: "NTLM remains as a fallback. It is a legacy challenge-response protocol and it is the reason pass-the-hash attacks work, which is why most hardening guidance is about removing its remaining uses.",
    },
    {
      type: "p",
      text: "Entra ID issues tokens instead. The application redirects the browser to Entra ID, which authenticates the user and returns a signed OAuth 2.0 access token and an OpenID Connect ID token. The application checks the signature against Microsoft's published keys. Nothing needs a route to a domain controller, which is the entire point.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Entra ID does use Kerberos, in places",
      text: "The clean split is a simplification. Entra Kerberos issues tickets for Azure Files, and cloud Kerberos trust lets Windows Hello for Business get an on-premises ticket without a line of sight to a domain controller. Both are narrow, deliberate exceptions rather than the general model.",
    },
    { type: "h2", id: "devices", text: "Group Policy, and CSPs" },
    {
      type: "p",
      text: "Group Policy pushes settings from the domain controller to the device, which writes them to the registry and to local security policy. It reaches deep into Windows. It also needs the device to be domain-joined and able to talk to a domain controller over SMB and LDAP.",
    },
    {
      type: "p",
      text: "Intune works through configuration service providers. A CSP is an API built into Windows; Intune sends a policy and the CSP applies it. Coverage is broad but not total. Settings that depend on SYSVOL scripts, and some older software restriction policies, have no direct equivalent.",
    },
    {
      type: "p",
      text: "The evaluation order differs too, and this catches people out. Group Policy applies local, then site, then domain, then OU, and the last writer wins. Intune resolves by assignment and by its own conflict rules, and a conflict between two policies can leave a setting simply not applied. That is a different failure mode, and it is covered in [how Intune resolves policy conflicts](/microsoft-intune/intune-policy-conflicts).",
    },
    {
      type: "p",
      text: "If you are moving settings across, the practical route is in [migrating Group Policy to the settings catalog](/microsoft-intune/group-policy-to-settings-catalog-migration).",
    },
    { type: "h2", id: "hybrid", text: "How hybrid identity actually joins the two" },
    {
      type: "p",
      text: "Almost nobody runs one or the other. They run both, and something has to keep the two in step. Entra Connect does that. It runs on a Windows Server on your network, reads Active Directory over LDAP, and writes to Entra ID through Microsoft Graph.",
    },
    {
      type: "p",
      text: "Synchronisation gives on-premises objects source of authority. Change a user's department in Active Directory and the change flows up. Try to change it in the Entra portal and you are blocked, because the cloud object is anchored to the on-premises one. Teams often read that block as a permissions bug. It is the design working.",
    },
    { type: "h3", id: "password-hash-sync", text: "What password hash sync actually sends" },
    {
      type: "p",
      text: "Password hash sync does not send the password, and it does not send the raw Active Directory hash either. Entra Connect takes the MD4 hash of the password, adds a 10-byte salt, and puts the result through PBKDF2 with 1,000 iterations of HMAC-SHA256. That derived value is what reaches Entra ID.",
    },
    {
      type: "p",
      text: "The detail matters when someone asks whether a cloud breach exposes on-premises credentials. What is stored in the cloud is a salted, iterated derivation of a hash, not something that can be replayed against a domain controller.",
    },
    { type: "h3", id: "pta", text: "When the hash cannot leave" },
    {
      type: "p",
      text: "Some organisations cannot send any derived credential to the cloud. Pass-through authentication covers that case. Entra ID queues the sign-in, a lightweight on-premises agent collects it, validates the password against the local directory, and returns the answer.",
    },
    {
      type: "p",
      text: "Nothing derived from the password leaves the building. In exchange, cloud sign-in now depends on those agents being up and reachable. Run more than one, and treat them as production infrastructure rather than a utility someone installed once.",
    },
    {
      type: "p",
      text: "Entra Cloud Sync is the lighter option. The agent is a proxy and the synchronisation logic runs in Microsoft's cloud, so there is no SQL-backed server to maintain. It suits multiple small sites and restricted networks.",
    },
    { type: "h2", id: "mistakes", text: "Where this goes wrong in practice" },
    {
      type: "p",
      text: "Three failures come up repeatedly, and all three trace back to carrying the old model across.",
    },
    {
      type: "ol",
      items: [
        "**Retiring domain controllers too early.** Anything still speaking Kerberos or LDAP keeps needing them, and so does hybrid join. Domain controllers go when the last workload that needs them goes, not when the migration is declared finished.",
        "**Enabling password hash sync, then blocking the server.** A firewall rule that stops Entra Connect reaching the cloud does not raise an obvious alarm. It just means recent password changes never arrive, and those users cannot sign in to cloud services.",
        "**Confusing Entra joined with hybrid joined.** An Entra joined device has no on-premises computer account. A hybrid joined device has both, and authenticates to a domain controller first. Pick the wrong one and you lose either the file shares or the cloud sign-in experience.",
      ],
    },
    {
      type: "p",
      text: "That third one is the most expensive to undo, because it is decided at enrolment. [Entra join and hybrid join compared](/microsoft-intune/entra-join-vs-hybrid-join) sets out which to pick.",
    },
    { type: "h2", id: "security", text: "The threat model changes too" },
    {
      type: "p",
      text: "In Active Directory the prize is a credential. Take a Domain Admin account or a ticket-granting ticket and you own the estate. That is why domain controllers are tiered away and why privileged workstations exist.",
    },
    {
      type: "p",
      text: "In Entra ID the prize is a token. A stolen session token already carries the result of authentication, so it can be replayed without the attacker ever passing MFA. Expiry is the main limit on how long it is useful.",
    },
    {
      type: "p",
      text: "That changes what a control has to do. Checking identity at sign-in is no longer enough on its own; the policy also has to care about the device and the session. A [deliberate Conditional Access framework](/microsoft-365-entra-id/conditional-access-framework) is the practical answer, and it needs [break-glass accounts](/microsoft-365-entra-id/conditional-access-break-glass-accounts) so that a bad policy cannot lock everyone out.",
    },
    {
      type: "p",
      text: "Entra ID is also on the public internet, which Active Directory never was. Password spray and MFA fatigue are constant background noise rather than events.",
    },
    { type: "h2", id: "which", text: "Which one for which workload" },
    {
      type: "p",
      text: "This is not a preference. The workload decides.",
    },
    {
      type: "table",
      caption: "Choosing by workload rather than by strategy statement",
      head: ["Keep Active Directory for", "Use Entra ID for"],
      rows: [
        ["Applications that need Kerberos, NTLM or LDAP", "SaaS and modern web applications"],
        ["File, print and other on-premises infrastructure", "Remote users and personal devices"],
        ["Deep Windows configuration through Group Policy", "Cloud-native device management"],
        [
          "Machine authentication before user sign-in, such as 802.1X",
          "Access decisions based on risk and device health",
        ],
      ],
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Flatten the directory design. Entra ID has no use for an OU tree. Dynamic groups built on attributes replace most of what nesting used to do.",
        "Know which authentication path each user is on. Password hash sync, pass-through authentication and federation fail in different ways, and the first question in any incident is which one you are running.",
        "Move device configuration to CSPs deliberately, not opportunistically. Check coverage for the settings you actually rely on before retiring a GPO.",
        "Treat the tenant as the perimeter. Restrict standing administrative access, enforce MFA for admins, and block legacy authentication, which bypasses it.",
      ],
    },
    {
      type: "p",
      text: "The two systems were built for different networks. Active Directory assumed a perimeter and a LAN. Entra ID assumes neither. Respect that and hybrid identity is straightforward. Fight it, and you spend a year rebuilding a tree that the platform will keep ignoring.",
    },
  ],
  faq: [
    {
      question: "Is Entra ID just Azure AD with a new name?",
      answer:
        "The name changed. The product did not fork. Azure AD became Entra ID in 2023, and the old name still turns up in tooling and scripts. Dropping it is worth the effort anyway, because it breaks the habit of thinking of it as Active Directory.",
    },
    {
      question: "Can I switch off my domain controllers once I move to Entra ID?",
      answer:
        "Only when nothing needs them. Apps that use Kerberos or LDAP still do, and so do hybrid joined devices. Check what still speaks those protocols before you plan the shutdown.",
    },
    {
      question: "Does password hash sync send my passwords to Microsoft?",
      answer:
        "No. It sends a value derived from the hash, not the password. Entra Connect salts the MD4 hash and runs it through PBKDF2 with 1,000 rounds of HMAC-SHA256. The result cannot be replayed against a domain controller.",
    },
    {
      question: "Is AD FS deprecated?",
      answer:
        "No. AD FS is still a supported product. Microsoft steers new work toward Entra ID rather than federation. Move when it suits you. The gain is one less server to keep secure, not a deadline.",
    },
    {
      question: "Do administrative units work like OUs?",
      answer:
        "They delegate administration, and that is all they share. Nothing inherits a policy by sitting in one. If you are recreating an OU tree with them, you are solving a problem Entra ID does not have.",
    },
  ],
  sources: [
    {
      title: "Compare Active Directory to Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/fundamentals/compare",
    },
    {
      title: "What is Microsoft Entra Connect?",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/whatis-azure-ad-connect",
    },
    {
      title: "Implement password hash synchronisation with Microsoft Entra Connect Sync",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-password-hash-synchronization",
    },
    {
      title: "What is device identity in Microsoft Entra ID?",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/devices/overview",
    },
    {
      title: "Microsoft Entra user provisioning and Cloud Sync",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/what-is-cloud-sync",
    },
  ],
};
