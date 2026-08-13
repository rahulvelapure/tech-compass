import { beforeEach, describe, expect, it } from "vitest";

import {
  emailDomain,
  hasDeliverableShape,
  ipKey,
  isDisposableDomain,
  issueFormToken,
  normaliseEmail,
  resetRateLimit,
  verifyFormToken,
  withinRateLimit,
} from "@/lib/newsletter.spam";

// scan-secrets-allow — fixture value, never used outside this file.
const SECRET = "test-secret-not-used-anywhere-real";

describe("form token", () => {
  it("accepts a token submitted after a plausible dwell time", async () => {
    const now = Date.now();
    const token = await issueFormToken(SECRET, now);
    await expect(verifyFormToken(SECRET, token, now + 5_000)).resolves.toEqual({
      valid: true,
    });
  });

  it("rejects a submission that arrives faster than a person could type", async () => {
    const now = Date.now();
    const token = await issueFormToken(SECRET, now);
    await expect(verifyFormToken(SECRET, token, now + 200)).resolves.toEqual({
      valid: false,
      reason: "too-fast",
    });
  });

  it("rejects a stale token", async () => {
    const now = Date.now();
    const token = await issueFormToken(SECRET, now);
    await expect(verifyFormToken(SECRET, token, now + 60 * 60_000)).resolves.toEqual({
      valid: false,
      reason: "expired",
    });
  });

  it("rejects a token signed with a different secret", async () => {
    const now = Date.now();
    const token = await issueFormToken("some-other-secret", now);
    await expect(verifyFormToken(SECRET, token, now + 5_000)).resolves.toEqual({
      valid: false,
      reason: "signature",
    });
  });

  it("rejects a forged timestamp — the whole point of signing it", async () => {
    const now = Date.now();
    const token = await issueFormToken(SECRET, now);
    const [, nonce, signature] = token.split(".");
    // Backdate the payload so the dwell check would pass, keeping the signature.
    const forged = `${now - 10_000}.${nonce}.${signature}`;
    await expect(verifyFormToken(SECRET, forged, now)).resolves.toEqual({
      valid: false,
      reason: "signature",
    });
  });

  it.each(["", "nonsense", "a.b", "1.2.3.4"])("rejects the malformed token %j", async (token) => {
    const result = await verifyFormToken(SECRET, token, Date.now());
    expect(result.valid).toBe(false);
  });

  it("issues a distinct token each time", async () => {
    const now = Date.now();
    const a = await issueFormToken(SECRET, now);
    const b = await issueFormToken(SECRET, now);
    expect(a).not.toEqual(b);
  });
});

describe("rate limit", () => {
  beforeEach(resetRateLimit);

  it("allows a burst up to the limit and then refuses", () => {
    const now = Date.now();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(withinRateLimit("caller", now)).toBe(true);
    }
    expect(withinRateLimit("caller", now)).toBe(false);
  });

  it("recovers once the window has passed", () => {
    const now = Date.now();
    for (let attempt = 0; attempt < 5; attempt += 1) withinRateLimit("caller", now);
    expect(withinRateLimit("caller", now)).toBe(false);
    expect(withinRateLimit("caller", now + 11 * 60_000)).toBe(true);
  });

  it("tracks callers independently", () => {
    const now = Date.now();
    for (let attempt = 0; attempt < 5; attempt += 1) withinRateLimit("first", now);
    expect(withinRateLimit("first", now)).toBe(false);
    expect(withinRateLimit("second", now)).toBe(true);
  });

  it("derives a stable key that does not contain the raw address", async () => {
    const key = await ipKey("203.0.113.7", SECRET);
    expect(key).toEqual(await ipKey("203.0.113.7", SECRET));
    expect(key).not.toContain("203.0.113.7");
    expect(key).not.toEqual(await ipKey("203.0.113.8", SECRET));
  });
});

describe("address hygiene", () => {
  it("lower-cases the domain but leaves the local part alone", () => {
    expect(normaliseEmail("  Reader.Name@Example.COM ")).toBe("Reader.Name@example.com");
  });

  it("extracts the domain", () => {
    expect(emailDomain("reader@mail.example.com")).toBe("mail.example.com");
  });

  it.each(["reader@example.com", "reader@mail.example.co.uk", "reader+tag@example.io"])(
    "accepts %s",
    (email) => {
      expect(hasDeliverableShape(email)).toBe(true);
    },
  );

  it.each([
    "reader@localhost",
    "reader@example",
    "reader@example..com",
    "reader@example.c",
    "reader@example.123",
    // scan-secrets-allow — deliberately malformed fixture, not a real address.
    "reader@-example.com",
  ])("rejects the undeliverable shape %s", (email) => {
    expect(hasDeliverableShape(email)).toBe(false);
  });

  it("blocks known disposable domains and their subdomains", () => {
    expect(isDisposableDomain("mailinator.com")).toBe(true);
    expect(isDisposableDomain("mail.yopmail.com")).toBe(true);
  });

  it("does not block ordinary providers", () => {
    for (const domain of ["gmail.com", "outlook.com", "protonmail.com", "example.co.in"]) {
      expect(isDisposableDomain(domain), domain).toBe(false);
    }
  });
});
