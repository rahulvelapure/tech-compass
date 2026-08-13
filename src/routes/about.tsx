import { createFileRoute } from "@tanstack/react-router";

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
    <div className="mx-auto max-w-editorial px-4 py-14 sm:px-6">
      <h1 className="headline text-3xl sm:text-4xl">About this publication</h1>
      <div className="article-prose mt-8">
        <p>
          This is a technology publication covering enterprise IT, AI, cybersecurity, software,
          electronics and the technology people use every day. The editorial approach is simple:
          explain how something works, test it where possible, compare it honestly, and say what
          breaks.
        </p>

        <h2 id="coverage">What is covered</h2>
        <p>
          Enterprise endpoint management and identity, security architecture and governance,
          networking, cloud and automation — alongside practical coverage of software, gadgets,
          hardware, troubleshooting, reviews, comparisons and buying guides.
        </p>

        <h2 id="method">How articles are researched</h2>
        <p>
          Every article states the basis for its conclusions. Four labels are used and applied
          strictly:
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
            <strong>Research-based</strong> — written from documentation, specifications and public
            primary sources.
          </li>
          <li>
            <strong>Analysis</strong> — an argument or assessment, clearly marked as such.
          </li>
        </ul>
        <p>
          Nothing is presented as tested unless it was tested. Where figures matter — performance,
          battery life, pricing — they are either sourced and attributed or omitted.
        </p>

        <h2 id="corrections">Corrections and updates</h2>
        <p>
          Technical articles age. Each article carries its real publication date and, where
          applicable, the date it was last updated. Substantive corrections are noted in the article
          rather than made silently.
        </p>

        <h2 id="independence">Independence</h2>
        <p>
          There is no sponsored content on this site at present. If advertising or affiliate links
          are introduced, they will be disclosed on the pages that carry them, and they will not
          determine what is recommended.
        </p>

        <h2 id="author">Author</h2>
        <p>
          {author.name} — {author.role}. {author.bio}
        </p>
        <p>
          The publication does not publish personal contact details, employer information, customer
          information, or details of any organisation's internal infrastructure. Nothing on this
          site describes a specific organisation's configuration.
        </p>
      </div>
    </div>
  );
}
