import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-resourcequota-vs-limitrange-namespace-governance",
  category: "devops",
  contentType: "explainer",
  subcategory: "Kubernetes",
  title: "There is no Pending pod to look at, because no pod was ever made",
  seoTitle: "ResourceQuota vs LimitRange: Namespace Governance",
  metaDescription:
    "ResourceQuota sets a namespace budget; LimitRange sets per-container defaults. How they combine at admission, and why a quota failure leaves no pod behind.",
  standfirst:
    "One sets the budget. The other decides what a pod asks for. Run just one of them and something breaks quietly.",
  excerpt:
    "A quota rejection happens before the pod exists, so kubectl get pods shows an empty list and the reason is written somewhere most people never look.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-27",
  nextReviewAt: "2027-08-27",
  readingMinutes: 8,
  primaryKeyword: "Kubernetes ResourceQuota LimitRange namespace governance",
  secondaryKeywords: [
    "quota admission rejection",
    "LimitRange defaultRequest",
    "maxLimitRequestRatio",
    "scopeSelector PriorityClass",
    "FailedCreate ReplicaSet events",
  ],
  tags: ["Kubernetes", "Platform engineering", "DevOps", "Governance", "Capacity"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-storage-classes-costs-performance-traps",
    "karpenter-vs-cluster-autoscaler-node-scaling",
  ],
  methodology:
    "Written from the Kubernetes documentation on resource quotas, limit ranges and resource management for pods and containers, verified August 2026. One correction was made against the source draft. The draft describes a quota failure as a pod stuck in Pending with the reason in its events. Quota is enforced at admission, so the pod object is never created and has no events; for a Deployment the failure surfaces on the ReplicaSet instead. That changes where you look, which is the practical half of the problem.",
  body: [
    {
      type: "p",
      text: "You apply a Deployment. It is accepted. Then nothing happens.",
    },
    {
      type: "p",
      text: "There are no pods. Not Pending, not failing, not there at all. The Deployment reports replicas it does not have, and kubectl get pods returns an empty list.",
    },
    {
      type: "p",
      text: "This is what a quota rejection looks like from the outside, and the reason it confuses people is that everyone is looking for a pod.",
    },
    { type: "h2", id: "admission", text: "Why there is nothing to inspect" },
    {
      type: "p",
      text: "Quota is enforced at admission. The API server evaluates the request before the object is written, and rejects it with a 403 if it would breach the budget.",
    },
    {
      type: "p",
      text: "So the pod is never created. It has no status, no events and no name. Describing something that does not exist tells you nothing, which is exactly what people try first.",
    },
    {
      type: "p",
      text: "You almost never submit a pod directly, though. You submit a Deployment, and that is where the confusion comes from.",
    },
    {
      type: "p",
      text: "The Deployment is not a pod, so it passes admission fine. Its ReplicaSet then tries to create pods and is refused each time. The error lands on the ReplicaSet.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "kubectl describe replicaset -n team-a | grep -A5 Events\nkubectl describe resourcequota -n team-a",
    },
    {
      type: "p",
      text: "The first command shows FailedCreate with the constraint that was breached. The second shows how much of the budget is spent. Between them, the answer is usually immediate.",
    },
    { type: "h2", id: "quota", text: "ResourceQuota is a namespace budget" },
    {
      type: "p",
      text: "A ResourceQuota caps totals across a namespace. It counts three different kinds of thing, and they are worth separating in your head:",
    },
    {
      type: "table",
      caption: "What a ResourceQuota can limit",
      head: ["Kind", "Examples", "Counted across"],
      rows: [
        ["Compute", "requests.cpu, limits.memory", "All pods not in a terminal state"],
        ["Storage", "requests.storage, per-StorageClass claims", "All PersistentVolumeClaims"],
        ["Object counts", "pods, services, secrets, configmaps", "All objects of that type"],
      ],
    },
    {
      type: "p",
      text: "The object counts matter more than they look. A pod cap is a cap on everything, and that includes things you did not deploy yourself. DaemonSet pods, sidecars injected by a mesh and monitoring agents all sit inside the same namespace budget.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The rule that catches every team once",
      text: "If a quota limits cpu or memory, then every new pod in that namespace must state a request or a limit for that resource. A manifest with no resources block is rejected outright. This is why adding a quota to an existing namespace breaks deployments that worked yesterday, and why a quota on its own is rarely the right change.",
    },
    { type: "h2", id: "limitrange", text: "LimitRange decides what a pod asks for" },
    {
      type: "p",
      text: "A LimitRange works on individual containers rather than totals. It does three separate jobs, and teams usually only think about one of them.",
    },
    {
      type: "p",
      text: "It supplies defaults. A container that names no resources is given defaultRequest and default as it is admitted. That is what stops a quota turning away every file nobody has edited.",
    },
    {
      type: "p",
      text: "It sets bounds. A container asking below min or above max is rejected, which stops one workload claiming most of a node.",
    },
    {
      type: "p",
      text: "It constrains the gap between the two. maxLimitRequestRatio caps how far a limit may exceed its request. Without it, a container can request very little and burst enormously, which is how nodes end up oversubscribed.",
    },
    {
      type: "code",
      language: "yaml",
      filename: "limitrange.yaml",
      code: 'apiVersion: v1\nkind: LimitRange\nmetadata:\n  name: team-a-defaults\n  namespace: team-a\nspec:\n  limits:\n    - type: Container\n      defaultRequest:\n        cpu: 200m\n        memory: 256Mi\n      default:\n        cpu: 500m\n        memory: 512Mi\n      max:\n        cpu: "2"\n        memory: 4Gi\n      min:\n        cpu: 50m\n        memory: 64Mi\n      maxLimitRequestRatio:\n        cpu: "4"',
    },
    {
      type: "p",
      text: "The type field matters. Container applies per container, Pod applies to the sum across a pod, and PersistentVolumeClaim bounds storage requests against the [StorageClass](/devops/kubernetes-storage-classes-costs-performance-traps) behind them. A Pod-level max is the one that catches a workload with many small sidecars.",
    },
    { type: "h2", id: "order", text: "What happens, in order" },
    {
      type: "p",
      text: "The two objects run at the same moment, in a fixed sequence. Knowing it explains most of the odd results.",
    },
    {
      type: "ol",
      items: [
        "The pod spec arrives at the API server.",
        "LimitRange fills in anything the spec left out, using defaultRequest and default.",
        "LimitRange checks the result against min, max and the ratio. A breach is rejected here.",
        "ResourceQuota adds the now-complete numbers to the namespace total.",
        "If the total would exceed the budget, the request is rejected with a 403.",
      ],
    },
    {
      type: "p",
      text: "Step two is the load-bearing one. Quota counts what the pod asks for after defaults are applied, not what the author wrote. So a LimitRange default that is generous quietly consumes the budget faster than anyone intended.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Defaults are applied once, at creation",
      text: "Changing a LimitRange does not touch pods that already exist. They keep the values they were admitted with until something recreates them. A tightened default therefore appears to do nothing, then takes effect unevenly during the next rollout, which makes the change hard to attribute later.",
    },
    { type: "h2", id: "traps", text: "The failures that do not announce themselves" },
    {
      type: "p",
      text: "A quota rejection is loud once you know where to look. The other failure mode is silent.",
    },
    {
      type: "p",
      text: "If the CPU default is too low, pods still start. They are simply throttled against a limit nobody chose deliberately. The application is slow, the pod is Running, and no event anywhere mentions the LimitRange that set the number.",
    },
    {
      type: "p",
      text: "Memory behaves differently, and worse. A default memory limit that is too low does not throttle. The kernel kills the container, and the pod restarts with an exit code that says nothing about where the limit came from.",
    },
    {
      type: "p",
      text: "There is one more lever worth knowing. A quota can be scoped, so it applies only to part of a namespace. Scoping by PriorityClass lets you budget critical workloads separately from batch jobs in the same place.",
    },
    {
      type: "code",
      language: "yaml",
      code: 'spec:\n  scopeSelector:\n    matchExpressions:\n      - operator: In\n        scopeName: PriorityClass\n        values: ["high-priority"]',
    },
    { type: "h2", id: "verify", text: "Checking what is actually in force" },
    {
      type: "p",
      text: "Both objects are namespace-scoped, and neither shows up when you look at a pod. So it is worth being able to read the current state directly.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "kubectl get resourcequota -n team-a -o wide\nkubectl describe limitrange -n team-a\nkubectl get pod mypod -n team-a -o jsonpath='{.spec.containers[*].resources}'",
    },
    {
      type: "p",
      text: "The first two show the rules. The third shows what one pod actually got, after defaults were applied.",
    },
    {
      type: "p",
      text: "Compare those numbers against the manifest in your repository. If they differ, a LimitRange filled the gap, and that is the value your quota is being charged for.",
    },
    {
      type: "p",
      text: "One more habit is worth building. When a quota fills, the useful question is which workload grew, not what the total is now. Sort pods by request and the answer is usually a single deployment that scaled or a sidecar that arrived with a chart upgrade.",
    },
    { type: "h2", id: "practice", text: "How to roll this out without an outage" },
    {
      type: "ol",
      items: [
        "Measure first. Take actual usage per namespace over a normal week, including sidecars and agents.",
        "Create the LimitRange before the quota. Defaults must exist before anything starts requiring them.",
        "Set defaults from observed usage, not from round numbers that look tidy.",
        "Add the quota with real headroom above peak, then tighten it once you have seen a full cycle.",
        "Alert at around eighty percent of the budget. A full quota is an outage that has already started.",
        "Recheck after any change to sidecar injection. Those containers spend the budget and nobody assigns them.",
      ],
    },
    {
      type: "p",
      text: "Treat both objects as part of the namespace, created with it rather than added later. Retrofitting them onto a busy namespace is where the outages come from, because every manifest that omitted resources starts failing at the same moment.",
    },
    {
      type: "p",
      text: "The goal is not to stop teams from using the cluster. It is to make the ceiling visible before someone hits it, and to make the reason legible when they do.",
    },
  ],
  faq: [
    {
      question: "Why do I see no pods at all?",
      answer: "The quota said no before they were made. Look at the ReplicaSet, not the pod list.",
    },
    {
      question: "Do I need both of them?",
      answer:
        "Almost always. Set a quota with no defaults, and any file that skips resources is turned away.",
    },
    {
      question: "Do DaemonSet pods count?",
      answer: "Yes. Any pod in the namespace counts, whoever created it. Budget for them.",
    },
    {
      question: "Will a new LimitRange change running pods?",
      answer: "No. They keep what they had. The new values apply the next time they are made.",
    },
    {
      question: "What if a team needs more than the max?",
      answer: "Raise the max, or give them a scoped quota. Do not remove the bound for everyone.",
    },
    {
      question: "Why is my pod slow but healthy?",
      answer:
        "Check its CPU limit. A low default throttles the container without any event to show it.",
    },
  ],
  sources: [
    {
      title: "Resource Quotas",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/policy/resource-quotas/",
    },
    {
      title: "Limit Ranges",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/policy/limit-range/",
    },
    {
      title: "Resource Management for Pods and Containers",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
    },
    {
      title: "Configure Memory and CPU Quotas for a Namespace",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/",
    },
    {
      title: "Pod Priority and Preemption",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/",
    },
  ],
};
