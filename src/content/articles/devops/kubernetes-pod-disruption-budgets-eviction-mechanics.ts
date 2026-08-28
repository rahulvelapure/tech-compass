import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-pod-disruption-budgets-eviction-mechanics",
  category: "devops",
  contentType: "explainer",
  subcategory: "Kubernetes",
  title: "A disruption budget is a promise the cluster has to keep, even when it cannot",
  seoTitle: "Pod Disruption Budgets: Eviction Math and Failure Modes",
  metaDescription:
    "PDBs decide whether an eviction is allowed. Get the arithmetic wrong and a node drain never finishes. How minAvailable, maxUnavailable and rounding actually behave.",
  standfirst:
    "A budget does not protect an app. It refuses evictions. That is a narrower thing, and now and then the opposite of what you wanted.",
  excerpt:
    "The Eviction API asks a budget for permission and takes no for an answer indefinitely. That is the whole design, and it explains both the protection PDBs give and the drains they block forever.",
  authorId: "rahul-velapure",
  publishedAt: "2026-04-06",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "Kubernetes Pod Disruption Budgets",
  secondaryKeywords: [
    "minAvailable vs maxUnavailable",
    "Kubernetes Eviction API 429",
    "node drain stuck PDB",
    "PDB percentage rounding",
    "voluntary disruption Kubernetes",
  ],
  tags: ["Kubernetes", "DevOps", "Reliability", "Cluster Operations"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "karpenter-vs-cluster-autoscaler-node-scaling",
    "kubernetes-storage-classes-costs-performance-traps",
  ],
  methodology:
    "Written from the current Kubernetes disruptions and PDB documentation, verified August 2026. The source draft's claim that rounding always favours the application was corrected — rounding up maxUnavailable permits more disruption than the percentage suggests — along with its description of custom controllers, which are supported when they expose the scale subresource. An invented incident narrative and its timings were removed.",
  body: [
    {
      type: "p",
      text: "Draining a node looks like a routine cluster task. It is closer to a request that can be refused. The budget you wrote is the thing that refuses it.",
    },
    {
      type: "p",
      text: "That one idea explains almost every Pod Disruption Budget (PDB) problem people hit. It covers the ones where the budget was set exactly as intended, and the cluster still stopped working.",
    },
    { type: "h2", id: "eviction", text: "Eviction is a request, not a command" },
    {
      type: "p",
      text: "Deleting a pod is unconditional. You ask the API server to remove the object and it does.",
    },
    {
      type: "p",
      text: "Draining does not delete. It creates an Eviction, which the API server checks against every PDB whose selector matches the pod. If allowing it would breach a budget, the request is refused with a 429. If not, the pod is deleted and its controller replaces it elsewhere.",
    },
    {
      type: "p",
      text: "Whatever is doing the draining then has to decide what to do with that refusal. In practice it waits and asks again, hoping a replacement has become ready in the meantime. It will keep asking. Nothing in the design gives up, which is why a badly specified budget does not produce an error — it produces a drain that runs forever.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Only voluntary disruptions are covered",
      text: "A PDB holds back the things that go through the Eviction API. That means drains, autoscaler consolidation, and anything an operator sets off on purpose. A node that loses power, panics, or is terminated abruptly by the provider does not consult anything. The pods are simply gone and the controller replaces them. Budgets are an availability contract for maintenance, not a fault-tolerance mechanism.",
    },
    {
      type: "h2",
      id: "arithmetic",
      text: "The maths, and the part that catches people out",
    },
    {
      type: "p",
      text: "A budget is expressed one of two ways, and they are mutually exclusive. `minAvailable` sets a floor on pods that must stay up. `maxUnavailable` sets a ceiling on pods that may be down.",
    },
    {
      type: "p",
      text: "With plain numbers, what happens is obvious. With percentages it pays to be exact. Both of them round up, and what that buys you differs.",
    },
    {
      type: "table",
      caption: "Percentages, and what rounding up means in each direction",
      head: ["Setting", "Replicas", "Raw value", "After rounding", "Disruptions allowed"],
      rows: [
        ["`minAvailable: 50%`", "3", "1.5 must stay up", "2 must stay up", "1"],
        ["`maxUnavailable: 25%`", "3", "0.75 may be down", "1 may be down", "1"],
        ["`maxUnavailable: 10%`", "5", "0.5 may be down", "1 may be down", "1"],
      ],
    },
    {
      type: "p",
      text: "Round up `minAvailable` and you lift the floor. That guards the app more than the percentage suggests. Round up `maxUnavailable` and you lift the ceiling, so more can go at once than you asked for. The documentation says so directly: a disruption can exceed the `maxUnavailable` percentage you defined.",
    },
    {
      type: "p",
      text: "That asymmetry matters most at small replica counts, where a single rounding step is a large fraction of the workload. At three replicas, ten percent and thirty percent are the same policy.",
    },
    {
      type: "p",
      text: "Percentages earn their place when replica counts move. A workload that scales between three and thirty needs a budget that scales too. A fixed number written for the low end means nothing at the high end. Write it for the high end and it blocks everything at the low end.",
    },
    { type: "h2", id: "deadlock", text: "Three ways to build a drain that never finishes" },
    {
      type: "p",
      text: "Every one of these is a budget doing exactly what it was told.",
    },
    { type: "h3", id: "zero", text: "A budget that permits nothing" },
    {
      type: "p",
      text: "`maxUnavailable: 0`, or `minAvailable` set to the full replica count, means no eviction is ever allowed. Drains do not fail; they wait. Node upgrades stop. Consolidation stops. The cluster keeps running and quietly stops being maintainable.",
    },
    {
      type: "p",
      text: "If a workload genuinely cannot lose a single replica for a moment, the budget is not the problem to solve. The replica count or the architecture is.",
    },
    { type: "h3", id: "nowhere", text: "A replacement with nowhere to go" },
    {
      type: "p",
      text: "This one is harder to see because the budget is reasonable. Evicting a pod is permitted, so the eviction succeeds. The controller creates a replacement, and the replacement cannot be scheduled — no node satisfies its affinity, its taints, its resource request, or the zone its volume lives in.",
    },
    {
      type: "p",
      text: "The pod stays Pending, so it is not available, so the budget now blocks the next eviction. The drain stalls on a condition that has nothing to do with the node being drained. Volume topology is a common cause, and the reasons a claim pins a pod to one zone are covered in [storage classes and their costs](/devops/kubernetes-storage-classes-costs-performance-traps).",
    },
    { type: "h3", id: "controller", text: "A selector over pods nothing owns" },
    {
      type: "p",
      text: "Budgets work with the built-in controllers: Deployments, ReplicaSets, ReplicationControllers and StatefulSets. Since v1.15 they work with your own controllers too. Those just have to expose the scale subresource. That last part is often stated wrongly: a custom controller is not automatically unsupported.",
    },
    {
      type: "p",
      text: "What does not work is a selector that matches pods with no controller able to recreate them. The budget blocks evictions until enough pods are available, and nothing exists to make them available. Bare pods and completed Jobs are the usual culprits, and a loose label selector is the usual way they get included by accident.",
    },
    { type: "h2", id: "autoscaling", text: "Budgets and the cost of an idle node" },
    {
      type: "p",
      text: "Scale-down is a voluntary disruption, so budgets govern it. When a provisioner decides a node is underused it tries to drain it; if a budget refuses, the node stays, and so does the bill.",
    },
    {
      type: "p",
      text: "This is the quiet failure mode. Nothing alerts. Nothing is broken. Consolidation simply never happens, and the cluster is more expensive than it should be for reasons that live in a policy object nobody has looked at in months.",
    },
    {
      type: "p",
      text: "The provisioner's own controls sit on top of that. Infrastructure-level disruption limits — how many nodes may churn at once, when churn is allowed — are a separate layer from the application's budget, and the application's budget wins. Where those layers meet is covered in [Karpenter and cluster autoscaling](/devops/karpenter-vs-cluster-autoscaler-node-scaling).",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Alert on disruptions allowed reaching zero",
      text: "kube-state-metrics exposes `kube_poddisruptionbudget_status_pod_disruptions_allowed`. When it sits at zero, that budget is currently refusing every eviction — which is correct during a rollout and a problem if it persists. Alerting on a sustained zero catches both the misconfigured budget and the workload that has quietly stopped being able to reschedule, long before someone finds it during an upgrade.",
    },
    { type: "h2", id: "design", text: "Writing one that works" },
    {
      type: "ul",
      items: [
        "**Prefer maxUnavailable for stateless work.** It expresses the thing you care about — how much can be down at once — and it holds as replicas change.",
        "**Prefer minAvailable for quorum systems.** A database or a broker cares about a floor, and the floor is a property of the quorum rather than a fraction of the replicas.",
        "**Spread before you budget.** A budget cannot help if every replica is on one node. Topology spread constraints are what make the budget satisfiable during a drain.",
        "**Check the arithmetic at your actual replica count**, not the one in the example you copied. Two replicas with `minAvailable: 50%` permits exactly one eviction; two with `minAvailable: 1` is the same thing written more clearly.",
        "**Remember termination is separate.** A budget governs whether an eviction starts. Once allowed, the pod gets SIGTERM and its grace period — an application that takes minutes to exit makes every drain take minutes.",
      ],
    },
    {
      type: "p",
      text: "Deleting the budget is the standard emergency unblock, and it works. It also drops the protection while someone is already trying to fix the cluster. So it belongs in a runbook, with the follow-up written down. Not decided in the moment.",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "Eviction asks permission. A refusal is not an error, and the retry loop does not end.",
        "Both percentage forms round up, but rounding up a ceiling permits more disruption, not less.",
        "Budgets cover voluntary disruption only. A node that just dies ignores them.",
        "Most stuck drains are really scheduling failures wearing a budget as a disguise.",
        "A budget that blocks consolidation costs you money, and it does so quietly. Alert when the count of allowed disruptions hits zero.",
        "Spread constraints are what make a budget achievable. Write both or neither.",
      ],
    },
  ],
  faq: [
    {
      question: "Does a PDB protect against a node crashing?",
      answer:
        "No. It only covers evictions asked for through the API. A node that fails hard takes its pods with it and asks nothing.",
    },
    {
      question: "Why is my node drain hanging with no error?",
      answer:
        "A budget is refusing the eviction, so the drain keeps trying. Check whether a new pod is stuck Pending. That is usually the real cause.",
    },
    {
      question: "Do percentages round up or down?",
      answer:
        "Both round up. A floor set as a percentage guards you more than the number suggests. A ceiling set that way allows more disruption than it suggests.",
    },
    {
      question: "Can a PDB cover pods from a custom controller?",
      answer:
        "Yes, if the controller exposes the scale subresource. What fails is picking pods that nothing can recreate, such as bare pods.",
    },
    {
      question: "Is deleting the PDB a safe way to unblock an upgrade?",
      answer:
        "It works, and it is common. It also drops the protection mid-incident. Treat it as a deliberate step with a follow-up, not a fix.",
    },
  ],
  sources: [
    {
      title: "Disruptions",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/concepts/workloads/pods/disruptions/",
    },
    {
      title: "Specifying a Disruption Budget for your Application",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/tasks/run-application/configure-pdb/",
    },
    {
      title: "Safely Drain a Node",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/",
    },
    {
      title: "kube-state-metrics: PodDisruptionBudget metrics",
      publisher: "Kubernetes SIG Instrumentation",
      url: "https://github.com/kubernetes/kube-state-metrics/blob/main/docs/metrics/workload/poddisruptionbudget-metrics.md",
    },
  ],
};
