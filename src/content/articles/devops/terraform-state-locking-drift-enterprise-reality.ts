import type { Article } from "../../types";

export const article: Article = {
  slug: "terraform-state-locking-drift-enterprise-reality",
  category: "devops",
  contentType: "explainer",
  subcategory: "Infrastructure as Code",
  title: "Terraform state is a memory, and it can be wrong about your infrastructure",
  seoTitle: "Terraform state locking and drift: what to get right",
  metaDescription:
    "Locking stops two runs colliding. It does nothing about drift. How state goes wrong, why a refactor can plan a database deletion, and how to segment.",
  standfirst:
    "Terraform does not look at your cloud and work things out. It trusts a file that says what should be there.",
  excerpt:
    "State locking prevents concurrent writes. It does not prevent drift, and it does not stop a refactor planning to destroy a database. What actually keeps state safe at scale.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "Terraform state locking",
  secondaryKeywords: [
    "Terraform drift detection",
    "terraform moved block",
    "terraform force-unlock",
    "remote state data source",
    "Terraform state segmentation",
  ],
  tags: ["DevOps", "Terraform", "Infrastructure as Code", "Cloud", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["terraform-vs-opentofu", "secrets-management-cicd-vault-oidc-reality"],
  methodology:
    "Written from HashiCorp's Terraform documentation on state, backends, locking, the moved block and refactoring, verified August 2026. Command and block names are quoted from that documentation. No plan durations, resource counts or timing figures are given: they depend on provider, resource type and API latency. Backend locking guidance is flagged as version-dependent because it has changed.",
  body: [
    {
      type: "p",
      text: "Terraform does not inspect your cloud and work out what to do. It reads a file that records what it believes exists, compares that to your code, and acts on the difference.",
    },
    {
      type: "p",
      text: "That file is the whole system. Lose it and Terraform forgets your infrastructure exists. Let it drift from reality and Terraform will confidently make reality match the file, which is not always what you want.",
    },
    {
      type: "p",
      text: "The tutorials cover storing it remotely and locking it. That is the start, and most of the failures happen past that point.",
    },
    { type: "h2", id: "locking", text: "What locking does, and does not do" },
    {
      type: "p",
      text: "Before an operation that could write state, Terraform takes a lock. A second run against the same state is refused while the first holds it.",
    },
    {
      type: "p",
      text: "This exists to stop a specific disaster. Two runs read the same state, each decides what to change, and each writes back — the second overwriting the first. You end up with cloud resources nothing is tracking and a state file that describes neither reality.",
    },
    {
      type: "callout",
      variant: "note",
      title: "How locking is configured has changed",
      text: "For years the standard pattern on AWS was an S3 bucket for state plus a DynamoDB table for locking, and most guidance still says that. Newer Terraform versions support locking in S3 itself, without the separate table. Check what your version supports before building the older arrangement.",
    },
    {
      type: "p",
      text: "The failure people meet is the stuck lock. A runner is killed, or someone interrupts a local run, and the process dies before releasing it. Nothing can run until the lock is cleared.",
    },
    {
      type: "p",
      text: "There is a command to force it, and it deserves respect. If the original process is in fact still running somewhere, forcing the unlock produces exactly the corruption the lock existed to prevent. Confirm the other run is genuinely dead before using it.",
    },
    {
      type: "p",
      text: "And the important limit: locking coordinates writers. It says nothing about whether the state is still true.",
    },
    { type: "h2", id: "drift", text: "Drift, and why it is dangerous rather than untidy" },
    {
      type: "p",
      text: "Drift is when the cloud stops matching the state. It happens for ordinary reasons.",
    },
    {
      type: "ul",
      items: [
        "**Someone changed something by hand.** Usually during an incident, usually for good reasons, usually not recorded anywhere.",
        "**Another system changed it.** A controller, an autoscaler or a backup tool touching resources Terraform believes it owns.",
        "**The provider changed underneath you.** A default moves or an attribute is deprecated, and a plan shows a difference nobody caused.",
      ],
    },
    {
      type: "p",
      text: "Drift itself is harmless. What makes it dangerous is the next apply, because Terraform's job is to remove differences.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The emergency fix gets reverted",
      text: "An engineer detaches a volume by hand to rescue data from a failing instance. State still says it should be attached. The next apply sets about making that true, and the fix — along with what it was protecting — can be undone by a pipeline doing exactly what it was told.",
    },
    {
      type: "p",
      text: "The defence is to find drift on your own schedule rather than during a deployment. A read-only plan running nightly, with an alert when it finds changes, turns a surprise into a ticket.",
    },
    { type: "h2", id: "refactor", text: "Moving code can plan to destroy a database" },
    {
      type: "p",
      text: "This is the one that costs people production data, and it happens during work that feels entirely safe.",
    },
    {
      type: "p",
      text: "State tracks resources by their address in your configuration. Move a resource into a module and its address changes. Terraform sees a resource that no longer exists at the old address, and a new one at an address it has never seen.",
    },
    {
      type: "p",
      text: "So the plan says destroy and create. The code is identical, nothing about the infrastructure changed, and the plan proposes deleting a database and building an empty one.",
    },
    {
      type: "p",
      text: "The fix is to tell Terraform the resource moved. A `moved` block in the configuration records the old address and the new one, and the next plan shows no changes at all. There is also a state command for the same job, but the block is version-controlled and reviewable, which the command is not.",
    },
    {
      type: "p",
      text: "Worth knowing before the first refactor rather than after. A plan that proposes destroying something you did not intend to touch is a signal to stop and look at addresses, not to approve it because the code looks right.",
    },
    { type: "h2", id: "segmentation", text: "One state for everything is the trap" },
    {
      type: "p",
      text: "Early Terraform adoption tends to produce a single state holding the network, the databases, the clusters and the applications. It is simple, and it stops scaling in three ways at once.",
    },
    {
      type: "table",
      caption: "What a monolithic state costs",
      head: ["Problem", "What it looks like"],
      rows: [
        ["Slow plans", "Every run refreshes everything, whether or not it is relevant"],
        [
          "Wide blast radius",
          "A mistake in an application change can propose destroying core infrastructure",
        ],
        [
          "Coarse permissions",
          "Anyone who can apply anything needs permission to change everything",
        ],
      ],
    },
    {
      type: "p",
      text: "The third is the one that quietly matters most. If one pipeline manages all of it, that pipeline's credentials can modify all of it, and there is no way to give a team autonomy over their own resources without giving them the network too.",
    },
    {
      type: "p",
      text: "Splitting state into layers — network, data, compute, application — fixes all three. Layers read from each other using a remote state data source, so an application workspace can look up a network identifier without being able to change the network.",
    },
    {
      type: "p",
      text: "The dependency direction matters. Lower layers should not read from higher ones, or you have made a cycle out of things that were meant to be independent.",
    },
    { type: "h2", id: "mistakes", text: "Three things not to do" },
    {
      type: "p",
      text: "**Do not commit state to Git.** State can contain values captured during resource creation, including secrets. Committing it publishes them to everyone with repository access, and to every clone that ever existed. Use a remote backend. The same reasoning that keeps [static credentials out of pipelines](/devops/secrets-management-cicd-vault-oidc-reality) applies here.",
    },
    {
      type: "p",
      text: "**Do not hand-edit the file.** State carries internal bookkeeping that has to stay consistent. Downloading it, editing the JSON and putting it back is how state becomes unreadable. The state subcommands exist to make these changes safely, with locking.",
    },
    {
      type: "p",
      text: "**Do not auto-apply on a successful plan.** A plan that proposes destroying half your environment succeeds, because planning worked. Use the detailed exit code to distinguish no changes from pending changes, and require a human to approve anything that destroys.",
    },
    { type: "h2", id: "backends", text: "Managed or self-hosted" },
    {
      type: "table",
      caption: "What you are choosing between",
      head: ["Self-hosted backend", "Managed platform"],
      rows: [
        [
          "You control keys and network access completely",
          "Access control and policy enforcement come built in",
        ],
        ["No third party holds your state", "Plan output appears in pull requests without work"],
        ["You build the approval and drift tooling", "That tooling already exists"],
        [
          "Suits strict data residency requirements",
          "Suits teams who would rather not maintain it",
        ],
      ],
    },
    {
      type: "p",
      text: "Both are defensible. The honest question is whether you will actually build the plan parsing, approval gates and scheduled drift detection, because a self-hosted backend without them is just a bucket.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Split state by layer, and connect layers with remote state reads rather than one big workspace.",
        "Run a read-only plan on a schedule so drift is found before a deployment finds it.",
        "Use a `moved` block whenever you relocate a resource in code. Read every destroy line in a plan.",
        "Gate applies that destroy anything behind a human, using the detailed exit code rather than plain success.",
        "Treat state as secret material, and never let it near version control.",
      ],
    },
    {
      type: "p",
      text: "Most Terraform accidents are not caused by the tool doing something unexpected. They happen because state and reality quietly disagreed, and an apply resolved the disagreement in the direction nobody wanted. Everything above is about noticing that disagreement early, and about making sure a single mistake cannot reach everything you run.",
    },
  ],
  faq: [
    {
      question: "What does state locking actually prevent?",
      answer:
        "Two runs writing state at the same time and overwriting each other. It does nothing about whether the state is still accurate.",
    },
    {
      question: "How do I clear a stuck lock?",
      answer:
        "There is a force-unlock command, and you should check the other run is really dead first. If it is still going, unlocking causes the mess the lock was stopping.",
    },
    {
      question: "Why does moving code into a module plan a delete?",
      answer:
        "State tracks resources by their address in your code. Move it and the address changes, so Terraform sees one thing gone and a new one arriving. A `moved` block tells it otherwise.",
    },
    {
      question: "Is it safe to edit the state file by hand?",
      answer:
        "No. It holds internal notes that must stay in step. Editing the JSON by hand is how it breaks. Use the state commands instead.",
    },
    {
      question: "Can I put my state file in Git?",
      answer:
        "Never. It can hold secrets captured when resources were built. Once it is in the history, it is in every clone. Use a remote backend.",
    },
  ],
  sources: [
    {
      title: "State: purpose and behaviour",
      publisher: "HashiCorp Terraform",
      url: "https://developer.hashicorp.com/terraform/language/state",
    },
    {
      title: "State locking",
      publisher: "HashiCorp Terraform",
      url: "https://developer.hashicorp.com/terraform/language/state/locking",
    },
    {
      title: "Backend type: s3",
      publisher: "HashiCorp Terraform",
      url: "https://developer.hashicorp.com/terraform/language/backend/s3",
    },
    {
      title: "Refactoring: the moved block",
      publisher: "HashiCorp Terraform",
      url: "https://developer.hashicorp.com/terraform/language/modules/develop/refactoring",
    },
    {
      title: "The terraform_remote_state data source",
      publisher: "HashiCorp Terraform",
      url: "https://developer.hashicorp.com/terraform/language/state/remote-state-data",
    },
  ],
};
