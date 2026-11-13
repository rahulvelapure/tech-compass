# Qwen Batch 016 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-016.md` |
| Source checksum (MD5) | `2a2985289b67ef9206c02faea8e9f8ff` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-26 |

---

## Readability

Measured with `scripts/readability.cli.ts`. All five pass every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| TC-086 | `kubernetes-ephemeral-containers-debugging-production` | 892 | 68.0 | 76.3 | 71.4 | 73.8 | 10.5 | 27 |
| TC-087 | `postgresql-declarative-partitioning-query-pruning` | 1049 | 66.2 | 79.8 | 83.1 | 70.8 | 12.3 | 29 |
| TC-088 | `oidc-workload-identity-federation-cross-cloud` | 963 | 65.8 | 80.3 | 97.2 | 71.8 | 12.2 | 28 |
| TC-089 | `aws-iam-roles-anywhere-certificate-authentication` | 976 | 68.0 | 70.1 | 91.5 | 74.1 | 11.9 | 30 |
| TC-090 | `kubernetes-priorityclass-preemption-pod-eviction` | 873 | 69.8 | 85.6 | 75.2 | 73.2 | 13.0 | 26 |

Average body 67.6. **All five land inside the 65–70 editorial band** — the only
batch of the six where that is true for every article.

That is not a coincidence and it was not free. TC-089 first measured 62.6 with
an average sentence of 14.1 words, the longest in the corpus. Certificate and
PKI vocabulary is unavoidably heavy: "certificate", "authority", "credential",
"authentication" carry four or five syllables each and there is no shorter
correct word for any of them. The fix was entirely structural — seven paragraphs
split at clause boundaries, which took the article to 68.0 and the average
sentence to 11.9. Not one technical term was changed.

The FAQ gate was where the real work sat this batch. Six answers started below
70, and each needed the same treatment: keep the exact terms, add plain
connective words around them, and split. TC-088's Azure answer is the clearest
case — `user-assigned managed identity`, `federated credential` and
`app registration` in one short answer put it at 50.7. Restructuring into four
short sentences, with every term intact, reached 73.8.

## Technical corrections made to the source

**TC-086 — Ephemeral containers.**
The draft contradicts itself and gets the mechanism wrong. Its restriction list
correctly says ephemeral containers cannot have volume mounts, and its FAQ then
says they "share the pod's filesystem namespace, so they can read and write to
mounted volumes." **They cannot mount anything.** Containers in a pod do not
share a filesystem; each has its own from its own image. The route to another
container's files is the process namespace — with `--target` set, its root is
reachable at `/proc/<pid>/root` — and the article now explains that, because it
is what an engineer will actually need at 3 a.m. Added: ephemeral containers
reached stable in Kubernetes 1.25, and `kubectl debug --copy-to` as the answer
when you genuinely need the volumes.

**TC-087 — Declarative partitioning.**
The draft states that "you cannot create a foreign key from a partitioned table
to another table." That is backwards and out of date in both directions.
Foreign keys **from** partitioned tables arrived in PostgreSQL 11, and
references **to** partitioned tables arrived in 12. Added, and more useful than
anything the draft covers: **ATTACH PARTITION scans the whole table under an
ACCESS EXCLUSIVE lock** to validate the bounds, and adding a matching CHECK
constraint before you attach makes it skip the scan. That is the difference
between a routine operation and an unplanned outage. The plan-time versus
execution-time pruning section was rewritten around what each looks like in
EXPLAIN, since "all partitions listed" is not by itself a failure — a subplan
marked never executed was pruned, just later.

**TC-088 — OIDC workload identity federation.**
No factual error. Two structural changes. The draft carries an internal article
identifier in its body text, which was removed. And its scope overlapped
substantially with the published `secrets-management-cicd-vault-oidc-reality`,
so the article was rebuilt around what that one does not cover: the
provider-by-provider vocabulary table, and the fact that the same mechanism is
configured in three different places under three different names. The CI/CD
decision it supports is linked rather than restated. The Azure point is worth
flagging on its own — a federated credential can sit on a **user-assigned
managed identity**, which a lot of guidance still denies.

**TC-089 — IAM Roles Anywhere.**
Two corrections, one of them significant. The draft describes the exchange as a
**mutual TLS handshake**, repeatedly and as the spine of the explanation. The
workload actually calls `CreateSession` and signs that request with the
certificate's private key. The difference is operational: a failure here is a
rejected API call with an error message, not a connection that will not
establish, and anyone debugging from the draft's model would look in the wrong
place. Second and more important, the draft omits the **account trust boundary**
entirely. AWS documents that a certificate from *any* trust anchor in an account
can assume *any* target role in that account unless the role's trust policy
narrows it, and that there is no automatic tie-in to organisation-wide controls.
Registering a second CA for a second team does not create a compartment — it
adds another route to every Roles Anywhere role in the account. That is now the
article's central warning. Added: profiles carry many roles but exactly one
session policy, and all resources are regional and must be co-located.

**TC-090 — Priority and preemption.**
The draft's central claim is inverted. It states twice — once in a section of
its own — that pod disruption budgets take precedence over priority and can
block preemption entirely. The documentation says budgets are **supported but
not guaranteed**: the scheduler prefers victims whose budget would not be
violated, and where it cannot find such a set, **preemption proceeds and the
budget is violated anyway**. A team designing around the draft would believe a
budget makes a workload preemption-proof. It does not; only priority does that.
Second, the draft says node-pressure eviction ignores priority. The kubelet
looks first at whether a pod exceeds its requests and **then at priority**, so
priority is a tie-breaker rather than absent. Added: victims receive their
graceful termination period, so shortening it on preemptible workloads is the
lever for reducing the gap.

## Invented material removed

| ID | Removed | Replaced with |
|---|---|---|
| TC-086 | Payment service, NXDOMAIN traced in 30 seconds | The three failure shapes and how to separate them |
| TC-087 | Logging platform, 45 seconds to 200 milliseconds | Why a type mismatch silently disables pruning |
| TC-088 | Personal side project assuming the production role | Why an organisation wildcard is close to no control |
| TC-089 | 500 warehouse servers and a decommissioning failure | TPM-sealed keys, and what revocation actually requires |
| TC-090 | Batch jobs preempted during peak traffic | The victim-selection algorithm as documented |

## Link QA

Every source URL in the five articles was checked and returns 200. Two of the
draft's citations were replaced with more precise current paths: the PostgreSQL
partitioning reference now points at `ddl-partitioning` and `sql-altertable`
rather than the legacy `partitioning` page, and the Roles Anywhere citation adds
the trust-model page, which is where the account-boundary statement lives.

## Placement and cross-linking

| ID | Category | Content type | Outbound links |
|---|---|---|---|
| TC-086 | `devops` / Kubernetes | troubleshooting | Container image security, pod networking packet flow |
| TC-087 | `cloud` | explainer | PostgreSQL index types |
| TC-088 | `cybersecurity-ciso` / Identity security | explainer | Managed identities vs app registrations, CI/CD secrets |
| TC-089 | `cloud` | explainer | OIDC federation, Control Tower and SCPs |
| TC-090 | `devops` / Kubernetes | explainer | Pod disruption budgets, topology spread constraints |

TC-088 and TC-089 form a deliberate pair: one covers the case where an upstream
platform can vouch for the workload, the other the case where nothing can and
you have to establish identity with a CA. Each links to the other at the point
where the decision is made.

---

## Sources used for verification

**Kubernetes** — ephemeral containers, debugging running pods, process namespace
sharing, `kubectl debug`, pod priority and preemption, node-pressure eviction,
disruptions.
**PostgreSQL Global Development Group** — table partitioning, ALTER TABLE,
routine vacuuming.
**pg_partman** — project documentation.
**OpenID Foundation** — OpenID Connect Core 1.0.
**Amazon Web Services** — OIDC identity providers in IAM, IAM Roles Anywhere
introduction and trust model, AWS Private CA, the Roles Anywhere credential
helper.
**Microsoft Learn** — workload identity federation.
**Google Cloud** — workload identity federation.
**GitHub** — security hardening with OpenID Connect.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 112 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 220/220 |
| Readability gates | pass — 5/5 |
| Production build | pass |
| Source integrity | pass — `batch-016.md` unchanged |

No seed collisions in this batch, so `src/lib/reactions.seed.ts` and
`tests/reactions.test.ts` are unchanged. None of the five raises a validator
warning of its own. All are `draft: true`. Nothing was committed, pushed or
deployed.
