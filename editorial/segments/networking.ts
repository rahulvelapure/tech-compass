import type { Segment } from "../types";

/**
 * Networking backlog.
 *
 * Researched against IETF RFCs, IEEE 802.11 working-group status and vendor
 * primary documentation in August 2026.
 *
 * Strategic role: this is the site's **lowest-volatility subject and its most
 * durable internal-link target**. Protocol fundamentals do not churn, so these
 * articles cost almost nothing to maintain while cybersecurity, Windows, cloud
 * and Intune all reference concepts that currently do not exist. That is why
 * networking was sequenced ahead of higher-priority subjects.
 *
 * Currency findings:
 *
 * 1. IEEE Std 802.11be-2024 (Wi-Fi 7) was published on 2025-07-22, defining a
 *    maximum throughput of at least 30 Gbit/s with backward compatibility.
 * 2. Wi-Fi 8 (IEEE 802.11bn, "Ultra High Reliability") is NOT ratified. Task
 *    Group bn had resolved roughly 75% of comments on draft D1.0 and expected
 *    to ballot D2.0 in July 2026, with a study group for the generation after
 *    forming around the same time. Any Wi-Fi 8 article must say "draft", not
 *    "released" — this is where consumer coverage routinely goes wrong.
 * 3. Post-quantum TLS is now a transport problem, not only a cryptography one.
 *    The hybrid X25519MLKEM768 key agreement carries a 1216-byte client share
 *    (1184 for ML-KEM-768 plus 32 for X25519), which typically splits the
 *    ClientHello across two packets. TLS 1.3 permits this, but middleboxes that
 *    assumed a single-packet ClientHello break on it. That failure mode belongs
 *    to networking, not to the cryptography topics in cybersecurity.
 * 4. Encrypted DNS transports are settled and citable: DoT is RFC 7858 (2016),
 *    DoH is RFC 8484 (2018), DoQ is RFC 9250 (2022). DoQ removes TCP
 *    head-of-line blocking while keeping DoT-like privacy.
 *
 * PILLAR STRUCTURE — validated, and several candidates were rejected:
 *
 * - "Network security" is not a pillar here. Cybersecurity owns security
 *   architecture, threat models and controls; networking owns the mechanism of
 *   a protocol such as WPA3 or a TLS transport. Splitting it any other way
 *   produces two articles competing for one intent.
 * - "SD-WAN", "SASE" and "enterprise networking" belong to
 *   `enterprise-networking` by the agreed boundary: corporate architecture
 *   there, protocols and standards here.
 * - "Cloud networking" belongs to `cloud`.
 * - "Network automation" splits between `devops` (infrastructure as code) and
 *   `it-automation` (operational scripting); it is not a networking pillar.
 * - "Network monitoring" and "network troubleshooting" are one pillar, not two.
 *   Monitoring exists to answer diagnostic questions.
 */
export const segment: Segment = {
  name: "Networking",
  category: "networking",
  topics: [
    /* ---------------- Hub and cluster pillars ---------------- */
    {
      id: "net-01",
      title: "How a packet actually crosses a network",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "how does a network packet travel",
      secondaryKeywords: ["tcp ip stack explained", "osi model in practice"],
      requiredSources: [
        "https://datatracker.ietf.org/doc/html/rfc1122",
        "https://datatracker.ietf.org/doc/html/rfc791",
      ],
      updateClass: "evergreen",
      pillar: "Networking",
      plannedSlug: "how-a-packet-crosses-a-network",
      plannedInternalLinks: [
        "ethernet-and-switching",
        "ip-addressing-and-routing",
        "dns-and-core-network-services",
        "transport-protocols-explained",
      ],
      diagramOpportunity:
        "One packet followed end to end: application, transport segmentation, IP encapsulation, MAC rewriting at each hop, and what changes versus what survives the journey.",
      notes:
        "Subject hub and the single most reusable article on the site. Deliberately traces one packet rather than reciting the OSI model — the layers are memorable only once you have watched something move through them.",
    },
    {
      id: "net-02",
      title: "Ethernet and switching",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "how ethernet switching works",
      requiredSources: ["https://standards.ieee.org/ieee/802.3/"],
      updateClass: "evergreen",
      pillar: "Switching",
      plannedSlug: "ethernet-and-switching",
      pillarSlug: "how-a-packet-crosses-a-network",
      diagramOpportunity:
        "Switch MAC learning: flood, learn, forward — three frames showing the table filling.",
    },
    {
      id: "net-03",
      title: "IP addressing and routing",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "ip addressing and routing explained",
      requiredSources: [
        "https://datatracker.ietf.org/doc/html/rfc4632",
        "https://datatracker.ietf.org/doc/html/rfc8200",
      ],
      updateClass: "evergreen",
      pillar: "Addressing and routing",
      plannedSlug: "ip-addressing-and-routing",
      pillarSlug: "how-a-packet-crosses-a-network",
      diagramOpportunity:
        "Routing decision: destination against routing table, longest-prefix match, next hop selection.",
    },
    {
      id: "net-04",
      title: "DNS and the core network services",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "dns and dhcp explained",
      requiredSources: [
        "https://datatracker.ietf.org/doc/html/rfc1034",
        "https://datatracker.ietf.org/doc/html/rfc2131",
      ],
      updateClass: "evergreen",
      pillar: "Core network services",
      plannedSlug: "dns-and-core-network-services",
      pillarSlug: "how-a-packet-crosses-a-network",
      diagramOpportunity:
        "The two services a device cannot work without: DHCP lease then DNS resolution, in the order they actually happen at boot.",
    },
    {
      id: "net-05",
      title: "Transport protocols and secure channels",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "tcp udp quic transport comparison",
      requiredSources: [
        "https://datatracker.ietf.org/doc/html/rfc9293",
        "https://datatracker.ietf.org/doc/html/rfc9000",
      ],
      updateClass: "annual",
      pillar: "Transport",
      plannedSlug: "transport-protocols-explained",
      pillarSlug: "how-a-packet-crosses-a-network",
      plannedInternalLinks: ["how-a-packet-crosses-a-network"],
      diagramOpportunity:
        "TCP, UDP and QUIC side by side: what each guarantees, what it costs, and where the handshake sits.",
    },
    {
      id: "net-06",
      title: "Wi-Fi standards and how wireless actually behaves",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "wifi standards explained",
      requiredSources: [
        "https://standards.ieee.org/ieee/802.11be/7516/",
        "https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7",
      ],
      updateClass: "annual",
      pillar: "Wireless",
      plannedSlug: "wifi-standards-explained",
      pillarSlug: "how-a-packet-crosses-a-network",
      diagramOpportunity:
        "Generation timeline with the band, channel width and modulation each added — and the shared-medium reality that caps every one of them.",
      notes:
        "Verified August 2026: IEEE Std 802.11be-2024 (Wi-Fi 7) published 2025-07-22, specifying at least 30 Gbit/s maximum throughput. Must be honest that headline rates are aggregate and theoretical.",
    },
    {
      id: "net-07",
      title: "Network diagnostics: a method that finds the cause",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "network troubleshooting methodology",
      updateClass: "evergreen",
      pillar: "Diagnostics and performance",
      plannedSlug: "network-diagnostics-method",
      pillarSlug: "how-a-packet-crosses-a-network",
      diagramOpportunity:
        "Layered diagnostic order with the cheapest decisive test at each layer, and the point where the fault stops being yours.",
    },

    /* ---------------- Switching ---------------- */
    {
      id: "net-10",
      title: "MAC addresses and how a switch learns",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "mac address table switch learning",
      updateClass: "evergreen",
      pillarSlug: "ethernet-and-switching",
      relatedTopics: ["net-02"],
    },
    {
      id: "net-11",
      title: "VLANs and trunking",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "vlan trunking explained",
      requiredSources: ["https://standards.ieee.org/ieee/802.1Q/"],
      updateClass: "evergreen",
      pillarSlug: "ethernet-and-switching",
      diagramOpportunity: "Tagged versus untagged frames across an access port and a trunk.",
      notes:
        "Boundary: enterprise-networking owns segmentation *architecture*; this is the 802.1Q mechanism.",
    },
    {
      id: "net-12",
      title: "Spanning Tree: why it exists and when it causes the outage",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "spanning tree protocol explained",
      updateClass: "evergreen",
      pillarSlug: "ethernet-and-switching",
      relatedTopics: ["net-11"],
    },
    {
      id: "net-13",
      title: "MTU, fragmentation and path MTU discovery",
      category: "networking",
      contentType: "troubleshooting",
      searchIntent: "failure-mode",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "mtu path mtu discovery problems",
      requiredSources: ["https://datatracker.ietf.org/doc/html/rfc1191"],
      updateClass: "evergreen",
      pillarSlug: "ethernet-and-switching",
      relatedTopics: ["net-22"],
      diagramOpportunity:
        "A packet too large for the next link, with and without the ICMP message that should have fixed it.",
      notes:
        "High-value: MTU problems present as 'some sites load and some hang', which almost nobody diagnoses correctly first time. Pairs with net-22 because blocking ICMP is the usual cause.",
    },

    /* ---------------- Addressing and routing ---------------- */
    {
      id: "net-20",
      title: "Subnetting and CIDR without the arithmetic panic",
      category: "networking",
      contentType: "reference",
      searchIntent: "how-to",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "subnetting cidr explained",
      requiredSources: ["https://datatracker.ietf.org/doc/html/rfc4632"],
      updateClass: "evergreen",
      pillarSlug: "ip-addressing-and-routing",
      diagramOpportunity: "Prefix length against usable hosts and the boundary each mask lands on.",
    },
    {
      id: "net-21",
      title: "ARP and neighbour discovery",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "arp neighbour discovery explained",
      updateClass: "evergreen",
      pillarSlug: "ip-addressing-and-routing",
      relatedTopics: ["net-10"],
      notes: "The layer 2 to layer 3 join. Covers IPv6 NDP alongside ARP rather than separately.",
    },
    {
      id: "net-22",
      title: "ICMP: what it does beyond ping, and why blocking it breaks things",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "icmp blocking breaks network",
      requiredSources: ["https://datatracker.ietf.org/doc/html/rfc4890"],
      updateClass: "evergreen",
      pillarSlug: "ip-addressing-and-routing",
      relatedTopics: ["net-13"],
      notes:
        "Cross-domain: cybersecurity reflexively blocks ICMP; this explains the operational cost. Genuine two-subject value.",
    },
    {
      id: "net-23",
      title: "NAT: what it solved and what it broke",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "nat explained problems",
      updateClass: "evergreen",
      pillarSlug: "ip-addressing-and-routing",
      relatedTopics: ["net-24"],
    },
    {
      id: "net-24",
      title: "IPv6 addressing, and why adoption is still partial",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "ipv6 addressing explained",
      requiredSources: ["https://datatracker.ietf.org/doc/html/rfc8200"],
      updateClass: "annual",
      pillarSlug: "ip-addressing-and-routing",
      diagramOpportunity:
        "IPv6 address anatomy with the scopes and prefixes that matter in practice.",
    },
    {
      id: "net-25",
      title: "Dual-stack or IPv6-only: choosing a transition",
      category: "networking",
      contentType: "decision-framework",
      searchIntent: "decision",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "dual stack vs ipv6 only",
      updateClass: "annual",
      pillarSlug: "ip-addressing-and-routing",
      relatedTopics: ["net-24"],
    },
    {
      id: "net-26",
      title: "How a router chooses: longest prefix match and metrics",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "longest prefix match routing decision",
      updateClass: "evergreen",
      pillarSlug: "ip-addressing-and-routing",
      relatedTopics: ["net-03"],
    },
    {
      id: "net-27",
      title: "BGP fundamentals: how the internet agrees on a path",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "bgp fundamentals explained",
      requiredSources: ["https://datatracker.ietf.org/doc/html/rfc4271"],
      updateClass: "evergreen",
      pillarSlug: "ip-addressing-and-routing",
      notes:
        "Scope: how BGP works and why route leaks cause outages. Running BGP in a corporate WAN is enterprise-networking.",
    },

    /* ---------------- Core network services ---------------- */
    {
      id: "net-30",
      title: "DNS resolution end to end",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "dns resolution process explained",
      requiredSources: [
        "https://datatracker.ietf.org/doc/html/rfc1034",
        "https://datatracker.ietf.org/doc/html/rfc1035",
      ],
      updateClass: "evergreen",
      pillarSlug: "dns-and-core-network-services",
      diagramOpportunity:
        "Stub resolver to recursive to root to TLD to authoritative, with what is cached at each step.",
      notes:
        "Distinct from win-51, which is the Windows client resolution order (mDNS, LLMNR, hosts). This is the protocol.",
    },
    {
      id: "net-31",
      title: "DNS record types and what each one is actually for",
      category: "networking",
      contentType: "reference",
      searchIntent: "question",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "dns record types reference",
      updateClass: "evergreen",
      pillarSlug: "dns-and-core-network-services",
      relatedTopics: ["net-30"],
      notes:
        "Cross-domain: sec-100 owns SPF/DKIM/DMARC semantics; this covers the record mechanics.",
    },
    {
      id: "net-32",
      title: "Encrypted DNS compared: DoT, DoH and DoQ",
      category: "networking",
      contentType: "comparison",
      searchIntent: "decision",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "dns over https vs dns over tls",
      requiredSources: [
        "https://datatracker.ietf.org/doc/html/rfc7858",
        "https://datatracker.ietf.org/doc/html/rfc8484",
        "https://datatracker.ietf.org/doc/rfc9250/",
      ],
      updateClass: "annual",
      pillarSlug: "dns-and-core-network-services",
      relatedTopics: ["net-30"],
      diagramOpportunity:
        "The three transports against who can see the query — client, network, resolver — and what each choice costs an enterprise that inspects DNS.",
      notes:
        "Verified August 2026: DoT RFC 7858 (2016), DoH RFC 8484 (2018), DoQ RFC 9250 (2022). DoQ has DoT-like privacy without TCP head-of-line blocking. The real editorial value is the tension between user privacy and enterprise DNS-based control.",
    },
    {
      id: "net-33",
      title: "DHCP: the exchange, the lease, and where it fails",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "dhcp process lease explained",
      requiredSources: ["https://datatracker.ietf.org/doc/html/rfc2131"],
      updateClass: "evergreen",
      pillarSlug: "dns-and-core-network-services",
      diagramOpportunity: "Discover, Offer, Request, Acknowledge — and where a relay changes it.",
    },
    {
      id: "net-34",
      title: "DNS caching, TTL and why a change has not taken effect",
      category: "networking",
      contentType: "troubleshooting",
      searchIntent: "failure-mode",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "dns ttl change not propagating",
      updateClass: "evergreen",
      pillarSlug: "dns-and-core-network-services",
      relatedTopics: ["net-30"],
    },

    /* ---------------- Transport and secure channels ---------------- */
    {
      id: "net-40",
      title: "TCP: handshake, windows and retransmission",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "tcp handshake window retransmission",
      requiredSources: ["https://datatracker.ietf.org/doc/html/rfc9293"],
      updateClass: "evergreen",
      pillarSlug: "transport-protocols-explained",
      diagramOpportunity: "Handshake, window scaling under load, and a retransmission after loss.",
    },
    {
      id: "net-41",
      title: "UDP and when losing packets is the right trade",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P2",
      status: "IDEA",
      targetKeyword: "udp when to use",
      updateClass: "evergreen",
      pillarSlug: "transport-protocols-explained",
      relatedTopics: ["net-40"],
    },
    {
      id: "net-43",
      title: "QUIC and HTTP/3: what moved into user space",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "RESEARCHED",
      targetKeyword: "quic http3 explained",
      requiredSources: [
        "https://datatracker.ietf.org/doc/html/rfc9000",
        "https://datatracker.ietf.org/doc/html/rfc9114",
      ],
      updateClass: "annual",
      pillarSlug: "transport-protocols-explained",
      relatedTopics: ["net-40"],
      diagramOpportunity: "Head-of-line blocking in TCP versus per-stream independence in QUIC.",
      notes: "Cross-domain: enterprise-networking cares because QUIC is opaque to inspection.",
    },
    {
      id: "net-44",
      title: "Post-quantum TLS on the wire: why the ClientHello now spans two packets",
      category: "networking",
      contentType: "troubleshooting",
      searchIntent: "failure-mode",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "clienthello two packets post quantum",
      requiredSources: [
        "https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/",
        "https://developers.cloudflare.com/ssl/post-quantum-cryptography/pqc-to-origin/",
      ],
      updateClass: "volatile",
      pillarSlug: "transport-protocols-explained",
      relatedTopics: ["net-13"],
      diagramOpportunity:
        "A classical ClientHello in one packet beside a hybrid one split across two, with the middlebox that drops the second.",
      notes:
        "Verified August 2026: hybrid X25519MLKEM768 carries a 1216-byte client share — 1184 bytes ML-KEM-768 plus 32 bytes X25519 — which typically splits the ClientHello across two packets. TLS 1.3 allows it; middleboxes assuming a single-packet ClientHello do not. DUPLICATE CHECK: sec-51 owns the TLS handshake and certificate chain, sec-52 owns post-quantum migration strategy. This owns the transport-layer failure — 'connections started failing after we enabled PQC' — which is a different reader with a different question.",
    },
    {
      id: "net-45",
      title: "VPN protocols compared: IPsec, WireGuard and TLS-based tunnels",
      category: "networking",
      contentType: "comparison",
      searchIntent: "decision",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "ipsec vs wireguard vpn protocol",
      updateClass: "annual",
      pillarSlug: "transport-protocols-explained",
      diagramOpportunity: "Where each protocol encapsulates, and what that costs in MTU.",
      notes:
        "Boundary: remote-access architecture and ZTNA belong to enterprise-networking. This is the protocol comparison.",
    },
    {
      id: "net-46",
      title: "Load balancing: layer 4 against layer 7",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "layer 4 vs layer 7 load balancing",
      updateClass: "evergreen",
      pillarSlug: "transport-protocols-explained",
      notes: "Cross-domain: cloud and devops both consume this; neither should re-explain it.",
    },
    {
      id: "net-47",
      title: "Proxies: forward, reverse and transparent",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P2",
      status: "IDEA",
      targetKeyword: "forward vs reverse proxy",
      updateClass: "evergreen",
      pillarSlug: "transport-protocols-explained",
      relatedTopics: ["net-46"],
    },

    /* ---------------- Wireless ---------------- */
    {
      id: "net-50",
      title: "Wi-Fi 6 vs Wi-Fi 7: what actually changes, and when to upgrade",
      category: "networking",
      contentType: "comparison",
      searchIntent: "comparison",
      priority: "P0",
      status: "PUBLISHED",
      targetKeyword: "wifi 6 vs wifi 7",
      requiredSources: [
        "https://standards.ieee.org/ieee/802.11be/7516/",
        "https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7",
      ],
      updateClass: "annual",
      pillarSlug: "wifi-standards-explained",
      articleSlug: "wifi-6-vs-wifi-7",
      relatedTopics: ["net-06", "net-51"],
      notes:
        "Existing 328-word draft, the strongest of the stubs, and networking is the right owner. Rewrite with the ratified position: 802.11be-2024 published 2025-07-22. Must resist the marketing framing — the honest answer for most readers is that the client fleet and the spectrum decide, not the access point.",
    },
    {
      id: "net-51",
      title: "Wi-Fi channels, bands and what 6 GHz changed",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "wifi channels bands 6ghz",
      updateClass: "annual",
      pillarSlug: "wifi-standards-explained",
      relatedTopics: ["net-06"],
      diagramOpportunity:
        "Channel width against non-overlapping channels available in each band — the trade nobody makes deliberately.",
    },
    {
      id: "net-52",
      title: "WPA3 and wireless authentication",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "wpa3 wireless authentication explained",
      updateClass: "annual",
      pillarSlug: "wifi-standards-explained",
      relatedTopics: ["net-71"],
      notes:
        "Cross-domain: intune-112 owns certificate Wi-Fi profile deployment; this is the protocol and its transition modes.",
    },
    {
      id: "net-53",
      title: "Wi-Fi roaming: why the client decides and how that goes wrong",
      category: "networking",
      contentType: "troubleshooting",
      searchIntent: "failure-mode",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "wifi roaming sticky client",
      updateClass: "evergreen",
      pillarSlug: "wifi-standards-explained",
      relatedTopics: ["net-51"],
      notes:
        "The sticky-client problem. Enterprise WLAN design is enterprise-networking; this is the client behaviour underneath it.",
    },
    {
      id: "net-54",
      title: "Wi-Fi 8 and 802.11bn: what is actually specified so far",
      category: "networking",
      contentType: "analysis",
      searchIntent: "question",
      priority: "P2",
      status: "RESEARCHED",
      targetKeyword: "wifi 8 802.11bn status",
      requiredSources: ["https://grouper.ieee.org/groups/802/11/"],
      updateClass: "volatile",
      pillarSlug: "wifi-standards-explained",
      relatedTopics: ["net-06"],
      notes:
        "Verified August 2026: 802.11bn (Ultra High Reliability) is NOT ratified. TGbn had resolved roughly 75% of D1.0 comments and expected to ballot D2.0 in July 2026. The article's job is to separate what is specified from what is being marketed — most consumer coverage does not. Recheck every review; this changes fast.",
    },

    /* ---------------- Diagnostics and performance ---------------- */
    {
      id: "net-60",
      title: "Packet capture: reading what is actually on the wire",
      category: "networking",
      contentType: "how-to",
      searchIntent: "how-to",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "packet capture analysis wireshark",
      updateClass: "evergreen",
      pillarSlug: "network-diagnostics-method",
      relatedTopics: ["net-07"],
    },
    {
      id: "net-61",
      title: "Latency, jitter, loss and throughput: which one is your problem",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "latency jitter packet loss throughput",
      updateClass: "evergreen",
      pillarSlug: "network-diagnostics-method",
      diagramOpportunity:
        "The same application failing for four different reasons, and the measurement that distinguishes them.",
      notes: "The article that stops 'the network is slow' being an unanswerable ticket.",
    },
    {
      id: "net-62",
      title: "Diagnosing bandwidth against latency-bound performance",
      category: "networking",
      contentType: "troubleshooting",
      searchIntent: "failure-mode",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "bandwidth vs latency bound application",
      updateClass: "evergreen",
      pillarSlug: "network-diagnostics-method",
      relatedTopics: ["net-61", "net-40"],
      notes:
        "Why adding bandwidth often changes nothing — bandwidth-delay product, made practical.",
    },
    {
      id: "net-63",
      title: "QoS: what marking traffic can and cannot achieve",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P2",
      status: "IDEA",
      targetKeyword: "qos marking explained",
      updateClass: "evergreen",
      pillarSlug: "network-diagnostics-method",
      notes: "Honest framing: QoS allocates contention, it does not create capacity.",
    },

    /* ---------------- Access and small networks ---------------- */
    {
      id: "net-70",
      title: "Designing a small business network",
      category: "networking",
      contentType: "decision-framework",
      searchIntent: "decision",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "small business network design",
      updateClass: "annual",
      pillarSlug: "how-a-packet-crosses-a-network",
      relatedTopics: ["net-11", "net-51"],
      notes:
        "The SMB half of the networking remit. Enterprise campus design stays in enterprise-networking.",
    },
    {
      id: "net-71",
      title: "802.1X and RADIUS: how port-based authentication works",
      category: "networking",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "802.1x radius port authentication",
      requiredSources: ["https://standards.ieee.org/ieee/802.1X/"],
      updateClass: "evergreen",
      pillarSlug: "how-a-packet-crosses-a-network",
      relatedTopics: ["net-52"],
      diagramOpportunity: "Supplicant, authenticator and authentication server, with EAP inside.",
      notes:
        "Boundary: NAC deployment at scale is enterprise-networking. This is the protocol it runs on.",
    },
  ],
};
