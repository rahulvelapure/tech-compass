import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-transit-gateway-vs-vpc-peering",
  category: "cloud",
  contentType: "comparison",
  subcategory: "Architecture",
  title: "Peering does not scale, and the arithmetic says so",
  seoTitle: "AWS Transit Gateway vs VPC Peering: when to switch",
  metaDescription:
    "Full-mesh peering grows as the square of your VPC count. What Transit Gateway solves, what it charges for, and the routing traps that come with it.",
  standfirst:
    "Ten VPCs need forty-five links. Fifty need more than twelve hundred. That curve decides this for you.",
  excerpt:
    "VPC peering is free and simple until the mesh grows. Where the arithmetic breaks, what Transit Gateway gives you in exchange, and the two settings that decide whether it works.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-08-23",
  readingMinutes: 6,
  primaryKeyword: "AWS Transit Gateway vs VPC Peering",
  secondaryKeywords: [
    "VPC peering limits",
    "Transit Gateway route tables",
    "AWS hub and spoke networking",
    "Transit Gateway appliance mode",
    "transitive routing AWS",
  ],
  tags: ["AWS", "Cloud", "Networking", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["bgp-in-the-cloud-why-it-matters", "cloud-egress-costs-architecture-problem"],
  methodology:
    "Written from AWS documentation on Transit Gateway, VPC peering and VPC quotas, verified August 2026. The mesh arithmetic is stated because it is arithmetic. Quota values are described relative to what a growing estate needs rather than quoted, since they are adjustable and change; the same applies to rates, which are not given. Scope is deliberately the network layer — service-level routing is a different decision.",
  body: [
    {
      type: "p",
      text: "Most AWS estates start with one VPC. Then compliance wants an isolated environment, and a second team wants its own, and an acquisition arrives with a network you did not design.",
    },
    {
      type: "p",
      text: "Now they have to talk to each other. AWS offers two native answers, and the choice between them is usually made early, when it looks like it does not matter much.",
    },
    {
      type: "p",
      text: "It does matter, because one of them scales as the square of the number of VPCs and the other does not.",
    },
    { type: "h2", id: "maths", text: "The arithmetic that decides it" },
    {
      type: "p",
      text: "VPC peering is a one-to-one relationship. For every pair of VPCs that need to talk, you create and maintain a connection and the route table entries on both sides.",
    },
    {
      type: "p",
      text: "A full mesh across n VPCs needs n(n−1)/2 connections. That grows faster than people expect.",
    },
    {
      type: "table",
      caption: "Connections required for a full mesh, and route table entries to maintain",
      head: ["VPCs", "Peering connections"],
      rows: [
        ["5", "10"],
        ["10", "45"],
        ["20", "190"],
        ["50", "1,225"],
      ],
    },
    {
      type: "p",
      text: "There is also a per-VPC quota on active peering connections. It is adjustable, but the ceiling sits far below what a large mesh needs, so the quota stops you before the arithmetic does.",
    },
    {
      type: "p",
      text: "The operational cost arrives sooner than either limit. Every new VPC means updating route tables in every existing VPC that must reach it. That is a change touching dozens of places, and it is the kind of work that gets done inconsistently.",
    },
    { type: "h2", id: "two-limits", text: "Two things peering simply cannot do" },
    {
      type: "p",
      text: "Beyond scale, peering has two hard properties worth knowing before you commit to it.",
    },
    {
      type: "p",
      text: "**It is not transitive.** If A peers with B and B peers with C, A still cannot reach C. Traffic does not route through an intermediate VPC. Every pair that needs to communicate needs its own connection, which is what produces the mesh in the first place.",
    },
    {
      type: "p",
      text: "**It cannot bridge overlapping address space.** Two VPCs using the same CIDR block cannot be peered at all. In an estate that grew through acquisitions or team autonomy, overlapping private ranges are common, and no amount of configuration fixes it here.",
    },
    { type: "h2", id: "tgw", text: "What Transit Gateway changes" },
    {
      type: "p",
      text: "Transit Gateway is a hub. VPCs attach to it rather than to each other, so adding a VPC is one attachment rather than a connection to everything else.",
    },
    {
      type: "p",
      text: "It has its own route tables, separate from the VPC route tables, and that separation is the useful part. An attachment is associated with a Transit Gateway route table, and what that table contains decides what the VPC can reach.",
    },
    {
      type: "table",
      caption: "The differences that actually drive the decision",
      head: ["", "VPC peering", "Transit Gateway"],
      rows: [
        ["Growth", "Connections grow as the square of VPC count", "One attachment per VPC"],
        ["Transitive routing", "Not supported", "Supported"],
        [
          "Overlapping CIDRs",
          "Cannot be peered",
          "Can coexist if kept in separate routing domains",
        ],
        ["Segmentation", "By which pairs you choose to peer", "By route table association"],
        [
          "Charging",
          "No charge for the connection itself",
          "Hourly per attachment, plus per-GB processed",
        ],
      ],
    },
    {
      type: "p",
      text: "Separate route tables give you segmentation as a design rather than as an omission. Production and development attachments can share a gateway and still be unable to reach each other, because the route table each is associated with does not contain the other.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Overlap is tolerated, not resolved",
      text: "Two VPCs with the same CIDR can both attach to a Transit Gateway, provided they never need to route to each other. If they do, something has to rewrite the addresses. The gateway removes the attachment restriction; it does not make overlapping ranges routable.",
    },
    { type: "h2", id: "cost", text: "Where the cost actually comes from" },
    {
      type: "p",
      text: "Peering has no charge for the connection. Traffic across it is billed at normal data transfer rates.",
    },
    {
      type: "p",
      text: "Transit Gateway bills twice: an hourly charge for each attachment, and a per-gigabyte charge for data it processes. The hourly component is predictable and usually small per attachment. The per-gigabyte component is where surprises live.",
    },
    {
      type: "p",
      text: "The common mistake is routing traffic through the hub that never needed to go there. A VPC reaching object storage does not need the gateway involved — an endpoint in that VPC keeps the traffic local and off the meter.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "A rule that holds up",
      text: "Keep VPC-to-VPC traffic on the Transit Gateway. Keep traffic heading to the internet or to a cloud service off it, unless you specifically need centralised inspection. Most unexpected data processing charges come from breaking that second half without noticing.",
    },
    {
      type: "p",
      text: "This is the same class of problem as [egress charges generally](/cloud/cloud-egress-costs-architecture-problem): the meter is triggered by a path, and the path was chosen by a route table rather than by anyone deciding.",
    },
    { type: "h2", id: "inspection", text: "Centralised inspection, and how it goes wrong" },
    {
      type: "p",
      text: "A common requirement is that traffic between environments passes through a firewall. Transit Gateway supports this by routing spoke traffic to an attachment holding the appliances.",
    },
    {
      type: "p",
      text: "Two problems follow, and both are predictable.",
    },
    {
      type: "p",
      text: "The first is throughput. Every internal conversation now crosses the gateway twice — once inbound to the inspection attachment, once outbound to the destination — and pays the processing charge each time. The firewall cluster also becomes the ceiling on internal network speed.",
    },
    {
      type: "p",
      text: "The second is symmetry. Stateful inspection requires both directions of a flow to reach the same appliance. By default the gateway may not guarantee that, and a return packet arriving at a different node is dropped because that node has no state for it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Appliance mode is not optional here",
      text: "Enabling appliance mode on the attachment holding stateful appliances is what keeps both directions of a flow on the same node. Without it you get intermittent, connection-level failures that look like application faults and are miserable to diagnose.",
    },
    {
      type: "p",
      text: "The throughput problem is solved by inspecting selectively rather than universally. Route the flows that genuinely warrant inspection through the appliance attachment, and let high-volume, low-risk traffic take a direct path. That needs deliberate route table work, which is the honest cost of centralised inspection.",
    },
    { type: "h2", id: "mistakes", text: "Two more worth avoiding" },
    {
      type: "p",
      text: "**Route limits when on-premises networks arrive.** A Transit Gateway route table has a route limit, and a network advertising thousands of specific prefixes over Direct Connect can approach it. Summarise at the on-premises edge rather than advertising everything. If you are shaping those advertisements, [what BGP is doing on a hybrid link](/enterprise-networking/bgp-in-the-cloud-why-it-matters) covers the mechanics.",
    },
    {
      type: "p",
      text: "**Attachment subnets shared with workloads.** Attaching a VPC places network interfaces in subnets you nominate. Using application subnets for this leads to address exhaustion and confusing security group interactions. Dedicate small subnets per availability zone to attachments and put nothing else in them.",
    },
    { type: "h2", id: "choosing", text: "Choosing, and when to switch" },
    {
      type: "p",
      text: "Peering remains a good answer for a handful of VPCs with stable, point-to-point needs and no overlap. It is simple, it has no hourly cost, and there is no hub to operate.",
    },
    {
      type: "p",
      text: "Transit Gateway earns its cost once you have transitive requirements, segmentation you want expressed structurally, on-premises connectivity, or more VPCs than a mesh can carry.",
    },
    {
      type: "p",
      text: "The timing point matters more than the comparison. Migrating an established full mesh to a hub means rewriting route tables across every VPC, and it is disruptive. If the roadmap has more than a handful of VPCs in it, starting with the hub costs less than arriving at it later.",
    },
    {
      type: "callout",
      variant: "note",
      title: "A different question from service networking",
      text: "This is the network layer: which VPCs can route to which. Deciding how individual services find and authenticate each other sits above it, and the answer there is not a gateway at all — see [VPC Lattice or API Gateway](/cloud/aws-vpc-lattice-vs-api-gateway-service-networking).",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Count the VPCs on your roadmap, not the ones you have. The mesh curve decides this, and it bends early.",
        "Plan addressing before you need to bridge it. Overlap is the constraint no product feature removes.",
        "Keep service-bound and internet-bound traffic off the hub unless inspection requires otherwise.",
        "Turn on appliance mode wherever stateful appliances sit behind an attachment.",
        "Give attachments their own small subnets, separate from anything running workloads.",
      ],
    },
    {
      type: "p",
      text: "Peering is not a beginner's mistake, and the hub is not automatically correct. What makes this decision unusual is that the wrong answer stays comfortable for a long time and then becomes expensive to reverse all at once. That is worth ten minutes of arithmetic while the estate is still small.",
    },
  ],
  faq: [
    {
      question: "How many VPCs before peering stops working?",
      answer:
        "There is no hard number, but the shape is clear. Ten VPCs need forty-five links. Twenty need a hundred and ninety. Most teams find the upkeep unworkable well before any quota stops them.",
    },
    {
      question: "Can I peer two VPCs that use the same IP range?",
      answer:
        "No. Peering will not allow it. A hub lets them both attach. They still cannot reach each other unless something rewrites the addresses.",
    },
    {
      question: "Why is my Transit Gateway bill higher than expected?",
      answer:
        "Usually because traffic is crossing the hub that did not need to. Check whether service or internet traffic is routing through it. An endpoint in the VPC keeps that traffic off the meter.",
    },
    {
      question: "Why do connections through my firewall drop at random?",
      answer:
        "Both halves of the flow are likely hitting different firewall nodes. The second node has no record of it, so it drops the packet. Turn on appliance mode for that attachment.",
    },
    {
      question: "Should I start with peering and move later?",
      answer:
        "Only if you are sure it stays small. Moving a full mesh to a hub means rewriting route tables everywhere at once. Starting with the hub is often cheaper.",
    },
  ],
  sources: [
    {
      title: "What is a transit gateway?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html",
    },
    {
      title: "Transit gateway route tables",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/tgw-route-tables.html",
    },
    {
      title: "Transit gateway appliance mode support",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/transit-gateway-appliance-scenario.html",
    },
    {
      title: "What is VPC peering?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html",
    },
    {
      title: "Amazon VPC quotas",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/userguide/amazon-vpc-limits.html",
    },
  ],
};
