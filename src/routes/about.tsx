import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { getAuthor } from "@/lib/content";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: pageMeta({
      title: `About — ${site.name}`,
      description:
        "What this technology publication covers, how articles are researched, and how testing claims are labelled.",
      path: "/about",
    }),
    links: canonical("/about"),
  }),
  component: AboutPage,
});

function AboutPage() {
  const author = getAuthor("rahul-velapure");

  return (
    <div className="wrap py-8 lg:py-12">
      <div className="reading">
        <Breadcrumbs items={[{ name: "About" }]} />
        <p className="kicker mt-5">Editorial charter</p>
        <h1 className="article-title mt-2">About this publication</h1>
      </div>

      <div className="article-prose mt-6">
        <p>
          Substrate is an independent technology publication covering enterprise IT, AI,
          cybersecurity, software, infrastructure, and the systems technical teams operate every
          day. The editorial approach is straightforward: explain how something works, test it where
          possible, compare it honestly, and document what breaks.
        </p>

        <h2 id="coverage">What is covered</h2>
        <p>
          Enterprise endpoint management and identity, security architecture and governance,
          networking, cloud, and automation — alongside practical coverage of software, hardware,
          troubleshooting, comparisons, and buying guides.
        </p>

        <h2 id="method">How articles are researched</h2>
        <p>
          Every article states the basis for its conclusions up front. Four labels are used and
          applied strictly:
        </p>
        <ul>
          <li>
            <strong>Hands-on</strong> — the product or feature was used directly.
          </li>
          <li>
            <strong>Lab-verified</strong> — commands and behaviour were verified in a test
            environment.
          </li>
          <li>
            <strong>Research-based</strong> — written from primary documentation, specifications,
            and public engineering sources.
          </li>
          <li>
            <strong>Analysis</strong> — an architectural argument or assessment, clearly marked as
            such.
          </li>
        </ul>
        <p>
          Nothing is presented as tested unless it was tested. Where figures matter — performance,
          latency, battery life, pricing — they are either sourced and attributed or omitted.
        </p>

        <h2 id="corrections">Corrections and updates</h2>
        <p>
          Technical articles age. Each article carries its genuine publication date and, where
          applicable, the date it was last updated. Substantive corrections are noted on the page
          rather than made silently.
        </p>

        <h2 id="independence">Independence</h2>
        <p>
          There is no sponsored editorial content on this site. Where advertising or affiliate links
          appear, they are clearly separated and disclosed, and they never determine what is covered
          or recommended.
        </p>

        <h2 id="author">Author</h2>
        <p>
          {author.name} — {author.role}. {author.bio}
        </p>
        <p>
          The publication does not publish personal contact details, employer information, customer
          information, or details of any organisation&apos;s internal infrastructure. Nothing on
          this site describes a specific organisation&apos;s configuration.
        </p>
      </div>
    </div>
  );
}
