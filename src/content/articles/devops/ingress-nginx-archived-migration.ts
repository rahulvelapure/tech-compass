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
    "This one cannot wait for the next planning cycle. It is an unpatched component, and it sits in the path of every request behind it.",
  excerpt:
    "The most widely deployed Kubernetes ingress controller is now read-only and will receive no further security updates. Here is how to assess the exposure and plan the move.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  updatedAt: "2026-08-27",
  lastReviewedAt: "2026-08-27",
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
      text: "The Kubernetes ingress-nginx repo was archived by its owner on 24 March 2026. It is now read-only. Its notice is blunt. The maintenance window has closed. There are no more releases, no bug fixes, and no fixes for security flaws. It also tells anyone not already running it not to start.",
    },
    {
      type: "p",
      text: "That last line changes the shape of the problem. An ingress controller is not a peripheral part. It terminates TLS. It parses untrusted HTTP from the public internet. It sits in the request path of every service routed through it.",
    },
    {
      type: "p",
      text: "Put a component in that position with no route to a security fix, and you have a different category of risk. It is not a merely outdated dependency, and it should not be tracked as technical debt. The same test applies to anything else in the stack that has left support, including [a language runtime past its end of life](/development/nodejs-release-schedule-change).",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The exposure is asymmetric",
      text: "A flaw disclosed in an archived controller has no patch coming. That leaves three answers: a configuration workaround, a compensating control in front of it, or having already moved. The first two are not always possible.",
    },
    { type: "h2", id: "assess", text: "1. Establish what you actually run" },
    {
      type: "p",
      text: "Two projects share a very similar name, and teams often do not know which one they have. The community project kubernetes/ingress-nginx is the archived one. F5's NGINX Ingress Controller is separate. It is a commercial product and still gets releases. Confirm which one is deployed first, because it decides whether there is any urgency at all.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: 'kubectl get pods -A -l app.kubernetes.io/name=ingress-nginx \\\n  -o jsonpath=\'{range .items[*]}{.metadata.namespace}{"\\t"}{.spec.containers[*].image}{"\\n"}{end}\'',
    },
    {
      type: "p",
      text: "An image path under registry.k8s.io/ingress-nginx is the archived community project. An image from a private registry or an F5 path is the commercial controller. The deadline does not apply to it in the same way.",
    },
    {
      type: "h2",
      id: "inventory",
      text: "2. Inventory the annotations, not just the Ingress objects",
    },
    {
      type: "p",
      text: "Counting Ingress resources understates the work by a wide margin. The behaviour that matters lives in controller-specific annotations: rewrites, timeouts, body size limits, authentication subrequests, canary weighting. Each one has to find an equivalent in whatever replaces it. Some map cleanly onto Gateway API resources. Some map onto an implementation's own extension type. A few do not map at all, and those have to be redesigned.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "kubectl get ingress -A -o json \\\n  | jq -r '.items[].metadata.annotations | keys[]' \\\n  | grep '^nginx.ingress.kubernetes.io/' | sort | uniq -c | sort -rn",
    },
    {
      type: "p",
      text: "That frequency count is the real scope of the migration. A cluster using three annotations is a short piece of work. One using twenty-five is a redesign, especially where snippet annotations inject raw NGINX config.",
    },
    { type: "h2", id: "translate", text: "3. Use the migration tool as a first pass" },
    {
      type: "p",
      text: "The Kubernetes project maintains ingress2gateway. It reached 1.0 in March 2026 and converts Ingress resources into Gateway API equivalents, covering over thirty common annotations. Treat its output as a starting draft, not a finished config. It tells you what it could not translate, and that list is exactly the set of decisions a person has to make.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Snippet annotations will not survive",
      text: "Any annotation that injects raw NGINX config has no portable equivalent, by design. Gateway API does not offer an escape hatch into one implementation's config language. Those routes need their intent restated as policy. That is usually the most valuable part of the exercise.",
    },
    { type: "h2", id: "choose", text: "4. Choose the replacement on governance, not features" },
    {
      type: "p",
      text: "Comparing features between Gateway API implementations is the easy part, and the least durable. Ask instead what would have predicted this situation. Who maintains it, under what governance, with what funding? What conformance level does it meet against the Gateway API specification?",
    },
    {
      type: "p",
      text: "A controller at a high conformance tier is one you can leave later for another implementation, without repeating this migration. The same question is worth asking of every foundational dependency. It is exactly the ground on which the [Terraform and OpenTofu decision](/devops/terraform-vs-opentofu) now turns.",
    },
    {
      type: "p",
      text: "Running both controllers side by side is the low-risk path. Gateway API resources and Ingress resources can coexist in one cluster. That allows a service-by-service cutover, with a rollback per service, rather than one change that hits everything at once.",
    },
    { type: "h2", id: "interim", text: "If you cannot migrate quickly" },
    {
      type: "ul",
      items: [
        "Pin and record the exact running version. When an advisory appears, you can then judge whether it applies in minutes rather than days.",
        "Put something you can update in front of it, such as a cloud load balancer with WAF rules or a CDN layer. A workaround needs somewhere to live.",
        "Restrict the controller's own permissions and namespace reach now. Assume it may one day be the compromised component.",
        "Subscribe to Kubernetes security announcements anyway. Archived does not mean flaws stop being found. It means they stop being fixed.",
      ],
    },
  ],
  faq: [
    {
      question: "Is F5's NGINX Ingress Controller also affected?",
      answer:
        "No. That one is a different product. It has its own releases and is still looked after. Only the community project was archived.",
    },
    {
      question: "Does Gateway API replace Ingress entirely?",
      answer:
        "No. The Ingress API is still in Kubernetes, so your Ingress objects still work. What went away is the controller that ran them.",
    },
    {
      question: "Can we keep running it if the cluster is internal only?",
      answer:
        "It lowers the risk. It does not remove it. The controller still reads HTTP from inside the network, and that includes any workload already compromised.",
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
