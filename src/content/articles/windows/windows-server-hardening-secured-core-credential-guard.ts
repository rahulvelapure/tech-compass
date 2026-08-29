import type { Article } from "../../types";

export const article: Article = {
  slug: "windows-server-hardening-secured-core-credential-guard",
  category: "windows",
  contentType: "explainer",
  subcategory: "Security",
  title: "The kernel is the boundary a checklist cannot defend",
  seoTitle: "Windows Server Hardening: VBS, HVCI, and Credential Guard",
  metaDescription:
    "CIS benchmarks configure the OS. VBS, memory integrity and Credential Guard move the boundary below it — what they protect, what they break, what is already on.",
  standfirst:
    "A hardening baseline trusts the kernel to tell the truth. These features are what you use when you cannot.",
  excerpt:
    "Credential Guard, memory integrity and Secured-core all rest on the same trick: a hypervisor the kernel cannot reach. Knowing what that protects — and the authentication it quietly breaks — is the difference between a clean rollout and a broken one.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "Windows Server hardening Secured-core",
  secondaryKeywords: [
    "virtualization-based security",
    "HVCI memory integrity",
    "Credential Guard LSASS",
    "Secured-core server requirements",
    "UEFI lock VBS",
  ],
  tags: ["Windows", "Windows Server", "Security", "Credential Theft", "Hardening"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "wdac-vs-applocker-kernel-enforcement",
    "bitlocker-tpm-failure-recovery-enterprise",
  ],
  draft: true,
  methodology:
    "Written from current Microsoft Learn documentation on virtualization-based security, Credential Guard configuration and protection limits, memory integrity enablement, the vulnerable driver blocklist, and Secured-core server requirements, verified August 2026. The source draft's performance percentages for HVCI were removed as unverifiable. Three factual corrections were made: the Code Integrity event ID, the claim that Secure Boot is a hard prerequisite for VBS, and the recommendation to prioritise domain controllers — which Microsoft's own protection-limits documentation contradicts.",
  body: [
    {
      type: "p",
      text: "A CIS benchmark is a good day's work. It closes services, sets policy, removes the accounts nobody remembers creating, and gives you a number to report.",
    },
    {
      type: "p",
      text: "It also assumes something it cannot check: that the kernel enforcing all of it is telling the truth.",
    },
    {
      type: "p",
      text: "An attacker who reaches ring 0 — usually by loading a signed driver with a known flaw rather than by finding anything new — is inside that assumption. From there, reading another process's memory is not an exploit. It is an API call.",
    },
    { type: "h2", id: "boundary", text: "Moving the boundary below the kernel" },
    {
      type: "p",
      text: "Virtualization-Based Security (VBS) answers this. It adds a layer the kernel does not outrank. The Windows hypervisor uses the chip's virtualization extensions to split memory into virtual trust levels.",
    },
    {
      type: "p",
      text: "The normal operating system runs in VTL0. That means the kernel, the drivers, everything. A small secure kernel runs in VTL1. VTL0 cannot read VTL1. No amount of privilege inside VTL0 changes that, because the hypervisor holds the line.",
    },
    {
      type: "p",
      text: "Everything else here is an application of that one idea.",
    },
    { type: "h2", id: "credential-guard", text: "Credential Guard, and what it does not cover" },
    {
      type: "p",
      text: "Credential Guard moves derived credentials into VTL1. That means NTLM hashes and Kerberos ticket-granting tickets. Dump LSASS from VTL0 and the secrets are not there. What remains is a stub. It asks the secure side to do the cryptography for it.",
    },
    {
      type: "p",
      text: "The limits are documented, and worth reading before you plan around them. Credential Guard protects the ticket-granting ticket but not service tickets. It does not cover local accounts or Microsoft accounts. Credentials typed at an NTLM prompt are not protected either.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "It does not protect a domain controller's database",
      text: "Microsoft states plainly that Credential Guard does not protect the Active Directory database on a domain controller. Domain controllers are also left out of default enablement. Treating them as the first place to deploy it misreads what the feature does. It is a common instinct, and the source draft for this article followed it. Protect domain controllers with tiering, privileged access management and monitoring instead.",
    },
    {
      type: "p",
      text: "The friction is authentication, and it is specific rather than vague. Single sign-on stops working for NTLMv1, MSCHAPv2, Digest and CredSSP. Those protocols cannot use the signed-in credential. Kerberos unconstrained delegation and DES encryption are blocked outright.",
    },
    {
      type: "p",
      text: "Two consequences catch people. Wi-Fi and VPN built on MSCHAPv2 stop signing users in. The fix is certificate-based EAP-TLS. There is no exception to grant, because the feature has no per-application policy. Hyper-V Live Migration also fails where it uses CredSSP, which matters in clusters. The path there is Kerberos constrained delegation.",
    },
    { type: "h2", id: "default", text: "Much of this is already on" },
    {
      type: "p",
      text: "The deployment framing in most hardening guides is now out of date. From Windows Server 2025, Credential Guard is enabled by default on domain-joined servers that are not domain controllers and that meet the hardware requirements. On the client side the same has been true since Windows 11 22H2.",
    },
    {
      type: "p",
      text: "Three details follow. Default enablement turns VBS on with it. It applies without UEFI lock, so you can still turn it off remotely. A machine set to disable Credential Guard before the upgrade stays disabled after it. The default does not overwrite a decision someone already made.",
    },
    {
      type: "p",
      text: 'So the realistic question for an existing estate is not "how do we roll this out". It is "which servers already have it, and did anything break quietly when they did".',
    },
    { type: "h2", id: "memory-integrity", text: "Memory integrity, and the driver problem" },
    {
      type: "p",
      text: "Memory integrity applies the same isolation to code rather than secrets. You may know it as Hypervisor-Protected Code Integrity (HVCI). Kernel code checks run inside the VBS environment. A kernel page becomes executable only after passing them. A page is writable or executable, never both.",
    },
    {
      type: "p",
      text: "That is the constraint a badly written driver breaks. Some drivers allocate executable pool. Some ask for executable page protection. Some ship a section that is both writable and executable. All three will fail to load.",
    },
    {
      type: "p",
      text: "Audit before enforcing, and read the Code Integrity operational log. Compatibility events are generally event ID 3087 — not 3077, a number that circulates widely and is wrong.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The driver blocklist is a separate control",
      text: "Microsoft ships a blocklist of vulnerable drivers. It has been on by default for all devices since the Windows 11 2022 update. It is enforced when memory integrity, Smart App Control or S mode is active. Windows Server 2016 is the exception. Updates arrive quarterly and through monthly servicing. This covers much of the bring-your-own-vulnerable-driver problem on its own. But a blocklist only knows what is already known. That is an argument for allowlisting, not a replacement for it.",
    },
    {
      type: "p",
      text: "Memory integrity guards the kernel. Deciding which applications may run at all is a different control with a different failure mode, covered in [App Control and AppLocker](/windows/wdac-vs-applocker-kernel-enforcement). The two are complementary, and neither substitutes for the other.",
    },
    {
      type: "p",
      text: "Performance is worth a word. Checking code in a hypervisor costs something. How much depends on whether the chip speeds up the controls involved. Published figures vary too widely by workload to quote. Measure it on your own hardware. Anyone offering one percentage is guessing.",
    },
    {
      type: "h2",
      id: "secured-core",
      text: "Secured-core is a hardware bar, then a configuration",
    },
    {
      type: "p",
      text: "Secured-core server arrived with Windows Server 2022. It is a set of hardware requirements, plus features you then switch on. The hardware side is where deployments stall.",
    },
    {
      type: "table",
      caption: "What a Secured-core server requires beyond the recommended baseline",
      head: ["Requirement", "Why it is there"],
      rows: [
        ["TPM 2.0 and Secure Boot", "Hardware root of trust; also the recommended baseline"],
        [
          "DMA remapping — Intel VT-d or AMD-Vi",
          "Stops a peripheral reading protected memory directly",
        ],
        [
          "Kernel DMA Protection opt-in in firmware",
          "Firmware must set the ACPI flags; not every board does",
        ],
        ["DRTM", "Measured, dynamic launch of the boot environment"],
        ["Virtualization extensions", "VBS needs the hypervisor"],
        ["Transparent Secure Memory Encryption", "AMD-based systems"],
      ],
    },
    {
      type: "p",
      text: "Group Policy lives under Computer Configuration, Administrative Templates, System, Device Guard. The Device Guard name survives only as the place these settings live. Turn On Virtualization Based Security holds the platform security level, the code integrity setting and Secure Launch.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "UEFI lock is not remotely reversible",
      text: "Enabling with UEFI lock means exactly that. Turning it off later needs the policy set back and the UEFI configuration cleared, with someone physically present. So confirm out-of-band management works on every server first. Confirm it by using it, not by checking that the licence exists.",
    },
    { type: "h2", id: "sequence", text: "A sequence that does not strand you" },
    {
      type: "ol",
      items: [
        "Audit what is already running. `msinfo32` shows virtualization-based security services running; PowerShell reads the same from the DeviceGuard WMI namespace.",
        "Find the authentication that will break before it does. Search for PEAP-MSCHAPv2 and EAP-MSCHAPv2 in Wi-Fi and VPN profiles, and for CredSSP in Hyper-V and cluster configuration.",
        "Run memory integrity in audit and read the Code Integrity log for long enough to catch drivers that load rarely. A monthly agent update is not visible in a week.",
        "Enable without lock first. Lock only once the estate has been stable through a patch cycle and out-of-band access is proven.",
        "Handle the exceptions as migrations, not exemptions. EAP-TLS instead of MSCHAPv2; constrained delegation instead of CredSSP.",
      ],
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "A benchmark hardens the OS. VBS moves the boundary underneath it — different problem, different control.",
        "Check what is already enabled before planning a rollout; Server 2025 turns Credential Guard on by itself.",
        "The breakage is authentication protocols, and it is knowable in advance. Go looking for it.",
        "Credential Guard is not a domain controller control. Do not lead with DCs.",
        "Audit memory integrity properly, and watch event 3087 rather than the number everyone repeats.",
        "Secured-core stalls on firmware, not licensing. Confirm DRTM and Kernel DMA Protection before purchase.",
      ],
    },
    {
      type: "p",
      text: "None of this is a checklist item with a pass and a fail. It is a decision to stop trusting the kernel. The cost is paid in the protocols that assumed you still did.",
    },
  ],
  faq: [
    {
      question: "Do I still need EDR if VBS and memory integrity are on?",
      answer:
        "Yes. These controls raise the cost of an attack. They do not watch behaviour. They do nothing about an attacker who uses normal admin tools.",
    },
    {
      question: "Does Credential Guard stop pass-the-hash completely?",
      answer:
        "It stops the hash being lifted from memory for use elsewhere. It does not stop an attacker using the session that is already signed in on that machine.",
    },
    {
      question: "Can I run VBS inside a virtual machine?",
      answer:
        "Yes, where the host exposes virtualization extensions to the guest. It costs CPU time. Use it for high-value guests, not as a fleet default.",
    },
    {
      question: "What breaks first when Credential Guard turns on?",
      answer:
        "Single sign-on over MSCHAPv2 Wi-Fi and VPN. Then Hyper-V Live Migration, where it uses CredSSP. Both are fixable, but not quickly.",
    },
    {
      question: "Is the driver blocklist enough on its own?",
      answer:
        "It helps, and it costs nothing, because it is already on. But it lists what is known to be bad. That list is always behind. Allowlisting is the stronger model.",
    },
  ],
  sources: [
    {
      title: "Credential Guard overview and default enablement",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/security/identity-protection/credential-guard/",
    },
    {
      title: "How Credential Guard works: protection limits",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/security/identity-protection/credential-guard/how-it-works",
    },
    {
      title: "Configure Credential Guard",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/security/identity-protection/credential-guard/configure",
    },
    {
      title: "Memory integrity and VBS enablement",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows-hardware/design/device-experiences/oem-hvci-enablement",
    },
    {
      title: "Microsoft recommended driver block rules",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows/security/application-security/application-control/app-control-for-business/design/microsoft-recommended-driver-block-rules",
    },
    {
      title: "What is Secured-core server?",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows-server/security/secured-core-server",
    },
  ],
};
