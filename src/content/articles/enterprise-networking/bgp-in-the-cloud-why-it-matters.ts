import type { Article } from "../../types";

export const article: Article = {
  slug: "bgp-in-the-cloud-why-it-matters",
  category: "enterprise-networking",
  contentType: "explainer",
  subcategory: "WAN",
  title: "BGP in the cloud: the protocol you stopped being able to ignore",
  seoTitle: "BGP in the cloud: what it does and why it matters",
  metaDescription:
    "Cloud hides the routers until you connect to your own network. How BGP works on Direct Connect and ExpressRoute, and the mistakes that break hybrid links.",
  standfirst:
    "You can build in the cloud for years and never meet BGP. Then you plug in your own network, and it decides whether traffic flows.",
  excerpt:
    "Cloud providers hide the routers right up to the point where you connect your own network. What BGP does on Direct Connect and ExpressRoute, and the four mistakes that break hybrid links.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-22",
  draft: false,
  lastReviewedAt: "2026-08-22",
  nextReviewAt: "2027-08-22",
  readingMinutes: 6,
  primaryKeyword: "BGP in the cloud",
  secondaryKeywords: [
    "AWS Direct Connect BGP",
    "Azure ExpressRoute BGP",
    "BGP local preference",
    "BGP communities Direct Connect",
    "hybrid cloud routing",
  ],
  tags: ["Networking", "BGP", "Cloud", "AWS", "Azure", "Hybrid Cloud"],
  reviewStatus: "research-based",
  relatedSlugs: ["zero-trust-network-segmentation", "cloud-cost-controls"],
  methodology:
    "Written from AWS Direct Connect routing documentation, the AWS BGP communities reference, Azure ExpressRoute routing documentation and RFC 4271, verified August 2026. Community values and BGP state names are quoted from those sources. Vendor behaviour is labelled by vendor, because the two providers differ in ways that matter. No throughput or latency figures are given — they depend on the circuit.",
  body: [
    {
      type: "p",
      text: "You can run cloud infrastructure for years without meeting BGP. You define a VPC, pick a CIDR block, and routing happens. Nobody hands you a router.",
    },
    {
      type: "p",
      text: "That holds until you connect the cloud to something you own. A data centre link, a second cloud, an active-active build across regions. At that point a routing protocol decides what reaches what, and the protocol is BGP.",
    },
    {
      type: "p",
      text: "The gap catches experienced people out. Cloud networking feels like configuration, so BGP feels like a setting. It is not. It is a protocol with its own state machine and its own tie-breaks, and when a hybrid link behaves strangely the answer is usually in there.",
    },
    { type: "h2", id: "what-bgp-does", text: "What BGP is actually doing" },
    {
      type: "p",
      text: "BGP is a path-vector protocol. It exchanges routing information between autonomous systems — networks under separate control. It is what holds the public internet together, and the same machinery runs your hybrid link.",
    },
    {
      type: "p",
      text: "It does not advertise addresses. It advertises prefixes, such as 10.0.0.0/16. Two BGP speakers open a session over TCP port 179 and tell each other which prefixes they can reach.",
    },
    {
      type: "p",
      text: "When more than one path exists, BGP picks one. Three attributes do most of that work in hybrid designs.",
    },
    {
      type: "table",
      caption: "The attributes that decide a hybrid path, and the direction each one controls",
      head: ["Attribute", "Preferred value", "What it controls"],
      rows: [
        ["Local preference", "Higher wins", "Which exit your own side uses for outbound traffic"],
        ["AS path length", "Shorter wins", "Which path the other side prefers back to you"],
        [
          "Multi-exit discriminator (MED)",
          "Lower wins",
          "A hint to a peer about which of your links to use",
        ],
      ],
    },
    {
      type: "p",
      text: "Local preference is the one people reach for first. It never leaves your own autonomous system, so it steers traffic on the way out and does nothing on the way back. Return traffic is a separate problem, and forgetting that is how asymmetric routing starts.",
    },
    {
      type: "p",
      text: "In a data centre the peer is a physical router. In the cloud it is a virtual router the provider operates. The mechanics are unchanged.",
    },
    { type: "h2", id: "aws", text: "AWS: Direct Connect and Transit Gateway" },
    {
      type: "p",
      text: "On AWS, BGP shows up with Direct Connect. You create a virtual interface, then bring up a BGP session between your router and the AWS side. Prefixes you advertise get injected into the AWS network, and resources in your VPC can reach them.",
    },
    {
      type: "p",
      text: "Transit Gateway works the same way at larger scale. Attach a Direct Connect gateway and the Transit Gateway learns those routes, then propagates them to attached VPCs.",
    },
    {
      type: "p",
      text: "One AWS-specific point matters more than the rest. You cannot set local preference directly on what AWS sends you. Instead you tag the prefixes you advertise with a BGP community, and AWS maps that community to a local preference on its side.",
    },
    {
      type: "table",
      caption:
        "AWS Direct Connect local preference communities, from the AWS BGP communities reference",
      head: ["Community", "Local preference applied by AWS"],
      rows: [
        ["7224:7100", "Low"],
        ["7224:7200", "Medium"],
        ["7224:7300", "High"],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Use the full four-digit value",
      text: "These are 7224:7100, 7224:7200 and 7224:7300. Shortened forms such as 7224:71 appear in blog posts and forum answers and are not valid values. A malformed community is usually ignored rather than rejected, so the session stays up and the routing quietly ignores your intent.",
    },
    {
      type: "p",
      text: "That failure mode is worth dwelling on. Nothing alarms. The circuit is healthy, the prefixes are present, and traffic simply leaves by the path you did not choose.",
    },
    { type: "h2", id: "azure", text: "Azure: ExpressRoute and Virtual WAN" },
    {
      type: "p",
      text: "ExpressRoute follows the same shape. You create a circuit and peer with a Microsoft edge router, exchanging IPv4 and IPv6 prefixes over BGP.",
    },
    {
      type: "p",
      text: "Virtual WAN adds a virtual hub that behaves as a cloud router. It peers with your sites over ExpressRoute and with your virtual networks over their connections.",
    },
    {
      type: "p",
      text: "The Azure-specific trap is route precedence. For the same prefix, a user-defined route in a route table beats a route learned over BGP. If traffic is not taking the circuit, look for a UDR before you touch the BGP session. The session will look perfectly healthy, because it is.",
    },
    {
      type: "p",
      text: "Where you need to shape attributes on the Azure side, ExpressRoute route maps do it. If your sites advertise distinct prefixes, longest-prefix match usually decides before any attribute is consulted.",
    },
    { type: "h2", id: "scenario", text: "A failover design, and how it goes wrong" },
    {
      type: "p",
      text: "Take an organisation with data centres in New York and London, each with its own circuit into the same cloud. New York should carry traffic. London should take over if New York fails.",
    },
    {
      type: "p",
      text: "Outbound is the easy half. Tag the New York prefixes with the high local preference community and London with a lower one. The cloud now prefers New York when sending to you.",
    },
    {
      type: "p",
      text: "Return traffic needs a different lever, because local preference does not travel. The usual approach is AS path prepending: advertise the London prefixes with your own ASN repeated, so that path looks longer and loses the tie-break.",
    },
    {
      type: "p",
      text: "Do only the first half and you get asymmetric routing. Traffic leaves through New York and comes back through London. Stateful firewalls see half a conversation and drop it, and the symptom looks like an application fault rather than a routing one.",
    },
    { type: "h2", id: "mistakes", text: "Four mistakes that account for most broken links" },
    {
      type: "h3",
      id: "overlap",
      text: "Overlapping address space",
    },
    {
      type: "p",
      text: "If your network and your VPC both use 10.0.0.0/16, no routing protocol can save you. Either the provider rejects the prefix or traffic goes somewhere unhelpful. Address planning has to come before the circuit, and it is much harder to fix afterwards.",
    },
    {
      type: "h3",
      id: "state-machine",
      text: "Reading 'down' instead of the BGP state",
    },
    {
      type: "p",
      text: "A console that says Down tells you nothing about why. BGP moves through Idle, Connect, Active, OpenSent, OpenConfirm and Established, and the state names the problem.",
    },
    {
      type: "table",
      caption: "Where a session stalls, and what it usually means",
      head: ["Stuck in", "Usually means"],
      rows: [
        ["Active", "TCP 179 is not getting through — firewall or security group"],
        ["OpenSent", "TCP is fine, negotiation is not — commonly a mismatched ASN"],
        ["Idle", "The session is administratively down, or the peer address is wrong"],
      ],
    },
    {
      type: "h3",
      id: "default-route",
      text: "Expecting a default route",
    },
    {
      type: "p",
      text: "Providers do not advertise 0.0.0.0/0 to you by default. If you want on-premises internet traffic to break out through the cloud, you configure that explicitly on the gateway or circuit. Otherwise the specific prefixes work and everything else quietly does not.",
    },
    {
      type: "h3",
      id: "mtu",
      text: "MTU mismatches",
    },
    {
      type: "p",
      text: "BGP messages are small, so the session comes up fine. The traffic it carries may not fit. Where the path MTU differs along the route, large packets drop while small ones pass.",
    },
    {
      type: "p",
      text: "The tell is distinctive: ping works, a file transfer or a TLS handshake stalls. Align the MTU across the path, or clamp TCP MSS at the edge so hosts negotiate a size that fits.",
    },
    { type: "h2", id: "security", text: "Security worth applying" },
    {
      type: "p",
      text: "BGP was designed for a network where everyone was trusted. It has no built-in way to prove that an advertiser owns a prefix. On the public internet that produces hijacking.",
    },
    {
      type: "p",
      text: "On a private circuit the realistic risk is a leak of your own making. Advertise 10.0.0.0/8 to a provider and you may export far more of your internal estate than intended.",
    },
    {
      type: "ul",
      items: [
        "Filter in both directions. Advertise only the prefixes that need to be reachable, and accept only the ones you expect back.",
        "Authenticate the session. MD5 is widely supported; TCP-AO is the stronger option where both ends can do it.",
        "Restrict TCP 179 to the specific peer addresses at each end, rather than to a range.",
        "Treat a prefix filter as a change-controlled object. Most leaks start with a filter someone widened during an incident and never narrowed again.",
      ],
    },
    {
      type: "p",
      text: "Filtering is also a segmentation control, and it belongs with the rest of them. [Segmenting a network without breaking it](/enterprise-networking/zero-trust-network-segmentation) covers where these boundaries sit.",
    },
    { type: "h2", id: "when", text: "When you do not need BGP" },
    {
      type: "p",
      text: "Plenty of hybrid links work fine with static routes. One site, one circuit, prefixes that never change, no failover requirement. A static route is easier to reason about and cannot flap.",
    },
    {
      type: "p",
      text: "Reach for BGP when you have more than one connection, more than one site, prefixes that change, or a service such as Transit Gateway or Virtual WAN that expects it. The cost of BGP is that you now operate a protocol. Take that on when it buys you something.",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "Plan addressing first. Overlap is the one failure no amount of tuning fixes.",
        "Read the BGP state, not the console badge. Active means TCP; OpenSent means negotiation.",
        "Steer both directions. Communities or local preference for outbound, AS path for return.",
        "Check for a user-defined route before blaming the circuit on Azure.",
        "If small packets work and large ones do not, it is MTU.",
      ],
    },
    {
      type: "p",
      text: "Cloud BGP is a smaller job than data centre BGP. A handful of prefixes, a virtual peer, no line cards. The mechanics are identical, which is the good news: what you learn here is the same protocol that has been running everything else for thirty years.",
    },
  ],
  faq: [
    {
      question: "Do I need BGP for a single link to the cloud?",
      answer:
        "Often not. One site, one circuit and a stable set of prefixes works fine with static routes. Add a second link or a second site and BGP starts to earn its keep.",
    },
    {
      question: "Why is my BGP session stuck in Active?",
      answer:
        "Active means the TCP connection is not forming. Look at firewalls and security groups on port 179. It is rarely a BGP problem at that stage.",
    },
    {
      question: "Can I set local preference on routes AWS sends me?",
      answer:
        "Not directly. You tag the prefixes you advertise with a community, and AWS maps it to a local preference. Use 7224:7100 for low, 7224:7200 for medium and 7224:7300 for high.",
    },
    {
      question: "Why is traffic ignoring my ExpressRoute circuit?",
      answer:
        "Check the route table first. For the same prefix, a user-defined route beats one learned over BGP. The session stays up and looks healthy while the traffic goes elsewhere.",
    },
    {
      question: "What causes asymmetric routing on a hybrid link?",
      answer:
        "Steering one direction and not the other. Local preference only shapes traffic leaving your network. To shape the return path you need AS path prepending or a MED.",
    },
  ],
  sources: [
    {
      title: "Routing policies and BGP communities for AWS Direct Connect",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/routing-and-bgp.html",
    },
    {
      title: "AWS Direct Connect virtual interfaces",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/WorkingWithVirtualInterfaces.html",
    },
    {
      title: "ExpressRoute routing requirements",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/expressroute/expressroute-routing",
    },
    {
      title: "Virtual network traffic routing",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview",
    },
    {
      title: "RFC 4271: A Border Gateway Protocol 4 (BGP-4)",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc4271",
    },
  ],
};
