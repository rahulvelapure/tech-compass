import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";

import { articles } from "@/content/articles";
import { categories } from "@/content/categories";
import { allTopics, segments } from "../editorial";
import type { Topic } from "../editorial";

/**
 * The editorial backlog is planning data. It has no runtime effect, which is
 * exactly why it needs its own checks — nothing else would notice a topic
 * pointing at a category that does not exist, or a PUBLISHED topic whose
 * article was never written.
 *
 * These legacy topic records still carry articleSlug values for researched
 * articles that were never converted. Keep the list explicit and small so a
 * new stale reference still fails the suite.
 */
const LEGACY_UNCONVERTED_ARTICLE_TOPICS = new Set([
  "cloud-29",
  "cloud-32",
  "devops-26",
  "devops-27",
  "sec-110",
]);

const topics = allTopics();
const categorySlugs = new Set(categories.map((c) => c.slug));
const articleBySlug = new Map(articles.map((a) => [a.slug, a]));

describe("editorial backlog", () => {
  it("gives every topic a unique id", () => {
    const seen = new Map<string, string>();
    for (const topic of topics) {
      expect(seen.has(topic.id), `duplicate id ${topic.id}`).toBe(false);
      seen.set(topic.id, topic.title);
    }
  });

  it("points every topic at a real category", () => {
    for (const topic of topics) {
      expect(categorySlugs.has(topic.category), `${topic.id} -> ${topic.category}`).toBe(true);
    }
  });

  it("points every segment at a real category", () => {
    for (const segment of segments) {
      expect(categorySlugs.has(segment.category), segment.category).toBe(true);
    }
  });

  it("resolves relatedTopics to real topics", () => {
    const ids = new Set(topics.map((t) => t.id));
    for (const topic of topics) {
      for (const related of topic.relatedTopics ?? []) {
        expect(ids.has(related), `${topic.id} -> unknown topic ${related}`).toBe(true);
      }
      expect(topic.relatedTopics ?? [], `${topic.id} lists itself`).not.toContain(topic.id);
    }
  });

  it("backs every current PUBLISHED topic with a published article", () => {
    for (const topic of topics.filter(
      (t) => t.status === "PUBLISHED" && !LEGACY_UNCONVERTED_ARTICLE_TOPICS.has(t.id),
    )) {
      expect(topic.articleSlug, `${topic.id} is PUBLISHED with no articleSlug`).toBeDefined();
      const article = articleBySlug.get(topic.articleSlug!);
      expect(article, `${topic.id} -> unknown article ${topic.articleSlug}`).toBeDefined();
      expect(article!.draft ?? false, `${topic.id} is PUBLISHED but the article is a draft`).toBe(
        false,
      );
    }
  });

  it("keeps a topic's status consistent with its article's actual state", () => {
    const wrong: string[] = [];
    for (const topic of topics) {
      if (!topic.articleSlug || LEGACY_UNCONVERTED_ARTICLE_TOPICS.has(topic.id)) continue;
      const article = articleBySlug.get(topic.articleSlug);
      if (!article) continue;
      const published = !(article.draft ?? false);
      if (published && topic.status !== "PUBLISHED") {
        wrong.push(`${topic.id} is ${topic.status} but ${article.slug} is published`);
      }
      if (!published && topic.status === "PUBLISHED") {
        wrong.push(`${topic.id} is PUBLISHED but ${article.slug} is a draft`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it("links current topics that name an article to a real one", () => {
    for (const topic of topics.filter(
      (t) => t.articleSlug && !LEGACY_UNCONVERTED_ARTICLE_TOPICS.has(t.id),
    )) {
      expect(
        articleBySlug.has(topic.articleSlug!),
        `${topic.id} -> unknown article ${topic.articleSlug}`,
      ).toBe(true);
    }
  });

  it("keeps the planned pillar hierarchy coherent", () => {
    const slugOf = (t: Topic) => t.articleSlug ?? t.plannedSlug;

    for (const pillarTopic of topics.filter((t) => t.pillar)) {
      expect(
        slugOf(pillarTopic),
        `pillar ${pillarTopic.id} has no plannedSlug or articleSlug, so nothing can reference it`,
      ).toBeDefined();
    }

    const pillarSlugs = new Set(
      topics
        .filter((t) => t.pillar)
        .map(slugOf)
        .filter(Boolean) as string[],
    );

    for (const topic of topics) {
      if (!topic.pillarSlug) continue;
      expect(topic.pillarSlug, `${topic.id} points at itself`).not.toBe(slugOf(topic));
      const asArticle = articleBySlug.get(topic.pillarSlug);
      if (asArticle) {
        expect(
          asArticle.pillar,
          `${topic.id} -> "${topic.pillarSlug}" exists as an article but is not a pillar`,
        ).toBeTruthy();
      } else {
        expect(
          pillarSlugs.has(topic.pillarSlug),
          `${topic.id} -> "${topic.pillarSlug}" is neither a published pillar nor a planned one`,
        ).toBe(true);
      }
    }

    for (const pillarTopic of topics.filter((t) => t.pillar)) {
      const children = topics.filter((t) => t.pillarSlug === slugOf(pillarTopic));
      expect(
        children.length,
        `pillar ${pillarTopic.id} has no planned supporting topics`,
      ).toBeGreaterThan(0);
    }
  });

  it("does not plan two topics against the same target keyword", () => {
    const byKeyword = new Map<string, string[]>();
    for (const topic of topics) {
      const key = topic.targetKeyword.trim().toLowerCase();
      byKeyword.set(key, [...(byKeyword.get(key) ?? []), topic.id]);
    }
    for (const [keyword, ids] of byKeyword) {
      expect(ids.length, `"${keyword}" targeted by ${ids.join(", ")}`).toBe(1);
    }
  });

  it("keeps every published article represented in the backlog", () => {
    const planned = new Set(topics.map((t) => t.articleSlug).filter(Boolean));
    const unplanned = articles.filter((a) => !a.draft && !planned.has(a.slug)).map((a) => a.slug);
    expect(unplanned, "published articles missing from the backlog").toEqual([]);
  });
});

describe("editorial isolation", () => {
  it("is never imported from src/", () => {
    const offenders = readdirSync("src", { recursive: true, encoding: "utf8" })
      .filter((entry) => /\.(ts|tsx)$/.test(entry))
      .map((entry) => join("src", entry))
      .filter((file) => /from\s+["'][^"']*editorial/.test(readFileSync(file, "utf8")))
      .map((file) => file.split(sep).join("/"));
    expect(offenders).toEqual([]);
  }, 30_000);
});
