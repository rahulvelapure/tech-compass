import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { InFeedAdSlot } from "@/components/monetization/AdSlot";
import { TAG_INDEX_THRESHOLD, allTags, getCategory, getTag } from "@/lib/content";
import { breadcrumbSchema, canonical, collectionSchema, ldScript, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * Tag page.
 *
 * Tags cut across the category tree — "Troubleshooting" spans Intune, Windows
 * and networking — so they earn their own pages. What they do not earn
 * automatically is indexing: a tag with one article is a thin duplicate of
 * that article. Below TAG_INDEX_THRESHOLD the page still exists and still
 * passes link equity onward, but it is marked noindex.
 */
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
        // Thin tag pages are still crawled for their links, just not indexed.
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

  // Categories this tag appears in, so the page routes readers into the
  // permanent structure rather than dead-ending on a flat list.
  const sections = [...new Set(tag.articles.map((article) => article.category))]
    .map((slug) => getCategory(slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  // A few sibling tags keep cross-tag discovery working without a tag index page.
  const siblings = allTags()
    .filter((candidate) => candidate.slug !== tag.slug && candidate.indexable)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: tag.name }]} />

      <header className="mt-8 border-b border-border pb-6">
        <p className="eyebrow text-brand">Tag</p>
        <h1 className="headline mt-3 text-3xl sm:text-4xl">{tag.name}</h1>
        <p className="mt-3 text-muted-foreground">
          {tag.articles.length} {tag.articles.length === 1 ? "article" : "articles"}
          {sections.length > 0 && (
            <>
              {" across "}
              {sections.map((category, index) => (
                <span key={category.slug}>
                  {index > 0 && ", "}
                  {/* Underlined inside running text — colour alone is not a
                      sufficient distinction (WCAG 1.4.1). */}
                  <Link
                    to="/$category"
                    params={{ category: category.slug }}
                    className="underline hover:text-brand"
                  >
                    {category.label}
                  </Link>
                </span>
              ))}
            </>
          )}
          .
        </p>
      </header>

      <div className="mt-2 divide-y divide-border">
        {tag.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} variant="row" />
        ))}
      </div>

      <InFeedAdSlot />

      {siblings.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="eyebrow mb-4 text-muted-foreground">Other topics</h2>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((sibling) => (
              <li key={sibling.slug}>
                <Link
                  to="/tag/$tag"
                  params={{ tag: sibling.slug }}
                  className="inline-block border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  {sibling.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!tag.indexable && (
        <p className="mt-10 text-xs text-muted-foreground">
          Topics with fewer than {TAG_INDEX_THRESHOLD} articles are not listed in search engines
          until there is enough written about them to be worth a page of their own.
        </p>
      )}
    </div>
  );
}
