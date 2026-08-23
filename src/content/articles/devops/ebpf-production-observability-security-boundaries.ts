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
    "The sandbox is real, but it is narrower than the marketing suggests — and most of the operational cost sits outside it.",
  excerpt:
    "eBPF moved kernel extension from loadable modules to verified bytecode. The safety argument is genuine, but it covers memory and termination rather than correctness, and the capability model needs reading closely.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-21",
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
  relatedSlugs: ["zero-trust-network-segmentation", "ingress-nginx-archived-migration"],
  draft: true,
  methodology:
    "Written from kernel documentation, the capabilities(7) manual page, LWN's contemporaneous coverage of the bounded-loop patch set, and the published documentation of Cilium, Falco and kube-proxy. Version numbers were taken from those sources rather than from secondary summaries. No benchmark figures are quoted here: the published ones measure specific workloads on specific kernels, and reproducing them was out of scope.",
  body: [
    {
      type: "p",
      text: "A kernel module that dereferences a null pointer takes the machine with it. That single property shaped Linux observability for two decades: anything that needed to see syscalls or packets from inside the kernel was either a module you were afraid to ship, or a user-space tool paying a context switch for every event it wanted to look at.",
    },
    {
      type: "p",
      text: "eBPF changed the terms of that trade. You still run your own code in kernel context, but the kernel refuses to load it until a static analyser has convinced itself the code cannot read out of bounds and cannot fail to terminate. That is a genuine change, and it is why Cilium, Falco and most modern tracing tools are built on it.",
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
      text: "The load path runs once. A user-space loader — usually libbpf — reads the bytecode, adjusts it for the running kernel, and calls the `bpf()` syscall. The verifier analyses the program, and if it passes, the kernel JIT-compiles it to native machine code and attaches it to a hook. The run path is what happens afterwards: an event hits the hook, the already-compiled native code runs, and it writes results into a map or a ring buffer for user space to collect.",
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
      text: "This matters for capacity planning. Verification cost is paid at load and at agent restart, which is why a node that rolls its observability DaemonSet during an incident can see a burst of CPU that has nothing to do with event volume. Per-event cost, by contrast, is a function of where you attached, how often that hook fires, and what your program does when it runs.",
    },

    { type: "h2", id: "verifier", text: "What the verifier proves" },
    {
      type: "p",
      text: "The verifier is a static analyser that simulates the program across all reachable paths before allowing it to load. The kernel's own description puts safety in two steps: a control-flow check over the instruction graph, then a simulation that tracks the type and value range of every register at every instruction.",
    },
    {
      type: "p",
      text: "Concretely, it enforces:",
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
      text: "Bounded loops arrived in 5.3, and the mechanism is worth stating precisely because it is usually described wrongly. The verifier does not unroll the loop. It simulates iterations as ordinary states and relies on state pruning: when it reaches a state equivalent to one already explored, it stops exploring that branch. The ceiling is the complexity limit rather than an iteration count.",
    },
    {
      type: "p",
      text: "That limit moved in 5.2, from a hard 4,096-instruction program cap to one million instructions analysed for privileged loads. Kernel 5.17 added the `bpf_loop` helper, where the loop runs inside the helper under kernel control and so is not charged against the verifier's budget in the same way, allowing far higher iteration counts.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Verification is not proof of correctness",
      text: "The verifier establishes that a program cannot corrupt kernel memory and cannot run forever. It says nothing about whether the program computes the right answer, whether it is fast enough for the hook you attached it to, or whether the data it collects means what you think. It is also ordinary kernel code that has had its own bugs. Treat it as a strong structural constraint, not as an assurance you can stop reviewing what you load.",
    },
    {
      type: "p",
      text: "The practical consequence for teams writing their own programs is that verifier rejection is a normal part of development, not an exception. A program that is obviously safe to a human can still be rejected because the analyser cannot narrow a value range. Reading verifier logs is a skill, and it is the main reason in-house eBPF costs more than teams expect.",
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
        "**Tracing.** kprobes attach to kernel functions, tracepoints to stable instrumentation points, and uprobes to user-space symbols. Tracepoints are the safer choice: kprobe attachment to an internal function is a dependency on an implementation detail that can move between kernels.",
        "**Security.** BPF LSM landed in 5.7 under the name KRSI. It attaches programs to Linux Security Module hooks, so decisions can be made where the kernel already asks whether an action is permitted.",
      ],
    },
    {
      type: "p",
      text: "BPF LSM in particular is gated on more than a version number. It needs `CONFIG_BPF_LSM`, it needs BTF, and it has to be enabled in the active LSM list at boot. A kernel new enough to support it is not the same as a kernel configured to allow it, and that distinction shows up repeatedly once you leave a single distribution.",
    },

    { type: "h2", id: "btf-core", text: "BTF, CO-RE and the portability problem" },
    {
      type: "p",
      text: "A tracing program that reads a field out of `task_struct` is reading a specific byte offset. Kernel structures are internal and change between versions, so the same compiled program was historically wrong on any kernel but the one it was built against. The usual workaround was to compile on the target machine at deploy time, which means shipping kernel headers and a compiler to every node.",
    },
    {
      type: "p",
      text: "CO-RE — compile once, run everywhere — removes that. The compiler records which structure fields the program accesses as relocations. At load time the loader reads the running kernel's own type information, resolves each field to its actual offset, and patches the bytecode before verification. One artefact, many kernels.",
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
      text: "An eBPF program cannot return data by itself. It writes into maps — typed key-value structures shared with user space — and an agent reads them. Map type is a design decision with real consequences: hash and array maps for state and lookup tables, per-CPU variants to avoid contention, and LRU variants where bounded memory matters more than completeness.",
    },
    {
      type: "p",
      text: "For streaming events, the ring buffer introduced in 5.8 replaced the older per-CPU perf buffer for most purposes. It provides a single shared buffer with ordering across CPUs and lower overhead per event.",
    },
    {
      type: "p",
      text: "Maps are also where the overhead conversation belongs. Describing eBPF as low overhead without qualification is not useful, because the cost depends on the hook's firing rate, the work done per event, the number and type of map operations, and whether events cross to user space. A program on a tracepoint that fires thousands of times per second per core, taking a lock-contended map update on each, is not cheap. The same program on a rarely-hit hook is close to free.",
    },

    { type: "h2", id: "capabilities", text: "The capability boundary" },
    {
      type: "p",
      text: 'Before kernel 5.8, loading most eBPF programs required `CAP_SYS_ADMIN`, which is effectively root. Kernel 5.8 split that: `CAP_BPF` covers privileged BPF operations, and `CAP_PERFMON` covers performance monitoring and tracing. The manual page is explicit that `CAP_BPF` was added "to separate out BPF functionality from the overloaded CAP_SYS_ADMIN capability".',
    },
    {
      type: "p",
      text: "Two details are easy to miss. First, `CAP_SYS_ADMIN` still permits the same BPF operations — the split created a narrower alternative, it did not remove the broad one, so granting it hands over everything the finer capabilities would have. Second, network attach types additionally need `CAP_NET_ADMIN`, which is a networking administration capability in its own right and not a BPF-specific grant.",
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
      text: "Falco is a useful reference point here, because its documentation states the position rather than leaving it to inference: its modern eBPF probe is the default driver, expects a kernel with BTF and ring buffer support, and runs with a defined capability set instead of full root — while its legacy kernel module driver cannot operate on capabilities alone.",
    },
    {
      type: "p",
      text: "The other half of the boundary is who may load programs at all. Unprivileged eBPF is disabled by default on current kernels, governed by `CONFIG_BPF_UNPRIV_DEFAULT_OFF` and the `kernel.unprivileged_bpf_disabled` sysctl. The motivation was speculative-execution side channels reachable through unprivileged program loading. On nodes that do not need to load eBPF at all, leaving it disabled is the cheapest control available.",
    },

    {
      type: "h2",
      id: "kubernetes",
      text: "Kubernetes: what eBPF fixes, and what no longer needs it",
    },
    {
      type: "p",
      text: "The standard argument for eBPF in Kubernetes is service routing. It is a real problem, and it is documented upstream: kube-proxy's iptables mode installs rules per service, and the kernel's cost to match a packet against them is O(n) in the number of services. Kubernetes' own write-up states that as services increase, \"both the average and the worst-case latency for the first packet of a new connection increases\".",
    },
    {
      type: "p",
      text: "What has changed is that eBPF is no longer the only answer. kube-proxy's nftables mode replaces linear rule matching with a single verdict map — an O(1) lookup — and graduated to stable in Kubernetes 1.33. IPVS mode, the earlier hash-based alternative, has since been deprecated. Note that iptables remains kube-proxy's default for compatibility, so a cluster does not get the newer behaviour by upgrading alone; the mode has to be selected.",
    },
    {
      type: "p",
      text: 'This reframes the decision. If the problem is service-routing latency at scale, that is now solvable by configuring kube-proxy, without adopting an eBPF data plane and its operational surface. The remaining arguments for an eBPF CNI are the ones nftables does not address: identity-based network policy, per-flow visibility, transparent encryption, and replacing several layers of the stack with one. Those are legitimate reasons. "iptables is slow" is no longer sufficient on its own.',
    },
    {
      type: "p",
      text: "It is also worth reading the limitations a data plane documents about itself. Cilium's kube-proxy replacement documentation lists constraints including limited SCTP support, poor interaction with TCP Fast Open, and known issues where NFS or SMB mounts to a service ClusterIP are used with socket-level load balancing. None of these disqualify it. They are the kind of detail that decides whether a migration is quiet or eventful.",
    },
    {
      type: "p",
      text: "The enforcement model is a separate question from the data plane, and the sequencing advice in [network segmentation under zero trust](/enterprise-networking/zero-trust-network-segmentation) applies unchanged here: observe the flows you actually have before you write policy against them. eBPF makes the observation step cheaper; it does not make an unobserved policy safer to enforce.",
    },

    { type: "h2", id: "comparison", text: "eBPF, user-space agents and kernel modules" },
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
      text: "The column that decides most arguments is failure mode. eBPF's contribution is not that it is faster than every alternative — it is that the worst realistic outcome of a bad load is a rejected program rather than a kernel panic.",
    },

    { type: "h2", id: "when-to-use", text: "Where it fits" },
    {
      type: "ul",
      items: [
        "Syscall, process and network telemetry at a fidelity that sampling cannot reach — every execve rather than whatever a one-second poll happened to catch.",
        "Runtime security monitoring, where the point is to see the event as the kernel handles it rather than to reconstruct it afterwards from logs.",
        "Network policy and load balancing that need identity or per-flow context, not only address and port.",
        "Fleets with kernels you control, where BTF availability can be stated as a fact rather than assumed.",
      ],
    },

    { type: "h2", id: "when-not-to-use", text: "Where it does not" },
    {
      type: "ul",
      items: [
        "Anything an existing exporter, log or metric already answers. Kernel-level instrumentation for a question the application could answer about itself is a cost with no matching benefit.",
        "Fleets with a meaningful tail of older or vendor-built kernels without BTF, unless someone owns the backport plan.",
        "Long-running or stateful work. Programs are short, event-scoped and bounded by design; they are not a place to put a daemon.",
        "Teams with no capacity to debug a verifier rejection or read a map with bpftool at three in the morning. This is a real staffing question, not a slight.",
      ],
    },

    { type: "h2", id: "adoption", text: "Adopting it without writing any" },
    {
      type: "p",
      text: "For most organisations the right first move is to run an established eBPF-based tool rather than to write programs. Cilium, Falco and Tetragon carry the cost of tracking kernel changes, helper availability and verifier behaviour across versions — which is the recurring cost, not the initial development. In-house programs are justified when you need instrumentation nobody sells, and they commit you to that maintenance indefinitely.",
    },
    {
      type: "p",
      text: "A sequence that avoids the common failures:",
    },
    {
      type: "ol",
      items: [
        "Inventory kernel versions and check for /sys/kernel/btf/vmlinux across the fleet. This determines what is possible before any tool is selected.",
        "Confirm the capability set the agent requires, and reject any deployment manifest that asks for CAP_SYS_ADMIN or privileged mode without a written reason.",
        "Roll out in observation mode first and leave it there long enough to see a full traffic cycle. Enforcement built on an incomplete picture of normal is how outages start.",
        "Measure the agent's own cost on a representative node — CPU at the hook and at the user-space reader, plus map memory — rather than trusting a published benchmark run on someone else's workload.",
        "Disable unprivileged BPF where it is not needed, and treat program load as a privileged action worth auditing.",
      ],
    },

    { type: "h2", id: "bottom-line", text: "The bottom line" },
    {
      type: "p",
      text: "eBPF is the first mechanism that makes running your own code in the kernel a routine operational decision rather than a risk to be argued about. The verifier earns that, within its remit: memory safety and termination, checked before anything runs.",
    },
    {
      type: "p",
      text: "The judgement it does not make for you is whether kernel-level instrumentation is the right answer to your question, whether your fleet's kernels can carry it, and whether the capabilities you are about to grant are the narrow ones or the broad one. Those decisions sit outside the sandbox, and they are where eBPF deployments actually succeed or fail.",
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
        "Only in context. Cost is a function of how often the hook fires, how much work the program does, how many map operations it performs, and whether every event is forwarded to user space. Verification and JIT compilation are separate, one-off costs paid at load rather than per event. Measure on your own workload; published figures describe someone else's.",
    },
    {
      question: "Can the eBPF verifier be bypassed?",
      answer:
        "The verifier is kernel code and has had vulnerabilities, so it should be treated as a strong structural control rather than a guarantee. This is part of why unprivileged eBPF is disabled by default on current kernels and why loading programs should be a privileged, audited action.",
    },
    {
      question: "Do we still need eBPF to escape iptables performance problems in Kubernetes?",
      answer:
        "Not for service routing alone. kube-proxy's nftables mode replaces linear rule matching with a single verdict map and became stable in Kubernetes 1.33, though iptables remains the default and the mode must be selected explicitly. eBPF data planes remain compelling for identity-based policy, per-flow visibility and stack consolidation.",
    },
    {
      question: "Should we write our own eBPF programs?",
      answer:
        "Usually not at first. The recurring cost is tracking kernel and verifier changes over time, not the initial implementation. Established projects absorb that. Custom programs make sense when you need instrumentation that no existing tool provides, and that choice should be made knowing it is a long-term maintenance commitment.",
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
