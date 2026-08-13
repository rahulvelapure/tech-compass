import { createFileRoute, Link } from "@tanstack/react-router";

import { latestArticles } from "@/lib/content";
import { ArticleCard } from "@/components/site/ArticleCard";
import { site } from "@/lib/site";

/**
 * Landing page for the confirmation link in the double opt-in email. Brevo
 * redirects here after recording consent, so this is the first page a new
 * subscriber sees — it confirms what just happened and offers something to read.
 *
 * Deliberately noindex: it is a transactional endpoint, not a content page,
 * and indexing it would put a dead-end in search results.
 */
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
    <div className="mx-auto max-w-editorial px-4 py-14 sm:px-6">
      <p className="eyebrow text-accent">Newsletter</p>
      <h1 className="headline mt-3 text-3xl sm:text-4xl">Subscription confirmed</h1>

      <div className="article-prose mt-6">
        <p>
          Your email address is confirmed and you are on the list. You will get an occasional email
          when there is new analysis worth sending — not on a schedule that requires filler.
        </p>
        <p>
          Every email includes a one-click unsubscribe link. Your address is used for this
          newsletter only and is never sold or shared. See the{" "}
          <Link to="/privacy">privacy policy</Link> for the detail.
        </p>
      </div>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="eyebrow mb-5 text-muted-foreground">Start here</h2>
        <div className="space-y-7">
          {reading.map((article, index) => (
            <ArticleCard key={article.slug} article={article} variant="index" index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
