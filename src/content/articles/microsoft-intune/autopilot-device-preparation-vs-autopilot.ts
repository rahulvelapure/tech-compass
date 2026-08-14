import type { Article } from "../../types";

export const article: Article = {
  slug: "autopilot-device-preparation-vs-autopilot",
  category: "microsoft-intune",
  subcategory: "Autopilot",
  title: "Autopilot device preparation vs Windows Autopilot: which provisioning model to use",
  seoTitle: "Autopilot Device Preparation vs Autopilot: How to Choose",
  metaDescription:
    "Device preparation and Windows Autopilot solve the same problem differently. What each one supports, how precedence works, and which to choose for a Windows estate.",
  standfirst:
    "These are not two versions of the same feature. They provision devices through different mechanisms, and one silently takes precedence over the other on any device that has both.",
  excerpt:
    "Device preparation removes the registration step and grades reliability over flexibility. Windows Autopilot keeps hybrid join, pre-provisioning and a far larger app budget. Where each one fits, and the precedence rule that decides which actually runs.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 7,
  primaryKeyword: "autopilot device preparation policy",
  secondaryKeywords: [
    "autopilot device preparation vs autopilot",
    "enrollment time grouping",
    "intune provisioning client",
    "windows autopilot device preparation requirements",
  ],
  tags: ["Intune", "Windows", "Autopilot", "Endpoint Management", "Enterprise IT"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Windows Autopilot device preparation documentation, including the official comparison, requirements, overview and FAQ pages, alongside the Windows Autopilot documentation. Capability differences, version requirements, limits and precedence behaviour are taken from those sources and cited below. Where the article recommends an approach rather than describing documented behaviour, it says so. No customer environment is described and neither model was tested for this article.",
  body: [
    {
      type: "p",
      text: "Windows Autopilot device preparation is not Autopilot version two, and the naming does it no favours. It is a separate provisioning path with its own policy object, its own grouping mechanism, its own supported scenarios and its own limits. Some of those limits are considerably tighter than Autopilot's. Some of the behaviour is considerably more predictable.",
    },
    {
      type: "p",
      text: "Choosing between them is a real architectural decision rather than a preference, because the two models fail differently and because one quietly overrides the other. It is worth settling before a rollout rather than during one.",
    },

    {
      type: "h2",
      id: "the-model-difference",
      text: "The difference that explains everything else",
    },
    {
      type: "p",
      text: "Windows Autopilot works from a pre-registered hardware identity. A device is registered with the deployment service, the service recognises it during setup, and a profile is delivered. Everything downstream depends on that registration existing before the device is switched on, which is where a whole family of failures comes from.",
    },
    {
      type: "p",
      text: "Device preparation removes that step entirely. Microsoft's documentation is explicit that device registration is not required. Instead it uses **enrollment time grouping**: when the user authenticates during setup, the device is added directly to a device security group you nominated in the policy, and the applications, scripts and policies assigned to that group are delivered to it.",
    },
    {
      type: "p",
      text: "That is the substantive change. Under Autopilot, targeting typically relies on dynamic device group membership, which has to evaluate before the things assigned to it can arrive. Device preparation performs a direct group membership assignment during enrollment, which Microsoft describes as deploying more quickly and efficiently than waiting on a dynamic group. Faster, and more importantly, less dependent on timing you do not control.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The device group needs a specific owner",
      text: "For device preparation, the nominated device security group must have **Intune Provisioning Client** set as its owner. This is not an optional hardening step — it is what allows the service to add devices to the group during enrollment. A policy that looks correct but never adds devices to the group is worth checking here first.",
    },

    {
      type: "h2",
      id: "capability-split",
      text: "What each model actually supports",
    },
    {
      type: "p",
      text: "The capability gap is wide enough that for many estates the decision makes itself. These are the differences that change a design rather than the full feature matrix.",
    },
    {
      type: "table",
      caption: "Documented capability differences between the two provisioning models",
      head: ["Capability", "Device preparation", "Windows Autopilot"],
      rows: [
        [
          "Join types",
          "Microsoft Entra join only",
          "Microsoft Entra join **and** Microsoft Entra hybrid join",
        ],
        [
          "Windows versions",
          "Windows 11 only — 24H2 or later, or 22H2/23H2 with KB5035942 or later",
          "All currently supported Windows 10 and Windows 11 General Availability Channel versions",
        ],
        [
          "Deployment modes",
          "User-driven and automatic",
          "User-driven, pre-provisioned, self-deploying and existing devices",
        ],
        ["Device registration", "Not required", "Required"],
        [
          "Apps during OOBE",
          "Up to 25 essential apps — and LOB plus Win32 **in the same deployment**",
          "Up to 100 applications, but not LOB and Win32 in the same deployment",
        ],
        [
          "PowerShell scripts during OOBE",
          "Up to 10, and they must run in the System context",
          "No equivalent per-profile script budget",
        ],
        [
          "Configuration scope during OOBE",
          "Device-based only",
          "Device-based during device ESP, user-based during user ESP",
        ],
        [
          "Progress experience",
          "A Setting up for work or school screen with a percentage progress bar",
          "The Enrollment Status Page",
        ],
        [
          "Monitoring",
          "Near real-time deployment report, including per-app and per-script status",
          "Deployment report covering registered devices, not real-time",
        ],
        ["Autopilot Reset", "Not supported", "Supported"],
        ["GCC High and DoD", "Supported", "Not supported"],
        [
          "Specialist hardware",
          "Not supported",
          "HoloLens, Teams Meeting Room, DFCI management, co-management",
        ],
      ],
    },
    {
      type: "p",
      text: "Two rows carry most of the weight. **Hybrid join is not available in device preparation at all**, which rules it out for any estate still joining devices to an on-premises domain. And **device preparation is Windows 11 only**, which rules it out for anyone still deploying Windows 10 images.",
    },
    {
      type: "p",
      text: "The app row cuts the other way. Delivering line-of-business and Win32 applications in the same deployment is something Autopilot does not do, and Microsoft attributes device preparation's improved consistency to delivering configurations and apps in a serialised way that minimises conflicts. If your ESP failures have historically been app-ordering problems, that is the relevant difference — although a 25-app ceiling against Autopilot's 100 is a real constraint if your build is heavy.",
    },

    {
      type: "h2",
      id: "precedence",
      text: "They do not coexist on a device — one wins",
    },
    {
      type: "p",
      text: "Both models can run side by side in the same tenant, and Microsoft supports that. But any individual device can only run one of them, and the tie-break is fixed: **Windows Autopilot profiles take precedence over device preparation policies**.",
    },
    {
      type: "p",
      text: "If a device is registered as an Autopilot device, it will run the Autopilot deployment even when a device preparation policy targets the user. To move that device onto device preparation, it has to be deregistered from Autopilot first. There is no setting that reverses the priority.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The fastest way to tell which one is actually running",
      text: "Device preparation does not use the Enrollment Status Page. If the ESP appears during a deployment you believe is device preparation, then it is not — the device is almost certainly registered with Autopilot, or an Autopilot profile is assigned to it. Microsoft documents this as the diagnostic. It takes a glance at the screen and settles the question immediately.",
    },
    {
      type: "p",
      text: "This matters during migration more than at steady state. A tenant that has been running Autopilot for years has registered devices, and those registrations do not disappear because a new policy was created. A pilot that appears to do nothing is usually a pilot on already-registered hardware.",
    },

    {
      type: "h2",
      id: "what-is-not-tracked",
      text: "What device preparation does not wait for",
    },
    {
      type: "p",
      text: "This is the caveat I would want to know before committing, and it is easy to miss in the marketing framing around reliability.",
    },
    {
      type: "p",
      text: "Device preparation delivers only the applications and PowerShell scripts explicitly selected in the policy during OOBE. Anything else assigned to the device group arrives *after* the deployment completes. That part is reasonable and predictable.",
    },
    {
      type: "p",
      text: "Configuration policies are different. Microsoft documents that device preparation syncs the policies assigned to the device group, but **does not track whether those policies are applied during the deployment**. They might apply during it, or they might apply after it. The user can reach the desktop before the device is in its intended configuration state.",
    },
    {
      type: "p",
      text: "Autopilot's Enrollment Status Page exists precisely to block that. If your security position depends on a device being fully configured before anyone can use it — disk encryption state, a specific browser policy, a firewall baseline — that guarantee is weaker under device preparation, and it is worth being deliberate about rather than discovering later. Autopilot also blocks the desktop until user-based configuration has applied, which device preparation does not do at all, because its OOBE configuration is device-scoped only.",
    },

    {
      type: "h2",
      id: "choosing",
      text: "How I would choose",
    },
    {
      type: "p",
      text: "The following is a recommendation rather than documented guidance, but it follows directly from the constraints above.",
    },
    {
      type: "p",
      text: "**Windows Autopilot remains the answer** if you need Microsoft Entra hybrid join, if you still deploy Windows 10, if pre-provisioning matters because devices are staged by a supplier before reaching users, if you rely on Autopilot Reset in your device lifecycle, if you deploy more than 25 applications during provisioning, or if you need the desktop blocked until user-scoped configuration has applied.",
    },
    {
      type: "p",
      text: "**Device preparation is worth choosing** if you are Entra-joined and Windows 11 only, if your provisioning pain has been app-delivery conflicts rather than app count, if you operate in GCC High or DoD where Autopilot is not available, or if the operational cost of registering hardware — chasing hashes, dealing with hardware changes, resellers holding registrations — has been a recurring drain.",
    },
    {
      type: "p",
      text: "There is no migration pressure. Microsoft states plainly that existing Autopilot profiles do not need to be migrated and that both solutions are expected to run in parallel for some time, with continued investment in Autopilot for the scenarios device preparation does not yet cover. Treating this as an urgent modernisation project would be reading something into it that is not there.",
    },
    {
      type: "p",
      text: "The most defensible position for a mixed estate is to run both deliberately: Autopilot where hybrid join or pre-provisioning is genuinely required, device preparation for cloud-native Windows 11 hardware — with a clear rule about which population is which, because the precedence rule will otherwise decide for you.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Piloting device preparation on already-registered hardware.** The Autopilot profile wins. Deregister the device first, or the pilot tests nothing.",
        "**Assuming device preparation supports hybrid join.** It does not — Entra join only. This is the single most common disqualifier.",
        "**Assigning PowerShell scripts that run in the user context.** Scripts run during OOBE when no user is signed in, so they must be set to run in the System context. Set the option to run with logged-on credentials to No.",
        "**Expecting configuration policies to be applied when the deployment reports complete.** Policies are synced but not tracked. Applied state is not guaranteed at handover.",
        "**Forgetting the Intune Provisioning Client owner on the device group.** Without it, the enrollment-time group membership that the whole model depends on does not happen.",
        "**Adding corporate identifiers when nothing requires them.** Device preparation only needs them if enrollment restrictions are being used to block personal device enrollments.",
        "**Assuming more than one device preparation policy is additive.** If several target the same user, the highest-priority policy applies — the one nearest the top of the list, with the smallest priority number.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Decide on join type first, because it decides the rest. An estate committed to Microsoft Entra hybrid join cannot use device preparation, and no amount of configuration changes that. If you are cloud-native on Windows 11, the question becomes whether your provisioning problems are about app count and flexibility, which favours Autopilot, or about consistency and the overhead of hardware registration, which favours device preparation.",
    },
    {
      type: "p",
      text: "Whichever you choose, be explicit about which devices belong to which model and enforce it, because Autopilot registration silently wins on any device that has both. That single rule causes more confusion during transition than any capability difference.",
    },
    {
      type: "p",
      text: "If you are still weighing the join type itself, that decision sits upstream of this one. And if devices are already failing before either model gets going, the problem is registration rather than provisioning — worked through in [Autopilot device registration failures](/microsoft-intune/autopilot-device-registration-failures).",
    },
  ],
  faq: [
    {
      question: "Does Autopilot device preparation support Microsoft Entra hybrid join?",
      answer:
        "No. Device preparation supports Microsoft Entra join only. Estates that need to join devices to an on-premises Active Directory domain must continue using Windows Autopilot, which supports both Microsoft Entra join and Microsoft Entra hybrid join.",
    },
    {
      question:
        "Which takes precedence if a device has both an Autopilot profile and a device preparation policy?",
      answer:
        "The Windows Autopilot profile. A device registered as an Autopilot device runs the Autopilot deployment even when a device preparation policy targets the user. To run device preparation on that device, it must first be deregistered from Windows Autopilot.",
    },
    {
      question: "How can I tell which provisioning model a device is actually running?",
      answer:
        "Look at the screen. Device preparation does not use the Enrollment Status Page — it shows a Setting up for work or school screen with a percentage progress bar. If the Enrollment Status Page appears, the device is running Windows Autopilot, which usually means it is registered as an Autopilot device or has an Autopilot profile assigned.",
    },
    {
      question: "Do I need to migrate existing Autopilot profiles to device preparation?",
      answer:
        "No. Microsoft states that there is no need to migrate, and that both solutions are expected to exist in parallel while device preparation gains functionality. Autopilot continues to be developed for scenarios device preparation does not cover, including pre-provisioning and self-deploying mode.",
    },
    {
      question: "How many apps can device preparation install during setup?",
      answer:
        "Up to 25 essential applications, which can include line-of-business, Win32, Microsoft Store and Microsoft 365 apps, plus up to 10 PowerShell scripts. Windows Autopilot supports up to 100 applications but cannot deliver line-of-business and Win32 apps in the same deployment.",
    },
    {
      question:
        "Are configuration policies guaranteed to be applied when device preparation finishes?",
      answer:
        "No. Device preparation syncs the policies assigned to the device group but does not track whether they are applied during the deployment. They may apply during or after it. If you need a device to be fully configured before a user reaches the desktop, the Enrollment Status Page in Windows Autopilot provides that guarantee and device preparation does not.",
    },
  ],
  sources: [
    {
      title: "Compare Windows Autopilot device preparation and Windows Autopilot",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/device-preparation/compare",
    },
    {
      title: "Overview of Windows Autopilot device preparation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/device-preparation/overview",
    },
    {
      title: "Windows Autopilot device preparation FAQ",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/device-preparation/faq",
    },
    {
      title: "Windows Autopilot device preparation requirements",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/device-preparation/requirements",
    },
    {
      title:
        "Windows Autopilot device preparation user-driven Microsoft Entra join: Create a device preparation policy",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/device-preparation/tutorial/user-driven/entra-join-autopilot-policy",
    },
    {
      title: "Enrollment time grouping in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/intune-service/enrollment/enrollment-time-grouping",
    },
    {
      title: "Overview of Windows Autopilot",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/overview",
    },
  ],
};
