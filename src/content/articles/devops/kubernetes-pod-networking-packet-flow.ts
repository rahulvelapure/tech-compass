import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-pod-networking-packet-flow",
  category: "devops",
  contentType: "explainer",
  subcategory: "Kubernetes",
  title: "What actually happens when a pod sends a packet",
  seoTitle: "Kubernetes pod networking: the real packet flow",
  metaDescription:
    "Kubernetes promises a flat network until it breaks. The namespaces, veth pairs and CNI routing a packet really crosses — and how to trace it when it stops.",
  standfirst:
    "Kubernetes gives every pod an IP and promises they can all talk. That works until it does not, and then you need to know what is under it.",
  excerpt:
    "The flat pod network is an abstraction built on network namespaces, veth pairs and CNI routing. What a packet really crosses, where it gets dropped, and how to find out.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-22",
  lastReviewedAt: "2026-08-22",
  nextReviewAt: "2027-08-22",
  readingMinutes: 6,
  primaryKeyword: "Kubernetes pod networking",
  secondaryKeywords: [
    "CNI plugin packet flow",
    "veth pair Kubernetes",
    "kube-proxy iptables nftables",
    "Kubernetes MTU VXLAN",
    "conntrack table full",
  ],
  tags: ["Kubernetes", "Networking", "Linux", "CNI", "DevOps", "Troubleshooting"],
  reviewStatus: "research-based",
  relatedSlugs: ["ingress-nginx-archived-migration", "bgp-in-the-cloud-why-it-matters"],
  methodology:
    "Written from the Kubernetes cluster networking documentation, the CNI specification, kube-proxy proxy-mode documentation and Linux kernel networking references, verified August 2026. Interface names and CIDRs are illustrative examples, not values to copy. Plugin behaviour is attributed to the plugin, because CNIs differ in exactly the ways that matter when a packet goes missing.",
  body: [
    {
      type: "p",
      text: "Kubernetes gives every pod its own IP. Any pod can reach any other pod, with no port mapping and no NAT. Developers bind to a port and traffic arrives.",
    },
    {
      type: "p",
      text: "That model is genuinely useful, and it holds most of the time. Then a pod cannot reach the internet, or large responses hang while small ones work, and the abstraction stops helping. At that point you need to know what a packet actually crosses.",
    },
    {
      type: "p",
      text: "The short version: it is Linux. Network namespaces, virtual ethernet pairs, a routing table, and some netfilter rules. No magic, just several layers that each have a way of going wrong.",
    },
    { type: "h2", id: "primitives", text: "The two kernel features it all rests on" },
    {
      type: "p",
      text: "A network namespace is an isolated network stack. Its own interfaces, its own routing table, its own firewall rules. When a pod starts, the runtime gives it a fresh one. Inside, the pod sees a loopback interface and nothing else — not the node's interfaces, not other pods.",
    },
    {
      type: "p",
      text: "A veth pair is a virtual cable with two ends. Whatever goes in one end comes out the other. The CNI plugin puts one end inside the pod, named eth0, and leaves the other in the node's root namespace with a name like cali7f2 or veth3a1c.",
    },
    {
      type: "p",
      text: "That cable is the only way out. Every packet a pod sends crosses it.",
    },
    { type: "h2", id: "flow", text: "Following a packet out" },
    {
      type: "p",
      text: "Take a pod on 10.244.1.5 reaching something on the internet.",
    },
    {
      type: "ol",
      items: [
        "**The pod sends.** The application builds a packet with the pod IP as its source. Nothing in the pod's routing table matches the destination, so it goes to the default gateway — usually the CNI bridge or router address on the node.",
        "**The cable is crossed.** The packet leaves eth0 and appears immediately on the host end of the veth pair. It is now in the node's root namespace, and the namespace boundary is behind it.",
        "**The node decides.** What happens here depends on the CNI, and this is where plugins genuinely differ.",
        "**The node sends.** The packet reaches a physical interface. Depending on the plugin it may be wrapped in an overlay header first.",
      ],
    },
    { type: "h3", id: "bridge-vs-route", text: "Bridging or routing" },
    {
      type: "p",
      text: "There are two broad models, and knowing which one you run changes how you debug.",
    },
    {
      type: "table",
      caption: "The two models, and where a packet goes in each",
      head: ["", "Bridging", "Routing"],
      rows: [
        ["Example plugins", "Flannel with a bridge, the reference bridge CNI", "Calico, Cilium"],
        ["Node-side mechanism", "A virtual switch such as cni0", "The node's own IP routing table"],
        ["Decision based on", "Destination MAC address", "Destination IP address"],
        [
          "Same-node pod traffic",
          "Switched straight to the other veth",
          "Routed to the other veth",
        ],
        ["Where to look when debugging", "Bridge forwarding table", "ip route on the node"],
      ],
    },
    {
      type: "p",
      text: "For traffic leaving the node there is a second choice, and it is the one that causes MTU problems. An overlay such as VXLAN or Geneve wraps the packet so the physical network never sees pod addresses. Native routing does not wrap anything, which is faster, but the physical network then has to know how to route the pod CIDR back — often over BGP.",
    },
    {
      type: "p",
      text: "If you are running native routing, the cluster is now participating in your routing design. [What BGP is doing on a hybrid link](/enterprise-networking/bgp-in-the-cloud-why-it-matters) applies directly.",
    },
    { type: "h2", id: "services", text: "Services, and where the virtual IP goes" },
    {
      type: "p",
      text: "Pod-to-pod is only half the picture. Most traffic goes to a Service, and a Service ClusterIP is not a real address. No interface holds it. Nothing will answer an ARP request for it.",
    },
    {
      type: "p",
      text: "It works because the kernel rewrites the packet. When traffic for a ClusterIP reaches the root namespace, netfilter performs destination NAT and swaps the ClusterIP for the address of one real backing pod. The packet is then routed normally.",
    },
    {
      type: "p",
      text: "kube-proxy is what programs those rules, and it has three modes.",
    },
    {
      type: "table",
      caption: "How the same translation is implemented, and why the mode matters at scale",
      head: ["Mode", "Mechanism", "Behaviour under many services"],
      rows: [
        [
          "iptables",
          "netfilter rules written per service",
          "Rules are evaluated in sequence; large clusters feel it",
        ],
        [
          "IPVS",
          "In-kernel load balancer with hash tables",
          "Lookup cost stays roughly flat as services grow",
        ],
        [
          "eBPF (via the CNI)",
          "Programs attached in the network stack",
          "Bypasses both; also changes how you inspect it",
        ],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "The mode changes the debugging tools",
      text: "If a Service is not working, where you look depends on the mode. iptables-save does not explain an nftables cluster, and neither helps when Cilium is handling translation in eBPF. Check the mode before you start reading rules.",
    },
    { type: "h2", id: "troubleshooting", text: "A pod cannot reach the internet" },
    {
      type: "p",
      text: "This is the common report, and it is worth working through in order rather than restarting things.",
    },
    { type: "h3", id: "step-dns", text: "Separate DNS from connectivity" },
    {
      type: "p",
      text: "Resolve something from inside the pod first. If lookups fail but a direct IP connection works, the problem is CoreDNS or the pod's resolver configuration, not routing. That single check removes most of the search space.",
    },
    { type: "h3", id: "step-route", text: "Check what the pod thinks" },
    {
      type: "p",
      text: "Run ip route inside the pod. There should be a default route pointing at the CNI gateway. If it is missing or wrong, the CNI failed to set the pod up and the fault is at creation time, not in the network.",
    },
    { type: "h3", id: "step-trace", text: "Find where the packet stops" },
    {
      type: "p",
      text: "Now trace it on the node. Capture on the pod's host-side veth first. Seeing the packet there proves it left the namespace. Then capture on the node's physical interface. If it appears on the first and not the second, it is being dropped on the node — and you have narrowed a vague fault to one hop.",
    },
    { type: "h3", id: "step-conntrack", text: "Suspect conntrack before iptables" },
    {
      type: "p",
      text: "Check the FORWARD chain for an explicit drop, certainly. But on busy nodes the more common cause is connection tracking. Linux records the state of every connection, and services that open many short-lived connections fill that table.",
    },
    {
      type: "p",
      text: "When it fills, the kernel drops new packets and logs it. Look for conntrack messages in the kernel log. The symptom is distinctive: failures that scale with load, and recover when traffic falls. The fix is raising nf_conntrack_max, and then asking why the workload opens that many connections.",
    },
    { type: "h2", id: "mistakes", text: "Three faults that account for most of the rest" },
    { type: "h3", id: "mtu", text: "MTU, and the classic symptom" },
    {
      type: "p",
      text: "VXLAN adds roughly 50 bytes of header. On a 1500-byte network, a full-size pod packet becomes about 1550 bytes and gets dropped. Small packets are unaffected.",
    },
    {
      type: "p",
      text: "So ping works. DNS works. A large HTTP response or a TLS handshake hangs. If you only remember one thing from this article, make it that pattern — it points at MTU almost every time. The fix is lowering the pod MTU so the wrapped packet fits, commonly 1450 for VXLAN on a 1500-byte network.",
    },
    { type: "h3", id: "cidr", text: "Overlapping CIDRs" },
    {
      type: "p",
      text: "If the pod CIDR overlaps your VPC or your on-premises range, the node's routing table has two plausible answers and picks one. Traffic goes somewhere reasonable-looking and wrong. Keep pod, service and physical ranges strictly separate, and plan it before the cluster exists.",
    },
    { type: "h3", id: "netpol", text: "Forgetting the network policy" },
    {
      type: "p",
      text: "If routing is sound and traffic still does not arrive, look for a policy. A default-deny rule blocks everything not explicitly permitted, and it does so silently. Where those rules live depends on the plugin, which is another reason to know which one you run.",
    },
    { type: "h2", id: "security", text: "The default is wide open" },
    {
      type: "p",
      text: "Out of the box, every pod can reach every other pod in the cluster. That is convenient and it is a poor security position. One compromised container can talk to everything.",
    },
    {
      type: "p",
      text: "Network policies are the fix, and they are worth applying as default-deny with explicit allows. They also have a clear limit: they govern traffic inside the cluster. Traffic arriving from outside is the job of an ingress controller or a service mesh, and that is a separate design. If you are still on the archived ingress-nginx project, [the migration is now overdue](/devops/ingress-nginx-archived-migration).",
    },
    {
      type: "p",
      text: "The same segmentation thinking applies here as anywhere else — [segmenting a network without breaking it](/enterprise-networking/zero-trust-network-segmentation) covers the general shape.",
    },
    {
      type: "p",
      text: "One operational point often missed: the CNI agent is critical infrastructure. If it dies on a node, new pods there get no network and existing ones may lose connectivity. Monitor it as closely as the kubelet.",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "Know whether your CNI bridges or routes, and whether it uses an overlay. Everything else follows from that.",
        "Large packets failing while small ones pass is MTU. Check it before anything else.",
        "Capture on the veth, then on the physical interface. That one comparison localises the drop.",
        "Watch conntrack on busy nodes. Exhaustion drops packets quietly and scales with load.",
        "Apply default-deny network policies. The flat network is a starting point, not a design.",
      ],
    },
    {
      type: "p",
      text: "None of this is exotic. It is namespaces, virtual cables, a routing table and some kernel rules, assembled by a plugin. Once you can name the hops, troubleshooting stops being a matter of deleting pods and hoping, and becomes a short list of places to look.",
    },
  ],
  faq: [
    {
      question: "Why can small packets get through when large ones fail?",
      answer:
        "That is an MTU problem. An overlay adds about 50 bytes to each packet. A full-size packet then becomes too big for the network and is dropped. Lower the pod MTU so the wrapped packet fits.",
    },
    {
      question: "What is a veth pair?",
      answer:
        "A virtual cable with two ends. One end sits in the pod, the other on the node. Anything sent in one end comes out the other. It is the only way traffic leaves a pod.",
    },
    {
      question: "Does a Service ClusterIP exist on any interface?",
      answer:
        "No. It is a virtual address. The kernel swaps it for the address of a real pod as the packet passes. Nothing will ever answer for the ClusterIP itself.",
    },
    {
      question: "How do I know if conntrack is full?",
      answer:
        "Check the kernel log on the node for conntrack messages. The clue is timing: drops rise with load and stop when traffic falls. Raise nf_conntrack_max, then find out why so many connections are opening.",
    },
    {
      question: "Should I use iptables, nftables, or IPVS for kube-proxy?",
      answer:
        "For current Linux clusters, evaluate nftables where the node kernel and networking stack support it. Kubernetes made nftables stable in v1.33, while IPVS was deprecated in v1.35. iptables remains supported and is still the default in some current releases, so check the version you actually run before changing modes.",
    },
  ],
  sources: [
    {
      title: "Cluster networking",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/cluster-administration/networking/",
    },
    {
      title: "Virtual IPs and Service proxies",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/reference/networking/virtual-ips/",
    },
    {
      title: "Network policies",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
    },
    {
      title: "Container Network Interface specification",
      publisher: "CNCF",
      url: "https://github.com/containernetworking/cni/blob/main/SPEC.md",
    },
    {
      title: "RFC 7348: Virtual eXtensible Local Area Network (VXLAN)",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc7348",
    },
  ],
};
