# Technology coverage matrix

What a serious practitioner would expect to find under each subject category,
and therefore what the backlog must eventually cover. This is the substance
behind the capacity numbers in [`CONTENT-ROADMAP.md`](CONTENT-ROADMAP.md) §8.

It is a **coverage map, not an article list**. One line here may become one
article, several, or none — that decision belongs to the researched backlog in
`editorial/segments/`, where uniqueness is enforced. Nothing here is a
commitment to write; it is a commitment to have _considered_.

Boundary rules in [`CONTENT-ROADMAP.md`](CONTENT-ROADMAP.md) §2.2 decide which
category owns a topic that could sit in two.

---

## Enterprise subjects

### `microsoft-intune` — ceiling 100

| Cluster                      | Domains                                                                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Foundations                  | MDM vs MAM · service architecture · tenant model · licensing (Intune Plan 1/2, M365 E3/E5, EMS) · RBAC · scope tags · admin centre boundaries                                                                            |
| Enrollment — Windows         | Autopilot · device preparation · pre-provisioning · self-deploying · bulk enrolment · GPO-triggered · enrollment restrictions · device categories · corporate identifiers · Enrollment Status Page                       |
| Enrollment — other platforms | Android Enterprise (work profile, fully managed, dedicated, AOSP) · iOS/iPadOS (ADE, ABM, user enrolment, account-driven) · macOS (ADE, manual) · Apple Business Manager                                                 |
| Device identity              | Entra join · hybrid join · registered devices · primary user · device objects · Windows Hello for Business                                                                                                               |
| Configuration policy         | Settings catalog · templates · ADMX ingestion · custom OMA-URI · CSPs · config refresh · assignment filters · user vs device targeting · conflict resolution · refresh cycles                                            |
| Application delivery         | Win32 (.intunewin, IntuneWinAppUtil, detection rules, requirements, dependencies, supersedence, return codes) · LOB/MSI · Microsoft Store apps · Enterprise App Catalog · VPP · app protection (MAM) · app configuration |
| Intune Management Extension  | Architecture · logs · platform scripts · remediations · execution order                                                                                                                                                  |
| Compliance                   | Built-in settings · custom compliance (JSON + script) · grace periods · noncompliance actions · the compliance-to-Conditional-Access signal                                                                              |
| Endpoint security            | Security baselines · Defender antivirus · ASR rules · firewall · EDR policy · disk encryption (BitLocker, FileVault) · Windows LAPS · account protection · Defender for Endpoint connector                               |
| Certificates and network     | Microsoft Cloud PKI · SCEP · PKCS · trusted root · Wi-Fi profiles · VPN profiles · per-app VPN                                                                                                                           |
| Updates                      | Update rings · feature update policies · quality updates · expedited updates · driver updates · Windows Autopatch · Delivery Optimization                                                                                |
| Reporting and diagnostics    | Built-in reports · Endpoint analytics · device diagnostics · log collection · audit logs · Graph-based reporting                                                                                                         |
| Co-management and migration  | ConfigMgr co-management · workload transition · tenant attach · Group Policy analytics · GPO to settings catalog                                                                                                         |
| Scale and operations         | RBAC delegation models · multi-tenant · device cleanup and stale objects · operational governance · DR considerations                                                                                                    |

### `microsoft-365-entra-id` — ceiling 100

| Cluster                   | Domains                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity foundations      | Tenants · users · groups (assigned, dynamic) · administrative units · service principals · managed identities · object limits                                |
| Authentication            | Authentication methods policy · passwordless · FIDO2 · passkeys · Windows Hello for Business · MFA · legacy auth blocking · certificate-based auth           |
| Protocols and apps        | OAuth 2.0 · OpenID Connect · SAML · SCIM · app registrations · enterprise applications · consent framework · tokens and claims                               |
| Conditional Access        | Policy design and combination · report-only mode · device filters · session controls · authentication context · break-glass accounts · sign-in log forensics |
| Privileged access         | PIM · role activation · access reviews · entitlement management · Identity Governance                                                                        |
| Hybrid identity           | Entra Connect · cloud sync · password hash sync · pass-through auth · federation · seamless SSO                                                              |
| Protection and monitoring | Identity Protection · risk policies · sign-in and audit logs · workbooks · Sentinel integration                                                              |
| Licensing                 | Entra P1/P2 · group-based licensing · Business Premium boundaries · what each tier actually gates                                                            |
| Microsoft 365 workloads   | Exchange Online · SharePoint · OneDrive · Teams · governance and sprawl                                                                                      |
| Purview and compliance    | Sensitivity labels · DLP · retention · eDiscovery · audit · Information Protection                                                                           |

### `cybersecurity-ciso` — ceiling 100

| Cluster                  | Domains                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Architecture             | Zero Trust · defence in depth · segmentation strategy · secure-by-design · threat modelling               |
| Identity security        | IAM · PAM · MFA · passwordless · identity attacks (phishing, token theft, consent phishing, AiTM)         |
| Detection and response   | SIEM · SOAR · EDR · XDR · detection engineering · threat hunting · incident response · forensics          |
| Data protection          | DLP · classification · encryption at rest and in transit · key management · backup and recovery integrity |
| Vulnerability management | Scanning · prioritisation (CVSS, EPSS, KEV) · patch management · exposure management                      |
| Frameworks               | NIST CSF · NIST SP 800-53/171 · ISO 27001 · CIS Controls and Benchmarks · OWASP Top 10 · SOC 2            |
| Governance               | Risk registers · board reporting · security metrics · policy · third-party and supply-chain risk          |
| Threats                  | Ransomware · BEC · insider risk · cloud attack paths · living-off-the-land                                |
| Resilience               | Backup architecture · restore testing · DR · tabletop exercises · business continuity                     |

### `enterprise-networking` — ceiling 75

Campus and branch architecture · enterprise routing and switching · VLAN and
VXLAN · segmentation and microsegmentation · SD-WAN · SASE · ZTNA · NAC and
802.1X · enterprise WLAN design · firewalls and NGFW · WAN optimisation ·
network monitoring and telemetry · NetFlow · data-centre networking · network
automation · DDI at enterprise scale.

### `ai-enterprise-it` — ceiling 55

Copilot readiness and permissions hygiene · Copilot deployment and adoption ·
AI governance and acceptable use · data prerequisites and oversharing · AI
agents in IT operations · securing AI tooling · shadow AI · AI in the service
desk · measuring value.

### `it-automation` — ceiling 74

PowerShell for IT (error handling, logging, idempotency, modules) · Microsoft
Graph (permissions, throttling, pagination, batch) · Intune automation · Entra
automation · REST APIs and webhooks · GitHub Actions and CI/CD for operations ·
infrastructure as code (Terraform, Bicep, Ansible) · scheduled and event-driven
automation · reporting pipelines · secrets handling in automation.

### `technology-leadership` — ceiling 45

Strategy and prioritisation · operating models and team design · technical risk
communication · budgeting and vendor management · build vs buy · technical debt ·
documentation practice · hiring and capability · measuring engineering and IT
effectiveness.

---

## Technology subjects

### `windows` — ceiling 80

| Cluster                         | Domains                                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Deployment                      | Imaging vs provisioning · Autopilot from the OS side · unattend · WinPE · migration from Windows 10                                            |
| Servicing                       | Servicing channels · lifecycle and end-of-support dates · feature vs quality updates · WSUS · Windows Update for Business                      |
| Security                        | BitLocker · Defender · Credential Guard · VBS and HVCI · App Control / WDAC · Smart App Control · TPM · Secure Boot · attack surface reduction |
| Identity and directory          | Active Directory · Group Policy · Kerberos and NTLM · certificates and PKI · DNS and DHCP on Windows                                           |
| Platform                        | Registry · event logs · services · scheduled tasks · WMI/CIM · Windows networking stack · storage                                              |
| Virtualization                  | Hyper-V · WSL2 · sandbox · nested virtualization                                                                                               |
| Performance and troubleshooting | Boot and login analysis · resource contention · driver issues · crash and hang diagnosis · Windows Server basics                               |

### `software` — ceiling 60

Developer tooling and IDEs · package managers (winget, npm, pip) · version
control and Git workflows · open-source licence obligations · supply-chain risk ·
browsers in a managed estate · productivity software · macOS and Linux for
Windows-centric teams · virtualization and containers on the desktop · SaaS vs
self-hosting.

### `ai` — ceiling 70

How transformer models work · tokens, context and embeddings · RAG and
retrieval architecture · vector databases · agents and tool use · MCP · model
evaluation · inference and serving · local models and hardware requirements ·
GPU and NPU compute · quantisation · fine-tuning vs prompting · AI security
(prompt injection, data exfiltration, model supply chain) · inference cost.

### `cloud` — ceiling 100

| Cluster              | Domains                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| Foundations          | Landing zones · subscription and account structure · management groups · tagging · resource organisation |
| Identity             | Cloud IAM · workload identity · federation · least privilege at scale                                    |
| Networking           | VNet/VPC design · peering · private endpoints · egress control · hybrid connectivity · DNS               |
| Compute and platform | VMs · containers · Kubernetes (AKS/EKS/GKE) · serverless · app platforms                                 |
| Data                 | Object storage · managed databases · caching · backup and lifecycle                                      |
| Cost                 | FinOps · reservations and savings plans · rightsizing · cost allocation and showback                     |
| Resilience           | Availability zones and regions · DR patterns · RTO/RPO · chaos and failure testing                       |
| Governance           | Policy as code · guardrails · compliance baselines · CSPM                                                |
| Operations           | Observability · logging · alerting · SRE practice                                                        |
| Migration            | Assessment · rehost vs replatform · coexistence · cutover                                                |

### `electronics` — ceiling 60

CPU architecture (x86, ARM, chiplets) · GPUs and NPUs · memory (DDR, LPDDR,
channels, ECC) · storage (NAND, SSD controllers, NVMe, endurance) · PCIe
generations and lanes · USB and USB-C (power delivery, alt modes, the cable
problem) · Thunderbolt · display technology and standards (HDMI, DisplayPort,
panel types, HDR) · power delivery and charging · thermals and cooling ·
semiconductor manufacturing and process nodes.

### `gadgets` — ceiling 35

Home lab and small server hardware · single-board computers · NAS and personal
storage · peripherals and docking · audio and displays in practice ·
interoperability and standards friction · device setup and hardening · repair
and longevity.

### `smartphones` — ceiling 40

Android and iOS platform behaviour · mobile security architecture (secure
enclave, verified boot, sandboxing) · update and support lifecycles · enterprise
mobility and BYOD · mobile identity and passkeys · app permissions and privacy ·
mobile networking (5G, eSIM, Wi-Fi calling) · device longevity.

### `networking` — ceiling 30

Ethernet and cabling standards · Wi-Fi standards (6, 6E, 7) and radio behaviour ·
TCP/IP fundamentals · IPv4 and IPv6 · DNS · DHCP · NAT · routing basics · VPN
protocols · TLS and certificates on the wire · home and small-business network
design · practical diagnostics.

### `emerging-tech` — ceiling 30

Quantum computing and post-quantum cryptography · confidential computing · edge
and edge AI · spatial computing and AR/VR/MR · robotics and autonomous systems ·
neuromorphic and photonic computing · advanced wireless (6G, satellite
connectivity) · digital twins · novel storage and memory technologies.

**Standing rule for this category:** every claim is labelled by maturity —
available today · early adoption · experimental · research · speculative.
Speculation presented as fact is the failure mode this category invites, and it
would damage the credibility of everything else on the site.

---

## Coverage status

Where the backlog actually stands against the map above.

| Subject                  | Ceiling | Backlog topics | Published | Coverage                              |
| ------------------------ | ------: | -------------: | --------: | ------------------------------------- |
| `microsoft-intune`       |     100 |             44 |        15 | Clusters mapped; foundations missing  |
| `microsoft-365-entra-id` |     100 |             23 |         1 | Partial; CA and identity started      |
| `software`               |      60 |              8 |         1 | Thin                                  |
| `cybersecurity-ciso`     |     100 |              0 |         0 | **No backlog**                        |
| `enterprise-networking`  |      75 |              0 |         0 | **No backlog**                        |
| `ai-enterprise-it`       |      55 |              0 |         0 | **No backlog**                        |
| `it-automation`          |      74 |              0 |         0 | **No backlog**                        |
| `technology-leadership`  |      45 |              0 |         0 | **No backlog**                        |
| `windows`                |      80 |              0 |         0 | **No backlog**                        |
| `ai`                     |      70 |              0 |         0 | **No backlog**                        |
| `cloud`                  |     100 |              0 |         0 | **No backlog**                        |
| `electronics`            |      60 |              0 |         0 | **No backlog**                        |
| `gadgets`                |      35 |              0 |         0 | **No backlog**                        |
| `smartphones`            |      40 |              0 |         0 | **No backlog**                        |
| `networking`             |      30 |              0 |         0 | **No backlog**                        |
| `emerging-tech`          |      30 |              0 |         0 | **No backlog**, and no content at all |

**13 of 16 subjects have no backlog.** Building them is Phase 2, one researched
segment per session — the pace the uniqueness test can actually police.
