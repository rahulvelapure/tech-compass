import type { Article } from "../../types";

export const article: Article = {
  slug: "opentelemetry-vs-proprietary-apm-observability-cost",
  category: "devops",
  contentType: "comparison",
  subcategory: "Observability",
  title:
    "OpenTelemetry vs proprietary APM: the observability decision that changes your operating model",
  seoTitle: "OpenTelemetry vs Proprietary APM: Cost, Architecture, and Trade-Offs",
  metaDescription:
    "OpenTelemetry gives you vendor-neutral instrumentation and a telemetry pipeline. Proprietary APM gives you a managed observability platform. Compare the architecture and operating trade-offs.",
  standfirst:
    "OpenTelemetry is not a free Datadog replacement. It is a telemetry standard and pipeline that changes where instrumentation, processing and operations live.",
  excerpt:
    "The real OpenTelemetry versus proprietary APM decision is about ownership. Decide which layers your team will operate, which backend you want, and where telemetry cost and complexity should live.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 4,
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
  draft: true,
  methodology:
    "Verified against the OpenTelemetry 1.11 OTLP specification and stability documentation, plus current Datadog OpenTelemetry documentation. Vendor prices, unsupported performance percentages and the claim that one deployment model is universally cheapest were removed because they are plan, workload and contract dependent.",
  body: [
    {
      type: "p",
      text: "Every distributed system eventually reaches the same observability problem. A request crosses services, queues and databases. The team needs enough telemetry to explain the failure.",
    },
    {
      type: "p",
      text: "The architectural choice is often framed as OpenTelemetry versus Datadog. That framing is too narrow. OpenTelemetry is a vendor-neutral set of APIs, SDKs, data models and telemetry components. Datadog and other APM platforms are managed products that can consume that telemetry and add their own processing and analysis.",
    },
    {
      type: "p",
      text: "The useful decision is therefore not “open source or SaaS.” It is “which layers do we want to own?” That question produces a much better architecture.",
    },
    {
      type: "h2",
      id: "otel",
      text: "What OpenTelemetry actually provides",
    },
    {
      type: "p",
      text: "OpenTelemetry standardises how applications create and export observability data. The project covers traces, metrics and logs, with the current OTLP specification marking those signal types as stable. Profiles are at a different maturity level.",
    },
    {
      type: "p",
      text: "The OpenTelemetry Collector is the key operational component. It can receive telemetry, process it and export it to one or more backends. That makes the Collector a policy and routing layer rather than a storage system.",
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
      text: "OTLP is the OpenTelemetry Protocol. Current documentation defines it over gRPC and HTTP. The default ports are 4317 for OTLP/gRPC and 4318 for OTLP/HTTP.",
    },
    {
      type: "p",
      text: "This matters because the application does not need to know which database or dashboard will consume the data. The application exports telemetry in a standard form. The Collector can then route it to a managed vendor, an open-source backend or several destinations.",
    },
    {
      type: "p",
      text: "That separation is useful during a migration. Instrumentation can stay stable while the backend changes. It is also useful when security and operations want different destinations for different signals.",
    },
    {
      type: "h2",
      id: "proprietary",
      text: "What a proprietary APM platform adds",
    },
    {
      type: "p",
      text: "A managed APM product typically combines collection, storage, indexing, dashboards, alerting, integrations and product-specific analysis. The vendor operates the control plane and the storage service. Your team operates agents, configuration and instrumentation.",
    },
    {
      type: "p",
      text: "That can be a major advantage. Observability is infrastructure. If the team has no capacity to operate collectors, storage, retention, upgrades and failure recovery, a self-hosted stack can create another production system to maintain.",
    },
    {
      type: "p",
      text: "The trade-off is dependency. The more analysis and dashboards depend on proprietary features, the more expensive a backend change becomes. Vendor-neutral instrumentation reduces that dependency, but it does not eliminate it.",
    },
    {
      type: "h2",
      id: "cost",
      text: "Telemetry cost is a data-shape problem",
    },
    {
      type: "p",
      text: "Observability cost grows from the shape of the telemetry. High-cardinality attributes, long retention, verbose logs and unsampled traces can create large storage and ingestion requirements.",
    },
    {
      type: "p",
      text: "A useful cost model separates three decisions. First, how much data should be generated? Second, how much should be retained? Third, where should detailed data live? These questions are more durable than a price-per-gigabyte table.",
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
      text: "The right cost boundary depends on telemetry volume, team capacity, retention, vendor contract and the value of managed features. A statement such as “self-hosting wins above X GB” is not a general engineering rule.",
    },
    {
      type: "h2",
      id: "sampling",
      text: "Sampling is a control plane decision",
    },
    {
      type: "p",
      text: "Collecting every trace is often unnecessary. Head sampling decides early and is simple. Tail sampling waits for more of the trace before deciding, so it can preserve traces that show errors or unusual latency.",
    },
    {
      type: "p",
      text: "Tail sampling is especially useful when the interesting traces are rare. The trade-off is operational complexity because the Collector must keep enough trace context to make the decision.",
    },
    {
      type: "p",
      text: "Sampling should be designed with incident response in mind. If every successful request is sampled but rare failures are dropped, the system looks cheap and healthy until the incident that matters.",
    },
    {
      type: "h2",
      id: "hybrid",
      text: "The strongest default is often hybrid",
    },
    {
      type: "p",
      text: "A common enterprise architecture is OpenTelemetry instrumentation feeding a managed backend. The application uses OTel APIs and exports OTLP. A Collector can add batching, filtering, enrichment and sampling before sending data to the vendor.",
    },
    {
      type: "p",
      text: "Datadog currently documents several OTel ingestion paths, including Collector-based export, Agent ingestion and direct OTLP intake. The feature set differs by path. That is exactly why the architecture should treat the Collector as an intentional boundary rather than assuming every OTLP path provides identical vendor features.",
    },
    {
      type: "p",
      text: "This model keeps instrumentation portable while keeping storage and advanced analysis managed. It also leaves an escape route. If the backend changes, the application does not need to be rewritten simply because the observability vendor changed.",
    },
    {
      type: "h2",
      id: "decision",
      text: "Choose the operating model, not the logo",
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
      text: "The dangerous migration is a big-bang replacement. Observability is itself an incident-response dependency. Losing the old telemetry before the new pipeline is trustworthy removes the evidence needed to diagnose the migration.",
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
        "No. OpenTelemetry provides standard instrumentation and telemetry transport. Datadog can receive that telemetry and provide managed storage, analysis, dashboards and other product features.",
    },
    {
      question: "Does OpenTelemetry store traces and metrics?",
      answer:
        "Not by itself. The OpenTelemetry Collector can process and export data, but you still choose a backend for storage and analysis.",
    },
    {
      question: "What is the default OTLP gRPC port?",
      answer: "4317. OTLP over HTTP uses 4318 by default.",
    },
    {
      question: "Is tail sampling always better than head sampling?",
      answer:
        "No. Tail sampling can preserve interesting traces more effectively, but it requires more Collector state and operational complexity.",
    },
    {
      question: "What is the safest enterprise migration pattern?",
      answer:
        "Keep OpenTelemetry instrumentation separate from the backend. Run old and new pipelines in parallel, validate telemetry, then change the destination gradually.",
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
