import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

import { articles } from "../src/content/articles";
import type { D1Database } from "../src/lib/reactions.db";
import { seededLikeCount } from "../src/lib/reactions.seed";
import { incrementArticleView, readAllArticleViews, readArticleViews } from "../src/lib/views.db";
import { rankMostVisited } from "../src/lib/views.functions";
import {
  ANNUAL_COMPOUND_FACTOR,
  MONTHLY_GROWTH_MAX,
  MONTHLY_GROWTH_MIN,
  VIEW_GROWTH_ANCHOR_MS,
  VIEW_SEED_MAX,
  VIEW_SEED_MIN,
  currentBaselineViewCount,
  monthlyGrowthRate,
  seededViewCount,
} from "../src/lib/views.seed";

const MIGRATION = fileURLToPath(new URL("../migrations/0002_article_views.sql", import.meta.url));

const DAY_MS = 86_400_000;

interface Bound {
  query: string;
  values: unknown[];
}

function testViewDb(): D1Database {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(MIGRATION, "utf8"));

  return {
    prepare(query: string) {
      return {
        bind: (...values: unknown[]): Bound => ({ query, values }),
      } as unknown as ReturnType<D1Database["prepare"]>;
    },
    async batch<T>(statements: ReturnType<D1Database["prepare"]>[]) {
      return (statements as unknown as Bound[]).map(({ query, values }) => {
        if (/^\s*SELECT/i.test(query)) {
          return {
            results: sqlite.prepare(query).all(...(values as never[])) as unknown as T[],
          };
        }
        sqlite.prepare(query).run(...(values as never[]));
        return { results: [] };
      });
    },
  };
}

describe("seeded view baselines and 3.0000000%–5.00000000% monthly growth", () => {
  it("stays deterministic, inside [2000, 8000], non-round, and above seeded likes on anchor day", () => {
    for (const article of articles) {
      const first = seededViewCount(article.slug);
      const second = seededViewCount(article.slug);
      const likes = seededLikeCount(article.slug);

      expect(first).toBe(second);
      expect(first).toBeGreaterThanOrEqual(VIEW_SEED_MIN);
      expect(first).toBeLessThanOrEqual(VIEW_SEED_MAX);
      expect(first % 50, `${article.slug} landed on round view baseline ${first}`).not.toBe(0);
      expect(first, `${article.slug} views (${first}) <= likes (${likes})`).toBeGreaterThan(likes);
      expect(currentBaselineViewCount(article.slug, VIEW_GROWTH_ANCHOR_MS)).toBe(first);
    }
  });

  it("assigns distinct high-precision monthly rates in [3.0000000%, 5.00000000%] per article and month", () => {
    const ratesMonth0 = articles.map((a) => monthlyGrowthRate(a.slug, 0));
    expect(new Set(ratesMonth0).size).toBe(ratesMonth0.length);

    for (const article of articles) {
      for (let m = 0; m < 12; m += 1) {
        const r = monthlyGrowthRate(article.slug, m);
        expect(r).toBeGreaterThanOrEqual(MONTHLY_GROWTH_MIN);
        expect(r).toBeLessThanOrEqual(MONTHLY_GROWTH_MAX);
      }
      expect(monthlyGrowthRate(article.slug, 0)).not.toBe(monthlyGrowthRate(article.slug, 1));
    }
  });

  it("accrues monotonically across multi-year boundaries with 10% annual compounding", () => {
    expect(ANNUAL_COMPOUND_FACTOR).toBe(1.1);
    const sample = articles.slice(0, 15);
    for (const article of sample) {
      const base = seededViewCount(article.slug);
      let prev = base;
      // Check across 2 full years (including the 12-month annual compound boundary)
      for (let day = 1; day <= 730; day += 1) {
        const next = currentBaselineViewCount(article.slug, VIEW_GROWTH_ANCHOR_MS + day * DAY_MS);
        expect(next, `${article.slug} decreased on day ${day}`).toBeGreaterThanOrEqual(prev);
        prev = next;
      }

      const afterOneMonth = currentBaselineViewCount(
        article.slug,
        VIEW_GROWTH_ANCHOR_MS + 30 * DAY_MS,
      );
      const gain = afterOneMonth - base;
      expect(gain).toBeGreaterThanOrEqual(Math.floor(base * MONTHLY_GROWTH_MIN));
      expect(gain).toBeLessThanOrEqual(Math.ceil(base * MONTHLY_GROWTH_MAX));
    }
  });
});

describe("article view storage and Most Visited ranking", () => {
  it("starts at zero genuine views and increments monotonically on each visit", async () => {
    const db = testViewDb();
    expect(await readArticleViews(db, "sample-article")).toBe(0);
    expect(await incrementArticleView(db, "sample-article")).toBe(1);
    expect(await incrementArticleView(db, "sample-article")).toBe(2);
    expect(await incrementArticleView(db, "sample-article")).toBe(3);
    expect(await readArticleViews(db, "sample-article")).toBe(3);
    expect(await readAllArticleViews(db)).toEqual({ "sample-article": 3 });
  });

  it("ranks published articles in descending order of total visits and promotes articles as visits grow", () => {
    const published = articles.filter((a) => !a.draft);
    const baselineTop = rankMostVisited(published, {}, 5, VIEW_GROWTH_ANCHOR_MS);

    expect(baselineTop).toHaveLength(5);
    for (let i = 1; i < baselineTop.length; i += 1) {
      expect(baselineTop[i - 1]!.viewTotal).toBeGreaterThanOrEqual(baselineTop[i]!.viewTotal);
    }

    const challenger = published.find((a) => a.slug !== baselineTop[0]!.slug)!;
    const promoted = rankMostVisited(
      published,
      { [challenger.slug]: 10_000 },
      5,
      VIEW_GROWTH_ANCHOR_MS,
    );
    expect(promoted[0]!.slug).toBe(challenger.slug);
    expect(promoted[0]!.viewTotal).toBe(
      currentBaselineViewCount(challenger.slug, VIEW_GROWTH_ANCHOR_MS) + 10_000,
    );
  });
});

describe("workers global-scope import safety", () => {
  it("imports view modules without invoking random, network, or timer APIs", async () => {
    vi.resetModules();
    const disallowed = (op: string) => () => {
      throw new Error(`Disallowed operation called within global scope: ${op}`);
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
      await expect(import("../src/lib/views.seed")).resolves.toBeDefined();
      await expect(import("../src/lib/views.db")).resolves.toBeDefined();
      await expect(import("../src/lib/views.functions")).resolves.toBeDefined();
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });
});
