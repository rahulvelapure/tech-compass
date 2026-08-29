import { Link } from "@tanstack/react-router";

import { articlePath, formatDate, getAuthor, getCategory, reviewStatusLabel } from "@/lib/content";
import type { Article } from "@/content/types";

interface Props {
  article: Article;
  /**
   * The page decides the shape, not the article.
   *
   * "lead" is the front-page story, "index" a numbered contents entry, "row" a
   * ruled list item, "brief" a compact text-only entry, and "card" the default
   * used inside a grid. Having distinct shapes is what lets a page vary its
   * rhythm instead of repeating one card four times.
   */
  variant?: "card" | "index" | "lead" | "feature" | "row" | "brief";
  index?: number;
}

/** Category · subcategory, as a quiet ruled kicker. */
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

export function ArticleCard({ article, variant = "card", index }: Props) {
  const to = articlePath(article);

  if (variant === "lead") {
    return (
      <article>
        <Kicker article={article} />
        <h2 className="display-1 mt-4">
          <Link to={to} className="hover:text-brand">
            {article.title}
          </Link>
        </h2>
        <p className="standfirst mt-5 max-w-2xl">{article.standfirst}</p>
        <ArticleMeta article={article} className="mt-6" />
      </article>
    );
  }

  /*
   * Section lead. Same shape as the front-page lead but a step down the scale,
   * so a section opener never competes with the story the front page chose to
   * lead on. One hero per page is the whole point of having a hero.
   */
  if (variant === "feature") {
    return (
      <article>
        <Kicker article={article} />
        <h3 className="display-2 mt-3">
          <Link to={to} className="hover:text-brand">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <ArticleMeta article={article} className="mt-4" />
      </article>
    );
  }

  if (variant === "index") {
    return (
      <article className="group grid grid-cols-[1.75rem_1fr] gap-x-3">
        <span aria-hidden="true" className="index-num pt-[0.3rem]">
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="display-3">
            <Link to={to} className="transition-colors group-hover:text-brand">
              {article.title}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        </div>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="group grid gap-x-8 gap-y-2 py-6 md:grid-cols-[9rem_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1.5">
          <Kicker article={article} />
          <time
            dateTime={article.publishedAt}
            className="text-xs tabular-nums text-muted-foreground"
          >
            {formatDate(article.publishedAt)}
          </time>
        </div>
        <div>
          <h3 className="headline max-w-2xl text-[1.3125rem] sm:text-[1.4375rem]">
            <Link to={to} className="transition-colors group-hover:text-brand">
              {article.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        </div>
      </article>
    );
  }

  if (variant === "brief") {
    return (
      <article className="group border-b hairline py-3.5 last:border-0">
        <h3 className="font-display text-[1.05rem] leading-snug">
          <Link to={to} className="transition-colors group-hover:text-brand">
            {article.title}
          </Link>
        </h3>
        <p className="t-caption mt-1">
          {article.subcategory ?? getCategory(article.category)?.label} · {article.readingMinutes}{" "}
          min
        </p>
      </article>
    );
  }

  return (
    <article className="card-lift group flex flex-col rounded-lg border border-border bg-card p-5">
      <Kicker article={article} />
      <h3 className="display-3 mt-2.5">
        <Link to={to} className="transition-colors group-hover:text-brand">
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-faint">{article.excerpt}</p>
      <p className="t-caption mt-auto pt-4 font-mono tabular-nums">
        {formatDate(article.publishedAt)} · {article.readingMinutes} min
      </p>
    </article>
  );
}

export function ArticleMeta({ article, className = "" }: { article: Article; className?: string }) {
  // Resolved from the article rather than hard-coded, so a second contributor
  // needs no component change — and the byline leads somewhere.
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
