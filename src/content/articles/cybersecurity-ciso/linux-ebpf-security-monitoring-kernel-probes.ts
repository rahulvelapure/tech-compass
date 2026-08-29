import type { Article } from "../../types";

export const article: Article = {
  slug: "linux-ebpf-security-monitoring-kernel-probes",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Security operations",
  title: "The thing watching your kernel can also lie to you",
  seoTitle: "eBPF Security Monitoring: The Kernel Attack Surface",
  metaDescription:
    "eBPF gives detection tools a view into the kernel. It gives an attacker with the right capability the same view. How to keep the subsystem itself defended.",
  standfirst:
    "eBPF is how Linux detection works now. It is also a loaded gun aimed at your telemetry. Almost nobody watches who holds it.",
  excerpt:
    "Falco, Cilium and Tetragon all read the kernel through eBPF. An attacker who can load a program reads it the same way, and can decide what your tools are allowed to see.",
  authorId: "rahul-velapure",
  publishedAt: "2026-04-27",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 6,
  primaryKeyword: "eBPF security monitoring",
  secondaryKeywords: [
    "eBPF rootkit",
    "CAP_BPF capability",
    "kernel lockdown eBPF",
    "unprivileged_bpf_disabled",
    "auditd bpf syscall",
  ],
  tags: ["Linux", "Security", "eBPF", "Kernel", "Detection"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "ebpf-production-observability-security-boundaries",
    "container-image-security-beyond-scanning",
  ],
  methodology:
    "Written from kernel documentation on lockdown and BPF, the capabilities(7) manual page, Falco and Cilium project documentation, and published analysis of BPF-based malware. The source draft dated BPFDoor to 2024; it was documented by PwC in 2021 and reported widely in May 2022. Mechanism already covered by the existing eBPF explainer is referenced rather than repeated, so this article is scoped to the threat surface and the controls that defend it.",
  body: [
    {
      type: "p",
      text: "Your detection stack reads the kernel through eBPF. Falco watches syscalls. Cilium handles network rules. Tetragon and Tracee do much the same.",
    },
    {
      type: "p",
      text: "Now assume an attacker reaches the same interface. They can load a program too. They see what your tools see, and they can decide what your tools are allowed to see.",
    },
    {
      type: "p",
      text: "That is the part missing from most eBPF rollouts. Teams treat it as a telemetry source and never as a privileged subsystem that needs defending in its own right.",
    },
    {
      type: "p",
      text: "How eBPF loads, what the verifier proves and where programs attach are covered in [eBPF in production](/devops/ebpf-production-observability-security-boundaries). This article starts one step later, at the point where someone hostile has the same access your agent does.",
    },
    { type: "h2", id: "capability", text: "The capability is the whole boundary" },
    {
      type: "p",
      text: "Loading an eBPF program is a privileged act. Since kernel 5.8 the relevant capability is `CAP_BPF`, usually paired with `CAP_PERFMON` for tracing work. Before that split, it meant `CAP_SYS_ADMIN`, which meant effectively root.",
    },
    {
      type: "p",
      text: "The split was a real improvement. You can now give a monitoring agent what it needs without handing it the whole machine.",
    },
    {
      type: "p",
      text: "It also created a subtler risk. `CAP_BPF` reads like a narrow, purpose-built permission. It is not. Anything holding it can load code that runs in kernel context, which is close to what loading a kernel module used to buy you.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Treat CAP_BPF as equivalent to kernel code execution",
      text: "It is easy to grant because it looks scoped, and because the alternative was worse. But the practical question is not how narrow the capability name sounds. It is what a process can do once it has it. Audit which service accounts, containers and operators hold it, and be able to justify every one.",
    },
    { type: "h2", id: "rootkit", text: "What a hostile program can actually do" },
    {
      type: "p",
      text: "The capabilities that make eBPF good at detection make it good at hiding. Four patterns matter, and none of them require a kernel module.",
    },
    {
      type: "p",
      text: "**Hide things from user space.** Process listings are built by reading `/proc`. A program attached to the right kernel path can filter what those reads return. Run `ps` and the process is simply absent. Nothing is corrupted. The kernel answers the question and omits one row.",
    },
    {
      type: "p",
      text: "**Capture secrets in transit.** Credentials pass through kernel calls on their way somewhere. A probe on the right function can copy them into a map, and a normal user-space process can read that map later. No file is written and no network connection looks unusual.",
    },
    {
      type: "p",
      text: "**Rewrite traffic below the stack.** Programs at the XDP and TC hooks see packets before most tooling does. They can drop, alter or redirect them. Monitoring that reads from higher in the stack sees a network that looks fine.",
    },
    {
      type: "p",
      text: "**Blind the detection itself.** This is the one that matters most. A hostile program can find the maps your agent depends on, corrupt them, or feed events that were never real. Your alerting stays green because it is being told to.",
    },
    {
      type: "p",
      text: "That last point changes how you should read a quiet dashboard. Absence of alerts is evidence only if the alerting path is intact, and eBPF-based alerting has a kernel-resident dependency that an attacker at this privilege level can reach.",
    },
    { type: "h2", id: "real", text: "This is not theoretical" },
    {
      type: "p",
      text: "BPF-based implants exist. The best documented is BPFDoor, a passive Linux backdoor that used a BPF filter to watch for an activation packet rather than listening on a port.",
    },
    {
      type: "p",
      text: "The dating matters, because it gets repeated wrongly. PwC documented it in a 2021 report, and detailed public analysis followed in May 2022. It was not a 2024 discovery. Reporting at the time indicated it had operated undetected for years before anyone wrote it up.",
    },
    {
      type: "p",
      text: "The design lesson is more useful than the timeline. A backdoor with no listening socket does not appear in a port scan or a netstat listing. It waits in the packet path for a trigger that looks like ordinary traffic. Detection has to come from somewhere other than the interface it is hiding behind.",
    },
    { type: "h2", id: "verifier", text: "The verifier is a safety check, not a security boundary" },
    {
      type: "p",
      text: "It is tempting to assume the verifier prevents all of this. It does not, and the distinction is worth being precise about.",
    },
    {
      type: "p",
      text: "The verifier proves properties about a program before it runs: bounded loops, memory access within limits, only approved helper calls. That is what stops a badly written program from taking the machine down.",
    },
    {
      type: "p",
      text: "It does not ask whether the program is malicious. A program that hides a process and one that counts syscalls look equally acceptable to it. Both stay in bounds. Both call permitted helpers. The verifier was never designed to judge intent.",
    },
    {
      type: "p",
      text: "There is a second, narrower issue. The verifier is complex software analysing hostile input, and bugs in it have been found and fixed over the years. Those are worth patching promptly, but they are the smaller problem. The larger one is that a correctly verified program can still be built to deceive you.",
    },
    { type: "h2", id: "controls", text: "Controls that actually help" },
    {
      type: "p",
      text: "Defending the subsystem is mostly about who may load programs, and whether you would notice when someone does.",
    },
    {
      type: "table",
      caption: "Where each control fits",
      head: ["Control", "What it stops", "Cost"],
      rows: [
        ["Disable unprivileged eBPF", "Loads from unprivileged users", "None on modern systems"],
        [
          "Restrict CAP_BPF and CAP_PERFMON",
          "Most paths to loading at all",
          "An inventory exercise",
        ],
        [
          "Confine loaders with SELinux or AppArmor",
          "A compromised agent loading anything",
          "Policy work",
        ],
        ["Kernel lockdown", "Reading kernel memory, even as root", "May break legitimate tracing"],
        ["Audit the bpf() syscall", "Nothing — it tells you it happened", "Log volume"],
        ["Signed programs and BPF tokens", "Unsigned code loading", "Kernel and tooling support"],
      ],
    },
    {
      type: "p",
      text: "Two of those deserve expanding.",
    },
    {
      type: "p",
      text: "**Kernel lockdown** restricts operations that modify or read the running kernel. Its confidentiality mode blocks paths that read kernel memory even for root, which is exactly the class of thing an implant wants. The trade is real: legitimate tracing and debugging can break, so it fits hardened production hosts better than a build server.",
    },
    {
      type: "p",
      text: "**Auditing bpf()** is the one control that survives the others failing. Every program load goes through that syscall. An audit rule on it produces a record you can alert from, and the useful signal is not the volume but the source. Your monitoring agents load programs at startup and on upgrade. A shell, a web process or a CI runner doing it is not normal.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Baseline the loaders, then alert on anything else",
      text: "Spend an afternoon recording which processes legitimately load eBPF programs in your estate. It is a short list — an agent or two, a CNI, possibly a profiler. Alert on any bpf() call from outside that list. This is cheap, needs no new tooling, and catches the case the rest of the stack cannot see, because it watches the loading rather than the loaded.",
    },
    { type: "h2", id: "response", text: "What to do about it" },
    {
      type: "ol",
      items: [
        "**Inventory the holders.** Find every process and container with `CAP_BPF` or `CAP_PERFMON`, and remove the ones nobody can justify.",
        "**Confirm unprivileged eBPF is off.** Modern distributions disable it, but confirm rather than assume, and set it immutable where you can.",
        "**Enumerate loaded programs.** You cannot spot an unexpected one without knowing the expected set. Record it, and compare periodically.",
        "**Audit bpf() and alert on unknown loaders.** The single highest-value control here.",
        "**Consider lockdown on high-value hosts.** Test it, because it will break some tracing.",
        "**Keep kernels current.** Verifier fixes ship in kernel updates and are not optional.",
      ],
    },
    {
      type: "p",
      text: "None of this argues against eBPF-based security tooling. It is the best kernel visibility available, and the alternative — invasive kernel modules — was worse on both stability and risk.",
    },
    {
      type: "p",
      text: "It argues for treating the interface as privileged infrastructure. You would not leave kernel module loading unmonitored. This is the same decision wearing a friendlier name.",
    },
  ],
  faq: [
    {
      question: "Does the eBPF verifier stop malicious programs?",
      answer:
        "No. It proves a program stays in bounds and cannot hang the kernel. It has no view on intent. A hostile program that plays by the rules gets through.",
    },
    {
      question: "Is CAP_BPF safe to grant to an agent?",
      answer:
        "Treat it as close to running code in the kernel. Grant it on purpose, fence the process in with SELinux or AppArmor, and keep a list of what holds it.",
    },
    {
      question: "Can eBPF hide a process from ps?",
      answer:
        "Yes. A program on the right kernel path can filter what a read of /proc returns. The listing comes back short a row, and nothing looks broken.",
    },
    {
      question: "How would I notice a hostile eBPF program?",
      answer:
        "Watch the loading, not the loaded. Audit the bpf() syscall. Alert when anything outside your known set of agents loads a program.",
    },
    {
      question: "Should I turn on kernel lockdown?",
      answer:
        "On high-value hosts, yes, after testing. It blocks reads of kernel memory even for root. It also breaks some real tracing, so do not switch it on everywhere.",
    },
    {
      question: "Does this mean eBPF tooling is a bad idea?",
      answer:
        "No. It is the best view into the kernel on offer. It just needs to be treated as privileged plumbing, not a passive data feed.",
    },
  ],
  sources: [
    {
      title: "Kernel lockdown mode",
      publisher: "Linux Kernel Documentation",
      url: "https://www.kernel.org/doc/html/latest/admin-guide/lockdown.html",
    },
    {
      title: "BPF documentation",
      publisher: "Linux Kernel Documentation",
      url: "https://www.kernel.org/doc/html/latest/bpf/",
    },
    {
      title: "capabilities(7) — CAP_BPF and CAP_PERFMON",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man7/capabilities.7.html",
    },
    {
      title: "Falco: kernel data sources",
      publisher: "CNCF Falco Project",
      url: "https://falco.org/docs/concepts/data-sources/kernel/",
    },
    {
      title: "A peek behind the BPFDoor",
      publisher: "Elastic Security Labs",
      url: "https://www.elastic.co/security-labs/a-peek-behind-the-bpfdoor",
    },
  ],
};
