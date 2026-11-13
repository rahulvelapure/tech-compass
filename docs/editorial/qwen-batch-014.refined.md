# Qwen Batch 014 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-014.md` |
| Source checksum (MD5) | `f16532905a50e006b69c13813eae1d29` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-26 |

---

## Readability

Measured with `scripts/readability.cli.ts`. All five pass every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| TC-071 | `aws-efs-vs-fsx-lustre-s3-mountpoint` | 984 | 71.2 | 81.6 | 82.2 | 72.6 | 11.1 | 26 |
| TC-072 | `bgp-anycast-vs-geo-dns-global-load-balancing` | 984 | 69.3 | 89.1 | 85.8 | 72.5 | 11.9 | 33 |
| TC-073 | `mongodb-sharding-jumbo-chunk-trap` | 998 | 73.2 | 77.8 | 72.6 | 72.3 | 12.0 | 29 |
| TC-074 | `github-actions-self-hosted-runner-security` | 1075 | 69.5 | 87.4 | 73.5 | 72.4 | 11.2 | 33 |
| TC-075 | `linux-xdp-vs-tc-ebpf-packet-drop` | 939 | 70.6 | 71.8 | 68.5 | 70.5 | 11.9 | 32 |

Average body 70.8. TC-072 and TC-074 sit inside the band; the other three land
just above it.

TC-074 is the instructive one. Its first draft measured 62.0, below the band,
and the cause was vocabulary density rather than long sentences — "repository",
"organisation" and "enterprise" appearing together in short spans, at five and
six syllables each. Sentence splitting alone did not fix it. What worked was
using "repo" and "org" where an engineer would actually say them, keeping the
full words where the sentence is making a precise structural point, and adding
plain connective words rather than removing technical ones. That took it to
69.5 with every mechanism intact.

## Technical corrections made to the source

**TC-071 — EFS, FSx for Lustre and Mountpoint.**
Two corrections, both about material that has moved. The draft presented
Bursting as the EFS default and the credit trap as the main story; **Elastic is
now the recommended default**, and the article reframes Bursting as the mode
older file systems are still on. The draft also advised nothing about
performance mode, where the live trap is: **Max I/O is a previous generation
that AWS recommends against**, it has higher per-operation latency, and it
cannot be combined with Elastic throughput at all. The bigger correction is
Mountpoint. The draft says flatly that it cannot rename or append. On **S3
Express One Zone directory buckets it does both** — rename is supported, and
appending works with the incremental upload flag when writes are sequential from
the end of the file. Directory renames, symlinks, hard links and random writes
remain unsupported everywhere, and the article now separates those two
categories instead of collapsing them.

**TC-072 — Anycast and Geo-DNS.**
The draft said BGP picks the anycast site by AS-path length. **Local preference
is evaluated first**, and it encodes commercial relationships — customer routes
over peer routes over transit — so anycast follows routing policy rather than
distance. That is why a user close to one of your sites can be delivered to
another continent, which the draft could not explain. Second, the draft
presented the anycast TCP reset as a routine failure. The mechanism is real; the
frequency is not. Routes are stable most of the time and web connections are
short, which is why large anycast networks carry very large amounts of TCP. The
article now describes it as a rare failure you design around by terminating at
the edge. Added: Cloudflare's 1.1.1.1 deliberately **does not send EDNS Client
Subnet**, so a share of Geo-DNS traffic is always routed on resolver location
regardless of what your provider supports.

**TC-073 — MongoDB sharding.**
Three version errors, all of which change the advice. The **default chunk size
is 128 MB, not 64 MB** — it changed in MongoDB 6.0. `reshardCollection` arrived
in **5.0**, not 4.2, and `refineCollectionShardKey` in **4.4**, not 5.0; the
draft had both wrong and in opposite directions, and the distinction between
them is the practical answer to a jumbo chunk. And **auto-splitting changed in
6.0**: chunks are split only when a migration requires it, so fewer and larger
chunks is now the expected steady state rather than a sign the balancer has
stalled. The article also softens "range queries are impossible" on a hashed
key — they are answered by every shard, which is different from impossible.

**TC-074 — Self-hosted runners.**
No factual error, two framing corrections. The draft made organisation-level
scope the central risk. GitHub's stated boundary is **repository visibility**:
the documentation recommends self-hosted runners only with private
repositories, because a fork pull request on a public repository runs a
stranger's code on your machine before any review gate applies. Scope widens the
blast radius; visibility creates it. Second, the draft treated the Actions
Runner Controller as one thing. **Runner scale sets is the newer,
GitHub-supported mode** and uses different resources from the older controller,
which is why manifests from blog posts frequently do not work.

**TC-075 — XDP and TC.**
Two corrections. The draft listed four XDP return codes and omitted
**`XDP_ABORTED`**, which is the one that matters during an incident: it fires on
a program error and raises a tracepoint, and it is the usual explanation for
packet loss with no matching drop counter. And the draft said XDP works only on
physical cards with driver support. **Generic mode runs on virtual devices,
including veth** — which is how most people first run an XDP program, and why a
filter that measured slowly in a container lab is not evidence about production.

## Link QA

Three of the source draft's cited URLs no longer resolve:

| Article | Dead URL | Replaced with |
|---|---|---|
| TC-072 | `blog.cloudflare.com/anycast-tcp/` | RFC 4786, RFC 7871, Google Public DNS ECS |
| TC-075 | `docs.kernel.org/networking/xdp.html` | Cilium BPF reference, kernel AF_XDP doc, xdp-project tutorial |
| TC-073 | `mongodb.com/docs/manual/core/sharding-shard-key/` | Current manual paths for shard keys, balancer and resharding |

Every source URL in the five published articles was checked and returns 200.

## Invented material removed

| ID | Removed | Replaced with |
|---|---|---|
| TC-071 | GPU cluster at 10% utilisation, 10 GB/s after migration | The access-pattern argument, stated directly |
| TC-072 | German ISP forcing a US resolver, data centre crash | The resolver mechanism and its measurable consequence |
| TC-073 | IoT firmware update, 10,000 devices on one shard | Why a monotonic key concentrates writes, and why it migrates |
| TC-074 | Typo-squatted PyPI package, cryptominers in AWS | Resolution order, and why closing the fallback is the fix |
| TC-075 | 50 Gbps amplification attack, CPU from 100% to 5% | The allocation cost that makes early drops matter |

## Placement and cross-linking

| ID | Category | Content type | Outbound links |
|---|---|---|---|
| TC-071 | `cloud` | comparison | Egress costs, Kubernetes storage classes |
| TC-072 | `enterprise-networking` | comparison | BGP in the cloud, enterprise DNS security |
| TC-073 | `cloud` | explainer | Redis Cluster vs Sentinel |
| TC-074 | `devops` / CI/CD | explainer | Secrets in CI/CD, container image security |
| TC-075 | `enterprise-networking` | comparison | eBPF observability, pod networking packet flow |

## Repository change outside the content directory

Two of the new slugs collided with existing seeded like baselines, which
`tests/reactions.test.ts` catches by design:

- `aws-efs-vs-fsx-lustre-s3-mountpoint` derived to 1585, the same as
  `redis-cluster-vs-sentinel-architecture` (Batch 013).
- `github-actions-self-hosted-runner-security` derived to 1949, the same as the
  published `kubernetes-pod-disruption-budgets-eviction-mechanics`.

Both were resolved by the documented rule in `src/lib/reactions.seed.ts`: the
older article keeps its derived number and the newcomer moves to the next free
value. 1586 and 1951 were used — 1950 was skipped as too round, matching the
existing comment's reasoning. `SEED_DOMAIN` is unchanged, so **no existing
article's baseline moved**.

The two assertions in `tests/reactions.test.ts` that pin the override list were
updated to name the new entries, which is the workflow their own comments
describe. The collision test was generalised from one case to a table so a
future collision is one row rather than a rewrite. No assertion was weakened.

---

## Sources used for verification

**Amazon Web Services** — EFS performance specifications, FSx for Lustre user
guide, Mountpoint for Amazon S3 semantics and user guide, Route 53 routing
policies, Global Accelerator.
**IETF** — RFC 4786 (anycast operation), RFC 7871 (EDNS Client Subnet).
**Google** — EDNS Client Subnet in Google Public DNS.
**MongoDB** — data partitioning with chunks, choosing a shard key, the balancer,
refining a shard key, resharding a collection.
**GitHub** — security hardening for Actions, adding self-hosted runners, the
Actions Runner Controller project.
**OWASP Foundation** — Top 10 CI/CD Security Risks.
**Cilium** — BPF and XDP reference guide.
**The Linux Kernel Documentation** — AF_XDP.
**xdp-project** — XDP hands-on tutorial.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 103 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 220/220 |
| Readability gates | pass — 5/5 |
| Production build | pass |
| Source integrity | pass — `batch-014.md` unchanged |

None of the five raises a validator warning of its own. All are `draft: true`.
Nothing was committed, pushed or deployed.
