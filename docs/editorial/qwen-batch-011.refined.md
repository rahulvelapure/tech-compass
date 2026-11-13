# Qwen Batch 011 — refinement record

Companion to the Qwen source draft. **The source is not edited.**

| | |
|---|---|
| Source file | `docs/editorial/batch-011.md` |
| Source checksum (MD5) | `60a51588553b5f98558728450f9c9e55` |
| Articles in batch | 5 |
| Refined | 5 |
| Held | 0 |
| Refined on | 2026-08-26 |

---

## Readability

Measured with `scripts/readability.cli.ts`. All five pass every frozen gate.

| ID | Slug | Words | Body | Standfirst | Opening | FAQ | ASL | Longest |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| TC-051 | `graphql-vs-rest-vs-grpc-api-gateway-performance` | 978 | 68.3 | 91.0 | 84.5 | 70.3 | 10.9 | 29 |
| TC-052 | `kubernetes-statefulset-vs-deployment-storage-identity` | 1029 | 67.9 | 79.9 | 68.5 | 74.7 | 11.4 | 27 |
| TC-053 | `aws-control-tower-multi-account-governance-scp` | 1238 | 70.9 | 89.5 | 77.3 | 71.6 | 9.5 | 22 |
| TC-054 | `java-vs-go-garbage-collection-performance-tuning` | 1454 | 72.8 | 71.1 | 76.3 | 73.2 | 11.2 | 25 |
| TC-055 | `oauth-2-device-authorization-grant-iot-cli` | 1215 | 73.4 | 82.9 | 66.5 | 76.5 | 11.0 | 30 |

Average body 70.7. Two sit inside the 65–70 editorial band; three sit just above
it, between 70.9 and 73.4.

Those three are worth explaining rather than adjusting. They were written to the
band from the first draft — short sentences, active voice, one idea per
sentence — rather than being written long and then simplified. Nothing was
removed to get there: TC-053 and TC-054 are the two longest articles in the
batch and carry the most terminology. A score above the band means the prose
around the terminology reads easily, which is the stated goal. Deliberately
lengthening sentences to land inside 65–70 would have made them worse.

Where a single FAQ answer fell short of the 70 gate, the fix was sentence
structure, never vocabulary. TC-051's gRPC-Web answer scored 45.7 with every
required term in one long sentence; splitting it into five short ones took it to
70.3 with `client-streaming`, `bidirectional streaming`, `unary`,
`server-streaming` and Envoy all still present.

## Technical corrections made to the source

The source draft was accurate in outline and wrong in several specifics. Each
correction below was verified against primary documentation.

**TC-051 — GraphQL vs REST vs gRPC.**
The draft claimed Protobuf payloads run 30–50% smaller than JSON. That ratio is
entirely payload-dependent and the figure was removed in favour of telling the
reader to measure. Apollo Router is now the **GraphOS Router**, with Apollo
Router Core as the open-source build. And the draft did not say what gRPC-Web
gives up: it supports **unary and server-streaming only**, not client-streaming
or bidirectional streaming.

**TC-052 — StatefulSets.**
The draft dated `persistentVolumeClaimRetentionPolicy` as stable in Kubernetes
1.27. **1.27 was the beta promotion; the field went stable in 1.32.** The draft
also presented ordered startup as an unconditional property of the controller,
which is only true under the default `podManagementPolicy`; setting `Parallel`
removes the sequencing while keeping identity and per-pod storage. Added:
`ReadWriteOncePod` as the correct access mode for a single-writer database, and
`.spec.ordinals.start` (stable in 1.31).

**TC-053 — Control Tower and SCPs.**
The draft's central claim about SCPs was wrong in an important direction. It
said an SCP overrides the root user of any account. **SCPs have no effect on any
user or role in the management account**, and none on service-linked roles
anywhere — which is the actual mechanical reason the management account must run
no workloads. The draft also said Control Tower creates the management account;
it is deployed into an existing one. Added: proactive controls (CloudFormation
hooks) as the third control type, and resource control policies, which cover
what SCPs structurally cannot.

**TC-054 — Java vs Go GC.**
Two version-sensitive errors. A G1 full collection has **not been
single-threaded since JDK 10** (JEP 307 made it parallel). And the recommended
`-XX:+UseZGC -XX:+ZGenerational` is now wrong: JEP 474 made generational mode
the default in JDK 23, and JEP 490 removed the non-generational mode in JDK 24,
where the flag only produces a warning. The draft also said the Go team was
researching a generational collector. What actually shipped is **Green Tea**,
which is span-based, not generational — an experiment in Go 1.25 and the default
in Go 1.26. The `tipu.dev` source was replaced with the official Go GC guide.

**TC-055 — Device Authorization Grant.**
The draft said the flow is disabled by default for new Entra tenants. The
control is a **Conditional Access authentication-flows policy**, and since 2025
Microsoft has been rolling out a managed policy that blocks the flow for tenants
showing no sign of using it. The draft also suggested extending the flow with
PKCE; PKCE binds an authorization code to the client that requested it, and this
flow has **no redirect and no authorization code**. Added: the spec's
`verification_uri_complete` option and its session-spying risk, both of which
change the phishing analysis, and the spec's own entropy reasoning — rate
limiting, not code length, is what makes a short `user_code` safe.

## Invented material removed

Every source article carried a "Real-World Scenario" with named figures. In each
case the mechanism was real and the incident was not, so the mechanism was kept
and the numbers went.

| ID | Removed | Replaced with |
|---|---|---|
| TC-051 | Streaming company, five sequential calls, 3-second load | The caching argument, stated as mechanism |
| TC-052 | Corrupted PostgreSQL cluster; 5–10 minute detach window | Why block storage refuses the second attach |
| TC-053 | $150,000 mining bill reduced to $40 | The four layers and where each is enforced |
| TC-054 | Trading platform, 2 ms median and 400 ms P99 | Mark assist, and how to find it in a profile |
| TC-055 | — | GitHub CLI retained; it is documented behaviour |

## Placement and cross-linking

| ID | Category | Content type | Inbound-facing links |
|---|---|---|---|
| TC-051 | `development` / APIs | comparison | service mesh mTLS, VPC Lattice |
| TC-052 | `devops` / Kubernetes | explainer | Kafka rebalancing, storage classes, PDBs |
| TC-053 | `cloud` | explainer | EKS Pod Identity, cloud cost controls |
| TC-054 | `development` / Languages | comparison | OpenTelemetry vs APM, Lambda cold starts |
| TC-055 | `cybersecurity-ciso` / Identity security | explainer | DPoP, authentication context |

TC-054 opens a new subject for the publication — language runtime performance —
and TC-051 is the first article in `development` under the APIs subcategory.

Overlap was checked against the existing corpus. TC-055 is adjacent to
`oauth2-token-theft-dpop-mechanics`, which owns token binding after issuance;
this article owns the headless grant and the phishing route into it, and links
to the other rather than restating it. TC-052 is adjacent to
`kubernetes-storage-classes-costs-performance-traps`, which owns class selection
and cost; this one owns the controller.

---

## Sources used for verification

**gRPC** — core concepts and architecture; the gRPC-Web project documentation.
**GraphQL Foundation** — serving over HTTP.
**Envoy Proxy** — gRPC-JSON transcoder filter.
**Apollo GraphQL** — GraphOS Router versus an API gateway.
**Kubernetes** — StatefulSets, PersistentVolumeClaim retention, DNS for services
and pods, persistent volume access modes.
**Amazon Web Services** — service control policies, how Control Tower works,
controls implemented with resource control policies, IAM Identity Center.
**OpenJDK** — JEP 307, JEP 439, JEP 474, JEP 490.
**The Go Programming Language** — the GC guide, Go 1.26 release notes.
**IETF** — RFC 8628.
**Microsoft Learn** — device authorization grant, blocking authentication flows
with Conditional Access.
**GitHub** — `gh auth login`.

---

## Validation at completion

| Gate | Result |
|---|---|
| Content validation | pass — 93 articles, **0 errors** |
| TypeScript | pass |
| ESLint | pass — 0 errors, 6 pre-existing warnings |
| Tests | pass — 220/220 |
| Readability gates | pass — 5/5 |
| Production build | pass |
| Source integrity | pass — `batch-011.md` unchanged |

All five are `draft: true`. Nothing was committed, pushed or deployed.
