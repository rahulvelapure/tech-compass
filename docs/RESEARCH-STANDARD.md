# Research standard

How a Tech Compass article is researched, produced and kept correct. The
companion to [`CONTENT-ROADMAP.md`](CONTENT-ROADMAP.md), which decides _what_
gets written; this decides _how_.

[`PUBLISHING.md`](PUBLISHING.md) remains the mechanical workflow (commands,
field rules, the PR checklist). This document is the editorial and research
layer above it and does not repeat it.

---

## 1. The standard in one paragraph

Research happens **before** drafting, not as a citation pass afterwards. An
article is written from an understanding of the technology, expressed in the
publication's own language — never as a reworded vendor page. Every factual
claim about product behaviour traces to a primary source that was actually
consulted. Where behaviour is version-dependent, the version is stated. Where
the article recommends rather than describes, it says so.

**The test:** could a reader who follows this article, then reads the vendor
documentation, find anything that contradicts it? If yes, the article is wrong,
regardless of how well it reads.

---

## 2. Source hierarchy

Sources are ranked by how directly they know the answer. Use the highest tier
that can answer the question.

### Tier 1 — Vendor primary documentation

The product team's own reference. **For anything Microsoft, Microsoft Learn is
the default first stop and usually the last.**

Microsoft Learn · Apple Developer and Platform Deployment · Google/Android
Enterprise · AWS docs · Azure docs · Google Cloud docs · Cisco · Palo Alto ·
Fortinet · Broadcom/VMware · Red Hat · Kubernetes · Docker · GitHub ·
Cloudflare · vendor security advisories.

### Tier 2 — Standards and government bodies

Where the answer is a standard rather than a product behaviour.

IETF/RFC · IEEE · W3C/WHATWG · NIST (SP 800 series, CSF) · CISA · CIS
Benchmarks · OWASP · ISO/IEC where publicly available.

### Tier 3 — Official secondary

Same organisation, less formal register. Useful for intent, timing and
rationale that reference docs omit.

Engineering blogs · release notes · changelogs · official GitHub repositories ·
conference sessions · deprecation notices.

### Tier 4 — Independent

Only where Tiers 1–3 genuinely cannot answer: real-world failure modes,
independent benchmarks, operational experience at scale, security research.

Named practitioner writing · vendor-neutral research · reputable specialist
publications · peer-reviewed work.

### Never a source

Content farms · SEO listicles · undated tutorials · scraped documentation
mirrors · AI-generated summaries · forum answers presented as documented
behaviour · another publication's article used as the basis for ours.

A high search ranking is not evidence of accuracy.

---

## 3. Research method

### 3.1 Before drafting

1. **State the question the article answers.** One sentence. If it takes two,
   it is probably two articles — or a duplicate of one that exists.
2. **Search the corpus first.** Published articles, drafts, backlog topics,
   slugs, `primaryKeyword`, `targetKeyword`. If the intent already exists,
   improve that article instead. See §7.
3. **Identify the claim types** the article will make: documented behaviour,
   configuration steps, limits and thresholds, licensing, version support,
   security properties, recommendations.
4. **Find the primary source for each claim type** before writing a word.
5. **Record the product state**: generally available, preview, deprecated,
   retired. Preview behaviour changes without notice and must be labelled.
6. **Record the version and date scope.** "Windows 11 24H2 and later", "as
   documented in August 2026".

### 3.2 While drafting

- Write from understanding, not from an open documentation tab. If a paragraph
  cannot be written without the source visible, the technology is not yet
  understood well enough to explain it.
- Separate **documented behaviour** from **our recommendation**, explicitly, in
  the prose. `methodology` records the basis for the article as a whole.
- Prefer the mechanism over the click path. UI labels change; the reason a
  setting exists does not.
- Code and commands must be syntactically valid and technically plausible for
  the stated version.

### 3.3 When sources disagree

Do not silently merge them. Determine which is current, check whether the
difference is a version boundary, and if the disagreement is material to the
reader, state it and cite both. An undated contradiction is a signal that at
least one source is stale.

### 3.4 Microsoft specifically

The Microsoft Learn MCP tooling is available in this repository and is the
intended research path for Microsoft topics:

- `microsoft_docs_search` — breadth, to locate the right documents
- `microsoft_docs_fetch` — depth, for full pages once located
- `microsoft_code_sample_search` — official samples rather than invented ones

Prefer fetching the actual page over relying on a search excerpt when the claim
is specific — excerpts truncate exactly the caveats that matter.

---

## 4. Microsoft research matrix

For each area, the checks that must be made before publishing. These are the
dimensions where Microsoft documentation most often contains a constraint that
a general explanation would miss.

| Area                                | Must verify                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Intune — enrollment & Autopilot** | Enrollment method support per platform; Entra join vs hybrid join prerequisites; device identity source; ESP behaviour and timeouts; Autopilot vs device preparation feature parity; registration paths |
| **Intune — policy**                 | CSP backing the setting; settings catalog vs template vs OMA-URI; conflict resolution order; assignment filter evaluation; user vs device targeting; refresh interval                                   |
| **Intune — apps**                   | Win32 vs MSI vs Store app capability differences; detection rule types; dependency and supersedence semantics; IME behaviour; exit and return codes; delivery optimisation                              |
| **Intune — compliance & CA**        | Compliance evaluation timing; grace period behaviour; the compliance-to-CA signal path; token lifetime interaction; "mark device noncompliant" semantics                                                |
| **Intune — endpoint security**      | Baseline versioning; ASR rule identifiers and modes; BitLocker silent encryption prerequisites; LAPS rotation and retrieval; Defender licensing dependency                                              |
| **Intune — updates**                | Update ring vs feature update policy precedence; deferral and pause limits; expedited update behaviour; driver update control                                                                           |
| **Entra ID — identity**             | Object types and their limits; dynamic group rule syntax and evaluation latency; group-based licensing errors; administrative unit scope                                                                |
| **Entra ID — authentication**       | Authentication methods policy migration state; passwordless prerequisites; FIDO2 and Windows Hello requirements; legacy auth blocking impact                                                            |
| **Entra ID — Conditional Access**   | Policy evaluation and combination logic; report-only semantics; device filter syntax; break-glass exclusion requirements; sign-in log interpretation                                                    |
| **Entra ID — privileged access**    | PIM activation and approval flow; role scope; access review mechanics                                                                                                                                   |
| **Microsoft 365**                   | Service-specific admin boundaries; Purview label and retention precedence; DLP policy evaluation; eDiscovery tiering; audit log retention by licence                                                    |
| **Windows**                         | Servicing channel and lifecycle dates; feature availability by edition and version; security feature hardware requirements (TPM, VBS, HVCI); Group Policy to CSP mapping                                |
| **Graph / automation**              | Permission scopes (delegated vs application); API version (v1.0 vs beta) and its stability guarantee; throttling behaviour; pagination                                                                  |

**Licensing is checked for every Microsoft article.** It is the single most
common way otherwise-correct guidance becomes unusable for a reader.

---

## 5. Article production workflow

End to end, one article. Commands are in [`PUBLISHING.md`](PUBLISHING.md).

| #   | Step                                                                                     | Gate                                                       |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Confirm the topic exists in the backlog with a unique `targetKeyword`                    | `bun run inventory --next`                                 |
| 2   | Duplicate check across articles, drafts and topics (§7)                                  | Manual, required                                           |
| 3   | Research to the standard in §3; record sources as you go                                 | —                                                          |
| 4   | Record the editorial data model (§6) on the topic                                        | —                                                          |
| 5   | Scaffold — created as `draft: true`                                                      | `bun run content:new`                                      |
| 6   | Draft, with `pillarSlug` set to its parent                                               | —                                                          |
| 7   | Author diagrams where they teach (§8 of the roadmap)                                     | —                                                          |
| 8   | Internal links: up to pillar, across to siblings — contextual, in prose                  | —                                                          |
| 9   | Reciprocal links: edit existing articles to point at the new one, **in the same change** | —                                                          |
| 10  | Validate on a loop                                                                       | `bun run validate:content`                                 |
| 11  | Full gate                                                                                | `bun run verify`, `build:node`, `test:a11y`, `crawl:check` |
| 12  | **Read the rendered page in a browser**                                                  | Required — see §6                                          |
| 13  | Lift `draft` only when the published bar is met                                          | —                                                          |
| 14  | Update topic `status` and `articleSlug`                                                  | Enforced by test                                           |

---

## 6. Quality gates

### Blocking — the build fails

Schema and metadata validity · reading time drift · meta description length ·
duplicate slug · unknown category · **format category used as an article
category** · published article linking to a draft · generic anchor text ·
nested inline markup · mojibake · SVG figure violations (no `viewBox`, fixed
dimensions, `<script>`, `<image>`, external references, missing or useless
alt) · pillar integrity (unresolved `pillarSlug`, cycles, depth > 3, published
article reporting to a draft pillar) · editorial status inconsistent with the
article's actual state.

### Advisory — judgement required

Thin content · missing `relatedSlugs` on a substantial article · orphan (no
inbound links) · dead end (no outbound links) · pillar with fewer than three
supporting articles · article unattached to a pillar structure that exists ·
filler phrasing · unscheduled review date.

### The gate no tool provides

**Read the rendered page.** Every real defect this project has shipped —
literal `*italic*`, backticks inside bold, mojibake across 26 files — passed
typecheck, lint and content validation, and was only visible in the DOM. A
green build means the code is valid, not that the page is correct.

### Research gates

Before `draft` is lifted:

- Every factual claim traces to a source that was actually opened.
- `sources` are primary where a primary source exists.
- No fabricated URL, publisher or document title.
- Product state (GA / preview / deprecated) is correct as of the publication date.
- Licensing implications stated where they gate the guidance.
- No claim of hands-on testing that did not happen — `reviewStatus` tells the
  truth, and `contentType: "review"` requires `hands-on` or `lab-verified`.

---

## 7. Duplicate-intent check

Run before creating any topic or article. Two articles chasing one question
compete with each other and split the internal-link graph.

Search, in order: existing `primaryKeyword` values · backlog `targetKeyword`
values · slugs · titles · the pillar's existing cluster.

`tests/editorial.test.ts` enforces `targetKeyword` uniqueness, which catches
exact collisions. It cannot catch _near_-duplicates — "intune app not
installing" and "intune app install failed" are one article, and only
editorial judgement will see it.

**If the intent already exists:** extend the existing article. Do not create a
second one.

---

## 8. Maintenance and freshness

### Update classes

Set at planning time on the topic, carried to `nextReviewAt` on the article.

| Class       | Cadence   | Typical                                                    |
| ----------- | --------- | ---------------------------------------------------------- |
| `volatile`  | 6 months  | Licensing, portal names, preview features, vendor roadmaps |
| `annual`    | 12 months | Product behaviour, versioned procedures                    |
| `evergreen` | 24 months | Protocols, standards, architectural principles             |

### The load this creates

Microsoft-centric coverage skews volatile. At scale this is the binding
constraint on how large the publication can be while staying correct — a large
archive of confidently wrong Microsoft guidance is worse than a smaller correct
one. `CONTENT-ROADMAP.md` §8 carries the arithmetic.

**Practical consequence:** prefer the mechanism to the click path, and the
principle to the current UI label. An article about _why_ compliance evaluation
lags ages far better than one about which blade the setting is under.

### Unscheduled review triggers

Regardless of `nextReviewAt`: a product rename or retirement · a licensing
change · a preview feature reaching GA or being cancelled · a CVE or security
advisory affecting the guidance · a reader-reported correction · a linked
source returning 404.

### Corrections

Material corrections are noted in the article rather than made silently. That
is the site's stated policy, and it is the difference between a publication and
a wiki.

---

## 9. What this standard forbids

- Rewriting vendor documentation and calling it an article.
- Citing a page that was not opened.
- Fabricating URLs, publishers, titles, benchmarks, screenshots or testing.
- Claiming hands-on experience the project does not have.
- Presenting preview behaviour as generally available.
- Presenting deprecated guidance as current.
- Merging contradictory sources without resolving the contradiction.
- Padding an article to reach a word count.
- Creating a second article for an intent that already has one.
