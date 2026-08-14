import { describe, expect, it } from "vitest";

import { articles } from "@/content/articles";
import {
  categories,
  categoryMap,
  contentTypeIndexCategories,
  isSubjectCategory,
  subjectCategories,
} from "@/content/categories";
import { CONTENT_TYPES, contentTypeLabels } from "@/content/types";
import { allArticles, articlesByContentType, articlesForCategory } from "@/lib/content";

/**
 * The information architecture: subject categories own URLs, editorial format
 * is an attribute, and articles hang off a pillar hierarchy.
 *
 * The content validator checks the same invariants on the current corpus. These
 * tests exist because the validator is a script someone has to run, and the
 * rule that "a format is never a canonical URL" is the kind of thing a future
 * change breaks silently — one article given `category: "comparisons"` and the
 * site has two addresses for one page.
 */

const published = articles.filter((a) => !a.draft);
const bySlug = new Map(articles.map((a) => [a.slug, a]));

describe("subject vs format taxonomy", () => {
  it("never lets an article live in a derived index category", () => {
    const offenders = articles
      .filter((a) => categoryMap.get(a.category)?.contentTypeIndex !== undefined)
      .map((a) => `${a.slug} -> ${a.category}`);
    expect(offenders).toEqual([]);
  });

  it("splits every category into exactly one of subject or index", () => {
    expect(subjectCategories.length + contentTypeIndexCategories.length).toBe(categories.length);
    for (const category of contentTypeIndexCategories) {
      expect(isSubjectCategory(category.slug)).toBe(false);
    }
    for (const category of subjectCategories) {
      expect(isSubjectCategory(category.slug)).toBe(true);
    }
  });

  it("points every index category at a real content type", () => {
    for (const category of contentTypeIndexCategories) {
      expect(CONTENT_TYPES, category.slug).toContain(category.contentTypeIndex);
    }
  });

  it("does not point two index categories at the same content type", () => {
    const seen = contentTypeIndexCategories.map((c) => c.contentTypeIndex);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("gives an index category the articles of its content type, from any subject", () => {
    for (const category of contentTypeIndexCategories) {
      const listed = articlesForCategory(category);
      expect(listed).toEqual(articlesByContentType(category.contentTypeIndex!));
      for (const article of listed) {
        // The listing is a view. The canonical URL stays under the subject.
        expect(article.category).not.toBe(category.slug);
      }
    }
  });

  it("labels every content type", () => {
    for (const type of CONTENT_TYPES) {
      expect(contentTypeLabels[type]?.title, type).toBeTruthy();
    }
  });
});

describe("content type", () => {
  it("gives every article a known content type", () => {
    for (const article of articles) {
      expect(CONTENT_TYPES, article.slug).toContain(article.contentType);
    }
  });

  it("only calls something a review when it was actually used", () => {
    // `review` asserts first-hand assessment. Research-based analysis is a
    // different thing, and conflating them is how a publication starts
    // claiming testing it never did.
    for (const article of articles.filter((a) => a.contentType === "review")) {
      expect(["hands-on", "lab-verified"], article.slug).toContain(article.reviewStatus);
    }
  });
});

describe("pillar hierarchy", () => {
  it("resolves every pillarSlug to a real pillar", () => {
    for (const article of articles) {
      if (!article.pillarSlug) continue;
      const parent = bySlug.get(article.pillarSlug);
      expect(parent, `${article.slug} -> ${article.pillarSlug}`).toBeDefined();
      expect(parent!.pillar, `${article.pillarSlug} is not a pillar`).toBeTruthy();
      expect(article.pillarSlug).not.toBe(article.slug);
    }
  });

  it("never hangs a published cluster off a draft pillar", () => {
    for (const article of published) {
      if (!article.pillarSlug) continue;
      expect(bySlug.get(article.pillarSlug)!.draft ?? false, article.slug).toBe(false);
    }
  });

  it("keeps the hierarchy acyclic and no deeper than hub -> pillar -> supporting", () => {
    for (const article of articles) {
      const seen = new Set<string>([article.slug]);
      let cursor = article.pillarSlug ? bySlug.get(article.pillarSlug) : undefined;
      let depth = 1;
      while (cursor) {
        expect(seen.has(cursor.slug), `cycle at ${cursor.slug}`).toBe(false);
        seen.add(cursor.slug);
        depth += 1;
        expect(depth, `${article.slug} chain too deep`).toBeLessThanOrEqual(3);
        cursor = cursor.pillarSlug ? bySlug.get(cursor.pillarSlug) : undefined;
      }
    }
  });

  it("resolves relatedSlugs to published articles other than itself", () => {
    for (const article of articles) {
      for (const slug of article.relatedSlugs ?? []) {
        expect(slug, `${article.slug} lists itself`).not.toBe(article.slug);
        const target = bySlug.get(slug);
        expect(target, `${article.slug} -> unknown ${slug}`).toBeDefined();
        if (!article.draft) expect(target!.draft ?? false, `${slug} is a draft`).toBe(false);
      }
    }
  });
});

describe("authored SVG figures", () => {
  const figures = articles.flatMap((a) =>
    a.body.filter((b) => b.type === "figure").map((b) => ({ article: a.slug, block: b })),
  );

  it("scales responsively and carries a text alternative", () => {
    for (const { article, block } of figures) {
      if (block.type !== "figure") continue;
      expect(block.svg, article).toMatch(/viewBox\s*=/);
      expect(block.svg, article).not.toMatch(/<svg[^>]*\s(width|height)\s*=/);
      expect(block.alt.trim(), article).not.toBe("");
      expect(block.alt.trim().toLowerCase()).not.toBe(block.title.trim().toLowerCase());
    }
  });

  it("stays inline and inert", () => {
    // The renderer injects this markup as raw HTML.
    for (const { article, block } of figures) {
      if (block.type !== "figure") continue;
      expect(block.svg, article).not.toMatch(/<script/i);
      expect(block.svg, article).not.toMatch(/<foreignObject/i);
      expect(block.svg, article).not.toMatch(/<image/i);
      expect(block.svg, article).not.toMatch(/\son\w+\s*=/i);
      expect(block.svg, article).not.toMatch(/(?:href|src)\s*=\s*["']?(?:https?:)?\/\//i);
    }
  });
});

describe("published URL shape", () => {
  it("keeps one canonical address per published article", () => {
    const paths = allArticles.map((a) => `/${a.category}/${a.slug}`);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("puts every published article under a subject category", () => {
    for (const article of allArticles) {
      expect(isSubjectCategory(article.category), `${article.slug} -> ${article.category}`).toBe(
        true,
      );
    }
  });
});
