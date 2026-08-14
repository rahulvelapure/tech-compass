import type { Category } from "./types";

/**
 * The seven enterprise pillars are FROZEN. Their slugs must not change.
 * Broader technology categories are added around them.
 */
export const categories: Category[] = [
  // ---------- Frozen enterprise pillars ----------
  {
    slug: "microsoft-intune",
    title: "Microsoft Intune",
    label: "Microsoft Intune",
    group: "enterprise",
    intro:
      "Endpoint management as it behaves in production: Autopilot provisioning, policy conflicts, compliance, app delivery and the failure modes that documentation tends to skip.",
    description:
      "Practical Microsoft Intune guidance: Autopilot and ESP troubleshooting, policy conflicts, compliance and endpoint management at scale.",
    subcategories: ["Autopilot", "Configuration policy", "App delivery", "Compliance"],
    related: ["microsoft-365-entra-id", "it-automation", "cybersecurity-ciso"],
  },
  {
    slug: "microsoft-365-entra-id",
    title: "Microsoft 365 and Entra ID",
    label: "Microsoft 365",
    group: "enterprise",
    intro:
      "Identity, licensing and collaboration architecture. What the tenant settings actually control, where the licensing boundaries fall, and how identity design constrains everything above it.",
    description:
      "Microsoft 365 and Entra ID architecture: identity, licensing, Conditional Access, collaboration and tenant governance.",
    subcategories: ["Identity", "Entra ID", "Licensing", "Conditional Access", "Collaboration"],
    related: ["microsoft-intune", "cybersecurity-ciso", "cloud"],
  },
  {
    slug: "cybersecurity-ciso",
    title: "Cybersecurity and security leadership",
    label: "Cybersecurity",
    group: "enterprise",
    intro:
      "Security architecture and governance for people who have to operate it: identity-first controls, endpoint and network security, incident readiness, and reporting that survives a board meeting.",
    description:
      "Cybersecurity and security leadership: Zero Trust, identity, endpoint and network security, governance, ISO 27001 and risk reporting.",
    subcategories: [
      "Zero Trust",
      "Identity security",
      "Governance",
      "Security operations",
      "Resilience",
    ],
    related: ["microsoft-365-entra-id", "enterprise-networking", "technology-leadership"],
  },
  {
    slug: "enterprise-networking",
    title: "Enterprise networking",
    label: "Networking",
    group: "enterprise",
    intro:
      "Wired and wireless infrastructure, segmentation, remote access and the trade-offs behind each architecture decision — including the ones that only show up under load.",
    description:
      "Enterprise networking: wireless design, segmentation, SD-WAN, remote access and network security architecture.",
    subcategories: ["Wireless", "Segmentation", "Zero Trust", "Remote access", "Monitoring"],
    related: ["networking", "cybersecurity-ciso", "cloud"],
  },
  {
    slug: "ai-enterprise-it",
    title: "AI for enterprise IT",
    label: "AI in IT",
    group: "enterprise",
    intro:
      "Where AI is currently useful inside IT operations, where it is not, and what has to be true about your data and identity model before any of it works.",
    description:
      "AI for enterprise IT: Copilot readiness, AI governance, agents in IT operations and the data prerequisites behind them.",
    subcategories: ["Copilot", "AI governance", "Agents", "Readiness", "Adoption"],
    related: ["ai", "it-automation", "technology-leadership"],
  },
  {
    slug: "it-automation",
    title: "IT automation",
    label: "IT automation",
    group: "enterprise",
    intro:
      "Scripting, APIs and orchestration for endpoint and identity estates — written to be maintained by the next person, not just to run once.",
    description:
      "IT automation: PowerShell, Microsoft Graph, orchestration and repeatable operational tooling for endpoint and identity management.",
    subcategories: ["PowerShell", "Microsoft Graph", "Orchestration", "Reporting"],
    related: ["microsoft-intune", "ai-enterprise-it", "cloud"],
  },
  {
    slug: "technology-leadership",
    title: "Technology leadership",
    label: "Leadership",
    group: "enterprise",
    intro:
      "Decisions, trade-offs and communication: how technical work gets funded, prioritised and explained to people who do not read the release notes.",
    description:
      "Technology leadership: IT strategy, governance, prioritisation and communicating technical risk to executives.",
    subcategories: ["Strategy", "Governance", "Risk", "Operating model", "Practice"],
    related: ["cybersecurity-ciso", "ai-enterprise-it"],
  },

  // ---------- Broader technology categories ----------
  {
    slug: "ai",
    title: "AI",
    label: "AI",
    group: "technology",
    intro:
      "Models, tools and the infrastructure underneath them. What current systems can reliably do, what they cannot, and how to evaluate the difference yourself.",
    description:
      "AI coverage: generative AI tools, agents, local models, RAG, AI hardware and AI security — assessed practically.",
    subcategories: ["Tools", "Agents", "Local AI", "AI hardware"],
    related: ["ai-enterprise-it", "software", "emerging-tech"],
  },
  {
    slug: "software",
    title: "Software",
    label: "Software",
    group: "technology",
    intro:
      "Operating systems, productivity software, developer tooling and utilities — configuration, behaviour and the settings that matter.",
    description:
      "Software coverage: Windows, macOS, Linux, Microsoft 365, browsers, developer tools and utilities.",
    subcategories: ["Windows", "macOS and Linux", "Productivity", "Developer tools"],
    related: ["how-to", "ai", "gadgets"],
  },
  {
    slug: "gadgets",
    title: "Gadgets",
    label: "Gadgets",
    group: "technology",
    intro:
      "Laptops, phones, audio, displays and accessories, assessed on how they hold up in daily use rather than on spec-sheet superlatives.",
    description:
      "Gadget coverage: laptops, smartphones, audio, displays, storage and accessories, with clear labelling of what was tested.",
    subcategories: ["Laptops", "Audio", "Displays", "Accessories", "Home lab"],
    related: ["smartphones", "electronics", "buying-guides"],
  },
  {
    slug: "electronics",
    title: "Electronics and hardware",
    label: "Electronics",
    group: "technology",
    intro:
      "Processors, memory, storage, displays and the components inside the devices — explained without the marketing layer.",
    description:
      "Electronics and hardware: CPUs, GPUs, memory, SSDs, NAS, displays and networking hardware explained.",
    subcategories: ["Processors", "Storage", "Memory", "Components", "Standards"],
    related: ["gadgets", "networking", "emerging-tech"],
  },
  {
    slug: "windows",
    title: "Windows",
    label: "Windows",
    group: "technology",
    intro:
      "The Windows client platform itself: deployment and servicing, the security surface, performance behaviour, and the failure modes that show up on real estates.",
    description:
      "Windows coverage: deployment, servicing and update behaviour, security hardening, performance and troubleshooting.",
    subcategories: ["Deployment", "Servicing", "Security", "Performance", "Troubleshooting"],
    related: ["microsoft-intune", "software", "how-to"],
  },
  {
    slug: "smartphones",
    title: "Smartphones",
    label: "Smartphones",
    group: "technology",
    intro:
      "Android and iOS devices, platform behaviour, update policy, security posture and what actually differs between them.",
    description:
      "Smartphone coverage: Android and iOS platform behaviour, security, updates and device selection.",
    related: ["gadgets", "software", "comparisons"],
  },
  {
    slug: "networking",
    title: "Networking",
    label: "Networking",
    group: "technology",
    intro:
      "Home and small-business networking: Wi-Fi standards, routers, mesh, wiring and the diagnostics that find the real bottleneck.",
    description:
      "Networking coverage: Wi-Fi standards, routers and mesh systems, wiring, and practical network troubleshooting.",
    related: ["enterprise-networking", "electronics", "how-to"],
  },
  {
    slug: "cloud",
    title: "Cloud",
    label: "Cloud",
    group: "technology",
    intro:
      "Cloud platforms and services from an operations perspective: identity, cost, resilience and the parts that are harder to reverse than they look.",
    description:
      "Cloud coverage: Azure and cloud platform architecture, identity, cost control, resilience and migration trade-offs.",
    related: ["microsoft-365-entra-id", "it-automation", "enterprise-networking"],
  },
  {
    slug: "emerging-tech",
    title: "Emerging technology",
    label: "Emerging tech",
    group: "technology",
    intro:
      "Robotics, quantum computing, spatial and edge computing, new processors and new networking — tracked without the hype cycle.",
    description:
      "Emerging technology: robotics, quantum computing, spatial and edge computing, new processors and future networking.",
    related: ["ai", "electronics"],
  },

  // ---------- Editorial formats ----------
  {
    slug: "how-to",
    title: "How-to",
    label: "How-To",
    group: "formats",
    intro:
      "Step-by-step procedures that state their prerequisites, name the exact settings, and tell you how to verify the result.",
    description:
      "Step-by-step technology guides for Windows, Android, iPhone, Microsoft 365, networking, security and AI tools.",
    subcategories: ["Windows", "Mobile", "Microsoft 365", "Troubleshooting", "Resilience"],
    related: ["software", "networking", "microsoft-intune"],
    contentTypeIndex: "how-to",
  },
  {
    slug: "reviews",
    title: "Reviews",
    label: "Reviews",
    group: "formats",
    intro:
      "Every review states its basis up front: hands-on use, lab verification, or documentation and specifications. Nothing is claimed as tested unless it was.",
    description:
      "Technology reviews of hardware, software, AI tools and networking equipment, with the basis of assessment stated up front.",
    related: ["gadgets", "software", "comparisons"],
    contentTypeIndex: "review",
  },
  {
    slug: "comparisons",
    title: "Comparisons",
    label: "Comparisons",
    group: "formats",
    intro:
      "Head-to-head analysis with an actual recommendation: what each option is, where it wins, where it loses, and who should choose which.",
    description:
      "Technology comparisons with clear recommendations: platforms, standards, licences, tools and hardware, side by side.",
    related: ["buying-guides", "reviews", "software"],
    contentTypeIndex: "comparison",
  },
  {
    slug: "buying-guides",
    title: "Buying guides",
    label: "Buying guides",
    group: "formats",
    intro:
      "Selection criteria first, product shortlists second. Prices change, so guides are written to be updated and always show when they were last checked.",
    description:
      "Evidence-based technology buying guides for laptops, monitors, networking equipment, storage and accessories.",
    related: ["gadgets", "comparisons", "electronics"],
    contentTypeIndex: "buying-guide",
  },
];

export const categoryMap = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
  return categoryMap.get(slug);
}

/**
 * Categories that own article URLs.
 *
 * The complement — `contentTypeIndexCategories` — are derived listings over
 * `contentType`. Keeping the two apart is what guarantees one article has one
 * canonical address.
 */
export const subjectCategories: Category[] = categories.filter((c) => !c.contentTypeIndex);

/** Categories that list by `contentType` instead of holding articles. */
export const contentTypeIndexCategories: Category[] = categories.filter(
  (c) => c.contentTypeIndex !== undefined,
);

export function isSubjectCategory(slug: string): boolean {
  const category = categoryMap.get(slug);
  return category !== undefined && category.contentTypeIndex === undefined;
}

/** Primary navigation — deliberately short. */
export const primaryNav: { label: string; slug: string }[] = [
  { label: "AI", slug: "ai" },
  { label: "Enterprise IT", slug: "microsoft-intune" },
  { label: "Cybersecurity", slug: "cybersecurity-ciso" },
  { label: "Gadgets", slug: "gadgets" },
  { label: "Software", slug: "software" },
  { label: "How-To", slug: "how-to" },
  { label: "Reviews", slug: "reviews" },
  { label: "Comparisons", slug: "comparisons" },
];

export const footerColumns: { heading: string; slugs: string[] }[] = [
  {
    heading: "Enterprise IT",
    slugs: [
      "microsoft-intune",
      "microsoft-365-entra-id",
      "cybersecurity-ciso",
      "enterprise-networking",
      "ai-enterprise-it",
      "it-automation",
      "technology-leadership",
    ],
  },
  {
    heading: "Technology",
    slugs: [
      "ai",
      "software",
      "windows",
      "gadgets",
      "electronics",
      "smartphones",
      "networking",
      "cloud",
      "emerging-tech",
    ],
  },
  {
    heading: "Formats",
    slugs: ["how-to", "reviews", "comparisons", "buying-guides"],
  },
];
