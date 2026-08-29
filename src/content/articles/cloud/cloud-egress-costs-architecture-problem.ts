import type { Article } from "../../types";

export const article: Article = {
  slug: "cloud-egress-costs-architecture-problem",
  category: "cloud",
  contentType: "explainer",
  subcategory: "Architecture",
  title: "Egress bills are an architecture problem wearing a finance costume",
  seoTitle: "Cloud egress costs: why they are an architecture problem",
  metaDescription:
    "Egress charges are triggered by network paths, not pricing. The billing boundaries that matter, why NAT gateways cost twice, and how to design them out.",
  standfirst:
    "Every time data crosses a zone, a region or the edge of the cloud, something bills you. That is a design choice, not a price list.",
  excerpt:
    "Egress spend is set by the path data takes, so a discount will not fix it. The billing boundaries that matter, the NAT gateway trap, and where the fixes actually pay for themselves.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  draft: false,
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-08-23",
  readingMinutes: 6,
  primaryKeyword: "cloud egress costs",
  secondaryKeywords: [
    "NAT gateway data processing charges",
    "cross-AZ data transfer cost",
    "VPC endpoint vs NAT gateway",
    "AWS PrivateLink cost",
    "cloud data transfer architecture",
  ],
  tags: ["Cloud", "FinOps", "Architecture", "AWS", "Networking"],
  reviewStatus: "research-based",
  relatedSlugs: ["cloud-cost-controls", "kubernetes-pod-networking-packet-flow"],
  methodology:
    "Written from AWS VPC and PrivateLink documentation, AWS data transfer pricing pages and Azure bandwidth pricing documentation, verified August 2026. Deliberately contains no rates, no monthly figures and no savings percentages: they vary by region, by tier and by contract, and a number quoted here would be wrong for most readers and stale for the rest. The billing boundaries are what is durable, so those are what is described.",
  body: [
    {
      type: "p",
      text: "Cloud pricing is easy to reason about for compute and storage. You run a thing, you pay for the time. Data transfer does not behave like that, and it is where budgets go wrong.",
    },
    {
      type: "p",
      text: "The usual explanation is that providers price egress high to make leaving hard. There is something in that. But it is not why most bills are large. Most bills are large because an application was designed as though the network were flat and free, and it is neither.",
    },
    {
      type: "p",
      text: "That is the useful reframing. An egress line item is not a price you were charged. It is a map of the paths your data took.",
    },
    { type: "h2", id: "boundaries", text: "The boundaries that trigger a charge" },
    {
      type: "p",
      text: "Names differ between providers. The boundaries barely do. Crossing one is what creates a billing event, so these are worth holding in your head while sketching an architecture.",
    },
    {
      type: "table",
      caption:
        "The billing boundaries, in rough order of cost. Rates vary by provider, region and tier, so only the ordering is given.",
      head: ["Boundary", "Typical treatment"],
      rows: [
        ["Inbound from the internet", "Generally free — providers want your data"],
        ["Within one availability zone", "Usually free over private addresses"],
        [
          "Between availability zones, same region",
          "Charged per GB, and commonly in both directions",
        ],
        ["Between regions", "Charged per GB at a higher rate"],
        ["Out to the public internet", "The most expensive path, with volume tiers"],
      ],
    },
    {
      type: "p",
      text: "The cross-zone row is the one that surprises people. A read from a database in another zone can be billed leaving one zone and arriving in the other. Individually it rounds to nothing. Multiplied by every query an application makes, it stops rounding to nothing.",
    },
    { type: "h2", id: "nat", text: "The NAT gateway charges you twice" },
    {
      type: "p",
      text: "This is the most common single cause of a surprising bill on AWS, and it follows from a design most teams consider good practice.",
    },
    {
      type: "p",
      text: "Workloads go in private subnets, which is right. A private subnet has no route to the internet, so anything that needs to fetch a package or call an external API goes through a NAT gateway.",
    },
    {
      type: "p",
      text: "A NAT gateway bills on two axes. There is an hourly charge for having it, and a per-gigabyte charge for everything passing through it. That second charge sits on top of the internet egress charge for the same bytes.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The same gigabyte is billed on two meters",
      text: "Send logs from a private subnet to an external service and you pay NAT gateway processing and internet egress for the identical traffic. Neither meter is hidden, but they appear on different lines of the bill, which is why the total is often a surprise.",
    },
    { type: "h2", id: "endpoints", text: "VPC endpoints, and a distinction that matters" },
    {
      type: "p",
      text: "The standard fix is to keep traffic off the NAT gateway using a VPC endpoint. That is right, but the advice is usually given without a distinction that changes the economics completely.",
    },
    {
      type: "table",
      caption: "Two different things share the name 'VPC endpoint', and they bill differently",
      head: ["", "Gateway endpoint", "Interface endpoint (PrivateLink)"],
      rows: [
        ["Services", "Amazon S3 and DynamoDB only", "A wide range of AWS and partner services"],
        ["How it works", "A route table entry", "An elastic network interface in your subnet"],
        [
          "Charging",
          "No hourly or per-GB endpoint charge",
          "Hourly per endpoint, plus per-GB processed",
        ],
        [
          "Effect on the bill",
          "Removes the NAT charge outright",
          "Replaces the NAT charge with a smaller one",
        ],
      ],
    },
    {
      type: "p",
      text: "So the honest version of the advice is this. For S3 and DynamoDB, a gateway endpoint removes that traffic from the NAT gateway at no endpoint cost, and it is close to a free win. For everything else, an interface endpoint moves the traffic onto a cheaper meter rather than removing the meter.",
    },
    {
      type: "p",
      text: "That still usually pays off at volume. It does not pay off for a service you call occasionally, where you would be adding an hourly charge and some complexity to avoid a trivial one.",
    },
    { type: "h2", id: "locality", text: "Multi-zone without data locality" },
    {
      type: "p",
      text: "High availability pushes teams to spread workloads across zones. The spreading is usually done carefully. The data path afterwards often is not.",
    },
    {
      type: "p",
      text: "Take a familiar shape: web servers in two zones, a primary database in the first, a replica in the second. If the servers in the second zone talk to the primary in the first, every read crosses a billed boundary. Nothing is broken. Latency is slightly worse. The bill is materially worse.",
    },
    {
      type: "p",
      text: "The fixes are all about keeping conversations local.",
    },
    {
      type: "ul",
      items: [
        "**Pin traffic to the zone.** Load balancers and service meshes can prefer a target in the same zone as the caller. This is often a single setting that nobody turned on.",
        "**Make the application replica-aware.** Send reads to the local replica and keep cross-zone traffic for writes and failover, which is what the boundary crossing should be reserved for.",
        "**Cache locally.** A cache in each zone turns repeated cross-zone reads into one. It also improves latency, which makes it easier to justify than a pure cost change.",
      ],
    },
    {
      type: "h2",
      id: "pattern",
      text: "The pattern that catches people: log and telemetry shipping",
    },
    {
      type: "p",
      text: "Observability pipelines are the classic case, because the traffic is continuous, high volume, and nobody thinks of it as application traffic.",
    },
    {
      type: "p",
      text: "The shape is always similar. Nodes sit in private subnets across several zones. Each runs an agent shipping logs to an external platform over the internet. Every byte crosses the NAT gateway and then the internet boundary, all day, whether or not anyone reads the logs.",
    },
    {
      type: "p",
      text: "Compression helps, but it treats the symptom. Two structural fixes do more. Batch before sending, so you pay for fewer and larger transfers. Then land the first hop on an endpoint rather than the NAT gateway. Kubernetes makes this easy to get wrong. The agent is a daemon on every node, and the path it takes is invisible from the manifest — [what actually happens when a pod sends a packet](/devops/kubernetes-pod-networking-packet-flow) covers the hops involved.",
    },
    { type: "h2", id: "cdn", text: "Anything public should leave through a CDN" },
    {
      type: "p",
      text: "Serving images, video or large API responses straight from compute or object storage means paying the most expensive egress rate for every byte, every time, including the same byte twice.",
    },
    {
      type: "p",
      text: "A CDN changes both halves of that. Egress from CDN edges is priced below standard internet egress, and caching means the origin serves a fraction of the requests. The performance improvement usually justifies it on its own, which is helpful when the cost argument alone is not landing.",
    },
    { type: "h2", id: "security", text: "Do not trade security for the saving" },
    {
      type: "p",
      text: "Two things are worth guarding when you make these changes.",
    },
    {
      type: "p",
      text: "An endpoint is a direct path into a service, so it needs an endpoint policy. Without one, anything in the VPC can reach anything the endpoint fronts. That is a wider blast radius than the NAT gateway you removed, and it is easy to miss because nothing fails.",
    },
    {
      type: "p",
      text: "Keeping traffic on the provider's backbone is not encryption. It avoids the public internet, which is worth having, but TLS is still your job. A private path is not a confidential one.",
    },
    { type: "h2", id: "when", text: "When this is worth doing" },
    {
      type: "p",
      text: "Egress work has a real cost in engineering time, and it competes with everything else. A few signals make it worth prioritising.",
    },
    {
      type: "table",
      caption: "A prompt for the decision, not a threshold to apply mechanically",
      head: ["Worth the effort when", "Leave it alone when"],
      rows: [
        [
          "Data transfer is a visible share of the bill, not a rounding error",
          "Transfer volume is small and occasional",
        ],
        [
          "Large datasets move between regions or back on-premises",
          "The redesign costs more engineering time than it saves",
        ],
        [
          "You serve high volumes of media or static content",
          "The workload is being retired anyway",
        ],
        [
          "Telemetry volume grows with traffic and nobody owns it",
          "The path is already private and batched",
        ],
      ],
    },
    {
      type: "p",
      text: "That first row is the one to lead with. Egress rarely appears as a single alarming line; it accumulates across services until it is a share of the total. If nobody owns the number, it grows.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Find out what your NAT gateways are processing. Billing tools break this down per VPC, and the answer usually names the workload immediately.",
        "Use gateway endpoints for S3 and DynamoDB first. No endpoint charge, so the saving is close to unconditional.",
        "Check whether zone pinning is switched on. It is often a load balancer setting nobody changed.",
        "Batch and compress telemetry at the source, and keep the first hop off the NAT gateway.",
        "Put a CDN in front of anything public, and attach a policy to every endpoint you create.",
      ],
    },
    {
      type: "p",
      text: "None of this is a negotiation with your provider. Every charge here was triggered by a path something took, and paths are a design decision. That is the good news: it means the bill is something you control, and the same changes usually make the system faster as well as cheaper. Where the cost lands organisationally, and who is expected to act on it, is a separate problem — [cloud cost controls that work](/cloud/cloud-cost-controls) deals with that side.",
    },
  ],
  faq: [
    {
      question: "Why is data leaving the cloud so expensive?",
      answer:
        "Providers charge little to take data in and much more to send it out. Some of that is lock-in. Most large bills come from design, though, because the path data takes crosses boundaries that bill.",
    },
    {
      question: "Does a VPC endpoint always save money?",
      answer:
        "No. Gateway endpoints for S3 and DynamoDB have no endpoint charge, so they nearly always help. Interface endpoints bill by the hour and by the gigabyte. They pay off at volume, not for a service you call now and then.",
    },
    {
      question: "Do I really pay for traffic between availability zones?",
      answer:
        "Yes, and often in both directions. One read costs almost nothing. Millions of them do not, and that is how the charge builds up unnoticed.",
    },
    {
      question: "Will compressing my logs fix the bill?",
      answer:
        "It helps, but it treats the symptom. Batching sends fewer, larger payloads, and keeping the first hop off the NAT gateway removes a whole meter. Do those first.",
    },
    {
      question: "Is traffic over PrivateLink encrypted?",
      answer:
        "Not by itself. It stays on the provider network and off the public internet, which is worth having. You still need TLS. A private path is not the same as a secure one.",
    },
  ],
  sources: [
    {
      title: "Amazon VPC pricing",
      publisher: "Amazon Web Services",
      url: "https://aws.amazon.com/vpc/pricing/",
    },
    {
      title: "What is AWS PrivateLink?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html",
    },
    {
      title: "Gateway endpoints",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html",
    },
    {
      title: "NAT gateways",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html",
    },
    {
      title: "Bandwidth pricing",
      publisher: "Microsoft Azure",
      url: "https://azure.microsoft.com/en-us/pricing/details/bandwidth/",
    },
  ],
};
