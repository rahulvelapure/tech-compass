/**
 * Published-URL manifest.
 *
 * Captures every URL the site exposes, derived from the same helpers the
 * routes use. Its purpose is to make URL breakage impossible to miss during a
 * refactor: snapshot before, snapshot after, diff.
 *
 *   bun run scripts/url-manifest.ts > before.json
 *   # ...refactor...
 *   bun run scripts/url-manifest.ts > after.json
 *   bun run scripts/url-manifest.ts --diff before.json after.json
 *
 * A published article URL changing is a broken link and a lost ranking. The
 * `published` list is the one that must never change without a redirect plan.
 */
import { readFileSync } from "node:fs";

import {
  allArticles,
  articlePath,
  articlesForCategory,
  authors,
  categories,
  draftArticles,
  indexableTags,
} from "../src/lib/content";
import { site } from "../src/lib/site";

interface Manifest {
  /** Never allowed to change. */
  published: string[];
  /** Drafts are noindex and excluded from sitemap/RSS — safe to move. */
  draft: string[];
  /** Category pages that are in the sitemap (i.e. have published content). */
  indexedCategories: string[];
  /** Every category route that resolves, indexed or not. */
  allCategories: string[];
  tags: string[];
  authors: string[];
  static: string[];
  sitemap: string[];
  rss: string[];
  canonical: Record<string, string>;
}

const STATIC_PATHS = [
  "/",
  "/about",
  "/newsletter",
  "/resources",
  "/privacy",
  "/terms",
  "/disclaimer",
];

function build(): Manifest {
  const published = allArticles.map((a) => articlePath(a)).sort();
  const draft = draftArticles.map((a) => articlePath(a)).sort();
  const indexedCategories = categories
    .filter((c) => articlesForCategory(c).length > 0)
    .map((c) => `/${c.slug}`)
    .sort();
  const allCategories = categories.map((c) => `/${c.slug}`).sort();
  const tagPaths = indexableTags()
    .map((t) => `/tag/${t.slug}`)
    .sort();
  const authorPaths = authors.map((a) => `/author/${a.id}`).sort();

  // Mirrors src/routes/sitemap[.]xml.ts, in the same order.
  const sitemap = [
    ...STATIC_PATHS,
    ...indexedCategories,
    ...authorPaths,
    ...tagPaths,
    ...allArticles.map((a) => articlePath(a)),
  ].map((p) => `${site.url}${p}`);

  // Mirrors src/routes/rss[.]xml.ts — newest 30, in publication order.
  const rss = allArticles.slice(0, 30).map((a) => `${site.url}${articlePath(a)}`);

  const canonical: Record<string, string> = {};
  for (const a of allArticles) canonical[articlePath(a)] = `${site.url}${articlePath(a)}`;

  return {
    published,
    draft,
    indexedCategories,
    allCategories,
    tags: tagPaths,
    authors: authorPaths,
    static: STATIC_PATHS,
    sitemap,
    rss,
    canonical,
  };
}

function diff(beforePath: string, afterPath: string): number {
  const a = JSON.parse(readFileSync(beforePath, "utf8")) as Manifest;
  const b = JSON.parse(readFileSync(afterPath, "utf8")) as Manifest;

  let failures = 0;
  const report = (label: string, before: string[], after: string[], fatal: boolean) => {
    const removed = before.filter((x) => !after.includes(x));
    const added = after.filter((x) => !before.includes(x));
    const status = removed.length === 0 && added.length === 0 ? "unchanged" : "CHANGED";
    console.log(`\n${label}: ${status} (${before.length} -> ${after.length})`);
    for (const url of removed) {
      console.log(`  ${fatal ? "REMOVED (FATAL)" : "removed"}  ${url}`);
      if (fatal) failures++;
    }
    for (const url of added) console.log(`  added    ${url}`);
  };

  // The hard constraint: a published URL must never disappear.
  report("Published article URLs", a.published, b.published, true);
  report("Draft article URLs", a.draft, b.draft, false);
  report("Indexed category URLs", a.indexedCategories, b.indexedCategories, false);
  report("All category routes", a.allCategories, b.allCategories, false);
  report("Tag URLs", a.tags, b.tags, false);
  report("Author URLs", a.authors, b.authors, false);
  report("Static URLs", a.static, b.static, false);
  report("Sitemap entries", a.sitemap, b.sitemap, false);
  report("RSS entries", a.rss, b.rss, false);

  // Canonicals must not drift for a URL that exists in both manifests.
  const canonicalChanges: string[] = [];
  for (const [path, url] of Object.entries(a.canonical)) {
    if (b.canonical[path] && b.canonical[path] !== url) {
      canonicalChanges.push(`  ${path}: ${url} -> ${b.canonical[path]}`);
      failures++;
    }
  }
  console.log(
    `\nCanonical URLs: ${canonicalChanges.length === 0 ? "unchanged" : "CHANGED"} (${
      Object.keys(a.canonical).length
    } -> ${Object.keys(b.canonical).length})`,
  );
  for (const line of canonicalChanges) console.log(line);

  console.log(
    failures === 0
      ? "\nPASS — 0 published URLs changed."
      : `\nFAIL — ${failures} published URL/canonical change(s).`,
  );
  return failures === 0 ? 0 : 1;
}

const args = process.argv.slice(2);
if (args[0] === "--diff") {
  const [, before, after] = args;
  if (!before || !after) {
    console.error("usage: url-manifest.ts --diff <before.json> <after.json>");
    process.exit(2);
  }
  process.exit(diff(before, after));
} else {
  console.log(JSON.stringify(build(), null, 2));
}
