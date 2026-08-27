import { createFileRoute, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { HeaderAdSlot, InFeedAdSlot } from "@/components/monetization/AdSlot";
import { allArticles, formatDate, getAuthor, getCategory, lastPublishedAt } from "@/lib/content";
import { HOMEPAGE_SECTIONS, selectHomepageComposition } from "@/lib/homepage.functions";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({
  /**
   * The composition is chosen on the server, once per request, and passed down
   * as slugs.
   *
   * Choosing while rendering would mean the server and the browser each ran the
   * selection and disagreed — the classic hydration mismatch. Resolved here,
   * both renders read the same answer.
   *
   * Only slugs cross the wire. The component looks each article up from the
   * content store it already has, so no article body is serialised twice.
   */
  loader: () => selectHomepageComposition(),

  /**
   * Metadata is fixed and does not read the lead. The front page's title,
   * description and canonical must not move when the rotation does — that is
   * the difference between a fresh homepage and an unstable one.
   */
  head: () => ({
    meta: pageMeta({
      title: `${site.name} — Technology, explained properly`,
      description: site.description,
      path: "/",
    }),
    links: canonical("/"),
  }),
  component: HomePage,
});

/*
 * The section list lives with the selection logic (homepage.functions.ts), so
 * the server picks articles for exactly the sections this page renders. `form`
 * stays here because it is presentation: each section gets a different shape,
 * so the front page reads as edited rather than generated.
 */

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="wrap">{children}</div>;
}

/** Section head: brand rule, title, optional standfirst and index link. */
function SectionHead({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="max-w-2xl">
        <h2 className="kicker">{title}</h2>
        {children && (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{children}</p>
        )}
      </div>
      {href && (
        <Link
          to="/$category"
          params={{ category: href }}
          className="eyebrow shrink-0 text-muted-foreground transition-colors hover:text-brand"
        >
          All {title} →
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

  // The fallback covers only a composition referencing an article that has since
  // left the store, which static content makes near-impossible.
  const lead = bySlug.get(leadSlug) ?? allArticles[0]!;
  const secondary = resolve(secondarySlugs);
  const latest = resolve(latestSlugs);
  const author = getAuthor("rahul-velapure");

  return (
    <>
      <Shell>
        <HeaderAdSlot />
      </Shell>

      {/*
        Dateline strip.

        Carries the page's only h1 — a front page's heading is the publication,
        not any one story, so every headline below stays an h2. It doubles as a
        masthead device: what this is, and when it was last added to.
      */}
      <Shell>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3">
          <h1 className="eyebrow text-muted-foreground">{site.tagline}</h1>
          <p className="text-xs tabular-nums text-muted-foreground">
            Updated {formatDate(lastPublishedAt())}
          </p>
        </div>
      </Shell>

      {/* ---- Front page: one dominant story, a ruled contents rail beside it ---- */}
      <Shell>
        <section className="grid grid-cols-1 gap-x-12 gap-y-12 py-10 lg:grid-cols-12 lg:py-14">
          <div className="lg:col-span-8">
            <ArticleCard article={lead} variant="lead" />
          </div>

          <aside className="lg:col-span-4 lg:border-l lg:border-border lg:pl-12">
            <h2 className="kicker mb-6">Also today</h2>
            <div className="space-y-7">
              {secondary.map((article, i) => (
                <ArticleCard key={article.slug} article={article} variant="index" index={i} />
              ))}
            </div>
          </aside>
        </section>
      </Shell>

      {/* ---- Latest: a ruled list, not cards ---- */}
      {latest.length > 0 && (
        <Shell>
          <section className="border-t-2 border-foreground py-12">
            <SectionHead title="Latest" />
            <div className="divide-y divide-border border-y border-border">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="row" />
              ))}
            </div>
            <InFeedAdSlot />
          </section>
        </Shell>
      )}

      {/* ---- Subject sections, each in a different form ---- */}
      {HOMEPAGE_SECTIONS.map(({ slug, title, form }) => {
        const category = getCategory(slug);
        const all = resolve(sectionSlugs[slug] ?? []);
        if (!category || all.length === 0) return null;

        /*
         * A two-column section needs something to put in the second column.
         * Cybersecurity currently has one published article, which rendered a
         * lead beside an empty seven-column hole. Below two, the lead simply
         * takes the full width.
         */
        const hasRail = all.length > 1;

        return (
          <Shell key={slug}>
            <section className="border-t border-border py-12">
              <SectionHead title={title} href={slug}>
                {category.intro}
              </SectionHead>

              {form === "feature" && (
                <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
                  <div className={hasRail ? "lg:col-span-7" : "lg:col-span-12"}>
                    <ArticleCard article={all[0]!} variant="feature" />
                  </div>
                  {hasRail && (
                    <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-12">
                      <div className="space-y-6">
                        {all.slice(1, 5).map((a, i) => (
                          <ArticleCard key={a.slug} article={a} variant="index" index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {form === "grid" && (
                <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {all.slice(0, 3).map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              )}

              {form === "briefs" && (
                <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
                  <div className={hasRail ? "lg:col-span-5" : "lg:col-span-12"}>
                    <ArticleCard article={all[0]!} variant="feature" />
                  </div>
                  {hasRail && (
                    <div className="lg:col-span-7">
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

      {/* ---- Colophon: who writes this, and where the working material lives ---- */}
      <Shell>
        <section className="grid gap-x-12 gap-y-8 border-t border-border py-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="kicker mb-4">Who writes this</h2>
            <p className="max-w-prose text-[15px] leading-relaxed text-foreground/85">
              {author.bio}
            </p>
            <Link
              to="/about"
              className="eyebrow mt-5 inline-block text-muted-foreground transition-colors hover:text-brand"
            >
              About the publication →
            </Link>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-12">
            <h2 className="kicker mb-4">Resources</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Checklists, decision matrices and configuration references that go with the articles.
            </p>
            <Link
              to="/resources"
              className="eyebrow mt-5 inline-block text-muted-foreground transition-colors hover:text-brand"
            >
              Browse resources →
            </Link>
          </div>
        </section>
      </Shell>

      <NewsletterCTA />
    </>
  );
}
