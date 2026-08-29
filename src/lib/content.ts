import { articles } from "@/content/articles";
import { categories, getCategory } from "@/content/categories";
import { authors, getAuthor } from "@/content/authors";
import type { Article, Block, Category, ContentType } from "@/content/types";

export { articles, categories, getCategory, getAuthor, authors };

const byDateDesc = (a: Article, b: Article) => b.publishedAt.localeCompare(a.publishedAt);

/**
 * Everything published, newest first.
 *
 * Drafts are excluded here rather than filtered at each call site, so a
 * half-finished article cannot leak into a listing, the sitemap, RSS or search
 * by someone forgetting a filter. Use `articles` for the raw store.
 */
export const allArticles = [...articles].filter((a) => !a.draft).sort(byDateDesc);

/** Staged but unpublished. Reachable by direct URL only, and noindex. */
export const draftArticles = [...articles].filter((a) => a.draft).sort(byDateDesc);

export function getArticle(category: string, slug: string): Article | undefined {
  return articles.find((a) => a.category === category && a.slug === slug);
}

export function articlesByCategory(slug: string): Article[] {
  return allArticles.filter((a) => a.category === slug);
}

/**
 * Published articles of one editorial format, wherever they live.
 *
 * Backs the derived index routes (`/comparisons`, `/how-to`, …). These pages
 * list articles they do not own — the canonical URL always stays under the
 * article's subject category, so nothing is reachable at two addresses.
 */
export function articlesByContentType(contentType: ContentType): Article[] {
  return allArticles.filter((a) => a.contentType === contentType);
}

/**
 * Everything a category page should list, whichever kind of category it is.
 *
 * A subject category lists what it owns; a derived index lists by format.
 */
export function articlesForCategory(category: Category): Article[] {
  return category.contentTypeIndex
    ? articlesByContentType(category.contentTypeIndex)
    : articlesByCategory(category.slug);
}

export function latestArticles(limit = 6, excludeSlugs: string[] = []): Article[] {
  return allArticles.filter((a) => !excludeSlugs.includes(a.slug)).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Front-page                                                          */
/* ------------------------------------------------------------------ */

/*
 * Which articles lead the front page is decided per request in
 * src/lib/homepage.selection.ts, not here. A clock-bucketed helper used to
 * live at this spot; it gave every visitor the same lead for six hours at a
 * time, which is the behaviour that had to change.
 */

/**
 * When the publication last published something.
 *
 * Deliberately not the lead's own date. The masthead reports the state of the
 * publication, and once the lead rotates, reading the date off it would make
 * the front page appear to travel backwards in time whenever an older featured
 * article came round.
 */
export function lastPublishedAt(): string {
  return allArticles[0]?.publishedAt ?? "";
}

function keywordSet(article: Article): Set<string> {
  const raw = [article.primaryKeyword, ...article.secondaryKeywords, ...article.tags];
  const words = raw
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9+.]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return new Set(words);
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "your",
  "how",
  "what",
  "when",
  "why",
  "not",
  "are",
  "you",
  "its",
  "into",
  "out",
  "vs",
  "versus",
]);

/**
 * Related articles, scored rather than hard-coded.
 *
 * Signals, in order of weight: an explicit editorial override, shared tags,
 * keyword overlap (primary + secondary keywords and tags, tokenised), the same
 * subcategory, and the same category. Recency breaks ties. Articles with no
 * signal at all are only used as a last-resort backfill so no page is orphaned.
 */
export function relatedArticles(article: Article, limit = 3): Article[] {
  // Resolved against published articles only — an editorial override must not
  // be able to surface a draft.
  const picked: Article[] = (article.relatedSlugs ?? [])
    .map((slug) => allArticles.find((a) => a.slug === slug))
    .filter((a): a is Article => Boolean(a) && a!.slug !== article.slug);
  if (picked.length >= limit) return picked.slice(0, limit);

  const ownKeywords = keywordSet(article);

  const scored = allArticles
    .filter((a) => a.slug !== article.slug && !picked.includes(a))
    .map((a) => {
      const sharedTags = a.tags.filter((t) => article.tags.includes(t)).length;
      const candidateKeywords = keywordSet(a);
      let keywordOverlap = 0;
      for (const word of candidateKeywords) {
        if (ownKeywords.has(word)) keywordOverlap += 1;
      }
      const sameCategory = a.category === article.category ? 1 : 0;
      const sameSubcategory = a.subcategory && a.subcategory === article.subcategory ? 1 : 0;
      const score = sharedTags * 4 + keywordOverlap * 2 + sameSubcategory * 3 + sameCategory * 2;
      return { a, score };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score || byDateDesc(x.a, y.a));

  const result = [...picked, ...scored.map((s) => s.a)];
  for (const candidate of allArticles) {
    if (result.length >= limit) break;
    if (candidate.slug !== article.slug && !result.includes(candidate)) {
      result.push(candidate);
    }
  }
  return result.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Reading time                                                        */
/* ------------------------------------------------------------------ */

/** Adult reading speed for technical prose, at the conservative end. */
const WORDS_PER_MINUTE = 230;

/**
 * Code is scanned, not read at prose speed, but it is not free either.
 * Six seconds a line is a defensible middle for the kind of configuration
 * and command samples this publication uses.
 */
const SECONDS_PER_CODE_LINE = 6;

/** Words in a block, ignoring anything that is not read as prose. */
function blockWords(block: Block): number {
  let text = "";
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
    case "quote":
      text = block.text;
      break;
    case "ul":
    case "ol":
      text = block.items.join(" ");
      break;
    case "table":
      text = [block.caption ?? "", ...block.head, ...block.rows.flat()].join(" ");
      break;
    case "callout":
      text = `${block.title} ${block.text}`;
      break;
    case "diagram":
      text = `${block.title} ${block.caption ?? ""}`;
      break;
    case "figure":
      // Title and caption only, matching `diagram`. The alt text is an
      // accessibility affordance, not prose — counting it would let a
      // diagram-heavy article inflate its way past the thin-content check.
      text = `${block.title} ${block.caption ?? ""}`;
      break;
    default:
      return 0;
  }
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Reading time derived from the article body.
 *
 * The stored `readingMinutes` must match this — the content validator fails
 * the build when it drifts. Displaying an inflated figure is a small lie that
 * readers notice immediately and that nothing else in the article recovers from.
 */
export function estimateReadingMinutes(article: Pick<Article, "body">): number {
  const words = article.body.reduce((total, block) => total + blockWords(block), 0);
  const codeLines = article.body.reduce(
    (total, block) => total + (block.type === "code" ? block.code.split("\n").length : 0),
    0,
  );
  const minutes = words / WORDS_PER_MINUTE + (codeLines * SECONDS_PER_CODE_LINE) / 60;
  return Math.max(1, Math.round(minutes));
}

/** Prose word count, exposed for the content validator's thin-content check. */
export function articleWordCount(article: Pick<Article, "body">): number {
  return article.body.reduce((total, block) => total + blockWords(block), 0);
}

/* ------------------------------------------------------------------ */
/* Review cadence                                                      */
/* ------------------------------------------------------------------ */

export type ReviewState = "current" | "due" | "overdue" | "unscheduled";

/**
 * Whether a published article is still within its review window.
 *
 * Technical articles rot quietly: a licensing change or a renamed blade makes
 * a paragraph wrong without anything failing. Scheduling the check is the only
 * mechanism that catches it, so an article with no `nextReviewAt` is reported
 * as `unscheduled` rather than silently assumed fine.
 */
export function reviewState(article: Article, today = new Date()): ReviewState {
  if (!article.nextReviewAt) return "unscheduled";

  const due = new Date(`${article.nextReviewAt}T00:00:00Z`);
  const days = Math.floor((today.getTime() - due.getTime()) / 86_400_000);

  if (days > 60) return "overdue";
  if (days >= 0) return "due";
  return "current";
}

/** Published articles needing attention, most overdue first. */
export function articlesDueForReview(today = new Date()): Article[] {
  return allArticles
    .filter((article) => {
      const state = reviewState(article, today);
      return state === "due" || state === "overdue";
    })
    .sort((a, b) => (a.nextReviewAt ?? "").localeCompare(b.nextReviewAt ?? ""));
}

/* ------------------------------------------------------------------ */
/* Tags                                                                */
/* ------------------------------------------------------------------ */

/**
 * Tags below this many articles get a page, but a `noindex` one.
 *
 * Tag explosion is a real SEO problem: a hundred pages carrying one article
 * each are thin duplicates of the article they list, and they dilute the
 * crawl budget that should go to the articles themselves. A tag earns an
 * indexable page by actually organising a body of work.
 */
export const TAG_INDEX_THRESHOLD = 3;

/** URL form of a tag. "Entra ID" -> "entra-id". */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface TagSummary {
  /** Display form, as written on the articles. */
  name: string;
  slug: string;
  articles: Article[];
  /** Whether the page is worth putting in the index and the sitemap. */
  indexable: boolean;
}

/**
 * Every tag in the store, with its articles, newest first.
 *
 * Built once. The display name is taken from the first article that used the
 * tag, so casing stays consistent even if a later article differs.
 */
const tagRegistry: Map<string, TagSummary> = (() => {
  const map = new Map<string, TagSummary>();
  for (const article of allArticles) {
    for (const tag of article.tags) {
      const slug = tagSlug(tag);
      if (!slug) continue;
      const existing = map.get(slug);
      if (existing) existing.articles.push(article);
      else map.set(slug, { name: tag, slug, articles: [article], indexable: false });
    }
  }
  for (const summary of map.values()) {
    summary.indexable = summary.articles.length >= TAG_INDEX_THRESHOLD;
  }
  return map;
})();

export function getTag(slug: string): TagSummary | undefined {
  return tagRegistry.get(slug);
}

/** All tags, most-used first, then alphabetical. */
export function allTags(): TagSummary[] {
  return [...tagRegistry.values()].sort(
    (a, b) => b.articles.length - a.articles.length || a.name.localeCompare(b.name),
  );
}

/** Only the tags that earned an indexable page — used by the sitemap. */
export function indexableTags(): TagSummary[] {
  return allTags().filter((tag) => tag.indexable);
}

/* ------------------------------------------------------------------ */
/* Authors                                                             */
/* ------------------------------------------------------------------ */

export function articlesByAuthor(authorId: string): Article[] {
  return allArticles.filter((article) => article.authorId === authorId);
}

export function authorPath(authorId: string): string {
  return `/author/${authorId}`;
}

/** Chronological neighbours for prev/next navigation. */
export function articleNeighbours(article: Article) {
  const index = allArticles.findIndex((a) => a.slug === article.slug);
  return {
    previous: index > 0 ? allArticles[index - 1] : undefined,
    next: index >= 0 && index < allArticles.length - 1 ? allArticles[index + 1] : undefined,
  };
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function tableOfContents(body: Block[]): TocItem[] {
  return body
    .filter((b): b is Extract<Block, { type: "h2" | "h3" }> => b.type === "h2" || b.type === "h3")
    .map((b) => ({ id: b.id, text: b.text, level: b.type === "h2" ? 2 : 3 }));
}

export function articlePath(article: Pick<Article, "category" | "slug">) {
  return `/${article.category}/${article.slug}`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const reviewStatusLabel: Record<Article["reviewStatus"], string> = {
  "hands-on": "Hands-on",
  "lab-verified": "Lab-verified",
  "research-based": "Research-based",
  opinion: "Analysis",
};

/** Plain text of a body block, used for search indexing. */
function blockText(block: Block): string {
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
      return block.text;
    case "ul":
    case "ol":
      return block.items.join(" ");
    case "table":
      return [block.caption ?? "", ...block.head, ...block.rows.flat()].join(" ");
    case "callout":
      return `${block.title} ${block.text}`;
    case "diagram":
      return `${block.title} ${block.caption ?? ""}`;
    case "figure":
      // Alt text is indexed here, unlike in the word count: describing what a
      // diagram shows is exactly the phrasing a reader would search for.
      return `${block.title} ${block.alt} ${block.caption ?? ""}`;
    case "quote":
      return block.text;
    case "code":
      return block.filename ?? "";
    default:
      return "";
  }
}

export interface SearchResult {
  article: Article;
  score: number;
}

export function searchArticles(query: string): SearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  if (terms.length === 0) return [];

  return allArticles
    .map((article) => {
      const category = getCategory(article.category);
      const title = article.title.toLowerCase();
      const summary =
        `${article.standfirst} ${article.excerpt} ${article.metaDescription}`.toLowerCase();
      const keywords = [
        article.primaryKeyword,
        ...article.secondaryKeywords,
        ...article.tags,
        article.subcategory ?? "",
        category?.title ?? "",
      ]
        .join(" ")
        .toLowerCase();
      const body = article.body.map(blockText).join(" ").toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 8;
        if (keywords.includes(term)) score += 5;
        if (summary.includes(term)) score += 3;
        if (body.includes(term)) score += 1;
      }
      return { article, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || byDateDesc(a.article, b.article));
}
