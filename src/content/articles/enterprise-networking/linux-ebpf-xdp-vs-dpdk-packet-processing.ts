import type { Article } from "../../types";

export const article: Article = {
  slug: "linux-ebpf-xdp-vs-dpdk-packet-processing",
  category: "enterprise-networking",
  contentType: "comparison",
  title: "The real question is who owns the queue",
  seoTitle: "XDP vs DPDK: Datapath Ownership and Memory",
  metaDescription:
    "XDP and DPDK differ in who owns the NIC queues and who owns packet memory. How rte_mbuf and AF_XDP UMEM differ, and what each costs to run.",
  standfirst:
    "One of these hands the network card to a userspace process. The other leaves it with the kernel. Almost everything else follows from that.",
  excerpt:
    "A comparison of XDP and DPDK on the things that actually diverge: datapath ownership, packet memory semantics, and what each model costs operationally.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-28",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-08-28",
  readingMinutes: 6,
  primaryKeyword: "XDP vs DPDK packet processing",
  secondaryKeywords: [
    "AF_XDP UMEM",
    "rte_mbuf mempool",
    "kernel bypass networking",
    "zero-copy packet processing",
    "poll mode driver",
  ],
  tags: ["Linux", "Networking", "eBPF", "Performance", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "linux-xdp-vs-tc-ebpf-packet-drop",
    "tcp-congestion-control-bbr-vs-cubic-cloud-networks",
  ],
  draft: false,
  methodology:
    "Written from the Linux kernel AF_XDP documentation and the DPDK Programmer's Guide, verified August 2026. Two claims in the source draft were corrected against those documents and are noted in the article. No packet rates, latency figures, CPU utilisation or memory overhead numbers are quoted, because none were measured for this article and published figures describe specific hardware.",
  body: [
    {
      type: "p",
      text: "Most comparisons of XDP and DPDK open with throughput. That is the least useful place to start. The numbers come from hardware you do not have.",
    },
    {
      type: "p",
      text: "The durable difference is ownership. DPDK takes the network card away from the kernel and gives it to a userspace process. XDP leaves the card where it is and runs your code inside the driver.",
    },
    {
      type: "p",
      text: "Everything that follows â€” the tooling you keep, the memory model you inherit, the way a crash behaves â€” comes out of that one decision.",
    },
    { type: "h2", id: "ownership", text: "Who holds the NIC queues" },
    {
      type: "p",
      text: "DPDK unbinds the interface from its kernel driver and rebinds it to a userspace I/O driver, typically through vfio-pci. From that point the kernel has no network interface there. It has a PCI device that something else is driving.",
    },
    {
      type: "p",
      text: "A poll mode driver in your process then reads the receive rings directly. No interrupt, no softirq, no sk_buff. The application is the driver.",
    },
    {
      type: "p",
      text: "XDP inverts that. The interface stays bound to its normal kernel driver, and your eBPF program runs inside the driver's receive path. The kernel still owns the queues; you get to act early within them.",
    },
    {
      type: "p",
      text: "That early hook, and what a program may return from it, is covered in [dropping packets before the buffer exists](/enterprise-networking/linux-xdp-vs-tc-ebpf-packet-drop). Treat it as background here. The subject of this article is what the two ownership models do to memory and operations.",
    },
    { type: "h2", id: "consequence", text: "What ownership takes with it" },
    {
      type: "p",
      text: "When the kernel stops seeing an interface, it stops seeing everything attached to it. Routing tables, neighbour resolution, netfilter, tcpdump and the counters in iproute2 all lose their subject.",
    },
    {
      type: "p",
      text: "That is not a defect. It is the deal DPDK offers, and the reason it exists. But it means a DPDK deployment needs its own answer to problems the kernel was already solving, which is why projects in this space usually arrive with a userspace stack attached.",
    },
    {
      type: "p",
      text: "XDP keeps all of it. The same interface that runs your program still answers to standard tooling, still holds a routing table, and still terminates the control-plane traffic you did not want to handle yourself.",
    },
    { type: "h2", id: "mbuf", text: "DPDK memory: the mbuf and its pool" },
    {
      type: "p",
      text: "DPDK packets live in an rte_mbuf, drawn from a pre-allocated mempool. The documentation is specific about the shape of it.",
    },
    {
      type: "p",
      text: "The header is kept deliberately small â€” currently two 64-byte cache lines, with the most frequently used fields on the first. Packet data does not start at the beginning of the buffer. It starts RTE_PKTMBUF_HEADROOM bytes in, cache aligned, so protocol headers can be prepended without moving anything.",
    },
    {
      type: "p",
      text: "A packet too large for one buffer is not a special case. Buffers chain through a next field, which is how jumbo frames are carried.",
    },
    {
      type: "p",
      text: "The part that matters operationally is the return path. Freeing an mbuf means returning it to the mempool it came from, and for a chain, every buffer in it. Nothing collects these for you. An allocation path that forgets to free drains the pool, and the visible symptom is receive drops at the hardware ring rather than an error in your code.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "One number the source draft asserted, and I removed",
      text: "A common claim is that RTE_PKTMBUF_HEADROOM defaults to 128 bytes. The DPDK mbuf documentation defines the headroom as cache-aligned and configurable, but does not state a numeric default. Read the value from your own build rather than trusting the figure that circulates, because prepending headers is exactly where a wrong assumption bites.",
    },
    { type: "h2", id: "umem", text: "AF_XDP memory: UMEM and four rings" },
    {
      type: "p",
      text: "AF_XDP takes a different approach. Instead of a pool of individually allocated buffers, you register one region of virtual contiguous memory, divided into equal-sized frames. That region is the UMEM.",
    },
    {
      type: "p",
      text: "Frame size is constrained. The documentation states it can only be 2K or 4K at present. In aligned mode the kernel masks the low bits of the address, so a chunk size of 2K masks off the low eleven bits.",
    },
    {
      type: "p",
      text: "Ownership of frames moves across four single-producer, single-consumer rings, and it is worth being precise about which belongs to what, because the draft this article was built from was not.",
    },
    {
      type: "table",
      caption: "AF_XDP rings, and who they belong to",
      head: ["Ring", "Belongs to", "Transfers"],
      rows: [
        ["Fill", "The UMEM", "Empty frames from user space to the kernel, for receive"],
        ["Completion", "The UMEM", "Transmitted frames back from the kernel to user space"],
        ["RX", "The socket", "Received descriptors to user space"],
        ["TX", "The socket", "Outgoing descriptors to the kernel"],
      ],
    },
    {
      type: "p",
      text: "So the UMEM owns two rings and each socket owns two. Several sockets can share one UMEM, which is the point of separating them, and a description that lumps all four together as UMEM rings will mislead you when you come to share one.",
    },
    { type: "h2", id: "zerocopy", text: "Zero-copy is negotiated, not configured" },
    {
      type: "p",
      text: "Zero-copy on AF_XDP depends on the driver, and the bind call decides how strictly you want to hold that requirement.",
    },
    {
      type: "p",
      text: "Pass XDP_COPY and the kernel forces copy mode. Pass XDP_ZEROCOPY and it forces zero-copy or the bind fails. Pass neither and you get whatever the driver supports.",
    },
    {
      type: "p",
      text: "That failure behaviour is a feature. A silent fall back to copying is how a deployment quietly loses the property it was built for, and asking for zero-copy explicitly turns a performance regression into a startup error.",
    },
    {
      type: "p",
      text: "Where the driver has no XDP support at all, the generic path is used instead. That mode works on any device, and it copies data out to user space, which is the opposite of what you came for.",
    },
    {
      type: "p",
      text: "One more flag is worth knowing. XDP_USE_NEED_WAKEUP puts a need_wakeup field in the fill and TX rings. When it reads zero, no syscall is required, so the busy path can stay in user space.",
    },
    { type: "h2", id: "cpu", text: "How each one spends CPU" },
    {
      type: "p",
      text: "A poll mode driver polls. There is no interrupt to wait on, so the cores assigned to it stay busy whether or not packets are arriving. DPDK ships power-management helpers precisely because that idle cost is real.",
    },
    {
      type: "p",
      text: "XDP runs inside the kernel's normal NAPI loop, which is interrupt-driven and switches to polling under load. Idle cores stay idle without you arranging it.",
    },
    {
      type: "p",
      text: "Which of those you want is a scheduling question, not a performance one. Dedicated spinning gives you predictable latency and costs you the cores. NAPI gives the cores back and accepts more variance.",
    },
    { type: "h2", id: "failure", text: "What happens when it goes wrong" },
    {
      type: "p",
      text: "A DPDK process holds direct memory mappings to the device. A bad pointer takes the process down, and the interface it was driving stops with it until something restarts and re-initialises the hardware.",
    },
    {
      type: "p",
      text: "An XDP program has to pass the kernel verifier before it loads at all. Out-of-bounds access and unbounded loops are rejected up front, so the class of failure that ends a DPDK process is largely refused at load time here.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Editorial reading, offered as such",
      text: "The verifier is a real structural advantage and it is not a correctness guarantee. It proves memory safety and termination. It says nothing about whether your program does the right thing to the packet. Teams that adopt XDP for safety and then skip testing have swapped one risk for a quieter one.",
    },
    { type: "h2", id: "fit", text: "Where each one fits" },
    {
      type: "p",
      text: "DPDK earns its place where you intend to own the whole datapath. A purpose-built appliance, a userspace stack implementing its own forwarding, a platform where the kernel driver is not something you can change.",
    },
    {
      type: "p",
      text: "XDP and AF_XDP earn theirs where the host is still a Linux host. You want early filtering or fast user-space ingestion, and you also want the routing table, the security tooling and the container networking to keep working.",
    },
    {
      type: "p",
      text: "Neither answer follows from a throughput chart. It follows from whether you are prepared to rebuild what the kernel was doing for you.",
    },
    { type: "h2", id: "migration", text: "If you are designing or migrating" },
    {
      type: "ol",
      items: [
        "Check driver support first. Zero-copy AF_XDP and native XDP both depend on it, and the fallback paths work while quietly removing the benefit.",
        "Decide the frame size early. UMEM chunks are 2K or 4K, and that choice interacts with the packet sizes you expect.",
        "Bind with XDP_ZEROCOPY when you need it, so a driver that cannot do it fails loudly at startup.",
        "Write down which control-plane traffic still has to reach the host. On DPDK that is code you will be writing.",
        "Test the mbuf return path under load if you go the DPDK route. A pool that drains shows up as ring drops, not as a stack trace.",
      ],
    },
    {
      type: "p",
      text: "The honest summary is that this is an ownership decision with a performance consequence, rather than a performance decision with an ownership consequence. Teams that pick in that order tend to be happier with what they end up running.",
    },
  ],
  faq: [
    {
      question: "Does DPDK always beat XDP?",
      answer:
        "Not a question with one answer. They own different things, and published figures come from hardware that is not yours.",
    },
    {
      question: "Can I still use tcpdump with DPDK?",
      answer:
        "Not on a bound interface. The kernel no longer has one there, so its tooling has nothing to look at.",
    },
    {
      question: "How big can a UMEM frame be?",
      answer: "The docs say 2K or 4K at present. Pick with your expected packet sizes in mind.",
    },
    {
      question: "What if my driver cannot do zero-copy?",
      answer:
        "You get copy mode, or a generic path that copies to user space. Bind with XDP_ZEROCOPY to fail instead.",
    },
    {
      question: "Who frees an rte_mbuf?",
      answer:
        "You do. It goes back to its own mempool, and a chained packet returns every buffer in the chain.",
    },
    {
      question: "Does the verifier make XDP safe?",
      answer:
        "It proves memory safety and that the program ends. It does not prove the program is right.",
    },
  ],
  sources: [
    {
      title: "AF_XDP",
      publisher: "Linux Kernel",
      url: "https://docs.kernel.org/networking/af_xdp.html",
    },
    {
      title: "XDP (eXpress Data Path)",
      publisher: "Linux Kernel",
      url: "https://docs.kernel.org/networking/xdp-rx-metadata.html",
    },
    {
      title: "Mbuf Library",
      publisher: "DPDK",
      url: "https://doc.dpdk.org/guides/prog_guide/mbuf_lib.html",
    },
    {
      title: "DPDK Programmer's Guide",
      publisher: "DPDK",
      url: "https://doc.dpdk.org/guides/prog_guide/",
    },
    {
      title: "eBPF verifier",
      publisher: "Linux Kernel",
      url: "https://docs.kernel.org/bpf/verifier.html",
    },
  ],
};
