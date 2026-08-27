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
        // A section with nothing published in it is an empty page. It stays
        // reachable and crawlable so its links still work, but asking Google
        // to index a heading and an "await content" notice earns nothing and
        // dilutes the crawl budget across the sections that do have articles.
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
      <div className="border-b border-border py-8">
        <Breadcrumbs items={[{ name: category.title }]} />
        <h1 className="headline mt-5 text-3xl sm:text-4xl">{category.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {category.intro}
        </p>
        {category.subcategories && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {category.subcategories.map((sub) => (
              <li
                key={sub}
                className="border border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {sub}
              </li>
            ))}
          </ul>
        )}
      </div>

      {featured ? (
        <>
          <section className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <h2 className="eyebrow mb-6 text-muted-foreground">Featured</h2>
              <ArticleCard article={featured} variant="lead" />
            </div>
            {rest.length > 0 && (
              <div className="lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
                <h2 className="eyebrow mb-6 border-b border-border pb-2 text-muted-foreground">
                  More in {category.label}
                </h2>
                <div className="space-y-8">
                  {rest.slice(0, 3).map((article, i) => (
                    <ArticleCard key={article.slug} article={article} variant="index" index={i} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {rest.length > 3 && (
            <section className="border-t border-border py-12">
              <h2 className="eyebrow mb-4 text-muted-foreground">All articles</h2>
              <div className="divide-y divide-border">
                {rest.slice(3).map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="row" />
                ))}
              </div>
            </section>
          )}
          <InFeedAdSlot />
        </>
      ) : (
        <section className="border-b border-border py-14">
          <h2 className="font-serif text-xl font-bold">
            No articles published in this section yet
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            This section is part of the publication's coverage plan. Articles are added as they are
            researched rather than generated in bulk. In the meantime, the sections below have
            published work.
          </p>
        </section>
      )}

      {category.related && category.related.length > 0 && (
        <section className="border-t border-border py-12">
          <h2 className="eyebrow mb-4 text-muted-foreground">Related sections</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {category.related.map((slug) => {
              const related = getCategory(slug);
              if (!related) return null;
              return (
                <li key={slug}>
                  <Link
                    to="/$category"
                    params={{ category: slug }}
                    className="text-sm font-medium text-brand hover:underline"
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
        <section className="border-t border-border py-12">
          <h2 className="eyebrow mb-6 text-muted-foreground">Elsewhere on the site</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {elsewhere.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      <div className="border-t border-border py-12">
        <NewsletterCTA variant="inline" />
      </div>
    </div>
  );
}
