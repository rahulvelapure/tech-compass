# Handover

Current state of Tech Compass, written for a session starting cold. Every figure
below was read from the repository on 2026-08-23, not recalled.

Companion documents: [`REDESIGN-HANDOFF.md`](./REDESIGN-HANDOFF.md) (frontend),
[`MASTER-COVERAGE-PLAN.md`](./MASTER-COVERAGE-PLAN.md) (editorial scope),
[`RESEARCH-STANDARD.md`](./RESEARCH-STANDARD.md) (research method),
[`PUBLISHING.md`](./PUBLISHING.md) (mechanical workflow),
[`CONTENT-ARCHITECTURE.md`](./CONTENT-ARCHITECTURE.md) (why articles are
TypeScript modules).

Per-batch editorial records live in `docs/editorial/qwen-batch-00N.refined.md`
— read the one for the batch you are touching before touching it.

---

## 1. Read this first

**44 uncommitted paths.** Everything passes its gates and none of it is staged
or backed up anywhere. Branch is `redesign/editorial-system`; last commit is
`e3d6d0b`. If this machine is lost, so is all of it.

**Two decisions are open and block the next step.** They are in section 6. Do
not start Batch 007 assuming they are settled.

**Production is live and reactions are still broken on it.** `https://rahulvelapure.dpdns.org`
returns 200. The reaction control renders zero buttons on a live article,
because the server function returns `{ available: false }`. Root cause was
traced (section 7) and is a deployment-configuration problem, not code.

---

## 2. Two standing rules the user has restated repeatedly

**Do not let Intune dominate the corpus.** Microsoft Intune already holds 15
published articles, more than any other category. New work should broaden
coverage, not deepen that one.

**Research from primary sources.** Vendor documentation, RFCs, W3C, FIDO
Alliance, CNCF. Not blog posts, not summaries, not memory. This has caught a
factual error in most batches.

---

## 3. Where the editorial run stands

| | |
|---|---|
| Batches complete | 001–006 |
| Batches remaining | 007, 008, 009, 010, 011 — 5 articles each, 25 total |
| Articles refined | 31 |
| Held | 4 |
| Rejected | 1 |
| Readability gate pass rate | 31 / 31 |
| Corpus now | 67 articles: 55 published, 12 draft |

Batch 007's source is `docs/editorial/batch-007.md`. Note `batch-009 .md` has a
**space before the extension** — quote the path.

### Frozen editorial gates

Do not change these without the user saying so.

| Tier | Threshold |
|---|---|
| Standfirst | Flesch Reading Ease ≥ 70 |
| FAQ answers | ≥ 70 |
| Opening paragraph | ≥ 65 |
| Technical body | ≥ 55 |
| Average sentence length | ≤ 15 words |
| Longest sentence | ≤ 35 words |

Measured with `bun run scripts/readability.cli.ts <slug>`. Both scripts
(`readability.ts`, `readability.cli.ts`) were written during this run and are
uncommitted.

**Why the body gate is 55 and not 70.** The user originally froze 70 globally. A
corpus-wide measurement showed that unreachable: Flesch is
`206.835 − 1.015·ASL − 84.6·ASW`, and above roughly 1.70 syllables per word the
formula cannot reach 70 **at any sentence length**. The published corpus averages
1.68; the Qwen drafts 1.85. Zero of 79 articles could reach 70 even at 12-word
sentences. The tiered standard was proposed with that evidence and approved. If
someone proposes reverting to a flat 70, this is the argument.

**Two measurement bugs were found and fixed** in the tool during the run. Blocks
were joined without terminators, so headings ran into the paragraph below and
were measured as one long sentence. And inline code was unwrapped into the
prose, so an identifier like `microsoft.directory/deviceLocalCredentials/…`
counted as one twelve-syllable English word. Both are fixed; scores before
Batch 003 were pessimistic.

---

## 4. The per-article workflow

Follow it in order. Skipping the audit step is how duplicates get published.

1. **Duplicate audit** — against published articles, other refined articles, and
   remaining Qwen batches. Check the specific concept, not the topic name. Grep
   the candidate's core terms against existing files; several "obvious overlaps"
   turned out to have zero, and one "obviously distinct" article turned out to
   share twelve mentions.
2. **Verify claims against primary sources.** The Microsoft Learn MCP tool
   (`microsoft_docs_search`) is available and has repeatedly paid for itself.
3. **Rewrite.** The goal is a correct, readable article, not preserved Qwen
   wording.
4. **Remove invented numbers.** Pricing, benchmarks, percentages, case-study
   figures, latency claims. Every batch has contained some.
5. **SEO and internal links** — only to published articles, never to a draft.
6. **Readability**, iterating until all tiers pass.
7. **Backlog entry** in `editorial/segments/<category>.ts` with a `notes` field
   recording what was corrected and why. The suite requires every published
   article to have one.
8. **Validation**, then the `.refined.md` companion.

### Two traps that cost time

**Seed round numbers.** Every slug derives a "likes" baseline, and
`tests/reactions.test.ts` rejects any that lands on a multiple of 50. Check
*before* writing the file:

```bash
node -e 'const f=(s)=>{const i="likes:v1:"+s;let h=0x811c9dc5;for(let k=0;k<i.length;k++){h^=i.charCodeAt(k);h=Math.imul(h,0x01000193)>>>0;}h^=h>>>16;h=Math.imul(h,0x7feb352d)>>>0;h^=h>>>15;h=Math.imul(h,0x846ca68b)>>>0;h^=h>>>16;return 1500+((h>>>0)%1001);};console.log(f("your-slug-here"))'
```

If it hits a multiple of 50, **change the slug, not the seed.** A `SEED_OVERRIDES`
entry looks like the sanctioned fix and breaks a second test that asserts every
article matches the pure hash. The two tests are in genuine tension.

**`readingMinutes`** is validated against computed body length and will fail the
content validator. Write the article, run validation, set the number it tells
you.

---

## 5. Corrections found so far — the pattern is worth knowing

Roughly one factual error per two articles. Categories, with examples:

- **Invented identifiers.** `msDS-ManagedPassword` for LAPS (that is a gMSA
  attribute), `DeviceLocalAdministratorPassword.Read.All` (does not exist), a
  VPC Lattice DNS format borrowed from Kubernetes, Lattice pricing described in
  Elastic Load Balancing units.
- **Wrong claim names.** Entra authentication context uses `acrs`, not the
  standard OIDC `acr`. Validating the wrong one leaves a security hole.
- **Deprecation claims that are not true.** AD FS is not deprecated. AppLocker
  is not deprecated — it gets security fixes and no new features, and it
  complements App Control for per-user rules. This has now come up twice.
- **Product confusion.** Linkerd does not use Envoy; it has its own Rust proxy.
- **Stale product names.** WDAC is now App Control for Business.
- **CVE/version inversions.** A draft named an OpenSSL version as vulnerable to
  a CVE that version *fixed*. Recorded twice now. Check whether a version is the
  last affected or the first fixed.
- **Security overstatements.** DPoP does not stop XSS — with a non-extractable
  key an attacker cannot exfiltrate the token but can still sign requests from
  the victim's origin.
- **Omissions that change a design.** PIM requires Entra ID P2 and emergency
  access accounts must be excluded from it. RDS Proxy *pins* on session state
  and silently stops pooling.

---

## 6. Open decisions — blocking

### Decision A: Release 001 scope

The user chose five articles: `entra-id-vs-active-directory-differences`,
`kubernetes-pod-networking-packet-flow`, `cloud-egress-costs-architecture-problem`,
`passkeys-enterprise-deployment-reality`,
`terraform-state-locking-drift-enterprise-reality`.

Marking the other 21 refined articles as drafts breaks validation in five
places, because a published article may not link to a draft:

```
RELATED  cloud-cost-controls                   -> bgp-in-the-cloud-why-it-matters
INLINE   kubernetes-pod-networking-packet-flow -> bgp-in-the-cloud-why-it-matters
RELATED  kubernetes-pod-networking-packet-flow -> bgp-in-the-cloud-why-it-matters
INLINE   terraform-state-locking-drift…        -> secrets-management-cicd-vault-oidc-reality
RELATED  terraform-state-locking-drift…        -> secrets-management-cicd-vault-oidc-reality
```

The dependency is transitive. Closing it grows the set to **10**: the five, plus
`bgp-in-the-cloud`, `secrets-management-cicd-vault-oidc-reality`,
`oauth2-token-theft-dpop-mechanics`,
`kubernetes-storage-classes-costs-performance-traps`,
`saml-federation-security-risks-trust-boundaries`.

Two options were put to the user and **neither has been chosen**:

1. Release the closure of 10. No content edited for mechanical reasons.
   Recommended.
2. Hold to 5, with three targeted link edits, re-added later.

One edit is worth doing regardless: `cloud-cost-controls` leads its related list
with `bgp-in-the-cloud`, chosen to satisfy the related-content affinity test.
`cloud-egress-costs-architecture-problem` is a better editorial pairing and is
in the release set either way.

### Decision B: publication dates

**Approved:** Option A, rolling publication. `publishedAt` is the real date an
article goes live. No backdating, no future dates, no scheduled-publishing
feature.

**Not yet supplied:** the actual deployment date to stamp on Release 001.

Constraints found in the audit, worth not rediscovering:

- `formatDate` (`content.ts:371`) hard-codes `${iso}T00:00:00Z`. Any timestamp
  with a time component yields `Invalid Date`. Date-only is required unless that
  function changes.
- The validator rejects future `publishedAt` outright
  (`validate-content.ts:493`).
- `publishedAt` is genuinely the single source of truth, feeding card rendering,
  sorting, homepage composition, JSON-LD, OpenGraph, RSS and sitemap.
- Current distribution is poor: 55 published articles across **9 distinct
  dates**, 51 of them sharing a date. 22 sit on 2026-08-23. Because
  `localeCompare` ties and `Array.sort` is stable, those 22 are ordered by
  filename, not editorially.

### Held articles — four, awaiting a merge/differentiate/reject decision

- `zero-trust-network-segmentation-boundaries` — direct duplicate of a published
  article. Recommend reject.
- `intune-vs-group-policy-migration-reality` — strong overlap. The only distinct
  space is the *decision* of whether to migrate a given GPO, which is a
  different article.
- `linux-ebpf-security-monitoring-kernel-probes` — overlaps the eBPF draft.
- `kubernetes-gateway-api-vs-ingress-migration` — **recommend reject.** The
  published `ingress-nginx-archived-migration` mentions Gateway API twelve times
  and already covers the migration path including `ingress2gateway`. If Gateway
  API deserves its own article, the remaining space is API design
  (`GatewayClass`/`Gateway`/`HTTPRoute` role separation), written from intent.

Already rejected: `windows-autopilot-troubleshooting-oobe-failure` (duplicated
four published Autopilot articles).

---

## 7. Production: reactions are broken, and why

The server function returns exactly `{ available: false }` — verified on the
wire for two different published articles, so it is systemic rather than
slug-specific. `wrangler tail` shows no errors, which is itself the clue.

`getArticleReactions` has three ways to return unavailable. The `try/catch` logs
via `console.error`; a clean tail rules it out. `isReactable` is ruled out by the
failure being systemic. That leaves line 6:

```ts
if (!db || !secret) return UNAVAILABLE;   // logs nothing
```

So either `reactionDb()` returned null or `reactionSecret()` returned null. Both
are deployment configuration, not code. What was verified:

- `globalThis.__env__ = env` **is** present in the deployed worker, set per
  request. The binding mechanism works.
- The D1 binding is declared in committed `wrangler.jsonc` as `REACTIONS_DB`,
  matching what the code reads.
- `wrangler.jsonc` has **no `vars` block**, so the signing secret can only exist
  as a Worker secret, and nothing indicates one was ever set.

**Most likely cause: the signing secret is missing.** One read-only command
settles it:

```bash
npx wrangler secret list --name rahulvelapure
```

An empty list confirms it. The secret chain is `REACTIONS_COOKIE_SECRET` →
`NEWSLETTER_FORM_SECRET` → `BREVO_API_KEY`.

Worth noting for whoever fixes it: the guard is stricter than the read path
needs. An anonymous reader with no cookie never uses the secret, so a missing
secret disables the public like count when it only needs to disable writes.

---

## 8. Environment traps

- **`wrangler` is in `devDependencies` but not installed.** `wrangler dev`
  against real D1 has never run locally.
- **Local verification runs on the node-server preset**, not workerd. Build with
  `NITRO_PRESET=node-server npx vite build`. A D1 shim over `node:sqlite` was
  used to exercise the real SQL — see `qwen-batch-*.refined.md` history for the
  approach.
- **Screenshots do not work.** The Browser pane is not compositing; use
  `read_page`, `read_network_requests` and `javascript_tool` instead. All
  production verification in this run was text-based.
- **Two tests are filesystem-heavy** and were made deterministic during this run
  (memoised reads plus explicit 30s timeouts). If they fail, check whether it is
  a timeout before assuming a real violation — and verify by injecting a real
  violation, which is how the fix was validated.
- **Python heredocs write CRLF on Windows** and will fail lint. Write with
  `newline=''` or run `eslint --fix` afterwards.

---

## 9. Source integrity

Every Qwen source is byte-identical to its state at the start of the run.
Verify with `md5sum docs/editorial/batch-0*.md`.

| File | MD5 |
|---|---|
| batch-001.md | `c40b3df5f2ed28501a8621438bbfa21c` |
| batch-002.md | `567c46844000348d3e8fda0b6dd028e1` |
| batch-003.md | `a5069dd4f0d5bfa03a46ff522f130116` |
| batch-004.md | `44f475633584c1d1c151fb2de56d91bb` |
| batch-005.md | `4dff8a191455ea61e02d149399ce0d6e` |
| batch-006.md | `dbb956579dae9ef5b1076e683f1d24c6` |
| batch-007.md | `68411951c8a1038f0528dc5ec2b2b519` |
| batch-008.md | `9c5c410467eb0f829de45b7e26a27078` |
| `batch-009 .md` | `04a61e1262c21fa14d992efd5d2e199d` |
| batch-010.md | `7163997d7bbfcbc2398ed9073055390e` |
| batch-011.md | `60a51588553b5f98558728450f9c9e55` |
| qwen-batch-006.md | `dbb956579dae9ef5b1076e683f1d24c6` |

`batch-006.md` and `qwen-batch-006.md` are byte-identical duplicates. The user
has asked that canonicalisation wait until the editorial run finishes. Editing
one would leave the other silently stale.

---

## 10. Topic boundaries already claimed

Do not re-cover these. Full register in `qwen-batch-006.refined.md`.

- **Kubernetes** — packets, storage provisioning, node compute, workload
  identity and certificate lifecycle. **StatefulSets, ordinals, per-replica
  claims and pod identity are unclaimed and belong to a batch-011 draft.**
- **AWS networking** — three layers kept separate: VPC-to-VPC topology,
  service-level routing, hybrid BGP.
- **Identity** — five articles with distinct questions: directory comparison,
  passkey rollout, discoverable credentials, SAML trust, token binding. The
  shared theme (a bearer credential authenticates the token, not the holder) is
  named once in the DPoP article and cross-linked.
- **Privileged access** — policy structure, per-action step-up, standing
  privilege, break-glass. Four articles, four questions.
- **Endpoint escrow** — LAPS owns local admin passwords, BitLocker owns disk
  keys. Same lesson, no shared content.

---

## 11. Commands

```bash
bun run scripts/readability.cli.ts <slug>      # gates for one article
bun run scripts/validate-content.cli.ts        # content validation
node scripts/generate-article-index.mjs        # after adding an article
npx vitest run                                 # 215 tests
node node_modules/typescript/bin/tsc --noEmit  # typecheck
./node_modules/.bin/eslint.exe .               # lint
npx vite build && node scripts/sanitize-build.mjs
```

Lint shows 6 pre-existing warnings in `src/components/ui/*` — not from this
work, and not worth fixing.

---

## 12. Standing instruction

**Nothing has been committed, pushed or deployed during this run, and the user
has said not to until the editorial run is complete and they explicitly approve
the publication phase.** The one commit on the branch (`e3d6d0b`) was made by
the user, not by a session.
