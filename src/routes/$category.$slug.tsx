import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleReactions } from "@/components/article/ArticleReactions";
import { ShareLinks } from "@/components/article/ShareLinks";
import { ArticleCard, ArticleMeta } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { AuthorBox } from "@/components/site/AuthorBox";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import {
  AfterArticleAdSlot,
  ArticleAdSlot,
  BeforeRelatedAdSlot,
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
  const related = relatedArticles(article);
  const { previous, next } = articleNeighbours(article);
  const url = absoluteUrl(articlePath(article));

  return (
    <div className="wrap">
      <div className="reading">
        <div className="py-6">
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
            className="mb-6 border-l-2 border-warn-foreground/50 bg-warn px-4 py-3 text-[0.9375rem] text-warn-foreground"
          >
            <strong className="font-semibold">Draft.</strong> This article is unfinished and is not
            listed or indexed. It is reachable by direct link only.
          </p>
        )}

        <article>
          <header>
            <p className="eyebrow">
              <Link
                to="/$category"
                params={{ category: article.category }}
                className="text-link hover:underline"
              >
                {category?.label}
              </Link>
              {article.subcategory && (
                <span className="text-muted-foreground"> / {article.subcategory}</span>
              )}
            </p>
            <h1 className="article-title mt-3">{article.title}</h1>
            <p className="standfirst mt-4">{article.standfirst}</p>
            <ArticleMeta article={article} className="mt-5" />
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <p className="mt-1 text-[0.8125rem] text-muted-foreground">
                Last updated {formatDate(article.updatedAt)}
              </p>
            )}
          </header>

          {article.heroImage && (
            <figure className="mt-7">
              <img
                src={article.heroImage}
                alt={article.heroImageAlt ?? ""}
                width={1200}
                height={630}
                className="block aspect-[1200/630] h-auto w-full bg-surface-2 object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </figure>
          )}

          <div className="mt-8">
            <ArticleBody body={article.body} />
          </div>

          <ArticleAdSlot />
          <AffiliateDisclosure className="my-8" />

          {article.faq && article.faq.length > 0 && (
            <section className="mt-12 border-t border-border pt-6">
              <h2 className="headline text-[1.5rem]">Frequently asked questions</h2>
              <dl className="mt-4 divide-y divide-border">
                {article.faq.map((entry) => (
                  <div key={entry.question} className="py-4">
                    <dt className="font-semibold">{entry.question}</dt>
                    <dd className="measure mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                      {entry.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(article.methodology || article.sources) && (
            <section className="mt-12 border-t border-border pt-6">
              <h2 className="kicker">How this article was researched</h2>
              <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
                Basis of assessment: {reviewStatusLabel[article.reviewStatus]}.{" "}
                {article.methodology}
              </p>
              {article.sources && article.sources.length > 0 && (
                <>
                  <h3 className="eyebrow mt-5 text-muted-foreground">Sources</h3>
                  <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
                    {article.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-link underline underline-offset-2 hover:decoration-2"
                        >
                          {source.title}
                        </a>
                        <span className="text-muted-foreground"> &mdash; {source.publisher}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          <div className="mt-10 border-t border-border pt-5">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.9375rem]">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/tag/$tag"
                    params={{ tag: tagSlug(tag) }}
                    className="text-ink-soft underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-border py-3">
              {!article.draft ? <ArticleReactions slug={article.slug} /> : <span />}
              <ShareLinks url={url} title={article.title} />
            </div>
          </div>

          <div className="mt-8">
            <AuthorBox authorId={article.authorId} />
          </div>

          <AfterArticleAdSlot />

          <nav
            aria-label="Article navigation"
            className="mt-8 grid gap-x-8 gap-y-5 border-t border-border pt-5 sm:grid-cols-2"
          >
            {previous && (
              <Link
                to="/$category/$slug"
                params={{ category: previous.category, slug: previous.slug }}
                className="group block"
              >
                <span className="eyebrow text-muted-foreground">&larr; Previous</span>
                <span className="headline mt-1 block text-[1.1rem] group-hover:text-link">
                  {previous.title}
                </span>
              </Link>
            )}
            {next && (
              <Link
                to="/$category/$slug"
                params={{ category: next.category, slug: next.slug }}
                className="group block sm:col-start-2 sm:text-right"
              >
                <span className="eyebrow text-muted-foreground">Next &rarr;</span>
                <span className="headline mt-1 block text-[1.1rem] group-hover:text-link">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </article>

        {related.length > 0 && (
          <section className="mt-12 border-t-2 border-foreground pt-5">
            <h2 className="kicker mb-4">Related reading</h2>
            <div className="divide-y divide-border">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} variant="index" />
              ))}
            </div>
            <BeforeRelatedAdSlot />
            <p className="mt-5 text-[0.9375rem]">
              <Link
                to="/$category"
                params={{ category: article.category }}
                className="font-medium text-link hover:underline"
              >
                All {category?.label} articles &rarr;
              </Link>
            </p>
          </section>
        )}
      </div>

      <div className="mt-12 border-t border-border py-10">
        <NewsletterCTA variant="inline" />
      </div>
    </div>
  );
}
