import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-vpc-lattice-vs-api-gateway-service-networking",
  category: "cloud",
  contentType: "comparison",
  subcategory: "Architecture",
  title: "VPC Lattice or API Gateway: the question is which way the traffic runs",
  seoTitle: "AWS VPC Lattice vs API Gateway: which to use where",
  metaDescription:
    "API Gateway is a front door. VPC Lattice is internal plumbing. How they differ on topology, identity and operations — and what happens when you swap them.",
  standfirst:
    "One was built to face the internet. The other was built for services talking among themselves. Most of the pain comes from using the first for the second.",
  excerpt:
    "API Gateway and VPC Lattice both route HTTP, which is where the confusion starts. They differ on network topology, on what they authenticate, and on how you debug them.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "AWS VPC Lattice vs API Gateway",
  secondaryKeywords: [
    "east-west service networking AWS",
    "VPC Lattice auth policy",
    "private API Gateway VPC endpoint",
    "service-to-service networking",
    "VPC Lattice access logs",
  ],
  tags: ["AWS", "Cloud", "Networking", "Architecture", "Microservices"],
  reviewStatus: "research-based",
  relatedSlugs: ["cloud-egress-costs-architecture-problem", "zero-trust-network-segmentation"],
  methodology:
    "Written from the AWS VPC Lattice user guide, its auth policy documentation and Amazon API Gateway documentation, verified August 2026. No prices, request rates or latency figures are given: AWS pricing varies by region and changes, and published latency overheads depend on payload, integration type and region. Where the draft this was refined from carried such figures, they were removed rather than updated.",
  body: [
    {
      type: "p",
      text: "For a long time the answer to routing HTTP inside AWS was API Gateway. It is mature, well documented, and it works. So teams reached for it again when services needed to call each other.",
    },
    {
      type: "p",
      text: "That is where the trouble starts. API Gateway was built as a front door — something that faces clients you do not control. Internal service traffic has different needs, and forcing it through a front door produces topology work nobody wanted.",
    },
    {
      type: "p",
      text: "VPC Lattice exists for that second job. Both route HTTP, which is why the boundary looks blurry. The differences that matter are elsewhere.",
    },
    { type: "h2", id: "direction", text: "The direction of travel decides" },
    {
      type: "p",
      text: "The old north-south and east-west language is unfashionable, but it is the right distinction here.",
    },
    {
      type: "p",
      text: "North-south is traffic entering from outside: browsers, mobile apps, partners. It is untrusted, so it needs API keys, usage plans, payload transformation and a web application firewall. That is API Gateway's feature set, and it is a good one.",
    },
    {
      type: "p",
      text: "East-west is your own services talking to each other. They do not need payload rewriting or usage plans. They need to find each other, prove who they are, and be observable when something breaks.",
    },
    { type: "h2", id: "topology", text: "What each one asks of your network" },
    {
      type: "p",
      text: "This is the practical difference, and it is where the operational cost lives.",
    },
    {
      type: "p",
      text: "Using API Gateway internally means a private API. That brings interface VPC endpoints in every consuming VPC, private hosted zones so the DNS name resolves to those endpoints, and resource policies naming each VPC or account allowed to call. Every new consumer repeats the set.",
    },
    {
      type: "p",
      text: "VPC Lattice inverts that. You create a service network, associate VPCs with it, and register services as targets. A caller addresses the service by name and Lattice routes it, across VPCs and accounts, without peering or per-consumer endpoints.",
    },
    {
      type: "table",
      caption: "The differences that change an architecture decision",
      head: ["", "API Gateway", "VPC Lattice"],
      rows: [
        ["Built for", "Traffic from outside your estate", "Services calling each other"],
        [
          "Network coupling",
          "Endpoints and private DNS per consumer",
          "Decoupled from VPC IP topology",
        ],
        ["Addressing", "A regional DNS name via an endpoint", "The service's own generated name"],
        [
          "Authenticates",
          "That the call came from an allowed network",
          "Which IAM identity is calling",
        ],
        [
          "Request transformation",
          "Extensive mapping and rewriting",
          "Layer 7 routing, no transformation",
        ],
        ["Charging shape", "Weighted toward request volume", "Resources and data processed"],
        ["Firewall integration", "Native AWS WAF at the edge", "Present, but not its main purpose"],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "On cost, without the numbers",
      text: "API Gateway's charging is weighted toward request count, and internal service chatter produces request counts that dwarf public traffic. A modest poll interval between two services generates millions of calls a day. That shape is what makes the model a poor fit internally — the specific rates change, and are worth reading on the pricing page rather than trusting from an article.",
    },
    { type: "h2", id: "identity", text: "Network position, or identity" },
    {
      type: "p",
      text: "The security models differ in a way that matters more than the routing does.",
    },
    {
      type: "p",
      text: "A private API Gateway is protected by where the call came from. The resource policy names VPCs and accounts. That is a network boundary, and it says nothing about which workload made the request. Anything inside an allowed VPC qualifies.",
    },
    {
      type: "p",
      text: "VPC Lattice auth policies work on identity. You can require that the caller presents a specific IAM role — the role an ECS task runs as, or one a Kubernetes pod assumes. The policy then reads as a sentence about workloads: this service may call that one, and nothing else may.",
    },
    {
      type: "p",
      text: "That is a genuine shift. You stop describing security in terms of address ranges and start describing it in terms of who is calling, which is the same move [network segmentation](/enterprise-networking/zero-trust-network-segmentation) has been making for years.",
    },
    { type: "h2", id: "scenario", text: "The same problem, twice" },
    {
      type: "p",
      text: "Three accounts: shared services, catalogue, checkout. Checkout needs inventory from catalogue and a fraud check from shared services.",
    },
    {
      type: "p",
      text: "With private API Gateway, the inventory team publishes an API and writes a resource policy naming both consuming accounts. Each consumer then creates an interface endpoint in its own VPC and a private hosted zone so the name resolves. Every new consumer repeats that, and an endpoint change ripples outward to all of them.",
    },
    {
      type: "p",
      text: "With VPC Lattice, one service network spans the three VPCs. Inventory registers itself as a target. Checkout calls it by name. The inventory team writes one auth policy naming the checkout role.",
    },
    {
      type: "p",
      text: "The second version has fewer moving parts, and — more usefully — the parts scale with the number of services rather than with the number of pairs of services.",
    },
    { type: "h2", id: "mistakes", text: "Three ways this goes wrong" },
    { type: "h3", id: "mesh", text: "Treating API Gateway as a service mesh" },
    {
      type: "p",
      text: "Putting a gateway in front of every internal service to standardise routing feels tidy. It centralises what should be distributed, and every internal hop now traverses a managed service built for a different job. In a chain of calls that overhead compounds. Measure it in your own environment rather than trusting a figure, because it depends on payload, integration type and region.",
    },
    { type: "h3", id: "health", text: "Health checks blocked by a security group" },
    {
      type: "p",
      text: "This produces the most confusing failure in Lattice. The service registers, the console shows the target present, and calls return 503.",
    },
    {
      type: "p",
      text: "The cause is usually that health check traffic cannot reach the target, so it never becomes healthy. Registration and health are different things, and only one of them routes traffic. Check target health before anything else.",
    },
    { type: "h3", id: "domains", text: "Adding a custom domain out of habit" },
    {
      type: "p",
      text: "Lattice generates a DNS name for each service, and for internal traffic that is usually enough. Custom domains bring certificate management with them. Take that on when a naming standard requires it, not by default.",
    },
    { type: "h2", id: "observability", text: "Debugging needs different tools" },
    {
      type: "p",
      text: "This catches experienced people out, and it is worth knowing before the first incident rather than during it.",
    },
    {
      type: "p",
      text: "VPC Lattice routes at Layer 7. Flow logs will show traffic reaching the Lattice endpoint, and then the trail stops — the final hop to the target is not a flow your VPC records. If flow logs are your main network tool, you will be looking at an incomplete picture and drawing wrong conclusions from it.",
    },
    {
      type: "ul",
      items: [
        "**Turn on access logs before you need them.** They carry the Layer 7 detail, including the calling identity and the response code. They are not on by default, and the moment you want them is the moment it is too late to enable them retroactively.",
        "**Check target health first.** An unhealthy target does not announce itself in the caller's error message.",
        "**Simulate the auth policy.** Lattice can evaluate whether a given identity would be allowed to call a given service, which turns a cross-account permissions puzzle into a single question with an answer.",
      ],
    },
    { type: "h2", id: "choosing", text: "Choosing between them" },
    {
      type: "p",
      text: "The decision is usually not close once the question is framed properly.",
    },
    {
      type: "table",
      caption: "Pick by what the traffic is, not by what you already have running",
      head: ["Use API Gateway when", "Use VPC Lattice when"],
      rows: [
        ["Clients outside your estate call the API", "Your own services call each other"],
        [
          "You need payload transformation for older clients",
          "You want identity-based rules between workloads",
        ],
        ["Usage plans, API keys or edge WAF matter", "Traffic spans several VPCs or accounts"],
        [
          "The API is a product with external consumers",
          "Request volume is internal chatter, not user traffic",
        ],
      ],
    },
    {
      type: "p",
      text: "The two are not rivals. A common and sensible shape is API Gateway at the edge, Lattice behind it, each doing the job it was designed for.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Find private API Gateways whose only callers are your own services. Those are the migration candidates.",
        "Move from network-position rules to identity rules. An auth policy naming a role says more than a policy naming a VPC.",
        "Enable access logs at deployment, not after the first incident.",
        "Keep API Gateway for the edge, where transformation, usage plans and WAF are genuinely needed.",
        "When a target returns 503, check health before routing. It is almost always a blocked health check.",
      ],
    },
    {
      type: "p",
      text: "The instinct to standardise on one router is understandable and usually expensive. Traffic entering your estate and traffic moving inside it have different requirements, and a tool that serves one well will serve the other awkwardly. Matching the tool to the direction is most of the decision. The rest is watching where the data goes, which has [its own cost consequences](/cloud/cloud-egress-costs-architecture-problem).",
    },
  ],
  faq: [
    {
      question: "Can I use API Gateway for internal service calls?",
      answer:
        "You can, and plenty of teams do. It means a private API, endpoints in each consuming VPC and private DNS to match. It works. It is a lot of setup for a job Lattice does without it.",
    },
    {
      question: "Does VPC Lattice replace a service mesh?",
      answer:
        "It covers much of the same ground. It finds services, routes to them, and checks who is calling. A mesh still does more, such as fine-grained traffic shaping.",
    },
    {
      question: "Why does my VPC Lattice service return 503?",
      answer:
        "Usually the target is registered but not healthy. Check that health check traffic can reach it. A registered target and a healthy target are not the same thing.",
    },
    {
      question: "Why can't I see the traffic in VPC Flow Logs?",
      answer:
        "Because Lattice routes at Layer 7. Flow logs show traffic reaching it, not the hop to the target. Turn on access logs to see the rest.",
    },
    {
      question: "Is VPC Lattice cheaper than API Gateway?",
      answer:
        "Usually yes, when internal traffic is heavy. API Gateway charges by request count. Services that call each other make a lot of requests. Check the rates for your own volumes.",
    },
  ],
  sources: [
    {
      title: "What is Amazon VPC Lattice?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html",
    },
    {
      title: "Auth policies in Amazon VPC Lattice",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc-lattice/latest/ug/auth-policies.html",
    },
    {
      title: "Access logs for Amazon VPC Lattice",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc-lattice/latest/ug/monitoring-access-logs.html",
    },
    {
      title: "Private REST APIs in Amazon API Gateway",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html",
    },
    {
      title: "Amazon API Gateway pricing",
      publisher: "Amazon Web Services",
      url: "https://aws.amazon.com/api-gateway/pricing/",
    },
  ],
};
