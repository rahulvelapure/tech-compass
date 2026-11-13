import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-ingress-controller-architecture-nginx-traefik-envoy",
  category: "devops",
  contentType: "comparison",
  subcategory: "Kubernetes",
  title: "The controller is not the proxy, and the gap between them is the comparison",
  seoTitle: "Ingress Controllers: NGINX vs Traefik vs Envoy Gateway",
  metaDescription:
    "How NGINX, Traefik and Envoy Gateway turn Kubernetes objects into proxy config, what each model costs to run, and which project is still maintained.",
  standfirst:
    "Every ingress controller does the same job. What splits them is how each one gets a change into the proxy.",
  excerpt:
    "Reload a file, rebuild a routing table, or stream config over xDS. Three answers to the same question, and the one you pick decides how your cluster behaves under change.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-27",
  nextReviewAt: "2027-02-27",
  readingMinutes: 5,
  primaryKeyword: "Kubernetes ingress controller comparison",
  secondaryKeywords: [
    "Envoy Gateway xDS",
    "Traefik IngressRoute CRD",
    "Gateway API conformance",
    "ingress-nginx retirement",
    "ingress annotations validation",
  ],
  tags: ["Kubernetes", "Networking", "DevOps", "Architecture", "Traffic management"],
  reviewStatus: "research-based",
  relatedSlugs: ["ingress-nginx-archived-migration", "service-mesh-mtls-operational-overhead"],
  methodology:
    "Written from the Kubernetes documentation on Ingress, Ingress controllers and the Gateway API, the Gateway API conformance material, and the Traefik and Envoy Gateway project documentation, verified August 2026. Two corrections were made against the source draft. The draft presents NGINX Ingress as the safe default; the community ingress-nginx project was retired in March 2026 and receives no further security patches, and the draft does not distinguish it from the separately maintained F5 NGINX controller. The draft's throughput claims, including a named requests-per-second figure for Traefik and a ranking of Envoy as fastest, are not supported by any published comparable benchmark and have been dropped rather than repeated.",
  body: [
    {
      type: "p",
      text: "An Ingress object does nothing on its own. It is a record of intent. Something has to read it and set up a real proxy.",
    },
    {
      type: "p",
      text: "That something is the controller, and it is a separate process from the proxy it drives. Every option here has that split.",
    },
    {
      type: "p",
      text: "What differs is how the controller hands a change to the proxy. That one detail drives most of what you feel in production.",
    },
    { type: "h2", id: "shape", text: "The shape they all share" },
    {
      type: "p",
      text: "All three run the same loop. Watch the Kubernetes API, work out the config it implies, then get that config into the proxy.",
    },
    {
      type: "p",
      text: "The first two steps are cheap, and much the same everywhere. The third step is where the designs split apart.",
    },
    { type: "h2", id: "nginx", text: "NGINX: render a file, then reload" },
    {
      type: "p",
      text: "The NGINX model is templating. The controller writes a full nginx.conf from the objects it sees, then tells NGINX to reload.",
    },
    {
      type: "p",
      text: "The reload is graceful. Old workers finish the requests they hold while new workers pick up new ones, so nothing is dropped in normal conditions.",
    },
    {
      type: "p",
      text: "It is not free. During a reload both sets of workers exist, so memory rises. Long-lived connections keep old workers alive, and a WebSocket or gRPC stream can hold one open for hours.",
    },
    {
      type: "p",
      text: "In a cluster where routes change all day, reloads overlap. The overhead stops being brief and starts being the baseline.",
    },
    {
      type: "p",
      text: "The config surface has its own problem. The Ingress spec is small on purpose. Anything past host and path routing arrives as an annotation.",
    },
    {
      type: "p",
      text: "Annotations are strings. The API server does not check what is inside them. A typo is accepted, then ignored, and the route quietly behaves differently from the way it reads.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Two different projects share the name",
      text: "The community project ingress-nginx was retired in March 2026. The repository is archived. There are no further releases, bug fixes or security patches. F5 maintains a separate controller, nginxinc/kubernetes-ingress. It is a different codebase and still supported. The two are often confused, including in vendor comparisons. If you run the community one today, what faces you is a migration rather than a choice â€” see the [ingress-nginx retirement guide](/devops/ingress-nginx-archived-migration).",
    },
    { type: "h2", id: "traefik", text: "Traefik: rebuild the routing table in place" },
    {
      type: "p",
      text: "Traefik keeps its routing table in memory and edits it. There is no file to render. There is no process to signal. A route change is a data structure update.",
    },
    {
      type: "p",
      text: "That removes the reload cost. It also removes a whole class of failure, where a bad render produces a file the proxy will not load.",
    },
    {
      type: "p",
      text: "For anything past basic routing, Traefik uses its own custom resources. IngressRoute describes the route. Middleware describes what happens to a request on the way through, and middlewares chain.",
    },
    {
      type: "p",
      text: "These are real Kubernetes resources with schemas. The API server rejects a malformed one on submission. That beats an unchecked annotation string.",
    },
    {
      type: "p",
      text: "The trade is portability. An IngressRoute is a Traefik object. Moving off Traefik means rewriting those routes, not repointing them.",
    },
    { type: "h2", id: "envoy", text: "Envoy Gateway: stream config over xDS" },
    {
      type: "p",
      text: "Envoy was built to be driven by a remote control plane. It exposes a set of APIs called xDS, and over those it accepts new listeners, routes and clusters while running.",
    },
    {
      type: "p",
      text: "Envoy Gateway is that control plane. It watches Gateway API resources and turns them into xDS, and Envoy applies the update with no reload and no restart.",
    },
    {
      type: "p",
      text: "The API surface is the more interesting half. Gateway API splits one Ingress object into several resources, each with a different owner.",
    },
    {
      type: "table",
      caption: "Gateway API resources and who normally owns them",
      head: ["Resource", "Describes", "Typical owner"],
      rows: [
        ["GatewayClass", "The kind of infrastructure on offer", "Cluster operator"],
        ["Gateway", "A listener, its ports and its TLS", "Platform team"],
        ["HTTPRoute, GRPCRoute, TCPRoute", "Matching and forwarding rules", "Application team"],
      ],
    },
    {
      type: "p",
      text: "That split is the point. App teams change routes without the rights to change TLS or listeners. Routes can also attach to a Gateway across a namespace line, under rules the platform team sets.",
    },
    {
      type: "p",
      text: "The cost is how much there is to learn. It is more than one annotated object. And a control plane outage means Envoy keeps serving what it has, but takes no new routes.",
    },
    {
      type: "p",
      text: "That is a safe way to fail. It is still one you have to plan for.",
    },
    { type: "h2", id: "axis", text: "The axis that actually separates them" },
    {
      type: "p",
      text: "Comparisons usually reach for throughput. Treat those numbers with care. Results move with request size, connection reuse, TLS settings and tuning.",
    },
    {
      type: "p",
      text: "Vendor benchmarks rarely hold all of that steady across products. So nothing here quotes one. The differences that survive contact with production are structural.",
    },
    {
      type: "table",
      caption: "Where the three models differ in practice",
      head: ["", "NGINX", "Traefik", "Envoy Gateway"],
      rows: [
        [
          "Config delivery",
          "Render file, reload workers",
          "In-memory table update",
          "xDS stream to a live proxy",
        ],
        ["Cost of frequent change", "Overlapping worker sets", "Low", "Low"],
        [
          "Config surface",
          "Annotations, unchecked",
          "Own CRDs, schema-checked",
          "Gateway API, schema-checked",
        ],
        [
          "Ownership model",
          "One object, one owner",
          "One object, one owner",
          "Split across three resources",
        ],
        [
          "Portability",
          "Annotations are vendor-specific",
          "CRDs are vendor-specific",
          "Gateway API is standard",
        ],
        ["Extra moving part", "None", "None", "A control plane"],
      ],
    },
    { type: "h2", id: "gatewayapi", text: "Where the standard is going" },
    {
      type: "p",
      text: "The Ingress API is frozen. It still works and is still supported. New capability goes into Gateway API instead.",
    },
    {
      type: "p",
      text: "That is why every project in this space now ships a Gateway API build. It is also why a controller with no Gateway API story has a shrinking future.",
    },
    {
      type: "p",
      text: "Gateway API runs a conformance programme. Projects are tested against published profiles and report which ones they meet. Support is partial by design, and it varies.",
    },
    {
      type: "p",
      text: "So read the conformance report for the features you depend on. Do not read the marketing page. The gap between the two is where migrations go wrong.",
    },
    { type: "h2", id: "fails", text: "How each one fails" },
    {
      type: "p",
      text: "Each design has a signature failure. Knowing them shortens an incident, because the symptom points at the layer.",
    },
    {
      type: "p",
      text: "NGINX fails at the render step. A bad annotation produces a config NGINX refuses, so the reload aborts. The proxy keeps serving the last good file, which means the cluster looks healthy while your new route does not exist. The evidence is in the controller log, not in the Ingress object.",
    },
    {
      type: "p",
      text: "Traefik fails in the middleware chain. Order matters, and a chain that strips a prefix before it matches on one will not error. It just routes somewhere else. You get a 404 from a route that reads correctly.",
    },
    {
      type: "p",
      text: "Envoy Gateway fails at attachment. A route only takes effect if the Gateway allows it, and cross-namespace attachment needs a ReferenceGrant. Without one, the route is accepted and never binds. Check the route status, because that is where the reason is written.",
    },
    {
      type: "p",
      text: "All three share one symptom too. If a request returns 404 from the right proxy, check the class before anything else. An object with the wrong class is owned by nobody, and nobody logs it.",
    },
    { type: "h2", id: "choose", text: "Choosing without guessing" },
    {
      type: "ul",
      items: [
        "Routes change rarely and the team knows NGINX: a maintained NGINX controller is still fine. Check which project you actually run first.",
        "Routes change all day, or you want request middleware without writing templates: Traefik, accepting the vendor CRDs.",
        "Platform and app teams need different rights, or you need gRPC and TCP routing as real objects: Envoy Gateway.",
        "You are on community ingress-nginx: this is a migration, and the date has already passed.",
      ],
    },
    {
      type: "p",
      text: "One habit matters more than the pick. The controller is a single point of failure for everything entering the cluster.",
    },
    {
      type: "p",
      text: "So give it resource requests. Run more than one replica. Then test what happens when its control plane is gone. That last test is the one teams skip.",
    },
  ],
  faq: [
    {
      question: "Can I run two ingress controllers at once?",
      answer:
        "Yes. Each one watches its own class. Set the class on the route and they stay out of each other's way.",
    },
    {
      question: "Do I have to move to Gateway API now?",
      answer:
        "No. Ingress still works. Move when you want what it adds, such as gRPC and TCP as real objects.",
    },
    {
      question: "Which one handles WebSocket best?",
      answer:
        "All three carry it. NGINX needs an annotation to set the timeouts. The other two just pass it through.",
    },
    {
      question: "Is ingress-nginx safe to keep running?",
      answer:
        "It runs. It gets no security fixes. So it is a risk you are timing, not one you have dealt with.",
    },
    {
      question: "Does Envoy keep working if its control plane dies?",
      answer:
        "Yes. It serves the config it already holds. It just cannot take new routes until the plane is back.",
    },
    {
      question: "Is a mesh a replacement for this?",
      answer:
        "No. They cover different traffic. A mesh works inside the cluster. Ingress is the way in from outside.",
    },
    {
      question: "Why did my new route not appear?",
      answer:
        "Check the class first. Then read the controller log. The route object itself rarely says what went wrong.",
    },
  ],
  sources: [
    {
      title: "Ingress",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/services-networking/ingress/",
    },
    {
      title: "Ingress Controllers",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/",
    },
    {
      title: "Gateway API",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/services-networking/gateway/",
    },
    {
      title:
        "Ingress NGINX: Statement from the Kubernetes Steering and Security Response Committees",
      publisher: "Kubernetes Blog",
      url: "https://www.kubernetes.io/blog/2026/01/29/ingress-nginx-statement/",
    },
    {
      title: "Gateway API conformance",
      publisher: "Kubernetes SIG Network",
      url: "https://gateway-api.sigs.k8s.io/concepts/conformance/",
    },
    {
      title: "Traefik Kubernetes IngressRoute provider",
      publisher: "Traefik Labs",
      url: "https://doc.traefik.io/traefik/providers/kubernetes-crd/",
    },
    {
      title: "Envoy Gateway architecture",
      publisher: "Envoy Gateway",
      url: "https://gateway.envoyproxy.io/docs/concepts/architecture/",
    },
  ],
};
