import type { Article } from "../../types";

export const article: Article = {
  slug: "istio-ambient-mesh-sidecarless-architecture",
  category: "devops",
  contentType: "explainer",
  subcategory: "Kubernetes",
  title: "Taking the proxy out of the pod changes who pays for the mesh",
  seoTitle: "Istio Ambient Mesh: ztunnel, Waypoints and the Sidecar Tax",
  metaDescription:
    "Ambient mode splits the mesh in two: a per-node ztunnel for identity and encryption, and shared waypoint proxies for Layer 7. What that buys, and what it costs.",
  standfirst:
    "A sidecar per pod means the mesh scales with pod count, not with traffic. Ambient mode breaks that link, and moves the failure domain.",
  excerpt:
    "The sidecar model works and is expensive. Ambient replaces it with a node proxy for Layer 4 and opt-in waypoints for Layer 7 — a real reduction in overhead, and a new node-level dependency.",
  authorId: "rahul-velapure",
  publishedAt: "2026-05-11",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 5,
  primaryKeyword: "Istio Ambient Mesh architecture",
  secondaryKeywords: [
    "ztunnel node proxy",
    "waypoint proxy",
    "HBONE protocol",
    "sidecarless service mesh",
    "service mesh overhead",
  ],
  tags: ["Kubernetes", "Service Mesh", "Istio", "Networking", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "service-mesh-mtls-operational-overhead",
    "kubernetes-network-policy-default-deny-implementation",
  ],
  methodology:
    "Written from the Istio ambient mode documentation covering ztunnel, waypoint proxies and HBONE, verified August 2026. Every resource figure in the source draft was removed: per-sidecar memory and CPU numbers, a claimed percentage of cluster compute, and an invented migration saving. Those depend entirely on traffic shape and configuration, and no measurement was available to support them.",
  body: [
    {
      type: "p",
      text: "A sidecar mesh has a habit nobody asks for. Its cost tracks the number of pods, not the amount of traffic. Quiet pods cost the same as busy ones.",
    },
    {
      type: "p",
      text: "A pod that handles two requests an hour still runs a proxy. That proxy holds configuration for the services it might talk to, keeps connection pools warm, and gets restarted whenever the mesh upgrades.",
    },
    {
      type: "p",
      text: "Multiply that by every pod in a large cluster and you are paying for a lot of idle proxy. Ambient mode is Istio's answer, and it works by splitting the data plane in two.",
    },
    { type: "h2", id: "sidecar-cost", text: "What the sidecar model actually costs" },
    {
      type: "p",
      text: "The resource bill is the obvious part, and it is real. Each proxy reserves memory and CPU whether or not it is busy.",
    },
    {
      type: "p",
      text: "Three other costs matter as much and get less attention.",
    },
    {
      type: "p",
      text: "**Configuration fan-out.** The control plane pushes updates to every proxy that might care. So adding one service means work that scales with the mesh, not with the change.",
    },
    {
      type: "p",
      text: "**Upgrades touch every workload.** The proxy lives in the pod, so replacing it means restarting the pod. A mesh upgrade becomes a rolling restart of everything. That is a scheduling problem for stateful workloads and for anything slow to start.",
    },
    {
      type: "p",
      text: "**The boundary is blurred.** Injecting a sidecar changes the pod spec. Platform plumbing ends up inside the app's own deployment. That is awkward when different teams own each.",
    },
    { type: "h2", id: "split", text: "The split: identity below, policy above" },
    {
      type: "p",
      text: "Ambient mode separates two jobs the sidecar was doing at once.",
    },
    {
      type: "p",
      text: "Securing transport is one job. Every workload needs an identity. Traffic between them needs encrypting. That applies to all of it, so it belongs somewhere shared.",
    },
    {
      type: "p",
      text: "Layer 7 policy is the other job. That means header routing, retries, fault injection and request-level rules. Only some services need it. Paying for it everywhere is waste.",
    },
    {
      type: "p",
      text: "Ambient puts the first in a per-node proxy and makes the second opt-in.",
    },
    { type: "h2", id: "ztunnel", text: "ztunnel: one proxy per node" },
    {
      type: "p",
      text: "The ztunnel is a purpose-built node proxy, written in Rust. It runs once per node rather than once per pod, and it works at Layer 4 only.",
    },
    {
      type: "p",
      text: "Traffic leaving a pod goes to the local ztunnel. The ztunnel sets up mutual TLS using the workload's identity. It then carries the connection to the ztunnel on the destination node.",
    },
    {
      type: "p",
      text: "It does not parse your HTTP. It does not apply routing rules. It moves L3 and L4 traffic securely between identified workloads, and that narrow job is why it can be small.",
    },
    {
      type: "p",
      text: "That is the whole efficiency argument. Pods on a node share one proxy instead of running one each, so mesh overhead tracks node count and traffic rather than pod count.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The failure domain moved, and it got bigger",
      text: "A sidecar failing takes down one pod's networking. A ztunnel failing takes down mesh traffic for every pod on that node. That is a genuinely different operational posture. Treat the ztunnel like the kubelet: monitor its restarts, memory and CPU, alert on the DaemonSet losing members, and make sure node drain procedures account for it.",
    },
    { type: "h2", id: "hbone", text: "HBONE, and why the encapsulation matters" },
    {
      type: "p",
      text: "The ztunnel carries traffic using HBONE, a tunnelling protocol built on HTTP CONNECT.",
    },
    {
      type: "p",
      text: "The choice is deliberate. Corporate network gear treats custom protocols with suspicion. Mesh traffic that looks like ordinary HTTPS gets through. Firewalls, proxies and inspection devices already know this shape.",
    },
    {
      type: "p",
      text: "It also allows multiplexing. Several workload connections share one tunnel between a pair of nodes. The cluster then makes fewer handshakes and holds fewer connections. On busy nodes that eases real pressure on connection tracking.",
    },
    { type: "h2", id: "waypoint", text: "Waypoints: Layer 7 when you ask for it" },
    {
      type: "p",
      text: "If a service needs more than encrypted transport and identity, you deploy a waypoint proxy for it.",
    },
    {
      type: "p",
      text: "A waypoint is an Envoy proxy, but it is shared infrastructure rather than a per-pod injection. It sits in the path for the workloads it serves, and it handles the Layer 7 features the ztunnel deliberately does not.",
    },
    {
      type: "p",
      text: "The consequence is that Layer 7 becomes a per-service decision with a visible cost. A service that only needs mTLS runs no Envoy at all. A service that needs header routing gets a waypoint, and the compute for it belongs to that service.",
    },
    {
      type: "table",
      caption: "Which layer does what",
      head: ["Capability", "ztunnel", "Waypoint"],
      rows: [
        ["Workload identity and mTLS", "Yes", "Inherited"],
        ["L4 authorisation", "Yes", "Yes"],
        ["HTTP routing and retries", "No", "Yes"],
        ["Request-level authorisation", "No", "Yes"],
        ["Envoy extensions and filters", "No — not Envoy", "Yes"],
        ["Deployment unit", "One per node", "One per service or namespace"],
      ],
    },
    {
      type: "p",
      text: "That fourth row has a practical edge. Anything written against Envoy's configuration cannot apply to the ztunnel, because the ztunnel is not Envoy. If you depend on Envoy filters today, those workloads need a waypoint, and that dependency should be found during planning rather than during migration.",
    },
    { type: "h2", id: "migration", text: "Migration, and what is still rough" },
    {
      type: "p",
      text: "Sidecar and ambient workloads can share a cluster. The control plane handles traffic between them. So you migrate namespace by namespace rather than cutting over, which is the only realistic way to do it.",
    },
    {
      type: "p",
      text: "Two things deserve checking before you start.",
    },
    {
      type: "p",
      text: "**Redirection depends on the node.** The Istio CNI node agent works with your existing CNI to get traffic into the ztunnel. Most surprises live in that pairing. Test it with your own CNI rather than assuming it fits.",
    },
    {
      type: "p",
      text: "**Debugging is different.** Years of accumulated practice assumes a sidecar you can exec into and a proxy log per pod. In ambient the evidence is spread across node redirection, ztunnel logs and any waypoint in the path. The tooling is improving, and your runbooks are not automatically valid.",
    },
    {
      type: "p",
      text: "Feature coverage is still moving. Core routing, identity and telemetry are mature. Some extension points are newer. Check the current docs against the features you rely on. A blanket claim about readiness ages badly.",
    },
    { type: "h2", id: "decide", text: "When it is worth moving" },
    {
      type: "ul",
      items: [
        "**Many pods, modest per-pod traffic.** This is the case ambient was designed for, and where the saving is largest.",
        "**Mesh upgrades are painful today.** Removing the proxy from the pod removes the rolling restart.",
        "**You mostly want mTLS and identity.** If Layer 7 is rare in your mesh, you stop paying for it everywhere.",
        "**Platform and application teams are separate.** Not touching the pod spec is a cleaner boundary.",
      ],
    },
    {
      type: "p",
      text: "Two things argue against it. If nearly every service needs Layer 7, you will deploy waypoints nearly everywhere, and much of the saving goes with them. And if your team debugs by reaching into sidecars, budget time to relearn that.",
    },
    {
      type: "p",
      text: "It is also worth being clear about what the mesh is not. Identity-based policy and packet-level segmentation are different controls, and a mesh does not replace [network policy](/devops/kubernetes-network-policy-default-deny-implementation). The wider operational cost of running mTLS in a mesh at all is covered in [service mesh mTLS overhead](/devops/service-mesh-mtls-operational-overhead).",
    },
  ],
  faq: [
    {
      question: "What does the ztunnel actually do?",
      answer:
        "It runs once per node and handles Layer 4 only. It gives each workload an identity, encrypts traffic between nodes, and leaves your HTTP alone.",
    },
    {
      question: "Do I need waypoint proxies?",
      answer:
        "Only for services that need Layer 7 features such as header routing or request-level rules. Services that just need mTLS run no Envoy at all.",
    },
    {
      question: "What happens if a ztunnel dies?",
      answer:
        "Mesh traffic for every pod on that node stops. That is a wider blast radius than a sidecar. Watch it the way you watch the kubelet.",
    },
    {
      question: "Will my Envoy filters still work?",
      answer:
        "Not on the ztunnel, which is not Envoy. Those workloads need a waypoint, and that dependency is worth finding before you migrate.",
    },
    {
      question: "Can sidecar and ambient run together?",
      answer:
        "Yes. The control plane handles traffic between them, so you can move one namespace at a time instead of cutting over.",
    },
    {
      question: "Does ambient replace network policy?",
      answer:
        "No. The mesh works on workload identity. Network policy works on packets and is enforced by the CNI. Use both.",
    },
  ],
  sources: [
    {
      title: "Ambient mode overview",
      publisher: "Istio",
      url: "https://istio.io/latest/docs/ambient/overview/",
    },
    {
      title: "ztunnel architecture",
      publisher: "Istio",
      url: "https://istio.io/latest/docs/ambient/architecture/ztunnel/",
    },
    {
      title: "Waypoint proxy",
      publisher: "Istio",
      url: "https://istio.io/latest/docs/ambient/usage/waypoint/",
    },
    {
      title: "HBONE and data plane architecture",
      publisher: "Istio",
      url: "https://istio.io/latest/docs/ambient/architecture/data-plane/",
    },
  ],
};
