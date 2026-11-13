import type { Article } from "../../types";

export const article: Article = {
  slug: "postgresql-autovacuum-wraparound-freezing-tuning",
  category: "cloud",
  contentType: "explainer",
  subcategory: "Database",
  title: "Vacuum reclaims space. Freezing is the part with a deadline",
  seoTitle: "PostgreSQL Autovacuum Tuning and XID Wraparound",
  metaDescription:
    "Autovacuum does two jobs and only one has a hard deadline. How the thresholds work, what blocks freezing, and what PostgreSQL does as the limit nears.",
  standfirst:
    "Bloat is a cost problem. Freezing is a deadline. Miss it and the database stops taking writes, on its own, with no warning left to give.",
  excerpt:
    "Autovacuum reclaims dead tuples and freezes old transaction IDs. The first job is about disk and speed. The second one has an end date, and the defaults on a large table are not built to meet it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-27",
  nextReviewAt: "2027-08-27",
  readingMinutes: 7,
  primaryKeyword: "PostgreSQL autovacuum tuning wraparound",
  secondaryKeywords: [
    "autovacuum_freeze_max_age",
    "transaction ID wraparound",
    "vacuum_failsafe_age",
    "autovacuum_vacuum_insert_threshold",
    "table bloat pg_repack",
  ],
  tags: ["PostgreSQL", "Databases", "Operations", "Cloud", "Reliability"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "postgresql-index-types-btree-gin-brin-gist",
    "postgresql-connection-pooling-pgbouncer-rds-proxy",
  ],
  methodology:
    "Written from the PostgreSQL documentation on routine vacuuming and the vacuum runtime configuration reference, verified August 2026. Three corrections were made against the source draft. The draft states that wraparound protection engages at an age of 2 billion and that recovery needs single-user mode; the documentation gives 40 million transactions remaining as the warning point, fewer than 3 million as the refusal point, and says explicitly that single-user mode is neither necessary nor desirable. The draft omits the insert-only trigger added for append-only tables, and omits the failsafe entirely. Both are covered here. No timings, bloat percentages or table sizes are quoted, because the figures in the draft are illustrative rather than measured.",
  body: [
    {
      type: "p",
      text: "A table keeps growing. Nobody is adding rows. Queries against it get slower every week, and the plan has not changed.",
    },
    {
      type: "p",
      text: "This is dead tuples. PostgreSQL never updates a row in place. An update writes a new version and leaves the old one behind. A delete only marks the old version. Something has to come along later and clear up.",
    },
    {
      type: "p",
      text: "That something is autovacuum, and it does two separate jobs. One is housekeeping. The other has a deadline attached, and it is the one that takes databases offline.",
    },
    { type: "h2", id: "two-jobs", text: "Two jobs, one process" },
    {
      type: "p",
      text: "The first job is reclaiming space. Vacuum finds tuples no live transaction can still see. It marks their space reusable and updates the free space map. It also updates the visibility map, which is what lets an [index-only scan](/cloud/postgresql-index-types-btree-gin-brin-gist) skip the heap.",
    },
    {
      type: "p",
      text: "The second job is freezing. Every row carries the transaction ID that wrote it. Those IDs are 32-bit, so they run out. Freezing stamps old rows as permanently visible, which takes them out of the comparison entirely.",
    },
    {
      type: "p",
      text: "Skip the first job and you pay in disk and read time. Skip the second one for long enough and PostgreSQL stops accepting writes. The two failures are not the same size.",
    },
    { type: "h2", id: "triggers", text: "What makes autovacuum start" },
    {
      type: "p",
      text: "Autovacuum does not run on a timer. It compares each table's change count against a threshold it computes per table.",
    },
    {
      type: "code",
      language: "text",
      code: "vacuum threshold = autovacuum_vacuum_threshold\n                 + autovacuum_vacuum_scale_factor * reltuples",
    },
    {
      type: "p",
      text: "The defaults are 50 and 0.2. So a table waits until a fifth of it has changed. On a small table that is often. On a table of 100 million rows it is 20 million changes, which is a long wait.",
    },
    {
      type: "p",
      text: "That is the scale factor problem. It is proportional, and proportional gets slow as tables grow. The fix is a per-table override rather than a global one.",
    },
    {
      type: "code",
      language: "sql",
      code: "ALTER TABLE events SET (\n  autovacuum_vacuum_scale_factor = 0.02,\n  autovacuum_vacuum_threshold = 1000\n);",
    },
    {
      type: "callout",
      variant: "note",
      title: "Append-only tables used to be invisible here",
      text: "The count above tracks updated and deleted rows. A table that only receives inserts never triggered it, so it never got frozen until the age limit forced the issue. PostgreSQL 13 added a separate insert trigger, autovacuum_vacuum_insert_threshold, defaulting to 1000 rows plus a scale factor of 0.2. If you run an older version, append-only tables are still a blind spot.",
    },
    { type: "h2", id: "wraparound", text: "The deadline nobody sees coming" },
    {
      type: "p",
      text: "Transaction IDs are 32-bit and wrap. PostgreSQL compares them in a circle, so roughly two billion IDs read as past and two billion as future. A row older than that would appear to be in the future, and the database would read it as invisible.",
    },
    {
      type: "p",
      text: "Freezing prevents that. To make sure freezing happens even on a quiet table, autovacuum_freeze_max_age forces a vacuum once the oldest unfrozen ID in a table reaches 200 million transactions. That vacuum runs whether the table changed or not. It cannot be skipped.",
    },
    {
      type: "p",
      text: "If freezing still falls behind, PostgreSQL escalates in stages. It is worth knowing what those stages actually are, because the folklore is wrong.",
    },
    {
      type: "table",
      caption: "What PostgreSQL does as the wraparound point approaches",
      head: ["Transactions remaining", "Behaviour"],
      rows: [
        ["40 million", "Warnings in the log naming the database and the count"],
        [
          "Fewer than 3 million",
          "Refuses to assign new transaction IDs. Writes fail. Read-only transactions still start, and transactions already running continue",
        ],
        [
          "Age 1.6 billion (vacuum_failsafe_age)",
          "Vacuum drops its cost delay, skips index vacuuming and ignores its buffer strategy to finish freezing",
        ],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "You do not need single-user mode",
      text: "The old advice was to stop the postmaster and vacuum in single-user mode. The documentation now says plainly that this is neither necessary nor desirable. The database still accepts read-only transactions in the refusal state, and a normal database-wide VACUUM clears it. Stopping the server only adds downtime.",
    },
    { type: "h2", id: "blocked", text: "Why vacuum runs and nothing improves" },
    {
      type: "p",
      text: "Vacuum can only remove a tuple no transaction can still see. Anything holding an old snapshot holds the whole cleanup back. The vacuum runs, reports success, and removes almost nothing.",
    },
    {
      type: "p",
      text: "There are four common holders, and only one of them is obvious:",
    },
    {
      type: "ul",
      items: [
        "A long-running transaction. Reporting queries are the usual source.",
        "An idle-in-transaction session. It does no work and still pins the snapshot. This is the worst of the four.",
        "A replication slot that no consumer is reading. The slot holds the horizon so the replica can catch up.",
        "A prepared transaction left behind by a two-phase commit that never resolved.",
      ],
    },
    {
      type: "code",
      language: "sql",
      code: "SELECT pid, state, age(backend_xmin) AS xmin_age, query\nFROM pg_stat_activity\nWHERE backend_xmin IS NOT NULL\nORDER BY age(backend_xmin) DESC;",
    },
    {
      type: "p",
      text: "Check pg_replication_slots and pg_prepared_xacts too. A forgotten slot on a decommissioned replica will hold the horizon indefinitely, and nothing in the table statistics points at it.",
    },
    { type: "h2", id: "throughput", text: "When autovacuum simply cannot keep up" },
    {
      type: "p",
      text: "Autovacuum throttles itself on purpose. It accumulates a cost as it reads and writes pages, and sleeps when it hits the limit. The sleep is autovacuum_vacuum_cost_delay, and since PostgreSQL 12 it defaults to 2 milliseconds rather than the older 20.",
    },
    {
      type: "p",
      text: "That default is far less restrictive than most tuning advice assumes. Check yours before lowering it. If a specific table genuinely cannot keep up, raise its cost limit or drop its delay for that table alone, and watch the I/O.",
    },
    {
      type: "p",
      text: "Worker count is the other ceiling. Three workers is the default, and each table gets one worker at a time. Hundreds of active tables will queue behind three. Raising autovacuum_max_workers spreads the same I/O budget wider rather than adding more, so raise the cost limit with it or nothing moves faster.",
    },
    { type: "h2", id: "bloat", text: "Vacuum does not shrink the file" },
    {
      type: "p",
      text: "This surprises people. A normal vacuum marks space reusable inside the file. It does not hand it back to the operating system.",
    },
    {
      type: "p",
      text: "The one exception is the end of the table. If the trailing pages are completely empty, vacuum truncates them. Free space in the middle stays where it is, and future inserts fill it.",
    },
    {
      type: "p",
      text: "So a bloated table stays the same size on disk after a successful vacuum. That is correct behaviour, not a failure. To actually reclaim it you need a rewrite: VACUUM FULL takes an ACCESS EXCLUSIVE lock and blocks everything, while pg_repack does the same work with brief locks at each end.",
    },
    { type: "h2", id: "monitor", text: "The two numbers to alert on" },
    {
      type: "p",
      text: "Dead tuples tell you about bloat. Transaction age tells you about the deadline. Watch both, because they fail independently.",
    },
    {
      type: "code",
      language: "sql",
      code: "SELECT relname,\n       n_dead_tup,\n       n_live_tup,\n       age(c.relfrozenxid) AS xid_age,\n       last_autovacuum\nFROM pg_stat_user_tables s\nJOIN pg_class c ON c.relname = s.relname\nORDER BY age(c.relfrozenxid) DESC\nLIMIT 20;",
    },
    {
      type: "p",
      text: "An age climbing past autovacuum_freeze_max_age means forced vacuums are already running and losing. Alert well before that, not at it. For a vacuum in progress, pg_stat_progress_vacuum shows the phase and how far through it is.",
    },
    {
      type: "p",
      text: "One setting is worth confirming first. Autovacuum depends on the statistics collector, so track_counts must be on. With it off, autovacuum has no dead tuple counts to read and quietly does nothing.",
    },
    { type: "h2", id: "order", text: "What to change, and in what order" },
    {
      type: "p",
      text: "Most autovacuum tuning goes wrong by starting global. A low scale factor applied server-wide makes every small table churn, and the I/O budget is shared. Work table by table instead.",
    },
    {
      type: "ol",
      items: [
        "Find the tables that matter. Sort by dead tuples and by transaction age, not by size.",
        "Clear whatever is holding the snapshot horizon. Tuning around a stuck replication slot achieves nothing.",
        "Lower the scale factor on those tables alone, and set an insert threshold on the append-only ones.",
        "Only then touch cost settings, and check the current delay before assuming it is the old 20 milliseconds.",
        "Confirm the change took. Per-table settings live in pg_class.reloptions, and a typo there fails silently.",
      ],
    },
    {
      type: "p",
      text: "Autovacuum is not a background detail you tune once. It is the process holding two deadlines at the same time, and the defaults were written for a smaller table than yours.",
    },
  ],
  faq: [
    {
      question: "Does autovacuum block reads or writes?",
      answer:
        "No. Normal work carries on while it runs. Only VACUUM FULL locks the table. That one blocks reads too.",
    },
    {
      question: "Should I ever turn autovacuum off?",
      answer:
        "No. The clock on freezing keeps running. You would just remove the thing keeping up with it.",
    },
    {
      question: "Why is my table still huge after a vacuum?",
      answer:
        "Vacuum frees space inside the file. New rows reuse it. You get disk back only if the empty pages sit at the very end.",
    },
    {
      question: "What is the fastest way out of the refusal state?",
      answer:
        "Run a VACUUM across the whole database. Leave the server up. Reads still work, so there is nothing to gain by stopping it.",
    },
    {
      question: "How often should ANALYZE run?",
      answer:
        "By default, once a tenth of the rows change. Lower that per table where the data is skewed.",
    },
    {
      question: "Do these settings apply to managed Postgres?",
      answer:
        "Mostly, yes. RDS, Aurora and Cloud SQL all expose the per-table knobs. What they lock down is the file system underneath.",
    },
  ],
  sources: [
    {
      title: "Routine Vacuuming",
      publisher: "PostgreSQL",
      url: "https://www.postgresql.org/docs/current/routine-vacuuming.html",
    },
    {
      title: "Automatic Vacuuming configuration parameters",
      publisher: "PostgreSQL",
      url: "https://www.postgresql.org/docs/current/runtime-config-autovacuum.html",
    },
    {
      title: "Resource consumption: cost-based vacuum delay",
      publisher: "PostgreSQL",
      url: "https://www.postgresql.org/docs/current/runtime-config-resource.html",
    },
    {
      title: "Vacuuming configuration parameters",
      publisher: "PostgreSQL",
      url: "https://www.postgresql.org/docs/current/runtime-config-vacuum.html",
    },
    {
      title: "VACUUM",
      publisher: "PostgreSQL",
      url: "https://www.postgresql.org/docs/current/sql-vacuum.html",
    },
    {
      title: "pg_stat_progress_vacuum",
      publisher: "PostgreSQL",
      url: "https://www.postgresql.org/docs/current/progress-reporting.html",
    },
  ],
};
