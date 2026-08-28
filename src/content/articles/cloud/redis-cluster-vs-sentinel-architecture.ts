import type { Article } from "../../types";

export const article: Article = {
  slug: "redis-cluster-vs-sentinel-architecture",
  category: "cloud",
  contentType: "comparison",
  title: "Sentinel keeps one dataset alive; Cluster splits it up. Those are different problems",
  seoTitle: "Redis Cluster vs Sentinel: Sharding and Split-Brain",
  metaDescription:
    "Sentinel gives a single Redis dataset failover. Cluster shards across nodes. How hash slots, the gossip bus and node timeout decide what happens during a partition.",
  standfirst:
    "Sentinel answers a question about uptime. Cluster answers one about size. Reach for the wrong one and you get a failover loop instead of a fix.",
  excerpt:
    "Neither design gives you strong consistency. Redis replicates asynchronously and resolves conflicts by last failover wins, so the real question is how large a window of lost writes you can absorb.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-10",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "Redis Cluster vs Sentinel architecture",
  secondaryKeywords: [
    "Redis hash slots",
    "Redis gossip protocol",
    "Redis split-brain",
    "cluster-node-timeout",
    "Redis Sentinel quorum",
  ],
  tags: ["Redis", "Databases", "Architecture", "Resilience", "Caching"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "database-connection-failover-mechanics-timeouts",
    "kubernetes-statefulset-vs-deployment-storage-identity",
  ],
  methodology:
    "Written from the Redis cluster specification, the Redis Sentinel documentation and the Redis licensing pages, verified August 2026. One correction was made to the source draft. It named `cluster-require-full-coverage` as the mitigation for split-brain write loss; that setting governs behaviour when a hash slot is uncovered, and the mechanism that actually bounds the loss is `cluster-node-timeout` — a master isolated from the majority refuses writes once that timeout elapses. The draft's holiday-sale outage was replaced with the capacity argument itself. Redis licensing history was added, because the article's commercial-tier section is no longer accurate without it.",
  body: [
    {
      type: "p",
      text: "Redis executes commands on one thread. Newer versions use extra threads for network I/O, but the command loop itself stays single-threaded, which is where its speed and its ceiling both come from.",
    },
    {
      type: "p",
      text: "That ceiling forces a choice as soon as one node is not enough. The two answers are Sentinel and Cluster, and they are not alternatives. They solve different problems.",
    },
    {
      type: "p",
      text: "Sentinel keeps one dataset alive. Cluster splits a dataset across nodes. Pick the wrong one and it will not degrade gently.",
    },
    { type: "h2", id: "sentinel", text: "Sentinel: one dataset, kept available" },
    {
      type: "p",
      text: "Sentinel watches over plain, standalone Redis nodes. It shards nothing. Every node holds the same data.",
    },
    {
      type: "p",
      text: "You run one primary and one or more replicas. Alongside them you run an odd number of Sentinel processes. Three or five is normal, on separate hosts.",
    },
    { type: "h3", id: "detection", text: "SDOWN, then ODOWN" },
    {
      type: "p",
      text: "Each Sentinel pings the primary. When one stops getting replies, it marks the primary subjectively down. That is a local opinion and it triggers nothing.",
    },
    {
      type: "p",
      text: "That Sentinel then asks the others. Once enough of them agree, the primary is marked objectively down. Only then can a failover begin.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Quorum and majority are two different numbers",
      text: "The quorum is how many Sentinels must agree the primary is down. Starting the failover needs a majority of the whole Sentinel set. That is a second, separate check. So a quorum of 2 in a set of three does not always let two survivors act. Size the set for the failure you expect, not for the number in the config file.",
    },
    {
      type: "p",
      text: "After that, the Sentinels pick a leader among themselves. The leader chooses a replica by priority, offset and run ID. It promotes that one, then points the rest at it.",
    },
    {
      type: "p",
      text: "Clients still have to learn the new address. They either ask the Sentinels, or something updates service discovery for them. A client that cached an IP keeps failing long after the failover worked. That shape of problem is covered in [database connection failover mechanics](/cloud/database-connection-failover-mechanics-timeouts).",
    },
    { type: "h3", id: "sentinel-limit", text: "What Sentinel cannot do" },
    {
      type: "p",
      text: "Sentinel does nothing about capacity. A 50 GB dataset needs 50 GB on the primary and 50 GB on every replica.",
    },
    {
      type: "p",
      text: "It does nothing about write throughput either. Replicas do not take writes, so adding them raises read capacity and leaves the write path exactly where it was: one core, on one node. If you are out of memory or out of write headroom, failover is not the answer, and a promoted replica inherits the same problem.",
    },
    { type: "h2", id: "cluster", text: "Cluster: the dataset split into 16,384 pieces" },
    {
      type: "p",
      text: "Cluster spreads data over several primaries. It scales memory and writes together. It handles failover too.",
    },
    {
      type: "p",
      text: "It does not use a consistent hash ring. It uses a fixed set of 16,384 hash slots. The client takes the CRC16 of the key, takes that modulo 16384, and gets a slot number.",
    },
    {
      type: "p",
      text: "Each primary owns a contiguous range of slots. Three primaries might split them roughly into thirds. The number is fixed at 16,384 because the slot bitmap has to fit inside a heartbeat message, which caps the cluster at 16,384 primaries and keeps gossip cheap.",
    },
    { type: "h3", id: "redirection", text: "The client does the routing" },
    {
      type: "p",
      text: "Send a command to the wrong node and it does not forward it. It replies with `MOVED`, naming the slot and the node that owns it.",
    },
    {
      type: "p",
      text: "The client is expected to update its own slot map and retry against the right node. That is why an ordinary Redis client fails against a cluster: it treats `MOVED` as an error rather than as routing information. During a live resharding you also see `ASK`, which redirects one command without changing the map.",
    },
    { type: "h3", id: "gossip", text: "The cluster bus is a second port" },
    {
      type: "p",
      text: "Nodes gossip over a dedicated bus port, which is the client port plus 10,000. Port 6379 means bus port 16379.",
    },
    {
      type: "p",
      text: "That port is the one firewall rules forget. Block it and nodes cannot detect failures or agree on slot ownership. The cluster does not fail loudly; it stalls, and client requests hang.",
    },
    { type: "h2", id: "partition", text: "What a network partition actually costs you" },
    {
      type: "p",
      text: "Redis Cluster replicates asynchronously and resolves conflicts by last failover wins. It is not strongly consistent, and it does not claim to be. Acknowledged writes can be lost.",
    },
    {
      type: "p",
      text: "Take three primaries in three zones, each with a replica. Now cut one zone off. That primary cannot reach the others. The rest hold a majority, agree it has failed, and promote its replica.",
    },
    {
      type: "p",
      text: "For a while, both sides have a primary for the same slots. Writes from clients trapped alongside the isolated node are accepted, and they are gone the moment the partition heals.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The bound is cluster-node-timeout, not full coverage",
      text: "A master that cannot reach the majority starts refusing writes once `cluster-node-timeout` has elapsed. That is what limits the loss: writes accepted in the minority up to that point may be lost, and after it there are none to lose. `cluster-require-full-coverage` is a different control — it decides whether the cluster serves requests when a hash slot has no owner at all. Tuning it does not shrink the split-brain window.",
    },
    {
      type: "p",
      text: "So the timeout is a real trade-off rather than a default to leave alone. Shorten it and the minority stops writing sooner, at the cost of failing over on brief network noise. Lengthen it and you ride out flapping links while widening the window of writes you can lose.",
    },
    {
      type: "p",
      text: "None of this makes Redis a bad choice. It makes it a poor system of record. Sessions, caches and rate limiters absorb a lost write. Ledgers do not.",
    },
    { type: "h2", id: "choosing", text: "Choosing between them" },
    {
      type: "table",
      caption: "Where each design fits.",
      head: ["", "Sentinel", "Cluster"],
      rows: [
        ["Solves", "Failover for one dataset", "Sharding plus failover"],
        ["Dataset size", "Must fit one node", "Split across primaries"],
        ["Write throughput", "One core, one primary", "Scales with primaries"],
        ["Client requirement", "Ordinary client plus discovery", "Cluster-aware client"],
        ["Multi-key commands", "Work normally", "Same slot only"],
        ["Operational weight", "Lower", "Higher"],
      ],
    },
    {
      type: "p",
      text: "The multi-key row catches people during migration. `MGET` across two keys in different slots returns `CROSSSLOT` and fails. Hash tags are the fix: braces around a shared substring make the hash use only that part, so `{user:123}:cart` and `{user:123}:profile` land together. That has to be designed into the key scheme, and retrofitting it means rewriting call sites.",
    },
    {
      type: "h2",
      id: "commercial",
      text: "Active-active, and the licensing question underneath it",
    },
    {
      type: "p",
      text: "Open-source Redis has no good answer when two clusters take writes in two regions. Redis Enterprise does. It uses conflict-free replicated data types. They merge updates by rule, rather than picking a winner.",
    },
    {
      type: "p",
      text: "That is a commercial product, and the licensing around it moved twice. Redis left the BSD licence in March 2024 for RSALv2 and SSPLv1. That prompted a fork: Valkey, under the Linux Foundation, BSD-licensed, and now the default in several Linux distributions. Redis 8 then added AGPLv3 alongside the other two in 2025, making Redis open source again by OSI's definition.",
    },
    {
      type: "p",
      text: "For most teams none of this changes the code. It changes buying, packaging, and where your patches go. Check which one you are running before you plan around a feature.",
    },
  ],
  faq: [
    {
      question: "Is Redis Cluster strongly consistent?",
      answer:
        "No. Replication runs async, and conflicts end in last failover wins. Writes you were told had landed can still be lost. Use it as a cache, not a ledger.",
    },
    {
      question: "What bounds write loss during a partition?",
      answer:
        "`cluster-node-timeout`. A master cut off from the majority refuses writes once it elapses. Writes taken before that point may be lost; after it, none are taken.",
    },
    {
      question: "What does cluster-require-full-coverage do?",
      answer:
        "It decides whether the cluster serves requests when a hash slot has no owner. Left at yes, the cluster stops. It does not affect the split-brain window.",
    },
    {
      question: "Do multi-key commands work in Cluster?",
      answer:
        "Only when every key maps to one slot. Otherwise you get `CROSSSLOT`. Use hash tags, such as `{user:123}:cart`, to force related keys together.",
    },
    {
      question: "Why does my cluster client hang?",
      answer:
        "Check the bus port, which is the client port plus 10,000. If nodes cannot gossip, they cannot agree on slot ownership, and requests stall rather than fail.",
    },
    {
      question: "Should I use Cluster just for caching?",
      answer:
        "Only if the cache is too big for one node. If you simply want failover, Sentinel is far less to operate and much easier to debug.",
    },
    {
      question: "Is Redis open source again?",
      answer:
        "Redis 8 added AGPLv3 alongside RSALv2 and SSPLv1. Valkey is the BSD-licensed fork of Redis 7.2 and ships in many distributions.",
    },
  ],
  sources: [
    {
      title: "Redis cluster specification",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/",
    },
    {
      title: "Scale with Redis Cluster",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/",
    },
    {
      title: "High availability with Redis Sentinel",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/",
    },
    {
      title: "Redis licences",
      publisher: "Redis",
      url: "https://redis.io/legal/licenses/",
    },
  ],
};
