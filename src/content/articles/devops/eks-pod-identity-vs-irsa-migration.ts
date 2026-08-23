import type { Article } from "../../types";

export const article: Article = {
  slug: "eks-pod-identity-vs-irsa-migration",
  category: "devops",
  contentType: "comparison",
  subcategory: "Kubernetes IAM",
  title: "EKS Pod Identity vs IRSA: architecture, migration, and the boundary that still matters",
  seoTitle: "EKS Pod Identity vs IRSA: Architecture, Migration, and Limits",
  metaDescription:
    "AWS now recommends EKS Pod Identity where possible. Compare it with IRSA, understand the credential flows, and plan a migration without weakening IAM boundaries.",
  standfirst:
    "EKS Pod Identity removes cluster-specific IAM OIDC providers, but it does not remove the need for careful trust policies, SDK support and node security.",
  excerpt:
    "Pod Identity simplifies the IAM control plane for EKS workloads. The migration is worthwhile for many clusters, but Fargate, Windows nodes and existing credential-chain behaviour still matter.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
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
  draft: true,
  methodology:
    "Verified against current Amazon EKS Pod Identity, IRSA, IAM trust policy and SDK documentation. The source draft's outdated association limit, credential lifetime and unsupported-platform notes were corrected. Cross-account access is described using the current target-role model rather than implying that Pod Identity directly assumes a role in another account.",
  body: [
    {
      type: "p",
      text: "Every EKS pod that calls AWS APIs needs an AWS identity. The old answer was IRSA. The newer answer is EKS Pod Identity.",
    },
    {
      type: "p",
      text: "The important change is not that the pod stops receiving temporary credentials. It still receives temporary credentials. The change is where the trust relationship is configured and how the credentials reach the workload.",
    },
    {
      type: "p",
      text: "AWS now recommends EKS Pod Identity where possible. That does not mean IRSA is obsolete. The right choice still depends on platform support, existing workloads and how much value the simpler control plane creates for the organisation.",
    },
    {
      type: "h2",
      id: "irsa",
      text: "How IRSA works",
    },
    {
      type: "p",
      text: "IRSA uses the OIDC issuer associated with an EKS cluster. An IAM OIDC provider is created for that issuer. The IAM role trust policy then names the provider and restricts the Kubernetes service account through token claims.",
    },
    {
      type: "p",
      text: "The service account is annotated with the IAM role ARN. EKS injects the web identity token information into the pod. The AWS SDK exchanges the token with STS using AssumeRoleWithWebIdentity and receives temporary role credentials.",
    },
    {
      type: "p",
      text: "This is a sound design. Its operational cost appears when the number of clusters grows. Each cluster has its own issuer. Roles that need to work across clusters must account for those cluster-specific trust relationships.",
    },
    {
      type: "h2",
      id: "podidentity",
      text: "How EKS Pod Identity changes the flow",
    },
    {
      type: "p",
      text: "Pod Identity removes the need for an IAM OIDC provider for the cluster. Instead, the EKS Pod Identity Agent runs as a DaemonSet on supported Linux EC2 nodes. EKS associates a Kubernetes namespace and service account with an IAM role.",
    },
    {
      type: "p",
      text: "When the pod starts, EKS provides the credential-provider configuration. The AWS SDK uses the container credential provider and contacts the local agent. The agent calls the EKS Auth API, obtains temporary credentials and makes them available to the workload.",
    },
    {
      type: "p",
      text: "The trust policy uses the `pods.eks.amazonaws.com` service principal. AWS also supports session tags that identify the cluster, namespace and service account. Those tags can be used in IAM conditions.",
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
      text: "Pod Identity is not universal. Current AWS documentation restricts it to Linux Amazon EC2 worker nodes. Windows pods on EC2 are not supported. Pods running on Fargate are not supported either.",
    },
    {
      type: "p",
      text: "The association limit has also changed since the original draft. AWS currently documents up to 5,000 Pod Identity associations per cluster. That is a useful capacity number, but it should still be treated as a service limit and checked against current AWS documentation during design.",
    },
    {
      type: "p",
      text: "SDK support is another dependency. Current AWS documentation lists minimum SDK versions for Pod Identity. A workload that carries an older SDK may continue using another credential source or fail to obtain the intended credentials.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Check the credential chain during migration",
      text: "Adding a Pod Identity association does not guarantee that the workload will use it. AWS documents that credentials earlier in the SDK default chain can win. Remove or neutralise old credential sources after validating the new path.",
    },
    {
      type: "h2",
      id: "trust",
      text: "The trust policy is simpler, not optional",
    },
    {
      type: "p",
      text: "A common misconception is that Pod Identity eliminates IAM trust-policy design. It does not. The role must trust the EKS Pod Identity service principal and allow the required STS actions.",
    },
    {
      type: "code",
      language: "json",
      filename: "trust-policy.json",
      code: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Principal": {"Service": "pods.eks.amazonaws.com"},\n    "Action": ["sts:AssumeRole", "sts:TagSession"]\n  }]\n}',
    },
    {
      type: "p",
      text: "AWS also documents conditions based on session tags. That lets an organisation restrict a role to particular namespaces, service accounts or organisational boundaries. The trust policy remains part of the security boundary.",
    },
    {
      type: "h2",
      id: "crossaccount",
      text: "Cross-account access needs a second role boundary",
    },
    {
      type: "p",
      text: "The source draft described Pod Identity as directly supporting cross-account role assumption. That wording is too broad. AWS documents that the Pod Identity association directly assumes a role in the same account as the cluster.",
    },
    {
      type: "p",
      text: "For a target role in another account, use a second IAM role and a controlled AssumeRole path. AWS documents target-role patterns that carry an external identifier derived from the cluster, namespace and service account. This creates a clearer two-account trust chain.",
    },
    {
      type: "h2",
      id: "migration",
      text: "A safe migration from IRSA",
    },
    {
      type: "p",
      text: "During transition, keep the old path available only as long as necessary. The goal is not merely to make the application work. The goal is to prove which identity the application is actually using.",
    },
    {
      type: "h2",
      id: "when",
      text: "When IRSA is still the right answer",
    },
    {
      type: "p",
      text: "IRSA remains useful when the workload runs on a platform that Pod Identity does not support. Fargate and Windows are the obvious current cases. IRSA is also a reasonable choice when an existing deployment is stable and the operational benefit of migration is small.",
    },
    {
      type: "p",
      text: "For new Linux EC2 workloads on EKS, Pod Identity is usually the simpler default because it removes the cluster-specific OIDC provider management. That is an operational advantage, not a reason to weaken IAM conditions.",
    },
    {
      type: "h2",
      id: "takeaway",
      text: "What to remember",
    },
    {
      type: "ul",
      items: [
        "Pod Identity removes the per-cluster IAM OIDC provider requirement.",
        "The Pod Identity Agent runs on supported Linux EC2 nodes and supplies credentials through the container credential chain.",
        "AWS currently documents 5,000 associations per cluster.",
        "Fargate and Windows nodes remain outside Pod Identity support.",
        "The credential chain can still select an older credential source, so migration must verify actual usage.",
        "Cross-account designs need an explicit target-role trust boundary.",
      ],
    },
  ],
  faq: [
    {
      question: "Is IRSA deprecated?",
      answer:
        "No. AWS supports both mechanisms. AWS recommends EKS Pod Identity where possible, while IRSA remains important for unsupported platforms and existing deployments.",
    },
    {
      question: "Does Pod Identity require an OIDC provider?",
      answer:
        "No. Pod Identity uses the EKS Auth service and Pod Identity Agent instead of an IAM OIDC provider for each cluster.",
    },
    {
      question: "Does Pod Identity work on Fargate?",
      answer:
        "No. Current AWS documentation says Pod Identity is limited to Linux EC2 worker nodes and does not support Fargate or Windows nodes.",
    },
    {
      question: "How many Pod Identity associations can a cluster have?",
      answer: "AWS currently documents up to 5,000 associations per cluster.",
    },
    {
      question: "Can Pod Identity use a role in another AWS account?",
      answer:
        "The association directly assumes a role in the cluster account. For another account, use a second role and an explicit cross-account AssumeRole trust path.",
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
