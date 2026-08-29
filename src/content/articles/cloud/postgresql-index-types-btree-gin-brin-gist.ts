import type { Article } from "../../types";

export const article: Article = {
  slug: "postgresql-index-types-btree-gin-brin-gist",
  category: "cloud",
  contentType: "decision-framework",
  subcategory: "Database",
  title: "The index exists. The planner ignores it anyway",
  seoTitle: "PostgreSQL Index Types: B-Tree, GIN, BRIN and GiST",
  metaDescription:
    "PostgreSQL builds a B-Tree unless you say otherwise. How GIN, BRIN and GiST differ, how to match an index to your query operator, and how to roll one out safely.",
  standfirst:
    "An index the planner cannot use is worse than no index. It costs disk, it slows every write, and it returns nothing.",
  excerpt:
    "A sequential scan on a table that has an index usually means one thing: the index type does not support the operator in the query. Matching the two is most of the work, and the rest is proving it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-24",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 20,
  primaryKeyword: "PostgreSQL index types",
  secondaryKeywords: [
    "GIN vs GiST",
    "BRIN index correlation",
    "jsonb_path_ops",
    "CREATE INDEX CONCURRENTLY",
    "index-only scan",
  ],
  tags: ["PostgreSQL", "Databases", "Performance", "Cloud", "Query Planning"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "postgresql-connection-pooling-pgbouncer-rds-proxy",
    "aurora-serverless-v2-scaling-connection-limits",
  ],
  methodology:
    "Written from the PostgreSQL documentation on index types, multicolumn and partial indexes, index-only scans, GIN, BRIN, GiST, jsonb indexing and CREATE INDEX, verified August 2026. One correction was made against the documentation: jsonb_path_ops supports the jsonpath operators as well as containment, and excludes only key existence. Timings and index sizes are not quoted, because the available figures come from illustrative examples rather than measurement.",
  body: [
    {
      type: "p",
      text: "A query that should take milliseconds is taking half a minute, and no deploy explains it. You pull the plan. It is a sequential scan over the whole table.",
    },
    {
      type: "p",
      text: "So you check the table. The index is there. It was created months ago, by someone who has since left. The planner is simply not using it.",
    },
    {
      type: "p",
      text: "Most of the time this is not stale statistics and not bloat. The index type does not support the operator in the query. PostgreSQL will not warn you about that. It just scans.",
    },
    {
      type: "p",
      text: "The index is not idle while this happens. It occupies disk, it is maintained on every insert and update, and it adds work for vacuum. You are paying full price for nothing.",
    },
    { type: "h2", id: "pipeline", text: "Six questions, in order" },
    {
      type: "p",
      text: "Index selection looks like a menu of four types. It is really a short sequence of questions, and the order matters. Answer them in order and the type usually picks itself.",
    },
    {
      type: "table",
      caption: "The selection pipeline",
      head: ["Question", "What it decides"],
      rows: [
        ["Which operator does the query use?", "Which index types are eligible at all"],
        ["What shape is the data?", "Scalar, composite or spatial — narrows it further"],
        ["How selective is the predicate?", "Whether any index beats a sequential scan"],
        ["Does the column track physical row order?", "Whether BRIN is a candidate"],
        [
          "What is the read-to-write ratio?",
          "GIN or GiST, and whether the write cost is affordable",
        ],
        ["Did the plan actually change?", "Whether you fixed it or moved it"],
      ],
    },
    {
      type: "p",
      text: "The first question is the one people skip. They pick an index by column type instead — a JSONB column, so index the JSONB column — and end up with an index the planner cannot use.",
    },
    { type: "h3", id: "selectivity", text: "Selectivity, briefly" },
    {
      type: "p",
      text: "An index only helps if it eliminates most of the table. The planner estimates how many rows a predicate returns, then compares an index scan against a plain scan on cost.",
    },
    {
      type: "p",
      text: "Take a large table with two distinct values in a column. An index scan there means reading much of the index, then jumping around the heap. A sequential read is often cheaper. When the planner rejects your new index, it is frequently right, and the real fix is a different query.",
    },
    { type: "h2", id: "btree", text: "B-Tree: everything that is a question about order" },
    {
      type: "p",
      text: "Write `CREATE INDEX` without naming a type and you get a B-Tree. That default is correct far more often than not.",
    },
    {
      type: "p",
      text: "A B-Tree is a balanced tree. The planner starts at the root, compares against separator values, and follows one branch per level until it reaches a leaf pointing at the row. Depth grows with the logarithm of the row count, so even a huge table is only a few page reads deep.",
    },
    {
      type: "p",
      text: "That structure answers questions about order. Equality, inequality, ranges, prefix matches, null checks and membership in a list are all order questions underneath the syntax.",
    },
    { type: "h3", id: "multicolumn", text: "Multicolumn indexes and the leftmost columns" },
    {
      type: "p",
      text: "A multicolumn B-Tree sorts by the first column, then by the second within that, and so on. So column order is a design decision, not a formatting choice.",
    },
    {
      type: "p",
      text: "An index on (tenant_id, created_at) serves a query filtering on tenant_id alone. It also serves one filtering on both. It is much less useful for a query filtering on created_at alone, because the rows for any single date are scattered across every tenant.",
    },
    {
      type: "p",
      text: "The rule of thumb: put the column you always filter on first, and the one you sometimes filter on second. If two queries want opposite orders, that is an argument for two indexes rather than one compromise serving neither.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Equality first, range second",
      text: "When a query has both an equality and a range predicate, lead with the equality column. An index on (status, created_at) can jump straight to one status and then walk the dates in order. Reverse it and the planner must scan a date range and discard the wrong statuses as it goes. Same two columns, very different amount of work.",
    },
    { type: "h3", id: "partial", text: "Partial indexes" },
    {
      type: "p",
      text: "A partial index covers only the rows matching a condition. It is one of the highest-value features in PostgreSQL and one of the least used.",
    },
    {
      type: "p",
      text: "The classic case is a status column where one value matters and the rest are history. A queue table might hold millions of completed jobs and a few hundred pending ones. An index over just the pending rows is tiny, stays cached, and costs almost nothing to maintain.",
    },
    {
      type: "code",
      language: "sql",
      code: "-- Only the rows anyone actually queries\nCREATE INDEX CONCURRENTLY idx_jobs_pending\n  ON jobs (created_at)\n  WHERE status = 'pending';",
    },
    {
      type: "p",
      text: "The catch is that the planner must prove your query is a subset of the index predicate. A query for status = 'pending' matches. A query passing status as a parameter does not, because the value is unknown at planning time. Partial indexes reward literal predicates.",
    },
    { type: "h3", id: "expression", text: "Expression indexes" },
    {
      type: "p",
      text: "An index can be built on the result of an expression rather than a bare column. This is how case-insensitive lookups get fast.",
    },
    {
      type: "p",
      text: "The matching rule is strict, and it catches people constantly. An index on lower(email) helps a query that also writes lower(email). It does nothing for a query on email by itself. The expression in the query must match the one in the index definition.",
    },
    {
      type: "p",
      text: "The same trap appears with type casts. If a column is text and the query compares it against a number, the implicit cast can make the index unusable. Look for a cast in the plan when an index is ignored for no obvious reason.",
    },
    { type: "h3", id: "index-only", text: "Index-only scans and covering indexes" },
    {
      type: "p",
      text: "Normally an index scan finds row locations and then visits the heap to read the rows. An index-only scan skips the heap, because everything the query needs is already in the index.",
    },
    {
      type: "p",
      text: "Two conditions must hold. The query may reference only columns the index stores. And the index type must be able to return the original value. B-Tree always can. GiST can for some operator classes. GIN cannot at all, because it stores only parts of the value.",
    },
    {
      type: "p",
      text: "There is a third condition that surprises people. PostgreSQL still has to know the row is visible to your transaction. It checks the visibility map, which records whether every row on a heap page is old enough to be visible to everyone.",
    },
    {
      type: "p",
      text: "If the page bit is set, the row is returned with no heap access. If not, the heap page gets visited anyway. So index-only scans pay off only when a good fraction of pages are marked all-visible, and keeping them that way is vacuum's job. On a constantly updated table the optimisation quietly stops applying.",
    },
    {
      type: "p",
      text: "The `INCLUDE` clause adds payload columns to an index without making them part of the key.",
    },
    {
      type: "code",
      language: "sql",
      code: "-- Searchable on tenant_id; email carried along for the scan\nCREATE INDEX CONCURRENTLY idx_users_tenant\n  ON users (tenant_id) INCLUDE (email);",
    },
    {
      type: "p",
      text: "Included columns are not searchable and do not guide the scan. They can be types the index could not otherwise handle. In a unique index, uniqueness applies to the key columns only, which is occasionally exactly what you want.",
    },
    {
      type: "p",
      text: "Be careful with wide payloads. Every included column makes the index bigger, and a bigger index is slower to scan and slower to maintain. The gain is real only if the table changes slowly enough for index-only scans to keep working.",
    },
    { type: "h3", id: "btree-limits", text: "Where a B-Tree runs out" },
    {
      type: "ul",
      items: [
        "**Operators about the inside of a value.** Containment, overlap, text match. A B-Tree cannot look inside, so the planner does not ask it.",
        "**Leading wildcards.** A prefix match can use the tree. A pattern starting with a wildcard cannot, because there is no prefix to seek to.",
        "**Expression mismatch.** The index stores one expression and the query writes another, implicit casts included.",
        "**Low selectivity.** A predicate matching much of the table loses to a sequential scan on cost, correctly.",
        "**Parameterised predicates with partial indexes.** The planner cannot prove the query falls inside the index condition.",
      ],
    },
    { type: "h2", id: "gin", text: "GIN: when you search by the parts of a value" },
    {
      type: "p",
      text: "GIN is an inverted index. A B-Tree maps a value to the rows containing it. GIN maps the elements inside a value to the rows containing them.",
    },
    {
      type: "p",
      text: "Index a JSONB column and GIN decomposes each document. For every element it maintains a posting list of the rows that contain it. A containment query becomes a lookup of the element, then a read of its list.",
    },
    {
      type: "p",
      text: "That is why GIN answers JSONB containment, array overlap and full-text search. All three are membership questions, and membership is what an inverted index stores.",
    },
    { type: "h3", id: "opclass", text: "The two JSONB operator classes" },
    {
      type: "p",
      text: "An operator class tells an index how to handle a particular data type. JSONB has two for GIN, and the choice has real consequences.",
    },
    {
      type: "table",
      caption: "jsonb_ops against jsonb_path_ops",
      head: ["", "jsonb_ops (default)", "jsonb_path_ops"],
      rows: [
        [
          "What it indexes",
          "Every key and every value, independently",
          "One entry per value, hashed with the path to it",
        ],
        ["Containment @>", "Yes", "Yes"],
        ["Jsonpath @? and @@", "Yes", "Yes"],
        ["Key existence ? ?| ?&", "Yes", "No"],
        ["Size", "Larger", "Usually much smaller"],
        ["Specificity on common keys", "Poor", "Good"],
      ],
    },
    {
      type: "p",
      text: "A widely repeated claim says jsonb_path_ops supports containment only. That is wrong, and it matters if you use jsonpath. It supports the jsonpath operators too. What it gives up is key existence — asking whether a key is present at all, without caring about its value.",
    },
    {
      type: "p",
      text: "The hashing is why it is smaller. Each entry combines the value with the path leading to it, so entries are highly specific. That matters most when a key appears in almost every row, where the default class produces a posting list covering the whole table.",
    },
    {
      type: "p",
      text: "It has one blind spot worth knowing. Because it indexes values, it is a poor fit for searching for empty structures. If that is a real query pattern for you, stay on the default.",
    },
    { type: "h3", id: "gin-writes", text: "Write amplification and the pending list" },
    {
      type: "p",
      text: "GIN buys fast reads with slow writes. One new row can touch many posting lists, so a single insert becomes several index modifications. On a write-heavy table that is the dominant cost.",
    },
    {
      type: "p",
      text: "The `fastupdate` parameter changes the shape of that cost rather than removing it. New entries go into a pending list instead of the main structure, which makes the write cheap. The list is merged into the index later, during vacuum or once it exceeds its size limit.",
    },
    {
      type: "p",
      text: "The pending list is not free to read. Queries must scan it as well as the index, because a matching row may exist only there. So the list is a debt. Writes are fast now, and every read pays interest until it is merged.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "This is where GIN goes wrong quietly",
      text: "On a write-heavy table where autovacuum is falling behind, the pending list grows. Writes stay fast, so nothing looks broken. Reads get steadily slower, and the plan offers no obvious clue. If a GIN-indexed table has degrading read latency and healthy write latency, check vacuum activity before you touch the query.",
    },
    {
      type: "p",
      text: "The practical consequence is that GIN and autovacuum are a package. Tuning autovacuum to run more often on that table is part of deploying the index, not a follow-up task for later.",
    },
    {
      type: "p",
      text: "The trade-off is worth stating plainly. Turn fastupdate off and writes are slower but read latency is predictable. Leave it on and writes are faster, but read latency now depends on how well vacuum is keeping up. Pick the one whose failure mode you would rather debug.",
    },
    { type: "h2", id: "brin", text: "BRIN: tiny, and worthless on the wrong data" },
    {
      type: "p",
      text: "BRIN stores no row pointers. It divides the table into ranges of blocks and keeps a summary for each range. For a scalar column, that summary is the smallest and largest value in those blocks. The default range is 128 blocks.",
    },
    {
      type: "p",
      text: "This is why BRIN indexes are so small. A very large table yields one entry per range instead of one per row, and the size gap against a B-Tree is a matter of orders of magnitude.",
    },
    {
      type: "p",
      text: "A range query then works by elimination. The planner reads the summaries, discards every range whose bounds cannot contain a match, and visits only what survives.",
    },
    { type: "h3", id: "correlation", text: "Physical correlation is the whole condition" },
    {
      type: "p",
      text: "All of that depends on the column tracking physical row order. Append-only time-series data is the natural fit. Rows arrive in time order, so each block range covers a narrow slice of time and the bounds stay tight.",
    },
    {
      type: "p",
      text: "Break that and the index still builds, still gets scanned, and eliminates nothing. If rows arrive in random order, one range may span the entire value domain. Every range then looks like a possible match.",
    },
    {
      type: "p",
      text: "You can check this before building anything, because the planner already keeps the statistic.",
    },
    {
      type: "code",
      language: "sql",
      code: "SELECT attname, correlation\n  FROM pg_stats\n WHERE tablename = 'events'\n   AND attname = 'created_at';",
    },
    {
      type: "p",
      text: "Correlation runs from -1 to 1. Values near either end mean the column tracks physical order closely, in one direction or the other. Values near zero mean it does not.",
    },
    {
      type: "p",
      text: "A common rule of thumb wants an absolute value above roughly 0.5. That is practical experience rather than a documented threshold, so treat it as a prompt to test. Run ANALYZE first, or you are reading a stale number.",
    },
    { type: "h3", id: "pages-per-range", text: "Tuning the range size" },
    {
      type: "p",
      text: "The `pages_per_range` parameter trades index size against precision. A smaller value produces more summaries, each covering less of the table, so the bounds are tighter and the planner eliminates more.",
    },
    {
      type: "p",
      text: "Start at the default. Reduce it only when you can see the planner reading ranges it should be discarding. Lower it far enough and you have paid B-Tree storage prices for less capability.",
    },
    {
      type: "table",
      caption: "When BRIN is and is not the answer",
      head: ["Attractive", "Poor choice"],
      rows: [
        ["Very large table", "Small table — summary overhead outweighs the gain"],
        ["Append-only, or nearly", "Rows updated often, degrading correlation"],
        ["Column tracks insertion order", "Values arrive in random order"],
        ["Range queries over that column", "Equality lookups for a single row"],
        ["Index size genuinely matters", "You need row-level precision"],
      ],
    },
    {
      type: "p",
      text: "Updates deserve a specific warning. Heavy updates move rows and weaken correlation over time, so a BRIN index that worked at launch can decay without anyone changing it. If the physical order can be restored, CLUSTER rewrites the table in index order. It takes an exclusive lock while it runs, so treat it as a maintenance window rather than a quick fix.",
    },
    { type: "h2", id: "gist", text: "GiST: overlap, containment and distance" },
    {
      type: "p",
      text: "GiST is less an index than a framework for building them. It provides the tree. An operator class supplies the type-specific logic: how to split a page, and how to test whether a subtree could contain a match.",
    },
    {
      type: "p",
      text: "That design is why one index type covers geometry, ranges, network addresses and text search. Each is a different operator class over the same machinery.",
    },
    {
      type: "p",
      text: "Its natural question is overlap rather than order. Do these two ranges intersect. Does this point fall inside that shape. None of that is expressible as a position in a sorted list, which is exactly why a B-Tree cannot help.",
    },
    { type: "h3", id: "ranges", text: "Range types, and enforcing rather than checking" },
    {
      type: "p",
      text: "Range overlap is the case most teams meet first. A booking system asking whether a new reservation clashes with an existing one is doing overlap on a range type.",
    },
    {
      type: "p",
      text: "The interesting part is that GiST can enforce the rule rather than merely answer the question. An exclusion constraint refuses any row overlapping an existing one, in the database, under concurrency.",
    },
    {
      type: "code",
      language: "sql",
      code: "ALTER TABLE reservations\n  ADD CONSTRAINT no_overlap\n  EXCLUDE USING gist (room_id WITH =, during WITH &&);",
    },
    {
      type: "p",
      text: "That is worth more than the index alone. Application-level conflict checks lose races. Two requests both read, both see no conflict, and both insert. The constraint cannot be raced, because the check and the write are one operation.",
    },
    { type: "h3", id: "knn", text: "Nearest-neighbour search" },
    {
      type: "p",
      text: "GiST also answers ordering by distance, using the distance operator in an ORDER BY. The index returns rows in order of closeness, so a query for the ten nearest points reads roughly ten rows instead of sorting the table.",
    },
    {
      type: "p",
      text: "GIN cannot do this at all. If nearest-neighbour ordering is in the requirements, the choice is already made for you.",
    },
    { type: "h3", id: "gin-vs-gist", text: "Full-text search: choosing between GIN and GiST" },
    {
      type: "p",
      text: "Both index a tsvector and both answer the match operator, so this is a workload decision rather than a correctness one.",
    },
    {
      type: "table",
      caption: "The trade for text search",
      head: ["", "GIN", "GiST"],
      rows: [
        ["Query speed", "Faster", "Slower — may recheck candidates against the heap"],
        ["Update cost", "Higher", "Lower"],
        ["Index size", "Larger", "Smaller"],
        ["Nearest-neighbour ordering", "No", "Yes"],
        ["Index-only scans", "No", "Some operator classes"],
        ["Best fit", "Read-heavy search", "Churning text, or distance ordering"],
      ],
    },
    {
      type: "p",
      text: "Most search workloads read far more than they write, which is why GIN is the usual answer. Reach for GiST when the indexed text changes constantly, or when you need distance.",
    },
    { type: "h2", id: "matrix", text: "Matching operator to index" },
    {
      type: "table",
      caption: "Start from the operator, not the column type",
      head: ["Query looks like", "Index", "Notes"],
      rows: [
        ["status = 'active'", "B-Tree", "Also ranges, prefixes, IN lists, null checks"],
        ["tenant_id = ? AND created_at > ?", "B-Tree", "Multicolumn, equality column first"],
        ["status = 'pending' (rare value)", "B-Tree partial", "Index only the rows that matter"],
        ["lower(email) = ?", "B-Tree expression", "Query must use the same expression"],
        ['attrs @> \'{"color":"red"}\'', "GIN", "jsonb_path_ops unless you need key existence"],
        ["attrs ? 'color'", "GIN", "Default jsonb_ops required"],
        ["tags && ARRAY['urgent']", "GIN", "Array overlap"],
        ["content @@ to_tsquery(...)", "GIN", "GiST if writes dominate"],
        ["during && tsrange(...)", "GiST", "Pairs with an exclusion constraint"],
        ["ORDER BY location <-> point(...)", "GiST", "Nearest neighbour; GIN cannot"],
        ["ts BETWEEN ? AND ? on a huge log", "BRIN", "Only with strong physical correlation"],
      ],
    },
    { type: "h2", id: "rollout", text: "Rolling one out without an incident" },
    { type: "h3", id: "explain", text: "Read the plan before and after" },
    {
      type: "p",
      text: "Run the query under `EXPLAIN (ANALYZE, BUFFERS)` first, and keep the output. Without a baseline you cannot tell an improvement from noise.",
    },
    {
      type: "p",
      text: "Three things in that output matter more than the total time. Rows removed by filter tells you the index found candidates and then discarded them, which means it is not selective enough. The buffers numbers separate cache hits from disk reads, so a query can look fast merely because the data was warm. And the gap between estimated and actual rows tells you whether the planner is working from good statistics.",
    },
    { type: "h3", id: "locks", text: "Lock behaviour, and why CONCURRENTLY is not optional" },
    {
      type: "p",
      text: "A plain `CREATE INDEX` locks the table against writes for the whole build. Reads continue. Writes wait. On a large table that is an outage you scheduled by accident.",
    },
    {
      type: "p",
      text: "`CREATE INDEX CONCURRENTLY` avoids the write lock, and costs you elsewhere. It does two table scans instead of one. Before each scan it waits for transactions that have modified the table. After the second scan it waits for any transaction holding a snapshot older than that scan.",
    },
    {
      type: "p",
      text: "That last point has a sharp practical edge. One long-running transaction anywhere can hold a concurrent build open indefinitely. Check for old transactions before you start, or the build will appear to hang for reasons unrelated to the index.",
    },
    {
      type: "p",
      text: "Two more constraints. A concurrent build cannot run inside a transaction block. And concurrent builds on partitioned tables are not supported — the documented approach is to build on each partition concurrently, then create the index on the parent, which is a metadata-only operation.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "A failed concurrent build leaves debris",
      text: "If the build fails part-way, through a deadlock or a uniqueness violation, the command reports failure and leaves an invalid index behind. It is ignored for querying, but it is still maintained on every write. So you get the full write cost with none of the read benefit, and nothing tells you unless you look. It shows as INVALID in psql. Drop it, or rebuild it with REINDEX INDEX CONCURRENTLY.",
    },
    {
      type: "code",
      language: "sql",
      code: "-- Find invalid indexes left behind by failed builds\nSELECT indexrelid::regclass AS index, indrelid::regclass AS table\n  FROM pg_index\n WHERE NOT indisvalid;",
    },
    { type: "h3", id: "staging", text: "What to prove in staging" },
    {
      type: "p",
      text: "A staging test only means something at representative data volume. An index that looks fine over a thousand rows tells you nothing about a hundred million.",
    },
    {
      type: "ol",
      items: [
        "**Plan shape.** Confirm the planner chooses the index, and check rows removed by filter.",
        "**Write throughput.** Run a bulk insert or update with and without the index. GIN and GiST add real overhead, so measure it rather than assuming it is acceptable.",
        "**Index size.** Compare it against the table. An index approaching the size of the table is a signal to reconsider the type or the operator class.",
        "**Vacuum behaviour.** For GIN with fastupdate, write in bulk, then confirm vacuum merges the pending list rather than letting it grow.",
        "**Build duration.** Time the concurrent build. That number is what goes in the change request.",
      ],
    },
    { type: "h3", id: "monitor", text: "Monitoring, and knowing when to drop" },
    {
      type: "code",
      language: "sql",
      code: "SELECT relname, indexrelname, idx_scan,\n       pg_size_pretty(pg_relation_size(indexrelid)) AS size\n  FROM pg_stat_user_indexes\n WHERE schemaname = 'public'\n ORDER BY idx_scan;",
    },
    {
      type: "p",
      text: "Come back a week after deployment. An index with no scans is pure cost, and dropping it is a clean win. Make this a recurring review rather than a one-off, because indexes accumulate as queries change and nobody removes the ones that stopped being used.",
    },
    {
      type: "p",
      text: "Two cautions on that number. Statistics can be reset, so a zero may only mean the counter was cleared recently. And an index backing a unique constraint may show few scans while still doing essential work, so check what depends on it first.",
    },
    {
      type: "p",
      text: "Rollback is mercifully simple. `DROP INDEX CONCURRENTLY` removes an index without the lock a plain drop takes. Because adding an index changes no data, the rollback plan for almost every index deployment is a single statement.",
    },
    { type: "h2", id: "troubleshooting", text: "Symptom, cause, evidence, fix" },
    {
      type: "table",
      caption: "Working backwards from the symptom",
      head: ["Symptom", "Likely cause", "Evidence to gather", "Fix"],
      rows: [
        [
          "Sequential scan despite an index",
          "Index type does not support the operator",
          "Operator in the WHERE clause; index type in psql",
          "Build the matching type",
        ],
        [
          "Index ignored for a function call",
          "Query expression differs from the indexed one",
          "Index definition against query text; look for casts",
          "Match the expression, or index the bare column",
        ],
        [
          "Planner prefers a scan on a small result",
          "Stale statistics",
          "Estimated against actual rows in EXPLAIN ANALYZE",
          "Run ANALYZE; raise the statistics target",
        ],
        [
          "Index scan runs but is slow",
          "Poor selectivity",
          "High rows removed by filter",
          "Add a column, or make the index partial",
        ],
        [
          "Reads slowing, writes healthy, GIN index",
          "Pending list growing unmerged",
          "Vacuum activity on that table",
          "Tune autovacuum; consider fastupdate off",
        ],
        [
          "BRIN index prunes nothing",
          "Weak physical correlation",
          "pg_stats.correlation after ANALYZE",
          "Use a B-Tree, or CLUSTER the table",
        ],
        [
          "Index-only scan stopped happening",
          "Visibility map bits cleared by updates",
          "Heap fetches in the plan; vacuum activity",
          "Vacuum that table more often",
        ],
        [
          "Write latency rose after deployment",
          "Index maintenance cost, likely GIN",
          "Write throughput with and without it",
          "Reconsider the class; enable fastupdate",
        ],
        [
          "Concurrent build never finishes",
          "A long-running transaction is blocking it",
          "pg_stat_activity for old transactions",
          "End that transaction, then rebuild",
        ],
      ],
    },
    { type: "h2", id: "scenario", text: "Illustrative production scenario" },
    {
      type: "p",
      text: "This scenario is illustrative. It is not a report of a specific incident, and it deliberately carries no timings or sizes, because the honest version of those numbers is the ones you measure yourself.",
    },
    {
      type: "p",
      text: "A platform stores application events with a JSONB payload. Queries filter on payload attributes using the containment operator. There is an index on the payload column, created early on, and it is a B-Tree.",
    },
    {
      type: "p",
      text: "Every one of those queries is a sequential scan. The index is structurally valid and completely useless for containment, so the planner has never used it. Meanwhile it has been maintained on every insert since the day it was created.",
    },
    {
      type: "p",
      text: "The fix is a GIN index. Because the queries use containment and never key existence, jsonb_path_ops is the better class — smaller, and more specific on keys that appear in most rows. Build it concurrently, confirm the plan changes, then drop the B-Tree.",
    },
    {
      type: "p",
      text: "Dropping it recovers two things: the storage, and the write cost that was buying nothing. The second is the part teams forget to count.",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "Read the operator before you look at the column type. That one habit prevents most of these problems.",
        "B-Tree answers order. GIN answers membership. GiST answers overlap and distance. BRIN answers ranges over physically ordered data.",
        "Column order in a multicolumn index is a design decision. Equality first, range second.",
        "Partial and expression indexes are underused, and both demand that the query match the definition exactly.",
        "Index-only scans depend on vacuum keeping visibility map bits set, so they can stop working silently.",
        "Prefer jsonb_path_ops for containment and jsonpath. It gives up key existence, not the jsonpath operators.",
        "GIN and autovacuum ship together. A growing pending list slows reads while writes still look fine.",
        "Check pg_stats.correlation before building a BRIN index, and re-check it if the table takes heavy updates.",
        "Build concurrently, watch for long transactions, and check for an invalid index afterwards.",
        "Review index usage on a schedule. Anything with no scans is cost without benefit.",
      ],
    },
    {
      type: "p",
      text: "An unused index is not neutral. It slows every write, occupies storage, and adds vacuum work, and it does all of that silently. Choosing deliberately costs an afternoon. Finding the mismatch during an incident costs considerably more. This is one of two database problems that usually present as an application fault — the other is connection behaviour, covered in [connection pooling with PgBouncer and RDS Proxy](/cloud/postgresql-connection-pooling-pgbouncer-rds-proxy).",
    },
  ],
  faq: [
    {
      question: "Why is my query ignoring the index?",
      answer:
        "Most often the index type does not match the operator. A B-Tree cannot answer a containment or overlap query. So the planner gives up and scans.",
    },
    {
      question: "Does column order matter in a multicolumn index?",
      answer:
        "Yes, a great deal. The index sorts by the first column first. Put the column you always filter on first, and the equality column before the range one.",
    },
    {
      question: "Why does my index on lower(email) not get used?",
      answer:
        "The query has to use the same expression. If it compares the bare column, the index does not apply. Watch for implicit casts too.",
    },
    {
      question: "What stops an index-only scan from working?",
      answer:
        "Asking for a column the index does not store. Or a table whose visibility map bits keep getting cleared by updates. GIN cannot do them at all.",
    },
    {
      question: "Should I use jsonb_path_ops or the default?",
      answer:
        "Use jsonb_path_ops for containment and jsonpath queries. It is smaller and more specific. Switch to the default if you need to ask whether a key exists.",
    },
    {
      question: "When is BRIN worth it?",
      answer:
        "When the table is large, mostly appended to, and the column tracks row order. Check the correlation first. If it is near zero, BRIN prunes nothing.",
    },
    {
      question: "GIN or GiST for full-text search?",
      answer:
        "GIN if you read far more than you write, which is the usual case. GiST if the text changes constantly, or you need distance ordering.",
    },
    {
      question: "Why is my concurrent build taking so long?",
      answer:
        "It does two table scans, and it waits for older transactions to finish. One long-running transaction can hold it open. Check for those first.",
    },
    {
      question: "What if I build the wrong index type?",
      answer:
        "Nothing fails. It builds, sits on disk, and slows your writes. Drop it and build the right one.",
    },
  ],
  sources: [
    {
      title: "Index Types",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/indexes-types.html",
    },
    {
      title: "Multicolumn Indexes",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/indexes-multicolumn.html",
    },
    {
      title: "Partial Indexes",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/indexes-partial.html",
    },
    {
      title: "Index-Only Scans and Covering Indexes",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html",
    },
    {
      title: "GIN Indexes",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/gin.html",
    },
    {
      title: "jsonb Indexing",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/datatype-json.html",
    },
    {
      title: "BRIN Indexes",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/brin.html",
    },
    {
      title: "GiST Indexes",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/gist.html",
    },
    {
      title: "CREATE INDEX",
      publisher: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/sql-createindex.html",
    },
  ],
};
