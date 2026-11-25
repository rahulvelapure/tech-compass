
import type { Article } from "../../types";

export const article: Article = {
  slug: "microsoft-ntlm-signing-changes-2027",
  category: "cybersecurity-ciso",
  contentType: "guide",
  subcategory: "Active Directory Security",

  title:
    "Microsoft Will Require NTLM Signing by Default in May 2027. Is Your Active Directory Ready?",

  seoTitle:
    "NTLM Signing Enforcement in May 2027: Active Directory Readiness Guide",

  metaDescription:
    "Microsoft will require NTLM signing by default in May 2027. Learn how to audit NTLM, find legacy dependencies and prepare Windows servers safely.",

  standfirst:
    "Microsoft is changing how Windows handles NTLM authentication. From May 2027, Windows servers will require real NTLM message signing by default. Systems that still use unsigned NTLM connections could stop authenticating. IT teams should start auditing their environments now, before legacy applications and devices become a business problem.",

  excerpt:
    "Microsoft will require NTLM signing by default in May 2027. This practical guide explains the two rollout phases, Windows audit events, PowerShell checks, registry settings, compatibility risks and a safe enterprise rollout plan.",

  heroImage:
    "/images/articles/microsoft-ntlm-signing-changes-2027.webp",

  heroImageAlt:
    "Enterprise Active Directory environment showing Windows authentication moving from legacy unsigned NTLM connections to secure signed authentication.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-17",
  lastReviewedAt: "2026-11-17",
  nextReviewAt: "2026-12-17",

  readingMinutes: 13,

  primaryKeyword: "NTLM signing",

  secondaryKeywords: [
    "Microsoft NTLM signing 2027",
    "NTLM signing enforcement",
    "Active Directory security",
    "Windows Server NTLM",
    "NTLM authentication audit",
    "NTLM relay attacks",
    "Windows Server security updates",
    "NTLM Event ID 4022",
    "NTLM Event ID 4023",
    "ClientAllowUnsignedNtlm",
    "ServerRequireNtlmSign",
    "NTLM hardening",
  ],

  tags: [
    "Microsoft Windows",
    "Active Directory",
    "Windows Server",
    "NTLM",
    "Cybersecurity",
    "Identity Security",
    "Microsoft Security",
    "Infrastructure Security",
    "PowerShell",
    "Security Operations",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "outlook-cve-2026-124194-ntlm-patch-guide",
    "ransomware-recovery-backups-immutable-ad-forest",
  ],

  draft: false,

  methodology:
    "This article is based primarily on Microsoft's November 10, 2026 NTLM signing security improvements documentation (KB5135557) and Microsoft's NTLM enhanced auditing documentation (KB5064479). Microsoft documentation is the authority for the rollout phases, protocol flags, registry settings, operating-system support and audit guidance. The enterprise deployment recommendations, compatibility checks, change-management process and validation approach are Substrate operational guidance. Administrators should recheck the latest Microsoft documentation and installed Windows build before implementing changes.",

  body: [
    {
      type: "p",
      text: "Your Windows environment may still depend on NTLM authentication more than you realise. A file server, an old application, a network scanner or a backup system could be using it every day without appearing on anyone's security roadmap.",
    },
    {
      type: "p",
      text: "Microsoft is now changing how Windows handles this authentication protocol. Windows updates released from November 10, 2026, begin offering real NTLM message signing by default. In May 2027, the next phase will require Windows servers to enforce signing by default.",
    },
    {
      type: "p",
      text: "This is not the same as disabling NTLM. It is a change to the security requirements of NTLM connections. The distinction matters because an older application or device may continue to use NTLM but may not negotiate the signing protection that Windows will require.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The deadline to prepare is May 2027",
      text: "Microsoft's published timeline identifies May 2027 for the server enforcement phase. It does not specify an exact day in the current documentation. Do not wait until the enforcement phase to discover which applications depend on unsigned NTLM connections.",
    },

    {
      type: "h2",
      id: "quick-answer",
      text: "The short answer: what is changing?",
    },
    {
      type: "p",
      text: "Microsoft is introducing a two-phase change to NTLM message signing. First, Windows clients begin offering real signing by default. Later, Windows servers will require it by default and reject clients that do not negotiate the required protection.",
    },
    {
      type: "table",
      caption: "Microsoft's NTLM signing rollout",
      head: [
        "Phase",
        "Timeline",
        "What changes",
      ],
      rows: [
        [
          "Phase 1",
          "November 10, 2026",
          "Windows clients offer real NTLM signing by default. Servers continue accepting signed and unsigned clients.",
        ],
        [
          "Phase 2",
          "May 2027",
          "Windows servers require real NTLM signing by default. Unsigned clients are rejected.",
        ],
      ],
    },
    {
      type: "p",
      text: "The important point is that the first phase gives IT teams time to discover problems. The second phase changes the default server behaviour. Use the audit period to identify dependencies, test fixes and prepare a controlled rollout.",
    },

    {
      type: "h2",
      id: "what-is-ntlm",
      text: "First, what is NTLM?",
    },
    {
      type: "p",
      text: "NTLM stands for NT LAN Manager. It is a Windows authentication protocol that allows a user or computer to prove its identity to another system without sending the user's actual password over the network.",
    },
    {
      type: "p",
      text: "Many organisations have moved towards Kerberos and modern authentication. However, NTLM remains in use in some environments, especially where older applications, devices or network configurations are involved.",
    },
    {
      type: "p",
      text: "For example, a Windows workstation might access a shared folder on a file server. A legacy application might connect to an internal service using Windows credentials. A scanner or storage appliance might authenticate against a Windows server.",
    },
    {
      type: "p",
      text: "These connections can work reliably for years. That is why organisations sometimes discover their NTLM dependencies only when a security policy changes.",
    },
    {
      type: "p",
      text: "NTLM itself is not automatically insecure in every situation. The risk depends on how it is negotiated, where it is used and which protections are present. Microsoft's latest change focuses on ensuring that authenticated NTLM sessions use real cryptographic message signing.",
    },

    {
      type: "h2",
      id: "why-signing",
      text: "Why does NTLM signing matter?",
    },
    {
      type: "p",
      text: "Authentication answers one question: who are you? Message signing helps protect the integrity of the messages exchanged after authentication.",
    },
    {
      type: "p",
      text: "Without appropriate integrity protection, an attacker positioned between two systems may have opportunities to manipulate or relay authentication traffic. This is one reason NTLM relay attacks remain an important concern for Windows environments.",
    },
    {
      type: "p",
      text: "Real NTLM signing uses a cryptographic session key and message integrity protection. It makes it harder for an attacker to alter protected messages without detection.",
    },
    {
      type: "p",
      text: "Signing is not encryption. It does not hide the contents of network traffic. It also does not prevent every NTLM relay scenario by itself. Other controls, including appropriate SMB signing, Extended Protection for Authentication, channel binding and network restrictions, remain important where supported.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Signing is not encryption",
      text: "NTLM signing protects message integrity. It does not encrypt the entire connection. Treat it as one layer in a wider authentication and network security strategy.",
    },

    {
      type: "h2",
      id: "two-signing-modes",
      text: "The important difference: real signing versus legacy signing",
    },
    {
      type: "p",
      text: "Microsoft's documentation describes two NTLM signing modes. They may sound similar, but they do not provide the same protection.",
    },
    {
      type: "table",
      caption: "The two NTLM signing flags",
      head: [
        "Signing mode",
        "Protocol flag",
        "Security meaning",
      ],
      rows: [
        [
          "Real message signing",
          "0x00000010",
          "NTLMSSP_NEGOTIATE_SIGN. Uses cryptographic message signing with an established session key.",
        ],
        [
          "Legacy placeholder signing",
          "0x00008000",
          "NTLMSSP_NEGOTIATE_ALWAYS_SIGN. Uses a legacy zero placeholder and does not provide real cryptographic message integrity.",
        ],
      ],
    },
    {
      type: "p",
      text: "The difference is critical. Seeing an older signing-related flag does not prove that a connection has real message signing enabled.",
    },
    {
      type: "p",
      text: "For readiness checks, administrators should inspect the negotiated flags and confirm that the real SIGN bit, 0x00000010, is present. Microsoft also identifies the session key status as an important part of the event information.",
    },

    {
      type: "h2",
      id: "who-is-affected",
      text: "Which Windows systems are affected?",
    },
    {
      type: "p",
      text: "Microsoft's November 10, 2026 documentation lists the following Windows versions in scope for these NTLM signing improvements:",
    },
    {
      type: "ul",
      items: [
        "Windows 11, version 23H2.",
        "Windows 11, version 24H2.",
        "Windows 11, version 25H2.",
        "Windows 11, version 26H1.",
        "Windows 11, version 26H2.",
        "Windows 10 Enterprise LTSC 2021.",
        "Windows Server 2016.",
        "Windows Server 2019.",
        "Windows Server 2022.",
        "Windows Server 2025.",
      ],
    },
    {
      type: "p",
      text: "The operating-system version alone is not enough to establish readiness. Confirm that the relevant Windows updates are installed and that the required audit capabilities are available on each system.",
    },
    {
      type: "p",
      text: "There is an important distinction around enhanced auditing. Microsoft's KB5064479 documents enhanced NTLM auditing for Windows 11 24H2 and later, Windows Server 2025, and Windows Server 2019 and 2022 with updates released on or after October 13, 2026. Do not assume that every Windows Server 2016 system provides the same enhanced audit events.",
    },

    {
      type: "h2",
      id: "what-breaks",
      text: "What could stop working?",
    },
    {
      type: "p",
      text: "The main concern is not every NTLM connection. It is a connection that cannot negotiate real signing when the server requires it.",
    },
    {
      type: "p",
      text: "Consider a common enterprise scenario. An employee opens a shared folder hosted on a Windows file server. The workstation and server authenticate using NTLM. If the client cannot negotiate the required signing protection, the server may reject the connection after enforcement.",
    },
    {
      type: "p",
      text: "The same type of dependency may exist in older applications, appliances and services. These are examples to investigate, not a list of products that Microsoft has declared incompatible.",
    },
    {
      type: "ul",
      items: [
        "Legacy applications that authenticate to Windows services using NTLM.",
        "Older NAS and storage appliances.",
        "Network scanners that send files to Windows shares.",
        "Backup software and older backup appliances.",
        "Scheduled tasks or services using legacy authentication.",
        "Older Linux or Unix integrations using NTLM.",
        "Custom applications that use Windows authentication APIs.",
        "Systems that connect to servers by IP address or unresolved hostnames.",
      ],
    },
    {
      type: "p",
      text: "A dependency should not be labelled incompatible merely because it uses NTLM. The actual question is whether it can negotiate real signing with the target server. Test the specific application, device, protocol and firmware version before making that decision.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not disable NTLM across the domain as a shortcut",
      text: "Microsoft's change is about signing enforcement, not immediate NTLM removal. A blanket NTLM restriction can break legacy authentication paths and business workflows. Discover and test dependencies first.",
    },

    {
      type: "h2",
      id: "start-audit",
      text: "Step 1: Start auditing NTLM activity",
    },
    {
      type: "p",
      text: "The first task is visibility. Before changing policies, find out which devices are using NTLM and whether their connections negotiate real signing.",
    },
    {
      type: "p",
      text: "Microsoft provides enhanced NTLM auditing through the following Event Viewer location:",
    },
    {
      type: "p",
      text: "Applications and Services Logs > Microsoft > Windows > NTLM > Operational",
    },
    {
      type: "p",
      text: "The enhanced audit records can help administrators identify the account, process, source or destination system and reason for NTLM usage. This is useful for finding legacy dependencies that may otherwise remain hidden.",
    },
    {
      type: "p",
      text: "Microsoft documents the NTLM Enhanced Logging policy under Administrative Templates > System > NTLM. Domain-wide enhanced logging is controlled separately through Log Enhanced Domain-wide NTLM Logs under Administrative Templates > System > Netlogon.",
    },
    {
      type: "p",
      text: "For signing readiness, Microsoft's KB5135557 identifies client-side Event ID 4022 and server-side Event ID 4023. Inspect the event message and negotiated flags rather than relying on the event number or severity alone. Microsoft's broader enhanced auditing documentation also describes event mappings by audit scenario, so validate the actual event source and payload on your installed Windows build before building SIEM rules.",
    },
    {
      type: "p",
      text: "One important detail: signed and unsigned connections can both appear at Warning level in the signing-specific events. Filtering only for Warning or Information will not tell you whether signing was negotiated.",
    },

    {
      type: "h2",
      id: "audit-script",
      text: "Step 2: Use PowerShell to find unsigned NTLM connections",
    },
    {
      type: "p",
      text: "Microsoft provides a PowerShell approach for identifying NTLM audit events where the real SIGN flag is absent. The following version produces a report with the time, event ID, client IP, client machine, user, negotiated flags, session key status and process.",
    },
    {
      type: "p",
      text: "Run PowerShell as an administrator on a system that has the relevant NTLM Operational events. The script reads existing logs; it does not change registry settings or authentication policy.",
    },
    {
      type: "p",
      text: "Use this script:",
    },
    {
      type: "p",
      text: "$Events = Get-WinEvent -LogName 'Microsoft-Windows-NTLM/Operational' -ErrorAction SilentlyContinue | Where-Object { $_.Id -in @(4022, 4023) }\n\n$Results = foreach ($Event in $Events) {\n    $Message = $Event.Message\n\n    $Flags = if ($Message -match 'Negotiated Flags:\\s+(0x[0-9A-Fa-f]+)') {\n        $Matches[1]\n    } else {\n        'Unknown'\n    }\n\n    $FlagValue = if ($Flags -ne 'Unknown') {\n        [Convert]::ToUInt64($Flags.Substring(2), 16)\n    } else {\n        $null\n    }\n\n    $HasRealSigning = if ($null -ne $FlagValue) {\n        [bool]($FlagValue -band 0x10)\n    } else {\n        $null\n    }\n\n    [PSCustomObject]@{\n        Time       = $Event.TimeCreated\n        EventID    = $Event.Id\n        ClientIP   = if ($Message -match 'Client IP:\\s+(\\S+)') { $Matches[1] } else { '-' }\n        ClientHost = if ($Message -match 'Client Machine:\\s+(\\S+)') { $Matches[1] } else { '-' }\n        User       = if ($Message -match 'Username:\\s+(\\S+)') { $Matches[1] } else { '-' }\n        Flags      = $Flags\n        RealSign   = $HasRealSigning\n        SessionKey = if ($Message -match 'Session Key Status:\\s+(\\S+)') { $Matches[1] } else { '-' }\n        Process    = if ($Message -match 'Process Name:\\s+(.+)') { $Matches[1].Trim() } else { '-' }\n    }\n}\n\n$Results |\n    Where-Object { $_.RealSign -eq $false -or $null -eq $_.RealSign } |\n    Sort-Object ClientIP, Time |\n    Format-Table -AutoSize",
    },
    {
      type: "p",
      text: "The report highlights events where the SIGN bit is absent or where the flags could not be read. Unknown values require manual review. Do not automatically classify an event with missing fields as a confirmed unsigned connection.",
    },
    {
      type: "p",
      text: "The script examines the local machine's available event history. It does not automatically collect logs from every workstation, member server or domain controller. For an organisation-wide view, collect the relevant events centrally using your existing Windows Event Forwarding, SIEM or endpoint monitoring platform.",
    },
    {
      type: "callout",
      variant: "note",
      title: "No results does not prove the entire organisation is ready",
      text: "No unsigned events in one machine's available log only describes the events that machine recorded during that period. Confirm audit coverage, log retention, endpoint check-in and server-side visibility before making an enterprise readiness decision.",
    },

    {
      type: "h2",
      id: "investigate",
      text: "Step 3: Investigate every unsigned connection",
    },
    {
      type: "p",
      text: "An unsigned connection is not a reason to immediately disable an application or block an account. It is a starting point for investigation.",
    },
    {
      type: "p",
      text: "For each finding, identify:",
    },
    {
      type: "ul",
      items: [
        "Which computer initiated the authentication?",
        "Which server or service received it?",
        "Which user or service account was involved?",
        "Which application or process initiated the connection?",
        "Was the connection expected and business-related?",
        "Does the target support real NTLM signing?",
        "Can the application or device be updated?",
        "Can the workload use Kerberos or another supported authentication method?",
        "Who owns the application or device?",
      ],
    },
    {
      type: "p",
      text: "Pay particular attention to connections involving privileged accounts, critical servers and systems crossing network trust boundaries. These should receive higher priority than an isolated low-risk dependency.",
    },
    {
      type: "p",
      text: "Microsoft's enhanced audit logs can also provide a reason for NTLM usage. Examples include direct NTLM calls, local-account authentication, missing target names, unresolved target names, IP-based targets, duplicate target names in Active Directory and lack of line of sight to a domain controller.",
    },
    {
      type: "p",
      text: "These details can point to configuration problems that should be corrected even before signing enforcement begins.",
    },

    {
      type: "h2",
      id: "registry-settings",
      text: "Step 4: Understand the new Windows registry settings",
    },
    {
      type: "p",
      text: "Microsoft introduced two registry settings with the November 10, 2026 Windows updates. They control whether clients offer signing and whether servers require it.",
    },
    {
      type: "p",
      text: "Both settings are under:",
    },
    {
      type: "p",
      text: "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\MSV1_0",
    },
    {
      type: "table",
      caption: "Microsoft NTLM signing registry settings",
      head: [
        "Registry value",
        "Default",
        "Purpose",
      ],
      rows: [
        [
          "ClientAllowUnsignedNtlm",
          "0",
          "Controls whether the client offers real signing. Value 1 prevents the client from offering SIGN and should be used only for temporary compatibility.",
        ],
        [
          "ServerRequireNtlmSign",
          "0",
          "Controls whether the server rejects unsigned NTLM clients. Value 1 requires real signing for applicable secure connections.",
        ],
      ],
    },
    {
      type: "p",
      text: "The recommended client behaviour is to keep ClientAllowUnsignedNtlm at 0 so that clients offer real signing on non-anonymous connections.",
    },
    {
      type: "p",
      text: "For servers, Microsoft recommends enabling ServerRequireNtlmSign=1 after auditing confirms that unsigned connections are no longer present. Microsoft states that a restart is not required for this setting.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not change these settings across production servers without testing",
      text: "Changing ServerRequireNtlmSign to 1 can reject clients that cannot negotiate real signing. Test the affected applications and devices first, then deploy through an approved change process.",
    },

    {
      type: "h2",
      id: "pilot-deployment",
      text: "Step 5: Prepare a controlled enterprise rollout",
    },
    {
      type: "p",
      text: "The safest approach is to treat this as an authentication compatibility project, not just a registry deployment.",
    },
    {
      type: "table",
      caption: "Suggested enterprise rollout plan",
      head: [
        "Stage",
        "Action",
        "Expected result",
      ],
      rows: [
        [
          "1. Discover",
          "Inventory Windows versions, NTLM usage and audit coverage.",
          "A reliable view of the environment.",
        ],
        [
          "2. Baseline",
          "Collect client and server signing events over a representative business cycle.",
          "A list of unsigned connections and their owners.",
        ],
        [
          "3. Investigate",
          "Identify applications, appliances, accounts and services behind each finding.",
          "Documented dependencies and remediation options.",
        ],
        [
          "4. Remediate",
          "Update applications, devices, firmware or authentication configuration.",
          "Known dependencies can negotiate real signing or have an approved alternative.",
        ],
        [
          "5. Pilot",
          "Test ServerRequireNtlmSign=1 on selected non-critical servers.",
          "Evidence that required business workflows continue to work.",
        ],
        [
          "6. Expand",
          "Extend enforcement in approved production waves.",
          "Controlled adoption across the server estate.",
        ],
        [
          "7. Validate",
          "Review authentication failures, application health and audit events.",
          "Evidence that enforcement is working without unacceptable impact.",
        ],
      ],
    },
    {
      type: "p",
      text: "Choose pilot systems carefully. Include representative file services, application servers and other workloads that receive NTLM authentication. Do not start with a domain controller or a critical business service simply because it is convenient.",
    },
    {
      type: "p",
      text: "The observation period should cover normal business activity, scheduled jobs, backup cycles and other infrequent workflows. A quiet weekend is not enough evidence that an application will work during a normal working week.",
    },

    {
      type: "h2",
      id: "rollback",
      text: "What is the rollback plan?",
    },
    {
      type: "p",
      text: "A production change is not complete until the rollback approach is understood and tested.",
    },
    {
      type: "p",
      text: "If enabling server enforcement causes a confirmed business compatibility issue, use the approved change process to restore the previous server setting while the dependency is investigated.",
    },
    {
      type: "p",
      text: "For a temporary rollback, set ServerRequireNtlmSign back to 0 on the affected server. This restores acceptance of signed and unsigned clients for the applicable secure connections. It does not disable NTLM.",
    },
    {
      type: "p",
      text: "Avoid setting ClientAllowUnsignedNtlm to 1 as a general workaround. That changes client behaviour and prevents it from offering real signing. Microsoft describes this as a temporary compatibility setting, not the preferred steady state.",
    },
    {
      type: "p",
      text: "Record the affected server, business impact, reason for rollback, owner, compensating controls and a target date for remediation. Do not leave temporary exceptions open indefinitely.",
    },

    {
      type: "h2",
      id: "special-cases",
      text: "Important exceptions and compatibility considerations",
    },
    {
      type: "p",
      text: "Microsoft documents specific exceptions and fallback behaviour that administrators should understand before interpreting audit results.",
    },
    {
      type: "ul",
      items: [
        "Kerberos is not affected by these NTLM signing changes.",
        "Anonymous or null-session connections are explicitly exempt because they do not establish a real session key.",
        "Guest-account connections are also exempt.",
        "If an older server does not echo the SIGN flag in its challenge, the client can remove SIGN and fall back to legacy ALWAYS_SIGN behaviour without a connection failure.",
        "All supported Windows Server versions are capable of NTLM signing. The rollout is intended to ensure signing is negotiated and eventually required by default.",
      ],
    },
    {
      type: "p",
      text: "The fallback behaviour for older servers is not a reason to ignore them. It is a reason to identify them and confirm their actual authentication behaviour. A connection that falls back to legacy signing is not equivalent to a connection protected by real signing.",
    },
    {
      type: "p",
      text: "Microsoft also documents SEC_E_UNSUPPORTED_FUNCTION (0x80090302) as an error that rejected clients may encounter during the enforcement phase. A server-side Warning Event 4023 can record this status.",
    },

    {
      type: "h2",
      id: "active-directory",
      text: "What Active Directory administrators should review",
    },
    {
      type: "p",
      text: "NTLM signing readiness is not only a workstation exercise. Domain and infrastructure teams should review the wider authentication environment.",
    },
    {
      type: "ul",
      items: [
        "Review NTLM authentication activity on member servers and domain controllers.",
        "Identify systems that use IP addresses instead of fully qualified hostnames.",
        "Review duplicate Service Principal Names and name-resolution problems.",
        "Check whether clients have reliable line of sight to domain controllers.",
        "Identify local-account authentication where domain authentication is expected.",
        "Review service accounts and scheduled tasks that use legacy authentication.",
        "Check whether older applications can use Kerberos.",
        "Review privileged accounts and where they are permitted to authenticate.",
        "Confirm that event collection and retention cover the systems in scope.",
      ],
    },
    {
      type: "p",
      text: "Do not confuse NTLM signing enforcement with a complete NTLM deprecation programme. Microsoft has a broader direction for reducing NTLM reliance, but this particular change is about signing. Treat protocol reduction as a separate, evidence-led workstream.",
    },

    {
      type: "h2",
      id: "security-controls",
      text: "Other security controls that should be part of the plan",
    },
    {
      type: "p",
      text: "NTLM signing is one important control, but it should not be the only protection against credential relay and authentication abuse.",
    },
    {
      type: "ul",
      items: [
        "Enable SMB signing where supported and required by your security baseline.",
        "Evaluate Extended Protection for Authentication on supported services.",
        "Review channel binding support for relevant applications and protocols.",
        "Restrict unnecessary outbound connections that can trigger Windows authentication.",
        "Separate privileged administration from normal user productivity accounts.",
        "Use least privilege for service accounts.",
        "Monitor unusual authentication patterns and repeated failures.",
        "Keep Windows servers, clients and network appliances on supported versions.",
      ],
    },
    {
      type: "p",
      text: "These controls address different parts of the security problem. For example, SMB signing protects SMB message integrity, while NTLM signing addresses the integrity protection negotiated within NTLM authentication. One should not be treated as a replacement for the other.",
    },

    {
      type: "h2",
      id: "management-report",
      text: "What should IT report to management?",
    },
    {
      type: "p",
      text: "A useful readiness report should show actual exposure and remediation progress, not simply whether a registry setting has been deployed.",
    },
    {
      type: "table",
      caption: "Suggested NTLM signing readiness metrics",
      head: [
        "Metric",
        "What it tells management",
      ],
      rows: [
        [
          "Windows systems in scope",
          "Size of the affected infrastructure population.",
        ],
        [
          "Systems with audit coverage",
          "How much of the environment can be assessed.",
        ],
        [
          "Unsigned NTLM connections",
          "Where signing enforcement may cause failures.",
        ],
        [
          "Unidentified dependencies",
          "How much work remains to understand the findings.",
        ],
        [
          "Dependencies remediated",
          "Progress in updating or replacing affected workloads.",
        ],
        [
          "Pilot enforcement results",
          "Evidence from systems where signing is required.",
        ],
        [
          "Open exceptions",
          "Remaining business risks, owners and deadlines.",
        ],
      ],
    },
    {
      type: "p",
      text: "A strong management statement might read: 'We have enabled NTLM signing audit coverage on the supported systems in scope, identified the remaining unsigned connections, assigned application owners and started controlled enforcement testing.'",
    },
    {
      type: "p",
      text: "Avoid declaring the organisation ready based only on a successful Group Policy refresh or a registry value. Readiness requires evidence that the systems and business workflows can operate with signing enforced.",
    },

    {
      type: "h2",
      id: "readiness-checklist",
      text: "NTLM signing readiness checklist",
    },
    {
      type: "ul",
      items: [
        "Confirm Windows updates are installed on supported clients and servers.",
        "Confirm which systems provide enhanced NTLM auditing.",
        "Enable and validate the required audit policies.",
        "Collect signing-specific events from clients and servers.",
        "Check the real SIGN bit, not only the event severity.",
        "Review session key status and missing event fields.",
        "Identify the application and owner behind each unsigned connection.",
        "Test older NAS, scanners, backup systems and business applications.",
        "Remediate dependencies or document approved exceptions.",
        "Pilot ServerRequireNtlmSign=1 on selected systems.",
        "Validate business workflows and authentication logs.",
        "Approve and schedule production enforcement waves.",
        "Document rollback steps and exception expiry dates.",
      ],
    },

    {
      type: "h2",
      id: "conclusion",
      text: "May 2027 is a security deadline, but the real work starts now",
    },
    {
      type: "p",
      text: "Microsoft's NTLM signing change is a meaningful improvement to Windows authentication security. It also gives infrastructure teams a clear reason to review authentication dependencies that may have existed unnoticed for years.",
    },
    {
      type: "p",
      text: "The biggest risk is not necessarily the Windows update itself. It is discovering too late that a business-critical application, storage appliance or service still depends on an unsigned NTLM connection.",
    },
    {
      type: "p",
      text: "Start with audit coverage. Identify unsigned connections. Find their owners. Test the affected systems. Then introduce enforcement in controlled stages.",
    },
    {
      type: "p",
      text: "Do not wait until May 2027 to find out what still depends on legacy authentication. The organisations that prepare early will have time to fix the underlying problems without turning a security improvement into an operational incident.",
    },

    {
      type: "h2",
      id: "faqs",
      text: "Frequently asked questions",
    },
  ],

  faq: [
    {
      question: "What is changing with NTLM in May 2027?",
      answer:
        "Microsoft plans to require real NTLM message signing by default on Windows servers from May 2027. Servers will reject clients that do not negotiate the required signing protection for applicable secure connections.",
    },
    {
      question: "Is Microsoft disabling NTLM in May 2027?",
      answer:
        "No. This change is about requiring real NTLM message signing. It is not the same as disabling the NTLM authentication protocol. Organisations should treat NTLM reduction and deprecation as a separate programme.",
    },
    {
      question: "What is the first phase of the NTLM signing change?",
      answer:
        "Windows updates released on and after November 10, 2026, begin making clients offer real NTLM signing by default on non-anonymous connections. During this phase, servers continue accepting signed and unsigned clients while administrators audit connections.",
    },
    {
      question: "Which Windows versions are in scope?",
      answer:
        "Microsoft's KB5135557 lists Windows 11 versions 23H2, 24H2, 25H2, 26H1 and 26H2, Windows 10 Enterprise LTSC 2021, and Windows Server 2016, 2019, 2022 and 2025.",
    },
    {
      question: "What is the difference between NTLM SIGN and ALWAYS_SIGN?",
      answer:
        "NTLMSSP_NEGOTIATE_SIGN (0x00000010) enables real cryptographic message signing using a session key. NTLMSSP_NEGOTIATE_ALWAYS_SIGN (0x00008000) is a legacy placeholder and does not provide real cryptographic message integrity.",
    },
    {
      question: "How do I identify unsigned NTLM connections?",
      answer:
        "Review the Microsoft-Windows-NTLM/Operational log and inspect the negotiated flags in the signing-specific audit events. The real SIGN bit is 0x00000010. Do not rely on event severity alone because signed and unsigned connections can both appear as Warning events.",
    },
    {
      question: "What are NTLM Event IDs 4022 and 4023?",
      answer:
        "Microsoft's signing-specific documentation identifies Event ID 4022 for client-side signing audit information and Event ID 4023 for server-side signing information. Administrators should inspect the event source and message on their installed Windows build, because the broader enhanced auditing documentation also describes event mappings by audit scenario.",
    },
    {
      question: "Will this change affect Kerberos?",
      answer:
        "No. Microsoft's NTLM signing changes apply to NTLM authentication, not Kerberos authentication.",
    },
    {
      question: "Can this change break older NAS devices or scanners?",
      answer:
        "It may affect a device if it relies on an NTLM connection that cannot negotiate real signing. The actual behaviour depends on the device, firmware, protocol and server configuration. Test each affected device rather than assuming that all older devices are incompatible.",
    },
    {
      question: "What does ServerRequireNtlmSign do?",
      answer:
        "ServerRequireNtlmSign is a REG_DWORD value under HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\MSV1_0. A value of 1 requires real NTLM signing for applicable secure connections and rejects unsigned clients. Microsoft recommends enabling it after auditing confirms readiness.",
    },
    {
      question: "Does enabling ServerRequireNtlmSign require a restart?",
      answer:
        "Microsoft's KB5135557 states that a restart is not required for this registry setting. Administrators should still test the change and follow their organisation's approved change process.",
    },
    {
      question: "What happens if an unsigned client is rejected?",
      answer:
        "Microsoft documents SEC_E_UNSUPPORTED_FUNCTION (0x80090302) as an error that rejected clients may encounter during enforcement. A server-side Warning Event 4023 can record this status.",
    },
    {
      question: "Does no unsigned audit result mean my organisation is ready?",
      answer:
        "Not necessarily. Confirm audit coverage across clients and servers, sufficient log retention, representative business activity and central collection. A machine with no recent events does not prove that every system and application can operate with signing enforced.",
    },
  ],

  sources: [
    {
      title:
        "NTLM signing security improvements in Windows - KB5135557",
      publisher: "Microsoft Support",
      url:
        "https://support.microsoft.com/en-us/servicing/os/windows/docs/2026/11/kb5135557-ntlm-signing-security-improvements",
    },
    {
      title:
        "Overview of NTLM auditing enhancements in Windows - KB5064479",
      publisher: "Microsoft Support",
      url:
        "https://support.microsoft.com/en-us/servicing/os/windows/2025/07/overview-of-ntlm-auditing-enhancements-in-windows-11-and-windows-server-2025",
    },
    {
      title:
        "The evolution of Windows authentication",
      publisher: "Microsoft Learn",
      url:
        "https://aka.ms/ntlmlogandblock",
    },
  ],
};
