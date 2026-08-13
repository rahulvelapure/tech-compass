import { createFileRoute } from "@tanstack/react-router";

import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: pageMeta({
      title: `Terms of use — ${site.name}`,
      description:
        "Terms covering use of this site, its content, copyright and the limits of the technical guidance published here.",
      path: "/terms",
    }),
    links: canonical("/terms"),
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-editorial px-4 py-14 sm:px-6">
      <h1 className="headline text-3xl sm:text-4xl">Terms of use</h1>
      <div className="article-prose mt-8">
        <h2 id="use">Use of this site</h2>
        <p>
          The site is provided for reading and reference. You may link to articles and quote short
          extracts with attribution and a link to the original page.
        </p>
        <h2 id="copyright">Copyright</h2>
        <p>
          Articles, diagrams and code samples are the author&apos;s work unless stated otherwise.
          Republishing an article in full, or reproducing it as training material or as a derivative
          page, requires permission. Product names and trademarks referenced remain the property of
          their respective owners.
        </p>
        <h2 id="code">Code samples</h2>
        <p>
          Commands and scripts are published as examples. Review them, understand what they do, and
          test them in a non-production environment before running them anywhere that matters.
        </p>
        <h2 id="availability">Availability</h2>
        <p>
          The site is offered as-is, without any guarantee of availability, and content may change
          or be removed without notice.
        </p>
        <h2 id="changes">Changes to these terms</h2>
        <p>These terms may be updated. The current version is always the one on this page.</p>
      </div>
    </div>
  );
}
