import { createFileRoute, Link } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { latestArticles } from "@/lib/content";
import { site } from "@/lib/site";

export const Route = createFileRoute("/newsletter/confirmed")({
  head: () => ({
    meta: [
      { title: `Subscription confirmed — ${site.name}` },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: NewsletterConfirmedPage,
});

function NewsletterConfirmedPage() {
  const reading = latestArticles(3);

  return (
    <div className="wrap py-8 lg:py-12">
      <div className="reading">
        <Breadcrumbs items={[{ name: "Newsletter" }, { name: "Confirmed" }]} />
        <p className="kicker mt-5">Newsletter</p>
        <h1 className="article-title mt-2">Subscription confirmed</h1>
      </div>

      <div className="article-prose mt-6">
        <p>
          Your email address is confirmed and you are on the list. You will receive an occasional
          email when there is new analysis worth sending — not on a schedule that requires filler.
        </p>
        <p>
          Every email includes a one-click unsubscribe link. Your address is used for this
          newsletter only and is never sold or shared. See the{" "}
          <Link to="/privacy">privacy policy</Link> for the detail.
        </p>
      </div>

      <section className="reading mt-12 border-t border-hairline pt-8">
        <h2 className="kicker mb-4">Recent reading</h2>
        <div className="divide-y divide-hairline">
          {reading.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="index" />
          ))}
        </div>
      </section>
    </div>
  );
}
