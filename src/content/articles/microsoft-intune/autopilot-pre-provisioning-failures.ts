import type { Article } from "../../types";

export const article: Article = {
  slug: "autopilot-pre-provisioning-failures",
  category: "microsoft-intune",
  subcategory: "Autopilot",
  title: "Autopilot pre-provisioning failures: TPM attestation, reseal and the technician flow",
  seoTitle: "Autopilot Pre-Provisioning Failures: TPM and Reseal",
  metaDescription:
    "Why Autopilot pre-provisioning fails at Securing your hardware, what each TPM attestation error code means, and why reseal can ship an incomplete device.",
  standfirst:
    "Pre-provisioning fails differently from the rest of Autopilot because it depends on hardware attestation. Most of the error codes point at the TPM, not at your configuration.",
  excerpt:
    "The technician flow inherits its behaviour from self-deploying mode, which is why it is strict about TPM 2.0 and device attestation. Decoding the failures, the network dependency people miss, and why Reset makes the retry worse.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  draft: true,
  readingMinutes: 9,
  primaryKeyword: "autopilot pre-provisioning failed",
  secondaryKeywords: [
    "TPM attestation failed autopilot",
    "0x81039001",
    "autopilot technician flow",
    "securing your hardware autopilot",
    "0x800705B4 autopilot",
  ],
  tags: ["Intune", "Windows", "Autopilot", "Troubleshooting", "Endpoint Management"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Windows Autopilot pre-provisioning, known-issues, requirements and technician-flow documentation. Error codes, TPM and attestation requirements, the reseal caveat and the documented waiting period are taken from those sources and cited below. Where the article recommends a diagnostic order rather than describing documented behaviour, it says so. No customer environment is described and no device was tested for this article.",
  body: [
    {
      type: "p",
      text: "Pre-provisioning is the Autopilot scenario where a technician or supplier does the heavy provisioning work before the device reaches the user, then reseals it so the user gets a short setup rather than an hour of app installs. It is also the scenario that fails most often on hardware grounds rather than configuration grounds, and that changes how you troubleshoot it.",
    },
    {
      type: "p",
      text: "The reason is in the design. Microsoft documents that the technician flow inherits its behaviour from self-deploying mode, and self-deploying mode has to prove that the device is genuinely the hardware it claims to be, because no user is present to authenticate. That proof is TPM attestation, and it is the single largest source of pre-provisioning failures.",
    },

    {
      type: "h2",
      id: "two-flows",
      text: "Two flows, two different failure surfaces",
    },
    {
      type: "p",
      text: "Pre-provisioning splits into a technician flow and a user flow, and it is worth being precise about which one failed before investigating anything.",
    },
    {
      type: "p",
      text: "The **technician flow** runs in the staging location. It joins the device, enrolls it, applies device-scoped configuration and installs device-targeted applications, then offers a **Reseal** button that shuts the device down for shipping. The **user flow** runs when the end user unboxes it, and applies whatever is user-scoped.",
    },
    {
      type: "p",
      text: "One design detail is worth knowing because it removes a whole line of investigation: because the reboot is postponed and the device is resealed before domain connectivity is expected, the pre-provisioning process does not require access to the customer's on-premises domain infrastructure. A supplier staging Microsoft Entra hybrid join devices does not need a line of sight to your domain controllers. The domain is contacted later, when the user unboxes the device on-premises.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Virtual machines are not supported",
      text: "Pre-provisioning requires physical devices with TPM 2.0 and device attestation. Microsoft states plainly that virtual machines aren't supported. A great deal of time gets lost testing pre-provisioning in a VM and diagnosing what looks like an attestation bug — the documented error for a device that is not TPM 2.0 capable is a generic timeout, `0x800705B4`, which does not obviously say what is wrong.",
    },

    {
      type: "h2",
      id: "attestation",
      text: "The hardware gate: what attestation is doing",
    },
    {
      type: "p",
      text: "Attestation is the step where the device proves its TPM is genuine and healthy to a service run by the TPM's manufacturer, and then uses that proof to obtain a device token and join Microsoft Entra ID. On screen it appears as **Securing your hardware**, and that is where the characteristic failures happen.",
    },
    {
      type: "p",
      text: "Two consequences follow, and neither is obvious from the interface. Attestation depends on the **TPM vendor's** infrastructure, not only on Microsoft's — which means it can fail for reasons entirely outside your tenant. And it depends on the TPM's firmware being current, which makes it a hardware maintenance issue rather than a deployment issue.",
    },
    {
      type: "table",
      caption: "Documented pre-provisioning and self-deploying error codes",
      head: ["Code", "What it means", "Action"],
      rows: [
        [
          "`0x800705B4`",
          "A general timeout. A common cause in self-deploying mode is that the device is not TPM 2.0 capable — a virtual machine, for example.",
          "Confirm the hardware has a TPM 2.0 and that you are not testing on a VM.",
        ],
        [
          "`0x81039001`",
          "`E_AUTOPILOT_CLIENT_TPM_MAX_ATTESTATION_RETRY_EXCEEDED`. Attestation retries were exhausted during **Securing your hardware**.",
          "Documented as intermittent — subsequent provisioning attempts might resolve it. Retry before escalating.",
        ],
        [
          "`0x81039024`",
          "Known vulnerabilities were detected in the TPM, so attestation is refused.",
          "Update the TPM firmware from the manufacturer's website. This is not fixable in Intune.",
        ],
        [
          "`0x81039023`",
          "A Windows 11 21H2 defect affecting TPM attestation.",
          "Apply the May 2022 cumulative update KB5013943 or later.",
        ],
        [
          "`0x80070490`",
          "TPM attestation failing on AMD platforms using ASP firmware TPM.",
          "Resolved in later AMD firmware. Check the manufacturer's firmware release notes.",
        ],
        [
          "`0x801c03ea`",
          "TPM attestation failed, so the device could not join Microsoft Entra ID with a device token.",
          "Treat as an attestation failure, not an identity misconfiguration.",
        ],
        [
          "`0x801C03F3`",
          "Microsoft Entra ID cannot find a device object for the device — typically because the object was manually deleted.",
          "Remove the device from Entra ID, Intune and Autopilot, then re-register it so the object is recreated.",
        ],
        [
          "`0xc1036501`",
          "Automatic MDM enrollment cannot proceed because there are multiple MDM configurations in Microsoft Entra ID.",
          "A tenant configuration problem, not a device problem.",
        ],
      ],
    },
    {
      type: "p",
      text: "The pattern worth internalising: `0x81039001` is a retry, `0x81039024` and `0x80070490` are firmware updates, `0x801C03F3` is a cleanup-and-re-register, and `0xc1036501` is the only one that sends you to tenant configuration. Sorting the code into one of those four buckets is most of the diagnosis.",
    },

    {
      type: "h2",
      id: "network",
      text: "The network dependency people miss",
    },
    {
      type: "p",
      text: "Attestation requires access to a set of HTTPS URLs that are **unique for each TPM provider**. This is documented in the Autopilot networking requirements, and it is one of the more awkward things about staging environments.",
    },
    {
      type: "p",
      text: "The practical problem is that the required endpoints depend on whose TPM is in the machine. A staging network allow-list that was built and tested against one hardware model can fail the moment a different vendor's device arrives, with an attestation error that looks identical to a firmware fault. If pre-provisioning works on one model and fails on another in the same room, this is the first thing I would check — before touching the profile, the ESP or the app assignments.",
    },
    {
      type: "p",
      text: "It is also worth noting that Microsoft documents a general OOBE symptom for blocked network access: a **Something went wrong** page usually means the client cannot reach all of the required Microsoft Entra and Microsoft account URLs. On a restricted staging VLAN, that is a more likely explanation than anything in Intune.",
    },

    {
      type: "h2",
      id: "reseal-lying",
      text: "When the success screen is not telling the whole truth",
    },
    {
      type: "p",
      text: "This is the caveat most worth knowing, because it produces a failure that appears at the user's desk rather than in the staging room.",
    },
    {
      type: "p",
      text: "The technician flow uses the Enrollment Status Page to hold the device in a provisioning state — that is what stops the process completing before software and configuration have applied. Microsoft documents that if the ESP is disabled, **the Reseal button can appear before software and configuration have finished applying**. The wording in the documentation is worth quoting in spirit: the success screen validates that enrollment was successful, not that the technician flow is necessarily complete.",
    },
    {
      type: "p",
      text: "So a technician sees a green screen, reseals, and ships a device that is missing applications. Everything looked correct at every step. The requirement that prevents this is straightforward and documented: an ESP profile must be targeted to the device for pre-provisioning. If your ESP is scoped to users rather than devices, the technician flow is exactly the scenario where that gap shows up, because no user is signed in.",
    },
    {
      type: "callout",
      variant: "note",
      title: "BitLocker compliance needs a grace period after Autopilot",
      text: "Until the device reboots, the status of BitLocker and Secure Boot is not captured, so it cannot be evaluated by a compliance policy. Microsoft documents that Conditional Access policies depending on BitLocker compliance require a grace period for Autopilot devices — and that the grace period can be as short as 0.25 days. A freshly provisioned device reported as non-compliant for disk encryption is usually this, not a BitLocker failure.",
    },

    {
      type: "h2",
      id: "reset-trap",
      text: "Reset, retry, and reused devices",
    },
    {
      type: "p",
      text: "When the technician flow fails, the error screen offers **Retry** and **Reset**. They are not interchangeable, and the instinct to reset is often the wrong one.",
    },
    {
      type: "p",
      text: "Microsoft's guidance is to use Retry when the issue is easily fixed — restoring network connectivity being the example given — and Reset only when the problem cannot be fixed without starting over. There is also a documented known issue that makes this more than a preference: when the ESP fails during the pre-provisioning flow and the technician selects Reset, **TPM attestation might fail during the retry**. Resetting a device that hit an attestation error can therefore turn an intermittent failure into a repeatable one.",
    },
    {
      type: "p",
      text: "Reused hardware has a separate rule. A device cannot automatically re-enroll through Autopilot after an initial deployment with pre-provisioning mode. Attempting it produces `0x80180014`. The documented fix is to delete the device record in Intune — Devices, All devices, select the device, Delete — and then redeploy. Microsoft also documents removing the enrollment restriction that blocks personally owned Windows devices as an alternative, but that changes a control for everyone in the assignment scope to fix one machine, and I would not reach for it.",
    },

    {
      type: "h2",
      id: "ninety-minutes",
      text: "The 90-minute rule between flows",
    },
    {
      type: "p",
      text: "Microsoft documents that you should wait at least 90 minutes after running the technician flow before running the user flow, so that tokens refresh properly between the two. The documentation is explicit that this mainly affects lab and testing scenarios, where the user flow is run immediately after the technician flow completes.",
    },
    {
      type: "p",
      text: "In production this is rarely a factor, because devices are boxed and shipped. In a proof of concept it is a very common source of confusing failures — the technician flow succeeded, the user flow failed, nothing was changed in between, and the actual cause is that the test was run too quickly. Worth ruling out before rebuilding a profile that was never wrong.",
    },

    {
      type: "h2",
      id: "evidence",
      text: "Collecting evidence from the device",
    },
    {
      type: "p",
      text: "The error screen itself will export logs, and the keystroke differs by version: on Windows 10 select **View diagnostics**, and on Windows 11 press CTRL+SHIFT+D and then select **Export Logs**. That is the fastest capture because it happens before the device is reset and the evidence is destroyed.",
    },
    {
      type: "p",
      text: "For a targeted collection when the device is still reachable, the Autopilot and TPM areas are the relevant ones:",
    },
    {
      type: "code",
      language: "text",
      filename: "Targeted diagnostic collection for attestation problems",
      command: true,
      code: `MdmDiagnosticsTool.exe -area Autopilot;TPM -cab c:\\autopilot.cab`,
    },
    {
      type: "p",
      text: "Inside a full diagnostics bundle, `TpmHliInfo_Output.txt` and `microsoft-windows-moderndeployment-diagnostics-provider-autopilot.evtx` are the two files that answer attestation questions directly.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Testing pre-provisioning on a virtual machine.** It is not supported. The resulting timeout does not say so.",
        "**Treating every attestation error as one problem.** `0x81039001` is a retry, `0x81039024` is TPM firmware, `0x80070490` is AMD firmware. They have different owners.",
        "**Selecting Reset after an ESP failure.** Documented to risk TPM attestation failing on the retry. Try Retry first where the cause is fixable.",
        "**Disabling the ESP to speed up staging.** The Reseal button can then appear before apps and configuration have applied, and the device ships incomplete.",
        "**Targeting the ESP profile at users only.** No user is signed in during the technician flow. Pre-provisioning requires an ESP profile targeted to the device.",
        "**Building a staging allow-list against one hardware model.** Attestation URLs are unique per TPM provider, so a second vendor's hardware can fail on the same network.",
        "**Running the user flow immediately after the technician flow in a lab.** Wait 90 minutes, or expect token-related failures that are not real.",
        "**Reading a fresh device's BitLocker non-compliance as a failure.** Encryption state is not captured until reboot; the documented answer is a compliance grace period.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Split the diagnosis by where it failed. A failure at **Securing your hardware** is an attestation problem: check TPM 2.0 presence, TPM firmware level, and whether the staging network reaches that vendor's attestation endpoints. A failure after that point is a normal enrollment or app-delivery problem and should be investigated like any other Autopilot deployment.",
    },
    {
      type: "p",
      text: "For the staging process itself, two configuration decisions prevent most of the recurring pain: keep the ESP enabled and targeted at devices so Reseal cannot appear early, and set a compliance grace period so newly built devices are not reported as non-compliant for encryption they have not had a chance to report yet.",
    },
    {
      type: "p",
      text: "If the device never reached the branded experience at all, this is the wrong article — that is a registration problem, covered in [Autopilot device registration failures](/microsoft-intune/autopilot-device-registration-failures). If the deployment reached the Enrollment Status Page and stalled there, the method is in [Enrollment Status Page stuck](/microsoft-intune/enrollment-status-page-troubleshooting). And if pre-provisioning is proving more trouble than it is worth, [Autopilot device preparation vs Windows Autopilot](/microsoft-intune/autopilot-device-preparation-vs-autopilot) covers what you would give up by moving — pre-provisioning being one of the scenarios device preparation does not support.",
    },
  ],
  faq: [
    {
      question: "Why does Autopilot pre-provisioning fail at Securing your hardware?",
      answer:
        "That step is TPM attestation, where the device proves its TPM is genuine and healthy in order to obtain a device token. Failures there are usually hardware or network related rather than configuration related: a TPM that is not 2.0, TPM firmware with known vulnerabilities, or a staging network that cannot reach the attestation endpoints for that TPM vendor.",
    },
    {
      question: "Can I test Autopilot pre-provisioning on a virtual machine?",
      answer:
        "No. Pre-provisioning requires physical devices supporting TPM 2.0 and device attestation, and Microsoft states that virtual machines are not supported. A device that is not TPM 2.0 capable typically produces a general timeout error, 0x800705B4, which does not make the underlying cause obvious.",
    },
    {
      question: "What does error 0x81039001 mean?",
      answer:
        "It is E_AUTOPILOT_CLIENT_TPM_MAX_ATTESTATION_RETRY_EXCEEDED, raised when attestation retries are exhausted during the Securing your hardware step. Microsoft documents this as intermittent and notes that subsequent provisioning attempts might resolve it, so retrying is reasonable before escalating.",
    },
    {
      question: "Should I use Retry or Reset when the technician flow fails?",
      answer:
        "Prefer Retry when the cause is something you can fix immediately, such as network connectivity. Reset only when the problem cannot be fixed without starting over. There is a documented known issue where selecting Reset after an ESP failure during pre-provisioning can cause TPM attestation to fail on the retry.",
    },
    {
      question: "Does a successful reseal mean provisioning is complete?",
      answer:
        "Not necessarily. The technician flow relies on the Enrollment Status Page to hold the device in a provisioning state. If the ESP is disabled, the Reseal button can appear before software and configuration have finished applying. The success screen confirms that enrollment succeeded, not that the technician flow finished.",
    },
    {
      question: "Why does a pre-provisioned device fail to redeploy?",
      answer:
        "A device cannot automatically re-enroll through Autopilot after an initial deployment in pre-provisioning mode, and the attempt fails with 0x80180014. Delete the device record in Intune under Devices then All devices, and redeploy. Removing the enrollment restriction on personally owned Windows devices also works but weakens a control across the whole assignment scope.",
    },
  ],
  sources: [
    {
      title: "Windows Autopilot for pre-provisioned deployment",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/pre-provision",
    },
    {
      title: "Windows Autopilot - known issues",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/known-issues",
    },
    {
      title: "Windows Autopilot requirements (networking)",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/requirements",
    },
    {
      title: "Pre-provision Microsoft Entra join: Technician flow",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/tutorial/pre-provisioning/azure-ad-join-technician-flow",
    },
    {
      title: "Windows Autopilot self-deploying mode",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/self-deploying",
    },
    {
      title: "Troubleshooting Microsoft Entra device registration and Windows Autopilot",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/device-enrollment/azure-ad-device-registration-autopilot",
    },
  ],
};
