import type { Article } from "../../types";

export const article: Article = {
  slug: "linux-file-permissions-posix-acls-capabilities",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Security operations",
  title: "The bits say yes and the kernel still says no",
  seoTitle: "Linux Permissions: POSIX ACLs and File Capabilities",
  metaDescription:
    "What sits above chmod: POSIX ACLs and the mask that overrides them, file capabilities instead of setuid root, and the order the kernel checks them in.",
  standfirst:
    "Nine permission bits answer one question well. Modern systems keep asking three more, and each one has its own layer.",
  excerpt:
    "An ACL that reads rwx can grant r--, a binary can lose its powers by being copied, and the layer people blame first is usually the layer checked last.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-27",
  nextReviewAt: "2028-08-27",
  readingMinutes: 6,
  primaryKeyword: "Linux file permissions ACL capabilities",
  secondaryKeywords: [
    "setfacl mask",
    "default ACL inheritance",
    "CAP_NET_BIND_SERVICE",
    "capability bounding set",
    "CAP_DAC_OVERRIDE",
  ],
  tags: ["Linux", "Security", "Access control", "Containers", "Operations"],
  reviewStatus: "research-based",
  relatedSlugs: ["container-image-security-beyond-scanning", "zero-trust-network-segmentation"],
  methodology:
    "Written from the Linux man pages for acl, setfacl, capabilities, setcap and credentials, and the kernel documentation on Linux Security Modules, verified August 2026. One correction reverses the source draft's central claim. The draft states that the kernel evaluates the security module first and skips file permissions when it denies. The order is the other way round: the standard permission checks run first, and the module hook runs after them, so a security module can only narrow access that the file permissions already allowed. The draft also omits default ACLs and the ambient capability set, both of which are covered here.",
  body: [
    {
      type: "p",
      text: "A service cannot read a file. You check the file. The owner is right, the group is right, and the bits clearly allow it.",
    },
    {
      type: "p",
      text: "The bits are not the whole answer any more. Two other layers sit alongside them, and each one can refuse on its own terms.",
    },
    { type: "h2", id: "bits", text: "What the nine bits cannot express" },
    {
      type: "p",
      text: "The classic model gives a file one owner, one group, and three permissions for everyone else. That is nine bits, and it has held up for decades.",
    },
    {
      type: "p",
      text: "It runs out in three specific places:",
    },
    {
      type: "ul",
      items: [
        "Two teams need different access to the same file. There is only one group slot.",
        "A process needs one root power and nothing else. There is no way to say that with bits.",
        "You want a rule that survives new files being created later. Bits describe what exists now.",
      ],
    },
    {
      type: "p",
      text: "ACLs answer the first. Capabilities answer the second. Default ACLs answer the third.",
    },
    { type: "h2", id: "order", text: "The order matters more than the layers" },
    {
      type: "p",
      text: "This is the part that is usually taught backwards. The kernel runs the standard permission checks first. Only then does it call the security module hook, where SELinux or AppArmor gets its say.",
    },
    {
      type: "p",
      text: "The consequence is simple and useful. A security module can take access away. It can never hand access back.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Debug in the same order the kernel does",
      text: "If the file bits and ACLs already say no, SELinux was never the reason. Check ownership, then the bits, then getfacl, and only reach for the audit log once you have proved the discretionary layer allows it. Teams that start at the audit log spend hours writing policy for a denial that chmod caused.",
    },
    { type: "h2", id: "acls", text: "POSIX ACLs, and the mask that undoes them" },
    {
      type: "p",
      text: "An ACL adds named entries. You can grant one user read and write, and a second group read only, without touching the owner or the group.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "setfacl -m u:alice:rw- report.csv\nsetfacl -m g:auditors:r-- report.csv\ngetfacl report.csv",
    },
    {
      type: "p",
      text: "A file with ACLs shows a plus sign at the end of its mode in a long listing. That plus is easy to miss, and it is the only hint in normal output that extra rules exist.",
    },
    {
      type: "p",
      text: "Then there is the mask. Every ACL carries one, and it is a ceiling on every named entry. An entry can read rwx and still grant r-- if the mask says r--.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "chmod on the group bits edits the mask",
      text: "When a file has an ACL, the group permission bits are the mask. So chmod g=r on that file quietly lowers the ceiling for every named user and group at once. The ACL entries still read as they did. Their effect changes. This is the single most common way carefully built ACLs stop working, and nothing in the chmod output warns you.",
    },
    {
      type: "p",
      text: "Default ACLs solve the inheritance problem. Set one on a directory and new files created inside it start with those entries already applied.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "setfacl -d -m g:developers:rwx /srv/shared",
    },
    {
      type: "p",
      text: "A default ACL applies only to things created after you set it. Existing files are untouched, so pair it with a recursive pass the first time.",
    },
    { type: "h2", id: "caps", text: "Capabilities: root, taken apart" },
    {
      type: "p",
      text: "Root is not one privilege. The kernel splits it into roughly forty distinct powers, and a process can hold any subset of them.",
    },
    {
      type: "p",
      text: "That turns a common problem into a small one. A web server needs port 80, which is below 1024 and therefore restricted. The old answer was to start it as root and drop down afterwards.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "setcap 'cap_net_bind_service=+ep' /usr/local/bin/myapp\ngetcap /usr/local/bin/myapp",
    },
    {
      type: "p",
      text: "Now it binds the port as an ordinary user. Nothing else about root comes with it.",
    },
    {
      type: "p",
      text: "A few capabilities are worth knowing by name, because they are the ones that give the game away:",
    },
    {
      type: "table",
      caption: "Capabilities that change the security picture",
      head: ["Capability", "What it allows", "Why it matters"],
      rows: [
        [
          "CAP_NET_BIND_SERVICE",
          "Bind ports below 1024",
          "The safe, narrow case. Usually the right answer",
        ],
        [
          "CAP_DAC_OVERRIDE",
          "Skip file permission checks",
          "Every ACL and every bit on the system stops applying",
        ],
        [
          "CAP_SYS_ADMIN",
          "A large, mixed set of admin operations",
          "Close enough to root that granting it ends the conversation",
        ],
        [
          "CAP_SYS_PTRACE",
          "Attach to other processes",
          "Read memory of anything it can reach, including secrets",
        ],
      ],
    },
    {
      type: "p",
      text: "File capabilities live in extended attributes on the binary itself. That has a consequence people meet the hard way.",
    },
    {
      type: "p",
      text: "Copy the binary, rebuild it, or deploy a new release, and the capabilities are gone. The file is new, and extended attributes do not follow it. Nothing errors. The service simply fails to bind on the next start, so setcap belongs in the install step, not in a one-off fix.",
    },
    { type: "h2", id: "sets", text: "Why setcap alone sometimes does nothing" },
    {
      type: "p",
      text: "A process carries several capability sets, not one. Two of them explain most surprises.",
    },
    {
      type: "p",
      text: "The bounding set is a hard ceiling. A capability removed from it can never be regained, by anyone, for the life of that process and its children. Container runtimes use this, which is why adding a capability inside a container that the runtime dropped has no effect.",
    },
    {
      type: "p",
      text: "The ambient set is the newer one. It lets a non-root process pass capabilities to the programs it runs, which is what makes capabilities usable without setuid binaries in the chain.",
    },
    {
      type: "p",
      text: "Containers start with most capabilities already dropped. That default is a real security boundary and worth keeping, alongside the [image-level controls](/devops/container-image-security-beyond-scanning) around it. Add back the one capability you need rather than reaching for the privileged flag.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myimage",
    },
    { type: "h2", id: "systemd", text: "Where this is actually configured" },
    {
      type: "p",
      text: "In practice you rarely run setcap by hand on a production host. The unit file is the better place, because it is version-controlled and survives a package upgrade that replaces the binary.",
    },
    {
      type: "code",
      language: "ini",
      filename: "/etc/systemd/system/myapp.service",
      code: "[Service]\nUser=myapp\nCapabilityBoundingSet=CAP_NET_BIND_SERVICE\nAmbientCapabilities=CAP_NET_BIND_SERVICE\nNoNewPrivileges=yes",
    },
    {
      type: "p",
      text: "Those four lines do distinct jobs. The bounding set caps what the process could ever hold. The ambient line grants the one capability it needs at start. NoNewPrivileges stops the process gaining more later, which also neutralises any setuid binary it might execute.",
    },
    {
      type: "p",
      text: "Set this way, the capability follows the service rather than the file on disk. A package upgrade that swaps the binary no longer silently removes it.",
    },
    {
      type: "p",
      text: "One note on the letters in a setcap expression. The p flag means permitted, so the process may hold the capability. The e flag means effective, so it is active without the program asking. A binary that is capability-aware can be given p alone and raise it itself, which narrows the window in which it applies.",
    },
    { type: "h2", id: "ladder", text: "A debugging ladder that ends in the right place" },
    {
      type: "ol",
      items: [
        "Check the identity the process actually runs as. It is often not the one in the unit file.",
        "Check ownership and the bits. Look for a plus sign at the end of the mode.",
        "Run getfacl if the plus is there. Read the mask line before the entries.",
        "Run getcap on the binary if the failure is a bind, a raw socket or a device.",
        "Only now read the audit log for a security module denial.",
      ],
    },
    {
      type: "p",
      text: "That order matches what the kernel does, which is why it converges. Working the other way round means writing policy for denials that never reached the policy layer.",
    },
    {
      type: "p",
      text: "There is a wider point buried in all this. Each layer was added because the one below it could not express something, and none of them replaced what came before.",
    },
    {
      type: "p",
      text: "So a modern Linux host enforces access in three places at once, and they are configured with three unrelated tools. Reading only one of them gives you a confident answer that is wrong about a third of the time.",
    },
  ],
  faq: [
    {
      question: "Do ACLs work on every filesystem?",
      answer:
        "The common ones, yes. ext4, XFS and Btrfs all handle them. Some network mounts do not.",
    },
    {
      question: "Why did my ACL stop working after a chmod?",
      answer:
        "The group bits are the mask. A chmod on them lowers the ceiling for all the named entries.",
    },
    {
      question: "Can SELinux grant access the bits refuse?",
      answer: "No. It runs after the normal checks. It can only take access away, never add it.",
    },
    {
      question: "Where did my capability go after a deploy?",
      answer:
        "Into the old file. They live on the binary, so a new copy starts with none. Set them on install.",
    },
    {
      question: "Is CAP_SYS_ADMIN safer than running as root?",
      answer: "Barely. It covers so much that most people treat it as root with extra steps.",
    },
    {
      question: "Should I use ACLs or just make more groups?",
      answer:
        "Groups first, if the sharing is stable. ACLs earn their place when the exceptions keep piling up.",
    },
  ],
  sources: [
    {
      title: "acl(5) â€” Access Control Lists",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man5/acl.5.html",
    },
    {
      title: "setfacl(1)",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man1/setfacl.1.html",
    },
    {
      title: "capabilities(7) â€” overview of Linux capabilities",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man7/capabilities.7.html",
    },
    {
      title: "setcap(8)",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man8/setcap.8.html",
    },
    {
      title: "Linux Security Modules: General Security Hooks for Linux",
      publisher: "Linux Kernel documentation",
      url: "https://docs.kernel.org/security/lsm.html",
    },
    {
      title: "path_resolution(7) and file permission checking",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man7/path_resolution.7.html",
    },
  ],
};
