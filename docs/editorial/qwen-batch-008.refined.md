# Qwen Batch 008 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-008.md` |
| Source checksum (MD5) | `9c5c410467eb0f829de45b7e26a27078` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-23 |

All five were accepted. This is the first batch since 001 with no holds — the
five topics sit in areas the corpus had not touched, and the duplicate audit
found nothing close enough to argue about.

---

## Duplicate audit

Adjacency was measured by grepping the corpus for each article's core terms
rather than by comparing topic names.

| Term | Files in corpus before this batch |
|---|--:|
| Credential Guard, Secured-core, SASE, SSE, ZTNA, SD-WAN, vLLM, KV cache, PagedAttention, Eviction API, `tcp_retries2`, keepalive | 0 |
| HVCI | 1 |
| Pod Disruption / PodDisruptionBudget | 1 |

Two genuine adjacencies, both of which turned out to be complements rather than
overlaps:

**`wdac-vs-applocker-kernel-enforcement`** mentions HVCI once, and says
explicitly that App Control and memory integrity are separate features that can
ship independently. It owns application allowlisting; TC-036 owns the
VBS/VTL/Credential Guard side. They now cross-link.

**`karpenter-vs-cluster-autoscaler-node-scaling`** carries "pod disruption
budget Karpenter" as a secondary keyword and tells readers to write budgets
before enabling consolidation — but never explains what a budget does. It states
the prerequisite; TC-038 explains the mechanism. The natural pairing, and again
cross-linked. TC-038 deliberately does not re-explain consolidation.

Two boundaries were held deliberately rather than discovered:

- **TC-037 vs `postgresql-connection-pooling-pgbouncer-rds-proxy`.** The pooling
  article already notes that RDS Proxy "handles failover by holding client
  connections", and lists failover handling as a takeaway. That sentence is the
  seam. TC-037 explains why the application hangs at the socket layer and does
  not discuss pooling modes or connection limits.
- **TC-040 vs `local-llms-privacy` and the AI agent articles.** TC-040 is
  software mechanics of inference. It does not cover hardware selection,
  economics, orchestration or tool use. Note that `local-llms-privacy` is a
  **draft**, so it is not linked from anywhere in this batch.

---

## Article decisions

### TC-036 — Windows Server hardening

**REFINED.** `/windows/windows-server-hardening-secured-core-credential-guard`

Three corrections, one of which changes the article's recommendation.

**Credential Guard is not a domain controller control.** The source's conclusion
urges deployment "particularly [on] Active Directory domain controllers".
Microsoft's protection-limits page states that Credential Guard does not protect
the Active Directory database on a domain controller, and DCs are explicitly
excluded from default enablement. The refined article says so in a callout and
points at tiering and privileged access management instead.

**Much of this is already on.** The source frames the whole topic as a rollout.
From Windows Server 2025, Credential Guard is enabled by default on
domain-joined non-DC servers meeting the requirements — without UEFI lock, and
turning VBS on with it. That reframes the work from "deploy this" to "find out
what is already running and what broke quietly".

**Secure Boot is not a hard prerequisite for VBS to reach a running state.** The
source lists it as required. Microsoft's wording is that it is recommended for
stronger guarantees but not a hard prerequisite. The refined article keeps it in
the Secured-core requirements table, where it genuinely is required.

**Event ID corrected: 3087, not 3077.** The source's number is wrong and widely
repeated, so the article names both.

**Added:** the specific authentication breakage, which the source describes only
as "legacy applications". The real list is NTLMv1, MS-CHAPv2, Digest and CredSSP
losing SSO, plus Kerberos unconstrained delegation and DES being blocked — and
the two consequences that actually bite, MSCHAPv2 Wi-Fi/VPN and Hyper-V Live
Migration over CredSSP.

**Added:** the vulnerable driver blocklist, on by default since the Windows 11
2022 update. This answers the source's own verification note about BYOVD.

**Removed:** "5% to 10%" HVCI overhead and the claim that MBEC makes it
negligible. Neither is supported by a primary source, and performance claims of
that shape do not survive contact with a real workload.

### TC-037 — Database connection failover

**REFINED.** `/cloud/database-connection-failover-mechanics-timeouts`

**The source's central recommendation is wrong, and correcting it is the
article.** The draft's headline fix is aggressive TCP keepalives, claiming a
dead connection is then detected in about 110 seconds instead of 15 minutes.

Keepalive probes are sent only after a connection has been *idle*. A connection
with a query outstanding has unacknowledged data in flight and is therefore not
idle, so keepalive timers never apply to it. That case is governed by
retransmission and `tcp_retries2`. Tuned keepalives clean up idle pooled
connections — useful, but not the hang people are trying to fix.

The control that does cover it is `TCP_USER_TIMEOUT`, which the source never
mentions. The refined article makes the distinction the spine of the piece and
carries a table mapping each failure to the mechanism that governs it.

**Corrected:** `tcp_retries2` at its default of 15 gives roughly 13 to 30
minutes per the manual page, not the source's "13 to 15 minutes".

**Removed:** the fabricated incident — named platform, 45-second failover,
30-second cache, CrashLoopBackOff, a specific wrapper driver as the fix. None of
it is verifiable and the specificity implies measurement that did not happen.
The DNS and driver mechanics it illustrated are kept as mechanics.

**Kept and sharpened:** the warning about drivers that silently reconnect
mid-transaction. It is the strongest point in the source.

### TC-038 — Pod Disruption Budgets

**REFINED.** `/devops/kubernetes-pod-disruption-budgets-eviction-mechanics`

**Corrected, and it inverts the source's advice.** The draft says percentages
round up "effectively rounding down the allowed disruptions", presenting rounding
as protective in both directions. Both do round up, but the effects are
opposite: rounding up `minAvailable` raises the floor and protects more, while
rounding up `maxUnavailable` raises the ceiling and permits more. The Kubernetes
documentation states directly that a disruption can exceed the `maxUnavailable`
percentage you defined.

**Corrected:** the source says a PDB selecting pods from a custom operator will
block evictions forever. Custom controllers exposing the scale subresource have
been supported since v1.15. The real failure is a selector matching pods that
*nothing* can recreate — bare pods, completed Jobs — which the article now says
precisely.

**Softened:** the DaemonSet claim. The documentation does not list DaemonSet
among supported controllers; it does not say PDBs are ignored for DaemonSet
pods. The article does not overstate this.

**Dropped:** "Kubernetes allows minAvailable: 100% only if the application has a
single replica", which is garbled and unsupported.

**Removed:** the Kafka scenario with its five brokers, ten-minute gap and named
AZ shortage. The underlying mechanism — an evicted pod stuck Pending keeps the
budget from allowing the next eviction — is preserved as the second deadlock
mode, which is where it belongs.

### TC-039 — SASE, SSE and SD-WAN

**REFINED.** `/enterprise-networking/sase-vs-sse-sd-wan-architecture-reality`

**Removed: the vendor classification.** The source names Palo Alto and Fortinet
as native SASE and Zscaler and Cisco as bolted-on, and describes traffic being
processed "within the same memory space of the edge server" at named vendors.
That is a market-positioning claim, not a documented architecture, and the
source's own verification note flags that M&A makes it unstable.

It is replaced with something more useful and more durable: the questions that
separate an integrated platform from a bundled one regardless of who is selling.
Where is a session decrypted; can one policy express both a path preference and
an inspection rule; can you see one trace crossing both planes.

**Removed:** "PoPs within 20-30 milliseconds" and "400 milliseconds to perform
deep packet inspection". Both are invented thresholds.

**Kept:** hairpinning, reframed as a property of paths and peering rather than of
a product category, and the TLS-inspection root CA problem, with the managed
versus unmanaged distinction the source's verification note asked for.

### TC-040 — Model serving infrastructure

**REFINED.** `/ai-enterprise-it/ai-model-serving-infrastructure-kv-cache-vllm`

**Removed: every fabricated benchmark.** "GPU utilisation hovered around 20-30%",
"150 concurrent users", "compute utilisation spiked to 85%", "50 employees"
during a town hall. None is measured and all of it reads as data.

**Attributed rather than asserted:** the 2–4× throughput figure is real, and it
is the PagedAttention paper's claim against FasterTransformer and Orca. The
article says so, and adds the caveat that a stack already using paged memory
will not see it again.

**Hardware figures given by magnitude.** The source quotes 3,400 GB/s for one
accelerator and 2,039 GB/s for another, and "roughly 64 GB/s" for PCIe Gen 4 —
which is the bidirectional aggregate, about half that per direction. Rather than
correct three numbers that will age, the article states the ratio: on-package
memory is one to two orders of magnitude faster than the host link. That is the
fact the argument needs.

**Kept:** the prefill/decode split, the fragmentation explanation, the 16-token
default block, continuous batching, and the two-directional cost of long context
— quadratic in prefill, linear in cache. This is the strongest source in the
batch and most of it survived.

---

## Internal links added

Every article links out, so none is a dead end.

| Article | Links to |
|---|---|
| TC-036 | `wdac-vs-applocker-kernel-enforcement` |
| TC-037 | `postgresql-connection-pooling-pgbouncer-rds-proxy` |
| TC-038 | `kubernetes-storage-classes-costs-performance-traps`, `karpenter-vs-cluster-autoscaler-node-scaling` |
| TC-039 | `zero-trust-network-segmentation`, `enterprise-dns-security-doh-dot-filtering` |
| TC-040 | `enterprise-ai-agents-security-governance-reality` |

No link targets a draft from a published article — all five are themselves
drafts, consistent with Batch 007.

---

## Reaction baselines

Checked before the files were written, per the workflow.

| Slug | Derived baseline |
|---|--:|
| `windows-server-hardening-secured-core-credential-guard` | 2124 |
| `database-connection-failover-mechanics-timeouts` | 1532 |
| `kubernetes-pod-disruption-budgets-eviction-mechanics` | 1949 |
| `sase-vs-sse-sd-wan-architecture-reality` | 2446 |
| `ai-model-serving-infrastructure-kv-cache-vllm` | 1546 |

All distinct, all inside the band, none a multiple of 50, and no collision with
any of the 72 existing slugs. **`SEED_OVERRIDES` is unchanged.** The only entry
remains the pre-existing 2233 collision resolved in Batch 007.

---

## Topic boundary register — additions

**Windows kernel security** — `wdac-vs-applocker-kernel-enforcement` owns
application allowlisting. TC-036 owns virtualization-based security: trust
levels, Credential Guard, memory integrity, Secured-core hardware. Both mention
the other; neither explains it.

**Database failure behaviour** — three articles, three layers.
`postgresql-connection-pooling-pgbouncer-rds-proxy` owns pooling modes and
connection limits. `aurora-serverless-v2-scaling-connection-limits` owns capacity
scaling. TC-037 owns what the client's socket does when the server disappears.

**Kubernetes disruption** — `karpenter-vs-cluster-autoscaler-node-scaling` owns
why a node is chosen for removal. TC-038 owns whether the eviction is permitted.
Same event, two halves, cross-linked.

**Network access architecture** — `zero-trust-network-segmentation` owns internal
zone design. TC-039 owns the cloud-delivered edge and per-application access.
Distinct from IPv6 and BGP, which own addressing and routing.

**AI infrastructure** — TC-040 owns inference mechanics and GPU memory. Nothing
else in the corpus does. Distinct from the agent articles, which own
orchestration and governance, and from the drafted local-LLM piece, which owns
hardware economics.

---

## Sources used for verification

**Microsoft Learn** — Credential Guard overview and default enablement; how
Credential Guard works, including protection limits; configure Credential Guard;
memory integrity and VBS enablement; recommended driver block rules; Secured-core
server and its hardware requirements.
**Linux man-pages** — tcp(7) for `tcp_retries2`, `TCP_USER_TIMEOUT` and keepalive
semantics.
**PostgreSQL** — libpq connection strings, multi-host and `target_session_attrs`.
**AWS / Microsoft Learn** — Aurora PostgreSQL fault tolerance; Azure Database for
PostgreSQL high availability.
**Kubernetes** — disruptions; configuring a disruption budget; safely drain a
node; kube-state-metrics PDB metrics.
**NIST / CISA / Gartner / Cloudflare** — SP 800-207; Zero Trust Maturity Model;
SASE glossary definition; vendor-neutral SASE architecture material.
**SOSP 2023 / vLLM / NVIDIA** — the PagedAttention paper; vLLM documentation;
TensorRT-LLM in-flight batching.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 77 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass |
| Production build | pass |
| Source integrity | pass — `batch-008.md` unchanged |

`readingMinutes` was set from the validator's own output rather than estimated:
6 for TC-036, TC-037 and TC-038; 5 for TC-039 and TC-040.

---

## Readability

Measured with the repository's own `scripts/readability.cli.ts`. All five pass
every frozen gate: standfirst ≥70, FAQ ≥70, opening ≥65, body ≥55, average
sentence ≤15 words, longest ≤35.

| ID | Flesch | FK grade | Words | Sentences | Avg sentence | Longest |
|---|--:|--:|--:|--:|--:|--:|
| TC-036 | 56.7 | 7.8 | 1218 | 122 | 10.0 | 26 |
| TC-037 | 64.0 | 7.5 | 1227 | 97 | 12.6 | 28 |
| TC-038 | 61.2 | 7.7 | 1205 | 102 | 11.8 | 29 |
| TC-039 | 61.4 | 7.7 | 1175 | 96 | 12.2 | 29 |
| TC-040 | 65.4 | 6.5 | 1208 | 128 | 9.4 | 23 |

The first draft of all five failed. Body scores started between 50.2 and 61.7,
and 0/5 passed. Three passes fixed it, and the work was almost entirely
structural rather than lexical: splitting multi-clause sentences into one idea
each, expanding an acronym once and then using the short form, and replacing
general-purpose long words while leaving the technical vocabulary alone.

**TC-036 remains the weakest at 56.7, and stays there deliberately.** Its subject
carries the batch's densest unavoidable vocabulary — hypervisor isolation,
credential protocols, virtual trust levels. It clears the body gate with room to
spare. The remaining distance to the upper band could only be bought by removing
terms the article needs.

### A bug found in the measurement tool

TC-038 reported a 45-word sentence that did not exist. The abbreviation guard in
`scripts/readability.ts` protects `No.` — as in "Number" — but matches
case-insensitively. A sentence ending "…the party that can say **no.**"
therefore never splits, and merges with the sentence after it.

The article was reworded rather than the tool changed. Fixing the regex is
outside this batch's scope and would shift every score in the corpus. It is worth
fixing separately, because any article ending a sentence in "no" is currently
measured wrongly.

Nothing was committed, pushed or deployed.
