# Qwen Batch 017 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-017.md` |
| Source checksum (MD5) | `a61605cbcb017e3de2e6fc06920c033b` |
| Articles in batch | 1 |
| Refined | 1 |
| Held | 0 |
| Refined on | 2026-08-27 |

Batch 017 carries a single article rather than the usual five. The source is
one long draft on PostgreSQL index selection.

---

## Readability

Measured with `scripts/readability.cli.ts`. Passes every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| cloud-26 | `postgresql-index-types-btree-gin-brin-gist` | 3462 | 67.2 | 80.3 | 74.5 | 71.1 | 11.2 | 31 |

Gates: body ≥ 55, standfirst ≥ 70, opening ≥ 65, FAQ ≥ 70, ASL ≤ 15,
longest sentence ≤ 35 words. **PASS on all six.**

Body 67.2 sits inside the 65–70 editorial target. No further readability pass
was run: pushing higher would mean removing operator-class names and planner
vocabulary, which is the one trade the standard forbids.

### Length note

At 3,462 words the article is well above the 1,100–1,400 house range. It was
written and published under an earlier batch standard, before that range was
set. It is left as-is deliberately — it is already published (`cloud-26` is
PUBLISHED in `editorial/segments/cloud.ts`, and `tests/reactions.test.ts`
pins its URL in the published-address snapshot). Re-cutting it to 1,400 words
would change a live URL's content and break the snapshot for no editorial gain.
Recorded here so the deviation is visible rather than silent.

---

## Technical corrections against the source

The source draft was not followed blindly. Four claims were changed or dropped.

**1. `jsonb_path_ops` operator support — corrected.**
The source states `jsonb_path_ops` "supports only the `@>` operator". That is
wrong. Per the PostgreSQL JSON indexing documentation, `jsonb_path_ops`
supports `@>` and the jsonpath operators `@?` and `@@`. What it excludes is
key-existence (`?`, `?|`, `?&`). The article states the exclusion, not a
single-operator limit. This correction is recorded in the article's
`methodology` field.

**2. Invented timings and index sizes — removed.**
The source quotes a 40-second scan becoming a 15-millisecond lookup, a 20 GB
B-Tree against a 20 MB BRIN, "three orders of magnitude" compression, and an
18 GB index dropped for a 4 GB one. None of these come from measurement; they
are illustrative figures in a draft. All were dropped. The published article
quotes no timings and no index sizes — verified: zero occurrences of those
figures in the article file.

**3. BRIN correlation threshold of 0.5 — demoted to a guideline.**
The source presents |correlation| < 0.5 as a decision rule. PostgreSQL
publishes no such threshold. It is a practical heuristic. The article treats
`pg_stats.correlation` as a signal to check, not a documented cutoff.

**4. GIN `fastupdate` framing — adjusted.**
The source reads as though `fastupdate` must be switched on for write-heavy
tables. `fastupdate` defaults to on. The operational risk is the opposite one:
an unbounded pending list when autovacuum falls behind. The article frames it
as a tuning and vacuum-frequency problem rather than a feature to enable.

---

## Corpus overlap

Three PostgreSQL articles already exist in `cloud`. Boundaries:

| Existing article | Owns | Boundary held |
|---|---|---|
| `postgresql-connection-pooling-pgbouncer-rds-proxy` | Connection-layer saturation | Linked once inline. Nothing about pooling is re-explained. |
| `postgresql-declarative-partitioning-query-pruning` | Partition elimination in the planner | Pruning is a partition-level decision; this article stops at index-level access paths. |
| `postgresql-pitr-wal-archiving-lsn-mechanics` | WAL, recovery, LSN | No overlap. |
| `aurora-serverless-v2-scaling-connection-limits` | Managed-Postgres scaling | Related-slug only. |

The article's intent is index-type selection against query operators. That
intent is not held by any existing article.

---

## Sources

Nine, all PostgreSQL primary documentation: index types, multicolumn indexes,
partial indexes, index-only scans, GIN, JSON indexing, BRIN, GiST, and
`CREATE INDEX`. No vendor blogs, no secondary commentary.

## Internal links

One inline link, to `/cloud/postgresql-connection-pooling-pgbouncer-rds-proxy`
(published). Two `relatedSlugs`:
`postgresql-connection-pooling-pgbouncer-rds-proxy` and
`aurora-serverless-v2-scaling-connection-limits` — both published, neither a
draft.

## Structure

10 `h2` sections, 9 FAQ entries, `contentType: decision-framework`,
`reviewStatus: research-based`.

---

## Verification run

| Check | Result |
|---|---|
| Readability | 1/1 pass all gates |
| Content validation | 112 articles, 22 categories — **0 errors** |
| Typecheck | pass |
| Tests | 220/220 pass |
| Build | pass |

### One correction made during this run, then reverted

The article was initially flagged for missing `draft: true` — it is the only
one of the 35 staged new articles without the flag. Adding it broke four
tests: `cloud-26` is marked PUBLISHED in the backlog, and the published-URL
snapshot in `tests/reactions.test.ts` expects 56 published articles, not 55.
The absence of `draft: true` is deliberate, not an oversight. The change was
reverted and the file returned to its staged state byte-for-byte. The test
suite is the authority on publication state here, and it caught the error.
