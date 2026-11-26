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
    <div className="wrap py-8">
      <h1 className="article-title">Search</h1>

      <form method="get" action="/search" className="mt-5 flex max-w-[40rem] gap-3">
        <label htmlFor="q" className="sr-only">
          Search query
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Intune, conditional access, NTLM..."
          className="h-11 flex-1 border border-input bg-background px-3 text-[0.9375rem]"
        />
        <button
          type="submit"
          className="h-11 bg-foreground px-6 text-[0.9375rem] font-semibold text-background transition-colors hover:bg-brand hover:text-brand-foreground"
        >
          Search
        </button>
      </form>

      {!query ? (
        <p className="measure mt-8 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Search across article titles, keywords, tags and body text. Try a product name, an error
          condition, or a standard.
        </p>
      ) : results.length === 0 ? (
        <div className="mt-8">
          <p className="headline text-[1.25rem]">No results for &ldquo;{query}&rdquo;</p>
          <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Nothing published matches that yet. Try a broader term, or browse a section directly.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-[0.9375rem] font-medium text-link hover:underline"
          >
            Back to the homepage &rarr;
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-[0.9375rem] text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}
            &rdquo;
          </p>
          <div className="mt-2 divide-y divide-border border-y border-border">
            {results.map((result) => (
              <ArticleCard key={result.article.slug} article={result.article} variant="row" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
