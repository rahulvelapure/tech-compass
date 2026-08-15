import type { Article } from "../../types";

export const article: Article = {
  slug: "model-context-protocol-explained",
  category: "ai-enterprise-it",
  contentType: "explainer",
  subcategory: "Agents",
  title: "Model Context Protocol: what it standardises, and what the 2026 revision changed",
  seoTitle: "Model Context Protocol explained for enterprise IT",
  metaDescription:
    "What MCP standardises, why the 2026-07-28 revision removed protocol-level sessions, and what a stateless core means for running MCP servers internally.",
  standfirst:
    "The protocol stopped being a transport problem and became an infrastructure one. The July 2026 revision is the point at which MCP servers started to look like ordinary web services.",
  excerpt:
    "MCP standardises how a model reaches a tool. The 2026-07-28 revision made the protocol core stateless, which changes how these servers are deployed and scaled.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 3,
  primaryKeyword: "model context protocol enterprise explained",
  secondaryKeywords: ["mcp stateless spec", "mcp server enterprise deployment", "mcp 2026-07-28"],
  tags: ["AI", "Agents", "MCP", "Integration"],
  reviewStatus: "research-based",
  relatedSlugs: ["ai-agents-it-operations", "eu-ai-act-obligations-timeline"],
  methodology:
    "Written from the Model Context Protocol specification and the maintainers' release notes for the 2026-07-28 revision. Deployment implications are reasoned from the documented protocol behaviour rather than from a measured deployment.",
  body: [
    {
      type: "p",
      text: "Every integration between a language model and a real system solves the same three problems: how the model discovers what it can call, how a call is made and its result returned, and how the whole exchange is authorised. Before MCP, each product solved them privately, which meant an integration written for one assistant was worth nothing to the next. The Model Context Protocol standardises that interface so a tool implemented once can be consumed by any client that speaks the protocol.",
    },
    {
      type: "p",
      text: "For enterprise IT the interesting question is not what the protocol enables but what it becomes to operate. An MCP server that exposes an internal ticketing system is a production service on the internal network with an authorisation model, an availability requirement and an audit obligation. It is also the plumbing beneath [what agents can realistically be trusted with in IT operations](/ai-enterprise-it/ai-agents-it-operations). The July 2026 revision changed how that service is built.",
    },
    { type: "h2", id: "what-it-standardises", text: "What the protocol standardises" },
    {
      type: "ul",
      items: [
        "Tools — callable operations the model may invoke, with a described input schema so the client knows what arguments are valid.",
        "Resources — readable context the model can pull in, addressed by URI rather than pasted into a prompt.",
        "Prompts — reusable templates the server offers to the client, so a server can supply its own recommended usage.",
        "Authorisation — how a client proves it is entitled to the call it is making, which is where most enterprise scrutiny lands.",
      ],
    },
    {
      type: "p",
      text: "The division matters when deciding what to expose. A resource is read and can be cached. A tool performs an action and may have a side effect. Treating both as one category is the most common design mistake, and it is the one that makes an audit trail meaningless.",
    },
    { type: "h2", id: "stateless", text: "The 2026-07-28 revision: a stateless core" },
    {
      type: "p",
      text: "The current specification revision is dated 2026-07-28 and carries breaking changes. The headline change is that the protocol core became stateless: protocol-level sessions were removed, along with the Mcp-Session-Id header that carried them. Any server instance can now answer any request.",
    },
    {
      type: "table",
      caption: "What the stateless core changes operationally",
      head: ["Concern", "Before", "After"],
      rows: [
        [
          "Load balancing",
          "Requests had to return to the instance holding the session",
          "Ordinary HTTP load balancing, no affinity required",
        ],
        [
          "Scaling",
          "Scale-in risked terminating live sessions",
          "Instances are interchangeable and disposable",
        ],
        [
          "Deployment",
          "Rolling updates had to drain sessions",
          "Rolling updates behave like any stateless web service",
        ],
        [
          "Failure recovery",
          "Instance loss lost session context",
          "A failed request can be retried against any instance",
        ],
      ],
    },
    {
      type: "p",
      text: "This is the change that moves MCP servers into standard infrastructure. Session affinity is an operational tax — it constrains autoscaling, complicates deployments and creates a failure mode where losing one instance loses in-flight work. Removing it means an MCP server can be run on the same platform, with the same patterns, as any other internal HTTP service.",
    },
    {
      type: "p",
      text: "The revision also adds multi round-trip requests, header-based routing, cacheable list results, a formal extensions framework, and hardening in the authorisation model.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The specification is dated, and that is deliberate",
      text: "MCP revisions are identified by date and have introduced breaking changes between them. Any internal documentation, client or server should name the revision it targets. An undated claim about MCP behaviour has a short shelf life.",
    },
    { type: "h2", id: "enterprise", text: "What to settle before exposing an internal system" },
    {
      type: "ol",
      items: [
        "Decide whose authority a call carries. A server acting with its own broad service identity will do things the requesting user could not do directly, and that gap is where the audit problem starts.",
        "Separate read from write explicitly. Resources and tools are different in the protocol; keep them different in your authorisation policy and your logging.",
        "Log the call, not the conversation. The durable record is which tool ran, with what arguments, on whose behalf, and what it returned.",
        "Treat tool descriptions as untrusted input to the model. They influence behaviour, so they belong under change control rather than being editable by whoever runs the server.",
        "Pin the protocol revision your clients and servers implement, and treat a revision bump as a compatibility event.",
      ],
    },
    {
      type: "p",
      text: "None of this is unique to MCP. It is the same problem as any service-to-service integration with a non-human principal, which is the useful way to think about it — the protocol is new, the authorisation questions are not.",
    },
  ],
  faq: [
    {
      question: "Does the stateless change break existing MCP servers?",
      answer:
        "The 2026-07-28 revision is documented as carrying breaking changes, and protocol-level sessions and the Mcp-Session-Id header were removed. Implementations built against an earlier revision need to be reviewed against the current specification rather than assumed compatible.",
    },
    {
      question: "Is MCP a security boundary?",
      answer:
        "No. It standardises how a call is described, made and authorised, but the server still decides what it will do and with whose authority. The boundary is the authorisation model you implement behind it, not the protocol.",
    },
    {
      question: "Do we need MCP to connect a model to an internal system?",
      answer:
        "No — a direct integration works. The argument for MCP is reuse: one server can serve any compliant client, which matters once more than one assistant or agent needs the same system.",
    },
  ],
  sources: [
    {
      title: "Model Context Protocol Specification, revision 2026-07-28",
      publisher: "Model Context Protocol",
      url: "https://modelcontextprotocol.io/specification/2026-07-28",
    },
    {
      title: "The 2026-07-28 Specification",
      publisher: "Model Context Protocol Blog",
      url: "https://blog.modelcontextprotocol.io/posts/2026-07-28/",
    },
  ],
};
