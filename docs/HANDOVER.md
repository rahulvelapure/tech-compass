# Session handover

Updated 2026-08-14, after the research-architecture phases. Read this before
touching anything.

| Document                                                   | Answers                                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`MASTER-COVERAGE-PLAN.md`](MASTER-COVERAGE-PLAN.md)       | Balanced scope: counts, targets, gaps, research tracks, per-subject clusters |
| [`CONTENT-ROADMAP.md`](CONTENT-ROADMAP.md)                 | Taxonomy, pillar model, linking rules, visual standard                       |
| [`RESEARCH-STANDARD.md`](RESEARCH-STANDARD.md)             | Source hierarchy, research method, quality gates, maintenance                |
| [`PUBLISHING.md`](PUBLISHING.md)                           | Commands, field rules, PR checklist                                          |
| [`NEWSLETTER-ARCHITECTURE.md`](NEWSLETTER-ARCHITECTURE.md) | Separate workstream, diagnosed and partly fixed                              |
| [`CONTENT-ARCHITECTURE.md`](CONTENT-ARCHITECTURE.md)       | Original audit A–F, historical                                               |

---

## 1. Where the project is

**Tech Compass** — a broad technology publication for practitioners.
TanStack Start + React 19 + TypeScript (strict) + Tailwind 4, Bun, targeting
Cloudflare Workers.

Verified at `0e1e87c`, working tree clean, `origin/master` in sync:

|                        |                                                               |
| ---------------------- | ------------------------------------------------------------- |
| Articles               | 35 — **17 published, 18 draft**                               |
| Backlog                | **257 topics** across 8 segments, **34 pillars/hubs**         |
| Researched topics      | 64 · **107 carry primary sources** · 70 diagram opportunities |
| Unique target keywords | **257/257** — zero duplicate intent                           |
| Categories             | 22 — 18 subject, 4 derived content-type indexes               |
| `validate:content`     | **0 errors**, 38 warnings                                     |
| Tests                  | **137 passing**, 11 files                                     |
| Lint                   | 0 errors, 6 warnings (pre-existing shadcn `react-refresh`)    |
| Build / crawl / a11y   | exit 0 · 68 routes 0 errors · 32/32                           |
| **Deployed**           | **No. Never deployed.**                                       |

**No article has been written this whole arc.** Everything so far is
architecture, taxonomy and researched planning data. Batch 1 is not started and
needs explicit approval.

---

## 2. The strategic constraint that governs everything

The owner's repeated, explicit direction: **Tech Compass must not become an
Intune site.** It was heading that way — Intune was 88% of published articles
and 71% of the backlog, with 13 of 16 subjects holding nothing at all.

Rebalancing progress, achieved entirely by growing other subjects. **No Intune
topic was ever added or removed to move this number:**

|                         | Start   | 3a  | 3b  | 3c          |
| ----------------------- | ------- | --- | --- | ----------- |
| Backlog                 | 106     | 174 | 215 | **257**     |
| Intune share            | **71%** | 43% | 35% | **29%**     |
| Segments with a backlog | 3       | 6   | 7   | **8 of 18** |

**Do not reopen Intune backlog expansion** without the owner saying so, and do
not recommend Intune as the next subject. Ten subjects still have zero backlog;
`development`, `devops` and `emerging-tech` have zero of everything.

---

## 3. The information architecture

### Subject owns the URL, format is an attribute

`/{subject}/{slug}`. `contentType` carries the format —
`troubleshooting · how-to · explainer · decision-framework · comparison ·
buying-guide · review · reference · analysis`.

`how-to`, `comparisons`, `reviews` and `buying-guides` are **derived index
routes** over `contentType`, never article containers. The validator rejects an
article that tries to live in one.

`ContentType` is declared in `src/content/types.ts` and imported _by_
`editorial/types.ts`. **Never the reverse** — nothing under `src/` may import
the backlog, and `tests/editorial.test.ts` fails the build if it does.

### Hub → pillar → supporting

Expressed as data: `pillar` names the cluster an article anchors, `pillarSlug`
points one level up. Topics additionally carry `plannedSlug`, because a cluster
must be plannable before anything in it is written.

Seven subject hubs exist as _plans_, none as articles:

| Subject                  | Hub                                 | Pillars |
| ------------------------ | ----------------------------------- | ------: |
| `microsoft-intune`       | `what-microsoft-intune-manages`     |       7 |
| `networking`             | `how-a-packet-crosses-a-network`    |       7 |
| `windows`                | `windows-in-the-enterprise`         |       6 |
| `cybersecurity-ciso`     | `zero-trust-for-a-microsoft-estate` |       5 |
| `cloud`                  | `azure-landing-zones`               |       5 |
| `ai`                     | `how-large-language-models-work`    |       4 |
| `microsoft-365-entra-id` | **none**                            |   **0** |

---

## 4. Non-obvious things that will bite you

**The renderer does not parse nested inline markup.** `RichText` in
`ArticleBody.tsx` does one non-recursive pass, so ``**bold with `code`**``
ships the backticks literally. This reached production three times before it
was guarded.

**Inline markup only runs in some fields** — `p`, `ul`/`ol` items, table
**cells**, callout `text`. Not headings, table `caption`, `quote`, FAQ,
`standfirst`, `excerpt` or `metaDescription`. Keep those plain.

**`draft` semantics.** Absent or `false` = published. `draft: true` = noindex,
nofollow, out of sitemap/RSS/search/listings, lower validation bar. Published
articles carry _no_ `draft` key.

**The article index is generated.** Run `bun run content:index` after adding,
renaming or deleting an article. `tests/content-index.test.ts` catches drift.

**A published article may not link to a draft.** Enforced.

**Empty categories** are automatically noindex and out of the sitemap.

**`serve:build` listens on 3000, not 4173** as the README says. `crawl:check`
takes a base URL argument.

---

## 5. Guards — do not remove without replacing

| Guard                                           | Where                      | Level   |
| ----------------------------------------------- | -------------------------- | ------- |
| Nested inline markup                            | `findNestedInlineMarkup()` | error   |
| Encoding corruption                             | `findMojibake()`           | error   |
| Article in a format category                    | `validateGraph()`          | error   |
| Pillar integrity — cycles, depth, draft parents | `validateGraph()`          | error   |
| Generic anchor text                             | `validateGraph()`          | error   |
| SVG figure rules                                | block validation           | error   |
| Orphan / dead-end published articles            | `validateGraph()`          | warning |
| Backlog status vs article state                 | `tests/editorial.test.ts`  | test    |
| Planned pillar hierarchy                        | `tests/editorial.test.ts`  | test    |
| Unique `targetKeyword`                          | `tests/editorial.test.ts`  | test    |

The mojibake detector is deliberately conservative — `â€` bare, but `Ã`/`Â`
only before U+0080–U+00BF, so `São Paulo` passes. Loosening it produces false
positives and the rule starts being ignored.

**`scripts/url-manifest.ts` is the URL safety net.** Snapshot before, snapshot
after, diff. Every phase so far reports **0 published URLs changed** — that
invariant is the owner's hard rule.

```bash
bun run scripts/url-manifest.ts > before.json
bun run scripts/url-manifest.ts --diff before.json after.json
```

---

## 6. The 38 warnings — classified, not defects

| Class | Count | What                                                 | Action                                                                    |
| ----- | ----: | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| B     |    16 | No `relatedSlugs` on a substantial published article | Resolves as clusters are written                                          |
| B     |     4 | Orphan: no inbound links                             | 3 adopted by planned Intune pillars; `vscode-vs-jetbrains` still unsolved |
| C     |     7 | Draft below 600 words, mapped to a cluster           | Expand when that cluster is written                                       |
| E     |    11 | Draft below 600 words, subject has no backlog yet    | Leave                                                                     |

**Do not silence these.** `MASTER-COVERAGE-PLAN.md` §8 has the per-draft
breakdown. No draft is ready for promotion — none has been researched to the
standard.

---

## 7. Research standard, in short

Research **before** drafting. Microsoft Learn first for anything Microsoft, via
the MS Learn MCP tools. Standards bodies for standards. Never content farms,
scraped docs, AI summaries or undated tutorials.

This is not ceremony — research has changed the plan every single phase:

- **Intune Suite was redistributed across M365 tiers in July 2026** (E3 gains
  Plan 2, Remote Help, Advanced Analytics; E5/E7 add EPM, Cloud PKI, Enterprise
  App Management). Licensing written from memory is now wrong.
- **Windows 11 26H1 is not a feature update** — hardware-scoped, different
  core, and those devices _cannot_ take the H2 2026 annual update.
- **OWASP Top 10:2025** superseded 2021; A03 Software Supply Chain Failures is
  new.
- **Wi-Fi 8 (802.11bn) is not ratified** — D2.0 ballot was expected July 2026.
- **Post-quantum TLS splits the ClientHello across two packets**, breaking
  middleboxes that assumed one.

Every one of those would have produced a wrong article.

---

## 8. What to do next

The owner's last recommendation, awaiting approval:

**`microsoft-365-entra-id`.** It has 23 topics and **zero pillars** — the only
subject with real backlog and no cluster architecture, so those topics are
unreachable from any hierarchy. P0, holds the one published non-Intune
enterprise article, and is connective tissue for Intune, Windows, cloud and
cybersecurity. ~20 more topics plus a pillar layer takes it to ~45 with
structure.

**Second choice: `enterprise-networking`** — unblocked now that networking
established the protocol layer, and it would finally give the
`zero-trust-network-segmentation` draft an owner.

### Then, eventually, Batch 1

Twelve articles proposed in `CONTENT-ROADMAP.md` §10, led by the Intune hub —
but that predates the rebalancing and **should be re-cut across subjects**
before it runs. Writing four Intune pillars first would undo the diversification.

### Known follow-ups

- `scripts/inventory.ts` still lacks pillar, orphan, contentType and coverage
  reporting — the audits used ad-hoc scripts instead.
- `Topic` could use `lastResearchedAt`, `audience`, `difficulty`.
- `databases` is a promotion candidate under `development` at 15+ topics.
- Newsletter: `flags.newsletterEnabled` still unwired; direct-Brevo migration
  approved in principle, not built.
- `software-06` (WSL2) predates the `windows` category and should be narrowed
  or archived — `win-63` now owns it.

---

## 9. Standing constraints

- **Do not deploy.** Never deployed, `wrangler` unauthenticated, and
  `wrangler.jsonc` keeps `routes` commented out because
  `rahulvelapure.dpdns.org` serves a _different live site_. Uncommenting and
  deploying replaces it.
- **Do not change a published URL.** Verify with the manifest every phase.
- **Do not commit or push unless asked.** The owner has asked each phase so far.
- **Never fabricate** experience, testing, benchmarks, sources or citations.
  Verify RFC numbers and version facts rather than recalling them.
- **No fake reviews.** `contentType: "review"` requires `hands-on` or
  `lab-verified`; a test enforces it. Nothing has been tested, so there are zero
  reviews and `/reviews` is legitimately empty.
- Public author identity is exactly `Rahul Velapure`, role "Technology writer".
  No employer, contact details or personal information.
- Keep the existing design. Light default, optional dark mode.

---

## 10. Commands

```bash
bun run inventory              # editorial pipeline + article table
bun run inventory --next       # highest-priority unwritten topics
bun run content:new <cat> <slug>
bun run content:index          # after add/rename/delete
bun run validate:content
bun run verify                 # typecheck + lint + tests
bun run build                  # Cloudflare build
bun run build:node             # local server build
bun run serve:build            # serves on 3000
node scripts/crawl-check.mjs http://127.0.0.1:3000
PREVIEW_URL=http://127.0.0.1:3000 bunx playwright test
bun run scripts/url-manifest.ts
```

A green build does **not** mean the page is correct. Serve it and read the DOM —
that is how the nested-markup and encoding defects were both found, and how the
SVG figure block was verified across light and dark themes.
