import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  OWN_DELETE_WINDOW_MS,
  createArticleComment,
  hideCommentAsModerator,
  hideOwnArticleComment,
  readArticleComments,
  setCommentUpvote,
} from "../src/lib/comments.db";
import {
  commentRateKey,
  issueCommentToken,
  resetCommentRateLimits,
  validateAndCleanComment,
  verifyCommentToken,
  verifyModeratorKey,
  withinCommentPostLimit,
} from "../src/lib/comments.spam";
import type { D1Database } from "../src/lib/reactions.db";

const MIGRATION = fileURLToPath(
  new URL("../migrations/0003_article_comments.sql", import.meta.url),
);
const SLUG = "active-directory-tiering";
const VISITOR_A = "AAAAAAAAAAAAAAAAAAAAAA";
const VISITOR_B = "BBBBBBBBBBBBBBBBBBBBBB";
const SIGNING_INPUT = "unit-test-signing-material";

interface Bound {
  query: string;
  values: unknown[];
}

function testDb(): D1Database {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(MIGRATION, "utf8"));

  return {
    prepare(query: string) {
      return { bind: (...values: unknown[]): Bound => ({ query, values }) };
    },
    async batch(statements: Bound[]) {
      return statements.map(({ query, values }) => {
        if (/^\s*SELECT/i.test(query)) {
          return { results: sqlite.prepare(query).all(...(values as never[])) };
        }
        sqlite.prepare(query).run(...(values as never[]));
        return { results: [] };
      });
    },
  } as unknown as D1Database;
}

describe("article comments D1 storage", () => {
  it("stores top-level comments and 1-level replies without leaking visitor_id", async () => {
    const db = testDb();
    const t0 = 1_795_850_000_000;

    await createArticleComment(db, {
      id: "comment_parent_000001",
      slug: SLUG,
      parentId: null,
      visitorId: VISITOR_A,
      authorName: "Priya Nair",
      authorRole: "AD Architect",
      body: "Tier 0 PAWs reduced lateral movement paths across all 4 forests.",
      status: "published",
      nowMs: t0,
    });

    const state = await createArticleComment(db, {
      id: "comment_reply_0000001",
      slug: SLUG,
      parentId: "comment_parent_000001",
      visitorId: VISITOR_B,
      authorName: "Marcus Vance",
      authorRole: null,
      body: "Did you enforce smartcard-only interactive logon via GPO or AuthN silos?",
      status: "published",
      nowMs: t0 + 5_000,
    });

    expect(state.totalCount).toBe(2);
    expect(state.threads).toHaveLength(1);
    expect(state.threads[0]?.authorName).toBe("Priya Nair");
    expect(state.threads[0]?.canDelete).toBe(false);
    expect(state.threads[0]?.replies).toHaveLength(1);
    expect(state.threads[0]?.replies[0]?.authorName).toBe("Marcus Vance");
    expect(state.threads[0]?.replies[0]?.canDelete).toBe(true);
    expect(JSON.stringify(state)).not.toContain(VISITOR_A);
    expect(JSON.stringify(state)).not.toContain(VISITOR_B);
    expect(JSON.stringify(state)).not.toContain("visitor_id");
  });

  it("enforces strict 1-level nesting by ignoring replies targeted at another reply", async () => {
    const db = testDb();
    const t0 = 1_795_850_000_000;

    await createArticleComment(db, {
      id: "comment_parent_000001",
      slug: SLUG,
      parentId: null,
      visitorId: VISITOR_A,
      authorName: "Alice",
      authorRole: null,
      body: "Top-level parent comment.",
      status: "published",
      nowMs: t0,
    });

    await createArticleComment(db, {
      id: "comment_reply_0000001",
      slug: SLUG,
      parentId: "comment_parent_000001",
      visitorId: VISITOR_B,
      authorName: "Bob",
      authorRole: null,
      body: "First-level reply.",
      status: "published",
      nowMs: t0 + 1_000,
    });

    const afterNestedAttempt = await createArticleComment(db, {
      id: "comment_nested_000001",
      slug: SLUG,
      parentId: "comment_reply_0000001",
      visitorId: VISITOR_A,
      authorName: "Alice",
      authorRole: null,
      body: "Attempting second-level nesting.",
      status: "published",
      nowMs: t0 + 2_000,
    });

    expect(afterNestedAttempt.totalCount).toBe(2);
  });

  it("toggles helpful upvotes idempotently without double counting or negative totals", async () => {
    const db = testDb();
    const t0 = 1_795_850_000_000;

    await createArticleComment(db, {
      id: "comment_parent_000001",
      slug: SLUG,
      parentId: null,
      visitorId: VISITOR_A,
      authorName: "Alice",
      authorRole: null,
      body: "Helpful diagnostic note.",
      status: "published",
      nowMs: t0,
    });

    for (let i = 0; i < 5; i += 1) {
      await setCommentUpvote(db, SLUG, "comment_parent_000001", VISITOR_B, true, t0 + 1_000);
    }
    const upvoted = await readArticleComments(db, SLUG, VISITOR_B, t0 + 1_000);
    expect(upvoted.threads[0]?.upvotes).toBe(1);
    expect(upvoted.threads[0]?.upvotedByMe).toBe(true);

    for (let i = 0; i < 3; i += 1) {
      await setCommentUpvote(db, SLUG, "comment_parent_000001", VISITOR_B, false, t0 + 2_000);
    }
    const cleared = await readArticleComments(db, SLUG, VISITOR_B, t0 + 2_000);
    expect(cleared.threads[0]?.upvotes).toBe(0);
    expect(cleared.threads[0]?.upvotedByMe).toBe(false);
  });

  it("lets authors delete only their own recent comments within 24h, and lets moderators hide any", async () => {
    const db = testDb();
    const t0 = 1_795_850_000_000;

    await createArticleComment(db, {
      id: "comment_parent_000001",
      slug: SLUG,
      parentId: null,
      visitorId: VISITOR_A,
      authorName: "Alice",
      authorRole: null,
      body: "Comment posted by Alice.",
      status: "published",
      nowMs: t0,
    });

    // Visitor B cannot delete Alice's comment.
    const byWrongVisitor = await hideOwnArticleComment(
      db,
      SLUG,
      "comment_parent_000001",
      VISITOR_B,
      t0 + 10_000,
    );
    expect(byWrongVisitor.totalCount).toBe(1);

    // After 24h + 1s, Alice can no longer self-delete.
    const afterExpiry = await hideOwnArticleComment(
      db,
      SLUG,
      "comment_parent_000001",
      VISITOR_A,
      t0 + OWN_DELETE_WINDOW_MS + 1_000,
    );
    expect(afterExpiry.totalCount).toBe(1);

    // Within 24h, Alice can delete her own comment.
    const withinWindow = await hideOwnArticleComment(
      db,
      SLUG,
      "comment_parent_000001",
      VISITOR_A,
      t0 + 60_000,
    );
    expect(withinWindow.totalCount).toBe(0);

    // Moderator can hide any comment regardless of age or visitor.
    await createArticleComment(db, {
      id: "comment_spam_00000001",
      slug: SLUG,
      parentId: null,
      visitorId: VISITOR_B,
      authorName: "Spammer",
      authorRole: null,
      body: "Off-topic promotional text.",
      status: "published",
      nowMs: t0,
    });
    const modHidden = await hideCommentAsModerator(
      db,
      SLUG,
      "comment_spam_00000001",
      null,
      t0 + OWN_DELETE_WINDOW_MS * 10,
    );
    expect(modHidden.totalCount).toBe(0);
  });
});

describe("comment spam, link, token, and rate-limit guards", () => {
  beforeEach(() => resetCommentRateLimits());

  it("permits clean practitioner comments with up to 2 reference links", () => {
    const res = validateAndCleanComment({
      authorName: "  Rahul V.  ",
      authorRole: "  Cloud Architect ",
      body: "Confirmed on Windows Server 2025. See https://learn.microsoft.com/kb1 and https://ietf.org/rfc9110.",
    });
    expect(res).toEqual({
      ok: true,
      authorName: "Rahul V.",
      authorRole: "Cloud Architect",
      body: "Confirmed on Windows Server 2025. See https://learn.microsoft.com/kb1 and https://ietf.org/rfc9110.",
      autoHidden: false,
    });
  });

  it("rejects more than 2 links or domain names stuffed into display names", () => {
    const tooManyLinks = validateAndCleanComment({
      authorName: "Reader",
      body: "Links: https://a.example/1 https://b.example/2 https://c.example/3",
    });
    expect(tooManyLinks.ok).toBe(false);

    const domainInName = validateAndCleanComment({
      authorName: "BestSEO.com",
      body: "Great writeup on DNSSEC.",
    });
    expect(domainInName.ok).toBe(false);
  });

  it("auto-hides commercial bot spam and HTML/BBCode anchor injections", () => {
    const casino = validateAndCleanComment({
      authorName: "Bot",
      body: "Play online casino and slot gacor today for instant bonus!",
    });
    expect(casino).toMatchObject({ ok: true, autoHidden: true });

    const anchorSpam = validateAndCleanComment({
      authorName: "Bot",
      body: 'Check out <a href="https://spam.example">this tool</a>',
    });
    expect(anchorSpam).toMatchObject({ ok: true, autoHidden: true });
  });

  it("verifies signed timing tokens and moderator keys", async () => {
    const t0 = 1_795_850_000_000;
    const token = await issueCommentToken(SIGNING_INPUT, t0);

    expect(await verifyCommentToken(SIGNING_INPUT, token, t0 + 500)).toEqual({
      valid: false,
      reason: "too-fast",
    });
    expect(await verifyCommentToken(SIGNING_INPUT, token, t0 + 3_000)).toEqual({ valid: true });
    expect(await verifyCommentToken("other-signing-material", token, t0 + 3_000)).toEqual({
      valid: false,
      reason: "signature",
    });

    expect(await verifyModeratorKey("mod-material-123", "mod-material-123")).toBe(true);
    expect(await verifyModeratorKey("mod-material-123", "wrong")).toBe(false);
    expect(await verifyModeratorKey(null, "mod-material-123")).toBe(false);
  });

  it("enforces pseudonymous post rate limits", async () => {
    const key = await commentRateKey("198.51.100.77");
    expect(key).not.toContain("198.51.100.77");
    for (let i = 0; i < 5; i += 1) {
      expect(withinCommentPostLimit(key, 1_000)).toBe(true);
    }
    expect(withinCommentPostLimit(key, 1_000)).toBe(false);
  });

  it("runs zero disallowed operations at module import time", async () => {
    vi.resetModules();
    const disallowed = (op: string) => () => {
      throw new Error(`Disallowed global scope operation: ${op}`);
    };
    vi.stubGlobal("crypto", {
      ...globalThis.crypto,
      getRandomValues: disallowed("crypto.getRandomValues"),
      randomUUID: disallowed("crypto.randomUUID"),
      subtle: globalThis.crypto.subtle,
    });
    vi.stubGlobal("fetch", disallowed("fetch"));
    vi.stubGlobal("setTimeout", disallowed("setTimeout"));
    vi.stubGlobal("setInterval", disallowed("setInterval"));
    try {
      await expect(import("../src/lib/comments.spam")).resolves.toBeDefined();
      await expect(import("../src/lib/comments.db")).resolves.toBeDefined();
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });
});
