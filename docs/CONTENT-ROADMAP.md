# Content roadmap and information architecture

The editorial and structural plan for Tech Compass. This document is the record
of the taxonomy, the pillar architecture, the content-type model, the linking
rules and the visual standard.

Companion documents:

| Document                                                     | Answers                                                                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| [`RESEARCH-STANDARD.md`](./RESEARCH-STANDARD.md)             | How an article is researched, produced and kept correct — source hierarchy, Microsoft research matrix, quality gates, maintenance |
| [`TECHNOLOGY-COVERAGE.md`](./TECHNOLOGY-COVERAGE.md)         | What each subject must eventually cover, and where the backlog stands against it                                                  |
| [`PUBLISHING.md`](./PUBLISHING.md)                           | Commands, field rules, PR checklist                                                                                               |
| [`NEWSLETTER-ARCHITECTURE.md`](./NEWSLETTER-ARCHITECTURE.md) | Separate workstream                                                                                                               |

> **Status: architecture implemented and verified. No articles written.**
> The taxonomy, content-type model, pillar data model, SVG figure block and
> graph validation are in place. Batch 1 has not started. Section 12 records
> what shipped and what is verified.
>
> **0 published URLs changed** — confirmed by manifest comparison before and
> after (`bun run scripts/url-manifest.ts --diff`).

**Guiding principle, above every number in this document:** optimise for a
coherent knowledge graph, not article count. A smaller set of excellent,
deeply interconnected articles beats hundreds of thin pages. Where the two
conflict, connectivity wins.

---

## 1. Decisions taken

| #   | Decision                                                                               | Section                                      |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | Add `windows` as a subject category. Published Intune URLs are untouched.              | 2                                            |
| 2   | Keep `networking` and `emerging-tech` as subject categories.                           | 2                                            |
| 3   | `how-to`, `comparisons`, `reviews`, `buying-guides` become `contentType`, not URLs.    | 3                                            |
| 4   | ~100 per major subject as a long-term goal, never a quota. Reserve discovery capacity. | 9                                            |
| 5   | Formal pillar → cluster → supporting architecture, before Batch 1.                     | 4                                            |
| 6   | Every substantial article carries intentional links up and across.                     | 5                                            |
| 7   | `relatedSlugs` becomes an editorial mechanism.                                         | 6                                            |
| 8   | Authored SVG diagrams — accurate, responsive, accessible, monochrome stencil.          | 7                                            |
| 9   | Diagrams only where they aid understanding. No decorative images.                      | 7                                            |
| 10  | Newsletter independent of Lovable; direct Brevo; `newsletterEnabled` wired.            | [separate doc](./NEWSLETTER-ARCHITECTURE.md) |
| 11  | Consolidate `laptops`; no `laptops` subject category.                                  | 2                                            |

`laptops` is retired: it held no articles, `gadgets` already carries a "Laptops"
subcategory, and `buying-guide` is now a content type rather than a destination.
"Laptops" survives as a subcategory and a tag. Nothing moved, because nothing
was there.

---

## 2. Final taxonomy

### 2.1 Subject categories — these own URLs

Every article lives at `/{subject}/{slug}`. Sixteen subjects, plus `windows`.

**Enterprise pillars (frozen slugs, permanent URLs)**

| Slug                     | Remit                                                             |
| ------------------------ | ----------------------------------------------------------------- |
| `microsoft-intune`       | Endpoint management: provisioning, policy, apps, compliance       |
| `microsoft-365-entra-id` | Identity, licensing, Conditional Access, tenant governance        |
| `cybersecurity-ciso`     | Security architecture, frameworks, governance, incident readiness |
| `enterprise-networking`  | Campus, branch, segmentation, SD-WAN, ZTNA, enterprise WLAN       |
| `ai-enterprise-it`       | Copilot, AI governance, AI inside IT operations                   |
| `it-automation`          | PowerShell, Microsoft Graph, orchestration, reporting             |
| `technology-leadership`  | Strategy, operating model, risk communication                     |

**Technology subjects**

| Slug            | Remit                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| `windows`       | **New.** Windows OS: deployment, servicing, security, performance, troubleshooting |
| `software`      | Cross-platform tooling, developer tools, productivity, licensing, macOS/Linux      |
| `ai`            | Models, local AI, RAG, agents, evaluation, AI security                             |
| `cloud`         | Azure-first: landing zones, cost, resilience, migration                            |
| `electronics`   | Components and standards: CPUs, storage, memory, USB-C, display tech               |
| `gadgets`       | Whole devices, home lab, peripherals, interoperability, setup                      |
| `smartphones`   | Android and iOS platform behaviour, mobile security, lifecycle                     |
| `networking`    | **Kept.** Standards explainers, home and small-business networking                 |
| `emerging-tech` | **Kept.** Robotics, quantum, spatial and edge computing                            |

### 2.2 Boundary rules

Two subjects that overlap will produce two articles chasing one query. These
rules are the tiebreak, and they belong in review.

| Pair                                    | Rule                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `networking` vs `enterprise-networking` | Standard, protocol or home/SMB kit → `networking`. Designing, segmenting or operating a corporate network → `enterprise-networking`. |
| `windows` vs `microsoft-intune`         | The OS itself → `windows`. Managing the OS _through Intune_ → `microsoft-intune`. All 15 published Intune articles stay put.         |
| `windows` vs `software`                 | Windows-specific → `windows`. Cross-platform or developer tooling → `software`.                                                      |
| `gadgets` vs `electronics`              | A whole device you use → `gadgets`. A component or standard inside it → `electronics`.                                               |
| `ai` vs `ai-enterprise-it`              | The technology → `ai`. Deploying and governing it in an enterprise → `ai-enterprise-it`.                                             |
| `cloud` vs `microsoft-365-entra-id`     | Azure infrastructure → `cloud`. Tenant, identity and licensing → `microsoft-365-entra-id`.                                           |

### 2.3 Format categories are retired as article containers

`how-to`, `comparisons`, `reviews` and `buying-guides` stop being destinations.
**No article may have one as its `category`.**

They remain as **derived index routes** — `/comparisons` lists every article
with `contentType: "comparison"`, wherever it lives. This keeps a useful browse
path and keeps navigation intact without ever creating a second URL for an
article.

This costs nothing today: all four contain zero published articles, and an
empty category is already `noindex` and excluded from the sitemap.

### 2.4 Draft remapping

Six drafts currently sit in format categories. All are `noindex`, absent from
the sitemap, RSS and search, so relocating them has **no SEO cost** — but it
must happen before any of them publishes.

| Current URL                                        | Proposed URL                                      | contentType       |
| -------------------------------------------------- | ------------------------------------------------- | ----------------- |
| `/how-to/windows-11-wifi-troubleshooting`          | `/windows/wifi-troubleshooting`                   | `troubleshooting` |
| `/comparisons/windows-11-vs-windows-10-enterprise` | `/windows/windows-11-vs-windows-10-enterprise`    | `comparison`      |
| `/comparisons/wifi-6-vs-wifi-7`                    | `/networking/wifi-6-vs-wifi-7`                    | `comparison`      |
| `/how-to/backup-restore-testing`                   | `/cybersecurity-ciso/backup-restore-testing`      | `how-to`          |
| `/reviews/password-managers-for-teams`             | `/cybersecurity-ciso/password-managers-for-teams` | `review`          |
| `/buying-guides/choosing-a-business-laptop`        | `/gadgets/choosing-a-business-laptop`             | `buying-guide`    |

The Windows Wi-Fi slug drops its redundant prefix — `/windows/windows-11-wifi-…`
reads badly. The last three are judgement calls, flagged in section 13.

---

## 3. The content-type model

### 3.1 The field

`contentType` becomes a **required** field on `Article`, using the vocabulary
`editorial/types.ts` already defines and every one of the 75 backlog topics
already carries:

```
troubleshooting · how-to · explainer · decision-framework
comparison · buying-guide · review · reference · analysis
```

(`review` is added to the existing eight — the backlog never needed it because
no review has been planned.)

Required, not optional, with all 35 existing articles backfilled in the same
change. Optional fields that describe every article eventually get skipped, and
typecheck catches a miss immediately.

### 3.2 Where the type lives — a constraint worth stating

`tests/editorial.test.ts` fails if **anything under `src/` imports from
`editorial/`**. The client bundle must never carry the backlog.

So the canonical `ContentType` must be declared in **`src/content/types.ts`**,
and `editorial/types.ts` imports it from there. The dependency runs
editorial → src, never the reverse. As a type-only import it is fully erased at
compile time and adds nothing to either bundle.

This is what stops the planning vocabulary and the publishing vocabulary
drifting apart — today the backlog classifies every topic and the article throws
that classification away.

---

## 4. Pillar → cluster → supporting architecture

### 4.1 Three levels

```
        Subject hub          "What Microsoft Intune manages"
             │                 one per subject
    ┌────────┼────────┐
    ▼        ▼        ▼
 Cluster pillars      "Intune application management"
    │        │          3–6 per mature subject
    ▼        ▼
 Supporting articles   "Win32 app detection rules"
                         the operational depth
```

### 4.2 How it is expressed in data

Two fields on `Article`:

| Field        | Meaning                                      | Set on                 |
| ------------ | -------------------------------------------- | ---------------------- |
| `pillar`     | The name of the cluster this article anchors | Hubs and pillars       |
| `pillarSlug` | The article one level up                     | Pillars and supporting |

- **Subject hub:** `pillar` set, no `pillarSlug`.
- **Cluster pillar:** both set — it anchors a cluster _and_ reports to the hub.
- **Supporting article:** `pillarSlug` only.

### 4.3 Validator rules this makes possible

The point of putting the hierarchy in data is that it becomes checkable rather
than aspirational:

| Rule                                                               | Level   |
| ------------------------------------------------------------------ | ------- |
| `pillarSlug` resolves to a published article that has `pillar` set | error   |
| No cycles; maximum depth 3                                         | error   |
| A published article has either `pillar` or `pillarSlug`            | warning |
| A published pillar has at least 3 supporting articles              | warning |
| A published article has at least one inbound internal link         | warning |

The last two matter most. **Orphan detection becomes a validation warning
instead of something found by a one-off script** — which is exactly how the four
current orphans went unnoticed.

### 4.4 The Intune structure

Confirmed against all 44 backlog topics: **none is a pillar.** The backlog was
built bottom-up and the foundation was never planned, so there is no existing
intent to duplicate.

Your seven suggested titles collapse to five plus one deferred. _Complete
Enterprise Guide_, _How Intune Works_ and _Intune Architecture_ resolve to one
search intent and would compete with each other; they become two distinct
pieces — **what Intune governs** (scope) and **how policy reaches a device**
(mechanism).

| Level   | Article                                  | Cluster               | Target keyword                           |
| ------- | ---------------------------------------- | --------------------- | ---------------------------------------- |
| **Hub** | What Microsoft Intune manages            | Microsoft Intune      | `what is microsoft intune`               |
| Pillar  | How Intune delivers policy to a device   | Policy delivery       | `how does intune work`                   |
| Pillar  | Windows device management with Intune    | Device lifecycle      | `intune windows device management`       |
| Pillar  | Intune application management            | Application delivery  | `intune application management`          |
| Pillar  | Intune compliance and Conditional Access | Compliance and access | `intune compliance conditional access`   |
| Pillar  | _Intune endpoint security architecture_  | Endpoint security     | `intune endpoint security` — **Batch 2** |

Endpoint security is deferred deliberately: its supporting articles (BitLocker,
ASR, LAPS, baselines) are all still `IDEA`. A pillar with nothing beneath it is
an orphan with a grand title.

### 4.5 All 15 published Intune articles get a parent

| Cluster                   | Supporting articles                                                                                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Policy delivery**       | `intune-policy-conflicts` · `intune-management-extension-logs` · `group-policy-to-settings-catalog-migration`                                                                                                                                  |
| **Device lifecycle**      | `enrollment-status-page-troubleshooting` · `autopilot-device-registration-failures` · `autopilot-device-preparation-vs-autopilot` · `autopilot-pre-provisioning-failures` · `intune-enrollment-restrictions` ⚑ · `entra-join-vs-hybrid-join` ⚑ |
| **Application delivery**  | `win32-app-detection-rules` · `intunewin-packaging-win32-apps` · `win32-app-supersedence-dependencies`                                                                                                                                         |
| **Compliance and access** | `intune-compliance-policy-design` · `compliant-device-conditional-access-blocked` · `intune-custom-compliance-scripts` ⚑                                                                                                                       |

⚑ = currently orphaned, zero inbound links.

### 4.6 Orphan remediation

Four published articles have zero inbound links. Each gets a specific fix, not a
generic instruction.

| Orphan                             | Fix                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `entra-join-vs-hybrid-join`        | Device-lifecycle pillar links down. `group-policy-to-settings-catalog-migration` links across — GPO migration presumes a join model.  |
| `intune-enrollment-restrictions`   | Device-lifecycle pillar links down. `autopilot-device-registration-failures` links across — restrictions cause registration failures. |
| `intune-custom-compliance-scripts` | Compliance pillar links down. `intune-compliance-policy-design` links across, as the escape hatch when built-in settings run out.     |
| `vscode-vs-jetbrains`              | Not fixable by linking — the only `software` article. Needs a companion article. Batch 3.                                             |

### 4.7 Hubs for the other subjects

One hub per subject, written when that subject's cluster begins. Batch 1 adds
three beyond Intune:

| Subject                  | Hub article                         | Batch |
| ------------------------ | ----------------------------------- | ----- |
| `microsoft-365-entra-id` | Entra ID identity foundations       | 1     |
| `cybersecurity-ciso`     | Zero Trust for a Microsoft estate   | 1     |
| `cloud`                  | Azure landing zones                 | 2     |
| `windows`                | Windows in the enterprise           | 3     |
| `it-automation`          | Automating Microsoft 365 with Graph | 3     |

---

## 5. Internal linking rules

Binding on every substantial article (≥1,500 words).

### 5.1 Required

| Direction  | Requirement                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| **Up**     | At least one contextual link to its cluster pillar or subject hub.                                           |
| **Across** | At least two links to sibling articles in the same or an adjacent cluster.                                   |
| **Down**   | Pillars link to every supporting article in their cluster.                                                   |
| **Back**   | Adding an article includes editing existing articles to link _to_ it — in the same change, not a later pass. |

### 5.2 Anchor text

Descriptive, naming the destination topic, inside a sentence that would exist
anyway.

- **Good:** "…detection rules decide whether an app reinstalls every cycle, which the [Intune Management Extension log](/microsoft-intune/intune-management-extension-logs) records in detail."
- **Banned:** click here · read more · this article · learn more · here

### 5.3 Forced links are worse than missing ones

A link earns its place by helping the reader continue a real line of thought.
If the sentence had to be invented to hold the link, delete both. Meeting a
link count with contrived references is the failure mode this section exists to
prevent — the rules are a floor for genuine connections, not a quota.

### 5.4 Enforcement

| Check                                               | Level            |
| --------------------------------------------------- | ---------------- |
| Link to a draft from a published article            | error _(exists)_ |
| Generic anchor text                                 | error _(new)_    |
| Published article with zero outbound internal links | warning _(new)_  |
| Published article with zero inbound internal links  | warning _(new)_  |

---

## 6. `relatedSlugs` as an editorial mechanism

**Current state: used by exactly zero articles.** Every "related" block on the
site is tag-derived — a coincidence of shared tags doing a job it was not
designed for.

`relatedArticles()` already resolves `relatedSlugs` first and already filters to
published articles, so the mechanism works. It has simply never been used.

**New standard**

- Every substantial article sets `relatedSlugs` explicitly: **2–4 horizontal
  siblings**, editorially chosen.
- `relatedSlugs` is for _sideways_ relationships. The pillar link is structural
  (`pillarSlug`) and renders separately — do not duplicate it here.
- Tag-derived fallback stays, for short articles and as a safety net.
- Validator warning: a published article over 1,800 words with no
  `relatedSlugs`.

---

## 7. Visual content architecture

### 7.1 The gap

The `diagram` block renders **ASCII in a `<pre>`** (`ArticleBody.tsx:176`).
There is no way to author an SVG today. This blocks the first pillar article.

### 7.2 New `figure` block

Added alongside `diagram`, which keeps working for existing articles.

```ts
| {
    type: "figure";
    title: string;
    /** Hand-authored inline SVG. No raster, no external assets. */
    svg: string;
    /** Text alternative describing what the diagram shows. Required. */
    alt: string;
    caption?: string;
  }
```

Inline rather than a linked asset: no extra request, no layout shift, and the
diagram inherits theme colours directly.

### 7.3 Authoring standard

| Requirement      | Rule                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Accurate**     | Labels match the article's technical explanation exactly. Wrong labels are worse than none.                                              |
| **Responsive**   | `viewBox` only. No `width`/`height` on the root element.                                                                                 |
| **Theme-aware**  | `currentColor` for every stroke and fill. No hard-coded hex.                                                                             |
| **Accessible**   | `role="img"`, `<title>`, `aria-label` from `alt`. Meaningful text, not "diagram".                                                        |
| **Lightweight**  | Target under 8 KB. No embedded fonts, no `<image>`, no `<script>`.                                                                       |
| **Monochrome**   | Black and white only. Depth via hatching and stroke weight, never colour.                                                                |
| **Stencil feel** | `stroke-linecap="round"`, `stroke-linejoin="round"`, hatch-pattern fills, consistent 1.5–2 px strokes. Technical notebook, not clip art. |

### 7.4 Where diagrams go

Only where a diagram teaches faster than the paragraph it replaces. Good
candidates: service boundaries, sequences, decision trees, state machines,
layered architectures.

**Not** for: decoration, whitespace, restating a list, or hero images with no
informational content. An article with no diagram is finished; an article with a
decorative diagram is not.

### 7.5 Validation

| Check                                              | Level   |
| -------------------------------------------------- | ------- |
| Contains `viewBox`                                 | error   |
| No `width=`/`height=` on the root `<svg>`          | error   |
| No `<script`, `<image`, or external `href`         | error   |
| `alt` present, non-empty, and not equal to `title` | error   |
| Under 8 KB                                         | warning |
| No hard-coded colour values                        | warning |

The renderer must inject the SVG as raw markup, so these are not stylistic
preferences — the `<script>` rule is the guard that makes it safe. Content is
authored in-repo and trusted, but the check should exist regardless.

---

## 8. Capacity by subject

~100 is a long-term ceiling where the subject genuinely supports it, never a
quota to fill.

| Subject                  | Ceiling | Basis                                                 |
| ------------------------ | ------: | ----------------------------------------------------- |
| `microsoft-intune`       | **100** | Deepest subject. 44 planned, 15 published.            |
| `microsoft-365-entra-id` | **100** | 23 planned. Identity, licensing, CA, governance.      |
| `cybersecurity-ciso`     | **100** | Frameworks plus operations genuinely sustain it.      |
| `cloud`                  | **100** | Azure-first scoping required, or it sprawls.          |
| `windows`                |  **80** | Deployment, servicing, security, troubleshooting.     |
| `enterprise-networking`  |  **75** | Past ~75 it restates vendor documentation.            |
| `it-automation`          |  **74** | Graph and PowerShell carry it; then it thins.         |
| `ai`                     |  **70** | Achievable; the most volatile subject on the site.    |
| `software`               |  **60** | Developer tooling, licensing, productivity.           |
| `electronics`            |  **60** | Standards and explainers need no hardware.            |
| `ai-enterprise-it`       |  **55** | Narrow genuine subject; ages fastest.                 |
| `technology-leadership`  |  **45** | Past ~45 it becomes generic management filler.        |
| `smartphones`            |  **40** | Platform behaviour, not device-by-device coverage.    |
| `gadgets`                |  **35** | Architecture and interoperability, not product churn. |
| `networking`             |  **30** | Standards and SMB, bounded by the 2.2 rule.           |
| `emerging-tech`          |  **30** | Real subject matter; slow to build authority.         |

**≈ 1,054 long-term.** Content types are drawn from this pool, never added to it.

**Reviews stay honest and small.** `reviewStatus: "hands-on"` means the product
was used. Expect ~20 across all subjects, and none invented.

**Buying guides favour evergreen criteria** — "how to choose a business laptop"
over "best laptops 2026". Guides that name prices inherit a recurring
`priceCheckedAt` obligation; guides that teach selection criteria do not.

---

## 9. Backlog generation strategy

### 9.1 Reserve capacity for discovery

Each subject's backlog is planned to **~70% of its ceiling**, leaving ~30%
deliberately unallocated.

| Subject                  | Ceiling | Plan to | Reserved |
| ------------------------ | ------: | ------: | -------: |
| `microsoft-intune`       |     100 |      70 |       30 |
| `microsoft-365-entra-id` |     100 |      70 |       30 |
| `cybersecurity-ciso`     |     100 |      70 |       30 |

The reserve is not slack. The best topics come from writing the first thirty —
a failure mode you only learn about after explaining the mechanism, a decision
readers keep asking about. A fully pre-specified backlog has nowhere to put
them, and forces them into the shape of a list written before anything was
known.

### 9.2 Rules

1. **Cluster-first.** Plan a pillar and its cluster together. Never scatter
   topics across a subject with no hub.
2. **One segment per session**, researched — not sixteen segments in one pass.
3. **Unique `targetKeyword`**, enforced by `tests/editorial.test.ts`.
4. **Distinct intent, not distinct wording.** "Intune policy conflicts" and
   "how to fix Intune policy conflicts" are one topic.
5. **`IDEA` until researched.** Status reflects reality or the dashboard lies.
6. **Name required sources at planning time.** That is what stops an article
   later being written from memory.
7. **Check [`TECHNOLOGY-COVERAGE.md`](./TECHNOLOGY-COVERAGE.md) before planning
   a segment.** It is the map of what the subject owes a reader; the backlog is
   the subset actually committed to.

### 9.3 Backlog improvements

The backlog is the authoritative planning surface, so its accuracy is not
cosmetic.

**Fixed:** 13 topics sat in `EDITORIAL_REVIEW` while their articles were live,
so `bun run inventory` reported 4 published against a real 17 — anything planned
from that dashboard would have started from a wrong picture. Statuses are
reconciled and `tests/editorial.test.ts` now fails if a topic's status
contradicts its article's actual draft state. The previous tests only asked
whether the article _existed_, which is why this drifted unnoticed.

**Still to do, in priority order:**

| #   | Improvement                                                                                                | Why                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Extend the `Topic` model with `pillarSlug`, `plannedInternalLinks`, `diagramOpportunity`, `primarySources` | The article schema now carries pillar data; the backlog cannot plan a cluster it has no field for       |
| 2   | Extend `scripts/inventory.ts` with pillar, orphan, contentType and coverage reporting                      | One dashboard, not the ad-hoc scripts used during the audit                                             |
| 3   | Build the 13 missing segment backlogs                                                                      | 13 of 16 subjects have no plan at all                                                                   |
| 4   | Near-duplicate intent detection                                                                            | The uniqueness test catches exact `targetKeyword` collisions only; near-duplicates still need judgement |

### 9.3 Order

| Batch | Focus                                                              |
| ----- | ------------------------------------------------------------------ |
| 1     | Intune hub + 4 cluster pillars; Entra and CISO hubs; orphan rescue |
| 2     | Endpoint security pillar; stub rewrites; Entra depth               |
| 3     | Windows category build-out; Intune enrollment and app depth        |
| 4     | Entra ID: Conditional Access and identity clusters                 |
| 5     | Cybersecurity: frameworks and incident response                    |
| 6     | Cloud, networking, automation                                      |
| 7+    | Consumer subjects; one segment per session                         |

---

## 10. Batch 1 (proposed — not started)

Twelve articles. Five are pillars, three rescue orphans by construction.

| #   | Article                                         | Subject    | contentType        | Role    | Intent       | Diagram                                                 |
| --- | ----------------------------------------------- | ---------- | ------------------ | ------- | ------------ | ------------------------------------------------------- |
| 1   | What Microsoft Intune manages                   | intune     | explainer          | **Hub** | architecture | Service boundaries: Intune / Entra / Defender / Purview |
| 2   | How Intune delivers policy to a device          | intune     | explainer          | Pillar  | architecture | Sequence: check-in → CSP → IME → reporting              |
| 3   | Windows device management with Intune           | intune     | explainer          | Pillar  | architecture | Flow: hardware → identity → join → enrol → ESP → ready  |
| 4   | Intune application management                   | intune     | explainer          | Pillar  | architecture | Decision tree: Win32 / MSI / Store / App Catalog        |
| 5   | Intune compliance and Conditional Access        | intune     | explainer          | Pillar  | architecture | Flow: device state → evaluation → token → grant/block   |
| 6   | Entra ID identity foundations                   | m365-entra | explainer          | **Hub** | architecture | Identity model: tenant, objects, trust                  |
| 7   | Zero Trust for a Microsoft estate               | ciso       | explainer          | **Hub** | architecture | Control-plane map                                       |
| 8   | Settings catalog, templates or custom OMA-URI   | intune     | decision-framework | Support | decision     | Decision tree                                           |
| 9   | Proactive remediations at fleet scale           | intune     | how-to             | Support | how-to       | Detection → remediation flow                            |
| 10  | Conditional Access break-glass accounts         | m365-entra | how-to             | Support | how-to       | Lockout-scenario tree                                   |
| 11  | Windows Update rings that survive Patch Tuesday | intune     | decision-framework | Support | architecture | Ring topology + deferral timeline                       |
| 12  | Silent BitLocker: the real prerequisites        | intune     | troubleshooting    | Support | failure-mode | Prerequisite flow                                       |

Expected link graph: **33 → ~95 edges**, with a deliberate hierarchy replacing
three accidental hubs.

---

## 11. Current state

After the architecture implementation.

| Measure          | Value                                                             |
| ---------------- | ----------------------------------------------------------------- |
| Articles         | 35 — 17 published, 18 draft (unchanged)                           |
| Published corpus | 35,401 words, 2,082 average, 16/17 at the 1,800 standard          |
| Distribution     | `microsoft-intune` 15 · `microsoft-365-entra-id` 1 · `software` 1 |
| Categories       | 20 — 16 subject, 4 derived index                                  |
| Internal edges   | 33 (1.94 average outbound)                                        |
| Orphans          | 4 with zero inbound links — **now a validator warning**           |
| `relatedSlugs`   | Used by 0 articles — 16 warnings raised                           |
| Backlog          | 75 topics, 3 segments; 17 categories unplanned                    |
| Validation       | 0 errors, 38 warnings                                             |

The warning count rose from 18 to 38 because the new checks found real gaps
rather than because anything regressed:

| Warning                  | Count | Meaning                                         |
| ------------------------ | ----: | ----------------------------------------------- |
| Draft below word bar     |    18 | Pre-existing stubs, unchanged                   |
| No `relatedSlugs`        |    16 | Substantial articles relying on tag coincidence |
| Orphan (0 inbound links) |     4 | The four already identified in section 4.6      |

All 38 are actionable by Batch 1. None blocks a build.

---

## 12. Implementation — done

Staged so each step is independently reviewable.

| Step | Change                                                                                 | Risk |
| ---- | -------------------------------------------------------------------------------------- | ---- |
| 1    | `ContentType` in `src/content/types.ts`; `editorial/types.ts` imports it; add `review` | Low  |
| 2    | Add `contentType` to `Article` (required); backfill all 35                             | Low  |
| 3    | Add `pillar` / `pillarSlug` to `Article`                                               | Low  |
| 4    | Add `windows` category; add to `footerColumns`                                         | Low  |
| 5    | Mark the four format categories index-only; validator rejects them as `category`       | Med  |
| 6    | Route format index pages off `contentType`                                             | Med  |
| 7    | Move the six drafts to subject categories (section 2.4)                                | Low  |
| 8    | Add the `figure` block: type, renderer, validation                                     | Med  |
| 9    | Add validator rules: pillar integrity, orphan warnings, anchor text, SVG               | Low  |
| 10   | Add `tests/architecture.test.ts` — 16 tests over the new invariants                    | Low  |
| 11   | Add `scripts/url-manifest.ts` — URL snapshot and diff tool                             | Low  |

### Deliberately not done

| Deferred                                             | Why                                                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Backfilling `pillarSlug` on the 15 Intune articles   | The pillars do not exist yet. `pillarSlug` must resolve to a published pillar, so this lands _with_ Batch 1, not before it.       |
| Backfilling `relatedSlugs`                           | Editorial curation, most meaningful once the cluster structure exists. Raises 16 warnings in the meantime, which is the reminder. |
| Newsletter: direct Brevo, wiring `newsletterEnabled` | Separate workstream — [`docs/NEWSLETTER-ARCHITECTURE.md`](./NEWSLETTER-ARCHITECTURE.md). Approved in principle, not yet built.    |

### One design decision made during implementation

The "article is not attached to the pillar structure" check only fires once its
**subject already has a pillar**. Without that condition it would raise 17
unfixable warnings today — and a warning nobody can action is a warning
everybody learns to ignore. The check switches itself on, per subject, as
Batch 1 lands.

### Verification

| Check                  | Result                                            |
| ---------------------- | ------------------------------------------------- |
| Published URL manifest | **0 changed** (17 → 17)                           |
| Canonical URLs         | 0 changed (17 → 17)                               |
| RSS                    | 0 changed (17 → 17); matches served build exactly |
| Sitemap                | 39 → 41; matches served build exactly             |
| `validate:content`     | 0 errors, 38 warnings                             |
| `typecheck` / `lint`   | 0 errors (6 pre-existing shadcn warnings)         |
| `test`                 | 135 passed, 11 files                              |
| `build:node`           | exit 0                                            |
| `crawl:check`          | 68 routes, 0 errors, 0 warnings                   |
| `test:a11y`            | 32 passed (desktop + mobile, including dark mode) |
| SVG `figure`           | Rendered and verified in-browser, both themes     |

---

## 13. Open items

All four earlier questions were decided and implemented. What remains:

| #   | Item                                                   | Note                                                                                                                                                                                             |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `/comparisons` and `/how-to` newly entered the sitemap | They now have derived content, so they are indexable. `/reviews` and `/buying-guides` stay `noindex` — correctly, since no published article is a review or buying guide. Worth a conscious yes. |
| 2   | Newsletter implementation                              | Approved in principle, not yet built. See [`docs/NEWSLETTER-ARCHITECTURE.md`](./NEWSLETTER-ARCHITECTURE.md).                                                                                     |
| 3   | `products.ts` still carries `category: "laptops"`      | A product-catalogue string, unrelated to article categories and not validated against them. Left alone; flagged for tidiness.                                                                    |
| 4   | `README.md` says `serve:build` listens on 4173         | It listens on 3000. Pre-existing doc drift, found during verification.                                                                                                                           |
