import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-control-tower-multi-account-governance-scp",
  category: "cloud",
  contentType: "explainer",
  title: "The account boundary is the only AWS control an application cannot argue with",
  seoTitle: "AWS Control Tower, Organizations and SCPs Explained",
  metaDescription:
    "Why one big AWS account fails, what Service Control Policies can and cannot restrict, and what Control Tower actually builds when it sets up a landing zone.",
  standfirst:
    "IAM decides what a role may do. An SCP decides what the account may do at all. The gap between those two ideas is where most AWS governance goes wrong.",
  excerpt:
    "SCPs set a ceiling that even the root user cannot lift — in member accounts. They do nothing at all in the management account, and nothing to service-linked roles. That shapes the whole design.",
  authorId: "rahul-velapure",
  publishedAt: "2026-02-09",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 6,
  primaryKeyword: "AWS Control Tower multi-account strategy",
  secondaryKeywords: [
    "AWS Organizations SCP",
    "service control policies",
    "resource control policies",
    "AWS Account Factory",
    "IAM Identity Center",
  ],
  tags: ["AWS", "Governance", "Cloud", "Identity", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["eks-pod-identity-vs-irsa-migration", "cloud-cost-controls"],
  methodology:
    "Written from the AWS Organizations documentation on service control policies, the AWS Control Tower guide to how landing zones work, and the IAM Identity Center user guide, verified August 2026. Three corrections were made to the source draft. It stated that an SCP overrides the root user of any account; SCPs have no effect at all on users or roles in the management account, and none on service-linked roles anywhere. It said Control Tower creates the management account, which it does not — it is deployed into an existing one. And it described only preventive and detective controls, omitting proactive controls and the resource control policies added in late 2024. The draft's crypto-mining incident and its billing figures were removed.",
  body: [
    {
      type: "p",
      text: "One big AWS account is what you get when nobody decides. Someone signs up. Everything lands in one place. Years later that account holds every system the firm runs. Nothing forced it, and nobody chose it.",
    },
    {
      type: "p",
      text: "The problem is not tidiness. An account is the only line in AWS that code cannot talk its way past. Inside one account, a broad IAM policy or a leaked key reaches everything. Across accounts, it does not.",
    },
    {
      type: "p",
      text: "AWS Organizations gives you those boundaries. Control Tower makes them cheap enough to use.",
    },
    {
      type: "h2",
      id: "management-account",
      text: "The management account is different, and that is the point",
    },
    {
      type: "p",
      text: "The account that opens the organization becomes the management account. All the rest are member accounts. Their bills roll up to it.",
    },
    {
      type: "p",
      text: "It should run nothing. No instances, no buckets, no databases. People repeat that as good hygiene. The real reason is mechanical.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "SCPs do not apply to the management account",
      text: "SCPs bind member accounts only. They have no effect on any user or role in the management account. That includes its root user. This is documented behaviour, not a gap. Control Tower works the same way: it applies no preventive controls there. So whatever you run there runs outside every guardrail you built.",
    },
    {
      type: "p",
      text: "Accounts sit in organizational units, or OUs. An OU maps to an environment or a business unit. Policy on an OU flows down to every account in it, and to any OU nested below.",
    },
    { type: "h2", id: "scp", text: "What an SCP actually does" },
    {
      type: "p",
      text: "A Service Control Policy is not an IAM policy that lives higher up. It grants nothing. It sets the ceiling: the most a member account may ever do.",
    },
    {
      type: "p",
      text: "Permissions stack. The identity policy must allow the action. So must every SCP above the account. A deny anywhere in that chain wins, and no admin inside the account can lift it.",
    },
    {
      type: "p",
      text: "That reach covers the member account root user. It is the property that makes SCPs worth the trouble. It does not cover everything.",
    },
    {
      type: "ul",
      items: [
        "**Service-linked roles are exempt.** SCPs cannot restrict them, because AWS services rely on them to function.",
        "**Resource-based policies are not directly affected.** An SCP on your account does not constrain a principal from outside the organization that a bucket policy has invited in.",
        "**Do not simply remove the default allow policy.** `FullAWSAccess` is attached by default, and it is what permits anything at all. Replace it on purpose, or attach deny statements alongside it.",
      ],
    },
    {
      type: "p",
      text: "One consequence catches security teams. Delegating administration of a service does not exempt the account you delegate to. It is still a member account, so your SCPs still apply. A deny you wrote for developers can break the delegated administrator you set up for GuardDuty or Security Hub.",
    },
    {
      type: "p",
      text: "Inheritance is where allow-lists catch people out. A deny-list SCP is simple: `FullAWSAccess` stays attached, and your deny statements sit alongside it. An allow-list SCP is not. The action must be allowed at the root, at every OU on the path, and at the account. Miss one level and the permission is gone, even though the policy nearest the account allows it.",
    },
    {
      type: "p",
      text: "Three denies carry most of the value. Block every region but the ones you approve, keyed on `aws:RequestedRegion`. Leave an exception for the global services: IAM and CloudFront are not regional, and they will break. Block daily use of the root user. Block anyone from turning off CloudTrail, Config or GuardDuty.",
    },
    {
      type: "p",
      text: "Test them on one OU first, never on the root. AWS says so plainly. A deny at the root hits accounts you have not thought about yet.",
    },
    { type: "h2", id: "rcp", text: "SCPs cover principals; RCPs cover resources" },
    {
      type: "p",
      text: "Resource control policies arrived in late 2024. They answer the other half. An SCP limits what your own principals may do. An RCP limits what may be done to your resources, whoever is asking.",
    },
    {
      type: "p",
      text: "That closes the gap in the second bullet above. An RCP on S3 can demand that anyone touching your buckets belongs to your organization. No SCP can say that. Control Tower ships managed controls built on RCPs for S3, STS, KMS, SQS and Secrets Manager.",
    },
    { type: "h2", id: "control-tower", text: "What Control Tower builds" },
    {
      type: "p",
      text: "Control Tower sits on top of Organizations, CloudFormation StackSets and Config. It does not replace them. It also does not create your management account. You have that one already, and Control Tower is set up inside it.",
    },
    {
      type: "p",
      text: "Launching a landing zone creates a Security OU. That OU holds two shared accounts, Log Archive and Audit. A Sandbox OU is optional. Control Tower then sets up a directory in IAM Identity Center and applies the mandatory controls.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Name the shared accounts carefully",
      text: "You name the Log Archive and Audit accounts at launch. You cannot rename them later. Bringing your own accounts in for logging and security is a launch-time choice too, and there is no second chance at it.",
    },
    { type: "h3", id: "controls", text: "Guardrails are now controls, and there are three kinds" },
    {
      type: "table",
      caption: "The three control types, what enforces each, and when it acts.",
      head: ["Type", "Implemented with", "Acts"],
      rows: [
        ["Preventive", "SCPs, and RCPs for resources", "Blocks the API call"],
        ["Detective", "AWS Config rules", "Reports drift after the fact"],
        ["Proactive", "CloudFormation hooks", "Blocks the deploy before provisioning"],
      ],
    },
    {
      type: "p",
      text: "The proactive row is the one teams miss. A detective control tells you a bucket went up unencrypted. A proactive control refuses to build it at all, during the CloudFormation run rather than at the API.",
    },
    {
      type: "h3",
      id: "account-factory",
      text: "Account Factory is the part that changes behaviour",
    },
    {
      type: "p",
      text: "Account Factory turns account creation into a request. Approve one and it does the rest. It creates the account. It puts it in the right OU. It applies your baseline, enrols it in central logging, and grants access through IAM Identity Center.",
    },
    {
      type: "p",
      text: "The governance case is obvious. The human one matters more. When a new account takes an afternoon, teams ask for one. When it takes six weeks, they reuse what they have. Your careful boundaries then stop being boundaries.",
    },
    { type: "h2", id: "identity-center", text: "Identity Center removes the long-lived keys" },
    {
      type: "p",
      text: "Access across a hundred accounts once meant IAM users in each one. Or a SAML trust set up a hundred times.",
    },
    {
      type: "p",
      text: "IAM Identity Center brokers it instead. You connect it to your corporate directory. You define permission sets. Then you assign a group to a permission set in named accounts. Users open one portal and pick an account. Identity Center assumes a role there and hands back short-lived keys.",
    },
    {
      type: "p",
      text: "The key that leaks is the key that lasts. Drop the local IAM users and there is nothing left worth stealing. The same logic drives the workload-side move off static keys in [EKS Pod Identity](/devops/eks-pod-identity-vs-irsa-migration).",
    },
    { type: "h2", id: "blast-radius", text: "How this contains a leaked credential" },
    {
      type: "p",
      text: "A key ends up somewhere public. Scanners find it within minutes. The usual next step is costly compute in a region nobody watches.",
    },
    {
      type: "p",
      text: "In one shared account with no limits, that runs until a human sees the bill. Layered controls cut it down at each step.",
    },
    {
      type: "ol",
      items: [
        "The account is a sandbox, so nothing production is reachable from it.",
        "A region deny SCP blocks every region except the approved ones, so the unwatched region is not available.",
        "An instance-type deny blocks the large instances that make mining worthwhile.",
        "A budget action caps the spend rather than waiting for the invoice.",
      ],
    },
    {
      type: "p",
      text: "None of those four is clever. Each one is enforced somewhere the stolen key cannot reach, and the account boundary is what puts it there. Budgets and alerts are the last line, not the first — see [cloud cost controls](/cloud/cloud-cost-controls) for the FinOps side.",
    },
    {
      type: "p",
      text: "Budget for the running cost too. Control Tower has no fee. It does turn on Config in every account and region, and it writes CloudTrail logs to S3. Across a big estate that is a real line item, and you signed up for it at launch.",
    },
  ],
  faq: [
    {
      question: "Can an SCP restrict the root user?",
      answer:
        "In a member account, yes. In the management account, no. SCPs have no effect on any user or role there. That is why the management account should run nothing.",
    },
    {
      question: "What is the difference between an SCP and a permissions boundary?",
      answer:
        "Scope. An SCP covers a whole account or OU and is set in the organization. A boundary covers one IAM user or role and is set in the account.",
    },
    {
      question: "Do SCPs apply to service-linked roles?",
      answer:
        "No. AWS services need those roles to work, so they are exempt. Plan for that when you write a broad deny.",
    },
    {
      question: "What do resource control policies add?",
      answer:
        "They limit what may be done to your resources, by anyone. An SCP only limits your own principals. RCPs close the gap left by resource-based policies.",
    },
    {
      question: "Can a member account leave the organization?",
      answer:
        "Only with its own payment method, and only if no SCP denies `organizations:LeaveOrganization`. Many teams deny it on purpose.",
    },
    {
      question: "Does Control Tower cost anything?",
      answer:
        "There is no fee for the service. You pay for what it turns on: Config in every account and region, CloudTrail, and the S3 storage behind them.",
    },
  ],
  sources: [
    {
      title: "Service control policies (SCPs)",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html",
    },
    {
      title: "How AWS Control Tower works",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/controltower/latest/userguide/how-control-tower-works.html",
    },
    {
      title: "Controls implemented with resource control policies",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/controltower/latest/controlreference/rcp-controls.html",
    },
    {
      title: "What is IAM Identity Center?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html",
    },
  ],
};
