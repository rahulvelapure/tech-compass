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
  type Reaction,
} from "../src/lib/reactions.db";
import {
  VISITOR_COOKIE_OPTIONS,
  issueVisitorId,
  readVisitorId,
  reactionRateKey,
  resetReactionLimit,
  withinReactionLimit,
} from "../src/lib/reactions.identity";
import { seededLikeCount } from "../src/lib/reactions.seed";

/**
 * Article reactions.
 *
 * The counter statements are the part worth testing properly, so these run the
 * real SQL — the actual migration file and the actual queries — against an
 * in-memory SQLite rather than a mock that records calls. A mock would happily
 * confirm that four statements were issued while the arithmetic was wrong.
 */

const MIGRATION = fileURLToPath(
  new URL("../migrations/0001_article_reactions.sql", import.meta.url),
);

/** A bound statement, as this fake passes it from `prepare().bind()` to `batch()`. */
interface Bound {
  query: string;
  values: unknown[];
}

type TestDb = D1Database & {
  likes(slug: string): number;
  dislikes(slug: string): number;
  voteRows(): { slug: string; visitor_id: string; reaction: string }[];
};

/** Enough of D1's surface for the storage layer, backed by real SQLite. */
function testDb(): TestDb {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(MIGRATION, "utf8"));

  const fake = {
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
    /**
     * Reads the private counter directly out of storage. This is the only place
     * in the codebase that looks at it, and it is a test — nothing on a request
     * path returns this number.
     */
    dislikes(slug: string) {
      const row = sqlite
        .prepare("SELECT genuine_dislikes AS n FROM article_reaction_totals WHERE slug = ?")
        .get(slug) as { n: number } | undefined;
      return row?.n ?? 0;
    },
    voteRows() {
      return sqlite.prepare("SELECT * FROM article_reaction_votes").all() as never;
    },
  };

  return fake as unknown as TestDb;
}

const SLUG = "test-article";
const READER = "AAAAAAAAAAAAAAAAAAAAAA";
const OTHER = "BBBBBBBBBBBBBBBBBBBBBB";
/** Keying material for the signature tests. Not a credential: nothing reads it. */
const SIGNING_INPUT = "unit-test-signing-material";

/* ================================================================== */
/* 6-9, 11: counting                                                   */
/* ================================================================== */

describe("reaction counters", () => {
  it("starts an article at no genuine reactions", async () => {
    const db = testDb();
    expect(await readReactionState(db, SLUG, READER)).toEqual({ genuineLikes: 0, mine: null });
  });

  it("a genuine like increases the total", async () => {
    const db = testDb();
    const state = await applyReaction(db, SLUG, READER, "like");
    expect(state).toEqual({ genuineLikes: 1, mine: "like" });
    expect(db.dislikes(SLUG)).toBe(0);
  });

  it("unliking decreases the total again", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    const state = await applyReaction(db, SLUG, READER, null);

    expect(state).toEqual({ genuineLikes: 0, mine: null });
    expect(db.dislikes(SLUG)).toBe(0);
  });

  it("switches like to dislike without leaving the like behind", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    const state = await applyReaction(db, SLUG, READER, "dislike");

    expect(state).toEqual({ genuineLikes: 0, mine: "dislike" });
    expect(db.likes(SLUG)).toBe(0);
    expect(db.dislikes(SLUG)).toBe(1);
  });

  it("switches dislike to like without leaving the dislike behind", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "dislike");
    const state = await applyReaction(db, SLUG, READER, "like");

    expect(state).toEqual({ genuineLikes: 1, mine: "like" });
    expect(db.likes(SLUG)).toBe(1);
    expect(db.dislikes(SLUG)).toBe(0);
  });

  it("cannot be inflated by repeating the same like", async () => {
    const db = testDb();
    for (let i = 0; i < 12; i += 1) await applyReaction(db, SLUG, READER, "like");
    expect(db.likes(SLUG)).toBe(1);
  });

  it("holds at most one vote per visitor per article", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    await applyReaction(db, SLUG, READER, "dislike");
    await applyReaction(db, SLUG, READER, "like");

    const rows = db.voteRows().filter((r) => r.slug === SLUG && r.visitor_id === READER);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.reaction).toBe("like");
  });

  it("counts different readers separately", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    const state = await applyReaction(db, SLUG, OTHER, "like");
    expect(state.genuineLikes).toBe(2);
  });

  it("never lets a counter go negative", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, null);
    await applyReaction(db, SLUG, READER, null);
    expect(db.likes(SLUG)).toBe(0);
    expect(db.dislikes(SLUG)).toBe(0);
  });

  it("keeps each article's reactions separate", async () => {
    const db = testDb();
    await applyReaction(db, "article-one", READER, "like");
    await applyReaction(db, "article-two", READER, "like");

    expect(db.likes("article-one")).toBe(1);
    expect(db.likes("article-two")).toBe(1);
  });

  it("records dislikes internally even though they are never published", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "dislike");
    await applyReaction(db, SLUG, OTHER, "dislike");
    expect(db.dislikes(SLUG)).toBe(2);
  });
});

/* ================================================================== */
/* 12: refresh preserves state                                         */
/* ================================================================== */

describe("reaction state survives a refresh", () => {
  it("shows a returning reader the reaction they left", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "dislike");
    // A fresh read, as happens on the next page load.
    expect(await readReactionState(db, SLUG, READER)).toEqual({ genuineLikes: 0, mine: "dislike" });
  });

  it("does not add a reaction merely because the page was read again", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    for (let i = 0; i < 10; i += 1) await readReactionState(db, SLUG, READER);
    expect(db.likes(SLUG)).toBe(1);
  });

  it("tells an unidentified reader nothing about anyone else's choice", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    expect(await readReactionState(db, SLUG, null)).toEqual({ genuineLikes: 1, mine: null });
  });
});

/* ================================================================== */
/* 10, 16, 18: dislike privacy                                         */
/* ================================================================== */

describe("dislike counts stay private", () => {
  /**
   * The requirement is not "hide the number in the UI" — it is that the number
   * never reaches the browser. These assert it at the boundary that decides
   * that: what the storage layer is willing to hand back.
   */
  it("returns no dislike count from a read", async () => {
    const db = testDb();
    await applyReaction(db, SLUG, READER, "dislike");
    const state = await readReactionState(db, SLUG, READER);
    expect(Object.keys(state).sort()).toEqual(["genuineLikes", "mine"]);
  });

  it("returns no dislike count from a write", async () => {
    const db = testDb();
    const state = await applyReaction(db, SLUG, READER, "dislike");
    expect(Object.keys(state).sort()).toEqual(["genuineLikes", "mine"]);
    expect(JSON.stringify(state)).not.toMatch(/dislike[Cc]ount|genuine_dislikes/);
  });

  it("cannot be inferred from the like total", async () => {
    // Two readers dislike; the published like total must not move at all, so
    // there is nothing to difference against a previous reading.
    const db = testDb();
    const before = await readReactionState(db, SLUG, null);
    await applyReaction(db, SLUG, READER, "dislike");
    await applyReaction(db, SLUG, OTHER, "dislike");
    const after = await readReactionState(db, SLUG, null);
    expect(after.genuineLikes).toBe(before.genuineLikes);
  });

  it("names the private counter in exactly one source file", () => {
    // The column may only be named where it is written. If it appears anywhere
    // else under src/ — a component, a loader, a response type — something is
    // on its way to the browser.
    const offenders = sourceFiles().filter((file) =>
      /genuine_dislikes|genuineDislikes|dislikeTotal|dislikeCount/.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map(relative)).toEqual(["src/lib/reactions.db.ts"]);
  });

  it("exposes no server function that could return a dislike total", () => {
    const fns = readFileSync(srcPath("lib/reactions.functions.ts"), "utf8");
    // Every published shape is built from these two fields and nothing else.
    const returned = [...fns.matchAll(/available:\s*true,([\s\S]{0,200}?)\}/g)].map((m) => m[1]!);
    expect(returned.length).toBeGreaterThan(0);
    for (const block of returned) {
      expect(block).not.toMatch(/dislike/i);
      expect(block).toMatch(/likeTotal/);
    }
  });
});

/* ================================================================== */
/* 17: no per-user reaction data in SSR                                */
/* ================================================================== */

describe("per-visitor state stays out of the server-rendered page", () => {
  it("is not resolved in the article route loader", () => {
    const route = readFileSync(srcPath("routes/$category.$slug.tsx"), "utf8");
    const loader = route.slice(route.indexOf("loader:"), route.indexOf("head:"));
    expect(loader).not.toMatch(/reaction/i);
  });

  it("is not placed in metadata or structured data", () => {
    const route = readFileSync(srcPath("routes/$category.$slug.tsx"), "utf8");
    const head = route.slice(route.indexOf("head:"), route.indexOf("component: ArticlePage"));
    expect(head).not.toMatch(/reaction|likeTotal|seed/i);
  });

  it("keeps reaction data out of SEO, sitemap and feed modules", () => {
    for (const file of ["lib/seo.ts", "routes/sitemap[.]xml.ts", "routes/rss[.]xml.ts"]) {
      const source = readFileSync(srcPath(file), "utf8");
      expect(source, file).not.toMatch(/reaction|likeTotal|seededLike/i);
    }
  });

  it("fetches its own state client-side instead", () => {
    const component = readFileSync(srcPath("components/article/ArticleReactions.tsx"), "utf8");
    expect(component).toMatch(/useEffect/);
    expect(component).toMatch(/getArticleReactions/);
  });
});

/* ================================================================== */
/* 1-5: seeded baselines                                               */
/* ================================================================== */

describe("seeded like baselines", () => {
  const published = articles.filter((a) => !a.draft);
  const seeds = published.map((a) => seededLikeCount(a.slug));

  it("gives an article a deterministic baseline", () => {
    const first = seededLikeCount("intune-policy-conflicts");
    for (let i = 0; i < 50; i += 1) {
      expect(seededLikeCount("intune-policy-conflicts")).toBe(first);
    }
  });

  it("matches an independent implementation of the documented algorithm", () => {
    // Pins the algorithm itself, not merely its self-consistency. If someone
    // changes the hash, the domain prefix or the band, every reader's number
    // silently moves — this fails first, and says which article moved.
    const expected = (slug: string) => {
      const input = `likes:v1:${slug}`;
      let h = 0x811c9dc5;
      for (let i = 0; i < input.length; i += 1) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      h ^= h >>> 16;
      h = Math.imul(h, 0x7feb352d) >>> 0;
      h ^= h >>> 15;
      h = Math.imul(h, 0x846ca68b) >>> 0;
      h ^= h >>> 16;
      return 1_500 + ((h >>> 0) % 1_001);
    };
    for (const article of articles) {
      expect(seededLikeCount(article.slug), article.slug).toBe(expected(article.slug));
    }
  });

  it("gives every article a distinct baseline", () => {
    const all = articles.map((a) => seededLikeCount(a.slug));
    expect(new Set(all).size, "two slugs collided — add a SEED_OVERRIDES entry").toBe(all.length);
  });

  it("keeps every baseline inside the 1,500-2,500 band", () => {
    for (const article of articles) {
      const seed = seededLikeCount(article.slug);
      expect(seed, article.slug).toBeGreaterThanOrEqual(1_500);
      expect(seed, article.slug).toBeLessThanOrEqual(2_500);
      expect(Number.isInteger(seed), article.slug).toBe(true);
    }
  });

  it("produces four-digit numbers", () => {
    for (const seed of seeds) expect(String(seed)).toHaveLength(4);
  });

  it("centres the distribution on roughly 2,000", () => {
    const mean = seeds.reduce((a, b) => a + b, 0) / seeds.length;
    expect(mean).toBeGreaterThan(1_900);
    expect(mean).toBeLessThan(2_100);
  });

  it("spreads across the band rather than clustering", () => {
    // A derivation that bunched everything near the centre would read as
    // generated just as clearly as one that produced round numbers.
    expect(Math.min(...seeds)).toBeLessThan(1_650);
    expect(Math.max(...seeds)).toBeGreaterThan(2_350);
  });

  it("avoids obvious round numbers", () => {
    const round = published.filter((a) => seededLikeCount(a.slug) % 50 === 0);
    expect(round.map((a) => a.slug)).toEqual([]);
    for (const seed of seeds) {
      expect([1_000, 1_500, 2_000, 2_500, 3_000]).not.toContain(seed);
    }
  });

  it("is not derivable by the reader from the published total", async () => {
    // The published number is one sum. Nothing in the response separates the
    // baseline from the genuine part.
    const db = testDb();
    await applyReaction(db, SLUG, READER, "like");
    const state = await readReactionState(db, SLUG, READER);
    const published = seededLikeCount(SLUG) + state.genuineLikes;
    expect(published).toBe(seededLikeCount(SLUG) + 1);
    expect(Object.keys(state)).not.toContain("seededLikes");
  });

  it("is never written into article content or editorial data", () => {
    // The baseline is a UI value. It must not have leaked into the content
    // store, where it would reach the sitemap, the feed and the JSON-LD.
    const contentFiles = sourceFiles().filter((f) => f.includes("/content/"));
    expect(contentFiles.length).toBeGreaterThan(30);
    const offenders = contentFiles.filter((file) =>
      /seededLikeCount|likeTotal|reactionCount/.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map(relative)).toEqual([]);
  });
});

/* ================================================================== */
/* 13: visitor cookie cannot be forged                                 */
/* ================================================================== */

describe("visitor identity", () => {
  it("issues a signed, opaque identifier", async () => {
    const cookie = await issueVisitorId(SIGNING_INPUT);
    expect(cookie).toMatch(/^[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]+$/);
    expect(await readVisitorId(SIGNING_INPUT, cookie)).toBe(cookie.split(".")[0]);
  });

  it("issues a different identifier every time", async () => {
    const ids = new Set(
      await Promise.all(Array.from({ length: 100 }, () => issueVisitorId(SIGNING_INPUT))),
    );
    expect(ids.size).toBe(100);
  });

  it("rejects an unsigned identifier", async () => {
    expect(await readVisitorId(SIGNING_INPUT, "AAAAAAAAAAAAAAAAAAAAAA")).toBeNull();
  });

  it("rejects an identifier signed with a different secret", async () => {
    const forged = await issueVisitorId("some-other-secret");
    expect(await readVisitorId(SIGNING_INPUT, forged)).toBeNull();
  });

  it("rejects a tampered identifier that keeps a valid signature", async () => {
    const cookie = await issueVisitorId(SIGNING_INPUT);
    const [raw, signature] = cookie.split(".") as [string, string];
    const swapped = `${raw.slice(0, 21)}${raw[21] === "A" ? "B" : "A"}.${signature}`;
    expect(await readVisitorId(SIGNING_INPUT, swapped)).toBeNull();
  });

  it("rejects malformed, empty and oversized values", async () => {
    for (const value of [
      undefined,
      "",
      "short",
      "no-dot-here",
      "a.b.c",
      "'; DROP TABLE article_reaction_votes; --.sig",
      `${"A".repeat(5_000)}.sig`,
    ]) {
      expect(await readVisitorId(SIGNING_INPUT, value), String(value).slice(0, 30)).toBeNull();
    }
  });

  it("is not readable or writable by page scripts", () => {
    expect(VISITOR_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(VISITOR_COOKIE_OPTIONS.sameSite).toBe("lax");
    expect(VISITOR_COOKIE_OPTIONS.path).toBe("/");
  });
});

/* ================================================================== */
/* 14, 15: rate limiting and IP handling                               */
/* ================================================================== */

describe("reaction rate limit", () => {
  beforeEach(() => resetReactionLimit());

  it("allows a reader to react to many articles in one sitting", () => {
    for (let i = 0; i < 30; i += 1) {
      expect(withinReactionLimit("key"), `attempt ${i + 1}`).toBe(true);
    }
  });

  it("stops one client hammering the endpoint", () => {
    for (let i = 0; i < 30; i += 1) withinReactionLimit("key");
    expect(withinReactionLimit("key")).toBe(false);
  });

  it("limits by address, so clearing the cookie buys nothing", () => {
    // A fresh cookie is a new visitor id but the same rate-limit key.
    for (let i = 0; i < 30; i += 1) withinReactionLimit("same-address");
    expect(withinReactionLimit("same-address")).toBe(false);
  });

  it("does not penalise a different client", () => {
    for (let i = 0; i < 30; i += 1) withinReactionLimit("noisy");
    expect(withinReactionLimit("quiet")).toBe(true);
  });

  it("lets the window slide", () => {
    const start = Date.now();
    for (let i = 0; i < 30; i += 1) withinReactionLimit("key", start);
    expect(withinReactionLimit("key", start)).toBe(false);
    expect(withinReactionLimit("key", start + 10 * 60_000 + 1)).toBe(true);
  });

  it("never exposes the raw address in its key", async () => {
    const ip = "203.0.113.42";
    const key = await reactionRateKey(ip);
    expect(key).not.toContain(ip);
    expect(key).not.toContain("203");
    expect(key).toHaveLength(22);
  });

  it("derives a stable key for the same address within an isolate", async () => {
    expect(await reactionRateKey("198.51.100.7")).toBe(await reactionRateKey("198.51.100.7"));
    expect(await reactionRateKey("198.51.100.7")).not.toBe(await reactionRateKey("198.51.100.8"));
  });

  it("persists no address anywhere in the reaction schema", () => {
    // Comments stripped first: the migration's prose explains that it stores
    // no IP address, and matching that sentence would be the test agreeing
    // with the documentation instead of with the schema.
    const ddl = readFileSync(MIGRATION, "utf8")
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("--"))
      .join("\n");
    expect(ddl).toMatch(/CREATE TABLE/);
    expect(ddl).not.toMatch(/\bip\b|ip_address|remote_addr|user_agent|email|referer/i);
  });
});

/* ================================================================== */
/* 19: clipboard policy                                                */
/* ================================================================== */

describe("clipboard policy", () => {
  /**
   * Site policy is that the application never touches the clipboard. It has
   * been enforced by review until now, which is exactly the kind of rule a
   * future change reinstates by accident — a "copy link" button is the most
   * natural thing in the world to add next to a share row.
   */
  const FORBIDDEN =
    /navigator\.clipboard|\bwriteText\b|\breadText\b|\bClipboardItem\b|execCommand\s*\(|onCopy|onCut|copyToClipboard|["'`]Copy link|["'`]Copy code/;

  it("contains no clipboard API usage anywhere in the application", () => {
    const offenders = sourceFiles().filter((file) => FORBIDDEN.test(readFileSync(file, "utf8")));
    expect(offenders.map(relative)).toEqual([]);
  });

  it("does not suppress the reader's own text selection", () => {
    // select-none on a decorative separator is fine; on prose it is not.
    const offenders = sourceFiles().filter((file) => {
      const source = readFileSync(file, "utf8");
      return /user-select:\s*none|onSelectStart|selectstart/.test(source);
    });
    expect(offenders.map(relative)).toEqual([]);
  });

  it("declares no clipboard dependency", () => {
    const pkg = readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8");
    expect(pkg).not.toMatch(/clipboard/i);
  });
});

/* ================================================================== */
/* 20: the existing site is undisturbed                                */
/* ================================================================== */

describe("existing article URLs are unchanged", () => {
  /**
   * Reactions are additive. A published URL changing is a broken link and a
   * lost ranking, so the whole set is pinned here rather than merely counted.
   */
  const EXPECTED = [
    "/ai-enterprise-it/ai-agents-it-operations",
    "/ai-enterprise-it/eu-ai-act-obligations-timeline",
    "/ai-enterprise-it/model-context-protocol-explained",
    "/cloud/cloud-cost-controls",
    "/cybersecurity-ciso/iso-27001-microsoft-365-mapping",
    "/development/nodejs-release-schedule-change",
    "/devops/ingress-nginx-archived-migration",
    "/devops/terraform-vs-opentofu",
    "/enterprise-networking/zero-trust-network-segmentation",
    "/microsoft-365-entra-id/conditional-access-break-glass-accounts",
    "/microsoft-365-entra-id/conditional-access-framework",
    "/microsoft-intune/autopilot-device-preparation-vs-autopilot",
    "/microsoft-intune/autopilot-device-registration-failures",
    "/microsoft-intune/autopilot-pre-provisioning-failures",
    "/microsoft-intune/compliant-device-conditional-access-blocked",
    "/microsoft-intune/enrollment-status-page-troubleshooting",
    "/microsoft-intune/entra-join-vs-hybrid-join",
    "/microsoft-intune/group-policy-to-settings-catalog-migration",
    "/microsoft-intune/intune-compliance-policy-design",
    "/microsoft-intune/intune-custom-compliance-scripts",
    "/microsoft-intune/intune-enrollment-restrictions",
    "/microsoft-intune/intune-management-extension-logs",
    "/microsoft-intune/intune-policy-conflicts",
    "/microsoft-intune/intunewin-packaging-win32-apps",
    "/microsoft-intune/win32-app-detection-rules",
    "/microsoft-intune/win32-app-supersedence-dependencies",
    "/networking/wifi-6-vs-wifi-7",
    "/software/vscode-vs-jetbrains",
    "/windows/windows-11-vs-windows-10-enterprise",
  ];

  it("still publishes exactly the same addresses", () => {
    expect(allArticles.map(articlePath).sort()).toEqual([...EXPECTED].sort());
  });

  it("did not change how many articles are published", () => {
    // Published count only. The total is deliberately not pinned: adding a
    // draft is a normal editorial act that changes nothing a reader can reach,
    // and a guard that fails on it would just be noise every time one lands.
    expect(allArticles).toHaveLength(29);
    expect(articles.length).toBeGreaterThanOrEqual(allArticles.length);
  });
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SRC = fileURLToPath(new URL("../src", import.meta.url));

function srcPath(relativePath: string): string {
  return `${SRC}/${relativePath}`;
}

function sourceFiles(): string[] {
  return readdirSync(SRC, { recursive: true, encoding: "utf8" })
    .filter((entry) => /\.(ts|tsx)$/.test(entry))
    .map((entry) => `${SRC}/${entry}`.replace(/\\/g, "/"));
}

function relative(file: string): string {
  return `src/${file.replace(/\\/g, "/").split("/src/")[1]}`;
}

/* ================================================================== */
/* Cloudflare Workers global scope                                     */
/* ================================================================== */

describe("nothing in the reaction modules runs at import time", () => {
  /**
   * Workers rejects random generation, async I/O and timers in global scope
   * with "Disallowed operation called within global scope". A module-level
   * `crypto.getRandomValues()` in reactions.identity.ts did exactly that in
   * production: the isolate threw while importing the chunk, so the endpoint
   * failed before any handler could run and no request-level error handling
   * could recover it.
   *
   * This reproduces the constraint rather than describing it — the global is
   * replaced with one that throws the way Workers does, and the modules are
   * imported fresh. If any of them generates a random value, opens a socket or
   * sets a timer while loading, the import fails here.
   */
  it("imports cleanly when random, fetch and timers are forbidden", async () => {
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

  it("still produces a working rate-limit key once a request is running", async () => {
    // The salt is created on first use rather than at import; the key must
    // still be stable within the isolate and must not contain the address.
    const { reactionRateKey } = await import("../src/lib/reactions.identity");
    const first = await reactionRateKey("203.0.113.9");
    expect(first).toHaveLength(22);
    expect(first).not.toContain("203");
    expect(await reactionRateKey("203.0.113.9")).toBe(first);
    expect(await reactionRateKey("203.0.113.10")).not.toBe(first);
  });
});
