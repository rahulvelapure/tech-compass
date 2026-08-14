# Newsletter: production architecture diagnosis

A separate technical workstream from content expansion. This document
establishes what the newsletter architecture **is**, what it was **intended** to
be, and what it needs to be for Tech Compass to run independently.

> **Status: diagnosis and recommendation. Not implemented.** The only code
> change made so far is the availability fix in section 5. No provider change,
> no new environment variables, no deployment change.

---

## 1. What exists today

```
Browser
  │  issueNewsletterToken()      ← HMAC form token
  │  subscribeToNewsletter()     ← email + token
  ▼
TanStack server function  (Cloudflare Worker)
  │  POST /v3/contacts/doubleOptinConfirmation
  │  Authorization: Bearer   $LOVABLE_API_KEY
  │  X-Connection-Api-Key:   $BREVO_API_KEY
  ▼
connector-gateway.lovable.dev/brevo        ← third-party proxy
  ▼
Brevo  →  confirmation email  →  reader clicks  →  added to list
```

Confirmed opt-in throughout: the form never adds anyone, it only asks Brevo to
send a confirmation. That design is correct and should not change.

### Required configuration

| Variable                  | Kind           | Purpose                                           |
| ------------------------- | -------------- | ------------------------------------------------- |
| `LOVABLE_API_KEY`         | Secret         | Authenticates to the Lovable gateway              |
| `BREVO_API_KEY`           | Secret         | Forwarded by the gateway to Brevo                 |
| `BREVO_LIST_ID`           | Secret         | List joined after confirmation                    |
| `BREVO_DOI_TEMPLATE_ID`   | Secret         | Double opt-in template                            |
| `NEWSLETTER_FORM_SECRET`  | Secret         | Signs form tokens (falls back to `BREVO_API_KEY`) |
| `PUBLIC_SITE_URL`         | Plain variable | Confirmation redirect target                      |
| `VITE_NEWSLETTER_ENABLED` | **Build-time** | Declared, **never read** — see section 3          |

---

## 2. The Lovable dependency

`connector-gateway.lovable.dev` is a proxy operated by Lovable. It contributes
no functionality of its own: it forwards the request to Brevo, swapping
`X-Connection-Api-Key` for Brevo's own auth header.

This matters because:

- **It is a hosted third-party dependency in the subscription path.** If the
  gateway is withdrawn, rate-limited, or the Lovable account lapses,
  subscriptions stop — with no signal in this repository.
- **It contradicts the project's direction.** Commit `9e5d1ce` removed Lovable
  traces from the codebase. This runtime dependency survived that cleanup, and
  it is the one that actually matters.
- **It requires a credential that has nothing to do with email.**
  `LOVABLE_API_KEY` is a platform credential for a platform the site otherwise
  no longer uses.

### The direct path is a drop-in replacement

Verified against Brevo's published API reference, not from memory:

|         | Current (via gateway)                                                             | Direct                    |
| ------- | --------------------------------------------------------------------------------- | ------------------------- |
| Host    | `connector-gateway.lovable.dev/brevo`                                             | `api.brevo.com`           |
| Path    | `/v3/contacts/doubleOptinConfirmation`                                            | **identical**             |
| Method  | POST                                                                              | **identical**             |
| Auth    | `Authorization: Bearer $LOVABLE_API_KEY` + `X-Connection-Api-Key: $BREVO_API_KEY` | `api-key: $BREVO_API_KEY` |
| Body    | `email`, `includeListIds`, `templateId`, `redirectionUrl`, `attributes`           | **identical**             |
| Success | 2xx                                                                               | 201, empty `{}`           |

**The request body does not change at all.** The change is the host and two
header lines — roughly four lines in `src/lib/newsletter.functions.ts`. The
retry classification, spam layers, logging and confirmed opt-in flow are
untouched.

`LOVABLE_API_KEY` then disappears: **five secrets become four**, and only three
are strictly mandatory since `NEWSLETTER_FORM_SECRET` falls back to
`BREVO_API_KEY`.

_Source: [Brevo API — create DOI contact](https://developers.brevo.com/reference/createdoicontact)_

---

## 3. The intended architecture was already designed — and left unwired

`src/lib/site.ts` defines:

```ts
/** Newsletter form submits to a provider. When false the form explains it. */
newsletterEnabled: env["VITE_NEWSLETTER_ENABLED"] === "true",
```

**Nothing in the codebase reads `flags.newsletterEnabled`.** Its two siblings
are both consumed, and both use the same one-line pattern:

| Flag                | Consumer                                              | Line                                        |
| ------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `adsEnabled`        | `src/components/monetization/AdSlot.tsx`              | `if (!flags.adsEnabled) return null;`       |
| `affiliateEnabled`  | `src/components/monetization/AffiliateDisclosure.tsx` | `if (!flags.affiliateEnabled) return null;` |
| `newsletterEnabled` | **none**                                              | —                                           |

Only the newsletter flag is orphaned — and the fix in section 6 step 1 is not a
new invention, it is the pattern already established twice in this codebase.

So the intended behaviour is not a matter of guesswork: the docstring states it.
The form was meant to know, at build time, whether a provider was wired up, and
explain itself when not. That mechanism was designed, declared in
`.env.example`, and never connected.

This is the answer to "what is the intended production architecture" — it is
already written down in the repository, and the defect is that it was never
implemented.

---

## 4. Two layers, not one

The flag and a runtime check answer different questions, and a correct design
uses both.

| Layer                     | Question                                | Timing  | Failure it catches                                                            |
| ------------------------- | --------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `flags.newsletterEnabled` | _Do we intend to offer subscriptions?_  | Build   | Newsletter deliberately off — form never renders, no request, no layout shift |
| Runtime config check      | _Can the provider actually be reached?_ | Request | Flag says yes but a secret is missing or misconfigured                        |

The flag alone is insufficient: it can be `true` while `BREVO_LIST_ID` is
absent. The runtime check alone is insufficient: it cannot suppress the form
during server rendering, so a reader still sees a form that will not work.

**Deployment consequence, stated because it is easy to get wrong:**
`VITE_*` variables are inlined into the bundle at **build** time, while
`BREVO_*` are **runtime** secrets. On Cloudflare these are configured in
different places. Setting `VITE_NEWSLETTER_ENABLED` as a runtime secret would
have no effect at all — the built bundle would still carry `false`.

---

## 5. What has already been changed

One defect was fixed, because it was live and visitor-facing:

- **Before:** configuration was checked only inside the submit handler. A reader
  typed their address, submitted, and was told _"The mailing list is not
  configured yet"_ — naming internal deployment state.
- **After:** a single `newsletterConfig()` is the one definition of
  "configured", read by both the token endpoint and the submit handler. The form
  withdraws itself on first interaction, showing _"Subscriptions are unavailable
  at the moment. Please check back soon."_ The specific missing variable goes to
  the server log only.

Verified against the running dev server: email inputs on the page went 1 → 0 on
first focus, and the server logged
`{"outcome":"unconfigured","missingConfig":"credentials"}` while the browser
received only `configured: false`.

This is a runtime safety net. It does **not** replace the build-time flag —
under the two-layer model it is the second layer, and section 6 step 1 adds the
first.

---

## 6. Recommended target architecture

Ordered by dependency. **None of this is implemented.**

### Step 1 — Wire up the existing flag _(no provider change, low risk)_

`NewsletterCTA` returns `null` when `flags.newsletterEnabled` is false, so the
section never renders. `Footer`, `Header` and the `/newsletter` route need to
handle its absence; `/newsletter` should explain rather than render an empty
page. Independent of every other step.

### Step 2 — Decide the operating model _(this is the real decision)_

| Option                                               | Keeps Lovable | Secrets | Assessment                                                                                                          |
| ---------------------------------------------------- | ------------- | ------: | ------------------------------------------------------------------------------------------------------------------- |
| **A. Direct to Brevo**                               | No            |       4 | **Recommended.** Independent operation, one fewer failure point, one fewer credential. Change is ~4 lines.          |
| B. Keep the gateway                                  | Yes           |       5 | Only defensible if the Lovable account is intended to remain active indefinitely.                                   |
| C. Different provider (Buttondown, Listmonk, Resend) | No            |  varies | Larger change: different DOI semantics, different retry classification. Only if Brevo itself is being reconsidered. |

Option A preserves every behaviour that matters — confirmed opt-in, the three
spam layers, retry classification, structured logging — because none of them
depend on the gateway.

### Step 3 — Verify the credential path before enabling

Brevo's DOI endpoint needs a template containing the `{{ doubleoptin }}` link
and a real list id. Confirm both exist in the Brevo account before setting
`VITE_NEWSLETTER_ENABLED=true`, or the flag will promise a form that the runtime
layer then withdraws.

### Step 4 — Confirm the Cloudflare deployment shape

Not assumed here, and it should be checked rather than guessed:

- Is the Worker deployed from CI or the dashboard? Build variables and runtime
  secrets are set differently in each.
- `wrangler.jsonc` has `routes` **deliberately commented out** because
  `rahulvelapure.dpdns.org` currently serves a different live site. Until that
  is resolved the newsletter runs on a `workers.dev` URL, which affects
  `PUBLIC_SITE_URL` and therefore the confirmation redirect target.

**The confirmation redirect is the trap.** `confirmationRedirectUrl()` falls back
to `site.url`. If `PUBLIC_SITE_URL` is unset on a `workers.dev` deployment, the
confirmation link sends subscribers to the wrong origin — and this fails
_after_ a real person has clicked a real email, which is the worst place for it
to fail.

---

## 7. Constraints this must keep

Carried over unchanged from the current implementation:

- **No fake success.** Bots receive `SILENT_SUCCESS`; genuine failures never do.
- **No single opt-in fallback.** Missing template or list means refuse, never
  add directly.
- **No internal configuration exposed.** Variable names stay in server logs.
- **Graceful when unavailable.** The form withdraws rather than collecting
  addresses it cannot process.
- **No subscriber data stored in this application.**

---

## 8. Open decisions

| #   | Decision                                                           | Recommendation                                                    |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1   | Is Tech Compass intended to run independently of Lovable?          | If yes, Option A follows automatically                            |
| 2   | Wire up `flags.newsletterEnabled` now, before any provider change? | **Yes** — independent, low risk, and the mechanism already exists |
| 3   | Stay on Brevo, or reconsider the provider?                         | Stay — the integration is sound; only the transport is wrong      |
| 4   | Is `PUBLIC_SITE_URL` set correctly for the current deployment?     | Must be verified before enabling                                  |

---

## Unrelated observation

The build emits a deprecation warning from this file:
`createServerFn().inputValidator()` is deprecated in favour of `.validator()`.
Pre-existing, harmless today, and worth folding into whichever change touches
this file next.
