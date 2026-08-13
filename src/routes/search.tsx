import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { ArticleCard } from "@/components/site/ArticleCard";
import { searchArticles } from "@/lib/content";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional().catch("") }),
  head: () => ({
    meta: [
      ...pageMeta({
        title: `Search — ${site.name}`,
        description:
          "Search articles across enterprise IT, AI, cybersecurity, software, gadgets and how-to guides.",
        path: "/search",
      }),
      { name: "robots", content: "noindex, follow" },
    ],
    links: canonical("/search"),
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const query = (q ?? "").trim();
  const results = query ? searchArticles(query) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="headline text-3xl">Search</h1>

      <form method="get" action="/search" className="mt-6 flex gap-3">
        <label htmlFor="q" className="sr-only">
          Search query
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Intune, Wi-Fi 7, conditional access…"
          className="h-11 flex-1 rounded-md border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Search
        </button>
      </form>

      {!query ? (
        <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
          Search across article titles, keywords, tags and body text. Try a product name, an error
          condition, or a standard.
        </p>
      ) : results.length === 0 ? (
        <div className="mt-10">
          <p className="font-serif text-lg font-bold">No results for “{query}”</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nothing published matches that yet. Try a broader term, or browse a section directly.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block text-sm font-medium text-accent hover:underline"
          >
            Back to the homepage →
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"} for “{query}”
          </p>
          <div className="mt-2 divide-y divide-border">
            {results.map((result) => (
              <ArticleCard key={result.article.slug} article={result.article} variant="row" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
