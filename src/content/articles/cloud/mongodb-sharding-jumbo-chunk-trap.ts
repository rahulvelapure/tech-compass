import type { Article } from "../../types";

export const article: Article = {
  slug: "mongodb-sharding-jumbo-chunk-trap",
  category: "cloud",
  contentType: "explainer",
  title: "A shard key you cannot split is a shard you cannot rebalance",
  seoTitle: "MongoDB Sharding: Shard Keys and Jumbo Chunks",
  metaDescription:
    "How MongoDB routes queries, why monotonic keys create a write hotspot, and what a jumbo chunk actually is now that auto-splitting has changed.",
  standfirst:
    "Sharding does not hide itself from your queries. The shard key decides which shard answers, which one absorbs the writes, and whether the balancer can help you later.",
  excerpt:
    "The jumbo chunk is a cardinality problem wearing a storage costume. Modern MongoDB can also change a shard key in place, which makes the trap survivable in a way it used to not be.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-17",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 4,
  primaryKeyword: "MongoDB sharding jumbo chunk trap",
  secondaryKeywords: [
    "MongoDB shard key selection",
    "MongoDB balancer",
    "monotonic shard key hotspot",
    "scatter-gather query MongoDB",
    "reshardCollection",
  ],
  tags: ["MongoDB", "Databases", "Architecture", "Performance", "Cloud"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "redis-cluster-vs-sentinel-architecture",
    "kubernetes-statefulset-vs-deployment-storage-identity",
  ],
  methodology:
    "Written from the MongoDB manual on data partitioning with chunks, choosing a shard key, the sharded cluster balancer, refining a shard key and resharding a collection, verified August 2026. Three corrections were made to the source draft. It gave the default chunk size as 64 MB; it has been 128 MB since MongoDB 6.0. It dated `reshardCollection` to 4.2, and separately dated `refineCollectionShardKey` to 5.0 — the correct versions are 5.0 and 4.4 respectively. And it described continuous auto-splitting, which changed in 6.0: chunks are now split only when a migration requires it. The draft's IoT firmware incident was rewritten as the mechanism.",
  body: [
    {
      type: "p",
      text: "A replica set scales by getting bigger. More RAM, faster disks, more cores. That works until the working set stops fitting in memory, and then it stops working quite suddenly.",
    },
    {
      type: "p",
      text: "Sharding spreads the collection over several replica sets. Storage and write capacity both grow. What it does not do is stay invisible.",
    },
    {
      type: "p",
      text: "One field decides which shard answers a query, which shard takes the writes, and whether the cluster can rebalance itself later. Choose it badly and none of those recover on their own.",
    },
    { type: "h2", id: "chunks", text: "Chunks, routers and config servers" },
    {
      type: "p",
      text: "MongoDB does not distribute documents one at a time. It groups them into contiguous ranges of shard key values called chunks, and assigns each chunk to a shard.",
    },
    {
      type: "p",
      text: "The default chunk size is 128 MB. It was 64 MB before MongoDB 6.0, and older tuning advice still assumes the smaller number.",
    },
    {
      type: "p",
      text: "Config servers hold the map from chunk to shard. The `mongos` routers read that map. When a query arrives, the router works out which shards can hold matching documents and sends it only there.",
    },
    {
      type: "p",
      text: "That last step is the whole point, and it only works if the query contains the shard key.",
    },
    { type: "h2", id: "shard-key", text: "The shard key decides how queries are routed" },
    {
      type: "p",
      text: "Two strategies, with an honest trade between them.",
    },
    { type: "h3", id: "hashed", text: "Hashed keys" },
    {
      type: "p",
      text: "MongoDB hashes the key value and ranges over the hash. Values that were adjacent end up scattered, so writes spread evenly across shards. That is the best write distribution you can get.",
    },
    {
      type: "p",
      text: "It costs you range queries. Ask for a week of timestamps on a hashed key and the router cannot tell which shards hold them, so it asks all of them. Range queries are not impossible — they are just answered by every shard at once.",
    },
    { type: "h3", id: "ranged", text: "Ranged keys" },
    {
      type: "p",
      text: "Ranges follow the actual values. Adjacent values live together, so a range query hits a small number of shards and the router knows which.",
    },
    {
      type: "p",
      text: "The cost is that your data has to be evenly distributed for the shards to be evenly loaded. Real data rarely is.",
    },
    { type: "h3", id: "scatter-gather", text: "Queries without the key" },
    {
      type: "p",
      text: "A query with no shard key goes to every shard, whichever strategy you chose. Each one runs it locally and the router merges the results.",
    },
    {
      type: "p",
      text: "That works, and it does not scale. Adding shards makes such a query more expensive rather than less, because every shard now participates in every one. Watch for these before they become your dominant workload.",
    },
    { type: "h2", id: "monotonic", text: "The monotonic key hotspot" },
    {
      type: "p",
      text: "A monotonic key always increases. Timestamps do. So does an ObjectId, because it starts with a timestamp.",
    },
    {
      type: "p",
      text: "Use one as a ranged shard key and every new document sorts to the top of the range. That range lives on one shard. So every insert in the cluster lands on that shard, while the others sit idle holding history.",
    },
    {
      type: "p",
      text: "You now have the storage of a cluster and the write throughput of one node, which is the opposite of what you sharded for. Worse, it moves: when that shard fills and the range splits, the hotspot migrates to whichever shard holds the new top.",
    },
    {
      type: "p",
      text: "The fix is a compound key that puts something well-distributed in front. Lead with a tenant or a device group, then the timestamp. Writes spread across the leading value, and range queries within one tenant still route to a small number of shards.",
    },
    {
      type: "p",
      text: "Hashing the key also fixes it, and gives up ranges entirely. Which one you want depends on whether your reads are ranges. That is the real question hiding underneath the choice.",
    },
    { type: "h2", id: "jumbo", text: "The jumbo chunk is a cardinality problem" },
    {
      type: "p",
      text: "The balancer moves data between shards when the imbalance between the largest and smallest crosses a threshold. To move data it needs chunks it can move.",
    },
    {
      type: "p",
      text: "A chunk becomes jumbo when it exceeds the configured size and cannot be split. And the reason it cannot be split is always the same: every document in it has the same shard key value, so there is no boundary to split on.",
    },
    {
      type: "p",
      text: "Shard on a country field and every document for one large country lands in one indivisible chunk. It might be many gigabytes. It is one unit as far as the balancer is concerned.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The balancer cannot move what it cannot split",
      text: "Once a jumbo chunk exists, the shard holding it is stuck with it. If that shard is the overloaded one, the balancer has nothing useful to do. The cluster stays unbalanced and no amount of adding shards helps, because the largest single unit of data cannot be divided. This is not a storage problem you fix with capacity. It is a shard key with too few distinct values.",
    },
    {
      type: "p",
      text: "The behaviour around splitting has also changed. Older MongoDB split chunks continuously in the background as they grew. From 6.0 that is gone: a chunk is split only when a migration requires it. In practice you will see fewer, larger chunks and no constant background splitting, which is a normal steady state rather than the balancer failing.",
    },
    { type: "h2", id: "fixing", text: "Getting out of it" },
    {
      type: "p",
      text: "This used to be close to fatal. Changing a shard key meant creating a new collection and migrating everything into it. That is no longer true, and it changes how much the original decision costs you.",
    },
    {
      type: "table",
      caption: "The two ways to change a shard key, and what each one does.",
      head: ["Command", "Since", "What it does"],
      rows: [
        [
          "`refineCollectionShardKey`",
          "MongoDB 4.4",
          "Adds fields to the end of the existing key, raising cardinality",
        ],
        [
          "`reshardCollection`",
          "MongoDB 5.0",
          "Replaces the key entirely and redistributes the data",
        ],
      ],
    },
    {
      type: "p",
      text: "Refining is the lighter operation and usually the right one for a jumbo chunk. Adding a high-cardinality field to the end of the key gives the chunk somewhere to split, and the existing prefix keeps working.",
    },
    {
      type: "p",
      text: "Resharding is the heavier answer for when the key itself was wrong. It runs in the background against a live collection, and it is genuinely resource-intensive — it rewrites the collection. Plan capacity for it and run it when you have headroom, not when the cluster is already struggling.",
    },
    {
      type: "p",
      text: "Neither one is a substitute for choosing well. Both are the reason a wrong choice is now recoverable rather than permanent. The same set of concerns — identity, distribution, and what happens during a rebalance — shapes any sharded store, including [Redis Cluster](/cloud/redis-cluster-vs-sentinel-architecture).",
    },
  ],
  faq: [
    {
      question: "What is the default chunk size?",
      answer:
        "128 MB, since MongoDB 6.0. It was 64 MB before that, and plenty of older guidance still quotes the old number.",
    },
    {
      question: "Why is a chunk marked jumbo?",
      answer:
        "Because it grew past the chunk size and has no split point. Every document in it shares one shard key value, so the key has too few distinct values.",
    },
    {
      question: "Can I change a shard key after sharding?",
      answer:
        "Yes. `refineCollectionShardKey` adds fields to the end, from 4.4. `reshardCollection` replaces the key outright, from 5.0.",
    },
    {
      question: "What happens if a query has no shard key?",
      answer:
        "Every shard runs it and the router merges the results. Adding shards makes that query more expensive, not less.",
    },
    {
      question: "Why is one shard taking all the writes?",
      answer:
        "Your key is probably monotonic, such as a timestamp or an ObjectId. New documents all sort to the top range, which lives on one shard.",
    },
    {
      question: "Why has the balancer stopped splitting chunks?",
      answer:
        "From MongoDB 6.0 it only splits when a migration needs it. Fewer, larger chunks is the expected steady state, not a fault.",
    },
  ],
  sources: [
    {
      title: "Data partitioning with chunks",
      publisher: "MongoDB",
      url: "https://www.mongodb.com/docs/manual/core/sharding-data-partitioning/",
    },
    {
      title: "Choose a shard key",
      publisher: "MongoDB",
      url: "https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/",
    },
    {
      title: "Sharded cluster balancer",
      publisher: "MongoDB",
      url: "https://www.mongodb.com/docs/manual/core/sharding-balancer-administration/",
    },
    {
      title: "Refine a shard key",
      publisher: "MongoDB",
      url: "https://www.mongodb.com/docs/manual/core/sharding-refine-a-shard-key/",
    },
    {
      title: "Reshard a collection",
      publisher: "MongoDB",
      url: "https://www.mongodb.com/docs/manual/core/sharding-reshard-a-collection/",
    },
  ],
};
