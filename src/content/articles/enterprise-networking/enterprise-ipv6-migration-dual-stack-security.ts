import type { Article } from "../../types";

export const article: Article = {
  slug: "enterprise-ipv6-migration-dual-stack-security",
  category: "enterprise-networking",
  contentType: "explainer",
  subcategory: "IPv6",
  title: "Enterprise IPv6 migration: the architecture and security work dual-stack really requires",
  seoTitle: "Enterprise IPv6 Migration: Architecture, Security, and Dual-Stack Planning",
  metaDescription:
    "IPv6 is already present in modern enterprise networks. Learn how dual-stack addressing, routing, DNS, firewalls, NDP and monitoring change the migration plan.",
  standfirst:
    "IPv6 is not really an addressing project. It is a second network stack, and you have to design it, filter it, watch it and run it beside IPv4.",
  excerpt:
    "The hard part of enterprise IPv6 is not writing a 128-bit address. It is making routing, DNS, security policy, monitoring and operations treat IPv6 as a first-class protocol.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "enterprise IPv6 migration",
  secondaryKeywords: [
    "IPv6 dual stack enterprise",
    "SLAAC vs DHCPv6",
    "IPv6 firewall rules",
    "NDP security",
    "IPv6 monitoring",
  ],
  tags: ["Networking", "IPv6", "Enterprise Networking", "Security", "Dual Stack"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "bgp-in-the-cloud-why-it-matters",
    "enterprise-dns-security-doh-dot-filtering",
    "zero-trust-network-segmentation",
  ],
  draft: false,
  methodology:
    "Researched against IETF IPv6 standards, Microsoft Windows IPv6 guidance and Cloudflare Radar. Version-sensitive vendor behaviour was described only where current documentation supports it. The original draft's Cloudflare percentage, rigid address-allocation assumptions, unsupported Cisco command example and performance claims were removed or qualified.",
  body: [
    {
      type: "p",
      text: "IPv6 is not a future project any more. It is already in your operating systems, in cloud services, and in the traffic you serve. Cloudflare Radar currently reports IPv6 for about 40.9% of worldwide requests in its latest seven-day view, and India runs much higher. None of that means you should switch it on tomorrow. It does mean the choice has to be a real one, made on security and operations grounds.",
    },
    {
      type: "p",
      text: "The dangerous state is not IPv4-only. The dangerous state is accidental IPv6. A client can have an IPv6 address while the security team still thinks in IPv4 rules, IPv4 logs and IPv4 discovery. That creates a second path through the environment without a second set of controls.",
    },
    {
      type: "p",
      text: "So start by looking, not building. Find where IPv6 is already on. Find which routers advertise prefixes. Check what the firewalls actually inspect. Check that monitoring and identity systems record an IPv6 address properly. Only then build dual-stack on purpose.",
    },
    {
      type: "h2",
      id: "addressing",
      text: "Start with the prefix, not the host address",
    },
    {
      type: "p",
      text: "IPv6 addresses are 128 bits. That large space changes how subnet design works. A normal enterprise subnet is commonly a /64 because SLAAC and many IPv6 host behaviours are designed around that boundary. The point is not to calculate a host count. The point is to give each link a clean prefix.",
    },
    {
      type: "p",
      text: "A provider may delegate a larger block to the enterprise. DHCPv6 Prefix Delegation can hand a router a prefix that the router then subdivides for downstream links. RFC 8415 describes this model. The exact delegated size is a provider and contract decision, not an IPv6 law.",
    },
    {
      type: "table",
      caption: "A useful enterprise hierarchy",
      head: ["Layer", "Typical design decision", "Why it matters"],
      rows: [
        [
          "Provider allocation",
          "A routed IPv6 prefix",
          "Creates the address space the enterprise can announce and subdivide",
        ],
        [
          "Site or region",
          "A predictable portion of the allocation",
          "Keeps routing and summarisation manageable",
        ],
        [
          "VLAN or routed link",
          "Normally a /64",
          "Matches common IPv6 host configuration behaviour",
        ],
        ["Host", "One or more IPv6 addresses", "May include stable and temporary addresses"],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Do not hard-code a universal /48 story",
      text: "A /48 is a common enterprise allocation, but it is not a rule that every enterprise receives a /48. Design from the prefix actually delegated to you and reserve room for growth.",
    },
    {
      type: "h2",
      id: "address-assignment",
      text: "SLAAC and DHCPv6 solve different problems",
    },
    {
      type: "p",
      text: "SLAAC lets a host form an address from a router-advertised prefix. Duplicate Address Detection checks whether the proposed address is already in use. Modern systems can also use temporary addresses for outbound connections, which reduces simple address-based tracking.",
    },
    {
      type: "p",
      text: "DHCPv6 can provide addresses and other configuration. It can also be used alongside SLAAC. RFC 8415 explicitly supports DHCPv6 in combination with SLAAC. DNS configuration can also be carried in Router Advertisements through RFC 8106.",
    },
    {
      type: "p",
      text: "So the usual question, â€œSLAAC or DHCPv6â€, is the wrong one to start with. Ask what you actually need first. Central control of addresses? A host inventory? DNS options? Or just hosts that configure themselves? Then pick the control flags and tools that give you it.",
    },
    {
      type: "h2",
      id: "routing",
      text: "Treat IPv6 routing as a real production control plane",
    },
    {
      type: "p",
      text: "Dual-stack means two routing tables and two policy sets. OSPFv3, MP-BGP and other routing mechanisms can carry IPv6 routes, but the important operational rule is symmetry of design. Do not build an IPv4 route map and assume IPv6 will inherit it.",
    },
    {
      type: "p",
      text: "Summarisation matters just as much as in IPv4. A predictable hierarchy lets upstream routers carry fewer prefixes. It also makes incident response easier because an address can be mapped back to a site or network segment without guessing.",
    },
    {
      type: "p",
      text: "Test failure paths. Remove an IPv6 route and confirm the expected failover. Test a broken next hop. Test asymmetric paths through stateful firewalls. IPv6 problems often look like application failures because the IPv4 path remains healthy.",
    },
    {
      type: "h2",
      id: "security",
      text: "NDP changes the layer-2 threat model",
    },
    {
      type: "p",
      text: "IPv4 uses ARP to resolve neighbours. IPv6 uses Neighbor Discovery, carried by ICMPv6. NDP is fundamental to normal IPv6 operation, so blocking ICMPv6 broadly is not a security strategy.",
    },
    {
      type: "p",
      text: "Rogue Router Advertisements are a key local-network risk. An unauthorised device can advertise itself as a router and influence how hosts build their routes. RA Guard provides a switch-level filtering mechanism for this problem. RFC 6105 also makes clear that RA Guard depends on traffic crossing a controlled layer-2 device.",
    },
    {
      type: "p",
      text: "Do not treat RA Guard as the whole story. Pair it with switch controls and port security. Add an IPv6 firewall policy that fits, plus endpoint controls and monitoring. And check it against your vendor's current docs, because RA Guard behaviour and syntax differ by platform.",
    },
    {
      type: "h2",
      id: "firewall",
      text: "Firewall rules have to cover both",
    },
    {
      type: "p",
      text: "The most common migration error is an IPv4 policy with an accidental IPv6 bypass. A service may be denied over IPv4 but reachable over IPv6. The opposite can also happen, where IPv6 is enabled but the service simply cannot be reached because the rule set is incomplete.",
    },
    {
      type: "table",
      caption: "The dual-stack control checklist",
      head: ["Control", "IPv4 question", "IPv6 question"],
      rows: [
        [
          "Perimeter firewall",
          "Which IPv4 sources can reach the service?",
          "Which IPv6 prefixes can reach the service?",
        ],
        [
          "Internal segmentation",
          "Which VLANs can communicate?",
          "Which IPv6 prefixes and ICMPv6 types are allowed?",
        ],
        ["DNS", "Which A records exist?", "Which AAAA records should exist?"],
        ["SIEM", "Are IPv4 fields parsed?", "Are IPv6 fields parsed and normalised?"],
        ["IPAM", "Are IPv4 addresses tracked?", "Are prefixes and IPv6 assignments tracked?"],
      ],
    },
    {
      type: "p",
      text: "ICMPv6 deserves special treatment. NDP and Path MTU Discovery depend on ICMPv6. The correct policy is selective allowance and inspection, not a blanket deny.",
    },
    {
      type: "h2",
      id: "dns-monitoring",
      text: "DNS and monitoring are part of the migration",
    },
    {
      type: "p",
      text: "IPv6 does not let you skip DNS. A service you want reachable over IPv6 needs its AAAA records. Adding those records without testing the app is a risk, though. Plenty of apps still hold IPv4 literals, IPv4-only ACLs, or a library that assumes one address family.",
    },
    {
      type: "p",
      text: "Monitoring has to learn both address families too. Search rules, dashboards, allowlists and playbooks all need to accept IPv6 syntax. And store the address in a real IP field, not a string shaped around dotted decimal.",
    },
    {
      type: "p",
      text: "The same goes for VPNs, load balancers, EDR, vulnerability scanners and asset inventory. A dual-stack network is only real once the tools around it understand both stacks.",
    },
    {
      type: "h2",
      id: "migration",
      text: "A safer order to do this in",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not use endpoint disablement as the migration strategy",
      text: "Microsoft calls IPv6 a mandatory part of modern Windows, and advises against turning its components off. If you want IPv4 preferred, Microsoft points you at prefix policy instead. The safer control sits in the network: decide whether you advertise and route IPv6 at all, then secure it once you do.",
    },
    {
      type: "h2",
      id: "decision",
      text: "When dual-stack is the right answer",
    },
    {
      type: "p",
      text: "Dual-stack is not always where you end up. Some networks will move to IPv6-only segments, with translation for whatever still needs IPv4. Others will run both for years. What decides it is app support, what your provider offers, what your security tools handle, and what the business depends on.",
    },
    {
      type: "p",
      text: "The durable lesson is simpler. Do not make IPv6 an invisible feature. Give it an owner, an address plan, firewall policy, monitoring, IPAM and incident procedures. Once those controls exist, IPv6 becomes another production protocol rather than an unmanaged side channel.",
    },
    {
      type: "h2",
      id: "takeaway",
      text: "What to remember",
    },
    {
      type: "ul",
      items: [
        "A /64 is a subnet design convention, not a host-count exercise.",
        "SLAAC and DHCPv6 can coexist; choose the model from operational requirements.",
        "RA Guard helps control rogue Router Advertisements but is not the whole IPv6 security model.",
        "ICMPv6 is required for core IPv6 functions, so do not block it blindly.",
        "Every IPv4 control that matters should prompt you to check the IPv6 side.",
        "Monitoring, DNS, IPAM, VPN and endpoint tools must understand IPv6 before the rollout expands.",
      ],
    },
  ],
  faq: [
    {
      question: "Should an enterprise disable IPv6 until it is ready?",
      answer:
        "Microsoft advises against turning IPv6 off in Windows. Control it in the network instead. Decide if you advertise and route it. Then secure it once you do.",
    },
    {
      question: "Do all enterprise VLANs need a /64?",
      answer:
        "A /64 is the usual subnet size, and most designs use it. Follow the standards, and check what the hosts on that link need.",
    },
    {
      question: "Is DHCPv6 required when using SLAAC?",
      answer:
        "No. SLAAC works on its own. Add DHCPv6 when you want to hand out addresses, or push extra settings.",
    },
    {
      question: "Can I block all ICMPv6 at the firewall?",
      answer:
        "No. IPv6 leans on ICMPv6 for things like Neighbor Discovery and Path MTU Discovery. Filter the types you do not want. Do not block the lot.",
    },
    {
      question: "What should be tested first in an IPv6 pilot?",
      answer:
        "Test routing and DNS. Test the firewall, ICMPv6 and the apps. Then test monitoring, VPN and what happens when it breaks. A ping that works proves very little.",
    },
  ],
  sources: [
    {
      title: "RFC 8415 â€” Dynamic Host Configuration Protocol for IPv6",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc8415",
    },
    {
      title: "RFC 6105 â€” IPv6 Router Advertisement Guard",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc6105",
    },
    {
      title: "RFC 8106 â€” IPv6 Router Advertisement Options for DNS Configuration",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/rfc8106/",
    },
    {
      title: "RFC 8981 â€” Temporary Address Extensions for SLAAC",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc8981",
    },
    {
      title: "Configure IPv6 for advanced users",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/configure-ipv6-in-windows",
    },
    {
      title: "Adoption and Usage Worldwide",
      publisher: "Cloudflare Radar",
      url: "https://radar.cloudflare.com/adoption-and-usage",
    },
  ],
};
