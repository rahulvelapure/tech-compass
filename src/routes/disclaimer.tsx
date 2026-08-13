import { createFileRoute, Link } from "@tanstack/react-router";

import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: pageMeta({
      title: `Disclaimer — ${site.name}`,
      description:
        "The limits of the technical guidance published here, how testing claims are labelled, and how any commercial relationships are disclosed.",
      path: "/disclaimer",
    }),
    links: canonical("/disclaimer"),
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-editorial px-4 py-14 sm:px-6">
      <h1 className="headline text-3xl sm:text-4xl">Disclaimer</h1>
      <div className="article-prose mt-8">
        <h2 id="guidance">Technical guidance</h2>
        <p>
          Articles describe how systems behave in general. They are not tailored to any particular
          environment, and they are not professional, legal or compliance advice. Validate any
          change against your own configuration and change process before applying it.
        </p>
        <h2 id="testing">Testing claims</h2>
        <p>
          Each article states whether it is hands-on, lab-verified, research-based or analysis.
          Nothing here claims hands-on testing that did not happen, and no performance figures are
          published unless they are sourced or measured. The labelling is explained in{" "}
          <Link to="/about">About this publication</Link>.
        </p>
        <h2 id="prices">Prices and availability</h2>
        <p>
          Where prices appear, they carry the date they were last checked. Prices and availability
          change; verify with the seller before buying.
        </p>
        <h2 id="commercial">Advertising and affiliate links</h2>
        <p>
          There is currently no advertising or affiliate content on this site. If either is
          introduced, it will be disclosed on the pages that carry it, and it will not influence
          editorial conclusions.
        </p>
        <h2 id="external">External links</h2>
        <p>
          Links to documentation and primary sources are provided for verification. Their content is
          the responsibility of the sites that publish them.
        </p>
      </div>
    </div>
  );
}
