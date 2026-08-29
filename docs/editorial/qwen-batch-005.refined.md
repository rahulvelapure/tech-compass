# Qwen Batch 005 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-005.md` |
| Source checksum (MD5) | `4dff8a191455ea61e02d149399ce0d6e` |
| Articles in batch | 5 |
| Refined and published | 5 |
| Held | 0 |
| Refined on | 2026-08-23 |

---

## Gate results

| Article | Body | Standfirst | Opening | Worst FAQ | ASL | Longest |
|---|--:|--:|--:|--:|--:|--:|
| `service-mesh-mtls-operational-overhead` | 57.9 | 73.8 | 78.9 | 72.3 | 12.7 | 29 |
| `aws-lambda-cold-start-optimization-snapstart` | 59.4 | 83.4 | 86.7 | 78.9 | 11.1 | 31 |
| `entra-id-authentication-context-step-up-mfa` | 61.4 | 82.5 | 74.4 | 72.5 | 12.4 | 31 |
| `terraform-state-locking-drift-enterprise-reality` | 64.5 | 99.5 | 79.6 | 72.6 | 12.6 | 35 |
| `postgresql-connection-pooling-pgbouncer-rds-proxy` | 58.3 | 75.3 | 76.6 | 71.1 | 12.1 | 29 |

---

## Duplicate audit — four boundaries checked before writing

All four were adjacent enough to be worth verifying rather than assuming, and
all four came back clean:

| Proposed article | Checked against | Result |
|---|---|---|
| PostgreSQL pooling | `aurora-serverless-v2-scaling-connection-limits` | Zero mentions of PgBouncer, pooling modes or the process model |
| Authentication context | `conditional-access-framework` | Zero mentions of authentication context or step-up |
| Authentication context | `saml-federation-security-risks-trust-boundaries` | Zero mentions of Entra's authentication context feature |
| Terraform state | `terraform-vs-opentofu` | Tool comparison only; no state management |

---

## Article 1 — Service mesh mTLS

**REFINED.** `/devops/service-mesh-mtls-operational-overhead` · backlog
`devops-21`

**Correction — the draft mixed up two products.** It described Linkerd as
deploying an Envoy sidecar. Istio uses Envoy; Linkerd wrote its own proxy in
Rust specifically to keep the per-pod footprint small. The two are routinely
conflated, and tuning advice does not transfer between them.

**Removed:** CPU overhead percentages, per-sidecar memory figures and a
node-equivalent estimate, none of which could be sourced and all of which depend
on traffic shape.

**Added:** Istio ambient mode, which moves mTLS off per-pod sidecars entirely.
The draft treats one-proxy-per-pod as inherent to a mesh, and that is no longer
the only option — which materially changes the overhead argument.

Also reframed the control-plane failure. The draft is right that certificate
expiry causes a cluster-wide outage, but the useful framing is that certificate
lifetime *is* your grace period: the fault happens hours before the symptom.

---

## Article 2 — Lambda cold starts

**REFINED.** `/cloud/aws-lambda-cold-start-optimization-snapstart` · backlog
`cloud-24`

**Removed:** every cold start duration. They vary by runtime, package size and
dependencies, and quoting them invites readers to benchmark against a number
that was never measured.

**Two claims had gone stale** and are now flagged as version-dependent rather
than restated: which runtimes SnapStart supports (the draft says Java only), and
the API Gateway timeout ceiling (the draft calls it hard and non-negotiable).

**Kept and emphasised:** the frozen random seed. If a generator is seeded during
initialisation, that seed is captured in the snapshot and every restore reuses
it. Nothing errors. It is the most consequential SnapStart caveat and the one
most likely to be missed, so it became a callout.

---

## Article 3 — Entra authentication context

**REFINED.** `/microsoft-365-entra-id/entra-id-authentication-context-step-up-mfa`
· backlog `m365-53`

**Verified against Microsoft Learn.** Five corrections, one of which is a
security bug waiting to happen:

1. **The claim is `acrs`, not `acr`.** The draft used `acr` throughout — the
   standard OIDC claim, which is a different thing. Validating the wrong one
   means either rejecting valid tokens or accepting tokens that never satisfied
   the policy.
2. **The limit is 99 contexts (c1–c99), not 10.**
3. **It does not always redirect.** Conditional Access can add the claim
   opportunistically when the protecting policies are already satisfied. The
   draft describes a mandatory round trip every time. Resource providers opt in
   per token type.
4. **Do not hard-code context values.** Microsoft is explicit: values vary by
   tenant and should be read from Graph. The draft's example hard-codes them.
5. **Do not use it where the whole app is already a policy target** — a
   documented caveat the draft omits.

**Added:** the Entra ID P1 licensing requirement, and that role activation
through Privileged Identity Management can be gated this way.

---

## Article 4 — Terraform state

**REFINED.** `/devops/terraform-state-locking-drift-enterprise-reality` ·
backlog `devops-22`

**Removed:** a fabricated plan-duration benchmark tied to a resource count.

**Flagged as version-dependent:** the S3-plus-DynamoDB locking pattern. Newer
Terraform versions support locking in S3 directly, and the draft presents the
separate table as required. Also replaced `taint` with the current replace
mechanism.

**Kept, as the strongest section:** moving a resource into a module changes its
address, so Terraform plans a destroy and create. The code is identical and the
plan proposes deleting a production database. That is the most valuable thing in
the draft and it stays prominent.

---

## Article 5 — PostgreSQL connection pooling

**REFINED.** `/cloud/postgresql-connection-pooling-pgbouncer-rds-proxy` ·
backlog `cloud-25`

**Added — the significant omission.** RDS Proxy does not simply do transaction
pooling. When it detects session state it **pins** the client to one backend for
the rest of the session, so the application keeps working and the multiplexing
quietly stops. The draft misses this entirely. It matters because it is a silent
degradation: nothing errors, and you can end up paying for a proxy that has
stopped pooling. Pinning metrics are now called out as the thing to watch.

**Removed:** per-connection memory ranges, the "safe limit" connection count,
the multiplexing ratio and a latency figure.

**Flagged as version-dependent:** the claim that replication connections count
against `max_connections`. That relationship has changed across PostgreSQL
versions, so the article states the consequence to avoid and tells the reader to
check their own version.

**Boundary with `cloud-23`:** the Aurora article owns capacity-linked connection
ceilings — capacity is memory, memory sets the ceiling. This one owns the
process-per-connection model and pooling modes. Both mention a proxy, for
different reasons, and they cross-link.

---

## Cumulative topic boundary register

Twenty-seven articles refined across five batches. Additions this batch:

**Kubernetes** — now four: packets (`devops-17`), storage (`devops-18`), node
compute (`devops-20`), and workload identity plus certificate lifecycle
(`devops-21`). StatefulSets and pod identity remain **unclaimed** for batch 011.

**Databases and connections** — three articles with distinct ownership.
`cloud-23` owns capacity-linked connection ceilings on Aurora. `cloud-25` owns
the Postgres process model, pooling modes and pinning. `cloud-24` touches
connection reuse only as a SnapStart restore caveat and defers to the others.

**Identity, step-up and tokens** — `conditional-access-framework` owns policy
structure; `m365-53` owns per-action step-up; `sec-108` owns token binding. All
three answer "a valid session in the wrong hands" differently and now
cross-reference rather than repeat.

**Infrastructure as code** — `terraform-vs-opentofu` owns the tool choice;
`devops-22` owns state, drift and refactoring safety.

---

## Sources used for verification

**Microsoft Learn** (via documentation search) — Conditional Access target
resources; developer guide to authentication context; claims challenge; Graph
authenticationContextClassReferences.
**Amazon Web Services** — Lambda execution environment lifecycle; SnapStart;
SnapStart uniqueness and runtime hooks; provisioned concurrency; RDS Proxy;
avoiding pinning.
**HashiCorp** — Terraform state; state locking; s3 backend; refactoring and the
moved block; remote state data source.
**Istio / Linkerd / SPIFFE** — Istio security concepts; mTLS migration; ambient
mode; Linkerd automatic mTLS; X.509 SVID specification.
**PostgreSQL / PgBouncer** — connection and authentication configuration;
PgBouncer pooling modes; PgBouncer FAQ on prepared statements.
**OpenJDK** — CRaC project.
**OpenID Foundation** — OpenID Connect Core 1.0.

---

## Validation at completion

| Gate | Result |
|---|---|
| TypeScript | pass — no diagnostics |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 215/215 |
| Content validation | pass — 63 articles, 0 errors |
| Internal link integrity | pass — 6 body links, none to a draft |
| Readability gates | pass — 5/5 this batch, 27/27 cumulative |
| Production build | pass |
| Source integrity | pass — batches 001–005 all byte-identical |

URL pin updated 46 → 51, purely additive.

A seed pre-check was added to the workflow after batch 004: every new slug is
tested against the round-number rule before the file is written. All five in
this batch cleared it, so no slug changes were needed.

Nothing was committed, pushed or deployed.
