import { createFileRoute, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { HeaderAdSlot, InFeedAdSlot } from "@/components/monetization/AdSlot";
import {
  articlesForCategory,
  featuredArticle,
  getAuthor,
  getCategory,
  latestArticles,
} from "@/lib/content";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: pageMeta({
      title: `${site.name} — Technology, explained properly`,
      description: site.description,
      path: "/",
    }),
    links: canonical("/"),
  }),
  component: HomePage,
});

const SECTIONS: { slug: string; title: string }[] = [
  { slug: "ai", title: "AI" },
  { slug: "microsoft-intune", title: "Enterprise IT" },
  { slug: "cybersecurity-ciso", title: "Cybersecurity" },
  { slug: "how-to", title: "How-to and troubleshooting" },
];

function HomePage() {
  const lead = featuredArticle();
  const secondary = latestArticles(3, [lead.slug]);
  const latest = latestArticles(5, [lead.slug, ...secondary.map((a) => a.slug)]);
  const author = getAuthor("rahul-velapure");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HeaderAdSlot />

      {/* Editorial hero */}
      <section className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-8">
          <h1 className="eyebrow mb-6 text-muted-foreground">
            {site.name} — {site.tagline}
          </h1>

          <ArticleCard article={lead} variant="lead" />
        </div>

        <div className="lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
          <h2 className="eyebrow mb-6 border-b border-border pb-2 text-muted-foreground">
            Also worth reading
          </h2>
          <div className="space-y-8">
            {secondary.map((article, i) => (
              <ArticleCard key={article.slug} article={article} variant="index" index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest — hidden entirely rather than rendering a bare heading when
          the lead and the secondary rail have already used everything published. */}
      {latest.length > 0 && (
        <section className="border-t border-border py-14">
          <SectionHeader title="Latest" />
          <div className="divide-y divide-border">
            {latest.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="row" />
            ))}
          </div>
          <InFeedAdSlot />
        </section>
      )}

      {/* Category sections */}
      {SECTIONS.map(({ slug, title }) => {
        const category = getCategory(slug);
        const items = (category ? articlesForCategory(category) : []).slice(0, 3);
        if (!category || items.length === 0) return null;

        return (
          <section key={slug} className="border-t border-border py-14">
            <SectionHeader title={title} href={slug}>
              {category.intro}
            </SectionHeader>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Resources */}
      <section className="border-t border-border py-14">
        <SectionHeader title="Resources">
          Checklists, decision matrices and configuration references that go with the articles.
        </SectionHeader>
        <Link
          to="/resources"
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          Browse resources →
        </Link>
      </section>

      {/* Author credibility — deliberately small */}
      <section className="border-t border-border py-14">
        <div className="flex max-w-3xl flex-col gap-2">
          <h2 className="eyebrow text-muted-foreground">Who writes this</h2>
          <p className="text-[15px] leading-relaxed text-foreground/90">
            {author.bio}{" "}
            <Link to="/about" className="text-accent underline">
              About the publication
            </Link>
          </p>
        </div>
      </section>

      <div className="pb-4">
        <NewsletterCTA />
      </div>
    </div>
  );
}
