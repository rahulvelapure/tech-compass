import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-iam-roles-anywhere-certificate-authentication",
  category: "cloud",
  contentType: "explainer",
  title: "A certificate your server already has can replace the AWS key it should never have had",
  seoTitle: "AWS IAM Roles Anywhere: Certificates Instead of Keys",
  metaDescription:
    "How workloads outside AWS trade an X.509 certificate for temporary IAM credentials, and the account-level trust boundary that catches people out.",
  standfirst:
    "Anything outside AWS that calls an AWS API has usually been handed a key. Roles Anywhere lets it show a certificate instead. In return, you take on the problems of running a PKI.",
  excerpt:
    "The trust boundary is the account. Any certificate from any trust anchor in that account can assume any role there unless you write the condition yourself.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-22",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "AWS IAM Roles Anywhere certificate authentication",
  secondaryKeywords: [
    "IAM Roles Anywhere trust anchor",
    "X.509 workload authentication",
    "AWS Private CA",
    "rolesanywhere CreateSession",
    "credential helper",
  ],
  tags: ["AWS", "Identity", "PKI", "Cloud", "Security"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "oidc-workload-identity-federation-cross-cloud",
    "aws-control-tower-multi-account-governance-scp",
  ],
  methodology:
    "Written from the AWS IAM Roles Anywhere user guide covering the trust model, profiles and the credential helper, and the AWS Private CA documentation, verified August 2026. Two corrections were made to the source draft. It describes the exchange as a mutual TLS handshake; the workload calls `CreateSession` and signs that request with the certificate's private key, which is a different mechanism with different failure modes. And it omits the account trust boundary entirely — a certificate from any trust anchor in an account can assume any role in that account unless the role's trust policy says otherwise, which is the most important security property of the service. The draft's edge-fleet incident was rewritten as the mechanism.",
  body: [
    {
      type: "p",
      text: "Plenty of things that are not in AWS still have to call AWS. A server in a rack. A build agent in another cloud. A device in a warehouse.",
    },
    {
      type: "p",
      text: "The usual answer is an access key, and it is a bad one. It does not expire, it sits in a file or an environment variable, and revoking it means finding every copy first.",
    },
    {
      type: "p",
      text: "IAM Roles Anywhere swaps it for something most of those machines already have, or should have. A certificate, from a CA you run.",
    },
    { type: "h2", id: "pieces", text: "Three objects, and one that is easy to miss" },
    {
      type: "p",
      text: "A **trust anchor** points at a certificate authority, either an AWS Private CA or an external one. It is what tells AWS which certificates to believe.",
    },
    {
      type: "p",
      text: "A **profile** names the roles that may be assumed. It can also carry a session policy, which further limits what a session may do. A profile can list several roles. It carries exactly one session policy.",
    },
    {
      type: "p",
      text: "The **role** has to trust the Roles Anywhere service principal to be assumable at all. That is where you tie it back to a specific trust anchor, using a source condition naming the anchor's ARN.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The trust boundary is the whole account",
      text: "AWS states this plainly and it surprises people. A certificate issued by any trust anchor in an account can be used to assume any target role in that account, unless the role's trust policy narrows it. Register a second CA for a different team and you have not created a separate compartment — you have added another way to reach every Roles Anywhere role in the account. There is also no automatic tie-in to organisation-wide controls. The condition on the role is the boundary, and if you do not write one there is not one.",
    },
    {
      type: "p",
      text: "One more thing shapes the design. These resources are regional. The trust anchor, the profile and the role all have to sit in the same account and region. A multi-region estate needs the whole setup once per region.",
    },
    { type: "h2", id: "exchange", text: "How the credentials are actually obtained" },
    {
      type: "p",
      text: "The workload calls the Roles Anywhere `CreateSession` API. It names the trust anchor, the profile and the role. It signs that request with the private key behind its certificate, and sends the certificate too. AWS can then check the signature and the chain.",
    },
    {
      type: "p",
      text: "This is worth being precise about, because it is often described as mutual TLS. The certificate is not proving itself during the TLS handshake; it is signing the request. The practical difference is where failures show up. A problem here is a rejected API call with an error, not a connection that will not establish.",
    },
    {
      type: "p",
      text: "If the chain checks out, and the cert has not been revoked, AWS hands back short-lived credentials for the role. The session policy on the profile limits what they can do.",
    },
    {
      type: "p",
      text: "AWS ships a credential helper that does all of this and hands the result to the SDK in the format it expects. Point your configuration at the helper, give it the certificate and key, and existing code needs no changes — the same shape as any other credential process.",
    },
    {
      type: "h2",
      id: "identity",
      text: "The certificate is the identity, so put something useful in it",
    },
    {
      type: "p",
      text: "Fields from the certificate are available as condition keys in the role's trust policy. That is what lets one trust anchor serve many workloads without giving them all the same access.",
    },
    {
      type: "p",
      text: "Issue certificates that name the workload, not just the host. Put that in the subject, or in the subject alternative name. The role can then test for a value. A certificate for another workload will fail that test, even though the same CA signed it.",
    },
    {
      type: "p",
      text: "Without that, every holder of a valid cert is the same as every other. That is the account boundary problem again, in a smaller form.",
    },
    { type: "h2", id: "pki", text: "You have not removed a secret, you have changed its shape" },
    {
      type: "p",
      text: "The access key is gone. In its place is a private key, and that key is now the thing worth stealing.",
    },
    {
      type: "p",
      text: "The difference is real and it is not automatic. A certificate expires on its own, which a key never did. Revocation exists, which it did not. And the private key can be protected by hardware in a way an access key never could.",
    },
    {
      type: "p",
      text: "That last one is where most of the value sits. A key sealed in a TPM or an HSM cannot be copied off the machine. Someone who takes the disk gets a certificate they cannot use. Store the key in a plain file and you have swapped one exfiltratable secret for another, with more moving parts.",
    },
    {
      type: "p",
      text: "Three jobs come with it, and none of them is optional.",
    },
    {
      type: "ol",
      items: [
        "**Renewal has to be automatic.** Certificates expire by design. An expiry you did not automate is an outage with a date on it.",
        "**Revocation has to work end to end.** Publish a revocation list AWS can reach, and test that a revoked certificate is actually refused. An untested revocation path is a decommissioning process that does not decommission anything.",
        "**The CA is now critical infrastructure.** Compromise it and every certificate it issued is trusted. Recovery means revoking the CA, removing the trust anchor and reissuing everything below it.",
      ],
    },
    { type: "h2", id: "when", text: "When to use it, and when not to" },
    {
      type: "p",
      text: "The rule is simple. Use it when nothing better is on offer. And something better usually is.",
    },
    {
      type: "table",
      caption: "What to reach for first.",
      head: ["Workload", "Use", "Why"],
      rows: [
        ["EC2 instance", "Instance profile", "Native, no certificate to manage"],
        ["Pod in EKS", "Pod Identity or IRSA", "Simpler, and already tied to the service account"],
        [
          "CI job with an OIDC issuer",
          "OIDC federation",
          "No PKI, and the claims describe the job",
        ],
        [
          "On-premises or another cloud",
          "Roles Anywhere",
          "Nothing else can prove identity to AWS",
        ],
      ],
    },
    {
      type: "p",
      text: "Can the platform already make a signed claim about the workload? Then federate against that instead. The mechanism, and the trap in its trust policy, are in [OIDC workload identity federation](/cybersecurity-ciso/oidc-workload-identity-federation-cross-cloud). Roles Anywhere is for the case where nothing upstream can vouch for the machine, so you have to do it yourself with a CA.",
    },
    {
      type: "p",
      text: "Where it does fit, treat the account boundary as an architecture choice, not a detail. Isolating workloads means separate accounts, not separate trust anchors. That is the same reasoning as in [AWS Control Tower and SCPs](/cloud/aws-control-tower-multi-account-governance-scp).",
    },
  ],
  faq: [
    {
      question: "Does Roles Anywhere use mutual TLS?",
      answer:
        "Not quite. The workload signs the `CreateSession` request with its certificate's private key. Failures show up as rejected API calls, not failed connections.",
    },
    {
      question: "Can one trust anchor be isolated from another?",
      answer:
        "No. Inside one account, a cert from any trust anchor can take on any Roles Anywhere role. Only a test on the role itself narrows that down.",
    },
    {
      question: "Should EC2 instances use it?",
      answer:
        "No. Use an instance profile. Roles Anywhere is for workloads outside AWS that have no native way to prove who they are.",
    },
    {
      question: "Can I use a self-signed CA?",
      answer:
        "You can register one as a trust anchor. You then have no real lifecycle or revocation story, which is most of what makes this safer than a key.",
    },
    {
      question: "What if the CA is compromised?",
      answer:
        "Every certificate it signed is trusted. Revoke the CA, delete the trust anchor, and reissue them all. Plan that before you need it.",
    },
    {
      question: "Where should the private key live?",
      answer:
        "In a TPM or an HSM if the hardware allows. A key in a file is just another secret that can be copied off the machine.",
    },
  ],
  sources: [
    {
      title: "What is IAM Roles Anywhere?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html",
    },
    {
      title: "IAM Roles Anywhere trust model",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/rolesanywhere/latest/userguide/trust-model.html",
    },
    {
      title: "What is AWS Private CA?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/privateca/latest/userguide/PcaWelcome.html",
    },
    {
      title: "IAM Roles Anywhere credential helper",
      publisher: "Amazon Web Services",
      url: "https://github.com/aws/rolesanywhere-credential-helper",
    },
  ],
};
