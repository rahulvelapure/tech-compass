import { Link } from "@tanstack/react-router";

import { articlePath, formatDate, getAuthor, getCategory, reviewStatusLabel } from "@/lib/content";
import type { Article } from "@/content/types";

interface Props {
  article: Article;
  variant?: "card" | "index" | "lead" | "feature" | "row" | "brief" | "column";
  index?: number;
}

function Kicker({ article }: { article: Article }) {
  const category = getCategory(article.category);
  return (
    <span className="eyebrow text-link">
      {category?.label}
      {article.subcategory && (
        <span className="text-muted-foreground"> / {article.subcategory}</span>
      )}
    </span>
  );
}

/*
 * The headline link already names the story, so the image link is removed from
 * the keyboard order and the accessibility tree rather than announced twice.
 */
function ArticleImage({
  article,
  className = "",
  eager = false,
}: {
  article: Article;
  className?: string;
  eager?: boolean;
}) {
  if (!article.heroImage) return null;
  return (
    <Link
      to={articlePath(article)}
      aria-hidden="true"
      tabIndex={-1}
      className={`block bg-surface-2 ${className}`}
    >
      <img
        src={article.heroImage}
        alt={article.heroImageAlt ?? ""}
        width={1200}
        height={630}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="block aspect-[1200/630] h-auto w-full object-cover"
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
      <article>
        <Kicker article={article} />
        <Headline article={article} as="h2" className="display-1 mt-3" />
        <p className="standfirst mt-4 max-w-[40rem]">{article.standfirst}</p>
        <ArticleMeta article={article} className="mt-5" />
        <ArticleImage article={article} eager className="mt-7" />
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article>
        <ArticleImage article={article} className="mb-4" />
        <Kicker article={article} />
        <Headline article={article} className="display-2 mt-2" />
        <p className="mt-2 max-w-[40rem] text-base leading-relaxed text-ink-soft">
          {article.excerpt}
        </p>
        <ArticleMeta article={article} className="mt-3" />
      </article>
    );
  }

  if (variant === "index") {
    return (
      <article className="py-5 first:pt-0 last:pb-0">
        <Kicker article={article} />
        <Headline article={article} className="headline mt-1.5 text-[1.2rem]" />
        <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <p className="t-caption mt-2 tabular-nums">
          {formatDate(article.publishedAt)} &middot; {article.readingMinutes} min
        </p>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="grid gap-x-8 gap-y-1 py-5 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
        <div className="flex flex-wrap items-baseline gap-x-3 sm:block sm:pt-1.5">
          <time
            dateTime={article.publishedAt}
            className="block text-[0.8125rem] tabular-nums text-muted-foreground"
          >
            {formatDate(article.publishedAt)}
          </time>
          <span className="text-[0.8125rem] tabular-nums text-muted-foreground">
            {article.readingMinutes} min
          </span>
        </div>
        <div className="min-w-0">
          <Kicker article={article} />
          <Headline article={article} className="headline mt-1 text-[1.3rem] sm:text-[1.45rem]" />
          <p className="mt-1.5 line-clamp-2 max-w-[44rem] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        </div>
      </article>
    );
  }

  if (variant === "brief") {
    return (
      <article className="border-b border-border py-4 last:border-0">
        <Headline article={article} className="headline text-[1.08rem] leading-snug" />
        <p className="t-caption mt-1">
          {article.subcategory ?? getCategory(article.category)?.label} &middot;{" "}
          {article.readingMinutes} min
        </p>
      </article>
    );
  }

  const withImage = variant === "card";
  return (
    <article className={withImage ? "flex flex-col" : "border-t border-border pt-4"}>
      {withImage && <ArticleImage article={article} className="mb-4" />}
      <Kicker article={article} />
      <Headline article={article} className="display-3 mt-2" />
      <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>
      <p className="t-caption mt-3 tabular-nums">
        {formatDate(article.publishedAt)} &middot; {article.readingMinutes} min
      </p>
    </article>
  );
}

export function ArticleMeta({ article, className = "" }: { article: Article; className?: string }) {
  const author = getAuthor(article.authorId);
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted-foreground ${className}`}
    >
      <Link
        to="/author/$authorId"
        params={{ authorId: author.id }}
        rel="author"
        className="font-medium text-foreground hover:underline"
      >
        {author.name}
      </Link>
      <span aria-hidden="true">&middot;</span>
      <time dateTime={article.publishedAt} className="tabular-nums">
        {formatDate(article.publishedAt)}
      </time>
      <span aria-hidden="true">&middot;</span>
      <span className="tabular-nums">{article.readingMinutes} min</span>
      <span aria-hidden="true">&middot;</span>
      <span>{reviewStatusLabel[article.reviewStatus]}</span>
    </div>
  );
}
