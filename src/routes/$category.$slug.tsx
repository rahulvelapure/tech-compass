import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleReactions } from "@/components/article/ArticleReactions";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ShareLinks } from "@/components/article/ShareLinks";
import { ArticleCard, ArticleMeta } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { AuthorBox } from "@/components/site/AuthorBox";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import {
  AfterArticleAdSlot,
  ArticleAdSlot,
  BeforeRelatedAdSlot,
  SidebarAdSlot,
} from "@/components/monetization/AdSlot";
import { AffiliateDisclosure } from "@/components/monetization/AffiliateDisclosure";
import {
  articleNeighbours,
  articlePath,
  formatDate,
  getArticle,
  getCategory,
  relatedArticles,
  reviewStatusLabel,
  tableOfContents,
  tagSlug,
} from "@/lib/content";
import {
  absoluteUrl,
  articleSchema,
  breadcrumbSchema,
  canonical,
  faqSchema,
  ldScript,
  pageMeta,
} from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/$category/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.category, params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { article } = loaderData;
    const category = getCategory(article.category);
    const path = `/${params.category}/${params.slug}`;
    const schemas = [
      ldScript(articleSchema(article)),
      ldScript(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: category?.title ?? article.category, path: `/${article.category}` },
          { name: article.title, path },
        ]),
      ),
    ];
    const faq = faqSchema(article);
    if (faq) schemas.push(ldScript(faq));

    return {
      meta: [
        ...pageMeta({
          title: `${article.seoTitle ?? article.title} — ${site.name}`,
          description: article.metaDescription,
          path,
          type: "article",
          ...(article.heroImage ? { image: article.heroImage } : {}),
          ...(article.heroImageAlt ? { imageAlt: article.heroImageAlt } : {}),
        }),
        { property: "article:published_time", content: article.publishedAt },
        {
          property: "article:modified_time",
          content: article.updatedAt ?? article.publishedAt,
        },
        { property: "article:section", content: category?.title ?? article.category },
        // A draft keeps its URL for preview and review, but must never enter
        // the index — thin, unfinished pages drag the whole domain down.
        ...(article.draft ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      ],
      links: canonical(path),
      scripts: schemas,
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const params = Route.useParams();
  const article = getArticle(params.category, params.slug)!;
  const category = getCategory(article.category);
  const toc = tableOfContents(article.body);
  const related = relatedArticles(article);
  const { previous, next } = articleNeighbours(article);
  const url = absoluteUrl(articlePath(article));

  return (
    <div className="wrap">
      <div className="py-8">
        <Breadcrumbs
          items={[
            { name: category?.title ?? article.category, categorySlug: article.category },
            { name: article.title },
          ]}
        />
      </div>

      {article.draft && (
        <p
          role="status"
          className="mb-8 border-l-2 border-warn-foreground/40 bg-warn px-5 py-4 text-sm text-warn-foreground"
        >
          <strong className="font-semibold">Draft.</strong> This article is unfinished and is not
          listed or indexed. It is reachable by direct link only.
        </p>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Sticky contents rail */}
        <aside aria-label="On this page" className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 space-y-8">
            <TableOfContents items={toc} />
            <SidebarAdSlot />
          </div>
        </aside>

        <article className="lg:col-span-6">
          <header className="border-b border-border pb-7">
            <p className="eyebrow text-brand">
              {category?.label}
              {article.subcategory && (
                <span className="text-muted-foreground"> / {article.subcategory}</span>
              )}
            </p>
            <h1 className="display-1 mt-4">{article.title}</h1>
            <p className="standfirst mt-5">{article.standfirst}</p>
            <ArticleMeta article={article} className="mt-7" />
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                Last updated {formatDate(article.updatedAt)}
              </p>
            )}
          </header>

          <div className="lg:hidden">
            <div className="mt-8 border border-border p-5">
              <TableOfContents items={toc} />
            </div>
          </div>

          <ArticleBody body={article.body} />

          <ArticleAdSlot />
          <AffiliateDisclosure className="my-8" />

          {article.faq && article.faq.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <h2 className="font-serif text-2xl font-bold">Frequently asked questions</h2>
              <dl className="mt-6 divide-y divide-border">
                {article.faq.map((entry) => (
                  <div key={entry.question} className="py-5">
                    <dt className="font-semibold">{entry.question}</dt>
                    <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {entry.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(article.methodology || article.sources) && (
            <section className="mt-12 border border-border bg-surface p-6">
              <h2 className="eyebrow text-muted-foreground">How this article was researched</h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                Basis of assessment: {reviewStatusLabel[article.reviewStatus]}.{" "}
                {article.methodology}
              </p>
              {article.sources && article.sources.length > 0 && (
                <>
                  <h3 className="eyebrow mt-6 text-muted-foreground">Sources</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {article.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:underline"
                        >
                          {source.title}
                        </a>
                        <span className="text-muted-foreground"> — {source.publisher}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
            <ul className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/tag/$tag"
                    params={{ tag: tagSlug(tag) }}
                    className="inline-block border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-5">
              {/* Drafts are unlisted and unindexed; there is nothing to react to yet. */}
              {!article.draft && <ArticleReactions slug={article.slug} />}
              <ShareLinks url={url} title={article.title} />
            </div>
          </div>

          <div className="mt-10">
            <AuthorBox authorId={article.authorId} />
          </div>

          <AfterArticleAdSlot />

          <nav
            aria-label="Article navigation"
            className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {previous && (
              <Link
                to="/$category/$slug"
                params={{ category: previous.category, slug: previous.slug }}
                className="group border border-border p-5"
              >
                <span className="eyebrow text-muted-foreground">Previous</span>
                <span className="mt-2 block font-serif font-bold group-hover:text-brand">
                  {previous.title}
                </span>
              </Link>
            )}
            {next && (
              <Link
                to="/$category/$slug"
                params={{ category: next.category, slug: next.slug }}
                className="group border border-border p-5 sm:text-right"
              >
                <span className="eyebrow text-muted-foreground">Next</span>
                <span className="mt-2 block font-serif font-bold group-hover:text-brand">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </article>

        {/* Related rail */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <h2 className="eyebrow mb-5 border-b border-border pb-2 text-muted-foreground">
              Related reading
            </h2>
            <div className="space-y-7">
              {related.map((item, i) => (
                <ArticleCard key={item.slug} article={item} variant="index" index={i} />
              ))}
            </div>
            <BeforeRelatedAdSlot />
            <div className="mt-8">
              <Link
                to="/$category"
                params={{ category: article.category }}
                className="text-sm font-medium text-brand hover:underline"
              >
                All {category?.label} articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-16 border-t border-border py-12">
        <NewsletterCTA variant="inline" />
      </div>
    </div>
  );
}
