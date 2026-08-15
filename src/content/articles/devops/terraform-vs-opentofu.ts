import type { Article } from "../../types";

export const article: Article = {
  slug: "terraform-vs-opentofu",
  category: "devops",
  contentType: "comparison",
  subcategory: "Infrastructure as code",
  title: "Terraform or OpenTofu: a decision that is now about governance, not features",
  seoTitle: "Terraform vs OpenTofu: choosing in 2026",
  metaDescription:
    "The two tools remain largely interchangeable in daily use. What separates them is licence, governance and ownership — decide on those terms.",
  standfirst:
    "Comparing them on capability produces a near-tie and misses the point. The question is what you are willing to depend on for the next five years.",
  excerpt:
    "OpenTofu and Terraform still share a configuration language, provider protocol and state model. The differences that matter are licensing, governance and a small set of divergent features.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-15",
  lastReviewedAt: "2026-08-15",
  nextReviewAt: "2027-02-15",
  readingMinutes: 3,
  primaryKeyword: "terraform vs opentofu decision",
  secondaryKeywords: [
    "opentofu migration",
    "terraform bsl licence enterprise",
    "opentofu vs terraform 2026",
  ],
  tags: ["DevOps", "Infrastructure as code", "Terraform", "OpenTofu"],
  reviewStatus: "research-based",
  relatedSlugs: ["ingress-nginx-archived-migration"],
  methodology:
    "Written from both projects' official documentation and published licence terms. Adoption is described qualitatively rather than with figures, because the available numbers come from vendor and community surveys with incompatible methodologies and no primary source this article could stand behind.",
  body: [
    {
      type: "p",
      text: "In August 2023 HashiCorp relicensed Terraform from the Mozilla Public License 2.0 to the Business Source License 1.1. Within weeks the code was forked, and that fork became OpenTofu, now governed under the Linux Foundation and licensed MPL 2.0. Terraform itself is now under IBM ownership following the acquisition of HashiCorp.",
    },
    {
      type: "p",
      text: "Three years on, the practical situation is unusual: the two tools remain close enough that most teams could switch without rewriting configuration, while the reasons to choose between them have almost nothing to do with the configuration language.",
    },
    { type: "h2", id: "same", text: "What is still the same" },
    {
      type: "ul",
      items: [
        "The configuration language. HCL is shared, and ordinary module code is portable.",
        "The provider protocol. Existing providers work against both.",
        "The state format. OpenTofu reads Terraform state, which is what makes migration a drop-in for most estates rather than a rebuild.",
        "The core workflow. Plan and apply behave as they did; the mental model does not change.",
      ],
    },
    {
      type: "p",
      text: "OpenTofu forked at Terraform 1.6 and has continued its own release line since, currently 1.12. Compatibility has been maintained deliberately rather than accidentally, which is worth noting because it is a policy the project could change and the whole migration argument rests on it.",
    },
    { type: "h2", id: "different", text: "What differs" },
    {
      type: "table",
      caption: "The differences that change a decision",
      head: ["Dimension", "Terraform", "OpenTofu"],
      rows: [
        ["Licence", "Business Source License 1.1", "Mozilla Public License 2.0"],
        ["Governance", "Single vendor, IBM-owned", "Linux Foundation project"],
        ["Registry", "Vendor-operated", "Open registry, MPL"],
        ["State encryption", "Not native to the CLI", "Native state and plan encryption"],
        [
          "Provider iteration",
          "Not supported at provider level",
          "for_each supported on providers",
        ],
        ["Targeted exclusion", "No -exclude flag", "-exclude flag available"],
      ],
    },
    {
      type: "p",
      text: "Two of those are worth more than the rest. Native state encryption removes a recurring problem: state files contain resource attributes that are frequently sensitive, and encrypting them has historically meant relying on backend-level encryption and being careful. Provider-level for_each removes an equally familiar workaround, the copied provider block for each region or account.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The BUSL restriction is narrower than it is often described",
      text: "The Business Source License restricts competing commercial use of the software — offering it as a competing product or service. Ordinary internal use to manage your own infrastructure is not what it targets. Teams sometimes migrate believing their own use is prohibited when it is not, which is a poor reason to change tooling.",
    },
    { type: "h2", id: "deciding", text: "How to decide" },
    {
      type: "p",
      text: "The question that separates them cleanly is whether a single vendor controlling the licence is an acceptable dependency for this part of your estate. Infrastructure as code sits underneath everything else you run; the cost of being forced to move later is high, and the 2023 relicensing demonstrated that the terms can change without warning. The [archiving of the Ingress NGINX controller](/devops/ingress-nginx-archived-migration) is the same lesson arriving from the opposite direction: there, the risk was not a licence change but a maintainer walking away.",
    },
    {
      type: "ul",
      items: [
        "Choose OpenTofu where the open licence and foundation governance are themselves the requirement, where state encryption in the tool is valuable, or where you build products on top of the tooling and BUSL is a genuine constraint.",
        "Choose Terraform where you are already invested in the surrounding commercial platform, where enterprise support with a contractual counterparty matters, or where your organisation's procurement prefers a single accountable vendor.",
        "Stay where you are if neither of the above is true. Migration is usually straightforward, but 'usually straightforward' is not the same as free, and churn without a driver is its own cost.",
      ],
    },
    { type: "h2", id: "migrating", text: "If you do migrate" },
    {
      type: "ol",
      items: [
        "Pick one low-consequence state file and migrate it end to end before planning anything wider. Compatibility claims are cheap; a clean plan against your own state is evidence.",
        "Confirm that every provider you depend on resolves from the registry you will be using, including any private or internal providers.",
        "Run a plan with both tools against the same state and compare. An empty diff from each is the check that matters.",
        "Update the pipeline, the pre-commit hooks and the developer setup documentation in the same change, or you will have both binaries in circulation and inconsistent results between laptops and CI.",
      ],
    },
    {
      type: "p",
      text: "The reversibility is the reassuring part: while state compatibility holds, this is not a one-way door. That is precisely why it should not be treated as an emergency.",
    },
  ],
  faq: [
    {
      question: "Can OpenTofu read existing Terraform state?",
      answer:
        "Yes. State compatibility is maintained deliberately and is the reason migration is usually a drop-in for existing estates. It should still be verified against your own state rather than assumed.",
    },
    {
      question: "Does the Business Source License prohibit internal use of Terraform?",
      answer:
        "No. It restricts competing commercial use — offering the software as a rival product or service. Using it to manage your own infrastructure is not the restricted activity, and this is frequently misread.",
    },
    {
      question: "Will the two diverge to the point where switching stops being possible?",
      answer:
        "It is a reasonable expectation over a long enough period, since the projects now have separate roadmaps and OpenTofu has already added capabilities Terraform does not have. Compatibility today is a policy, not a guarantee.",
    },
  ],
  sources: [
    {
      title: "OpenTofu documentation",
      publisher: "OpenTofu (Linux Foundation)",
      url: "https://opentofu.org/docs/",
    },
    {
      title: "Terraform documentation",
      publisher: "HashiCorp",
      url: "https://developer.hashicorp.com/terraform/docs",
    },
    {
      title: "Business Source License 1.1 FAQ",
      publisher: "HashiCorp",
      url: "https://www.hashicorp.com/license-faq",
    },
  ],
};
