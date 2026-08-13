import { createFileRoute } from "@tanstack/react-router";

import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: pageMeta({
      title: `Privacy — ${site.name}`,
      description:
        "What this site collects, what it does not, and how any future analytics or newsletter data would be handled.",
      path: "/privacy",
    }),
    links: canonical("/privacy"),
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-editorial px-4 py-14 sm:px-6">
      <h1 className="headline text-3xl sm:text-4xl">Privacy</h1>
      <div className="article-prose mt-8">
        <h2 id="collection">What this site collects</h2>
        <p>
          The site does not run advertising, third-party trackers or analytics at present. Pages are
          served as static content and no account is required to read anything.
        </p>
        <h2 id="hosting">Server logs</h2>
        <p>
          The hosting provider may record standard request information such as IP address, user
          agent and requested URL for operational and security purposes. That processing is the
          provider&apos;s, and it is not used here to build profiles of readers.
        </p>
        <h2 id="newsletter">Newsletter</h2>
        <p>
          The newsletter uses confirmed opt-in. Submitting the form does not subscribe you: it asks
          our email provider to send one confirmation message, and your address joins the list only
          when you click the link in that message. If you never click it, nothing is stored beyond
          the provider&apos;s record of the unconfirmed request, which expires.
        </p>
        <p>
          Your address is used to send this newsletter and nothing else. It is never sold, shared or
          used to build a profile, every email carries a one-click unsubscribe link, and you can ask
          for your address to be deleted at any time. Subscriber data is held by the email provider;
          this site stores none of it.
        </p>
        <p>
          The signup form checks for automated submissions. To do that it briefly uses your IP
          address to apply a rate limit — in hashed form, not stored, and never written to logs.
        </p>
        <h2 id="analytics">Future analytics and advertising</h2>
        <p>
          If analytics or advertising is introduced, this page will be updated before it goes live,
          stating what is collected and how consent is handled where consent is required.
        </p>
        <h2 id="contact">Questions</h2>
        <p>
          Privacy questions can be raised through the publication&apos;s public channels. Personal
          contact details are deliberately not published here.
        </p>
      </div>
    </div>
  );
}
