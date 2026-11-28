import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleComments } from "@/components/article/ArticleComments";
import { ArticleReactions } from "@/components/article/ArticleReactions";
import { ArticleViews } from "@/components/article/ArticleViews";
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
  allArticles,
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

  const parentPillar = article.pillarSlug
    ? allArticles.find((candidate) => candidate.slug === article.pillarSlug)
    : undefined;

  return (
    <div className="wrap py-8 lg:py-12">
      <article>
        {/* Centered 42rem editorial header aligned flush to body prose */}
        <div className="reading">
          <Breadcrumbs
            items={[{ name: category?.title ?? article.category, categorySlug: article.category }]}
          />

          {article.draft && (
            <p
              role="status"
              className="mt-5 rounded-r-md border-l-2 border-warn-foreground bg-warn px-4 py-3 text-[0.90625rem] text-warn-foreground"
            >
              <strong className="font-semibold">Draft.</strong> This article is unfinished and is
              not listed or indexed. It is reachable by direct link only.
            </p>
          )}

          <header className="mt-6">
            <p className="eyebrow flex flex-wrap items-center gap-x-1.5">
              <Link
                to="/$category"
                params={{ category: article.category }}
                className="inline-flex min-h-6 min-w-6 items-center text-link transition-colors hover:underline"
              >
                {category?.label ?? article.category}
              </Link>
              {article.subcategory && (
                <span className="font-normal text-muted-foreground">
                  &middot; {article.subcategory}
                </span>
              )}
            </p>

            <h1 className="article-title mt-2.5">{article.title}</h1>
            <p className="standfirst mt-4">{article.standfirst}</p>

            {parentPillar && (
              <p className="mt-4 text-[0.8125rem] text-muted-foreground">
                Part of{" "}
                <Link
                  to={articlePath(parentPillar)}
                  className="font-medium text-link underline underline-offset-2 hover:decoration-2"
                >
                  {parentPillar.pillar ?? parentPillar.title}
                </Link>
              </p>
            )}

            {/* Engagement placement #1: views & likes inline beside author, date & reading time */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-y border-hairline py-3">
              <div>
                <ArticleMeta article={article} />
                {article.updatedAt && article.updatedAt !== article.publishedAt && (
                  <p className="mt-0.5 text-[0.75rem] tabular-nums text-muted-foreground">
                    Updated {formatDate(article.updatedAt)}
                  </p>
                )}
              </div>
              {!article.draft && (
                <div className="flex items-center gap-2">
                  <ArticleViews slug={article.slug} />
                  <ArticleReactions slug={article.slug} />
                </div>
              )}
            </div>
          </header>
        </div>

        {/* Hero figure aligned flush to the 42rem reading column */}
        {article.heroImage && (
          <figure className="reading mt-8 overflow-hidden rounded-[3px] bg-surface-2 ring-1 ring-inset ring-black/6 dark:ring-white/10">
            <img
              src={article.heroImage}
              alt={article.heroImageAlt ?? ""}
              width={1200}
              height={675}
              className="block h-auto w-full"
              loading="eager"
              fetchPriority="high"
            />
          </figure>
        )}

        {/* Long-form prose and technical blocks aligned on the same 42rem measure */}
        <div className="mt-8">
          <ArticleBody body={article.body} />
        </div>

        {/* Post-article dossier, reactions #2, share, author & prev/next */}
        <div className="reading">
          <ArticleAdSlot />
          <AffiliateDisclosure className="my-8" />

          {article.faq && article.faq.length > 0 && (
            <section className="mt-12 border-t border-hairline pt-8">
              <h2 className="display-2">Frequently asked questions</h2>
              <dl className="mt-5 divide-y divide-hairline">
                {article.faq.map((entry) => (
                  <div key={entry.question} className="py-4 first:pt-0 last:pb-0">
                    <dt className="text-[0.96875rem] font-semibold text-foreground [overflow-wrap:anywhere]">
                      {entry.question}
                    </dt>
                    <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft [overflow-wrap:anywhere]">
                      {entry.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(article.methodology || (article.sources && article.sources.length > 0)) && (
            <section
              aria-label="Research and sources"
              className="mt-10 rounded-md border border-hairline bg-surface-2/40 p-5 sm:p-6 [overflow-wrap:anywhere]"
            >
              <h2 className="kicker">How this article was researched</h2>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-soft">
                <strong className="font-medium text-foreground">
                  Basis of assessment: {reviewStatusLabel[article.reviewStatus]}.
                </strong>{" "}
                {article.methodology}
              </p>
              {article.sources && article.sources.length > 0 && (
                <div className="mt-4 border-t border-hairline pt-4">
                  <h3 className="kicker mb-2">Primary sources</h3>
                  <ul className="space-y-1.5 text-[0.875rem]">
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
                </div>
              )}
            </section>
          )}

          {article.tags.length > 0 && (
            <ul aria-label="Article topics" className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/tag/$tag"
                    params={{ tag: tagSlug(tag) }}
                    className="inline-flex min-h-7 items-center rounded border border-hairline bg-surface-2/60 px-2.5 text-[0.75rem] font-medium text-ink-soft transition-colors hover:border-border hover:text-foreground"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Engagement placement #2: views & likes paired alongside Share controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-y border-hairline py-3">
            {!article.draft ? (
              <div className="flex items-center gap-2">
                <ArticleViews slug={article.slug} />
                <ArticleReactions slug={article.slug} />
              </div>
            ) : (
              <span />
            )}
            <ShareLinks url={url} title={article.title} />
          </div>

          <div className="mt-8">
            <AuthorBox authorId={article.authorId} />
          </div>

          {!article.draft && <ArticleComments slug={article.slug} />}

          <AfterArticleAdSlot />

          {(previous || next) && (
            <nav
              aria-label="Article navigation"
              className="mt-8 grid gap-x-8 gap-y-6 border-t border-hairline pt-6 sm:grid-cols-2"
            >
              {previous && (
                <Link
                  to="/$category/$slug"
                  params={{ category: previous.category, slug: previous.slug }}
                  className="group block"
                >
                  <span className="kicker block">&larr; Previous</span>
                  <span className="headline mt-1.5 block text-[1.0625rem] transition-colors group-hover:text-link">
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
                  <span className="kicker block">Next &rarr;</span>
                  <span className="headline mt-1.5 block text-[1.0625rem] transition-colors group-hover:text-link">
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-14 border-t border-hairline pt-10">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="display-2">Related reading</h2>
            <Link
              to="/$category"
              params={{ category: article.category }}
              className="inline-flex min-h-6 items-center text-[0.875rem] font-medium text-link hover:underline"
            >
              All {category?.label ?? article.category} articles &rarr;
            </Link>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} variant="column" />
            ))}
          </div>
          <BeforeRelatedAdSlot />
        </section>
      )}

      <div className="reading mt-14">
        <NewsletterCTA variant="inline" />
      </div>
    </div>
  );
}
