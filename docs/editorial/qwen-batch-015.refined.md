# Qwen Batch 015 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-015.md` |
| Source checksum (MD5) | `6664ec4837e65e6dede940c9cebbbf09` |
| Articles in batch | 5 |
| Refined | 4 |
| **Held** | **1 — TC-083** |
| Refined on | 2026-08-26 |

---

## TC-083 is held, and this is why

**TC-083, "Passkeys vs. Hardware Security Keys", was not written.** Its subject
is already covered by two published articles, and adding a third would split the
same topic across three URLs competing for one intent.

| TC-083 would cover | Already owned by |
|---|---|
| Synced versus hardware-bound credentials | `passkeys-enterprise-deployment-reality` — h2 "Two kinds of passkey, and the difference matters" |
| Attestation as an enterprise control | Same article — "Attestation is the third consideration, and it is a genuine trade-off" |
| Windows Hello and whether it syncs | Same article — a dedicated FAQ answering exactly this |
| AAGUID allow-listing | `fido2-discoverable-credentials-resident-keys` — h2 "Controlling which authenticators are allowed" |
| Phishing resistance of both types | `passkeys-enterprise-deployment-reality` — "Both types are phishing-resistant, because origin binding does not depend on where the key lives" |

There is a second reason. The draft's framing is out of date in a way the
existing article already gets right. TC-083 treats "passkey" and "hardware
security key" as opposites; current FIDO Alliance terminology makes both
passkeys — **device-bound** and **synced** — and the published article uses that
vocabulary throughout. Publishing TC-083 would reintroduce the confusion the
corpus has already resolved.

What genuinely new material TC-083 held — the WebAuthn PRF extension, and FIPS
language around hardware-bound tokens — is roughly two paragraphs. The right
home for it is an update to `passkeys-enterprise-deployment-reality`, not a new
article. That is left as a proposal rather than done here, because it modifies a
published article and was not in scope for this batch.

---

## Readability

Measured with `scripts/readability.cli.ts`. All four pass every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| TC-081 | `aws-transit-gateway-multicast-routing` | 981 | 70.3 | 73.2 | 68.8 | 72.6 | 10.2 | 22 |
| TC-082 | `postgresql-pitr-wal-archiving-lsn-mechanics` | 1087 | 71.4 | 100.8 | 71.1 | 71.8 | 11.4 | 33 |
| TC-084 | `kubernetes-topology-spread-constraints-vs-pod-anti-affinity` | 961 | 73.3 | 71.8 | 77.0 | 72.3 | 11.2 | 26 |
| TC-085 | `nvidia-mig-vs-mps-time-slicing-kubernetes` | 943 | 72.9 | 75.5 | 82.7 | 74.1 | 11.8 | 35 |

Average body 72.0. All four land above the 65–70 band.

This batch needed the heaviest readability work of any so far. TC-081 first
measured **53.9**, below even the 55 hard gate — the only article in five
batches to fail it. The cause was vocabulary density with nowhere to hide:
"multicast", "Transit Gateway", "attachment", "membership" and "IGMP" are all
three or more syllables, they are all required, and the subject forces them into
close proximity. Sentence splitting alone moved it to about 62. What finished
the job was replacing every non-technical polysyllable around them — "the native
answer" to "the built-in answer", "constraint" to "rule", "documents this
directly" to "says this plainly" — and cutting average sentence length to 10.2
words, the lowest in the corpus. No protocol name, timer or field was changed.

## Technical corrections made to the source

**TC-081 — Transit Gateway multicast.**
This article changed the most, because the draft's central scenario is not
possible. AWS documents that **multicast is not routed over Direct Connect,
Site-to-Site VPN, peering attachments or Connect attachments** — it works
between VPC attachments and nowhere else. The draft's worked example distributes
an exchange feed arriving over Direct Connect, which the service will not do,
and its FAQ states the opposite of the documentation by listing Direct Connect
and VPN as supported. Second, the draft recommends the feature for financial
trading feeds; AWS's own considerations say it **may not be suitable for
high-frequency trading or performance-sensitive applications**. Third, the draft
gives MTU figures per attachment type, where the documented behaviour is that a
transit gateway **does not fragment multicast at all** and drops fragmented
packets. Added, because all of it is documented and none of it was in the draft:
the two-minute query cadence and three-strike membership timeout, the twelve-hour
retention of the query list, the seven-minute grace period during a gateway
outage, the exact security group and ACL rules for IGMP protocol 2, that **only
static multicast supports IPv6**, and that non-Nitro instances cannot send.

**TC-082 — PostgreSQL PITR.**
One correction and one sharpening. The draft treats promotion as an optional
final step; **`recovery_target_action` defaults to `pause`**, so recovery stops
at the target and waits, and `pg_wal_replay_resume()` is what ends it. A team
following the draft would reach the target and conclude recovery had hung. The
draft also says PostgreSQL shuts down "to prevent data corruption" when `pg_wal`
fills; the documented behaviour is a **PANIC shutdown with no committed
transactions lost**, which is a materially less alarming and more accurate
statement. Added: that `restore_command` being asked for files that do not exist
is normal and must return non-zero, and `recovery_target_inclusive`.

**TC-084 — Spread constraints and anti-affinity.**
The draft says a hard anti-affinity rule blocks a node drain from completing.
It does not. **Eviction succeeds and the node goes away**; what fails is
scheduling the replacement. That inverts the operational lesson — the draft
describes a visible hang, where the real failure is silent under-replication
with nothing to alert on except a Pending pod. Added: that spread constraints
only count pods matching their own selector, so two deployments spreading
independently can still concentrate together.

**TC-085 — GPU sharing.**
Two corrections. The draft says MPS provides no memory isolation. **From Volta
each MPS client has its own GPU address space**, and CUDA 11.4 added
`CUDA_MPS_PINNED_DEVICE_MEM_LIMIT` and `CUDA_MPS_ACTIVE_THREAD_PERCENTAGE` — so
a noisy tenant can be bounded. What MPS lacks is **fault** isolation, which is a
different and more precise claim, and the article now makes that the deciding
row in the comparison. Second, the draft's example layout for an 80 GB card —
one 40 GB, two 20 GB and one 10 GB instance — needs **eight compute slices where
seven is the maximum**, so it cannot be built. The article replaces it with the
real profile table and the arithmetic constraint that produces MIG
fragmentation.

## Invented material removed

| ID | Removed | Replaced with |
|---|---|---|
| TC-081 | Trading floor, 200 instances, an $85,000 bill | The replication and metering mechanism, with a note to model it |
| TC-082 | IAM policy revoked on a Friday, 48 hours of lost WAL | Why a broken archive is silent until the disk fills |
| TC-084 | Black Friday, HPA scaling 3 to 10, dropped transactions | Why per-zone capacity shortages are ordinary, not exotic |
| TC-085 | Data scientist consuming 75 GB, node hard reset | What shared memory pools mean without a per-client cap |

## Link QA

Every source URL in the four published articles was checked and returns 200. The
draft's MPS, MIG and device plugin URLs resolve; the MIG citation was extended
with the device-names reference, which is where the profile table comes from.

## Placement and cross-linking

| ID | Category | Content type | Outbound links |
|---|---|---|---|
| TC-081 | `enterprise-networking` | explainer | Transit Gateway vs peering |
| TC-082 | `cloud` | explainer | Backup restore testing |
| TC-084 | `devops` / Kubernetes | comparison | Karpenter vs Cluster Autoscaler, pod disruption budgets |
| TC-085 | `ai-enterprise-it` | comparison | Model serving and the KV cache, Karpenter vs Cluster Autoscaler |

TC-085 is the first GPU infrastructure article in `ai-enterprise-it`, which
until now covered governance and adoption rather than the hardware underneath.

## Repository change outside the content directory

One further seed collision, handled by the same documented rule as Batch 014:
`aws-transit-gateway-multicast-routing` derived to 1889, matching the published
`ransomware-recovery-backups-immutable-ad-forest`. The published article keeps
1889; the new one takes 1891 (1890 skipped as too round). `SEED_DOMAIN` is
unchanged and no existing baseline moved. The override list and the collision
table in `tests/reactions.test.ts` were extended by one row each.

---

## Sources used for verification

**Amazon Web Services** — Transit Gateway multicast overview, multicast domains,
transit gateway quotas, Transit Gateway pricing.
**PostgreSQL Global Development Group** — continuous archiving and PITR,
recovery target settings, monitoring statistics.
**pgBackRest** — user guide.
**Kubernetes** — pod topology spread constraints, assigning pods to nodes, the
scheduler.
**NVIDIA** — Multi-Process Service documentation, MIG user guide, MIG device
names, the Kubernetes device plugin.
**FIDO Alliance and existing corpus** — used to assess the TC-083 overlap.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 107 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 220/220 |
| Readability gates | pass — 4/4 |
| Production build | pass |
| Source integrity | pass — `batch-015.md` unchanged |

None of the four raises a validator warning of its own. All are `draft: true`.
Nothing was committed, pushed or deployed.
