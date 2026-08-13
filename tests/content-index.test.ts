import { describe, expect, it } from "vitest";

import { articles } from "@/content/articles";
// @ts-expect-error — plain .mjs tooling module, no type declarations.
import { articleFiles, buildIndex, readIndex } from "../scripts/generate-article-index.mjs";

/**
 * The article index is generated and committed. Nothing enforces that at
 * runtime, so a file added without regenerating would simply never appear on
 * the site — no error, no 404, just a missing article nobody notices.
 *
 * These tests make that failure loud.
 */
describe("generated article index", () => {
  it("is in sync with the files on disk", () => {
    expect(
      readIndex(),
      "\nsrc/content/articles/index.ts is stale. Run: bun run content:index\n",
    ).toBe(buildIndex());
  });

  it("exports one article per file", () => {
    expect(articles.length).toBe((articleFiles() as string[]).length);
  });

  it("stores every article at <category>/<slug>.ts", () => {
    const expected = new Set(articles.map((a) => `${a.category}/${a.slug}.ts`));
    const actual = new Set(articleFiles() as string[]);
    expect(actual).toEqual(expected);
  });
});
