# Qwen Batch 018 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-018.md` |
| Source checksum (MD5) | `8390fd7c6c40d595a59054a431e591f3` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-27 |

The source file is headed `BATCH: 014` and its closing report calls the pieces
TC-096 to TC-100. That numbering is internal to the draft and does not match the
repository's batch sequence. The file name is the authority here.

---

## Readability

Measured with `scripts/readability.cli.ts`. All five pass every frozen gate.

| Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|--:|--:|--:|--:|--:|--:|--:|
| `postgresql-autovacuum-wraparound-freezing-tuning` | 1162 | 68.2 | 90.7 | 74.8 | 74.8 | 10.3 | 30 |
| `kubernetes-ingress-controller-architecture-nginx-traefik-envoy` | 1137 | 72.7 | 82.5 | 86.7 | 78.5 | 9.6 | 22 |
| `aws-lambda-concurrency-reserved-provisioned-throttling` | 1126 | 66.7 | 85.9 | 91.7 | 78.8 | 10.3 | 29 |
| `linux-file-permissions-posix-acls-capabilities` | 1143 | 72.2 | 78.2 | 89.4 | 82.4 | 11.2 | 24 |
| `kubernetes-resourcequota-vs-limitrange-namespace-governance` | 1108 | 66.4 | 82.9 | 68.1 | 73.8 | 11.2 | 27 |

Gates: body ≥ 55, standfirst ≥ 70, opening ≥ 65, FAQ ≥ 70 (worst answer), ASL ≤ 15,
longest sentence ≤ 35 words.

Nothing fell below 65, so no article is carrying a readability exemption.

**Two sit above the 65–70 target.** The ingress comparison at 72.7 and the Linux
permissions piece at 72.2 both came out too readable rather than too dense. In
the ingress case an earlier pass over-corrected: it reached 73.3 at an average
sentence length of 8.7 words, which reads staccato. Clauses were merged back to
bring the sentence length to 9.6. Neither was pushed further, because the only
remaining lever is lengthening sentences artificially, which trades real quality
for a target number. No technical vocabulary was removed from any article to
move a score.

---

## Technical corrections against the source

Every article in this batch required at least one correction. Two of them
reverse a claim the source states as fact.

### 1. PostgreSQL wraparound thresholds — the source is wrong three times over

The draft states that at an age of 2 billion, PostgreSQL "logs a critical
warning and refuses new transactions. It enters single-user mode."

The documentation gives different numbers and different behaviour:

| | Source draft | PostgreSQL documentation |
|---|---|---|
| Warning point | Not stated | 40 million transactions remaining |
| Refusal point | Age 2 billion | Fewer than 3 million transactions remaining |
| State during refusal | Database stops | Read-only transactions still start; in-flight ones continue |
| Recovery | Single-user mode | Explicitly *not* necessary or desirable |

The documentation's wording on the last row is unambiguous: contrary to what was
recommended in earlier releases, it is not necessary or desirable to stop the
postmaster or enter single-user mode. The article says so directly, because the
old advice costs downtime that buys nothing.

Two further gaps were filled. The draft omits `autovacuum_vacuum_insert_threshold`,
added in PostgreSQL 13, which is the trigger that finally made append-only tables
visible to autovacuum. It also omits `vacuum_failsafe_age` entirely, default 1.6
billion, which drops the cost delay and skips index vacuuming to finish freezing.
Both are in the article. One more correction: the draft implies the cost delay
must be lowered from a high default, but `autovacuum_vacuum_cost_delay` has
defaulted to 2 ms since PostgreSQL 12, not the older 20 ms.

### 2. ingress-nginx is retired, and the source recommends it

The draft calls NGINX Ingress "the safe default for simple HTTP routing" and
ranks it on maturity as "very high". The Kubernetes community project
ingress-nginx was retired in March 2026. The repository is archived. There are
no further releases, bug fixes or security patches.

The draft also never distinguishes it from `nginxinc/kubernetes-ingress`, the
separately maintained F5 controller. They are different codebases that share a
name, and conflating them turns a retirement notice into a false reassurance.
The article separates them explicitly and links to the existing retirement guide.

### 3. Unsupported throughput claims — dropped, not repeated

The draft asserts that Traefik suffers garbage-collection latency spikes "above
50,000 requests per second per instance", and ranks Envoy as having the "highest
performance of the three". Neither is supported by a published benchmark holding
request size, connection reuse and TLS settings constant across all three. Both
were dropped. The article says plainly that it quotes no throughput numbers and
explains why comparisons of this kind do not transfer.

### 4. Lambda — two limits the source does not mention at all

The draft covers account, reserved and provisioned concurrency, and stops there.
Two documented limits are missing, and both cause production throttling:

- **The requests-per-second ceiling.** Lambda enforces a rate equal to ten times
  the concurrency quota. At the default that is 10,000 requests per second. For
  functions under about 100 ms this binds before concurrency does, and no
  concurrency setting can move it. The article works the arithmetic through.
- **The concurrency scaling rate.** Each function may add up to 1,000 execution
  environments every 10 seconds. It is a per-function limit, which is why a
  vertical traffic wall throttles even when the account has spare capacity.

One further correction. The draft warns against "setting reserved concurrency
equal to the account limit". Lambda does not allow this: 100 units always remain
unreserved, so the ceiling on reservations is 900 at the default quota. The
article states the real constraint instead of warning about an impossible one.

### 5. Linux check order — the source has it backwards

The draft says the kernel evaluates SELinux first, and that "file permissions and
ACLs are not checked" when it denies.

The order is the reverse. The standard permission checks run first, and the
security module hook runs after them. The practical consequence is the point
worth publishing: a security module can only remove access that the discretionary
layer already granted. It can never grant access the bits refuse. That inverts
the debugging order most teams use, so the article leads with it and closes on a
ladder that follows the kernel's own sequence.

The draft also omits default ACLs, which are the main real-world use of ACLs
because they solve inheritance, and the ambient capability set, which is what
makes capabilities usable without a setuid binary in the chain. Both are covered.

### 6. Kubernetes quota failures do not produce a Pending pod

The draft describes a quota rejection as a pod stuck in Pending with the reason
in its events, and tells the reader to run `kubectl describe pod`.

ResourceQuota is enforced at admission. The request is rejected with 403 and the
pod object is never created, so it has no status and no events. For a Deployment
the workload object is admitted fine and the ReplicaSet fails to create pods,
which is where `FailedCreate` appears. The article is built around this, because
it changes where you look, and looking for a pod that does not exist is exactly
what makes the failure confusing. The title states it outright.

---

## Corpus overlap

Two topics in this batch sat close to existing articles. Both boundaries were
drawn deliberately.

| New article | Adjacent existing | Boundary held |
|---|---|---|
| Ingress controller comparison | `ingress-nginx-archived-migration` (published) | The existing article owns the retirement and the migration, and explicitly chooses replacements "on governance, not features". This one owns the architecture: how each controller delivers config to its data plane. Linked inline, retirement not re-explained. |
| Linux ACLs and capabilities | `linux-security-modules-selinux-apparmor-seccomp-containers` (draft) | The existing article owns mandatory access control — SELinux, AppArmor, seccomp. This one owns the discretionary layer beneath it: ACLs, the mask, and file capabilities. SELinux appears only as the layer above, and is not linked, because that article is still a draft. |
| Lambda concurrency | `aws-lambda-cold-start-optimization-snapstart` (published) | Cold-start phases and SnapStart stay there. This one owns limits and throttling. The single point of contact — a version cannot use provisioned concurrency and SnapStart together — is stated once and linked. |
| ResourceQuota and LimitRange | `kubernetes-priorityclass-preemption-pod-eviction` (draft), `linux-cgroups-v2-memory-oom-killer-reality` (draft) | Both drafts, so neither is linked. Priority is scheduling; cgroups is runtime enforcement. This one is admission-time namespace governance. Throttling and OOM kills are named as consequences without re-explaining either mechanism. |
| PostgreSQL autovacuum | `postgresql-index-types-btree-gin-brin-gist` (published) | No overlap of intent. Linked inline at the index-only scan reference, which is a genuine dependency on the visibility map. |

No article in this batch was held. No existing article was modified.

---

## Sources

Thirty across the batch, all primary:

- PostgreSQL routine vacuuming, autovacuum and vacuum configuration, VACUUM,
  progress reporting (6)
- Kubernetes Ingress, Ingress controllers, Gateway API, conformance, plus the
  Kubernetes blog statement on ingress-nginx, Traefik and Envoy Gateway project
  docs (7)
- AWS Lambda function scaling, reserved concurrency, provisioned concurrency,
  scaling behavior, asynchronous invocation, quotas (6)
- Linux man-pages for acl, setfacl, capabilities, setcap, path_resolution, plus
  the kernel LSM documentation (6)
- Kubernetes resource quotas, limit ranges, resource management, the quota task
  guide, pod priority (5)

No vendor blogs and no secondary commentary are cited as authority anywhere.

## Internal links

Every inline link points at a published article. No draft is linked as though it
were published.

| Article | Inline link | Related slugs |
|---|---|---|
| Autovacuum | `postgresql-index-types-btree-gin-brin-gist` | index types, connection pooling |
| Ingress comparison | `ingress-nginx-archived-migration` | ingress-nginx migration, service mesh mTLS |
| Lambda concurrency | `aws-lambda-cold-start-optimization-snapstart` | cold starts, cloud cost controls |
| Linux permissions | `container-image-security-beyond-scanning` | container image security, zero trust segmentation |
| ResourceQuota | `kubernetes-storage-classes-costs-performance-traps` | storage classes, Karpenter vs cluster autoscaler |

## Seed status

`aws-lambda-concurrency-reserved-provisioned-throttling` and
`kubernetes-ingress-controller-architecture-nginx-traefik-envoy` both derive to
1749. The collision was resolved on the established rule, with one entry added to
`SEED_OVERRIDES` in `src/lib/reactions.seed.ts` moving the ingress article to
1751. 1750 was skipped as too round, matching the existing entries. Both halves
are pinned in `tests/reactions.test.ts` alongside the four prior collisions.

---

## Verification run

| Check | Result |
|---|---|
| Readability | 5/5 pass all gates |
| Content validation | 117 articles, 22 categories — **0 errors**, 102 warnings |
| Typecheck | pass |
| Lint | 0 errors, 6 warnings (all pre-existing, in `src/components/ui`) |
| Tests | **220/220 pass** |
| Production build | pass |

Four defects were found by the validator and fixed before the run above:
`readingMinutes` was wrong on three articles, five meta descriptions ran over
165 characters, three articles had no inline internal link, and the two new
Lambda and ingress articles collided on their derived like baseline.

## Files created and modified

**Created (6)**

- `src/content/articles/cloud/postgresql-autovacuum-wraparound-freezing-tuning.ts`
- `src/content/articles/cloud/aws-lambda-concurrency-reserved-provisioned-throttling.ts`
- `src/content/articles/devops/kubernetes-ingress-controller-architecture-nginx-traefik-envoy.ts`
- `src/content/articles/devops/kubernetes-resourcequota-vs-limitrange-namespace-governance.ts`
- `src/content/articles/cybersecurity-ciso/linux-file-permissions-posix-acls-capabilities.ts`
- `docs/editorial/qwen-batch-018.refined.md`

**Modified (3)**

- `src/content/articles/index.ts` — regenerated by `bun run content:index`
- `src/lib/reactions.seed.ts` — one `SEED_OVERRIDES` entry
- `tests/reactions.test.ts` — the new override and collision pair pinned

All five articles are `draft: true`. Nothing was committed, pushed or deployed.
