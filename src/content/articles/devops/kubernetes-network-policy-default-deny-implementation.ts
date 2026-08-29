import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-network-policy-default-deny-implementation",
  category: "devops",
  contentType: "how-to",
  subcategory: "Kubernetes",
  title: "Your network policy might be doing nothing, and nothing will tell you",
  seoTitle: "Kubernetes NetworkPolicy: Default-Deny and the CNI Gap",
  metaDescription:
    "NetworkPolicy is a specification the CNI has to implement. If yours does not, the policy is accepted and ignored. How to verify enforcement and reach default-deny.",
  standfirst:
    "Kubernetes stores the rule whether or not anything acts on it. Nothing warns you. That quiet is the real risk.",
  excerpt:
    "Default-deny is four lines of YAML and a fortnight of work. DNS breaks, metadata breaks, the API server becomes unreachable — and on some clusters the policy was never enforced at all.",
  authorId: "rahul-velapure",
  publishedAt: "2026-03-23",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 6,
  primaryKeyword: "Kubernetes NetworkPolicy default deny",
  secondaryKeywords: [
    "CNI network policy enforcement",
    "Kubernetes micro-segmentation",
    "Calico vs Cilium policy",
    "egress policy DNS",
    "verify network policy",
  ],
  tags: ["Kubernetes", "Networking", "Security", "DevOps", "Segmentation"],
  reviewStatus: "research-based",
  relatedSlugs: ["kubernetes-pod-networking-packet-flow", "service-mesh-mtls-operational-overhead"],
  methodology:
    "Written from the Kubernetes NetworkPolicy documentation, Cilium and Calico policy documentation, and the EKS network policy guidance, verified August 2026. The source draft's per-packet latency figures for iptables and eBPF enforcement were removed as unverifiable. Kernel and release version claims are described by capability rather than pinned to a number, because they move between releases.",
  body: [
    {
      type: "p",
      text: "A new cluster has no network isolation at all. Every pod can reach every other pod. Any namespace, any port, no questions asked.",
    },
    {
      type: "p",
      text: "A compromised frontend in staging can open a connection to the production database. Nothing in the platform objects, because nothing was asked to.",
    },
    {
      type: "p",
      text: "NetworkPolicy is the native fix. It is also where a specific and nasty failure lives: the API server will accept your policy whether or not anything is enforcing it.",
    },
    { type: "h2", id: "spec-not-impl", text: "The API is a spec, and nothing more" },
    {
      type: "p",
      text: "Kubernetes gives you the NetworkPolicy schema. It does not enforce a thing. All of that falls to the CNI plugin.",
    },
    {
      type: "p",
      text: "So if your CNI does not implement policy, your YAML is stored and ignored. `kubectl get networkpolicy` lists it. `kubectl describe` shows the rules you wrote. Traffic flows exactly as before.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "There is no error, event or warning",
      text: "This is the failure mode to hold on to. Through the API, a policy nobody enforces looks just like one that works. It shows up in the manifest. It gets through review. It answers an audit question. And it does nothing. Plugins in this category include Flannel in its default configuration, and the managed CNIs on the major clouds until you explicitly enable their policy component.",
    },
    {
      type: "p",
      text: "On EKS this means deploying the network policy agent. On AKS it means selecting a policy option when the cluster is created, which is not something you can add casually afterwards. Check what your cluster actually runs before you rely on a single policy.",
    },
    { type: "h2", id: "semantics", text: "The semantics that surprise people" },
    {
      type: "p",
      text: "Three rules govern how policies combine, and the first two are frequently misread.",
    },
    {
      type: "p",
      text: "**A pod with no policy selecting it allows everything.** Absence of policy is not absence of traffic.",
    },
    {
      type: "p",
      text: "**A pod selected by any policy denies everything not explicitly allowed** — for the directions that policy covers. This is where default-deny comes from. It is a per-pod consequence of being selected, not a cluster-wide mode you switch on.",
    },
    {
      type: "p",
      text: "**Policies are additive.** Multiple policies selecting one pod form a union. If any of them permits the traffic, it is permitted. There is no deny rule and no precedence order, so you cannot carve an exception out of a broad allow. You can only write narrower allows.",
    },
    {
      type: "p",
      text: "That last property matters for design. Policy sets grow by addition, which means an over-broad rule written months ago cannot be overridden later — it has to be found and narrowed.",
    },
    { type: "h2", id: "breaks", text: "What default-deny breaks first" },
    {
      type: "p",
      text: "The manifest is short. The consequences are not, and they arrive in a predictable order.",
    },
    {
      type: "table",
      caption: "Dependencies that fail under default-deny egress",
      head: ["What breaks", "Why", "What it needs"],
      rows: [
        [
          "Name resolution",
          "CoreDNS runs as pods in another namespace",
          "Egress to kube-dns on UDP and TCP 53",
        ],
        [
          "Cloud credentials",
          "The metadata service is a link-local address",
          "Egress to that address, or an identity webhook",
        ],
        [
          "Operators and controllers",
          "They must reach the API server",
          "Egress to the API server endpoint",
        ],
        [
          "Service mesh sidecars",
          "The proxy intercepts all traffic",
          "Rules that account for the proxy's ports",
        ],
        [
          "Health probes",
          "The kubelet connects from the node",
          "Ingress from the node, depending on CNI",
        ],
      ],
    },
    {
      type: "p",
      text: "DNS is always first, and it is the one that makes the outage confusing. Applications do not report a network policy problem. They report that a hostname could not be resolved, which looks like a DNS fault. Teams go and check CoreDNS, which is healthy.",
    },
    {
      type: "p",
      text: "The metadata service is the second, and it is worse because it is intermittent. Pods that already hold a credential keep working until it expires. The failure surfaces minutes or hours after the policy landed, by which time nobody connects the two.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Ship the DNS allow before the deny",
      text: "Write and apply the egress rule permitting DNS first, on its own, and confirm nothing changed. Then apply the deny. Doing it in one step means the first thing you learn is that everything is broken, with two changes to unpick. Doing it in two means you have already proven the exception works.",
    },
    { type: "h2", id: "cni", text: "How the enforcers differ" },
    {
      type: "p",
      text: "Once you run a CNI that enforces policy, the gaps between them start to show. They change how it behaves, and how you run it.",
    },
    {
      type: "p",
      text: "**Calico** enforces through iptables in its traditional dataplane, and through eBPF in its newer one. The iptables path is mature and widely deployed; rule evaluation is sequential, so the work grows with the size of the policy set. The eBPF dataplane changes that shape and also changes operational behaviour — notably how service traffic is handled — so it is a migration rather than a flag. It also offers a cluster-wide policy resource outside the Kubernetes API, useful for host endpoints.",
    },
    {
      type: "p",
      text: "**Cilium** is eBPF throughout, compiling policy into programs the kernel runs in the packet path. Its extensions are the reason people choose it: policy on HTTP method and path rather than just port, cluster-wide policy, and egress rules expressed as domain names rather than addresses.",
    },
    {
      type: "p",
      text: "That last one deserves a caution. Domain-based egress works by watching resolution and programming the resulting addresses. It is genuinely useful for allowing a SaaS endpoint you cannot enumerate by IP. It also means policy correctness now depends on the resolution path, which is a dependency worth understanding before you build a security boundary on it.",
    },
    { type: "h2", id: "verify", text: "Prove it works before you trust it" },
    {
      type: "p",
      text: "Do not infer enforcement from the presence of a policy. Prove it with traffic, once per cluster, and again after any CNI change.",
    },
    {
      type: "ol",
      items: [
        "Pick a target pod and note its address and a listening port.",
        "Apply a deny-ingress policy that picks out just that one pod.",
        "From another pod, attempt a connection to that port.",
        "It should fail — timeout or refused. If it succeeds, nothing is enforcing your policies.",
        "Remove the test policy.",
      ],
    },
    {
      type: "p",
      text: "This takes two minutes and answers a question no amount of manifest review can. Run it in every cluster, including the ones you assume are configured, and especially after a control-plane upgrade or a CNI change.",
    },
    { type: "h2", id: "rollout", text: "How to get to default-deny without an outage" },
    {
      type: "p",
      text: "The order that works is the opposite of the intuitive one. You do not start with the deny.",
    },
    {
      type: "p",
      text: "**Observe first.** Use flow visibility from your CNI, or a mesh, to record which pods actually talk to which. Do this for long enough to catch the weekly batch job and the monthly reconciliation, not just a busy afternoon. Anything you miss here becomes an incident later.",
    },
    {
      type: "p",
      text: "**Write allows next.** Build explicit allow policies for each application's real dependencies, and apply them while everything is still permitted. Nothing breaks, because you are adding permissions to a namespace that already allows everything.",
    },
    {
      type: "p",
      text: "**Then deny, in a namespace nobody will miss.** Development or staging first. Watch for the dependency you did not observe.",
    },
    {
      type: "p",
      text: "**Egress last, and log before you enforce.** Egress is harder because it requires knowing every external endpoint an application calls — APIs, registries, telemetry, licence servers. Run it in a visibility-only mode first and read what would have been dropped.",
    },
    {
      type: "p",
      text: "The whole sequence is layer 3 and 4 work. It controls which pods may exchange packets, not what those packets are permitted to ask for. Application-level authorisation belongs to a mesh, and the two are complementary rather than competing — the operational cost of the mesh side is covered in [service mesh mTLS overhead](/devops/service-mesh-mtls-operational-overhead).",
    },
    {
      type: "p",
      text: "If you want the layer underneath all of this — how a packet actually leaves a pod and reaches another — that is [Kubernetes pod networking](/devops/kubernetes-pod-networking-packet-flow).",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "The API takes policies that nothing enforces. Prove it works with a real test connection.",
        "Default-deny is a per-pod consequence of being selected, not a cluster switch.",
        "Policies only ever add. You cannot cancel a broad allow with a narrow deny.",
        "DNS breaks first and presents as a DNS fault. Apply its allow rule separately, before the deny.",
        "Metadata credentials fail later than the change, which hides the cause.",
        "Observe real traffic for weeks before denying anything. Include the infrequent jobs.",
        "Put the allows in while everything still works, and only then deny.",
        "Domain-based egress moves your boundary onto the resolution path. Know that before relying on it.",
      ],
    },
    {
      type: "p",
      text: "Segmentation in Kubernetes is not really a technical problem. It is a discovery one. You end up writing down every link your system has, including the ones nobody wrote down before. The policy is the easy part. The inventory is the work.",
    },
  ],
  faq: [
    {
      question: "How do I know if my policies are enforced?",
      answer:
        "Apply a deny rule to one pod. Then try to reach it from another. If you get through, nothing is being enforced. The YAML cannot tell you that.",
    },
    {
      question: "Why did DNS stop working after I applied default-deny?",
      answer:
        "CoreDNS runs as pods in another namespace, so your deny blocked the query. Add a rule that allows DNS on UDP and TCP 53.",
    },
    {
      question: "Can I write a deny rule for one specific case?",
      answer:
        "No. Rules only grant. They add up, so you make an exception by narrowing the allow you already wrote.",
    },
    {
      question: "Do NetworkPolicies work across nodes?",
      answer:
        "Yes. Rules apply per pod wherever it runs, and the CNI pushes them to every node. Plugins differ in how, not in what.",
    },
    {
      question: "Is domain-based egress filtering safe to rely on?",
      answer:
        "It is useful. It also ties your rules to how names get resolved. Know that before you lean on it as a boundary.",
    },
    {
      question: "Do I still need a service mesh?",
      answer:
        "For app-level rules, yes. NetworkPolicy works at layer 3 and 4. It says who may connect, not what they may ask for.",
    },
  ],
  sources: [
    {
      title: "Network Policies",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
    },
    {
      title: "Declare Network Policy",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/",
    },
    {
      title: "Cilium network policy",
      publisher: "CNCF Cilium Project",
      url: "https://docs.cilium.io/en/stable/security/policy/",
    },
    {
      title: "Calico network policy",
      publisher: "Tigera",
      url: "https://docs.tigera.io/calico/latest/network-policy/",
    },
    {
      title: "Configure your cluster for Kubernetes network policies",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/cni-network-policy.html",
    },
  ],
};
