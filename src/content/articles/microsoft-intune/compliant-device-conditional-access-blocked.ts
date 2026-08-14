import type { Article } from "../../types";

export const article: Article = {
  slug: "compliant-device-conditional-access-blocked",
  category: "microsoft-intune",
  subcategory: "Compliance",
  title: "Why a compliant device still fails Conditional Access",
  seoTitle: "Device Compliant But Conditional Access Blocks Access",
  metaDescription:
    "Intune says compliant, Conditional Access says no. The chain between those two states, what to check first, and why the sign-in log is the only real answer.",
  standfirst:
    "Intune and Conditional Access are answering different questions about the same device. A green tick in one is evidence for the other, not an instruction to it.",
  excerpt:
    "The device is enrolled, the compliance report is green, and the user is still blocked. Working through the chain: licensing, device identity, token timing, and the sign-in log detail that settles it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  draft: true,
  readingMinutes: 8,
  primaryKeyword: "device compliant but conditional access blocks",
  secondaryKeywords: [
    "device shows compliant but access denied",
    "conditional access require compliant device not working",
    "intune compliance conditional access troubleshooting",
    "sign-in log conditional access tab",
  ],
  tags: ["Intune", "Entra ID", "Identity", "Troubleshooting", "Security"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Conditional Access troubleshooting, Intune compliance monitoring, grant control and device identity documentation. The Conditional Access requirements list, the documented compliant-but-blocked causes, the compliance Error window and the token issuance behaviour are taken from those sources and cited below. Where the article recommends a diagnostic order rather than describing documented behaviour, it says so. No customer environment is described.",
  body: [
    {
      type: "p",
      text: "This ticket has a particular shape. The user cannot open Outlook on the web. You check Intune: the device is enrolled, it is listed, and the compliance state is Compliant. You check the Conditional Access policy: it requires a compliant device, which this device apparently is. Nothing is misconfigured, and the user is still blocked.",
    },
    {
      type: "p",
      text: "The mistake is treating those two green states as the same fact. Intune's compliance state is an assessment of the device. Conditional Access makes an access decision about a **sign-in**, using a device claim that has to travel from Intune, through Microsoft Entra ID, into a token, and then be presented by whatever the user is using. Several things sit between the assessment and the decision, and any of them can be the reason.",
    },

    {
      type: "h2",
      id: "the-chain",
      text: "The chain between compliant and allowed",
    },
    {
      type: "p",
      text: "Microsoft documents the requirements that must be met for Conditional Access to work with Intune. Read as a chain rather than a checklist, they describe everything that has to be true:",
    },
    {
      type: "ul",
      items: [
        "The device is **enrolled in MDM and managed by Intune**.",
        "**Both the user and the device** are compliant with the assigned compliance policies.",
        "By default, the user has a device compliance policy assigned — with the caveat that this depends on the tenant setting **Mark devices with no compliance policy assigned as**.",
        "Exchange ActiveSync is activated on the device if the user is using the native mail client rather than Outlook. This happens automatically for iOS/iPadOS and Android Knox devices.",
        "For on-premises Exchange, the Intune Exchange Connector is correctly configured.",
      ],
    },
    {
      type: "p",
      text: 'Two things in that list surprise people. The first is that the requirement is on the user *and* the device — a compliant device does not rescue a user who is failing something of their own. The second is the tenant setting, which means the answer to "is a device with no policy compliant?" is a configuration decision rather than a fixed behaviour, and it is set somewhere nobody looks during an incident.',
    },
    {
      type: "p",
      text: "There is a further constraint on the Conditional Access side. The **Require device to be marked as compliant** control only supports Windows 10 and later, iOS, Android, macOS and Linux Ubuntu devices that are registered with Microsoft Entra ID and enrolled with Intune. Devices must be registered in Microsoft Entra ID before they can be marked compliant at all — so a device identity problem presents as a compliance problem.",
    },

    {
      type: "h2",
      id: "check-first",
      text: "What I would check first",
    },
    {
      type: "p",
      text: "This ordering is a recommendation, not documented product guidance, but it front-loads the causes that are both common and instant to rule out.",
    },
    {
      type: "p",
      text: "**Is the user licensed for Intune?** Microsoft lists this first among the documented causes of devices appearing compliant while users are still blocked: ensure the user has an Intune licence assigned for proper compliance evaluation. This is worth checking before anything else because it is a thirty-second check that explains an otherwise impossible-looking state, and because licence assignment is often managed by a different team on a different schedule from device management.",
    },
    {
      type: "p",
      text: "**How recently did the device enrol or change?** Microsoft documents that when a device is first enrolled or updated, it can take some time for compliance information and attributes to be registered — the guidance is literally to wait a few minutes and try again. A device that became compliant ninety seconds ago is not yet a device whose compliance is visible everywhere it needs to be.",
    },
    {
      type: "p",
      text: "**Is the device stuck evaluating?** A device can get stuck in a checking-compliance state, which prevents the user from starting another check-in. The documented remedies are unglamorous and effective: confirm the Company Portal is on the latest version, restart the device, and test on a different network.",
    },
    {
      type: "p",
      text: "**Is the client capable of proving anything?** Desktop applications must use modern authentication, which relies on an authentication prompt presented in a browser or an authentication broker. Microsoft notes that scripts sending passwords directly can only provide proof of a device's identity if they use an authentication broker. A legacy client that cannot participate in the device claim is not going to satisfy a device-based control no matter how compliant the machine is.",
    },
    {
      type: "callout",
      variant: "note",
      title: "A specific Windows browser case",
      text: "Microsoft Edge in InPrivate mode on Windows is documented as being considered a noncompliant device for the purposes of the compliant device control. A user who reproduces the problem in a private window to rule out a caching issue has changed the test rather than isolating the fault — worth knowing before you conclude the block is intermittent.",
    },

    {
      type: "h2",
      id: "sign-in-log",
      text: "The sign-in log is the only place with the actual answer",
    },
    {
      type: "p",
      text: "Everything above is inference. The sign-in log records what actually happened, per policy, for that specific sign-in — and it is where this class of ticket should be settled rather than guessed at.",
    },
    {
      type: "p",
      text: "Open the failed sign-in event and go to the **Conditional Access** tab. It lists each policy that was evaluated, whether it applied, and the result. Alongside it, the **Device info** on the sign-in event shows whether Entra ID considered the device Managed or Compliant at the moment of the sign-in — which is the claim the policy actually evaluated, rather than the state Intune shows you now.",
    },
    {
      type: "p",
      text: "That distinction between now and then does most of the work. Intune's console shows the current assessment. The sign-in log shows what was true when the decision was made. If those disagree, you have a timing problem rather than a configuration problem, and no amount of policy editing will fix it.",
    },
    {
      type: "p",
      text: "One thing to be careful about when reading that tab: a policy showing Failure does not always mean the sign-in was blocked. A sign-in can succeed overall while individual policies report failure — report-only policies always do, and a grant configured with *require one of the selected controls* logs the unmet branch as a failure even though an alternative was satisfied. Read the overall result and the per-policy detail as two different pieces of information.",
    },
    {
      type: "p",
      text: "For a device-specific block, the error codes narrow it further. Microsoft documents `AADSTS53000` as a Conditional Access policy preventing device access, and `AADSTS530003` as device-related — with the suggested checks being whether the device platform is in the supported list, whether the client app type is included, and whether a device filter is excluding it.",
    },

    {
      type: "h2",
      id: "token-timing",
      text: "The state changed, but the session did not",
    },
    {
      type: "p",
      text: "This is the cause that produces the most convincing wrong conclusions, because the fix appears to work by itself later.",
    },
    {
      type: "p",
      text: "Conditional Access policies targeting users through groups or roles are evaluated **when a token is issued**. A user who already holds a valid token is not re-evaluated because their device became compliant, or because you added them to a group, or because you fixed the policy. The change is real and the session predates it.",
    },
    {
      type: "p",
      text: "So a device that has just been remediated may keep failing until the token refreshes, and an engineer who changed three things and then signed out and back in has no idea which of the three worked. When testing anything in this area, force a fresh sign-in deliberately and change one thing at a time.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Compliance Error state has a seven-day fuse",
      text: "If a compliance setting returns **Error** rather than pass or fail, the device's compliance state remains unchanged for up to seven days while evaluation is retried. A device can therefore continue to show and behave as Compliant for a week while a setting is not actually being evaluated — and then go noncompliant with no apparent change. If a population loses access together for no obvious reason, look for settings that have been sitting in Error.",
    },

    {
      type: "h2",
      id: "platform-traps",
      text: "Platform-specific causes worth knowing",
    },
    {
      type: "p",
      text: "Several documented causes are specific to a platform and will never be found by looking at policy configuration.",
    },
    {
      type: "table",
      caption: "Documented platform-specific causes of compliant-but-blocked",
      head: ["Platform", "Cause", "Resolution"],
      rows: [
        [
          "Android, non-Knox",
          "Access is not granted until the user selects the **Get Started Now** link in the quarantine email — even if already enrolled in Intune.",
          "Have the user open the quarantine email and follow the link. If it did not reach the device, it can be forwarded from a PC.",
        ],
        [
          "Android, first access after enabling Conditional Access",
          "An enrolled, compliant device can still be blocked and quarantined on first attempt.",
          "Ensure the Company Portal app is not running, then use the Get Started Now link to trigger evaluation. Normally only needed when Conditional Access is first enabled.",
        ],
        [
          "Android encryption",
          "Some manufacturers encrypt using a default PIN. Intune treats default-PIN encryption as insecure and marks the device noncompliant despite it appearing encrypted.",
          "The user sets a non-default start-up PIN via the Company Portal prompt, then rechecks compliance.",
        ],
        [
          "Android browser access",
          "The user sees **No certificates found** and is not granted access to Microsoft 365.",
          "Enable browser access in Company Portal settings, then sign out of Microsoft 365 in Chrome and restart the browser.",
        ],
        [
          "iOS/iPadOS",
          "An existing manually configured email profile blocks deployment of the Intune-created email profile, making the device noncompliant.",
          "The user removes the pre-existing profile so the Intune profile can deploy. Best prevented by instructing users to remove email profiles before enrolling.",
        ],
      ],
    },
    {
      type: "p",
      text: "The pattern across most of these is the same: the device is fine, but a step requiring user action has not been completed, and nothing in the administrative console indicates that a user action is outstanding. That is worth building into a support script rather than rediscovering per ticket.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Comparing Intune's current state with a past sign-in decision.** The console shows now; the sign-in log shows then. Use the log.",
        "**Skipping the licence check.** An unlicensed user is the first documented cause of compliant-but-blocked, and it takes seconds to rule out.",
        "**Reading a per-policy Failure as the cause of the block.** Report-only policies and unmet branches of an OR grant both log failures on successful sign-ins.",
        "**Testing without forcing a new token.** Policies targeting groups are evaluated at token issuance, so an existing session will not reflect the fix.",
        "**Reproducing the problem in an InPrivate window.** Edge InPrivate on Windows is treated as a noncompliant device.",
        "**Assuming the block is device-related.** The requirement is user and device. A user failing something of their own is blocked on a perfectly compliant machine.",
        "**Not knowing the tenant's setting for devices with no compliance policy.** It determines whether an untargeted device satisfies the control at all.",
        "**Escalating an Android case before checking the quarantine email.** For non-Knox devices, the Get Started Now step is a documented prerequisite.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Work from the sign-in event outwards, not from the policy inwards. One failed sign-in contains the applied policies, the result of each, and the device claim as it was presented. That is a complete account of the decision, and it usually takes less time to read than it takes to check three configuration pages that turn out to be correct.",
    },
    {
      type: "p",
      text: "Then classify what you find into one of three buckets, because they have different owners. **The claim was never made** — licensing, device registration, an incapable client. **The claim was made but stale** — token timing, recent enrolment, a compliance setting sitting in Error. **The claim was made and rejected** — a device filter, an unsupported platform, or a policy that genuinely intends this outcome.",
    },
    {
      type: "p",
      text: "The design lesson underneath all of this is that compliance is an input to an access decision, not the decision itself. Building compliance policies with that in mind — grace periods, notifications, and an understanding of what happens to devices no policy targets — prevents most of these tickets before they exist, which is covered in [Designing Intune compliance policies that do not lock people out](/microsoft-intune/intune-compliance-policy-design). The structure of the policies making the decision is covered in [A Conditional Access framework that survives contact with users](/microsoft-365-entra-id/conditional-access-framework).",
    },
  ],
  faq: [
    {
      question: "Why is my device compliant in Intune but blocked by Conditional Access?",
      answer:
        "Intune's compliance state and the Conditional Access decision are separate. The device claim must reach Entra ID and be present in the token at the moment of sign-in. Common documented causes include the user not having an Intune licence assigned, compliance attributes not yet registered after a recent enrolment, a device stuck in a checking-compliance state, or a client that cannot use modern authentication.",
    },
    {
      question: "Where do I see why Conditional Access blocked a specific sign-in?",
      answer:
        "In the Microsoft Entra sign-in logs. Open the failed sign-in and use the Conditional Access tab, which lists each policy evaluated and its result. The device information on the same event shows whether the device was considered managed or compliant at that moment, which is the claim the policy actually evaluated.",
    },
    {
      question: "Does a compliant device help if the user is failing something?",
      answer:
        "No. Microsoft's documented requirements state that both the user and the device must be compliant with the assigned compliance policies. A fully compliant device does not compensate for a user-level failure or a missing licence.",
    },
    {
      question: "Why did access not restore immediately after fixing compliance?",
      answer:
        "Conditional Access policies targeting users through groups or roles are evaluated when a token is issued. A user holding a valid token is not re-evaluated because the device became compliant. Access typically restores when a new token is issued, which is why forcing a fresh sign-in is essential when testing changes.",
    },
    {
      question: "Can a compliance setting in Error cause a sudden block?",
      answer:
        "Yes, on a delay. When a setting returns Error, the device's compliance state remains unchanged for up to seven days while evaluation retries. The device continues to behave as compliant during that window, then becomes Not compliant if the setting is still in Error — which can look like a large group losing access simultaneously for no apparent reason.",
    },
    {
      question: "Why are Android devices blocked even though they are enrolled and compliant?",
      answer:
        "For non-Knox Android devices, Microsoft documents that access is not granted until the user selects the Get Started Now link in the quarantine email, even if the device is already enrolled. Separately, some devices encrypted with a manufacturer default PIN are treated as unencrypted and marked noncompliant until the user sets a non-default start-up PIN.",
    },
  ],
  sources: [
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
    {
      title: "Conditional Access: Grant",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-grant",
    },
    {
      title: "Monitor results of your Intune device compliance policies",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/device-security/compliance/monitor-policy",
    },
    {
      title: "Build a Conditional Access policy",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-policies",
    },
  ],
};
