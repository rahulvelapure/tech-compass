import type { Article } from "../../types";

export const article: Article = {
  slug: "intune-policy-conflicts",
  category: "microsoft-intune",
  contentType: "troubleshooting",
  subcategory: "Configuration policy",
  title: "Intune policy conflicts: how to detect, diagnose and prevent them",
  seoTitle: "Intune Policy Conflicts: Detect, Diagnose and Prevent",
  metaDescription:
    "How Intune actually resolves conflicting policies, where to find the profile causing one, and the assignment architecture that stops conflicts recurring.",
  standfirst:
    "Most Intune conflicts are not bugs. They are two policies given equal authority over one setting, and the platform refusing to guess which of them you meant.",
  excerpt:
    "What Intune means by Conflict, which policy types actually take precedence, how to trace a conflicted setting back to the profile causing it, and how to design assignments so it stops happening.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-12",
  readingMinutes: 10,
  lastReviewedAt: "2026-08-13",
  nextReviewAt: "2027-08-13",
  primaryKeyword: "intune policy conflict",
  secondaryKeywords: [
    "intune conflict resolution",
    "intune per setting status",
    "intune configuration profile conflict",
    "MDMWinsOverGP",
    "intune policy precedence",
  ],
  tags: ["Intune", "Windows", "Troubleshooting", "Endpoint Management", "Group Policy"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Intune, Policy CSP and Defender documentation. Precedence rules, conflict-resolution behaviour, report locations and the MDMWinsOverGP exceptions are quoted from those sources and cited below. Where the article recommends an approach rather than describing documented behaviour, it says so explicitly. No customer environment or tenant configuration is described.",
  body: [
    {
      type: "p",
      text: "A conflict in Intune has a precise meaning: **two or more policies assigned to the same device set the same setting to different values**, and Intune will not choose between them. The setting may fail to apply entirely. Nothing is broken — the platform is telling you that you have given two policies equal authority over one setting and it has no basis for picking a winner.",
    },
    {
      type: "p",
      text: "That framing matters because it points at the fix. Conflicts are an assignment-architecture problem, not a troubleshooting problem. You can resolve each one individually forever, or you can decide once which policy type owns which settings and stop generating them. This article covers both: how to trace a specific conflict to the profile causing it, and the design decisions that prevent the next one.",
    },

    {
      type: "h2",
      id: "what-conflict-means",
      text: 'What Intune means by "Conflict"',
    },
    {
      type: "p",
      text: "Conflict is one of five states a policy can report, and it is routinely confused with the other four. Reading the state correctly eliminates most wasted investigation.",
    },
    {
      type: "table",
      caption: "Policy states in the Intune admin center",
      head: ["State", "What it means", "Where the fix is"],
      rows: [
        [
          "Succeeded",
          "The policy applied. For a security baseline setting, the device value matches the configured value.",
          "Nothing to do.",
        ],
        [
          "Conflict",
          "Two settings apply to the same device and Intune cannot resolve which wins — or an existing setting on the device cannot be overridden.",
          "Your policy design. Requires a human decision.",
        ],
        [
          "Error",
          "The setting failed to apply. Usually accompanied by an error code.",
          "The setting or the device, not the assignment.",
        ],
        [
          "Pending",
          "The device has not checked in yet, or it received the policy and has not reported back.",
          "Usually time. Not a fault.",
        ],
        [
          "Not applicable",
          "The device cannot receive the policy — wrong platform, or an OS version that does not support the setting.",
          "Targeting or filters, not the policy body.",
        ],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Conflict is not always two Intune policies",
      text: "Microsoft's troubleshooting documentation defines the Conflict state as either two policies with the same setting at different values, or an existing setting on the device that Intune cannot override. The second case matters on co-managed and previously domain-joined estates, where the competing value may not be coming from Intune at all.",
    },

    {
      type: "h2",
      id: "precedence-rules",
      text: "The precedence rules that actually exist",
    },
    {
      type: "p",
      text: "There is a widespread assumption that security baselines outrank endpoint security policies, which outrank ordinary configuration profiles. That hierarchy does not exist. Microsoft's documentation is explicit that **all Intune policy types are treated as equal sources of device configuration settings**. Only three real rules apply.",
    },
    {
      type: "h3",
      id: "compliance-beats-configuration",
      text: "Compliance policies beat configuration policies",
    },
    {
      type: "p",
      text: "Where the same setting appears in both a compliance policy and any configuration policy — device configuration, settings catalog, endpoint security or a security baseline — the compliance policy value is used. This is the one genuine hierarchy in the product, and it is absolute rather than situational.",
    },
    {
      type: "h3",
      id: "most-restrictive-compliance",
      text: "Between compliance policies, the most restrictive wins",
    },
    {
      type: "p",
      text: "Two compliance policies evaluating the same setting resolve to the more restrictive value. No conflict is raised and no administrator decision is required, which is why compliance policy sprawl tends to go unnoticed until something is unexpectedly stricter than anyone intended.",
    },
    {
      type: "h3",
      id: "configuration-conflicts-are-manual",
      text: "Between configuration policies, nothing wins",
    },
    {
      type: "p",
      text: "This is the case that produces the tickets. When two configuration policies set the same setting to different values, Intune raises a conflict and the setting **might fail to apply at all**. There is no tie-break by policy type, creation date, name or assignment scope. The resolution is manual, and it is a decision about which policy should own the setting.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Baselines and endpoint security policies collide by design",
      text: "Security baselines deliberately set non-default values to match a recommended configuration. Endpoint security and device configuration policies typically leave settings as Not configured. Mixing the two over the same settings is one of the most common conflict sources, which is why Microsoft's own guidance is to use endpoint security policies OR security baselines for a given set of settings, not both.",
    },

    {
      type: "h2",
      id: "app-protection-differs",
      text: "App protection policies behave differently",
    },
    {
      type: "p",
      text: "App protection (MAM) policies do not follow the configuration-policy model, and treating them the same way leads to wrong conclusions. Their documented behaviour:",
    },
    {
      type: "ul",
      items: [
        "Conflicting values resolve to **the most restrictive setting available**, rather than raising a conflict for a human to resolve.",
        "Numeric entry fields are the exception — PIN attempts before reset, for instance, are set as though the policy had been created with the recommended-settings option, not simply to the lowest number.",
        "If one policy is already deployed and applied when a second arrives, **the first takes precedence and stays applied**, and the second reports a conflict.",
        "If both apply at the same time with no incumbent, both report conflict and the conflicting settings resolve to the most restrictive values.",
      ],
    },
    {
      type: "p",
      text: "The practical consequence is that a MAM conflict is not blocking in the way a configuration conflict is. Something is being enforced; it may simply be stricter than the policy you were looking at.",
    },

    {
      type: "h2",
      id: "policy-merge",
      text: "Policy merge: the documented exception",
    },
    {
      type: "p",
      text: "Some settings never conflict, because Intune combines them instead. Policy merge evaluates a supported setting across every applicable profile and produces a single superset. Defender exclusion lists are the clearest example: three antivirus policies each defining different file path exclusions merge into one combined list rather than fighting.",
    },
    {
      type: "table",
      caption: "Where policy merge applies, and what happens where it does not",
      head: ["Situation", "Behaviour"],
      rows: [
        [
          "Setting supports merge (Defender ExcludedPaths, ExcludedProcesses, ExcludedExtensions; device control USB device and setup class lists)",
          "Values from all applicable policies combine into one superset, duplicates removed. No conflict.",
        ],
        [
          "Two different settings that happen to be related (an allow list and a block list for setup classes)",
          "Not compared or merged. The device receives both and enforces the most restrictive result — a class on the blocklist is blocked even if it also appears on the allowlist.",
        ],
        [
          "Setting does not support merge (for example PreventInstallationOfMatchingDeviceIDs)",
          "Processed separately. The most secure policy applies; if two are equally secure, the last modified applies; if that still cannot resolve it, no policy is delivered to the device.",
        ],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: '"No policy is delivered" is the outcome worth remembering',
      text: "In the unmergeable case, an unresolvable conflict does not fall back to a safe default — the device receives nothing for that setting. A security control you believe is deployed can be absent because two policies disagreed about it.",
    },

    {
      type: "h2",
      id: "finding-the-conflict",
      text: "Finding the policy causing a conflict",
    },
    {
      type: "p",
      text: "Intune will tell you exactly which profiles are competing. There are three routes, and they answer different questions.",
    },
    {
      type: "h3",
      id: "by-device",
      text: "By device — when you have one broken machine",
    },
    {
      type: "ol",
      items: [
        "**Devices** > **All devices** > select the device > **Device configuration**. Every policy applying to that device is listed with its status.",
        "Select the policy showing **Conflict**. This lists the settings in that policy as they apply to this device.",
        "Select the conflicting setting row. Intune opens a pane naming **every profile that configures that setting**, with its value.",
        "Open each named source profile and decide which one should own the setting. Remove it from the others.",
      ],
    },
    {
      type: "p",
      text: 'That third step is the one people miss. The source-profile list is the answer to "which policy is fighting mine", and it removes the need to search the tenant by hand.',
    },
    {
      type: "h3",
      id: "by-policy",
      text: "By policy — when you have one suspect profile",
    },
    {
      type: "p",
      text: "Open the policy under **Devices** > **Manage devices** > **Configuration**, then **Device and user check-in status** > **Per setting status**. This breaks the policy down to individual settings and shows how many devices report Success, Conflict or Error for each one. It is the fastest way to establish whether a policy is broadly failing or has one bad setting.",
    },
    {
      type: "h3",
      id: "tenant-wide",
      text: "Tenant-wide — when you want the backlog",
    },
    {
      type: "p",
      text: "**Devices** > **Monitor** > **Assignment failures** lists policies that failed to deploy because of an error or a conflict, across the tenant, and exports to CSV. This is the view worth reviewing on a schedule rather than in response to a ticket.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Two reports, two different numbers — both correct",
      text: "Device and user check-in status depends on when each device last checked in, so devices that have been offline show stale states. The Device assignment status report can take 24 to 48 hours to reflect recent assignment or group membership changes, particularly on large tenants. Microsoft documents that it is normal for these two numbers to differ. Do not treat a discrepancy as evidence of a fault.",
    },

    {
      type: "h2",
      id: "group-policy-overlap",
      text: "The Group Policy overlap, and why MDMWinsOverGP disappoints people",
    },
    {
      type: "p",
      text: "On estates that still have Group Policy, a setting can be configured in both places. The documented default is that **Group Policy wins**. Since Windows 10 version 1803 this can be inverted with the `MDMWinsOverGP` setting in the ControlPolicyConflict CSP, which has no Group Policy or PowerShell equivalent and must be delivered as a custom OMA-URI profile:",
    },
    {
      type: "code",
      language: "text",
      filename: "Custom OMA-URI setting (device scope)",
      code: `OMA-URI:   ./Device/Vendor/MSFT/Policy/Config/ControlPolicyConflict/MDMWinsOverGP
Data type: Integer
Value:     1`,
    },
    {
      type: "p",
      text: "The disappointment is in the scope. `MDMWinsOverGP` applies **only to policies in the Policy CSP**. It does not cover everything you might assume:",
    },
    {
      type: "table",
      caption: "Where MDMWinsOverGP does and does not apply",
      head: ["Area", "Covered?", "Consequence"],
      rows: [
        [
          "Settings in the Policy CSP with an equivalent Group Policy",
          "Yes",
          "MDM value applies and Group Policy is blocked from setting it.",
        ],
        [
          "Microsoft Defender settings (Defender CSP)",
          "No",
          "Microsoft's guidance is to remove the Defender Group Policy settings entirely rather than rely on precedence.",
        ],
        [
          "Windows Hello for Business (PassportForWork CSP)",
          "No",
          "Configure by GPO or CSP, never both. Conflicting CSP settings are not applied until the Group Policy settings are cleared.",
        ],
        [
          "Attack surface reduction rules",
          "Partly",
          "Group Policy takes precedence by default; MDMWinsOverGP is documented as not applying to ASR rules on Windows 10.",
        ],
        ["Windows Update policies", "No", "Group Policy settings take precedence over MDM."],
      ],
    },
    {
      type: "p",
      text: "Two operational details are easy to miss. The policy is device-scoped only, and Microsoft recommends setting it **at every sync** rather than once, so that Group Policy settings which drift back into conflict are removed again. And to see what it actually blocked, generate the Advanced Diagnostic Report on the device from **Settings** > **Accounts** > **Access work or school** — it lists the Group Policy settings that were blocked because an MDM equivalent was configured.",
    },
    {
      type: "p",
      text: "The honest recommendation, and Microsoft's own: do not configure the same setting in both GPO and MDM unless it is definitely under the control of MDMWinsOverGP. Otherwise there is a race condition with no guaranteed winner.",
    },

    {
      type: "h2",
      id: "deciding-ownership",
      text: "Deciding which policy type owns a setting",
    },
    {
      type: "p",
      text: "This is the part that actually prevents conflicts. The following is a recommendation rather than documented product behaviour, but it follows directly from the precedence rules above: pick one owner per setting domain and hold the line.",
    },
    {
      type: "table",
      caption:
        "A workable ownership model. The value is in choosing one column, not in which column you choose.",
      head: ["Setting domain", "Suggested owner", "Why"],
      rows: [
        [
          "Antivirus, firewall, disk encryption, ASR",
          "Endpoint security policies",
          "Purpose-built, grouped by security workload, and reported on separately from general device management.",
        ],
        [
          "Broad hardening to a published standard",
          "A security baseline — used instead of, not alongside, endpoint security policies for the same settings",
          "Baselines set non-default values across a wide surface; overlapping them with anything else guarantees conflicts.",
        ],
        [
          "General device configuration",
          "Settings catalog",
          "One profile type, searchable settings, and conflicts are visible per setting.",
        ],
        [
          "Anything evaluated rather than set",
          "Compliance policy",
          "Compliance beats configuration everywhere, so putting an enforcement value here silently overrides your configuration profiles.",
        ],
        [
          "Legacy settings with no CSP equivalent",
          "Group Policy, kept deliberately separate",
          "Not everything is available via MDM. Keeping the boundary explicit is better than discovering it as a race condition.",
        ],
      ],
    },
    {
      type: "p",
      text: "Two further practices reduce conflicts more than any reporting workflow. Assign a setting from exactly one profile, and use assignment groups that cannot overlap for the same setting — Microsoft's guidance for unavoidable overlap between baselines and endpoint security policies is explicitly to assign them to different device groups. And record which policy type owns which domain somewhere a colleague will find it, because most conflicts are introduced by someone who did not know the rule existed.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Assuming a hierarchy between configuration policy types.** There is none. A security baseline does not outrank a settings catalog profile.",
        "**Deleting one of the two policies as a reflex.** The conflict tells you two profiles claim the setting; it does not tell you which claim is correct. Removing the setting from one profile is usually right, deleting the profile rarely is.",
        "**Putting enforcement values in compliance policies.** Compliance always wins over configuration, so a value placed there overrides configuration profiles silently and without a conflict being raised.",
        "**Reading two reports and treating the difference as a bug.** Assignment status lags by up to 48 hours on large tenants; check-in status depends on the device being online.",
        "**Relying on MDMWinsOverGP for Defender or Windows Hello.** It covers the Policy CSP only. For those, remove the Group Policy configuration instead.",
        "**Treating a conflicted security setting as merely cosmetic.** Where policy merge does not apply and the conflict cannot be resolved, the device receives no policy for that setting at all.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "For a live conflict: go to the device, open Device configuration, select the conflicted setting, and read the source-profile list. That names both sides in one click. Decide which profile owns the setting, remove it from the other, and let the device check in.",
    },
    {
      type: "p",
      text: "For the estate: write down which policy type owns which setting domain, keep security baselines and endpoint security policies off each other's settings, avoid configuring anything in both GPO and MDM, and review **Assignment failures** on a schedule rather than waiting for a user to report that a control is missing. Conflicts are cheap to prevent at design time and expensive to chase one device at a time.",
    },
    {
      type: "p",
      text: "Conflicts also surface during provisioning, where the symptom looks entirely different — a device that never finishes setting up rather than a setting that quietly did not apply. That failure mode is covered separately in [Enrollment Status Page stuck: a systematic troubleshooting method](/microsoft-intune/enrollment-status-page-troubleshooting). More endpoint management coverage is collected in the [Microsoft Intune section](/microsoft-intune), and the way claims on this site are labelled and researched is described in [about this publication](/about).",
    },
  ],
  faq: [
    {
      question: "Which Intune policy wins when two profiles set the same setting?",
      answer:
        "Between two configuration policies, neither wins. Intune raises a conflict and the setting might fail to apply, because all Intune configuration policy types are treated as equal sources of configuration. The exception is compliance policy, whose settings always take precedence over configuration profile settings, and app protection policies, which resolve to the most restrictive value.",
    },
    {
      question: "Do security baselines override device configuration profiles?",
      answer:
        "No. Security baselines have the same precedence as endpoint security policies and device configuration profiles. Because baselines set non-default values while other policy types usually leave settings Not configured, overlapping them is a common source of conflicts. Microsoft's guidance is to use baselines or endpoint security policies for a given set of settings, not both.",
    },
    {
      question: "Where do I see which policies are in conflict?",
      answer:
        "Devices > All devices > select the device > Device configuration > select the conflicted policy > select the conflicted setting. The pane lists every profile configuring that setting. For a policy-level view use Per setting status, and for a tenant-wide list use Devices > Monitor > Assignment failures.",
    },
    {
      question: "Does MDMWinsOverGP make Intune win over Group Policy for everything?",
      answer:
        "No. It applies only to settings in the Policy CSP. It does not apply to the Defender CSP, to Windows Hello for Business in the PassportForWork CSP, or to attack surface reduction rules on Windows 10, and Group Policy takes precedence for Windows Update policies. Where it does not apply, remove the Group Policy configuration rather than relying on precedence.",
    },
    {
      question: "Why do two Intune reports show different conflict numbers?",
      answer:
        "They measure different things. Device and user check-in status reflects each device's last check-in, so offline devices show stale data. The Device assignment status report can take 24 to 48 hours to reflect recent assignment or group membership changes on large tenants. Microsoft documents that a difference between them is normal.",
    },
    {
      question: "Can a conflict cause a setting to be missing entirely?",
      answer:
        "Yes. For settings that do not support policy merge, conflicts are resolved by applying the most secure policy, then the last modified policy. If neither resolves it, no policy is delivered to the device for that setting — so a control you believe is deployed can be absent.",
    },
  ],
  sources: [
    {
      title:
        "Common questions, answers, and scenarios with policies and profiles in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-configuration/troubleshoot-device-profiles",
    },
    {
      title: "Manage endpoint security in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/endpoint-security-policies",
    },
    {
      title: "View and monitor device configuration policies in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-configuration/monitor-device-profile",
    },
    {
      title: "Troubleshooting policies and profiles in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/device-configuration/troubleshoot-policies-in-microsoft-intune",
    },
    {
      title: "Policy CSP - ControlPolicyConflict (MDMWinsOverGP)",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/client-management/mdm/policy-csp-controlpolicyconflict",
    },
    {
      title: "Antivirus policy for endpoint security in Microsoft Intune (policy merge)",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-configuration/endpoint-security/antivirus",
    },
    {
      title: "Configure attack surface reduction rules and exclusions",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/defender-endpoint/attack-surface-reduction-rules-configure",
    },
    {
      title: "Configure Windows Hello for Business — policy conflicts from multiple policy sources",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/configure",
    },
  ],
};
