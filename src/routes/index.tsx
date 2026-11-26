import { createFileRoute, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { HeaderAdSlot, InFeedAdSlot } from "@/components/monetization/AdSlot";
import { primaryNav } from "@/content/categories";
import {
  allArticles,
  articlePath,
  articlesForCategory,
  formatDate,
  getAuthor,
  getCategory,
  lastPublishedAt,
} from "@/lib/content";
import { HOMEPAGE_SECTIONS, selectHomepageComposition } from "@/lib/homepage.functions";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({
  /*
   * The composition is chosen on the server, once per request, and passed down
   * as slugs. Choosing while rendering would let the server and the browser
   * each run the selection and disagree (a hydration mismatch). Only slugs
   * cross the wire; articles are looked up from the content store.
   */
  loader: () => selectHomepageComposition(),

  /*
   * Metadata is fixed and does not read the lead, so the front page's title,
   * description and canonical do not move when the rotation does.
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
      <div className="max-w-2xl">
        <h2 className="kicker">{title}</h2>
        {children && (
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{children}</p>
        )}
      </div>
      {href && (
        <Link
          to="/$category"
          params={{ category: href }}
          className="text-[0.9375rem] font-medium text-link hover:underline"
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

  const topics = primaryNav
    .map((item) => {
      const category = getCategory(item.slug);
      const items = category ? articlesForCategory(category) : [];
      return { slug: item.slug, label: item.label, count: items.length, newest: items[0] };
    })
    .filter((topic) => topic.count > 0);

  return (
    <>
      <h1 className="sr-only">
        {site.name}: {site.metaTagline}
      </h1>

      <Shell>
        <HeaderAdSlot />
      </Shell>

      {/* Level 1 and 2: the lead story and the stories beside it. */}
      <Shell>
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 py-8 lg:grid-cols-12 lg:py-10">
          <div className="lg:col-span-8">
            <ArticleCard article={lead} variant="lead" />
          </div>
          <div className="lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
            <h2 className="kicker mb-5">More analysis</h2>
            <div className="divide-y divide-border">
              {secondary.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="index" />
              ))}
            </div>
          </div>
        </div>
      </Shell>

      {/* Level 3: latest, a dense dated list. */}
      {latest.length > 0 && (
        <Shell>
          <section className="border-t-2 border-foreground py-10">
            <SectionHead title="Latest">Updated {formatDate(lastPublishedAt())}</SectionHead>
            <div className="divide-y divide-border border-y border-border">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="row" />
              ))}
            </div>
            <p className="mt-5 text-[0.9375rem]">
              <Link to="/search" className="font-medium text-link hover:underline">
                Search all articles &rarr;
              </Link>
            </p>
            <InFeedAdSlot />
          </section>
        </Shell>
      )}

      {/* Level 4: topic coverage, built from the real content. */}
      {topics.length > 0 && (
        <Shell>
          <section className="border-t border-border py-10">
            <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <h2 className="kicker">Topics</h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  Where Substrate publishes, with the newest piece in each.
                </p>
              </div>
              <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-9">
                {topics.map((topic) => (
                  <li key={topic.slug} className="border-t border-border py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <Link
                        to="/$category"
                        params={{ category: topic.slug }}
                        className="headline text-[1.2rem] hover:text-link"
                      >
                        {topic.label}
                      </Link>
                      <span className="index-num">{topic.count}</span>
                    </div>
                    {topic.newest && (
                      <p className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-snug text-muted-foreground">
                        <Link to={articlePath(topic.newest)} className="hover:text-foreground">
                          {topic.newest.title}
                        </Link>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Shell>
      )}

      {/* Level 5: subject modules, each in a different form. */}
      {HOMEPAGE_SECTIONS.map(({ slug, title, form }) => {
        const category = getCategory(slug);
        const all = resolve(sectionSlugs[slug] ?? []);
        if (!category || all.length === 0) return null;

        // A two-column form needs a second column's worth of stories.
        const hasRail = all.length > 1;

        return (
          <Shell key={slug}>
            <section className="border-t border-border py-10">
              <SectionHead title={title} href={slug}>
                {category.intro}
              </SectionHead>

              {form === "feature" && (
                <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
                  <div className={hasRail ? "lg:col-span-7" : "lg:col-span-12"}>
                    <ArticleCard article={all[0]!} variant="feature" />
                  </div>
                  {hasRail && (
                    <div className="divide-y divide-border lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
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

      {/* Colophon: who writes this, and where the working material lives. */}
      <Shell>
        <section className="grid gap-x-12 gap-y-8 border-t border-border py-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="kicker mb-3">Who writes this</h2>
            <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-soft">
              {author.bio}
            </p>
            <Link
              to="/about"
              className="mt-4 inline-block text-[0.9375rem] font-medium text-link hover:underline"
            >
              About the publication &rarr;
            </Link>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
            <h2 className="kicker mb-3">Resources</h2>
            <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
              Checklists, decision matrices and configuration references that go with the articles.
            </p>
            <Link
              to="/resources"
              className="mt-4 inline-block text-[0.9375rem] font-medium text-link hover:underline"
            >
              Browse resources &rarr;
            </Link>
          </div>
        </section>
      </Shell>

      <NewsletterCTA />
    </>
  );
}
