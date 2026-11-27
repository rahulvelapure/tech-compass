import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { allArticles, articlePath, getCategory } from "@/lib/content";
import {
  getMostVisitedArticles,
  rankMostVisited,
  type RankedArticleView,
} from "@/lib/views.functions";

const counts = new Intl.NumberFormat("en-US");

/**
 * Editorial "Most visited" ranked readership module (`01`–`05`).
 *
 * Renders a deterministic SSR baseline on first paint (zero layout shift, full
 * HTML with JS disabled) and reconciles on mount with live D1 view counts so
 * real reader visits dynamically update both the counts and the ranking order.
 */
export function MostVisitedSection() {
  const fetchMostVisited = useServerFn(getMostVisitedArticles);

  const bySlug = useMemo(() => new Map(allArticles.map((article) => [article.slug, article])), []);

  const initialRanking = useMemo(() => rankMostVisited(allArticles, {}, 5), []);

  const { data: ranked = initialRanking } = useQuery<RankedArticleView[]>({
    queryKey: ["most-visited", 5],
    queryFn: async (): Promise<RankedArticleView[]> => {
      try {
        return (await fetchMostVisited()) as RankedArticleView[];
      } catch {
        return initialRanking;
      }
    },
    initialData: initialRanking,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const resolved = ranked
    .map((entry) => {
      const article = bySlug.get(entry.slug);
      return article ? { article, viewTotal: entry.viewTotal } : undefined;
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  if (resolved.length === 0) return null;

  return (
    <section aria-label="Most visited" className="border-t border-hairline py-10 lg:py-12">
      <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="display-2">Most visited</h2>
          <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground">
            Ranked by total article reads across Substrate.
          </p>
        </div>

        <ol className="divide-y divide-hairline lg:col-span-8 lg:border-l lg:border-hairline lg:pl-10">
          {resolved.map(({ article, viewTotal }, index) => {
            const rank = String(index + 1).padStart(2, "0");
            const category = getCategory(article.category);
            const formattedViews = counts.format(viewTotal);

            return (
              <li
                key={article.slug}
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:gap-x-5"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-[1.35rem] font-medium leading-none tabular-nums text-ink-faint"
                >
                  {rank}
                </span>

                <div className="min-w-0">
                  <p className="eyebrow flex flex-wrap items-center gap-x-1.5">
                    <Link
                      to="/$category"
                      params={{ category: article.category }}
                      className="inline-flex min-h-6 min-w-6 items-center text-link transition-colors hover:underline"
                    >
                      {category?.label ?? article.category}
                    </Link>
                    <span className="font-normal tabular-nums text-muted-foreground">
                      &middot; {article.readingMinutes} min read
                    </span>
                  </p>

                  <h3 className="headline mt-1 text-[1.15rem] sm:text-[1.225rem]">
                    <Link to={articlePath(article)} className="transition-colors hover:text-link">
                      {article.title}
                    </Link>
                  </h3>

                  <span
                    aria-label={`${formattedViews} article views`}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[0.8125rem] tabular-nums text-muted-foreground sm:hidden"
                  >
                    <Eye className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>{formattedViews}</span>
                  </span>
                </div>

                <span
                  aria-label={`${formattedViews} article views`}
                  title={`${formattedViews} views`}
                  className="hidden items-center gap-1.5 self-center text-[0.8125rem] tabular-nums text-muted-foreground sm:inline-flex"
                >
                  <Eye className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{formattedViews}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
