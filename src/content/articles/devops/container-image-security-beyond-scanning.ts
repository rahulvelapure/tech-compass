import type { Article } from "../../types";

export const article: Article = {
  slug: "container-image-security-beyond-scanning",
  category: "devops",
  contentType: "explainer",
  subcategory: "Containers",
  title: "A clean scan tells you about yesterday's known bugs",
  seoTitle: "Container image security: what scanning does not cover",
  metaDescription:
    "Scanning finds known flaws in an image. It cannot tell you the image is the one you built, or what the container does once it runs. The gaps and the fixes.",
  standfirst:
    "A scanner checks what is in the image. It cannot tell you whether that image is yours, or what it does once it starts.",
  excerpt:
    "Vulnerability scanning covers one phase of a container's life. Signing covers whether the image is genuinely yours, and runtime monitoring covers what it does after it starts. Different questions, different tools.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "container image security",
  secondaryKeywords: [
    "container image signing",
    "Sigstore cosign",
    "admission controller image verification",
    "container runtime security",
    "software bill of materials",
  ],
  tags: ["DevOps", "Security", "Containers", "Kubernetes", "Supply Chain"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "secrets-management-cicd-vault-oidc-reality",
    "service-mesh-mtls-operational-overhead",
  ],
  methodology:
    "Written from the Sigstore and cosign documentation, Kubernetes admission control documentation, the Falco project documentation and CNCF supply chain security guidance, verified August 2026. No specific CVE-and-version pairings are given: the source draft named a version as vulnerable to a flaw that version had in fact fixed, and that class of error is easy to repeat and hard to spot. Tool names are examples, not recommendations.",
  body: [
    {
      type: "p",
      text: "Most teams start with a scanner. Point it at the registry, read the report, fix the worst of it, and move on.",
    },
    {
      type: "p",
      text: "That is worth doing and it answers one question: does this image contain packages with flaws somebody has already found and written up.",
    },
    {
      type: "p",
      text: "It cannot answer two others. Is this image the one your pipeline built? And what does the container do once it is running? Those are separate problems needing separate controls.",
    },
    { type: "h2", id: "lifecycle", text: "Four phases, and where scanning reaches" },
    {
      type: "p",
      text: "An image goes through four stages, each with its own way of going wrong.",
    },
    {
      type: "table",
      caption: "Where the risk sits, and what covers it",
      head: ["Phase", "What can go wrong", "Does scanning help?"],
      rows: [
        ["Build", "Bad base image, poisoned dependency, secrets baked into a layer", "Partly"],
        ["Storage", "Someone replaces the image in the registry", "No"],
        ["Deployment", "Something unverified gets admitted to the cluster", "Partly"],
        ["Runtime", "The container is exploited and behaves differently", "No"],
      ],
    },
    {
      type: "p",
      text: "Two of those four rows are not covered at all. That is the gap, and it is not a gap you close by scanning more often.",
    },
    { type: "h2", id: "scanning", text: "What a scan actually tells you" },
    {
      type: "p",
      text: "A scanner reads the image's filesystem, works out what is installed, and checks that list against databases of published flaws. It also flags common build mistakes and secrets left in layers.",
    },
    {
      type: "p",
      text: "That is genuinely useful. Most compromises use something already known and already patched, so finding those first is good economics.",
    },
    {
      type: "p",
      text: "Three limits are worth stating plainly.",
    },
    {
      type: "ul",
      items: [
        "**It only knows what has been published.** Something newly discovered is invisible until a database entry exists and your scanner has it. A clean report is a statement about the database, not about the image.",
        "**It scans whatever is there.** If someone replaced the image, the scanner obediently scans the replacement. It has no opinion about where the image came from.",
        "**It stops at the door.** An image with nothing wrong in it can still be exploited through the application inside it. Scanning has nothing to say about what happens next.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Be careful with version-and-flaw pairings",
      text: "A published flaw is usually fixed in a specific release, so naming a version as vulnerable when it is actually the fixed one is easy to do and hard to notice. Read the advisory rather than a summary, and check whether a version is the last affected or the first fixed. Getting this backwards produces confident, wrong remediation work.",
    },
    { type: "h2", id: "signing", text: "Signing answers a question scanning cannot" },
    {
      type: "p",
      text: "Here is the awkward question. Your pipeline built an image and pushed it. Later, the cluster pulls that tag and runs it. What connects the two?",
    },
    {
      type: "p",
      text: "By default, nothing. A tag is a label, and a label can be moved. Anyone who can write to the registry can point it at different content, and everything downstream carries on as normal.",
    },
    {
      type: "p",
      text: "Signing closes that. The pipeline signs the image it built. At deployment, something checks the signature before the workload is allowed to start.",
    },
    {
      type: "ol",
      items: [
        "The pipeline builds the image.",
        "The pipeline signs it, using a key the pipeline can reach and people cannot.",
        "The signed image goes to the registry.",
        "An admission controller in the cluster is configured to require a valid signature.",
        "A deployment referencing an unsigned or altered image is refused.",
      ],
    },
    {
      type: "p",
      text: "Step four is the one that matters and the one most often skipped. Signing without verification is a ritual — the signature exists and nothing checks it. The control is the admission policy, not the signature.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Sign in the pipeline, verify in the cluster",
      text: "Keep the signing key out of human hands. The identity that signs should be the pipeline itself, using short-lived credentials from your identity provider rather than a stored key — the same reasoning as [keeping static secrets out of CI](/devops/secrets-management-cicd-vault-oidc-reality). A signing key a person can export is a signing key an attacker can use.",
    },
    { type: "h2", id: "sbom", text: "Knowing what is in there, later" },
    {
      type: "p",
      text: "A related gap is answering questions about images that already shipped.",
    },
    {
      type: "p",
      text: "When a serious flaw is announced in a common library, the first question is which of your running images contain it. Without a record, answering means rescanning everything and hoping the scanner recognises it.",
    },
    {
      type: "p",
      text: "A bill of materials generated at build time — a list of what went into the image — turns that into a query. It is unglamorous, it is cheap to produce, and it is the difference between an afternoon and a week when something significant lands.",
    },
    { type: "h2", id: "runtime", text: "Runtime asks a different question entirely" },
    {
      type: "p",
      text: "Scanning asks whether the image contains a known flaw. Runtime monitoring asks whether the container is doing what it should.",
    },
    {
      type: "p",
      text: "Those questions have very little to do with each other, which is why one tool does not cover both.",
    },
    {
      type: "p",
      text: "The behaviours worth alerting on are unremarkable individually and telling in context.",
    },
    {
      type: "ul",
      items: [
        "A process starting that this container has no reason to start — a shell inside a web server, for instance.",
        "Writes outside the paths the workload normally touches.",
        "Network connections to somewhere it has never talked to before.",
        "Attempts to gain privilege, reach the host filesystem, or change capabilities.",
      ],
    },
    {
      type: "p",
      text: "Containers make this more tractable than it sounds. A container usually does a small, predictable set of things, so the normal case is narrow and departures stand out. That is much harder on a general-purpose server.",
    },
    {
      type: "p",
      text: "This is also where workload identity connects. Knowing what a container is allowed to talk to, and enforcing it, is the [mesh side of the same problem](/devops/service-mesh-mtls-operational-overhead) — one covers what it may reach, the other notices what it actually did.",
    },
    { type: "h2", id: "model", text: "What a complete picture covers" },
    {
      type: "table",
      caption: "One control per gap, rather than one tool for everything",
      head: ["Phase", "Control"],
      rows: [
        ["Build", "Dependency scanning, secret detection, build-file linting"],
        ["Build", "Signing, and a bill of materials"],
        ["Storage", "Restrict who can write to the registry; prefer immutable tags"],
        [
          "Deployment",
          "Admission policy requiring a valid signature and blocking known-bad images",
        ],
        ["Runtime", "Behavioural monitoring, and restrictive pod security settings"],
      ],
    },
    {
      type: "p",
      text: "The third row deserves more attention than it gets. Much of the registry risk disappears if tags cannot be overwritten and few identities can push at all. That is configuration rather than a product, and it is usually the cheapest improvement available.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Treat a clean scan as one answer, not the answer. It describes known flaws in what was scanned.",
        "Sign in the pipeline and **verify at admission**. Signing nothing checks is theatre.",
        "Make tags immutable and cut down who can push. Cheap, and it removes a whole attack.",
        "Produce a bill of materials at build time so the next big advisory is a query.",
        "Add behavioural monitoring. It is the only thing watching after the container starts.",
      ],
    },
    {
      type: "p",
      text: "The reason scanning dominates container security is that it produces a number, and a number looks like progress. But the questions it cannot answer are the ones behind the supply chain incidents people actually worry about: was this really the thing we built, and is it doing what we think. Neither is expensive to answer. They are just quieter wins than a report showing the critical count going down.",
    },
  ],
  faq: [
    {
      question: "Is vulnerability scanning enough on its own?",
      answer:
        "No. It finds known flaws in what it scanned. It cannot tell you the image is yours, and it stops looking once the container starts.",
    },
    {
      question: "What does image signing actually prevent?",
      answer:
        "Someone swapping the image behind a tag. Without it, a tag is just a label anyone with write access can move.",
    },
    {
      question: "Do I need an admission controller?",
      answer:
        "If you want signing to mean anything, yes. The check at deploy time is the control. A signature nobody looks at does nothing.",
    },
    {
      question: "What is a bill of materials for?",
      answer:
        "Answering what is in your images without rescanning them all. When a big flaw lands, it turns a week of work into a query.",
    },
    {
      question: "Why is runtime monitoring separate?",
      answer:
        "It asks a different question. Not what is in the image, but whether the container is behaving oddly right now. One tool cannot do both well.",
    },
  ],
  sources: [
    {
      title: "Sigstore: signing and verifying container images",
      publisher: "Sigstore",
      url: "https://docs.sigstore.dev/cosign/signing/overview/",
    },
    {
      title: "Admission controllers reference",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/",
    },
    {
      title: "Pod Security Standards",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/security/pod-security-standards/",
    },
    {
      title: "Falco: runtime security for containers",
      publisher: "Falco",
      url: "https://falco.org/docs/",
    },
    {
      title: "Software Supply Chain Best Practices",
      publisher: "CNCF",
      url: "https://github.com/cncf/tag-security/blob/main/community/working-groups/supply-chain-security/supply-chain-security-paper/CNCF_SSCP_v1.pdf",
    },
  ],
};
