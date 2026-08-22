/**
 * Shared HMAC primitives.
 *
 * Extracted verbatim from newsletter.spam.ts, which was their only consumer
 * until article reactions needed to sign a cookie. Two independent copies of
 * signing and constant-time comparison in one codebase is the kind of
 * duplication that ends with one of them quietly losing a property the other
 * kept, so there is one implementation and both features import it.
 *
 * Behaviour is unchanged: same algorithm, same encoding, same comparison. The
 * newsletter's anti-spam tests cover it from the other side.
 *
 * Everything here uses Web Crypto and plain data structures, so it runs
 * unchanged on Node and on Cloudflare Workers.
 */

const encoder = new TextEncoder();

/** HMAC-SHA-256, returned base64url encoded. */
export async function sign(secret: string, message: string): Promise<string> {
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

export function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Length-independent comparison, so a bad signature leaks no timing signal. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
