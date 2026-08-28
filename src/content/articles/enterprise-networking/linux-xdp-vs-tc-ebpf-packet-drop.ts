import type { Article } from "../../types";

export const article: Article = {
  slug: "linux-xdp-vs-tc-ebpf-packet-drop",
  category: "enterprise-networking",
  contentType: "comparison",
  title: "The cheapest packet to drop is the one the kernel has not paid for yet",
  seoTitle: "Linux XDP vs TC: Dropping Packets Early with eBPF",
  metaDescription:
    "XDP runs in the driver before the kernel allocates a buffer. TC runs later with full kernel context. Where each hook sits, and why serious filters use both.",
  standfirst:
    "Under a flood, the cost is not bandwidth. It is what the kernel spends building a structure for every packet before anything gets to decide it was junk.",
  excerpt:
    "XDP buys speed by running before the socket buffer exists, and gives up context to get it. TC sees connection state and pays for it in allocation. Layered, they cover each other.",
  authorId: "rahul-velapure",
  publishedAt: "2026-05-18",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 4,
  primaryKeyword: "Linux XDP vs TC eBPF packet drop",
  secondaryKeywords: [
    "XDP native vs generic mode",
    "TC ingress qdisc eBPF",
    "DDoS mitigation eBPF",
    "sk_buff allocation",
    "eBPF verifier",
  ],
  tags: ["Linux", "eBPF", "Networking", "Security", "Performance"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "ebpf-production-observability-security-boundaries",
    "kubernetes-pod-networking-packet-flow",
  ],
  methodology:
    "Written from the Cilium BPF and XDP reference guide, the kernel AF_XDP documentation, and the xdp-project tutorial material, verified August 2026. Two corrections were made to the source draft. It listed four XDP return codes, omitting `XDP_ABORTED`, which is the one that shows up in a tracepoint when a program hits an error. And it said XDP only works on physical cards that support it; generic mode runs on virtual devices including veth, which is how most people first test an XDP program. The draft's amplification-attack incident and its traffic and CPU figures were removed. Two of its source URLs no longer resolve and were replaced.",
  body: [
    {
      type: "p",
      text: "A packet arriving on a Linux box is not free before you look at it. The card raises an interrupt. The kernel allocates a socket buffer to describe the packet. Only then does anything examine it.",
    },
    {
      type: "p",
      text: "Under a flood, that allocation is the attack. The traffic may be nonsense, but the kernel builds a structure for every piece of nonsense before any rule gets to reject it. Enough of them and the machine spends its cycles on bookkeeping for packets it is about to discard.",
    },
    {
      type: "p",
      text: "So the question is not what to drop. It is how early you can drop it. eBPF gives you two hooks at different depths, and they trade the same thing in opposite directions.",
    },
    { type: "h2", id: "xdp", text: "XDP runs before the buffer exists" },
    {
      type: "p",
      text: "XDP is the earliest hook there is. The program runs in the network driver, on the raw receive buffer, before the kernel has allocated a socket buffer for it.",
    },
    {
      type: "p",
      text: "That is where the speed comes from. A packet dropped at XDP costs almost nothing, because almost nothing has been spent on it. There is no structure to free and no stack to unwind.",
    },
    { type: "h3", id: "actions", text: "The five return codes" },
    {
      type: "table",
      caption: "What an XDP program can decide.",
      head: ["Action", "Effect"],
      rows: [
        ["`XDP_PASS`", "Continue into the kernel stack as normal"],
        ["`XDP_DROP`", "Discard immediately, nothing further happens"],
        ["`XDP_TX`", "Send it back out the interface it arrived on"],
        ["`XDP_REDIRECT`", "Send it to another interface, or to a user-space socket"],
        ["`XDP_ABORTED`", "Error case: dropped, and a tracepoint fires"],
      ],
    },
    {
      type: "p",
      text: "`XDP_ABORTED` is worth knowing even though you never return it deliberately. It signals a program error rather than a policy decision, and it raises a tracepoint you can watch. Silent packet loss with no matching drop counter is often a program hitting this path.",
    },
    { type: "h3", id: "modes", text: "Three modes, and only one of them is fast" },
    {
      type: "p",
      text: "Where the program actually runs depends on what the interface supports.",
    },
    {
      type: "ul",
      items: [
        "**Native.** The program runs in the driver, which is what XDP is for. It needs driver support, and most current server network drivers have it.",
        "**Offloaded.** The program is pushed onto the card itself. The host CPU does no work at all. Support is limited to specific hardware.",
        "**Generic.** A kernel fallback for drivers with no XDP support. It runs later, after the socket buffer has been allocated, which gives up the entire point.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Generic mode is for testing, and it is easy to run by accident",
      text: "Generic XDP works on virtual devices, including veth pairs — so a program you developed in containers or a VM probably ran in generic mode. It behaves correctly and it is not fast, because the allocation you were trying to avoid has already happened. Check which mode you attached in before you conclude anything about performance, and confirm the driver supports native mode on the machines that matter.",
    },
    { type: "h2", id: "tc", text: "TC runs later and knows more" },
    {
      type: "p",
      text: "Traffic control is the older subsystem, built for shaping and queueing. With eBPF it also became a filtering hook, at the ingress and egress queueing disciplines.",
    },
    {
      type: "p",
      text: "By the time a packet reaches it, the socket buffer exists. That is the cost, and it is also the feature.",
    },
    {
      type: "p",
      text: "An XDP program sees bytes. It can parse headers and match on addresses and ports, and that is roughly the limit. It has no easy access to what the kernel knows about the flow.",
    },
    {
      type: "p",
      text: "A TC program has the socket buffer and the metadata attached to it. It can act on connection tracking state, on the results of address translation, and on kernel context that only exists because the allocation happened. It also works on every kind of interface — bridges, tunnels, virtual devices — rather than depending on driver support.",
    },
    { type: "h2", id: "layering", text: "Serious filters use both" },
    {
      type: "p",
      text: "Framing this as a choice is the mistake. The two hooks answer different questions, and a real mitigation puts them in sequence.",
    },
    {
      type: "table",
      caption: "Which hook suits which decision.",
      head: ["", "XDP", "TC"],
      rows: [
        ["Runs", "In the driver, pre-allocation", "At the qdisc, post-allocation"],
        ["Cost per packet", "Very low", "Higher"],
        ["Sees", "Raw bytes", "Socket buffer and kernel state"],
        ["Connection tracking", "No", "Yes"],
        ["Works on", "Interfaces with driver support", "Any interface"],
        ["Good for", "Volumetric drops", "Stateful decisions"],
      ],
    },
    {
      type: "p",
      text: "XDP handles the obvious volume. Traffic to a port you do not serve, malformed packets, sources already on a block list — none of that needs context, and all of it is cheap to reject in the driver.",
    },
    {
      type: "p",
      text: "TC handles what needs to be understood before it can be judged. A flood of connection attempts that never complete looks like ordinary traffic packet by packet. Only the pattern across a flow is suspicious, and only TC can see the flow.",
    },
    {
      type: "p",
      text: "The two connect through a shared eBPF map. The TC program identifies a source worth blocking and writes it there. The XDP program reads that map on every packet. So a decision that required kernel state is enforced at the cheapest point in the stack, and subsequent packets from that source never reach TC at all.",
    },
    {
      type: "p",
      text: "That is the pattern worth taking away. Judge where the context is. Enforce where it is cheap.",
    },
    { type: "h2", id: "operating", text: "Living with it" },
    {
      type: "p",
      text: "The verifier is the reason this is deployable in production. Before a program loads, the kernel proves it terminates and stays inside its own memory. A program that cannot be proved safe does not load, and the interface carries on unchanged.",
    },
    {
      type: "p",
      text: "So the failure mode you plan for is not a kernel panic. It is a program that loads and does the wrong thing. `XDP_DROP` is silent by design, and a filter with an inverted condition drops the traffic you wanted while looking perfectly healthy.",
    },
    {
      type: "p",
      text: "Count what you drop. Keep a per-reason counter in a map and export it, so a rule that fires far more than expected is visible immediately. That has the same shape as any other eBPF deployment, and the wider operational and security trade-offs are covered in [eBPF observability and security boundaries](/devops/ebpf-production-observability-security-boundaries).",
    },
    {
      type: "p",
      text: "One scope note. Neither hook is a Layer 7 tool. Reassembling a stream and parsing HTTP inside an eBPF program is possible and painful, and it is not what these hooks are for. Filter addresses, ports and flow state here, and put application-level decisions in a proxy. Where this fits alongside the container network path is set out in [Kubernetes pod networking](/devops/kubernetes-pod-networking-packet-flow).",
    },
  ],
  faq: [
    {
      question: "When should I use XDP instead of TC?",
      answer:
        "When the decision needs no kernel state. Volumetric drops, closed ports, block lists. Anything needing connection state has to go to TC.",
    },
    {
      question: "Why is my XDP program slow?",
      answer:
        "It is probably in generic mode. That runs after the socket buffer is allocated, which is the cost XDP exists to avoid. Check the driver supports native mode.",
    },
    {
      question: "Does XDP work on virtual interfaces?",
      answer:
        "In generic mode, yes, including veth. Native mode needs driver support. That is why a program is fast on a server and slow in a container lab.",
    },
    {
      question: "What is XDP_ABORTED?",
      answer:
        "The error return. The packet is dropped and a tracepoint fires. Unexplained loss with no matching counter often means a program is taking this path.",
    },
    {
      question: "Can XDP filter HTTP?",
      answer:
        "Not usefully. You would have to reassemble the stream yourself. Filter addresses, ports and flow state in eBPF, and do Layer 7 in a proxy.",
    },
    {
      question: "Can a bad eBPF program crash the kernel?",
      answer:
        "The verifier checks it before loading and rejects anything it cannot prove safe. The real risk is a program that loads and drops the wrong traffic.",
    },
  ],
  sources: [
    {
      title: "BPF and XDP reference guide",
      publisher: "Cilium",
      url: "https://docs.cilium.io/en/latest/bpf/",
    },
    {
      title: "AF_XDP",
      publisher: "The Linux Kernel Documentation",
      url: "https://docs.kernel.org/networking/af_xdp.html",
    },
    {
      title: "XDP hands-on tutorial",
      publisher: "xdp-project",
      url: "https://github.com/xdp-project/xdp-tutorial",
    },
  ],
};
