import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { canonical, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: pageMeta({
      title: `Resources — ${site.name}`,
      description:
        "Checklists, decision matrices, configuration references and scripts that accompany the articles.",
      path: "/resources",
    }),
    links: canonical("/resources"),
  }),
  component: ResourcesPage,
});

const PLANNED = [
  {
    title: "Conditional Access policy inventory",
    kind: "Template",
    detail: "A structure for recording policy purpose, scope, exclusions, owner and review date.",
  },
  {
    title: "Autopilot readiness checklist",
    kind: "Checklist",
    detail:
      "Network endpoints, licensing, blocking-app scope and timeout decisions to confirm before a rollout.",
  },
  {
    title: "ISO 27001 control mapping sheet",
    kind: "Decision matrix",
    detail: "Control, capability, configuration, evidence and review columns, ready to populate.",
  },
  {
    title: "Graph reporting snippets",
    kind: "Scripts",
    detail: "Paging, least-privilege scopes and export patterns for repeatable reports.",
  },
];

function ResourcesPage() {
  return (
    <div className="wrap py-8 lg:py-12">
      <div className="reading">
        <Breadcrumbs items={[{ name: "Resources" }]} />
        <p className="kicker mt-5">Working artefacts</p>
        <h1 className="article-title mt-2">Resources</h1>
        <p className="standfirst mt-3">
          Practical artefacts that accompany the articles: checklists, templates, decision matrices,
          and scripts.
        </p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Nothing is published here yet. The list below is the editorial queue in the order it is
          being prepared — not downloads that already exist.
        </p>

        <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
          {PLANNED.map((item) => (
            <li key={item.title} className="py-5">
              <p className="eyebrow text-muted-foreground">{item.kind} &middot; In preparation</p>
              <h2 className="headline mt-1.5 text-[1.2rem]">{item.title}</h2>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
