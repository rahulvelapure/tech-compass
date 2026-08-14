import type { Article } from "../../types";

export const article: Article = {
  slug: "autopilot-device-registration-failures",
  category: "microsoft-intune",
  subcategory: "Autopilot",
  title:
    "Autopilot device registration failures: hashes, duplicates and devices that ignore the profile",
  seoTitle: "Autopilot Device Registration Failures: A Diagnostic Order",
  metaDescription:
    "Why an Autopilot device never reaches the branded setup screen: decoding the Ztd import errors, invalid hardware hashes, hardware changes and reused devices.",
  standfirst:
    "A device that boots into ordinary Windows setup has usually failed before Intune was ever involved. The failure is in registration, and registration has its own set of error codes.",
  excerpt:
    "The device shows the normal Windows out-of-box experience instead of your branded Autopilot screen. Here is the order to check things in, what each Ztd import error actually means, and why a repaired device stops being recognised.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 10,
  primaryKeyword: "autopilot device not registering",
  secondaryKeywords: [
    "ZtdDeviceAlreadyAssigned",
    "InvalidZtdHardwareHash",
    "autopilot hardware hash",
    "autopilot profile not applied",
    "autopilot duplicate device",
  ],
  tags: ["Intune", "Windows", "Autopilot", "Troubleshooting", "Endpoint Management"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Windows Autopilot registration, known-issues and troubleshooting documentation. Error codes, hardware hash requirements, import limits and the documented hardware-change behaviour are taken from those sources and cited below. Where the article recommends a diagnostic order rather than describing documented behaviour, it says so. No customer environment is described and no device was tested for this article.",
  body: [
    {
      type: "p",
      text: "The report that reaches the service desk is almost always the same: the new laptop was supposed to show the company sign-in screen, and instead it is asking which country the user is in and whether they want to set up for personal use. At that point people start looking at Intune — at profiles, at assignments, at groups.",
    },
    {
      type: "p",
      text: "That is usually the wrong place to start. If the device is showing ordinary Windows setup, the Autopilot deployment did not fail. It never began. Something upstream of Intune's configuration failed to tell Windows that this specific piece of hardware belongs to your tenant, and that is a registration problem with its own diagnostics.",
    },

    {
      type: "h2",
      id: "what-registration-is",
      text: "What registration actually is",
    },
    {
      type: "p",
      text: "Registration is the association between a hardware identity and your tenant. During setup, Windows sends a hardware fingerprint to the Autopilot deployment service and asks a single question: do you know this device? If the answer is yes, it receives a deployment profile and the branded experience begins. If the answer is no, Windows carries on with the standard out-of-box experience, exactly as designed.",
    },
    {
      type: "p",
      text: "That fingerprint is the **hardware hash** — a 4K blob derived from a set of firmware and component identifiers rather than a single serial number. Microsoft documents the SMBIOS fields that must carry unique values for the hash to be usable, and the list is longer than most people expect: `ProductKeyID`, `SmbiosSystemManufacturer`, `SmbiosSystemProductName`, `SmbiosSystemSerialNumber`, `SmbiosSkuNumber`, `SmbiosSystemFamily`, `MacAddress`, `SmbiosUuid`, `DiskSerialNumber`, `TPM` and `EkPub`.",
    },
    {
      type: "p",
      text: "The practical consequence of that list is the single most useful thing to understand about Autopilot registration: **the hash describes the machine, not the asset**. Change enough of the machine and it stops being the device you registered. That one fact explains most of the confusing cases later in this article.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Registration and enrollment are different failures",
      text: "A device that never shows the branded screen has a registration problem. A device that shows the branded screen and then hangs has an enrollment or provisioning problem — a different investigation entirely, covered in [Enrollment Status Page stuck: a systematic troubleshooting method](/microsoft-intune/enrollment-status-page-troubleshooting). Establishing which side of that line you are on takes ten seconds and saves an hour.",
    },

    {
      type: "h2",
      id: "diagnostic-order",
      text: "The order I would check things in",
    },
    {
      type: "p",
      text: "This ordering is a recommendation rather than documented product behaviour, but it follows from how the pieces depend on each other. Each step is cheap, and each one eliminates a whole class of cause.",
    },
    {
      type: "ol",
      items: [
        "**Is the device listed at all?** Devices > Enrollment > Devices, under the Windows Autopilot area. Search by serial number, not by name — an unregistered device has no name in Intune. If it is not there, the import failed or was never attempted, and the next section applies.",
        "**Is it listed but showing a warning?** A status of **Fix pending** or **Attention required** is not a cosmetic flag. It means the service has detected a hardware change, and it has a specific remedy.",
        "**Does it have a profile assigned?** A registered device with no assigned profile still goes through an Autopilot experience — Microsoft documents that the default profile is used. If your branding is missing but the flow looks Autopilot-ish, this is why.",
        "**Has this device been deployed before?** Reused hardware behaves differently from new hardware, and the failure code is distinctive.",
      ],
    },

    {
      type: "h2",
      id: "import-errors",
      text: "Import errors, decoded",
    },
    {
      type: "p",
      text: "If the device is not listed, the CSV import is where it went wrong. Microsoft's import errors are precise, and each one points at a different action — the names are unhelpful but the meanings are not.",
    },
    {
      type: "table",
      caption: "Autopilot import errors and what each one is telling you",
      head: ["Error", "Meaning", "What to do"],
      rows: [
        [
          "`ZtdDeviceAlreadyAssigned`",
          "The hash matches a device already registered **to this tenant**.",
          "Find the serial in the Windows Autopilot devices list. If it is there, the work is already done — do not import again.",
        ],
        [
          "`ZtdDeviceAssignedToAnotherTenant`",
          "The hash matches a device registered to **a different tenant**.",
          "The previous owner, reseller or a test tenant still holds it. It must be deregistered on that side; you cannot resolve this from your own tenant.",
        ],
        [
          "`ZtdDeviceDuplicated`",
          "The same hash appears more than once **inside the CSV you uploaded**.",
          "Only one duplicate is processed. Check whether the processed one succeeded, then remove the redundant rows.",
        ],
        [
          "`InvalidZtdHardwareHash`",
          "One or more fields in the hash are invalid or empty — commonly the manufacturer or serial number.",
          "Fix at the source device, not in the file. See the next section.",
        ],
        [
          "`StorageError`",
          "Documented as a generic error with no determinable cause without further investigation.",
          "Microsoft's own guidance is to retry later, and to raise a support case if it persists. Do not redesign anything on the strength of this one.",
        ],
      ],
    },
    {
      type: "p",
      text: "`ZtdDeviceAssignedToAnotherTenant` is the one that turns into a procurement conversation rather than a technical one. It is common with refurbished hardware and with devices that passed through a partner tenant for staging. There is no way to force it from the receiving side, which is a reasonable design — otherwise anyone with a hash could claim someone else's fleet.",
    },

    {
      type: "h2",
      id: "invalid-hash",
      text: "When the hash itself is rejected",
    },
    {
      type: "p",
      text: "`InvalidZtdHardwareHash` means the firmware did not supply what the hash needs. Both the manufacturer and the serial number must be present, and Microsoft documents a one-line check to run on the device:",
    },
    {
      type: "code",
      language: "powershell",
      filename: "Confirm the firmware is reporting identity fields",
      command: true,
      code: `Get-CimInstance Win32_BaseBoard | Select-Object Manufacturer, SerialNumber`,
    },
    {
      type: "p",
      text: "An empty or generic value here — and strings like `To be filled by O.E.M.` do appear on some builds — means the device cannot be registered until the firmware is corrected. That is a hardware vendor problem. It shows up most often on white-box builds, engineering samples and virtual machines, and it is worth checking on one unit from a new hardware line before the rest of the order arrives.",
    },
    {
      type: "p",
      text: "There are four documented ways to collect a hash: Configuration Manager, which gathers them automatically for existing devices; the `Get-WindowsAutopilotInfo` PowerShell script; the diagnostics page during OOBE on Windows 11; and the Access work or school pane in Settings. For anything beyond testing, the manual routes are the wrong tool — Microsoft describes manual registration via CSV as primarily for testing and evaluation, capped at 500 devices per file. At fleet scale, registration should come from the OEM or CSP partner using the PKID or tuple methods, which device owners cannot use themselves.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not open the CSV in Excel",
      text: "Microsoft documents this explicitly: editing the file in Excel or any editor other than Notepad can introduce extra characters that make the format invalid. The import then fails for a reason that has nothing to do with the devices in it. If a file that worked yesterday fails today, ask who opened it.",
    },

    {
      type: "h2",
      id: "registered-but-ignored",
      text: "Registered, but the device still runs ordinary setup",
    },
    {
      type: "p",
      text: "This is the more interesting case, because the obvious check has already passed. A few documented behaviours produce it.",
    },
    {
      type: "p",
      text: "The first is **OOBE retry exhaustion**. If setup is restarted too many times — which happens constantly during testing — Windows can enter a recovery mode and stop running the Autopilot configuration. Microsoft gives a recognisable symptom for this: the normal experience shows language, region and keyboard on separate pages, so if you are seeing several of those options on one page, you are in the degraded path. The retry count is tracked at `HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\UserOOBE`, and setting that value to `1` restores normal behaviour.",
    },
    {
      type: "p",
      text: "The second is **profile assignment timing**. Registration and profile assignment are separate operations, and a device that is registered but has not yet been assigned a profile takes the default Autopilot profile — documented behaviour, and deliberately so, to ensure every registered device goes through some Autopilot experience. If a device should not be going through Autopilot at all, the fix is to remove the registration rather than to remove the profile.",
    },
    {
      type: "p",
      text: "The third is **imaging over a registered device with an older build**. Microsoft documents that after a hardware change, the profile is not applied if the device was reimaged to a Windows version older than Windows 11 21H2 with KB5017383, or Windows 10 22H2. This is expected behaviour rather than a fault, and it is easy to hit in organisations that still deploy an older reference image.",
    },

    {
      type: "h2",
      id: "hardware-changes",
      text: "Hardware changes, repairs and the Fix pending state",
    },
    {
      type: "p",
      text: "Because the hash is derived from components, a repair can change the device's identity. When the service detects this, the device shows **Fix pending** or **Attention required** in the Windows Autopilot devices list, with a message saying it is attempting to register the new hardware automatically and that the status will update at the next check-in.",
    },
    {
      type: "p",
      text: "That message is genuinely worth reading rather than skipping, because it tells you the correct immediate action is to wait. If the state does not clear, the documented resolution is to deregister the device and register it again.",
    },
    {
      type: "p",
      text: "Motherboard replacement is a harder case, and Microsoft is direct about it: motherboard replacement is out of scope for Autopilot. A serviced device that can no longer be identified has to go through normal setup. To bring it back, the documented sequence is to unregister the device, replace the board, generate a new 4K hardware hash, and register it again with the new hash. Worth noting for anyone building a repair process: an OEM cannot re-register the device through the OEM direct API, because that path only accepts a PKID or tuple — so the new hash has to come back to you as a CSV.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Duplicate objects in hybrid deployments are expected",
      text: "A device object is created in Microsoft Entra ID as soon as a device is registered with Autopilot. If that device then goes through a Microsoft Entra hybrid join deployment, a second object is created — Microsoft documents this as by design. Two entries for one machine in a hybrid estate is not evidence of a fault, and cleaning them up reflexively can break the deployment you are troubleshooting.",
    },

    {
      type: "h2",
      id: "reused-devices",
      text: "Reused devices and 0x80180014",
    },
    {
      type: "p",
      text: "Devices previously deployed with self-deploying or pre-provisioning mode do not simply redeploy. Running them through Autopilot again fails with `0x80180014`. Microsoft documents two workarounds, and they are not equivalent in risk:",
    },
    {
      type: "ul",
      items: [
        "**Delete the device record in Intune, then redeploy.** This is the targeted fix and the one I would use. It resolves the specific device without changing tenant-wide policy.",
        "**Remove the enrollment restriction blocking personally owned Windows devices.** This works, but it relaxes a control for the whole assignment scope in order to fix one machine. If you find yourself reaching for it repeatedly, the real issue is the device lifecycle process, not the restriction — and the restriction is doing its job.",
      ],
    },
    {
      type: "p",
      text: "The second option is a good example of a tempting shortcut that quietly widens your enrollment surface. The interaction between enrollment restrictions and corporate device identity is worth understanding on its own terms before changing anything there.",
    },

    {
      type: "h2",
      id: "evidence",
      text: "Where the evidence is",
    },
    {
      type: "p",
      text: "When the portal does not explain the behaviour, the device will. Microsoft lists the files worth collecting for registration and Autopilot problems, and two of them carry most of the signal: `microsoft-windows-moderndeployment-diagnostics-provider-autopilot.evtx` and `microsoft-windows-devicemanagement-enterprise-diagnostics-provider-admin.evtx`. For registration and TPM questions specifically, a targeted collection is quicker than a full bundle:",
    },
    {
      type: "code",
      language: "text",
      filename: "Targeted diagnostic collection",
      command: true,
      code: `MdmDiagnosticsTool.exe -area Autopilot;TPM -cab c:\\autopilot.cab`,
    },
    {
      type: "p",
      text: "For the Entra side of device registration, Microsoft publishes a Device Registration Troubleshooter that walks the common states — a device stuck as Pending, or a device with no Primary Refresh Token issued. It is a faster first pass than reading event logs when the question is simply whether the device identity exists and is healthy.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Investigating Intune first.** If the branded screen never appeared, profiles and assignments are not the cause. Confirm the device is registered before opening anything else.",
        "**Re-importing a device after an already-assigned error.** `ZtdDeviceAlreadyAssigned` means the registration already exists. Importing again does not help and adds noise to the next investigation.",
        "**Deleting duplicate Entra objects in a hybrid estate.** A second object is created by design when a registered device goes through hybrid join.",
        "**Treating Fix pending as an error to clear immediately.** The documented behaviour is that the service retries and updates at the next check-in. Give it that chance before deregistering.",
        "**Relaxing enrollment restrictions to fix one reused device.** Deleting the Intune device record is the targeted fix; the restriction change applies to everyone in scope.",
        "**Editing the import CSV in Excel.** Documented as a cause of invalid file format, and almost impossible to spot by eye afterwards.",
        "**Assuming a working reference image is version-agnostic.** Reimaging to a build older than the documented baselines stops the profile applying after a hardware change.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "For a single failing device, work outside-in: confirm it exists in the Autopilot device list by serial number, check for a hardware-change warning, confirm a profile is assigned, and only then look at the deployment configuration. Most cases resolve in the first two steps, and the ones that do not are usually reused hardware or a device that belongs to another tenant.",
    },
    {
      type: "p",
      text: "For the fleet, the durable fix is to stop registering devices by hand. Manual CSV registration is documented as a testing and evaluation path, and it carries a 500-device ceiling per file, a fragile file format and a dependency on someone running a script correctly. Registration through the OEM or CSP partner removes an entire category of the failures above before a device is ever unboxed.",
    },
    {
      type: "p",
      text: "The two decisions that sit underneath all of this — which provisioning model to use, and whether devices should be Microsoft Entra joined or hybrid joined — shape which failure modes you can encounter at all. Both are worth settling before scaling a deployment rather than after.",
    },
  ],
  faq: [
    {
      question: "Why is my Autopilot device showing the normal Windows setup screen?",
      answer:
        "Windows only runs the Autopilot experience if the Autopilot deployment service recognises the device's hardware hash. Ordinary setup means the device is not registered, the registration is held by another tenant, or the device entered a degraded OOBE state after too many restarts. Check whether the serial number appears in the Windows Autopilot devices list before looking at profiles or assignments.",
    },
    {
      question: "What does ZtdDeviceAlreadyAssigned mean?",
      answer:
        "The hardware hash you uploaded matches a device that is already registered to your tenant. Search for the serial number in the Windows Autopilot devices list. If it is there, the device is registered and no further import is needed. If it is genuinely absent, it can be imported again.",
    },
    {
      question: "Can I take over a device registered to another tenant?",
      answer:
        "No. ZtdDeviceAssignedToAnotherTenant means the hash is claimed by a different tenant, and it must be deregistered from that side. This is common with refurbished hardware or devices staged through a partner tenant. There is no supported way to force the transfer from the receiving tenant.",
    },
    {
      question: "Why does one device appear twice in Microsoft Entra ID?",
      answer:
        "A device object is created in Microsoft Entra ID when the device is registered with Autopilot. If the device then completes a Microsoft Entra hybrid join deployment, a second object is created. Microsoft documents this as by design for hybrid deployments, so duplicate entries there are not in themselves a fault.",
    },
    {
      question: "Does replacing a motherboard break Autopilot registration?",
      answer:
        "Yes. The hardware hash is derived from firmware and component identifiers, so a board replacement changes the device identity. Microsoft treats motherboard replacement as out of scope for Autopilot. To restore it, unregister the device, replace the board, generate a new 4K hardware hash, and register the device again with that new hash.",
    },
    {
      question: "Why does a previously deployed device fail with 0x80180014?",
      answer:
        "Devices originally enrolled through self-deploying or pre-provisioning mode do not automatically re-enroll through Autopilot. The documented fix is to delete the device record in Intune and then redeploy. Removing the enrollment restriction on personally owned Windows devices also works but relaxes a control across the whole assignment scope, so it is the weaker option.",
    },
  ],
  sources: [
    {
      title: "Manually register devices with Windows Autopilot",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/add-devices",
    },
    {
      title: "Windows Autopilot - known issues",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/known-issues",
    },
    {
      title: "Windows Autopilot troubleshooting FAQ",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/troubleshooting-faq",
    },
    {
      title: "Windows Autopilot registration overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/registration-overview",
    },
    {
      title: "Troubleshooting Microsoft Entra device registration and Windows Autopilot",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/troubleshoot/mem/intune/device-enrollment/azure-ad-device-registration-autopilot",
    },
    {
      title: "Windows Autopilot FAQ",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/faq",
    },
    {
      title: "Windows Autopilot motherboard replacement scenario guidance",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/autopilot/autopilot-motherboard-replacement",
    },
  ],
};
