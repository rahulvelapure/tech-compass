import type { Article } from "../../types";

export const article: Article = {
  slug: "tcp-congestion-control-bbr-vs-cubic-cloud-networks",
  category: "enterprise-networking",
  contentType: "explainer",
  subcategory: "WAN",
  title: "A dropped packet is not proof the network is full",
  seoTitle: "TCP Congestion Control: BBR vs CUBIC on Cloud Networks",
  metaDescription:
    "CUBIC treats every loss as congestion and backs off. On long, slightly lossy paths that starves the link. How BBR models the path instead, and when not to use it.",
  standfirst:
    "The link is idle. Loss is tiny. Throughput is a fraction of what you pay for. Nothing is broken.",
  excerpt:
    "CUBIC infers congestion from loss. BBR measures bandwidth and round-trip time and paces to fit. On long-haul cloud paths the difference is large — and inside a data centre it can go the other way.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 6,
  primaryKeyword: "TCP BBR vs CUBIC performance",
  secondaryKeywords: [
    "Linux TCP congestion control",
    "bandwidth delay product",
    "fq qdisc pacing",
    "bufferbloat",
    "cross-region throughput",
  ],
  tags: ["Networking", "Linux", "Performance", "Cloud", "TCP"],
  reviewStatus: "research-based",
  relatedSlugs: ["bgp-in-the-cloud-why-it-matters", "cloud-egress-costs-architecture-problem"],
  methodology:
    "Written from the Linux kernel networking documentation, the published BBR design paper, and IETF congestion control material, verified August 2026. The source draft's cross-region replication incident and its throughput and lag figures were removed as unverifiable. Claims about which kernel releases contain later BBR versions were also removed: mainline availability has differed from the versions under development, and a specific number would age badly.",
  body: [
    {
      type: "p",
      text: "A transfer between two regions is running at a fraction of the link's capacity. The circuit is not congested. Loss is a fraction of a per cent.",
    },
    {
      type: "p",
      text: "Nothing is broken. The congestion control algorithm is doing precisely what it was designed to do, and the design predates networks like this one.",
    },
    {
      type: "p",
      text: "CUBIC infers congestion from packet loss. On a long path with a little background loss, that inference is wrong most of the time, and the cost is throughput you have already paid for.",
    },
    { type: "h2", id: "cubic", text: "How CUBIC reasons, and where it misreads" },
    {
      type: "p",
      text: "Congestion control governs the congestion window: how much unacknowledged data a sender may have in flight.",
    },
    {
      type: "p",
      text: "CUBIC grows that window until it sees loss. Loss is its congestion signal. On detecting it, CUBIC multiplies the window by a factor below one — a substantial cut — and then grows again along a cubic curve.",
    },
    {
      type: "p",
      text: "On a short link that works well. Buffers fill, packets drop, the sender backs off, and the loop is quick because feedback arrives in a millisecond or two.",
    },
    {
      type: "p",
      text: "Distance changes the economics. Round-trip time is the clock on recovery, and on an intercontinental path each round trip is a long time. The window is cut immediately and rebuilt slowly.",
    },
    {
      type: "p",
      text: "Now add loss that has nothing to do with congestion — a marginal optical link, a wireless hop, a device dropping under a microburst. CUBIC cannot tell that loss apart from a full queue. It cuts anyway, and on a long path it spends most of its time recovering rather than at full rate.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The bandwidth-delay product is why distance hurts",
      text: "To keep a path busy, a sender needs bandwidth multiplied by round-trip time in flight at once. On a fast, long path that is a large amount of data. A high-capacity intercontinental link needs a very large window before it is even close to full, so anything that repeatedly cuts the window keeps the pipe empty. Short links need small windows, which is why the same algorithm behaves so differently in the two cases.",
    },
    { type: "h2", id: "bbr", text: "BBR models the path instead of guessing" },
    {
      type: "p",
      text: "BBR takes a different position: loss is not the signal. It builds a model of the path from two measurements it keeps taking.",
    },
    {
      type: "p",
      text: "**Bottleneck bandwidth** is the highest delivery rate it has recently observed. **Round-trip propagation time** is the lowest round-trip time it has recently seen — the path with no queue in it.",
    },
    {
      type: "p",
      text: "Multiply those and you have the amount of data that fills the path exactly. BBR aims to keep roughly that much in flight, and no more.",
    },
    {
      type: "p",
      text: "That target is the interesting part. Sending more does not increase throughput, because the bottleneck is already saturated. The excess just sits in a queue somewhere, adding delay. That is bufferbloat, and BBR is built to avoid creating it rather than to react after it appears.",
    },
    {
      type: "p",
      text: "Keeping the model current requires probing. BBR periodically sends slightly faster to check whether more bandwidth is available. It also periodically sends much less, to drain queues and get an honest reading of the minimum round-trip time.",
    },
    {
      type: "p",
      text: "Because loss is not its signal, background loss does not make it retreat. It keeps the pipe full while CUBIC would be halfway through another recovery.",
    },
    { type: "h2", id: "pacing", text: "Pacing is not optional" },
    {
      type: "p",
      text: "This is the step most deployments miss, and missing it makes things worse rather than better.",
    },
    {
      type: "p",
      text: "BBR does not just choose how much to send. It chooses when, spacing packets evenly at the modelled rate. Sending the same volume as a burst puts the queue back that the algorithm exists to avoid.",
    },
    {
      type: "p",
      text: "On Linux that pacing comes from the queueing discipline. Enable BBR without a queueing discipline that paces and you get bursts at a rate chosen on the assumption they would be paced.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "# Congestion control and a pacing qdisc, together\nsysctl -w net.ipv4.tcp_congestion_control=bbr\nsysctl -w net.core.default_qdisc=fq\n\n# Persist\nprintf 'net.ipv4.tcp_congestion_control=bbr\\nnet.core.default_qdisc=fq\\n' \\\n  > /etc/sysctl.d/99-bbr.conf",
    },
    {
      type: "p",
      text: "The default queueing discipline applies to interfaces brought up afterwards, so check existing interfaces rather than assuming the sysctl was retroactive. Confirm per connection with `ss -ti`, which reports the algorithm in use alongside the current window and round-trip time.",
    },
    { type: "h2", id: "when-not", text: "Where BBR is the wrong choice" },
    {
      type: "p",
      text: "BBR is not a strictly better algorithm, and treating it as a global default is a mistake.",
    },
    {
      type: "p",
      text: "**Inside a data centre**, paths are short and nearly lossless. CUBIC's assumption — that loss means congestion — is largely true there, and its feedback loop is fast because the round trip is short. BBR's probing adds variation for no gain. Where the fabric supports it, algorithms built for that environment do better than either.",
    },
    {
      type: "p",
      text: "**Sharing a bottleneck with loss-based flows** is the subtler issue. An algorithm that does not back off on loss and one that does are not competing on equal terms. Early BBR could take more than its share against CUBIC on a shared link. Later revisions address fairness, but if your traffic shares a constrained link with other tenants, this is worth testing rather than assuming.",
    },
    {
      type: "p",
      text: "**Middleboxes** can react badly. Equipment that expects loss-based behaviour may see paced sending and steady windows as anomalous and throttle or reset the connection.",
    },
    {
      type: "table",
      caption: "Where each one belongs",
      head: ["Path", "Preference", "Reason"],
      rows: [
        ["Cross-region, long RTT", "BBR", "Recovery is slow; background loss is not congestion"],
        ["Public internet, mobile clients", "BBR", "Loss is common and mostly not congestion"],
        ["Within one availability zone", "CUBIC", "Short RTT, minimal loss, fast feedback"],
        [
          "Shared constrained link",
          "Test",
          "Fairness against loss-based flows is workload-specific",
        ],
        ["Through strict inspection devices", "Test", "Paced sending can be treated as anomalous"],
      ],
    },
    { type: "h2", id: "practice", text: "Applying it without guessing" },
    {
      type: "p",
      text: "Congestion control is chosen by the sender, per host, and it only affects data that host sends. That makes it easy to scope, and easy to test.",
    },
    {
      type: "ol",
      items: [
        "**Find the long paths.** Cross-region replication, backup egress, origin fetches, large uploads from remote users.",
        "**Measure first.** Record achieved throughput, round-trip time and retransmissions on the sender before changing anything.",
        "**Change the sender only, and pair it with pacing.** Both settings or neither.",
        "**Verify it took effect.** `ss -ti` on a live connection, not just the sysctl value.",
        "**Compare like for like.** Same transfer, same time of day. Throughput varies enough that a single run proves little.",
        "**Leave short-path hosts alone.** Nothing here suggests changing the default inside a zone.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Rule out the boring causes first",
      text: "Congestion control is a satisfying explanation, which makes it a tempting one. Check three duller things first. Are socket buffers big enough to hold a full path's worth of data? Is the application itself the bottleneck? Is a firewall or shaper capping the flow? A window limited by buffer size looks the same on a throughput graph, and no algorithm fixes it.",
    },
    {
      type: "p",
      text: "One thing worth knowing about the wider picture: transports built on UDP, including the one underneath HTTP/3, implement congestion control in user space rather than the kernel. Changing a kernel sysctl does not affect them, and their behaviour is set by the library the application uses.",
    },
    {
      type: "p",
      text: "The reason any of this shows up as a cost rather than just a performance number is that long-haul traffic is usually paid traffic. Throughput on those links interacts directly with the architecture decisions in [cloud egress costs](/cloud/cloud-egress-costs-architecture-problem).",
    },
  ],
  faq: [
    {
      question: "Why is my cross-region transfer slow with no congestion?",
      answer:
        "CUBIC treats any loss as congestion and cuts its window. On a long path, rebuilding that window takes many round trips, so the link sits half empty.",
    },
    {
      question: "Do I have to enable a pacing qdisc?",
      answer:
        "Yes. BBR chooses a rate on the assumption packets are spaced out. Without pacing you get bursts at that rate, which is worse than leaving it alone.",
    },
    {
      question: "Should BBR be my default everywhere?",
      answer:
        "No. Inside a zone, paths are short and nearly lossless, which is where CUBIC's assumption actually holds. Use BBR for long or lossy paths.",
    },
    {
      question: "Does BBR affect traffic I receive?",
      answer:
        "No. The sender picks the algorithm, so changing it on your host affects what that host sends. Inbound behaviour is the other end's choice.",
    },
    {
      question: "Is it fair to other flows?",
      answer:
        "It does not back off on loss, so it competes differently from CUBIC. Later revisions improve this, but test before running it on a shared constrained link.",
    },
    {
      question: "Does this help HTTP/3?",
      answer:
        "Not through the kernel. QUIC does this work in user space, so the behaviour comes from the library, not a sysctl.",
    },
  ],
  sources: [
    {
      title: "BBR: congestion-based congestion control",
      publisher: "ACM Queue",
      url: "https://queue.acm.org/detail.cfm?id=3022184",
    },
    {
      title: "Linux networking: TCP",
      publisher: "Linux Kernel Documentation",
      url: "https://www.kernel.org/doc/html/latest/networking/tcp.html",
    },
    {
      title: "tcp(7) — TCP protocol and socket options",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man7/tcp.7.html",
    },
    {
      title: "RFC 8312: CUBIC for fast and long-distance networks",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/rfc8312/",
    },
    {
      title: "RFC 5681: TCP congestion control",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/rfc5681/",
    },
  ],
};
