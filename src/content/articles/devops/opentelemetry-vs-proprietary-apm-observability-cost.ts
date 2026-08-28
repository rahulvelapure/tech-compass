import type { Article } from "../../types";

export const article: Article = {
  slug: "opentelemetry-vs-proprietary-apm-observability-cost",
  category: "devops",
  contentType: "comparison",
  subcategory: "Observability",
  title:
    "OpenTelemetry vs proprietary APM: the observability decision that changes your operating model",
  seoTitle: "OpenTelemetry vs Proprietary APM: Cost and Architecture",
  metaDescription:
    "OpenTelemetry gives you vendor-neutral instrumentation and a pipeline. Proprietary APM gives you a managed platform. Compare the architecture and the trade-offs.",
  standfirst:
    "OpenTelemetry is not a free swap for Datadog. It is a standard and a pipeline, and what it really changes is who runs what.",
  excerpt:
    "The real OpenTelemetry versus proprietary APM decision is about ownership. Decide which layers your team will operate, which backend you want, and where telemetry cost and complexity should live.",
  authorId: "rahul-velapure",
  publishedAt: "2026-04-13",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "OpenTelemetry vs Datadog",
  secondaryKeywords: [
    "OpenTelemetry Collector architecture",
    "OTLP protocol",
    "observability cost optimization",
    "distributed tracing",
    "application performance monitoring",
  ],
  tags: ["DevOps", "Observability", "OpenTelemetry", "APM", "Cloud Cost"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "service-mesh-mtls-operational-overhead",
    "kubernetes-pod-networking-packet-flow",
    "cloud-egress-costs-architecture-problem",
  ],
  methodology:
    "Verified against the OpenTelemetry 1.11 OTLP specification and stability documentation, plus current Datadog OpenTelemetry documentation. Vendor prices, unsupported performance percentages and the claim that one deployment model is universally cheapest were removed because they are plan, workload and contract dependent.",
  body: [
    {
      type: "p",
      text: "Every big system hits the same wall in the end. A request crosses services, queues and databases. Then it fails, and you need enough data to say why.",
    },
    {
      type: "p",
      text: "People frame this as OpenTelemetry against Datadog. That framing is too narrow. OpenTelemetry, or OTel, is a vendor-neutral set of APIs, SDKs, data models and telemetry parts. Datadog and the other APM platforms are managed products. They take that data in and add their own processing and analysis.",
    },
    {
      type: "p",
      text: "So the real question is not “open source or SaaS”. It is “which layers do we want to run ourselves?” That one leads to a far better design.",
    },
    {
      type: "h2",
      id: "otel",
      text: "What you actually get",
    },
    {
      type: "p",
      text: "OTel sets one way for apps to make and send their data. It covers traces, metrics and logs. The current OTLP spec marks all three as stable. Profiles sit at a different level of maturity.",
    },
    {
      type: "p",
      text: "The OTel Collector is the piece you actually run. It takes data in, works on it, and sends it out to one backend or several. So think of it as a policy and routing layer, not a place to keep things.",
    },
    {
      type: "table",
      caption: "The layers people often mix together",
      head: ["Layer", "OpenTelemetry contribution", "Who owns it in a self-hosted design"],
      rows: [
        ["Instrumentation", "APIs, SDKs and auto-instrumentation", "Application teams"],
        ["Transport", "OTLP", "Application or Collector"],
        ["Collection", "Collector receivers and pipelines", "Platform team"],
        ["Processing", "Batching, filtering, enrichment, sampling", "Platform team"],
        ["Storage", "Not an OTel database", "Chosen backend"],
        ["Analysis", "Not an OTel UI", "Chosen backend and operators"],
      ],
    },
    {
      type: "h2",
      id: "otlp",
      text: "OTLP is the contract between components",
    },
    {
      type: "p",
      text: "OTLP is the OpenTelemetry Protocol. The docs define it over gRPC and over HTTP. Port 4317 is the default for gRPC, and 4318 for HTTP.",
    },
    {
      type: "p",
      text: "This matters because the app no longer has to know where its data ends up. It just sends it in a standard form. The Collector then routes it to a vendor, to an open-source backend, or to several at once.",
    },
    {
      type: "p",
      text: "That split helps most during a move. The wiring in the app stays put while the backend changes. It also helps when security and ops want different signals sent to different places.",
    },
    {
      type: "h2",
      id: "proprietary",
      text: "What you get from a paid platform",
    },
    {
      type: "p",
      text: "A managed APM product rolls a lot into one: collection, storage, indexing, dashboards, alerting, integrations and its own analysis. The vendor runs the control plane and the storage. Your team runs the agents, the config and the wiring in the code.",
    },
    {
      type: "p",
      text: "That can be a big win. Observability is infrastructure, and it carries the same [running cost as any other platform layer](/devops/service-mesh-mtls-operational-overhead). If nobody has time to run collectors, storage, retention, upgrades and recovery, a self-hosted stack just hands you one more system to keep alive.",
    },
    {
      type: "p",
      text: "The trade is lock-in. The more your dashboards lean on one vendor's features, the more a backend change costs you later. Vendor-neutral wiring cuts that down. It does not remove it.",
    },
    {
      type: "h2",
      id: "cost",
      text: "Cost is about the shape of the data",
    },
    {
      type: "p",
      text: "What you pay follows the shape of the data. High-cardinality attributes push it up. So do long retention, chatty logs, and traces you never sampled. The same pattern drives [egress bills](/cloud/cloud-egress-costs-architecture-problem).",
    },
    {
      type: "p",
      text: "A good cost model splits into three questions. How much data do we make? How much do we keep? And where should the detailed stuff live? Those hold up better than any price-per-gigabyte table.",
    },
    {
      type: "table",
      caption: "Cost lever and engineering response",
      head: ["Lever", "Typical control", "Risk if ignored"],
      rows: [
        ["Trace volume", "Head or tail sampling", "Storage and ingest growth"],
        ["Log volume", "Filtering and level policy", "High ingestion without useful signal"],
        ["Cardinality", "Attribute design and limits", "Expensive indexes and slow queries"],
        ["Retention", "Tiered retention", "Paying for data nobody queries"],
        ["Destinations", "Selective export", "Duplicated ingestion cost"],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not use an invented break-even point",
      text: "Where the line falls depends on your volume, your team, your retention, your contract, and what the managed features are worth. “Self-hosting wins above X GB” is a slogan, not a rule.",
    },
    {
      type: "h2",
      id: "sampling",
      text: "Sampling is a control plane decision",
    },
    {
      type: "p",
      text: "You rarely need every trace. Head sampling decides up front, and it is simple. Tail sampling waits until more of the trace has arrived, so it can keep the ones with errors or odd latency.",
    },
    {
      type: "p",
      text: "Tail sampling earns its keep when the good traces are rare. The cost is that the Collector has to hold trace context until it can decide, and that is more to run.",
    },
    {
      type: "p",
      text: "Design sampling around the incident you will have. Keep every good request and drop the rare failures, and the system looks cheap and healthy right up to the outage that counts.",
    },
    {
      type: "h2",
      id: "hybrid",
      text: "The strongest default is often hybrid",
    },
    {
      type: "p",
      text: "The common enterprise shape is OTel wiring feeding a managed backend. The app uses OTel APIs and sends OTLP. A Collector then adds batching, filtering, enrichment and sampling before the data reaches the vendor.",
    },
    {
      type: "p",
      text: "Datadog documents several ways to take OTel data in. You can export from a Collector, send it through the Agent, or use direct OTLP intake. What you get differs by path. So treat the Collector as a boundary you chose, and do not assume every OTLP path gives you the same vendor features.",
    },
    {
      type: "p",
      text: "This keeps the wiring portable and leaves storage and deep analysis to someone else. It also leaves you a way out. Change the backend later and the app does not have to be rewritten just because the vendor did.",
    },
    {
      type: "h2",
      id: "decision",
      text: "Pick the operating model, not the logo",
    },
    {
      type: "table",
      caption: "When each model fits",
      head: ["Need", "Better fit", "Reason"],
      rows: [
        ["Small platform team", "Managed APM", "Less storage and control-plane operations"],
        [
          "Strong platform team",
          "OTel plus managed or self-hosted backend",
          "More control over routing and processing",
        ],
        ["Multiple backends", "OTel Collector", "One instrumentation layer can fan out"],
        [
          "High telemetry sensitivity",
          "OTel Collector",
          "Central policy can redact or filter before export",
        ],
        [
          "Heavy vendor-specific analysis",
          "Vendor SDK or OTel with vendor integration",
          "Preserves product-specific features where they matter",
        ],
        [
          "Migration between vendors",
          "OTel instrumentation",
          "Separates application instrumentation from backend choice",
        ],
      ],
    },
    {
      type: "h2",
      id: "migration",
      text: "A migration path that does not create a second outage",
    },
    {
      type: "p",
      text: "The risky move is the big-bang swap. Observability is itself a thing you lean on during an incident. Turn the old pipe off before you trust the new one, and you have thrown away the evidence you need to debug the move.",
    },
    {
      type: "h2",
      id: "takeaway",
      text: "What to remember",
    },
    {
      type: "ul",
      items: [
        "OpenTelemetry is a standard and telemetry pipeline, not a complete observability backend.",
        "The Collector is the key boundary for processing, sampling and routing.",
        "OTLP decouples instrumentation from the destination.",
        "Cost depends heavily on telemetry volume, cardinality and retention.",
        "A managed APM buys operational simplicity and product features.",
        "A hybrid model often gives enterprises portability without forcing them to self-host storage.",
      ],
    },
  ],
  faq: [
    {
      question: "Does OpenTelemetry replace Datadog?",
      answer:
        "No. OTel gives you the wiring and a way to ship the data. Datadog takes that data and adds storage, dashboards and its own analysis.",
    },
    {
      question: "Does OpenTelemetry store traces and metrics?",
      answer:
        "Not on its own. The Collector can shape data and send it on. You still pick a backend to store it.",
    },
    {
      question: "What is the default OTLP gRPC port?",
      answer: "4317. OTLP over HTTP uses 4318 by default.",
    },
    {
      question: "Is tail sampling always better than head sampling?",
      answer:
        "No. Tail sampling keeps more of the traces you care about. It also asks the Collector to hold more state, and that costs you.",
    },
    {
      question: "What is the safest enterprise migration pattern?",
      answer:
        "Keep the wiring apart from the backend. Run both pipes at once. Check the new one, then move over bit by bit.",
    },
  ],
  sources: [
    {
      title: "OTLP Specification 1.11.0",
      publisher: "OpenTelemetry",
      url: "https://opentelemetry.io/docs/specs/otlp/",
    },
    {
      title: "Versioning and stability for OpenTelemetry clients",
      publisher: "OpenTelemetry",
      url: "https://opentelemetry.io/docs/specs/otel/versioning-and-stability/",
    },
    {
      title: "OpenTelemetry Logs API",
      publisher: "OpenTelemetry",
      url: "https://opentelemetry.io/docs/specs/otel/logs/api/",
    },
    {
      title: "Datadog OTLP Intake Endpoint",
      publisher: "Datadog",
      url: "https://docs.datadoghq.com/opentelemetry/setup/otlp_ingest/",
    },
    {
      title: "OTLP Ingestion by the Datadog Agent",
      publisher: "Datadog",
      url: "https://docs.datadoghq.com/opentelemetry/setup/otlp_ingest_in_the_agent/",
    },
    {
      title: "Ingestion Sampling with OpenTelemetry",
      publisher: "Datadog",
      url: "https://docs.datadoghq.com/opentelemetry/ingestion_sampling/",
    },
  ],
};
