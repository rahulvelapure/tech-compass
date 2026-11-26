import { createFileRoute } from "@tanstack/react-router";

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
    <div className="wrap py-8">
      <div className="reading">
        <h1 className="article-title">Resources</h1>
        <p className="standfirst mt-3">
          Practical artefacts that accompany the articles: checklists, templates, decision matrices
          and scripts.
        </p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Nothing is published here yet. The list below is the queue, in the order it is being
          worked on — it is not a set of downloads that already exist.
        </p>

        <ul className="mt-8 divide-y divide-border border-y border-border">
          {PLANNED.map((item) => (
            <li key={item.title} className="py-5">
              <p className="eyebrow text-muted-foreground">{item.kind} &middot; In preparation</p>
              <h2 className="headline mt-1 text-[1.25rem]">{item.title}</h2>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
