import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-topology-spread-constraints-vs-pod-anti-affinity",
  category: "devops",
  contentType: "comparison",
  subcategory: "Kubernetes",
  title: "One rule says never; the other says how uneven you can live with",
  seoTitle: "Topology Spread Constraints vs Pod Anti-Affinity",
  metaDescription:
    "Hard anti-affinity turns a capacity shortage into pods stuck Pending. How maxSkew and whenUnsatisfiable let you ask for spread without demanding it.",
  standfirst:
    "Anti-affinity asks a yes or no question, and the answer is often no. Spread rules ask how uneven things are. That question has a middle you can use.",
  excerpt:
    "The difference shows up on a bad day, not a good one. Both distribute pods when capacity is plentiful; only one still schedules when a zone runs out of instances.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-15",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 6,
  primaryKeyword: "Kubernetes Topology Spread Constraints vs Pod Anti-Affinity",
  secondaryKeywords: [
    "maxSkew",
    "whenUnsatisfiable DoNotSchedule",
    "pod anti-affinity deadlock",
    "Kubernetes scheduler topology",
    "spreading pods across zones",
  ],
  tags: ["Kubernetes", "Scheduling", "Resilience", "DevOps", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-pod-disruption-budgets-eviction-mechanics",
    "karpenter-vs-cluster-autoscaler-node-scaling",
  ],
  methodology:
    "Written from the Kubernetes documentation on pod topology spread constraints and on assigning pods to nodes, verified August 2026. One correction was made to the source draft. It said a hard anti-affinity rule blocks a node drain from completing; eviction removes the pod regardless, and what actually happens is that the replacement cannot be scheduled — the drain succeeds and the workload is left short. The draft's Black Friday incident was rewritten as the capacity mechanism that produces it.",
  body: [
    {
      type: "p",
      text: "Spread your replicas across failure domains. Nobody argues with that one. Put every copy of a service in one zone, and the day you lose that zone you lose the service too.",
    },
    {
      type: "p",
      text: "Kubernetes gives you two ways to ask for it. They read as near-synonyms and behave differently at exactly the moment it matters.",
    },
    {
      type: "p",
      text: "On a healthy cluster with spare capacity everywhere, both work and you cannot tell them apart. The difference only appears when the cluster cannot give you what you asked for.",
    },
    { type: "h2", id: "anti-affinity", text: "Anti-affinity is a rule with no middle" },
    {
      type: "p",
      text: "Pod anti-affinity tells the scheduler not to place this pod where a matching pod already sits. You choose the domain with a topology key — a node, a zone, a rack.",
    },
    {
      type: "p",
      text: "Set it as required and it is absolute. No matching pod in this domain, or no placement. There is no notion of preferring, and no notion of nearly.",
    },
    {
      type: "p",
      text: "That is fine while replicas are fewer than domains. Three replicas across three zones works exactly as intended.",
    },
    {
      type: "p",
      text: "Scale to four and the fourth pod has nowhere to go. Every zone already holds one, the rule forbids a second, and no amount of spare capacity helps. The pod stays Pending, and it will stay Pending until something changes the rule or the topology.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The drain does not hang; the workload just gets smaller",
      text: "A common claim is that hard anti-affinity blocks a node drain. It does not. Eviction removes the pod, and that succeeds. What fails is the replacement: the scheduler looks for a domain without a matching pod, finds none, and leaves it Pending. So the drain completes, the node goes away, and you are running one replica short with no error anywhere except a Pending pod nobody is watching. That is worse than a hang, because a hang is visible.",
    },
    {
      type: "p",
      text: 'The preferred form avoids all of this by being advisory, and it is genuinely useful. It is also weak: the scheduler will happily stack every replica in one zone if that is where the room is. It cannot express "spread, but not at the cost of running", which is the thing most teams actually want.',
    },
    { type: "h2", id: "spread", text: "Spread constraints ask a different question" },
    {
      type: "p",
      text: "A topology spread constraint replaces the yes-or-no test with a measurement. It counts matching pods in each domain and looks at the difference between the fullest and the emptiest. That difference is the skew.",
    },
    {
      type: "p",
      text: "You set `maxSkew` to the imbalance you will tolerate. With `maxSkew: 1` and three zones, four pods distribute as two, one and one. The skew is one, which is allowed. Nothing demands the counts be equal, and with four pods across three zones they cannot be.",
    },
    {
      type: "code",
      language: "yaml",
      filename: "deployment.yaml",
      code: "topologySpreadConstraints:\n  - maxSkew: 1\n    topologyKey: topology.kubernetes.io/zone\n    whenUnsatisfiable: ScheduleAnyway\n    labelSelector:\n      matchLabels:\n        app: checkout\n  - maxSkew: 1\n    topologyKey: kubernetes.io/hostname\n    whenUnsatisfiable: ScheduleAnyway\n    labelSelector:\n      matchLabels:\n        app: checkout",
    },
    {
      type: "p",
      text: "Two constraints, weighed together. The first spreads across zones. The second spreads across nodes inside them. A pod has to meet both, so the scheduler wants where they overlap. It does not pick one.",
    },
    { type: "h2", id: "unsatisfiable", text: "whenUnsatisfiable is the whole decision" },
    {
      type: "p",
      text: "This field decides what happens when the constraint cannot be met, and it is where the real choice lives.",
    },
    {
      type: "table",
      caption: "The two behaviours, and what each one costs.",
      head: ["Value", "When it cannot be satisfied", "Failure mode"],
      rows: [
        ["`DoNotSchedule`", "The pod stays Pending", "Availability, when capacity is short"],
        ["`ScheduleAnyway`", "Placed where it fits, skew ignored", "Balance, quietly"],
      ],
    },
    {
      type: "p",
      text: "`DoNotSchedule` is anti-affinity again, in a form that says more. Sometimes the need really is absolute. A regulator asks for it, or one zone holding everything is never acceptable. Then it is the right setting, and Pending is the right outcome.",
    },
    {
      type: "p",
      text: "`ScheduleAnyway` makes the constraint a strong preference. The scheduler still ranks nodes to reduce skew, so on a normal day the distribution looks the same. On the day one zone has no capacity, the pods land somewhere rather than not at all.",
    },
    {
      type: "p",
      text: "Choosing between them is choosing which failure you prefer. `DoNotSchedule` protects the shape of the deployment and risks the size of it. `ScheduleAnyway` protects the size and risks the shape. Neither is right generally, and both are right for particular services.",
    },
    { type: "h2", id: "capacity", text: "The scenario that decides it" },
    {
      type: "p",
      text: "Consider what happens when a zone runs out of the instance type you use. This is ordinary, not exotic — capacity is per zone and per type, and demand spikes are correlated across tenants.",
    },
    {
      type: "p",
      text: "Autoscaling asks for nodes. Two zones deliver, the third refuses. Now your deployment wants to grow into a topology that has become two-thirds of what you designed for.",
    },
    {
      type: "p",
      text: "With hard anti-affinity, or `DoNotSchedule`, the replicas that will not fit stay Pending. That is the rule you wrote, working. It just lands in the middle of the traffic spike that set off the scale-up.",
    },
    {
      type: "p",
      text: "With `ScheduleAnyway`, they land in the two zones that have room. You are less balanced than you wanted and you are serving traffic. When the third zone recovers, new pods will prefer it and the balance returns on its own.",
    },
    {
      type: "p",
      text: "Which one you want depends on whether losing a zone is worse than being short of capacity. For most user-facing services it is not, and `ScheduleAnyway` is the better default.",
    },
    { type: "h2", id: "autoscaler", text: "The autoscaler has to know about this too" },
    {
      type: "p",
      text: "Spread constraints tell the scheduler where a pod may go. They do not tell the thing that creates nodes what to create.",
    },
    {
      type: "p",
      text: "Say your node provisioner adds capacity in whichever zone is easiest. The scheduler keeps refusing to use it. Now you have Pending pods sitting next to idle nodes. The provisioner has to read what the waiting pods need and place nodes to match. They differ a lot here, which is part of [Karpenter versus Cluster Autoscaler](/devops/karpenter-vs-cluster-autoscaler-node-scaling).",
    },
    {
      type: "p",
      text: "Two smaller things are worth knowing. Spread constraints beat nothing else. A pod that cannot meet its resource requests, or its node rules, stays Pending even with `ScheduleAnyway`. The constraint is not the reason. And the count only covers pods your selector matches. So two deployments spreading on their own can still pile up in the same place.",
    },
    {
      type: "p",
      text: "One last thing. Spread rules cover placement, not eviction. Keeping a spread deployment whole during planned disruption is a different control — see [pod disruption budgets](/devops/kubernetes-pod-disruption-budgets-eviction-mechanics).",
    },
  ],
  faq: [
    {
      question: "Does maxSkew of 1 mean every zone gets the same count?",
      answer:
        "No. It caps the gap between the fullest and emptiest zone. Four pods across three zones become two, one and one. That skew is one, and it is allowed.",
    },
    {
      question: "Why is my pod Pending with hard anti-affinity?",
      answer:
        "Every domain already holds a pod that matches. The rule has no middle ground, so the scheduler says no. Spare room elsewhere does not help.",
    },
    {
      question: "Does anti-affinity block a node drain?",
      answer:
        "No. The eviction works and the node goes away. What fails is placing the new pod. So you quietly run one replica short.",
    },
    {
      question: "Should I use DoNotSchedule or ScheduleAnyway?",
      answer:
        "Decide which failure you prefer. `DoNotSchedule` keeps the shape and risks the size. `ScheduleAnyway` keeps the size and risks the shape.",
    },
    {
      question: "Why is my pod Pending even with ScheduleAnyway?",
      answer:
        "Something else is in the way. Resource requests, a node selector, or a hard node rule. Spread constraints beat none of those.",
    },
    {
      question: "Can I spread across zones and nodes at once?",
      answer:
        "Yes. Write two constraints with different topology keys. The scheduler then needs a node that meets both, not just one.",
    },
  ],
  sources: [
    {
      title: "Pod topology spread constraints",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/",
    },
    {
      title: "Assigning pods to nodes",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/",
    },
    {
      title: "Kubernetes scheduler",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/",
    },
  ],
};
