import type { Article } from "../../types";

export const article: Article = {
  slug: "oidc-workload-identity-federation-cross-cloud",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Identity security",
  title: "The token proves where the job ran, and your trust policy decides if that is enough",
  seoTitle: "OIDC Workload Identity Federation Across Clouds",
  metaDescription:
    "How a signed JWT from a CI system or a cluster becomes cloud credentials, what each provider calls the trust configuration, and which claim you must pin.",
  standfirst:
    "Federation moves the risk rather than removing it. There is no key left to steal, and there is a trust policy that decides who counts as you.",
  excerpt:
    "AWS, Azure and Google each accept the same token and configure the trust differently. The claim you bind to is the security control, and the default is usually too wide.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-01",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 4,
  primaryKeyword: "OIDC workload identity federation",
  secondaryKeywords: [
    "AssumeRoleWithWebIdentity",
    "federated identity credential",
    "workload identity pool",
    "GitHub Actions OIDC subject claim",
    "cross-cloud workload identity",
  ],
  tags: ["Identity security", "OAuth", "Cloud", "CI/CD", "Zero Trust"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "secrets-management-cicd-vault-oidc-reality",
    "azure-managed-identities-vs-app-registrations-secrets",
  ],
  methodology:
    "Written from the OpenID Connect Core specification, the AWS documentation on OIDC identity providers and web identity roles, Microsoft Learn on workload identity federation, Google Cloud documentation on workload identity federation, and the GitHub Actions OIDC guide, verified August 2026. The source draft's over-permissive federation incident was rewritten as the mechanism, and its internal article reference was removed. Scope note: this article covers the token exchange and the trust configuration across three providers. The CI/CD secrets decision it supports is covered separately and linked rather than repeated.",
  body: [
    {
      type: "p",
      text: "A workload that calls a cloud API needs to prove who it is. For a long time that meant a key: create one, put it somewhere the job can read, and hope it stays there.",
    },
    {
      type: "p",
      text: "Federation replaces the key with a token the workload cannot forge and cannot keep. Something already knows what the workload is — the CI system running the job, the cluster running the pod — and it will say so, signed.",
    },
    {
      type: "p",
      text: "The cloud checks that signature, reads the claims, and hands back credentials that expire. Nothing durable is stored anywhere.",
    },
    { type: "h2", id: "trust", text: "Three parties, one of which you configure" },
    {
      type: "p",
      text: "The identity provider issues signed tokens and publishes the public keys to verify them. The cloud validates a token and issues its own credentials. The workload sits between, asking for one and presenting it to the other.",
    },
    {
      type: "p",
      text: "You configure the middle relationship. The cloud has to be told which issuer to trust, and which claims in a token from that issuer entitle the holder to which permissions.",
    },
    {
      type: "p",
      text: "That setup is the whole security boundary. Get it right and the rest is just plumbing, and the plumbing works the same way everywhere.",
    },
    { type: "h2", id: "exchange", text: "What actually happens" },
    {
      type: "ol",
      items: [
        "**The workload asks its own platform for a token.** In a CI job that is a permission on the job. In a cluster it is a projected service account token.",
        "**The platform issues a signed JWT.** The claims describe the workload: which repository, which branch, which service account, which namespace.",
        "**The workload presents that token to the cloud.** One API call, carrying the token and naming the role or identity it wants.",
        "**The cloud validates it.** It fetches the issuer's public keys, checks the signature and expiry, then matches the claims against the trust configuration.",
        "**Short-lived credentials come back.** They expire on their own. There is nothing to rotate and nothing to revoke.",
      ],
    },
    {
      type: "p",
      text: "The token is short-lived, and it names the audience it is meant for. So a token made for one cloud will not work against another. That check is doing real work, and it is easy to weaken by accident when you wire up a second provider.",
    },
    { type: "h2", id: "providers", text: "The same idea, three sets of names" },
    {
      type: "p",
      text: "This is where cross-cloud work gets confusing. The mechanism is identical and the vocabulary is not.",
    },
    {
      type: "table",
      caption: "What each provider calls the pieces.",
      head: ["", "AWS", "Azure", "Google Cloud"],
      rows: [
        [
          "Register the issuer",
          "OIDC identity provider",
          "Implicit in the credential",
          "Workload identity pool provider",
        ],
        [
          "Bind claims to access",
          "Role trust policy",
          "Federated identity credential",
          "Pool attribute mapping and condition",
        ],
        [
          "The exchange call",
          "AssumeRoleWithWebIdentity",
          "Client credentials with an assertion",
          "STS token exchange",
        ],
        [
          "What you get back",
          "Temporary IAM credentials",
          "An access token",
          "A federated or impersonated token",
        ],
      ],
    },
    {
      type: "p",
      text: "Two things differ in practice. AWS puts the test inside the role's own trust policy, so it sits with the permissions. Azure hangs a federated identity credential on the identity itself. That identity can be a user-assigned managed identity, which is worth knowing. A lot of guidance still says you need an app registration — see [managed identities versus app registrations](/cloud/azure-managed-identities-vs-app-registrations-secrets).",
    },
    {
      type: "p",
      text: "Google separates the pool from the service account, which adds a step and gives you a place to map and filter claims before they reach any permission.",
    },
    { type: "h2", id: "claims", text: "The subject claim is the control" },
    {
      type: "p",
      text: "A token from a CI system carries a subject claim describing exactly what ran. For a GitHub workflow it names the repository and the ref, or the environment.",
    },
    {
      type: "p",
      text: "How much of that you require is your entire access decision.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "A wildcard on the organisation is close to no control at all",
      text: "It is tempting to trust any repository in your organisation, because it makes the configuration work everywhere at once. It also means every repository in the organisation can assume that role. Anyone who can add a workflow to any repository — including a new one nobody is watching — can reach whatever that role can reach. Bind the subject to the specific repository, and for anything sensitive to the branch or the deployment environment as well.",
    },
    {
      type: "p",
      text: "Environments are worth preferring over branches where the platform supports them, because an environment can carry its own approval requirement. The token then proves not just where the job ran but that someone approved it.",
    },
    {
      type: "p",
      text: "Check the issuer and audience are pinned too. A trust policy that matches on the subject while accepting any issuer is not a trust policy.",
    },
    { type: "h2", id: "clusters", text: "Clusters federate the same way" },
    {
      type: "p",
      text: "A Kubernetes cluster can be an identity provider. The API server signs service account tokens and publishes its keys, and a cloud can be configured to trust that issuer.",
    },
    {
      type: "p",
      text: "The claims then describe the namespace and the service account rather than a repository. The binding is the same shape: one service account in one namespace maps to one cloud identity.",
    },
    {
      type: "p",
      text: "This is what the managed setups do underneath. It is also why the same slip turns up there. A binding that takes any service account in a namespace lets any workload in that namespace assume the identity. Namespaces usually hold more than one thing.",
    },
    { type: "h2", id: "limits", text: "What federation does not fix" },
    {
      type: "p",
      text: "It removes the stored secret. It does not remove the need to decide who should have access, and it moves that decision into a document people review less often than they review code.",
    },
    {
      type: "p",
      text: "Three things follow.",
    },
    {
      type: "ul",
      items: [
        "**Audit the trust policies, not just the permissions.** A tightly scoped role with a wildcard trust is an open role.",
        "**Log the exchange.** Each provider records the credential-issuing call. It is low volume and high signal, and an assumption from an unexpected subject is worth alerting on.",
        "**Mind who can request a token.** On a self-hosted runner, or any job running code you did not write, whatever is running can ask for the token. So the runner boundary and the trust policy have to be designed together.",
      ],
    },
    {
      type: "p",
      text: "Key rotation is the one operational surprise. Providers publish their signing keys and rotate them, and the cloud caches those keys. A rotation can produce a brief window of validation failures that resolves itself. Do not treat a short burst as a compromise, and do not build retry logic that hides a persistent one. The wider decision about what this replaces is in [secrets management in CI/CD](/devops/secrets-management-cicd-vault-oidc-reality).",
    },
  ],
  faq: [
    {
      question: "What stops another repository using my role?",
      answer:
        "Only the subject test in your trust policy. If it wildcards the whole org, nothing does. Pin the repo, and the branch or environment.",
    },
    {
      question: "Can Azure federation use a managed identity?",
      answer:
        "Yes. Put it on a user-assigned managed identity. There it is called a federated credential. You may still see advice to use an app registration. It is out of date.",
    },
    {
      question: "Is a token for one cloud usable against another?",
      answer:
        "No, as long as the audience is set right. The token names who it is for. Check that when you wire up a second cloud.",
    },
    {
      question: "Does this work with self-hosted runners?",
      answer:
        "Yes, and it needs more care. Whatever runs in the job can request the token, so the runner boundary and the trust policy have to be designed together.",
    },
    {
      question: "What happens when the provider rotates its keys?",
      answer:
        "Clouds cache the public keys, so there can be a short window of failures until the cache refreshes. A brief burst is normal. A persistent one is not.",
    },
    {
      question: "How do I know a role is being assumed correctly?",
      answer:
        "Log the exchange call. Every provider records it. The volume is low, so you can alert on a subject you did not expect.",
    },
  ],
  sources: [
    {
      title: "OpenID Connect Core 1.0",
      publisher: "OpenID Foundation",
      url: "https://openid.net/specs/openid-connect-core-1_0.html",
    },
    {
      title: "Create an OpenID Connect identity provider in IAM",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html",
    },
    {
      title: "Workload identity federation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/workload-id/workload-identity-federation",
    },
    {
      title: "Workload identity federation",
      publisher: "Google Cloud",
      url: "https://cloud.google.com/iam/docs/workload-identity-federation",
    },
    {
      title: "About security hardening with OpenID Connect",
      publisher: "GitHub",
      url: "https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect",
    },
  ],
};
