import type { Article } from "../../types";

export const article: Article = {
  slug: "github-actions-self-hosted-runner-security",
  category: "devops",
  contentType: "explainer",
  subcategory: "CI/CD",
  title: "A runner that survives the job also survives whatever the job left behind",
  seoTitle: "Self-Hosted GitHub Actions Runners: The Security Reality",
  metaDescription:
    "Why a persistent self-hosted runner turns a pull request into a foothold, what GitHub actually recommends, and how ephemeral runners restore the boundary.",
  standfirst:
    "A hosted runner is thrown away after each job. That is the security control. Run your own and you have to build that part back yourself.",
  excerpt:
    "GitHub's own guidance is blunt: only use self-hosted runners with private repositories. The reason is that a fork pull request runs code you did not write on a machine you keep.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "GitHub Actions self-hosted runner security",
  secondaryKeywords: [
    "Actions Runner Controller",
    "runner scale sets",
    "ephemeral CI runners",
    "GitHub OIDC federation",
    "CI/CD supply chain attack",
  ],
  tags: ["CI/CD", "GitHub Actions", "Kubernetes", "Security", "DevOps"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "secrets-management-cicd-vault-oidc-reality",
    "container-image-security-beyond-scanning",
  ],
  methodology:
    "Written from the GitHub documentation on security hardening for Actions and on self-hosted runners, the Actions Runner Controller project documentation, and the OWASP Top 10 CI/CD Security Risks, verified August 2026. Two clarifications were made to the source draft. It treated the Actions Runner Controller as one thing; GitHub now supports the runner scale sets mode and the older controller behaves differently, which matters when following any deployment guide. And it framed organisation-level runners as the core risk, where GitHub's own stated boundary is repository visibility — a public repository accepting fork pull requests is the condition that makes any self-hosted runner dangerous. The draft's dependency-confusion incident was rewritten as the mechanism.",
  body: [
    {
      type: "p",
      text: "GitHub-hosted runners give you a fresh machine per job, then throw it away. That is not housekeeping. It is the security boundary, and it does more work than most teams notice.",
    },
    {
      type: "p",
      text: "There are real reasons to run your own. Access to an internal network. Hardware nobody rents by the minute. Jobs that outrun the limits. All legitimate, and all of them hand you a machine that persists.",
    },
    {
      type: "p",
      text: "The moment it persists, everything a job did is available to the next job.",
    },
    { type: "h2", id: "boundary", text: "What you are actually trusting" },
    {
      type: "p",
      text: "A workflow runs code. On a hosted runner, the worst a malicious job can reach is what was handed to that one run, and then the machine is gone.",
    },
    {
      type: "p",
      text: "On a long-lived runner, the agent is a service on a machine you keep. A job can drop a binary, edit a shell profile, or leave a process running. All of it stays there.",
    },
    {
      type: "p",
      text: "Then a deploy job runs on that same machine. What it holds is in reach of whatever is already there. The pipeline stops being a build system and becomes a way into production.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "GitHub's guidance is narrower than most teams read it as",
      text: "The docs say to use self-hosted runners only with private repos. The reason is fork pull requests. On a public repo, anyone can open one. A job that runs on it then runs their code on your machine. A review gate does not help if the job fires before review. So check that first. The question is not how many repos share the runner. It is whether any of them takes code from people you have not vetted.",
    },
    { type: "h2", id: "scope", text: "Runner scope widens the blast radius" },
    {
      type: "p",
      text: "You can register a runner at three levels. One repo. A whole org. Or a whole enterprise. A wider scope is easier to run, and easier to reach.",
    },
    {
      type: "p",
      text: "An organisation runner serves every repo in the org. That includes the ones nobody watches. Break in through one of those and the foothold simply waits. Sooner or later a job from a repo that matters runs on the same machine.",
    },
    {
      type: "p",
      text: "Runner groups are the control. Put runners in a group and restrict which repositories may use it. Keep anything shared for trusted, private repositories, and give untrusted workloads their own pool with nothing valuable in reach.",
    },
    { type: "h2", id: "ephemeral", text: "Ephemeral runners put the boundary back" },
    {
      type: "p",
      text: "The thing to rebuild is disposal. Throw the machine away after each job and nothing carries forward. Persistence stops being an attack at all.",
    },
    {
      type: "p",
      text: "Doing that with virtual machines is correct and slow. Minutes of boot time per job is a real cost, and teams work around it by making runners persistent again.",
    },
    {
      type: "p",
      text: "Containers make the same promise affordable. The Actions Runner Controller runs in Kubernetes. It watches for queued jobs, starts a pod with the runner agent in it, and deletes that pod when the job ends. Startup takes seconds, so nobody has a reason to weaken it.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Check which mode a guide is written for",
      text: "The project has two deployment models. Runner scale sets is the newer, GitHub-supported mode, and it is what current documentation describes. The older controller uses different custom resources and different configuration. Blog posts rarely say which one they mean, so the manifests do not transfer, and mixing them is a reliable way to end up with runners that register and never pick up work.",
    },
    { type: "h2", id: "hardening", text: "Hardening what the pod can reach" },
    {
      type: "p",
      text: "Ephemeral runners fix persistence. They do not fix reach. A pod that lives for ninety seconds can still call anything the network lets it call.",
    },
    {
      type: "ol",
      items: [
        "**Deny by default on the network.** Runner pods should reach the package registries, artifact stores and cloud endpoints a build needs, and nothing else. In particular they should not reach the Kubernetes API server or the rest of the internal estate.",
        "**Separate trusted from untrusted.** Give fork pull requests their own namespace, their own service account and their own network policy. Keep deployment workflows in a different namespace with different permissions.",
        "**Do not grant passwordless sudo.** A step that can become root owns the host, and on a shared node it owns the other pods' neighbourhood too.",
        "**Pin what you run.** An action referenced by a moving tag is code that can change under you. Pin to a commit, and mirror the registries your builds pull from.",
      ],
    },
    { type: "h2", id: "secrets", text: "The credential is the thing worth stealing" },
    {
      type: "p",
      text: "Most of the damage in CI/CD incidents comes from one pattern: a long-lived cloud key sitting in a secret, injected into the environment of a job that runs untrusted code.",
    },
    {
      type: "p",
      text: "Anything running in that job can read the environment. If the key does not expire, exfiltrating it is worth doing even if the job fails immediately after.",
    },
    {
      type: "p",
      text: "OIDC removes the target. GitHub issues a short-lived token describing the workflow, the repository and the ref. Your cloud provider trusts that issuer and exchanges the token for temporary credentials, scoped by conditions you set. No static key exists to steal, and the credential expires with the job. The full pattern is in [secrets management in CI/CD](/devops/secrets-management-cicd-vault-oidc-reality).",
    },
    {
      type: "p",
      text: "Write the trust conditions carefully. A trust policy that accepts any workflow from your organisation is only slightly better than a static key, because any repository in the organisation can then assume the role. Bind it to the repository and, where the role is sensitive, to the branch or environment as well.",
    },
    { type: "h2", id: "dependencies", text: "The build resolves code you did not write" },
    {
      type: "p",
      text: "Nothing above helps if the build fetches a package an attacker controls, and the usual route is not a compromised maintainer. It is resolution order.",
    },
    {
      type: "p",
      text: "A package manager pointed at an internal registry with a public fallback will look upstream when a name is missing there. A typo, or a private package name someone has registered publicly, and the resolver reaches for the public copy. Install scripts then run with whatever the job has.",
    },
    {
      type: "p",
      text: "Close the fallback rather than trying to spot the bad package. Proxy every registry through something you control, so the internal name never resolves upstream. Lock files pin versions and do not stop a resolver going to the wrong source, which is why this one keeps working. Image provenance is the adjacent problem, covered in [container image security](/devops/container-image-security-beyond-scanning).",
    },
    {
      type: "p",
      text: "Caching deserves a note here too. Ephemeral runners lose their disk, so builds slow down unless you cache. Use the managed cache action, or an internal artifact proxy. Do not solve it by making the runner persistent again, which trades the security property for build minutes.",
    },
  ],
  faq: [
    {
      question: "Are self-hosted runners safe for public repositories?",
      answer:
        "GitHub recommends against it. A fork pull request runs a stranger's code on your machine, and no amount of hardening changes that shape.",
    },
    {
      question: "Why are organisation-level runners risky?",
      answer:
        "Every repo can use them, even the ones nobody watches. One break-in there just waits for a job from a repo that matters.",
    },
    {
      question: "What makes a runner ephemeral?",
      answer:
        "It is destroyed after one job. Nothing a job leaves behind can reach the next one, which removes the whole persistence problem.",
    },
    {
      question: "Which Actions Runner Controller mode should I use?",
      answer:
        "Runner scale sets. That is the newer mode, and the one GitHub supports and documents. The old controller uses other resources, so guides do not carry over.",
    },
    {
      question: "Should I store cloud keys as GitHub secrets?",
      answer:
        "No. Use OIDC. GitHub issues a short-lived token, your cloud trusts the issuer, and there is no static key left to steal.",
    },
    {
      question: "How do I stop dependency confusion?",
      answer:
        "Close the public fallback. Proxy each registry through one you own. Then an internal name can never end up at a stranger's package.",
    },
    {
      question: "How do I keep caching without a persistent runner?",
      answer:
        "Use the managed cache action, or a local artifact proxy. Keeping the runner alive just for the cache hands back the very thing you were guarding.",
    },
  ],
  sources: [
    {
      title: "Security hardening for GitHub Actions",
      publisher: "GitHub",
      url: "https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions",
    },
    {
      title: "Adding self-hosted runners",
      publisher: "GitHub",
      url: "https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners",
    },
    {
      title: "Actions Runner Controller",
      publisher: "GitHub",
      url: "https://github.com/actions/actions-runner-controller",
    },
    {
      title: "OWASP Top 10 CI/CD Security Risks",
      publisher: "OWASP Foundation",
      url: "https://owasp.org/www-project-top-10-ci-cd-security-risks/",
    },
  ],
};
