import type { Article } from "../../types";

export const article: Article = {
  slug: "intune-compliance-policy-design",
  category: "microsoft-intune",
  subcategory: "Compliance",
  title: "Designing Intune compliance policies that do not lock people out",
  seoTitle: "Intune Compliance Policy Design: Grace Periods and Actions",
  metaDescription:
    "Compliance policies default to blocking immediately. How grace periods, the Error state and noncompliance actions really behave, and how to sequence a rollout.",
  standfirst:
    "Every compliance policy ships with an action that marks devices noncompliant at zero days. Combined with Conditional Access, that is an access control that takes effect the moment you press save.",
  excerpt:
    "Compliance is not a report. It is the input to Conditional Access, and its defaults are strict. What the built-in action does, how the seven-day Error window protects you, and how to roll out a policy without generating an incident.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  draft: true,
  readingMinutes: 9,
  primaryKeyword: "intune compliance policy best practices",
  secondaryKeywords: [
    "mark device noncompliant grace period",
    "intune actions for noncompliance",
    "intune compliance error state",
    "mark devices with no compliance policy assigned as",
  ],
  tags: ["Intune", "Endpoint Management", "Security", "Governance", "Enterprise IT"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Intune device compliance documentation, including the actions for noncompliance reference, compliance policy creation guidance, compliance monitoring documentation and the Conditional Access integration requirements. Default action behaviour, schedule granularity, the Error state window and per-platform action support are taken from those sources and cited below. Where the article recommends a rollout sequence rather than describing documented behaviour, it says so. No customer environment is described.",
  body: [
    {
      type: "p",
      text: "Compliance policy looks like a reporting feature. It has a dashboard, it produces percentages, and nothing in the creation wizard suggests you are configuring an access control. But the moment Conditional Access requires a compliant device, the compliance state becomes the thing standing between a user and their email.",
    },
    {
      type: "p",
      text: "That would be fine if the defaults were cautious. They are not. Microsoft documents that every compliance policy includes **Mark device noncompliant** as a built-in default action, scheduled at zero days, meaning that when Intune detects a device is not compliant it marks it noncompliant immediately. The action cannot be removed. If Conditional Access is enforcing device compliance, access is lost at that moment.",
    },
    {
      type: "p",
      text: "So the honest framing for anyone creating one of these: you are writing a rule that will disconnect people. The design question is not whether it is strict enough, but whether the people it catches have any way to notice and fix the problem before it costs them a working day.",
    },

    {
      type: "h2",
      id: "the-default",
      text: "The built-in action, and the only thing you can change about it",
    },
    {
      type: "p",
      text: "You cannot delete **Mark device noncompliant**. What you can change is its schedule, and doing so is the entire mechanism for a grace period. Set it to two days, and a device that fails evaluation continues to be treated as compliant for two days while the user has a chance to fix it.",
    },
    {
      type: "p",
      text: "The schedule accepts 0 to 365 days. Microsoft's documentation notes that entering **0** means Conditional Access takes effect immediately — a device that becomes noncompliant is blocked from email, SharePoint and other resources straight away.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The grace period is finer-grained than the interface suggests",
      text: "The field is labelled in days, but decimal values in 0.25 increments are accepted: `0.25` is six hours, `0.5` is twelve, `1.5` is thirty-six. Other fractions such as `0.33` cannot be set in the admin center — attempting to save one produces an error — but can be configured through Microsoft Graph. A six-hour grace period is often the right answer where a full day is too generous and immediate is too harsh.",
    },
    {
      type: "p",
      text: "A short grace period does more than soften the user experience. It absorbs the ordinary timing noise of a fleet: a device that has just been rebuilt, a machine that reports a setting before the configuration profile that sets it has arrived, a laptop that woke up long enough to check in and then slept again. None of those are real security failures, and all of them will block a user if the schedule is zero.",
    },

    {
      type: "h2",
      id: "error-state",
      text: "The Error state, and the seven-day window that protects you",
    },
    {
      type: "p",
      text: "This is the most useful piece of documented behaviour in the whole feature, and it is buried in the monitoring documentation rather than anywhere near the policy editor.",
    },
    {
      type: "p",
      text: "When a setting in a compliance policy returns **Error** — meaning evaluation could not complete, rather than completing with a failure — the device's compliance state **remains unchanged for up to seven days**. The existing status continues to apply while Intune tries to get a real answer. Only if the setting is still in Error after seven days does the device become Not compliant, or move into grace period if one is configured.",
    },
    {
      type: "p",
      text: "This matters because it draws a clear line between two things administrators routinely conflate:",
    },
    {
      type: "table",
      caption: "How each compliance result affects access",
      head: ["Result", "Meaning", "Effect on the device's access"],
      rows: [
        ["Compliant", "Evaluation completed and the setting passed.", "Access continues."],
        [
          "Not compliant",
          "Evaluation completed and the setting failed.",
          "Marked noncompliant on the configured schedule. Access is lost once that fires.",
        ],
        [
          "Error",
          "Evaluation could not complete.",
          "Existing state persists for up to seven days. Only then does it become Not compliant, or In grace period if one is set.",
        ],
        [
          "In grace period",
          "Failed, but inside the configured window.",
          "Access continues until the window expires.",
        ],
      ],
    },
    {
      type: "p",
      text: "The operational implication is that a wave of Error results is not an emergency on the day it appears, but it has a deadline. A setting that has been in Error across a population for five days is five days into a seven-day fuse, and when it burns out those devices go noncompliant together. That is worth a monitoring alert rather than a weekly report.",
    },
    {
      type: "p",
      text: "It also means a policy that is broken in a way that produces Error rather than failure will not tell you loudly. It will look like nothing is happening, right up until it looks like everything happened at once.",
    },

    {
      type: "h2",
      id: "actions",
      text: "Actions beyond marking, and the email that quietly does not arrive",
    },
    {
      type: "p",
      text: "Additional actions let you do something other than silently flipping a state. You can add several, each with its own schedule, and the same action can be added more than once — so a policy can email at day two, email again at day five, and block at day seven.",
    },
    {
      type: "p",
      text: "That escalation pattern is the single most valuable thing this feature offers, and it is the difference between a control users experience as reasonable and one they experience as arbitrary. But the email action has documented behaviour that undermines it if you do not know about it.",
    },
    {
      type: "ul",
      items: [
        "Intune uses the email address **in the user's profile**, not their user principal name. If there is no email address on file, no notification is sent — silently.",
        "Notifications come from `microsoft-noreply@microsoft.com`. A mail flow rule or anti-spam policy that filters that sender means your users never see the warning.",
        "Emails are expected to be sent **within six hours** of a device being marked noncompliant. If your grace period is six hours and your first email fires at the same point, the user may be blocked before the warning arrives.",
      ],
    },
    {
      type: "p",
      text: "That third point is a design trap worth avoiding deliberately: schedule the notification meaningfully earlier than the block, not at the same moment. A warning that arrives simultaneously with the loss of access is not a warning.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Not every action works on every platform",
      text: "Remote lock is supported on Android device administrator, Android AOSP, the Android Enterprise variants, iOS/iPadOS and macOS — it is not a Windows action. Building an escalation path that assumes remote lock will apply across a mixed estate produces a policy that behaves differently by platform for reasons nothing in the interface explains. Microsoft also documents that devices managed by third-party compliance partners and targeted with device groups cannot currently receive compliance actions at all.",
    },

    {
      type: "h2",
      id: "unassigned",
      text: "The tenant setting that decides everyone you did not target",
    },
    {
      type: "p",
      text: "There is a setting under compliance policy settings called **Mark devices with no compliance policy assigned as**, and it decides the fate of every device that no policy targets. Microsoft's Conditional Access requirements documentation lists it explicitly: by default, the user must be assigned a device compliance policy, and this behaviour depends on how that setting is configured.",
    },
    {
      type: "p",
      text: "Set to compliant, a device with no policy sails through a Conditional Access rule requiring compliance — which means a gap in your assignment coverage is a silent hole in the control. Set to not compliant, the control is honest, but every device you have not yet covered is blocked, including ones enrolled by teams you did not know about.",
    },
    {
      type: "p",
      text: "Both positions are defensible. What is not defensible is not knowing which one your tenant is in, because it determines whether your compliance coverage gaps are a security problem or an availability problem. Check it before you write policies, not after.",
    },

    {
      type: "h2",
      id: "rollout",
      text: "A rollout sequence that does not generate an incident",
    },
    {
      type: "p",
      text: "The following is a recommendation rather than documented guidance, but every element of it uses documented behaviour.",
    },
    {
      type: "ol",
      items: [
        "**Establish what the tenant does with unassigned devices** before creating anything. This one setting changes the meaning of everything that follows.",
        "**Create the policy with a long grace period** — several days — and assign it to a pilot group. At this stage you are measuring, not enforcing. The compliance reports show you who would fail without anyone losing access.",
        "**Read the per-setting report, not just the overall number.** Microsoft's documentation makes a specific point about this: the device compliance column in a per-setting drill-in shows the device's *overall* status, not its status against that policy or setting. A device can appear there marked Not compliant while being perfectly compliant with the policy you are looking at, because it is failing something else entirely.",
        "**Separate the settings that will fail from the settings that are wrong.** Some failures are genuine security gaps to remediate. Others are settings that cannot be met on part of the estate, which is a policy design problem rather than a fleet problem.",
        "**Add notification actions before shortening the grace period.** Users need to be told before the deadline moves.",
        "**Shorten the grace period in stages**, not from seven days to zero. The 0.25 increments exist for exactly this.",
        "**Expand scope last**, keeping the pilot group as the first ring for future changes.",
      ],
    },
    {
      type: "p",
      text: "One thing not to do: build the enforcement in Conditional Access first and the compliance policy afterwards. A Conditional Access policy requiring a compliant device, applied to all users before compliance policies are assigned, is one of the configurations Microsoft explicitly warns against — for users who have not enrolled devices, it blocks all access including the Intune portal itself, which is where you would go to fix it.",
    },

    {
      type: "h2",
      id: "settings-choice",
      text: "Choosing what to actually evaluate",
    },
    {
      type: "p",
      text: "A brief but load-bearing point about content rather than mechanics. Compliance settings take precedence over configuration settings where both address the same thing, so a value placed in a compliance policy silently overrides your configuration profiles — behaviour worked through in [Intune policy conflicts](/microsoft-intune/intune-policy-conflicts).",
    },
    {
      type: "p",
      text: "The distinction I would hold to: compliance policy should **evaluate** state, configuration policy should **set** it. A compliance policy that requires disk encryption is asking a question. A configuration profile that enables BitLocker is doing the work. Putting the enforcement value in the compliance policy produces a control that both sets and grades the same thing, and the failure mode is a device that is noncompliant for a setting your configuration profile was never allowed to apply.",
    },
    {
      type: "p",
      text: "Also worth knowing if you use the Locations condition: when at least one location is added to a compliance policy, a device that is not connected to any of the selected locations is considered not compliant. For a mobile workforce that is a strong control with obvious consequences, and Microsoft's own example pairs it with a grace period for exactly that reason.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Leaving the default schedule at zero during rollout.** The device is marked noncompliant immediately and Conditional Access acts on it immediately.",
        "**Not knowing what the tenant does with unassigned devices.** It decides whether coverage gaps are silent holes or mass blocks.",
        "**Scheduling the warning email at the same point as the block.** Emails are expected within six hours of marking, which can be after the user has already lost access.",
        "**Assuming users will receive the email at all.** It goes to the profile email address, not the UPN, and comes from a sender your mail filtering may not expect.",
        "**Treating Error like a failure.** It suspends the existing state for up to seven days — useful breathing room, but with a deadline that arrives for everyone at once.",
        "**Reading the overall compliance column as per-policy status.** A device shown as Not compliant in a per-setting view may be failing a completely different policy.",
        "**Putting enforcement values in compliance policy.** Compliance beats configuration, so the value silently overrides your profiles.",
        "**Assuming remote lock works everywhere.** It is not available for Windows.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Design the policy backwards from the user experience of failing it. Decide how someone finds out, how long they have, and what they are supposed to do about it — then configure the schedule and actions to match. A grace period long enough to survive a weekend, a notification that lands well before the deadline, and a self-service remediation path turn compliance from a trapdoor into a control people can work with.",
    },
    {
      type: "p",
      text: "Keep compliance policies evaluative and few. Every additional policy targeting the same devices is another way for a device to be noncompliant for a reason that is hard to trace, because the reports show overall state far more readily than they show which policy caused it.",
    },
    {
      type: "p",
      text: "And accept that some devices will be compliant and still blocked. Compliance state is only one input to the access decision, and the gap between a green tick in Intune and a working sign-in is where most of the support burden actually lives — covered in [Why a compliant device still fails Conditional Access](/microsoft-intune/compliant-device-conditional-access-blocked).",
    },
  ],
  faq: [
    {
      question: "Can I remove the Mark device noncompliant action?",
      answer:
        "No. Microsoft documents it as a built-in default action included in every compliance policy, and it cannot be removed. What you can change is its schedule. Changing it from the default of zero days creates a grace period during which a failing device is not yet marked noncompliant.",
    },
    {
      question: "How do I set a grace period shorter than one day?",
      answer:
        "The schedule field accepts decimal values in 0.25 increments, so 0.25 is six hours and 0.5 is twelve. Other fractions such as 0.33 cannot be saved in the admin center and must be configured through Microsoft Graph if you need them.",
    },
    {
      question: "What happens when a compliance setting reports Error?",
      answer:
        "The device's compliance state remains unchanged for up to seven days while evaluation is retried, so the existing status continues to apply. If the setting is still in Error after seven days, the device becomes Not compliant — or moves into grace period if the policy has one configured.",
    },
    {
      question: "Why did users not receive the noncompliance email?",
      answer:
        "Intune sends to the email address in the user's profile rather than their user principal name, and sends nothing if no address is on file. Messages come from microsoft-noreply@microsoft.com, so mail flow or anti-spam rules can suppress them. Delivery is expected within six hours of the device being marked noncompliant, which can be later than a short grace period.",
    },
    {
      question: "What happens to devices with no compliance policy assigned?",
      answer:
        "That is controlled by the tenant setting Mark devices with no compliance policy assigned as, under compliance policy settings. It determines whether an untargeted device is treated as compliant — creating a silent gap in any Conditional Access rule requiring compliance — or not compliant, which blocks every device you have not yet covered.",
    },
    {
      question: "Should enforcement settings go in compliance policy or configuration policy?",
      answer:
        "Configuration policy should set state and compliance policy should evaluate it. Compliance settings take precedence over configuration settings addressing the same thing, so an enforcement value placed in a compliance policy silently overrides configuration profiles and can produce devices marked noncompliant for a setting your profile was never allowed to apply.",
    },
  ],
  sources: [
    {
      title: "Configure actions for noncompliant devices in Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/configure-noncompliance-actions",
    },
    {
      title: "Create a compliance policy in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/create-policy",
    },
    {
      title: "Monitor results of your Intune device compliance policies",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/monitor-policy",
    },
    {
      title: "Troubleshoot Conditional Access",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/device-protection/troubleshoot-conditional-access",
    },
    {
      title: "Troubleshoot sign-in problems with Conditional Access",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/troubleshoot-conditional-access",
    },
  ],
};
