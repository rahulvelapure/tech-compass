# Technology publication

A statically-rendered editorial site built with TanStack Start, React 19,
TypeScript and Tailwind 4, deployed to Cloudflare Workers.

Content is data, not markup. An article is one object in `src/content/`, and
the routing, SEO metadata, structured data, table of contents, related-article
ranking, tag pages, RSS, sitemap and search index all derive from it.

---

## Local setup

Requires [Bun](https://bun.sh) 1.3+ (the lockfile is `bun.lock`) and Node 24+
(used by two scripts that need Node's runtime).

```bash
git clone <your-repository-url>
cd <repository-name>
bun install
bun run dev
```

The dev server prints its URL — usually <http://localhost:5173>. Nothing needs
configuring to run the site: the newsletter is the only feature that requires
credentials, and it reports itself as unconfigured without them.

### Commands

| Command                    | What it does                                                     |
| -------------------------- | ---------------------------------------------------------------- |
| `bun run dev`              | Development server with HMR                                      |
| `bun run build`            | Production build for Cloudflare Workers                          |
| `bun run build:node`       | Production build with the Node adapter, for local serving and CI |
| `bun run serve:build`      | Serve the `build:node` output on `PORT` (default 4173)           |
| `bun run typecheck`        | TypeScript, strict, including tests and scripts                  |
| `bun run lint`             | ESLint + Prettier                                                |
| `bun run format`           | Rewrite files to the Prettier config                             |
| `bun run test`             | Unit tests: content validation, ranking, taxonomy, anti-spam     |
| `bun run validate:content` | Content schema, metadata and editorial-quality check             |
| `bun run scan:secrets`     | Secrets, personal data and build-machine paths                   |
| `bun run crawl:check`      | Crawl a running build and audit the rendered HTML                |
| `bun run test:a11y`        | axe-core accessibility suite against a production build          |
| `bun run test:lighthouse`  | Lighthouse CI: performance, Core Web Vitals, SEO                 |
| `bun run generate:og`      | Regenerate the default social card                               |
| `bun run verify`           | `typecheck` + `lint` + `test` — run before pushing               |

`test:a11y` and `test:lighthouse` need a build first:

```bash
bun run build:node
```

> `bun run preview` (plain `vite preview`) does not work with this build — it
> looks for `dist/server/server.js` while Nitro writes to `.output/`. Use
> `build:node` + `serve:build` to serve a production build locally.

---

## Project structure

```
.github/workflows/   CI and post-deployment validation
docs/PUBLISHING.md   How to add, update, review and publish an article
public/              Static assets — favicon, og/default.png
scripts/             Content tooling, validators, generators
src/
  components/
    article/         Article body renderer, table of contents, share links
    monetization/    Ad slots and affiliate disclosure (inert until enabled)
    site/            Header, Footer, cards, breadcrumbs, author box, theme toggle
    ui/              shadcn primitives
  content/           THE CONTENT STORE
    articles/
      index.ts       GENERATED barrel — run `bun run content:index`
      <category>/
        <slug>.ts    One file per article; URL is /<category>/<slug>
    categories.ts    Section list, navigation groups
    authors.ts       Public author profiles (deliberately minimal)
    types.ts         The Article contract
  lib/               content queries, SEO builders, site config, newsletter
  routes/            File-based routes
  styles.css         Design tokens and editorial typography
tests/               Unit tests (*.test.ts) and Playwright specs (*.spec.ts)
```

One article is one file. Adding a file plus regenerating the index is the whole
change — a single-file pull request, reviewable on GitHub without reading a
2,000-line store. See [docs/PUBLISHING.md](docs/PUBLISHING.md).

### Routes

| Route                                   | Purpose                         |
| --------------------------------------- | ------------------------------- |
| `/`                                     | Editorial homepage              |
| `/$category`                            | Category/pillar hub             |
| `/$category/$slug`                      | Article                         |
| `/tag/$tag`                             | Tag page (cross-cutting topics) |
| `/author/$authorId`                     | Author page                     |
| `/search?q=`                            | Site search (noindex)           |
| `/about` `/resources` `/newsletter`     | Publication pages               |
| `/privacy` `/terms` `/disclaimer`       | Trust pages                     |
| `/newsletter/confirmed`                 | Double opt-in landing (noindex) |
| `/sitemap.xml` `/robots.txt` `/rss.xml` | Machine endpoints               |

404s are handled by `notFoundComponent` in `src/routes/__root.tsx`.

---

## Configuration

Copy `.env.example` to `.env`; every variable is documented there.

`VITE_*` variables are inlined into the browser bundle and are public by
definition. Everything else is server-only.

**Brand and domain live in `src/lib/site.ts`.** The publication name, tagline,
domain and default social card are read from there by the header, footer, all
metadata, the sitemap, RSS, `robots.txt` and the social-card generator. Nothing
is hard-coded in components, so renaming the publication is one edit plus
`bun run generate:og`.

---

## Adding content

Full workflow, field rules and the review checklist:
**[docs/PUBLISHING.md](docs/PUBLISHING.md)**. The short version:

### An article

```bash
bun run content:new microsoft-intune my-article-slug   # scaffold + index
# write it, then:
bun run validate:content
```

The scaffold starts as a draft — noindex, unlisted, held to a lower bar — so the
build stays green while you write. Removing `draft: true` is the act of
publishing, and the full quality bar applies from that moment.

Nothing else needs changing: routing, breadcrumbs, structured data, the sitemap,
RSS, search, tags and related articles all derive from the object. Required
fields are on the `Article` interface in `src/content/types.ts`.

If you add, rename or delete an article file by hand rather than via
`content:new`, run `bun run content:index`. The test suite fails with that exact
instruction if you forget.

### A category

Add an object to the `categories` array in `src/content/categories.ts`, then add
its slug to `primaryNav` or a `footerColumns` group — the validator warns about
a category that nothing links to. The seven enterprise pillar slugs are frozen:
they are permanent URLs and must not be renamed.

### An image

Put it in `public/` (e.g. `public/og/intune-esp.png`) and reference it from the
site root: `heroImage: "/og/intune-esp.png"`. Set `heroImageAlt` whenever you
set `heroImage` — the validator enforces the pair.

Social cards are 1200×630. Regenerate the default with `bun run generate:og`;
it renders from `src/lib/site.ts` using the site's own fonts and tokens, so it
follows a brand change automatically.

---

## SEO

Every page goes through `pageMeta()` in `src/lib/seo.ts`, which emits title,
description, canonical, Open Graph (including image, dimensions and alt) and
Twitter card metadata from one call.

Structured data, all emitted as JSON-LD:

| Schema                        | Where                                                              |
| ----------------------------- | ------------------------------------------------------------------ |
| `WebSite` + `Person`          | Every page (root)                                                  |
| `Article`                     | Article pages — with image, wordCount, timeRequired, author, dates |
| `BreadcrumbList`              | Articles, categories, tags, authors                                |
| `FAQPage`                     | Articles that genuinely carry a Q&A section                        |
| `CollectionPage` + `ItemList` | Category and tag pages                                             |

**Tag explosion is guarded.** A tag gets a page as soon as one article uses it,
but only earns an _indexable_ page at `TAG_INDEX_THRESHOLD` (3) articles. Below
that the page is `noindex, follow` and stays out of the sitemap — it still
passes link equity, it just does not ask Google to index a thin duplicate.
Currently 47 tags exist and 9 are indexable.

**Internal linking** is structural, not manual: breadcrumbs, category hubs,
related articles, previous/next, tag pages, author pages, cross-category links
on each category page, and a last-resort backfill in the related-article ranker
so no article is orphaned.

---

## Automated validation

Three layers, all runnable locally and all wired into CI.

### 1. Content schema and metadata

`scripts/validate-content.ts` checks what the compiler cannot: category slugs
resolve, no two articles claim the same URL, heading ids are unique, meta
descriptions are a length Google will render, published dates are not in the
future, `relatedSlugs` point at real articles, table rows match their header
width, source URLs are valid, `heroImageAlt` accompanies `heroImage`.

Errors fail the build. Warnings — a meta description slightly out of range, a
reading time that does not match the body — are reported and do not.

### 2. Accessibility

`tests/accessibility.spec.ts` runs axe-core at WCAG 2.1 AA against one URL per
page archetype, on desktop and mobile viewports. It also covers what axe cannot
see alone: dark mode (where contrast regressions land first), theme persistence
across reload, the skip link being the first keyboard stop, one `h1` and one
`main` per page, and article prose rendering with JavaScript disabled.

### 3. Performance and Core Web Vitals

`lighthouserc.cjs` asserts an explicit budget — LCP, CLS, TBT and FCP at
Google's "good" thresholds, plus category scores. It deliberately does not use a
bundled Lighthouse preset: those assert audits that get renamed and removed
between versions, which turns a Lighthouse upgrade into a red build.

> Lighthouse CI runs cleanly on Linux and macOS. On Windows it completes the
> audits and then fails cleaning up Chrome's temporary profile — a
> `chrome-launcher` bug, not a configuration problem. Let CI cover Lighthouse.

### In CI

`.github/workflows/ci.yml` runs on every push, pull request and merge group:
**verify** (typecheck, lint, content validation, unit tests) → **build** →
**accessibility** + **lighthouse** against that build.

`.github/workflows/deployment-validation.yml` re-runs the same suite against the
origin that was actually deployed, via the `deployment_status` event — so CDN
behaviour, compression, cache headers and TLS are audited too.

---

## Drafts

`draft: true` on an article stages it without publishing it. A draft keeps its
URL so it can be previewed and shared, and it renders a visible notice, but it
is `noindex, nofollow` and excluded from every listing, the sitemap, RSS,
search, tag pages and related-article ranking. The validator holds drafts to a
lower bar, and a published article may not link to one.

This exists because thin content is not neutral: a domain carrying twenty
200-word pages ranks worse overall than one carrying two good ones, and it will
not pass AdSense review. Stage it as a draft until it is finished.

## Newsletter

Confirmed opt-in. The form never adds anyone to the list: it asks Brevo to send
one confirmation email, and the address joins when the reader clicks the link.
That keeps the list deliverable and produces a timestamped consent record for
GDPR and the DPDP Act.

Three abuse layers, none needing a database (`src/lib/newsletter.spam.ts`): a
honeypot field, an HMAC-signed form token that rejects submissions arriving
faster than a person could type, and a sliding-window rate limit on a hashed IP.
Plus address normalisation and a conservative disposable-domain blocklist.

Requires all four of `LOVABLE_API_KEY`, `BREVO_API_KEY`, `BREVO_LIST_ID` and
`BREVO_DOI_TEMPLATE_ID`. The form refuses subscriptions until they are set
rather than quietly falling back to single opt-in.

---

## Monetization (AdSense-ready, disabled)

`src/components/monetization/AdSlot.tsx` defines six positions: header,
in-article, sidebar, after-article, in-feed and before-related. While
`VITE_ADS_ENABLED` is not `"true"` they render **nothing** — no wrapper, no
reserved height, no placeholder. The layout is complete without them, so
enabling ads later is a flag flip plus the provider script, not a redesign.

To enable AdSense once approved: set `VITE_ADS_ENABLED=true`, add the AdSense
script to the root document head, and replace the comment inside `AdSlot` with
the `<ins class="adsbygoogle">` unit. Nothing else changes.

`AffiliateDisclosure` behaves the same way behind `VITE_AFFILIATE_ENABLED`.

---

## GitHub setup

The repository is deployment-ready as-is: `.gitignore` covers `node_modules`,
`.output`, `.wrangler`, all `.env*` files (except `.env.example`) and CI report
directories. No secrets are committed.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

> If `git rev-parse --show-toplevel` returns something like `C:/`, you are inside
> an accidental repository covering your whole drive. Run `git init` **inside the
> project directory** first so the project gets its own repository.

Then set the repository variable `PUBLIC_SITE_URL` (Settings → Secrets and
variables → Actions → Variables) so post-deployment validation targets the right
origin.

---

## Deploying to Cloudflare

### Workers, not Pages

This project builds to **Cloudflare Workers** (Nitro's `cloudflare-module`
preset), which serves the static assets and runs the SSR handler in one
deployment. That is deliberate: Workers reached feature parity with Pages for
static assets, SSR and custom domains, and Cloudflare now recommends Workers for
new projects, with Pages in maintenance for existing ones. Pages' Git
integration also cannot host this app's server routes the way the build is
configured.

Hosting cost on the free plan is ₹0 for this site's shape: static asset requests
are not billed, and the free Workers plan covers 100,000 requests/day.

### First deploy

```bash
bunx wrangler login
bun run build
bunx wrangler deploy --config .output/server/wrangler.json
```

`wrangler.jsonc` in the project root sets the Worker name (`rahulvelapure`) and
the custom domain; Nitro merges it into the generated config at build time.
Without it the Worker name is derived from your local checkout path.

**On the very first deploy, comment out the `routes` block in `wrangler.jsonc`.**
The custom domain cannot be attached until the zone exists (next section). The
Worker is reachable at `https://rahulvelapure.<your-subdomain>.workers.dev`
meanwhile.

### Continuous deployment

Connect the repository in the Cloudflare dashboard (Workers & Pages → Create →
Connect to Git) with:

- **Build command:** `bun run build`
- **Deploy command:** `bunx wrangler deploy --config .output/server/wrangler.json`

Add `LOVABLE_API_KEY`, `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`
and `NEWSLETTER_FORM_SECRET` as **Secrets**, and `PUBLIC_SITE_URL` as a plain
variable, under the Worker's Settings → Variables.

---

## Custom domain: `rahulvelapure.dpdns.org`

`dpdns.org` subdomains from DigitalPlat FreeDomain are real DNS delegations, so
the subdomain becomes its own zone in Cloudflare.

**1. Add the zone to Cloudflare.** Dashboard → Add a domain → enter
`rahulvelapure.dpdns.org` → choose the Free plan. Cloudflare assigns two
nameservers (e.g. `xxx.ns.cloudflare.com`).

**2. Delegate from DigitalPlat.** Sign in to the DigitalPlat FreeDomain panel,
open the domain, and set its NS records to the two Cloudflare nameservers.
DigitalPlat's responsibility ends at that delegation. Propagation is typically
5–30 minutes; the Cloudflare zone flips to **Active** when it completes.

**3. Attach the domain to the Worker.** Once the zone is active, uncomment the
`routes` block in `wrangler.jsonc` and redeploy — Cloudflare creates the DNS
record automatically. Equivalently, in the dashboard: Workers & Pages → your
Worker → Settings → Domains & Routes → Add → Custom Domain.

A Custom Domain cannot be created on a hostname that already has a CNAME record,
or on a zone the account does not own.

**4. Point the app at it.** Set `PUBLIC_SITE_URL=https://rahulvelapure.dpdns.org`
in the Worker's variables. This drives canonical URLs, the sitemap, `robots.txt`
and the newsletter confirmation redirect.

### Moving to a different domain later

Three places, no code changes: `src/lib/site.ts` (`domain` and `url`), the
`PUBLIC_SITE_URL` variable, and the `routes` pattern in `wrangler.jsonc`. Then
`bun run generate:og` to refresh the card, and add a redirect from the old host.

---

## Before launch

- [ ] `bun run verify` passes
- [ ] `bun run build:node && bun run test:a11y` passes
- [ ] `bun run validate:content` — zero errors, warnings reviewed
- [ ] `PUBLIC_SITE_URL` set in the Worker and as a GitHub repository variable
- [ ] `/robots.txt` shows the correct `Sitemap:` host
- [ ] `/sitemap.xml` lists articles, categories, indexable tags and authors
- [ ] `/rss.xml` validates
- [ ] Social card renders — check with a card validator, not by eye
- [ ] Structured data passes Google's Rich Results Test for an article page
- [ ] Search Console and Bing Webmaster Tools verified; sitemap submitted
- [ ] Reading times and article lengths reconciled (see content warnings)
- [ ] Legal pages reviewed by someone qualified — the current text is a
      starting point written by an engineer, not legal advice

---

## Roadmap / extension points

Deliberately not built yet, but architected for:

- **Analytics** — `analytics` in `src/lib/site.ts` is the integration point.
- **AdSense** — see Monetization above; a flag flip.
- **Search at scale** — `searchArticles()` scores in memory. Fine into the
  hundreds of articles; swap the implementation, not the UI, when it is not.
- **Comments, accounts, product database** — would need a datastore; Workers
  KV or D1 are the zero-to-low-cost options on this platform.
- **Multiple authors** — the author system is already keyed by id and the
  byline resolves from the article, so adding a contributor is a data change.

---

## Sources

- [Migrate from Pages to Workers — Cloudflare](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Static Assets on Workers — Cloudflare](https://developers.cloudflare.com/workers/static-assets/)
- [Custom Domains for Workers — Cloudflare](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Nameserver Management — DigitalPlat FreeDomain](https://deepwiki.com/DigitalPlatDev/FreeDomain/3.1-nameserver-management)
