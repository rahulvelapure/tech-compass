# Qwen Batch 003 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-003.md` |
| Source checksum (MD5) | `a5069dd4f0d5bfa03a46ff522f130116` |
| Articles in batch | 5 |
| Refined and published | 5 |
| Held | 0 |
| Refined on | 2026-08-23 |

First batch where every article was publishable. It was also the batch with the
most factual errors, which is not a coincidence — these are configuration-level
topics where a plausible-looking identifier is easy to generate and easy to
miss.

---

## Gate results

| Article | Body | Standfirst | Opening | Worst FAQ | ASL | Longest |
|---|--:|--:|--:|--:|--:|--:|
| `aws-vpc-lattice-vs-api-gateway-service-networking` | 64.6 | 85.6 | 83.8 | 73.5 | 12.2 | 31 |
| `oauth2-token-theft-dpop-mechanics` | 69.5 | 93.0 | 76.2 | 77.2 | 11.5 | 29 |
| `windows-laps-entra-id-architecture-deployment` | 57.1 | 79.8 | 72.6 | 71.6 | 12.3 | 33 |
| `kubernetes-storage-classes-costs-performance-traps` | 63.6 | 83.5 | 74.7 | 72.6 | 12.4 | 31 |
| `secrets-management-cicd-vault-oidc-reality` | 60.6 | 74.8 | 66.8 | 71.8 | 13.5 | 33 |

---

## Article 1 — VPC Lattice vs API Gateway

**REFINED.** `/cloud/aws-vpc-lattice-vs-api-gateway-service-networking` ·
backlog `cloud-21`

**Overlap audit.** No published AWS service-networking article. Adjacent to
`cloud-egress-costs-architecture-problem`, which covers VPC endpoints from the
cost side; the two now link.

**Corrections.**

1. **Invented DNS format.** The draft gave the Lattice service name as
   `<service>.<network-id>.svc.cluster.local`. That is Kubernetes internal DNS,
   borrowed wholesale. Replaced with a description of the behaviour, without
   inventing a format.
2. **Wrong charging unit.** The draft described Lattice pricing in "LCUs —
   Lattice Capacity Units". LCU is an Elastic Load Balancing concept. Described
   qualitatively instead.
3. **Fabricated latency benchmark.** "Typically 50–100ms per hop" for API
   Gateway is both unsourced and implausibly high. Removed, with a note that
   overhead depends on payload, integration type and region and should be
   measured locally.
4. **Pricing removed** throughout, including a per-million request rate and a
   derived monthly figure.

---

## Article 2 — OAuth token theft and DPoP

**REFINED.** `/cybersecurity-ciso/oauth2-token-theft-dpop-mechanics` · backlog
`sec-108`

**Overlap audit.** Complements rather than duplicates the two existing
token-security articles: `saml-federation-security-risks-trust-boundaries`
(bearer assertions) and `passkeys-enterprise-deployment-reality` (session after
authentication). All three now link, and the closing paragraph names the shared
pattern explicitly.

**Technical verification.** Protocol detail is accurate: the `jti`, `htm`,
`htu`, `iat` and `jwk` claims, the `cnf` thumbprint binding, the change of
authorisation scheme from `Bearer` to `DPoP`, and the server-side replay cache
all match RFC 9449.

**Correction — one security overstatement.** The draft concluded that after
DPoP, a stolen token leaves "the theft of a useless string", attributing this to
the private key being unreachable. That is wrong in the case that matters. With
a non-extractable key, injected script cannot *exfiltrate* the key — but it is
running in the same origin and can still ask the browser to sign proofs. The
attacker cannot use the token elsewhere; they can still act from the victim's
browser.

This is now a callout and a section, because the difference decides whether a
team treats DPoP as a fix for XSS (it is not) or as a limit on blast radius (it
is).

---

## Article 3 — Windows LAPS in Entra ID

**REFINED.** `/microsoft-intune/windows-laps-entra-id-architecture-deployment`
· backlog `intune-83`

**Overlap audit.** No published LAPS article. Adjacent to
`entra-join-vs-hybrid-join`, which the hybrid section links to.

**Verified against Microsoft Learn using the documentation search tool.** Four
errors found, all of which would have survived review by anyone who had not
checked:

1. **Wrong attribute.** The draft said the password is stored in
   `msDS-ManagedPassword`. That is an on-premises attribute associated with
   group managed service accounts. Entra-backed passwords live on the device
   object and are read through Microsoft Graph over the `deviceLocalCredentials`
   collection.
2. **Invented permission.** `DeviceLocalAdministratorPassword.Read.All` does not
   exist. The Entra role permissions are
   `microsoft.directory/deviceLocalCredentials/password/read` and
   `.../standard/read`; the Graph permissions are `DeviceLocalCredential.Read.All`
   and `DeviceLocalCredential.ReadBasic.All`.
3. **Wrong default access.** The draft stated that not even Global
   Administrators can read the password. Microsoft's documentation says Global
   Administrator, Cloud Device Administrator and Intune Administrator can, by
   default.
4. **Unsupported encryption claim.** The draft said the password is encrypted
   with a TPM-derived key and that "Microsoft cannot read this password". The
   documentation says the password is further encrypted before being persisted
   and that **this extra layer is removed before the password is returned to
   authorised clients**. The article now states that plainly, and notes that the
   stronger claim describes the Active Directory encrypted-password feature,
   which is a different mechanism.

**Additions from the same source:** deleting the device object destroys the
credential permanently; only one local account is managed at a time; and
Conditional Access scoping for the reader roles does not support custom or
administrative-unit-scoped roles.

**Deliberate omission.** The draft cited a specific event ID for a successful
backup. IDs differ by backup target and the value I could corroborate did not
match the draft's, so the article points at the operational log and the
documentation rather than quoting a number.

---

## Article 4 — Kubernetes StorageClasses

**REFINED.** `/devops/kubernetes-storage-classes-costs-performance-traps` ·
backlog `devops-18`

**Overlap audit — including a forward-looking one.** No conflict with published
work. `batch-011` contains a draft on StatefulSets, storage and identity, which
overlaps this territory. This article was scoped deliberately to StorageClass
mechanics — reclaim policy, binding mode, volume tier — leaving ordinals,
per-replica claims and pod identity to that piece. Recorded in the backlog note
so whoever writes it has the boundary.

**Technical verification — no corrections needed.** Reclaim policies, the
zonal-attachment constraint behind `WaitForFirstConsumer`, provisioned-capacity
billing, and the `allowVolumeExpansion` caveat all check out.

**Removed:** an illustrative monthly bill, a volume count, a storage total and
an IOPS figure. Which volume type a managed service uses by default is also not
asserted, since it changes between versions.

---

## Article 5 — CI/CD secrets management

**REFINED.** `/devops/secrets-management-cicd-vault-oidc-reality` · backlog
`devops-19`

**Overlap audit.** No published CI/CD security article. Links to the DPoP piece,
which shares the underlying idea of proving identity rather than presenting a
stored secret.

**Technical verification — accurate as drafted.** The `permissions: id-token:
write` requirement, the `sub` claim format, audience matching and the Vault
claim-binding model all check out.

**The substantive editorial addition.** The draft's title promised that Vault is
not a magic bullet, then argued only that static secrets are bad and Vault plus
OIDC is the answer. The stronger and more useful point was missing: **the major
clouds accept CI OIDC tokens directly**, so for a team deploying to one cloud,
direct federation removes the static key without introducing a secrets broker to
run. The security win comes from OIDC, not from Vault — and a pipeline that
authenticates to Vault with a long-lived Vault token has moved the static secret
rather than removed it. That is now a section.

**Also added:** token claims differ by trigger type, and a run from a fork is not
a run on your main branch — a rule written for one shape can deny unexpectedly
or match unintentionally.

**Removed:** an illustrative breach cost.

---

## Methodology note — a measurement change

Two flaws in the readability tool were found and fixed during this batch. Both
were making the measurement wrong rather than the writing bad, and both affected
earlier batches' reported figures.

1. **Blocks were joined without terminators**, so a heading ran into the
   paragraph below it and the pair was measured as one long sentence. This
   inflated average and longest-sentence figures and reported sentences nobody
   had written.
2. **Inline code was unwrapped into the prose.** An identifier such as
   `microsoft.directory/deviceLocalCredentials/standard/read` is a single
   whitespace-delimited token carrying about a dozen syllables. Counting it as an
   English word measures nothing. It is now dropped from the measurement, on the
   same principle that already excluded code blocks. The surrounding sentence is
   still measured, so prose around an identifier still has to stand on its own.

All twelve articles from batches 001–003 were re-measured after both changes and
all twelve pass every gate.

---

## Sources used for verification

**Microsoft Learn** (via documentation search) — Key concepts in Windows LAPS;
Get started with Windows LAPS and Microsoft Entra ID; Windows LAPS in Microsoft
Entra ID; Deploy Windows LAPS policy with Intune; Intune support for Windows
LAPS; `Get-LapsAADPassword` reference.
**Amazon Web Services** — What is Amazon VPC Lattice; Auth policies; Access
logs; Private REST APIs in API Gateway; API Gateway pricing.
**Kubernetes / CNCF** — Storage Classes; Persistent Volumes; Volume Binding
Mode; Resource Quotas; CSI specification.
**IETF** — RFC 9449 (DPoP); RFC 6750; RFC 6749; OAuth 2.0 Security Best Current
Practice.
**HashiCorp** — Vault JWT/OIDC auth method.
**GitHub** — Security hardening for GitHub Actions; About security hardening
with OpenID Connect; Configuring OIDC in AWS.
**OWASP** — Top 10 CI/CD Security Risks.
**MDN** — SubtleCrypto non-extractable keys.

---

## Validation at completion

| Gate | Result |
|---|---|
| TypeScript | pass — no diagnostics |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Content validation | pass — 53 articles, 0 errors |
| Readability gates | pass — 5/5 this batch, 12/12 cumulative |

URL pin updated 36 → 41 after confirming the change was purely additive — 5
added, 0 existing URLs altered.

Nothing was committed, pushed or deployed.
