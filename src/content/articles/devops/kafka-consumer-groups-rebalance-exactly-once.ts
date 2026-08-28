import type { Article } from "../../types";

export const article: Article = {
  slug: "kafka-consumer-groups-rebalance-exactly-once",
  category: "devops",
  contentType: "troubleshooting",
  subcategory: "Observability",
  title: "The rebalance loop that eats a consumer group alive",
  seoTitle: "Kafka Consumer Groups: Rebalance and Exactly-Once Cost",
  metaDescription:
    "A slow batch trips the poll timeout, the group rebalances, the next consumer hits the same batch. How to break the loop, and when exactly-once is worth paying for.",
  standfirst:
    "Most Kafka lag is self-inflicted. A timeout is set wrong, the group rebalances, and the fix makes it worse.",
  excerpt:
    "Two timeouts do different jobs and get confused constantly. Understanding which one fires, and why the cooperative assignor changes the blast radius, is most of Kafka consumer operations.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-08",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 5,
  primaryKeyword: "Apache Kafka consumer group rebalance",
  secondaryKeywords: [
    "max.poll.interval.ms",
    "cooperative sticky assignor",
    "Kafka exactly-once semantics",
    "consumer lag",
    "Kafka transaction coordinator",
  ],
  tags: ["Kafka", "Event Streaming", "DevOps", "Reliability", "Distributed Systems"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "database-connection-failover-mechanics-timeouts",
    "kubernetes-storage-classes-costs-performance-traps",
  ],
  methodology:
    "Written from the Apache Kafka documentation on consumer configuration, group membership and transactional messaging, and KIP-429 for incremental cooperative rebalancing, verified August 2026. The source draft's claim that exactly-once reduces cluster throughput by 20 to 40 per cent was removed: no measurement supports a single figure across workloads. Its invented telemetry incident and the timings attached to it were removed as well.",
  body: [
    {
      type: "p",
      text: "Consumer lag is climbing. You add consumers. Lag climbs faster.",
    },
    {
      type: "p",
      text: "That is the signature of a rebalance loop. The group is spending its time reassigning partitions instead of reading them, and every consumer you add makes the reassignment bigger.",
    },
    {
      type: "p",
      text: "The cause is almost always a timeout doing its job. Kafka has two, they mean different things, and mixing them up is the most common self-inflicted outage in event streaming.",
    },
    { type: "h2", id: "model", text: "The rule that caps your scaling" },
    {
      type: "p",
      text: "A topic is split into partitions. Kafka orders records inside a partition, not across the topic.",
    },
    {
      type: "p",
      text: "A consumer group shares those partitions out. One rule governs everything: a partition goes to exactly one consumer in the group at a time.",
    },
    {
      type: "p",
      text: "So partition count is a hard ceiling on parallelism. Ten partitions and fifteen consumers means five consumers get nothing. They still join, still heartbeat, and still take part in every rebalance. You have added overhead and no throughput.",
    },
    {
      type: "p",
      text: "When a consumer joins, leaves or dies, the group coordinator works out a new assignment. That is the rebalance. How much it hurts depends on which assignor you chose.",
    },
    { type: "h2", id: "assignor", text: "Eager assignment stops the whole group" },
    {
      type: "p",
      text: "The original protocol is eager. On any membership change, every consumer drops every partition. They all wait for the new assignment, then start again.",
    },
    {
      type: "p",
      text: "One consumer dying therefore stops all of them. In a large group that pause is long enough to build serious lag, and the lag then takes longer to clear than the pause itself.",
    },
    {
      type: "p",
      text: "The cooperative sticky assignor changes the shape of that. Consumers keep the partitions they are not losing. Only the partitions that must move are revoked, so the rest of the group keeps reading throughout.",
    },
    {
      type: "code",
      language: "properties",
      code: "partition.assignment.strategy=\\\n  org.apache.kafka.clients.consumer.CooperativeStickyAssignor",
    },
    {
      type: "p",
      text: "For any group beyond a handful of members this is the single highest-value setting. It does not make rebalances free — they still take rounds to converge — but it stops one failure freezing everything.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Switching assignors is a two-step upgrade",
      text: "You cannot flip the strategy on a running group in one go. Every member has to agree on the protocol. So the documented path is two deployments: first a build that lists both assignors, then one that lists only the cooperative one. Skip the middle step and the group fails to form. This catches teams who treat it as a config change rather than a migration.",
    },
    { type: "h2", id: "timeouts", text: "Two timeouts, two different questions" },
    {
      type: "p",
      text: "This is where the loop comes from. The two settings sound similar and watch completely different things.",
    },
    {
      type: "table",
      caption: "What each timeout is actually asking",
      head: ["Setting", "Question", "Who answers", "Default"],
      rows: [
        [
          "`session.timeout.ms`",
          "Is the process alive?",
          "A background heartbeat thread",
          "45 seconds",
        ],
        [
          "`max.poll.interval.ms`",
          "Is it still making progress?",
          "Your processing loop",
          "5 minutes",
        ],
      ],
    },
    {
      type: "p",
      text: "The heartbeat runs on its own thread. It keeps answering even while your code is stuck, which is the point: it detects a dead JVM, not slow work.",
    },
    {
      type: "p",
      text: "The poll interval detects slow work. If you do not call poll again inside that window, the consumer decides it is stuck and leaves the group on purpose.",
    },
    {
      type: "p",
      text: "Recent clients raised the session timeout default to 45 seconds. Older guidance still says 10. That advice predates the change. Copy it into a modern deployment and you cause the very rebalances the new default prevents.",
    },
    { type: "h2", id: "loop", text: "How the loop actually forms" },
    {
      type: "p",
      text: "Here is the sequence, and it is entirely deterministic once the conditions are met.",
    },
    {
      type: "ol",
      items: [
        "A consumer fetches a large batch, because `max.poll.records` was tuned up for throughput.",
        "One record in that batch is slow. A downstream call blocks, or a query goes to a cold index.",
        "Processing the batch takes longer than `max.poll.interval.ms`.",
        "The consumer leaves the group. The partition is reassigned.",
        "The new owner starts from the last committed offset — which includes the same slow record.",
        "It reaches the same batch, takes the same time, and leaves too.",
      ],
    },
    {
      type: "p",
      text: "Nothing recovers on its own, because every attempt reproduces the condition. Lag grows without bound while the group looks busy.",
    },
    {
      type: "p",
      text: "The instinct is to raise the poll interval. That buys time and hides the problem: a genuinely hung consumer now takes much longer to detect.",
    },
    {
      type: "p",
      text: "The better fixes attack the batch. Lower `max.poll.records` so a worst-case batch still finishes inside the window. Or decouple the loop entirely — poll on one thread, hand records to workers, and commit only what the workers finish. The main thread then keeps polling regardless of how slow one record is.",
    },
    {
      type: "p",
      text: "A dead-letter path matters too. Without one, a single poison record blocks its partition forever, and no amount of tuning helps.",
    },
    { type: "h2", id: "eos", text: "What exactly-once actually costs" },
    {
      type: "p",
      text: "Kafka gives you at-least-once by default. Process a record, crash before committing the offset, and the next consumer reads it again.",
    },
    {
      type: "p",
      text: "Exactly-once semantics fixes that with a real distributed transaction. It is not a flag that makes duplicates disappear; it is a protocol with parts you have to operate.",
    },
    {
      type: "p",
      text: "**Idempotent producers** stop retries making duplicates. Each producer gets an ID. Each batch carries a sequence number. The broker drops a batch it has already written.",
    },
    {
      type: "p",
      text: "**Transactions** make the writes and the offset commit atomic. The producer opens a transaction. It writes to partitions, writes the consumed offset, then commits. A transaction coordinator runs the two-phase commit and records state in an internal topic.",
    },
    {
      type: "p",
      text: "**Read-committed consumers** finish the job. Set `isolation.level=read_committed` on the consumer. It then holds records back until it sees the marker saying the transaction committed.",
    },
    {
      type: "p",
      text: "Each step adds work. Extra round trips at transaction boundaries. Extra internal writes. Buffering on the consumer that delays delivery. The direction of the cost is certain. The size is not. It turns on transaction size, throughput and topology, so measure your own pipeline.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Ask whether the destination can deduplicate first",
      text: "Exactly-once earns its keep when the side effect cannot be undone and the far end cannot help. Moving money. Sending a message. A database is different: a unique key and an upsert usually give the same outcome for far less machinery. At-least-once into an idempotent sink is simpler to run, simpler to reason about, and simpler to debug at three in the morning.",
    },
    { type: "h2", id: "operate", text: "What to watch and what to tune" },
    {
      type: "ul",
      items: [
        "**Alert on the rate of lag change, not the absolute number.** A big backlog that is shrinking is fine. A small one growing steadily is the early signal.",
        "**Track how often the group rebalances.** During a deploy, that is normal. A steady drumbeat between deploys means a timeout is wrong.",
        "**Size batches against your worst record, not your average.** The average never causes the outage.",
        "**Never scale past the partition count.** Extra consumers add rebalance cost and read nothing.",
        "**Keep heavy work out of the poll loop.** Decoupling is what makes processing time stop being a membership question.",
        "**Give failures somewhere to go.** A dead-letter topic converts a stuck partition into an alert.",
      ],
    },
    {
      type: "p",
      text: "Almost every Kafka consumer problem traces back to one thing: partition ownership is a lease, and the lease has conditions. Miss a heartbeat and you lose it. Take too long between polls and you lose it. Most lag is a group failing those conditions repeatedly, not a broker running out of capacity. The connection between a slow dependency and a stalled pipeline is the same one that makes a healthy database look like an application fault in [database connection failover](/cloud/database-connection-failover-mechanics-timeouts).",
    },
  ],
  faq: [
    {
      question: "Why does adding consumers make lag worse?",
      answer:
        "Each new member sets off a rebalance. If the group is already looping, that is one more pause. Past the partition count, the extra ones read nothing.",
    },
    {
      question: "Which timeout causes most rebalances?",
      answer:
        "The poll interval. The heartbeat runs on its own thread and keeps going while your code is busy. Slow processing trips the poll interval instead.",
    },
    {
      question: "Should I just raise max.poll.interval.ms?",
      answer:
        "It stops the loop and hides the cause. A truly hung consumer now takes much longer to spot. Shrink the batch or move the work off the poll thread.",
    },
    {
      question: "Is the cooperative assignor safe to switch to?",
      answer:
        "Yes, but it takes two deployments. Ship a build that lists both assignors first, then one that lists only the cooperative one. One step and the group will not form.",
    },
    {
      question: "How much does exactly-once cost?",
      answer:
        "More round trips, more internal writes, and consumer buffering. The direction is clear, the size is not. Measure it on your own pipeline.",
    },
    {
      question: "When is at-least-once enough?",
      answer:
        "Whenever the far end can drop a repeat. A unique key and an upsert give the same result, with far less to run.",
    },
  ],
  sources: [
    {
      title: "Kafka consumer configuration",
      publisher: "Apache Kafka",
      url: "https://kafka.apache.org/documentation/#consumerconfigs",
    },
    {
      title: "Kafka design: consumer position and group membership",
      publisher: "Apache Kafka",
      url: "https://kafka.apache.org/documentation/#design_consumerposition",
    },
    {
      title: "KIP-429: Kafka consumer incremental rebalance protocol",
      publisher: "Apache Kafka Improvement Proposals",
      url: "https://cwiki.apache.org/confluence/display/KAFKA/KIP-429%3A+Kafka+Consumer+Incremental+Rebalance+Protocol",
    },
    {
      title: "Message delivery semantics and transactions",
      publisher: "Apache Kafka",
      url: "https://kafka.apache.org/documentation/#semantics",
    },
  ],
};
