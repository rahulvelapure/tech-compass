import type { Article } from "../../types";

export const article: Article = {
  slug: "linux-security-modules-selinux-apparmor-seccomp-containers",
  category: "cybersecurity-ciso",
  contentType: "decision-framework",
  subcategory: "Security operations",
  title: "Three confinement layers, and the one everyone switches off",
  seoTitle: "Container Security: seccomp, AppArmor and SELinux Compared",
  metaDescription:
    "Containers share the host kernel. seccomp filters syscalls, AppArmor confines by path, SELinux confines by label. What each one stops, and why teams disable them.",
  standfirst:
    "A container is a process with a good disguise. When the kernel boundary fails, these three layers decide how far an attacker gets.",
  excerpt:
    "seccomp, AppArmor and SELinux solve different problems and fail in different ways. Knowing which one to reach for beats turning all three off after the first Permission Denied.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-29",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 5,
  primaryKeyword: "container security SELinux AppArmor seccomp",
  secondaryKeywords: [
    "seccomp default profile",
    "SELinux MCS labels",
    "AppArmor profile Kubernetes",
    "mandatory access control containers",
    "container breakout",
  ],
  tags: ["Linux", "Containers", "Security", "Kubernetes", "Hardening"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "linux-ebpf-security-monitoring-kernel-probes",
    "container-image-security-beyond-scanning",
  ],
  methodology:
    "Written from Kubernetes documentation on seccomp and AppArmor, kernel documentation on seccomp filtering, and Red Hat material on SELinux container confinement, verified August 2026. Two corrections were made: seccomp filters are classic BPF programs rather than eBPF, and the AppArmor pod annotation has been replaced by a securityContext field. The source draft's syscall counts and its invented breach scenario were removed.",
  body: [
    {
      type: "p",
      text: "A virtual machine has its own kernel. A container does not.",
    },
    {
      type: "p",
      text: "Every container on a node calls the same kernel, through the same syscall interface. Namespaces change what a process can see. They do not change what it can ask the kernel to do.",
    },
    {
      type: "p",
      text: "So when a runtime or kernel bug lets a process out of its namespace, ask what else stands in the way. That is what these three layers are for. It is also why switching them off matters more than it seems to at the time.",
    },
    { type: "h2", id: "layers", text: "Three layers, three different questions" },
    {
      type: "table",
      caption: "What each layer decides",
      head: ["Layer", "Question it answers", "Granularity"],
      rows: [
        ["seccomp", "May this process make this syscall at all?", "Per syscall"],
        ["AppArmor", "May this program touch this path?", "Per file path and capability"],
        ["SELinux", "May this label act on that label?", "Per subject and object label"],
      ],
    },
    {
      type: "p",
      text: "They stack rather than compete. seccomp narrows the interface. AppArmor or SELinux limit what a process can reach through what is left. seccomp is not a security module, so it runs beside whichever one your distribution uses.",
    },
    { type: "h2", id: "seccomp", text: "seccomp: shrinking the attack surface" },
    {
      type: "p",
      text: "The kernel offers several hundred syscalls. A typical app uses a small fraction of them.",
    },
    {
      type: "p",
      text: "The rest are still reachable. Some are exactly what an exploit needs: mounting filesystems, tracing other processes, making namespaces. seccomp lets a process give up the calls it will never need.",
    },
    {
      type: "p",
      text: "A filter is a program the kernel runs on each syscall, deciding whether to allow it, fail it with an error, or kill the process.",
    },
    {
      type: "callout",
      variant: "note",
      title: "seccomp uses classic BPF, not eBPF",
      text: "People conflate these constantly, including the draft this article came from. seccomp filters are classic BPF programs. They are small. They have no maps and no helper functions. A process attaches one to itself. eBPF is the newer and far more capable subsystem behind tracing and networking, and loading eBPF is privileged. seccomp is the opposite: an unprivileged process fencing itself in. Same ancestry, different mechanisms, different threat models.",
    },
    {
      type: "p",
      text: "Container runtimes ship a default profile. It blocks the calls that are risky inside a container. The list is cautious on purpose. It stops a real class of escape tricks, and normal apps never notice.",
    },
    {
      type: "p",
      text: "It does break some workloads. Newer asynchronous I/O interfaces hit it. So does any tool that needs to trace another process. Those fail at once under the default.",
    },
    {
      type: "p",
      text: "What happens next is the problem. Running the workload unconfined drops the whole layer to fix one call. The fair fix is a custom profile. Record which calls the app really makes during a normal run. Allow those, and keep the rest blocked.",
    },
    { type: "h2", id: "apparmor", text: "AppArmor: confinement by path" },
    {
      type: "p",
      text: "AppArmor confines a program using file paths. A profile lists what it may read, write and execute, and which capabilities it may use.",
    },
    {
      type: "p",
      text: "Its strength is that a human can read it. Take a rule saying a process may write to one log directory and nowhere else. That is easy to review, and easy to reason about.",
    },
    {
      type: "p",
      text: "Its weakness comes from the same design. A path is a name for a file, not the file itself. If an attacker can make links or mounts, an allowed path may end up pointing somewhere it should not.",
    },
    {
      type: "p",
      text: "Containers make this harder. The root filesystem is built from overlay layers, and those paths are runtime detail. So a precise profile means reasoning about paths you never chose.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The pod annotation is deprecated",
      text: "AppArmor used to go on a pod as a `container.apparmor.security.beta.kubernetes.io/` annotation. From Kubernetes v1.30 it is a proper field: `securityContext.appArmorProfile`. The type is RuntimeDefault, Localhost or Unconfined. Manifests and blog posts still show the annotation everywhere. So if you copy an example, check which form it uses. And note that a container setting beats the pod setting.",
    },
    { type: "h2", id: "selinux", text: "SELinux: confinement by label" },
    {
      type: "p",
      text: "SELinux drops paths entirely. Every process, file and port carries a label, and policy states which labels may act on which.",
    },
    {
      type: "p",
      text: "That removes the link and mount problem at a stroke. Renaming a file does not change its label, so reaching it by another name changes nothing.",
    },
    {
      type: "p",
      text: "For containers, the key part is Multi-Category Security. The runtime gives each container its own category. It tags that container's files to match. Policy then allows access only where the two agree.",
    },
    {
      type: "p",
      text: "This is worth stating plainly, because it is the strongest promise on offer here. Root inside container A is still a process with A's label. Reading container B's files fails on a label mismatch. Being root does not change the label. That is why label-based confinement underpins serious multi-tenant platforms.",
    },
    {
      type: "p",
      text: "The cost is volumes. Anything mounted in needs a label the container can reach, so the runtime has to relabel it. Sometimes it cannot. Read-only storage will not take a new label. Some filesystems do not support the attributes. Then the container fails to start, or the app gets permission errors that look nothing like a security control.",
    },
    {
      type: "p",
      text: "One caveat on advice you will find online. The `:Z` mount suffix that triggers relabelling is a Docker and Podman feature. Kubernetes handles labelling through the pod SELinux options and the storage driver. So examples from a container CLI do not carry over.",
    },
    { type: "h2", id: "choosing", text: "Choosing, and the honest constraint" },
    {
      type: "p",
      text: "You do not get to pick both major modules. The kernel runs one primary LSM, chosen at boot, so in practice your distribution has already chosen for you. seccomp is available either way.",
    },
    {
      type: "ul",
      items: [
        "**Always keep the default seccomp profile.** It is the cheapest protection here and the one most often discarded for the least reason.",
        "**Prefer SELinux for multi-tenant nodes.** It is the only one here that still holds when an attacker already has root inside a container.",
        "**Use AppArmor for targeted confinement.** It suits one high-risk service well. It is also easier to write and review than SELinux policy.",
        "**Profile before you turn it off.** Recording what an app really calls takes an afternoon. Running unconfined lasts until someone looks again. Nobody does.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Denials are a detection source, not just noise",
      text: "Both AppArmor and SELinux log what they refuse. Most teams treat those logs as noise and drop them. But a denial means a process tried something its profile forbids. That is either a misconfiguration or exactly the signal you want during an intrusion. Ship them to your SIEM. Alert on new denial types from workloads that used to be quiet.",
    },
    {
      type: "p",
      text: "One last thing worth naming plainly. Setting a pod privileged does not disable one layer, it disables the lot: seccomp, the LSM confinement and the capability set together. It is not a stronger version of turning off a profile. It is turning off the boundary.",
    },
    {
      type: "p",
      text: "These layers do not replace care about what runs in the container. Where an image came from, and what you let in, is a separate control with its own failure mode. That ground is covered in [container image security](/devops/container-image-security-beyond-scanning).",
    },
  ],
  faq: [
    {
      question: "Can I run AppArmor and SELinux together?",
      answer:
        "No. The kernel runs one main module, picked at boot. seccomp is separate and works with either one.",
    },
    {
      question: "Is seccomp built on eBPF?",
      answer:
        "No, and this is a common mix-up. seccomp filters are classic BPF: small, self-imposed, no maps or helpers. eBPF is the newer subsystem, and loading it is privileged.",
    },
    {
      question: "Why does my container get Permission Denied on a volume?",
      answer:
        "The volume needs a label the pod can reach. If the runtime cannot relabel it, access is denied. The error will not mention labels.",
    },
    {
      question: "How do I apply an AppArmor profile in Kubernetes now?",
      answer:
        "Through the pod security context. The old way used an annotation, and that is going away. Most guides still show the old form.",
    },
    {
      question: "What should I do when the default seccomp profile breaks an app?",
      answer:
        "Record the calls it really makes, then write a profile that allows those. Running unconfined drops the whole layer to fix one call.",
    },
    {
      question: "Is privileged just a shortcut for disabling one profile?",
      answer:
        "No. It turns off seccomp, the module that confines the process, and the limits on what it may do. That removes the wall rather than lowering it.",
    },
  ],
  sources: [
    {
      title: "Restrict a container's syscalls with seccomp",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/tutorials/security/seccomp/",
    },
    {
      title: "Restrict a container's access to resources with AppArmor",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/tutorials/security/apparmor/",
    },
    {
      title: "Seccomp BPF: secure computing with filters",
      publisher: "Linux Kernel Documentation",
      url: "https://www.kernel.org/doc/html/latest/userspace-api/seccomp_filter.html",
    },
    {
      title: "Understanding SELinux container confinement",
      publisher: "Red Hat",
      url: "https://www.redhat.com/en/blog/understanding-selinux-container-confinement",
    },
    {
      title: "Pod Security Standards",
      publisher: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/concepts/security/pod-security-standards/",
    },
  ],
};
