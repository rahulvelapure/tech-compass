import type { Article } from "../../types";

export const article: Article = {
  slug: "azure-managed-identities-vs-app-registrations-secrets",
  category: "cloud",
  contentType: "comparison",
  subcategory: "Architecture",
  title: "The secret you never created cannot leak",
  seoTitle: "Managed Identities vs App Registrations: Removing Secrets",
  metaDescription:
    "A client secret is a password you have to store, rotate and hope nobody commits. Managed identities and federated credentials remove it. Where each one applies.",
  standfirst:
    "Rotation is a whole process built to manage one risk. Most of the time you can just delete the risk.",
  excerpt:
    "Managed identities remove the credential for Azure compute. Federated credentials extend the same idea to Kubernetes and CI. What is left for app registrations is a much shorter list than most tenants assume.",
  authorId: "rahul-velapure",
  publishedAt: "2026-03-16",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 5,
  primaryKeyword: "Azure Managed Identities vs App Registrations",
  secondaryKeywords: [
    "Azure IMDS endpoint",
    "user-assigned managed identity",
    "Azure workload identity AKS",
    "federated identity credential",
    "eliminate service principal secrets",
  ],
  tags: ["Azure", "Identity", "Security", "Cloud", "Kubernetes"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "eks-pod-identity-vs-irsa-migration",
    "secrets-management-cicd-vault-oidc-reality",
  ],
  methodology:
    "Written from Microsoft Learn documentation on managed identities, the instance metadata endpoint, AKS workload identity and workload identity federation, verified August 2026. The source draft asserted that GitHub Actions cannot federate directly to a managed identity and must use an app registration. Microsoft documents the opposite, and recommends the managed identity path. The draft's invented credential-leak incident was replaced with the mechanism.",
  body: [
    {
      type: "p",
      text: "An app registration with a client secret is a login for your cloud. It has a name and a password, and it never gets tired of being used.",
    },
    {
      type: "p",
      text: "It lives in configuration. Someone copies it into a pipeline variable, a container, a local file. It expires, so somebody builds a rotation process. And it is a bearer token: whoever holds it is you, until you revoke it.",
    },
    {
      type: "p",
      text: "Most of that work exists to manage a risk you can remove instead. Azure has two mechanisms for removing it, and they cover different situations.",
    },
    { type: "h2", id: "legacy", text: "What the secret is actually doing" },
    {
      type: "p",
      text: "An app registration defines an app in Entra ID. A service principal is that app's identity in your tenant. A credential proves the app is the one calling.",
    },
    {
      type: "p",
      text: "The flow is simple. The app sends its client ID and secret to the token endpoint. Entra ID checks them and hands back a token. The app shows that token to Key Vault, Storage, or whatever it needs.",
    },
    {
      type: "p",
      text: "The weak spot is the first step. That secret is a fixed string with real power. It has to sit somewhere the app can read it. The rest of the design is fine.",
    },
    { type: "h2", id: "managed", text: "Managed identities: the platform holds the credential" },
    {
      type: "p",
      text: "A managed identity is a service principal whose password Azure keeps. You never see it.",
    },
    {
      type: "p",
      text: "Turn it on for a resource and Azure opens a local endpoint there, at the link-local address `169.254.169.254`. The app asks that endpoint for a token. The platform then does the exchange with Entra ID on its behalf.",
    },
    {
      type: "p",
      text: "Requests must carry a `Metadata: true` header. That guards against one specific attack. A bug that tricks your app into fetching a URL cannot easily add a custom header. So a simple redirect to the token endpoint fails.",
    },
    {
      type: "p",
      text: "The application never handles a password. There is nothing to rotate, nothing to store, and nothing to commit by accident.",
    },
    { type: "h2", id: "system-vs-user", text: "System-assigned or user-assigned" },
    {
      type: "table",
      caption: "The difference that matters operationally",
      head: ["", "System-assigned", "User-assigned"],
      rows: [
        ["Lifecycle", "Tied to one resource", "Independent Azure resource"],
        ["Sharing", "Cannot be shared", "Attach to many resources"],
        ["Deletion", "Removed with the resource", "You manage it"],
        ["Role assignments", "Repeated per resource", "Granted once"],
        ["Fits", "A single distinctive workload", "A fleet with common permissions"],
      ],
    },
    {
      type: "p",
      text: "For most teams, user-assigned wins on governance. Fifty machines with system-assigned identities means fifty principals. Each one needs its own role grants. Every scaling event makes more of them.",
    },
    {
      type: "p",
      text: "One user-assigned identity on all fifty means one set of role grants. One object in your inventory. One thing to define in code.",
    },
    {
      type: "p",
      text: "The trade is that it outlives the machines. Delete them and the identity stays, with its role grants intact. That is a cleanup job, and it is why these belong in code rather than in the portal.",
    },
    { type: "h2", id: "kubernetes", text: "Why Kubernetes needs something different" },
    {
      type: "p",
      text: "The metadata endpoint belongs to the machine. That is fine until several workloads share one machine.",
    },
    {
      type: "p",
      text: "A pod calling the node's token endpoint gets the node's identity. So would every other pod on that node. The rights of the busiest pod become the rights of the smallest one.",
    },
    {
      type: "p",
      text: "Workload identity takes a different route. It does not touch that endpoint at all. Instead it uses OpenID Connect federation.",
    },
    {
      type: "ol",
      items: [
        "The cluster publishes an OIDC issuer endpoint.",
        "Add a federated identity credential to a user-assigned managed identity. Name the issuer. Name the one service account it should trust.",
        "The cluster projects a signed token into pods using that service account.",
        "The SDK sends that token to Entra ID and asks to exchange it for an Azure access token.",
        "Entra ID checks the signature against the cluster issuer, checks the credential, and issues the token.",
      ],
    },
    {
      type: "p",
      text: "The result is one identity per pod, with no secret anywhere. Trust rests on a signature the cluster makes. It also rests on a subject claim Entra ID was told to expect.",
    },
    {
      type: "p",
      text: "AWS does the same thing with IAM roles for service accounts. A Kubernetes token is swapped for cloud credentials. The comparison, and where the migration gets sharp, is in [EKS Pod Identity and IRSA](/devops/eks-pod-identity-vs-irsa-migration).",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Block the node metadata endpoint",
      text: "Adopting workload identity does not stop pods reaching `169.254.169.254` and picking up the node's identity. That path stays open until you close it. Block it from pod networks with a network policy or node-level rule, otherwise you have added a good mechanism while leaving the weak one available to anything that knows the address.",
    },
    { type: "h2", id: "federation", text: "Federation reaches outside Azure too" },
    {
      type: "p",
      text: "The same model works for workloads that are not in Azure at all. This is where the source draft for this article was wrong.",
    },
    {
      type: "p",
      text: "A common claim says GitHub Actions must use an app registration. The reason given is that managed identities cannot federate. Microsoft says otherwise. You can put a federated credential on a user-assigned managed identity. Microsoft's own guidance recommends it.",
    },
    {
      type: "p",
      text: "The workflow requests an OIDC token from GitHub, Entra ID validates it against the federated credential, and the job receives an Azure token. No secret is stored in the repository. The same approach covers Kubernetes clusters outside Azure and workloads on other clouds.",
    },
    {
      type: "p",
      text: "Two details decide whether it works. Issuer, subject and audience must match the incoming token exactly, case included. And the subject is what scopes the trust. Name a branch, an environment or a service account. A loose subject grants more than you meant.",
    },
    {
      type: "p",
      text: "The same idea works for build pipelines. Short-lived federated credentials replace stored secrets there too. That ground is covered in [secrets management in CI/CD](/devops/secrets-management-cicd-vault-oidc-reality).",
    },
    { type: "h2", id: "leftover", text: "What still needs an app registration" },
    {
      type: "p",
      text: "The list is shorter than most tenants behave as though it is, but it is not empty.",
    },
    {
      type: "ul",
      items: [
        "**Apps other firms sign into.** A managed identity lives in one tenant. Software used across tenants needs an app registration.",
        "**User sign-in.** If a person signs in to your app, that is an app registration job.",
        "**Places federation cannot reach.** Some systems cannot present an OIDC token. Then you are stuck with a credential.",
      ],
    },
    {
      type: "p",
      text: "Where you really do need a credential, use a certificate rather than a client secret. Keep the lifetime short.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Audit for secrets before you plan a migration",
      text: "Query your tenant for app registrations holding active client secrets. Sort them by what they can reach. The result is usually uncomfortable. You find a long tail of credentials created for a task that finished years ago, still valid, still privileged, owned by nobody. That list is your migration backlog. Until it shrinks, it is also a fair description of your exposure.",
    },
    {
      type: "p",
      text: "One note for developers. The Azure identity SDKs offer a default credential type. It tries each option in turn: a local sign-in, a managed identity endpoint, a projected workload identity token. So the same code works on a laptop and in production. That removes the usual reason people reach for a secret while developing.",
    },
  ],
  faq: [
    {
      question: "What is the actual difference?",
      answer:
        "An app registration uses a password you hold. A managed identity uses one Azure keeps. It never shows you. Nothing to store or rotate.",
    },
    {
      question: "System-assigned or user-assigned?",
      answer:
        "Pick user-assigned for anything that scales. One of them can cover many hosts. You grant roles once, not per host.",
    },
    {
      question: "Why do pods need workload identity?",
      answer:
        "The token endpoint belongs to the node. Every pod on it would share one identity. Each service account gets its own instead.",
    },
    {
      question: "Can GitHub Actions federate to a managed identity?",
      answer:
        "Yes, and Microsoft now recommends it. You set this up on a user-assigned identity. The old advice is out of date.",
    },
    {
      question: "Do I still need app registrations?",
      answer:
        "For apps other tenants sign into, for user sign-in, and for platforms that cannot present a token. That list is shorter than most teams assume.",
    },
    {
      question: "Does workload identity close the metadata endpoint?",
      answer:
        "No. Pods can still reach it and pick up the node identity. Block that address from pod networks yourself.",
    },
  ],
  sources: [
    {
      title: "Managed identities for Azure resources",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview",
    },
    {
      title: "How managed identities work with Azure virtual machines",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/how-managed-identities-work-vm",
    },
    {
      title: "Workload identity federation concepts",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/workload-id/workload-identity-federation",
    },
    {
      title: "Configure a user-assigned managed identity to trust an external identity provider",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust-user-assigned-managed-identity",
    },
    {
      title: "Azure Kubernetes Service workload identity overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/aks/workload-identity-overview",
    },
  ],
};
