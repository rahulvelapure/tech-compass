import type { Article } from "../../types";

export const article: Article = {
  slug: "ebpf-production-observability-security-boundaries",
  category: "devops",
  contentType: "explainer",
  subcategory: "Observability",
  title: "eBPF in production: what the verifier guarantees, and what it does not",
  seoTitle: "eBPF in production: verifier, capabilities and limits",
  metaDescription:
    "eBPF runs your code inside the kernel under a verifier. What that verifier actually proves, which capabilities it needs, and where the model stops helping.",
  standfirst:
    "The sandbox is real. It is also narrower than the sales pitch, and most of the cost sits outside it.",
  excerpt:
    "eBPF moved kernel extension from loadable modules to verified bytecode. The safety argument is genuine, but it covers memory and termination rather than correctness, and the capability model needs reading closely.",
  authorId: "rahul-velapure",
  publishedAt: "2026-02-23",
  lastReviewedAt: "2026-08-21",
  nextReviewAt: "2027-02-21",
  readingMinutes: 12,
  primaryKeyword: "ebpf in production",
  secondaryKeywords: [
    "ebpf verifier limits",
    "cap_bpf cap_perfmon",
    "btf co-re kernel requirements",
    "ebpf vs kernel module",
  ],
  tags: ["DevOps", "Observability", "Kubernetes", "Linux", "Security"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "linux-ebpf-security-monitoring-kernel-probes",
    "zero-trust-network-segmentation",
    "ingress-nginx-archived-migration",
  ],
  methodology:
    "Written from kernel documentation, the capabilities(7) manual page, LWN's contemporaneous coverage of the bounded-loop patch set, and the published documentation of Cilium, Falco and kube-proxy. Version numbers were taken from those sources rather than from secondary summaries. No benchmark figures are quoted here: the published ones measure specific workloads on specific kernels, and reproducing them was out of scope.",
  body: [
    {
      type: "p",
      text: "A kernel module can take the whole box down with it. All it has to do is follow a null pointer. That one fact shaped Linux observability for two decades. If you had to watch syscalls or packets from inside the kernel, you had two choices. Ship a module you were afraid of, or run a tool up in user space that paid a context switch for every event.",
    },
    {
      type: "p",
      text: "eBPF changed the terms of that trade. You still run your own code in kernel context. The difference is that the kernel refuses to load it until a static analyser is satisfied. The code must not read out of bounds, and it must be shown to terminate. That is a genuine change, and it is why Cilium, Falco and most modern tracing tools are built on it.",
    },
    {
      type: "p",
      text: "It is also narrower than it sounds. The verifier proves two things about memory and termination. It does not prove your program is correct, it does not prove it is cheap, and it has never been the whole security boundary. The interesting engineering questions in an eBPF rollout are mostly about the parts the sandbox does not cover.",
    },

    { type: "h2", id: "execution-model", text: "What actually happens when a program loads" },
    {
      type: "p",
      text: "The most common misreading of eBPF is that verification happens on the hot path. It does not. There are two separate paths, and conflating them makes the performance model impossible to reason about.",
    },
    {
      type: "p",
      text: "The load path runs once. A user-space loader — usually libbpf — reads the bytecode, adjusts it for the running kernel, and calls the `bpf()` syscall. The verifier analyses the program, and if it passes, the kernel JIT-compiles it to native machine code and attaches it to a hook. The run path is what happens afterwards. An event hits the hook and the compiled native code runs. It writes results into a map or a ring buffer, and user space collects them.",
    },
    {
      type: "figure",
      title: "The two paths through an eBPF program",
      alt: "A load path across the top, running once: a loader reading BTF, then the verifier, then JIT compilation. A dashed line drops from the JIT stage into the middle of a vertical run path that repeats for every event. The run path descends through five stages: an event such as a syscall, packet or probe; the kernel hook it reaches; the eBPF program running as native code; the map or ring buffer it writes to; and the user-space agent that reads from it.",
      caption:
        "Verification and JIT compilation are load-time costs paid once per program. Only the vertical path repeats per event.",
      svg: '<svg viewBox="0 0 440 510" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><marker id="tc-ebpf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor"/></marker></defs><g fill="currentColor" font-size="11" letter-spacing="0.1em"><text x="8" y="18">LOAD PATH — ONCE</text><text x="60" y="104">RUN PATH — EVERY EVENT</text></g><g stroke="currentColor" stroke-width="1.5" fill="none"><rect x="8" y="30" width="124" height="40"/><rect x="158" y="30" width="124" height="40"/><rect x="308" y="30" width="124" height="40"/><rect x="60" y="116" width="280" height="46"/><rect x="60" y="196" width="280" height="46"/><rect x="60" y="276" width="280" height="46"/><rect x="60" y="356" width="280" height="46"/><rect x="60" y="436" width="280" height="46"/></g><g fill="currentColor" font-size="12" text-anchor="middle"><text x="70" y="55">Loader + BTF</text><text x="220" y="55">Verifier</text><text x="370" y="55">JIT</text></g><g fill="currentColor" font-size="14" text-anchor="middle"><text x="200" y="144">Event: syscall, packet, probe</text><text x="200" y="224">Kernel hook</text><text x="200" y="304">eBPF program runs (native)</text><text x="200" y="384">Map or ring buffer</text><text x="200" y="464">User-space agent</text></g><g stroke="currentColor" stroke-width="1.5" fill="none" marker-end="url(#tc-ebpf-arrow)"><line x1="134" y1="50" x2="152" y2="50"/><line x1="284" y1="50" x2="302" y2="50"/><line x1="200" y1="162" x2="200" y2="192"/><line x1="200" y1="242" x2="200" y2="272"/><line x1="200" y1="322" x2="200" y2="352"/><line x1="200" y1="402" x2="200" y2="432"/></g><g stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="4 4" marker-end="url(#tc-ebpf-arrow)"><polyline points="370,72 370,299 346,299"/></g></svg>',
    },
    {
      type: "p",
      text: "This matters for capacity planning. You pay the verification cost at load, and again at agent restart. So a node that rolls its observability DaemonSet mid-incident can show a burst of CPU. That burst has nothing to do with event volume. Per-event cost, by contrast, is a function of where you attached, how often that hook fires, and what your program does when it runs.",
    },

    { type: "h2", id: "verifier", text: "What the verifier proves" },
    {
      type: "p",
      text: "The verifier is a static analyser. It walks the program down every path it can reach, and only then lets it load. The kernel's own description puts safety in two steps. First a control-flow check over the instruction graph. Then a run through it that tracks the type and value range of every register, at every instruction.",
    },
    {
      type: "p",
      text: "Here is what it holds you to:",
    },
    {
      type: "ul",
      items: [
        "**Memory safety.** Every load and store must be provably within a known region — the stack, a map value, or the program context. Pointer arithmetic is tracked, and a pointer that might be null must be checked before it is dereferenced.",
        "**Termination.** The program must be shown to finish. Until kernel 5.3 this meant no loops at all; the graph was checked to be acyclic.",
        "**Restricted calls.** Programs cannot call arbitrary kernel functions. They call a fixed set of helpers, and which helpers are available depends on the program type.",
        "**Reference discipline.** Resources that must be released — an acquired socket reference, for example — are tracked so a program cannot leak them.",
      ],
    },
    {
      type: "p",
      text: "Bounded loops arrived in 5.3. It is worth being exact here, because people usually get it wrong. The verifier does not unroll the loop. It walks each pass as an ordinary state, and it leans on state pruning. Reach a state it has already seen, and it stops going down that branch. So the ceiling is the complexity limit, not a count of iterations.",
    },
    {
      type: "p",
      text: "That limit moved in 5.2, from a hard 4,096-instruction program cap to one million instructions analysed for privileged loads. Kernel 5.17 added the `bpf_loop` helper. The loop runs inside the helper, under kernel control. It is not charged against the verifier's budget in the same way, so iteration counts can go much higher.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Verification is not proof of correctness",
      text: "The verifier establishes that a program cannot corrupt kernel memory and cannot run forever. It says nothing about whether the program computes the right answer. It says nothing about whether it is fast enough for the hook you chose. And it says nothing about whether the data means what you think. It is also ordinary kernel code that has had its own bugs. Treat it as a strong structural constraint, not as an assurance you can stop reviewing what you load.",
    },
    {
      type: "p",
      text: "If you write your own programs, expect the verifier to reject them. That is part of the work, not a sign of failure. Code that looks plainly safe to a person can still be turned down, because the analyser cannot narrow a value range. Reading verifier logs is its own skill. It is the main reason in-house eBPF costs more than teams expect.",
    },

    { type: "h2", id: "hooks", text: "Where programs attach" },
    {
      type: "p",
      text: "Program type and attach point are chosen together, and they determine both what context you can see and which helpers you may call. The families that matter in production are:",
    },
    {
      type: "ul",
      items: [
        "**Networking.** XDP runs at the driver, before an `sk_buff` is allocated, which is why it is used for high-rate drop and load-balancing. TC hooks run later in the stack and see richer metadata.",
        "**Tracing.** kprobes attach to kernel functions. Tracepoints attach to stable instrumentation points, and uprobes to user-space symbols. Prefer tracepoints. A kprobe on an internal function leans on an implementation detail, and that can move between kernels.",
        "**Security.** BPF LSM landed in 5.7 under the name KRSI. It attaches programs to Linux Security Module hooks, so decisions can be made where the kernel already asks whether an action is permitted.",
      ],
    },
    {
      type: "p",
      text: "BPF LSM in particular is gated on more than a version number. It needs `CONFIG_BPF_LSM`, it needs BTF, and it has to be enabled in the active LSM list at boot. A kernel new enough to support it is not the same as a kernel built to allow it. That gap shows up again and again once you leave a single distribution.",
    },

    { type: "h2", id: "btf-core", text: "Why a program breaks on the next kernel" },
    {
      type: "p",
      text: "A tracing program that reads a field out of `task_struct` is reading a specific byte offset. Kernel structures are internal and change between versions, so the same compiled program was historically wrong on any kernel but the one it was built against. The usual workaround was to compile on the target machine at deploy time, which means shipping kernel headers and a compiler to every node.",
    },
    {
      type: "p",
      text: "CO-RE, or compile once run everywhere, fixes that. The compiler notes which structure fields the program touches, and records them as relocations. At load time the loader reads the running kernel's own type information. It resolves each field to its real offset, then patches the bytecode before verification. One artefact, many kernels.",
    },
    {
      type: "p",
      text: "The type information is BTF, and this is where the most common deployment assumption goes wrong. BTF for the running kernel is produced by a build-time option, `CONFIG_DEBUG_INFO_BTF`. It is a choice each distribution makes when it builds its kernel package, not something the kernel switches on for itself at a particular version. A modern kernel built without it exposes no BTF and CO-RE has nothing to relocate against.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Check the fleet, not the version",
      text: "The question is not whether nodes run kernel 5.8 or later. It is whether /sys/kernel/btf/vmlinux exists on them. That file is present exactly when the running kernel carries BTF, and it is a one-line check to run across a fleet before committing to a CO-RE-based agent.",
    },

    { type: "h2", id: "maps", text: "Maps and the path back to user space" },
    {
      type: "p",
      text: "An eBPF program cannot return data by itself. It writes into maps — typed key-value structures shared with user space — and an agent reads them. Map type is a design decision with real consequences. Hash and array maps hold state and lookup tables. Per-CPU variants avoid contention. LRU variants suit the case where bounded memory matters more than completeness.",
    },
    {
      type: "p",
      text: "For streaming events, the ring buffer introduced in 5.8 replaced the older per-CPU perf buffer for most purposes. It provides a single shared buffer with ordering across CPUs and lower overhead per event.",
    },
    {
      type: "p",
      text: "Maps are also where the overhead conversation belongs. Calling eBPF low overhead, with nothing attached, is not useful. The cost depends on how often the hook fires and how much work each event does. It also depends on the number and type of map operations, and on whether events cross to user space. A program on a tracepoint that fires thousands of times per second per core, taking a lock-contended map update on each, is not cheap. The same program on a rarely-hit hook is close to free.",
    },

    { type: "h2", id: "capabilities", text: "What you have to grant it" },
    {
      type: "p",
      text: 'Before kernel 5.8, loading most eBPF programs meant holding `CAP_SYS_ADMIN`, which is root in all but name. Kernel 5.8 split it up. `CAP_BPF` now covers privileged BPF work, and `CAP_PERFMON` covers performance monitoring and tracing. The manual page is explicit that `CAP_BPF` was added "to separate out BPF functionality from the overloaded CAP_SYS_ADMIN capability".',
    },
    {
      type: "p",
      text: "Two details are easy to miss. First, `CAP_SYS_ADMIN` still allows the same BPF operations. The split added a narrower option. It did not take the broad one away, so granting it still hands over everything the finer capabilities would have. Second, network attach types also need `CAP_NET_ADMIN`. That is a networking grant in its own right, and it is not specific to BPF.",
    },
    {
      type: "table",
      caption: "Capabilities an eBPF agent typically needs",
      head: ["Capability", "Since", "What it covers", "When to grant"],
      rows: [
        [
          "CAP_BPF",
          "5.8",
          "Privileged bpf() operations: loading programs, creating and accessing maps",
          "Any agent that loads programs",
        ],
        [
          "CAP_PERFMON",
          "5.8",
          "perf_event_open and BPF operations with performance implications, including most tracing attachment",
          "Observability and tracing agents",
        ],
        [
          "CAP_NET_ADMIN",
          "Long-standing",
          "Network administration, required alongside CAP_BPF for XDP and TC attachment",
          "Networking data-plane agents only",
        ],
        [
          "CAP_SYS_ADMIN",
          "Long-standing",
          "Everything above, plus most of the rest of the kernel",
          "Avoid; it defeats the purpose of the 5.8 split",
        ],
      ],
    },
    {
      type: "p",
      text: "Falco is a good example, because its docs say this outright. Its modern eBPF probe is the default driver. It wants a kernel with BTF and ring buffer support. It runs with a set list of capabilities rather than full root. The old kernel module driver cannot run on capabilities alone.",
    },
    {
      type: "p",
      text: "The other half of the boundary is who gets to load programs at all. On current kernels, unprivileged eBPF is off by default. Two settings govern it: `CONFIG_BPF_UNPRIV_DEFAULT_OFF` and the `kernel.unprivileged_bpf_disabled` sysctl. The reason was speculative-execution side channels, which unprivileged program loading could reach. On nodes that never need to load eBPF, leaving it off is the cheapest control you have.",
    },

    {
      type: "h2",
      id: "kubernetes",
      text: "Kubernetes: what eBPF fixes, and what no longer needs it",
    },
    {
      type: "p",
      text: "The standard argument for eBPF in Kubernetes is service routing. It is a real problem, and it is documented upstream. kube-proxy's iptables mode installs rules per service. The kernel's cost to match a packet against them is O(n) in the number of services. Kubernetes' own write-up states that as services increase, \"both the average and the worst-case latency for the first packet of a new connection increases\".",
    },
    {
      type: "p",
      text: "What has changed is that eBPF is no longer the only answer. kube-proxy has an nftables mode. It swaps linear rule matching for a single verdict map, an O(1) lookup, and it went stable in Kubernetes 1.33. IPVS mode, the older hash-based option, has since been deprecated. iptables is still kube-proxy's default, for compatibility. So an upgrade alone will not give you the new behaviour. You have to select the mode.",
    },
    {
      type: "p",
      text: 'This reframes the decision. If the problem is service-routing latency at scale, you can now fix it by configuring kube-proxy. You do not have to take on an eBPF data plane and everything that comes with it. What is left for an eBPF CNI is the set of things nftables does not address. Identity-based network policy. Per-flow visibility. Transparent encryption, and folding several layers of the stack into one. Those are legitimate reasons. "iptables is slow" is no longer sufficient on its own.',
    },
    {
      type: "p",
      text: "It pays to read what a data plane says about its own limits. Cilium's kube-proxy replacement docs list real ones. SCTP support is limited. TCP Fast Open interacts poorly. There are known issues too, where NFS or SMB mounts to a service ClusterIP meet socket-level load balancing. None of that rules it out. It is the kind of detail that decides whether a move is quiet or noisy.",
    },
    {
      type: "p",
      text: "The enforcement model is a separate question from the data plane. The advice in [network segmentation under zero trust](/enterprise-networking/zero-trust-network-segmentation) applies here without change. Watch the flows you actually have, then write policy against them. eBPF makes the observation step cheaper; it does not make an unobserved policy safer to enforce.",
    },

    { type: "h2", id: "comparison", text: "How it compares with the older options" },
    {
      type: "table",
      caption: "The three ways to get kernel-level visibility",
      head: ["Dimension", "User-space agent", "eBPF program", "Kernel module"],
      rows: [
        [
          "Visibility",
          "Whatever the kernel already exports, plus sampling",
          "The hook's context directly, at the point the event occurs",
          "Unrestricted",
        ],
        [
          "Failure mode",
          "The agent crashes",
          "Load is rejected by the verifier, or the program is detached",
          "The machine panics",
        ],
        [
          "Cost profile",
          "Context switches and copying; grows with event volume",
          "Load-time verification, then per-event work at the hook",
          "Native, with no enforced bound",
        ],
        [
          "Portability",
          "High",
          "Good with CO-RE and BTF; poor without",
          "Rebuild per kernel; signing and tainting to manage",
        ],
        [
          "Privilege",
          "Often ordinary user or a narrow capability",
          "CAP_BPF and CAP_PERFMON, plus CAP_NET_ADMIN for network hooks",
          "Full kernel privilege by definition",
        ],
        [
          "Kernel coupling",
          "Minimal",
          "Version and config dependent: BTF, LSM enablement, helper availability",
          "Tight; internal APIs are not stable",
        ],
        [
          "Skills to operate",
          "Standard",
          "Verifier logs, map inspection, bpftool",
          "Kernel development and crash analysis",
        ],
      ],
    },
    {
      type: "p",
      text: "The column that decides most arguments is failure mode. What eBPF adds is not that it beats every alternative on speed. It is that the worst realistic outcome of a bad load is a rejected program, not a kernel panic.",
    },

    { type: "h2", id: "when-to-use", text: "Where it fits" },
    {
      type: "ul",
      items: [
        "Syscall, process and network data at a level sampling cannot reach. You see every execve, not whatever a one-second poll happened to catch.",
        "Runtime security monitoring, where you want to catch the event as the kernel handles it, not piece it back together later from logs.",
        "Network policy and load balancing that need identity or per-flow context, not just an address and a port.",
        "Fleets with kernels you control, where BTF availability can be stated as a fact rather than assumed.",
      ],
    },

    { type: "h2", id: "when-not-to-use", text: "Where it does not" },
    {
      type: "ul",
      items: [
        "Anything an exporter, a log or a metric already answers. If the app can answer the question itself, going down to the kernel costs you and buys nothing.",
        "Fleets with a meaningful tail of older or vendor-built kernels without BTF, unless someone owns the backport plan.",
        "Long-running or stateful work. Programs are short, event-scoped and bounded by design; they are not a place to put a daemon.",
        "Teams with no capacity to debug a verifier rejection or read a map with bpftool at three in the morning. This is a real staffing question, not a slight.",
      ],
    },

    { type: "h2", id: "adoption", text: "How to adopt it without writing any" },
    {
      type: "p",
      text: "For most teams the first move is to run an established eBPF tool, not to write programs. Cilium, Falco and Tetragon already track kernel changes, helper availability and verifier behaviour across versions. That tracking is the real cost, not the first version you write. Write your own when you need something nobody sells, and know that it ties you to the upkeep for good.",
    },
    {
      type: "p",
      text: "A sequence that avoids the common failures:",
    },
    {
      type: "ol",
      items: [
        "List the kernel versions you run, and check each node for /sys/kernel/btf/vmlinux. That tells you what is even possible, before you pick a tool.",
        "Check which capabilities the agent asks for. Turn down any manifest that wants CAP_SYS_ADMIN or privileged mode with no reason in writing.",
        "Roll out in observation mode first and leave it there long enough to see a full traffic cycle. Enforcement built on an incomplete picture of normal is how outages start.",
        "Measure the agent's own cost on a node like yours. Look at CPU at the hook, CPU at the user-space reader, and map memory. A published benchmark ran on someone else's workload.",
        "Turn off unprivileged BPF where you do not need it. Treat every program load as a privileged act, and audit it.",
      ],
    },

    { type: "h2", id: "bottom-line", text: "The bottom line" },
    {
      type: "p",
      text: "eBPF is the first mechanism that makes running your own code in the kernel a routine call rather than a fight. The verifier earns that, inside its remit. It checks memory safety and termination, and it does so before anything runs.",
    },
    {
      type: "p",
      text: "What it does not judge for you is the bigger question. Is kernel-level instrumentation the right answer here? Can your fleet's kernels carry it? And are the capabilities you are about to grant the narrow ones, or the broad one? Those decisions sit outside the sandbox, and they are where eBPF deployments actually succeed or fail.",
    },
  ],
  faq: [
    {
      question: "Does eBPF require a specific kernel version?",
      answer:
        "It depends on the feature. Bounded loops need 5.3, CAP_BPF and CAP_PERFMON need 5.8, BPF LSM needs 5.7, and the ring buffer needs 5.8. The more useful check is not the version but whether the kernel was built with BTF, since CO-RE-based tooling depends on it and it is a distribution build choice rather than a kernel default.",
    },
    {
      question: "Is eBPF low overhead?",
      answer:
        "Only in context. The cost tracks how often the hook fires and how much each event does. Map operations add to it, and so does sending every event to user space. Verification and JIT are one-off costs, paid at load. Measure it on your own workload.",
    },
    {
      question: "Can the eBPF verifier be bypassed?",
      answer:
        "The verifier is kernel code, and it has had flaws. Treat it as a strong control, not a promise. That is part of why unprivileged eBPF is off by default now, and why loading programs should be a privileged, audited act.",
    },
    {
      question: "Do we still need eBPF to escape iptables performance problems in Kubernetes?",
      answer:
        "Not for routing alone. kube-proxy now ships an nftables mode, and you have to turn it on. eBPF still wins where you need identity-based policy.",
    },
    {
      question: "Should we write our own eBPF programs?",
      answer:
        "Usually not at first. The lasting cost is tracking kernel and verifier changes, not the first version. Established projects absorb that for you. Write your own when no tool gives you what you need, and go in knowing it is a long-term commitment.",
    },
  ],
  sources: [
    {
      title: "BPF Documentation",
      publisher: "Linux kernel documentation",
      url: "https://docs.kernel.org/bpf/",
    },
    {
      title: "eBPF verifier",
      publisher: "Linux kernel documentation",
      url: "https://docs.kernel.org/bpf/verifier.html",
    },
    {
      title: "BPF Type Format (BTF)",
      publisher: "Linux kernel documentation",
      url: "https://docs.kernel.org/bpf/btf.html",
    },
    {
      title: "LSM BPF Programs",
      publisher: "Linux kernel documentation",
      url: "https://docs.kernel.org/bpf/prog_lsm.html",
    },
    {
      title: "capabilities(7)",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man7/capabilities.7.html",
    },
    {
      title: "Bounded loops in BPF for the 5.3 kernel",
      publisher: "LWN.net",
      url: "https://lwn.net/Articles/794934/",
    },
    {
      title: "NFTables mode for kube-proxy",
      publisher: "Kubernetes Blog",
      url: "https://kubernetes.io/blog/2025/02/28/nftables-kube-proxy/",
    },
    {
      title: "Kubernetes without kube-proxy",
      publisher: "Cilium documentation",
      url: "https://docs.cilium.io/en/stable/network/kubernetes/kubeproxy-free/",
    },
    {
      title: "Kernel event sources and drivers",
      publisher: "Falco documentation",
      url: "https://falco.org/docs/concepts/event-sources/kernel/",
    },
  ],
};
