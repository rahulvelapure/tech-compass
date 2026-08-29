import type { Article } from "../../types";

export const article: Article = {
  slug: "eks-pod-identity-vs-irsa-migration",
  category: "devops",
  contentType: "comparison",
  subcategory: "Kubernetes",
  title: "EKS Pod Identity vs IRSA: architecture, migration, and the boundary that still matters",
  seoTitle: "EKS Pod Identity vs IRSA: Architecture, Migration, and Limits",
  metaDescription:
    "AWS now recommends EKS Pod Identity where possible. Compare it with IRSA, understand the credential flows, and plan a migration without weakening IAM boundaries.",
  standfirst:
    "Pod Identity takes the OIDC provider off your plate. It does not take away the trust policy, and that is where the boundary still lives.",
  excerpt:
    "Pod Identity simplifies the IAM control plane for EKS workloads. The migration is worthwhile for many clusters, but Fargate, Windows nodes and existing credential-chain behaviour still matter.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-28",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "EKS Pod Identity vs IRSA",
  secondaryKeywords: [
    "EKS Pod Identity association",
    "IAM Roles for Service Accounts migration",
    "EKS pod IAM role",
    "EKS Pod Identity Agent",
    "Kubernetes AWS credentials",
  ],
  tags: ["AWS", "EKS", "Kubernetes", "IAM", "Security", "DevOps"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-pod-networking-packet-flow",
    "karpenter-vs-cluster-autoscaler-node-scaling",
    "secrets-management-cicd-vault-oidc-reality",
  ],
  methodology:
    "Verified against current Amazon EKS Pod Identity, IRSA, IAM trust policy and SDK documentation. The source draft's outdated association limit, credential lifetime and unsupported-platform notes were corrected. Cross-account access is described using the current target-role model rather than implying that Pod Identity directly assumes a role in another account.",
  body: [
    {
      type: "p",
      text: "Every EKS pod that calls AWS APIs needs an AWS identity. The old answer was IRSA. The newer answer is EKS Pod Identity.",
    },
    {
      type: "p",
      text: "The pod still gets short-lived credentials either way. That part does not change. What changes is where you set up the trust, and how those credentials reach the pod.",
    },
    {
      type: "p",
      text: "AWS now points new work at Pod Identity. That does not make IRSA obsolete. What you pick still depends on where the pods run, what you already have, and how much the simpler setup is worth to you.",
    },
    {
      type: "h2",
      id: "irsa",
      text: "How IRSA works",
    },
    {
      type: "p",
      text: "Every EKS cluster has an OIDC issuer. With IRSA you create an IAM OIDC provider for it. The role trust policy then names that provider, and it uses token claims to pin the role to one Kubernetes service account.",
    },
    {
      type: "p",
      text: "You annotate the service account with the role ARN. EKS then projects a web identity token into the pod. The SDK trades that token with STS through AssumeRoleWithWebIdentity, and gets back short-lived credentials. It is the same federation pattern that [CI/CD pipelines use with OIDC](/devops/secrets-management-cicd-vault-oidc-reality).",
    },
    {
      type: "p",
      text: "The design is sound. The cost shows up once you run a lot of clusters. Each one has its own issuer, so a role that works across all of them carries trust for each cluster in turn.",
    },
    {
      type: "h2",
      id: "podidentity",
      text: "How EKS Pod Identity changes the flow",
    },
    {
      type: "p",
      text: "Pod Identity drops the OIDC provider. In its place, the EKS Pod Identity Agent runs as a DaemonSet on supported Linux EC2 nodes, including any that [a node autoscaler brings up](/devops/karpenter-vs-cluster-autoscaler-node-scaling). You then tie a namespace and a service account to an IAM role.",
    },
    {
      type: "p",
      text: "When the pod starts, EKS hands it the credential-provider settings. The SDK uses the container credential provider and asks the local agent. The agent calls the EKS Auth API, gets short-lived credentials, and passes them to the pod.",
    },
    {
      type: "p",
      text: "The trust policy names the `pods.eks.amazonaws.com` service principal. AWS also sets session tags for the cluster, the namespace and the service account. You can match on those tags in an IAM condition.",
    },
    {
      type: "table",
      caption: "The architectural difference",
      head: ["Dimension", "IRSA", "EKS Pod Identity"],
      rows: [
        ["Cluster IAM setup", "OIDC provider per cluster", "No cluster OIDC provider"],
        [
          "Role trust",
          "Cluster-specific OIDC principal and claims",
          "EKS service principal and session tags",
        ],
        ["Kubernetes annotation", "IAM role ARN annotation", "No role annotation required"],
        [
          "Credential exchange",
          "STS AssumeRoleWithWebIdentity",
          "EKS Auth AssumeRoleForPodIdentity",
        ],
        [
          "Credential delivery",
          "Projected web identity token plus SDK exchange",
          "Pod Identity Agent plus container credential provider",
        ],
        [
          "Cluster reuse",
          "Trust policy grows with cluster count",
          "Role trust can be reused across clusters",
        ],
        [
          "Supported compute",
          "Broader Kubernetes deployment options",
          "Linux EC2 worker nodes in EKS",
        ],
      ],
    },
    {
      type: "h2",
      id: "limits",
      text: "The current limitations matter",
    },
    {
      type: "p",
      text: "Pod Identity does not cover everything. AWS limits it to Linux EC2 worker nodes. Windows pods on EC2 are out. So are pods on Fargate.",
    },
    {
      type: "p",
      text: "The limit on associations has moved since the source draft. AWS now documents up to 5,000 per cluster. Treat that as a service limit rather than a fixed truth, and check it again when you size a design.",
    },
    {
      type: "p",
      text: "The SDK matters too. AWS lists a minimum version for each language. Ship an older SDK and the pod may quietly fall back to another credential source, or get nothing at all.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Check the credential chain during migration",
      text: "Creating an association does not mean the pod will use it. AWS is clear that a credential source earlier in the default chain still wins. So prove the new path works first, then strip the old sources out.",
    },
    {
      type: "h2",
      id: "trust",
      text: "The trust policy is simpler, not optional",
    },
    {
      type: "p",
      text: "People often think Pod Identity does away with trust policy work. It does not. The role still has to trust the Pod Identity service principal, and it still has to allow the STS actions below.",
    },
    {
      type: "code",
      language: "json",
      filename: "trust-policy.json",
      code: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Principal": {"Service": "pods.eks.amazonaws.com"},\n    "Action": ["sts:AssumeRole", "sts:TagSession"]\n  }]\n}',
    },
    {
      type: "p",
      text: "You can go further and match on the session tags. That pins a role to named namespaces and service accounts, or to a wider boundary you choose. The trust policy is still part of the security boundary.",
    },
    {
      type: "h2",
      id: "crossaccount",
      text: "Cross-account access needs a second role boundary",
    },
    {
      type: "p",
      text: "The source draft said Pod Identity supports cross-account role assumption outright. That is too broad. AWS is specific: the association assumes a role in the same account as the cluster.",
    },
    {
      type: "p",
      text: "To reach a role in another account, add a second role and let the first one assume it. AWS documents target-role patterns that carry an external id built from the cluster, the namespace and the service account. You end up with a trust chain you can read across both accounts.",
    },
    {
      type: "h2",
      id: "migration",
      text: "A safe migration from IRSA",
    },
    {
      type: "p",
      text: "Keep the old path alive only as long as you need it. The aim is not just to get the app working again. The aim is to prove which identity it now uses.",
    },
    {
      type: "ol",
      items: [
        "Add the Pod Identity trust to the role, alongside whatever IRSA trust it already carries. Both can sit in one policy while you move.",
        "Install the EKS Pod Identity Agent add-on on the cluster.",
        "Create the association for the namespace and service account.",
        "Restart the pods. They only pick up the new credential settings on start.",
        "Call sts:GetCallerIdentity from inside a pod and read the ARN it returns. That is the identity in use, whatever the config says.",
        "Once the ARN is right, drop the eks.amazonaws.com/role-arn annotation, then remove the OIDC trust from the role.",
      ],
    },
    {
      type: "h2",
      id: "when",
      text: "When IRSA is still the right answer",
    },
    {
      type: "p",
      text: "IRSA still earns its place when the pods run somewhere Pod Identity cannot reach. Fargate and Windows are the obvious cases today. It is also fine to stay put when a setup is stable and the move would buy you very little.",
    },
    {
      type: "p",
      text: "For new Linux EC2 work on EKS, Pod Identity is the simpler default. You no longer manage an OIDC provider per cluster. That saves effort, and it is not a reason to loosen the IAM conditions.",
    },
    {
      type: "h2",
      id: "takeaway",
      text: "What to remember",
    },
    {
      type: "ul",
      items: [
        "You no longer need an IAM OIDC provider for each cluster.",
        "The agent runs on supported Linux EC2 nodes and feeds credentials through the container credential chain.",
        "AWS documents a limit of 5,000 associations per cluster.",
        "Fargate and Windows nodes are still out of scope.",
        "The chain can still pick an older source, so check what the pod really uses.",
        "If the role lives in another account, you need a second role and a trust path to it.",
      ],
    },
  ],
  faq: [
    {
      question: "Is IRSA deprecated?",
      answer:
        "No. AWS backs both. It points new work at Pod Identity, and IRSA still covers what Pod Identity cannot reach.",
    },
    {
      question: "Does Pod Identity require an OIDC provider?",
      answer:
        "No. It uses the EKS Auth service and the agent on the node instead of one per cluster.",
    },
    {
      question: "Does Pod Identity work on Fargate?",
      answer: "No. AWS limits it to Linux EC2 worker nodes. Fargate and Windows are both out.",
    },
    {
      question: "How many Pod Identity associations can a cluster have?",
      answer: "AWS documents a limit of 5,000 per cluster. Check the figure again when you design.",
    },
    {
      question: "Can Pod Identity use a role in another AWS account?",
      answer:
        "It assumes a role in the cluster account. To reach another account, add a second role and let the first one assume it.",
    },
  ],
  sources: [
    {
      title: "Learn how EKS Pod Identity grants pods access to AWS services",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html",
    },
    {
      title: "Understand how EKS Pod Identity works",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/pod-id-how-it-works.html",
    },
    {
      title: "Create IAM role with trust policy required by EKS Pod Identity",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/pod-id-role.html",
    },
    {
      title: "Use pod identity with the AWS SDK",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/pod-id-minimum-sdk.html",
    },
    {
      title: "Grant Kubernetes workloads access to AWS using Kubernetes Service Accounts",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/service-accounts.html",
    },
    {
      title: "IAM roles for service accounts",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html",
    },
  ],
};
