import type { Article } from "../../types";

export const article: Article = {
  slug: "sase-vs-sse-sd-wan-architecture-reality",
  category: "enterprise-networking",
  contentType: "comparison",
  subcategory: "WAN",
  title: "SASE, SSE and SD-WAN: which plane is doing the work",
  seoTitle: "SASE vs SSE vs SD-WAN: The Architecture Behind the Acronyms",
  metaDescription:
    "SD-WAN moves packets. SSE inspects them. SASE is the claim that one vendor does both in one place. The difference shows up in your traffic paths, not the datasheet.",
  standfirst:
    "These three terms cover two planes and one marketing claim. Work out which is which, and picking a vendor becomes a technical job again.",
  excerpt:
    "The useful question is not what SASE means. It is where your traffic gets decrypted, where it gets inspected, how far it travels to get there, and how many consoles you need open to answer that.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "SASE vs SSE vs SD-WAN",
  secondaryKeywords: [
    "Security Service Edge components",
    "ZTNA vs VPN",
    "SD-WAN hairpinning",
    "local internet breakout",
    "SWG CASB FWaaS",
  ],
  tags: ["Networking", "Zero Trust", "Security Architecture", "WAN", "SASE"],
  reviewStatus: "research-based",
  relatedSlugs: ["zero-trust-network-segmentation", "enterprise-dns-security-doh-dot-filtering"],
  draft: true,
  methodology:
    "Written from NIST SP 800-207 for the zero trust access model, industry definitions of the SSE component set, and vendor-neutral architecture documentation, verified August 2026. The source draft's classification of named vendors as native or bolted-on was removed: it is a market claim that cannot be verified from documentation and dates badly. Its latency thresholds and inspection timings were removed for the same reason.",
  body: [
    {
      type: "p",
      text: "Three acronyms, usually sold together, and often by the same person in the same meeting. Between them they describe two genuinely different things. Plus one claim about who ought to own both.",
    },
    {
      type: "p",
      text: "Strip the naming away and there is a network plane that decides how traffic gets somewhere, and a security plane that decides what happens to it on the way. Every architectural question worth asking is about where those two meet.",
    },
    { type: "h2", id: "definitions", text: "What each term actually denotes" },
    {
      type: "p",
      text: "**SD-WAN** is a networking technology. It abstracts the transport — MPLS, broadband, cellular — measures path health, and steers traffic accordingly. It is good at getting packets somewhere efficiently. It does not, by itself, have an opinion about what is inside them.",
    },
    {
      type: "p",
      text: "**SSE** is a security bundle delivered from the cloud, conventionally four services:",
    },
    {
      type: "table",
      caption: "The SSE component set",
      head: ["Component", "What it decides"],
      rows: [
        ["SWG", "Whether web traffic is allowed, and what is inside it once decrypted"],
        [
          "CASB",
          "What may be done inside sanctioned SaaS — often via the provider's API, not just inline",
        ],
        ["ZTNA", "Whether this identity, on this device, may reach this one internal application"],
        ["FWaaS", "Layer 3 to 7 policy for the traffic that is not web"],
      ],
    },
    {
      type: "p",
      text: "**SASE** is the claim that one vendor provides both planes, under one policy engine, executing in the same place. It is a convergence claim rather than a technology, which is exactly why it is hard to evaluate from a datasheet.",
    },
    { type: "h2", id: "hairpin", text: "The path is the architecture" },
    {
      type: "p",
      text: "Take a branch user opening a SaaS application. The traffic leaves the branch, reaches a point of presence where inspection happens, and continues to the provider.",
    },
    {
      type: "p",
      text: "Whether that is efficient depends entirely on geography and peering. If the inspection point is near the user and well connected to the SaaS provider, the detour is small. If it is not — if the traffic crosses a region to be inspected and then crosses back — you have added latency to every request in exchange for the inspection.",
    },
    {
      type: "p",
      text: "That detour is hairpinning, and it is a property of the path rather than of the vendor. It gets worse when the two planes belong to different suppliers, because nothing is optimising the join between them.",
    },
    {
      type: "p",
      text: "The internal case is where it compounds. A remote user reaching an internal app goes to the security edge first, for identity and inspection. From there it travels on to wherever the app lives. It may re-enter your own network to get there. Each hop is a place the traffic can take a longer route than the map suggests.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Draw the paths before you shortlist",
      text: "Branch to SaaS, remote user to SaaS, remote user to internal, branch to data centre, and anything machine-to-machine. Write down where each one is decrypted and inspected. Note how far it travels to get there. Most disappointment with these platforms traces to one path being far longer than anyone drew. It shows up on paper before it shows up in a support ticket.",
    },
    { type: "h2", id: "consoles", text: "Two planes, and how many consoles" },
    {
      type: "p",
      text: "The operational argument for single-vendor convergence is not really about packets. It is about who can answer a question.",
    },
    {
      type: "p",
      text: "Split across two suppliers, the network team owns steering and link policy. The security team owns inspection and access policy. A slow application is then a question neither can answer alone. The evidence sits in two systems, with two clocks and two ideas of what a session is. Lining that up is work, and it is work during an incident.",
    },
    {
      type: "p",
      text: "Converged, routing and inspection are expressed in one policy and observed in one place. That is a real operational benefit. It is also the thing every vendor claims, including those that reached it by acquisition and have not finished integrating.",
    },
    {
      type: "p",
      text: "Which is why the honest evaluation is behavioural rather than architectural. Ask where a session is decrypted. Ask whether one policy can express both a path preference and an inspection rule. Ask to see a single trace crossing both planes. The answers separate integrated products from bundled ones without anyone having to agree on what counts as real SASE.",
    },
    { type: "h2", id: "ztna", text: "ZTNA is the part that changes the security model" },
    {
      type: "p",
      text: "A conventional VPN authenticates a user and then places them on a network. From that point, reachability is a routing question. Everything in the subnet is available to them, and to anything running on their device.",
    },
    {
      type: "p",
      text: "ZTNA replaces network placement with brokered, per-application access. Each request is evaluated against identity, device posture and context, and what results is a path to one application rather than a seat on the network. NIST's zero trust architecture describes the general form: access is granted per-session, per-resource, and re-evaluated rather than assumed.",
    },
    {
      type: "p",
      text: "The practical consequences are the point. Lateral movement from a compromised endpoint has no network to move across. Access can be withdrawn mid-session when posture changes rather than at the next login. And internal applications stop being discoverable by anyone who happens to be on the VPN.",
    },
    {
      type: "p",
      text: "This is the same objective as internal [network segmentation](/enterprise-networking/zero-trust-network-segmentation), approached from the access side rather than the topology side. They are complementary: ZTNA governs who gets in and to what, segmentation governs what can talk to what once inside.",
    },
    {
      type: "callout",
      variant: "note",
      title: "ZTNA is separable",
      text: "Replacing the VPN does not require buying a converged platform. Standalone ZTNA alongside existing firewalls and SD-WAN is a common first step, and it delivers most of the security benefit on its own. Treating the VPN replacement as a prerequisite for a platform decision is what stalls these programmes for a year.",
    },
    { type: "h2", id: "friction", text: "Two things that cause real friction" },
    {
      type: "p",
      text: "**Inspecting encrypted traffic needs a certificate on the endpoint.** To look inside a session you must terminate it. That means the endpoint has to trust the platform's certificate authority. On managed devices, that is a deployment task. On unmanaged devices it is not on offer at all, because you cannot push a root certificate to a contractor's laptop. So access from personal devices has to be designed around inspection rather than through it. Talking to the SaaS provider's own interface covers some of what inline inspection cannot.",
    },
    {
      type: "p",
      text: "**Not everything should go to the cloud edge.** Real-time voice and video suffer from the extra hop and gain little from inspection. That traffic is better broken out locally at the branch. Every platform supports this. The work is deciding what qualifies, and keeping that list current as applications change. Name resolution deserves its own thought, because it is both a control point and a dependency. The trade-offs are in [encrypted DNS and filtering](/enterprise-networking/enterprise-dns-security-doh-dot-filtering).",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "SD-WAN is the network plane, SSE the security plane, SASE the claim that one vendor runs both in one place.",
        "Hairpinning is a property of your paths and their peering, not of a product category.",
        "Map every traffic pattern and mark where each is decrypted. Do this before the shortlist.",
        "Test convergence by asking where a session is decrypted and whether one policy spans both planes.",
        "ZTNA is the substantive change: per-application access instead of a seat on the network.",
        "You can deploy ZTNA without committing to a platform, and probably should.",
        "Plan for unmanaged devices and for traffic that should break out locally. Both are exceptions from day one.",
      ],
    },
    {
      type: "p",
      text: "The convergence argument will settle itself over the next few years, one way or another. The questions underneath it will not go away. Where does inspection happen. How far does traffic travel to reach it. And who can see the whole path when something is slow.",
    },
  ],
  faq: [
    {
      question: "What is the difference between SASE and SSE?",
      answer:
        "SSE is the security half. That means web gateway, CASB, ZTNA and firewall as a service. SASE is SSE plus SD-WAN, sold as one converged platform.",
    },
    {
      question: "Do I have to replace MPLS?",
      answer:
        "No. SD-WAN treats it as one transport among several. Most teams shrink it back to the traffic that really needs it, rather than removing it.",
    },
    {
      question: "Can I deploy ZTNA without a full platform?",
      answer:
        "Yes, and it is a sensible first move. Standalone ZTNA replaces the VPN while your existing firewalls and WAN stay where they are.",
    },
    {
      question: "Does this inspect encrypted traffic?",
      answer:
        "Only if the device trusts your root certificate. Managed devices can be set up that way. Personal ones cannot, so they need another route.",
    },
    {
      question: "How do I tell converged from bundled?",
      answer:
        "Ask where a session is decrypted. Ask whether one policy covers both routing and inspection. Then ask to see one trace crossing both. Datasheets will not separate them.",
    },
  ],
  sources: [
    {
      title: "SP 800-207: Zero Trust Architecture",
      publisher: "NIST",
      url: "https://csrc.nist.gov/pubs/sp/800/207/final",
    },
    {
      title: "Zero Trust Maturity Model",
      publisher: "CISA",
      url: "https://www.cisa.gov/zero-trust-maturity-model",
    },
    {
      title: "Secure Access Service Edge (SASE) glossary definition",
      publisher: "Gartner",
      url: "https://www.gartner.com/en/information-technology/glossary/secure-access-service-edge-sase",
    },
    {
      title: "What is SASE?",
      publisher: "Cloudflare",
      url: "https://www.cloudflare.com/learning/access-management/what-is-sase/",
    },
  ],
};
