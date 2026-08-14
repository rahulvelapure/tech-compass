import { readFileSync, readdirSync, statSync } from "node:fs";
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
 */

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

  it("backs every PUBLISHED topic with a published article", () => {
    for (const topic of topics.filter((t) => t.status === "PUBLISHED")) {
      expect(topic.articleSlug, `${topic.id} is PUBLISHED with no articleSlug`).toBeDefined();
      const article = articleBySlug.get(topic.articleSlug!);
      expect(article, `${topic.id} -> unknown article ${topic.articleSlug}`).toBeDefined();
      expect(article!.draft ?? false, `${topic.id} is PUBLISHED but the article is a draft`).toBe(
        false,
      );
    }
  });

  it("keeps a topic's status consistent with its article's actual state", () => {
    // The dashboard is only as honest as this field, and it drifted: 13 topics
    // sat in EDITORIAL_REVIEW while their articles were live, so `bun run
    // inventory` reported 4 published against a real 17. Nothing caught it,
    // because the other checks only ask whether an article exists.
    const wrong: string[] = [];
    for (const topic of topics) {
      if (!topic.articleSlug) continue;
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

  it("links any topic that names an article to a real one", () => {
    for (const topic of topics.filter((t) => t.articleSlug)) {
      expect(
        articleBySlug.has(topic.articleSlug!),
        `${topic.id} -> unknown article ${topic.articleSlug}`,
      ).toBe(true);
    }
  });

  it("keeps the planned pillar hierarchy coherent", () => {
    /** The slug a topic's article has, or will have. */
    const slugOf = (t: Topic) => t.articleSlug ?? t.plannedSlug;

    // Every pillar needs a stable name before its cluster can point at it.
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

      // If the pillar already exists as an article it must really be a pillar;
      // otherwise some topic must be planning to write it. A pillarSlug that
      // matches neither is a dangling cluster.
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

    // A pillar with nothing beneath it is an orphan with a grand title.
    for (const pillarTopic of topics.filter((t) => t.pillar)) {
      const children = topics.filter((t) => t.pillarSlug === slugOf(pillarTopic));
      expect(
        children.length,
        `pillar ${pillarTopic.id} has no planned supporting topics`,
      ).toBeGreaterThan(0);
    }
  });

  it("does not plan two topics against the same target keyword", () => {
    // Two articles chasing one query compete with each other. Catching it in
    // the backlog is far cheaper than catching it after both are written.
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
    // Otherwise the dashboard under-reports and articles drift out of planning.
    const planned = new Set(topics.map((t) => t.articleSlug).filter(Boolean));
    const unplanned = articles.filter((a) => !a.draft && !planned.has(a.slug)).map((a) => a.slug);
    expect(unplanned, "published articles missing from the backlog").toEqual([]);
  });
});

describe("editorial isolation", () => {
  it("is never imported from src/", () => {
    // A 1,500-entry backlog in the client bundle would be a real regression,
    // and the import would look harmless in review.
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry)) {
          const source = readFileSync(full, "utf8");
          if (/from\s+["'][^"']*editorial/.test(source)) {
            offenders.push(full.split(sep).join("/"));
          }
        }
      }
    };
    walk("src");
    expect(offenders).toEqual([]);
  });
});
