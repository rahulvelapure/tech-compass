import type { Article } from "../../types";

export const article: Article = {
  slug: "entra-join-vs-hybrid-join",
  category: "microsoft-intune",
  contentType: "decision-framework",
  subcategory: "Configuration policy",
  title: "Microsoft Entra join vs hybrid join: choosing for a Windows estate today",
  seoTitle: "Entra Join vs Hybrid Join: Choosing for a Windows Estate",
  metaDescription:
    "What separates Microsoft Entra join from hybrid join: the domain controller dependency, the reset requirement, and how to decide for new and existing devices.",
  standfirst:
    "Hybrid join is not a halfway house you can drift in. It carries a permanent dependency on domain controller connectivity, and moving a device off it requires a wipe.",
  excerpt:
    "The decision looks like a preference and behaves like a one-way door. What breaks without line of sight to a domain controller, why existing devices cannot be converted without a reset, and how to sequence the move.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 8,
  primaryKeyword: "entra join vs hybrid join",
  secondaryKeywords: [
    "microsoft entra hybrid join requirements",
    "cloud native endpoints",
    "hybrid join domain controller line of sight",
    "convert hybrid joined to entra joined",
  ],
  tags: ["Intune", "Windows", "Entra ID", "Identity", "Endpoint Management"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published device identity, cloud-native endpoint and hybrid join planning documentation. The domain controller dependency, the scenarios that break without it, supported device states, the reset requirement and the Autopilot Reset limitation are taken from those sources and cited below. Where the article recommends a sequencing approach rather than describing documented behaviour, it says so. No customer environment is described.",
  body: [
    {
      type: "p",
      text: "On the surface this looks like a configuration choice: two join types, pick one. In practice it is closer to an architectural commitment, because the two states have different runtime dependencies and because there is no supported way to move a device from hybrid join to Microsoft Entra join without wiping it.",
    },
    {
      type: "p",
      text: "That asymmetry is the whole decision. Choosing hybrid join for a new device is cheap today and expensive later. Choosing Microsoft Entra join for a device that genuinely needs on-premises domain membership causes problems immediately. Getting the split right at the point of provisioning is worth more than any amount of policy tuning afterwards.",
    },

    {
      type: "h2",
      id: "three-states",
      text: "Three states, and only two of them are joins",
    },
    {
      type: "p",
      text: "Microsoft documents three ways a device can obtain an identity in Microsoft Entra ID, and the terminology matters because the words are similar and the states are not.",
    },
    {
      type: "ul",
      items: [
        "**Microsoft Entra registered** — the device gets a cloud identity but is not joined. This is the bring-your-own-device and mobile case: personal hardware, corporate access, no organisational ownership of the device itself.",
        "**Microsoft Entra joined** — the device is joined to Microsoft Entra ID and is not joined to on-premises Active Directory. These are what Microsoft calls cloud-native endpoints.",
        "**Microsoft Entra hybrid joined** — the device is joined to an on-premises Active Directory domain **and** registered with Microsoft Entra ID. It has both identities and depends on both.",
      ],
    },
    {
      type: "p",
      text: "A device identity in some form is a prerequisite for device-based Conditional Access and for management with Intune, which is why this decision sits underneath so much else. Both join types support compliance policies and Conditional Access when the device is managed by Intune or co-managed with Configuration Manager, so that is not a differentiator.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Microsoft's own position on hybrid join",
      text: "The documentation describes Microsoft Entra hybrid join as an interim step on the road to Microsoft Entra join, and states that it should not be a long-term state or an end goal for any organisation. That is a strong statement from a vendor about its own feature, and it is worth weighing when someone proposes hybrid join for a greenfield deployment.",
    },

    {
      type: "h2",
      id: "the-dependency",
      text: "The dependency that defines hybrid join",
    },
    {
      type: "p",
      text: "Hybrid joined devices require periodic network line of sight to your domain controllers. Not once at setup — periodically, for the life of the device. Microsoft's planning documentation states that without this connection, devices become unusable.",
    },
    {
      type: "p",
      text: "That phrase deserves unpacking, because it does not mean the device stops working the moment it leaves the office. Three specific scenarios are documented as breaking without domain controller connectivity:",
    },
    {
      type: "table",
      caption: "What requires domain controller connectivity on a hybrid joined device",
      head: ["Scenario", "Why it needs a domain controller", "How it presents"],
      rows: [
        [
          "Device password change",
          "The computer account password is maintained against the domain.",
          "Intermittent authentication problems that resolve on the corporate network and recur off it.",
        ],
        [
          "User password change",
          "Cached credentials must be validated against the domain.",
          "A user who changes their password remotely cannot sign in with the new one until the device sees a domain controller.",
        ],
        [
          "TPM reset",
          "Device identity material has to be re-established.",
          "The device effectively loses its trusted state until it is back on the domain network.",
        ],
      ],
    },
    {
      type: "p",
      text: "The second row is the one that generates the most support tickets, and it is the clearest illustration of why hybrid join is a poor fit for a genuinely remote workforce. It is not a bug, it is the design: cached credentials are cached, and validating a change requires the authority that issued them.",
    },
    {
      type: "p",
      text: "Initial sign-in and device management also require that connectivity. A hybrid joined device that has never reached a domain controller is not in a useful state, which is why provisioning remote hybrid devices tends to require VPN gymnastics that Microsoft Entra joined devices do not need.",
    },

    {
      type: "h2",
      id: "one-way-door",
      text: "The one-way door",
    },
    {
      type: "p",
      text: "This is the constraint that makes the decision permanent in practice.",
    },
    {
      type: "p",
      text: "Existing devices joined to an on-premises Active Directory domain, including hybrid joined devices, **must be reset to become Microsoft Entra joined**. Microsoft states that if they cannot be reset, there is no supported Microsoft path to Microsoft Entra join them. There is no conversion, no in-place migration, no supported tool.",
    },
    {
      type: "p",
      text: "It gets slightly worse for anyone hoping to use Autopilot to smooth this over: Windows Autopilot Reset does not support Microsoft Entra hybrid joined devices, so a full device wipe is required rather than the lighter reset flow. If your refresh plan assumed Autopilot Reset would handle the conversion, that assumption needs revisiting.",
    },
    {
      type: "p",
      text: "The reverse direction is also documented and equally blunt. To take a Microsoft Entra joined device to hybrid join, you unjoin it from Microsoft Entra ID, which returns it to a workgroup or new state, and then join it the other way. Autopilot can take a workgroup or new device to hybrid joined; otherwise the device needs to be domain joined first.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Plan the conversion around events you already have",
      text: "Because there is no in-place path, Microsoft's recommendation is to wait for a complementary event — a hardware refresh, an OS upgrade, or a troubleshooting scenario that already produces a new or reset instance of Windows. That approach minimises user disruption and avoids creating a migration project out of something that will happen anyway. Proactively resetting devices is possible, but it is more disruptive and needs more planning and testing.",
    },

    {
      type: "h2",
      id: "myths",
      text: "What you do not give up by going cloud-native",
    },
    {
      type: "p",
      text: "Two objections come up in almost every one of these conversations, and both are addressed directly in Microsoft's documentation.",
    },
    {
      type: "p",
      text: '**"Entra joined devices cannot reach on-premises resources."** They can. Microsoft states that users on Microsoft Entra joined systems can access on-premises resources, and that single sign-on to on-premises resources is available to Microsoft Entra joined devices. The mechanism differs from a domain-joined device, and it has prerequisites worth working through, but the blanket claim is wrong.',
    },
    {
      type: "p",
      text: '**"We need Group Policy."** This one is real, but it is a transition constraint rather than a permanent one. On hybrid joined devices you can use Group Policy, Intune, or both — and Microsoft notes that the combination adds administrative overhead and complexity. That is an accurate description of what happens: two policy engines targeting one device, with no unified view of which one won. If Group Policy is the reason for staying hybrid, the honest framing is that you are deferring a migration, not avoiding one.',
    },
    {
      type: "p",
      text: "The related trap is worth naming because it is a live production risk rather than a design debate: settings configured in both Group Policy and Intune do not merge cleanly, and the winner is not always the one you expect. That interaction is worked through in [Intune policy conflicts](/microsoft-intune/intune-policy-conflicts), and the migration path away from Group Policy in [Migrating from Group Policy to the Intune settings catalog](/microsoft-intune/group-policy-to-settings-catalog-migration).",
    },

    {
      type: "h2",
      id: "choosing",
      text: "Choosing, by scenario",
    },
    {
      type: "p",
      text: "Microsoft's guidance splits cleanly along one line: whether the device already exists.",
    },
    {
      type: "table",
      caption: "The documented recommendation for each starting point",
      head: ["Situation", "Recommended", "Reasoning"],
      rows: [
        [
          "New, refurbished or refreshed devices being provisioned",
          "**Microsoft Entra join**",
          "Documented as the recommended default for new and reset endpoints. Hybrid join can be used but is typically not recommended, and may cost you modern Windows features.",
        ],
        [
          "Existing devices already domain joined or hybrid joined",
          "**Microsoft Entra hybrid join**",
          "Minimal user impact. The alternative requires a reset, and there is no supported conversion path.",
        ],
        [
          "Remote-first population, little or no domain controller reachability",
          "**Microsoft Entra join**",
          "The documented failure scenarios — password changes and TPM reset — all depend on domain controller line of sight.",
        ],
        [
          "Applications with hard on-premises domain dependencies",
          "Hybrid join, deliberately and with an exit plan",
          "A legitimate reason to stay, but scope it to the affected population rather than the whole estate.",
        ],
      ],
    },
    {
      type: "p",
      text: "Mixed estates are explicitly supported — the two are not mutually exclusive and can coexist. Microsoft is also clear that a mixed environment increases complexity, maintenance and support costs. Both things are true, and the practical answer is to treat the mix as a transitional state with a direction of travel rather than a permanent architecture.",
    },
    {
      type: "p",
      text: "One planning detail worth checking early if you are configuring hybrid join: the minimum domain controller version for hybrid join with Windows 10 or newer is Windows Server 2008 R2, and from version 1.1.819.0 onwards Microsoft Entra Connect provides a wizard that handles the configuration. There is also a UPN subtlety that catches organisations with subdomain suffixes — if the primary domain is registered as a confirmed custom domain, users can still obtain a Primary Refresh Token even when their synchronised on-premises UPN suffix sits in a subdomain.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Choosing hybrid join for new hardware because the estate is currently hybrid.** New devices are the cheapest possible opportunity to move. Every hybrid joined device provisioned today is a future wipe.",
        "**Assuming a conversion tool exists.** There is no supported in-place path from domain joined or hybrid joined to Microsoft Entra joined. A reset is required.",
        "**Planning the migration around Autopilot Reset.** It does not support hybrid joined devices; a full wipe is required instead.",
        "**Believing cloud-native means losing on-premises access.** Microsoft Entra joined devices can access on-premises resources and support single sign-on to them.",
        "**Running Group Policy and Intune against the same settings during transition.** Documented as adding overhead and complexity, and it produces conflicts that are genuinely hard to trace.",
        "**Treating hybrid join as the destination.** Microsoft describes it as an interim step and states it should not be an end goal.",
        "**Deploying hybrid joined devices to remote users without a connectivity plan.** Password changes and TPM resets need domain controller line of sight, and those are exactly the events remote users hit.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Make Microsoft Entra join the default for anything being provisioned or reset from today, and treat every exception as something that has to be argued for with a specific dependency behind it. That single rule converts an expensive migration into ordinary attrition, because hardware refresh cycles do the work.",
    },
    {
      type: "p",
      text: "Leave existing hybrid joined devices alone until they reach an event that already produces a fresh Windows installation. There is no in-place conversion, so resetting healthy devices purely to change join type buys you very little and costs users real time. The exception is a population where the domain controller dependency is actively causing failures — remote workers who cannot change their password being the obvious case — where the disruption of a reset is smaller than the disruption of the status quo.",
    },
    {
      type: "p",
      text: "Then be honest about what remains. If a hybrid population persists because of a specific application or a specific policy that has no cloud equivalent, name it, own it, and keep it under review. Estates stay hybrid for a decade not because of an unsolvable dependency but because nobody ever wrote the dependency down.",
    },
    {
      type: "p",
      text: "For new-device provisioning, the join type also constrains which Autopilot model is available — device preparation supports Microsoft Entra join only, which is covered in [Autopilot device preparation vs Windows Autopilot](/microsoft-intune/autopilot-device-preparation-vs-autopilot).",
    },
  ],
  faq: [
    {
      question: "Can I convert a hybrid joined device to Microsoft Entra joined without wiping it?",
      answer:
        "No. Existing devices joined to an on-premises Active Directory domain, including hybrid joined devices, must be reset to become Microsoft Entra joined. Microsoft states that if they cannot be reset, there is no supported path to Microsoft Entra join them. Windows Autopilot Reset does not support hybrid joined devices, so a full wipe is required.",
    },
    {
      question: "Do Microsoft Entra joined devices need a VPN to reach on-premises resources?",
      answer:
        "Not inherently. Microsoft documents that users on Microsoft Entra joined systems can access on-premises resources, and that single sign-on to on-premises resources is available to Microsoft Entra joined devices. Network reachability to the resource is still required, but domain membership is not the mechanism that provides access.",
    },
    {
      question: "What breaks on a hybrid joined device without domain controller connectivity?",
      answer:
        "Microsoft documents three scenarios that break without periodic line of sight to a domain controller: device password change, user password change where cached credentials must be validated, and TPM reset. Initial sign-in and device management also require that connectivity, and the documentation notes devices become unusable without it.",
    },
    {
      question: "Is hybrid join a valid long-term architecture?",
      answer:
        "Microsoft's documentation describes hybrid join as an interim step on the road to Microsoft Entra join and states that it should not be a long-term state or end goal for any organisation. Organisations without technical, political or regulatory blockers are advised to move or plan to move their Windows endpoints to Microsoft Entra join.",
    },
    {
      question: "Can Microsoft Entra joined and hybrid joined devices coexist?",
      answer:
        "Yes. They are not mutually exclusive and can run in the same environment. Microsoft notes that a mixed environment increases complexity, maintenance and support costs, so it is best treated as a transitional state with a clear direction rather than a permanent design.",
    },
    {
      question: "When should we convert existing devices?",
      answer:
        "Microsoft recommends waiting for a complementary event that already produces a new or reset Windows instance, such as a hardware refresh, an OS upgrade or a troubleshooting rebuild. Proactively resetting devices is possible and can be justified for small numbers or a strong business case, but it is more disruptive and requires more planning and testing.",
    },
  ],
  sources: [
    {
      title: "Microsoft Entra joined vs. Hybrid Microsoft Entra joined in cloud-native endpoints",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/solutions/cloud-native-endpoints/entra-join-types",
    },
    {
      title: "What is a device identity?",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/devices/overview",
    },
    {
      title: "Plan your Microsoft Entra hybrid join implementation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/devices/hybrid-join-plan",
    },
    {
      title: "Plan your Microsoft Entra device deployment",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/devices/plan-device-deployment",
    },
    {
      title: "How SSO to on-premises resources works on Microsoft Entra joined devices",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/devices/device-sso-to-on-premises-resources",
    },
    {
      title: "High level planning guide to move to cloud-native endpoints",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/solutions/cloud-native-endpoints/planning-guide",
    },
  ],
};
