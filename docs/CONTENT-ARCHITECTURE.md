# Content architecture audit and plan

Written before the editorial-system work, and kept as the record of why the
architecture is shaped the way it is.

---

## A. Current content architecture

**As found (before this work):** two monolithic TypeScript modules —
`src/content/articles.ts` (1,889 lines) and `articles.extra.ts` (1,080 lines) —
holding 23 article objects between them, merged by a spread.

That was workable at 23 articles and would have failed at 200 for reasons that
are about collaboration rather than performance:

- Every article change touches one of two enormous files. On GitHub the diff is
  unreviewable and two people writing different articles conflict on the same
  file.
- The store is one unit of failure. A syntax error in any article breaks the
  build for all of them.
- There is no per-article history. `git log` on the file is the history of the
  whole publication.
- Splitting into `articles.ts` and `articles.extra.ts` was already an admission
  the file was too big, and the split was arbitrary — "second tranche" is not a
  meaningful boundary.

**Now:** one file per article at `src/content/articles/<category>/<slug>.ts`,
plus a generated barrel at `src/content/articles/index.ts`.

## B. Proposed scalable architecture

Three layers, deliberately separated:

| Layer             | Location                                              | Ships to browser | Purpose                 |
| ----------------- | ----------------------------------------------------- | ---------------- | ----------------------- |
| Published content | `src/content/articles/<category>/<slug>.ts`           | Yes              | What readers see        |
| Taxonomy          | `src/content/categories.ts`, `authors.ts`, `types.ts` | Yes              | Structure and contracts |
| Editorial backlog | `editorial/segments/<segment>.ts`                     | **No**           | What we intend to write |

The backlog is physically separate and `tests/editorial.test.ts` fails if
anything under `src/` imports it. A 1,500-entry planning file has no business in
the client bundle, and that import would look harmless in review.

### Why TypeScript files rather than Markdown/MDX

The brief suggested Markdown or MDX. I kept typed TS modules, and this is the
one place I deviated from the suggestion, so the reasoning matters:

- **The body is not prose with formatting — it is a structured block model.**
  Tables, callouts, ASCII diagrams, code blocks with language and filename
  metadata, and FAQ entries that feed FAQ schema. Markdown cannot express those
  without a set of custom MDX components, at which point the authoring
  experience is no simpler than an object literal and the type safety is gone.
- **Every field is checked at compile time.** A misspelled `reviewStatus` or a
  missing `metaDescription` is a typecheck failure, not a runtime surprise. MDX
  frontmatter is validated at best at build time, usually with a second schema
  that can drift from the renderer.
- **No new build infrastructure.** No MDX toolchain, remark/rehype plugins, or
  bundler configuration to maintain across three runtimes.

**The condition under which I would switch:** if a non-developer is ever going
to author articles directly. Object-literal syntax is a real barrier for a
writer, and at that point the ergonomics outweigh the type safety. That is a
product decision, not a technical one.

## C. Migration plan (executed)

1. Extract each article object from the two stores with a string-aware scanner —
   not brace counting or indentation, because article bodies contain template
   literals holding JSON and shell samples with `{`, `}` and lines that are
   literally `  },`. A naive scan silently truncates those articles.
2. Write each to `<category>/<slug>.ts`, re-indented, source text otherwise
   byte-identical.
3. Generate the barrel; delete the old stores.
4. Verify nothing changed: same 23 articles, same URLs, same word counts in the
   `Article` JSON-LD, same sitemap, same draft behaviour.

No consumer code changed. `@/content/articles` resolves to the directory index,
so every existing import kept working.

## D. Category taxonomy

Unchanged, deliberately. The 20 existing categories already cover the segments
in the brief, and the seven enterprise pillar slugs are frozen permanent URLs.

The brief's segment list maps onto them without new categories:

| Brief segment                       | Existing category                             |
| ----------------------------------- | --------------------------------------------- |
| Microsoft Intune                    | `microsoft-intune`                            |
| Microsoft 365 / Entra ID            | `microsoft-365-entra-id`                      |
| Windows                             | `how-to` + `software` (subcategory "Windows") |
| Cybersecurity / CISO                | `cybersecurity-ciso`                          |
| Enterprise Networking               | `enterprise-networking`                       |
| Cloud / Azure                       | `cloud`                                       |
| AI / Enterprise AI                  | `ai-enterprise-it`, `ai`                      |
| IT Automation                       | `it-automation`                               |
| Software / Developer Tools          | `software`                                    |
| Electronics / Gadgets / Smartphones | `electronics`, `gadgets`, `smartphones`       |
| How-To / Troubleshooting            | `how-to`                                      |
| Comparisons / Buying Guides         | `comparisons`, `buying-guides`                |
| Technology Leadership               | `technology-leadership`                       |

Three categories (`laptops`, `networking`, `emerging-tech`) have no content and
no backlog. They should be removed or planned — empty scaffolding in the footer
implies sections that do not exist.

**Windows has no dedicated category.** It is currently split across `how-to`
and `software`. At 100 Windows topics that becomes wrong. Recommend adding a
`windows` category when the Windows backlog is built, before any Windows
article is published, so no URL has to move.

## E. Topic inventory

**Delivered:** 75 topics across three segments — Microsoft Intune (44),
Microsoft 365 / Entra ID (23), Software (8).

**Not delivered:** the 100-per-segment target across all 16 segments.

This is a deliberate deviation and the reasoning is the same one behind the
publishing standard. 1,600 topic lines produced in one pass would be padded with
near-duplicates — "Intune policy conflicts", "how to fix Intune policy
conflicts", "Intune policy conflict troubleshooting" — which is the content-dump
failure mode moved upstream into planning. A backlog whose entries are not
genuinely distinct is worse than a short one, because it produces a schedule
that looks like progress while generating overlapping articles that compete for
the same query.

The 44 Intune topics are what a genuinely distinct backlog looks like at that
depth: eight operational areas, every content type represented, and the
`targetKeyword` uniqueness test enforcing that no two topics chase the same
query. Reaching ~100 for Intune is realistic; reaching it by padding is not.

**Recommended approach:** build the backlog one segment per working session,
researched the same way articles are. Roughly 40–60 genuinely distinct topics per
segment is achievable that way, and the uniqueness test will reject padding.

## F. Risks and trade-offs

| Risk                                           | Assessment                                                                                                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Generated barrel goes stale**                | An article file added without regenerating would never appear — no error, no 404. Mitigated by `tests/content-index.test.ts` and a dedicated CI step, both of which print the fix.       |
| **Object-literal authoring is developer-only** | Real and unresolved. Acceptable while the author is technical; blocking if that changes. See B.                                                                                          |
| **Backlog and articles drift apart**           | A topic marked PUBLISHED whose article was never written, or a published article missing from the backlog, would make the dashboard lie. Both are tested.                                |
| **Review dates become theatre**                | `nextReviewAt` only helps if someone acts on `bun run inventory --review`. The mechanism cannot create the discipline.                                                                   |
| **1,500 modules at build time**                | Not a concern. Vite handles it; the barrel is static imports and the whole store is needed anyway. Worth re-measuring at ~500 articles.                                                  |
| **Backlog bloating the bundle**                | Prevented structurally by the isolation test, not by convention.                                                                                                                         |
| **Keyword cannibalisation at scale**           | The uniqueness test catches exact duplicates only. Near-duplicate intents ("intune app not installing" vs "intune app install failed") still need editorial judgement.                   |
| **Volatile topics ageing badly**               | `updateClass` sets the cadence, but a vendor changing a feature does not wait for a review date. Volatile topics carry more risk of being wrong than the review system can fully manage. |
