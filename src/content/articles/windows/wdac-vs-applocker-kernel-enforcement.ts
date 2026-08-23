import type { Article } from "../../types";

export const article: Article = {
  slug: "wdac-vs-applocker-kernel-enforcement",
  category: "windows",
  contentType: "comparison",
  subcategory: "Security",
  title: "App Control and AppLocker enforce in different places, and it shows",
  seoTitle: "App Control for Business vs AppLocker: which to use",
  metaDescription:
    "AppLocker checks in user mode. App Control for Business enforces in the kernel. What that changes, why the migration is hard, and where AppLocker still fits.",
  standfirst:
    "One asks the operating system nicely. The other stops the file being mapped into memory at all. That gap is the whole story.",
  excerpt:
    "AppLocker evaluates rules in user mode; App Control for Business enforces code integrity in the kernel. What the difference buys, what it costs to deploy, and why AppLocker has not gone away.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "App Control for Business vs AppLocker",
  secondaryKeywords: [
    "WDAC vs AppLocker",
    "Windows code integrity policy",
    "managed installer WDAC",
    "application allowlisting Windows",
    "App Control supplemental policy",
  ],
  tags: ["Windows", "Security", "Endpoint Management", "Application Control", "Intune"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "windows-laps-entra-id-architecture-deployment",
    "windows-11-vs-windows-10-enterprise",
  ],
  methodology:
    "Written from Microsoft Learn documentation on App Control for Business, AppLocker, feature availability and managed installers, verified August 2026. Microsoft's own statements on investment and servicing status are quoted rather than characterised, because this is an area where 'deprecated' is asserted more often than it is true. No fleet sizes, timings or incident costs are given.",
  body: [
    {
      type: "p",
      text: "Allowlisting is one of the few controls that stops malware nobody has seen before. Windows ships two of them. They are not two flavours of the same thing.",
    },
    {
      type: "p",
      text: "AppLocker decides when a process starts, in user mode. App Control for Business enforces in the kernel, before a file is mapped into memory at all. Everything else follows from that.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The name changed",
      text: "Windows Defender Application Control is now App Control for Business. The technology is the same and the older name still appears widely in tooling, scripts and community guidance. If you are searching for documentation, both names lead to the same feature.",
    },
    { type: "h2", id: "where", text: "Where each one enforces" },
    {
      type: "p",
      text: "AppLocker rules are evaluated by a service when a process is created. Rules can be based on publisher, path or hash, and — usefully — can apply to specific users or groups.",
    },
    {
      type: "p",
      text: "Because the check happens in user mode at launch, it covers what launches. Code that gets into an already-running trusted process by another route has not launched anything, so nothing evaluates it.",
    },
    {
      type: "p",
      text: "App Control works through the kernel's code integrity engine. When something asks to load an executable, a library or a driver, the check happens before the file is mapped. If the policy does not allow it, it never runs, and the kernel logs the block.",
    },
    {
      type: "p",
      text: "Microsoft is explicit about the difference in status. AppLocker is described as a defence-in-depth feature rather than a defensible security boundary; App Control is serviced as a security feature. That is a statement about what each one is expected to withstand.",
    },
    {
      type: "table",
      caption: "The differences that decide a deployment",
      head: ["", "AppLocker", "App Control for Business"],
      rows: [
        [
          "Enforcement point",
          "User mode, at process creation",
          "Kernel, before the file is mapped",
        ],
        ["Scope", "Can target specific users and groups", "Applies to the whole device"],
        ["Rule basis", "Publisher, path, hash", "Publisher, hash, reputation, managed installer"],
        ["Path rules", "Trusted", "Not trusted on their own"],
        ["Policy format", "Editable rules", "A compiled binary policy"],
        ["Microsoft investment", "Security fixes only", "Active development"],
      ],
    },
    { type: "h2", id: "not-deprecated", text: "AppLocker is not deprecated" },
    {
      type: "p",
      text: "This gets stated as fact often enough to be worth correcting. Microsoft's position is narrower and more useful than that.",
    },
    {
      type: "p",
      text: "AppLocker still ships, still works, and still receives security fixes. What it does not receive is new features. Microsoft recommends App Control for new deployments and says it is no longer investing in AppLocker.",
    },
    {
      type: "p",
      text: "There is also a case where AppLocker does something App Control cannot. App Control policies apply to the entire device. AppLocker rules can apply to particular users or groups. On a shared device where one group should be able to run something and another should not, AppLocker is the tool that expresses it — and Microsoft describes using the two together for exactly that.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The realistic target state",
      text: "Aim for App Control as the device-wide baseline. Layer AppLocker on where per-user rules matter. Plan a rip-and-replace and you tend to find that need halfway through.",
    },
    { type: "h2", id: "hard", text: "Why App Control is harder to deploy" },
    {
      type: "p",
      text: "The security improvement is real and so is the operational cost. It comes from one design decision.",
    },
    {
      type: "p",
      text: "AppLocker will trust a location. Allow a directory and what sits there can run. App Control does not work that way: trust comes from signatures, hashes, reputation or how the file arrived. Dropping a malicious library into a trusted folder achieves nothing, because the folder was never the reason anything was trusted.",
    },
    {
      type: "p",
      text: "That strictness lands on your own software. Unsigned internal scripts and third-party applications shipping unsigned components stop working. For most organisations this is the moment they find out how much unsigned code they depend on.",
    },
    {
      type: "p",
      text: "Policies are also compiled binaries rather than a list you edit. You author, convert and deploy them through management tooling, which means application control becomes a pipeline rather than a settings page.",
    },
    { type: "h2", id: "managed-installer", text: "Managed installers and supplemental policies" },
    {
      type: "p",
      text: "Two things make the strictness workable. Skip them and the rollout stalls.",
    },
    {
      type: "p",
      text: "A **managed installer** is a deployment tool you designate as trusted — Intune, for example, which can be configured as one directly. Files it installs are tagged, and policy can trust anything carrying that tag. Internal software deploys and runs without being signed.",
    },
    {
      type: "p",
      text: "The elegant part is what it does not cover. Download the identical file through a browser and it runs unsigned and untagged, so it is blocked. Trust attaches to how the file arrived, not to what it is.",
    },
    {
      type: "p",
      text: "**Supplemental policies** solve the change problem. A locked base policy trusts Microsoft-signed code and little else. Supplemental policies extend it — your code signing certificate, a specific vendor. A vendor change means updating one supplemental policy rather than rebuilding and redeploying the base.",
    },
    { type: "h2", id: "isg", text: "Reputation, and what it is called" },
    {
      type: "p",
      text: "App Control can also trust code that the Intelligent Security Graph rates as safe. Turn that on if you cannot list every version of every common app by hand.",
    },
    {
      type: "p",
      text: "It is frequently called SmartScreen integration, which is the wrong name and sends people to the wrong documentation. Smart App Control is the related consumer feature, built on the same engine.",
    },
    {
      type: "p",
      text: "Watch for one side effect, so it does not alarm anyone. Turn on reputation trust while a second antivirus runs, and Defender steps back to handle just those checks. That is expected.",
    },
    { type: "h2", id: "mistakes", text: "Three ways deployments go wrong" },
    {
      type: "p",
      text: "**Enforcing before auditing.** Audit mode allows everything and logs what would have been blocked. Those logs are how you build the policy. Skipping that step means discovering your dependencies through incidents.",
    },
    {
      type: "p",
      text: "**A base policy too narrow for the platform.** A policy built only from what a device happened to run during an audit window will miss code paths that appear later, including parts of servicing. Microsoft publishes example base policies precisely so that this class of gap is not rediscovered by every organisation. Start from one.",
    },
    {
      type: "p",
      text: "**Blocking your own management tools.** It is entirely possible to write a policy that blocks the agent or the tooling needed to replace that policy. Recovery then means physical access. Make sure the management agent and the native policy tool are trusted in the base policy before enforcing anything.",
    },
    { type: "h2", id: "memory-integrity", text: "The protection underneath" },
    {
      type: "p",
      text: "App Control enforces in the kernel, which raises an obvious question: what protects the kernel?",
    },
    {
      type: "p",
      text: "Memory integrity, also called HVCI, guards the kernel itself. It leans on the chip and the hypervisor to do that. The two are separate and can ship on their own. They are stronger together, because an attacker who takes the kernel can switch off whatever it was enforcing.",
    },
    {
      type: "p",
      text: "Memory integrity needs newer hardware and drivers, which some older estates cannot meet. App Control does not.",
    },
    { type: "h2", id: "choosing", text: "Choosing between them" },
    {
      type: "table",
      caption: "What each one suits, given where you are now",
      head: ["App Control fits when", "AppLocker still earns its place when"],
      rows: [
        [
          "Endpoints are modern and centrally managed",
          "Rules must differ by user or group on one device",
        ],
        [
          "A deployment tool can act as managed installer",
          "Unsigned internal code cannot be signed or tagged yet",
        ],
        ["You can run audit mode and act on the results", "Management maturity is not there yet"],
        [
          "Kernel-level integrity is a stated requirement",
          "You need something useful in place quickly",
        ],
      ],
    },
    {
      type: "p",
      text: "That second column is not a failure state. Application control that is actually deployed beats a stricter one that stalls in audit mode for a year.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Start from a Microsoft example base policy rather than only from what your audit captured.",
        "Set up your deployment tool as a managed installer first, and leave the signing work until after.",
        "Keep the base policy locked and put vendor and internal trust in supplemental policies.",
        "Trust the management agent and policy tooling explicitly, or recovery needs hands on the device.",
        "Keep AppLocker where per-user rules matter. It is a complement, not a predecessor.",
      ],
    },
    {
      type: "p",
      text: "The honest summary is that App Control gives a stronger guarantee and asks for organisational maturity in exchange — code signing, a real deployment pipeline, and the discipline to audit before enforcing. That is why it is worth planning rather than switching on, and why the tool it supposedly replaces is still the right answer in specific places.",
    },
  ],
  faq: [
    {
      question: "Is AppLocker deprecated?",
      answer:
        "No. It still ships and still gets security fixes. What it does not get is new features. Microsoft points new work at App Control instead.",
    },
    {
      question: "What happened to WDAC?",
      answer:
        "It got a new name. WDAC is now App Control for Business. Same feature. The old name is still all over the tooling.",
    },
    {
      question: "Why does App Control block my internal scripts?",
      answer:
        "Because they are not signed and nothing vouched for them. Either sign them, or deploy them with a tool set up as a managed installer so they arrive trusted.",
    },
    {
      question: "Can I use both App Control and AppLocker?",
      answer:
        "Yes, and sometimes you should. App Control covers the whole device. AppLocker can set rules for one group of users, which App Control cannot.",
    },
    {
      question: "Why did Defender Antivirus go into passive mode?",
      answer:
        "It is normal. Switch on reputation trust while a second scanner runs, and Defender steps back to handle just those checks. Nothing is broken.",
    },
  ],
  sources: [
    {
      title: "Application Control for Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/appcontrol",
    },
    {
      title: "App Control for Business and AppLocker overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/appcontrol-and-applocker-overview",
    },
    {
      title: "App Control for Business and AppLocker feature availability",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/feature-availability",
    },
    {
      title: "Automatically allow apps deployed by a managed installer",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/design/configure-authorized-apps-deployed-with-a-managed-installer",
    },
    {
      title: "App Control and virtualization-based protection of code integrity",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows/security/application-security/application-control/introduction-to-virtualization-based-security-and-appcontrol",
    },
  ],
};
