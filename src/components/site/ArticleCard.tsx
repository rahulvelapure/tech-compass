import { Link } from "@tanstack/react-router";

import {
  articlePath,
  formatDate,
  getAuthor,
  getCategory,
  reviewStatusLabel,
  tagSlug,
} from "@/lib/content";
import type { Article } from "@/content/types";

interface Props {
  article: Article;
  variant?: "card" | "index" | "lead" | "feature" | "row" | "brief" | "column";
  index?: number;
}

function Kicker({ article }: { article: Article }) {
  const category = getCategory(article.category);
  return (
    <p className="eyebrow flex flex-wrap items-center gap-x-1.5">
      <Link
        to="/$category"
        params={{ category: article.category }}
        className="inline-flex min-h-6 min-w-6 items-center text-link transition-colors hover:underline"
      >
        {category?.label ?? article.category}
      </Link>
      {article.subcategory && (
        <span className="font-normal text-muted-foreground">&middot; {article.subcategory}</span>
      )}
    </p>
  );
}

/*
 * Decorative companion link to the headline: removed from tab order and screen
 * reader tree so the article title is announced once.
 */
function ArticleImage({
  article,
  className = "",
  eager = false,
  cropped = false,
}: {
  article: Article;
  className?: string;
  eager?: boolean;
  cropped?: boolean;
}) {
  if (!article.heroImage) return null;
  return (
    <Link
      to={articlePath(article)}
      aria-hidden="true"
      tabIndex={-1}
      className={`group block overflow-hidden rounded-[3px] bg-surface-2 ring-1 ring-inset ring-black/6 dark:ring-white/10 ${className}`}
    >
      <img
        src={article.heroImage}
        alt={article.heroImageAlt ?? ""}
        width={1200}
        height={675}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className={`block h-auto w-full transition-opacity duration-200 group-hover:opacity-95 ${
          cropped ? "aspect-[16/9] object-cover" : ""
        }`}
      />
    </Link>
  );
}

function Headline({
  article,
  as: Tag = "h3",
  className,
}: {
  article: Article;
  as?: "h2" | "h3";
  className: string;
}) {
  return (
    <Tag className={className}>
      <Link to={articlePath(article)} className="transition-colors hover:text-link">
        {article.title}
      </Link>
    </Tag>
  );
}

export function ArticleCard({ article, variant = "card" }: Props) {
  if (variant === "lead") {
    return (
      <article className="flex flex-col">
        <Kicker article={article} />
        <Headline article={article} as="h2" className="display-1 mt-2.5" />
        <p className="standfirst mt-4 max-w-[40rem]">{article.standfirst}</p>
        <ArticleMeta article={article} className="mt-5" />
        {article.heroImage ? (
          <ArticleImage article={article} eager className="mt-6" />
        ) : (
          article.tags.length > 0 && (
            <ul
              aria-label="Key topics"
              className="mt-6 flex flex-wrap gap-2 border-t border-hairline pt-4"
            >
              {article.tags.slice(0, 4).map((tag) => (
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
          )
        )}
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article className="flex flex-col">
        {article.heroImage && <ArticleImage article={article} className="mb-5" />}
        <Kicker article={article} />
        <Headline article={article} className="display-2 mt-2" />
        <p className="mt-2.5 max-w-[38rem] text-[0.96875rem] leading-relaxed text-ink-soft">
          {article.excerpt}
        </p>
        <ArticleMeta article={article} className="mt-4" />
      </article>
    );
  }

  if (variant === "index") {
    return (
      <article className="py-5 first:pt-0 last:pb-0">
        <Kicker article={article} />
        <Headline article={article} className="headline mt-1.5 text-[1.1875rem]" />
        <p className="mt-2 line-clamp-2 text-[0.90625rem] leading-relaxed text-ink-soft">
          {article.excerpt}
        </p>
        <p className="t-caption mt-2.5 tabular-nums">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> &middot;{" "}
          {article.readingMinutes} min read
        </p>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="grid gap-x-8 gap-y-1.5 py-5 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
        <div className="flex flex-wrap items-baseline gap-x-2.5 sm:block sm:pt-1">
          <time
            dateTime={article.publishedAt}
            className="block text-[0.8125rem] tabular-nums text-muted-foreground"
          >
            {formatDate(article.publishedAt)}
          </time>
          <span className="text-[0.8125rem] tabular-nums text-muted-foreground sm:mt-0.5 sm:block">
            {article.readingMinutes} min read
          </span>
        </div>
        <div className="min-w-0">
          <Kicker article={article} />
          <Headline article={article} className="headline mt-1 text-[1.25rem] sm:text-[1.375rem]" />
          <p className="mt-1.5 line-clamp-2 max-w-[42rem] text-[0.9375rem] leading-relaxed text-ink-soft">
            {article.excerpt}
          </p>
        </div>
      </article>
    );
  }

  if (variant === "brief") {
    return (
      <article className="border-b border-hairline py-3.5 last:border-0">
        <Headline article={article} className="headline text-[1.0625rem] leading-snug" />
        <p className="t-caption mt-1.5 tabular-nums">
          {article.subcategory ?? getCategory(article.category)?.label} &middot;{" "}
          {article.readingMinutes} min read
        </p>
      </article>
    );
  }

  const withImage = variant === "card";
  return (
    <article className={withImage ? "flex flex-col" : "border-t border-hairline pt-4"}>
      {withImage && <ArticleImage article={article} className="mb-4" />}
      <Kicker article={article} />
      <Headline article={article} className="display-3 mt-2" />
      <p className="mt-2 line-clamp-3 text-[0.90625rem] leading-relaxed text-ink-soft">
        {article.excerpt}
      </p>
      <p className="t-caption mt-3 tabular-nums">
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> &middot;{" "}
        {article.readingMinutes} min read
      </p>
    </article>
  );
}

export function ArticleMeta({ article, className = "" }: { article: Article; className?: string }) {
  const author = getAuthor(article.authorId);
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem] text-muted-foreground ${className}`}
    >
      <Link
        to="/author/$authorId"
        params={{ authorId: author.id }}
        rel="author"
        className="inline-flex min-h-6 items-center font-medium text-foreground transition-colors hover:text-link hover:underline"
      >
        {author.name}
      </Link>
      <span className="inline-flex items-center gap-x-2 tabular-nums">
        <span aria-hidden="true">&middot;</span>
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </span>
      <span className="inline-flex items-center gap-x-2 tabular-nums">
        <span aria-hidden="true">&middot;</span>
        <span>{article.readingMinutes} min read</span>
      </span>
      <span className="inline-flex items-center gap-x-2">
        <span aria-hidden="true">&middot;</span>
        <span>{reviewStatusLabel[article.reviewStatus]}</span>
      </span>
    </div>
  );
}
