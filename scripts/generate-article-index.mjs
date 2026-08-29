/**
 * Regenerates src/content/articles/index.ts from the article files on disk.
 *
 *   bun run content:index
 *
 * Why a generated barrel rather than auto-discovery: `import.meta.glob` is a
 * Vite transform, and the content store is also imported by the validator
 * (Bun) and the social-card generator (Node). A committed barrel of plain
 * static imports works identically everywhere, is fully typechecked, and keeps
 * the built output deterministic.
 *
 * The barrel is committed, so forgetting to regenerate it would silently drop
 * an article. tests/content-index.test.ts fails when it drifts.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARTICLES_DIR = join(ROOT, "src", "content", "articles");
export const INDEX_PATH = join(ARTICLES_DIR, "index.ts");

/** Every article file, as posix-style paths relative to the articles directory. */
export function articleFiles() {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".ts") && entry !== "index.ts") {
        // Article body helpers can live beside article files. Only files that
        // export the Article object belong in the generated barrel.
        const source = readFileSync(full, "utf8");
        if (/export\s+const\s+article\b/.test(source)) {
          found.push(relative(ARTICLES_DIR, full).split(sep).join("/"));
        }
      }
    }
  };
  walk(ARTICLES_DIR);
  return found.sort();
}

/** slug -> a valid, unique JS identifier. */
function identifier(slug) {
  const camel = slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return /^[0-9]/.test(camel) ? `a${camel}` : camel;
}

export function buildIndex() {
  const files = articleFiles();
  const entries = files.map((file) => {
    const slug = file.slice(file.lastIndexOf("/") + 1, -3);
    return { file, slug, name: identifier(slug) };
  });

  const seen = new Map();
  for (const entry of entries) {
    if (seen.has(entry.name)) {
      throw new Error(
        `Duplicate article slug "${entry.slug}" in ${entry.file} and ${seen.get(entry.name)}. Slugs must be globally unique.`,
      );
    }
    seen.set(entry.name, entry.file);
  }

  // Newest first is applied at read time by lib/content; order here is
  // alphabetical purely so the generated diff is stable.
  const imports = entries
    .map((e) => `import { article as ${e.name} } from "./${e.file.slice(0, -3)}";`)
    .join("\n");
  const list = entries.map((e) => `  ${e.name},`).join("\n");

  return `// GENERATED FILE — do not edit by hand.
// Run \`bun run content:index\` after adding, renaming or removing an article.
//
// One file per article lives under src/content/articles/<category>/<slug>.ts.
// This barrel is what @/content/articles resolves to.

import type { Article } from "../types";

${imports}

export const articles: Article[] = [
${list}
];
`;
}

export function readIndex() {
  try {
    return readFileSync(INDEX_PATH, "utf8");
  } catch {
    return "";
  }
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (invokedDirectly) {
  const next = buildIndex();
  const changed = readIndex() !== next;
  writeFileSync(INDEX_PATH, next);
  console.log(
    changed
      ? `Regenerated index with ${articleFiles().length} articles.`
      : `Index already up to date (${articleFiles().length} articles).`,
  );
}
