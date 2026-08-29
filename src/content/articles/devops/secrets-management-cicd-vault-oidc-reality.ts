import type { Article } from "../../types";

export const article: Article = {
  slug: "secrets-management-cicd-vault-oidc-reality",
  category: "devops",
  contentType: "explainer",
  subcategory: "CI/CD",
  title: "Your pipeline does not need a secret. It needs to prove who it is",
  seoTitle: "CI/CD secrets management: OIDC, Vault and what it fixes",
  metaDescription:
    "Static keys in CI/CD are a supply chain target. How OIDC federation replaces them, where Vault helps, and when you do not need Vault at all.",
  standfirst:
    "A long-lived cloud key in your CI settings is one compromised dependency away from being someone else's. The fix is to stop storing one.",
  excerpt:
    "Static credentials in a pipeline survive the run that used them, which is what makes them worth stealing. How OIDC federation replaces them, and the configuration mistakes that undo it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "CI/CD secrets management OIDC",
  secondaryKeywords: [
    "GitHub Actions OIDC",
    "Vault JWT auth method",
    "bound claims Vault role",
    "short-lived cloud credentials",
    "supply chain attack CI/CD",
  ],
  tags: ["DevOps", "Security", "CI/CD", "Secrets Management", "Supply Chain"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "oauth2-token-theft-dpop-mechanics",
    "kubernetes-storage-classes-costs-performance-traps",
  ],
  methodology:
    "Written from HashiCorp Vault's JWT/OIDC auth method documentation, GitHub's security hardening and OIDC guidance, and the OWASP Top 10 CI/CD Security Risks, verified August 2026. Claim names and workflow permissions are quoted from that documentation. Token lifetimes are described relative to pipeline duration rather than as specific values, and the draft's illustrative breach cost was removed.",
  body: [
    {
      type: "p",
      text: "A pipeline needs to reach real systems. It deploys to cloud accounts, reads databases, calls APIs. Something has to authorise that.",
    },
    {
      type: "p",
      text: "The usual answer is to paste a key into the CI platform's secrets store and reference it from the workflow. It works on the first try, which is part of the problem.",
    },
    {
      type: "p",
      text: "That key is long-lived, shared by every run in the repository, and readable by anything executing in the job. It survives the run that used it, and that is what makes it worth stealing.",
    },
    { type: "h2", id: "why-static-fails", text: "Why the static key is the wrong shape" },
    {
      type: "p",
      text: "Three properties combine badly, and none of them is a bug in the CI platform.",
    },
    {
      type: "ul",
      items: [
        "**Anything in the job can read it.** A malicious dependency or a compromised third-party action runs in the same environment as your deploy step. If the credential is in the environment, it is available to that code.",
        "**Nothing distinguishes callers.** One key serves every workflow in the repository, so cloud audit logs record that the key acted, not which run or which change triggered it.",
        "**Nobody rotates it.** Rotation means updating every place the key is used, so it happens after an incident rather than on a schedule.",
      ],
    },
    {
      type: "p",
      text: "The realistic attack does not target your repository at all. It targets something you depend on. A maintainer account is compromised, a popular action gains an extra line, and that line reads the environment and sends it somewhere. Your pipeline runs it because you asked it to.",
    },
    { type: "h2", id: "oidc", text: "What OIDC federation replaces it with" },
    {
      type: "p",
      text: "The alternative is to stop storing a credential and have the pipeline prove its identity instead.",
    },
    {
      type: "p",
      text: "The CI provider acts as an identity provider. When a job runs, it can request a short-lived signed token describing that specific run. On GitHub Actions this requires `permissions: id-token: write` on the job — without it, no token is issued.",
    },
    {
      type: "p",
      text: "The token's claims are the useful part. They describe context rather than granting anything.",
    },
    {
      type: "table",
      caption: "The claims that carry the pipeline's identity",
      head: ["Claim", "Describes", "Why it matters"],
      rows: [
        ["sub", "Repository, and the ref or environment", "The main thing you bind access to"],
        [
          "aud",
          "The intended recipient of the token",
          "Stops a token being replayed at another service",
        ],
        ["iss", "Which CI provider issued it", "Anchors signature validation"],
        ["exp", "When it stops being valid", "Bounds the window if it leaks"],
      ],
    },
    {
      type: "p",
      text: "The receiving system validates the signature against the provider's published keys, checks the claims against a rule you configured, and only then issues a credential. That credential is short-lived and scoped to the job.",
    },
    {
      type: "p",
      text: "Nothing durable is stored in the CI platform. A token captured mid-run expires quickly and does only what its scope permits, which is the difference between a contained incident and a persistent foothold.",
    },
    { type: "h2", id: "need-vault", text: "You may not need Vault for this" },
    {
      type: "p",
      text: "This is where the standard advice overshoots, and it is worth saying plainly before anyone procures anything.",
    },
    {
      type: "p",
      text: "The major cloud providers accept CI OIDC tokens directly. GitHub Actions can assume an AWS role, or authenticate to Azure or Google Cloud, with no secrets broker in between. You configure a trust relationship on the cloud side, bind it to your repository and branch, and the workflow exchanges its token for temporary credentials.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Where a broker earns its place",
      text: "Reach for Vault when you need credentials the cloud provider does not issue — database users, third-party API keys, certificates — or when you want one policy model across several providers and several CI systems. If the only requirement is deploying to one cloud, direct federation removes both the static key and a system you would have to run.",
    },
    {
      type: "p",
      text: "The security win comes from OIDC, not from the broker. A pipeline that authenticates to Vault with a long-lived Vault token has moved the static secret, not removed it.",
    },
    { type: "h2", id: "pitfalls", text: "Four configuration mistakes that undo it" },
    { type: "h3", id: "broad-claims", text: "Binding too loosely" },
    {
      type: "p",
      text: "This is the one that matters most, because it silently reintroduces the problem you were solving.",
    },
    {
      type: "p",
      text: "A rule that accepts any token from your organisation will accept a token from any repository in it. A rule that names the repository but not the ref will accept a run from any branch. Anyone able to push a branch can then reach production credentials.",
    },
    {
      type: "p",
      text: "Bind to the repository and the ref or environment, and prefer environment binding where the CI platform offers approval gates on it. Wildcards belong nowhere near a production rule.",
    },
    { type: "h3", id: "audience", text: "Audience mismatch" },
    {
      type: "p",
      text: "The audience claim exists so a token issued for one service cannot be presented to another. It has to match on both sides. When it does not, the failure is a flat rejection with little explanation, and teams often work around it by loosening the check — which removes the protection entirely.",
    },
    { type: "h3", id: "ttl", text: "Lifetime shorter than the pipeline" },
    {
      type: "p",
      text: "Credentials that expire mid-run produce a confusing failure: the deploy step works, a later step fails on permissions, and nothing changed in between. Set the lifetime comfortably above your longest realistic run, then leave it there rather than tuning it to the minute.",
    },
    { type: "h3", id: "forks", text: "Assuming pull requests behave like branches" },
    {
      type: "p",
      text: "Token claims differ between event types, and a run triggered by a fork is not the same as a run on your main branch. If a rule is written against one shape and the workflow triggers in another, you get either an unexpected denial or, worse, an unintended match. Check what the claims actually contain for each trigger you support.",
    },
    { type: "h2", id: "scenario", text: "The same compromise, both ways" },
    {
      type: "p",
      text: "A team uses a popular third-party action to deploy. The action's maintainer account is compromised and a release gains code that dumps the environment to an external endpoint.",
    },
    {
      type: "p",
      text: "With a static key, the attacker now holds a long-lived cloud credential with whatever permissions the deploy needed. It works from anywhere, it does not expire, and the audit trail shows the key rather than the run.",
    },
    {
      type: "p",
      text: "With OIDC and narrow scoping, they capture a temporary credential instead. It expires shortly, it permits only what that job needed, and the cloud logs tie the activity back to a specific run.",
    },
    {
      type: "p",
      text: "The compromise happened in both cases. Only the consequence changed, which is the realistic goal — supply chain risk is reduced, not eliminated.",
    },
    { type: "h2", id: "when", text: "When this is worth the effort" },
    {
      type: "table",
      caption: "A prompt for prioritising, not a compliance rule",
      head: ["Do this now when", "Static secrets are defensible when"],
      rows: [
        ["Pipelines deploy to production", "The pipeline touches only throwaway environments"],
        ["You run self-hosted runners", "Runners are ephemeral and managed"],
        ["You need to know which run used which credential", "The credential grants very little"],
        [
          "The dependency tree is large and moves fast",
          "Access is already tightly scoped and reviewed",
        ],
      ],
    },
    {
      type: "p",
      text: "Where static secrets remain, the compensating controls are branch protection, environment approvals, and pinning actions to a commit rather than a moving tag. Those are worth doing regardless.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Treat a long-lived cloud key in CI settings as a finding, not a configuration choice.",
        "Try direct cloud federation first. It may remove the static key without adding a system to operate.",
        "Bind rules to repository and ref or environment. A wildcard here undoes the whole exercise.",
        "Match the audience on both sides, and resist loosening the check to make an error go away.",
        "Check the claims for every trigger type you support, including pull requests and forks.",
      ],
    },
    {
      type: "p",
      text: "The underlying shift is the same one happening across authentication generally: stop presenting a stored secret, and start proving identity for the moment you need it. It is the reasoning behind [binding a token to the client that holds it](/cybersecurity-ciso/oauth2-token-theft-dpop-mechanics), and it applies just as well to a build runner as to a browser.",
    },
  ],
  faq: [
    {
      question: "Why are static secrets in CI/CD such a problem?",
      answer:
        "They last a long time and anything running in the job can read them. One bad dependency is enough. The key still works afterwards, from anywhere.",
    },
    {
      question: "Do I need Vault to use OIDC?",
      answer:
        "Often not. The big clouds take a CI token and hand back short-lived keys. Vault helps when you need secrets the cloud does not issue, or one policy across many systems.",
    },
    {
      question: "What should I bind the access rule to?",
      answer:
        "The repository, plus the branch or environment. Bind to the whole org and any repo in it can reach production. That is the thing you were trying to stop.",
    },
    {
      question: "Why does my pipeline fail partway through on permissions?",
      answer:
        "The credential probably expired mid-run. Set the lifetime above your longest run. The clue is that early steps work and later ones do not.",
    },
    {
      question: "Does OIDC stop supply chain attacks?",
      answer:
        "No, it limits them. A bad dependency still runs. What it steals is short-lived and narrow, so the damage is bounded instead of lasting.",
    },
  ],
  sources: [
    {
      title: "JWT/OIDC auth method",
      publisher: "HashiCorp Vault",
      url: "https://developer.hashicorp.com/vault/docs/auth/jwt",
    },
    {
      title: "About security hardening with OpenID Connect",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect",
    },
    {
      title: "Security hardening for GitHub Actions",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions",
    },
    {
      title: "OWASP Top 10 CI/CD Security Risks",
      publisher: "OWASP",
      url: "https://owasp.org/www-project-top-10-ci-cd-security-risks/",
    },
    {
      title: "Configuring OpenID Connect in Amazon Web Services",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services",
    },
  ],
};
