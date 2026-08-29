# Qwen Batch 004 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-004.md` |
| Source checksum (MD5) | `44f475633584c1d1c151fb2de56d91bb` |
| Articles in batch | 5 |
| Refined and published | 5 |
| Held | 0 |
| Refined on | 2026-08-23 |

---

## Gate results

| Article | Body | Standfirst | Opening | Worst FAQ | ASL | Longest |
|---|--:|--:|--:|--:|--:|--:|
| `aws-transit-gateway-vs-vpc-peering` | 59.0 | 96.6 | 65.6 | 72.6 | 13.4 | 32 |
| `fido2-discoverable-credentials-resident-keys` | 58.6 | 84.0 | 88.3 | 71.8 | 12.7 | 35 |
| `wdac-vs-applocker-kernel-enforcement` | 58.3 | 70.3 | 82.5 | 71.8 | 11.6 | 34 |
| `aurora-serverless-v2-scaling-connection-limits` | 55.2 | 70.1 | 68.3 | 74.0 | 13.3 | 33 |
| `karpenter-vs-cluster-autoscaler-node-scaling` | 65.4 | 85.4 | 91.4 | 74.5 | 11.5 | 32 |

The FIDO2 and App Control articles were the hardest of the corpus so far. Both
have subject vocabulary — *discoverable credential*, *authenticator*,
*application control*, *code integrity* — that is unavoidable and expensive in
syllables. Neither had terminology removed. Both were brought over the line by
shortening sentences and by using the concrete noun where the referent was
genuinely concrete (a hardware key is a key; the general concept stays an
authenticator).

---

## Article 1 — Transit Gateway vs VPC peering

**REFINED.** `/cloud/aws-transit-gateway-vs-vpc-peering` · backlog `cloud-22`

**Corrections.** Pricing removed. The peering quota claim was
self-contradictory — it named a figure as a hard limit and then said quota
increases were available — so it is now described relative to what a growing
mesh needs. The draft also offered *Transit Gateway multicast* as part of the
fix for stateful firewall asymmetry; multicast is unrelated to that problem and
appliance mode is the actual mechanism.

**Kept:** the mesh arithmetic. It is arithmetic, it is checkable, and it is the
strongest argument in the piece.

---

## Article 2 — FIDO2 discoverable credentials

**REFINED.** `/cybersecurity-ciso/fido2-discoverable-credentials-resident-keys`
· backlog `sec-109`

**Overlap audit — the one that needed care.** This sits directly beside the
published passkeys article. Checking rather than assuming was worth it: the
published piece mentions discoverable credentials, resident keys and storage
slots **zero times**. The gap is real.

The boundary is now explicit. This article covers the discoverable versus
non-discoverable distinction, hardware slot limits, the user handle constraint
and AAGUID restriction. Device-bound versus synced passkeys, recovery, and
service accounts belong to `sec-106` and are not repeated.

**Corrections.** Slot capacities were made qualitative — they vary by model and
firmware, and a number here would be wrong for some readers. The terminology
note the draft's own QA section asked for is now a callout: resident key and
discoverable credential are the same thing under two names.

**Kept and strengthened:** the shared-kiosk scenario, which is the clearest
argument in the draft. Discoverable credentials assume one person with many
services; a pooled device is many people with one service, which is the opposite
shape.

---

## Article 3 — App Control vs AppLocker

**REFINED.** `/windows/wdac-vs-applocker-kernel-enforcement` · backlog `win-66`

**Verified against Microsoft Learn.** Four corrections, one of them the product
name:

1. **WDAC is now App Control for Business.** The draft used the old name
   throughout. Both names are noted, since tooling still uses the old one.
2. **AppLocker is not deprecated.** The draft said Microsoft was "actively
   deprecating" it. Microsoft's actual position: it still ships, still receives
   security fixes, receives no new features, and is documented as a
   defence-in-depth feature rather than a defensible security boundary. That is
   more precise and more useful than "deprecated" — and it is the second time in
   this corpus a draft has asserted a deprecation that is not one.
3. **AppLocker complements App Control.** The draft framed this as migrate and
   abandon. Microsoft describes using both: App Control policies apply
   device-wide, while AppLocker can differentiate between users on a shared
   device. That is a capability App Control does not have.
4. **Reputation trust is the Intelligent Security Graph, not SmartScreen.** The
   draft's name would send readers to the wrong documentation.

**Added:** the memory integrity relationship, and the documented behaviour where
Defender Antivirus moves to passive mode when reputation trust runs alongside a
third-party scanner — expected, and alarming if you have not been told.

---

## Article 4 — Aurora Serverless v2

**REFINED.** `/cloud/aurora-serverless-v2-scaling-connection-limits` · backlog
`cloud-23`

**The most version-dependent draft so far.** Almost every number in it was
either unverifiable or looked wrong:

- The ACU-to-memory ratio given did not match AWS's description of a capacity
  unit, and the derived memory figures followed from it.
- The ACU ceiling, the connection formula and the per-capacity connection counts
  are all engine- and version-specific.
- The draft's central framing — that v2 **cannot** scale to zero and the minimum
  is fixed — is presented as a permanent architectural property. Minimum-capacity
  behaviour has changed since launch.

Rather than update numbers I could not confirm, the article was rewritten around
the mechanism, which is what survives: capacity is memory, memory sets the
connection ceiling, so the connection limit moves as the database scales. That
argument needs no figures. A callout flags the minimum-capacity behaviour as
version-dependent and tells the reader to check current documentation.

---

## Article 5 — Karpenter vs Cluster Autoscaler

**REFINED.** `/devops/karpenter-vs-cluster-autoscaler-node-scaling` · backlog
`devops-20`

**Corrections.** A spot savings percentage and an invented recovery time were
removed. The Azure equivalent was called "Karpenter-AKS"; it is node
autoprovisioning, built on Karpenter.

**Slug changed during validation, for a reason worth recording.** The original
slug `karpenter-vs-cluster-autoscaler-node-provisioning` derived a seeded like
baseline of exactly 2,100, which `tests/reactions.test.ts` rejects as an obvious
round number.

The first fix attempted was a `SEED_OVERRIDES` entry, which the seed module
documents as the mechanism for exactly this. That failed a second test: the
independent-implementation check asserts every article matches the pure
derivation, and does not account for overrides. The two tests are in tension —
one forbids round numbers, the other forbids deviation from the hash.

Changing my own unpublished slug resolves it without weakening either test, so
that is what was done. The new slug derives 2,403. Worth knowing for future
batches: **if a slug lands on a multiple of 50, change the slug, not the seed.**

---

## Cumulative topic boundary register

Recorded so later batches do not re-cover ground. Twenty-two articles refined
across four batches.

**Kubernetes** — three articles, no overlap by construction:
`kubernetes-pod-networking-packet-flow` is the packet path;
`kubernetes-storage-classes-costs-performance-traps` is storage provisioning;
`karpenter-vs-cluster-autoscaler-node-scaling` is node compute. StatefulSets,
ordinals, per-replica claims and pod identity remain **unclaimed** and belong to
the batch-011 draft.

**AWS networking** — three layers, deliberately separated:
`aws-transit-gateway-vs-vpc-peering` is VPC-to-VPC topology;
`aws-vpc-lattice-vs-api-gateway-service-networking` is service-level routing;
`bgp-in-the-cloud-why-it-matters` is hybrid connectivity and BGP.

**Cloud cost** — `cloud-egress-costs-architecture-problem` owns data transfer
boundaries; `cloud-cost-controls` (published earlier) owns organisational
controls. Storage and database cost sit inside their own articles rather than
being pulled into either.

**Identity and tokens** — five articles with distinct questions.
`entra-id-vs-active-directory-differences`: how two directories differ.
`passkeys-enterprise-deployment-reality`: rollout, recovery, what passkeys do
not cover. `fido2-discoverable-credentials-resident-keys`: discoverable versus
non-discoverable, slots, user handle. `saml-federation-security-risks-trust-boundaries`:
what federation asks you to trust. `oauth2-token-theft-dpop-mechanics`: bearer
tokens and sender-constrained tokens. The shared theme — a bearer credential
authenticates the token, not the holder — is named in the DPoP article and
cross-linked rather than re-argued.

**Windows endpoint** — `windows-laps-entra-id-architecture-deployment` is local
admin credentials; `wdac-vs-applocker-kernel-enforcement` is application
control. No overlap.

**CI/CD and agents** — `secrets-management-cicd-vault-oidc-reality` is pipeline
credentials; `enterprise-ai-agents-security-governance-reality` is agent tool
access. Both touch delegated authorisation and link to each other.

**Still held, undecided:** `zero-trust-network-segmentation-boundaries` and
`intune-vs-group-policy-migration-reality` (batch 002),
`linux-ebpf-security-monitoring-kernel-probes` and
`kubernetes-gateway-api-vs-ingress-migration` (from the original corpus audit),
`windows-autopilot-troubleshooting-oobe-failure` (batch 001, rejected).

---

## Sources used for verification

**Microsoft Learn** (via documentation search) — Application Control for
Windows; App Control and AppLocker overview; feature availability; managed
installers; App Control and virtualisation-based protection; AppLocker overview;
App Control for PowerShell.
**Amazon Web Services** — Transit Gateway; transit gateway route tables;
appliance mode; VPC peering; VPC quotas; Aurora Serverless v2; RDS Proxy; Aurora
connection management; EKS best practices for autoscaling.
**W3C** — WebAuthn Level 2.
**FIDO Alliance** — CTAP specifications; passkeys.
**Karpenter / Kubernetes** — NodePools; disruption and consolidation; Cluster
Autoscaler FAQ; pod disruption budgets.

---

## Validation at completion

| Gate | Result |
|---|---|
| TypeScript | pass — no diagnostics |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 215/215 |
| Content validation | pass — 58 articles, 0 errors |
| Readability gates | pass — 5/5 this batch, 22/22 cumulative |
| Production build | pass |

URL pin updated 41 → 46 after confirming the change was purely additive.

Nothing was committed, pushed or deployed.
