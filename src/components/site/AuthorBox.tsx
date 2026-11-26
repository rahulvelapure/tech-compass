import { Link } from "@tanstack/react-router";

import { getAuthor } from "@/lib/content";

export function AuthorBox({ authorId }: { authorId: string }) {
  const author = getAuthor(authorId);

  return (
    <section aria-label="About the author" className="border-t border-border pt-5">
      <h2 className="headline text-[1.15rem]">
        <Link
          to="/author/$authorId"
          params={{ authorId: author.id }}
          rel="author"
          className="hover:text-link"
        >
          {author.name}
        </Link>
      </h2>
      <p className="eyebrow mt-1 text-muted-foreground">{author.role}</p>
      <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{author.bio}</p>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem] font-medium">
        <Link
          to="/author/$authorId"
          params={{ authorId: author.id }}
          className="text-link hover:underline"
        >
          All articles by {author.name.split(" ")[0]} &rarr;
        </Link>
        <Link to="/about" className="text-link hover:underline">
          About this publication &rarr;
        </Link>
      </p>
    </section>
  );
}
