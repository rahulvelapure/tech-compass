import type { Article } from "../../types";

export const article: Article = {
  slug: "enrollment-status-page-troubleshooting",
  category: "microsoft-intune",
  contentType: "troubleshooting",
  subcategory: "Autopilot",
  title: "Enrollment Status Page stuck: a systematic troubleshooting method",
  seoTitle: "Intune Enrollment Status Page Stuck: How to Diagnose It",
  metaDescription:
    "Diagnose a stuck Windows Autopilot Enrollment Status Page in order: identify the phase, collect the diagnostics bundle, then read the tracking registry.",
  standfirst:
    "A stuck ESP is almost never random. It is one blocking item, in one known phase, and there are only a handful of places it can be.",
  excerpt:
    "Autopilot deployments that hang on the Enrollment Status Page nearly always fail on a single identifiable item. Here is the order to check things in, and the configuration that stops it recurring.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-28",
  updatedAt: "2026-08-12",
  readingMinutes: 11,
  lastReviewedAt: "2026-08-13",
  nextReviewAt: "2027-08-13",
  primaryKeyword: "enrollment status page stuck",
  secondaryKeywords: [
    "Intune ESP troubleshooting",
    "Autopilot stuck on device setup",
    "ESP timeout Intune",
    "enrollment status page identifying",
    "Autopilot account setup stuck",
  ],
  tags: ["Intune", "Autopilot", "Windows", "Troubleshooting", "Endpoint Management"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Autopilot, Intune enrollment and Enrollment Status Page documentation, including the ESP troubleshooting reference and the documented known-issues list. Registry paths, error codes, installation-state values and configuration behaviour are quoted from those sources and cited below. No customer environment, tenant configuration or incident data is described, and no timings are claimed beyond the figures Microsoft publishes.",
  featured: true,
  body: [
    {
      type: "p",
      text: 'The Enrollment Status Page is a progress gate, not a process. It waits for a defined set of work to finish and blocks the desktop until that work reports success or the timeout expires. When a device sits on **Device preparation** or **Account setup** for forty minutes, the useful question is never "why is Autopilot slow" — it is **which specific item is the ESP still waiting for, and what is that item\'s own error**.',
    },
    {
      type: "p",
      text: "That question has a documented answer on the device. Windows records every tracked app, profile and policy, with its installation state, in the registry. Almost every stuck ESP can be resolved by reading that data rather than by guessing, resetting and hoping. The order below moves from the cheapest check to the most expensive; each step either produces an answer or eliminates a whole class of causes.",
    },

    {
      type: "h2",
      id: "the-three-phases",
      text: "The three phases, and why the phase names the cause",
    },
    {
      type: "p",
      text: "The ESP tracks three phases. The first two — **Device preparation** and **Device setup** — are the device ESP. The third, **Account setup**, is the user ESP. They fail for entirely different reasons, so reading the on-screen phase before touching anything eliminates most of the search space.",
    },
    {
      type: "h3",
      id: "phase-device-preparation",
      text: "Device preparation",
    },
    {
      type: "p",
      text: "Three tasks: securing the hardware (TPM key attestation and identity validation against Microsoft Entra ID), joining the organisation's network (Entra join using the token from the previous step), and registering the device for mobile management. In user-driven mode the first two are already complete by the time the ESP appears; they matter in self-deploying and pre-provisioning scenarios, which is exactly why TPM attestation failures show up in those flows and not in user-driven ones.",
    },
    {
      type: "p",
      text: "After enrolment the device calculates which policies and apps to track in the next phase, and installs the Intune Management Extension used for Win32 apps. A hang here is an identity, network or agent-installation problem — not an application problem.",
    },
    {
      type: "h3",
      id: "phase-device-setup",
      text: "Device setup",
    },
    {
      type: "p",
      text: "This phase tracks four categories: security policies, certificate profiles, network connections and apps. The detail that surprises people is what is **not** tracked. Microsoft's documentation is explicit that the ESP does not track security policies such as device restrictions — those install in the background — with the exception of Microsoft Edge, Assigned Access and Kiosk Browser policies. When the phase completes it reports security policies as **(1 of 1) completed** regardless. Certificate tracking covers SCEP profiles targeted at devices; network tracking covers VPN and Wi-Fi profiles targeted at devices.",
    },
    {
      type: "callout",
      variant: "note",
      title: '"1 of 1 completed" does not mean your policies applied',
      text: "The security-policy counter is effectively a fixed placeholder, not a count of your configuration profiles. If you are trying to confirm that a device restriction profile landed, the ESP is the wrong place to look — check the device's configuration status in the Intune admin center instead.",
    },
    {
      type: "h3",
      id: "phase-account-setup",
      text: "Account setup",
    },
    {
      type: "p",
      text: "The user ESP. It tracks apps deployed in user context and creates its own tracking policy. One structural fact makes triage much faster: the registry subkey for this phase is only created if the device setup phase completed successfully. If you cannot find it, device setup is where the problem is, whatever the screen currently says.",
    },

    {
      type: "h2",
      id: "step-one-collect-logs",
      text: "Step 1: collect the diagnostics bundle",
    },
    {
      type: "p",
      text: "From the ESP itself, Shift+F10 opens a command prompt on any device that is not in S mode. The MDM diagnostics tool captures everything relevant in one artefact, which is faster and more complete than clicking through Event Viewer on a machine you may be about to reset. The command differs by scenario — self-deploying and pre-provisioning need the TPM area because hardware attestation is part of their device preparation phase.",
    },
    {
      type: "code",
      language: "console",
      command: true,
      code: `:: User-driven Autopilot
mdmdiagnosticstool.exe -area Autopilot -cab %temp%\\autopilot-logs.cab

:: Self-deploying, pre-provisioning, and any scenario on physical hardware
mdmdiagnosticstool.exe -area Autopilot;TPM -cab %temp%\\autopilot-logs.cab`,
    },
    {
      type: "p",
      text: "If the ESP policy has log collection enabled, the user can also select **Collect logs** when a timeout occurs and write the bundle to a USB drive. That is worth turning on: it converts a failed deployment at a remote site from an unrecoverable event into a file you can read.",
    },
    {
      type: "p",
      text: "The bundle's `MDMDiagReport_RegistryDump.Reg` contains every registry key related to MDM enrolment. Rather than reading it by hand, Microsoft's documentation points at a community-published script that parses the cab and produces a readable timeline:",
    },
    {
      type: "code",
      language: "powershell",
      code: `Install-Script -Name Get-AutopilotDiagnostics -Force
Get-AutopilotDiagnostics -CABFile C:\\Temp\\autopilot-logs.cab`,
    },
    {
      type: "callout",
      variant: "warning",
      title: "Co-managed devices need two collections",
      text: "The MDM diagnostics tool does not gather Configuration Manager CCMSetup and client logs. If the device is co-managed, collect %windir%\\ccmsetup\\Logs and %windir%\\CCM\\Logs separately — a device preparation hang on a co-managed build is frequently a client installation failure, and that evidence is not in the cab file.",
    },

    {
      type: "h2",
      id: "step-two-read-the-registry",
      text: "Step 2: read the tracking registry",
    },
    {
      type: "p",
      text: "Since Windows 10 version 1903, the `EnrollmentStatusTracking` CSP writes the state of everything the ESP is waiting on into the registry. This is the single most useful artefact in the whole exercise, and it is the step most people skip.",
    },
    {
      type: "table",
      caption: "Where the evidence lives",
      head: ["Registry path", "What it tells you"],
      rows: [
        [
          "HKLM\\SOFTWARE\\Microsoft\\Windows\\Autopilot\\EnrollmentStatusTracking",
          "Root of all ESP tracking. Contains Device, ESPTrackingInfo and a per-user SID subkey.",
        ],
        [
          "…\\Device\\DevicePreparation",
          "Installation state of the Intune Management Extension and which resource types it tracks.",
        ],
        [
          "…\\Device\\Setup\\Apps",
          "Per-app installation state for the device setup phase, plus a Locked value showing whether device use is blocked.",
        ],
        [
          "…\\Device\\Setup\\Apps\\PolicyProviders\\Sidecar",
          "TrackingPoliciesCreated — whether tracking policies were built at all.",
        ],
        [
          "…\\ESPTrackingInfo\\Diagnostics",
          "Timestamped status per MSI app, Wi-Fi profile, SCEP profile and Store app.",
        ],
        ["…\\{User_SID}", "Account setup phase. Only exists if device setup succeeded."],
        [
          "HKLM\\SOFTWARE\\Microsoft\\Enrollments\\{EnrollmentGUID}\\FirstSync",
          "The ESP settings the device actually received — not what you think you assigned.",
        ],
      ],
    },
    {
      type: "p",
      text: "The `InstallationState` value under each tracked app is the answer you came for:",
    },
    {
      type: "table",
      caption: "InstallationState values",
      head: ["Value", "Meaning", "What to do"],
      rows: [
        ["1", "NotInstalled", "Installation has not begun. Check assignment and IME health."],
        ["2", "InProgress", "Still working. Compare against the configured timeout."],
        ["3", "Completed", "Nothing to do."],
        [
          "4",
          "Error",
          "This is the blocking item. Read the Intune Management Extension log for the cause.",
        ],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "One failed app stops the queue",
      text: "Microsoft documents that if InstallationState is 4 for any app, the ESP stops installing applications. A single broken package does not merely fail itself — it halts everything behind it. This is why a deployment can appear to hang on an app that is perfectly healthy: it never started.",
    },
    {
      type: "p",
      text: "For the device preparation phase, the SideCar provider uses a slightly different scale where **2** means *NotRequired* rather than *InProgress*. On co-managed devices the equivalent state for the Configuration Manager client lives under its own provider key:",
    },
    {
      type: "code",
      language: "powershell",
      code: `$key = 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\Autopilot\\EnrollmentStatusTracking\\Device\\DevicePreparation\\PolicyProviders\\ConfigMgr'
Get-ItemPropertyValue -Path $key -Name InstallationState`,
    },

    {
      type: "h2",
      id: "documented-behaviours",
      text: "Documented behaviours that look like faults",
    },
    {
      type: "p",
      text: 'A significant share of "ESP is broken" tickets are documented behaviour. Checking this list before deep-diving saves hours.',
    },
    {
      type: "table",
      caption: "Known behaviour, from Microsoft's documented issues list",
      head: ["Symptom", "Documented cause", "Action"],
      rows: [
        [
          'Stuck on "Identifying" indefinitely',
          "Intune computes ESP policies during this stage. It may never complete if the signed-in user has no Intune licence assigned.",
          "Check licensing before anything else.",
        ],
        [
          "Hybrid join takes far longer than the configured timeout",
          "On Microsoft Entra hybrid Autopilot deployments the ESP takes roughly 40 minutes longer than the profile value, to give the on-premises connector time to create the device record.",
          "Budget timeout + 40 minutes; do not shorten the timeout to compensate.",
        ],
        [
          "ESP hangs on an app that installs fine manually",
          "A reboot packaged inside the application. Reboots triggered from within a package can hang the ESP and fail the deployment.",
          "Specify reboot behaviour in Intune's return codes instead of rebooting inside the installer.",
        ],
        [
          "User must re-enter credentials mid-provisioning",
          "A reboot during device setup does not preserve user credentials.",
          "Expected. Tell the service desk so it is not escalated as a fault.",
        ],
        [
          "Disabling the ESP profile changes nothing",
          "Disabling a profile does not remove ESP policy already on devices; users still see the ESP at first sign-in.",
          "Target the change at new enrolments, or use the skip CSP.",
        ],
        [
          "Device preparation error 0x800705b4 on a co-managed build",
          "Timed out installing the Configuration Manager client. The default ESP timeout is 60 minutes.",
          "Confirm the device is receiving CCMSetup.msi and client content from the CMG.",
        ],
      ],
    },
    {
      type: "h3",
      id: "conditional-access-deadlock",
      text: "The Conditional Access deadlock",
    },
    {
      type: "p",
      text: "There is one failure worth calling out separately because the cause is nowhere near the symptom. Microsoft documents an ESP timeout that occurs when all three of the following are true: the ESP is tracking Microsoft Store for Business apps, a Conditional Access policy uses the **Require device to be marked as compliant** control, and that policy applies to all cloud apps and to Windows.",
    },
    {
      type: "p",
      text: "The device cannot reach the store because it is not yet compliant, and it cannot become compliant until provisioning finishes. Microsoft's documented remedies are to target compliance policies at devices so that compliance can be evaluated before the user signs in, or to use offline licensing for store apps so the client does not have to check with the store at all. Neither is a workaround; both are the correct design.",
    },

    {
      type: "h2",
      id: "why-apps-are-not-tracked",
      text: "Why an app is not tracked at all",
    },
    {
      type: "p",
      text: "The opposite complaint — the ESP finished but the app is missing — usually comes down to the blocking-app list being misunderstood. That list does **not** specify what to install. It filters which of the already-assigned apps count as blocking.",
    },
    {
      type: "p",
      text: "Microsoft's own example: if the blocking list contains App 1, App 2 and App 3, and App 3 and App 4 are actually targeted at the device or user, then the ESP tracks only App 3. In pre-provisioning flows App 4 still installs, just untracked. In user-driven and self-deploying mode, a Win32, Microsoft Store or Enterprise App Catalog app that is not on the list does not install until after the ESP completes.",
    },
    {
      type: "p",
      text: "For an app to be tracked at all, three conditions must hold: it is assigned as **required** to a group containing the device (device-targeted, tracked in device setup) or the user (user-targeted, tracked in account setup); either *Block device use until all apps and profiles are installed* is set or the app is on the blocking list; and it installs in device context with no user-context applicability rules. On Microsoft Entra hybrid join, Win32 and UWP apps assigned to the device with user install context are not tracked during provisioning at all.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Check which profile the device actually got",
      text: "If more than one ESP profile applies, the highest priority wins — device-targeted profiles first, then user-targeted, then the default. Pre-provisioning and self-deploying scenarios only honour device-targeted profiles. The FirstSync registry key shows what the device received, which is the only version of this that matters.",
    },

    {
      type: "h2",
      id: "configuration-that-prevents-recurrence",
      text: "Configuration that stops it recurring",
    },
    {
      type: "p",
      text: "Once a specific deployment is unblocked, the change that prevents the next occurrence is usually structural rather than per-app.",
    },
    {
      type: "ol",
      items: [
        "**Keep the blocking list to what must exist before first sign-in.** The limit is 100 apps; treating that as a target is how deployments end up timing out. Everything that is not required for the first login can install after the desktop appears.",
        "**Set the timeout to what your slowest realistic network can meet.** Microsoft's guidance notes that a timeout set to five minutes against fifteen required applications cannot succeed. If you cannot state the number your estate needs, the blocking list is too long.",
        '**Enable "allow users to use device if installation error occurs".** A usable desktop with a retry behind it beats a locked screen and a support call. Keep *allow reset* available for genuinely broken builds.',
        "**Decide deliberately about quality updates during OOBE.** Installing them adds 20–40 minutes and may restart the device, which breaks some autologon scenarios. They are also skipped entirely on metered networks. If you enable them, *Block device use until all apps and profiles are installed* must be Yes, or the device can exit the ESP before the updates apply.",
        "**Test detection rules against a device where the app is already present**, not only against a clean build. A detection rule that never returns true produces an app that installs successfully and reports failure forever.",
        "**Treat one failed ESP as a fleet signal.** If the cause is a policy, a licence or an app rather than the individual device, it will repeat on every device that follows.",
      ],
    },
    {
      type: "p",
      text: "If you genuinely need to remove the user-facing half of the process — for shared or kiosk devices where nobody is waiting at first sign-in — the user ESP can be skipped with a custom OMA-URI rather than by disabling the profile:",
    },
    {
      type: "code",
      language: "text",
      filename: "Custom OMA-URI setting",
      code: `OMA-URI:   ./Vendor/MSFT/DMClient/Provider/MS DM Server/FirstSyncStatus/SkipUserStatusPage
Data type: Boolean
Value:     True`,
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Resetting the device before collecting logs.** The reset destroys the only copy of the evidence. Shift+F10 and the cab file cost two minutes.",
        "**Raising the timeout as the first response.** It converts a fast failure into a slow one. Raise it only after the registry shows an app legitimately still in progress.",
        "**Assuming the ESP means Autopilot.** The ESP also appears for Configuration Manager co-management enrolments and for any new user signing in for the first time on a device that has ESP policy applied.",
        "**Reading the phase on screen and stopping there.** If the per-user SID subkey does not exist, the real failure is in device setup no matter what the screen says.",
        '**Blaming the network for an "Identifying" hang** before checking whether the signed-in user actually has an Intune licence.',
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Work the phases in order and let the registry answer the question. Read the on-screen phase, capture the cab file before doing anything destructive, open `EnrollmentStatusTracking`, and find the item whose `InstallationState` is 4 — that is the blocking item, and everything queued behind it never started. Check the documented known-issues list before treating anything as a novel fault, because a large share of them are behaviours rather than bugs.",
    },
    {
      type: "p",
      text: "Then fix the configuration rather than the device. A short blocking-app list, a timeout matched to the estate, and permission for users to continue after a failure will prevent more incidents than any amount of individual troubleshooting.",
    },
    {
      type: "p",
      text: "One adjacent cause is worth ruling out early if provisioning problems keep recurring across different devices: a setting that two policies both claim never applies at all, which can leave a device waiting on a configuration that was never going to arrive. [Intune policy conflicts: how to detect, diagnose and prevent them](/microsoft-intune/intune-policy-conflicts) covers how to trace that back to the profiles responsible. More on endpoint management across the estate is collected in the [Microsoft Intune section](/microsoft-intune); the labelling used to distinguish tested claims from documented ones on this site is described in [about this publication](/about).",
    },
  ],
  faq: [
    {
      question: "Why does the Enrollment Status Page get stuck at 'Identifying'?",
      answer:
        "Intune computes the ESP policies during the identifying stage. Microsoft documents that a device may never finish computing them if the signed-in user has no Intune licence assigned, so check licensing before investigating network or TPM issues.",
    },
    {
      question: "What is the default Enrollment Status Page timeout?",
      answer:
        "60 minutes. On Microsoft Entra hybrid join deployments the ESP can take roughly 40 minutes longer than the configured value, because the on-premises connector needs time to create the device record in Entra ID.",
    },
    {
      question: "Can I skip the Enrollment Status Page?",
      answer:
        "You can disable it or scope it to specific groups, and the user-facing half can be skipped with the SkipUserStatusPage OMA-URI. Note that disabling a profile does not remove ESP policy from devices that already have it. Skipping hands users a desktop that is not yet configured, so a short blocking-app list with 'allow users to use device if installation error occurs' is usually the better middle ground.",
    },
    {
      question: "Why did my app install but not get tracked by the ESP?",
      answer:
        "Tracking requires a required assignment to a group containing the device or user, the app to be on the blocking list or 'block device use until all apps and profiles are installed' to be set, and installation in device context without user-context applicability rules. The blocking list filters which assigned apps are treated as blocking; it does not control what gets installed.",
    },
    {
      question: "Where does Windows record what the ESP is waiting for?",
      answer:
        "Under HKLM\\SOFTWARE\\Microsoft\\Windows\\Autopilot\\EnrollmentStatusTracking. The Device subkey holds device-phase app states, ESPTrackingInfo holds timestamped status per app and profile, and a per-user SID subkey is created for the account setup phase only if device setup succeeded.",
    },
    {
      question: "One app failed. Why did the others stop installing?",
      answer:
        "By design. Microsoft documents that when an app's InstallationState reaches 4 (Error), the ESP stops installing applications. Everything queued behind the failure never starts, which is why the reported blocking app is often not the broken one.",
    },
  ],
  sources: [
    {
      title: "Troubleshooting the Enrollment Status Page",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/device-enrollment/understand-troubleshoot-esp",
    },
    {
      title: "Set up the Enrollment Status Page",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-enrollment/windows/setup-status-page",
    },
    {
      title: "Windows Autopilot known issues",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/known-issues",
    },
    {
      title: "Troubleshooting Windows device enrollment errors in Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/device-enrollment/troubleshoot-windows-enrollment-errors",
    },
    {
      title: "EnrollmentStatusTracking CSP",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/client-management/mdm/enrollmentstatustracking-csp",
    },
    {
      title: "How to enroll with Windows Autopilot (co-management)",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/configmgr/comanage/autopilot-enrollment",
    },
  ],
};
