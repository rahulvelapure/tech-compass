import type { Article } from "../../types";

export const article: Article = {
  slug: "intune-custom-compliance-scripts",
  category: "microsoft-intune",
  contentType: "how-to",
  subcategory: "Compliance",
  title: "Intune custom compliance: writing a discovery script that actually reports",
  seoTitle: "Intune Custom Compliance Scripts: Script and JSON in Practice",
  metaDescription:
    "How custom compliance really works: the script and JSON contract, the 32-bit default that breaks scripts, the eight-hour clock, and the 6500x error codes.",
  standfirst:
    "Custom compliance is two artefacts that must agree exactly. Intune validates neither the script's syntax nor its logic, so the first sign of a mismatch is a fleet reporting nothing.",
  excerpt:
    "A discovery script plus a JSON rules file, bound one-to-one to a policy. What the script must return, why it runs in a 32-bit host by default, what the 65007 to 65010 errors mean, and why every change takes eight hours to see.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-14",
  readingMinutes: 11,
  primaryKeyword: "intune custom compliance script",
  secondaryKeywords: [
    "custom compliance json intune",
    "intune discovery script powershell",
    "65008 setting missing in the script result",
    "intune custom compliance not evaluating",
  ],
  tags: ["Intune", "Endpoint Management", "PowerShell", "Security", "Governance"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Intune custom compliance documentation — the custom settings overview, discovery script reference, JSON reference and compliance policy creation guidance — together with the Intune Management Extension and PowerShell script documentation. Script and JSON requirements, supported operators and data types, size and runtime limits, evaluation cadence and the documented error codes are taken from those sources and cited below. Where the article recommends an approach rather than describing documented behaviour, it says so. No customer environment is described and no script was executed for this article.",
  body: [
    {
      type: "p",
      text: "Built-in compliance settings cover the things Microsoft has decided are worth checking: encryption, minimum OS version, firewall, antivirus. They are a fixed list, and eventually something matters to your organisation that is not on it — a specific agent running, a registry value your security team set, a certificate present, a local group with the membership you expect.",
    },
    {
      type: "p",
      text: "Custom compliance is the escape hatch: it evaluates anything a script can read. Microsoft is explicit that the results sit alongside the built-in settings as a compound rule set — equally affecting the compliance state, and usable for Conditional Access in exactly the same way. Worth understanding before you write anything. This is not a side report; a custom rule can block access.",
    },

    {
      type: "h2",
      id: "two-halves",
      text: "Two artefacts, bound one to one",
    },
    {
      type: "p",
      text: "A custom compliance policy has two parts that have to agree with each other precisely.",
    },
    {
      type: "ul",
      items: [
        "**The discovery script.** PowerShell on Windows, a POSIX-compliant shell script on Linux, Bash on macOS. It runs on the device, reads whatever you want to evaluate, and returns the values it found. It makes no judgement about them.",
        "**The JSON rules file.** This declares which settings are expected, what value counts as compliant, and what the user should be told when the device is not.",
      ],
    },
    {
      type: "p",
      text: "The split decides where a problem lives. The script only *discovers*; the JSON only *judges*. A device reporting the wrong answer is a JSON problem; a device reporting nothing is a script problem. That distinction removes most of the guesswork.",
    },
    {
      type: "p",
      text: "The binding between them is strict. Each compliance policy supports exactly one discovery script, and each discovery script can be used with only one compliance policy. You also cannot delete a script while it is still assigned — it has to be unassigned from the policy first. A single script can, however, discover as many settings as you like, which is the intended way to cover several checks.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Intune does not validate your script",
      text: "The documentation states it plainly: Intune doesn't validate the script for syntax or programmatic errors. The JSON is validated on upload and will tell you what is wrong with it. The script is not. A script with a typo uploads cleanly, deploys cleanly, and fails silently on every device — which is why the guidance is to test it in an isolated environment before deploying it in production.",
    },

    {
      type: "h2",
      id: "script-contract",
      text: "The script contract",
    },
    {
      type: "p",
      text: "On Windows the requirement is specific and non-obvious: the script must output its results as **a single compressed line of JSON**. The documented shape is a hashtable of setting names and discovered values, converted at the end:",
    },
    {
      type: "code",
      language: "powershell",
      filename: "The documented output shape",
      code: `$tpm = Get-CimInstance -Namespace root/cimv2/security/microsofttpm -ClassName Win32_Tpm

$hash = @{
    TPMChipPresent = [bool]$tpm.IsEnabled_InitialValue
    BiosVersion    = (Get-CimInstance -ClassName Win32_BIOS).SMBIOSBIOSVersion
    Manufacturer   = (Get-CimInstance -ClassName Win32_ComputerSystem).Manufacturer
}

# Must be the last line. Without -Compress the output spans several lines
# and Intune cannot parse it.
return $hash | ConvertTo-Json -Compress`,
    },
    {
      type: "p",
      text: "Two details in that snippet do real work. `-Compress` produces the single line the service expects. And the conversion has to be the **last** line of the file — anything written after it becomes part of the output and invalidates the JSON.",
    },
    {
      type: "p",
      text: "That is why a script that works perfectly in your console can fail once deployed. A stray `Write-Host`, a module banner, a cmdlet emitting an object you did not capture — any of it lands on the output stream and corrupts the payload. Silence everywhere except the final line is the contract, not tidiness.",
    },
    {
      type: "table",
      caption: "Script upload settings, and what the defaults commit you to",
      head: ["Setting", "Default", "What it means"],
      rows: [
        [
          "Run this script using the logged on credentials",
          "No",
          "The script runs in the System context. Set to Yes for user context — but if no user is signed in, it falls back to System anyway, so a script that depends on a user profile is unreliable rather than merely scoped.",
        ],
        [
          "Run script in 64 bit PowerShell Host",
          "**No**",
          "The script runs in the **32-bit** host by default. Set to Yes to force 64-bit.",
        ],
        [
          "Enforce script signature check",
          "No",
          "When enabled, the script must carry a valid signature to run at all.",
        ],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "The 32-bit default is the one that catches people",
      text: "A discovery script running in the 32-bit host sees the redirected registry view, so a query against `HKLM\\Software\\Vendor` actually reads `HKLM\\Software\\WOW6432Node\\Vendor`. It resolves `%ProgramFiles%` to the x86 directory, and it cannot load 64-bit-only modules. The script runs, returns a value, and the value is wrong — or the key is simply not found and the setting comes back empty. If a check works interactively and reports nothing once deployed, this setting is the first thing to look at. The same trap exists in Win32 app install commands, covered in [Packaging Win32 apps for Intune](/microsoft-intune/intunewin-packaging-win32-apps).",
    },
    {
      type: "p",
      text: "The documented limits are generous but finite: scripts must be no larger than 1 MB, output no larger than 1 MB, and on Windows a script must complete in **10 minutes or less** (five on Linux). The runtime limit is the one worth designing around — a check that queries a slow WMI class or reaches across the network on a device with poor connectivity can exceed it, and the result is a device that reports nothing rather than an obvious timeout error.",
    },

    {
      type: "h2",
      id: "json",
      text: "The JSON rules file",
    },
    {
      type: "p",
      text: "The JSON declares each setting the script is expected to return, and what a compliant value looks like. Every rule needs six things:",
    },
    {
      type: "table",
      caption: "Required fields in a custom compliance rule",
      head: ["Field", "Purpose"],
      rows: [
        [
          "`SettingName`",
          "The key the script returns. **Case-sensitive**, and must match the script exactly.",
        ],
        [
          "`Operator`",
          "`IsEquals`, `NotEquals`, `GreaterThan`, `GreaterEquals`, `LessThan`, `LessEquals`.",
        ],
        ["`DataType`", "`Boolean`, `Int64`, `Double`, `String`, `DateTime`, `Version`."],
        ["`Operand`", "The value being compared against."],
        [
          "`MoreInfoURL`",
          "A link shown to the user when the device fails this rule. Point it at instructions, not a policy document.",
        ],
        [
          "`RemediationStrings`",
          "What the Company Portal displays on failure. At least one entry for `en_US` is required; other languages are optional.",
        ],
      ],
    },
    {
      type: "p",
      text: 'Two fields need more care than they look. `SettingName` is case-sensitive, so `TPMChipPresent` and `TpmChipPresent` are different settings and the failure reports as the setting being missing rather than as a mismatch. And a script returning `"True"` as a string against a rule declared `Boolean` is a type error, not a comparison that fails — cast explicitly in the script rather than trusting what a cmdlet emits.',
    },
    {
      type: "p",
      text: "The operator list is short: no pattern matching, no set membership, no substring test. Where you need logic it cannot express, do the evaluation in the script and return a boolean for the JSON to compare against — that keeps the rules readable and puts the complexity where you can test it.",
    },
    {
      type: "p",
      text: "The policy can hold up to 100 KB and 100 rules — far more than any policy anyone can reason about when a device fails one of them. One access detail catches teams with delegated administration: the script upload workflow does not support scope tags, so you must hold the default scope tag to create, edit or even view discovery scripts.",
    },

    {
      type: "h2",
      id: "eight-hours",
      text: "The eight-hour clock",
    },
    {
      type: "p",
      text: "Custom compliance runs on the Intune Management Extension, which is installed automatically by MSI if the device does not already have it when the policy arrives. The cadence it operates on is the thing that most changes how you work with this feature:",
    },
    {
      type: "ul",
      items: [
        "The extension checks for new or updated PowerShell scripts **every eight hours**.",
        "It runs discovery scripts **every eight hours**.",
        "It runs scripts when a user selects **Check Compliance** on the device — but does **not** check for new or updated scripts at that moment.",
        "Push notifications cannot trigger custom compliance to run on demand.",
      ],
    },
    {
      type: "p",
      text: "The third point is the one that wastes afternoons. A user pressing Check Compliance re-runs the script the device already has; it does not fetch the corrected version you uploaded five minutes ago. So the loop of edit, ask the user to sync, observe no change, edit again is not evidence that your fix is wrong — it is evidence that the device is still running yesterday's script.",
    },
    {
      type: "p",
      text: "The same clock governs recovery. Microsoft documents that it can take up to eight hours for a device to move from noncompliant back to compliant after the underlying issue is fixed. On Windows a user can trigger a sync from the Company Portal website to speed that up, which is worth putting in the remediation text rather than leaving people to wait.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Test on a device you control, not through the fleet",
      text: "Because iteration costs eight hours, the only sane development loop is local: run the script as SYSTEM on a test machine and inspect the exact JSON it produces before uploading anything. Microsoft's PowerShell script documentation points at PsExec for this — `psexec -i -s` gives you a shell in the System context. Confirm the output is one line, is valid JSON, and contains exactly the keys your rules file names.",
    },

    {
      type: "h2",
      id: "errors",
      text: "When settings are not evaluated",
    },
    {
      type: "p",
      text: "If custom settings are not being assessed, the device compliance reports carry four documented error codes, and each points somewhere different.",
    },
    {
      type: "table",
      caption: "Custom compliance error codes",
      head: ["Code", "Meaning", "Where to look"],
      rows: [
        [
          "`65007`",
          "Script returned failure.",
          "The script itself — it threw, or exited unsuccessfully. Run it as SYSTEM on a test device.",
        ],
        [
          "`65008`",
          "Setting missing in the script result.",
          "The mismatch case. Usually `SettingName` case, a key the script did not return because a query found nothing, or the 32-bit host reading the wrong registry view.",
        ],
        [
          "`65009`",
          "Invalid JSON for the discovered setting.",
          "Output formatting. Missing `-Compress`, extra output after the final line, or something writing to the pipeline mid-script.",
        ],
        [
          "`65010`",
          "Invalid data type for the discovered setting.",
          "The JSON and the script disagree about type. Cast explicitly in the script.",
        ],
      ],
    },
    {
      type: "p",
      text: "For anything the reports do not explain, the device-side logging lives in `HealthScripts.log` under the Intune Management Extension log directory — the same file used by remediations, because custom compliance is built on that plumbing. That is a genuinely unintuitive place for compliance logging to live, and it is covered alongside the other agent logs in [Reading the Intune Management Extension logs](/microsoft-intune/intune-management-extension-logs).",
    },
    {
      type: "p",
      text: "Two documented quirks are worth recognising rather than investigating. Scripts missing from the picker, or still listed after deletion, are a stale view — refresh, then restart the policy creation flow. And on Microsoft Entra registered devices, device-context scripts run normally while user-context scripts are ignored entirely.",
    },

    {
      type: "h2",
      id: "what-to-use-it-for",
      text: "What to use it for, and what not to",
    },
    {
      type: "p",
      text: "This section is recommendation rather than documented guidance. Custom compliance is powerful enough to be misused, and the failure mode is not a broken policy — it is a fleet blocked from email for a reason nobody can explain.",
    },
    {
      type: "p",
      text: "**Good candidates** are cheap to run, stable in their answer, and tied to real risk: a security agent's service state, a registry value your hardening baseline sets, a certificate, a firmware version floor on hardware with a known vulnerability. **Poor candidates** share one property — the answer can change for reasons unrelated to security posture. Anything depending on network reachability fails for people on a train; anything querying an external service makes that service a dependency of your users' ability to work.",
    },
    {
      type: "p",
      text: "The discipline that matters most: a custom rule should evaluate state that something else is responsible for setting. A compliance rule that checks for a registry value which no configuration profile applies is a rule that fails on every device that has not been manually touched. Compliance grades; configuration sets. Mixing those roles is the same mistake described in [Designing Intune compliance policies that do not lock people out](/microsoft-intune/intune-compliance-policy-design), and it is more damaging here because a custom rule can encode arbitrary logic that nobody else on the team can read.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Leaving the 64-bit host setting at its default.** Scripts run in the 32-bit host unless you say otherwise, which silently changes what the registry and file system look like.",
        "**Output after the final conversion line.** The `ConvertTo-Json -Compress` call must be last, and nothing else may write to the pipeline.",
        "**Case-mismatched setting names.** `SettingName` is case-sensitive and a mismatch reports as a missing setting, not as a naming error.",
        "**Expecting Check Compliance to pick up a new script.** It re-runs the script already on the device and does not fetch updates.",
        "**Iterating through the fleet.** Every cycle is up to eight hours. Develop against a local SYSTEM shell instead.",
        "**Building one policy with dozens of custom rules.** Nobody can diagnose a failure in it, and the reports will not tell them which rule failed.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Write the script first and prove its output by hand. Run it as SYSTEM in the host the policy will actually use, look at the literal string it prints, and confirm it is one line of valid JSON whose keys match the rules file exactly — that string is the only part Intune will not check for you. Then keep each policy small: one script, a handful of related settings, and remediation text that tells a user what to do. When a device fails, whoever picks up the ticket should be able to tell which rule failed from the Company Portal message alone.",
    },
    {
      type: "p",
      text: "And roll it out the way you would roll out any other access control — a generous grace period, notification actions before the block, and a pilot group first. A custom rule is not softer than a built-in one just because you wrote it. It feeds the same compliance state, which feeds the same Conditional Access decision, and the gap between a green tick in Intune and a working sign-in is covered in [Why a compliant device still fails Conditional Access](/microsoft-intune/compliant-device-conditional-access-blocked).",
    },
  ],
  faq: [
    {
      question: "Why is my Intune custom compliance setting not being evaluated?",
      answer:
        "Check the device compliance report for the error code. 65007 means the script returned failure, 65008 means a setting the JSON expects was missing from the script result, 65009 means the discovered setting was not valid JSON, and 65010 means the data type did not match. The most common underlying causes are a case-mismatched SettingName, a script running in the 32-bit host and reading the wrong registry view, or output written after the final ConvertTo-Json line.",
    },
    {
      question: "Does the discovery script run in 32-bit or 64-bit PowerShell?",
      answer:
        "By default the 32-bit host. There is a Run script in 64 bit PowerShell Host setting on the script upload, and it defaults to No. In the 32-bit host the script sees the redirected registry view and the x86 program files path, which can silently return the wrong value or no value at all.",
    },
    {
      question: "How often does custom compliance run?",
      answer:
        "The Intune Management Extension checks for new or updated scripts every eight hours and runs discovery scripts every eight hours. It also runs scripts when a user selects Check Compliance, but it does not check for new or updated scripts at that point — so a freshly uploaded script will not be picked up by a manual sync. Push notifications cannot trigger custom compliance on demand.",
    },
    {
      question: "Can one compliance policy use more than one discovery script?",
      answer:
        "No. Each compliance policy supports a single script, and each script can be used with only one policy. A single script can discover multiple settings, which is the intended way to cover several checks. A script assigned to a policy cannot be deleted until it is unassigned.",
    },
    {
      question: "What are the size and runtime limits for a discovery script?",
      answer:
        "Scripts must be no larger than 1 MB and their output no larger than 1 MB. On Windows a script must complete within 10 minutes; on Linux the limit is five minutes. The policy itself can be up to 100 KB and contain up to 100 rules.",
    },
    {
      question: "Do custom compliance settings affect Conditional Access?",
      answer:
        "Yes. Microsoft documents that custom settings can be used for Conditional Access decisions in the same way as built-in settings, and that together they form a compound rule set equally affecting the device compliance state. A custom rule failing has the same consequence as a built-in one failing.",
    },
  ],
  sources: [
    {
      title: "Custom compliance settings in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/custom-settings",
    },
    {
      title: "Custom compliance discovery scripts for Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/create-custom-script",
    },
    {
      title: "Custom compliance JSON files for Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/create-custom-json",
    },
    {
      title: "Create a compliance policy in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/create-policy",
    },
    {
      title: "Use PowerShell scripts on Windows devices in Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-management/tools/run-powershell-scripts-windows",
    },
    {
      title: "Intune Management Extension for Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-management/tools/management-extension-windows",
    },
  ],
};
