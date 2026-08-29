import type { Article } from "../../types";

export const article: Article = {
  slug: "postgresql-declarative-partitioning-query-pruning",
  category: "cloud",
  contentType: "explainer",
  title: "Partitioning only pays off if the planner can throw partitions away",
  seoTitle: "PostgreSQL Partitioning: Pruning, Locks and Maintenance",
  metaDescription:
    "How partition pruning decides whether splitting a table helps or hurts, why updating a partition key moves the row, and which operations take an exclusive lock.",
  standfirst:
    "Splitting a big table is easy. Getting the planner to skip the pieces it does not need is the part that decides whether you gained anything.",
  excerpt:
    "Pruning happens at plan time or at execution time, and the two look different in EXPLAIN. Attach and detach take heavy locks unless you set them up to avoid it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-20",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "PostgreSQL declarative partitioning",
  secondaryKeywords: [
    "partition pruning",
    "DETACH PARTITION CONCURRENTLY",
    "ATTACH PARTITION lock",
    "partition key row move",
    "pg_partman",
  ],
  tags: ["PostgreSQL", "Databases", "Performance", "Cloud", "Operations"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "postgresql-index-types-btree-gin-brin-gist",
    "postgresql-pitr-wal-archiving-lsn-mechanics",
  ],
  methodology:
    "Written from the PostgreSQL documentation on table partitioning, partition pruning and the ALTER TABLE reference, plus the pg_partman project documentation, verified August 2026. One correction was made to the source draft. It said you cannot create a foreign key from a partitioned table to another table; that limitation was lifted in PostgreSQL 11, and referencing a partitioned table was added in 12, so the draft has the restriction backwards and out of date. Added: that ATTACH PARTITION scans the table under an exclusive lock unless a matching CHECK constraint already exists, which is the single most useful operational detail in the subject. The draft's logging-platform incident and its query timings were removed.",
  body: [
    {
      type: "p",
      text: "A table that has grown past a certain size starts to hurt in several places at once. Scans get expensive. Index maintenance slows. Vacuum takes longer than the window you have for it.",
    },
    {
      type: "p",
      text: "Partitioning splits it into pieces. The parent holds no rows; every row lives in a child. PostgreSQL routes inserts to the right one for you.",
    },
    {
      type: "p",
      text: "None of that helps by itself. The gain comes from the planner skipping partitions it can prove hold no matching rows. If it cannot prove that, you now have all the old cost plus more objects to maintain.",
    },
    { type: "h2", id: "pruning", text: "Pruning is the whole mechanism" },
    {
      type: "p",
      text: "The planner reads your filter, compares it against each partition's bounds, and drops the ones that cannot match. That is pruning, and it is the reason partitioning is fast when it is fast.",
    },
    {
      type: "p",
      text: "Two conditions have to hold. The partition key has to appear in the query, and the expression has to be something the planner can evaluate against the bounds.",
    },
    {
      type: "p",
      text: "The first is where most disappointment comes from. A query that filters on a column you did not partition by has to visit every partition. Adding partitions makes that query worse, not better, because each one is now a separate scan.",
    },
    { type: "h3", id: "two-kinds", text: "Plan time and execution time" },
    {
      type: "p",
      text: "Pruning happens at two stages, and they show up differently.",
    },
    {
      type: "table",
      caption: "Where pruning happens, and how to spot it.",
      head: ["", "Plan time", "Execution time"],
      rows: [
        ["Needs", "Values known while planning", "Values known only when running"],
        ["Typical case", "A literal or a stable function", "A subquery, or a parameter"],
        ["In EXPLAIN", "Pruned partitions absent", "Subplans shown as never executed"],
        ["Look for", "Subplans Removed", "The loops count on each subplan"],
      ],
    },
    {
      type: "p",
      text: "Plan-time pruning is better, because the work never enters the plan. Execution-time pruning still helps a great deal, and it is how a parameterised query or a nested loop join avoids scanning everything.",
    },
    {
      type: "p",
      text: "So a plan that lists every partition is not automatically a failure. Check whether those subplans actually ran. A subplan marked as never executed was pruned, just later than you would like.",
    },
    {
      type: "p",
      text: "Pruning is on by default. If a query is scanning everything, the setting is almost never the reason — the expression is.",
    },
    { type: "h3", id: "types", text: "Types are the usual culprit" },
    {
      type: "p",
      text: "The subtle failure is a type mismatch. Partition on a timestamp with time zone and filter with a bare timestamp literal, and the planner has to apply a conversion that depends on the session's time zone.",
    },
    {
      type: "p",
      text: "That conversion is not fixed at plan time, so the bounds comparison cannot be made. The query is correct and the pruning is gone. Match the literal's type to the key, and check the plan rather than assuming.",
    },
    { type: "h2", id: "update", text: "Updating the key moves the row" },
    {
      type: "p",
      text: "Change a row's partition key so it no longer fits its partition, and PostgreSQL moves it. That is documented behaviour and it is what you want, but it is not a cheap update.",
    },
    {
      type: "p",
      text: "The row is deleted from one partition and inserted into another. Indexes on both are touched, and the write-ahead log records more than an in-place update would.",
    },
    {
      type: "p",
      text: "So choose a key that does not change after insert. A creation timestamp is a good key partly for this reason. A status column that moves through a lifecycle is a bad one, however well it partitions the data on paper.",
    },
    { type: "h2", id: "locks", text: "Attach and detach are the dangerous operations" },
    {
      type: "p",
      text: "Adding and removing partitions is routine, and it is where production incidents come from. Both take locks on the parent.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "ATTACH scans the whole table unless you prepare it",
      text: "When you attach a partition, PostgreSQL validates that every existing row satisfies the partition bounds. It does that by scanning the table, while holding an exclusive lock on it. On a large partition that is a long outage in the middle of a routine operation. The way out is documented: add a CHECK constraint matching the bounds before you attach. PostgreSQL sees the constraint, skips the scan, and the attach is quick. Drop the now-redundant constraint afterwards.",
    },
    {
      type: "p",
      text: "Detach has a similar problem and a different fix. A plain detach takes an access exclusive lock on the parent, which blocks everything until it finishes.",
    },
    {
      type: "p",
      text: "The concurrent form takes a share update exclusive lock instead, so ordinary queries against the parent keep working. It comes with restrictions, so read them before you rely on it, but for a routine retention job it is the right choice.",
    },
    { type: "h2", id: "maintenance", text: "Maintenance is now per partition" },
    {
      type: "p",
      text: "Vacuum and analyze work on partitions individually. That is mostly good news: each one is smaller, so each run is shorter and can be scheduled around.",
    },
    {
      type: "p",
      text: "The catch is that autovacuum uses one set of settings for every table. In a time-partitioned table the newest one takes nearly all the writes. The older ones are read-only in practice. No single setting suits both.",
    },
    {
      type: "p",
      text: "Set storage parameters per partition. Lower the scale factor on the hot one so it is vacuumed more often. Raise it on the cold ones so you are not paying for scans of data that never changes. Statistics matter too — a partition analyzed when it was empty gives the planner numbers that are now wrong.",
    },
    { type: "h2", id: "automation", text: "Automate creation before you need it" },
    {
      type: "p",
      text: "A time-partitioned table needs next month's partition to exist before next month. Miss it and inserts either fail or land in the default partition, which then grows into the problem you were avoiding.",
    },
    {
      type: "p",
      text: "An extension such as pg_partman handles this. It creates partitions ahead of time, detaches or drops old ones on a retention policy, and can run maintenance per partition. Set the pre-make window generously — the cost of a few empty partitions is nothing next to the cost of discovering the gap on the first of the month.",
    },
    { type: "h2", id: "limits", text: "What partitioning still will not do" },
    {
      type: "p",
      text: "Write throughput is largely unchanged. Rows are routed rather than duplicated, and each partition carries its own indexes, so the total index maintenance per insert is similar. The gains are on reads and on maintenance.",
    },
    {
      type: "p",
      text: "A unique constraint has to include every partition key column. You cannot enforce uniqueness across partitions on a column outside the key. That often forces a wider primary key than the model wants.",
    },
    {
      type: "p",
      text: "Foreign keys work in both directions on current versions, which older advice frequently gets wrong. A partitioned table can carry a foreign key to another table, and another table can reference a partitioned one. If you read that either is impossible, check the version that advice was written for.",
    },
    {
      type: "p",
      text: "Finally, partitioning is not a substitute for indexing. A pruned partition still needs the right index to answer the query quickly — the selection problem is covered in [PostgreSQL index types](/cloud/postgresql-index-types-btree-gin-brin-gist).",
    },
  ],
  faq: [
    {
      question: "Why is my query scanning every partition?",
      answer:
        "Most likely the filter does not use the partition key. Or a type cast is blocking the compare. Read the plan before you change any setting.",
    },
    {
      question: "Is a plan that lists every partition a failure?",
      answer:
        "Not always. Check whether the subplans ran. One marked never executed was pruned at execution time rather than at plan time.",
    },
    {
      question: "Why is ATTACH PARTITION so slow?",
      answer:
        "It scans the table to validate the bounds, holding an exclusive lock. Add a matching CHECK constraint first and it skips the scan.",
    },
    {
      question: "How do I detach without blocking queries?",
      answer:
        "Use the concurrent form. It takes a share update exclusive lock rather than an access exclusive one. Check its restrictions first.",
    },
    {
      question: "Can a partitioned table have foreign keys?",
      answer:
        "Yes, both ways on current versions. Foreign keys from partitioned tables arrived in 11, and referencing one arrived in 12.",
    },
    {
      question: "Does partitioning speed up writes?",
      answer:
        "Not much. Each partition keeps its own indexes, so per-row work is similar. The wins are in reads and in maintenance.",
    },
  ],
  sources: [
    {
      title: "Table partitioning",
      publisher: "PostgreSQL Global Development Group",
      url: "https://www.postgresql.org/docs/current/ddl-partitioning.html",
    },
    {
      title: "ALTER TABLE",
      publisher: "PostgreSQL Global Development Group",
      url: "https://www.postgresql.org/docs/current/sql-altertable.html",
    },
    {
      title: "Routine vacuuming",
      publisher: "PostgreSQL Global Development Group",
      url: "https://www.postgresql.org/docs/current/routine-vacuuming.html",
    },
    {
      title: "pg_partman",
      publisher: "pg_partman",
      url: "https://github.com/pgpartman/pg_partman",
    },
  ],
};
