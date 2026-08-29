import type { Article } from "../../types";

export const article: Article = {
  slug: "enterprise-dns-security-doh-dot-filtering",
  category: "enterprise-networking",
  contentType: "explainer",
  subcategory: "Transport security",
  title: "Encrypted DNS fixed a privacy problem and broke your visibility",
  seoTitle: "Enterprise DNS security: DoH, DoT and filtering explained",
  metaDescription:
    "DNS filtering blocks threats before a connection exists. Encrypted DNS routes around it. How DoH and DoT change the picture, and the three ways to respond.",
  standfirst:
    "Every connection starts with a name lookup. That makes DNS the cheapest place to stop something, and the easiest place to lose sight of it.",
  excerpt:
    "DNS filtering catches threats before a connection is made. Then browsers started encrypting queries and sending them elsewhere. What DoH and DoT actually change, and how to keep control without breaking privacy.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "enterprise DNS security",
  secondaryKeywords: [
    "DNS over HTTPS enterprise",
    "DoH vs DoT",
    "DNS filtering",
    "DNS exfiltration",
    "block DNS over HTTPS",
  ],
  tags: ["Networking", "Security", "DNS", "Zero Trust", "Enterprise IT"],
  reviewStatus: "research-based",
  relatedSlugs: ["zero-trust-network-segmentation", "passkeys-enterprise-deployment-reality"],
  methodology:
    "Written from RFC 7858 (DNS over TLS), RFC 8484 (DNS over HTTPS), RFC 1035 and vendor documentation for enterprise resolver and filtering products, verified August 2026. Protocol details and port numbers are quoted from the RFCs. Domain lifespans, log retention periods and detection rates are not quoted as fact: they vary by source and threat type, and the ones in the source draft could not be attributed.",
  body: [
    {
      type: "p",
      text: "Almost everything a device does starts with a name lookup. A web page, an update check, a call to an API. Before any of it, something asks where to find a name.",
    },
    {
      type: "p",
      text: "That makes DNS the earliest point at which you can stop something. No connection has been made yet, no file fetched, nothing typed into a login form.",
    },
    {
      type: "p",
      text: "It also makes DNS a good place to hide. And in the last few years, the traffic that made this control possible has quietly started going somewhere else.",
    },
    { type: "h2", id: "why", text: "Three ways DNS is used against you" },
    {
      type: "p",
      text: "The protocol is old, and it was designed for a network where nobody was hostile. It carries queries in the clear and does not authenticate who is answering.",
    },
    {
      type: "p",
      text: "**As a route to a fake site.** A resolver answers whatever it is asked about. Names that look almost right resolve just as happily as real ones. Without a check against known-bad domains, nothing between the user and the phishing page objects.",
    },
    {
      type: "p",
      text: "**As a channel out.** Data can be encoded into the names being queried. Each query is tiny, outbound DNS is usually permitted without inspection, and a slow trickle looks nothing like a file transfer. It is not fast, and it does not need to be.",
    },
    {
      type: "p",
      text: "**As a gap in the record.** Firewall logs show a connection to an address. Without DNS logs, joining that address back to the name someone asked for is guesswork, and that join is often the first useful step in an investigation.",
    },
    { type: "h2", id: "filtering", text: "Filtering is the control that pays for itself" },
    {
      type: "p",
      text: "The mechanism is simple. Every query passes through a resolver you run, that resolver checks the name against threat intelligence, and bad answers are never returned.",
    },
    {
      type: "p",
      text: "It is cheap because it happens before anything else. Blocking at the name means no connection, no payload and no credential prompt.",
    },
    {
      type: "table",
      caption: "What a filtering policy usually distinguishes between",
      head: ["Category", "Typical handling"],
      rows: [
        ["Known command and control", "Block"],
        ["Known phishing", "Block"],
        ["Very recently registered domains", "Block or flag for review"],
        ["Content categories set by policy", "Block or warn"],
        ["Unsanctioned software as a service", "Log, and review who is using it"],
      ],
    },
    {
      type: "p",
      text: "That third row does more work than people expect. Malicious domains tend to be used quickly after registration and abandoned, so age alone is a useful signal even when a name has no reputation yet.",
    },
    {
      type: "p",
      text: "It is worth being equally clear about what filtering misses. Anything hosted on a legitimate domain that has been compromised. Anything connecting to a hard-coded address without a lookup. And any query that never reaches your resolver at all.",
    },
    {
      type: "p",
      text: "That last one used to be rare.",
    },
    { type: "h2", id: "encrypted", text: "What DoH and DoT actually changed" },
    {
      type: "p",
      text: "Both encrypt queries in transit, and both are genuine improvements for privacy. They differ in a way that matters operationally.",
    },
    {
      type: "table",
      caption: "The same goal, two very different network profiles",
      head: ["", "DNS over TLS", "DNS over HTTPS"],
      rows: [
        ["Specified in", "RFC 7858", "RFC 8484"],
        ["Port", "853, its own", "443, shared with all web traffic"],
        ["Looks like", "Identifiably DNS", "Ordinary HTTPS"],
        ["Can you block it selectively?", "Yes, by port", "Not reliably"],
      ],
    },
    {
      type: "p",
      text: "That last row is the whole problem. DoT announces itself by using its own port, so a firewall rule can push it back to your resolver. DoH is indistinguishable from any other web request.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "This is on by default, not opt-in",
      text: "Browsers and operating systems now enable encrypted DNS on their own, often pointing at a public resolver. If nobody has managed that setting, queries are already bypassing your resolver — and because nothing breaks, there is no signal that your filtering policy has stopped applying to part of the estate.",
    },
    {
      type: "callout",
      variant: "note",
      title: "DNSSEC is a different thing",
      text: "DNSSEC proves an answer has not been tampered with. It does not hide the query from anyone watching. DoH and DoT hide the query but say nothing about whether the answer is genuine. They solve different problems and neither replaces the other.",
    },
    { type: "h2", id: "responses", text: "Three responses, and the one that works" },
    {
      type: "p",
      text: "**Block it outbound.** Refuse port 853, and block the well-known public resolver addresses. This is easy and partial. Blocking a port handles DoT properly; blocking addresses handles the DoH endpoints you happen to know about, and anyone can stand up another one.",
    },
    {
      type: "p",
      text: "**Run encrypted DNS yourself.** Offer DoH from your own resolver, applying the same filtering. Clients get encryption in transit, you keep the policy and the logs. This is the part most organisations skip, and it is the part that resolves the tension rather than fighting it.",
    },
    {
      type: "p",
      text: "**Manage the endpoint.** Use your device management to set which resolver browsers and operating systems use, rather than leaving it to their defaults. Both major browsers and current Windows expose this as managed policy.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The second and third together",
      text: "Run your own encrypted resolver so encryption is not something users have to route around, and manage endpoints so devices point at it. Keep the outbound blocks as a backstop for what you missed. Doing only the blocking turns your security team into an obstacle, and users are good at getting around obstacles.",
    },
    { type: "h2", id: "practical", text: "What to put in place" },
    {
      type: "ol",
      items: [
        "**Centralise resolution.** Every internal device uses your resolver. Set it through DHCP, and set it statically on servers that ignore DHCP.",
        "**Log queries and keep them.** Name, answer, client and timestamp. This is the data that makes an investigation possible, and it is worthless if it starts on the day of the incident. Pick a retention period deliberately, against your own investigation and compliance needs.",
        "**Start filtering in monitor mode.** Run it without blocking first so you can see what would have broken. Turning on enforcement blind produces an outage that discredits the control.",
        "**Handle encrypted DNS explicitly.** Your own DoH endpoint, endpoint policy pointing at it, outbound blocks as a net.",
        "**Alert on shape, not just reputation.** Long unusual subdomains, high query volume to one name, and sudden interest in newly registered domains are all visible without knowing the name is bad.",
        "**Test that it works.** Put a harmless domain of your own on the blocklist and try to reach it from a normal device. If it resolves, you have found a gap before an attacker did.",
      ],
    },
    { type: "h2", id: "fit", text: "Where this sits" },
    {
      type: "p",
      text: "DNS filtering is not a replacement for a web proxy, an endpoint agent, or email filtering. It is the earliest and cheapest layer, and it fails in different ways than they do — which is precisely why it is worth having alongside them.",
    },
    {
      type: "p",
      text: "It pairs particularly well with controls that make a successful phishing page useless. Filtering tries to stop the user reaching the page at all; [phishing-resistant authentication](/cybersecurity-ciso/passkeys-enterprise-deployment-reality) means that if they do, there is nothing worth stealing at the other end.",
    },
    {
      type: "p",
      text: "It is also a segmentation control in disguise. Deciding what a device may resolve is deciding what it can reach, which is the same reasoning as [segmenting a network](/enterprise-networking/zero-trust-network-segmentation) applied one layer earlier.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Assume encrypted DNS is already on somewhere in your estate. Check rather than assume.",
        "Run your own encrypted resolver instead of only blocking other people's.",
        "Manage the setting through device policy. Defaults will not stay where you left them.",
        "Log queries before you need them, and decide retention on purpose.",
        "Test the blocklist from a real device. An untested control is an assumption.",
      ],
    },
    {
      type: "p",
      text: "The awkward part of this subject is that encrypted DNS is genuinely good. It closes a real privacy gap, and arguing against it puts security teams on the wrong side of an obviously reasonable change. The workable position is not to resist the encryption but to be the one providing it — so that queries are private from everyone except the organisation that is accountable for what those devices reach.",
    },
  ],
  faq: [
    {
      question: "What is the difference between DoH and DoT?",
      answer:
        "Both encrypt DNS queries. DoT uses its own port, so you can spot it. DoH rides on normal web traffic, so you mostly cannot.",
    },
    {
      question: "Can I just block DNS over HTTPS?",
      answer:
        "Not fully. You can block the well-known public resolvers, but any web server can offer DoH. Better to run your own and point devices at it.",
    },
    {
      question: "Does encrypted DNS stop my filtering from working?",
      answer:
        "It does if the queries go somewhere else. Nothing breaks, so you get no warning. That is what makes it worth checking rather than assuming.",
    },
    {
      question: "Is DNSSEC the same as encrypted DNS?",
      answer:
        "No. DNSSEC checks the answer has not been altered. Encrypted DNS hides the question. You can have either, both, or neither.",
    },
    {
      question: "How would data leave over DNS?",
      answer:
        "By hiding it in the names being looked up. Each query is tiny and outbound DNS is rarely inspected. It is slow, and it does not need to be fast.",
    },
  ],
  sources: [
    {
      title: "RFC 7858: Specification for DNS over Transport Layer Security (TLS)",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc7858",
    },
    {
      title: "RFC 8484: DNS Queries over HTTPS (DoH)",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc8484",
    },
    {
      title: "RFC 1035: Domain Names — Implementation and Specification",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc1035",
    },
    {
      title: "RFC 9364: DNS Security Extensions (DNSSEC)",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc9364",
    },
    {
      title: "Configure DNS over HTTPS clients on Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows-server/networking/dns/doh-client-support",
    },
  ],
};
