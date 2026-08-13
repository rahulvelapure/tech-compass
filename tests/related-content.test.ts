import { describe, expect, it } from "vitest";

import { allArticles, articles, relatedArticles } from "@/lib/content";
import type { Article } from "@/content/types";

/**
 * Related content is ranked, not hand-maintained: shared tags, keyword
 * overlap, subcategory and category all contribute, and an explicit
 * `relatedSlugs` override wins.
 *
 * These tests pin the properties that matter — every article gets suggestions,
 * they are never self-referential, and a genuinely related article outranks an
 * unrelated one — rather than the exact ordering, which should be free to
 * improve without breaking the suite.
 */

function find(slug: string): Article {
  const article = articles.find((a) => a.slug === slug);
  if (!article) throw new Error(`Fixture article "${slug}" no longer exists`);
  return article;
}

/** Shared signal between two articles, mirroring what the ranker weighs. */
function affinity(a: Article, b: Article): number {
  const sharedTags = a.tags.filter((tag) => b.tags.includes(tag)).length;
  return sharedTags + (a.category === b.category ? 1 : 0);
}

/**
 * The most an article can be given is every *other* published article. While
 * the corpus is small that is the binding constraint, so the expectation is
 * clamped rather than fixed at 3 — otherwise this suite fails for a reason
 * that has nothing to do with the ranking logic.
 */
const available = (limit: number) => Math.min(limit, allArticles.length - 1);

describe("relatedArticles", () => {
  it("fills the related rail as far as the corpus allows", () => {
    for (const article of allArticles) {
      const related = relatedArticles(article, 3);
      expect(related.length, `${article.slug} produced ${related.length} related articles`).toBe(
        available(3),
      );
    }
  });

  it("never suggests the article itself", () => {
    for (const article of allArticles) {
      const slugs = relatedArticles(article, 5).map((a) => a.slug);
      expect(slugs, `${article.slug} suggested itself`).not.toContain(article.slug);
    }
  });

  it("never repeats a suggestion", () => {
    for (const article of allArticles) {
      const slugs = relatedArticles(article, 5).map((a) => a.slug);
      expect(new Set(slugs).size, `${article.slug} repeated a suggestion`).toBe(slugs.length);
    }
  });

  it("leads with an article that shares a signal, where one exists", () => {
    for (const article of allArticles) {
      const hasRelative = allArticles.some(
        (other) => other.slug !== article.slug && affinity(article, other) > 0,
      );
      if (!hasRelative) continue;

      const [first] = relatedArticles(article, 3);
      expect(first, `${article.slug} returned nothing`).toBeDefined();
      expect(
        affinity(article, first!),
        `${article.slug} led with unrelated ${first!.slug}`,
      ).toBeGreaterThan(0);
    }
  });

  it("ranks a tag-sharing article above one that only shares a category", () => {
    const article = find("enrollment-status-page-troubleshooting");

    const sameTags = allArticles.filter(
      (a) =>
        a.slug !== article.slug &&
        a.tags.some((tag) => article.tags.includes(tag)) &&
        a.category !== article.category,
    );
    const categoryOnly = allArticles.filter(
      (a) =>
        a.slug !== article.slug &&
        a.category === article.category &&
        !a.tags.some((tag) => article.tags.includes(tag)),
    );

    // Only meaningful when the store actually contains both kinds.
    if (sameTags.length === 0 || categoryOnly.length === 0) return;

    const ranked = relatedArticles(article, allArticles.length).map((a) => a.slug);
    const bestTagMatch = Math.min(...sameTags.map((a) => ranked.indexOf(a.slug)));
    const bestCategoryOnly = Math.min(...categoryOnly.map((a) => ranked.indexOf(a.slug)));

    expect(bestTagMatch).toBeLessThan(bestCategoryOnly);
  });

  it("honours an explicit relatedSlugs override first", () => {
    const overridden = allArticles.filter((a) => (a.relatedSlugs ?? []).length > 0);
    for (const article of overridden) {
      const slugs = relatedArticles(article, 3).map((a) => a.slug);
      const expected = (article.relatedSlugs ?? []).slice(0, 3);
      expect(slugs.slice(0, expected.length)).toEqual(expected);
    }
  });

  it("respects the limit", () => {
    const article = allArticles[0]!;
    expect(relatedArticles(article, 1)).toHaveLength(available(1));
    expect(relatedArticles(article, 2)).toHaveLength(available(2));
  });
});
