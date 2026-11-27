import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { z } from "zod";

import { ArticleCard } from "@/components/site/ArticleCard";
import { articlesForCategory, categories, latestArticles, searchArticles } from "@/lib/content";
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
  const navigate = useNavigate();
  const query = (q ?? "").trim();
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const results = query ? searchArticles(query) : [];
  const recent = !query ? latestArticles(5) : [];
  const activeCategories = categories.filter((c) => articlesForCategory(c).length > 0).slice(0, 10);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    void navigate({
      to: "/search",
      search: trimmed ? { q: trimmed } : {},
    });
  }

  return (
    <div className="wrap py-10 lg:py-14">
      <div className="max-w-[44rem]">
        <p className="kicker">Archive search</p>
        <h1 className="article-title mt-2">Search</h1>
        <p className="standfirst mt-3">
          Search across article headlines, technical keywords, tags, and full text.
        </p>

        <form method="get" action="/search" onSubmit={onSubmit} className="mt-6 flex gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              Search query
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              id="q"
              name="q"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Intune, Conditional Access, NTLM, Terraform…"
              className="h-11 w-full rounded-md border border-input bg-surface pl-10 pr-3.5 text-[0.9375rem] text-foreground placeholder:text-ink-faint focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 cursor-pointer rounded-md bg-foreground px-5 text-[0.875rem] font-semibold text-background transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            Search
          </button>
        </form>
      </div>

      {!query ? (
        <div className="mt-12 grid gap-x-12 gap-y-10 border-t border-hairline pt-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="kicker mb-4">Browse by subject</h2>
            <ul className="flex flex-wrap gap-2">
              {activeCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to="/$category"
                    params={{ category: category.slug }}
                    className="inline-flex min-h-9 items-center rounded-md border border-hairline bg-surface-2/60 px-3 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-border hover:bg-surface-2 hover:text-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-8 lg:border-l lg:border-hairline lg:pl-10">
            <h2 className="kicker mb-4">Latest analysis</h2>
            <div className="divide-y divide-hairline border-y border-hairline">
              {recent.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="row" />
              ))}
            </div>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-10 border-t border-hairline pt-8">
          <h2 className="headline text-[1.35rem]">No results for &ldquo;{query}&rdquo;</h2>
          <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Nothing published matches that query yet. Try a broader term, protocol, or browse one of
            the sections below.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {activeCategories.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link
                  to="/$category"
                  params={{ category: category.slug }}
                  className="inline-flex min-h-9 items-center rounded-md border border-hairline bg-surface-2/60 px-3 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-border hover:text-foreground"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-10 border-t border-hairline pt-6">
          <p className="kicker mb-4 tabular-nums">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>
          <div className="divide-y divide-hairline border-y border-hairline">
            {results.map((result) => (
              <ArticleCard key={result.article.slug} article={result.article} variant="row" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
