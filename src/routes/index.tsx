import { createFileRoute, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { MostVisitedSection } from "@/components/site/MostVisitedSection";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { HeaderAdSlot, InFeedAdSlot } from "@/components/monetization/AdSlot";
import { allArticles, formatDate, getAuthor, getCategory, lastPublishedAt } from "@/lib/content";
import { HOMEPAGE_SECTIONS, selectHomepageComposition } from "@/lib/homepage.functions";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => selectHomepageComposition(),

  /*
   * Front-page metadata stays constant across requests.
   */
  head: () => ({
    meta: pageMeta({
      title: `${site.name}: ${site.metaTagline}`,
      description: site.description,
      path: "/",
    }),
    links: canonical("/"),
  }),
  component: HomePage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="wrap">{children}</div>;
}

function DeskHeader({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
      <div className="max-w-2xl">
        <h2 className="display-2">{title}</h2>
        {children && (
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{children}</p>
        )}
      </div>
      {href && (
        <Link
          to="/$category"
          params={{ category: href }}
          className="inline-flex min-h-6 items-center text-[0.875rem] font-medium text-link transition-colors hover:underline"
        >
          All {title} &rarr;
        </Link>
      )}
    </div>
  );
}

function HomePage() {
  const { leadSlug, secondarySlugs, latestSlugs, sectionSlugs } = Route.useLoaderData();

  const bySlug = new Map(allArticles.map((article) => [article.slug, article]));
  const resolve = (slugs: string[]) =>
    slugs.map((slug) => bySlug.get(slug)).filter((article) => article !== undefined);

  const lead = bySlug.get(leadSlug) ?? allArticles[0]!;
  const secondary = resolve(secondarySlugs);
  const latest = resolve(latestSlugs);
  const author = getAuthor("rahul-velapure");

  return (
    <>
      <h1 className="sr-only">
        {site.name}: {site.metaTagline}
      </h1>

      <Shell>
        <HeaderAdSlot />
      </Shell>

      {/* Tier 1: Primary lead story and secondary analysis rail */}
      <Shell>
        <section
          aria-label="Featured analysis"
          className="grid grid-cols-1 gap-x-12 gap-y-10 py-8 lg:grid-cols-12 lg:py-12"
        >
          <div className="lg:col-span-7">
            <ArticleCard article={lead} variant="lead" />
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-hairline lg:pl-10">
            <h2 className="kicker mb-5">Recent analysis</h2>
            <div className="divide-y divide-hairline">
              {secondary.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="index" />
              ))}
            </div>
          </div>
        </section>
      </Shell>

      {/* Tier 2: Chronological latest ledger */}
      {latest.length > 0 && (
        <Shell>
          <section className="border-t border-hairline py-10 lg:py-12">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="display-2">Latest</h2>
                <span className="text-[0.8125rem] tabular-nums text-muted-foreground">
                  Updated {formatDate(lastPublishedAt())}
                </span>
              </div>
              <Link
                to="/search"
                className="inline-flex min-h-6 items-center text-[0.875rem] font-medium text-link transition-colors hover:underline"
              >
                Search full archive &rarr;
              </Link>
            </div>

            <div className="divide-y divide-hairline border-t border-hairline">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="row" />
              ))}
            </div>

            <InFeedAdSlot />
          </section>
        </Shell>
      )}

      {/* Ranked readership leaderboard based on per-article visits */}
      <Shell>
        <MostVisitedSection />
      </Shell>

      {/* Tier 3: Curated subject desks */}
      {HOMEPAGE_SECTIONS.map(({ slug, title, form }) => {
        const category = getCategory(slug);
        const all = resolve(sectionSlugs[slug] ?? []);
        if (!category || all.length === 0) return null;

        const hasRail = all.length > 1;

        return (
          <Shell key={slug}>
            <section className="border-t border-hairline py-10 lg:py-12">
              <DeskHeader title={title} href={slug}>
                {category.intro}
              </DeskHeader>

              {form === "feature" && (
                <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
                  <div className={hasRail ? "lg:col-span-7" : "lg:col-span-12"}>
                    <ArticleCard article={all[0]!} variant="feature" />
                  </div>
                  {hasRail && (
                    <div className="divide-y divide-hairline lg:col-span-5 lg:border-l lg:border-hairline lg:pl-10">
                      {all.slice(1, 5).map((a) => (
                        <ArticleCard key={a.slug} article={a} variant="index" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {form === "grid" && (
                <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {all.slice(0, 3).map((a) => (
                    <ArticleCard key={a.slug} article={a} variant="column" />
                  ))}
                </div>
              )}

              {form === "briefs" && (
                <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
                  <div className={hasRail ? "lg:col-span-5" : "lg:col-span-12"}>
                    <ArticleCard article={all[0]!} variant="feature" />
                  </div>
                  {hasRail && (
                    <div className="lg:col-span-7 lg:border-l lg:border-hairline lg:pl-10">
                      <div className="grid gap-x-10 sm:grid-cols-2">
                        {all.slice(1, 9).map((a) => (
                          <ArticleCard key={a.slug} article={a} variant="brief" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </Shell>
        );
      })}

      {/* Tier 4: Editorial charter and working resources */}
      <Shell>
        <section className="grid gap-x-12 gap-y-8 border-t border-hairline py-10 lg:grid-cols-12 lg:py-12">
          <div className="lg:col-span-7">
            <h2 className="kicker mb-2.5">Editorial standards</h2>
            <p className="max-w-xl text-[0.9375rem] leading-relaxed text-ink-soft">
              Written by {author.name}. Every piece states its basis up front — hands-on testing,
              lab verification, primary documentation, or analysis — without unverified claims or
              sponsored recommendations.
            </p>
            <Link
              to="/about"
              className="mt-3.5 inline-flex min-h-6 items-center text-[0.875rem] font-medium text-link hover:underline"
            >
              How articles are researched &rarr;
            </Link>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-hairline lg:pl-10">
            <h2 className="kicker mb-2.5">Working resources</h2>
            <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
              Rollout checklists, policy inventories, and configuration matrices that accompany the
              technical guides.
            </p>
            <Link
              to="/resources"
              className="mt-3.5 inline-flex min-h-6 items-center text-[0.875rem] font-medium text-link hover:underline"
            >
              View planned resources &rarr;
            </Link>
          </div>
        </section>
      </Shell>

      <NewsletterCTA />
    </>
  );
}
