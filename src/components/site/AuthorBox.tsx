import { Link } from "@tanstack/react-router";

import { getAuthor } from "@/lib/content";

export function AuthorBox({ authorId }: { authorId: string }) {
  const author = getAuthor(authorId);

  return (
    <section
      aria-label="About the author"
      className="flex gap-4 border border-border bg-surface p-6"
    >
      <div
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-bold"
      >
        {author.initials}
      </div>
      <div>
        <h2 className="text-sm font-semibold">
          <Link
            to="/author/$authorId"
            params={{ authorId: author.id }}
            rel="author"
            className="hover:text-brand"
          >
            {author.name}
          </Link>
        </h2>
        <p className="eyebrow mt-0.5 text-muted-foreground">{author.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{author.bio}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
          <Link
            to="/author/$authorId"
            params={{ authorId: author.id }}
            className="text-brand hover:underline"
          >
            All articles by {author.name.split(" ")[0]} →
          </Link>
          <Link to="/about" className="text-brand hover:underline">
            About this publication →
          </Link>
        </div>
      </div>
    </section>
  );
}
