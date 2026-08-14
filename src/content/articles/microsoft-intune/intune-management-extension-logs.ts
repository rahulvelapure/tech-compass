import type { Article } from "../../types";

export const article: Article = {
  slug: "intune-management-extension-logs",
  category: "microsoft-intune",
  contentType: "troubleshooting",
  subcategory: "App delivery",
  title: "Reading the Intune Management Extension logs to diagnose app failures",
  seoTitle: "Intune Management Extension Logs: Reading App Failures",
  metaDescription:
    "Which IME log answers which question, the client-side sequence a Win32 app actually follows, and how to find the step where an install stopped.",
  standfirst:
    "The admin center tells you an app failed. The device tells you where. These are not the same question, and only one of them is answerable from a browser.",
  excerpt:
    "A practical guide to the Intune Management Extension logs: what each file covers, the order the agent processes a Win32 app in, and how to work backwards from a failure to the step that produced it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 9,
  primaryKeyword: "intune management extension log",
  secondaryKeywords: [
    "AppWorkload.log",
    "IntuneManagementExtension.log",
    "IMECache",
    "intune win32 app install failed troubleshooting",
    "AgentExecutor.log",
  ],
  tags: ["Intune", "Windows", "Troubleshooting", "Endpoint Management", "App delivery"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Intune Management Extension, Win32 app troubleshooting and diagnostic collection documentation, including the documented step-by-step client processing flow. Log file names and responsibilities, content paths, antimalware exclusion guidance and diagnostic collection limits are taken from those sources and cited below. Where the article recommends a reading order rather than describing documented behaviour, it says so. No customer environment is described and no logs from any organisation are reproduced.",
  body: [
    {
      type: "p",
      text: "The Intune admin center reports app installation as a status per device. That status is genuinely useful for scale — it tells you whether one machine is broken or four hundred are. What it cannot tell you is why, because the decision was made on the device by an agent that wrote down its reasoning locally and then reported only the conclusion.",
    },
    {
      type: "p",
      text: "That agent is the Intune Management Extension, usually shortened to IME. It is installed automatically the first time a PowerShell script or Win32 app is assigned to a user or device, which is why it appears on machines nobody deliberately installed it on. Everything it does is logged.",
    },

    {
      type: "h2",
      id: "where",
      text: "Where the logs are, and what to open them with",
    },
    {
      type: "p",
      text: "The logs live at `C:\\ProgramData\\Microsoft\\IntuneManagementExtension\\Logs`. That path is not hidden by ACLs in any interesting way, so a support engineer with local admin can read them directly.",
    },
    {
      type: "p",
      text: "Microsoft's guidance is to view them with `CMTrace.exe`, which is worth taking seriously rather than reaching for Notepad. These files interleave several threads and are written in the Configuration Manager log format, so a plain text editor shows you a wall of timestamps with no structure. CMTrace parses the format, colours errors and warnings, and — most usefully — follows the file as it is written, so you can trigger a sync and watch what happens.",
    },
    {
      type: "p",
      text: "One detail that saves confusion: when a log rolls over, the previous content is preserved in a file with a leading underscore. If the failure you care about happened this morning and the current log starts an hour ago, `_IntuneManagementExtension.log` is where the rest of it went.",
    },

    {
      type: "h2",
      id: "which-log",
      text: "Which log answers which question",
    },
    {
      type: "p",
      text: "This is the part that saves the most time. There are more than a dozen files in that folder, and opening the wrong one produces a confident conclusion based on the wrong evidence.",
    },
    {
      type: "table",
      caption: "Intune Management Extension log files and their scope",
      head: ["File", "Covers", "Open it when"],
      rows: [
        [
          "`AppWorkload.log`",
          "Win32 app deployment activity — app check-ins, installs, applicability and detection.",
          "**Start here for any Win32 app problem.** This is the main app log.",
        ],
        [
          "`IntuneManagementExtension.log`",
          "The agent itself: check-ins, policy requests, policy processing and reporting.",
          "The agent seems not to be receiving anything, or you are confirming the policy body it actually got.",
        ],
        [
          "`AppActionProcessor.log`",
          "Detection and applicability check actions for assigned apps.",
          "You are chasing a detection rule specifically.",
        ],
        [
          "`AgentExecutor.log`",
          "PowerShell script executions deployed by Intune.",
          "A platform script ran and you need its output, or a script-based install behaved oddly.",
        ],
        [
          "`HealthScripts.log`",
          "Remediation script execution — and everything else built on that plumbing, including **custom compliance scripts**, managed installer and hardware configuration.",
          "A remediation or a custom compliance script is not behaving. This is a genuinely surprising place for compliance logging to live.",
        ],
        [
          "`ClientHealth.log`",
          "The health of the IME agent itself.",
          "Nothing is happening at all and you suspect the agent rather than the payload.",
        ],
        [
          "`Win32AppInventory.log`",
          "The app inventory collector.",
          "Discovered apps reporting looks wrong.",
        ],
        [
          "`Sensor.log`",
          "The Endpoint analytics data collector — boot performance, app reliability.",
          "Endpoint analytics data is missing or stale.",
        ],
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Start in AppWorkload.log, not the main log",
      text: "A lot of older guidance sends you to `IntuneManagementExtension.log` for app installs, and Microsoft's current documentation is explicit that `AppWorkload.log` is the file to use for troubleshooting and analysing Win32 app deployment activity. If you are following a runbook that predates that, you can spend a long time reading the right agent's wrong log.",
    },

    {
      type: "h2",
      id: "the-sequence",
      text: "The sequence an app actually goes through",
    },
    {
      type: "p",
      text: "Microsoft documents the client-side processing flow for a Win32 app step by step, and knowing the order turns log reading from scanning into bisection. The stages that matter operationally:",
    },
    {
      type: "ol",
      items: [
        "The agent initialises, records the device ID and OS version, and discovers the Intune content endpoints. **If your firewall blocks the CDN, the failure is here** and no app-specific configuration will fix it.",
        "It requests policy and receives the full policy body. This is where you confirm the device actually got the app definition you think you assigned.",
        "**Dependencies are checked** for the discovered apps. Dependent apps are downloaded and installed first.",
        "**Detection rules are evaluated.** If the app is detected at this point, the download and install are skipped entirely.",
        "**Applicability is checked** — the requirement rules, including any PowerShell requirement script.",
        "Content is downloaded to `Content\\Incoming` as a `.bin` file, the encrypted hash is verified, and the content is decrypted.",
        "Content is unzipped from `Content\\Staging` into `C:\\Windows\\IMECache\\<app id>`.",
        "The installer executes with the command line configured in the portal.",
        "The exit code is collected and evaluated against the configured return codes.",
        "**Detection runs again**, and this result becomes the enforcement state reported to the service.",
        "The staged content is cleaned up and the result is sent to the service.",
      ],
    },
    {
      type: "p",
      text: "Reading that list against a failing device answers the question that matters — how far did it get? An app that never appears in the log at all did not receive policy. An app that reaches step 4 and stops was already detected. An app that fails between 6 and 7 has a content or disk problem rather than an installer problem. An app that reaches step 8 and returns a non-zero code has a genuine installer failure, and at that point the vendor's own log is the next stop rather than anything in Intune.",
    },
    {
      type: "p",
      text: "The distinction between step 4 and step 10 is worth dwelling on, because both are detection and they mean opposite things. A positive result at step 4 means Intune decided no work was needed. A negative result at step 10 means the install ran and the agent does not believe it worked — which is what produces an app that reinstalls on the roughly 24-hour re-offer cycle. That failure mode is covered in [Win32 app detection rules](/microsoft-intune/win32-app-detection-rules).",
    },

    {
      type: "h2",
      id: "reading-a-failure",
      text: "Working backwards from a failed install",
    },
    {
      type: "p",
      text: "The following order is a recommendation rather than documented guidance, but it moves from cheap checks to expensive ones.",
    },
    {
      type: "p",
      text: "**Find the app by its ID, not its name.** The logs refer to apps by GUID. Get the ID from the app's properties in the admin center and search for that, otherwise you will match unrelated lines that happen to contain a common word.",
    },
    {
      type: "p",
      text: "**Establish the install context.** An app configured to install in the user context, targeted at a user, and requiring administrative rights the user does not have, will fail — Microsoft documents this specifically. This is a configuration problem that reads like a packaging problem, and it is invisible unless you check what context the app was set to run in.",
    },
    {
      type: "p",
      text: "**Check the exit code against your return code mapping.** The agent evaluates the installer's exit code against the codes configured on the app. Intune's documented retry logic is three attempts with a five-minute wait between them, on a global re-evaluation cadence of roughly 24 hours — so an app configured with a retry return code will appear in the log three times before it gives up. Three failures in a row is not three separate problems.",
    },
    {
      type: "p",
      text: "**Check the IMECache.** If the install failed with a content or extraction error, look at `C:\\Windows\\IMECache`. Content that is missing, partial, or a fraction of the expected size points at disk space, an interrupted download, or the next section.",
    },

    {
      type: "h2",
      id: "antimalware",
      text: "The antimalware exclusions people forget",
    },
    {
      type: "p",
      text: "This one is worth its own section because the symptom is so misleading. Microsoft documents that for LOB Win32 apps to install and execute properly, antimalware settings should exclude two directories from scanning:",
    },
    {
      type: "code",
      language: "text",
      filename: "Directories Microsoft documents as antimalware exclusions",
      code: `x64 clients:
  C:\\Program Files (x86)\\Microsoft Intune Management Extension\\Content
  C:\\Windows\\IMECache

x86 clients:
  C:\\Program Files\\Microsoft Intune Management Extension\\Content
  C:\\Windows\\IMECache`,
    },
    {
      type: "p",
      text: "When a scanner holds a lock on content the agent is trying to decrypt, extract or execute, the failure surfaces as an intermittent install error rather than as anything mentioning antivirus. It affects large packages more than small ones and slow disks more than fast ones, which makes it look like a flaky app or a flaky network. A package that fails on some machines and succeeds on others with no pattern in the app configuration is worth checking here — particularly where a third-party security product is in play and these paths were never added to it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Mixing Win32 and LOB apps during Autopilot",
      text: "Microsoft documents that mixing the installation of Win32 apps and line-of-business apps during Windows Autopilot **enrollment** might cause app installation to fail, and recommends using the Intune Management Extension approach exclusively — particularly for multi-file installers. The same mixing **is** supported during Autopilot device preparation. If provisioning-time app failures are unexplained and your build mixes both types, that difference is worth knowing before you spend a day in the logs.",
    },

    {
      type: "h2",
      id: "collecting",
      text: "When to collect diagnostics instead of reading logs",
    },
    {
      type: "p",
      text: "Reading logs requires access to the device. When the device belongs to a user three time zones away, Intune can collect them for you: the **Collect diagnostics** option on the app's installation details pane gathers Win32 app installation diagnostics remotely.",
    },
    {
      type: "p",
      text: "The documented constraints are worth knowing before you promise someone a quick answer. Collection takes approximately 15 to 20 minutes. The maximum is 250 MB or 25 files, whichever comes first. Only specific extensions are accepted — `.log`, `.txt`, `.dmp`, `.cab`, `.zip`, `.xml`, `.evtx`, `.evtl` — and paths must be complete, though a set of environment variables including `%PROGRAMDATA%` and `%WINDIR%` is supported. The device must be running Windows 11, or Windows 10 version 1909 or later. Collected diagnostics are encrypted at rest, which matters because they can contain personal information.",
    },
    {
      type: "p",
      text: "One limitation shapes when this is useful: the **Collect diagnostics** option is not enabled when the app has installed successfully. It is a failure-investigation tool, not a general-purpose remote log grab.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Reading the wrong log for app problems.** `IntuneManagementExtension.log` covers the agent and policy processing. `AppWorkload.log` covers apps.",
        "**Searching by app name.** The logs identify apps by GUID. Search the ID.",
        "**Treating three consecutive failures as three problems.** Documented retry logic is three attempts, five minutes apart.",
        "**Ignoring the rollover file.** If the timeline starts after the incident, the rest is in the file with the leading underscore.",
        "**Missing the antimalware exclusions.** Intermittent, machine-specific install failures with no configuration pattern are a strong hint.",
        "**Looking for custom compliance script output in a compliance log.** It is in `HealthScripts.log`, with the remediation plumbing.",
        "**Blaming the installer for a context problem.** A user-targeted app needing admin rights fails by design, and says very little about why.",
        "**Opening the logs in Notepad.** The format is designed for CMTrace; without it, interleaved threads are close to unreadable.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Treat the logs as a sequence rather than a search. Open `AppWorkload.log` in CMTrace, find the app's GUID, and establish how far it got against the documented flow — policy received, dependency resolved, detection evaluated, applicability passed, content downloaded, installer executed, exit code returned, detection re-evaluated. The step where the trail stops is the problem, and it is usually not the step the ticket describes.",
    },
    {
      type: "p",
      text: "Beyond individual incidents, two configuration items prevent a disproportionate share of them: get the antimalware exclusions in place on every build, including any third-party security product, and be deliberate about install context so that user-targeted packages are not quietly relying on rights the user does not have.",
    },
    {
      type: "p",
      text: "Where the log shows the install succeeding but the app still reporting as not installed, the problem has moved to detection. Where it shows an app being uninstalled that nobody asked to remove, the cause is usually a supersedence relationship — covered in [Win32 app supersedence and dependencies](/microsoft-intune/win32-app-supersedence-dependencies).",
    },
  ],
  faq: [
    {
      question: "Where are the Intune Management Extension logs stored?",
      answer:
        "In C:\\ProgramData\\Microsoft\\IntuneManagementExtension\\Logs. Microsoft recommends viewing them with CMTrace.exe, because the files use the Configuration Manager log format and interleave multiple threads. When a log rolls over, the previous content is kept in a file with a leading underscore.",
    },
    {
      question: "Which log should I open for a Win32 app installation failure?",
      answer:
        "AppWorkload.log. Microsoft's documentation identifies it as the file for troubleshooting and analysing Win32 app deployment activity, including app check-ins, installs, applicability and detection. IntuneManagementExtension.log covers the agent itself — check-ins, policy requests and reporting — which is a different question.",
    },
    {
      question: "Why does an app fail to install for standard users but work for admins?",
      answer:
        "If a Win32 app is deployed with user targeting and requires device administrator privileges or other permissions the standard user does not have, Microsoft documents that the app will fail to install. Check the app's install behaviour setting — system or user context — against what the installer actually needs.",
    },
    {
      question: "Do I need antivirus exclusions for Intune app deployment?",
      answer:
        "Microsoft documents that antimalware settings should exclude the Intune Management Extension Content directory and C:\\Windows\\IMECache from scanning, so that line-of-business Win32 apps install and execute properly. Missing exclusions typically show up as intermittent install failures on some machines with no pattern in the app configuration.",
    },
    {
      question: "How many times does Intune retry a failed app install?",
      answer:
        "Intune's documented Win32 app retry logic is three install attempts, waiting five minutes between each, on a global re-evaluation schedule that follows a roughly 24-hour cadence. Three consecutive failures in the log are normally one problem retried, not three separate events.",
    },
    {
      question: "Can I collect Intune app logs remotely?",
      answer:
        "Yes, using the Collect diagnostics option on the app's installation details pane. Collection takes approximately 15 to 20 minutes, is capped at 250 MB or 25 files, accepts a specific set of file extensions, and requires Windows 11 or Windows 10 version 1909 or later. The option is not available when the app has installed successfully.",
    },
  ],
  sources: [
    {
      title: "Intune Management Extension for Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-management/tools/management-extension-windows",
    },
    {
      title: "Troubleshoot Win32 App Issues",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/troubleshoot-win32",
    },
    {
      title:
        "Support Tip - Understanding the flow behind deployment, delivery, and processing of a Win32 application through Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/app-management/develop-deliver-working-win32-app-via-intune",
    },
    {
      title: "Troubleshooting Win32 app installations with Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/app-management/troubleshoot-win32-app-install",
    },
    {
      title: "Add, Assign, and Monitor a Win32 App in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/add-win32",
    },
    {
      title:
        "Virus scanning recommendations for enterprise computers running currently supported versions of Windows",
      publisher: "Microsoft Support",
      url: "https://support.microsoft.com/help/822158/virus-scanning-recommendations-for-enterprise-computers",
    },
  ],
};
