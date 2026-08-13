/**
 * Anti-abuse primitives for the newsletter form.
 *
 * Three independent layers, none of which requires a database:
 *
 *  1. A honeypot field that real people never see and never fill in.
 *  2. A signed, timestamped form token. The server mints it when a visitor
 *     first engages with the form, so a submission can be rejected if it
 *     arrives implausibly fast, arrives stale, or carries no valid signature
 *     at all. Signing means the timing cannot be forged from the client.
 *  3. A sliding-window rate limit keyed on a hash of the caller's IP.
 *
 * Everything here uses Web Crypto and plain data structures, so it runs
 * unchanged on Node and on Cloudflare Workers.
 */

/** Name of the decoy input. Plausible enough that bots fill it in. */
export const HONEYPOT_FIELD = "company";

/** A human cannot read the pitch, type an address and submit faster than this. */
const MIN_DWELL_MS = 2_000;

/** Tokens expire so a harvested one cannot be replayed indefinitely. */
const MAX_TOKEN_AGE_MS = 30 * 60_000;

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;

/**
 * Domains that exist to produce throwaway addresses. Subscribing them burns
 * sending reputation for a contact that will never read anything, so they are
 * refused at the door rather than passed to the mail provider.
 *
 * Deliberately short and conservative: a false positive costs a real reader.
 */
const DISPOSABLE_DOMAINS = new Set([
  "0-mail.com",
  "10minutemail.com",
  "20minutemail.com",
  "33mail.com",
  "discard.email",
  "dispostable.com",
  "fakeinbox.com",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "inboxbear.com",
  "mailbox52.gq",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "mohmal.com",
  "moakt.com",
  "sharklasers.com",
  "spam4.me",
  "temp-mail.org",
  "tempmail.com",
  "tempmailo.com",
  "tempr.email",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "yopmail.net",
]);

/* ------------------------------------------------------------------ */
/* Signed form token                                                   */
/* ------------------------------------------------------------------ */

const encoder = new TextEncoder();

async function sign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Length-independent comparison, so a bad signature leaks no timing signal. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Mint a token for a form that has just been engaged with.
 * The nonce only exists to make otherwise-identical tokens distinguishable.
 */
export async function issueFormToken(secret: string, now = Date.now()): Promise<string> {
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(9)));
  const payload = `${now}.${nonce}`;
  return `${payload}.${await sign(secret, payload)}`;
}

export type TokenVerdict =
  | { valid: true }
  /** Malformed, unsigned or expired — treat as a bot. */
  | { valid: false; reason: "malformed" | "signature" | "expired" }
  /** Signed correctly but submitted faster than a person could type. */
  | { valid: false; reason: "too-fast" };

export async function verifyFormToken(
  secret: string,
  token: string,
  now = Date.now(),
): Promise<TokenVerdict> {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };

  const [issuedAtRaw, nonce, signature] = parts as [string, string, string];
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) {
    return { valid: false, reason: "malformed" };
  }

  const expected = await sign(secret, `${issuedAtRaw}.${nonce}`);
  if (!safeEqual(signature, expected)) return { valid: false, reason: "signature" };

  const age = now - issuedAt;
  // A negative age means a clock skew or a hand-rolled timestamp.
  if (age < 0 || age > MAX_TOKEN_AGE_MS) return { valid: false, reason: "expired" };
  if (age < MIN_DWELL_MS) return { valid: false, reason: "too-fast" };

  return { valid: true };
}

/* ------------------------------------------------------------------ */
/* Rate limiting                                                       */
/* ------------------------------------------------------------------ */

const hits = new Map<string, number[]>();

/**
 * Sliding-window limiter.
 *
 * State lives in the isolate, so on a serverless platform the effective limit
 * is per-instance rather than global. That is enough to stop a single client
 * hammering the form; it is not a substitute for a shared store, which is the
 * upgrade path if the form is ever abused at scale.
 */
export function withinRateLimit(
  key: string,
  now = Date.now(),
  max = RATE_LIMIT_MAX,
  windowMs = RATE_LIMIT_WINDOW_MS,
): boolean {
  const cutoff = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((time) => time > cutoff);

  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 5_000) {
    for (const [entry, times] of hits) {
      if (times.every((time) => time <= cutoff)) hits.delete(entry);
    }
  }
  return true;
}

/** Test seam — the limiter is module state and would otherwise leak across cases. */
export function resetRateLimit(): void {
  hits.clear();
}

/* ------------------------------------------------------------------ */
/* Address hygiene                                                     */
/* ------------------------------------------------------------------ */

/** Lower-cases and trims. Local parts stay untouched: they are case-sensitive per RFC. */
export function normaliseEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return trimmed.toLowerCase();
  return `${trimmed.slice(0, at)}${trimmed.slice(at).toLowerCase()}`;
}

export function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1);
}

export function isDisposableDomain(domain: string): boolean {
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // Catch sub-domains of a blocked domain (mail.yopmail.com and friends).
  return [...DISPOSABLE_DOMAINS].some((blocked) => domain.endsWith(`.${blocked}`));
}

/**
 * Structural checks the `email` format alone does not make: a dotted domain,
 * a TLD that looks like a TLD, and no consecutive dots.
 */
export function hasDeliverableShape(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain.includes(".") || domain.includes("..")) return false;
  if (domain.startsWith("-") || domain.endsWith("-") || domain.endsWith(".")) return false;
  const tld = domain.slice(domain.lastIndexOf(".") + 1);
  return /^[a-z]{2,24}$/.test(tld);
}

/** Stable pseudonymous rate-limit key. The raw IP is never stored or logged. */
export async function ipKey(ip: string, secret: string): Promise<string> {
  return (await sign(secret, `ratelimit:${ip}`)).slice(0, 22);
}
