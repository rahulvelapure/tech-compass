import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { articles } from "../src/content/articles";
import { allArticles, articlePath } from "../src/lib/content";
import {
  applyReaction,
  readReactionState,
  type D1Database,
} from "../src/lib/reactions.db";
import {
  VISITOR_COOKIE_OPTIONS,
  issueVisitorId,
  readVisitorId,
  reactionRateKey,
  resetReactionLimit,
  withinReactionLimit,
} from "../src/lib/reactions.identity";
import { derivedLikeCount, seededLikeCount } from "../src/lib/reactions.seed";

const MIGRATION = fileURLToPath(
  new URL("../migrations/0001_article_reactions.sql", import.meta.url),
);
const SLUG = "test-article";
const READER = "AAAAAAAAAAAAAAAAAAAAAA";
const OTHER = "BBBBBBBBBBBBBBBBBBBBBB";
const SIGNING_INPUT = "unit-test-signing-material";

interface Bound {
  query: string;
  values: unknown[];
}

type TestDb = D1Database & {
  likes(slug: string): number;
  dislikes(slug: string): number;
  voteRows(): { slug: string; visitor_id: string; reaction: string }[];
};

function testDb(): TestDb {
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
    likes(slug: string) {
      const row = sqlite
        .prepare("SELECT genuine_likes AS n FROM article_reaction_totals WHERE slug = ?")
        .get(slug) as { n: number } | undefined;
      return row?.n ?? 0;
    },
    dislikes(slug: string) {
      const row = sqlite
        .prepare("SELECT genuine_dislikes AS n FROM article_reaction_totals WHERE slug = ?")
        .get(slug) as { n: number } | undefined;
      return row?.n ?? 0;
    },
    voteRows() {
      return sqlite.prepare("SELECT * FROM article_reaction_votes").all() as never;
    },
  } as unknown as TestDb;
}

let sourceCache: { file: string; source: string }[] | undefined;
const SRC = fileURLToPath(new URL("../src", import.meta.url));

function sourceFilesWithContents(): { file: string; source: string }[] {
  sourceCache ??= readdirSync(SRC, { recursive: true, encoding: "utf8" })
    .filter((entry) => /\.(ts|tsx)$/.test(entry))
    .map((entry) => `${SRC}/${entry}`.replace(/\\/g, "/"))
    .map((file) => ({ file, source: readFileSync(file, "utf8") }));
  return sourceCache;
}

function relative(file: string): string {
  return `src/${file.replace(/\\/g, "/").split("/src/")[1]}`;
}

describe("reaction counters", () => {
  it("starts with no genuine reactions", async () => {
    const db = testDb();
    expect(await readReactionState(db, SLUG, READER)).toEqual({ genuineLikes: 0, mine: null });
  });

  it("adds one like", async () => {
    const db = testDb();
    expect(await applyReaction(db, SLUG, READER, "like")).toEqual({ genuineLikes: 1, mine: "like" });
    expect(db.dislikes(SLUG)).toBe(0);
  });

  it("removes a like", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    expect(await applyReaction(db, SLUG, READER, null)).toEqual({ genuineLikes: 0, mine: null });
  });

  it("switches like to dislike without leaving the like behind", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    expect(await applyReaction(db, SLUG, READER, "dislike")).toEqual({ genuineLikes: 0, mine: "dislike" });
    expect(db.likes(SLUG)).toBe(0);
    expect(db.dislikes(SLUG)).toBe(1);
  });

  it("switches dislike to like without leaving the dislike behind", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "dislike");
    expect(await applyReaction(db, SLUG, READER, "like")).toEqual({ genuineLikes: 1, mine: "like" });
    expect(db.dislikes(SLUG)).toBe(0);
  });

  it("cannot inflate the same reaction", async () => {
    const db = testDb();
    for (let i = 0; i < 12; i += 1) await applyReaction(db, SLUG, READER, "like");
    expect(db.likes(SLUG)).toBe(1);
  });

  it("keeps one vote per visitor and article", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    await applyReaction(db, SLUG, READER, "dislike");
    await applyReaction(db, SLUG, READER, "like");
    expect(db.voteRows().filter((r) => r.slug === SLUG && r.visitor_id === READER)).toHaveLength(1);
  });

  it("separates different visitors and articles", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    await applyReaction(db, SLUG, OTHER, "like");
    await applyReaction(db, "article-two", READER, "like");
    expect(db.likes(SLUG)).toBe(2);
    expect(db.likes("article-two")).toBe(1);
  });

  it("never lets counters go negative", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, null);
    expect(db.likes(SLUG)).toBe(0);
    expect(db.dislikes(SLUG)).toBe(0);
  });
});

describe("reaction state and privacy", () => {
  it("restores the reader's own reaction", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "dislike");
    expect(await readReactionState(db, SLUG, READER)).toEqual({ genuineLikes: 0, mine: "dislike" });
  });

  it("does not expose a dislike count", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "dislike");
    const state = await readReactionState(db, SLUG, READER);
    expect(Object.keys(state).sort()).toEqual(["genuineLikes", "mine"]);
    expect(JSON.stringify(state)).not.toMatch(/dislike[Cc]ount|genuine_dislikes/);
  });

  it("keeps the private dislike counter out of source consumers", () => {
    const offenders = sourceFilesWithContents()
      .filter(({ source }) => /genuine_dislikes|genuineDislikes|dislikeTotal|dislikeCount/.test(source))
      .map(({ file }) => file);
    expect(offenders.map(relative)).toEqual(["src/lib/reactions.db.ts"]);
  }, 30_000);
});

describe("visitor identity", () => {
  it("issues and validates a signed opaque identifier", async () => {
    const cookie = await issueVisitorId(SIGNING_INPUT);
    expect(cookie).toMatch(/^[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]+$/);
    expect(await readVisitorId(SIGNING_INPUT, cookie)).toBe(cookie.split(".")[0]);
  });

  it("rejects unsigned, foreign and tampered identifiers", async () => {
    const cookie = await issueVisitorId(SIGNING_INPUT);
    const [raw, signature] = cookie.split(".") as [string, string];
    const tampered = `${raw.slice(0, 21)}${raw[21] === "A" ? "B" : "A"}.${signature}`;
    expect(await readVisitorId(SIGNING_INPUT, "AAAAAAAAAAAAAAAAAAAAAA")).toBeNull();
    expect(await readVisitorId(SIGNING_INPUT, await issueVisitorId("other-secret"))).toBeNull();
    expect(await readVisitorId(SIGNING_INPUT, tampered)).toBeNull();
  });

  it("uses an httpOnly lax cookie", () => {
    expect(VISITOR_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(VISITOR_COOKIE_OPTIONS.sameSite).toBe("lax");
    expect(VISITOR_COOKIE_OPTIONS.path).toBe("/");
  });
});

describe("reaction rate limiting", () => {
  beforeEach(() => resetReactionLimit());

  it("allows 30 requests and blocks the next one for the same key", () => {
    for (let i = 0; i < 30; i += 1) expect(withinReactionLimit("key")).toBe(true);
    expect(withinReactionLimit("key")).toBe(false);
  });

  it("isolates different keys and lets the window slide", () => {
    for (let i = 0; i < 30; i += 1) withinReactionLimit("noisy");
    expect(withinReactionLimit("quiet")).toBe(true);
    const start = Date.now();
    for (let i = 0; i < 30; i += 1) withinReactionLimit("old", start);
    expect(withinReactionLimit("old", start + 10 * 60_000 + 1)).toBe(true);
  });

  it("does not expose the raw IP in the rate key", async () => {
    const key = await reactionRateKey("203.0.113.42");
    expect(key).toHaveLength(22);
    expect(key).not.toContain("203.0.113.42");
  });
});

describe("seeded like baselines", () => {
  it("are deterministic, bounded, and distinct", () => {
    const values = articles.map((article) => seededLikeCount(article.slug));
    expect(new Set(values).size).toBe(values.length);
    for (const article of articles) {
      const value = seededLikeCount(article.slug);
      expect(value).toBeGreaterThanOrEqual(1_500);
      expect(value).toBeLessThanOrEqual(2_500);
      expect(value).toBe(derivedLikeCount(article.slug));
    }
  });
});

describe("clipboard policy", () => {
  it("contains no clipboard API or copy-link implementation", () => {
    const forbidden = /navigator\.clipboard|\bwriteText\b|\breadText\b|\bClipboardItem\b|execCommand\s*\(|onCopy|onCut|copyToClipboard|["'`]Copy link|["'`]Copy code/;
    const offenders = sourceFilesWithContents()
      .filter(({ source }) => forbidden.test(source))
      .map(({ file }) => file);
    expect(offenders.map(relative)).toEqual([]);
  }, 30_000);
});

describe("current published article inventory", () => {
  it("contains no duplicate published paths", () => {
    const paths = allArticles.map(articlePath);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("keeps draft articles out of the published inventory", () => {
    expect(allArticles.every((article) => !article.draft)).toBe(true);
    expect(articles.length).toBeGreaterThanOrEqual(allArticles.length);
  });
});

describe("nothing in the reaction modules runs at import time", () => {
  it("imports cleanly when random, fetch, and timers are forbidden", async () => {
    vi.resetModules();
    const disallowed = (operation: string) => () => {
      throw new Error(`Disallowed operation called within global scope: ${operation}`);
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
      await expect(import("../src/lib/reactions.identity")).resolves.toBeDefined();
      await expect(import("../src/lib/reactions.db")).resolves.toBeDefined();
      await expect(import("../src/lib/reactions.seed")).resolves.toBeDefined();
      await expect(import("../src/lib/hmac")).resolves.toBeDefined();
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });
});
