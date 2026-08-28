import type { Article } from "../../types";

export const article: Article = {
  slug: "kubernetes-ephemeral-containers-debugging-production",
  category: "devops",
  contentType: "troubleshooting",
  subcategory: "Kubernetes",
  title: "You built an image with no shell, and now you need a shell",
  seoTitle: "Kubernetes Ephemeral Containers: Debug Without Restarts",
  metaDescription:
    "How to attach a debug container to a running pod, what it can and cannot see, and why the ability to do it is a privilege worth restricting.",
  standfirst:
    "A tiny image is a security win, right up to the day it breaks. An ephemeral container puts the tools back. It does that without touching the pod you are chasing.",
  excerpt:
    "The pod is not restarted and the spec is not rewritten, so the state you are debugging survives. What the debug container can reach is narrower than most people expect.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "Kubernetes ephemeral containers debugging",
  secondaryKeywords: [
    "kubectl debug",
    "distroless debugging",
    "ephemeralContainers spec",
    "process namespace sharing",
    "pods/ephemeralcontainers RBAC",
  ],
  tags: ["Kubernetes", "Troubleshooting", "Containers", "Security", "DevOps"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "container-image-security-beyond-scanning",
    "kubernetes-pod-networking-packet-flow",
  ],
  methodology:
    "Written from the Kubernetes documentation on ephemeral containers, debugging a running pod, process namespace sharing and the `kubectl debug` reference, verified August 2026. One correction was made to the source draft. Its FAQ said ephemeral containers share the pod's filesystem namespace and can read and write mounted volumes; they cannot declare volume mounts at all, which the draft's own list of restrictions states. Reaching another container's files works through the process namespace instead, and the article now explains that route. The draft's payment-service incident was rewritten as the workflow.",
  body: [
    {
      type: "p",
      text: "Small images are the right default. A distroless image holds the binary and its libraries, and nothing else. No shell. No package manager. No network tools.",
    },
    {
      type: "p",
      text: "That is a smaller attack surface, and it works perfectly until something breaks. Then you reach for a shell that is not there.",
    },
    {
      type: "p",
      text: "The old answer was to add a debug sidecar and redeploy. That restarts the pod, which throws away the state you were trying to look at, and it changes the spec, which can change the behaviour. Ephemeral containers avoid both.",
    },
    { type: "h2", id: "what", text: "What an ephemeral container is" },
    {
      type: "p",
      text: "It is a container added to a pod that is already running. The pod is not recreated and the existing containers are untouched. It went stable in Kubernetes 1.25.",
    },
    {
      type: "p",
      text: "You do not create one by editing the pod. There is a dedicated subresource, and the API server hands the request to the kubelet, which asks the runtime to start the container inside the existing sandbox.",
    },
    {
      type: "p",
      text: "It is limited on purpose. Each limit falls out of the fact that the pod is already up and running.",
    },
    {
      type: "ul",
      items: [
        "**No ports.** The pod's networking is already set up.",
        "**No probes.** Nothing should restart or reroute traffic because of a debug tool.",
        "**No resource requests or limits.** A pod's resource allocation is immutable, so there is nothing to add to.",
        "**No restarts.** If it exits, it stays exited. You add another one.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "It cannot mount your volumes",
      text: "Ephemeral containers cannot declare volume mounts. This trips people up because the container is inside the pod, so it feels like it should see the pod's files. It does not: each container has its own filesystem from its own image. You can still reach another container's files, but through the process namespace rather than a mount — see below. If you genuinely need the volumes attached, make a copy of the pod instead.",
    },
    { type: "h2", id: "kubectl-debug", text: "kubectl debug does the wiring" },
    {
      type: "p",
      text: "You rarely write the spec by hand. The CLI fetches the pod, appends the container definition, submits it and attaches your terminal.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "# Attach a debug container to a running pod\nkubectl debug -it payments-7f9b8c6d5-xyz12 \\\n  --image=nicolaka/netshoot \\\n  --target=payments\n\n# Or work on a copy, when you need volumes or a changed command\nkubectl debug payments-7f9b8c6d5-xyz12 \\\n  --image=nicolaka/netshoot \\\n  --copy-to=payments-debug \\\n  --share-processes",
    },
    {
      type: "p",
      text: "The two forms answer different questions. The first leaves the live pod running and adds to it, which is what you want when the state matters. The second builds a copy you can change freely, which is what you want when you need to alter the command or reach the volumes.",
    },
    {
      type: "p",
      text: "`--target` names the container whose process namespace you want to join. Without it you get a container that shares the pod's network but cannot see the application's processes, which is half the value.",
    },
    { type: "h2", id: "network", text: "Network debugging works because the namespace is shared" },
    {
      type: "p",
      text: "The debug container shares the pod's network namespace. Same addresses. Same routes. Same resolver setup.",
    },
    {
      type: "p",
      text: "So a packet capture sees exactly what the application sees. A name lookup resolves the way the application's lookups resolve. That matters, because most connection failures inside a cluster are one of three things, and they look identical from the application's logs.",
    },
    {
      type: "ol",
      items: [
        "**Name resolution.** The service moved, the namespace suffix is wrong, or the search path is not what you assumed.",
        "**Policy.** Something is dropping the traffic before it arrives, and the client just times out.",
        "**The far end.** The name resolved, the packets arrived, and the service is not answering.",
      ],
    },
    {
      type: "p",
      text: "A lookup and a capture separate those in about a minute. The underlying path a packet takes is set out in [Kubernetes pod networking](/devops/kubernetes-pod-networking-packet-flow).",
    },
    { type: "h2", id: "process", text: "Process debugging, and how to reach the files" },
    {
      type: "p",
      text: "With `--target` set, the debug container sees the application's processes. That is enough for a profiler to attach to a running process and produce a profile without changing the application or restarting it.",
    },
    {
      type: "p",
      text: "It also solves the filesystem problem, indirectly. Once you can see a process, you can reach its root filesystem through the proc filesystem, at the path for that process ID.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "# Find the application process\nps aux\n\n# Read its filesystem through /proc, since you cannot mount it\nls /proc/1/root/etc/\ncat /proc/1/root/app/config.yaml",
    },
    {
      type: "p",
      text: "That is read access to the target container's files without a mount and without a shell in the target. It is also exactly why the next section matters.",
    },
    { type: "h2", id: "security", text: "This is a privileged operation" },
    {
      type: "p",
      text: "Read that list again as an attacker would. It is a way to read another container's files, its traffic and its secrets.",
    },
    {
      type: "p",
      text: "A debug container can read the secrets that pod was given. It can see the environment. It can capture traffic, including tokens in flight. It can reach the config through proc. None of that needs a privileged context. It comes with being in the pod.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Check who holds pods/ephemeralcontainers",
      text: "The permission is a subresource verb of its own, separate from `pods/exec`. Roles built by aggregating broad permissions frequently include it without anyone deciding to grant it. Audit which roles have it, and treat it as a break-glass permission rather than a developer convenience. If someone can add an ephemeral container to a pod, they can read everything that pod holds.",
    },
    {
      type: "p",
      text: "Then limit what may be added. An admission policy can turn away a debug container that asks for a privileged context, or host namespaces, or an image you have not approved. The image matters as much as the context. A debug image is code you are inviting into a running pod, which is the supply-chain problem covered in [container image security](/devops/container-image-security-beyond-scanning).",
    },
    {
      type: "p",
      text: "Log the use as well. Ephemeral container creation appears in the audit log, and it is a low-volume, high-signal event. Someone attaching a debug container to a production pod at three in the morning is either an incident or a problem.",
    },
  ],
  faq: [
    {
      question: "Can an ephemeral container mount the pod's volumes?",
      answer:
        "No. Volume mounts are not allowed on ephemeral containers. Use `kubectl debug --copy-to` to make a copy of the pod if you need the volumes attached.",
    },
    {
      question: "How do I read files from the target container?",
      answer:
        "Share the process namespace with `--target`, then read through the proc filesystem. The target's root is at `/proc/<pid>/root`.",
    },
    {
      question: "Do ephemeral containers survive a restart?",
      answer:
        "No. They are not part of the persistent spec. If the pod is recreated for any reason, they are gone.",
    },
    {
      question: "Does adding one restart the pod?",
      answer:
        "No, and that is the point. The existing containers keep running, so the state you are investigating is still there when you arrive.",
    },
    {
      question: "Can I see the debug container's logs?",
      answer:
        "Yes, with `kubectl logs` and the container name. They reach your log pipeline too, like any other container output.",
    },
    {
      question: "Who should be allowed to create them?",
      answer:
        "Very few people. The verb is its own thing, separate from exec. Anyone who holds it can read everything a pod holds.",
    },
  ],
  sources: [
    {
      title: "Ephemeral containers",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/",
    },
    {
      title: "Debug running pods",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/",
    },
    {
      title: "Share process namespace between containers in a pod",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/tasks/configure-pod-container/share-process-namespace/",
    },
    {
      title: "kubectl debug",
      publisher: "Kubernetes",
      url: "https://kubernetes.io/docs/reference/kubectl/generated/kubectl_debug/",
    },
  ],
};
