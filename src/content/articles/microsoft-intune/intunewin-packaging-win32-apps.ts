import type { Article } from "../../types";

export const article: Article = {
  slug: "intunewin-packaging-win32-apps",
  category: "microsoft-intune",
  subcategory: "App delivery",
  title: "Packaging Win32 apps for Intune: the .intunewin file and the decisions around it",
  seoTitle: "Intune Win32 Packaging: IntuneWinAppUtil in Practice",
  metaDescription:
    "Using the Microsoft Win32 Content Prep Tool properly: what goes in the package, the command lines that matter, and the 32-bit PowerShell trap.",
  standfirst:
    "Producing a .intunewin file takes about thirty seconds. Almost everything that goes wrong with a Win32 app was decided in the ten minutes before that.",
  excerpt:
    "The Content Prep Tool is simple. The choices around it — what to include, how to reference files, which command lines to use, and why powershell.exe is not the executable you think — are where packaging succeeds or fails.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 10,
  primaryKeyword: "intunewinapputil",
  secondaryKeywords: [
    "microsoft win32 content prep tool",
    "intunewin file",
    "intune win32 install command",
    "sysnative powershell intune",
  ],
  tags: ["Intune", "Windows", "Endpoint Management", "App delivery", "PowerShell"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Win32 app content preparation and app deployment documentation, including the Content Prep Tool parameters, install and uninstall command behaviour and script installer limits. Tool behaviour, the Sysnative path guidance, environment variable limitations and timeout values are taken from those sources and cited below. Where the article recommends a packaging approach rather than describing documented behaviour, it says so. No customer environment is described and no package was built or tested for this article.",
  body: [
    {
      type: "p",
      text: "The Microsoft Win32 Content Prep Tool does one job: it takes a folder of installation files and compresses them into a single encrypted `.intunewin` file that Intune can distribute. Along the way it reads some metadata — for an MSI it pulls out the information Intune needs to identify the product.",
    },
    {
      type: "p",
      text: "That is genuinely all it does. It does not validate your installer, test your command line, or check that the thing you are packaging can install silently. Those are your problems, and they are the ones that determine whether the deployment works.",
    },

    {
      type: "h2",
      id: "before-packaging",
      text: "Install it by hand first",
    },
    {
      type: "p",
      text: "Microsoft's own troubleshooting guidance opens with this and it is easy to skip: install the application manually on a device, without Intune, before packaging anything. The stated reasons are to confirm the application supports silent installation, that the installation commands are correct, and that you know the installation folder — which is what you will use for detection logic.",
    },
    {
      type: "p",
      text: "That last point is the one worth emphasising. You are not just checking the installer works; you are collecting the evidence for the detection rule. What did it write, where, and with what version string? An engineer who packages first and works out detection afterwards ends up guessing, and a guessed detection rule is how apps end up reinstalling daily.",
    },
    {
      type: "p",
      text: "Two constraints to establish at the same time. Windows S mode does not support MSI installation at all, so if S mode devices are in scope the packaging conversation is a different one. And Win32 app management supports 32-bit, 64-bit and ARM64 Windows — but that says nothing about whether your specific installer does.",
    },

    {
      type: "h2",
      id: "what-goes-in",
      text: "What goes into the package",
    },
    {
      type: "p",
      text: "The tool compresses **everything** in the source folder, including all subfolders. That is the behaviour to design around, and it produces the single most common packaging mistake.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not run the tool from inside the source folder",
      text: "Microsoft's documentation is explicit: keep the Content Prep Tool separate from the installer files and folders, so that the tool and other unnecessary files are not included in the `.intunewin`. Unpack the tool once to its own location and package from elsewhere. Otherwise every package you produce contains a copy of the packaging tool, its licence, its readme and its release notes — shipped to every device.",
    },
    {
      type: "p",
      text: "The practical shape is a source folder containing only what the installation needs: the installer itself, any transform or configuration file, any wrapper script, and any supporting content in subfolders. Nothing else.",
    },
    {
      type: "p",
      text: "Supporting files are referenced by **relative path** from the setup folder. Microsoft's example is a licence file at `c:\\testapp\\v1.0\\licenses\\license.txt` inside a setup folder of `c:\\testapp\\v1.0`, referenced as `licenses\\license.txt`. Absolute paths from your packaging machine will not exist on the target device, which sounds obvious and is nonetheless a regular cause of packages that work for the person who built them.",
    },

    {
      type: "h2",
      id: "running-it",
      text: "Running the tool",
    },
    {
      type: "p",
      text: "Run `IntuneWinAppUtil.exe` with no parameters and it prompts for each value in turn, which is fine for occasional work. For anything repeatable, the command line is better because it can live in a build script alongside the source.",
    },
    {
      type: "table",
      caption: "Content Prep Tool command-line parameters",
      head: ["Parameter", "Meaning"],
      rows: [
        [
          "`-c <setup_folder>`",
          "The folder containing all setup files. Everything in it is compressed.",
        ],
        ["`-s <setup_file>`", "The setup file itself, such as `setup.exe` or `setup.msi`."],
        [
          "`-o <output_folder>`",
          "Where the generated `.intunewin` is written. Created automatically if absent.",
        ],
        ["`-q`", "Quiet mode."],
        [
          "`-a <catalog_folder>`",
          "A separate folder of catalog files, used for Windows S mode packaging.",
        ],
        ["`-h`", "Usage information."],
      ],
    },
    {
      type: "code",
      language: "text",
      filename: "A typical invocation",
      command: true,
      code: `IntuneWinAppUtil -c C:\\Packaging\\Source\\VendorApp\\14.2.0 ^
                 -s C:\\Packaging\\Source\\VendorApp\\14.2.0\\setup.exe ^
                 -o C:\\Packaging\\Output\\VendorApp\\14.2.0 ^
                 -q`,
    },
    {
      type: "p",
      text: "One behaviour worth knowing before you script it: if the output file already exists, it is overwritten without prompting. That is convenient in a build pipeline and unhelpful if two versions share an output folder, so make the version part of the output path rather than relying on the filename.",
    },

    {
      type: "h2",
      id: "command-lines",
      text: "The command lines, where the real work is",
    },
    {
      type: "p",
      text: "The install and uninstall commands are configured in the portal rather than in the package, which means they can be corrected without repackaging. Several documented behaviours here cause more trouble than the packaging step itself.",
    },
    {
      type: "p",
      text: "**Environment variable expansion is not supported in the uninstall command.** This is documented, and the workaround Microsoft gives is to use a wrapper script inside the package that performs the uninstall, and to point the uninstall command at that script. If your uninstall command contains `%ProgramFiles%` and appears to do nothing, this is why.",
    },
    {
      type: "p",
      text: "**The installation timeout defaults to 60 minutes**, with a maximum of 1440 minutes — one day. If the app takes longer than the configured time, the install is failed. For a large suite on slow hardware the default is not always generous, and a package that fails at almost exactly an hour on some devices is worth checking here before anywhere else.",
    },
    {
      type: "p",
      text: "**Install behaviour is either System or User.** System applies to all users of the device; User applies to the specific user. This interacts with targeting in a way that produces a documented failure: a Win32 app deployed with user targeting that requires administrative privileges the standard user does not have will fail to install. That failure reads like a packaging problem and is a context problem. Two related details are worth knowing: for a device that is Microsoft Entra registered, Microsoft's guidance is to select System — and users do not need to be signed in for Win32 apps to install.",
    },
    {
      type: "p",
      text: "**Silent installation is a hard requirement, not a preference.** Microsoft states that Intune does not support interactive application installations: applications deployed through Intune must install silently and cannot require dialog boxes, prompts or any user input. The documentation goes further and names the workaround people reach for — techniques that force interaction with the signed-in user session, such as `serviceui.exe` — as unsupported, with the caveat that even where they appear to work the behaviour should not be relied on in production. If a vendor installer genuinely cannot run silently, the answer is a different package, not a cleverer wrapper.",
    },

    {
      type: "h2",
      id: "transforms",
      text: "Transforms, and why relative paths work",
    },
    {
      type: "p",
      text: "For MSI packages, an MST transform applies customisation — a licence key, a suppressed feature, a disabled auto-updater — without repackaging the vendor's installer. It is the difference between a package you can rebuild in five minutes when the vendor ships an update, and one somebody has to reverse-engineer.",
    },
    {
      type: "code",
      language: "text",
      filename: "Applying transforms from an install command",
      command: true,
      code: `msiexec /i "VendorApp.msi" TRANSFORMS="site.mst;nofeatures.mst" /qn /norestart`,
    },
    {
      type: "p",
      text: "Transforms are applied **in the order listed**, filenames and full paths cannot be mixed in one list, and because the delimiter is a semicolon, a semicolon must never appear in a transform filename.",
    },
    {
      type: "p",
      text: "The reason a bare filename works here explains a lot of packaging behaviour more generally. Intune extracts the package content to `C:\\Windows\\IMECache\\<app id>` and runs the installer from there, so the extracted folder is the working directory. Anything shipped inside the package is reachable by relative path — `site.mst`, `.\\Install.ps1`, `licenses\\license.txt` — with no need to know where the content landed. That is why Microsoft's own update-package example uses `wusa.exe .\\update.msu` rather than an absolute path.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Ship the transform inside the package",
      text: "A transform referenced from a network share is a runtime dependency on a file server being reachable from the system context, on a device that may be on a home network. Put the `.mst` in the source folder so it is compressed into the `.intunewin`. Windows Installer also supports transforms embedded in the MSI itself, referenced by prefixing the name with a colon.",
    },

    {
      type: "h2",
      id: "sysnative",
      text: "The 32-bit PowerShell trap",
    },
    {
      type: "p",
      text: "This one deserves its own section because it is silent, common, and produces symptoms that look like anything but its actual cause.",
    },
    {
      type: "p",
      text: "Microsoft documents that calling `powershell.exe` in the install or uninstall command results in a **32-bit** PowerShell instance being launched. Not the 64-bit one you get from an administrative console on the same machine. To force 64-bit execution, the documented path is:",
    },
    {
      type: "code",
      language: "text",
      filename: "Forcing 64-bit PowerShell from an install command",
      code: `%SystemRoot%\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe -ExecutionPolicy Bypass -File .\\Install.ps1`,
    },
    {
      type: "p",
      text: "The consequences of getting this wrong are subtle rather than loud. A 32-bit PowerShell process sees the redirected registry view, so a script writing to `HKLM\\Software\\Vendor` actually writes to `HKLM\\Software\\WOW6432Node\\Vendor`. It sees `Program Files (x86)` when it asks for `%ProgramFiles%`. It cannot load 64-bit modules. The script runs, reports success, and leaves the machine in a state your detection rule — evaluated in the 64-bit context by default — cannot see.",
    },
    {
      type: "p",
      text: "That combination produces an app that installs successfully, reports as not detected, and reinstalls every day. The install command and the detection rule are each internally consistent; they simply disagree about which registry they live in. `Sysnative` is a virtual path that only exists to a 32-bit process, which is precisely why it works here.",
    },
    {
      type: "callout",
      variant: "note",
      title: "PowerShell as the installer itself",
      text: "Rather than shelling out to a script from a command line, a PowerShell script can be uploaded to serve as the installer directly. Documented limits: scripts are capped at 50 KB, they run in the same context as the app installer, and their return codes determine the reported installation status. Where Multi-Admin Approval is enabled, scripts cannot be uploaded during app creation — the app has to be created first and the script added afterwards.",
    },

    {
      type: "h2",
      id: "return-codes",
      text: "Return codes and what they commit you to",
    },
    {
      type: "p",
      text: "The return code mapping tells Intune how to interpret whatever your installer exits with. Most defaults are sensible, but the **Retry** classification has a consequence worth understanding: a retry code causes the agent to attempt the install three times, waiting five minutes between attempts.",
    },
    {
      type: "p",
      text: "For a genuinely transient failure — a file lock, a service still stopping — that is exactly right. For a deterministic failure mapped to retry by mistake, it means every failing device runs your installer three times per cycle. On a package that makes changes before failing, that is not a neutral outcome.",
    },

    {
      type: "h2",
      id: "validate",
      text: "Validate before you upload, not after",
    },
    {
      type: "p",
      text: "Every failure described so far is cheaper to find on a test machine than in a deployment report, because once a package is assigned each correction costs a check-in cycle to observe. This sequence is engineering practice rather than documented guidance, but each step tests something specific that goes wrong on managed endpoints.",
    },
    {
      type: "ol",
      items: [
        "**Run the exact install command in the system context, not as yourself.** This reproduces the account the agent uses. An installer that works from your elevated prompt and fails under `NT AUTHORITY\\SYSTEM` — because it expects a user profile, a mapped drive, or `HKCU` — fails on every managed device and passes every test you do the easy way.",
        "**Run it from a copied folder.** Copy the content somewhere neutral first. This catches absolute paths and hard-coded references that happen to resolve on the packaging machine.",
        "**Check the exit code explicitly** with `echo %ERRORLEVEL%`. A wrapper reporting success while the installer failed is invisible from the installer's own output.",
        "**Confirm the artefact your detection rule will look for**, in the context that rule will run in. A 32-bit installer writing to the redirected registry is the mismatch that produces a daily reinstall.",
        "**Test the uninstall command too.** It is the command nobody validates until a supersedence replacement stalls because removal never worked.",
      ],
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Running the tool from inside the source folder.** Everything in that folder is compressed, including the tool itself.",
        "**Using absolute paths from the packaging machine.** Reference supporting files by relative path from the setup folder — the extracted content folder is the working directory.",
        "**Referencing a transform from a network share.** It becomes a runtime dependency on a file server reachable from the system context. Ship the `.mst` inside the package.",
        "**Expecting 64-bit PowerShell by default.** A bare `powershell.exe` call launches the 32-bit host. Use the `Sysnative` path, or accept the redirected registry and file system views.",
        "**Putting environment variables in the uninstall command.** Expansion is not supported there; use a wrapper script.",
        "**Leaving the timeout at 60 minutes for a large suite.** The maximum is 1440 minutes and the failure looks like a hang.",
        "**Targeting a user-context app that needs admin rights.** Documented to fail, and the log does not make the reason obvious.",
        "**Writing a wrapper that always exits 0.** Intune then reports success for every outcome, including the failures.",
        "**Testing only as an interactive administrator.** The agent installs as SYSTEM, and that is where the difference shows up.",
        "**Packaging before installing manually once.** You lose the only reliable source of truth for the detection rule.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Treat packaging as three separate pieces of work and do them in order: prove the silent install by hand and record exactly what it changes; build the package from a clean source folder with the tool kept elsewhere; then configure the command lines, timeout, context and return codes in the portal, where they can be fixed without rebuilding anything.",
    },
    {
      type: "p",
      text: "Keep the source folder and the exact tool invocation in version control alongside the app. A `.intunewin` is an opaque encrypted blob — you cannot inspect one six months later to work out what went into it, and the person who built it will not remember. The command line is three lines of text and removes that entire class of question.",
    },
    {
      type: "p",
      text: "Then write the detection rule from what the manual install actually did, not from what the installer was supposed to do. That is covered in [Win32 app detection rules](/microsoft-intune/win32-app-detection-rules), and if the deployment misbehaves afterwards, the evidence is in [the Intune Management Extension logs](/microsoft-intune/intune-management-extension-logs).",
    },
  ],
  faq: [
    {
      question: "What does the Microsoft Win32 Content Prep Tool actually do?",
      answer:
        "It converts application installation files into the .intunewin format by compressing everything in the source folder, and it detects some of the attributes Intune needs to determine installation state — for an MSI, it retrieves the product information. It does not validate the installer or test the command line.",
    },
    {
      question: "Why is the packaging tool ending up inside my .intunewin file?",
      answer:
        "Because the tool compresses all files and subfolders in the source folder. Microsoft's documentation advises keeping the Content Prep Tool separate from the installer files and folders. Unpack it to its own location and package from a clean source folder that contains only installation content.",
    },
    {
      question: "Why does my PowerShell install script behave differently under Intune?",
      answer:
        "Calling powershell.exe from a Win32 app install or uninstall command launches a 32-bit PowerShell instance. That process sees the redirected registry view and the 32-bit Program Files path. To force 64-bit execution, use %SystemRoot%\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe. A mismatch here commonly produces an app that installs but is never detected.",
    },
    {
      question: "Can I use environment variables in the uninstall command?",
      answer:
        "No. Microsoft documents that environment variable expansion is not supported in the uninstall command. The recommended approach is to include a wrapper script in the package that performs the uninstall, and point the uninstall command at that script.",
    },
    {
      question: "How long does Intune wait for an installer to finish?",
      answer:
        "The installation time required setting defaults to 60 minutes, with a maximum of 1440 minutes. If the app takes longer than the configured value, Intune fails the installation. Large suites on slower hardware can exceed the default, which presents as a failure at roughly the one-hour mark.",
    },
    {
      question: "How do I reference an extra file inside my package?",
      answer:
        "Place it in a subfolder of the setup folder and reference it by relative path. Microsoft's example puts a licence file at licenses\\license.txt inside the setup folder and references it with that relative path. Absolute paths from the packaging machine will not resolve on the target device.",
    },
    {
      question: "How do I apply an MSI transform in an Intune Win32 app?",
      answer:
        'Pass the TRANSFORMS property on the install command, for example msiexec /i "App.msi" TRANSFORMS="custom.mst" /qn. Multiple transforms are separated by semicolons and applied in the order listed, filenames and full paths cannot be mixed in the same list, and a transform filename must never contain a semicolon. Ship the .mst inside the package so a bare filename resolves against the extracted content folder rather than depending on a network share.',
    },
  ],
  sources: [
    {
      title: "Prepare Win32 App Content for Upload",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/create-win32-package",
    },
    {
      title: "Add, Assign, and Monitor a Win32 App in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/add-win32",
    },
    {
      title: "Win32 app management in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/win32",
    },
    {
      title: "Troubleshoot Win32 App Issues",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/troubleshoot-win32",
    },
    {
      title: "Microsoft Win32 Content Prep Tool",
      publisher: "GitHub (Microsoft)",
      url: "https://github.com/Microsoft/Microsoft-Win32-Content-Prep-Tool",
    },
    {
      title: "TRANSFORMS property",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/win32/msi/transforms",
    },
    {
      title: "msiexec command-line options",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/win32/msi/command-line-options",
    },
    {
      title: "Enable Win32 Apps on S Mode Devices",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/enable-win32-s-mode",
    },
  ],
};
