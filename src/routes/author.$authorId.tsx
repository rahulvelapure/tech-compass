import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { articlesByAuthor, authors, getCategory } from "@/lib/content";
import { authorSchema, breadcrumbSchema, canonical, ldScript, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * Author page.
 *
 * Exists for E-E-A-T and internal linking — a byline that leads somewhere, and
 * one place that collects everything a person has written. It deliberately
 * carries professional positioning and nothing else: no contact details, no
 * employer, no location, no career history. The bio is whatever
 * src/content/authors.ts says, which is the single place to change it.
 */
export const Route = createFileRoute("/author/$authorId")({
  loader: ({ params }) => {
    const author = authors.find((candidate) => candidate.id === params.authorId);
    if (!author) throw notFound();
    return { author };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const { author } = loaderData;
    const path = `/author/${params.authorId}`;

    return {
      meta: pageMeta({
        title: `${author.name} — ${site.name}`,
        description: author.bio,
        path,
        type: "profile",
      }),
      links: canonical(path),
      scripts: [
        ldScript(authorSchema(author)),
        ldScript(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: author.name, path },
          ]),
        ),
      ],
    };
  },
  component: AuthorPage,
});

function AuthorPage() {
  const { author } = Route.useLoaderData();
  const articles = articlesByAuthor(author.id);

  // Which sections this author actually writes in — a compact, honest signal
  // of expertise, derived from published work rather than asserted.
  const sections = [...new Set(articles.map((article) => article.category))]
    .map((slug) => getCategory(slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: author.name }]} />

      <header className="mt-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:gap-6">
        <div
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-display text-lg font-medium"
        >
          {author.initials}
        </div>
        <div>
          <h1 className="headline text-3xl sm:text-4xl">{author.name}</h1>
          <p className="eyebrow mt-2 text-muted-foreground">{author.role}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{author.bio}</p>
        </div>
      </header>

      {sections.length > 0 && (
        <section className="mt-8">
          <h2 className="eyebrow mb-3 text-muted-foreground">Writes about</h2>
          <ul className="flex flex-wrap gap-2">
            {sections.map((category) => (
              <li key={category.slug}>
                <Link
                  to="/$category"
                  params={{ category: category.slug }}
                  className="inline-block border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="eyebrow mb-1 border-b border-border pb-2 text-muted-foreground">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </h2>
        <div className="divide-y divide-border">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="row" />
          ))}
        </div>
      </section>

      <p className="mt-12 border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
        This publication does not publish personal contact details or employer information. For what
        it covers and how articles are researched, see{" "}
        {/* Underlined, not just coloured: inside running text, colour alone is
            not a sufficient distinction (WCAG 1.4.1). */}
        <Link to="/about" className="underline hover:text-brand">
          About
        </Link>
        .
      </p>
    </div>
  );
}
