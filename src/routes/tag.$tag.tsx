import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { InFeedAdSlot } from "@/components/monetization/AdSlot";
import { TAG_INDEX_THRESHOLD, allTags, getCategory, getTag } from "@/lib/content";
import { breadcrumbSchema, canonical, collectionSchema, ldScript, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/tag/$tag")({
  loader: ({ params }) => {
    const tag = getTag(params.tag);
    if (!tag) throw notFound();
    return { tag };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const { tag } = loaderData;
    const path = `/tag/${params.tag}`;
    const description = `${tag.articles.length} ${
      tag.articles.length === 1 ? "article" : "articles"
    } tagged ${tag.name} — analysis, implementation guidance and troubleshooting from ${site.name}.`;

    return {
      meta: [
        ...pageMeta({ title: `${tag.name} — ${site.name}`, description, path }),
        ...(tag.indexable ? [] : [{ name: "robots", content: "noindex, follow" }]),
      ],
      links: canonical(path),
      scripts: [
        ldScript(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: tag.name, path },
          ]),
        ),
        ldScript(collectionSchema({ name: tag.name, description, path, items: tag.articles })),
      ],
    };
  },
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useLoaderData();
  const sections = [...new Set(tag.articles.map((article) => article.category))]
    .map((slug) => getCategory(slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));
  const siblings = allTags()
    .filter((candidate) => candidate.slug !== tag.slug && candidate.indexable)
    .slice(0, 8);

  return (
    <div className="wrap">
      <div className="border-b border-border py-6">
        <Breadcrumbs items={[{ name: tag.name }]} />
        <p className="eyebrow mt-4 text-muted-foreground">Tag</p>
        <h1 className="article-title mt-2">{tag.name}</h1>
        <p className="mt-3 text-[0.9375rem] text-muted-foreground">
          {tag.articles.length} {tag.articles.length === 1 ? "article" : "articles"}
          {sections.length > 0 && (
            <>
              {" across "}
              {sections.map((category, index) => (
                <span key={category.slug}>
                  {index > 0 && ", "}
                  {/* Underlined so the links do not rely on colour alone (WCAG 1.4.1). */}
                  <Link
                    to="/$category"
                    params={{ category: category.slug }}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {category.label}
                  </Link>
                </span>
              ))}
            </>
          )}
          .
        </p>
      </div>

      <div className="divide-y divide-border border-b border-border">
        {tag.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} variant="row" />
        ))}
      </div>

      <InFeedAdSlot />

      {siblings.length > 0 && (
        <section className="border-t border-border py-8">
          <h2 className="kicker mb-3">Other topics</h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {siblings.map((sibling) => (
              <li key={sibling.slug}>
                <Link
                  to="/tag/$tag"
                  params={{ tag: sibling.slug }}
                  className="inline-flex min-h-11 items-center text-[0.9375rem] text-link underline underline-offset-4 hover:decoration-2 sm:min-h-0"
                >
                  {sibling.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!tag.indexable && (
        <p className="pb-10 text-[0.8125rem] text-muted-foreground">
          Topics with fewer than {TAG_INDEX_THRESHOLD} articles are not listed in search engines
          until there is enough written about them to be worth a page of their own.
        </p>
      )}
    </div>
  );
}
