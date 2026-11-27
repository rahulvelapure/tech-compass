import { Link } from "@tanstack/react-router";

import { getAuthor } from "@/lib/content";

export function AuthorBox({ authorId }: { authorId: string }) {
  const author = getAuthor(authorId);

  return (
    <section aria-label="About the author" className="border-t border-hairline pt-6">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h2 className="headline text-[1.125rem]">
          <Link
            to="/author/$authorId"
            params={{ authorId: author.id }}
            rel="author"
            className="inline-flex min-h-6 items-center transition-colors hover:text-link"
          >
            {author.name}
          </Link>
        </h2>
        <span className="text-[0.8125rem] text-muted-foreground">&middot; {author.role}</span>
      </div>
      <p className="measure mt-2 text-[0.90625rem] leading-relaxed text-ink-soft">{author.bio}</p>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.875rem] font-medium">
        <Link
          to="/author/$authorId"
          params={{ authorId: author.id }}
          className="inline-flex min-h-6 items-center text-link hover:underline"
        >
          All articles by {author.name.split(" ")[0]} &rarr;
        </Link>
        <Link to="/about" className="inline-flex min-h-6 items-center text-link hover:underline">
          About this publication &rarr;
        </Link>
      </p>
    </section>
  );
}
