import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-transit-gateway-multicast-routing",
  category: "enterprise-networking",
  contentType: "explainer",
  title: "AWS will route your multicast, but only between VPCs and only over IGMPv2",
  seoTitle: "AWS Transit Gateway Multicast: What It Will Route",
  metaDescription:
    "Transit Gateway multicast works between VPC attachments and nowhere else. What that rules out, how IGMP membership behaves, and where AWS says not to use it.",
  standfirst:
    "A VPC drops multicast. Transit Gateway will carry it for you. But the rules are narrow, and they rule out whole designs before you start.",
  excerpt:
    "The constraint that decides most designs is not cost. Multicast does not cross Direct Connect, VPN, peering or Connect attachments, so a feed arriving from outside AWS cannot be distributed this way at all.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-13",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 4,
  primaryKeyword: "AWS Transit Gateway Multicast",
  secondaryKeywords: [
    "AWS multicast routing",
    "IGMPv2 AWS",
    "Transit Gateway multicast domain",
    "static source multicast",
    "VPC multicast support",
  ],
  tags: ["AWS", "Networking", "Multicast", "Cloud", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["aws-transit-gateway-vs-vpc-peering", "aws-vpc-ipam-overlapping-cidr-management"],
  methodology:
    "Written from the AWS Transit Gateway multicast documentation and the associated quotas page, verified August 2026. Three corrections were made to the source draft. It described a feed arriving over Direct Connect and distributed by multicast; AWS states plainly that multicast routing is not supported over Direct Connect, Site-to-Site VPN, peering or Connect attachments. It recommended the feature for financial trading feeds, where AWS says it may not be suitable for high-frequency trading or performance-sensitive applications. And it gave MTU figures for VPN attachments, where the documented behaviour is that a transit gateway does not fragment multicast packets at all — fragmented ones are dropped. The draft's cost incident and its billing figure were removed.",
  body: [
    {
      type: "p",
      text: "A VPC does not carry multicast. Send a packet to a group address and it is dropped. Teams work around that by building overlays. Or they rewrite apps that assumed one-to-many delivery was free.",
    },
    {
      type: "p",
      text: "Transit Gateway is the built-in answer. It acts as a multicast router between the subnets you sign up.",
    },
    {
      type: "p",
      text: "It works. Read the rules first, though. Two of them rule out whole designs before you write a line of config.",
    },
    { type: "h2", id: "boundary", text: "It only works between VPC attachments" },
    {
      type: "p",
      text: "This is the constraint to check before anything else, because it is the one most designs run into.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Multicast does not cross Direct Connect, VPN, peering or Connect",
      text: "AWS says this plainly. Multicast is not routed over Direct Connect. Nor over Site-to-Site VPN, peering, or Connect attachments. So a feed arriving from outside AWS cannot be handed to the gateway and fanned out. Something inside a VPC must take it by unicast first, then start the multicast there. Any design that assumes the feed keeps its multicast form on the way in will not work.",
    },
    {
      type: "p",
      text: "Second rule, and AWS states it in its own notes. This may not suit high-frequency trading, or other work where speed is the point. If low, steady latency is why you use multicast, it is not the right tool. The vendor tells you up front.",
    },
    {
      type: "p",
      text: "Two smaller rules come from the hardware. The gateway does not fragment multicast packets. Anything that turns up fragmented is dropped, so keep each datagram inside the path MTU. And an older, non-Nitro instance cannot send at all. It also needs its source and destination check turned off just to receive.",
    },
    { type: "h2", id: "domains", text: "Domains, groups and members" },
    {
      type: "p",
      text: "Three objects carry the model.",
    },
    {
      type: "ul",
      items: [
        "**A multicast domain** turns one gateway into several independent multicast routers. Membership is defined at the subnet level, and a subnet can belong to only one domain.",
        "**A multicast group** is a set of hosts sharing one group address. Membership is defined per network interface, not per instance.",
        "**A multicast source** is an interface configured to send. This applies only to static configurations, and it is where the two membership models diverge.",
      ],
    },
    { type: "h2", id: "membership", text: "Two ways to join, with different capabilities" },
    {
      type: "p",
      text: "You can let hosts join dynamically with IGMP, or you can register them through the API. The choice is not only about automation.",
    },
    {
      type: "table",
      caption: "What each membership model gives you.",
      head: ["", "IGMP domain", "Static domain"],
      rows: [
        ["Joining", "Hosts send IGMPv2 messages", "You register them by API or CLI"],
        ["Members can send", "Yes", "No, they receive only"],
        ["IPv6", "Not supported", "Supported"],
        ["Depends on the application", "Yes", "No"],
      ],
    },
    {
      type: "p",
      text: "The IPv6 row surprises people. Only static multicast handles IPv6. Dynamic IGMP does not. If you run dual-stack and assumed both worked, that assumption has just picked your model for you.",
    },
    { type: "h2", id: "igmp", text: "How IGMP membership actually behaves" },
    {
      type: "p",
      text: "AWS handles IGMPv2 only. There is no IGMPv3, so no source-specific multicast. Filter by source in your own code, or use a static setup.",
    },
    {
      type: "p",
      text: "The gateway does not simply trust the first join. It checks. And the timers are written down.",
    },
    {
      type: "ol",
      items: [
        "A host sends an IGMPv2 join. The gateway records it. Hosts typically retry a join two or three times at startup.",
        "Every two minutes the gateway sends a query to every member.",
        "Each member answers with a join, which is how membership is renewed.",
        "Miss three consecutive queries and the gateway drops that membership from every group it had joined.",
        "It keeps querying that member for twelve hours before removing it from the list entirely.",
        "An explicit leave removes the host at once, and permanently.",
      ],
    },
    {
      type: "p",
      text: "Two things follow. If every join at startup is lost, the host never joins. Nothing retries for it, so your own code has to. And during a gateway outage, traffic keeps flowing for seven minutes after the last good join. Treat that as slack, not as a promise.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The IGMP control traffic has to be allowed explicitly",
      text: "The gateway sends its queries from 0.0.0.0/32 to 224.0.0.1/32, using IP protocol 2. Your security groups and network ACLs have to allow that. You also need outbound protocol 2 to the group address for joins, and to 224.0.0.2/32 for leaves. ACLs apply here because the gateway sits outside the subnet. A host that goes quiet after a couple of minutes is usually failing to answer queries it never saw.",
    },
    {
      type: "p",
      text: "One more rule catches people working inside a single VPC. When sender and receiver share a VPC, you cannot point a security group at another security group. The inbound UDP rule has to name the sending host by address.",
    },
    { type: "h2", id: "static", text: "Static membership removes the application dependency" },
    {
      type: "p",
      text: "All of that rests on your app doing IGMP properly, and going on answering queries. That is a lot of trust in a process that might restart badly.",
    },
    {
      type: "p",
      text: "A static domain drops that dependency. You register the sender and the members through the API. The gateway then copies traffic whatever the app does. AWS also clears out static entries by itself once the interface behind them is gone.",
    },
    {
      type: "p",
      text: "The trade is that static members only receive. In an IGMP domain a member can send too. If you need members to do both, static will not give you that.",
    },
    { type: "h2", id: "cost", text: "Replication happens at the gateway, and so does the bill" },
    {
      type: "p",
      text: "The gateway receives one copy and sends one to every subnet that has joined. That is what a multicast router does, and in a data centre the replication is effectively free because the switches do it.",
    },
    {
      type: "p",
      text: "Here it is not free. The gateway charges per attachment, and per gigabyte handled. So one stream with many receivers is metered as many streams. What matters is bandwidth times receivers. That grows with fan-out while your source rate stays flat.",
    },
    {
      type: "p",
      text: "Model it before you build, from the current rate card rather than a number in an article. For a small control or discovery feed the cost is a rounding error. For heavy video to many receivers it is not. There, a stream broker or a media service built for the job usually costs less. It also gives you replay and backpressure. The same per-gigabyte thinking runs across the whole gateway — see [Transit Gateway versus VPC peering](/cloud/aws-transit-gateway-vs-vpc-peering).",
    },
  ],
  faq: [
    {
      question: "Can multicast cross Direct Connect or a VPN?",
      answer:
        "No. It works between VPC attachments only. Not Direct Connect. Not VPN, peering or Connect. A feed from outside has to arrive by unicast first.",
    },
    {
      question: "Does Transit Gateway support IGMPv3?",
      answer:
        "No. IGMPv2 only. So there is no source-specific multicast. Filter by source in your own code, or use a static domain.",
    },
    {
      question: "Is it suitable for trading feeds?",
      answer:
        "AWS says it may not suit high-frequency trading, or other work where speed is the point. Take that at face value. Test it before you design around it.",
    },
    {
      question: "Why did a host stop receiving traffic?",
      answer:
        "It likely missed three queries. The gateway asks every two minutes. Your security groups and ACLs have to allow protocol 2 from 0.0.0.0/32.",
    },
    {
      question: "Does multicast work with IPv6?",
      answer:
        "Only with static membership. A dynamic IGMP domain will not do IPv6. So that choice is made for you.",
    },
    {
      question: "Are large multicast packets fragmented?",
      answer:
        "No. The gateway does not fragment multicast, and it drops packets that turn up fragmented. Keep each datagram inside the path MTU.",
    },
  ],
  sources: [
    {
      title: "Multicast in AWS Transit Gateway",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/tgw-multicast-overview.html",
    },
    {
      title: "Multicast domains",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/multicast-domains-about.html",
    },
    {
      title: "Transit gateway quotas",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/transit-gateway-quotas.html",
    },
    {
      title: "AWS Transit Gateway pricing",
      publisher: "Amazon Web Services",
      url: "https://aws.amazon.com/transit-gateway/pricing/",
    },
  ],
};
