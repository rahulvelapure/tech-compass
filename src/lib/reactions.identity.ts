/**
 * Anonymous reader identity and abuse limits for article reactions.
 *
 * The site has no accounts, and reacting to an article is not worth
 * introducing them for. A reader is identified only by an opaque random id
 * held in a cookie — no email, no name, no profile, and nothing derived from
 * their IP address or user agent. The id means one thing and can be used for
 * one thing: "this browser already reacted to this article".
 *
 * Three properties protect it:
 *
 *  - httpOnly, so page scripts can neither read it nor rewrite it.
 *  - HMAC-signed, so a value this server did not issue is rejected outright
 *    rather than becoming a new row in the votes table.
 *  - Secure and SameSite=Lax, so it stays on our own origin over TLS.
 *
 * Signing uses the project's shared primitives (see hmac.ts), the same ones
 * the newsletter form's token uses.
 */

import { safeEqual, sign, toBase64Url } from "./hmac";

/** Short and unbranded. It is a reader identifier, not a session. */
export const VISITOR_COOKIE = "tc_reader";

/**
 * Roughly thirteen months.
 *
 * Long enough that a returning reader still sees the reaction they left, short
 * enough that a browser which never comes back is not carrying the id forever.
 */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

/** 16 random bytes, base64url encoded — 22 characters, no padding. */
const RAW_ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;

/**
 * Signing secret.
 *
 * A dedicated variable is preferred, but falling back to the newsletter's form
 * secret means the protection is never silently off just because one variable
 * was missed on a deployment that already has one. Returns null when nothing is
 * configured, which withdraws the feature rather than issuing cookies that
 * cannot be verified.
 */
export function reactionSecret(): string | null {
  return (
    process.env["REACTIONS_COOKIE_SECRET"] ||
    process.env["NEWSLETTER_FORM_SECRET"] ||
    process.env["BREVO_API_KEY"] ||
    null
  );
}

/**
 * Mint a signed identifier: 22 random characters, a dot, and the signature.
 *
 * The random half is the identity; the signature only proves we issued it.
 * Nothing about the reader is encoded in either half.
 */
export async function issueVisitorId(secret: string): Promise<string> {
  const raw = toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  return `${raw}.${await sign(secret, `visitor:${raw}`)}`;
}

/**
 * Verify a cookie and return the identifier it carries, or null.
 *
 * Null means "treat this caller as having no identity" — the caller mints a
 * fresh one rather than trusting the value. A forged, truncated, re-signed or
 * hand-edited cookie therefore buys nothing: it does not select somebody
 * else's vote row, and it does not create one of its own.
 */
export async function readVisitorId(
  secret: string,
  cookie: string | undefined,
): Promise<string | null> {
  if (typeof cookie !== "string") return null;

  const parts = cookie.split(".");
  if (parts.length !== 2) return null;

  const [raw, signature] = parts as [string, string];
  // Checked before the HMAC so an oversized value never reaches the hash, and
  // so the id that may reach SQL is always exactly the shape we expect.
  if (!RAW_ID_PATTERN.test(raw)) return null;

  const expected = await sign(secret, `visitor:${raw}`);
  return safeEqual(signature, expected) ? raw : null;
}

/**
 * Cookie attributes.
 *
 * `sameSite: "lax"` because reactions are only ever triggered by a click on our
 * own page; there is no cross-site flow to support, and Lax keeps the cookie
 * off third-party requests. Combined with the CSRF middleware in start.ts, a
 * reaction cannot be driven from another origin.
 *
 * `secure` is disabled outside production only because http://localhost would
 * otherwise never receive the cookie and the feature could not be exercised
 * locally at all. Every deployed environment sets it.
 */
export const VISITOR_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env["NODE_ENV"] === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE_SECONDS,
} as const;

/* ------------------------------------------------------------------ */
/* Rate limiting                                                       */
/* ------------------------------------------------------------------ */

/**
 * Reactions get their own limiter, deliberately not the newsletter's.
 *
 * newsletter.spam.ts keeps its counters in one module-level map keyed by a hash
 * of the IP. Sharing it would put reactions and subscriptions in the same
 * budget, so a reader who reacted to a handful of articles would find the
 * newsletter form telling them to come back later. Separate map, separate
 * allowance.
 *
 * This is also what stops the obvious way around the cookie: clearing it yields
 * a fresh identity, but the requests still come from one address, and the limit
 * is applied there.
 */
const hits = new Map<string, number[]>();

/** Generous: a reader may work through several articles in one sitting. */
const MAX_REACTIONS = 30;
const WINDOW_MS = 10 * 60_000;

/**
 * Per-isolate salt for hashing IPs.
 *
 * The limiter's state lives in this isolate and dies with it, so the key only
 * needs to be stable for that long — which means it can be generated rather
 * than configured. The raw IP is never stored, never logged and never leaves
 * this function: what goes into the map is a truncated HMAC, and the salt that
 * produced it is gone when the isolate recycles.
 *
 * ---------------------------------------------------------------------------
 * Generated on first use, never at module load.
 *
 * Cloudflare Workers forbids generating random values in global scope — a
 * module-level `crypto.getRandomValues()` throws "Disallowed operation called
 * within global scope" when the isolate first imports this file, which takes
 * the whole reactions endpoint down before any handler runs. The value is
 * still per-isolate and still generated exactly once; it is simply created
 * inside the first request that needs it.
 * ---------------------------------------------------------------------------
 */
let ipSalt: string | undefined;

function requestScopedIpSalt(): string {
  ipSalt ??= toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  return ipSalt;
}

/** Pseudonymous rate-limit key. The raw address is not retained. */
export async function reactionRateKey(ip: string): Promise<string> {
  return (await sign(requestScopedIpSalt(), `reaction:${ip}`)).slice(0, 22);
}

/**
 * Sliding window, per isolate.
 *
 * Same trade-off the newsletter documents: on a serverless platform this is a
 * per-instance limit rather than a global one. It stops one client hammering
 * the endpoint, which is the realistic abuse here. A distributed limit would
 * need shared state, and reactions are not worth that.
 */
export function withinReactionLimit(key: string, now = Date.now()): boolean {
  const cutoff = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((time) => time > cutoff);

  if (recent.length >= MAX_REACTIONS) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5_000) {
    for (const [entry, times] of hits) {
      if (times.every((time) => time <= cutoff)) hits.delete(entry);
    }
  }
  return true;
}

/** Test seam — module state would otherwise leak between cases. */
export function resetReactionLimit(): void {
  hits.clear();
}
