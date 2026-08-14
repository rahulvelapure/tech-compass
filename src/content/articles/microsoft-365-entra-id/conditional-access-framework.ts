import type { Article } from "../../types";

export const article: Article = {
  slug: "conditional-access-framework",
  category: "microsoft-365-entra-id",
  contentType: "decision-framework",
  subcategory: "Conditional Access",
  title: "A Conditional Access framework that survives contact with users",
  seoTitle: "Conditional Access Framework: Policies That Stay Maintainable",
  metaDescription:
    "How to structure Conditional Access so it stays maintainable: personas, naming, exclusion hygiene, the 240-policy limit and a repeatable change process.",
  standfirst:
    "Most Conditional Access problems are not policy problems. They are structure problems that only become visible once there are thirty policies and nobody can say what applies to whom.",
  excerpt:
    "A persona-based structure for Conditional Access that keeps the policy count low, makes exclusions auditable, and stays readable after two years of change — built around how the platform actually evaluates policy.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 14,
  primaryKeyword: "conditional access framework",
  secondaryKeywords: [
    "Entra ID conditional access",
    "conditional access policy design",
    "conditional access naming convention",
    "conditional access report-only mode",
    "conditional access policy limit",
  ],
  tags: ["Entra ID", "Identity", "Zero Trust", "Governance", "Microsoft 365"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Conditional Access, Entra ID and Microsoft Graph documentation. Evaluation behaviour, service limits, exclusion semantics, report-only results and service dependencies are taken from those sources and cited below. Where the article recommends a structure rather than describing documented behaviour, it says so explicitly. No tenant configuration from any organisation is described.",
  featured: true,
  body: [
    {
      type: "p",
      text: "Conditional Access degrades in a predictable way. It starts as six clear policies. Someone adds an exception for a service account, then a temporary policy for a project, then a second temporary policy because the first one could not be safely modified. Two years later nobody can answer the only question that matters: **if I sign in as this person, from this device, to this application, what applies?**",
    },
    {
      type: "p",
      text: "That question has a precise answer, and the platform will give it to you. The problem is that a tenant with forty overlapping policies makes the answer expensive to obtain, and expensive answers do not get looked up before a change. The fix is structural — decide the axes before writing policies, and never let a policy exist outside that structure.",
    },
    {
      type: "p",
      text: "This article is about the structure rather than the individual policies. Microsoft publishes a good set of [common policy templates](https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-policy-common) and a phased deployment plan; what those do not tell you is how to arrange the result so it is still legible in two years.",
    },

    {
      type: "h2",
      id: "evaluation-model",
      text: "Design against how evaluation actually works",
    },
    {
      type: "p",
      text: "A Conditional Access policy is an if-then statement of **assignments** and **access controls**. To be enforced it needs at minimum a name, the users or groups it applies to, the target resources, and a grant or block control. Everything else — network, device platform, client app, risk, device filters — narrows the *if*.",
    },
    {
      type: "p",
      text: "Four documented behaviours constrain any framework you build on top of that, and each one has a structural consequence.",
    },
    {
      type: "table",
      caption: "Documented evaluation behaviour, and what it forces on your design",
      head: ["Behaviour", "Consequence for structure"],
      rows: [
        [
          "All applicable policies must be satisfied. Assignments within a policy are combined with **AND**.",
          "Policies compose but never cancel. You cannot write a policy that relaxes another one — only one that does not apply. Overlap is additive, so a small policy set is not a stylistic preference.",
        ],
        [
          "Evaluation runs in two phases: session details are collected, then requirements are enforced. **A block control stops enforcement immediately.**",
          "Block is the only control with priority. Every other requirement is cumulative, which is why a block policy scoped slightly too wide is the most damaging mistake available.",
        ],
        [
          "**Access tokens are issued by default if no policy condition triggers an access control.**",
          "Conditional Access is allow-by-default. An application no policy covers is an application with no controls, so coverage has to be designed deliberately rather than assumed.",
        ],
        [
          "Policies targeting roles or groups are evaluated **only when a token is issued**.",
          "Group membership is not retroactive. Adding someone to a policy's group, or to an exclusion group, does nothing until they get a new token.",
        ],
      ],
    },
    {
      type: "p",
      text: "The third row is the one that catches people, and Microsoft's own documentation works through the example. Consider a policy that targets the finance group accessing the payroll app and requires multifactor authentication. A user in finance is challenged. A user *outside* finance is issued an access token and reaches the payroll app with no challenge at all — because no condition matched, so no control fired. Restricting everyone else requires a second, separate policy that blocks all users except the finance group for that app.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Grant policies do not restrict, they qualify",
      text: "A policy that requires MFA for a group says what that group must do. It says nothing about anyone else. Any resource that should be limited to a population needs an explicit block policy for everybody outside it, which is why Microsoft's guidance is to ensure **every app has at least one Conditional Access policy applied** — most simply by targeting all resources rather than naming applications individually.",
    },

    {
      type: "h2",
      id: "the-grid",
      text: "Decide the grid before you write policies",
    },
    {
      type: "p",
      text: "Applications multiply; populations do not. The structure that stays readable is a grid: a small set of personas down one axis, a small set of policy purposes across the other. This is a recommendation rather than documented product behaviour, but it follows directly from the evaluation rules above — if policies only ever compose, the only way to keep the combination predictable is to keep the number of things being combined small and named.",
    },
    {
      type: "p",
      text: "A workable persona set is usually internal users, administrators, guests and external identities, workload identities and service principals, and — where it exists as a distinct population — unmanaged or bring-your-own devices. Each persona gets its own row, and each policy names its persona.",
    },
    {
      type: "diagram",
      title: "The policy grid",
      ascii: `                 BASELINE     DEVICE       RISK        NETWORK    EXCEPTION
                 (identity)   (trust)      (response)  (location)  (time-bound)
              +------------+------------+------------+-----------+------------+
 Internals    |  CA101     |  CA102     |  CA103     |  CA104    |  CA1xx     |
              +------------+------------+------------+-----------+------------+
 Admins       |  CA201     |  CA202     |  CA203     |  CA204    |  CA2xx     |
              +------------+------------+------------+-----------+------------+
 Guests       |  CA301     |     -      |  CA303     |  CA304    |  CA3xx     |
              +------------+------------+------------+-----------+------------+
 Workload IDs |  CA401     |     -      |  CA403     |  CA404    |  CA4xx     |
              +------------+------------+------------+-----------+------------+

 Every policy occupies exactly one cell. A change that does not fit a cell
 is a change to the framework, not a new policy.`,
      caption:
        "Numbering by persona band means the policy list sorts into its own structure, and a gap is visible as a gap.",
    },
    {
      type: "p",
      text: "The value is in the constraint, not in these particular columns. When a request arrives that does not fit a cell — a contractor population that is neither internal nor guest, a supplier portal that needs its own device rules — the framework forces an explicit decision about whether to add a persona or absorb the case into an existing one. Without the grid, that decision is made implicitly by adding policy number thirty-one.",
    },
    {
      type: "table",
      caption: "What each column is for",
      head: ["Slot", "Purpose", "Typical control"],
      rows: [
        [
          "Baseline",
          "Identity assurance for the persona across all resources",
          "Require MFA, or a named authentication strength",
        ],
        [
          "Device trust",
          "Access only from managed endpoints",
          "Require compliant device, or Entra hybrid joined device",
        ],
        [
          "Risk",
          "Response to sign-in or user risk (requires Entra ID P2)",
          "Block, or require secure password change",
        ],
        [
          "Network",
          "Countries and regions you never expect a sign-in from",
          "Block, with an allowed-locations exclusion",
        ],
        [
          "Exception",
          "Documented, owned, time-bound deviations",
          "Varies — but always with a review date",
        ],
      ],
    },
    {
      type: "p",
      text: "For the network row, Microsoft's suggested shape is worth copying: rather than enumerating blocked countries, create a [named location](https://learn.microsoft.com/entra/identity/conditional-access/concept-assignment-network) listing the countries you *do* expect sign-ins from, then write one block policy that excludes it. The list of places you operate is short and changes rarely; the list of places you do not is neither.",
    },

    {
      type: "h2",
      id: "naming",
      text: "Name policies so the list is the documentation",
    },
    {
      type: "p",
      text: "Conditional Access policies have no owner attribute. There is no field recording who created a policy, why, or who should be consulted before it changes — so whatever the name does not carry is lost. Microsoft's recommendation is to encode ownership in the name, typically as a team prefix, and to maintain an out-of-band registry mapping each policy to a responsible admin or team.",
    },
    {
      type: "p",
      text: "The documented naming standard covers five elements: a sequence number, the resources it applies to, the response, who it applies to, and when it applies. A sequence number matters more than it looks — it gives the policy a short name people can say out loud, so an incident call can be about `CA204` rather than about a description everyone paraphrases differently.",
    },
    {
      type: "code",
      language: "text",
      filename: "A naming pattern that carries the grid",
      code: `CA<band><n>-<Persona>-<Purpose>-<Resources>-<Control>

CA101-Internals-Baseline-AllResources-RequireMFA
CA202-Admins-DeviceTrust-AllResources-RequireCompliantDevice
CA304-Guests-Network-AllResources-BlockOutsideAllowedCountries

EM01 - ENABLE IN EMERGENCY: MFA Disruption [1/4] - Exchange
       SharePoint: Require Entra hybrid join for VIP users`,
    },
    {
      type: "p",
      text: "That last entry is a category people forget until they need it. Alongside the active set, Microsoft recommends maintaining **disabled** contingency policies that act as secondary access controls during a disruption — an MFA provider outage, for instance, where the normal control cannot be satisfied by anyone. The naming standard for those is deliberately shouty: `ENABLE IN EMERGENCY` at the front so it stands out in the list, the disruption it applies to, and an ordering number so whoever is on call knows which to turn on first. These count towards your policy total whether or not they are enabled, which is the subject of the next section.",
    },

    {
      type: "h2",
      id: "limits",
      text: "The limits that shape the design",
    },
    {
      type: "p",
      text: "Conditional Access has a hard ceiling of **240 policies per tenant**, and that count includes every policy in any state — on, off, and report-only. Contingency policies count. Report-only copies you made to test a change count. Policies someone disabled in 2024 rather than deleting count.",
    },
    {
      type: "p",
      text: "There is a second limit inside each policy. A policy applies to a maximum of 250 applications, and because a policy is stored as a JSON document with a size limit, a long list of individually named users or application GUIDs can hit that ceiling independently. Microsoft's documented remedies are the same two moves in both cases: target groups or directory roles instead of listing users, and use a [filter for applications](https://learn.microsoft.com/entra/identity/conditional-access/concept-filter-for-applications) — matching on application attributes — instead of naming applications one at a time.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Block plus all resources can lock you out of the fix",
      text: "Microsoft's guidance is explicit that combining **block** with **all resources** in a single policy risks locking out administrators, and that exclusions cannot be configured for some important endpoints — Microsoft Graph among them. A block policy scoped that broadly can therefore remove the route you would use to correct it. This is the single configuration that most justifies report-only mode and an emergency access account.",
    },
    {
      type: "p",
      text: "The practical reading of the 240-policy limit is that scaling means consolidating, not adding. If your policy count is growing faster than your persona count, the structure has stopped doing its job — and the usual cause is that conditions which belong in a group or an application filter are being expressed as new policies instead.",
    },

    {
      type: "h2",
      id: "exclusions",
      text: "Exclusions are the part that rots",
    },
    {
      type: "p",
      text: "Every exclusion is a hole with a name attached, and the semantics make them absolute: **when a user is both included and excluded, they are excluded**. The exclude action overrides the include action, with no further evaluation. That is exactly what you want for emergency access and exactly what makes a stale exclusion dangerous.",
    },
    {
      type: "ul",
      items: [
        "**Put exclusions in dedicated groups, not in the policy body.** A group has membership you can report on, an owner you can name, and an access review you can attach. A user picked directly into a policy has none of those.",
        "**Give every exclusion group a review date and an owner.** An exclusion nobody has to renew becomes permanent by default. This is a process recommendation, not a product feature — nothing in Conditional Access will expire it for you.",
        "**Remember that membership changes are not retroactive.** Because policies targeting groups and roles are evaluated at token issuance, adding a user to an exclusion group does not help them until they get a new token, and removing them does not stop their current session. Microsoft's recommended pattern for the privileged case is to trigger evaluation on role activation through Privileged Identity Management.",
        "**Test the exclusions, not just the inclusions.** Microsoft's deployment guidance calls this out specifically: an excluded user may still be prompted for MFA because a *different* policy requires it. Verifying that an exclusion works means signing in as someone in it, not reading the policy.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Emergency access accounts are excluded from everything",
      text: "Maintain emergency access accounts excluded from every Conditional Access policy — including [Microsoft-managed policies](https://learn.microsoft.com/entra/identity/conditional-access/managed-policies), which appear in the same list with **Microsoft** in the Created by column and allow their state and exclusions to be edited. A tenant-wide policy mistake with no excluded account is an outage you cannot fix from inside. Configuring those accounts correctly is a subject in its own right, and one where the details matter more than the principle.",
    },
    {
      type: "p",
      text: "Service accounts need a different treatment rather than an exclusion. Conditional Access policies scoped to users do not block calls made by service principals at all, so an exclusion for one is usually a no-op protecting nothing. The documented approach is to target workload identities with their own policies, and — where the account exists only because a script needs to authenticate — to replace it with a [managed identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview).",
    },

    {
      type: "h2",
      id: "service-dependencies",
      text: "Service dependencies, or why a policy applies to an app you did not target",
    },
    {
      type: "p",
      text: "A framework built on named applications leaks, because applications call each other. Microsoft Teams uses SharePoint Online and Exchange Online; a policy on SharePoint therefore applies to a user who never opened SharePoint. Microsoft documents this as service dependencies, with two enforcement timings.",
    },
    {
      type: "table",
      caption: "Enforcement timing for a dependent service",
      head: ["Timing", "When the control fires", "Documented examples"],
      rows: [
        [
          "Early-bound",
          "Before the user can sign in to the calling app — the dependent service's policy must be met first",
          "Teams to Exchange and SharePoint; Azure portal to Exchange, SharePoint and Windows 365; Power Automate to Power Apps",
        ],
        [
          "Late-bound",
          "After sign-in, deferred until the calling app requests a token for the downstream service",
          "Teams to Planner, Stream and Whiteboard; Office.com to SharePoint",
        ],
      ],
    },
    {
      type: "p",
      text: "The design consequence is to set common policies across related services rather than per-application ones. For the Microsoft 365 stack specifically, Microsoft's documented shortcut is to target the **Office 365** application group instead of naming Exchange, SharePoint and Teams separately — which avoids the dependency problem and the inconsistent prompting that comes with it. It also collapses three policies into one, which the 240 ceiling will eventually thank you for.",
    },

    {
      type: "h2",
      id: "change-process",
      text: "Change policies the same way every time",
    },
    {
      type: "p",
      text: "The framework is only worth having if changes to it are boring. The following sequence is a recommendation, but every tool in it is a documented feature:",
    },
    {
      type: "ol",
      items: [
        "**Create or copy the policy in report-only mode.** Report-only policies are evaluated but not enforced, and — importantly for testing a modification — you can run a report-only copy of a policy alongside the enforced original and compare the two before switching.",
        "**Leave it there long enough to cover a full working week**, including whatever happens at month-end. Microsoft's phased deployment guidance suggests at least one week per policy before enforcement.",
        "**Read the results, not the summary.** Each sign-in event has **Conditional Access** and **Report-only** tabs listing every policy that was enabled, in report-only, applied or not applied, with the reason.",
        "**Enable for a pilot group** that includes at least one person from each affected function, then expand to the full persona — keeping the pilot group as the first ring for future changes.",
      ],
    },
    {
      type: "p",
      text: "Report-only mode has two documented limitations worth knowing before you rely on it. Policies scoped to **User Actions** cannot be evaluated in report-only mode at all. And a report-only policy that requires a compliant device can prompt users on macOS, iOS and Android to select a device certificate — repeatedly, until the device is compliant — despite enforcing nothing. Microsoft's own remedy is to exclude those device platforms from report-only device-compliance policies, which means the report you get is not the report you wanted for exactly the platforms where device compliance is most likely to fail.",
    },
    {
      type: "table",
      caption: "Report-only results and what each one is telling you",
      head: ["Result", "Meaning"],
      rows: [
        [
          "Report-only: Success",
          "Conditions matched and the non-interactive controls were already satisfied — an MFA claim was present in the token, or the device check passed.",
        ],
        [
          "Report-only: Failure",
          "Conditions matched, controls were not satisfied. This is the row to read carefully: a block policy applying, or a device failing compliance.",
        ],
        [
          "Report-only: User action required",
          "Conditions matched and the user would have been prompted. In report-only they are not, so this is a count of interruptions you are about to introduce.",
        ],
        [
          "Report-only: Not applied",
          "Conditions did not all match — the user was excluded, or a location condition did not fire.",
        ],
      ],
    },
    {
      type: "p",
      text: "For aggregate rather than per-sign-in impact, the **policy impact** view shows a snapshot over the past 24 hours, 7 days or one month and is available to the Security Reader role. The [Conditional Access Insights and Reporting workbook](https://learn.microsoft.com/entra/identity/conditional-access/howto-conditional-access-insights-reporting) shows the combined effect of several policies at once, which is the number you actually care about — but it requires Entra ID P1 and a Log Analytics workspace already receiving sign-in logs, so it is worth setting up before you need it rather than during an incident.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "What If answers a narrower question than it appears to",
      text: "The What If tool simulates policy evaluation for a specific user and set of conditions, and it is the fastest way to answer *which policies apply here*. Two documented limits: it does not test service dependencies — a Teams simulation will not surface the Exchange Online policy that Teams depends on — and the current evaluation API only evaluates conditions whose sign-in parameters you supplied, so an unspecified condition means the policy is reported as not applying. Give it every parameter, and treat it as a design aid rather than a substitute for a test sign-in.",
    },
    {
      type: "p",
      text: "Two further controls belong in the change process rather than the policy set. [Protected actions](https://learn.microsoft.com/entra/identity/role-based-access-control/protected-actions-add) require a fresh multifactor authentication before anyone creates, modifies or deletes a Conditional Access policy — the framework protecting itself. And for teams already comfortable with the pattern, the Microsoft Graph `conditionalAccessPolicy` API and Graph PowerShell allow policies to be managed as code, with the review, versioning and revert behaviour that source control brings. If you do neither, at least know that a deleted policy or named location can be restored within a 30-day soft-delete window.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Assuming a grant policy restricts anyone.** It only qualifies the population it targets. Everyone else gets a token by default, so limiting access to a resource always takes a second, explicit block policy.",
        "**One policy per application.** It does not scale, it burns the 240-policy budget, and it walks straight into service dependencies. Group applications by shared requirement instead.",
        "**Excluding users directly in the policy body.** There is no report, no owner and no review. Use a group, even for one person.",
        "**Treating an exclusion group change as immediate.** Policies targeting groups and roles are evaluated at token issuance, so nothing changes until a new token is issued.",
        "**Disabling policies instead of deleting them.** Disabled policies still count towards the tenant limit. Delete what is dead — there is a 30-day soft-delete window if you are wrong.",
        "**Relying on report-only mode for device compliance on mobile.** The documented workaround excludes exactly the platforms you most wanted to measure.",
        "**Excluding a service account from a user-scoped policy.** Calls made by service principals are not blocked by user-scoped policies to begin with. Target workload identities, or replace the account with a managed identity.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Start from coverage rather than from controls. Establish that every resource is reached by at least one policy, because anything uncovered is uncontrolled by default — then decide your personas, fix the columns, and require that every future policy occupies exactly one cell in the grid. A request that does not fit is a framework decision, and treating it as one is the entire discipline.",
    },
    {
      type: "p",
      text: "Then make the two things that rot into maintained objects rather than accidents: exclusions live in owned groups with review dates, and changes go through report-only, a pilot ring and the sign-in logs every time without exception. Neither is enforced by the product. Both are the difference between a policy set you can reason about and one you can only add to.",
    },
    {
      type: "p",
      text: "The same instinct applies one layer down, at the endpoint, where competing device policies produce a structurally identical problem — two sources of authority over one outcome and no automatic tie-break. That case is worked through in [Intune policy conflicts: how to detect, diagnose and prevent them](/microsoft-intune/intune-policy-conflicts), and the migration equivalent in [Group Policy to the settings catalog](/microsoft-intune/group-policy-to-settings-catalog-migration). How claims on this site are labelled and researched is set out in [about this publication](/about).",
    },
  ],
  faq: [
    {
      question: "How many Conditional Access policies can a tenant have?",
      answer:
        "Microsoft documents a hard limit of 240 policies per tenant, counting policies in every state — enabled, disabled and report-only. Because disabled and report-only policies count, tenants reach the limit sooner than expected. Scaling past it means consolidating policies using groups, directory roles and application filters rather than creating more.",
    },
    {
      question: "Which Conditional Access policy wins when several apply?",
      answer:
        "None of them win — all applicable policies must be satisfied. Assignments are combined with AND, so requirements accumulate: if one policy requires MFA and another requires a compliant device, the user needs both. The one exception is block, which is evaluated in the enforcement phase and stops evaluation immediately.",
    },
    {
      question: "Does a policy requiring MFA for one group stop everyone else?",
      answer:
        "No. Access tokens are issued by default when no policy condition triggers an access control, so a user outside the targeted group is granted access with no challenge. Restricting a resource to a population requires a separate policy that blocks all users except that population.",
    },
    {
      question: "Why did adding a user to an exclusion group not take effect?",
      answer:
        "Policies targeting roles or groups are evaluated only when a token is issued. A user who already holds a valid token is unaffected by the membership change until they get a new one, and the policy does not apply retroactively. For privileged access, Microsoft recommends triggering Conditional Access evaluation on role activation through Privileged Identity Management.",
    },
    {
      question: "Is report-only mode a safe way to test any policy?",
      answer:
        "Almost any. Policies scoped to User Actions cannot be evaluated in report-only mode. Separately, report-only policies that require a compliant device can repeatedly prompt macOS, iOS and Android users to select a device certificate even though nothing is enforced; Microsoft's documented workaround is to exclude those platforms from such report-only policies.",
    },
    {
      question: "Should a Conditional Access policy target applications or all resources?",
      answer:
        "Generally all resources. Microsoft's guidance is that every app should have at least one policy applied, and targeting all resources means new applications are covered on the day they are onboarded rather than when someone remembers. Targeting individual applications also runs into service dependencies — a policy on Teams does not cover the Exchange Online and SharePoint Online calls Teams makes on the user's behalf.",
    },
    {
      question: "What does the What If tool not account for?",
      answer:
        "It does not test Conditional Access service dependencies, so simulating a sign-in to Microsoft Teams will not reflect policies applying to Exchange Online. The current What If evaluation API also only evaluates conditions for which you supplied sign-in parameters, so omitting a parameter causes policies using that condition to be reported as not applying.",
    },
  ],
  sources: [
    {
      title: "Plan a Conditional Access deployment",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/plan-conditional-access",
    },
    {
      title: "Build a Conditional Access policy",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-policies",
    },
    {
      title: "Conditional Access: Users, groups, agents, and workload identities",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-users-groups",
    },
    {
      title: "Analyze Conditional Access policy impact (report-only mode)",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-report-only",
    },
    {
      title: "Service dependencies in Microsoft Entra Conditional Access",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/service-dependencies",
    },
    {
      title: "Troubleshoot Conditional Access policies with the What If tool",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/what-if-tool",
    },
    {
      title: "Conditional Access: Grant",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-grant",
    },
    {
      title: "Microsoft-managed Conditional Access policies",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/managed-policies",
    },
    {
      title: "Manage emergency access accounts in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access",
    },
    {
      title: "Create a resilient access control management strategy with Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/authentication/concept-resilient-controls",
    },
  ],
};
