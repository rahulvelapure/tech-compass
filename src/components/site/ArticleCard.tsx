import { Link } from "@tanstack/react-router";

import { articlePath, formatDate, getAuthor, getCategory, reviewStatusLabel } from "@/lib/content";
import type { Article } from "@/content/types";

interface Props {
  article: Article;
  /** "lead" is the hero story, "index" is a numbered list item. */
  variant?: "card" | "index" | "lead" | "row";
  index?: number;
}

export function ArticleCard({ article, variant = "card", index }: Props) {
  const category = getCategory(article.category);
  const to = articlePath(article);

  if (variant === "lead") {
    return (
      <article>
        <div className="eyebrow mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-accent">
          <span>{category?.title}</span>
          {article.subcategory && (
            <>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
              <span className="text-muted-foreground">{article.subcategory}</span>
            </>
          )}
        </div>
        <h2 className="headline text-3xl sm:text-4xl lg:text-[2.75rem]">
          <Link to={to} className="hover:link-underline">
            {article.title}
          </Link>
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {article.standfirst}
        </p>
        <ArticleMeta article={article} className="mt-5" />
      </article>
    );
  }

  if (variant === "index") {
    return (
      <article className="group">
        <span
          aria-hidden="true"
          className="font-serif text-2xl text-muted-foreground transition-colors group-hover:text-accent"
        >
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug">
          <Link to={to} className="transition-colors group-hover:text-accent">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="flex flex-col gap-1.5 py-5">
        <div className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
          <span className="text-accent">{category?.label}</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span>{article.readingMinutes} min read</span>
        </div>
        <h3 className="font-serif text-xl font-bold leading-snug">
          <Link to={to} className="hover:text-accent">
            {article.title}
          </Link>
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
      </article>
    );
  }

  return (
    <article className="flex flex-col border-t border-border pt-5">
      <div className="eyebrow mb-2 text-accent">{category?.label}</div>
      <h3 className="mb-2 font-serif text-xl font-bold leading-snug">
        <Link to={to} className="hover:text-accent">
          {article.title}
        </Link>
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
      <div className="eyebrow mt-auto text-muted-foreground">
        {formatDate(article.publishedAt)} · {article.readingMinutes} min
      </div>
    </article>
  );
}

export function ArticleMeta({ article, className = "" }: { article: Article; className?: string }) {
  // Resolved from the article rather than hard-coded, so a second contributor
  // needs no component change — and the byline leads somewhere.
  const author = getAuthor(article.authorId);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground ${className}`}
    >
      <Link
        to="/author/$authorId"
        params={{ authorId: author.id }}
        rel="author"
        className="font-medium text-foreground hover:text-accent"
      >
        {author.name}
      </Link>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readingMinutes} min read</span>
      <span aria-hidden="true">·</span>
      <span>{reviewStatusLabel[article.reviewStatus]}</span>
    </div>
  );
}
