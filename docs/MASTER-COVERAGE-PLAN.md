# Master technology coverage plan

The balanced scope for Tech Compass across every subject, and the plan to get
there. Replaces `TECHNOLOGY-COVERAGE.md`, which was a coverage map without
counts, targets, priorities or research tracks.

| Companion                                        | Answers                                                       |
| ------------------------------------------------ | ------------------------------------------------------------- |
| [`CONTENT-ROADMAP.md`](./CONTENT-ROADMAP.md)     | Taxonomy, pillar model, linking rules, visual standard        |
| [`RESEARCH-STANDARD.md`](./RESEARCH-STANDARD.md) | Source hierarchy, research method, quality gates, maintenance |
| [`PUBLISHING.md`](./PUBLISHING.md)               | Commands, field rules, PR checklist                           |

---

## 1. The problem this plan exists to fix

Measured, not estimated:

| Measure                 | Start   | 3a      | 3b (Windows) | 3c (Networking) | 3d (Five subjects) |
| ----------------------- | ------- | ------- | ------------ | --------------- | ------------------ |
| Backlog topics          | 106     | 174     | 215          | 257             | **327**            |
| Intune share of backlog | **71%** | 43%     | 35%          | 29%             | **23%**            |
| Segments with a backlog | 3 of 16 | 6 of 18 | 7 of 18      | 8 of 18         | **13 of 18**       |
| Subjects with a pillar  | 1       | 5       | 6            | 7               | **11**             |
| Pillar and hub topics   | 7       | 21      | 27           | 34              | **51**             |
| Topics with sources     | 33      | 70      | 86           | 107             | **157**            |
| Diagram opportunities   | 15      | 38      | 49           | 70              | **78**             |
| Unique target keywords  | 106/106 | 174/174 | 215/215      | 257/257         | **327/327**        |

Tech Compass was an Intune site with fifteen empty rooms attached. The
architecture was sound and the Intune work good, but continuing at that ratio
produced a product nobody described wanting.

**Phase 3a added 68 researched topics without touching Intune** — cybersecurity
(39), cloud (15), AI (14). **Phase 3b added Windows (41).** Intune fell from
71% of the backlog to 35% because everything else grew, not because anything
was removed. The 75 Intune topics are untouched.

**The freeze is satisfied.** Four subjects — cybersecurity, cloud, AI and
Windows — now have researched clusters with pillars. Intune is eligible to
reopen, but §5 sequencing says it should not be next.

**Phase 3d opened the five remaining P1 subjects** — development, DevOps, IT
automation, enterprise networking and AI for enterprise IT — adding 70 topics
and taking Intune to 23%. Five subjects still hold no backlog: `electronics`,
`smartphones`, `technology-leadership`, `gadgets` and `emerging-tech`. Four of
those five already contain a draft with nothing around it, which makes them the
natural next phase.

### Windows research status (Phase 3b)

41 topics, 6 pillars, 10 researched, 16 carrying primary sources.

**Pillars, validated against research rather than assumed:** `windows-in-the-enterprise`
(hub) → servicing and lifecycle · Windows security · identity and sign-in ·
operations and troubleshooting · developer platform.

**Three candidate pillars were rejected.** "Windows enterprise management" would
have collided head-on with `microsoft-intune` — Windows owns OS behaviour,
Intune owns cloud delivery. "Windows hardware/platform" splits cleanly instead:
TPM and Secure Boot to security, components to `electronics`. "Windows Server
boundaries" is a boundary rule, not a subject.

**Sources:** Microsoft Learn — Windows release health, lifecycle and servicing;
the Windows security book; Credential Guard, HVCI and Secured-core PC
documentation; CSP reference; WSL and dev-environment docs.

**Findings that changed the plan:**

- **Windows 11 26H1 is not an annual feature update.** Build 28000, released
  2026-02-10, preinstalled only on selected new hardware starting with Qualcomm
  Snapdragon X2 Series. Not offered through Windows Update, not installable in
  place, and built on a different core to 24H2/25H2 — so those devices cannot
  take the H2 2026 annual update. `win-10` exists because the natural assumption
  that a higher version number is newer and better is wrong here.
- **24H2 Home/Pro updates end 2026-10-13**, weeks away. 25H2 runs to 2027-10-12
  and 2028-10-10; 23H2 Enterprise ends 2026-11-10; LTSC 2024 to 2034-10-10.
- **25H2 installs from 24H2 as an enablement package** — files already present
  and dormant under temporary enterprise feature control.
- **Credential Guard has been on by default since Windows 11 22H2** on
  domain-joined non-DC systems, auto-enabling VBS, without UEFI lock — and it
  does _not_ override an explicit pre-upgrade disable. That exception is what
  makes real estates inconsistent.

**Coverage gap:** 41 of a 90 target, deliberately. ~30 slots are reserved for
discovery and the rest for a second pass on server boundaries, storage and
deployment tooling once the first cluster is written.

### Networking research status (Phase 3c)

42 topics, 7 pillars, 11 researched, 21 carrying primary sources, 21 diagram
opportunities.

**Strategic role, not priority order.** Networking is P2 by priority but was
sequenced third because it is the site's **lowest-volatility subject and its most
durable internal-link target**. Protocol fundamentals do not churn, so these
articles cost almost nothing to maintain — while cybersecurity, Windows, cloud
and Intune all already reference networking concepts that do not exist yet.

**Pillars:** `how-a-packet-crosses-a-network` (hub) → Ethernet and switching ·
IP addressing and routing · core network services · transport · wireless ·
diagnostics and performance.

**Rejected pillar candidates**, with reasons:

| Rejected                                             | Why                                              | Owner instead                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Network security                                     | Would compete with cybersecurity for one intent  | `cybersecurity-ciso` owns architecture and risk; networking owns protocol mechanism (WPA3, 802.1X) |
| SD-WAN, SASE, enterprise networking                  | Corporate architecture, not protocol             | `enterprise-networking`                                                                            |
| Cloud networking                                     | Provider-specific implementation                 | `cloud`                                                                                            |
| Network automation                                   | Splits cleanly rather than forming a pillar      | `devops` (IaC) and `it-automation` (ops scripting)                                                 |
| Network monitoring _(separate from troubleshooting)_ | Monitoring exists to answer diagnostic questions | Merged into one diagnostics pillar                                                                 |

**Sources:** IETF RFCs (1034/1035, 1122, 1191, 2131, 4271, 4632, 4890, 7858,
8200, 8484, 9000, 9114, 9250, 9293, draft-ietf-tls-ecdhe-mlkem) · IEEE 802.3,
802.1Q, 802.1X, 802.11be-2024 and 802.11 working-group status · Wi-Fi Alliance ·
Cloudflare PQC documentation.

**Findings that changed the plan:**

- **IEEE Std 802.11be-2024 (Wi-Fi 7) was published 2025-07-22**, specifying at
  least 30 Gbit/s maximum throughput.
- **Wi-Fi 8 (802.11bn) is not ratified.** TGbn had resolved ~75% of D1.0
  comments and expected to ballot D2.0 in July 2026. `net-54` exists precisely
  because consumer coverage routinely reports it as shipping.
- **Post-quantum TLS became a transport problem.** Hybrid X25519MLKEM768 carries
  a 1216-byte client share (1184 ML-KEM-768 + 32 X25519), typically splitting
  the ClientHello across two packets. TLS 1.3 permits it; middleboxes assuming
  one packet do not. That is `net-44`, and it is a networking failure mode, not
  a cryptography topic.
- **Encrypted DNS is settled and citable:** DoT RFC 7858 (2016), DoH RFC 8484
  (2018), DoQ RFC 9250 (2022).

**Coverage gap:** 42 of a 60 target. The remaining ~18 are held for discovery
once the first cluster is written, rather than pre-specified now.

### Five-subject research status (Phase 3d)

`development`, `devops`, `it-automation`, `enterprise-networking` and
`ai-enterprise-it` opened together: 70 topics in 16 clusters. Chosen because all
five had a category and no backlog, and because two of them —
`development` and `devops` — are where a general technology publication is
least credible when it has nothing.

**Findings that changed the plan rather than confirming it:**

- **Ingress NGINX is archived.** The repository went read-only on 24 March 2026
  with no further releases, bugfixes or security updates, and the project tells
  new users not to deploy it. This converts a slow modernisation topic into a
  dated migration with a security deadline, and it is why the Gateway API
  cluster is the segment's P0 rather than a P2 explainer.
- **The EU AI Act timeline moved.** Amendments approved on 16 June 2026 deferred
  Annex III high-risk obligations to 2 December 2027 and Annex I to 2 August
  2028 — but Article 50 transparency duties were **not** deferred and apply from
  2 August 2026. Writing "high-risk obligations begin in August 2026" would have
  been flatly wrong, and a great deal of published guidance still says it.
- **MCP became stateless.** The 2026-07-28 revision removed protocol-level
  sessions and the `Mcp-Session-Id` header. An article written from earlier
  knowledge would have described session affinity as an operational constraint
  that no longer exists.
- **Node.js is changing its release model.** From October 2026: one major a
  year, calendar-aligned numbering, every release an LTS, plus an Alpha channel.
  The even/odd LTS convention that has held since 2015 ends with Node 26.
- **Terraform's owner changed.** Terraform is BUSL 1.1 under IBM ownership;
  OpenTofu is MPL 2.0 under the Linux Foundation, currently 1.12, still
  state-compatible. The decision is governance, not features — and the BUSL
  restriction is narrower than commonly described, which matters because teams
  migrate for reasons that do not apply to them.
- **Wi-Fi 8 remains unratified.** 802.11bn (Ultra High Reliability) targets
  ratification around mid-to-late 2028, and its emphasis is reliability rather
  than throughput. No enterprise-networking topic was written against it.

**Ownership conflicts found and resolved before creating anything:** three
intended topics were already owned elsewhere and were dropped rather than
duplicated — supply-chain security and dependency risk to `sec-41`/`sec-42`,
post-quantum migration to `sec-52` with wire behaviour at `net-44`, and AI
governance policy to `sec-91`. The new clusters link across to those instead.

**Coverage gap:** deliberately short of target in all five. 70 topics with
research behind them is worth more than 300 keyword variations, and the
remainder is held for discovery once the first articles in each cluster exist.

### Duplicate intent resolved this phase

| Overlap                                                                    | Decision                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sec-11` microsegmentation vs the `zero-trust-network-segmentation` draft  | **Real duplicate** — both promised segmentation "without breaking the business". Split pinned: `sec-11` owns microsegmentation (east-west, workload and identity, per-flow); the draft owns segmentation architecture (zones, VLANs, coarse boundaries) when `enterprise-networking` gets a backlog; `net-11` owns the 802.1Q mechanism beneath both. If either starts explaining the other, merge. |
| `net-44` PQC transport vs `sec-51` TLS handshake vs `sec-52` PQC migration | Distinct readers: `sec-51` how TLS works, `sec-52` what to plan, `net-44` why connections started failing. Kept.                                                                                                                                                                                                                                                                                    |
| `net-30` DNS resolution vs `win-51` Windows resolution order               | Protocol versus Windows client order (mDNS, LLMNR, hosts). Kept.                                                                                                                                                                                                                                                                                                                                    |
| `net-52` WPA3 vs `intune-112` certificate Wi-Fi profiles                   | Protocol versus deployment. Kept.                                                                                                                                                                                                                                                                                                                                                                   |
| `net-45` VPN protocols vs enterprise remote-access architecture            | Protocol comparison here; architecture in `enterprise-networking`. Kept.                                                                                                                                                                                                                                                                                                                            |
| `net-71` 802.1X vs NAC at scale                                            | Protocol here; deployment in `enterprise-networking`. Kept.                                                                                                                                                                                                                                                                                                                                         |

### Draft ownership decided

| Draft                             | Owner                              | Reasoning                                                                                                                                                                                                                                                                   |
| --------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wifi-6-vs-wifi-7`                | **networking** (`net-50`)          | Wi-Fi standards are protocol territory. Now mapped.                                                                                                                                                                                                                         |
| `wifi-troubleshooting`            | **windows** (`win-46`)             | Client-side diagnosis, not protocol. Not taken.                                                                                                                                                                                                                             |
| `zero-trust-network-segmentation` | **enterprise-networking**          | Corporate segmentation architecture. Deliberately _not_ pulled into networking despite the name — the primary intent is design, not protocol. **Now mapped to `entnet-02`** under the segmentation-architecture pillar, which removes its orphan status.                    |
| `ai-agents-it-operations`         | **ai-enterprise-it**               | Mapped to `aient-06` under the agents-and-tool-protocols pillar. Was an orphan.                                                                                                                                                                                             |
| `ai-coding-assistants-enterprise` | **ai-enterprise-it**               | Mapped to `aient-10` under the coding-assistants pillar. Was an orphan.                                                                                                                                                                                                     |
| `graph-api-intune-reporting`      | **microsoft-intune** (`intune-71`) | Unresolved: the topic exists and is DRAFT, but carries no `articleSlug`, so the dashboard does not connect the two. The article's category is `it-automation` while its topic sits in the Intune segment. Left alone this phase to avoid touching Intune; needs a decision. |

---

## 2. Master coverage table

Target is the realistic ceiling — the count of genuinely distinct, individually
useful articles the subject supports without near-duplicate intent. Where that
is below 100, the reason is stated in §4.

| Subject                  |    Pub |  Draft | Backlog |     Target | Gap | Priority    | Volatility    |
| ------------------------ | -----: | -----: | ------: | ---------: | --: | ----------- | ------------- |
| `microsoft-intune`       |     15 |      0 |  **75** |        100 |  85 | P1 (frozen) | High          |
| `cybersecurity-ciso`     |      0 |      3 |  **39** |        100 | 100 | **P0**      | Medium        |
| `cloud`                  |      0 |      1 |  **15** |        100 | 100 | **P0**      | Medium        |
| `microsoft-365-entra-id` |      1 |      1 |      23 |        100 |  99 | **P0**      | High          |
| `windows`                |      0 |      2 |  **41** |         90 |  90 | **P0**      | Medium        |
| `ai`                     |      0 |      1 |  **14** |         85 |  85 | **P0**      | **Very high** |
| `enterprise-networking`  |      0 |      1 |  **12** |         80 |  80 | P1          | Low           |
| `devops`                 |      0 |      2 |  **16** |         80 |  80 | P1          | Medium        |
| `development`            |      0 |      1 |  **18** |         80 |  80 | P1          | Medium        |
| `it-automation`          |      0 |      1 |  **12** |         70 |  70 | P1          | Medium        |
| `networking`             |      0 |      1 |  **42** |         60 |  60 | P2          | **Low**       |
| `electronics`            |      0 |      1 |       0 |         60 |  60 | P2          | Medium        |
| `software`               |      1 |      0 |       8 |         60 |  59 | P2          | Medium        |
| `ai-enterprise-it`       |      0 |      4 |  **12** |         55 |  55 | P1          | **Very high** |
| `smartphones`            |      0 |      1 |       0 |         55 |  55 | P2          | High          |
| `technology-leadership`  |      0 |      1 |       0 |         50 |  50 | P2          | **Low**       |
| `emerging-tech`          |      0 |      0 |       0 |         40 |  40 | P3          | **Very high** |
| `gadgets`                |      0 |      2 |       0 |         40 |  40 | P3          | High          |
| **Total**                | **17** | **23** | **327** | **~1,205** |     |             |               |

**~1,205 genuinely distinct articles** is the honest long-term ceiling across
eighteen subjects. Not 1,600, and not padded to reach it.

Four subjects still hold no backlog: `electronics`, `smartphones`,
`technology-leadership`, `gadgets` — plus `emerging-tech`, which is P3 by
design. Each has a draft already sitting in it except `emerging-tech`, so each
is a candidate for the next phase rather than a gap that has been forgotten.

### Portfolio balance

Diversification is measured as the largest subject's share of the backlog.

| Phase                                | Backlog | Intune share |
| ------------------------------------ | ------: | -----------: |
| After the Intune-only phase          |     100 |     **100%** |
| After security, cloud, M365          |     177 |          42% |
| After Windows and networking         |     257 |          29% |
| **After this phase (five subjects)** | **327** |      **23%** |

Intune's share has fallen every phase without a single Intune topic being
removed. That is the intended mechanism: the portfolio rebalances by growing
the other subjects, not by cutting the strongest one.

---

## 3. New subject categories

The original sixteen left real domains homeless. `development` and `devops` are
**added**; `databases` is held as a promotion candidate. No URL migration was
required — nothing was published in any of them.

### `development` — added

Programming languages, frameworks, APIs, and the craft of building software.
Currently nowhere: `software` is tooling, licensing and productivity, not
writing code.

Clusters: language fundamentals · TypeScript and JavaScript · Python · Go and
Rust · API design (REST, GraphQL) · frameworks · testing · performance ·
architecture patterns · package management and supply chain · accessibility ·
web platform standards.

### `devops` — added

Software delivery and the platforms underneath it. Currently split awkwardly:
`it-automation` is IT-operations scripting, `cloud` is infrastructure. Neither
owns CI/CD, containers or IaC.

Clusters: CI/CD · containers and Docker · Kubernetes · infrastructure as code
(Terraform, Bicep) · GitOps · observability · platform engineering · release
strategy · secrets management · supply-chain security in the pipeline.

**Boundary rule** — `it-automation` automates the _IT estate_ (PowerShell,
Microsoft Graph, endpoint and identity operations). `devops` automates _software
delivery_ (pipelines, containers, IaC). A Graph script that reports device
compliance is `it-automation`; a Terraform module that provisions a cluster is
`devops`.

### `databases` — conditional

Strong enough eventually (~60), but overlaps `development` and `cloud`.
**Recommendation: start as a `development` cluster and promote it to a subject
once it has 15+ researched topics that genuinely do not belong to either
neighbour.** Promoting later costs nothing while nothing is published.

### Considered and rejected

| Domain                      | Home                                                                            | Why not a category                                           |
| --------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Virtualization              | `windows` (Hyper-V), `cloud`, `devops`                                          | Splits naturally; no orphan content                          |
| Storage, backup, DR         | `electronics` (hardware), `cloud` (resilience), `cybersecurity-ciso` (recovery) | Three genuinely different readers                            |
| Privacy                     | `cybersecurity-ciso`                                                            | Governance topic, not a separate discipline here             |
| Productivity, collaboration | `software`, `microsoft-365-entra-id`                                            | Already owned                                                |
| Open source                 | Cross-cutting tag                                                               | Licensing and supply chain sit in `development`              |
| Operating systems           | `windows`, `software`                                                           | `windows` exists; macOS/Linux fit `software`                 |
| Internet technologies       | `networking`                                                                    | Protocols are the networking cluster                         |
| Laptops / computing         | `gadgets` + `buying-guide` type                                                 | Retired deliberately; re-add only if hardware access changes |

---

## 4. Per-subject plan

Each block: clusters → candidate pillars → primary sources → content-type mix →
diagram opportunities → cross-subject links.

### `cybersecurity-ciso` — target 100, **P0**

**Clusters:** foundations and threat models · identity security · authentication
and MFA · Zero Trust · endpoint security · network security · cloud security ·
email and collaboration security · vulnerability management · detection
engineering · incident response · SIEM and SOC operations · data protection ·
governance and risk · compliance frameworks · security architecture · CISO
leadership and board reporting · security automation · supply-chain risk ·
emerging threats.

**Candidate pillars:** _Zero Trust for a Microsoft estate_ (hub) · _Identity is
the security perimeter_ · _Detection and response architecture_ · _Security
governance and frameworks_ · _Incident response readiness_.

**Primary sources:** NIST CSF 2.0 (six functions — Govern, Identify, Protect,
Detect, Respond, Recover; Govern added in the 2024 revision, the first major
update since 2014) · NIST SP 800-53 / 800-61r3 · CISA advisories and KEV · CIS
Controls and Benchmarks · OWASP Top 10 and ASVS · MITRE ATT&CK · vendor primary
docs.

**Content mix:** explainer 30% · reference 20% · decision-framework 20% ·
analysis 15% · troubleshooting 10% · comparison 5%.

**Diagrams:** Zero Trust control plane · identity attack paths (token theft,
AiTM, consent phishing) · detection pipeline from telemetry to case · incident
response phases against NIST SP 800-61r3 · CSF 2.0 function map.

**Links out:** `microsoft-365-entra-id` (Conditional Access, PIM) ·
`microsoft-intune` (compliance, endpoint security) · `enterprise-networking`
(segmentation, ZTNA) · `cloud` (CSPM, workload identity) · `technology-leadership`
(board reporting).

### `cloud` — target 100, **P0**

**Clusters:** foundations and landing zones · cloud identity and workload
identity · networking · compute · storage · managed databases · containers and
Kubernetes · serverless · observability · cost and FinOps · governance and
policy as code · resilience and DR · migration · multi-cloud and portability ·
cloud security posture.

**Candidate pillars:** _Azure landing zones: what to decide first_ (hub) ·
_Cloud identity and least privilege at scale_ · _Cloud networking fundamentals_
· _Cost control that survives contact with engineering_ · _Resilience patterns_.

**Primary sources:** Microsoft Azure docs and Cloud Adoption Framework · AWS
Well-Architected · Google Cloud architecture framework · Kubernetes docs ·
Terraform registry docs · Cloudflare docs.

**Content mix:** explainer 30% · decision-framework 25% · how-to 20% ·
reference 15% · comparison 10%.

**Diagrams:** landing zone and subscription topology · hub-and-spoke networking
· workload identity federation flow · RTO/RPO against DR pattern · cost
allocation model.

**Links out:** `devops` (IaC, pipelines) · `cybersecurity-ciso` (cloud security)
· `microsoft-365-entra-id` (tenant vs subscription identity) · `it-automation`.

### `microsoft-365-entra-id` — target 100, **P0**, 23 topics exist

**Clusters:** identity foundations · authentication methods and passwordless ·
protocols (OAuth 2.0, OIDC, SAML, SCIM) · Conditional Access · privileged
access · hybrid identity · identity protection and monitoring · licensing ·
Exchange Online · SharePoint and OneDrive · Teams governance · Purview and
compliance · tenant architecture · migration · troubleshooting.

**Candidate pillars:** _Entra ID identity foundations_ (hub) · _Conditional
Access design_ · _Passwordless and authentication methods_ · _Microsoft 365
data governance_ · _Hybrid identity_.

**Primary sources:** Microsoft Entra docs · Microsoft 365 docs · Purview docs ·
Microsoft Graph reference · IETF RFCs for OAuth 2.0 and OIDC.

**Diagrams:** token issuance and claims flow · Conditional Access evaluation
order · hybrid identity sync topology · label and DLP precedence.

**Links out:** `microsoft-intune` (device compliance signal) ·
`cybersecurity-ciso` (identity security) · `cloud`.

### `windows` — target 90, **P0**

**Clusters:** architecture and boot · deployment and imaging · servicing and
lifecycle · security (BitLocker, Defender, Credential Guard, VBS/HVCI, App
Control) · identity and directory (AD, Group Policy, Kerberos, PKI) · platform
internals (registry, event logs, services, WMI) · networking on Windows ·
virtualization (Hyper-V, WSL2) · PowerShell for Windows administration ·
performance and troubleshooting · Windows Server · endpoint hardening.

**Candidate pillars:** _Windows in the enterprise_ (hub) · _Windows servicing
and lifecycle_ · _Windows security architecture_ · _Windows troubleshooting
method_.

**Primary sources:** Microsoft Learn Windows client and Windows Server docs ·
Windows release health and lifecycle pages · CIS Benchmarks for Windows.

**Note:** Windows 10 reached end of support on 14 October 2025 and is an
"allowed" but unsupported version in Intune. Every Windows article must be
explicit about which supported version it describes.

**Diagrams:** boot and security feature chain (TPM → Secure Boot → VBS → HVCI)
· servicing channel timeline · Group Policy to CSP mapping · logon flow.

**Links out:** `microsoft-intune` (managing Windows) · `cybersecurity-ciso` ·
`enterprise-networking`.

### `ai` — target 85, **P0**, highest volatility on the site

**Clusters:** how models work (tokens, attention, context) · embeddings and
vector search · RAG architecture · agents and tool use · **MCP and agent
interoperability** · evaluation and testing · inference and serving · local
models · GPU/NPU compute and quantisation · fine-tuning vs prompting · AI
security (prompt injection, data exfiltration, model supply chain) · AI cost
economics · multimodal · AI in developer workflow.

**Candidate pillars:** _How large language models actually work_ (hub) ·
_Retrieval-augmented generation architecture_ · _AI agents and tool use_ ·
_Securing AI systems_ · _Running models locally_.

**Primary sources:** Anthropic, OpenAI and Google model documentation ·
**Model Context Protocol specification — current version `2026-07-28`,
superseding `2025-11-25`; the current release introduced a stateless protocol
core, multi round-trip requests, header-based routing, cacheable list results
and authorization hardening** · NVIDIA docs · Hugging Face docs · OWASP Top 10
for LLM Applications · NIST AI RMF · peer-reviewed papers.

**Volatility rule:** every `ai` article carries a 6-month review and names the
model or spec version it describes. An AI article without a version is wrong
within a quarter.

**Diagrams:** RAG pipeline from ingestion to grounded answer · agent loop with
tool calls · MCP client/server architecture · inference cost model ·
prompt-injection attack path.

**Links out:** `ai-enterprise-it` (deployment and governance) ·
`cybersecurity-ciso` (AI security) · `development` (AI in the toolchain) ·
`cloud` (GPU infrastructure).

### `enterprise-networking` — target 80, P1, 12 topics exist

**Clusters:** campus and branch architecture · routing · switching · VLAN and
VXLAN · segmentation and microsegmentation · SD-WAN · SASE and ZTNA · NAC and
802.1X · enterprise WLAN design · firewalls and NGFW · DDI at scale · monitoring
and telemetry · data-centre networking · network automation.

**Candidate pillars:** _Enterprise network segmentation_ (hub) · _SASE and ZTNA
architecture_ · _Enterprise wireless design_ · _Network monitoring that finds
the real bottleneck_.

**Primary sources:** Cisco, Juniper, Arista, Fortinet, Palo Alto primary docs ·
IETF RFCs · IEEE 802 standards · Cloudflare docs.

**Diagrams:** segmentation reference architecture · 802.1X authentication flow ·
SD-WAN vs MPLS path selection · WLAN channel and cell planning.

### `devops` — target 80, P1, 16 topics exist

**Clusters:** CI/CD fundamentals · GitHub Actions · containers and Docker ·
Kubernetes architecture and operations · IaC with Terraform · Bicep and ARM ·
GitOps · observability (metrics, logs, traces) · platform engineering · release
and rollback strategy · secrets management · pipeline supply-chain security.

**Candidate pillars:** _CI/CD architecture_ (hub) · _Kubernetes for people who
have to operate it_ · _Infrastructure as code in practice_ · _Observability
fundamentals_.

**Primary sources:** Kubernetes, Docker, Terraform, GitHub Actions official docs
· CNCF project documentation · OpenTelemetry · SLSA framework.

**Diagrams:** pipeline stages with gates · Kubernetes control plane and node
components · Terraform state and plan/apply lifecycle · trace propagation.

### `development` — target 80, P1, 18 topics exist

**Clusters:** language fundamentals · TypeScript · Python · Go and Rust · API
design (REST, GraphQL) · web platform and browser standards · frameworks ·
testing strategy · performance · architecture patterns · package management and
supply chain · accessibility · databases for developers _(promotion candidate)_.

**Candidate pillars:** _API design that survives version two_ (hub) · _Testing
strategy_ · _Web performance_ · _Dependency and supply-chain risk_.

**Primary sources:** MDN and WHATWG/W3C · official language and framework docs ·
official GitHub repositories · IETF RFCs for HTTP and TLS.

### `it-automation` — target 70, P1, 12 topics exist

**Clusters:** PowerShell for IT · Microsoft Graph · Intune automation · Entra
automation · reporting and dashboards · scheduled and event-driven automation ·
production-grade scripting (error handling, logging, idempotency) · secrets in
automation · REST APIs and webhooks.

**Candidate pillars:** _Automating Microsoft 365 with Graph_ (hub) ·
_Production-grade PowerShell_.

**Primary sources:** Microsoft Graph reference · PowerShell docs · Azure
Automation docs.

### `networking` — target 60, P2, lowest volatility on the site

**Clusters:** TCP/IP fundamentals · IPv4 and IPv6 · DNS · DHCP · NAT · routing
basics · Ethernet and cabling · Wi-Fi standards (6, 6E, 7) · TLS and
certificates on the wire · HTTP and QUIC · VPN protocols · home and SMB network
design · practical diagnostics.

**Why 60 and not 100:** past ~60 it either restates RFCs or crosses the boundary
into `enterprise-networking`. Its value is that protocol fundamentals age
slowly — this is the cheapest subject to maintain and the best long-term
internal-link target.

**Candidate pillars:** _How the internet actually moves a packet_ (hub) · _DNS
explained properly_ · _Wi-Fi standards and what changes_.

**Primary sources:** IETF RFCs · IEEE 802.11 · Cloudflare Learning Center ·
vendor docs.

### `electronics` — target 60, P2

CPU architecture (x86, ARM, chiplets) · GPUs and NPUs · memory · storage and
NVMe · PCIe · USB and USB-C · Thunderbolt · display standards · power and
charging · thermals · semiconductor manufacturing.

**Primary sources:** manufacturer documentation and specifications · USB-IF ·
PCI-SIG · VESA · JEDEC.

### `software` — target 60, P2

Developer tooling and IDEs · package managers · Git workflows · open-source
licence obligations · browsers in a managed estate · productivity software ·
macOS and Linux for Windows-centric teams · SaaS vs self-hosting.

**Narrowed** by the `development` and `devops` proposals — this becomes tooling,
licensing and platform choice rather than everything software-shaped.

### `ai-enterprise-it` — target 55, P1, 12 topics exist, very high volatility

Copilot readiness and permissions hygiene · Copilot deployment · AI governance ·
data prerequisites and oversharing · agents in IT operations · securing AI
tooling · shadow AI · measuring value.

**Primary sources:** Microsoft Copilot and Purview docs · NIST AI RMF · EU AI Act
where relevant.

### `smartphones` — target 55, P2

Android and iOS platform behaviour · mobile security architecture · update and
support lifecycles · enterprise mobility and BYOD · mobile identity and passkeys
· permissions and privacy · mobile networking (5G, eSIM) · device longevity.

**Primary sources:** Apple Platform Security guide and developer docs · Android
Enterprise and AOSP docs · GSMA and 3GPP for network standards.

### `technology-leadership` — target 50, P2

Strategy and prioritisation · operating models · risk communication · budget and
vendor management · build vs buy · technical debt · documentation practice ·
hiring and capability · measuring effectiveness.

**Why 50:** past that it becomes generic management writing indistinguishable
from every other leadership blog, which fails the publication's own standard.

### `gadgets` — target 40, P3

Home lab hardware · single-board computers · NAS and personal storage ·
peripherals and docking · interoperability friction · setup and hardening ·
repair and longevity.

**Constraint:** `review` content requires the product in hand. Expect very few
reviews and no invented ones.

### `emerging-tech` — target 40, P3

Quantum computing and post-quantum cryptography · confidential computing · edge
and edge AI · spatial computing · robotics and autonomous systems · neuromorphic
and photonic computing · advanced wireless (6G, satellite) · digital twins ·
novel storage.

**Why 40 and not 100:** beyond this it becomes speculation, and speculation
presented as fact would damage the credibility of everything else on the site.
Every claim carries a maturity label: available today · early adoption ·
experimental · research · speculative.

---

## 5. Research tracks

Nine parallel tracks. **Intune is one of them, not the pipeline.**

| Track | Subjects                                                 | Priority | Primary source base                               |
| ----- | -------------------------------------------------------- | -------- | ------------------------------------------------- |
| A     | `microsoft-intune`                                       | P1       | Microsoft Learn                                   |
| B     | `cybersecurity-ciso`                                     | **P0**   | NIST, CISA, CIS, OWASP, MITRE                     |
| C     | `cloud`                                                  | **P0**   | Azure, AWS, GCP, Kubernetes, Terraform            |
| D     | `microsoft-365-entra-id`                                 | **P0**   | Microsoft Entra, Graph, IETF                      |
| E     | `windows`                                                | **P0**   | Microsoft Learn, CIS                              |
| F     | `ai`, `ai-enterprise-it`                                 | **P0**   | Model providers, MCP spec, OWASP LLM, NIST AI RMF |
| G     | `devops`, `development`                                  | P1       | Kubernetes, Docker, Terraform, MDN, W3C           |
| H     | `enterprise-networking`, `networking`                    | P1       | IETF, IEEE, vendor docs                           |
| I     | `electronics`, `gadgets`, `smartphones`, `emerging-tech` | P2–P3    | Manufacturer specs, standards bodies              |

### Sequencing

| Phase | Work                                                        | Gate                                          |
| ----- | ----------------------------------------------------------- | --------------------------------------------- |
| 3a    | Backlogs for tracks B, C, D, E — one per session            | Each ~40–60 researched topics                 |
| 3b    | Backlogs for tracks F, G                                    | Track F needs version discipline from day one |
| 3c    | Backlogs for tracks H, I                                    | —                                             |
| 4     | First pillar in **each** of B, C, D, E — not four in Intune | Four subjects gain a hub                      |
| 5     | Supporting batches, round-robin across tracks               | No subject more than one batch ahead          |
| 6+    | Depth, then breadth toward the targets in §2                | —                                             |

**Standing rule:** Intune receives no further backlog expansion until at least
four other subjects have a researched cluster. It is already 71% of the backlog;
the constraint is what makes this plan real rather than aspirational.

---

## 6. Volatility and maintenance

| Class     | Review                  | Subjects                                                                                          |
| --------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| Very high | 6 months, version named | `ai`, `ai-enterprise-it`, `emerging-tech`                                                         |
| High      | 6 months                | `microsoft-intune`, `microsoft-365-entra-id`, `smartphones`, `gadgets`                            |
| Medium    | 12 months               | `cloud`, `windows`, `devops`, `development`, `it-automation`, `electronics`, `software`           |
| Low       | 24 months               | `networking`, `enterprise-networking`, `technology-leadership`, `cybersecurity-ciso` (frameworks) |

Weighting toward medium and low volatility is deliberate. A portfolio that is
mostly Microsoft cloud coverage carries a review burden that grows faster than
the article count, and `networking` at low volatility is both cheap to maintain
and the best long-term internal-link target.

---

## 7. Schema work this plan requires

| #   | Change                                             | Why                                                                      |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Add `lastResearchedAt` to `Topic`                  | §17 requires recording when research happened; nothing captures it today |
| 2   | Add `audience` and `difficulty` to `Topic`         | Planned but never modelled                                               |
| 3   | Add the three proposed categories                  | `development`, `devops`, then `databases` on promotion                   |
| 4   | Extend `scripts/inventory.ts` to the §21 dashboard | Coverage vs target, pillars, orphans, volatility, duplicate keywords     |

---

## 8. The 38 validation warnings, classified

None is a defect. They are the backlog telling the truth about unfinished work,
and they should not be silenced to make the validator green.

| Class                                               | Count | Warning                                              | Resolution                                                                                                                                                                           |
| --------------------------------------------------- | ----: | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **B** — resolves naturally when articles are linked |    16 | No `relatedSlugs` on a substantial published article | Fixed as each cluster is written and reciprocal links are added. No action now.                                                                                                      |
| **B**                                               |     4 | Orphan: no inbound internal links                    | The three Intune orphans are adopted by pillars `intune-102` and `intune-104`. `vscode-vs-jetbrains` needs a `software` companion — the only one not yet solved by an existing plan. |
| **C** — draft to expand                             |     7 | Draft below 600 words                                | Mapped to a topic and a cluster. See below.                                                                                                                                          |
| **E** — legitimately stays a draft                  |    11 | Draft below 600 words                                | Real intent but no cluster yet; expand when their subject's backlog is built.                                                                                                        |

### The 18 drafts, individually

**Class C — mapped to a cluster, expand when that cluster is written (7)**

| Draft                                     | Topic       | Cluster            | Note                                                      |
| ----------------------------------------- | ----------- | ------------------ | --------------------------------------------------------- |
| `iso-27001-microsoft-365-mapping`         | `sec-103`   | Governance         | Strongest stub at 287 words. Full rewrite, not expansion. |
| `backup-restore-testing`                  | `sec-104`   | Incident response  | Needs a real drill procedure.                             |
| `password-managers-for-teams`             | `sec-105`   | Identity security  | Stays `decision-framework` — nothing was tested.          |
| `cloud-cost-controls`                     | `cloud-04`  | Cost and FinOps    | Designated cluster pillar.                                |
| `local-llms-privacy`                      | `ai-04`     | Local AI           | Designated cluster pillar.                                |
| `graph-api-intune-reporting`              | `intune-71` | Policy delivery    | Rewrite, not expansion.                                   |
| `conditional-access-break-glass-accounts` | `m365-02`   | Conditional Access | Sound intent.                                             |

**Class E — keep as drafts until their subject has a backlog (11)**

`ai-agents-it-operations` · `ai-coding-assistants-enterprise` (both
`ai-enterprise-it`, no backlog yet) · `documentation-that-gets-read`
(`technology-leadership`) · `zero-trust-network-segmentation`
(`enterprise-networking` — but its subject anchor `sec-11` now exists) ·
`wifi-6-vs-wifi-7`, `wifi-troubleshooting` (`networking`, `windows`) ·
`windows-11-vs-windows-10-enterprise` (`windows`) ·
`smartphone-security-for-work` (`smartphones` — parent `sec-101` now exists) ·
`usb-c-cables-explained` (`electronics`) · `raspberry-pi-home-server`
(`gadgets`) · `choosing-a-business-laptop` (`gadgets`).

**Class D — merge candidates: none yet.** Two overlaps were caught at planning
time instead: `sec-42` against `software-04` (dependency risk) and `sec-100`
against `m365-43` (SPF/DKIM/DMARC). Both are flagged in the topic notes with the
ownership split to decide before either is written.

**Class F — promote to published: none.** No draft has been researched to the
standard yet. Promotion happens after research, not before.

---

## 9. Cross-domain knowledge graph

The links that stop the subjects becoming silos. Each is recorded in the topics
themselves via `plannedInternalLinks`, `relatedTopics` and cluster notes, not
just described here.

| From                                      | To                                             | Connection                                                                                      |
| ----------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ai` RAG (`ai-02`)                        | `cybersecurity-ciso` (`sec-90`)                | Prompt injection enters through retrieval. One article owns it — security — and AI links to it. |
| `ai` agents (`ai-03`, `ai-10`)            | `development`, `devops`                        | MCP is a protocol developers implement.                                                         |
| `cloud` identity (`cloud-02`)             | `microsoft-365-entra-id`, `cybersecurity-ciso` | Workload identity is the same problem as user identity, one layer down.                         |
| `cloud` observability (`cloud-16`)        | `devops`                                       | Ownership to be decided before either is written.                                               |
| `cybersecurity-ciso` (`sec-31`, `sec-61`) | `microsoft-intune`, `windows`                  | Security decides the control; Intune delivers it.                                               |
| `cybersecurity-ciso` (`sec-11`)           | `enterprise-networking`                        | Microsegmentation is one topic seen from two disciplines.                                       |
| `cybersecurity-ciso` (`sec-101`)          | `smartphones`, `microsoft-intune`              | BYOD policy is the parent of the mobile-security draft.                                         |
| `cybersecurity-ciso` (`sec-51`)           | `networking`, `development`                    | TLS and certificates: low volatility, high link value.                                          |
| `cybersecurity-ciso` (`sec-82`)           | `technology-leadership`                        | Board reporting is the bridge to the leadership subject.                                        |
| `cybersecurity-ciso` (`sec-52`)           | `emerging-tech`                                | Post-quantum migration.                                                                         |
| `ai` hardware (`ai-16`)                   | `electronics`, `emerging-tech`                 | NPUs and AI PCs.                                                                                |

**Rule applied throughout:** where two subjects could both own a topic, one owns
it and the other links. AI security lives in `cybersecurity-ciso` and is
referenced from `ai` — not written twice.

---

## 10. Open decisions

| #   | Decision                                                          | Recommendation                                                           |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Add `development` and `devops` as subject categories?             | **Yes** — free now, both are homeless today                              |
| 2   | `databases` now or on promotion from `development`?               | **On promotion**, at 15+ distinct topics                                 |
| 3   | Re-add `laptops`? Listed in the brief; retired earlier            | **No** — `gadgets` plus `buying-guide` covers it without a thin category |
| 4   | Accept ~1,205 as the honest ceiling rather than 1,600?            | **Yes** — §2 states the reason per subject                               |
| 5   | Accept the Intune freeze until four other subjects have clusters? | **Yes** — otherwise the rebalance does not happen                        |
