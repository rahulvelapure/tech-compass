# Qwen Batch 013 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-013.md` |
| Source checksum (MD5) | `b9d1762256112db505bb9144e678cc85` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-26 |

---

## Readability

Measured with `scripts/readability.cli.ts`. All five pass every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| TC-066 | `aws-vpc-ipam-overlapping-cidr-management` | 984 | 67.2 | 84.9 | 84.3 | 72.5 | 11.7 | 31 |
| TC-067 | `redis-cluster-vs-sentinel-architecture` | 1089 | 72.0 | 74.4 | 71.6 | 75.7 | 10.6 | 28 |
| TC-068 | `oauth-2-pushed-authorization-requests-par-fapi` | 1062 | 67.0 | 71.8 | 80.4 | 71.0 | 11.8 | 29 |
| TC-069 | `terraform-state-splitting-enterprise-scale-terragrunt` | 1062 | 65.9 | 88.0 | 76.3 | 71.8 | 11.7 | 32 |
| TC-070 | `linux-cgroups-v2-memory-oom-killer-reality` | 1106 | 71.1 | 90.7 | 72.6 | 71.8 | 12.3 | 32 |

Average body 68.6. Three sit inside the 65–70 band; TC-067 and TC-070 land just
above it.

TC-067 is worth a note. Its first draft measured 64.5 and the fix was not
vocabulary. Nine paragraphs in the Sentinel section carried sentences of 15 to
23 words describing a sequence of steps, and a sequence reads better as separate
sentences than as one. Splitting them moved the article from 64.5 to 72.0 with
`SDOWN`, `ODOWN`, `cluster-node-timeout`, `MOVED`, `ASK` and `CROSSSLOT` all
retained exactly.

## Technical corrections made to the source

**TC-066 — VPC IPAM.**
The source said the free tier covers the first 100,000 tracked addresses. The
tiers are not split by volume; they are split by capability. **The free tier
covers one Region and one account**, plus BYOIP and Public IP Insights. Private
IPv4 pool management and sharing pools through AWS RAM — the whole multi-account
story the article is about — require the **Advanced tier** and its hourly
per-address charge. That reverses the article's cost framing, so it was made a
section of its own rather than a footnote. Also removed: the draft's assertion
about *how* a Transit Gateway breaks the tie between two identical prefixes.
AWS does not document a tie-break of that kind, so the article now states only
what is documented — one path per destination prefix, and one VPC unreachable.

**TC-067 — Redis Cluster and Sentinel.**
The draft named `cluster-require-full-coverage` as the mitigation for
split-brain write loss. It is not. That setting decides whether the cluster
serves requests when a hash slot has no owner at all. The mechanism that
actually bounds the loss is **`cluster-node-timeout`**: a master that cannot
reach the majority refuses writes once the timeout elapses, so writes taken in
the minority before that point may be lost and none are taken after it. That
makes the timeout a genuine trade-off — shorter loses fewer writes and fails
over on noise — which the draft's framing hid. Three additions: Redis is
single-threaded in its command loop but not in its network I/O; Sentinel quorum
and Sentinel majority are two separate checks; and the 2024–2025 licence
sequence (RSALv2/SSPLv1, the Valkey fork, AGPLv3 in Redis 8), without which the
commercial-tier section reads as though nothing changed.

**TC-068 — Pushed Authorization Requests.**
The draft said PAR lets public clients be required to authenticate using DPoP or
mTLS. A public client is by definition one that holds no credential, so this
overstates what PAR does for an SPA. What PAR actually provides is a request
whose parameters were validated on an authenticated channel and cannot be
altered in the browser — real, and a different property. The article now says
that plainly and points at the backend-for-frontend pattern instead. The
PAR-versus-JAR distinction was promoted from a verification note to a section
with a comparison table, because conflating them is the common error.

**TC-069 — Terraform state at scale.**
No factual error, but two gaps. `moved` blocks were absent, and they are
routinely confused with cross-state moves — they refactor within one state,
declaratively and in version control, and cannot move a resource to another
state file. And the draft did not say that splitting state without splitting the
pipeline's credentials leaves the blast radius exactly where it was. The
`terraform state mv` example was rewritten as a pull, move, push sequence, which
is what the operation actually requires against a remote backend.

**TC-070 — cgroups v2 and the OOM killer.**
Two corrections. The draft gave `-998` as the `oom_score_adj` for protected
components; the kubelet uses **-997** for Guaranteed pods and for containers at
system-node-critical priority, 1000 for BestEffort, and a computed value between
2 and 999 for Burstable that falls as the memory request rises. And it described
`memory.high` as mapping loosely to the memory request. Under Memory QoS,
`memory.high` is derived from the **limit** via `memoryThrottlingFactor`
(default 0.9) while the **request** drives `memory.min`. Critically, the draft
did not say that **Memory QoS was still alpha as of Kubernetes v1.36** — so on a
default cluster there is no throttling stage at all, which is the single most
useful fact in the article. Added: `memory.high` has no ceiling on how hard it
throttles, so a group parked above it presents as a hang rather than a
slowdown.

## Invented material removed

| ID | Removed | Replaced with |
|---|---|---|
| TC-066 | Three weeks of weekend migrations after an acquisition | Why translation is required, and what IPAM scopes contribute |
| TC-067 | Holiday sale, 80 GB dataset, infinite failover loop | The capacity argument stated directly |
| TC-068 | Named SaaS platform and its open redirector | The same attack described as mechanism |
| TC-069 | 3,000 resources, 25-minute plans, 50 developers | Why plan time and lock contention cross together |
| TC-070 | Spring Boot pod, 2.1 GB measured against a 2 GB limit | The arithmetic that produces it, for any runtime |

## Placement and cross-linking

| ID | Category | Content type | Outbound links |
|---|---|---|---|
| TC-066 | `cloud` | explainer | Control Tower and SCPs, Transit Gateway vs peering |
| TC-067 | `cloud` | comparison | Database connection failover |
| TC-068 | `cybersecurity-ciso` / Identity security | explainer | DPoP, device authorization grant |
| TC-069 | `devops` / Infrastructure as code | explainer | State locking and drift, secrets in CI/CD |
| TC-070 | `devops` / Containers | explainer | Java and Go GC tuning, eBPF observability |

TC-070 links to TC-054 from Batch 011, which is deliberate: the throttling stage
`memory.high` provides is only useful if the runtime above it reacts, and that
article covers what reacting looks like. TC-068 and TC-055 form a pair — one
grant with a back channel, one without.

---

## Sources used for verification

**Amazon Web Services** — what is IPAM, IPAM pricing and tiers, sharing an IPAM
pool with RAM, Transit Gateway route tables.
**Redis** — cluster specification, scaling with Redis Cluster, Sentinel
documentation, licences.
**IETF** — RFC 9126 (PAR), RFC 9101 (JAR), RFC 9700 (OAuth Security BCP).
**OpenID Foundation** — FAPI 2.0 Security Profile.
**HashiCorp** — `terraform_remote_state`, `state mv`, the `moved` block.
**Gruntwork** — Terragrunt dependencies and multi-unit runs.
**The Linux Kernel Documentation** — control group v2.
**Kubernetes** — node-pressure eviction, resource management for pods and
containers, KEP-2570 (Memory QoS).

All external source URLs were checked and return 200.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 98 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 220/220 |
| Readability gates | pass — 5/5 |
| Production build | pass |
| Source integrity | pass — `batch-013.md` unchanged |

None of the five raises a validator warning of its own. All are `draft: true`.
Nothing was committed, pushed or deployed.
