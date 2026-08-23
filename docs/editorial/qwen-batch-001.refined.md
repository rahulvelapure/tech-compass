# Qwen Batch 001 — refinement record

Companion to the Qwen source draft. **The source is not edited.** This file
records what was decided, what was corrected and why, so the provenance of each
published article is recoverable without re-reading the draft.

| | |
|---|---|
| Source file | `docs/editorial/batch-001.md` |
| Source checksum (MD5) | `c40b3df5f2ed28501a8621438bbfa21c` |
| Source size | 76,470 bytes, last modified 2026-08-21 |
| Articles in batch | 5 |
| Refined and published | 4 |
| Held / rejected | 1 |
| Refined on | 2026-08-23 |

> **Naming note.** The brief specified `docs/editorial/qwen-batch-001.md`. No
> such file exists — the batch-001 source is named `batch-001.md`, and only
> batch 006 carries the `qwen-` prefix (as a byte-identical duplicate of
> `batch-006.md`). The source was left where it is rather than renamed, since
> renaming is a change to the thing we are trying to preserve. The checksum
> above pins the exact bytes this refinement was made from.

The refined article is the TypeScript file under `src/content/articles/`. That
is the version the site renders; this document is the audit trail, not a second
copy of the prose.

---

## Editorial gates applied

| Gate | Threshold | Batch result |
|---|---|---|
| Standfirst | FRE ≥ 70 | 86.9 – 107.1 |
| Opening paragraph | FRE ≥ 65 | 76.6 – 92.5 |
| FAQ answers (worst in article) | FRE ≥ 70 | 70.1 – 75.1 |
| Technical body | FRE ≥ 55 | 59.3 – 70.1 |
| Average sentence length | ≤ 15 words | 12.4 – 13.1 |
| Longest sentence | ≤ 35 words | 29 – 35 |

Measured with `scripts/readability.cli.ts`. Prose only — code blocks, ASCII
diagrams and inline SVG are excluded, because they contain no sentences and
would otherwise distort the result.

Terminology was preserved throughout. No product name, protocol or standard was
removed to move a score. Where a gate needed work, the fix was sentence length
and plainer connecting words, never the technical vocabulary.

---

## Article 1 — Entra ID vs Active Directory

| | |
|---|---|
| Decision | **REFINED → published** |
| Draft title | Microsoft Entra ID vs. Active Directory: Why They Are Not the Same Thing |
| Published title | Entra ID and Active Directory are not the same system |
| Slug | `entra-id-vs-active-directory-differences` (unchanged from draft) |
| URL | `/microsoft-365-entra-id/entra-id-vs-active-directory-differences` |
| File | `src/content/articles/microsoft-365-entra-id/entra-id-vs-active-directory-differences.ts` |
| Backlog | `m365-52` |

**Overlap audit.** Closest published article is `entra-join-vs-hybrid-join`.
That one answers *which join type should this device use*; this one answers
*how do the two directories differ*. Different search intent, different reader
moment. No conflict — and they now link to each other.

**Technical corrections.**

1. *"ADFS is now deprecated in favor of direct federation."* — **Wrong.** AD FS
   is a supported product. Microsoft directs new work toward Entra ID, which is
   not the same claim. Rewritten to say migration removes a server you must keep
   secure, rather than implying a deadline.
2. *Password hash sync "takes the NT hash … and hashes it again using SHA256."*
   — **Imprecise to the point of being misleading.** The actual derivation is
   MD4, then a 10-byte salt, then PBKDF2 with 1,000 iterations of HMAC-SHA256.
   Corrected, because the detail is exactly what someone needs when asked
   whether a cloud breach exposes on-premises credentials.
3. *"Entra ID does not use Kerberos."* — **Overstated.** Added a callout for
   Entra Kerberos (Azure Files) and cloud Kerberos trust for Windows Hello for
   Business. Both are narrow exceptions, but stating the rule absolutely is
   wrong.

**Editorial changes.** The draft's "Practical Takeaways" opened with *"Stop
calling Entra ID 'Azure AD'"*, which is naming advice rather than a takeaway;
moved to the FAQ where the question actually gets asked. Removed the
conclusion's "two different tools built for two different eras" framing, which
restates the standfirst.

**Internal links (5, all published):** `intune-policy-conflicts`,
`group-policy-to-settings-catalog-migration`, `entra-join-vs-hybrid-join`,
`conditional-access-framework`, `conditional-access-break-glass-accounts`.

---

## Article 2 — BGP in the cloud

| | |
|---|---|
| Decision | **REFINED → published** |
| Draft title | BGP in the Cloud: Why You Need to Understand Border Gateway Protocol |
| Published title | BGP in the cloud: the protocol you stopped being able to ignore |
| Slug | `bgp-in-the-cloud-why-it-matters` (unchanged from draft) |
| URL | `/enterprise-networking/bgp-in-the-cloud-why-it-matters` |
| File | `src/content/articles/enterprise-networking/bgp-in-the-cloud-why-it-matters.ts` |
| Backlog | `entnet-13` |

**Overlap audit.** The backlog holds `networking`-segment topic *BGP
fundamentals: how the internet agrees on a path*, still at IDEA. Scope was kept
deliberately on hybrid cloud connectivity — Direct Connect, ExpressRoute,
communities, asymmetric routing — so the fundamentals piece remains writable
without competing for the same query. Recorded in the backlog note.

**Technical corrections.**

1. *"advertising a route with the community `7224:71`"* — **Not a valid value.**
   AWS local-preference communities are `7224:7100` (low), `7224:7200` (medium)
   and `7224:7300` (high). This is the most consequential error in the batch: a
   malformed community is ignored rather than rejected, so the session stays up,
   the prefixes appear, and the routing silently ignores the operator's intent.
   A warning callout was added specifically because the short form circulates in
   blog posts and forum answers.
2. *"cloud provider's virtual network uses jumbo frames (9000 bytes)
   internally"* — **Over-specific.** Generalised to path MTU differing along the
   route, with TCP MSS clamping as the fix, rather than asserting a value that
   varies by provider and circuit.

**Editorial changes.** The draft's failover scenario explained outbound steering
and then mentioned return traffic almost in passing. Since one-directional
steering *is* the cause of asymmetric routing, that was made the point of the
section rather than a footnote to it.

**Internal links (1 in body, plus 2 related):** `zero-trust-network-segmentation`
in body; related to `cloud-cost-controls`.

---

## Article 3 — Passkeys in the enterprise

| | |
|---|---|
| Decision | **REFINED → published** |
| Draft title | The Reality of Passkeys: Why They Aren't a Magic Bullet for Enterprise Phishing Yet |
| Published title | Passkeys stop phishing. They do not stop the helpdesk calls |
| Slug | `passkeys-enterprise-deployment-reality` (unchanged from draft) |
| URL | `/cybersecurity-ciso/passkeys-enterprise-deployment-reality` |
| File | `src/content/articles/cybersecurity-ciso/passkeys-enterprise-deployment-reality.ts` |
| Backlog | `sec-106` |

**Overlap audit.** The backlog holds `m365` topic *Passwordless in practice:
passkeys, Windows Hello and the rollout order* (IDEA), which is a how-to on
sequencing a rollout. This article is an assessment of what deployment costs.
Different content type and different intent, so both remain viable — but they
must not both become rollout guides. Flagged for whoever writes the other.

**Technical corrections.**

1. **The draft contradicted itself.** It stated twice that "the private key
   never leaves the authenticator device", then two sections later described
   operating systems syncing passkeys across devices via iCloud Keychain and
   Google Password Manager. Both cannot be true. Rewritten around the FIDO
   Alliance's own device-bound / synced distinction, which is the actual state
   of the standard, with a comparison table.
2. *Windows Hello listed among authenticators that sync to the cloud.* —
   **Wrong.** Windows Hello for Business credentials are device-bound. Given a
   whole callout, because the mistake directly causes the lockout scenario the
   article is about.
3. *"Entra ID and other identity providers are working on enterprise-managed
   passkeys … still maturing."* — Removed. Vague forward-looking claims about
   unshipped capability date badly and cannot be verified. Replaced with what is
   true now.

**Editorial changes.** Cut the draft's closing paragraph about organisations
that "successfully leverage passkeys to build a truly phishing-resistant
identity architecture" — marketing cadence, no information. The article now ends
on where the hard problem actually moves to.

**Internal links (2 in body, plus 3 related):**
`conditional-access-break-glass-accounts`, `conditional-access-framework` in
body; related also to `entra-id-vs-active-directory-differences`.

---

## Article 4 — Kubernetes pod networking

| | |
|---|---|
| Decision | **REFINED → published** |
| Draft title | Kubernetes Pod Networking: What Actually Happens When a Container Sends a Packet |
| Published title | What actually happens when a pod sends a packet |
| Slug | `kubernetes-pod-networking-packet-flow` (unchanged from draft) |
| URL | `/devops/kubernetes-pod-networking-packet-flow` |
| File | `src/content/articles/devops/kubernetes-pod-networking-packet-flow.ts` |
| Backlog | `devops-17` |

**Overlap audit.** Checked against `ingress-nginx-archived-migration`
(published) and `ebpf-production-observability-security-boundaries` (draft). The
ingress article is about replacing a specific archived controller; this is about
the packet path beneath it. The eBPF draft covers eBPF as an observability and
security technology; the overlap here is one row in one table. No conflict.

**Technical verification — no corrections required.** This was the strongest
draft in the batch. Verified and correct as written: veth pairs and network
namespaces; the bridging/routing split; VXLAN's ~50-byte overhead and the
resulting 1450 MTU on a 1500-byte network; kube-proxy's iptables, IPVS and eBPF
modes; ClusterIP as a virtual address resolved by destination NAT; conntrack
table exhaustion and `nf_conntrack_max`; the BGP requirement for native routing.

**Editorial changes.** Structure only. The draft buried the MTU symptom —
*small packets pass, large packets fail* — inside a numbered mistakes list. It
is the single most diagnostic signal in the article, so it was pulled out and
stated as a pattern worth memorising.

**Deliberate omission.** The draft suggested linking eBPF. That article is
currently a draft, and a published-to-draft link fails content validation and
would dead-end a reader. Left out, and noted in the backlog so it can be added
when the eBPF piece publishes.

**Internal links (3 in body, plus 2 related):**
`bgp-in-the-cloud-why-it-matters`, `ingress-nginx-archived-migration`,
`zero-trust-network-segmentation`.

---

## Article 5 — Windows Autopilot OOBE troubleshooting

| | |
|---|---|
| Decision | **HELD — rejected for duplicate intent** |
| Draft title | Windows Autopilot Troubleshooting: What to Do When the OOBE Enrollment Fails |
| Proposed slug | `windows-autopilot-troubleshooting-oobe-failure` |
| Status | Not written. No file created. |

**Reason.** The topic is already covered by four published articles, and the
overlap is on the failure modes themselves rather than on the subject heading:

| Published article | Overlap |
|---|---|
| `autopilot-device-registration-failures` | Registration failures during OOBE — the draft's primary scenario |
| `enrollment-status-page-troubleshooting` | ESP behaviour and timeouts during enrolment |
| `autopilot-pre-provisioning-failures` | Pre-provisioning path failures |
| `compliant-device-conditional-access-blocked` | Post-enrolment compliance blocking |

Publishing it would put five articles in front of one query and split their
authority, which is the outcome the duplicate-intent gate exists to prevent.

Worth noting how it was found. The automated slug-token check **missed this** —
`windows-autopilot-troubleshooting-oobe-failure` and
`autopilot-device-registration-failures` share only the token `autopilot`, below
the two-token threshold. It surfaced on reading. A prior editorial session
reached the same conclusion independently, which is recorded in
`docs/HANDOVER.md`.

**Recommendation.** Reject rather than merge. The draft contains nothing the
four published articles lack. If any gap exists it is a router — a short page
pointing at the right one of the four by symptom — and that is a different
piece of work from this draft.

---

## Sources used for verification

Primary documentation only. Where a claim could not be tied to one of these, it
was cut rather than softened.

**Microsoft Learn**
- Compare Active Directory to Microsoft Entra ID
- What is Microsoft Entra Connect?
- Implement password hash synchronisation with Microsoft Entra Connect Sync
- What is device identity in Microsoft Entra ID?
- Microsoft Entra Cloud Sync
- Passwordless authentication options for Microsoft Entra ID
- Enable passkeys in Microsoft Entra ID
- Continuous access evaluation
- ExpressRoute routing requirements
- Virtual network traffic routing (user-defined route precedence)

**Amazon Web Services**
- Routing policies and BGP communities for AWS Direct Connect
- AWS Direct Connect virtual interfaces

**Kubernetes / CNCF**
- Cluster networking
- Virtual IPs and Service proxies
- Network policies
- Container Network Interface specification

**Standards bodies**
- W3C — Web Authentication (WebAuthn) Level 2
- FIDO Alliance — Passkeys
- IETF — RFC 4271 (BGP-4), RFC 7348 (VXLAN)

---

## Validation at completion

| Gate | Result |
|---|---|
| TypeScript | pass — no diagnostics |
| ESLint | pass — 0 errors (6 pre-existing warnings, untouched `ui/` files) |
| Tests | pass — 215/215 |
| Content validation | pass — 45 articles, 22 categories, 0 errors |
| Internal link integrity | pass — 11 body links, all resolve, none to a draft |
| Duplicate slug check | pass |
| Readability gates | pass — 4/4 articles, all tiers |
| Production build | pass |

Two guards fired during the pass and were resolved deliberately rather than
suppressed:

- **URL pin.** `tests/reactions.test.ts` pins the published URL set. The change
  was confirmed purely additive — 4 added, 0 existing URLs altered — before the
  pin was updated from 29 to 33.
- **Related-content affinity.** `cloud-cost-controls` explicitly led with
  `terraform-vs-opentofu`, which shares no tag or category with it. The test
  only skips articles with no related candidate at all, so this passed until the
  BGP article gave it a genuine one. Fixed by leading with the BGP article
  instead.

Nothing was committed, pushed or deployed.
