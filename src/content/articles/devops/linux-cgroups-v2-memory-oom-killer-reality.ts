import type { Article } from "../../types";

export const article: Article = {
  slug: "linux-cgroups-v2-memory-oom-killer-reality",
  category: "devops",
  contentType: "explainer",
  subcategory: "Containers",
  title: "OOMKilled is a kernel decision, and your memory limit is the number that triggered it",
  seoTitle: "cgroups v2: Memory Throttling and the OOM Killer",
  metaDescription:
    "What memory.max and memory.high actually do, why the cgroup limit counts more than your heap, and how Kubernetes decides which container the kernel kills first.",
  standfirst:
    "A memory limit is not a hint to your app. It is a line the kernel draws. And the kernel counts things your runtime never sees.",
  excerpt:
    "cgroups v2 added a throttling limit below the killing one, which gives a garbage collector a chance to react. Kubernetes still does not set it by default, and that gap explains a lot of exit code 137.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-03",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "Linux cgroups v2 memory OOM killer",
  secondaryKeywords: [
    "memory.high vs memory.max",
    "Kubernetes OOMKilled",
    "cgroup memory pressure PSI",
    "oom_score_adj Kubernetes",
    "container memory throttling",
  ],
  tags: ["Linux", "Kubernetes", "Containers", "Performance", "Troubleshooting"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "java-vs-go-garbage-collection-performance-tuning",
    "ebpf-production-observability-security-boundaries",
  ],
  methodology:
    "Written from the Linux kernel control group v2 documentation, the Kubernetes node-pressure eviction and resource management documentation, and KEP-2570 on Memory QoS, verified August 2026. Two corrections were made to the source draft. It gave -998 as the `oom_score_adj` for protected node components; the kubelet uses -997 for Guaranteed pods and for containers at system-node-critical priority, with a computed value for Burstable and 1000 for BestEffort. And it described `memory.high` as mapping loosely to the memory request; under Memory QoS it is derived from the limit using `memoryThrottlingFactor`, while the request drives `memory.min`. Memory QoS was still alpha as of Kubernetes v1.36, which the draft did not state.",
  body: [
    {
      type: "p",
      text: "Setting a memory limit on a pod does not configure your app. It writes a number into a cgroup file. The kernel then enforces it against a total your runtime has never seen.",
    },
    {
      type: "p",
      text: "That gap is where exit code 137 comes from. The process disappears with no error in its own logs, because nothing in the process failed. The kernel removed it.",
    },
    {
      type: "p",
      text: "cgroups v2 changed the mechanics enough that tuning habits carried over from v1 now produce surprises.",
    },
    { type: "h2", id: "what-counts", text: "The kernel counts more than your heap" },
    {
      type: "p",
      text: "A cgroup's memory usage is not the resident size of your heap. It includes anonymous memory, kernel structures charged to the group, and the page cache for files the group has touched.",
    },
    {
      type: "p",
      text: "The page cache part is the one that confuses people, and it usually is not a problem. Cache is reclaimable. When the group needs anonymous memory, the kernel evicts cache to make room. A container showing high usage that is mostly cache is behaving normally.",
    },
    {
      type: "p",
      text: "Anonymous memory is different. It cannot be dropped, only swapped, and swap is usually off. When anonymous demand fills the limit, there is nothing left to reclaim.",
    },
    { type: "h2", id: "two-limits", text: "memory.max kills; memory.high throttles" },
    {
      type: "p",
      text: "cgroups v2 gives you two limits, and the difference is the most useful thing in the subsystem.",
    },
    { type: "h3", id: "max", text: "memory.max is the hard boundary" },
    {
      type: "p",
      text: "This is the ceiling, and it is what a Kubernetes memory limit becomes. Reach it with nothing left to reclaim and the kernel invokes the OOM killer inside the group.",
    },
    {
      type: "p",
      text: "A process gets SIGKILL. It cannot catch that, cannot flush, cannot log. The runtime notices the exit and restarts the container, and the event surfaces as OOMKilled.",
    },
    { type: "h3", id: "high", text: "memory.high is the interesting one" },
    {
      type: "p",
      text: "Cross `memory.high` and nothing is killed. The kernel throttles the group instead. Allocating threads are made to perform reclaim themselves, so the application slows down and stays alive.",
    },
    {
      type: "p",
      text: "That gap between the two limits is what a garbage collector needs. Under v1 there was no intermediate state: a workload was fine, and then it was gone. With `memory.high` set below `memory.max`, the runtime feels back-pressure while it still has room to act. What it does with that warning is the subject of [Java and Go garbage collection tuning](/development/java-vs-go-garbage-collection-performance-tuning).",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Kubernetes does not set memory.high by default",
      text: "This is where the theory and most clusters part company. Upstream Kubernetes maps the memory limit to `memory.max` and leaves `memory.high` unset. Writing it is the Memory QoS feature, which derives `memory.high` from the limit using `memoryThrottlingFactor`, default 0.9, and takes `memory.min` from the request. It was still alpha as of v1.36 and behind a feature gate. So on a default cluster there is no throttling stage — you go from working to killed with nothing in between.",
    },
    {
      type: "p",
      text: "There is a trap in the throttling model as well. `memory.high` has no upper bound on how hard it throttles. A group parked above it can spend most of its time reclaiming, which looks like a hang rather than a slowdown. Throttling is a warning stage, not a stable operating point.",
    },
    { type: "h2", id: "hierarchy", text: "Limits are hierarchical, and the parent wins" },
    {
      type: "p",
      text: "cgroups v2 mounts every controller in one tree. A child can never exceed what its parent allows.",
    },
    {
      type: "p",
      text: "That matters on a Kubernetes node because pods are not at the root. They sit under a slice representing everything allocatable to pods, which excludes what the kubelet reserved for the system and for itself.",
    },
    {
      type: "p",
      text: "So a pod can be killed while comfortably inside its own limit, because pressure at the parent triggered reclaim across the subtree. If containers are dying and their individual usage looks fine, look up the tree before you look at the application.",
    },
    { type: "h2", id: "oom-choice", text: "How the kernel picks a victim" },
    {
      type: "p",
      text: "The OOM killer does not simply kill the largest process. It scores every candidate and kills the highest.",
    },
    {
      type: "p",
      text: "The score starts from the share of memory the process is using and is then adjusted by `oom_score_adj`, a per-process value from -1000 to 1000. Kubernetes uses that adjustment deliberately, and the values follow the QoS class.",
    },
    {
      type: "table",
      caption: "How the kubelet sets oom_score_adj.",
      head: ["Class", "Value", "Effect"],
      rows: [
        ["Guaranteed", "-997", "Strongly protected"],
        ["System-node-critical", "-997", "Same protection as Guaranteed"],
        ["Burstable", "Computed, 2 to 999", "Scales with the memory request"],
        ["BestEffort", "1000", "Killed first"],
      ],
    },
    {
      type: "p",
      text: "The Burstable value falls as the request rises, relative to the node's total memory. A pod that asked for a lot is protected roughly in proportion to what it asked for, which is a reasonable rule and a surprising one if you assumed usage decided it.",
    },
    {
      type: "p",
      text: "The intent is that a workload dies rather than the node. Killing the kubelet would take the node with it, so the components that keep the node reporting are placed well below anything the scheduler put there.",
    },
    { type: "h2", id: "jvm", text: "Why runtimes get this wrong" },
    {
      type: "p",
      text: "The most common OOMKilled cause is not a leak. It is a limit set as though it were the heap.",
    },
    {
      type: "p",
      text: "Give a container 2 GB and a JVM a 1.8 GB heap and only 200 MB is left for everything else. But a JVM also needs metaspace, thread stacks, code cache, direct byte buffers and the garbage collector's own structures. Under load those grow, the total crosses the limit, and the process is killed without ever raising an `OutOfMemoryError` — because the JVM never ran out of heap.",
    },
    {
      type: "p",
      text: "Modern JVMs read the cgroup limit and size the heap from it, which is what container support does. That helps, and it does not remove the arithmetic. You still have to leave room for the non-heap memory the runtime needs, and the same reasoning applies to any runtime with off-heap allocations.",
    },
    { type: "h2", id: "pressure", text: "Watch pressure, not just usage" },
    {
      type: "p",
      text: "Usage tells you how full the group is. It does not tell you what that is costing.",
    },
    {
      type: "p",
      text: "`memory.pressure` does. It reports pressure stall information: what proportion of time tasks in the group were stalled waiting on memory reclaim. A group at 95 percent of its limit with no stall is fine. A group at 70 percent with steady stall is already slow.",
    },
    {
      type: "p",
      text: "Polling that file catches sustained pressure and misses short spikes, which is often exactly the shape a latency problem takes. Attaching probes to the kernel's reclaim path measures the stalls directly instead — the trade-offs of running that in production are covered in [eBPF observability and security boundaries](/devops/ebpf-production-observability-security-boundaries).",
    },
    { type: "h2", id: "practice", text: "What to do about it" },
    {
      type: "ol",
      items: [
        "**Size the limit from total process memory.** Measure what the container actually uses, not what the heap reports.",
        "**Set the request honestly.** For Burstable pods it drives the protection score, so an understated request makes the pod an easier target.",
        "**Alert on memory pressure.** Stall time gives you warning. Usage gives you a post-mortem.",
        "**Check whether Memory QoS is on.** If it is not, there is no throttling stage, and the gap you left below the limit is doing nothing for you.",
        "**Look at the parent slice when the numbers do not add up.** A kill inside the container's own limit usually means pressure above it.",
      ],
    },
  ],
  faq: [
    {
      question: "What is the difference between memory.high and memory.max?",
      answer:
        "`memory.max` is the hard limit, and crossing it invokes the OOM killer. `memory.high` throttles instead: threads are made to reclaim, so the workload slows but survives.",
    },
    {
      question: "Does Kubernetes set memory.high?",
      answer:
        "Not by default. That is the Memory QoS feature, still alpha as of v1.36. Without it, a limit maps to `memory.max` and there is no throttling stage at all.",
    },
    {
      question: "Why is my container memory high when the heap is empty?",
      answer:
        "Page cache. The kernel charges cached file pages to the group that read them. It is reclaimable, so this is usually normal rather than a leak.",
    },
    {
      question: "Which container does the OOM killer choose?",
      answer:
        "The highest score. Kubernetes sets `oom_score_adj` by QoS class: -997 for Guaranteed, 1000 for BestEffort, and a computed value for Burstable.",
    },
    {
      question: "Why was my pod killed below its limit?",
      answer:
        "Look at the parent slice. Pods sit under a slice for all pod memory. Pressure up there can force reclaim on everything below it.",
    },
    {
      question: "Why is there no OutOfMemoryError in the logs?",
      answer:
        "There would not be. SIGKILL cannot be caught, and the heap was probably fine. What crossed the limit was total process memory, including off-heap.",
    },
    {
      question: "Should I enable swap on Kubernetes nodes?",
      answer:
        "cgroups v2 has `memory.swap.max`. Kubernetes can use swap, but it is off unless you turn it on. Swap makes both accounting and latency much harder to reason about.",
    },
  ],
  sources: [
    {
      title: "Control Group v2",
      publisher: "The Linux Kernel Documentation",
      url: "https://docs.kernel.org/admin-guide/cgroup-v2.html",
    },
    {
      title: "Node-pressure eviction",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/",
    },
    {
      title: "KEP-2570: Support Memory QoS with cgroups v2",
      publisher: "Kubernetes Enhancements",
      url: "https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/2570-memory-qos/README.md",
    },
    {
      title: "Resource management for pods and containers",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
    },
  ],
};
