# Qwen Batch 006 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-006.md` |
| Duplicate copy | `docs/editorial/qwen-batch-006.md` — byte-identical, preserved as-is |
| Source checksum (MD5) | `dbb956579dae9ef5b1076e683f1d24c6` (both files) |
| Articles in batch | 5 |
| Refined and published | 4 |
| Held | 1 |
| Refined on | 2026-08-23 |

> **Two copies of this batch exist.** `batch-006.md` and `qwen-batch-006.md`
> have identical checksums. Both are left untouched — neither renamed nor
> removed — per the source protection rule. Worth knowing that editing one
> would leave the other silently stale.

---

## Gate results

| Article | Body | Standfirst | Opening | Worst FAQ | ASL | Longest |
|---|--:|--:|--:|--:|--:|--:|
| `enterprise-dns-security-doh-dot-filtering` | 65.7 | 79.1 | 85.0 | 83.3 | 11.7 | 34 |
| `bitlocker-tpm-failure-recovery-enterprise` | 66.6 | 82.5 | 70.9 | 75.4 | 12.6 | 33 |
| `entra-id-pim-implementation-failures` | 57.9 | 77.5 | 79.3 | 72.6 | 12.2 | 32 |
| `container-image-security-beyond-scanning` | 64.7 | 92.4 | 95.7 | 77.6 | 11.5 | 33 |

The PIM article was the hardest in the corpus to bring over the line. Its
subject vocabulary — *administrator*, *privilege*, *activation*, *eligibility*,
*authentication* — is uniformly four and five syllables and cannot be removed.
It came in at body 49.0 with all four tiers failing. Eleven passages were
rewritten, keeping every term and changing the sentences around them. Nothing
technical was dropped.

---

## Article 4 — HELD

**`kubernetes-gateway-api-vs-ingress-migration` — held, and I now recommend
rejecting it.**

This was already on the hold list from the original corpus audit. Checking it
properly against the published article makes the case stronger rather than
weaker.

`ingress-nginx-archived-migration` mentions Gateway API **twelve times**. It is
not a passing reference — that article covers Gateway API as the migration
target, including the `ingress2gateway` conversion tool, the annotation mapping
problem, and the deliberate absence of an escape hatch into implementation-
specific config. That is the substance a "Gateway API vs Ingress migration"
article would be built from.

**Recommendation: reject.** Two pages would compete for one query, and the
published one already holds the URL.

If you want Gateway API covered in its own right, the space that remains is not
migration but **API design** — the role-oriented split between `GatewayClass`,
`Gateway` and `HTTPRoute`, and how it separates the platform owner from the
application owner. That is a genuinely different article with a different search
intent, and it would need writing from intent rather than refining from this
draft.

Your decision; nothing was written either way.

---

## Article 1 — Enterprise DNS security

**REFINED.** `/enterprise-networking/enterprise-dns-security-doh-dot-filtering`
· backlog `entnet-14`

**Removed:** an unsourced claim about how long malicious domains stay live, and
a prescribed log retention period stated as a rule.

**Added:** a DNSSEC clarification. The draft never distinguishes authenticity
from privacy, and readers conflate the two constantly — DNSSEC proves an answer
was not altered, encrypted DNS hides the question. Neither replaces the other.

The framing was also shifted. The draft treats encrypted DNS as something to
defend against. The more useful position is that it is a genuine improvement,
and the workable response is to be the one providing it rather than the one
blocking it.

---

## Article 2 — BitLocker and TPM

**REFINED.** `/windows/bitlocker-tpm-failure-recovery-enterprise` · backlog
`win-67`

**Correction.** The draft said that with TPM plus PIN, "the PIN is stored in the
TPM", implying a second way in. That is wrong in a way that matters during an
incident: the PIN authorises the TPM to release the key, and is not a key you
can use without a working chip. Every protector path ends at the recovery key,
and the article now says so explicitly.

**Removed:** fleet sizes, affected-machine counts and a productivity cost from
the scenario. Event IDs are not quoted — they vary by provider and version.

**Kept as the central point:** escrow must be configured *before* encryption is
enabled. Enable first and the key is generated with nowhere to go, applying the
policy afterwards does not retroactively collect it, and the device looks
compliant throughout.

---

## Article 3 — Entra ID PIM

**REFINED.** `/microsoft-365-entra-id/entra-id-pim-implementation-failures` ·
backlog `m365-54`

**Two omissions that change the design**, both added:

1. **PIM requires Entra ID P2.** The draft never mentions licensing. Without it
   the whole approach is unavailable, and the fallback — standing roles with
   tighter monitoring — is a different design rather than a weaker version.
2. **Emergency access accounts must be excluded.** This follows directly from
   doing everything else right. If every administrator is eligible-only and
   activation needs an approver, an unavailable approver means nobody can act;
   add an authentication problem and nobody can activate at all. The draft's
   configuration table has no row for this, which is how it gets left out of
   real deployments too.

**Also corrected:** an understated built-in role count, and PIM for Groups
added — a meaningful gap, since much real access is granted through groups
rather than roles.

---

## Article 5 — Container image security

**REFINED.** `/devops/container-image-security-beyond-scanning` · backlog
`devops-23`

**Correction — a factual inversion.** The draft cited an OpenSSL version as
vulnerable to a CVE that this version had in fact *fixed*. Versions before it
were affected. This is the same inversion recorded in `docs/HANDOVER.md` for an
earlier batch, which makes it a pattern rather than a one-off.

The response was to remove all CVE-and-version pairings from the article, and to
add a callout warning about the pattern itself: check whether a version is the
last affected or the first fixed, because getting it backwards produces
confident and completely wrong remediation work.

**Added:** software bill of materials, absent from the draft. It is what turns
"which of our images contain this" from a rescan into a query when a significant
advisory lands.

**Sharpened:** signing without verification is a ritual. The control is the
admission policy, not the signature — and step four is the step teams skip.

---

## Cumulative topic boundary register

Thirty-one articles refined across six batches. Additions this batch:

**Endpoint credential escrow** — two articles sharing one lesson and no content.
`intune-83` owns local administrator passwords; `win-67` owns disk encryption
keys. Both turn on escrow being configured before the thing it protects is
enabled, and both note that deleting the device object destroys the secret. They
cross-link rather than repeat.

**Privileged access** — three distinct questions.
`conditional-access-framework` owns policy structure. `m365-53` owns per-action
step-up. `m365-54` owns standing privilege and just-in-time activation.
`conditional-access-break-glass-accounts` owns the exception that all three
depend on.

**Containers and supply chain** — `devops-23` owns image provenance and the
build-to-deploy chain; `devops-21` owns runtime workload identity;
`devops-19` owns pipeline credentials. All three touch delegated trust and link
to each other without overlapping.

**DNS** — `entnet-14` owns resolution-layer control. Distinct from
`zero-trust-network-segmentation` (network-layer) and from the transport
security topics.

**Still unclaimed for batch 011:** StatefulSets, ordinals, per-replica claims and
pod identity.

**Still held, undecided:** `zero-trust-network-segmentation-boundaries`,
`intune-vs-group-policy-migration-reality`,
`linux-ebpf-security-monitoring-kernel-probes`,
`kubernetes-gateway-api-vs-ingress-migration` (now with a reject
recommendation). Plus `windows-autopilot-troubleshooting-oobe-failure`,
rejected in batch 001.

---

## Sources used for verification

**IETF** — RFC 7858 (DoT), RFC 8484 (DoH), RFC 1035, RFC 9364 (DNSSEC).
**Microsoft Learn** — BitLocker overview, recovery, countermeasures; TPM
technology overview; BitLocker with Intune; Privileged Identity Management
configuration and role settings; PIM for Groups; emergency access accounts;
built-in roles reference; DoH client support on Windows.
**Sigstore / Kubernetes / CNCF / Falco** — cosign signing and verification;
admission controllers; Pod Security Standards; Falco documentation; CNCF
software supply chain guidance.

---

## Validation at completion

| Gate | Result |
|---|---|
| TypeScript | pass — no diagnostics |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 215/215 |
| Content validation | pass — 67 articles, 0 errors |
| Internal link integrity | pass — 8 body links, none to a draft |
| Readability gates | pass — 4/4 this batch, 31/31 cumulative |
| Production build | pass |
| Source integrity | pass — both copies of batch 006 byte-identical |

URL pin updated 51 → 55, purely additive. All four new slugs cleared the seed
round-number pre-check before being written.

Nothing was committed, pushed or deployed.
