import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { InFeedAdSlot } from "@/components/monetization/AdSlot";
import { articlesForCategory, getCategory, latestArticles } from "@/lib/content";
import { breadcrumbSchema, canonical, collectionSchema, ldScript, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

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

  return (
    <div className="wrap">
      <div className="border-b border-border py-6">
        <Breadcrumbs items={[{ name: category.title }]} />
        <h1 className="article-title mt-4">{category.title}</h1>
        <p className="standfirst mt-3 max-w-[40rem]">{category.intro}</p>
        {category.subcategories && category.subcategories.length > 0 && (
          <p className="mt-4 max-w-[40rem] text-[0.9375rem] leading-relaxed text-muted-foreground">
            Covers: {category.subcategories.join(", ")}.
          </p>
        )}
      </div>

      {featured ? (
        <>
          <section className="grid grid-cols-1 gap-x-12 gap-y-10 py-8 lg:grid-cols-12 lg:py-10">
            <div className="lg:col-span-8">
              <ArticleCard article={featured} variant="lead" />
            </div>
            {rest.length > 0 && (
              <div className="lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
                <h2 className="kicker mb-5">More in {category.label}</h2>
                <div className="divide-y divide-border">
                  {rest.slice(0, 3).map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="index" />
                  ))}
                </div>
              </div>
            )}
          </section>

          {rest.length > 3 && (
            <section className="border-t-2 border-foreground py-8">
              <h2 className="kicker mb-4">All articles</h2>
              <div className="divide-y divide-border border-y border-border">
                {rest.slice(3).map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="row" />
                ))}
              </div>
            </section>
          )}

          <InFeedAdSlot />
        </>
      ) : (
        <section className="border-b border-border py-12">
          <h2 className="headline text-[1.4rem]">No articles published in this section yet</h2>
          <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
            This section is part of the publication&apos;s coverage plan. Articles are added as they
            are researched rather than generated in bulk. In the meantime, the sections below have
            published work.
          </p>
        </section>
      )}

      {category.related && category.related.length > 0 && (
        <section className="border-t border-border py-8">
          <h2 className="kicker mb-3">Related sections</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {category.related.map((slug) => {
              const related = getCategory(slug);
              if (!related) return null;
              return (
                <li key={slug}>
                  <Link
                    to="/$category"
                    params={{ category: slug }}
                    className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-link hover:underline sm:min-h-0"
                  >
                    {related.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {elsewhere.length > 0 && (
        <section className="border-t border-border py-8">
          <h2 className="kicker mb-5">Elsewhere on the site</h2>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {elsewhere.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="column" />
            ))}
          </div>
        </section>
      )}

      <div className="border-t border-border py-10">
        <NewsletterCTA variant="inline" />
      </div>
    </div>
  );
}
