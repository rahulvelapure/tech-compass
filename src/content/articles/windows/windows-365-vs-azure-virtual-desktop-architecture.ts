import type { Article } from "../../types";

export const article: Article = {
  slug: "windows-365-vs-azure-virtual-desktop-architecture",
  category: "windows",
  contentType: "comparison",
  subcategory: "Deployment",
  title: "One of these hands you a desktop. The other hands you a VDI estate",
  seoTitle: "Windows 365 vs Azure Virtual Desktop: The Architecture Decision",
  metaDescription:
    "Windows 365 gives each user a managed Cloud PC. Azure Virtual Desktop gives you session hosts to run. The real difference is which operational work you keep.",
  standfirst:
    "This is not a feature contest. It is a choice about how much desktop plumbing you want to run yourself.",
  excerpt:
    "Pooled multi-session is the only reason the cost models differ meaningfully, and it is also the reason one of these platforms needs a team. Match the model to the user population, not to a preference.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-24",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 6,
  primaryKeyword: "Windows 365 vs Azure Virtual Desktop",
  secondaryKeywords: [
    "Cloud PC architecture",
    "AVD session host pooling",
    "FSLogix profile containers",
    "multi-session Windows",
    "cloud desktop decision",
  ],
  tags: ["Windows", "Azure", "Virtual Desktop", "Endpoint Management", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["windows-11-vs-windows-10-enterprise", "entra-join-vs-hybrid-join"],
  draft: true,
  methodology:
    "Written from Microsoft Learn documentation on Windows 365 Cloud PC sizing, GPU Cloud PCs and Azure Virtual Desktop architecture, verified August 2026. Two corrections were made to the source draft: Windows 365 does offer GPU Cloud PCs, and the maximum non-GPU size is larger than the draft stated. All per-user and per-hour pricing was removed rather than repeated, because Microsoft revises it and a stale figure invites the wrong decision.",
  body: [
    {
      type: "p",
      text: "Both of these run Windows in the cloud. After that they stop being alike. One hands you a desktop. The other hands you a platform to build one on.",
    },
    {
      type: "p",
      text: "Windows 365 gives each user a dedicated Cloud PC that Microsoft operates. You manage the Windows inside it, much as you manage a laptop.",
    },
    {
      type: "p",
      text: "Azure Virtual Desktop gives you a platform for building virtual desktop infrastructure in your own subscription. You size the session hosts, build the images, tune the scaling and run the profile storage.",
    },
    {
      type: "p",
      text: "So the question is not which has better features. It is how much of that estate you want to own.",
    },
    { type: "h2", id: "architecture", text: "The architectural split" },
    {
      type: "p",
      text: "A Windows 365 Cloud PC is one virtual machine per user, provisioned and hosted by Microsoft. There is no host pool to design and no Azure subscription required for the compute. You assign a licence and a Cloud PC appears, enrolled in Intune like any other Windows device.",
    },
    {
      type: "p",
      text: "AVD is a brokering service over virtual machines you own. Those hosts can be personal, meaning one user each, or pooled, meaning several users share a host with a session apiece. You choose the VM series, the image, the scaling rules and the storage for profiles.",
    },
    {
      type: "p",
      text: "Pooled multi-session is the capability that has no equivalent on the other side, and it is the reason this decision is not simply about convenience.",
    },
    { type: "h2", id: "pooling", text: "Why pooling changes the arithmetic" },
    {
      type: "p",
      text: "A dedicated desktop is idle most of the time. It is idle overnight, at weekends, during meetings, and while its user is in a different application entirely.",
    },
    {
      type: "p",
      text: "Pooled hosts recover that waste. Several users share the CPU and memory of one host, and because their active moments do not coincide, the host carries more people than its size suggests. For task work — a browser, a line-of-business application, Office — the density can be substantial.",
    },
    {
      type: "p",
      text: "That is the entire economic case for AVD, and it only applies to pooled desktops. Run AVD with personal desktops and you are paying for dedicated infrastructure plus running it yourself, which is usually the worst of both options.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Density is a workload property, not a setting",
      text: "How many users fit on a host depends on what they run, and the only reliable way to find out is to measure your own applications with your own users. Published density figures are shaped by whichever workload was tested. Plan capacity from a pilot, and expect the answer for a call centre to look nothing like the answer for engineers.",
    },
    { type: "h2", id: "operations", text: "The operational work you keep" },
    {
      type: "p",
      text: "This is the real differentiator, and it is easy to underestimate because none of it appears in a feature list.",
    },
    {
      type: "table",
      caption: "Who does what",
      head: ["Responsibility", "Windows 365", "Azure Virtual Desktop"],
      rows: [
        ["Host infrastructure", "Microsoft", "You"],
        ["Image build and update", "Gallery or your own image", "You, on a cycle"],
        ["Capacity and scaling", "Microsoft", "You, via scaling rules"],
        ["User profiles", "Stays on the Cloud PC", "You, usually FSLogix on Azure storage"],
        ["Networking", "Managed, or your own network", "You, including on-premises connectivity"],
        ["Guest OS management", "You, through Intune", "You, through Intune or policy"],
        ["Monitoring", "Endpoint analytics", "You, via Azure Monitor"],
      ],
    },
    {
      type: "p",
      text: "Two of those rows cause most of the pain in practice.",
    },
    {
      type: "p",
      text: "**Image management** is a permanent cycle rather than a project. Applications change, Windows updates, and the golden image has to be rebuilt, tested and rolled to the host pool. Pooled hosts must be drained before replacement, which means the process needs to work during working hours.",
    },
    {
      type: "p",
      text: "**Profile containers** are where pooled AVD most often disappoints its users. Because a user may land on a different host each session, the profile has to travel, and it does so as a container on network storage. Get the storage performance wrong and sign-in becomes slow. Get the failure handling wrong and profiles corrupt. This is the component that generates helpdesk tickets, and it does not exist at all on a dedicated Cloud PC, because the profile never moves.",
    },
    { type: "h2", id: "gpu", text: "Two things the comparison usually gets wrong" },
    {
      type: "p",
      text: "**Windows 365 supports GPU Cloud PCs.** This is worth stating plainly because the opposite is widely repeated. There are several GPU sizes, spanning light graphics acceleration up to configurations aimed at demanding visual workloads, available in dedicated and shared modes. GPU work is not automatically a reason to choose AVD.",
    },
    {
      type: "p",
      text: "One caveat matters if you are evaluating them for developers: GPU Cloud PCs do not support nested virtualization, so tooling that needs a hypervisor inside the desktop will not run there.",
    },
    {
      type: "p",
      text: "**The size ceiling is higher than most comparisons assume.** Non-GPU Cloud PCs are available well beyond the mid-range configurations usually quoted, into sizes suited to development and large data work. If you ruled out Windows 365 on capacity grounds some time ago, that assessment is probably stale.",
    },
    { type: "h2", id: "cost", text: "How to think about cost without a price list" },
    {
      type: "p",
      text: "Prices change, so the useful part is the shape of each model rather than the numbers.",
    },
    {
      type: "p",
      text: "Windows 365 is a per-user subscription that bundles compute, storage and the Windows licence into one predictable line. It does not vary with usage, which makes forecasting trivial and makes idle time expensive.",
    },
    {
      type: "p",
      text: "AVD is consumption billing across several components — compute for the hosts, storage for profiles, networking, plus the licensing that entitles you to the OS. It rewards good engineering: scaling that shuts hosts down out of hours, and pooling that raises density. It also punishes neglect, because a host pool sized for peak and never scaled down bills continuously.",
    },
    {
      type: "p",
      text: "The comparison people forget to make is the operational one. AVD's saving on compute has to cover the engineering time to build and maintain the estate. At small scale it frequently does not. At large scale, with pooled task workers, it frequently does. Model both, and count the people.",
    },
    { type: "h2", id: "decision", text: "Matching the platform to the population" },
    {
      type: "p",
      text: "Most organisations of any size need both, because their users are not one population.",
    },
    {
      type: "table",
      caption: "Which fits which user",
      head: ["User pattern", "Platform", "Why"],
      rows: [
        ["Knowledge worker, persistent desktop", "Windows 365", "Dedicated, no VDI estate to run"],
        ["Shift or task worker, no persistence", "AVD pooled", "Density is the whole saving"],
        ["Contractor, short engagement", "Windows 365", "Provision and remove quickly"],
        ["Specialist needing a custom host", "AVD personal", "Full control of VM and image"],
        ["Graphics workload", "Either", "Both offer GPU; check nested virtualization"],
        ["Needs custom network topology", "AVD", "Hosts live in your own network"],
        ["Legacy multi-user server apps", "AVD", "Windows Server session hosts"],
      ],
    },
    {
      type: "p",
      text: "Domain join is a constraint worth checking early. Cloud PCs can be Entra joined or hybrid joined, and hybrid join requires network line of sight to a domain controller. If applications still depend on Kerberos against on-premises services, that dependency shapes the design for either platform. The trade-offs of the two join types are covered in [Entra join versus hybrid join](/microsoft-intune/entra-join-vs-hybrid-join).",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The honest test is a staffing question",
      text: "Ask whether you have someone who will own image builds, scaling rules and profile storage as a continuing responsibility — not a project, a rota. If the answer is yes, AVD's flexibility and pooled density are genuinely available to you. If the answer is a name who already has another full-time job, choose the managed option and spend the difference elsewhere.",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "Windows 365 is a managed dedicated desktop. AVD is a platform for infrastructure you operate.",
        "Pooled multi-session is AVD's real advantage, and the only place its cost model clearly wins.",
        "AVD with personal desktops is usually the worst option: dedicated cost plus operational load.",
        "Image builds and profile containers are the continuing work, and profiles cause the tickets.",
        "Windows 365 does offer GPU Cloud PCs. The common claim otherwise is wrong.",
        "Non-GPU sizes now reach well beyond the mid-range figures usually quoted.",
        "Density depends on your applications. Measure it in a pilot rather than trusting a number.",
        "Decide by user population, and expect to run both.",
      ],
    },
    {
      type: "p",
      text: "The mistake that costs most is picking one platform for the whole organisation. A call centre and an engineering team have almost nothing in common as desktop workloads, and forcing them onto one model means overpaying for one group while underserving the other.",
    },
  ],
  faq: [
    {
      question: "Which is cheaper?",
      answer:
        "AVD, if you pool task workers and really do scale hosts down. If not, Windows 365 tends to win once you count the staff time.",
    },
    {
      question: "Does Windows 365 support GPU workloads?",
      answer:
        "Yes. There are several GPU Cloud PC sizes, in both dedicated and shared modes. One catch: they do not support nested virtualization.",
    },
    {
      question: "What is the hardest part of running AVD?",
      answer:
        "Profiles and images. A profile has to move between hosts on shared storage. That is where slow sign-ins and broken profiles come from.",
    },
    {
      question: "Can I manage both with Intune?",
      answer:
        "Yes, for Windows client desktops on both. Hosts that run Windows Server are the exception. Those use policy or Azure Arc.",
    },
    {
      question: "Can a Cloud PC join my on-premises domain?",
      answer:
        "Hybrid join works, but it needs a network path to a domain controller. Entra join is simpler where your apps allow it.",
    },
    {
      question: "Should I standardise on one platform?",
      answer:
        "Usually not. Groups of users need different things. Force one model on all of them and you pay too much for some and let the rest down.",
    },
  ],
  sources: [
    {
      title: "What is Windows 365?",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows-365/overview",
    },
    {
      title: "GPU Cloud PCs in Windows 365",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows-365/enterprise/gpu-cloud-pc",
    },
    {
      title: "Cloud PC size recommendations",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/windows-365/enterprise/cloud-pc-size-recommendations",
    },
    {
      title: "Azure Virtual Desktop documentation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/virtual-desktop/",
    },
    {
      title: "FSLogix profile containers",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/fslogix/concepts-container-types",
    },
  ],
};
