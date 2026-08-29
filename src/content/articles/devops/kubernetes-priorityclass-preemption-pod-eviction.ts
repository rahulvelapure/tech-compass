import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-priorityclass-preemption-pod-eviction",
  category: "devops",
  contentType: "explainer",
  subcategory: "Kubernetes",
  title: "Priority decides who gets scheduled, not who gets to keep running",
  seoTitle: "Kubernetes PriorityClass: Preemption and Eviction",
  metaDescription:
    "What the scheduler does when a high-priority pod will not fit, why a disruption budget does not reliably stop it, and where priority has no effect at all.",
  standfirst:
    "A priority class buys a place in the queue. It buys nothing at runtime. And the one promise people assume it gives is the one it does not.",
  excerpt:
    "Preemption tries to respect disruption budgets and will override them if it cannot find another way. That single sentence changes how you design priorities and budgets together.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-06",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 4,
  primaryKeyword: "Kubernetes PriorityClass preemption eviction",
  secondaryKeywords: [
    "pod priority scheduling",
    "preemptionPolicy Never",
    "system-node-critical",
    "preemption disruption budget",
    "graceful termination victims",
  ],
  tags: ["Kubernetes", "Scheduling", "Resilience", "DevOps", "Operations"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-pod-disruption-budgets-eviction-mechanics",
    "kubernetes-topology-spread-constraints-vs-pod-anti-affinity",
  ],
  methodology:
    "Written from the Kubernetes documentation on pod priority and preemption, node-pressure eviction and pod disruption budgets, verified August 2026. One correction was made to the source draft, and it inverts the article's central claim. The draft states twice that disruption budgets take precedence over priority and can block preemption entirely. The documentation says budgets are supported but not guaranteed: the scheduler prefers victims whose budget would not be violated, and if it finds none, preemption proceeds anyway. The draft's batch-job scenario was rewritten as the mechanism.",
  body: [
    {
      type: "p",
      text: "A cluster with room to spare does not need priorities. Everything schedules, and the order does not matter much. A full cluster is a different story, and that is where these come in.",
    },
    {
      type: "p",
      text: "A full cluster does need them. Something has to decide whether the pending production pod waits behind a batch job, or the batch job makes room.",
    },
    {
      type: "p",
      text: "That is what a priority class is for, and it is all it is for. Most of the trouble with priorities comes from expecting them to do something at runtime, where they do very little.",
    },
    { type: "h2", id: "basics", text: "What a priority class is" },
    {
      type: "p",
      text: "It is a cluster-wide object with a name and a number. Pods reference it by name and inherit the number. Higher wins.",
    },
    {
      type: "p",
      text: "A pod with no class gets zero, unless you have marked a class as the global default, in which case it gets that.",
    },
    {
      type: "p",
      text: "Your own classes can go up to one billion. Above that is reserved for the built-in classes covering system pods, and the two that ship are well above anything you should be creating.",
    },
    {
      type: "p",
      text: "The other field to set on purpose is the preemption policy. By default a pod may evict lower-priority pods to make room. Set it to never and the pod still jumps the queue when room appears. It just never takes room from anything already running.",
    },
    {
      type: "p",
      text: 'That second setting is underused. It expresses "important, but not at someone else\'s expense", which is the honest description of a lot of workloads people give high priorities to.',
    },
    { type: "h2", id: "preemption", text: "How the scheduler chooses victims" },
    {
      type: "p",
      text: "When a pod will not fit anywhere, the scheduler asks whether removing something would help.",
    },
    {
      type: "ol",
      items: [
        "It looks for nodes where evicting lower-priority pods would free enough room.",
        "On each candidate it picks the smallest set of victims that does the job.",
        "It scores the candidates and takes the one that causes least disruption, weighing how many victims there are and how low their priorities are.",
        "It marks the victims for deletion and waits for them to go.",
        "It schedules the pending pod into the space.",
      ],
    },
    {
      type: "p",
      text: "Victims get their graceful termination period. That is correct behaviour and it is also why preemption is not instant: the pending pod waits for the slowest victim to shut down.",
    },
    {
      type: "p",
      text: "If that gap matters, shorten the termination period on the workloads you expect to be preempted. A batch job that can be killed in a second should not be configured to take thirty.",
    },
    { type: "h2", id: "pdb", text: "A disruption budget is a preference here, not a wall" },
    {
      type: "p",
      text: "This is the part most often stated backwards, and getting it backwards leads to designs that assume a protection that is not there.",
    },
    {
      type: "callout",
      variant: "warning",
      title:
        "Preemption respects disruption budgets where it can, and overrides them where it cannot",
      text: "The scheduler prefers victims whose disruption budget would not be violated. If it cannot find a set like that, preemption still happens and the budget is violated anyway. Budgets are supported, not guaranteed. So a budget does not make a workload preemption-proof. If you need a workload never to be preempted, the mechanism is priority — give it one high enough that nothing routinely outranks it — not a budget.",
    },
    {
      type: "p",
      text: "That makes priorities and budgets two controls on the same axis rather than one overriding the other. Design them together. A tight budget on a low-priority workload reads as protection and provides very little.",
    },
    {
      type: "p",
      text: "Budgets do their real work against planned disruption. That means drains and rollouts, not the scheduler making room. It is a separate mechanism, covered in [pod disruption budgets](/devops/kubernetes-pod-disruption-budgets-eviction-mechanics).",
    },
    { type: "h2", id: "runtime", text: "Where priority does nothing" },
    {
      type: "p",
      text: "Priority is consulted when placing a pod. It is not a runtime property, and it confers no protection once the pod is running.",
    },
    {
      type: "table",
      caption: "What priority affects, and what it does not.",
      head: ["Situation", "Does priority help?"],
      rows: [
        ["Two pods pending, one node's worth of room", "Yes, the higher one goes first"],
        ["No room at all for a high-priority pod", "Yes, it can preempt"],
        ["The node fails", "No"],
        ["CPU contention between running pods", "No, that is requests and limits"],
        ["The container exceeds its memory limit", "No, it is killed"],
        ["Node-pressure eviction by the kubelet", "Partly, and not first"],
      ],
    },
    {
      text: "That last row is worth expanding, because it is the one people get wrong in both directions. When a node runs short of memory or disk, the kubelet chooses what to evict. It looks first at whether a pod is exceeding the resources it requested, and only then at priority. So a high-priority pod using far more than it asked for is a candidate before a low-priority pod living within its request. Priority is a tie-breaker there, not a shield.",
      type: "p",
    },
    {
      type: "p",
      text: "The practical consequence: a high priority does not excuse a bad resource request. If anything it makes the request more important, because it is what stands between the pod and the kubelet on a bad night.",
    },
    { type: "h2", id: "design", text: "Designing a priority scheme" },
    {
      type: "p",
      text: "Keep it small. Three or four classes is enough for most clusters, and every extra one is a decision someone has to make correctly at deployment time.",
    },
    {
      type: "p",
      text: "Leave gaps between the numbers. Values next to each other give you nowhere to slot something in later. And you cannot change priority on a running pod, so renumbering means recreating everything it touches.",
    },
    {
      type: "p",
      text: "Give the low class an honest name. If batch jobs can be evicted, calling the class something that says so means nobody is surprised when it happens.",
    },
    {
      type: "p",
      text: "And watch what preemption is actually doing. Repeated preemption of the same workload is not a scheduling success, it is a capacity shortage being absorbed quietly by whoever ranked lowest. The fix for that is nodes, not numbers — and where those nodes land is the subject of [topology spread constraints](/devops/kubernetes-topology-spread-constraints-vs-pod-anti-affinity).",
    },
  ],
  faq: [
    {
      question: "Does a disruption budget stop preemption?",
      answer:
        "Not reliably. The scheduler prefers victims that would not violate one. If it finds no such set, it preempts anyway and the budget is violated.",
    },
    {
      question: "What is the default priority?",
      answer:
        "Zero, unless a class is marked as the global default. Then pods without an explicit class get that value instead.",
    },
    {
      question: "Can I change a running pod's priority?",
      answer:
        "No. It is fixed at creation. Changing it means recreating the pod, which is why leaving gaps between your numbers is worth doing.",
    },
    {
      question: "Does priority protect against node-pressure eviction?",
      answer:
        "Only in part. The kubelet looks first at whether a pod is over its requests, then at priority. A greedy pod is still a target.",
    },
    {
      question: "Can equal-priority pods preempt each other?",
      answer:
        "No. The waiting pod has to outrank the one it would push out. Equal numbers mean nobody makes room for anybody.",
    },
    {
      question: "How do I mark a pod important but non-disruptive?",
      answer:
        "Set the preemption policy to never. It still jumps the queue for free room. It will not take room from anything already running.",
    },
  ],
  sources: [
    {
      title: "Pod priority and preemption",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/",
    },
    {
      title: "Node-pressure eviction",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/",
    },
    {
      title: "Disruptions",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/workloads/pods/disruptions/",
    },
  ],
};
