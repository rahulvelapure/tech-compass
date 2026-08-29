import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-storage-classes-costs-performance-traps",
  category: "devops",
  contentType: "explainer",
  subcategory: "Kubernetes",
  title: "Three settings in a StorageClass decide your bill and your outages",
  seoTitle: "Kubernetes StorageClasses: cost and performance traps",
  metaDescription:
    "Dynamic provisioning makes storage a one-line request. Reclaim policy, binding mode and volume tier decide what it costs and whether pods schedule.",
  standfirst:
    "A developer writes six lines of YAML and a disk appears. What kind, in which zone, and who pays when it is deleted are all decided elsewhere.",
  excerpt:
    "Dynamic provisioning hides real infrastructure behind a claim. Reclaim policy, volume binding mode and the tier a StorageClass offers decide the cost, the performance and whether pods schedule at all.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-08-23",
  readingMinutes: 6,
  primaryKeyword: "Kubernetes StorageClass",
  secondaryKeywords: [
    "volumeBindingMode WaitForFirstConsumer",
    "persistent volume reclaim policy",
    "Kubernetes pod pending volume",
    "orphaned persistent volumes",
    "dynamic provisioning Kubernetes",
  ],
  tags: ["Kubernetes", "DevOps", "Storage", "Cloud", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-pod-networking-packet-flow",
    "cloud-egress-costs-architecture-problem",
  ],
  methodology:
    "Written from the Kubernetes documentation on storage classes, persistent volumes and volume binding, and the CSI specification, verified August 2026. Field names and behaviours are quoted from that documentation. No prices, capacity totals or IOPS figures are given: they vary by provider, tier and region, and the draft's illustrative numbers were removed rather than updated. Which volume type a managed service uses by default changes between versions and is not asserted here.",
  body: [
    {
      type: "p",
      text: "Asking for disk space in Kubernetes is easy. You write a short claim and the disk shows up. Nobody opens a cloud console. Nobody files a ticket.",
    },
    {
      type: "p",
      text: "The abstraction hides real infrastructure with real costs and real constraints. Three fields in a StorageClass decide most of what happens next, and by default they are usually set by whoever installed the cluster rather than by anyone thinking about your workloads.",
    },
    {
      type: "p",
      text: "Those three are the reclaim policy, the volume binding mode, and which volume type the class offers. Get them wrong and you get either a surprise bill or pods that never start.",
    },
    { type: "h2", id: "flow", text: "What happens when a claim is created" },
    {
      type: "p",
      text: "Worth having the sequence straight, because each trap sits at a different step.",
    },
    {
      type: "ol",
      items: [
        "A claim is created, naming a StorageClass, a size and an access mode.",
        "The control plane sees an unbound claim and looks up that class.",
        "The class names a provisioner — usually a CSI driver running in the cluster.",
        "The driver calls the cloud API and creates a real disk.",
        "The driver creates a persistent volume object representing it and binds the claim to it.",
        "When a pod using the claim is scheduled, the driver attaches the disk to that node and mounts it.",
      ],
    },
    {
      type: "p",
      text: "Step four is where money starts being spent. Step six is where zones start to matter.",
    },
    { type: "h2", id: "reclaim", text: "Reclaim policy: lose the data, or keep paying" },
    {
      type: "p",
      text: "The reclaim policy decides what happens to the real disk when the claim is deleted. There are two realistic options and both have a failure mode.",
    },
    {
      type: "table",
      caption: "The trade the reclaim policy makes",
      head: ["Policy", "On claim deletion", "The failure mode"],
      rows: [
        [
          "Delete",
          "The underlying disk is deleted too",
          "Data is gone immediately, with no recycle bin",
        ],
        [
          "Retain",
          "The volume is Released, the disk stays",
          "You keep paying for disks nothing is using",
        ],
      ],
    },
    {
      type: "p",
      text: "Delete is the usual default for dynamically provisioned volumes, and it does exactly what it says. Remove a claim by accident and the disk goes with it. Unless you have a separate backup, that is permanent.",
    },
    {
      type: "p",
      text: "Retain looks like the safe choice, and for a production database it is. It also creates a quiet, compounding cost. Every deleted claim leaves a Released volume and an unattached disk, and nothing in the cluster complains about either. Test environments created and destroyed daily generate these continuously.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Retain without cleanup is not a safety measure",
      text: "Switching a shared default to Retain feels prudent and is often worse. It converts a visible risk, data loss, into an invisible one nobody is monitoring. If you choose Retain, something has to watch for Released volumes and unattached disks, or the choice is just deferred spending.",
    },
    {
      type: "p",
      text: "The workable split is by namespace rather than by cluster. Ephemeral environments get Delete, because the data genuinely is disposable. Production data gets Retain, with alerting on Released volumes so cleanup is a decision somebody makes rather than one nobody notices.",
    },
    { type: "h2", id: "binding", text: "Binding mode: the pending pod nobody can explain" },
    {
      type: "p",
      text: "This one produces the most confusing failure in a multi-zone cluster, and the fix is a single field.",
    },
    {
      type: "p",
      text: "Cloud block storage is zonal. A disk created in one availability zone can only attach to a node in that same zone. That constraint is not visible in the claim.",
    },
    {
      type: "p",
      text: "With `volumeBindingMode: Immediate`, the disk is created as soon as the claim exists — before anyone knows where the pod will run. The scheduler then places the pod using its own criteria: resources, affinities, taints. If it picks a node in a different zone, the attach fails.",
    },
    {
      type: "p",
      text: "The pod sits Pending or stuck creating its container, and the events mention an attach failure. Nothing is broken, exactly. The disk is fine, the node is fine, and they are in different places.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "WaitForFirstConsumer, on every production class",
      text: "This mode delays provisioning until a pod using the claim is actually scheduled. The scheduler picks a node first, then the disk is created in that node's zone. Volume and pod are co-located by construction, and the whole class of failure disappears.",
    },
    {
      type: "p",
      text: "There is very little reason not to use it for zonal storage. The cost is that a claim stays unbound until something uses it, which occasionally surprises people watching for a bound claim as a health signal.",
    },
    { type: "h2", id: "tiers", text: "Volume type: wrong in both directions" },
    {
      type: "p",
      text: "The third field is which volume type the class provisions, and it fails in opposite ways depending on who set it.",
    },
    {
      type: "p",
      text: "Under-provisioning is the quieter one. A default class often provisions the cheapest tier, and cheap tiers commonly have burstable performance. A database performs well in testing, where load is short and bursty, then throttles under sustained production traffic. The symptom is application timeouts, and the storage looks healthy throughout.",
    },
    {
      type: "p",
      text: "Over-provisioning is the expensive one. If a class exposes high-performance options, a developer can request far more throughput than a workload needs, and the request will be granted. Block storage is billed on what you provision, not what you use, so an over-specified volume costs the same whether it is busy or idle.",
    },
    {
      type: "p",
      text: "The answer is not one carefully tuned class. It is a small number of named classes with an obvious purpose, and limits on who can use which.",
    },
    {
      type: "ul",
      items: [
        "Offer distinct classes for distinct workloads, named for the job rather than the tier, so the choice reads as an intent.",
        "Cap what a namespace can request using resource quotas, which puts a ceiling on the expensive mistakes.",
        "Keep the highest-performance classes out of general namespaces, and enforce that with an admission policy rather than a wiki page.",
      ],
    },
    { type: "h2", id: "mistakes", text: "Three more that come up repeatedly" },
    { type: "h3", id: "nfs", text: "File storage under a database" },
    {
      type: "p",
      text: "Network file storage is appealing because it can be mounted read-write by many pods at once, which block storage cannot. It is a network file system, with the latency that implies, and the random access patterns of a relational database are the worst case for it. Block storage for databases; file storage for shared assets and logs.",
    },
    { type: "h3", id: "csi", text: "Treating the CSI driver as installed-and-forgotten" },
    {
      type: "p",
      text: "The CSI driver attaches and detaches every volume in the cluster. An out-of-date one produces attachment, snapshot and resize bugs that look like application faults. It deserves the same version discipline as the control plane.",
    },
    { type: "h3", id: "resize", text: "Assuming expansion is seamless" },
    {
      type: "p",
      text: "A class can permit volume expansion with `allowVolumeExpansion`, but permitting it is only half. The filesystem and the workload have to cope with growing underneath them, and not all do without a restart. Test expansion before you depend on it during an incident.",
    },
    { type: "h2", id: "matrix", text: "A design that holds up" },
    {
      type: "table",
      caption: "Sensible defaults by workload, as a starting point rather than a standard",
      head: ["Workload", "Storage", "Reclaim", "Binding mode"],
      rows: [
        [
          "Production database",
          "Cloud block, performance tier",
          "Retain, with alerting",
          "WaitForFirstConsumer",
        ],
        ["Ephemeral and test", "Cloud block, standard tier", "Delete", "WaitForFirstConsumer"],
        ["Shared assets across pods", "Network file storage", "Retain", "WaitForFirstConsumer"],
        ["Logs and scratch", "Cloud block, standard tier", "Delete", "WaitForFirstConsumer"],
      ],
    },
    {
      type: "p",
      text: "The binding mode column being identical is the point. It is the one setting with almost no downside, and it removes an entire failure mode.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Read your default StorageClass today. Most clusters run whatever the installer set, and nobody has looked at it since.",
        "Set WaitForFirstConsumer everywhere you use zonal block storage.",
        "Choose the reclaim policy per namespace, not per cluster. Delete for disposable, Retain for data you care about.",
        "If you use Retain, monitor for Released volumes. Retain without cleanup is a slow leak.",
        "Give the expensive tiers a gate. Quotas and admission policy, not documentation.",
      ],
    },
    {
      type: "p",
      text: "None of this is difficult, and all of it is easy to skip, because dynamic provisioning works perfectly on day one no matter how the class is configured. The bill and the pending pods arrive later, which is exactly what makes these settings worth deciding on purpose. Storage is the second place cloud spend accumulates quietly — [the first is data transfer](/cloud/cloud-egress-costs-architecture-problem).",
    },
  ],
  faq: [
    {
      question: "Why is my pod stuck pending with a volume attach error?",
      answer:
        "The disk is probably in a different zone from the node. Cloud disks are zonal and cannot cross. Set the binding mode to WaitForFirstConsumer so the disk is made after the node is chosen.",
    },
    {
      question: "Should I use Delete or Retain?",
      answer:
        "Delete for test environments, where the data is meant to go. Retain for data you care about. Pick it per namespace, and watch for leftover volumes if you use Retain.",
    },
    {
      question: "What happens to my cloud disk when I delete a claim?",
      answer:
        "With Delete, the disk goes too, right away, and there is no undo. With Retain it stays and you keep paying for it until someone removes it.",
    },
    {
      question: "Can I make a volume bigger later?",
      answer:
        "Only if the class allows expansion, and only if the workload copes with the disk growing under it. Some need a restart. Test it before you need it.",
    },
    {
      question: "Can I use network file storage for a database?",
      answer:
        "You can, and it usually goes badly. It adds latency, and databases do a lot of small random reads and writes. Use block storage for those.",
    },
  ],
  sources: [
    {
      title: "Storage Classes",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/storage/storage-classes/",
    },
    {
      title: "Persistent Volumes",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/storage/persistent-volumes/",
    },
    {
      title: "Volume Binding Mode",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode",
    },
    {
      title: "Resource Quotas",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/policy/resource-quotas/",
    },
    {
      title: "Container Storage Interface (CSI) specification",
      publisher: "CNCF",
      url: "https://github.com/container-storage-interface/spec/blob/master/spec.md",
    },
  ],
};
