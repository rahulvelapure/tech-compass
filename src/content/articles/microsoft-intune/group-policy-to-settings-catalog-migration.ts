import type { Article } from "../../types";

export const article: Article = {
  slug: "group-policy-to-settings-catalog-migration",
  category: "microsoft-intune",
  contentType: "how-to",
  subcategory: "Configuration policy",
  title: "Migrating from Group Policy to the Intune settings catalog",
  seoTitle: "Group Policy to Intune Settings Catalog: A Migration Method",
  metaDescription:
    "Export GPOs, read the Group Policy analytics report honestly, migrate what maps cleanly, and rebuild the rest — without running two policy engines at once.",
  standfirst:
    "Group Policy analytics will tell you what percentage of a GPO maps to Intune. That number is a starting point for a decision, not a migration plan.",
  excerpt:
    "How to export and analyse your GPOs, what the MDM Support percentage does and does not mean, which settings the Migrate feature quietly refuses, and how to run the cutover without two policy engines fighting.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 10,
  lastReviewedAt: "2026-08-13",
  nextReviewAt: "2027-08-13",
  primaryKeyword: "group policy to intune migration",
  secondaryKeywords: [
    "group policy analytics intune",
    "migrate gpo to settings catalog",
    "intune settings catalog migration",
    "group policy migration readiness report",
  ],
  tags: ["Intune", "Windows", "Group Policy", "Endpoint Management", "Migration"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Group Policy analytics, settings catalog and policy migration documentation. File limits, report columns, migration-readiness statuses, the documented limitations of the Migrate feature and the supported CSP list are quoted from those sources and cited below. Sections that recommend a sequencing or ownership approach are labelled as recommendations rather than documented behaviour. No customer environment or tenant configuration is described.",
  body: [
    {
      type: "p",
      text: "Migrating Group Policy to Intune is usually described as a translation exercise: export the GPOs, run them through Group Policy analytics, migrate the supported settings, done. The tooling genuinely does that, and it is good. But the translation is the easy half.",
    },
    {
      type: "p",
      text: "The hard half is everything the percentage does not tell you — which settings map to something *slightly different*, which ones belong in a different Intune workload entirely, which ones no longer make sense on a cloud-native device, and how to run the period where both policy engines are live without them fighting. This article covers the mechanics accurately and then the decisions the mechanics leave to you.",
    },

    {
      type: "h2",
      id: "what-analytics-tells-you",
      text: "What Group Policy analytics actually tells you",
    },
    {
      type: "p",
      text: "Group Policy analytics imports an exported GPO, parses it, and reports which of its settings have a matching setting available to MDM providers. It can then generate a settings catalog policy from the ones that do. It parses six sources:",
    },
    {
      type: "ul",
      items: [
        "Policy CSP",
        "PassportForWork CSP (Windows Hello for Business)",
        "BitLocker CSP",
        "Firewall CSP",
        "AppLocker CSP",
        "Group Policy Preferences",
      ],
    },
    {
      type: "p",
      text: 'Anything outside those may appear under **Unknown Settings**, which means the tool saw the setting but could not analyse it. That is not the same as "not supported" — it is "no answer", and those settings need a manual decision.',
    },
    {
      type: "callout",
      variant: "warning",
      title: "The MDM Support percentage is not a readiness score",
      text: "It reports the proportion of settings in a GPO that have an equivalent in Intune. It says nothing about whether those settings are still needed, whether they behave identically, or whether the remaining percentage is trivial or business-critical. A GPO at 95% can be harder to migrate than one at 60% if the missing 5% is the drive mapping everyone depends on.",
    },
    {
      type: "p",
      text: "One documented caveat matters before you trust any number: **the tool only supports non-ADMX settings in the English language**. Importing a GPO whose settings are in another language produces an inaccurate MDM Support percentage.",
    },

    {
      type: "h2",
      id: "step-one-export",
      text: "Step 1: export the GPOs",
    },
    {
      type: "p",
      text: "Export happens on-premises, from the Group Policy Management console, and the format must be XML.",
    },
    {
      type: "ol",
      items: [
        "Open `GPMC.msc` and expand your domain, then **Group Policy Objects**.",
        "Right-click the GPO and choose **Save report**.",
        "Set **Save as type** to **XML File** and save somewhere accessible.",
      ],
    },
    {
      type: "p",
      text: "Two constraints cause most import failures, and both are silent until they bite. A **single GPO XML file cannot exceed 4 MB** — if it does, the import fails and you have to reduce the number of settings in the object. And files without proper Unicode encoding also fail. Check both before you queue up fifty exports.",
    },
    {
      type: "p",
      text: "On permissions: importing and analysing requires the Intune Administrator role, or a role holding both the **Security baselines** and **Device Configuration** permissions. This is worth confirming early, because the failure mode is a support ticket rather than an obvious error.",
    },

    {
      type: "h2",
      id: "step-two-import",
      text: "Step 2: import and read the analysis",
    },
    {
      type: "p",
      text: "In the Intune admin center, go to **Devices** > **Manage devices** > **Group Policy analytics** > **Import**. Multiple files can be selected at once. You are also asked for a scope tag, and this choice has consequences beyond tidiness.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Scope tags decide who can see the import at all",
      text: "If you do not choose one, the Default scope tag is applied — and only admins scoped to Default will see the imported GPO. An admin with a different scope tag cannot see it in the list or in the reporting, and cannot migrate it. On a distributed IT team this is the difference between a colleague continuing your work and a colleague concluding the import never happened.",
    },
    {
      type: "p",
      text: "Selecting the MDM Support percentage for an imported GPO opens the per-setting detail. Two of those columns do more work than the rest:",
    },
    {
      type: "table",
      caption: "Per-setting columns worth reading carefully",
      head: ["Column", "What it gives you"],
      rows: [
        [
          "MDM Support",
          "Yes, No, or a suggestion to migrate to a newer supported version of the setting.",
        ],
        [
          "Scope",
          "Whether the setting targets users or devices. This determines how you assign the resulting Intune policy, and it is the detail most often lost in translation.",
        ],
        [
          "Min OS Version",
          "The minimum Windows build the setting applies to — for example 18362 for Windows 10 1903. A setting that maps perfectly but requires a build newer than your fleet is not migratable today.",
        ],
        [
          "CSP Name",
          "Which CSP exposes the setting — Policy, BitLocker, PassportForWork and so on. Useful because CSP boundaries determine several conflict behaviours later.",
        ],
        [
          "CSP Mapping",
          "The OMA-URI path, for example ./Device/Vendor/MSFT/BitLocker/RequireDeviceEncryption. This is your escape hatch: a setting with no catalog entry can often still be delivered as a custom profile.",
        ],
      ],
    },

    {
      type: "h2",
      id: "step-three-readiness",
      text: "Step 3: the migration readiness report",
    },
    {
      type: "p",
      text: '**Reports** > **Device management** > **Group policy analytics** aggregates every imported GPO into three buckets. This is the view to plan from, because it separates "cannot" from "should not".',
    },
    {
      type: "table",
      caption: "Migration readiness statuses and what each one actually asks of you",
      head: ["Status", "Documented meaning", "What to do"],
      rows: [
        [
          "Ready for migration",
          "The policy has a matching setting in Intune.",
          "Migrate — but still confirm the setting is one you want, not just one you have.",
        ],
        [
          "Not supported",
          "No matching setting. Typically not exposed to MDM providers at all.",
          "Decide: rebuild with a different mechanism, deliver via custom OMA-URI if a CSP path exists, or drop it.",
        ],
        [
          "Deprecated",
          "Applies to older Windows or Microsoft Edge versions, or is no longer used.",
          "Almost always drop. This is the free win in most estates.",
        ],
      ],
    },
    {
      type: "p",
      text: "Two timing details. The mapping logic is maintained by Microsoft, and when it is updated **your imported GPOs update automatically** — you do not need to re-import to benefit from newly supported settings. But after you add or remove imports, the readiness reporting takes around **20 minutes** to catch up, so a report that looks wrong immediately after an import is probably just early.",
    },

    {
      type: "h2",
      id: "step-four-migrate",
      text: "Step 4: generate the settings catalog policy",
    },
    {
      type: "p",
      text: "From the Group Policy analytics list, tick the **Migrate** checkbox next to one or more GPOs and select **Migrate**. The **Settings to migrate** tab lists every setting; you choose which ones go into the profile, with a search box and a *select all on this page* control. Then name the profile, assign it, and create.",
    },
    {
      type: "p",
      text: "The genuinely useful behaviour here is that **conflicts are caught before deployment**. If two GPOs you are merging set the same setting to different values, the wizard blocks you with:",
    },
    {
      type: "quote",
      text: "Conflicts are detected for the following settings: <setting name>. Select only one version with the value you prefer in order to continue.",
    },
    {
      type: "p",
      text: "Unchecking one version resolves it. This is worth appreciating: it is the one place in the Intune policy lifecycle where a conflict is surfaced *at authoring time* rather than discovered later on a device. Conflicts introduced after deployment behave very differently, and are covered in [Intune policy conflicts: how to detect, diagnose and prevent them](/microsoft-intune/intune-policy-conflicts).",
    },

    {
      type: "h2",
      id: "best-effort",
      text: 'What "best effort" means in practice',
    },
    {
      type: "p",
      text: "Microsoft describes the Migrate feature as **best effort**, and documents four specific ways the output can differ from the input. Knowing them in advance turns surprises into expectations.",
    },
    {
      type: "table",
      caption: "Documented limitations of the Migrate feature",
      head: ["Behaviour", "Why", "Your move"],
      rows: [
        [
          "AppLocker and Firewall rule settings show Migrate greyed out",
          "These have a better configuration experience in the Endpoint Security workload.",
          "Rebuild them as Firewall and Application Control policies rather than fighting the wizard.",
        ],
        [
          "A setting migrates to a different setting",
          "Intune substitutes an alternate with a similar effect — common with older Office Administrative Template and older Google Chrome settings.",
          "Read what it substituted. Similar effect is not identical effect.",
        ],
        [
          "A setting fails during creation",
          "The value is in an unexpected format, or a required child setting was missing from the imported GPO.",
          "Check Notifications immediately after creating the profile — that is where these are reported.",
        ],
        [
          "A setting suggests a newer version",
          "The imported setting is an older revision that is no longer supported.",
          "Migrate to the suggested version, then verify the behaviour matches what the old one did.",
        ],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Read Notifications before you close the blade",
      text: "Failures during profile creation are surfaced in Notifications, not in the resulting profile. A profile can be created successfully while several of the settings you selected silently did not make it in. If you do not check at the time, the gap is only discoverable by comparing the profile against the source GPO by hand.",
    },

    {
      type: "h2",
      id: "what-does-not-migrate",
      text: "What will not migrate, and what to do instead",
    },
    {
      type: "p",
      text: "The following is a planning recommendation rather than documented product behaviour, but it reflects the boundaries the documentation draws. Categorise every unsupported setting into one of four outcomes before you start building profiles:",
    },
    {
      type: "table",
      caption: "A disposition model for settings that do not map",
      head: ["Category", "Example", "Outcome"],
      rows: [
        [
          "Belongs in another Intune workload",
          "AppLocker rules, firewall rules, BitLocker configuration",
          "Rebuild in Endpoint Security. Do not force it into the settings catalog.",
        ],
        [
          "Has a CSP path but no catalog entry",
          "A setting where the CSP Mapping column shows an OMA-URI",
          "Deliver as a custom profile using that OMA-URI. Document why.",
        ],
        [
          "Meaningless on a cloud-native device",
          "Settings that assume line-of-sight to a domain controller or on-premises file shares",
          "Drop. Migrating it preserves an assumption you are trying to remove.",
        ],
        [
          "Genuinely needed, genuinely unavailable",
          "Some logon scripts, some drive mappings, some folder redirection",
          "Solve with a different mechanism — a platform script, a modern file service — or accept the setting as a reason that particular workload stays where it is.",
        ],
      ],
    },
    {
      type: "p",
      text: "The fourth row is the one that decides project timelines. A migration is not blocked by settings that do not map; it is blocked by settings that do not map *and* that nobody is willing to give up. Identify those in week one, not week ten.",
    },

    {
      type: "h2",
      id: "the-cutover",
      text: "The cutover: two policy engines, one device",
    },
    {
      type: "p",
      text: "During migration a device can be receiving both Group Policy and MDM policy. The documented default is that **Group Policy wins**, which means a freshly migrated settings catalog policy can appear to deploy successfully and change nothing on a domain-joined device.",
    },
    {
      type: "p",
      text: "The `MDMWinsOverGP` setting in the ControlPolicyConflict CSP inverts that, but only for settings in the Policy CSP — not the Defender CSP, not Windows Hello in PassportForWork, and Group Policy still takes precedence for Windows Update policies. Because Group Policy analytics parses several CSPs beyond Policy CSP, a single migrated profile can easily contain a mixture of settings where MDM wins and settings where it does not. The precedence detail is covered in [the policy conflicts article](/microsoft-intune/intune-policy-conflicts).",
    },
    {
      type: "p",
      text: "The cleaner sequencing, and the one that avoids the ambiguity entirely, is a recommendation rather than a documented requirement:",
    },
    {
      type: "ol",
      items: [
        "Migrate a GPO into a settings catalog profile and assign it to a **pilot group only**.",
        "Remove or unlink the equivalent settings from the on-premises GPO for that same pilot scope, so exactly one engine owns them.",
        "Verify on a device that the setting took effect — not that the profile reports success, but that the actual configured value changed.",
        "Expand the pilot scope, then retire the GPO settings for the wider estate.",
        "Only then move to the next GPO.",
      ],
    },
    {
      type: "p",
      text: "Validate at least once on a **freshly provisioned** device rather than only on an existing one. A migrated profile behaves differently during initial provisioning, where certificate and network profiles are tracked as part of setup and a badly formed one can stall the process. If that happens, [Enrollment Status Page stuck: a systematic troubleshooting method](/microsoft-intune/enrollment-status-page-troubleshooting) covers how to find the blocking item.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Treating the MDM Support percentage as a project plan.** It measures mappability, not need, equivalence or risk.",
        "**Migrating every GPO you have.** A migration is the best opportunity you will get to delete settings nobody can justify. Deprecated settings in particular are usually free to drop.",
        "**Lifting and shifting the GPO structure.** GPOs are organised by OU because that is how Group Policy targets. Intune targets groups and filters. Recreating the OU tree as security groups reproduces a constraint you no longer have.",
        "**Ignoring the Scope column.** A user-targeted GPO setting migrated into a device-assigned profile will not behave the way it did on-premises.",
        "**Leaving both engines configuring the same setting.** Group Policy wins by default, so the migration looks done and is not.",
        "**Not checking Notifications after creating the profile.** Settings that failed to migrate are reported there and nowhere else.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Use Group Policy analytics as an inventory and triage tool, not as a migration engine. Import everything, generate the readiness report, and spend the first pass deleting: deprecated settings, settings that assume an on-premises dependency you are removing, and settings nobody can name an owner for. Most estates lose a meaningful fraction of their GPO surface at this step, and every setting removed here is one you never have to migrate, test or support.",
    },
    {
      type: "p",
      text: "Then migrate in small units with a pilot group, retire the equivalent GPO settings as you go so only one engine owns each setting, and verify the effect on a device rather than trusting the deployment status. Rebuild AppLocker, firewall and BitLocker configuration in Endpoint Security rather than the settings catalog, and keep a written record of anything delivered by custom OMA-URI, because that is the part your successor will not be able to infer.",
    },
    {
      type: "p",
      text: "More endpoint management coverage is collected in the [Microsoft Intune section](/microsoft-intune). How claims on this site are labelled and researched is described in [about this publication](/about).",
    },
  ],
  faq: [
    {
      question: "What does the MDM Support percentage in Group Policy analytics mean?",
      answer:
        "It is the proportion of settings in an imported GPO that have an equivalent setting available in Intune. It does not indicate whether those settings are still required, whether the Intune equivalent behaves identically, or how difficult the unmapped remainder will be to replace.",
    },
    {
      question: "How large can a GPO export be for Group Policy analytics?",
      answer:
        "A single GPO XML file cannot exceed 4 MB, and the import fails if it does. Files without proper Unicode encoding also fail. If an export is too large, reduce the number of settings in the Group Policy object before exporting again.",
    },
    {
      question: "Why can't I migrate my AppLocker or firewall rules to the settings catalog?",
      answer:
        "Microsoft deliberately disables the Migrate option for AppLocker settings and Firewall rule settings because those have a better configuration experience in the Endpoint Security workload. Rebuild them as Firewall and Application Control policies instead.",
    },
    {
      question: "Do I need to re-import my GPOs when Intune adds support for new settings?",
      answer:
        "No. When the Intune product team updates the mapping logic, imported GPOs are updated automatically and the MDM Support percentage changes to reflect it. Note that after adding or removing imports, the migration readiness report takes around 20 minutes to refresh.",
    },
    {
      question: "Will my migrated Intune policy override Group Policy during the cutover?",
      answer:
        "Not by default. Group Policy takes precedence over MDM unless MDMWinsOverGP is configured, and that setting applies only to the Policy CSP — not the Defender CSP, not Windows Hello for Business, and Group Policy still wins for Windows Update policies. The reliable approach is to remove the setting from the GPO as you migrate it, so only one engine owns it.",
    },
    {
      question: "Can I migrate a setting that Group Policy analytics reports as not supported?",
      answer:
        "Sometimes. Check the CSP Mapping column in the per-setting view: if it shows an OMA-URI path, the setting can often still be delivered through a custom device configuration profile even though it has no settings catalog entry. If there is no CSP path, it needs a different mechanism entirely.",
    },
  ],
  sources: [
    {
      title:
        "Import and analyze your on-premises GPOs using Group Policy analytics in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-configuration/import-group-policy-analytics",
    },
    {
      title: "Create a Settings Catalog policy using your imported GPOs in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-configuration/migrate-group-policy",
    },
    {
      title: "Use the Intune settings catalog to configure settings",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-configuration/settings-catalog/",
    },
    {
      title: "Policy CSP - ControlPolicyConflict (MDMWinsOverGP)",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/client-management/mdm/policy-csp-controlpolicyconflict",
    },
    {
      title: "Configuration service provider (CSP) reference",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/client-management/mdm/configuration-service-provider-reference",
    },
    {
      title: "Use custom settings for Windows devices in Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-configuration/templates/configure-custom-settings",
    },
    {
      title: "Manage endpoint security in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/endpoint-security-policies",
    },
  ],
};
