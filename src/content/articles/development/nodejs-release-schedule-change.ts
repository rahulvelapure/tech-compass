import type { Article } from "../../types";

export const article: Article = {
  slug: "nodejs-release-schedule-change",
  category: "development",
  contentType: "explainer",
  subcategory: "Languages",
  title: "Node.js is changing how it releases: what the new schedule means for upgrades",
  seoTitle: "Node.js release schedule change explained",
  metaDescription:
    "From October 2026 Node.js moves to one major release a year, calendar-aligned version numbers and LTS for every release. What that changes about upgrade planning.",
  standfirst:
    "Node 26 is the last release under the model teams have planned around since 2015. The replacement is simpler, and it removes the decision most teams were getting wrong anyway.",
  excerpt:
    "One major release a year, version numbers matching the calendar year, and every release becoming LTS. The new Node.js schedule changes how upgrade cadence should be planned.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 3,
  primaryKeyword: "nodejs release schedule change lts",
  secondaryKeywords: ["node 26 lts", "node js version support 2026", "node lts policy"],
  tags: ["Development", "Node.js", "Runtimes", "Upgrades"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "graphql-vs-rest-vs-grpc-api-gateway-performance",
    "ingress-nginx-archived-migration",
  ],
  methodology:
    "Written from the Node.js project's own release announcements and published release schedule. Version states are given as at August 2026 and will age; the release page is the authority.",
  body: [
    {
      type: "p",
      text: "Node.js has published two major versions a year since 2015, with even numbers becoming long-term support lines and odd numbers being short-lived. That convention is ending. From October 2026 the project moves to one major release a year, version numbers begin lining up with the calendar year, every release becomes an LTS release, and a new Alpha channel appears for early testing.",
    },
    {
      type: "p",
      text: "Node 26 is the last release under the old model. Node 27 is the first under the new one.",
    },
    { type: "h2", id: "current", text: "Where the versions stand" },
    {
      type: "table",
      caption: "Supported lines as at August 2026",
      head: ["Version", "State", "Note"],
      rows: [
        ["Node 22", "Maintenance LTS", "Critical security fixes only"],
        ["Node 24", "Active LTS", "The default choice for production today"],
        ["Node 26", "Current", "Enters LTS in October 2026"],
      ],
    },
    {
      type: "p",
      text: "Anything older than Node 22 is out of support and receives no security fixes, which in practice means it should be treated the same way as [any other unpatched component in the request path](/devops/ingress-nginx-archived-migration).",
    },
    { type: "h2", id: "why", text: "Why the change helps" },
    {
      type: "p",
      text: "The odd-numbered releases were widely misunderstood. They existed to give the project a place to land breaking changes and give the ecosystem something to test against, but a great many teams read the version number as a stability signal and either avoided them entirely or, worse, deployed one to production without noticing it would be unsupported within months.",
    },
    {
      type: "p",
      text: "Making every release an LTS removes that trap. There is no longer a version whose number implies something the support policy does not back, and the Alpha channel gives the ecosystem the early-testing surface the odd releases were supposed to provide.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Calendar-aligned numbers are a planning feature",
      text: "When a major version number corresponds to a year, the question 'how far behind are we?' becomes arithmetic rather than research. That is a small change with a disproportionate effect on how upgrade debt gets discussed with people outside the engineering team.",
    },
    { type: "h2", id: "what-breaks", text: "What actually breaks in a major upgrade" },
    {
      type: "p",
      text: "Node's own breaking changes are rarely what stops an upgrade. The runtime's public API is conservative, and most application code moves across majors untouched. The friction is almost always somewhere else.",
    },
    {
      type: "ul",
      items: [
        "Native addons. Anything compiling against Node's C++ API needs a rebuild, and a dependency that has stopped being maintained will block the whole upgrade. This is the most common hard stop.",
        "The bundled V8 version. Behaviour that depended on an engine detail, and performance characteristics that a benchmark was tuned against, can both shift.",
        "Deprecated APIs finally being removed. A runtime deprecation warning that has been ignored for two majors becomes a runtime error in the one that removes it.",
        "The toolchain around the runtime, not the runtime itself — the package manager, the test runner, the bundler and the type definitions all need to agree on the target.",
      ],
    },
    {
      type: "p",
      text: "An annual cadence helps here more than it first appears. The work of an upgrade scales with how much changed since the last one, and a team that skips two majors is not doing one upgrade — it is doing three at once, with the failures interleaved so that diagnosing any single one is harder.",
    },
    { type: "h2", id: "planning", text: "What to do about it" },
    {
      type: "ol",
      items: [
        "If you are on Node 22, plan the move to 24 now rather than waiting. Maintenance LTS means security fixes only, and the window is finite.",
        "Treat the October 2026 transition as the moment to write down your upgrade cadence explicitly, since annual releases make an annual policy possible for the first time.",
        "Stop using version parity as a proxy for stability in internal documentation and tooling defaults. The rule is about to stop being true, and stale guidance outlives the policy that produced it.",
        "Check the runtimes your platform actually offers. Managed hosting, container base images and serverless runtimes lag the upstream schedule, and their support windows are the ones that bind you.",
      ],
    },
    {
      type: "p",
      text: "The broader point is that a runtime's release cadence is an input to your own planning, not a detail of someone else's project. A predictable annual cadence lets upgrade work be scheduled like any other recurring commitment, which is a considerably better position than discovering a version reached end of life during an incident.",
    },
  ],
  faq: [
    {
      question: "Which Node.js version should a new project use today?",
      answer:
        "Node 24, the current Active LTS, unless there is a specific reason to be on Node 26. Active LTS is the line that receives both bug fixes and security patches for the longest remaining period.",
    },
    {
      question: "Does the change affect how long a release is supported?",
      answer:
        "The published lifetimes for the current lines are unchanged — Active LTS carries bug fixes and security patches, followed by a maintenance period for critical security fixes. What changes is how many releases exist and that all of them become LTS.",
    },
    {
      question: "Do odd-numbered releases disappear?",
      answer:
        "The distinction disappears, because there is one major release a year and every release becomes LTS. Early testing moves to the new Alpha channel instead.",
    },
  ],
  sources: [
    {
      title: "Evolving the Node.js Release Schedule",
      publisher: "Node.js",
      url: "https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule",
    },
    {
      title: "Node.js Releases",
      publisher: "Node.js",
      url: "https://nodejs.org/en/about/previous-releases",
    },
  ],
};
