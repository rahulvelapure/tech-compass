import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: pageMeta({
      title: `Privacy — ${site.name}`,
      description:
        "How Substrate handles privacy, cookies, advertising, newsletter subscriptions, article reactions and related data.",
      path: "/privacy",
    }),
    links: canonical("/privacy"),
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="wrap py-8 lg:py-12">
      <div className="reading">
        <Breadcrumbs items={[{ name: "Privacy" }]} />
        <p className="kicker mt-5">Legal &amp; data practices</p>
        <h1 className="article-title mt-2">Privacy</h1>
      </div>

      <div className="article-prose mt-6">
        <p>
          Substrate is a technology publication. You do not need an account to read articles. This
          page explains the limited data used to operate the site and the third-party services that
          may process information when you use it.
        </p>

        <h2 id="advertising">Advertising and Google AdSense</h2>

        <p>
          Substrate uses Google AdSense to display advertising. Google and other third-party vendors
          may use cookies or similar technologies to serve, measure and improve advertising shown on
          this site.
        </p>

        <p>
          Third-party vendors, including Google, may use cookies to serve ads based on a
          visitor&apos;s previous visits to Substrate or other websites. Google&apos;s use of
          advertising cookies enables Google and its partners to provide advertising that may be
          based on visits to this site and other sites on the Internet.
        </p>

        <h2 id="personalised-ads">Personalised and non-personalised advertising</h2>

        <p>
          Depending on your location, consent choices and Google&apos;s advertising settings,
          advertising may be personalised or non-personalised.
        </p>

        <p>
          Personalised advertising may use information collected previously, such as browsing
          activity, interests, approximate location or other signals, to influence which
          advertisements are shown.
        </p>

        <p>
          Non-personalised advertising is not selected using a visitor&apos;s past behaviour. It may
          instead use contextual information such as the content being viewed and coarse location.
          Cookies or similar technologies may still be used for purposes such as frequency capping,
          fraud prevention, security and aggregated advertising reporting.
        </p>

        <h2 id="consent">Advertising consent</h2>

        <p>
          Where consent is required, including for relevant visitors in the European Economic Area,
          the United Kingdom and Switzerland, Substrate uses Google&apos;s consent-management
          functionality to present available privacy choices.
        </p>

        <p>
          Depending on the options available for your region, you may be able to consent, decline
          consent or manage individual privacy choices. Your choices determine how advertising
          technologies may be used where applicable.
        </p>

        <h2 id="advertising-controls">Your advertising choices</h2>

        <p>
          You can review and manage Google advertising personalisation through Google&apos;s
          advertising settings. Browser settings can also be used to remove or restrict cookies,
          although doing so may affect some site or advertising functions.
        </p>

        <p>
          Other advertising vendors or networks used through Google&apos;s advertising services may
          provide their own privacy choices and opt-out mechanisms.
        </p>

        <h2 id="server-logs">Server logs</h2>

        <p>
          The hosting provider may process standard request information such as IP address, browser
          or user-agent information and the requested URL for operational, performance,
          abuse-prevention and security purposes.
        </p>

        <p>Substrate does not use hosting logs to build reader profiles.</p>

        <h2 id="newsletter">Newsletter</h2>

        <p>
          The newsletter uses confirmed opt-in. Submitting the form does not immediately subscribe
          you. It asks the email provider to send a confirmation message, and your address joins the
          mailing list only after you confirm the subscription.
        </p>

        <p>
          Your email address is used to operate the newsletter. It is not sold or used by Substrate
          to build an advertising profile. Newsletter messages provide an unsubscribe mechanism, and
          you may request deletion of your subscription information.
        </p>

        <p>
          Subscriber information is held by the email service provider rather than in
          Substrate&apos;s article content database.
        </p>

        <p>
          The signup process also includes controls intended to reduce automated or abusive
          submissions. An IP address may be used temporarily for rate limiting. Where Substrate
          performs this check, the value used by the application is hashed and is not retained as a
          reader profile.
        </p>

        <h2 id="reactions">Article views and reactions</h2>

        <p>
          Published articles maintain an aggregate visit counter. Recording an article view does not
          create a browser cookie or store personal reader details; an IP address may be hashed
          temporarily in memory solely to limit automated request floods.
        </p>

        <p>
          Articles may also provide a useful / not useful control. When you select a reaction, the
          site stores a small cookie containing a random identifier. It does not contain your name
          or email address.
        </p>

        <p>
          The identifier is used to remember that the browser has already reacted to an article,
          reduce duplicate reactions and display the previous choice when appropriate.
        </p>

        <p>
          No reaction cookie is created simply because you read an article. Clearing the relevant
          browser cookies removes the identifier from your browser.
        </p>

        <p>
          Reaction requests are also rate limited to reduce automated abuse. An IP address may be
          processed temporarily for this purpose. The reaction counts are used to understand which
          articles readers find useful rather than to build individual reader profiles.
        </p>

        <h2 id="comments">Article comments</h2>

        <p>
          Published articles provide a comment section where readers can post plain-text remarks and
          replies using a display name of their choice without registering an account or providing
          an email address.
        </p>

        <p>
          When you publish or upvote a comment, the site uses the same random browser cookie
          identifier described above so that duplicate helpful votes are prevented and so that you
          can delete a comment you recently submitted from the same browser. That random identifier
          is not published alongside your comment.
        </p>

        <p>
          Comment submissions pass through automated spam, link-count and rate-limit checks. A
          hashed form of your IP address may be held briefly in server memory to prevent automated
          floods, and comments that match automated spam patterns or site moderation rules may be
          hidden or removed.
        </p>

        <h2 id="cookies">Cookies and similar technologies</h2>

        <p>
          Cookies may therefore be used on Substrate for several distinct purposes: advertising and
          advertising measurement, recording consent choices, remembering article reactions,
          security, fraud prevention and other functions necessary to operate the site.
        </p>

        <p>
          The exact cookies visible in your browser can vary according to your location, consent
          choices, browser configuration and which site features are used.
        </p>

        <h2 id="third-parties">Third-party services</h2>

        <p>
          Third-party services used by Substrate may process information under their own privacy
          terms. These include the hosting infrastructure, newsletter provider and Google
          advertising services where those services are active.
        </p>

        <p>
          Substrate does not sell reader email addresses or intentionally provide newsletter
          subscriber details to advertisers for advertising profiles.
        </p>

        <h2 id="changes">Changes to this policy</h2>

        <p>
          This policy may be updated when Substrate changes its advertising, analytics, newsletter,
          hosting or other data-processing arrangements. Material changes will be reflected on this
          page.
        </p>

        <h2 id="contact">Questions</h2>

        <p>
          Privacy questions can be raised through the publication&apos;s public channels. Personal
          contact details are deliberately not published on this page.
        </p>
      </div>
    </div>
  );
}
