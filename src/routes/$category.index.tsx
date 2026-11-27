import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { InFeedAdSlot } from "@/components/monetization/AdSlot";
import { articlesForCategory, getCategory, latestArticles } from "@/lib/content";
import { breadcrumbSchema, canonical, collectionSchema, ldScript, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

const GROUP_LABELS: Record<string, string> = {
  enterprise: "Enterprise IT",
  technology: "Technology",
  formats: "Editorial format",
};

export const Route = createFileRoute("/$category/")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category } = loaderData;
    const path = `/${params.category}`;
    const published = articlesForCategory(category);

    return {
      meta: [
        ...pageMeta({
          title: `${category.title} — ${site.name}`,
          description: category.description,
          path,
        }),
        ...(published.length === 0 ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: canonical(path),
      scripts: [
        ldScript(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: category.title, path },
          ]),
        ),
        ldScript(
          collectionSchema({
            name: category.title,
            description: category.description,
            path,
            items: published,
          }),
        ),
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const params = Route.useParams();
  const category = getCategory(params.category)!;
  const articles = articlesForCategory(category);
  const [featured, ...rest] = articles;
  const elsewhere = latestArticles(
    4,
    articles.map((a) => a.slug),
  );

  const populatedRelated = (category.related ?? [])
    .map((slug) => getCategory(slug))
    .filter(
      (rel): rel is NonNullable<typeof rel> =>
        rel !== undefined && articlesForCategory(rel).length > 0,
    );

  return (
    <div className="wrap py-8 lg:py-12">
      <header className="border-b border-hairline pb-8">
        <Breadcrumbs items={[{ name: category.title }]} />
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="kicker">{GROUP_LABELS[category.group] ?? "Section"}</p>
          {articles.length > 0 && (
            <span className="text-[0.8125rem] tabular-nums text-muted-foreground">
              &middot; {articles.length} {articles.length === 1 ? "article" : "articles"}
            </span>
          )}
        </div>
        <h1 className="article-title mt-2">{category.title}</h1>
        <p className="standfirst mt-3 max-w-[42rem]">{category.intro}</p>
        {category.subcategories && category.subcategories.length > 0 && (
          <p className="mt-4 max-w-[42rem] text-[0.875rem] leading-relaxed text-muted-foreground">
            Coverage areas: {category.subcategories.join(" · ")}
          </p>
        )}
      </header>

      {featured ? (
        <>
          <section className="grid grid-cols-1 gap-x-12 gap-y-10 py-8 lg:grid-cols-12 lg:py-12">
            <div className={rest.length > 0 ? "lg:col-span-7" : "max-w-[44rem] lg:col-span-12"}>
              <ArticleCard article={featured} variant="lead" />
            </div>
            {rest.length > 0 && (
              <div className="lg:col-span-5 lg:border-l lg:border-hairline lg:pl-10">
                <h2 className="kicker mb-5">Recent in {category.label}</h2>
                <div className="divide-y divide-hairline">
                  {rest.slice(0, 3).map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="index" />
                  ))}
                </div>
              </div>
            )}
          </section>

          {rest.length > 3 && (
            <section className="border-t border-hairline py-10">
              <h2 className="display-2 mb-6">Archive</h2>
              <div className="divide-y divide-hairline border-y border-hairline">
                {rest.slice(3).map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="row" />
                ))}
              </div>
            </section>
          )}

          <InFeedAdSlot />
        </>
      ) : (
        <section className="border-b border-hairline py-12">
          <h2 className="headline text-[1.35rem]">No articles published in this section yet</h2>
          <p className="measure mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
            This section is part of Substrate&apos;s coverage plan. Articles are added as they are
            researched and verified rather than generated in bulk.
          </p>
        </section>
      )}

      {populatedRelated.length > 0 && (
        <section className="border-t border-hairline py-8">
          <h2 className="kicker mb-3">Related sections</h2>
          <ul className="flex flex-wrap gap-2">
            {populatedRelated.map((related) => (
              <li key={related.slug}>
                <Link
                  to="/$category"
                  params={{ category: related.slug }}
                  className="inline-flex min-h-9 items-center rounded-md border border-hairline bg-surface-2/60 px-3 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-border hover:bg-surface-2 hover:text-foreground"
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {elsewhere.length > 0 && (
        <section className="border-t border-hairline py-10">
          <h2 className="display-2 mb-6">Elsewhere on Substrate</h2>
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {elsewhere.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="column" />
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto mt-6 max-w-[50rem]">
        <NewsletterCTA variant="inline" />
      </div>
    </div>
  );
}
