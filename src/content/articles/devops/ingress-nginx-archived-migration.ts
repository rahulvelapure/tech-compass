import type { Article } from "../../types";

export const article: Article = {
  slug: "ingress-nginx-archived-migration",
  category: "devops",
  contentType: "how-to",
  subcategory: "Kubernetes",
  title: "Ingress NGINX is archived: what to do about it now",
  seoTitle: "Ingress NGINX archived: migration options",
  metaDescription:
    "The Ingress NGINX controller was archived in March 2026 and gets no further security fixes. What that means for a running cluster, and how to plan the move.",
  standfirst:
    "This is not a modernisation project that can wait for the next planning cycle. It is an unpatched component in the request path of every service behind it.",
  excerpt:
    "The most widely deployed Kubernetes ingress controller is now read-only and will receive no further security updates. Here is how to assess the exposure and plan the move.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 4,
  primaryKeyword: "ingress nginx archived migration",
  secondaryKeywords: [
    "ingress-nginx end of life",
    "ingress nginx no security updates",
    "gateway api migration",
  ],
  tags: ["Kubernetes", "DevOps", "Gateway API", "Ingress"],
  reviewStatus: "research-based",
  relatedSlugs: ["terraform-vs-opentofu"],
  methodology:
    "Written from the project's own repository state and retirement notice, the Kubernetes Gateway API documentation, and the ingress2gateway migration tool's documentation. No migration was performed in a lab for this article; the procedural guidance describes the documented path rather than an observed one.",
  body: [
    {
      type: "p",
      text: "The Kubernetes ingress-nginx repository was archived by its owner on 24 March 2026 and is now read-only. The project's retirement notice is unusually direct: after the maintenance window closed there are no further releases, no bugfixes, and no updates to resolve security vulnerabilities. It also tells anyone not already running it not to start.",
    },
    {
      type: "p",
      text: "That last sentence is the one that changes the shape of the problem. An ingress controller is not a peripheral component. It terminates TLS, parses untrusted HTTP from the public internet, and sits in the request path of every service routed through it. A component in that position with no route to a security fix is a different category of risk from a merely outdated dependency, and it should not be tracked as technical debt. The same test applies to anything else in the stack that has left support, including [a language runtime past its end of life](/development/nodejs-release-schedule-change).",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The exposure is asymmetric",
      text: "A vulnerability disclosed in an archived controller has no patch coming. The only available responses are a configuration workaround, a compensating control in front of it, or having already migrated. The first two are not always possible.",
    },
    { type: "h2", id: "assess", text: "1. Establish what you actually run" },
    {
      type: "p",
      text: "Two projects share a confusingly similar name, and teams regularly do not know which one they have. The community project kubernetes/ingress-nginx is the archived one. F5's NGINX Ingress Controller is a separate, commercially maintained product that continues to receive releases. Confirming which is deployed is the first step, because it determines whether there is any urgency at all.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: 'kubectl get pods -A -l app.kubernetes.io/name=ingress-nginx \\\n  -o jsonpath=\'{range .items[*]}{.metadata.namespace}{"\\t"}{.spec.containers[*].image}{"\\n"}{end}\'',
    },
    {
      type: "p",
      text: "An image path under registry.k8s.io/ingress-nginx indicates the archived community project. An image from a private registry or an F5 path indicates the commercial controller, and the deadline does not apply in the same way.",
    },
    {
      type: "h2",
      id: "inventory",
      text: "2. Inventory the annotations, not just the Ingress objects",
    },
    {
      type: "p",
      text: "Counting Ingress resources understates the work considerably. The behaviour that matters is usually expressed in controller-specific annotations — rewrites, timeouts, body size limits, authentication subrequests, canary weighting — and each of those has to find an equivalent in whatever replaces it. Some map cleanly onto Gateway API resources. Some map onto an implementation's own extension type. A few do not map at all and have to be redesigned.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "kubectl get ingress -A -o json \\\n  | jq -r '.items[].metadata.annotations | keys[]' \\\n  | grep '^nginx.ingress.kubernetes.io/' | sort | uniq -c | sort -rn",
    },
    {
      type: "p",
      text: "That frequency count is the real scope of the migration. A cluster with three annotations in use is a short piece of work; one with twenty-five, including snippet annotations that inject raw NGINX configuration, is a redesign.",
    },
    { type: "h2", id: "translate", text: "3. Use the migration tool as a first pass" },
    {
      type: "p",
      text: "The Kubernetes project maintains ingress2gateway, which reached 1.0 in March 2026 and converts Ingress resources into Gateway API equivalents, with support for over thirty common annotations. Treat its output as a starting draft rather than a finished configuration: what it cannot translate it will tell you about, and that list is precisely the set of decisions a person has to make.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Snippet annotations will not survive",
      text: "Any annotation that injects raw NGINX configuration has no portable equivalent, by design. Gateway API deliberately does not offer an escape hatch into one implementation's config language. Those routes need their intent restated as policy, which is usually the most valuable part of the exercise.",
    },
    { type: "h2", id: "choose", text: "4. Choose the replacement on governance, not features" },
    {
      type: "p",
      text: "The feature comparison between Gateway API implementations is the easy part and the least durable. The criterion that would have predicted this situation is the one worth applying now: who maintains it, under what governance, with what funding, and what is the conformance level against the Gateway API specification. A controller that passes a high conformance tier is one you can leave for another implementation later without repeating this migration. The same question is worth asking of every foundational dependency, which is exactly the ground on which the [Terraform and OpenTofu decision](/devops/terraform-vs-opentofu) now turns.",
    },
    {
      type: "p",
      text: "Running both controllers side by side during the transition is the low-risk path. Gateway API resources and Ingress resources can coexist in a cluster, which allows a service-by-service cutover with a per-service rollback rather than one change affecting everything at once.",
    },
    { type: "h2", id: "interim", text: "If you cannot migrate quickly" },
    {
      type: "ul",
      items: [
        "Pin and record the exact running version, so that when an advisory appears you can assess applicability in minutes rather than days.",
        "Put something in front of it that you can update — a cloud load balancer with WAF rules, or a CDN layer — so a workaround has somewhere to live.",
        "Restrict the controller's own permissions and namespace reach now, on the assumption that it may eventually be the compromised component.",
        "Subscribe to Kubernetes security announcements regardless. Archived does not mean vulnerabilities stop being discovered; it means they stop being fixed.",
      ],
    },
  ],
  faq: [
    {
      question: "Is F5's NGINX Ingress Controller also affected?",
      answer:
        "No. F5's NGINX Ingress Controller is a separate product with its own release stream and continues to be maintained. Only the community project at kubernetes/ingress-nginx was archived. Confirming which one you run is the first thing to establish.",
    },
    {
      question: "Does Gateway API replace Ingress entirely?",
      answer:
        "The Ingress API itself has not been removed from Kubernetes, so existing Ingress objects continue to be valid resources. What has gone is the maintained community controller that implemented them in most clusters. Gateway API is where the project's development effort now sits.",
    },
    {
      question: "Can we keep running it if the cluster is internal only?",
      answer:
        "It lowers the exposure but does not remove it. An internal-only controller still parses HTTP from anything inside the network boundary, which includes any compromised workload. It buys scheduling flexibility, not an exemption.",
    },
  ],
  sources: [
    {
      title: "kubernetes/ingress-nginx repository and retirement notice",
      publisher: "Kubernetes",
      url: "https://github.com/kubernetes/ingress-nginx",
    },
    {
      title: "Gateway API documentation",
      publisher: "Kubernetes SIG Network",
      url: "https://gateway-api.sigs.k8s.io/",
    },
    {
      title: "Announcing Ingress2Gateway 1.0: Your Path to Gateway API",
      publisher: "Kubernetes Blog",
      url: "https://kubernetes.io/blog/2026/03/20/ingress2gateway-1-0-release",
    },
    {
      title: "ingress2gateway migration tool",
      publisher: "Kubernetes SIG Network",
      url: "https://github.com/kubernetes-sigs/ingress2gateway",
    },
  ],
};
