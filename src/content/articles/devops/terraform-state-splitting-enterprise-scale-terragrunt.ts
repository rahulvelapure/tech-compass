import type { Article } from "../../types";

export const article: Article = {
  slug: "terraform-state-splitting-enterprise-scale-terragrunt",
  category: "devops",
  contentType: "explainer",
  subcategory: "Infrastructure as code",
  title: "One state file is one lock, and one lock is the whole deployment pipeline",
  seoTitle: "Terraform State at Scale: Splitting and Concurrency",
  metaDescription:
    "Why a monolithic Terraform state serialises every deployment, how to split it without destroying resources, and what remote state coupling costs you later.",
  standfirst:
    "A big state file does not slow down bit by bit. It works, and then it does not. After that, every change waits behind every other change.",
  excerpt:
    "Splitting state is mechanical. The hard parts are what replaces the implicit dependency graph you just deleted, and resisting the urge to pass secrets between states.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 6,
  primaryKeyword: "Terraform state splitting enterprise scale",
  secondaryKeywords: [
    "terraform_remote_state data source",
    "Terragrunt dependency block",
    "terraform state mv",
    "monolithic state bottleneck",
    "IaC CI/CD concurrency",
  ],
  tags: ["Terraform", "Infrastructure as code", "CI/CD", "DevOps", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "terraform-state-locking-drift-enterprise-reality",
    "secrets-management-cicd-vault-oidc-reality",
  ],
  methodology:
    "Written from the HashiCorp documentation on the `terraform_remote_state` data source, state moves and the `moved` block, and the Terragrunt documentation on dependencies and multi-module runs, verified August 2026. The source draft's 3,000-resource pipeline deadlock was rewritten as the mechanism that produces it, and its plan timings were removed as unverifiable. Two additions: `moved` blocks, which handle refactoring within a state and are frequently confused with cross-state moves, and the point that a split state has to be matched by a split in the pipeline permissions, which the draft did not cover.",
  body: [
    {
      type: "p",
      text: "Every Terraform estate starts the same way. One directory, one state file, one apply. That works, and it keeps working for longer than it should, which is part of the problem.",
    },
    {
      type: "p",
      text: "Two costs grow underneath it. A plan has to refresh every resource in the state against the provider API, so plan time tracks the resource count. And an apply takes a lock on the state, so only one change can run at a time.",
    },
    {
      type: "p",
      text: "Neither degrades gently. They cross a threshold together, and after that every change queues behind every other change.",
    },
    { type: "h2", id: "why-lock", text: "The lock is the real constraint" },
    {
      type: "p",
      text: "Slow plans are annoying. The lock is what stops the organisation.",
    },
    {
      type: "p",
      text: "While one apply runs, every other pipeline that touches that state waits or fails. With a long plan and a busy team, the state is locked most of the working day. Two merges arriving close together means the second one errors, and someone reruns it by hand.",
    },
    {
      type: "p",
      text: "Blast radius follows the same boundary. Every resource in one state is exposed to every apply against it. A bad plan in an application module can propose changes to the network, because the network is in the same file. The locking and drift mechanics themselves are covered in [Terraform state locking and drift](/devops/terraform-state-locking-drift-enterprise-reality).",
    },
    { type: "h2", id: "splitting", text: "Splitting by rate of change" },
    {
      type: "p",
      text: "Splitting means several root modules, each with its own state. The useful axis is not team or service. It is how often the thing changes.",
    },
    {
      type: "table",
      caption: "A layering that survives contact with a real estate.",
      head: ["Layer", "Holds", "Changes"],
      rows: [
        ["Network", "VPCs, subnets, gateways, peering", "Rarely"],
        ["Data", "Databases, buckets, caches", "Occasionally"],
        ["Platform", "Clusters, node groups, shared services", "Regularly"],
        ["Application", "Workloads, DNS records, app roles", "Constantly"],
      ],
    },
    {
      type: "p",
      text: "The layers sit in dependency order, and each depends only on the ones above it. An application change now plans against a small state and holds a lock for seconds. The network state is untouched and stays unlocked.",
    },
    {
      type: "p",
      text: "Split the pipeline permissions the same way. A split state with one shared deployment role gives you smaller plans and exactly the same blast radius, because the credential can still reach everything. Give each layer its own role, scoped to its own resources and its own state object.",
    },
    { type: "h2", id: "dependencies", text: "You just deleted the dependency graph" },
    {
      type: "p",
      text: "In a monolith, Terraform works out the ordering for you. An instance that references a subnet gets built after the subnet, because Terraform can see both.",
    },
    {
      type: "p",
      text: "Once the subnet is in one state and the instance in another, that knowledge is gone. Nothing stops the compute pipeline running before the network pipeline finishes, and nothing explains the failure when it does.",
    },
    { type: "h3", id: "remote-state", text: "Remote state data sources" },
    {
      type: "p",
      text: "The native answer is the `terraform_remote_state` data source. The network layer declares outputs. The layer below reads that state and uses the values.",
    },
    {
      type: "p",
      text: "It works, and it brings coupling worth understanding. The reader needs read access to the writer's state object in the backend. Read access to a state file is read access to everything in it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Never output a secret",
      text: "Terraform state stores values in clear text, and a `terraform_remote_state` read pulls the whole state, not just the output you asked for. Anything sensitive in the network state is now readable by the compute pipeline. Write secrets to a secrets manager during the producing apply, and have the consumer read them from there. Remote state should carry stable identifiers only: VPC IDs, subnet IDs, ARNs. The wider pattern is in [secrets management in CI/CD](/devops/secrets-management-cicd-vault-oidc-reality).",
    },
    {
      type: "p",
      text: "There is a looser option that avoids the coupling entirely. Look the resource up by tag or name with a provider data source. The consumer then depends on a naming convention rather than on another state file, which is weaker in one way and considerably safer in another.",
    },
    { type: "h3", id: "terragrunt", text: "Terragrunt puts the ordering back" },
    {
      type: "p",
      text: "Terragrunt wraps Terraform and restores the missing graph. A `dependency` block names another module and exposes its outputs, replacing the raw remote state read.",
    },
    {
      type: "p",
      text: "Run a command across many modules and Terragrunt builds a directed acyclic graph from those blocks. It applies the network layer, waits, then applies anything downstream — running independent modules in parallel where the graph allows.",
    },
    {
      type: "p",
      text: "`mock_outputs` is the part that makes pull requests workable. It lets a module plan against placeholder values when its dependency has never been applied, so a review check on a new stack does not require the whole stack to exist first.",
    },
    { type: "h2", id: "workspaces", text: "Workspaces do not solve this" },
    {
      type: "p",
      text: "This confusion is common enough to be worth stating plainly. Workspaces and state splitting divide along different axes.",
    },
    {
      type: "p",
      text: "A workspace gives one configuration several state files, one per environment. Development, staging and production stay separate. Useful, and unrelated to the problem here.",
    },
    {
      type: "p",
      text: "Within a workspace the state is still the whole monolith. Production in its own workspace is still 2,000 resources behind one lock. Workspaces separate environments. Directories separate resources. Only the second one shortens a plan.",
    },
    {
      type: "h2",
      id: "refactoring",
      text: "Splitting an existing state without rebuilding anything",
    },
    {
      type: "p",
      text: "You cannot delete the state and start again. Terraform would plan to create resources that already exist, and applying that is destructive.",
    },
    {
      type: "p",
      text: "Moving a resource between two state files is a pull, move, push sequence. Terraform can operate on local copies of both states and write them back.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "# Pull both states down\nterraform -chdir=monolith state pull > monolith.tfstate\nterraform -chdir=data     state pull > data.tfstate\n\n# Move the resource between the local copies\nterraform state mv \\\n  -state=monolith.tfstate \\\n  -state-out=data.tfstate \\\n  aws_s3_bucket.assets aws_s3_bucket.assets\n\n# Push both back, then move the HCL to match\nterraform -chdir=monolith state push monolith.tfstate\nterraform -chdir=data     state push data.tfstate",
    },
    {
      type: "p",
      text: "Then move the HCL into the new directory and plan both. Both must report no changes. Anything else means the move and the configuration disagree, and you should fix that before applying rather than after.",
    },
    {
      type: "p",
      text: "Back up both states first, and do it while nothing else can run. A state push during someone else's apply is how a state file gets lost.",
    },
    {
      type: "callout",
      variant: "note",
      title: "A moved block is not the same tool",
      text: "`moved` blocks handle renaming or restructuring a resource inside one state. They are declarative, they live in your configuration, and they survive in version control — which makes them the right choice for refactoring within a module. They cannot move a resource to a different state file. That still needs the pull, move, push sequence above.",
    },
    { type: "h2", id: "pipeline", text: "The pipeline has to change too" },
    {
      type: "p",
      text: "Splitting the state and leaving the pipeline alone gives you very little. A workflow that plans every directory on every pull request has the same total plan time it always had, just spread across more jobs.",
    },
    {
      type: "p",
      text: "Make the pipeline pick directories from the diff. A change under the application layer should plan the application layer and nothing else.",
    },
    {
      type: "p",
      text: "Then decide deliberately what a change to a shared layer does. Planning every dependent module downstream is the safe answer and the slow one. Whatever you choose, choose it — the default of ignoring it is how a network change reaches production without anyone seeing its downstream effect.",
    },
  ],
  faq: [
    {
      question: "How should I split Terraform state?",
      answer:
        "By rate of change, not by team. Network, then data, then platform, then application. Each layer only depends on the ones above it.",
    },
    {
      question: "Can workspaces replace state splitting?",
      answer:
        "No. A workspace gives one configuration a state per environment. The state inside it is still the whole monolith, with the same plan time and the same lock.",
    },
    {
      question: "Is terraform_remote_state safe?",
      answer:
        "It is safe for identifiers. It is not safe for secrets. The reader gets access to the entire state file, not only the output it names.",
    },
    {
      question: "How do I move a resource between state files?",
      answer:
        "Pull both states, run `terraform state mv` with `-state` and `-state-out`, then push both back. Move the HCL to match and plan both for no changes.",
    },
    {
      question: "What does a moved block do?",
      answer:
        "It renames a resource inside one state file. You write it in your code, so it lives in version control. It cannot move a resource to another state file.",
    },
    {
      question: "Does splitting state cost more?",
      answer:
        "No. The provider has no idea how your state is arranged. What it costs is more wiring between layers, and that is the real trade.",
    },
  ],
  sources: [
    {
      title: "The terraform_remote_state data source",
      publisher: "HashiCorp",
      url: "https://developer.hashicorp.com/terraform/language/state/remote-state-data",
    },
    {
      title: "Command: state mv",
      publisher: "HashiCorp",
      url: "https://developer.hashicorp.com/terraform/cli/commands/state/mv",
    },
    {
      title: "The moved block",
      publisher: "HashiCorp",
      url: "https://developer.hashicorp.com/terraform/language/moved",
    },
    {
      title: "Terragrunt: dependencies between units",
      publisher: "Gruntwork",
      url: "https://terragrunt.gruntwork.io/docs/features/stacks/",
    },
  ],
};
