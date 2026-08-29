# Qwen Batch 002 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-002.md` |
| Source checksum (MD5) | `567c46844000348d3e8fda0b6dd028e1` |
| Source size | 71,023 bytes, last modified 2026-08-21 |
| Articles in batch | 5 |
| Refined and published | 3 |
| Held | 2 |
| Refined on | 2026-08-23 |

Same convention as batch 001: the refined article is the TypeScript file under
`src/content/articles/`, and this document is the audit trail.

---

## Gate results

| Article | Body | Standfirst | Opening | Worst FAQ | ASL | Longest |
|---|--:|--:|--:|--:|--:|--:|
| `cloud-egress-costs-architecture-problem` | 67.5 | 86.3 | 85.8 | 77.0 | 12.3 | 31 |
| `saml-federation-security-risks-trust-boundaries` | 60.2 | 77.0 | 78.9 | 78.2 | 11.2 | 34 |
| `enterprise-ai-agents-security-governance-reality` | 63.0 | 82.4 | 71.3 | 75.5 | 12.2 | 31 |

Thresholds: body ≥ 55, standfirst ≥ 70, opening ≥ 65, FAQ ≥ 70, ASL ≤ 15,
longest ≤ 35. No terminology was removed to move a score.

---

## Article 1 — Cloud egress costs

**REFINED → published.** `/cloud/cloud-egress-costs-architecture-problem` ·
backlog `cloud-20`

**Overlap audit.** Checked against published `cloud-cost-controls`, which is
the nearest neighbour. That article is about where a cost control can sit
organisationally and why dashboards do not change behaviour. It mentions data
transfer once and never covers egress. This one is about the network paths that
trigger the charge. Different question, different keyword, and they now link to
each other.

**Corrections.**

1. **Every price removed.** The draft carried per-GB rates, a monthly figure, a
   cost breakdown and a percentage saving. Rates vary by region, tier and
   contract, and the house methodology excludes them for that reason — the
   published `cloud-cost-controls` states the same policy explicitly. The
   article now describes the *ordering* of billing boundaries, which is what
   stays true.
2. **Gateway and interface endpoints were conflated.** This is the substantive
   fix. The draft advised replacing NAT gateways with "VPC endpoints" and said
   this eliminates the data processing fee. That is true only for **gateway**
   endpoints (S3 and DynamoDB), which carry no endpoint charge. **Interface**
   endpoints — PrivateLink — bill hourly per endpoint plus per GB processed, so
   they move traffic to a cheaper meter rather than removing one. As drafted,
   the advice would lose money on a low-volume service.
3. **Jumbo-frame claim generalised.** The draft asserted providers use 9000-byte
   frames internally. Replaced with path MTU differing along the route, which is
   the durable statement.

**Editorial.** The invented case study (a named monthly spend and a percentage
saving) was replaced with the same scenario told structurally. The pattern is
the useful part; the numbers were not verifiable.

**Internal links:** `kubernetes-pod-networking-packet-flow`, `cloud-cost-controls`.

---

## Article 2 — SAML federation

**REFINED → published.**
`/cybersecurity-ciso/saml-federation-security-risks-trust-boundaries` · backlog
`sec-107`

**Overlap audit.** No published SAML article. My earlier automated scan flagged
this against the eBPF draft, which was a false positive — the slugs share only
the generic tokens `security` and `boundaries`. Confirmed distinct from
`passkeys-enterprise-deployment-reality` (authenticator strength at the IdP) and
`conditional-access-framework` (policy design). All three now link together.

**Technical verification — draft was sound.** Golden SAML, the `NotOnOrAfter`
and `Audience` conditions, the MFA propagation gap and the SHA-1 warning all
check out against the OASIS specification and MITRE T1606.002.

**Additions.**

1. **The `OneTimeUse` condition and the replay cache.** The draft recommended
   short lifetimes without noting that replay is properly blocked by the service
   provider recording assertion IDs — and that the condition is a request the SP
   may ignore. Added, because it changes who is responsible for the control.
2. **Session lifetime.** The draft stopped at the assertion. In practice the SP
   issues its own session on acceptance, and that usually lasts far longer.
   Tightening one while ignoring the other moves the target rather than removing
   it.
3. **Sourcing corrected.** The draft cited a Microsoft Learn URL I could not
   verify and a vendor blog post. Replaced with the OASIS core specification,
   MITRE ATT&CK T1606.002 and NIST SP 800-63B.

**Internal links:** `conditional-access-framework`,
`passkeys-enterprise-deployment-reality`.

---

## Article 5 — Enterprise AI agents

**REFINED → published.**
`/ai-enterprise-it/enterprise-ai-agents-security-governance-reality` · backlog
`aient-13`

**Overlap audit.** This one needed care. Published `ai-agents-it-operations`
covers what agents can realistically do in IT operations — a capability
assessment. This article covers how to secure one that has tools. Related
subject, different question, and the risk was that this piece would drift into
re-arguing capability. It was scoped strictly to security and governance, and
the two now link to each other. `model-context-protocol-explained` is linked as
the tool-interface companion.

**Technical verification — draft was sound.** The on-behalf-of flow, RAG
leakage through shared vector storage, human-in-the-loop for destructive tools
and enforcement outside the model all check out.

**Editorial changes.**

1. **Indirect injection promoted.** The draft treated prompt injection mostly as
   something a user types. The dangerous case is hostile text inside content the
   agent reads — a log, a ticket, a fetched page — where the user is innocent
   and never sees it. That is now the emphasis, because it is the path that gets
   missed.
2. **Exploit strings removed.** The draft included a working injection string
   and a shell command for copying a storage bucket. The scenario is described
   structurally instead. It loses nothing explanatory and does not read as a
   recipe.
3. **The one-line test added.** *Ask what the agent can do that the person
   asking cannot.* If the answer is anything, injection is a privilege
   escalation path. That framing does more work than the draft's list.

**Internal links:** `ai-agents-it-operations`, `model-context-protocol-explained`.

---

## Articles 3 and 4 — held

Both were identified in the corpus audit and held on instruction. Neither was
written and no files were created.

### Article 3 — `zero-trust-network-segmentation-boundaries`

Direct duplicate of published
`/enterprise-networking/zero-trust-network-segmentation`. The slugs share four
tokens and the search intent is identical.

**Recommendation: reject, and fold anything new into the published article.**
Two pages competing for one query is the outcome the duplicate-intent gate
exists to prevent, and the published piece already holds the URL and whatever
authority it has accrued. If the draft contains material the published article
lacks, the cheap move is a section there — not a second page.

### Article 4 — `intune-vs-group-policy-migration-reality`

Strong overlap with published
`/microsoft-intune/group-policy-to-settings-catalog-migration`, and secondary
overlap with `intune-compliance-policy-design` and `intune-policy-conflicts`.

**Recommendation: differentiate or reject.** The published article covers the
migration procedure. If a genuine gap exists it is the *decision* — whether to
migrate a given GPO at all, what has no CSP equivalent, and what that means for
timelines. That is a decision-framework, not a second migration guide, and it
would need rewriting from the intent rather than refining this draft. Rejecting
is also defensible.

Both remain held pending your decision.

---

## Sources used for verification

**Amazon Web Services** — VPC pricing; What is AWS PrivateLink; Gateway
endpoints; NAT gateways.
**Microsoft** — Azure bandwidth pricing; Single sign-on SAML protocol;
OAuth 2.0 on-behalf-of flow.
**OASIS** — SAML 2.0 Technical Overview; Assertions and Protocols for SAML V2.0.
**MITRE ATT&CK** — T1606.002, Forge Web Credentials: SAML Tokens.
**NIST** — SP 800-63B; AI Risk Management Framework 1.0.
**OWASP** — Top 10 for Large Language Model Applications.
**NCSC** — Guidelines for secure AI system development.
**Anthropic** — Model Context Protocol specification.

---

## Validation at completion

| Gate | Result |
|---|---|
| TypeScript | pass — no diagnostics |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 215/215, four consecutive runs |
| Content validation | pass — 48 articles, 0 errors |
| Internal link integrity | pass — 6 body links, all resolve, none to a draft |
| Readability gates | pass — 3/3 |
| Production build | pass |

The URL pin in `tests/reactions.test.ts` was updated from 33 to 36 after
confirming the change was purely additive — 3 added, 0 existing URLs altered.

Nothing was committed, pushed or deployed.
