# Redesign handoff

State of the frontend redesign as of 2026-08-20. Written for a session that
starts cold, with no memory of how any of this was decided.

**Status: uncommitted, on `master`, 24 modified files. Not pushed. Not deployed.**

---

## 1. What this was

The visual design read as competent SaaS rather than a publication. The token
layer was never the problem — it already had OKLCH colours with documented
contrast reasoning and real editorial utilities. The problem was composition:
four identical three-column card grids stacked under identical section rules,
a blurred sticky header, rounded inputs, and a wordmark that was text plus a
coloured full stop.

So this is a **recomposition, not a rebuild**. The data and content
architecture is untouched.

## 2. The design system now

| Decision | Value | Why |
| -------- | ----- | --- |
| Display serif | **Newsreader** (was Merriweather) | Merriweather is the default blog serif. Newsreader has optical sizing and real character. Same request count — a swap, not an addition. |
| UI face | Inter | Unchanged. UI and meta only. |
| Radius | **0.125rem** (was 0.375rem) | Editorial surfaces are square. |
| `--brand` | Vermilion `oklch(0.52 0.19 32)` | Identity only: wordmark rule, kickers, active nav, hovers. |
| `--link` | Ink blue, unchanged | **Deliberately separate from brand.** The old system conflated them, so every link was a brand mark and the accent meant nothing. Link legibility is a usability property, not a style choice. |
| `--container-wide` | 78rem | Outer frame. |
| `--container-editorial` | 42rem | Reading measure. See §4. |

**Type scale, verified in the browser:** 64 / 34 / 23 / 19 / 16 px.
`display-1` → `display-2` → row headline → `display-3` → body. Each step is
clearly subordinate. Do not flatten this.

**Utilities added** in `src/styles.css`: `kicker` (brand rule + label — colour
on 11px uppercase fails contrast first, so the rule carries the brand instead),
`display-1/2/3`, `standfirst`, `index-num`.

## 3. Composition rules

`ArticleCard` has five variants and the **page** chooses the shape, not the
article: `lead` (front-page hero), `feature` (section lead, one step down),
`index` (numbered contents entry), `row` (ruled list), `brief` (compact
text-only), `card` (grid default).

The homepage gives each section a **different** form — `feature`, `grid`,
`briefs` — declared in the `SECTIONS` array in `src/routes/index.tsx`. This is
the single most important thing to preserve. Repeating one card shape down the
page is what made the old design read as generated.

**Section forms degrade.** `hasRail = all.length > 1`. Below two articles the
lead takes the full width. Cybersecurity has one published article and was
rendering a lead beside an empty seven-column hole until this was added.

## 4. Reading measure

`article-prose` caps `p`, `ul`, `ol`, `h3` at `--container-editorial`, and
deliberately **not** the container — tables, figures and code keep the full
column while prose stays readable.

Measured before: 87 characters a line between the sm and lg breakpoints, where
the article ran full width. After: **71**. Long-form wants 60–75.

## 5. Newsletter

The logic was already strong and was **not** rebuilt: confirmed opt-in,
correctly implemented honeypot, signed tokens minted lazily on first
interaction, rate limiting, disposable-domain blocking, duplicate handling, an
`unavailable` state that withdraws the form rather than failing after the
reader has typed, retry with categorised outcomes.

**One real defect was fixed.** It routed all Brevo traffic through
`connector-gateway.lovable.dev`, requiring a `LOVABLE_API_KEY`, despite the
project having moved to Cloudflare Workers and stripped Lovable elsewhere — a
third-party proxy sitting in the subscription path. It now calls
`api.brevo.com/v3` directly with Brevo's documented `api-key` header.
`LOVABLE_API_KEY` is gone from `.env.example`.

Verified: no secret of any kind appears in `.output/public/`; all env access is
inside `createServerFn`; error copy is generic and leaks no provider internals;
unsubscribe still runs through Brevo's one-click link.

**Not verifiable locally:** subscribe / duplicate / success end-to-end needs
live Brevo credentials.

## 6. Lighthouse

`package.json` was `PORT=4173 lhci autorun` — not valid syntax in cmd.exe, so
the command was broken on Windows. Fixed **without a new dependency**:
`lighthouserc.cjs` now sets `process.env.PORT`, which the spawned server
inherits, and the script is plain `lhci autorun`.

Verified working: it starts the server, connects, and audits every page through
to "Generating results".

**It still cannot finish on this machine.** `chrome-launcher` fails during
teardown with `EPERM` removing its temp directory. Environment defect, not
project code. No report JSON is produced, so **there are no scores yet** —
expect them from CI.

⚠️ **Never run `npx lhci`.** npm fetches an unrelated registry package of that
name and executes it. The project depends on `@lhci/cli`; the local bin
resolves correctly inside npm scripts.

## 7. Verified visually

Desktop homepage at several scroll positions, article page, dark mode, mobile
article. Three genuine defects were found by eye that every automated gate had
passed:

1. **Hierarchy collapse** — "Latest" rendered at 34px against a 64px hero, and
   section leads reused `display-1`, so a section opener matched the front-page
   hero. Fixed via the `feature` variant and a 23px row headline.
2. **Empty column** — the `briefs` form assumed ≥2 articles.
3. **87-character measure** — see §4.

The a11y suite separately caught a **missing `<h1>`** on the homepage after the
old eyebrow heading was removed. Fixed with a dateline strip carrying the h1 —
a front page's heading is the publication, not any one story.

## 8. Not visually verified

Category page, search page, newsletter page at desktop width, and mobile
homepage. The browser pane in this environment is intermittent; these were
checked structurally and by axe only.

## 9. Guardrails

Do not reintroduce: gradients, shadows, `backdrop-blur`, pills, `rounded-full`,
or repeated identical card grids. A scan of `src/routes`, `src/components/site`
and `src/components/article` returns **zero** of each — keep it that way.

Do not merge `brand` back into `link`.

## 10. Gate results at handoff

| Gate | Result |
| ---- | ------ |
| Typecheck | 0 errors |
| Lint | 0 errors, 6 warnings (pre-existing, shadcn/ui `react-refresh`) |
| Tests | 137 passed |
| Accessibility | 32/32 passed |
| Content validation | 0 errors, 32 warnings |
| Build | Succeeds (Cloudflare and Node adapters) |
| URL safety | **PASS — 0 published URLs changed.** Sitemap 63, RSS 29, canonicals 29, all unchanged |
| Scope | 24 files, **0 article / backlog / taxonomy files** |

## 11. Next

1. Look at the four surfaces in §8 before committing.
2. Commit — suggested message: `Redesign the frontend around an editorial system`.
3. Get Lighthouse scores from CI.
4. Consider `.gitattributes` with `* text=auto eol=lf`. CRLF keeps reappearing
   after any `git checkout`/`stash` on this machine and trips `prettier`; it is
   cosmetic and never reaches a commit, but it wastes a normalisation step
   every session.
