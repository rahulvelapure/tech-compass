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
    "IPv6 migration is not mainly an addressing project. It is a second network stack that must be designed, filtered, monitored and operated beside IPv4.",
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
  draft: true,
  methodology:
    "Researched against IETF IPv6 standards, Microsoft Windows IPv6 guidance and Cloudflare Radar. Version-sensitive vendor behaviour was described only where current documentation supports it. The original draft's Cloudflare percentage, rigid address-allocation assumptions, unsupported Cisco command example and performance claims were removed or qualified.",
  body: [
    {
      type: "p",
      text: "IPv6 is no longer a future architecture exercise. It is already present in enterprise operating systems, cloud services and internet traffic. Cloudflare Radar currently reports IPv6 for about 40.9% of worldwide requests in its latest seven-day view. India is much higher in the same view. That does not mean every enterprise should turn on IPv6 tomorrow. It does mean IPv6 deserves an explicit security and operations decision.",
    },
    {
      type: "p",
      text: "The dangerous state is not IPv4-only. The dangerous state is accidental IPv6. A client can have an IPv6 address while the security team still thinks in IPv4 rules, IPv4 logs and IPv4 discovery. That creates a second path through the environment without a second set of controls.",
    },
    {
      type: "p",
      text: "A practical enterprise migration therefore starts with visibility. Inventory where IPv6 is already enabled. Identify where routers advertise prefixes. Confirm what firewalls inspect. Check whether monitoring and identity systems record IPv6 addresses correctly. Then build dual-stack deliberately.",
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
      text: "That makes the common enterprise question less binary than “SLAAC or DHCPv6.” Decide first whether the organisation needs centrally assigned addresses, host inventory, DNS options, or simple autonomous configuration. Then choose the control flags and tooling that match that requirement.",
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
      text: "Do not treat RA Guard as the whole IPv6 security model. Combine it with switch controls, port security, appropriate IPv6 firewall policy, endpoint controls and monitoring. Also validate the implementation against the current vendor documentation. RA Guard behaviour and command syntax vary by platform.",
    },
    {
      type: "h2",
      id: "firewall",
      text: "Firewall policy must cover both families",
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
      text: "IPv6 does not make DNS optional. Services that should be reachable over IPv6 need appropriate AAAA records. But adding records without testing the application is risky. Some applications still contain IPv4 literals, IPv4-only ACLs or libraries with incorrect address-family assumptions.",
    },
    {
      type: "p",
      text: "Monitoring must also become address-family aware. Search rules, dashboards, allowlists and incident playbooks should accept IPv6 syntax. Store the address in a real IP-aware field rather than a string designed around dotted decimal notation.",
    },
    {
      type: "p",
      text: "The same applies to VPNs, load balancers, EDR, vulnerability scanners and asset inventory. A dual-stack network is only operationally real when the tools around it understand both stacks.",
    },
    {
      type: "h2",
      id: "migration",
      text: "A safer enterprise migration sequence",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not use endpoint disablement as the migration strategy",
      text: "Microsoft states that IPv6 is a mandatory part of modern Windows and does not recommend disabling IPv6 components. If an organisation wants IPv4 preferred, Microsoft documents prefix-policy configuration instead. The safer enterprise control is to decide whether the network advertises and routes IPv6, then secure it when it does.",
    },
    {
      type: "h2",
      id: "decision",
      text: "When dual-stack is the right answer",
    },
    {
      type: "p",
      text: "Dual-stack is not automatically the final architecture. Some environments will eventually use IPv6-only segments with translation mechanisms for IPv4 dependencies. Others will keep both protocols for a long time. The correct decision depends on application support, provider connectivity, security tooling and business dependencies.",
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
        "Every important IPv4 control should trigger an explicit IPv6 review.",
        "Monitoring, DNS, IPAM, VPN and endpoint tools must understand IPv6 before the rollout expands.",
      ],
    },
  ],
  faq: [
    {
      question: "Should an enterprise disable IPv6 until it is ready?",
      answer:
        "Microsoft does not recommend disabling IPv6 components on modern Windows. A better approach is to control whether the network advertises and routes IPv6, and to secure it when enabled.",
    },
    {
      question: "Do all enterprise VLANs need a /64?",
      answer:
        "A /64 is the normal subnet boundary for many IPv6 deployments, but the design should follow standards and the requirements of the hosts and services on that link.",
    },
    {
      question: "Is DHCPv6 required when using SLAAC?",
      answer:
        "No. SLAAC can work without DHCPv6. DHCPv6 can add address assignment or configuration information when the enterprise needs it.",
    },
    {
      question: "Can I block all ICMPv6 at the firewall?",
      answer:
        "No. IPv6 relies on ICMPv6 for functions such as Neighbor Discovery and Path MTU Discovery. Filter unwanted types instead of blocking the protocol wholesale.",
    },
    {
      question: "What should be tested first in an IPv6 pilot?",
      answer:
        "Test routing, DNS, firewall enforcement, ICMPv6, application connectivity, monitoring, VPN access and failure paths. A working ping is not enough.",
    },
  ],
  sources: [
    {
      title: "RFC 8415 — Dynamic Host Configuration Protocol for IPv6",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc8415",
    },
    {
      title: "RFC 6105 — IPv6 Router Advertisement Guard",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc6105",
    },
    {
      title: "RFC 8106 — IPv6 Router Advertisement Options for DNS Configuration",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/rfc8106/",
    },
    {
      title: "RFC 8981 — Temporary Address Extensions for SLAAC",
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
