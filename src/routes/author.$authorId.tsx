import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { articlesByAuthor, authors, getCategory } from "@/lib/content";
import { authorSchema, breadcrumbSchema, canonical, ldScript, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

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
  const sections = [...new Set(articles.map((article) => article.category))]
    .map((slug) => getCategory(slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  return (
    <div className="wrap">
      <div className="border-b border-border py-6">
        <Breadcrumbs items={[{ name: author.name }]} />
        <h1 className="article-title mt-4">{author.name}</h1>
        <p className="eyebrow mt-2 text-muted-foreground">{author.role}</p>
        <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">{author.bio}</p>
        {sections.length > 0 && (
          <p className="mt-4 text-[0.9375rem] text-muted-foreground">
            Writes about{" "}
            {sections.map((category, index) => (
              <span key={category.slug}>
                {index > 0 && ", "}
                <Link
                  to="/$category"
                  params={{ category: category.slug }}
                  className="text-link underline underline-offset-2 hover:decoration-2"
                >
                  {category.label}
                </Link>
              </span>
            ))}
            .
          </p>
        )}
      </div>

      <section className="py-8">
        <h2 className="kicker mb-3">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="row" />
          ))}
        </div>
      </section>

      <p className="measure border-t border-border py-8 text-[0.9375rem] leading-relaxed text-muted-foreground">
        This publication does not publish personal contact details or employer information. For what
        it covers and how articles are researched, see{" "}
        {/* Underlined so the link does not rely on colour alone (WCAG 1.4.1). */}
        <Link to="/about" className="underline underline-offset-2 hover:text-foreground">
          About
        </Link>
        .
      </p>
    </div>
  );
}
