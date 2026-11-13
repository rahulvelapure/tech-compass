# Qwen Batch 010 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-010.md` |
| Source checksum (MD5) | `7163997d7bbfcbc2398ed9073055390e` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-24 |

---

## Readability

Measured with `scripts/readability.cli.ts`. All five pass every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| TC-046 | `kafka-consumer-groups-rebalance-exactly-once` | 1165 | 67.3 | 77.0 | 68.1 | 74.0 | 10.0 | 28 |
| TC-047 | `istio-ambient-mesh-sidecarless-architecture` | 1073 | 65.5 | 81.9 | 80.3 | 72.3 | 10.4 | 27 |
| TC-048 | `linux-security-modules-selinux-apparmor-seccomp-containers` | 1094 | 66.8 | 70.1 | 70.5 | 70.5 | 9.5 | 25 |
| TC-049 | `azure-managed-identities-vs-app-registrations-secrets` | 1078 | 65.7 | 86.7 | 83.9 | 70.8 | 9.5 | 31 |
| TC-050 | `tcp-congestion-control-bbr-vs-cubic-cloud-networks` | 1097 | 65.9 | 90.7 | 78.6 | 70.9 | 12.2 | 27 |

**All five sit inside the 65-70 editorial target.** Average 66.2, lowest 65.5.

Getting there took three passes and the progression is worth recording:

| ID | First draft | After pass 1 | After passes 2-3 |
|---|--:|--:|--:|
| TC-046 | 63.2 | 63.5 | **67.3** |
| TC-047 | 58.5 | 59.1 | **65.5** |
| TC-048 | 54.7 | 57.3 | **66.8** |
| TC-049 | 48.7 | 57.5 | **65.7** |
| TC-050 | 65.0 | 65.9 | 65.9 |

The first pass fixed the standfirst, opening and FAQ tiers, which is what the
validator gates. That left the body prose largely untouched, and the body is
where the remaining distance was.

The second and third passes worked from a per-block score rather than from
instinct. That surfaced the real problem: a handful of paragraphs carrying
sentences of 17 to 29 words, several in passive voice. Splitting those and
converting to active voice moved TC-048 by 9.5 points and TC-049 by 8.2.

**No technical term was removed to raise a score.** `securityContext`,
`appArmorProfile`, `user-assigned managed identity`, `federated identity
credential`, seccomp, eBPF, ztunnel, BBR and CUBIC all appear exactly as before.
What changed around them: long sentences split at clause boundaries, passive
constructions made active, introductory clauses dropped, and repeated
explanations removed. Where an FAQ answer was dominated by an API name, the exact
name stayed in the body — where a reader needs it to search and configure — and
the short answer was phrased around it.

## Overlap decisions

**TC-047 against `service-mesh-mtls-operational-overhead`.** That article owns the
operational cost of running mTLS in a mesh. This one owns the architectural
change that moves where the cost lands. Complementary, cross-linked.

**TC-047 against `kubernetes-network-policy-default-deny-implementation`** (batch
009). Mesh identity policy and CNI packet policy are different controls. The
article says so explicitly rather than leaving the reader to assume overlap.

**TC-049 against `eks-pod-identity-vs-irsa-migration`.** The same pattern on a
different cloud — a Kubernetes-issued token exchanged for cloud credentials.
They cross-link, and neither re-explains the other's platform.

**TC-048 against `linux-ebpf-security-monitoring-kernel-probes`** (batch 009).
Adjacent only through classic BPF, which this article uses to make a correction
rather than to cover the same ground.

**TC-046 and TC-050** have no corpus adjacency. Kafka and congestion control were
both absent entirely.

---

## Technical corrections

### TC-046 — Kafka

**The exactly-once cost figure was removed.** The source states that enabling it
reduces cluster throughput by 20 to 40 per cent. No measurement supports one
figure across workloads; the cost depends on transaction size, throughput and
topology. The article explains each source of overhead and says to measure it.

**Session timeout guidance was updated.** The modern client default is 45 seconds.
Widely copied advice recommending 10 seconds predates that change and produces
exactly the spurious rebalances the newer default avoids.

**A two-step upgrade note was added.** Switching assignors cannot be done in one
deployment, because group members must agree on the protocol. The source presents
it as a single configuration change.

**The telemetry incident was removed**, along with its fleet size, pause duration
and recovery time.

### TC-047 — Istio ambient

**Every resource figure was removed.** Per-sidecar memory and CPU, a claimed
percentage of total cluster compute, and a migration that supposedly cut a
hundred vCPUs to two. None is attributable, and all depend on traffic shape.

**GA status is not asserted.** The source's verification note asks whether ambient
is fully GA. The article describes capabilities and maturity of specific features
instead, which does not go stale the same way.

**A failure-domain warning was added.** The source presents ambient as a
straightforward win. A per-node proxy means one failure affects every pod on that
node, which is a wider blast radius than a sidecar and belongs in the trade-off.

**The Envoy filter constraint is stated plainly.** ztunnel is not Envoy, so
existing Envoy configuration does not apply to it. That is a migration blocker
worth finding during planning.

### TC-048 — Linux security modules

**seccomp does not use eBPF.** The source says it does. seccomp filters are
classic BPF: small, self-imposed, no maps or helpers. eBPF is the newer subsystem
and loading it is privileged. The two have shared ancestry and different threat
models, and the article makes the distinction explicitly because the conflation
is common.

**The AppArmor annotation is deprecated.** The source gives
`container.apparmor.security.beta.kubernetes.io/` as the way to apply a profile.
From Kubernetes v1.30 it is a `securityContext.appArmorProfile` field. Most
examples online still show the annotation.

**Syscall counts were removed.** The source says the default profile blocks about
44 calls and flags the number for verification. The profile changes between
runtime releases, so the article describes what it blocks rather than counting.

**The `:Z` mount suffix is scoped correctly.** It is a Docker and Podman feature,
not Kubernetes. The source's own verification note raises this doubt.

**The crypto-miner escape scenario was removed.**

### TC-049 — Azure managed identities

**The source's own correction is wrong.** Its verification note concludes that
GitHub Actions cannot federate to a managed identity and must use an app
registration. Microsoft documents federated identity credentials on user-assigned
managed identities for GitHub Actions, and recommends that path in its own
deployment guidance. The article states the correct position and flags the
outdated claim, because it is widely repeated.

**The leaked-credential incident was removed** and replaced with the mechanism
that makes the risk real.

**A gap the source misses was added.** Adopting workload identity does not close
the node metadata endpoint. Pods can still reach it and inherit the node identity
until it is blocked.

### TC-050 — TCP congestion control

**Kernel version claims for later BBR revisions were removed.** The source pins
BBRv2 and BBRv3 to specific releases. Mainline availability has differed from the
versions under active development, and a specific number would age badly. The
article describes behaviour by revision rather than by kernel version.

**The replication incident was removed**, with its loss rate, throughput figures
and the claim that lag fell from fifteen minutes to eighty-five milliseconds.

**Pacing is given its own section.** The source lists the queueing discipline as
step three of four. Enabling BBR without pacing is worse than not enabling it,
which makes it a precondition rather than a step.

**A diagnostic caution was added.** Congestion control is an appealing
explanation, and socket buffer limits, application bottlenecks and shapers
produce the same throughput graph.

---

## Internal links

| ID | Body links | relatedSlugs |
|---|---|---|
| TC-046 | `database-connection-failover-mechanics-timeouts` | that + `kubernetes-storage-classes-costs-performance-traps` |
| TC-047 | `kubernetes-network-policy-default-deny-implementation`, `service-mesh-mtls-operational-overhead` | both |
| TC-048 | `container-image-security-beyond-scanning` | `linux-ebpf-security-monitoring-kernel-probes` + that |
| TC-049 | `eks-pod-identity-vs-irsa-migration`, `secrets-management-cicd-vault-oidc-reality` | both |
| TC-050 | `cloud-egress-costs-architecture-problem` | `bgp-in-the-cloud-why-it-matters` + that |

---

## Reaction baselines

Checked before writing.

| Slug | Baseline |
|---|--:|
| `kafka-consumer-groups-rebalance-exactly-once` | 2463 |
| `istio-ambient-mesh-sidecarless-architecture` | 1577 |
| `linux-security-modules-selinux-apparmor-seccomp-containers` | 2380 |
| `azure-managed-identities-vs-app-registrations-secrets` | 1563 |
| `tcp-congestion-control-bbr-vs-cubic-cloud-networks` | 2117 |

All distinct, in band, none a multiple of 50, no collision against the 83
existing slugs. **`SEED_OVERRIDES` is unchanged.**

---

## Sources used for verification

**Apache Kafka** — consumer configuration, consumer position and group
membership, delivery semantics and transactions, KIP-429.
**Istio** — ambient mode overview, ztunnel architecture, waypoint proxy, data
plane and HBONE.
**Kubernetes** — seccomp tutorial, AppArmor tutorial, Pod Security Standards.
**Linux kernel** — seccomp BPF filter documentation, networking and TCP.
**Red Hat** — SELinux container confinement.
**Microsoft Learn** — managed identities overview, how managed identities work on
virtual machines, workload identity federation concepts, federated credentials on
user-assigned managed identities, AKS workload identity.
**IETF** — RFC 8312 (CUBIC), RFC 5681 (TCP congestion control).
**ACM Queue** — the BBR design paper.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 88 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 220/220 |
| Readability gates | pass — 5/5 |
| Production build | pass |
| Source integrity | pass — `batch-010.md` unchanged |

One test run exited non-zero while a production build was running concurrently;
two clean runs afterwards passed 220/220. That is the resource-contention flake
the explicit timeouts in `tests/reactions.test.ts` were added for, not a
regression.

All five are `draft: true`. Nothing was committed, pushed or deployed.
