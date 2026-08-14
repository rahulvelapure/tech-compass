# Session handover

Written 2026-08-14, updated after the information-architecture work. Read this
before touching anything.

Companion docs: [`CONTENT-ROADMAP.md`](CONTENT-ROADMAP.md) (taxonomy, pillar
architecture, capacity), [`NEWSLETTER-ARCHITECTURE.md`](NEWSLETTER-ARCHITECTURE.md),
[`PUBLISHING.md`](PUBLISHING.md) (workflow and field rules),
[`CONTENT-ARCHITECTURE.md`](CONTENT-ARCHITECTURE.md) (audit A–F, risks),
[`../README.md`](../README.md) (setup and deployment).

---

## 1. Where the project is

**Tech Compass** — a technical publication for enterprise IT practitioners.
TanStack Start + React 19 + TypeScript (strict) + Tailwind 4, Bun, deploying to
Cloudflare Workers (not Pages).

Verified state:

|                    |                                                                               |
| ------------------ | ----------------------------------------------------------------------------- |
| Articles           | 35 total — **17 published, 18 draft**                                         |
| `validate:content` | 0 errors, 38 warnings (18 draft-length, 16 missing `relatedSlugs`, 4 orphans) |
| Tests              | **135 passing across 11 files**                                               |
| Lint               | 0 errors, 6 warnings (pre-existing shadcn `react-refresh`)                    |
| Crawl              | 68 routes, 0 errors, 0 warnings                                               |
| Accessibility      | 32/32                                                                         |
| Encoding           | 0 mojibake, 0 BOMs                                                            |
| **Deployed**       | **No. Never deployed.**                                                       |

The 17 published are the 4 originals plus 13 substantial Intune/Entra articles
(1,678–3,100 words). They sit in three categories only: `microsoft-intune` (15),
`microsoft-365-entra-id` (1), `software` (1). The 18 drafts are the original
prototype stubs (127–328 words) and need writing from scratch, not expanding.

**No article has a pillar yet.** The hierarchy exists as schema and validation;
the pillar articles themselves are Batch 1 and unwritten.

---

## 2. What just happened, and the warning attached to it

An external tool rewrote 26 article files as **Windows-1252 with a BOM**, which
turned every em dash into `â€"`, and separately flipped all 31 drafts to
published. That put 18 stub articles into the sitemap and broke the build with
16 validation errors.

Both are fixed. The encoding repair reversed the exact cp1252 round-trip rather
than using `git checkout` — HEAD had already advanced past the working tree, so
a checkout would have destroyed uncommitted article work.

**The root cause is not fixed.** Something on this machine writes these files as
cp1252. If it happens again you will see `â€"` on the rendered page. Worth doing:

- Set the offending editor/tool to UTF-8 **without** BOM.
- Consider `.gitattributes` with `*.ts text eol=lf`.

`validate:content` now catches it (see §4), but catching it after the fact is
second best.

---

## 3. Non-obvious things that will bite you

**The renderer does not parse nested inline markup.** `RichText` in
`src/components/article/ArticleBody.tsx` does one non-recursive pass, so
`**bold with `code`**` ships the backticks as literal characters. This reached
production three times before it was guarded.

**Inline markup is only parsed in some fields.** `RichText` runs on `p`, `ul`
and `ol` items, table **cells**, and callout `text`. It does **not** run on
headings, table `caption`, `quote`, FAQ questions/answers, `standfirst`,
`excerpt` or `metaDescription` — markup there renders literally. Keep those
plain.

**`draft` semantics.** Absent or `false` = published. `draft: true` = noindex,
nofollow, excluded from sitemap, RSS, search, listings and related-article
ranking, and held to a lower validation bar. Published articles use _no_ `draft`
key at all — that matches the original four.

**The article index is generated.** `src/content/articles/index.ts` is a
committed barrel. Run `bun run content:index` after adding, renaming or deleting
an article. `tests/content-index.test.ts` fails if it goes stale.

**A published article may not link to a draft.** The validator enforces it.
Currently safe, but it constrains publish order.

**`editorial/` is planning data only.** Never imported by `src/` — enforced by a
test.

**Empty categories** are automatically noindex and out of the sitemap.

---

## 4. Guards added recently — do not remove without replacing

Both live in `scripts/validate-content.ts` and are **build-blocking errors**.
Both were verified by injecting a deliberate regression and confirming failure.

| Guard                | Export                     | Tests                             |
| -------------------- | -------------------------- | --------------------------------- |
| Nested inline markup | `findNestedInlineMarkup()` | `tests/inline-markup.test.ts` (6) |
| Encoding corruption  | `findMojibake()`           | `tests/encoding.test.ts` (9)      |

The mojibake detector is deliberately conservative: `â€` is flagged bare, but
`Ã` and `Â` only when followed by U+0080–U+00BF, so `São Paulo`, `Ângela` and
`François` pass. There are explicit tests for that. Loosening it will produce
false positives and the rule will start being ignored.

---

## 5. Agreed roadmap

P0 is done. **P1, P2 and P3 are approved in principle but not started.**

### P1 — Brand architecture (next)

The publication is currently named after the author: `src/lib/site.ts` has
`name: "Rahul Velapure"`. There is no "Tech Compass" anywhere in the codebase.
That is why the site _feels_ like it repeats the author's name — every
legitimate site-brand slot renders the byline. The rendered article page has 5
visible author mentions (header brand, byline, related-reading, footer brand,
footer copyright) and the tagline appears only twice, both in metadata.

Agreed direction:

- Publication: **Tech Compass**. Author: **Rahul Velapure**.
- Do **not** simply delete occurrences — fix the identity split.
- Replace the tagline `"Practical technology for the real world"`.
- Next session should **propose 5 distinctive editorial taglines** and recommend
  one. No generic marketing language.

Touch points: `src/lib/site.ts`, `src/lib/seo.ts` (Organization schema, OG image
alt), `src/routes/__root.tsx`, `src/routes/index.tsx`, footer, `AuthorBox`.

### P2 — Visual design

**Partly resolved.** A `figure` block now exists for hand-authored inline SVG —
responsive `viewBox`, `currentColor` so one drawing works in both themes,
`role="img"` with required alt text, and validator rules rejecting scripts,
rasters and external references. It has been rendered and verified in-browser
but **no article uses it yet**.

Still true: **0 of 35 articles have any image**, `heroImage` is in the schema
and unused, there is no raster `image` block type, and only 3 ASCII `diagram`
blocks exist.

Two approaches were agreed:

- **Authored SVG** where exact relationships, arrows and flows matter. Preferred
  for technical diagrams — accurate, accessible, theme-aware, small, diffable.
- **Monochrome graphite / pencil-sketch editorial illustrations** for lead
  images. Must look naturally drawn, not like an obvious AI cartoon. No colour,
  no 3D, no stock-art feel.

Images must explain something. No decorative images. Candidates identified by
lowest visual density (paragraphs vs tables/code/callouts):

`compliant-device-conditional-access-blocked` (the device→Intune→Entra→token→CA
chain), `conditional-access-framework` (persona × policy-slot grid),
`entra-join-vs-hybrid-join` (domain-controller dependency),
`intune-management-extension-logs` (11-step client flow),
`zero-trust-network-segmentation`.

Also needed: an `image` block type plus `heroImage` rendering, descriptive
filenames, and meaningful alt text describing the technical purpose.

### P3 — Dates

13 articles share `2026-08-13`. Agreed: stagger **only that cluster**, keeping
dates editorially credible and compatible with the technology discussed. Do
**not** fabricate a multi-month publishing history. `updatedAt` is set on 1/35,
`lastReviewedAt` and `nextReviewAt` on 4/35.

### Also outstanding

**Resolved by the information-architecture work** — see
[`CONTENT-ROADMAP.md`](CONTENT-ROADMAP.md):

- `windows` category now exists; the two Windows drafts moved into it while
  still unpublished, so no URL migration was needed.
- `laptops` retired into `gadgets`. `networking` and `emerging-tech` kept as
  subject categories with documented boundary rules.
- `ai` vs `ai-enterprise-it` overlap resolved by boundary rule: the technology
  is `ai`, deploying and governing it in an enterprise is `ai-enterprise-it`.

Still outstanding:

- Editorial backlog: 75 topics across 3 segments; **13 categories have no
  backlog at all**. `bun run inventory --next` for priorities.
- No pillar articles exist. 4 published articles are orphans with zero inbound
  links; 16 substantial articles have no `relatedSlugs`. Both are now validator
  warnings rather than invisible.

---

## 6. Deployment — blocked, and one hard warning

**Never deployed.** Two blockers:

1. `wrangler` is not authenticated. `wrangler login` is an interactive OAuth
   flow. No `CLOUDFLARE_API_TOKEN` is set.
2. `gh` is not installed (winget is available), so `gh pr create` cannot run.

> **`wrangler.jsonc` has the `routes` block commented out deliberately.**
> `rahulvelapure.dpdns.org` currently serves a **different live site** (a
> personal portfolio). Uncommenting that block and deploying **replaces it**.
> Leave it commented until the owner explicitly approves connecting the domain.

`workers_dev: true` is set, so the first deploy lands on a `workers.dev` URL and
touches no DNS. Command:

```bash
bun run build && npx wrangler deploy
```

Note `src/lib/site.ts` hardcodes `url` to the production domain — it is not
env-driven. On a workers.dev preview, canonicals, sitemap, RSS and OG will all
point at `rahulvelapure.dpdns.org`. Harmless for inspection; correct the moment
the domain is connected.

---

## 7. Standing constraints

- **Do not deploy, touch DNS or attach the custom domain** without explicit
  instruction.
- **Do not commit or push** unless asked.
- Public author identity is exactly `Rahul Velapure`, role "Technology writer".
  Never expose employer, job title, email, phone, address or LinkedIn.
- **Never fabricate** experience, testing, benchmarks, customers, credentials,
  quotes or sources. Articles state documented behaviour vs recommendation
  explicitly, and `methodology` records the basis.
- Microsoft topics are researched against Microsoft Learn via the MS Learn MCP
  tools, and cited in `sources`.
- Keep the existing design. Light default, optional dark mode.
- Two known tech-debt items: Google Fonts is the only third-party request
  (contradicts the site's own privacy claim, and is render-blocking); Playwright
  is capped at 2 workers because this machine saturates.

---

## 8. Commands

```bash
bun run inventory --next        # highest-priority unwritten topics
bun run content:new <cat> <slug>
bun run content:index           # after add/rename/delete
bun run validate:content
bun run verify                  # typecheck + lint + tests
bun run build:node              # local server build
bun run build                   # Cloudflare build
bun run test:a11y
bun run crawl:check             # needs a served build
```

Render checks matter: a green build does **not** mean the page is correct. Serve
the build and inspect the DOM — that is how the nested-markup and encoding
defects were both found.
