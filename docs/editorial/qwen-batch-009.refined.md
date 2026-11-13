# Qwen Batch 009 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-009 .md` (note the space before the extension) |
| Source checksum (MD5) | `04a61e1262c21fa14d992efd5d2e199d` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-24 |

---

## Readability

Measured with `scripts/readability.cli.ts`. All five pass every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| TC-041 | `linux-ebpf-security-monitoring-kernel-probes` | 1182 | 66.0 | 77.7 | 66.7 | 73.5 | 10.7 | 28 |
| TC-042 | `entra-external-id-b2b-b2c-cross-tenant-access` | 1320 | 60.0 | 75.4 | 81.4 | 71.3 | 11.7 | 33 |
| TC-043 | `kubernetes-network-policy-default-deny-implementation` | 1259 | 56.0 | 77.4 | 66.6 | 72.5 | 11.0 | 30 |
| TC-044 | `post-quantum-cryptography-nist-migration-enterprise` | 1251 | 56.9 | 90.1 | 88.6 | 72.4 | 11.4 | 32 |
| TC-045 | `windows-365-vs-azure-virtual-desktop-architecture` | 1182 | 59.9 | 86.7 | 97.4 | 74.0 | 13.4 | 31 |

First measurement was 0/5. Two passes fixed it, entirely by shortening sentences
in the standfirst, opening and FAQ tiers and replacing general-purpose long words.
No technical term was removed to raise a score.

**TC-043 and TC-044 sit at 56.0 and 56.9 body.** Both clear the gate and both are
below the 65 preference. Their vocabulary is the reason: NetworkPolicy carries
namespace, ingress, egress and selector on nearly every line, and the PQC article
cannot avoid cryptography, encapsulation and standardisation. Further gain would
mean removing terms the reader needs.

---

## Overlap decisions

**TC-041 was re-scoped rather than written as specified.** The source claims
"no prior coverage of eBPF." That is wrong: `ebpf-production-observability-security-boundaries`
already covers the execution model, the verifier, hook points, BTF, maps and the
capability boundary. Writing the source as given would have duplicated six of its
sections.

The article is now scoped to what that one does not cover: the offensive use of
eBPF, and the controls that defend the subsystem itself. Mechanism is referenced
rather than repeated, and the two cross-link. It also moved from `devops` to
`cybersecurity-ciso` so the categories signal the split.

**TC-043 against `kubernetes-pod-networking-packet-flow`.** That article owns how
a packet moves between pods. This one owns whether it is permitted to. Adjacent,
cross-linked, no shared explanation.

**TC-042 against `conditional-access-framework`.** Conditional Access owns policy
structure for internal users. This owns the external identity model and the
trust delegated to a tenant you do not run.

**TC-044 and TC-045** have no adjacency in the corpus.

---

## Technical corrections

### TC-041 — eBPF

**BPFDoor is misdated.** The source says it was "discovered in 2024." PwC
documented it in a 2021 report and detailed public analysis followed in May 2022.
The article states the correct dating and notes it is commonly repeated wrongly.

**The verifier framing is sharpened.** The source treats verifier bypass CVEs as
the main risk. The larger point is structural: a correctly verified program can
still be malicious. The verifier proves bounds and termination, not intent. That
distinction is now the section.

**Kernel version claims were reduced.** The source pins BPF token support to a
specific release. Signed-program support is described by capability instead,
because it is still moving.

### TC-042 — Entra External ID

**All pricing removed.** The source quotes a monthly-active-user free tier and
tiered pricing. Microsoft revises these, the source flagged them for verification,
and a stale price in an architecture article invites the wrong decision. The
billing *model* is described, the numbers are not.

**The breach narrative was replaced.** The source tells a story about an expired
partner domain being re-registered, with specific user counts and a named outcome.
The mechanism is real and worth explaining; the incident is not documented. The
article now explains why delegated authentication to a lapsed domain is dangerous,
without inventing a victim.

**Device compliance is corrected.** The source implies you can require your own
compliance policy on a guest device. You cannot — the device belongs to their
organisation. You can accept a trusted partner's device signal, which is a weaker
control, and the article says so rather than treating them as equivalent.

### TC-043 — NetworkPolicy

**Latency figures removed.** The source quotes per-packet overhead for iptables
and eBPF enforcement. Neither is attributable and both depend entirely on rule
count, kernel and workload.

**Kernel and release versions softened.** The source pins Calico's eBPF dataplane
to a specific kernel. Capability is described instead, because these move.

**The silent-failure framing is kept and strengthened.** It is the most valuable
claim in the source and it is correct: an unenforced policy is indistinguishable
from an enforced one through the API. The article adds the verification procedure.

### TC-044 — Post-quantum cryptography

**FIPS 206 is not finalised.** The source says NIST expects to finalise FN-DSA in
2025. NIST's project page still describes Falcon standardisation as underway.

**HQC is missing from the source.** It has been selected as an additional
key-encapsulation mechanism, on a different mathematical basis to the lattice
schemes. That matters for anyone planning a portfolio rather than one algorithm,
and it is now included.

**RFC 9180 is the wrong citation.** The source attributes X25519MLKEM768 to it.
RFC 9180 is hybrid public key encryption. The hybrid TLS group comes from the
IETF ECDHE-MLKEM work. The article names the correct source and flags the error,
because it circulates.

**Library version claims removed.** The source states ML-KEM support arrived in a
specific OpenSSL version. That is version-sensitive and was not verifiable to the
standard used here.

**Qubit estimates removed.** The source quotes a figure for breaking RSA-2048.
Published estimates have moved by orders of magnitude as error correction improved.
The article explains why the estimate is not the input to the decision — the
confidentiality lifetime of the data is.

### TC-045 — Windows 365 and AVD

**Windows 365 does support GPU Cloud PCs.** The source states it does not, and
flags it for verification. Microsoft documents four GPU offerings across dedicated
and shared modes. This is the correction most likely to change a reader's decision.
The article adds the caveat that GPU Cloud PCs do not support nested virtualization.

**The size ceiling is outdated.** The source caps Windows 365 at 16 vCPU and
64 GB. Larger non-GPU sizes are documented. Anyone who ruled the platform out on
capacity grounds was working from a stale figure.

**All pricing removed.** The source quotes per-user monthly and per-hour compute
costs, flagged for verification. The cost *models* are contrasted instead, along
with the point the source misses: AVD's compute saving has to cover the
engineering time to run the estate.

---

## Internal links

| ID | Body links | relatedSlugs |
|---|---|---|
| TC-041 | `ebpf-production-observability-security-boundaries` | that + `container-image-security-beyond-scanning` |
| TC-042 | `saml-federation-security-risks-trust-boundaries` | `conditional-access-framework` + that |
| TC-043 | `kubernetes-pod-networking-packet-flow`, `service-mesh-mtls-operational-overhead` | both |
| TC-044 | none in body | `oauth2-token-theft-dpop-mechanics`, `passkeys-enterprise-deployment-reality` |
| TC-045 | `entra-join-vs-hybrid-join` | `windows-11-vs-windows-10-enterprise` + that |

One link was corrected during validation: `entra-join-vs-hybrid-join` lives under
`microsoft-intune`, not `microsoft-365-entra-id`.

---

## Reaction baselines

Checked before writing, per the workflow.

| Slug | Baseline |
|---|--:|
| `linux-ebpf-security-monitoring-kernel-probes` | 1696 |
| `entra-external-id-b2b-b2c-cross-tenant-access` | 1916 |
| `kubernetes-network-policy-default-deny-implementation` | 1727 |
| `post-quantum-cryptography-nist-migration-enterprise` | 2175 |
| `windows-365-vs-azure-virtual-desktop-architecture` | 1601 |

All distinct, inside the band, none a multiple of 50, no collision against the 78
existing slugs. **`SEED_OVERRIDES` is unchanged.**

---

## Sources used for verification

**Linux kernel** — lockdown documentation, BPF documentation, capabilities(7).
**CNCF** — Falco kernel data sources, Cilium network policy.
**Elastic Security Labs** — BPFDoor analysis.
**Microsoft Learn** — external identities overview, cross-tenant access settings,
Conditional Access for external users, customer identity tenants, access reviews;
Windows 365 overview, GPU Cloud PCs, Cloud PC size recommendations, Azure Virtual
Desktop, FSLogix.
**Kubernetes** — network policies, declaring network policy.
**Tigera** — Calico network policy. **AWS** — EKS network policy configuration.
**NIST** — the PQC project page and FIPS 203, 204, 205.
**CISA** — post-quantum initiative. **IETF** — ECDHE-MLKEM key agreement for TLS 1.3.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 83 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 220/220 |
| Readability gates | pass — 5/5 |
| Source integrity | pass — `batch-009 .md` unchanged |

All five are `draft: true`, consistent with batches 007 and 008. Nothing was
committed, pushed or deployed.
