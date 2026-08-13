# Publishing workflow

How an article gets from an idea to a live page. Every step is a command you
can run locally and that CI re-runs on the pull request.

---

## The content model in one paragraph

One article is one file at `src/content/articles/<category>/<slug>.ts`, and its
URL is `/<category>/<slug>`. The file exports a single `article` object typed as
`Article` (see [`src/content/types.ts`](../src/content/types.ts)). Everything
else on the site — routing, breadcrumbs, SEO metadata, JSON-LD, the table of
contents, related-article ranking, tag pages, RSS, the sitemap and search — is
derived from that object. There is nothing else to update.

```
src/content/
  articles/
    index.ts                     GENERATED barrel — do not hand-edit
    microsoft-intune/
      intune-policy-conflicts.ts
    software/
      vscode-vs-jetbrains.ts
  categories.ts                  the section list
  authors.ts                     public author profiles
  types.ts                       the Article contract
```

### Why the index is generated

`src/content/articles/index.ts` is a committed barrel of plain static imports.
It is generated because the store is imported by three different runtimes — Vite
for the site, Bun for the content validator, Node for the social-card generator —
and `import.meta.glob` auto-discovery only works in one of them. A committed
barrel behaves identically everywhere and is fully typechecked.

The trade-off is that it can go stale. `tests/content-index.test.ts` fails with
the exact remedy if it does, so a forgotten regeneration cannot ship.

---

## Where the next article comes from

The backlog lives in `editorial/` and is planning data — never imported by the
site. A topic is an intent to write; an article is a thing that exists. They are
joined by `articleSlug` once a topic reaches `PUBLISHED`.

```bash
bun run inventory          # pipeline by segment, plus the article table
bun run inventory --next   # the 15 highest-priority unwritten topics
bun run inventory --review # published articles past their review date
```

Statuses run `IDEA → RESEARCHING → RESEARCHED → DRAFT → EDITORIAL_REVIEW →
TECHNICAL_REVIEW → READY → PUBLISHED`, with `NEEDS_UPDATE` derived automatically
from the article's `nextReviewAt`, and `ARCHIVED` as a terminal state for topics
considered and rejected (kept so they are not re-proposed).

Update the topic's `status` as you go. The dashboard is only as honest as that
field.

---

## Adding a new article

### 1. Scaffold it

```bash
bun run content:new microsoft-intune my-article-slug
```

This creates the file, regenerates the index, and prints the URL the article
will have. It refuses unknown categories and duplicate slugs.

The scaffold is created with **`draft: true`**. A draft keeps its URL for
preview and review but is `noindex, nofollow`, excluded from every listing, the
sitemap, RSS, search and related-article ranking, and is held to a lower
word-count bar. That is what keeps the build green while you write.

### 2. Research before drafting

For anything touching Microsoft, Windows, Azure, Intune, Entra, security
standards, Google, Apple or networking standards, use the vendor's own
documentation and cite it in `sources`. Do not write from memory on
time-sensitive topics — licensing, product behaviour and regulation all move.

State clearly in `methodology` what the article is based on. Where the article
recommends an approach rather than describing documented behaviour, say so in
the prose.

### 3. Write it

Fill in the object. Notes on the fields that are easy to get wrong:

| Field             | Rule                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| `slug`            | Globally unique, not just unique within the category.                          |
| `publishedAt`     | The real date. Never backdate; future dates are rejected.                      |
| `updatedAt`       | Add on substantive revision. Must not precede `publishedAt`.                   |
| `readingMinutes`  | Must match the computed value exactly — the validator prints the right number. |
| `metaDescription` | 70–165 characters.                                                             |
| `seoTitle`        | Optional; use it when the headline exceeds ~62 characters.                     |
| Heading `id`      | Unique within the article. It anchors the contents rail.                       |
| `tags`            | Reuse existing tags. New near-duplicates fragment the tag pages.               |
| `heroImage`       | Optional; requires `heroImageAlt` when set.                                    |

Body prose supports four inline constructs and nothing else:

```
[label](/internal/path)     internal link, client-side navigation
[label](https://…)          external link, opens in a new tab
**bold**
*italic*
`inline code`
```

Anything structural — headings, lists, tables, code blocks, callouts, diagrams,
quotes — is its own block type. See an existing article for the shapes.

### 4. Validate as you go

```bash
bun run validate:content
```

Errors block the build; warnings are editorial guidance. This is the loop you
will run most. Reading time and meta-description length are the two that
routinely need a second pass — the validator prints the correct values.

### 5. Publish

Remove `draft: true`. The article must now clear the published bar:

- **1,800+ words** unless the topic genuinely needs less
- clear H2/H3 structure
- authoritative sources for factual claims
- FAQ where genuinely useful
- internal links that are actually useful — **never** to a draft, a noindex page
  or an empty category just to hit a number

Then add reciprocal links from existing published articles where the connection
is real. The validator rejects a published article that links to a draft.

### 6. Run the gate

```bash
bun run verify
bun run build:node
bun run test:a11y
bun run crawl:check
```

`crawl:check` needs the build served — start it with `bun run serve:build` in
another terminal first, or point it at any running instance.

---

## Updating an existing article

1. Edit `src/content/articles/<category>/<slug>.ts`.
2. Set `updatedAt` to today when the change is substantive. Leave it alone for
   typos.
3. Re-run `bun run validate:content` — if you added or removed prose,
   `readingMinutes` will need updating.
4. Note material corrections in the article itself rather than changing it
   silently. That is the site's stated corrections policy.

**Do not change a published slug or category.** Both are part of the URL. If a
move is unavoidable, plan the redirect first.

---

## Adding a category

Add an object to `categories` in
[`src/content/categories.ts`](../src/content/categories.ts), then add its slug
to `primaryNav` or a `footerColumns` group — the validator warns about a
category nothing links to.

A category with no published articles renders an "await content" state, is
`noindex, follow`, and is left out of the sitemap. That is deliberate: an empty
section should not be asking to be indexed. It becomes indexable automatically
when the first article publishes.

The seven enterprise pillar slugs are frozen. They are permanent URLs.

---

## Reviewing (pull request checklist)

- [ ] `bun run verify` green
- [ ] `bun run validate:content` — zero errors, warnings understood
- [ ] Word count and reading time consistent (`bun run inventory`)
- [ ] Sources are primary, and support the specific claims made
- [ ] No invented experience, testing, benchmarks, customers or credentials
- [ ] Documented behaviour distinguished from recommendation
- [ ] Internal links resolve and are useful
- [ ] Rendered page checked in a browser — inline markup can parse wrong in ways
      that only show visually
- [ ] No employer, job title, contact details or other personal information

---

## Command reference

| Command                                 | Purpose                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| `bun run content:new <category> <slug>` | Scaffold an article and update the index                   |
| `bun run content:index`                 | Regenerate the index after adding/renaming/removing a file |
| `bun run validate:content`              | Schema, metadata and editorial-quality checks              |
| `bun run inventory`                     | Editorial pipeline by segment, plus the article table      |
| `bun run inventory --next`              | Highest-priority unwritten topics                          |
| `bun run inventory --review`            | Published articles past their review date                  |
| `bun run inventory --articles`          | Article table only                                         |
| `bun run verify`                        | Typecheck + lint + unit tests                              |
| `bun run build:node`                    | Production build with the Node adapter                     |
| `bun run serve:build`                   | Serve that build on port 4173                              |
| `bun run test:a11y`                     | axe-core accessibility suite                               |
| `bun run crawl:check`                   | Crawl a running build and audit the rendered HTML          |
| `bun run scan:secrets`                  | Secrets, personal data and build-machine paths             |
| `bun run test:lighthouse`               | Lighthouse CI performance and Core Web Vitals              |

---

## What CI enforces

`.github/workflows/ci.yml` runs on every push and pull request:

**verify** — typecheck, lint, secret scan, content validation, unit tests
(including the index drift guard) → **build** → **accessibility** and
**lighthouse** against that build.

`.github/workflows/deployment-validation.yml` re-runs the same suite against the
deployed origin after a deployment, so CDN behaviour, compression and TLS are
covered too.

A pull request that adds an article and does not regenerate the index will fail
in `verify`, with the fix printed in the failure message.
