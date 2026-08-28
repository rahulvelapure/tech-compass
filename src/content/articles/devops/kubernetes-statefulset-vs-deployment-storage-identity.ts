import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-statefulset-vs-deployment-storage-identity",
  category: "devops",
  contentType: "explainer",
  subcategory: "Kubernetes",
  title: "A StatefulSet is not a Deployment with a disk bolted on",
  seoTitle: "StatefulSets vs Deployments: Storage and Identity",
  metaDescription:
    "Deployments treat every pod as interchangeable. Databases are not. How StatefulSets give a pod a stable name, its own volume and an ordered lifecycle.",
  standfirst:
    "A Deployment says any pod will do. A database says this pod, with this disk, under this name. Those are different controllers for a reason.",
  excerpt:
    "Stable ordinals, per-pod volume claims and reverse-order updates are the whole point of a StatefulSet. The retention policy that cleans up after it only went stable in Kubernetes 1.32.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 6,
  primaryKeyword: "Kubernetes StatefulSet vs Deployment",
  secondaryKeywords: [
    "StatefulSet stable network identity",
    "persistentVolumeClaimRetentionPolicy",
    "headless service Kubernetes",
    "volumeClaimTemplates",
    "podManagementPolicy Parallel",
  ],
  tags: ["Kubernetes", "Storage", "Databases", "Architecture", "Containers"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-storage-classes-costs-performance-traps",
    "kubernetes-pod-disruption-budgets-eviction-mechanics",
  ],
  methodology:
    "Written from the Kubernetes documentation on StatefulSets, PersistentVolumeClaim retention, and DNS for pods and services, verified August 2026. Two corrections were made to the source draft. It dated `persistentVolumeClaimRetentionPolicy` as stable in Kubernetes 1.27; 1.27 was the beta promotion and the field went stable in 1.32. And it presented ordered startup as an unconditional property of StatefulSets, which is only true under the default `podManagementPolicy`. The draft's corrupted-database incident and its volume-detach timings were removed and replaced with the mechanism that produces them.",
  body: [
    {
      type: "p",
      text: "A Deployment is built on one assumption: any pod is as good as any other. Kill one, start another somewhere else, and nothing downstream should notice. That assumption makes Deployments simple. It is also the thing a database cannot live with.",
    },
    {
      type: "p",
      text: "Databases, brokers and clustered caches need three things a Deployment will not give them. A name that survives a restart. A disk that follows that name. And a lifecycle that changes one member at a time.",
    },
    {
      type: "p",
      text: "That is what a StatefulSet provides. It is a different controller, not a Deployment with extra fields.",
    },
    { type: "h2", id: "why-deployments-fail", text: "Why a Deployment breaks under a database" },
    {
      type: "p",
      text: "Scale a Deployment and you get pods with random name suffixes and new IP addresses. Nothing about a pod identifies which member of a cluster it is.",
    },
    {
      type: "p",
      text: "Attach one PersistentVolumeClaim to that Deployment and every replica tries to mount the same volume. A web server reading static files is fine with that. A relational database is not.",
    },
    {
      type: "p",
      text: "Two database processes writing one data directory corrupt it. They rely on file locks that were never designed to arbitrate between hosts. Each member needs its own volume, and it needs to keep that volume when it moves to another node.",
    },
    { type: "h2", id: "identity", text: "Ordinals give a pod a name it keeps" },
    {
      type: "p",
      text: "A StatefulSet names its pods by index rather than by hash: `my-db-0`, `my-db-1`, `my-db-2`. Each pod also carries an `apps.kubernetes.io/pod-index` label holding the same number.",
    },
    {
      type: "p",
      text: "Delete `my-db-1` and it comes back as `my-db-1`, even on a different node. That stability is what lets an application treat the pod as a cluster member rather than as capacity.",
    },
    {
      type: "p",
      text: "It matters most where the identity is baked into the application. A Kafka broker ID is tied to the pod name. If the name changed on every restart, the controller would see a brand-new broker and start moving partitions around. The rebalance mechanics behind that are covered in [Kafka consumer groups and rebalancing](/devops/kafka-consumer-groups-rebalance-exactly-once).",
    },
    {
      type: "p",
      text: "Since Kubernetes 1.31 you can also move the numbering. Setting `.spec.ordinals.start` begins the sequence somewhere other than zero, which is how you migrate members between two StatefulSets without a name collision.",
    },
    { type: "h2", id: "storage", text: "volumeClaimTemplates give each pod its own disk" },
    {
      type: "p",
      text: "A Deployment names one claim. A StatefulSet declares a `volumeClaimTemplates` block and stamps out a claim per pod.",
    },
    {
      type: "p",
      text: "Creating `my-db-0` creates `data-my-db-0`. Creating `my-db-1` creates `data-my-db-1`. Delete the pod and the claim stays behind. When the controller recreates the pod, it binds the same claim again, and the member resumes on its own data.",
    },
    {
      type: "code",
      language: "yaml",
      filename: "statefulset.yaml",
      code: 'spec:\n  volumeClaimTemplates:\n    - metadata:\n        name: data\n      spec:\n        accessModes: ["ReadWriteOncePod"]\n        storageClassName: fast-ssd\n        resources:\n          requests:\n            storage: 100Gi\n  persistentVolumeClaimRetentionPolicy:\n    whenDeleted: Retain\n    whenScaled: Delete',
    },
    {
      type: "p",
      text: "Use `ReadWriteOncePod` rather than `ReadWriteOnce` where your CSI driver supports it. `ReadWriteOnce` allows several pods on the same node to mount the volume. `ReadWriteOncePod` restricts it to exactly one pod anywhere in the cluster, which is what a single-writer database actually needs.",
    },
    {
      type: "p",
      text: "Which class you point at matters as much as the access mode. The cost and throughput differences are set out in [Kubernetes storage classes](/devops/kubernetes-storage-classes-costs-performance-traps).",
    },
    { type: "h2", id: "headless", text: "The headless service is what makes DNS work" },
    {
      type: "p",
      text: "A normal Service hands out one virtual IP and load-balances across the pods behind it. For a database cluster that is the wrong behaviour. Clients need to reach the primary, or one named replica, not whichever member the proxy picked.",
    },
    {
      type: "p",
      text: "A headless service sets `clusterIP: None`. It allocates no virtual IP. Instead CoreDNS publishes a record per pod, in the form `postgres-0.postgres-headless.default.svc.cluster.local`.",
    },
    {
      type: "p",
      text: "Members use those names to find each other and form a quorum. Applications use them to address a specific role. Neither works without the headless service, which is why a StatefulSet with a normal Service in front of it usually fails to form a cluster at all.",
    },
    { type: "h2", id: "ordering", text: "Ordered lifecycle, and how to turn it off" },
    {
      type: "p",
      text: "Under the default `podManagementPolicy` of `OrderedReady`, the controller works one pod at a time.",
    },
    {
      type: "ul",
      items: [
        "**Scaling up** creates `my-db-0` and waits for it to be Running and Ready before starting `my-db-1`. Seed nodes come up before the members that join them.",
        "**Scaling down** removes the highest ordinal first and waits for it to terminate. That gives the application time to hand off leadership and drain.",
        "**Rolling updates** also run in reverse, from the highest ordinal down to zero. The member most likely to be primary is updated last, so you get one leader election rather than several.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Ordering is a setting, not a guarantee of the controller",
      text: "Setting `podManagementPolicy: Parallel` makes the StatefulSet create and delete pods all at once. Identity and per-pod storage still work exactly as before. Only the sequencing changes. That is the right choice for a cluster whose members do not need a seed, and the wrong one for anything that elects a leader at startup.",
    },
    { type: "h2", id: "pvc-retention", text: "The claims outlive the workload by default" },
    {
      type: "p",
      text: "Deleting a StatefulSet has never deleted its claims. That is a deliberate safety choice, and it is also how clusters end up paying for volumes that belong to workloads nobody remembers.",
    },
    {
      type: "p",
      text: "`persistentVolumeClaimRetentionPolicy` lets you choose. It has two independent fields, and both default to `Retain`.",
    },
    {
      type: "table",
      caption: "The two retention fields, and what each one governs.",
      head: ["Field", "Fires when", "Set it to Delete when"],
      rows: [
        [
          "`whenDeleted`",
          "The StatefulSet object is deleted",
          "The data is reproducible, or a backup owns it",
        ],
        [
          "`whenScaled`",
          "The replica count is reduced",
          "Removed members are gone for good, not paused",
        ],
      ],
    },
    {
      type: "p",
      text: "Check your version before you rely on it. The feature was alpha in Kubernetes 1.23 and beta in 1.27. It only went stable in 1.32.",
    },
    {
      type: "p",
      text: "The scale-down case is the one that surprises people. Leave `whenScaled` on `Retain`, drop from five replicas to three, and the claims for members three and four sit there billing you. Scale back up later and the returning pods bind that older data, which may be well behind the rest of the cluster.",
    },
    { type: "h2", id: "node-failure", text: "What actually protects you during a node failure" },
    {
      type: "p",
      text: "A node stops reporting. The control plane marks it NotReady and wants to place the pod elsewhere. But losing contact with the API server does not prove the process died. The old pod may still be running and still writing.",
    },
    {
      type: "p",
      text: "With shared read-write-many storage, nothing stops both writers. That is how a write-ahead log gets corrupted.",
    },
    {
      type: "p",
      text: "Block storage behaves differently, and the protection is not Kubernetes. The cloud provider will attach the volume to one node at a time and refuses the second attach. The replacement pod sits in ContainerCreating until the controller manager confirms the old node is gone and detaches the volume.",
    },
    {
      type: "p",
      text: "That wait is the safety mechanism working. It is not a bug to engineer around, and forcing the detach early is how you get two writers. Budget for the delay in your recovery targets, and treat voluntary disruptions separately with a budget — the mechanics are in [pod disruption budgets](/devops/kubernetes-pod-disruption-budgets-eviction-mechanics).",
    },
  ],
  faq: [
    {
      question: "Is a StatefulSet worth it for a single replica?",
      answer:
        "Yes. One replica still gets a fixed name and keeps its own claim across restarts and evictions. A Deployment with a claim gives you neither.",
    },
    {
      question: "Do StatefulSets always start pods in order?",
      answer:
        "Only with the default policy. Set `podManagementPolicy: Parallel` and they all start at once. You keep the stable names and the per-pod disks either way.",
    },
    {
      question: "When did the PVC retention policy go stable?",
      answer:
        "In Kubernetes 1.32. It was alpha in 1.23 and beta in 1.27. Both of its fields still default to `Retain`, so nothing is deleted unless you ask.",
    },
    {
      question: "Why is my replacement pod stuck in ContainerCreating?",
      answer:
        "The old node probably still holds the volume. Block storage attaches to one node at a time. The pod waits until the cloud controller detaches it.",
    },
    {
      question: "Do I need a headless service?",
      answer:
        "Yes. Without `clusterIP: None` there are no per-pod DNS records. Members cannot find each other by name, and most clusters never form.",
    },
    {
      question: "Should I run production databases on Kubernetes?",
      answer:
        "Often not. The hard part is backups, restores and failover. A StatefulSet does none of that. Use a managed service, or an operator built on these parts.",
    },
  ],
  sources: [
    {
      title: "StatefulSets",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/",
    },
    {
      title: "PersistentVolumeClaim retention",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#persistentvolumeclaim-retention",
    },
    {
      title: "DNS for services and pods",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/",
    },
    {
      title: "Persistent volume access modes",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes",
    },
  ],
};
