import { Link } from "@tanstack/react-router";

import {
  articlePath,
  formatDate,
  getAuthor,
  getCategory,
  reviewStatusLabel,
} from "@/lib/content";
import type { Article } from "@/content/types";

interface Props {
  article: Article;
  variant?: "card" | "index" | "lead" | "feature" | "row" | "brief";
  index?: number;
}

function Kicker({ article }: { article: Article }) {
  const category = getCategory(article.category);

  return (
    <span className="eyebrow text-brand">
      {category?.label}
      {article.subcategory && (
        <span className="text-muted-foreground"> / {article.subcategory}</span>
      )}
    </span>
  );
}

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
      aria-label={`Read ${article.title}`}
      className={`group/image block overflow-hidden bg-surface-2 ${className}`}
    >
      <img
        src={article.heroImage}
        alt={article.heroImageAlt ?? ""}
        width={1200}
        height={630}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/image:scale-[1.025]"
      />
    </Link>
  );
}

export function ArticleCard({ article, variant = "card", index }: Props) {
  const to = articlePath(article);

  if (variant === "lead") {
    return (
      <article>
        <ArticleImage
          article={article}
          eager
          className="mb-6 aspect-[16/8.6] rounded-md border border-border"
        />

        <Kicker article={article} />

        <h2 className="display-1 mt-4">
          <Link to={to} className="transition-colors hover:text-brand">
            {article.title}
          </Link>
        </h2>

        <p className="standfirst mt-5 max-w-3xl">{article.standfirst}</p>

        <ArticleMeta article={article} className="mt-6" />
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article>
        <ArticleImage
          article={article}
          className="mb-5 aspect-[16/9] rounded-md border border-border"
        />

        <Kicker article={article} />

        <h3 className="display-2 mt-3">
          <Link to={to} className="transition-colors hover:text-brand">
            {article.title}
          </Link>
        </h3>

        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        <ArticleMeta article={article} className="mt-4" />
      </article>
    );
  }

  if (variant === "index") {
    return (
      <article className="group border-b border-border pb-5 last:border-b-0 last:pb-0">
        <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3">
          <span aria-hidden="true" className="index-num pt-[0.2rem]">
            {String((index ?? 0) + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <Kicker article={article} />

            <h3 className="mt-2 font-display text-[1.12rem] font-semibold leading-snug">
              <Link to={to} className="transition-colors group-hover:text-brand">
                {article.title}
              </Link>
            </h3>

            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          </div>
        </div>
      </article>
    );
  }
  if (variant === "row") {
    return (
      <article className="group grid w-full gap-x-8 gap-y-4 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)]">
        <ArticleImage
          article={article}
          className="aspect-[16/10] w-full rounded-sm border border-border"
        />

        <div className="min-w-0 self-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Kicker article={article} />

            <time
              dateTime={article.publishedAt}
              className="text-xs tabular-nums text-muted-foreground"
            >
              {formatDate(article.publishedAt)}
            </time>
          </div>

          <h3 className="headline mt-2 text-[1.35rem] sm:text-[1.55rem]">
            <Link to={to} className="transition-colors group-hover:text-brand">
              {article.title}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-3 max-w-4xl text-[15px] leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        </div>
      </article>
    );
  }
  if (variant === "brief") {
    return (
      <article className="group border-b border-border py-4 last:border-0">
        <h3 className="font-display text-[1.08rem] leading-snug">
          <Link to={to} className="transition-colors group-hover:text-brand">
            {article.title}
          </Link>
        </h3>

        <p className="t-caption mt-1">
          {article.subcategory ?? getCategory(article.category)?.label} ·{" "}
          {article.readingMinutes} min
        </p>
      </article>
    );
  }

  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-md border border-border bg-card">
      <ArticleImage article={article} className="aspect-[16/9]" />

      <div className="flex flex-1 flex-col p-5">
        <Kicker article={article} />

        <h3 className="display-3 mt-2.5">
          <Link to={to} className="transition-colors group-hover:text-brand">
            {article.title}
          </Link>
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        <p className="t-caption mt-auto pt-5 font-mono tabular-nums">
          {formatDate(article.publishedAt)} · {article.readingMinutes} min
        </p>
      </div>
    </article>
  );
}

export function ArticleMeta({
  article,
  className = "",
}: {
  article: Article;
  className?: string;
}) {
  const author = getAuthor(article.authorId);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted-foreground ${className}`}
    >
      <Link
        to="/author/$authorId"
        params={{ authorId: author.id }}
        rel="author"
        className="font-medium text-foreground hover:text-brand"
      >
        {author.name}
      </Link>

      <span aria-hidden="true" className="text-border">
        /
      </span>

      <time dateTime={article.publishedAt} className="tabular-nums">
        {formatDate(article.publishedAt)}
      </time>

      <span aria-hidden="true" className="text-border">
        /
      </span>

      <span className="tabular-nums">{article.readingMinutes} min</span>

      <span aria-hidden="true" className="text-border">
        /
      </span>

      <span>{reviewStatusLabel[article.reviewStatus]}</span>
    </div>
  );
}
