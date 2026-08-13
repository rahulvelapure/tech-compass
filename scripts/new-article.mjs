/**
 * Scaffolds a new article file and regenerates the index.
 *
 *   bun run content:new <category-slug> <article-slug>
 *
 * The scaffold is created with `draft: true`, so it is noindex, excluded from
 * every listing and held to the draft word-count bar. That keeps the build
 * green while you write. Removing the draft flag is the act of publishing.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const [category, slug] = process.argv.slice(2);

if (!category || !slug) {
  console.error("Usage: bun run content:new <category-slug> <article-slug>");
  process.exit(1);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
for (const [label, value] of [
  ["category", category],
  ["slug", slug],
]) {
  if (!SLUG_PATTERN.test(value)) {
    console.error(`Invalid ${label} "${value}": use lowercase words separated by single hyphens.`);
    process.exit(1);
  }
}

// The category must already exist, or the article would 404.
const categoriesSource = readFileSync(join(ROOT, "src/content/categories.ts"), "utf8");
if (!categoriesSource.includes(`slug: "${category}"`)) {
  console.error(
    `Unknown category "${category}". Add it to src/content/categories.ts first, or pick an existing one.`,
  );
  process.exit(1);
}

const target = join(ROOT, "src/content/articles", category, `${slug}.ts`);
if (existsSync(target)) {
  console.error(`${slug}.ts already exists in ${category}.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const scaffold = `import type { Article } from "../../types";

export const article: Article = {
  slug: "${slug}",
  category: "${category}",
  title: "",
  seoTitle: "",
  metaDescription: "",
  standfirst: "",
  excerpt: "",
  authorId: "rahul-velapure",
  publishedAt: "${today}",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "",
  secondaryKeywords: [],
  tags: [],
  reviewStatus: "research-based",
  methodology: "",
  body: [
    {
      type: "p",
      text: "",
    },
  ],
  faq: [],
  sources: [],
};
`;

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, scaffold);

execFileSync(process.execPath, [join(ROOT, "scripts/generate-article-index.mjs")], {
  stdio: "inherit",
});

console.log(`\nCreated src/content/articles/${category}/${slug}.ts`);
console.log(`URL when published: /${category}/${slug}`);
console.log("\nNext: write it, then `bun run validate:content`.");
