import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-vpc-ipam-overlapping-cidr-management",
  category: "cloud",
  contentType: "explainer",
  title: "Two teams both picked 10.0.0.0/16, and the Transit Gateway quietly chose one",
  seoTitle: "AWS VPC IPAM: Overlapping CIDRs and IP Exhaustion",
  metaDescription:
    "Why overlapping CIDRs break Transit Gateway routing, how IPAM pools and scopes stop it happening, and which tier you actually need to share pools across accounts.",
  standfirst:
    "A spreadsheet cannot enforce anything. IPAM hands out the CIDR when the VPC is built. That is the last moment an overlap is still cheap to stop.",
  excerpt:
    "The overlap failure is silent and expensive to undo. IPAM removes the human step that causes it — but the cross-account sharing everyone wants is an Advanced tier feature with a per-IP charge.",
  authorId: "rahul-velapure",
  publishedAt: "2026-04-20",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 4,
  primaryKeyword: "AWS VPC IPAM overlapping CIDR",
  secondaryKeywords: [
    "AWS IPAM pools",
    "VPC IPAM RAM sharing",
    "Transit Gateway overlapping CIDR",
    "IPAM advanced tier",
    "BYOIP AWS",
  ],
  tags: ["AWS", "Networking", "Cloud", "Governance", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "aws-transit-gateway-vs-vpc-peering",
    "aws-control-tower-multi-account-governance-scp",
  ],
  methodology:
    "Written from the AWS VPC IPAM user guide, the IPAM pricing and tier documentation, and the Transit Gateway route table reference, verified August 2026. One correction was made to the source draft. It said the free tier covers the first 100,000 tracked addresses. The free tier is scoped by capability rather than by count: it covers a single Region and account, BYOIP and Public IP Insights, while private IPv4 pool management and cross-account sharing require the Advanced tier and its per-address hourly charge. The draft's acquisition incident was rewritten as the mechanism, and its claim about how a Transit Gateway breaks the tie between two identical prefixes was removed as unsupported.",
  body: [
    {
      type: "p",
      text: "IP planning in one AWS account is not a problem. You pick a block, cut some subnets, and move on. The problem starts at the point where nobody can see the whole picture any more, and that point arrives earlier than most teams expect.",
    },
    {
      type: "p",
      text: "Two teams provision VPCs a week apart. Both reach for 10.0.0.0/16, because it is the obvious choice. Both VPCs build cleanly. Nothing warns anyone.",
    },
    {
      type: "p",
      text: "The failure arrives later, when someone attaches the second VPC to the Transit Gateway.",
    },
    { type: "h2", id: "overlap", text: "Why an overlap breaks a Transit Gateway" },
    {
      type: "p",
      text: "On-premises networks live with overlapping ranges all the time. A firewall translates the addresses before the traffic crosses the link, and both sides stay unaware.",
    },
    {
      type: "p",
      text: "A Transit Gateway does not do that. It is a router. Attach a VPC and its CIDR propagates into the gateway route table as a destination.",
    },
    {
      type: "p",
      text: "A route table holds one path per destination prefix. Two attachments advertising exactly 10.0.0.0/16 cannot both be installed. One of them is what the gateway routes to, and traffic bound for the other simply never arrives.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The VPC looks completely healthy",
      text: "Nothing is down. Instances run, security groups are correct, the attachment shows as available. The VPC is just unreachable from everything on the other side of the gateway. The usual fix is to renumber, which means rebuilding the subnets and moving every resource — and that is a migration project, not a change request.",
    },
    { type: "h2", id: "mechanics", text: "What IPAM actually does" },
    {
      type: "p",
      text: "IPAM is not an inventory. It is an allocator. It hands out the CIDR at the moment the VPC is created, which removes the human decision that causes the collision.",
    },
    {
      type: "p",
      text: "Three concepts carry the design.",
    },
    { type: "h3", id: "pools", text: "Pools hold the space" },
    {
      type: "p",
      text: "A pool owns a block of addresses. You create a top-level pool over something large, say 10.0.0.0/8, then carve child pools beneath it. Production gets one. Development gets another.",
    },
    {
      type: "p",
      text: "A developer creating a VPC no longer names a CIDR. They ask for a /20 from the development pool. IPAM picks the next free block, records the allocation, and returns it. Two teams cannot receive the same range, because one allocator issued both.",
    },
    { type: "h3", id: "scopes", text: "Scopes are routing domains, not folders" },
    {
      type: "p",
      text: "A scope is a space in which addresses must be unique. IPAM gives you a private scope and a public scope by default.",
    },
    {
      type: "p",
      text: "The distinction matters when ranges genuinely may repeat. Two isolated networks that will never route to each other can both use 10.0.0.0/16 without anything being wrong. Put them in separate scopes and IPAM tracks both without treating either as a conflict.",
    },
    { type: "h3", id: "regions", text: "Operating Regions decide what IPAM can see" },
    {
      type: "p",
      text: "IPAM has a home Region, where its data lives, and a list of operating Regions, where it discovers and manages resources.",
    },
    {
      type: "p",
      text: "That list is the blind-spot risk. A Region you forget to add is a Region IPAM does not monitor, and VPCs built there never appear in your inventory. Audit the list whenever the estate expands.",
    },
    { type: "h2", id: "tier", text: "The tier decision comes before everything else" },
    {
      type: "p",
      text: "IPAM has two tiers, and the split is by capability rather than by volume.",
    },
    {
      type: "table",
      caption: "What each IPAM tier covers.",
      head: ["", "Free tier", "Advanced tier"],
      rows: [
        ["Scope", "One Region, one account", "Multiple Regions and accounts"],
        ["Private IPv4 pools", "No", "Yes"],
        ["Sharing pools with RAM", "No", "Yes"],
        ["BYOIP and Amazon IPv6", "Yes", "Yes"],
        ["Public IP Insights", "Yes", "Yes"],
        ["Cost", "None", "Hourly, per active address"],
      ],
    },
    {
      type: "p",
      text: "This matters because the multi-account allocation described above is the Advanced tier. The free tier will not do it. Anyone budgeting IPAM as free and then designing an organization-wide pool hierarchy has costed the wrong thing.",
    },
    {
      type: "p",
      text: "The rate is small per address and it is charged per hour, so it scales with your estate rather than with your usage of the tool. Model it against the size of your address space, not against how often you create VPCs. Set the metering mode deliberately too: costs can land on the account that owns IPAM, or on the account that owns each resource.",
    },
    { type: "h2", id: "ram", text: "Sharing pools across accounts" },
    {
      type: "p",
      text: "In a multi-account organization, IPAM lives in a network or shared-services account. The teams that need addresses do not work there.",
    },
    {
      type: "p",
      text: "AWS Resource Access Manager bridges that. The network team shares a pool with the organization, or with named organizational units. A developer in a workload account then references the shared pool ID when they create the VPC, and IPAM validates the request against the pool rules before allocating.",
    },
    {
      type: "p",
      text: "Nobody in the workload account needs to understand the address plan. That is the point: governance that does not depend on everyone reading the same document. It pairs naturally with the account structure described in [AWS Control Tower and SCPs](/cloud/aws-control-tower-multi-account-governance-scp).",
    },
    { type: "h2", id: "rules", text: "Allocation rules are where governance lives" },
    {
      type: "p",
      text: "A pool can constrain what it will hand out. Set a minimum and maximum netmask length and the pool refuses anything outside it. Lock production to /24 through /26 and a request for a /16 fails at the API.",
    },
    {
      type: "p",
      text: "Locale rules bind a pool to a Region. That stops a team allocating space in a Region where you have no gateway attachment and no inspection path, which is a mistake that only surfaces once something needs to route.",
    },
    { type: "h2", id: "byoip", text: "BYOIP puts your own space under the same control" },
    {
      type: "p",
      text: "Many enterprises hold public address space registered with an internet registry. BYOIP brings that space into AWS, and IPAM manages it in a public pool.",
    },
    {
      type: "p",
      text: "Elastic IPs and load balancer addresses then come from your own prefix rather than from Amazon's. If partners maintain firewall allow-lists against your corporate ranges, this is what keeps those lists valid as workloads move into the cloud.",
    },
    { type: "h2", id: "existing", text: "What IPAM cannot fix" },
    {
      type: "p",
      text: "IPAM prevents new overlaps. It does not resolve the ones you already have, and acquisitions arrive with them built in.",
    },
    {
      type: "p",
      text: "When two estates genuinely share a range, something has to translate. That means a stateful NAT device in an inspection VPC, with the gateway routing through it. IPAM's contribution is visibility: hold the acquired estate in its own scope, record the translated range in the main scope, and both are tracked without pretending the conflict is gone.",
    },
    {
      type: "p",
      text: "It is worth deciding this before the attachment rather than after. The routing consequences of the choice are covered in [Transit Gateway versus VPC peering](/cloud/aws-transit-gateway-vs-vpc-peering).",
    },
  ],
  faq: [
    {
      question: "Is VPC IPAM free?",
      answer:
        "The free tier is. It covers one Region and one account, plus BYOIP and Public IP Insights. Pools shared across accounts need the Advanced tier, which charges per address per hour.",
    },
    {
      question: "Can IPAM track addresses outside AWS?",
      answer:
        "Yes. You can bring ranges from a data centre or another cloud in as external pools. That is how you stop a new VPC claiming a block your on-premises network already uses.",
    },
    {
      question: "What happens when a pool runs out?",
      answer:
        "The next request fails at the API and the VPC is not created. Watch pool utilisation in CloudWatch and alert well before full, so the network team can extend the pool first.",
    },
    {
      question: "Why did my Transit Gateway drop a route?",
      answer:
        "Two attachments most likely share the same prefix. A route table holds one path per target. So one VPC goes dark while it still looks healthy.",
    },
    {
      question: "Do overlapping CIDRs ever make sense?",
      answer:
        "Yes, when the two networks will never route to each other. Put them in separate IPAM scopes. A scope is a uniqueness domain, so nothing flags a conflict.",
    },
    {
      question: "Can I stop teams asking for huge blocks?",
      answer:
        "Yes. Set a minimum and maximum netmask length on the pool. A request outside that range is refused before anything is built.",
    },
  ],
  sources: [
    {
      title: "What is IPAM?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/ipam/what-it-is-ipam.html",
    },
    {
      title: "Pricing for IPAM",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/ipam/pricing-ipam.html",
    },
    {
      title: "Share an IPAM pool using AWS RAM",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/ipam/share-pool-ipam.html",
    },
    {
      title: "Transit gateway route tables",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/tgw-route-tables.html",
    },
  ],
};
