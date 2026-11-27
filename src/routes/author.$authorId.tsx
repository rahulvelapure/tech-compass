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
    <div className="wrap py-8 lg:py-12">
      <header className="border-b border-hairline pb-8">
        <Breadcrumbs items={[{ name: author.name }]} />
        <p className="kicker mt-5">{author.role}</p>
        <h1 className="article-title mt-2">{author.name}</h1>
        <p className="standfirst mt-3 max-w-[40rem]">{author.bio}</p>
        {sections.length > 0 && (
          <p className="mt-4 max-w-[44rem] text-[0.90625rem] leading-relaxed text-muted-foreground">
            Publishes across{" "}
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
      </header>

      <section className="py-10">
        <h2 className="kicker mb-4 tabular-nums">
          {articles.length} published {articles.length === 1 ? "article" : "articles"}
        </h2>
        <div className="divide-y divide-hairline border-y border-hairline">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="row" />
          ))}
        </div>
      </section>

      <p className="measure border-t border-hairline pt-8 text-[0.875rem] leading-relaxed text-muted-foreground">
        This publication does not publish personal contact details or employer information. For what
        it covers and how articles are researched, see{" "}
        <Link to="/about" className="text-link underline underline-offset-2 hover:decoration-2">
          About this publication
        </Link>
        .
      </p>
    </div>
  );
}
