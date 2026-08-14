import type { Article } from "../../types";

export const article: Article = {
  slug: "win32-app-detection-rules",
  category: "microsoft-intune",
  contentType: "troubleshooting",
  subcategory: "App delivery",
  title: "Win32 app detection rules: the four types and when each one lies to you",
  seoTitle: "Intune Win32 App Detection Rules: Getting Them Right",
  metaDescription:
    "How Intune decides a Win32 app is installed, why detection runs twice, and the specific ways MSI, file, registry and script rules report the wrong answer.",
  standfirst:
    "Detection is not a reporting feature. It is the input to every install decision Intune makes about that app, which is why a bad rule causes reinstall loops rather than bad dashboards.",
  excerpt:
    "An app that reports success but is not installed, or reinstalls every day, is almost always a detection problem. What each rule type actually checks, the STDERR trap in script detection, and how to choose a rule that survives a version bump.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 10,
  primaryKeyword: "intune win32 app detection rule",
  secondaryKeywords: [
    "intune app keeps reinstalling",
    "win32 app custom detection script",
    "intune detection rule msi product code",
    "intune app reports installed but not present",
  ],
  tags: ["Intune", "Windows", "Endpoint Management", "Troubleshooting", "App delivery"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Win32 app management, detection rule and troubleshooting documentation, including the documented client-side processing flow. Rule types, script evaluation behaviour, the re-offer interval and the detection points in the install sequence are taken from those sources and cited below. Where the article recommends an approach rather than describing documented behaviour, it says so. No customer environment is described and no packaging was tested for this article.",
  body: [
    {
      type: "p",
      text: "Detection rules are usually treated as an afterthought — the last page of the wizard before assignments, filled in with whatever the installer happened to leave behind. That works until it doesn't, and when it stops working the symptoms rarely point back at detection.",
    },
    {
      type: "p",
      text: "The two classic presentations: an app that reports **Installed** in the console while the user insists it is missing, and an app that reinstalls itself roughly once a day forever. Both are detection problems. Neither looks like one.",
    },
    {
      type: "p",
      text: "The reason detection has that much leverage is in the client-side flow. Microsoft's documented processing sequence for a Win32 app evaluates detection **twice**: once before download, where a positive result skips the download and install entirely, and again after installation, where the result becomes the compliance and enforcement state reported back to the service. A rule that returns the wrong answer therefore does not just misreport — it decides whether the install happens at all.",
    },

    {
      type: "h2",
      id: "how-detection-behaves",
      text: "Two behaviours worth knowing before you choose a rule",
    },
    {
      type: "p",
      text: "First, **all rules must pass**. If you add three rules, the app is only detected when the conditions for every one of them are met. This is an AND, not a best match. Adding a second rule to be thorough is a common way to make an app permanently undetectable.",
    },
    {
      type: "p",
      text: "Second, **failed detection is retried on a cycle**. Microsoft documents that if Intune determines the app isn't present, it will offer the app again within approximately 24 hours, for apps targeted with the required intent. That is the reinstall loop: the install genuinely succeeds, detection says it didn't, and a day later the agent tries again. The user sees an app reinstalling itself indefinitely and reports it as an app problem.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Detection describes the outcome, not the installer",
      text: "The rule should answer one question: is the thing this package was supposed to put on the machine actually there? It should not describe how the installer works. This distinction matters because installers change — a vendor switches from MSI to a bootstrapper, or starts writing to a different registry hive — and a rule written against installer mechanics breaks on an upgrade that should have been routine.",
    },

    {
      type: "h2",
      id: "the-four-types",
      text: "The four rule types, and what each one actually checks",
    },
    {
      type: "table",
      caption: "Detection rule types and their practical characteristics",
      head: ["Type", "What it checks", "Where it goes wrong"],
      rows: [
        [
          "MSI",
          "An MSI product code, optionally with a product version check. Can be added **only once** per app.",
          "The product code changes between versions for many vendors. A rule pinned to one code stops matching after an upgrade, and the app reinstalls.",
        ],
        [
          "File",
          "A file or folder path, checked for existence, date created, version string, or size in MB or bytes.",
          "Path variables expand differently on 64-bit clients depending on the 32-bit toggle. Version checks are exact-string comparisons, so a trailing space or a four-part version breaks them.",
        ],
        [
          "Registry",
          "A key path and optionally a value, compared as existence, string, integer or version.",
          "The 32-bit toggle decides whether you read the redirected `WOW6432Node` view. Getting it wrong produces a rule that never matches on the machines you care about.",
        ],
        [
          "Custom script",
          "A PowerShell script. Detected when it exits `0` **and** writes something to STDOUT.",
          "The most flexible and the easiest to get subtly wrong. STDERR is fatal — see below.",
        ],
      ],
    },
    {
      type: "p",
      text: "The 32-bit toggle appears on file, registry and script rules and it is the single most common configuration mistake in this area. For file rules it controls whether path environment variables expand in the 32-bit or 64-bit context; for registry rules it controls whether the 32-bit registry view is searched. The default is the 64-bit context on 64-bit clients. If your app installs to `Program Files (x86)` and writes to the redirected registry view, the default is wrong for you.",
    },

    {
      type: "h2",
      id: "script-detection",
      text: "Script detection, and the STDERR trap",
    },
    {
      type: "p",
      text: "Custom scripts are the right answer whenever the truth cannot be expressed as a single path or key — a version that must be greater than rather than equal to, an app that can live in two locations, a package whose real success condition is a service running rather than a file existing.",
    },
    {
      type: "p",
      text: "The evaluation contract is specific and worth stating precisely, because most script detection failures come from misunderstanding it. The Intune agent reads three things: the exit code, STDOUT and STDERR.",
    },
    {
      type: "ul",
      items: [
        "**Exit code non-zero** — the script failed and the app is treated as not installed. Nothing else is considered.",
        "**Exit code zero with data on STDOUT** — the app is detected. Microsoft is explicit that it does not look for any particular string; the presence of output is the signal, not its content.",
        "**Exit code zero, but something was written to STDERR** — the result is evaluated as **not installed**, even though the exit code was zero and STDOUT had data.",
      ],
    },
    {
      type: "p",
      text: "That third rule is the one that bites. A script can be logically correct, exit cleanly, print the version it found, and still report not-installed because a cmdlet inside it wrote a non-terminating error to the error stream. `Get-ItemProperty` against a missing key does exactly this. So does `Get-CimInstance` against a class that isn't present. The script author never sees it, because interactively the red text looks like a harmless warning.",
    },
    {
      type: "p",
      text: "The practical defence is to make the script silent about failure and explicit about success. Suppress expected errors at the point they can occur rather than globally, and write exactly one line to STDOUT when you mean detected:",
    },
    {
      type: "code",
      language: "powershell",
      filename: "Detection script shape that satisfies the documented contract",
      code: `$target = "14.2.0"
$path   = "C:\\Program Files\\Vendor\\App\\app.exe"

# -ErrorAction SilentlyContinue keeps a missing file off STDERR, which would
# otherwise force a not-installed result even with exit code 0.
$item = Get-Item -LiteralPath $path -ErrorAction SilentlyContinue
if (-not $item) { exit 1 }

$found = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($path).FileVersion.Trim()

if ([version]$found -ge [version]$target) {
    Write-Output "Detected $found"   # STDOUT: any output means detected
    exit 0
}

exit 1`,
    },
    {
      type: "p",
      text: "Two details from Microsoft's guidance are worth carrying into every script: encode the file as UTF-8 BOM, and remember the 32-bit toggle applies here too — the script runs in a 64-bit process on 64-bit clients unless you say otherwise. There is also an **Enforce script signature check** option, which is off by default; turning it on means an unsigned script will not run at all.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Trim the version string",
      text: "Microsoft's own sample for detecting a file version calls `.Trim()` on the result before comparing it. That is not decoration. `FileVersionInfo` frequently returns a version with surrounding whitespace, and an exact string comparison against an untrimmed value fails silently — producing a detection rule that is wrong for reasons no log will explain.",
    },

    {
      type: "h2",
      id: "choosing",
      text: "Choosing a rule that survives the next version",
    },
    {
      type: "p",
      text: "This section is recommendation rather than documented behaviour, but it follows from the failure modes above. The question I would ask about any proposed rule is: what happens to this when the vendor ships 15.0?",
    },
    {
      type: "table",
      caption: "A workable default per package type",
      head: ["Package", "Reasonable default", "Why"],
      rows: [
        [
          "A well-behaved MSI where the product code is stable across versions",
          "MSI rule with product version check",
          "Cheapest correct answer. Verify the code actually is stable before relying on it — for many vendors it is not.",
        ],
        [
          "An MSI or EXE whose version increments and whose main binary is predictable",
          "File rule on the binary, using **String (version)**",
          "Tracks the thing users care about. Beware exact-match semantics on the version string.",
        ],
        [
          "Anything where 'installed' means 'at least version X'",
          "Custom script",
          "Greater-than-or-equal comparison is not expressible in the built-in rule types.",
        ],
        [
          "A package that only drops files and configuration, with no real installer",
          "File rule on a marker the package writes itself",
          "Detect something you control rather than something the vendor might move.",
        ],
        [
          "A wrapper script that does several things",
          "Custom script asserting the end state",
          "The wrapper's exit code says the script ran. Only detection says the outcome is correct.",
        ],
      ],
    },
    {
      type: "p",
      text: "The last row is the one most worth internalising. A wrapper that installs an application, writes a registry marker and configures a service can exit `0` having done only the first step. If detection also only checks the application, the package reports success in a state you would not accept if you looked at the machine.",
    },

    {
      type: "h2",
      id: "diagnosing",
      text: "Diagnosing a rule that is reporting the wrong answer",
    },
    {
      type: "p",
      text: "Work from the device, not the console. The console tells you what the agent concluded; the device tells you why.",
    },
    {
      type: "ol",
      items: [
        "**Confirm which symptom you have.** Reinstalling daily means detection returns false after a successful install. Reported installed but absent means detection returns true when it should not — usually a rule matching a leftover from a previous version.",
        "**Read the agent's own detection lines.** `AppWorkload.log` in `C:\\ProgramData\\Microsoft\\IntuneManagementExtension\\Logs` carries app applicability and detection logging, and `AppActionProcessor.log` tracks detection and applicability checks specifically. The agent logs the path it expanded and the result it reached, which usually settles a 32-bit toggle question immediately.",
        "**Reproduce the rule by hand.** For file and registry rules, check the exact path the log says it used. For script rules, run the script as SYSTEM rather than as yourself — a rule that works in your admin console and fails on the device is often a context problem.",
        "**Check STDERR explicitly** for script rules. Run the script and inspect the error stream, not just the exit code and output.",
      ],
    },
    {
      type: "p",
      text: "For the SYSTEM-context check there is no substitute for actually running it that way. A detection script that reads `HKCU` will find nothing when the agent evaluates it, because the agent is not running as the user — and this is a genuinely common cause of an app that reinstalls forever on exactly the machines where a user did install it.",
    },
    {
      type: "p",
      text: "The full client-side sequence, and where detection sits inside it, is worked through in [Reading the Intune Management Extension logs](/microsoft-intune/intune-management-extension-logs).",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Adding extra rules for thoroughness.** Every rule must pass. Two rules are twice the opportunity to be wrong, not twice the confidence.",
        "**Pinning to an MSI product code that changes per version.** Verify stability across at least two releases before relying on it.",
        "**Leaving the 32-bit toggle at its default for a 32-bit app.** File paths and registry views both resolve differently, and the default assumes 64-bit.",
        "**Writing a detection script that touches STDERR.** Exit code zero plus STDOUT data is not enough — anything on the error stream forces a not-installed result.",
        "**Comparing version strings without trimming.** Microsoft's own sample trims for a reason.",
        "**Detecting a user-context artefact.** The agent evaluates in the system context; `HKCU` and per-user paths will not be found.",
        "**Treating a daily reinstall as an installer problem.** The installer is usually fine. Detection is telling the agent to try again.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Write the detection rule at the same time as the install command, from the same question: after this package runs successfully, what is true on the machine that was not true before? Then detect exactly that, once, with a single rule where possible.",
    },
    {
      type: "p",
      text: "Prefer a version-aware check over an existence check for anything you will ever update, because an existence check makes upgrades invisible — the old version satisfies the rule and the new package never installs. And prefer a script when the honest answer is a comparison rather than an equality, rather than bending a file rule into approximately the right shape.",
    },
    {
      type: "p",
      text: "Before packaging anything, Microsoft's own troubleshooting guidance suggests installing the app manually on a device first, to confirm it supports silent installation, that the command line is right, and that you know where it actually lands. That last part is the detection rule, and doing it in that order costs ten minutes and prevents most of what is described above. Packaging mechanics are covered in [Packaging Win32 apps with the Content Prep Tool](/microsoft-intune/intunewin-packaging-win32-apps), and what happens when several versions of an app exist across an estate in [Win32 app supersedence and dependencies](/microsoft-intune/win32-app-supersedence-dependencies).",
    },
  ],
  faq: [
    {
      question: "Why does my Intune Win32 app reinstall every day?",
      answer:
        "Detection is returning false after a successful installation. Microsoft documents that when Intune determines an app is not present, it offers the app again within approximately 24 hours for apps targeted with the required intent. Check the rule against what the installer actually leaves on the device, paying particular attention to the 32-bit toggle and to whether the artefact you are detecting exists in the system context.",
    },
    {
      question: "How does a custom detection script tell Intune the app is installed?",
      answer:
        "The script must exit with code 0 and write data to STDOUT. Microsoft does not look for a specific string — the presence of output is the signal. However, if anything is written to STDERR the result is evaluated as not installed, even when the exit code is 0 and STDOUT contains data.",
    },
    {
      question: "Can I use more than one detection rule?",
      answer:
        "Yes, but the conditions for all rules must be met for the app to be detected. Adding rules makes detection stricter, not more reliable. The MSI rule type can only be added once per app.",
    },
    {
      question: "When should I use the 32-bit option on a detection rule?",
      answer:
        "Set it to Yes when the app is a 32-bit application on 64-bit clients. For file rules it expands path environment variables in the 32-bit context; for registry rules it searches the 32-bit registry view. The default is No, meaning the 64-bit context. 32-bit clients always use the 32-bit context regardless of the setting.",
    },
    {
      question: "Why does my detection script work when I run it but fail on the device?",
      answer:
        "The two usual causes are execution context and the error stream. The agent evaluates detection in the system context, so anything under HKCU or a per-user profile path will not be found. Separately, a cmdlet writing a non-terminating error to STDERR forces a not-installed result even if the script exits 0. Run the script as SYSTEM and inspect the error stream, not just the exit code.",
    },
    {
      question: "Where can I see what the detection rule actually evaluated?",
      answer:
        "In the Intune Management Extension logs on the device, under C:\\ProgramData\\Microsoft\\IntuneManagementExtension\\Logs. AppWorkload.log carries app detection and applicability logging, and AppActionProcessor.log tracks detection and applicability check actions. The agent records the path it expanded and the result it reached.",
    },
  ],
  sources: [
    {
      title: "Add, Assign, and Monitor a Win32 App in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/add-win32",
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
      title: "Win32 app management in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/win32",
    },
    {
      title: "Intune Management Extension for Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-management/tools/management-extension-windows",
    },
  ],
};
