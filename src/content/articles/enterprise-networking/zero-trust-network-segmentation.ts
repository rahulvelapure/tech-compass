import type { Article } from "../../types";

export const article: Article = {
  slug: "zero-trust-network-segmentation",
  category: "enterprise-networking",
  contentType: "explainer",
  subcategory: "Zero Trust",
  title: "Segmentation under zero trust: what still needs a boundary",
  seoTitle: "Network segmentation under zero trust",
  metaDescription:
    "Zero trust says network location does not imply trust. That does not retire segmentation — it changes its job from access control to containment.",
  standfirst:
    "If location no longer confers trust, it is fair to ask why anyone still segments a network. The answer is that segmentation stopped being the access control and became the blast radius control.",
  excerpt:
    "Zero trust reframes what segmentation is for. Where boundaries still belong, how to choose them, and the design mistakes that make a rule set unmaintainable.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-20",
  lastReviewedAt: "2026-08-20",
  nextReviewAt: "2028-08-20",
  readingMinutes: 5,
  primaryKeyword: "network segmentation best practices",
  secondaryKeywords: ["zero trust segmentation", "flat network risk", "security zones design"],
  tags: ["Networking", "Zero Trust", "Security Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["conditional-access-framework"],
  methodology:
    "Written from NIST SP 800-207 Zero Trust Architecture and the NCCoE practice guide NIST SP 1800-35. Where the article recommends rather than describes, it says so. Vendor implementations differ considerably in this area and none is described here; no client network is referenced.",
  body: [
    {
      type: "p",
      text: "NIST SP 800-207 is unusually blunt about this. Its second tenet states that all communication is secured regardless of network location, and that network location alone does not imply trust — a request from a device sitting inside the legacy perimeter has to meet the same requirements as one arriving from a coffee shop. The abstract goes further, describing zero trust as protecting resources rather than network segments.",
    },
    {
      type: "p",
      text: "Read quickly, that sounds like an argument for giving up on segmentation. It is not. What those statements remove is the *assumption* that being on the inside is evidence of anything. The boundary itself still does useful work — just not the work it used to do.",
    },
    { type: "h2", id: "what-changes", text: "What the boundary is actually for now" },
    {
      type: "p",
      text: "Under a perimeter model, the network boundary was the access control: crossing it was how you were authorised, and everything inside was reachable. Under zero trust the authorisation decision moves to a policy engine that evaluates identity, device state and context per session. Segmentation is left holding three jobs that the policy engine cannot do.",
    },
    {
      type: "ul",
      items: [
        "Containment. If an endpoint is compromised, the boundary determines how much the attacker can reach while their session is still, from the policy engine's perspective, perfectly legitimate.",
        "Reducing exposed surface. A service that is unreachable does not need to be patched at the same urgency as one exposed to every VLAN in the building. Reachability is a risk input, not just a connectivity fact.",
        "Covering what cannot speak identity. Building management controllers, medical devices, lab equipment, older industrial kit and a surprising number of printers cannot participate in per-session authorisation at all. For those, the network boundary is the only control available.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "The third job is the one that decides your design",
      text: "Enterprise estates routinely contain devices that will never authenticate per session. Zero trust guidance does not pretend otherwise — SP 800-207 presents its tenets as an ideal goal and acknowledges that not all of them will be fully implemented for a given strategy. Segmentation is where that gap gets managed.",
    },
    { type: "h2", id: "where-to-draw", text: "Choosing where the boundary goes" },
    {
      type: "p",
      text: "The failure mode is drawing zones around organisational structure, because that information is easy to obtain and feels authoritative. Departments do not describe how traffic flows, and a finance zone containing a web front end, a reporting service and a payroll database gives you one boundary protecting three things with completely different exposure.",
    },
    {
      type: "diagram",
      title: "Zones by consequence rather than by department",
      ascii:
        "  [ User endpoints ]\n          |\n     (identity + device state)\n          v\n  [ Application tier ] ---- [ Management plane ]\n          |                        |\n     (service identity)       (privileged access only)\n          v                        v\n  [ Data tier ]            [ Backup + recovery ]\n\n  [ Unauthenticable devices ] -- isolated, egress-restricted",
      caption:
        "The management plane and the backup path are separated deliberately: both are routinely reached from everywhere, and both are what ransomware goes for.",
    },
    {
      type: "p",
      text: "Ownership is the wrong question to start from. The durable one is what should still be standing if this is compromised, and that produces boundaries around the management plane, around backup and recovery infrastructure, and around whatever holds the data that would make an incident a regulatory event. Those three tend to justify their maintenance cost. Zones drawn around a departmental boundary usually do not.",
    },
    { type: "h2", id: "observe-first", text: "Observe before you enforce" },
    {
      type: "p",
      text: "NIST's own deployment sequence in SP 800-207 works outward from knowledge rather than from enforcement: identify actors, identify assets, identify key processes and evaluate the risks in executing them, and only then formulate policy and deploy with monitoring. The practical version for a network team is to run the intended policy in monitor mode for long enough to cover a full business cycle.",
    },
    {
      type: "p",
      text: "A full cycle matters more than it sounds. Month-end batch runs, quarterly reconciliation, the annual audit export and the disaster-recovery test are all traffic that appears rarely and breaks loudly. Enforcing after two weeks of observation means discovering them in production, at the worst possible moment, and the usual response is an emergency any-any rule that never gets removed.",
    },
    { type: "h2", id: "keep-it-small", text: "Keep the rule set legible" },
    {
      type: "p",
      text: "Segmentation designs are rarely wrong on day one. They fail on maintenance, and the maintenance burden is set by choices made at design time.",
    },
    {
      type: "table",
      caption: "Design choices and their ongoing cost",
      head: ["Choice", "Benefit", "Ongoing cost"],
      rows: [
        [
          "Few coarse zones",
          "Understandable, quick to audit",
          "Wider blast radius within each zone",
        ],
        [
          "Per-application policy",
          "Tight containment",
          "High, and drifts as soon as the application changes",
        ],
        [
          "Identity-based policy",
          "Follows the workload when it moves",
          "Requires reliable identity for services, not just users",
        ],
        [
          "IP-based policy",
          "Works with anything",
          "Breaks on every re-addressing and cloud migration",
        ],
      ],
    },
    {
      type: "p",
      text: "The test worth applying is whether an on-call engineer who did not build the design can determine, at three in the morning, whether a given flow should be permitted. If answering that needs the original architect, the rule set is already unmaintainable — it is simply not failing yet.",
    },
    { type: "h2", id: "mistakes", text: "The mistakes that recur" },
    {
      type: "ol",
      items: [
        "No exception path. Segmentation lives or dies on how exceptions are granted. Where there is no fast, documented route, the fast undocumented route gets used instead, and it is always broader than it needed to be.",
        "Enforcing on incomplete flow data, then loosening under pressure. The end state is worse than never having segmented, because the rule set now looks like a control while functioning as a formality.",
        "Segmenting user traffic first because it is easiest to reason about, while the management plane stays flat. That inverts the priority: administrative reach is what turns a foothold into an estate-wide incident.",
        "Treating the design as finished. A boundary is a live object; every new integration is a request to cross it, and without a review rhythm the map and the reality diverge within a year.",
      ],
    },
    { type: "h2", id: "limits", text: "Where this does not apply" },
    {
      type: "p",
      text: "A single-site organisation with one flat network, a small application estate and no unauthenticable devices will get more security from identity controls and patching than from a zone model that nobody has time to maintain. Segmentation earns its cost when there is something meaningfully worth separating.",
    },
    {
      type: "p",
      text: "It is also worth resisting the idea that there is a reference design to copy. NIST's companion practice guide, SP 1800-35, was built with twenty-four technology collaborators and documents nineteen separate example implementations of a zero trust architecture. That variety is the point: the products differ, and the boundary decisions stay yours.",
    },
    {
      type: "p",
      text: "The other limit is timing. SP 800-207 devotes a section to hybrid zero trust and perimeter-based architecture precisely because the transition is long and enterprises commonly operate both models at once for years. Designs that assume a clean end state tend to strand the least tractable part of the estate — the oldest equipment, with the least documentation — outside any coherent model at all.",
    },
    {
      type: "p",
      text: "None of this replaces the identity half of the problem. Segmentation decides what is reachable; a policy engine decides who may use it, and for user access that decision is expressed through something like a [Conditional Access policy framework](/microsoft-365-entra-id/conditional-access-framework). A zone model without a coherent identity model is a perimeter with more walls.",
    },
  ],
  faq: [
    {
      question: "Does zero trust mean network segmentation is obsolete?",
      answer:
        "No. It means network location is no longer evidence of trust. Segmentation stops being the access control and becomes a containment control, and it remains the only available control for devices that cannot participate in per-session authorisation.",
    },
    {
      question: "How many zones should an enterprise have?",
      answer:
        "Fewer than most designs propose. The number that works is the number your team can reason about and audit without consulting the person who built it. Start with the boundaries that clearly justify themselves — management plane, backup and recovery, regulated data — and add only where an incident scenario argues for it.",
    },
    {
      question: "How long should policy run in monitor mode before enforcement?",
      answer:
        "Long enough to observe a complete business cycle rather than a fixed number of weeks. The traffic that breaks enforcement is usually periodic: month-end processing, quarterly reporting, audit exports and DR tests. If those have not appeared in your flow data yet, you have not finished observing.",
    },
    {
      question: "Should segmentation be based on IP addresses or identity?",
      answer:
        "Identity-based policy survives change far better, because it follows the workload rather than the address. It depends on having reliable identity for services and not only for users, which many estates do not yet have. Where that is missing, address-based rules are a legitimate interim position, provided the re-addressing cost is understood and someone owns it.",
    },
  ],
  sources: [
    {
      title: "NIST SP 800-207: Zero Trust Architecture",
      publisher: "NIST",
      url: "https://csrc.nist.gov/pubs/sp/800/207/final",
    },
    {
      title: "NIST SP 1800-35: Implementing a Zero Trust Architecture",
      publisher: "NIST NCCoE",
      url: "https://csrc.nist.gov/pubs/sp/1800/35/final",
    },
  ],
};
