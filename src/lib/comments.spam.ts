/**
 * Anti-spam, link hygiene, signed form tokens, and rate limiting for native
 * article comments.
 *
 * Uses Web Crypto and lazy request-scoped state so importing this module never
 * triggers disallowed global-scope random or timer operations on Cloudflare
 * Workers.
 */

import { safeEqual, sign, toBase64Url } from "./hmac";

/** Hidden decoy field. Filled by automated form-stuffing bots, never by humans. */
export const COMMENT_HONEYPOT_FIELD = "website";

/** Minimum human dwell time between opening the page/token and posting. */
const MIN_DWELL_MS = 1_800;

/** Form tokens stay valid for an hour of reading an article before expiring. */
const MAX_TOKEN_AGE_MS = 60 * 60_000;

/** Up to 5 comments per 10 minutes per hashed IP. */
const POST_LIMIT_MAX = 5;
const POST_LIMIT_WINDOW_MS = 10 * 60_000;

/** Up to 40 comment upvotes or deletions per 10 minutes per hashed IP. */
const ACTION_LIMIT_MAX = 40;
const ACTION_LIMIT_WINDOW_MS = 10 * 60_000;

/** Maximum URLs permitted in a single comment body. */
export const MAX_COMMENT_LINKS = 2;

/* ------------------------------------------------------------------ */
/* Signed form timing token                                            */
/* ------------------------------------------------------------------ */

export async function issueCommentToken(secret: string, now = Date.now()): Promise<string> {
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(9)));
  const payload = `comment:${now}.${nonce}`;
  return `${now}.${nonce}.${await sign(secret, payload)}`;
}

export type CommentTokenVerdict =
  { valid: true } | { valid: false; reason: "malformed" | "signature" | "expired" | "too-fast" };

export async function verifyCommentToken(
  secret: string,
  token: string,
  now = Date.now(),
): Promise<CommentTokenVerdict> {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };

  const [issuedAtRaw, nonce, signature] = parts as [string, string, string];
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0 || !nonce) {
    return { valid: false, reason: "malformed" };
  }

  const expected = await sign(secret, `comment:${issuedAtRaw}.${nonce}`);
  if (!safeEqual(signature, expected)) return { valid: false, reason: "signature" };

  const age = now - issuedAt;
  if (age < 0 || age > MAX_TOKEN_AGE_MS) return { valid: false, reason: "expired" };
  if (age < MIN_DWELL_MS) return { valid: false, reason: "too-fast" };

  return { valid: true };
}

/* ------------------------------------------------------------------ */
/* Pseudonymous per-isolate rate limiting                              */
/* ------------------------------------------------------------------ */

const postHits = new Map<string, number[]>();
const actionHits = new Map<string, number[]>();
let ipSalt: string | undefined;

function requestScopedIpSalt(): string {
  ipSalt ??= toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  return ipSalt;
}

export async function commentRateKey(ip: string): Promise<string> {
  return (await sign(requestScopedIpSalt(), `comment:${ip}`)).slice(0, 22);
}

function slideWindow(
  store: Map<string, number[]>,
  key: string,
  max: number,
  windowMs: number,
  now: number,
): boolean {
  const cutoff = now - windowMs;
  const recent = (store.get(key) ?? []).filter((time) => time > cutoff);

  if (recent.length >= max) {
    store.set(key, recent);
    return false;
  }

  recent.push(now);
  store.set(key, recent);

  if (store.size > 5_000) {
    for (const [entry, times] of store) {
      if (times.every((time) => time <= cutoff)) store.delete(entry);
    }
  }
  return true;
}

export function withinCommentPostLimit(key: string, now = Date.now()): boolean {
  return slideWindow(postHits, key, POST_LIMIT_MAX, POST_LIMIT_WINDOW_MS, now);
}

export function withinCommentActionLimit(key: string, now = Date.now()): boolean {
  return slideWindow(actionHits, key, ACTION_LIMIT_MAX, ACTION_LIMIT_WINDOW_MS, now);
}

export function resetCommentRateLimits(): void {
  postHits.clear();
  actionHits.clear();
}

/* ------------------------------------------------------------------ */
/* Content hygiene & automatic spam detection                          */
/* ------------------------------------------------------------------ */

const URL_MATCHER = /https?:\/\/[^\s<>()]+|\bwww\.[^\s<>()]+/gi;
const NAME_LINK_MATCHER = /https?:\/\/|\bwww\.|\.(?:com|net|org|io|co|ru|xyz|top|info|biz|shop)\b/i;
const MARKUP_SPAM_MATCHER = /<\s*a\s+href\s*=|<\s*script\b|\[url\s*=|\[link\s*=/i;
const REPEATED_CHAR_MATCHER = /(.)\1{15,}/;

/**
 * High-precision commercial spam phrases that never appear in genuine enterprise
 * IT, security, networking, or software engineering commentary. Matched comments
 * are silently stored as `hidden` so spam bots do not adapt and retry.
 */
const BOT_SPAM_PHRASES = [
  /\b(?:online\s+casino|slot\s+gacor|poker\s+online|sports\s+betting)\b/i,
  /\b(?:buy\s+backlinks|cheap\s+seo\s+services|guest\s+post\s+service)\b/i,
  /\b(?:crypto\s+giveaway|double\s+your\s+bitcoin|whatsapp\s+recovery\s+expert)\b/i,
  /\b(?:buy\s+viagra|cialis\s+online|keto\s+gummies)\b/i,
];

function stripControlChars(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    const isAllowed =
      code === 0x09 || code === 0x0a || code === 0x0d || (code >= 0x20 && code !== 0x7f);
    if (isAllowed) out += input[i];
  }
  return out;
}

function cleanSingleLine(input: string): string {
  return stripControlChars(input).replace(/\s+/g, " ").trim();
}

function cleanBody(input: string): string {
  return stripControlChars(input)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type CommentValidationResult =
  | {
      ok: true;
      authorName: string;
      authorRole: string | null;
      body: string;
      autoHidden: boolean;
    }
  | {
      ok: false;
      message: string;
    };

export function validateAndCleanComment(input: {
  authorName: string;
  authorRole?: string | null | undefined;
  body: string;
}): CommentValidationResult {
  const authorName = cleanSingleLine(input.authorName);
  const rawRole = input.authorRole ? cleanSingleLine(input.authorRole) : "";
  const authorRole = rawRole.length > 0 ? rawRole : null;
  const body = cleanBody(input.body);

  if (authorName.length < 2) {
    return { ok: false, message: "Enter a display name of at least 2 characters." };
  }
  if (authorName.length > 48) {
    return { ok: false, message: "Display name must be 48 characters or fewer." };
  }
  if (NAME_LINK_MATCHER.test(authorName)) {
    return { ok: false, message: "Display name cannot contain links or domain names." };
  }

  if (authorRole && authorRole.length > 48) {
    return { ok: false, message: "Role must be 48 characters or fewer." };
  }
  if (authorRole && NAME_LINK_MATCHER.test(authorRole)) {
    return { ok: false, message: "Role cannot contain links or domain names." };
  }

  if (body.length < 4) {
    return { ok: false, message: "Write a slightly longer comment before posting." };
  }
  if (body.length > 2_000) {
    return { ok: false, message: "Comments are limited to 2,000 characters." };
  }

  const links = body.match(URL_MATCHER) ?? [];
  if (links.length > MAX_COMMENT_LINKS) {
    return {
      ok: false,
      message: `To prevent link spam, comments may include at most ${MAX_COMMENT_LINKS} links.`,
    };
  }

  if (REPEATED_CHAR_MATCHER.test(body)) {
    return { ok: false, message: "Remove repeated character sequences and try again." };
  }

  const autoHidden =
    MARKUP_SPAM_MATCHER.test(body) || BOT_SPAM_PHRASES.some((pattern) => pattern.test(body));

  return {
    ok: true,
    authorName,
    authorRole,
    body,
    autoHidden,
  };
}

/** Constant-time check for an optional site-owner moderation key. */
export async function verifyModeratorKey(
  configuredKey: string | null,
  suppliedKey: string | undefined,
): Promise<boolean> {
  if (!configuredKey || !suppliedKey) return false;
  const [expected, actual] = await Promise.all([
    sign(configuredKey, "moderator-verify"),
    sign(suppliedKey, "moderator-verify"),
  ]);
  return safeEqual(expected, actual);
}
