import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { articles } from "../src/content/articles";
import { allArticles, articlesForCategory, getCategory } from "../src/lib/content";
import { HOMEPAGE_SECTIONS } from "../src/lib/homepage.functions";
import {
  composeHomepage,
  createRng,
  leadCandidates,
  type HomepageComposition,
} from "../src/lib/homepage.selection";

/**
 * Front-page composition.
 *
 * The homepage must give a returning reader a different front page, without
 * ever giving the server and the browser different HTML for the same request.
 * These tests pull in both directions: that the selection genuinely varies
 * across requests, and that it is completely fixed once a seed is chosen.
 *
 * They replaced an earlier suite that asserted a six-hour clock-bucketed
 * rotation. That rotation was the defect — every visitor saw the same lead for
 * six hours at a time — so the tests describing it went with it.
 */

/** Mirrors the homepage's own section list and per-shape render counts. */
const SECTIONS: { slug: string; renderCount: number }[] = [
  { slug: "ai-enterprise-it", renderCount: 5 },
  { slug: "microsoft-intune", renderCount: 3 },
  { slug: "cybersecurity-ciso", renderCount: 9 },
  { slug: "how-to", renderCount: 3 },
];

function sections() {
  return SECTIONS.map(({ slug, renderCount }) => {
    const category = getCategory(slug);
    return { slug, articles: category ? articlesForCategory(category) : [], renderCount };
  });
}

function compose(seed: number, recentLeads: string[] = []): HomepageComposition {
  return composeHomepage({ articles: allArticles, sections: sections(), seed, recentLeads });
}

/** Every slug the page would render, in one flat list. */
function allSlugs(composition: HomepageComposition): string[] {
  return [
    composition.leadSlug,
    ...composition.secondarySlugs,
    ...composition.latestSlugs,
    ...Object.values(composition.sectionSlugs).flat(),
  ];
}

describe("the front page varies between requests", () => {
  it("does not keep returning the same lead", () => {
    // The reported defect: refreshing produced the same hero every time.
    const leads = new Set(Array.from({ length: 40 }, (_, i) => compose(i * 7919 + 1).leadSlug));
    expect(leads.size).toBeGreaterThan(1);
  });

  it("reaches most of the eligible pool across many requests", () => {
    const pool = leadCandidates(allArticles);
    const leads = new Set(Array.from({ length: 400 }, (_, i) => compose(i + 1).leadSlug));
    // Weighted selection favours recent and featured articles, so a couple of
    // low-weight entries may not appear; the majority must.
    expect(leads.size).toBeGreaterThanOrEqual(Math.ceil(pool.length / 2));
  });

  it("varies the Also today rail too, not only the lead", () => {
    const rails = new Set(
      Array.from({ length: 40 }, (_, i) => compose(i * 104729 + 3).secondarySlugs.join("|")),
    );
    expect(rails.size).toBeGreaterThan(1);
  });

  it("skips leads the reader has recently been shown", () => {
    const recent = leadCandidates(allArticles)
      .slice(0, 3)
      .map((article) => article.slug);
    for (let seed = 1; seed <= 60; seed += 1) {
      expect(recent, `seed ${seed}`).not.toContain(compose(seed, recent).leadSlug);
    }
  });

  it("still renders when every eligible lead was recently shown", () => {
    // The fallback must produce a page rather than an empty one.
    const everything = leadCandidates(allArticles).map((article) => article.slug);
    const composition = compose(12345, everything);
    expect(composition.leadSlug).not.toBe("");
  });
});

describe("one request renders one composition", () => {
  it("is fully determined by the seed", () => {
    // This is what keeps server-rendered HTML and hydration identical.
    for (const seed of [1, 42, 999, 2 ** 31]) {
      const first = JSON.stringify(compose(seed));
      for (let repeat = 0; repeat < 20; repeat += 1) {
        expect(JSON.stringify(compose(seed)), `seed ${seed}`).toBe(first);
      }
    }
  });

  it("uses a seeded generator rather than Math.random", () => {
    const a = createRng(7);
    const b = createRng(7);
    const runA = Array.from({ length: 25 }, () => a());
    const runB = Array.from({ length: 25 }, () => b());
    expect(runA).toEqual(runB);
    for (const value of runA) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("does not call Math.random anywhere in the selection", () => {
    // Calls only — the module explains in prose why it uses a seeded generator
    // "rather than Math.random", and a naive match would flag that sentence.
    const code = readFileSync(
      fileURLToPath(new URL("../src/lib/homepage.selection.ts", import.meta.url)),
      "utf8",
    )
      .split("\n")
      .filter((line) => !/^\s*(\*|\/\/|\/\*)/.test(line))
      .join("\n");
    expect(code).not.toMatch(/Math\.random\s*\(/);
  });
});

describe("what the front page must never do", () => {
  it("never shows the same article twice on one page", () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const slugs = allSlugs(compose(seed));
      const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
      expect(duplicates, `seed ${seed} rendered a duplicate`).toEqual([]);
    }
  });

  it("never selects a draft", () => {
    const draftSlugs = new Set(articles.filter((a) => a.draft).map((a) => a.slug));
    expect(draftSlugs.size).toBeGreaterThan(0);
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const slug of allSlugs(compose(seed))) {
        expect(draftSlugs.has(slug), `seed ${seed} selected draft ${slug}`).toBe(false);
      }
    }
  });

  it("only ever selects articles that exist and are published", () => {
    const published = new Set(allArticles.map((a) => a.slug));
    for (let seed = 1; seed <= 100; seed += 1) {
      for (const slug of allSlugs(compose(seed))) {
        expect(published.has(slug), `unknown slug ${slug}`).toBe(true);
      }
    }
  });

  it("fills the rail and the latest list whenever there is content for them", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const composition = compose(seed);
      expect(composition.secondarySlugs).toHaveLength(3);
      expect(composition.latestSlugs).toHaveLength(6);
    }
  });

  it("keeps Latest in date order", () => {
    // The heading says Latest; the list must not be shuffled.
    const byDate = new Map(allArticles.map((a) => [a.slug, a.publishedAt]));
    for (let seed = 1; seed <= 50; seed += 1) {
      const dates = compose(seed).latestSlugs.map((slug) => byDate.get(slug)!);
      const sorted = [...dates].sort((a, b) => b.localeCompare(a));
      expect(dates, `seed ${seed}`).toEqual(sorted);
    }
  });

  it("keeps every section article inside its own category", () => {
    const category = new Map(allArticles.map((a) => [a.slug, a.category]));
    const contentType = new Map(allArticles.map((a) => [a.slug, a.contentType]));
    for (let seed = 1; seed <= 50; seed += 1) {
      const composition = compose(seed);
      for (const [slug, picked] of Object.entries(composition.sectionSlugs)) {
        const section = getCategory(slug);
        for (const articleSlug of picked) {
          if (section?.contentTypeIndex) {
            expect(contentType.get(articleSlug)).toBe(section.contentTypeIndex);
          } else {
            expect(category.get(articleSlug), `${articleSlug} in ${slug}`).toBe(slug);
          }
        }
      }
    }
  });
});

describe("rotation does not disturb anything fixed", () => {
  it("changes no article URL", () => {
    const before = allArticles.map((a) => `/${a.category}/${a.slug}`).sort();
    for (let seed = 1; seed <= 25; seed += 1) compose(seed);
    expect(allArticles.map((a) => `/${a.category}/${a.slug}`).sort()).toEqual(before);
  });

  it("keeps homepage metadata independent of the composition", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../src/routes/index.tsx", import.meta.url)),
      "utf8",
    );
    const head = source.slice(source.indexOf("head: () =>"), source.indexOf("component: HomePage"));
    expect(head).not.toMatch(/lead|Slug|composition/i);
    expect(head).toMatch(/canonical\("\/"\)/);
  });

  it("resolves the composition in the loader, not while rendering", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../src/routes/index.tsx", import.meta.url)),
      "utf8",
    );
    expect(source).toMatch(/loader:\s*\(\)\s*=>\s*selectHomepageComposition\(\)/);
    const component = source.slice(source.indexOf("function HomePage"));
    expect(component).toMatch(/Route\.useLoaderData\(\)/);
    // The component must not re-run selection; it only resolves slugs.
    expect(component).not.toMatch(/composeHomepage|createRng|getRandomValues/);
  });
});

/* ------------------------------------------------------------------ */
/* Workers safety                                                      */
/* ------------------------------------------------------------------ */

describe("nothing runs in Cloudflare Workers global scope", () => {
  /**
   * Workers rejects random generation, async I/O and timers at module import
   * with "Disallowed operation called within global scope". A module-level
   * `crypto.getRandomValues()` in the reactions code took the whole endpoint
   * down in production — the isolate failed before any handler ran, so no
   * request-level error handling could help. This pins the rule.
   */
  const SRC = fileURLToPath(new URL("../src", import.meta.url));
  const FORBIDDEN =
    /^(?:export\s+)?(?:const|let|var)\s+[^=]*=\s*[^=]*(?:crypto\.(?:getRandomValues|randomUUID|subtle)|Math\.random|fetch\s*\(|setTimeout|setInterval)/;

  function sourceFiles(): string[] {
    return readdirSync(SRC, { recursive: true, encoding: "utf8" })
      .filter((entry) => /\.(ts|tsx)$/.test(entry))
      .map((entry) => `${SRC}/${entry}`.replace(/\\/g, "/"));
  }

  it("initialises no random, timer or network value at module load", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, index) => {
        if (FORBIDDEN.test(line)) {
          offenders.push(`src/${file.split("/src/")[1]}:${index + 1}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * Section configuration.
 *
 * The front page once shipped with its AI section pointing at the `ai`
 * category, which holds a single draft and has never had a published article.
 * The section selected nothing, `routes/index.tsx` dropped it silently, and
 * the front page rendered with no AI section at all. Nothing failed: the suite
 * below mirrored the same wrong slug, so it tested the bug rather than the
 * page.
 *
 * These two tests close both halves of that hole — the mirror can no longer
 * drift from the real configuration, and a section that cannot fill itself is
 * now a failure rather than a silently missing part of the page.
 */
describe("homepage section configuration", () => {
  it("mirrors the real HOMEPAGE_SECTIONS list", () => {
    expect(SECTIONS.map((section) => section.slug)).toEqual(
      HOMEPAGE_SECTIONS.map((section) => section.slug),
    );
  });

  it.each(HOMEPAGE_SECTIONS.map((section) => section.slug))(
    "section %s has published articles to render",
    (slug) => {
      const category = getCategory(slug);
      expect(category, `${slug} is not a category`).toBeDefined();
      expect(
        articlesForCategory(category!).length,
        `${slug} has no published articles, so the front page drops the section`,
      ).toBeGreaterThan(0);
    },
  );
});
