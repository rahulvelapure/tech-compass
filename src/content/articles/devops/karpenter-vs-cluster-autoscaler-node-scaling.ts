import type { Article } from "../../types";

export const article: Article = {
  slug: "karpenter-vs-cluster-autoscaler-node-scaling",
  category: "devops",
  contentType: "comparison",
  subcategory: "Kubernetes",
  title: "Node groups made autoscaling a shape problem, not a capacity problem",
  seoTitle: "Karpenter vs Cluster Autoscaler: how node scaling changed",
  metaDescription:
    "Cluster Autoscaler adds nodes to fixed groups. Karpenter picks an instance to fit the pending pods. What changes, and what consolidation asks of you.",
  standfirst:
    "One asks for another node of a shape you chose in advance. The other looks at what is waiting and picks something that fits.",
  excerpt:
    "Cluster Autoscaler scales predefined node groups, so the shape of your nodes is decided before the workload exists. Karpenter provisions to fit pending pods — and then keeps rearranging.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "Karpenter vs Cluster Autoscaler",
  secondaryKeywords: [
    "Karpenter NodePool",
    "Kubernetes node autoscaling",
    "Karpenter consolidation",
    "spot instance interruption Kubernetes",
    "pod disruption budget Karpenter",
  ],
  tags: ["Kubernetes", "DevOps", "AWS", "Cloud", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-storage-classes-costs-performance-traps",
    "kubernetes-pod-networking-packet-flow",
  ],
  methodology:
    "Written from the Karpenter documentation, the Kubernetes Cluster Autoscaler documentation and AWS EKS best practices guidance, verified August 2026. Resource names are quoted from the current Karpenter API. No savings percentages, recovery timings or utilisation figures are given except where they are a documented default, which is labelled as such.",
  body: [
    {
      type: "p",
      text: "Kubernetes schedules pods onto nodes. When there is no room, something has to add a node. That job has been done the same way for years, and the way it was done shaped how clusters get built.",
    },
    {
      type: "p",
      text: "Cluster Autoscaler watches for pods that cannot be placed and asks the cloud provider for another node. The catch is in the word another. It adds a node to a group you defined in advance, and every node in that group is the same shape.",
    },
    {
      type: "p",
      text: "So the question stops being how much capacity you need and becomes which of your predefined shapes to add more of. Those are not the same question, and the gap between them is waste.",
    },
    { type: "h2", id: "bin-packing", text: "Where the waste comes from" },
    {
      type: "p",
      text: "Picture a pod that needs a modest slice of CPU and memory. Nothing has room, so it waits.",
    },
    {
      type: "p",
      text: "Cluster Autoscaler finds the node group that matches, and adds one node of whatever size that group defines. If the group holds large instances, you get a large instance. The pod schedules, and most of that node sits idle.",
    },
    {
      type: "p",
      text: "The usual mitigation is more node groups: a small one, a medium one, a memory-heavy one, one for each shape someone anticipated. That works, and it produces a lot of configuration to maintain.",
    },
    {
      type: "p",
      text: "It also introduces a sharper failure. Each group is tied to specific instance types. If those types are unavailable in that zone right now, the pod stays pending — even when plenty of other perfectly suitable instance types are available in the same zone. The autoscaler cannot see them, because they are not in the group.",
    },
    { type: "h2", id: "karpenter", text: "What Karpenter does instead" },
    {
      type: "p",
      text: "Karpenter removes the group from the middle of the decision. It looks at the pods that are waiting and works out what would actually fit.",
    },
    {
      type: "p",
      text: "You define a NodePool, but a NodePool is a set of boundaries rather than an instance size. It says which families are acceptable, which zones, whether spot capacity is allowed, and what limits apply. Inside those boundaries, the choice is made per request.",
    },
    {
      type: "ol",
      items: [
        "Pods cannot be scheduled and sit pending.",
        "Karpenter reads what they actually need — CPU, memory, selectors, tolerations, topology constraints.",
        "It matches them against the NodePools you defined.",
        "It asks the provider what is available right now that satisfies those needs, and picks.",
        "It creates a NodeClaim, the instance launches, joins, and the pods schedule.",
      ],
    },
    {
      type: "p",
      text: "The practical difference is at step four. The decision is made against current availability and current pricing, rather than against a list written months ago.",
    },
    { type: "h2", id: "spot", text: "Why this matters most for spot capacity" },
    {
      type: "p",
      text: "Spot instances are cheap because they can be reclaimed. You get a short warning and then the node goes.",
    },
    {
      type: "p",
      text: "With a node group pinned to one instance type, the replacement request asks for the same type — and the reason your instance was reclaimed is often that this type is under pressure. The request can fail, repeatedly, while the workload waits.",
    },
    {
      type: "p",
      text: "With broad boundaries instead, the replacement is not tied to the type that just went away. Something else that satisfies the same requirements can be launched instead. Flexibility is the whole value proposition of spot capacity, and node groups are the thing that removes it.",
    },
    { type: "h2", id: "consolidation", text: "Consolidation is the part to plan for" },
    {
      type: "p",
      text: "Scaling up is the easy half. Clusters get expensive because scaling down is timid.",
    },
    {
      type: "p",
      text: "Cluster Autoscaler removes a node only when it is sufficiently empty and the pods can move elsewhere. The threshold is configurable and conservative by design. It does not rearrange anything to create that situation, so a cluster drifts into fragmentation: several nodes, each lightly loaded, none empty enough to remove.",
    },
    {
      type: "p",
      text: "Karpenter actively defragments. If workloads would fit on fewer nodes, it will cordon one, evict what is running there, let it reschedule, and remove the node. The cluster keeps being repacked as it changes.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "This moves your pods, on purpose",
      text: "Consolidation is a disruption feature. Without pod disruption budgets, it can evict the only replica of something that cannot tolerate being evicted. Budgets are how you tell it what may move and how much at a time. They stop being good practice and start being a requirement.",
    },
    {
      type: "p",
      text: "The trade is explicit and worth stating plainly. You get a cluster that continuously costs close to what it needs, in exchange for workloads that must tolerate being moved. Most stateless services already do. Anything that does not needs to say so.",
    },
    { type: "h2", id: "mistakes", text: "Three mistakes worth avoiding" },
    {
      type: "p",
      text: "**Narrow NodePools.** Restricting a NodePool to two instance types recreates the problem you were solving, with different configuration. The value comes from breadth. Allow whole families, and let the constraints on pods do the fine-grained work.",
    },
    {
      type: "p",
      text: "**Running both autoscalers.** They will make competing decisions about the same pending pods, and the result is over-provisioning and churn. Migration means removing the old one, not layering the new one on top.",
    },
    {
      type: "p",
      text: "**No disruption budgets.** Covered above, and it is the one that turns a cost improvement into an incident. Put budgets in place before consolidation is enabled, not after.",
    },
    { type: "h2", id: "choosing", text: "Choosing between them" },
    {
      type: "table",
      caption: "Where each approach fits",
      head: ["Cluster Autoscaler when", "Karpenter when"],
      rows: [
        [
          "Your platform has no supported equivalent",
          "You are on a platform where it is supported",
        ],
        [
          "Infrastructure must come from declared groups",
          "You want provisioning to follow the workload",
        ],
        [
          "Workloads cannot tolerate being moved",
          "Workloads are mostly stateless and rescheduleable",
        ],
        [
          "The cluster is small and shapes are uniform",
          "You use spot capacity, or shapes vary widely",
        ],
      ],
    },
    {
      type: "p",
      text: "That first row has been changing. Karpenter began as an AWS project and is now developed in the open under the Kubernetes autoscaling community, with other platforms building on it — Azure's node autoprovisioning is Karpenter-based. Check what your provider currently supports rather than assuming it is AWS-only.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Give NodePools wide boundaries. Narrow ones rebuild the constraint you were removing.",
        "Write disruption budgets before you enable consolidation.",
        "Remove the old autoscaler when you migrate. Two of them is worse than either.",
        "Expect pods to move. If something cannot, make that explicit rather than hoping.",
        "Watch what it provisions and why. The metrics are how you tell whether your boundaries are sensible.",
      ],
    },
    {
      type: "p",
      text: "The shift here is small to describe and large in effect. Deciding node shapes in advance made sense when instance types were something you picked quarterly. Once the provider offers hundreds and prices move constantly, choosing at the moment of need is simply better information. What you give up is predictability about which machines you are running, which is a fair trade for most workloads and a genuine problem for a few.",
    },
  ],
  faq: [
    {
      question: "Why does Cluster Autoscaler leave nodes half empty?",
      answer:
        "It only removes a node that is already nearly empty, and it will not shuffle pods to make that happen. Over time you get several lightly used nodes and none that can go.",
    },
    {
      question: "Can I run Karpenter and Cluster Autoscaler together?",
      answer:
        "No. They will both react to the same pending pods and fight. Remove the old one as part of the move.",
    },
    {
      question: "Do I need pod disruption budgets?",
      answer:
        "Yes. Consolidation moves pods on purpose. Without budgets it can evict the one replica you could not afford to lose. Write them first.",
    },
    {
      question: "Why is Karpenter better for spot capacity?",
      answer:
        "Because it is not tied to one instance type. When capacity is reclaimed it can pick something else that fits. A fixed node group asks for the same type that just ran out.",
    },
    {
      question: "Is Karpenter only for AWS?",
      answer:
        "It started there, but it is now built in the open and other platforms use it. Azure node autoprovisioning is based on it. Check what your provider supports today.",
    },
  ],
  sources: [
    {
      title: "Karpenter documentation: concepts and NodePools",
      publisher: "Karpenter",
      url: "https://karpenter.sh/docs/concepts/nodepools/",
    },
    {
      title: "Karpenter documentation: disruption and consolidation",
      publisher: "Karpenter",
      url: "https://karpenter.sh/docs/concepts/disruption/",
    },
    {
      title: "Cluster Autoscaler FAQ",
      publisher: "Kubernetes Autoscaler",
      url: "https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md",
    },
    {
      title: "Specifying a Disruption Budget for your Application",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/tasks/run-application/configure-pdb/",
    },
    {
      title: "EKS Best Practices Guide: cluster autoscaling",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/best-practices/cas.html",
    },
  ],
};
