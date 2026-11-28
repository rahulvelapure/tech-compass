import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { articles } from "@/content/articles";
import type { Article } from "@/content/types";

import { sign, toBase64Url } from "./hmac";
import { incrementArticleView, readAllArticleViews, readArticleViews, viewDb } from "./views.db";
import { currentBaselineViewCount } from "./views.seed";

/**
 * Real-time article visit counters and Most Visited ranking.
 *
 * Each published article starts at its deterministic baseline in [2,000, 8,000],
 * accrues smooth 3.00000000%–5.00000000% monthly per-article growth from
 * `VIEW_GROWTH_ANCHOR_MS`, and adds +1 in real time on every visit in D1
 * (`article_view_totals`) with `cache-control: private, no-store`.
 * No cookies or reader identifiers are created when recording a view.
 */

export type ViewSnapshot = { available: true; viewTotal: number } | { available: false };

export interface RankedArticleView {
  slug: string;
  viewTotal: number;
}

const UNAVAILABLE: ViewSnapshot = { available: false };

const slugSchema = z.string().min(1).max(128);

let publishedSlugs: Set<string> | undefined;

function isPublishedSlug(slug: string): boolean {
  publishedSlugs ??= new Set(articles.filter((a) => !a.draft).map((a) => a.slug));
  return publishedSlugs.has(slug);
}

/**
 * Ranks published articles by total visits (`currentBaselineViewCount + genuine_views`),
 * breaking ties by newest publication date first.
 */
export function rankMostVisited(
  publishedArticles: Pick<Article, "slug" | "publishedAt" | "draft">[],
  genuineBySlug: Readonly<Record<string, number>> = {},
  limit = 5,
  nowMs = Date.now(),
): RankedArticleView[] {
  return publishedArticles
    .filter((article) => !article.draft)
    .map((article) => ({
      slug: article.slug,
      publishedAt: article.publishedAt,
      viewTotal: currentBaselineViewCount(article.slug, nowMs) + (genuineBySlug[article.slug] ?? 0),
    }))
    .sort((a, b) => b.viewTotal - a.viewTotal || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit)
    .map(({ slug, viewTotal }) => ({ slug, viewTotal }));
}

/* ------------------------------------------------------------------ */
/* Abuse guard (request-scoped initialisation for Workers safety)      */
/* ------------------------------------------------------------------ */

const viewHits = new Map<string, number[]>();
const MAX_VIEWS_PER_WINDOW = 120;
const VIEW_WINDOW_MS = 10 * 60_000;
let viewIpSalt: string | undefined;

function getViewIpSalt(): string {
  viewIpSalt ??= toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  return viewIpSalt;
}

async function withinViewRateLimit(ip: string, now = Date.now()): Promise<boolean> {
  const key = (await sign(getViewIpSalt(), `view:${ip}`)).slice(0, 22);
  const cutoff = now - VIEW_WINDOW_MS;
  const recent = (viewHits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= MAX_VIEWS_PER_WINDOW) {
    viewHits.set(key, recent);
    return false;
  }

  recent.push(now);
  viewHits.set(key, recent);

  if (viewHits.size > 5_000) {
    for (const [entry, times] of viewHits) {
      if (times.every((t) => t <= cutoff)) viewHits.delete(entry);
    }
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Server functions                                                    */
/* ------------------------------------------------------------------ */

export const recordArticleView = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ slug: slugSchema }).parse(data))
  .handler(async ({ data }): Promise<ViewSnapshot> => {
    if (!isPublishedSlug(data.slug)) return UNAVAILABLE;

    setResponseHeader("cache-control", "private, no-store");

    const baseline = currentBaselineViewCount(data.slug);
    const db = viewDb();
    if (!db) {
      return UNAVAILABLE;
    }

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const allowed = await withinViewRateLimit(ip);

    try {
      const genuine = allowed
        ? await incrementArticleView(db, data.slug)
        : await readArticleViews(db, data.slug);
      return {
        available: true,
        viewTotal: baseline + genuine,
      };
    } catch {
      return {
        available: true,
        viewTotal: baseline,
      };
    }
  });

export const getMostVisitedArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<RankedArticleView[]> => {
    setResponseHeader("cache-control", "private, no-store");

    const nowMs = Date.now();
    const published = articles.filter((a) => !a.draft);
    const db = viewDb();
    if (!db) {
      return rankMostVisited(published, {}, 5, nowMs);
    }

    try {
      const genuineBySlug = await readAllArticleViews(db);
      return rankMostVisited(published, genuineBySlug, 5, nowMs);
    } catch {
      return rankMostVisited(published, {}, 5, nowMs);
    }
  },
);
