import { createFileRoute, Link } from "@tanstack/react-router";

import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/newsletter/")({
  head: () => ({
    meta: pageMeta({
      title: `Newsletter — ${site.name}`,
      description:
        "Occasional email covering enterprise IT, security and practical technology. No tracking pixels, no sponsored sends.",
      path: "/newsletter",
    }),
    links: canonical("/newsletter"),
  }),
  component: NewsletterPage,
});

function NewsletterPage() {
  return (
    <div className="mx-auto max-w-editorial px-4 py-14 sm:px-6">
      <h1 className="headline text-3xl sm:text-4xl">Newsletter</h1>
      <div className="article-prose mt-6">
        <p>
          An occasional email with new analysis on enterprise IT, cybersecurity, AI and the
          technology worth paying attention to. Sent when there is something worth sending, not on a
          schedule that requires filler.
        </p>
        <h2 id="how-subscribing-works">How subscribing works</h2>
        <p>
          Subscribing takes two steps, deliberately. Entering your address here asks our email
          provider to send you one confirmation message; you join the list when you click the link
          in it. Nobody can add you to this list by typing your address into the form, and a
          mistyped address never becomes a bounce.
        </p>
        <p>
          Your address is used for this newsletter only, is never sold or shared, and every email
          includes a one-click unsubscribe link. See the{" "}
          <Link to="/privacy" hash="newsletter">
            privacy policy
          </Link>{" "}
          for what is stored and where.
        </p>
      </div>
      <div className="mt-10">
        <NewsletterCTA />
      </div>
    </div>
  );
}
