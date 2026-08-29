import type { Article } from "../../types";

export const article: Article = {
  slug: "bgp-anycast-vs-geo-dns-global-load-balancing",
  category: "enterprise-networking",
  contentType: "comparison",
  title: "One asks a name server where you are; the other lets the internet decide",
  seoTitle: "BGP Anycast vs Geo-DNS for Global Load Balancing",
  metaDescription:
    "Geo-DNS routes on where your resolver sits, not where you sit. Anycast routes on BGP policy, not distance. What each one really measures, and what it costs.",
  standfirst:
    "Both claim to send users to the nearest site. Neither one can see the user. They each guess from something else, and the two guesses fail in different ways.",
  excerpt:
    "The anycast TCP reset story is real and much rarer than its reputation. The Geo-DNS resolver problem is common and quietly doubles latency for a slice of your users.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "BGP Anycast vs Geo-DNS load balancing",
  secondaryKeywords: [
    "EDNS Client Subnet",
    "anycast TCP connection stability",
    "global load balancing architecture",
    "BGP route flap",
    "AWS Global Accelerator anycast",
  ],
  tags: ["Networking", "BGP", "DNS", "Architecture", "Performance"],
  reviewStatus: "research-based",
  relatedSlugs: ["bgp-in-the-cloud-why-it-matters", "enterprise-dns-security-doh-dot-filtering"],
  methodology:
    "Written from RFC 4786 on anycast service operation, RFC 7871 on EDNS Client Subnet, the Route 53 routing policy documentation, the AWS Global Accelerator guide, and the published resolver policies of Google Public DNS and Cloudflare, verified August 2026. Two corrections were made to the source draft. It said BGP picks the anycast site by AS-path length; path length is one attribute among several and local preference is evaluated first, so anycast follows routing policy rather than distance. And it presented the anycast TCP reset as a routine failure mode; the mechanism is real but rare in practice, and the article now says so rather than overstating it. Two of the draft's three source URLs no longer resolve and were replaced.",
  body: [
    {
      type: "p",
      text: "A user in London and a user in Tokyo type the same name. Both should land somewhere near them. That is the whole goal, and there are two very different ways to reach it.",
    },
    {
      type: "p",
      text: "Geo-DNS decides up front, when the name is looked up. Anycast decides in the network itself, packet by packet.",
    },
    {
      type: "p",
      text: "Neither one can actually see the user. Each infers a location from something nearby, and the thing it infers from is where the failures come from.",
    },
    { type: "h2", id: "geodns", text: "Geo-DNS routes on the resolver, not the user" },
    {
      type: "p",
      text: "A Geo-DNS server looks at the source address of the query, maps it to a place, and answers with the address of the nearest site.",
    },
    {
      type: "p",
      text: "That works if the query came from near the user. Often it did not.",
    },
    {
      type: "p",
      text: "Most people no longer use their ISP's resolver. They use a public one. Your server sees that resolver's address and answers for wherever it thinks that is. If the resolver replied from far away, the answer is confidently wrong. The user then pays for it on every request.",
    },
    { type: "h3", id: "ecs", text: "EDNS Client Subnet, and why it is not a complete fix" },
    {
      type: "p",
      text: "ECS exists for this. The resolver adds a truncated piece of the client subnet to the query. The authoritative server then answers on where the client is, not where the resolver is.",
    },
    {
      type: "p",
      text: "It works well where it is used. It is not used everywhere, and that is a deliberate choice rather than a gap.",
    },
    {
      type: "callout",
      variant: "note",
      title: "ECS leaks part of the client address, so some resolvers refuse it",
      text: "Google Public DNS sends ECS to servers that support it. Cloudflare's 1.1.1.1 does not send client subnet data at all, on privacy grounds. Several other privacy-first resolvers take the same line. So part of your traffic is always routed on resolver location. You cannot tell which part from your own logs. Treat Geo-DNS accuracy as good for most users, not as a promise for all of them.",
    },
    { type: "h2", id: "anycast", text: "Anycast routes on policy, not on distance" },
    {
      type: "p",
      text: "Anycast skips DNS. One address is advertised from many sites at once, and the internet's routers work out where each packet goes.",
    },
    {
      type: "p",
      text: "A packet from London reaches whichever site the London network's routing takes it to. A packet from Tokyo reaches whichever site Tokyo's routing takes it to. No name server was consulted.",
    },
    {
      type: "p",
      text: "It is tempting to call this the shortest path. That is not how BGP decides. Local preference is weighed first, and it encodes money. A network prefers a customer route over a peer route, and a peer route over transit, whatever the path length.",
    },
    {
      type: "p",
      text: "So anycast lands users at the nearest site under the network's own policy. Usually that is close. Sometimes it is not. A user a short drive from one of your sites can be sent to another continent, because that is where their provider's economics point. You do not control that, and you cannot see it from inside your own network.",
    },
    {
      type: "p",
      text: "For connectionless traffic none of this hurts much. A lost or oddly routed DNS or NTP packet is retried. That is why public resolvers and time services are built on anycast, and why the technique earned its reputation there first.",
    },
    { type: "h2", id: "tcp", text: "The anycast TCP problem, in proportion" },
    {
      type: "p",
      text: "TCP is stateful. The server holds the connection in memory. Anycast makes no promise that consecutive packets reach the same server.",
    },
    {
      type: "p",
      text: "So the failure mode is real. A routing change mid-connection sends the next segment to a different site. That site has no record of the session and answers with a reset. The user sees a connection dropped for no visible reason.",
    },
    {
      type: "p",
      text: "The proportion matters as much as the mechanism. Routes are stable most of the time, and a web connection is short. The window in which a change can land inside a live connection is small, which is why large anycast networks serve enormous amounts of TCP without this dominating their error budget. The right description is a rare failure you design for, not a constant tax.",
    },
    {
      type: "p",
      text: "Design for it by terminating early. Let the anycast address reach an edge proxy that terminates TCP and TLS, then carry the request onward over a separate connection to the origin. A reset now costs one connection at the edge instead of a user-visible failure, and the long-haul leg is one you control.",
    },
    { type: "h2", id: "health", text: "How each one recovers from a failure" },
    {
      type: "p",
      text: "This is the difference that gets least attention and matters most during an incident.",
    },
    {
      type: "p",
      text: "Geo-DNS fails over by changing its answer. A health check marks a site down and the server stops returning it. The catch is caching: resolvers hold the old answer until the record's time to live expires, so your recovery time has a floor you set in advance. A short TTL buys faster failover and more query load.",
    },
    {
      type: "p",
      text: "Anycast fails over by withdrawing a route. Stop advertising the prefix at a site and traffic moves to whichever site is next under the routing policy. Nothing has to expire, and propagation is not instant either.",
    },
    {
      type: "table",
      caption: "What each mechanism actually controls.",
      head: ["", "Geo-DNS", "BGP Anycast"],
      rows: [
        ["Decides at", "Name resolution", "Every packet, in the routing fabric"],
        [
          "Infers location from",
          "Resolver address, or ECS",
          "Routing policy of the user's network",
        ],
        ["Granularity", "Country or region, by rule", "Whatever BGP does"],
        ["Recovery", "Health check, bounded by TTL", "Route withdrawal"],
        ["Stateful traffic", "Stable for the session", "Rare mid-session resets"],
        ["Needs", "A DNS provider", "Your own AS and address space, or a provider"],
      ],
    },
    { type: "h2", id: "practice", text: "Most large deployments use both" },
    {
      type: "p",
      text: "These are not competing choices. They sit at different layers and combine well.",
    },
    {
      type: "p",
      text: "The common shape is anycast at the edge and DNS above it. Anycast pulls users onto the nearest edge node without asking anyone where they are. The edge terminates TCP, so route changes stop being a user-visible event. DNS then handles the decisions anycast cannot express, such as steering a country to a specific region for data residency.",
    },
    {
      type: "p",
      text: "You do not have to run this yourself, and most organisations should not. Advertising anycast means holding your own AS number and address space and peering with upstreams. Managed anycast services take that on: a static set of addresses advertised from a provider's edge, with traffic entering their backbone at the nearest location and travelling on private capacity to your region. The BGP mechanics underneath are covered in [BGP in the cloud](/enterprise-networking/bgp-in-the-cloud-why-it-matters), and the resolver-side controls in [enterprise DNS security](/enterprise-networking/enterprise-dns-security-doh-dot-filtering).",
    },
  ],
  faq: [
    {
      question: "Why does Geo-DNS send some users to the wrong region?",
      answer:
        "It sees the resolver, not you. A public resolver may answer from another country. Then the answer is wrong, and you pay for it in latency.",
    },
    {
      question: "Does EDNS Client Subnet fix that?",
      answer:
        "Mostly. Google Public DNS sends it. Cloudflare's 1.1.1.1 does not, on privacy grounds. So a share of your traffic is still routed on resolver location.",
    },
    {
      question: "Does anycast pick the shortest path?",
      answer:
        "No. BGP weighs local preference ahead of path length, and that reflects money. So anycast follows policy. Near, most of the time.",
    },
    {
      question: "Is anycast safe for TCP?",
      answer:
        "Yes, with care. A routing change mid-connection can cause a reset. It is rare. Terminate TCP at the edge and the reset costs one connection, not a page.",
    },
    {
      question: "Which fails over faster?",
      answer:
        "Neither is instant. DNS is bounded by the record TTL you set. Anycast withdraws a route and waits for that to propagate.",
    },
    {
      question: "Do I need my own AS number for anycast?",
      answer:
        "To run it yourself, yes, plus your own address space and BGP peering. Most teams use a CDN or a managed accelerator instead.",
    },
  ],
  sources: [
    {
      title: "RFC 4786: Operation of Anycast Services",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc4786",
    },
    {
      title: "RFC 7871: Client Subnet in DNS Queries",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc7871",
    },
    {
      title: "Choosing a routing policy",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html",
    },
    {
      title: "How AWS Global Accelerator works",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/global-accelerator/latest/dg/introduction-how-it-works.html",
    },
    {
      title: "EDNS Client Subnet in Google Public DNS",
      publisher: "Google",
      url: "https://developers.google.com/speed/public-dns/docs/ecs",
    },
  ],
};
