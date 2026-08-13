import { describe, expect, it } from "vitest";

import {
  TAG_INDEX_THRESHOLD,
  allArticles,
  allTags,
  articlesByAuthor,
  authors,
  getTag,
  indexableTags,
  tagSlug,
} from "@/lib/content";

/**
 * Tags and authors are the two taxonomies that produce pages, so both are
 * routing surfaces and both can produce SEO problems if they drift: a tag
 * whose slug does not round-trip 404s from an article, and a flood of
 * single-article tag pages dilutes the crawl budget.
 */

describe("tag slugs", () => {
  it.each([
    ["Entra ID", "entra-id"],
    ["Microsoft 365", "microsoft-365"],
    ["Zero Trust", "zero-trust"],
    ["Wi-Fi", "wi-fi"],
    ["AI", "ai"],
  ])("slugifies %j to %j", (tag, expected) => {
    expect(tagSlug(tag)).toBe(expected);
  });

  it("resolves every tag used on an article", () => {
    for (const article of allArticles) {
      for (const tag of article.tags) {
        expect(
          getTag(tagSlug(tag)),
          `${article.slug} tags "${tag}" but /tag/${tagSlug(tag)} 404s`,
        ).toBeDefined();
      }
    }
  });

  it("produces a URL-safe slug for every tag", () => {
    for (const tag of allTags()) {
      expect(tag.slug, `"${tag.name}"`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("does not collide two different tags onto one slug", () => {
    const slugs = allTags().map((tag) => tag.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("tag indexing", () => {
  it("indexes a tag only once it carries enough articles", () => {
    for (const tag of allTags()) {
      expect(tag.indexable, `${tag.slug} has ${tag.articles.length} article(s)`).toBe(
        tag.articles.length >= TAG_INDEX_THRESHOLD,
      );
    }
  });

  it("keeps thin tags out of the indexable set", () => {
    for (const tag of indexableTags()) {
      expect(tag.articles.length).toBeGreaterThanOrEqual(TAG_INDEX_THRESHOLD);
    }
  });

  it("lists a tag's articles newest first", () => {
    for (const tag of allTags()) {
      const dates = tag.articles.map((article) => article.publishedAt);
      expect(dates, tag.slug).toEqual([...dates].sort().reverse());
    }
  });

  it("puts every article under at least one tag", () => {
    // An article reachable only by its category URL is a dead end for
    // cross-pillar discovery.
    for (const article of allArticles) {
      expect(article.tags.length, `${article.slug} has no tags`).toBeGreaterThan(0);
    }
  });
});

describe("authors", () => {
  it("gives every author at least one article", () => {
    for (const author of authors) {
      expect(articlesByAuthor(author.id).length, `${author.id} has no articles`).toBeGreaterThan(0);
    }
  });

  it("attributes every article to a real author", () => {
    const ids = new Set(authors.map((author) => author.id));
    for (const article of allArticles) {
      expect(ids.has(article.authorId), `${article.slug} -> ${article.authorId}`).toBe(true);
    }
  });

  it("keeps author records free of personal contact details", () => {
    // The publication's privacy position, enforced rather than remembered.
    for (const author of authors) {
      const text = `${author.bio} ${author.role}`;
      expect(text, author.id).not.toMatch(/@|\+\d{2}|\bphone\b|\bmobile\b|\baddress\b/i);
    }
  });

  it("uses a URL-safe author id", () => {
    for (const author of authors) {
      expect(author.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});
