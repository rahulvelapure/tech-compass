ARTICLE 1
ID: TC-026
Title: DNS Security in the Enterprise: DoH, DoT, and DNS Filtering Explained
Primary keyword: enterprise DNS security
Secondary keywords: DNS over HTTPS, DNS over TLS, DNS filtering, DNS-based threat protection, recursive DNS security
Search intent: Informational / Implementation
Suggested slug: enterprise-dns-security-doh-dot-filtering
Meta title: Enterprise DNS Security: DoH, DoT, and Filtering Explained
Meta description: DNS is the most overlooked security layer in enterprise networks. Learn how DoH, DoT, and DNS filtering actually work, where they help, and where they create blind spots.
Article:
DNS is the oldest, most widely used, and most consistently ignored network service in enterprise security. Every device on your network makes DNS queries. Every web request, every API call, every software update starts with a DNS lookup. Yet most organizations still treat DNS as a plumbing problem — something that resolves names and occasionally needs troubleshooting.
That perception is a liability. DNS is a primary attack surface. Malware uses it for command-and-control. Phishing campaigns rely on DNS to resolve fraudulent domains. Data exfiltration tools encode stolen information inside DNS queries. And the shift toward encrypted DNS — specifically DNS over HTTPS (DoH) and DNS over TLS (DoT) — is quietly undermining the visibility that security teams have relied on for two decades.
This article explains how enterprise DNS security actually works, what encrypted DNS changes, and what organizations should implement to close the gap.
Why DNS Is a Security Problem
DNS was designed in 1983, before the modern threat landscape existed. The protocol operates primarily over UDP port 53, sends queries in plaintext, and has no built-in authentication between the resolver and the client. These design choices create three distinct security problems.
1. DNS as an attack vector. Attackers register domains that resemble legitimate services — micros0ft-login.com, amazon-secure-account.net — and use them in phishing campaigns. Because DNS simply resolves whatever name it is asked about, a recursive resolver will happily return the IP address of a malicious domain. If the resolver does not check the domain against a threat intelligence database, the user reaches the phishing site without any warning.
2. DNS as a covert channel. Malware that has infected a host can use DNS queries to communicate with a command-and-control server. A typical DNS query is small — a few hundred bytes — and most firewalls allow outbound DNS traffic without inspection. An attacker can encode data inside subdomains (data-chunk-1.attacker-domain.com) and exfiltrate information slowly, below the threshold of most intrusion detection systems.
3. DNS as a visibility blind spot. Security teams monitor web traffic through proxy logs, firewall rules, and endpoint agents. But DNS queries often bypass all three. If a user visits a malicious website, the firewall log shows an HTTPS connection to an IP address. Without DNS logs, the security team cannot easily correlate that IP address back to the domain name that was requested.
How Recursive DNS Works
Before explaining the security controls, it helps to understand the resolution chain. When a user types example.com into a browser, the following sequence occurs:
The client sends a query to a recursive resolver — typically operated by the ISP, a public service like Cloudflare or Google, or an internal DNS server.
The recursive resolver checks its local cache. If the answer is not cached, it queries the root nameservers.
The root nameservers refer the resolver to the TLD nameservers (for .com, .org, etc.).
The TLD nameservers refer the resolver to the authoritative nameserver for example.com.
The authoritative nameserver returns the IP address.
The recursive resolver caches the answer and returns it to the client.
This entire process takes milliseconds, but each step is an opportunity for interception, manipulation, or logging. Enterprise DNS security operates primarily at step 1 — the recursive resolver — because that is the single point where all internal DNS traffic converges.
DNS Filtering: The Foundation
DNS filtering is the simplest and most effective DNS security control. The recursive resolver checks every queried domain against a database of known malicious domains and either returns the legitimate IP address or blocks the query.
The threat intelligence database typically categorizes domains by type:
Category
Example
Action
Known malware C2
evil-botnet.com
Block
Phishing
paypa1-secure.com
Block
Newly registered domain
Registered < 24 hours
Flag / Monitor
Category policy
Gambling, adult content
Block or warn
Shadow IT
Personal SaaS tools
Log
Commercial DNS filtering services — Cisco Umbrella, Cloudflare Gateway, Infoblox BloxOne — maintain these databases using automated crawlers, machine learning classification, and community threat feeds. They update continuously because malicious domains have a short lifespan. A typical phishing domain is active for 24 to 72 hours before being taken down. A static blocklist becomes stale within hours.
What DNS filtering catches:
Connections to known command-and-control servers
Phishing domains identified by threat intelligence feeds
Domains associated with ransomware distribution
Newly registered domains (NRDs) that match suspicious patterns
What DNS filtering misses:
Attacks delivered over legitimate domains (e.g., a phishing email hosted on a compromised WordPress site)
Encrypted DNS traffic that bypasses the internal resolver
DNS queries that use hardcoded IP addresses instead of domain names
Encrypted DNS: DoH and DoT
DNS over HTTPS (DoH) and DNS over TLS (DoT) both encrypt DNS queries in transit, preventing network observers from reading or modifying them. They solve a real privacy problem, but they create a security operations problem.
DNS over TLS (DoT) encrypts DNS queries using TLS on port 853. It is defined in RFC 7858. The client establishes a TLS session with the recursive resolver and sends standard DNS queries inside the encrypted tunnel. DoT is relatively easy to deploy because it uses the same DNS message format as traditional DNS — it just wraps it in TLS.
DNS over HTTPS (DoH) sends DNS queries as HTTPS requests, typically using GET or POST methods with the query encoded in the URL or request body. It is defined in RFC 8484. Because DoH traffic looks identical to any other HTTPS traffic, it is extremely difficult for network security tools to distinguish DNS queries from normal web browsing.
The operational consequence is significant. If a user's browser sends DNS queries directly to Cloudflare (1.1.1.1) or Google (8.8.8.8) over DoH, the enterprise recursive resolver never sees the query. The internal DNS filtering policy is bypassed entirely. The security team loses visibility into what domains are being resolved.
This is not hypothetical. Modern browsers — Chrome, Firefox, Edge — enable DoH by default or prompt users to enable it. Windows 11 includes native DoH support at the OS level. If an organization has not explicitly managed this setting, encrypted DNS will erode their DNS security posture silently.
Managing Encrypted DNS in the Enterprise
There are three practical approaches to handling DoH and DoT in an enterprise environment.
Option 1: Block outbound encrypted DNS. Configure the firewall to block outbound connections to port 853 (DoT) and to known DoH endpoints (Cloudflare 1.1.1.1, Google 8.8.8.8, etc.). This forces all DNS traffic back through the internal resolver. It works, but it is a blunt instrument. It breaks applications that require DoH for legitimate privacy reasons, and it does not prevent users from configuring custom DoH endpoints.
Option 2: Run your own DoH resolver. Deploy an internal DoH resolver that enforces the same filtering policies as your traditional recursive resolver. Microsoft Windows Server 2022 supports DoH natively. Infoblox and Cloudflare offer enterprise DoH endpoints that integrate with their filtering products. This approach preserves encryption while maintaining visibility and policy enforcement.
Option 3: Manage DoH at the endpoint level. Use Group Policy, Intune, or an MDM platform to control browser and OS DoH settings. For Windows, this means configuring the DnsPolicyConfig registry settings or using the DNS-over-HTTPS CSP in Intune. For browsers, manage the dns_over_https policy through enterprise browser management.
Option 2 combined with Option 3 is the most robust approach. Run your own DoH resolver so that encrypted queries still pass through your security controls, and manage endpoint settings so that devices point to your resolver rather than a public one.
Practical Implementation Checklist
Centralize recursive DNS. All internal devices should use the enterprise recursive resolver, not public resolvers. Enforce this through DHCP scope options and static configuration for servers.
Enable DNS query logging. Log every query, response, client IP, and timestamp. This data is invaluable during incident response. Retain logs for at least 90 days.
Deploy DNS filtering. Subscribe to a threat intelligence feed and configure the resolver to block known malicious domains. Start with logging-only mode for two weeks to identify false positives before switching to block mode.
Control encrypted DNS. Deploy DoH on the internal resolver. Use endpoint management to enforce DoH settings on browsers and operating systems. Block outbound DoT (port 853) at the firewall as a safety net.
Monitor for DNS anomalies. Alert on unusual query patterns: high volumes of queries to a single domain, queries with unusually long subdomains (potential data exfiltration), and queries to newly registered domains.
Test with a phishing simulation. Register a benign test domain, add it to your blocklist, and verify that internal users are actually blocked. If they are not, your DNS security controls have a gap.
Where DNS Security Fits in the Broader Architecture
DNS filtering is not a replacement for a web proxy, an endpoint detection platform, or an email security gateway. It is a complementary layer that catches threats at the earliest possible point — before a TCP connection is established, before a file is downloaded, before a credential is submitted.
A practical enterprise security stack treats DNS as the first line of defense:
DNS filtering blocks connections to known-bad domains.
Web proxy inspects HTTP/HTTPS traffic for malicious content.
Endpoint protection detects and blocks malware execution.
Email security filters phishing emails before they reach the inbox.
Each layer catches what the previous one misses. DNS filtering alone will not stop a zero-day exploit or a sophisticated supply chain attack. But it will stop the majority of opportunistic attacks that rely on DNS to reach their infrastructure.
FAQ
Does DNS over HTTPS make my network less secure?
It can, if you are not managing it. DoH bypasses your internal DNS resolver if the client sends queries directly to a public DoH service. The solution is not to block DoH entirely, but to run your own DoH resolver that enforces your security policies.
Is DNS filtering enough to stop phishing?
No. DNS filtering catches phishing domains that have been identified by threat intelligence feeds. Sophisticated phishing campaigns that use compromised legitimate domains or brand-new domains may not be caught. DNS filtering should be combined with email security, browser isolation, and user awareness training.
Should I use public DNS services like Cloudflare or Google?
For personal use, they are fine. For enterprise use, they bypass your internal security controls. Use your own recursive resolver with filtering, or use the enterprise versions of these services that support policy enforcement.
How do I detect DNS tunneling?
Look for DNS queries with unusually long subdomains (over 30 characters), high query volumes to a single domain, and TXT record queries that carry encoded payloads. Most DNS security platforms include anomaly detection for these patterns.
What is the performance impact of DNS filtering?
Minimal. DNS queries are small and fast. A well-configured resolver adds less than 1 millisecond of latency per query. Caching eliminates most repeated lookups. The security benefit far outweighs the negligible performance cost.
Conclusion
DNS security is not a new concept, but it remains one of the most underutilized controls in enterprise environments. The combination of DNS filtering, encrypted DNS management, and query logging provides broad threat protection at a single architectural choke point — the recursive resolver.
The shift toward DoH and DoT makes this more urgent, not less. If organizations do not actively manage encrypted DNS, they will lose visibility into a layer of network activity that has historically been their most reliable source of threat intelligence. The fix is straightforward: run your own encrypted DNS resolver, enforce endpoint configuration, and log everything.
Research Sources
Source: RFC 8484 — DNS Queries over HTTPS (DoH)
Organization: IETF
URL: https://datatracker.ietf.org/doc/html/rfc8484
Why used: Defines the DoH protocol, message format, and HTTP integration.
Source: RFC 7858 — Specification for DNS over Transport Layer Security (TLS)
Organization: IETF
URL: https://datatracker.ietf.org/doc/html/rfc7858
Why used: Defines the DoT protocol on port 853 and its relationship to standard DNS.
Source: Cloudflare Learning Center — What is DNS over HTTPS?
Organization: Cloudflare
URL: https://www.cloudflare.com/learning/dns/dns-over-tls/
Why used: Practical explanation of DoH vs DoT differences and deployment considerations.
Source: NIST SP 800-81-3 — Domain Name System (DNS) Cybersecurity Guide
Organization: NIST
URL: https://csrc.nist.gov/publications/detail/sp/800-81-3/final
Why used: Federal guidance on DNS security controls, filtering, and encrypted DNS management.
Editorial Verification Notes
Verify current Windows Server DoH support status. Windows Server 2022 introduced DoH, but confirm whether Windows Server 2025 has expanded this.
Verify current browser default DoH behavior for Chrome, Firefox, and Edge enterprise editions. These defaults change between major releases.
The article does not cite specific threat statistics (e.g., "X% of malware uses DNS"). This is intentional. Claude should verify whether any authoritative source (Verizon DBIR, Cisco Talos) has published DNS-specific attack statistics that would strengthen the article.
Confirm that Infoblox BloxOne and Cisco Umbrella are still the primary commercial DNS security platforms referenced. Product names may have changed.
ARTICLE 2
ID: TC-027
Title: BitLocker and TPM: What Actually Happens When Your Hardware Fails
Primary keyword: BitLocker TPM failure recovery
Secondary keywords: BitLocker recovery key, TPM 2.0 failure, BitLocker enterprise management, disk encryption recovery, Windows encryption troubleshooting
Search intent: Troubleshooting / Educational
Suggested slug: bitlocker-tpm-failure-recovery-enterprise
Meta title: BitLocker TPM Failure: What Happens and How to Recover
Meta description: TPM failures trigger BitLocker recovery mode unexpectedly. Learn why this happens, how recovery keys work, and what enterprise IT teams must have in place before it becomes a crisis.
Article:
A user arrives at their desk, opens their laptop, and instead of the familiar Windows login screen, they see a blue recovery prompt: "Enter the BitLocker recovery key." The user does not have the key. They call the helpdesk. The helpdesk searches for the key in Active Directory, Microsoft Entra ID, or a printed sheet that may or may not exist. If the key is not found, every file on that machine is permanently inaccessible.
This scenario plays out in enterprise IT departments regularly. BitLocker is the most widely deployed full-disk encryption tool in Windows environments, and it works silently and reliably most of the time. But when it does not work — when a TPM fails, a firmware update resets hardware state, or a motherboard is replaced — the recovery process exposes gaps in key management that many organizations have never properly addressed.
This article explains the technical mechanics of BitLocker and TPM, what triggers recovery mode, and what enterprise teams need to have in place to handle failures without data loss.
How BitLocker and TPM Work Together
BitLocker encrypts the entire Windows volume using AES encryption, typically with a 128-bit or 256-bit key. The encryption happens at the block level, meaning every sector of the disk is encrypted. Without the decryption key, the data on the disk is indistinguishable from random noise.
The Trusted Platform Module (TPM) is a hardware chip on the motherboard that provides a secure, tamper-resistant environment for storing cryptographic keys. BitLocker uses the TPM as the primary key protector. Here is the sequence:
When the machine boots, the UEFI firmware initializes the hardware.
The Windows Boot Manager starts and hands control to BitLocker.
BitLocker queries the TPM for the volume master key.
The TPM checks the Platform Configuration Registers (PCRs) — hardware measurements that capture the boot state, including firmware version, boot order, and the integrity of early boot components.
If the PCR values match the expected state recorded when BitLocker was enabled, the TPM releases the key and the OS boots normally.
If the PCR values have changed — because firmware was updated, a boot component was modified, or hardware was replaced — the TPM refuses to release the key. BitLocker enters recovery mode and prompts for the recovery key.
The recovery key is a 48-digit numeric password that acts as a fallback. It is not stored on the TPM. It is a separate credential that must be stored somewhere outside the encrypted machine — in Active Directory, in Microsoft Entra ID, on a USB drive, or printed on paper.
What Triggers BitLocker Recovery Mode
Recovery mode is not a malfunction. It is the TPM correctly detecting that something about the boot environment has changed and refusing to release the key until the change is verified. Common triggers include:
Firmware or BIOS updates. Updating UEFI firmware changes the PCR measurements. The TPM sees a different boot state and enters recovery mode. This is the most common cause of unexpected recovery prompts in enterprise fleets.
Hardware changes. Replacing the motherboard, TPM chip, or hard drive changes the hardware identity. The new TPM has no knowledge of the BitLocker volume and cannot release the key.
Boot order changes. Changing the boot order in UEFI (for example, to boot from USB for OS reinstallation) alters the PCR values. BitLocker may enter recovery mode when the boot order is restored.
Secure Boot state changes. Disabling Secure Boot or modifying Secure Boot keys changes the measured boot environment.
TPM firmware vulnerabilities. When a TPM vulnerability is disclosed (such as the ROCA vulnerability affecting certain Infineon TPMs), Microsoft may issue guidance that requires clearing the TPM, which triggers recovery.
OS updates that modify early boot components. Major Windows feature updates occasionally change the boot chain in ways that alter PCR values.
The Enterprise Key Management Problem
BitLocker offers several options for storing recovery keys:
Storage Location
Pros
Cons
Microsoft Entra ID
Automatic, cloud-managed, easy for helpdesk to retrieve
Requires Entra ID join or hybrid join
Active Directory
Integrated with on-prem GPO, familiar to IT teams
Requires GPO configuration, key is stored in a computer object attribute
USB drive
Offline, air-gapped
Easily lost, not practical for large fleets
Printed paper
Simple, no infrastructure needed
Degrades, lost, not auditable
Microsoft Account (consumer)
Automatic for consumer Windows
Not appropriate for enterprise
In a well-managed enterprise environment, the primary recovery key location should be either Active Directory (via Group Policy) or Microsoft Entra ID (via MDM/Intune). The critical requirement is that the key is escrowed automatically at the time BitLocker is enabled, not manually after the fact.
The Group Policy path (on-premises AD):
The policy "Choose how BitLocker-protected operating system drives can be recovered" under Computer Configuration > Administrative Templates > Windows Components > BitLocker Drive Encryption > Operating System Drives must be configured to save recovery information to AD DS. If this policy is not applied before BitLocker is enabled, the recovery key is generated locally and never escrowed. The user has the key on a printed sheet or USB drive, and the helpdesk has no record of it.
The Intune / Entra ID path (cloud):
When a device is enrolled in Intune and BitLocker is enabled via an Endpoint Security policy, the recovery key is automatically rotated and stored in the device object in Entra ID. The helpdesk can retrieve it from the Intune portal or the Entra ID device overview page. This is the cleanest model for modern, cloud-managed fleets.
What Happens During a TPM Failure
When a TPM chip fails — due to hardware defect, firmware corruption, or physical damage — the consequences depend on the BitLocker configuration.
If the TPM was the sole key protector, the machine cannot boot. The user sees the BitLocker recovery prompt. The 48-digit recovery key is the only way to unlock the volume. Without it, the data is unrecoverable. No amount of forensic effort can extract the encryption key from a failed TPM.
If BitLocker was configured with a TPM + PIN protector, the PIN is stored in the TPM. A TPM failure makes the PIN inaccessible as well, so the recovery key is still required.
If BitLocker was configured with a TPM + USB startup key protector, the USB key contains a portion of the key material. However, the TPM still validates the platform state. If the TPM has failed, the USB key alone may not be sufficient, depending on the failure mode.
In all cases, the recovery key is the ultimate fallback. This is why key escrow is non-negotiable.
Real-World Scenario: The Firmware Update Crisis
A mid-size company with 800 Windows 11 laptops pushes a UEFI firmware update through their standard patching process. The update changes the firmware version on all affected machines.
The next morning, approximately 200 users report BitLocker recovery prompts. The firmware update altered the PCR measurements, causing the TPM to enter recovery mode on machines where BitLocker was enabled with TPM-only protection.
The helpdesk scrambles to locate recovery keys. For machines managed through Intune, the keys are available in the Entra ID portal. For machines still managed through on-premises Group Policy, the keys are in Active Directory — but only for machines where the GPO was correctly applied before BitLocker was enabled. Roughly 30 machines were imaged with BitLocker enabled before the GPO was linked to the correct OU. Their recovery keys were never escrowed.
For those 30 machines, the data is lost. The machines must be wiped and reimaged. The incident costs the company two days of productivity and triggers a full review of their BitLocker deployment process.
The fix:
The IT team implements a policy that prevents firmware updates from being deployed to BitLocker-enabled machines without first suspending BitLocker protection. Windows supports this via the manage-bde -protectors -disable command or through Intune policies that coordinate firmware and BitLocker updates. They also audit every machine to confirm recovery key escrow before enabling BitLocker.
Operational Recommendations
Verify key escrow before enabling BitLocker. Run an audit script that checks whether every BitLocker-enabled device has a recovery key stored in AD or Entra ID. Microsoft provides the Get-BitLockerVolume PowerShell cmdlet for this purpose.
Coordinate firmware updates with BitLocker. Before deploying UEFI or BIOS updates, suspend BitLocker protection, apply the update, and resume protection. Automate this sequence in your patching pipeline.
Use TPM 2.0. Older TPM 1.2 chips have known vulnerabilities and are being deprecated. Windows 11 requires TPM 2.0 for BitLocker with modern boot protection.
Monitor TPM health. Windows Event Log contains TPM-related events. Configure monitoring for TPM errors (Event ID 1794, 1795, and others in the Microsoft-Windows-TPM-WMI provider).
Test recovery procedures. Periodically test the recovery process on a non-production machine. Trigger recovery mode intentionally, retrieve the key from your escrow location, and verify that the volume can be unlocked. If the process is not tested, it will fail when it matters most.
Document the helpdesk procedure. When a user reports a BitLocker recovery prompt, the helpdesk needs a clear, step-by-step procedure: verify the user's identity, locate the recovery key, provide the 48-digit code, and confirm successful boot.
FAQ
Can I recover data from a BitLocker-encrypted drive without the recovery key?
No. BitLocker uses AES encryption. Without the volume master key or the recovery key, the data is computationally infeasible to decrypt. No forensic tool can bypass this.
How do I find my BitLocker recovery key in Microsoft Entra ID?
Sign in to the Microsoft Entra admin center, navigate to Devices, select the device, and view the "Recovery keys" section. The key is displayed as a 48-digit number. Intune administrators can also retrieve it from the Intune portal under Device overview.
Does replacing the motherboard trigger BitLocker recovery?
Yes. The new motherboard has a different TPM. The PCR measurements will not match, and BitLocker will enter recovery mode. You need the recovery key to unlock the volume.
Should I use TPM + PIN instead of TPM only?
TPM + PIN adds an additional layer of protection against offline attacks, because the attacker needs both the TPM and the PIN. However, it adds user friction and does not protect against TPM failure — the recovery key is still required. For most enterprise environments, TPM-only with strong endpoint detection is sufficient. For high-security environments, TPM + PIN is recommended.
What is the difference between BitLocker and Device Encryption?
Device Encryption is a simplified version of BitLocker available on Windows Home and some Windows Pro editions. It encrypts the drive automatically but offers fewer configuration options and does not support TPM + PIN or USB startup keys. Enterprise environments should use full BitLocker, managed through Group Policy or Intune.
Conclusion
BitLocker is reliable, but TPM failures are not rare. They happen during firmware updates, hardware replacements, and component failures. The difference between a minor helpdesk ticket and a permanent data loss event is whether the recovery key was properly escrowed.
The operational lesson is straightforward: treat BitLocker recovery key management as a first-class infrastructure concern. Verify escrow before enabling encryption. Coordinate firmware updates with BitLocker lifecycle. Test recovery procedures regularly. When the TPM fails — and it will — the preparation is the only thing standing between a recoverable incident and lost data.
Research Sources
Source: BitLocker overview
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/
Why used: Authoritative documentation on BitLocker architecture, TPM integration, and recovery key management.
Source: TPM Recommendations
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/windows/security/identity-protection/tpm/tpm-recommendations
Why used: Guidance on TPM 2.0 requirements, firmware update coordination, and TPM health monitoring.
Source: NIST SP 800-147 — BIOS Protection Guidelines
Organization: NIST
URL: https://csrc.nist.gov/publications/detail/sp/800-147/final
Why used: Federal guidance on firmware integrity and its relationship to measured boot and TPM PCR validation.
Source: Manage BitLocker recovery in Intune
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/mem/intune/protect/encrypt-devices
Why used: Practical documentation on cloud-based BitLocker recovery key escrow through Microsoft Intune and Entra ID.
Editorial Verification Notes
Verify current Windows 11 TPM requirements. The article states TPM 2.0 is required. Confirm this has not changed with recent Windows 11 builds.
Confirm that the manage-bde -protectors -disable command is still the recommended method for suspending BitLocker during firmware updates.
The article references Event IDs 1794 and 1795 for TPM errors. Verify these are still accurate for Windows 11 24H2 / 25H2.
Consider adding a note about BitLocker behavior with Windows 11 Secure Boot and Measured Boot, as these interact with TPM PCR validation.
ARTICLE 3
ID: TC-028
Title: Microsoft Entra ID Privileged Identity Management: Why Most Implementations Fail
Primary keyword: Entra ID PIM implementation
Secondary keywords: Privileged Identity Management, JIT access, Entra ID roles, PIM activation, privileged access management Microsoft
Search intent: Implementation / Educational
Suggested slug: entra-id-pim-implementation-failures
Meta title: Entra ID PIM: Why Most Implementations Fail and How to Fix Them
Meta description: Privileged Identity Management is powerful but frequently misconfigured. Learn the operational mistakes that undermine PIM and how to implement it effectively.
Article:
Privileged Identity Management (PIM) is Microsoft's just-in-time access control system for Microsoft Entra ID roles and Azure resource roles. Instead of granting a user a permanent Global Administrator or Privileged Role Administrator assignment, PIM allows the user to activate the role for a limited time, with approval, MFA, and logging.
The concept is sound. Permanent standing privileges are a major security risk. If an account with Global Admin rights is compromised, the attacker has unrestricted access to the entire tenant. PIM eliminates that standing privilege by requiring explicit activation for every privileged action.
In practice, however, many PIM deployments fail to deliver the security benefit they promise. Organizations enable PIM, assign roles, and then discover that the implementation is either too restrictive (blocking legitimate administrative work) or too permissive (approving every activation automatically). The result is a tool that adds friction without meaningfully reducing risk.
This article examines why PIM implementations commonly fail and what a well-configured deployment actually looks like.
What PIM Actually Does
PIM operates on a simple model. A user is assigned an eligible role rather than an active role. When the user needs to perform a privileged task, they activate the role through the Azure portal or the Entra admin center. The activation triggers a workflow that may require:
Multi-factor authentication
Approval from one or more designated approvers
A justification explaining why the activation is needed
A ticket number linking the activation to a change request
Once approved, the role becomes active for a configurable duration — typically 1 to 8 hours. After the duration expires, the role deactivates automatically. The activation, approval, and deactivation events are logged in the Entra ID audit logs.
PIM supports two categories of roles:
Entra ID roles: Global Administrator, Privileged Role Administrator, Exchange Online Administrator, SharePoint Administrator, Security Administrator, and approximately 40 other built-in roles.
Azure resource roles: Owner, Contributor, User Access Administrator, and custom roles scoped to management groups, subscriptions, resource groups, or individual resources.
The Standing Privilege Problem
The core security argument for PIM is straightforward. In a typical environment without PIM, a small number of users hold permanent Global Administrator or Privileged Role Administrator assignments. These accounts are high-value targets. If one is compromised through phishing, credential theft, or session hijacking, the attacker inherits full administrative control over the tenant.
With PIM, the same user holds an eligible assignment. To gain administrative access, they must activate the role. The activation requires MFA, may require approval, and is time-limited. If the attacker compromises the account, they cannot silently activate the role without triggering MFA and potentially alerting the approver.
This is a meaningful security improvement, but only if the activation workflow is configured correctly. This is where most implementations go wrong.
Common Implementation Failures
Failure 1: Auto-approval without justification requirements.
Many organizations configure PIM to require no approval and no justification. The user clicks "Activate," completes MFA, and the role is granted immediately. This removes the standing privilege but does not add meaningful oversight. An attacker who compromises the MFA session (through SIM swapping, MFA fatigue, or token theft) can activate the role just as easily as the legitimate user.
The fix: Require at least one approver for high-privilege roles (Global Administrator, Privileged Role Administrator). Require a justification for all activations. For the most sensitive roles, require a ticket number that links the activation to an approved change request.
Failure 2: Activation duration is too long.
Setting the activation duration to 8 hours or 24 hours defeats the purpose of just-in-time access. If a user activates Global Admin at 9:00 AM and performs their task by 9:15 AM, the role remains active until 5:00 PM or later. During that window, a compromised session can be exploited.
The fix: Set activation durations to the minimum necessary for the task. For most administrative tasks, 1 to 2 hours is sufficient. For complex migrations or emergency break-glass scenarios, 4 hours may be appropriate. Avoid durations longer than 8 hours.
Failure 3: Too many eligible administrators.
If 20 people are eligible for Global Administrator, the security benefit of PIM is diluted. Each eligible account is a potential target for activation-based attacks. PIM does not reduce the number of privileged accounts; it changes how those accounts exercise privilege.
The fix: Audit eligible assignments quarterly. Remove eligibility from users who do not regularly perform privileged tasks. For roles that are needed infrequently (e.g., Exchange Online Administrator for quarterly mailbox migrations), consider temporary eligibility assignments that expire after a set date.
Failure 4: Ignoring Azure resource roles.
Many organizations configure PIM for Entra ID roles but leave Azure resource roles (Owner, Contributor) as permanent assignments. An attacker who compromises an Azure subscription Owner can create resources, deploy malicious workloads, and access data — all without triggering PIM.
The fix: Enable PIM for Azure resource roles at the management group level. This ensures that Owner and Contributor assignments are eligible, not active, and require activation with approval.
Failure 5: No alerting on activation events.
PIM generates audit logs for every activation, approval, and deactivation. If nobody is monitoring these logs, an unauthorized activation may go unnoticed.
The fix: Create a Microsoft Sentinel alert rule (or equivalent SIEM rule) that triggers on PIM activation events for high-privilege roles. The alert should include the user identity, the role activated, the justification provided, and the activation duration. Route these alerts to the security operations team for review.
Practical Configuration Guidance
For a well-balanced PIM deployment, the following configuration is a reasonable starting point:
Role
Approval Required
MFA Required
Justification Required
Max Duration
Global Administrator
Yes (2 approvers)
Yes
Yes + ticket number
2 hours
Privileged Role Administrator
Yes (2 approvers)
Yes
Yes + ticket number
2 hours
Security Administrator
Yes (1 approver)
Yes
Yes
4 hours
Exchange Online Administrator
No
Yes
Yes
8 hours
SharePoint Administrator
No
Yes
Yes
8 hours
Azure Subscription Owner
Yes (1 approver)
Yes
Yes
4 hours
Azure Contributor
No
Yes
Yes
8 hours
The most privileged roles (Global Admin, Privileged Role Admin) should always require approval and a ticket number. Lower-privilege roles that are used frequently for routine tasks can skip approval but should still require MFA and justification.
Break-Glass Accounts
Every tenant needs at least one emergency access account that is excluded from PIM. This account is used when PIM itself is unavailable — for example, if the approval workflow is misconfigured, the approvers are unreachable, or a tenant-wide outage prevents PIM activation.
Break-glass accounts should be:
Cloud-only accounts (not synced from on-premises AD)
Excluded from Conditional Access policies that could block access
Protected with FIDO2 security keys (not password + SMS)
Stored in a secure vault with split knowledge (no single person knows the full credentials)
Monitored with high-priority alerts (any sign-in to a break-glass account should trigger an immediate security response)
PIM should not manage break-glass accounts. Their purpose is to function when PIM cannot.
FAQ
Does PIM work with on-premises Active Directory roles?
No. PIM manages Entra ID roles and Azure resource roles only. For on-premises Active Directory, you need a separate privileged access management solution such as Microsoft Identity Manager or a third-party PAM tool.
Can PIM be used with Microsoft 365 admin roles?
Yes. Microsoft 365 admin roles (Exchange Online Admin, SharePoint Admin, Teams Admin) are Entra ID roles and are supported by PIM.
What happens if a PIM activation is in progress and the user's session is hijacked?
If the attacker has a valid session token, they can potentially use the activated role until it expires. This is why activation durations should be short and why Conditional Access policies should enforce device compliance and session controls. PIM reduces the window of exposure but does not eliminate session-based attacks.
Is PIM included in all Microsoft 365 licenses?
No. PIM requires Microsoft Entra ID P2 licensing, which is included in Microsoft 365 E5 and available as a standalone license. Entra ID P1 does not include PIM.
How does PIM interact with Conditional Access?
PIM and Conditional Access are complementary. PIM controls whether a role can be activated. Conditional Access controls whether the user can access resources once the role is active. You can create a Conditional Access policy that requires a specific authentication context for PIM activation, adding an additional layer of verification.
Conclusion
Privileged Identity Management is one of the most effective tools available for reducing the risk of privileged account compromise in Microsoft Entra ID. But it is not a configuration-and-forget solution. An auto-approved PIM with 24-hour activations and 30 eligible Global Administrators provides minimal security benefit over permanent role assignments.
The value of PIM comes from its operational discipline: short activation windows, mandatory approval for the most sensitive roles, justification requirements, and active monitoring of activation events. Organizations that invest in configuring PIM properly — and that treat PIM alerts as security events worth investigating — will see a genuine reduction in their privileged access risk. Those that treat it as a checkbox will find that it adds friction without adding protection.
Research Sources
Source: What is Microsoft Entra Privileged Identity Management?
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure
Why used: Authoritative documentation on PIM architecture, role activation, and configuration options.
Source: Plan a Microsoft Entra Privileged Identity Management deployment
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-deployment-plan
Why used: Microsoft's recommended deployment approach, including role categorization and approval workflows.
Source: NIST SP 800-207 — Zero Trust Architecture
Organization: NIST
URL: https://csrc.nist.gov/publications/detail/sp/800-207/final
Why used: Context for just-in-time access as a component of Zero Trust architecture.
Editorial Verification Notes
Verify current PIM licensing requirements. The article states Entra ID P2 is required. Confirm this has not changed with recent Microsoft licensing updates.
Confirm that PIM now supports Entra ID PIM for Groups (a newer feature) and consider whether this should be mentioned.
The break-glass account guidance is standard industry practice. Verify against Microsoft's current emergency access account documentation.
Check whether PIM activation duration limits have changed. The article recommends 1-8 hours. Confirm the maximum configurable duration in the current Entra ID P2 tier.
ARTICLE 4
ID: TC-029
Title: Kubernetes Gateway API vs Ingress: What Actually Changes and When to Migrate
Primary keyword: Kubernetes Gateway API vs Ingress
Secondary keywords: Kubernetes Gateway API migration, Ingress controller replacement, HTTPRoute, GatewayClass, Kubernetes traffic management
Search intent: Comparison / Educational
Suggested slug: kubernetes-gateway-api-vs-ingress-migration
Meta title: Kubernetes Gateway API vs Ingress: What Changes and When to Migrate
Meta description: The Gateway API is replacing Kubernetes Ingress. Learn the architectural differences, what changes operationally, and when migration makes sense.
Article:
For most of Kubernetes' history, getting external traffic into a cluster required one primary abstraction: the Ingress resource. You defined an Ingress object, pointed it at a backend service, and an Ingress controller — typically NGINX, Traefik, or HAProxy — translated that object into load balancer rules, TLS termination, and routing logic.
The Ingress model worked, but it had structural limitations. It was designed for simple HTTP/HTTPS routing. It lacked native support for TCP and UDP traffic. It had no built-in mechanism for separating the concerns of infrastructure operators (who manage the load balancer) and application developers (who define routing rules). And its annotation-based configuration became a sprawling, controller-specific mess where every vendor invented their own YAML extensions.
The Gateway API is the replacement. It is not a minor revision. It is a fundamentally different approach to traffic management in Kubernetes, and it is now the direction the community is moving. Understanding what changes — and what does not — is essential for any team operating Kubernetes clusters in production.
The Structural Problem with Ingress
The Kubernetes Ingress resource was introduced in 2015. It defines a set of rules for routing external HTTP/HTTPS traffic to internal services. A minimal Ingress object looks like this:
yaml

123456789101112
This is clean for simple use cases. But real-world requirements quickly push beyond what the Ingress spec supports.
Problem 1: Annotations become a configuration language.
The Ingress spec has no fields for rate limiting, header manipulation, request mirroring, canary deployments, or gRPC routing. To configure these, teams use controller-specific annotations:
yaml

12345
These annotations are not portable. An annotation that works with the NGINX Ingress Controller does not work with Traefik, and vice versa. Teams become locked into a specific controller's annotation vocabulary.
Problem 2: No separation of concerns.
The Ingress object conflates two responsibilities: the infrastructure layer (the load balancer, its IP address, its TLS certificate) and the application layer (the routing rules). In a large organization, the infrastructure team manages the load balancer while application teams define the routes. With Ingress, both concerns live in the same YAML document, creating a collaboration bottleneck.
Problem 3: No TCP/UDP routing.
Ingress only handles HTTP and HTTPS. If you need to expose a database, a message queue, or a game server on a raw TCP port, you must configure the Ingress controller through its own ConfigMap or use a separate mechanism entirely.
How the Gateway API Solves These Problems
The Gateway API introduces a layered model with distinct resource types, each owned by a different persona.
GatewayClass: Defines the type of gateway implementation. This is managed by the platform team. Examples: nginx-gateway-class, istio-gateway-class, envoy-gateway-class. The GatewayClass tells Kubernetes which controller should handle Gateway resources of this class.
Gateway: Represents the actual load balancer or proxy. It defines the listener configuration — which ports to listen on, which protocols to accept, and which TLS certificates to use. This is managed by the infrastructure team.
HTTPRoute (and TCPRoute, TLSRoute, UDPRoute, GRPCRoute): Defines the routing rules. Which paths go to which backend services. This is managed by the application team.
This separation is the core architectural improvement. The platform team creates the GatewayClass. The infrastructure team creates the Gateway with listeners. The application team creates HTTPRoutes that attach to the Gateway. Each team manages their own resource type without stepping on the others.
A Practical Comparison
Consider a common requirement: route app.example.com/api to one service and app.example.com/web to another, with TLS termination.
Ingress approach:
yaml

12345678910111213141516171819202122232425262728
Gateway API approach:
yaml

1234567891011121314151617181920212223242526272829303132333435363738
The Gateway API version is slightly more verbose, but the separation is clear. The Gateway object owns the listener and TLS configuration. The HTTPRoute object owns the routing rules. If a different team needs to add a route for /admin, they create a new HTTPRoute that references the same Gateway without modifying the Gateway object itself.
What Changes Operationally
Controller compatibility. The Gateway API is implemented by multiple controllers: NGINX Gateway Fabric, Envoy Gateway, Istio, Traefik, Cilium, and others. However, not all controllers implement the full Gateway API specification. Some support only HTTPRoute. Others add TCPRoute and UDPRoute. Before migrating, verify that your target controller supports the route types you need.
RBAC changes. Because the Gateway API separates concerns across different resource types, RBAC policies need to be updated. Application developers should have permission to create HTTPRoutes but not Gateways or GatewayClasses. This requires new Role and RoleBinding definitions.
Migration from Ingress. The Gateway API project provides a migration tool called ingress2gateway that converts Ingress objects to Gateway API resources. This handles simple cases well but may not capture complex annotation-based configurations. Teams with heavily annotated Ingress resources should plan for manual review during migration.
Coexistence. Ingress and Gateway API can coexist in the same cluster. You do not need to migrate everything at once. A pragmatic approach is to deploy the Gateway API controller alongside the existing Ingress controller, migrate one service at a time, and decommission the Ingress controller when all services have been moved.
When to Migrate
Migrate now if:
You are deploying a new Kubernetes cluster and want to start with the modern traffic management model.
Your current Ingress setup relies heavily on controller-specific annotations that are becoming unmaintainable.
You need TCP, UDP, or gRPC routing, which Ingress does not support natively.
You are adopting a service mesh (Istio, Linkerd) that uses the Gateway API as its external traffic entry point.
Delay migration if:
Your current Ingress controller is stable, well-understood, and meets all your requirements.
Your team does not yet have experience with the Gateway API resource model.
You are in the middle of a larger platform migration and adding another change would increase risk.
The Gateway API reached GA (v1.0) in October 2023 and has been stable since. It is not experimental. But migration is not urgent if your current setup works. The decision should be driven by operational need, not by the desire to adopt the latest specification.
FAQ
Is the Gateway API a replacement for service meshes?
No. The Gateway API handles external traffic entering the cluster. Service meshes handle internal service-to-service traffic. They are complementary. Istio, for example, uses the Gateway API for its ingress gateway while maintaining its own sidecar-based mesh for internal traffic.
Does the Gateway API replace the Kubernetes Service resource?
No. Services still define the internal network endpoint for a set of pods. The Gateway API routes traffic to Services. The Service resource remains unchanged.
Can I use the Gateway API with AWS ALB or GCP Load Balancer?
Yes. AWS Load Balancer Controller and GKE Gateway API both implement the Gateway API specification. The GatewayClass references the cloud provider's controller, and the Gateway resource provisions the appropriate cloud load balancer.
What happens to my existing Ingress resources during migration?
They continue to work. The Ingress controller and the Gateway API controller can run side by side. You can migrate services one at a time without disrupting existing traffic.
Conclusion
The Gateway API is not an incremental improvement over Ingress. It is a rethinking of how traffic management should be structured in Kubernetes, with clear separation between infrastructure, platform, and application concerns. The annotation-driven, controller-specific configuration model of Ingress is being replaced by a portable, role-based, protocol-aware API.
Migration does not need to be a big-bang event. Start with new workloads, use the ingress2gateway tool for simple conversions, and migrate complex annotation-heavy resources manually. The Gateway API is the future of Kubernetes traffic management, and teams that begin adopting it now will avoid the accumulated technical debt of Ingress annotations.
Research Sources
Source: Gateway API Documentation
Organization: Kubernetes SIG-Network / CNCF
URL: https://gateway-api.sigs.k8s.io/
Why used: The authoritative specification for Gateway API resources, including GatewayClass, Gateway, HTTPRoute, and their lifecycle.
Source: Ingress to Gateway API Migration
Organization: Kubernetes SIG-Network
URL: https://gateway-api.sigs.k8s.io/guides/migrating-from-ingress/
Why used: Official migration guidance, including the ingress2gateway tool and coexistence strategies.
Source: Kubernetes Ingress Documentation
Organization: Kubernetes
URL: https://kubernetes.io/docs/concepts/services-networking/ingress/
Why used: Baseline documentation for the Ingress resource model, used for comparison with the Gateway API.
Editorial Verification Notes
Verify the current GA status of Gateway API. The article references v1.0 GA from October 2023. Confirm the latest stable version and whether v1.1 or later has introduced breaking changes.
Confirm which Ingress controllers now support Gateway API. The article mentions NGINX Gateway Fabric, Envoy Gateway, Istio, Traefik, and Cilium. Verify this list is current.
The ingress2gateway tool is maintained by the Gateway API project. Verify its current status and compatibility with the latest Gateway API version.
Consider whether a comparison table of Gateway API vs Ingress features would improve clarity. The current article uses prose and code examples, which may be sufficient.
ARTICLE 5
ID: TC-030
Title: Container Image Security: Why Vulnerability Scanning Alone Does Not Protect You
Primary keyword: container image security
Secondary keywords: container vulnerability scanning, image signing, runtime container security, supply chain security containers, container security best practices
Search intent: Educational / Implementation
Suggested slug: container-image-security-beyond-scanning
Meta title: Container Image Security: Why Scanning Alone Is Not Enough
Meta description: Vulnerability scanners find CVEs in container images, but they don't prevent runtime attacks or supply chain compromise. Learn what a complete container security model looks like.
Article:
Most container security programs start the same way. A team deploys a vulnerability scanner — Trivy, Snyk, Aqua Security, or a cloud-native equivalent — points it at their container registry, and generates a report. The report lists hundreds of CVEs across dozens of images. The team triages the criticals, patches what they can, accepts the risk for the rest, and considers the problem addressed.
This approach catches known vulnerabilities in base images and language dependencies. But it addresses only one layer of the container security problem. A container image can be free of known CVEs and still be compromised through a malicious dependency, a misconfigured runtime, or an unsigned image that an attacker swapped in the registry.
Container security is a lifecycle problem. It spans the build pipeline, the registry, the deployment process, and the runtime environment. Scanning covers one phase. This article maps the full lifecycle and explains what is missing when scanning is the only control.
The Container Image Lifecycle
A container image passes through four distinct phases, each with its own threat surface.
Phase 1: Build. The Dockerfile is written, base images are pulled, dependencies are installed, and the application is compiled. Threats at this phase include malicious base images, compromised package registries, and secrets leaked into image layers.
Phase 2: Storage. The image is pushed to a container registry (Docker Hub, Amazon ECR, Azure Container Registry, Google Artifact Registry). Threats at this phase include unauthorized image modification, registry access misconfiguration, and lack of image provenance verification.
Phase 3: Deployment. The image is pulled from the registry and deployed to a Kubernetes cluster or container runtime. Threats at this phase include pulling unsigned images, deploying images with known critical vulnerabilities, and misconfigured pod security contexts.
Phase 4: Runtime. The container is running. Threats at this phase include process injection, file system modification, unexpected network connections, and privilege escalation through misconfigured capabilities.
Vulnerability scanning addresses Phase 1 (partially) and Phase 3 (partially). It does not address Phase 2 or Phase 4 at all.
What Vulnerability Scanning Actually Catches
A container image scanner analyzes the file system of an image and compares installed packages against vulnerability databases. It identifies:
Known CVEs in the base operating system packages (e.g., OpenSSL, glibc, curl)
Known CVEs in language-specific dependencies (e.g., npm packages, Python pip packages, Java Maven artifacts)
Misconfigurations in the Dockerfile (e.g., running as root, exposing unnecessary ports)
Secrets embedded in image layers (e.g., API keys in environment variables)
This is valuable. A scan can identify that a particular image includes OpenSSL 3.0.2, which is vulnerable to CVE-2022-0778, and that the image should be rebuilt with a patched version.
But scanning has fundamental limitations:
It only finds known vulnerabilities. A zero-day vulnerability in a base image will not appear in any scanner's database until a CVE is published and the scanner's database is updated. There is a window of exposure between the vulnerability's discovery and its detection.
It does not verify image integrity. A scanner analyzes the image as it exists in the registry. If an attacker has pushed a modified image with the same tag, the scanner will scan the attacker's image. Without image signing and verification, the scanner cannot tell whether the image it is scanning is the one that was actually built by your pipeline.
It does not monitor runtime behavior. A container can pass every scan and still behave maliciously at runtime. An attacker who exploits an application vulnerability inside the container can execute arbitrary commands, modify the file system, or establish network connections that the scanner never anticipated.
Image Signing and Provenance Verification
The most critical gap in a scanning-only approach is the lack of image provenance verification. How does the deployment system know that the image it is pulling is the one that was built by your CI/CD pipeline, and not a modified version pushed by an attacker?
The answer is image signing. Two standards are widely used:
Cosign (part of the Sigstore project): Cosign signs container images and stores the signature alongside the image in the registry. During deployment, an admission controller (such as Kyverno or OPA Gatekeeper) verifies the signature before allowing the pod to start. If the signature is missing or invalid, the deployment is rejected.
Docker Content Trust / Notary: Docker's native signing mechanism. It uses a trust delegation model where specific keys are assigned to specific repositories. It is functional but less widely adopted in Kubernetes environments than Cosign.
A practical implementation looks like this:
The CI/CD pipeline builds the image.
The pipeline signs the image using Cosign with a key pair stored in a secrets manager.
The signed image is pushed to the registry.
An admission controller in the Kubernetes cluster is configured to verify Cosign signatures.
When a deployment is submitted, the admission controller checks the signature. If it matches, the pod is admitted. If not, the deployment is rejected.
This prevents a class of attacks where an attacker modifies an image in the registry after it has been built. Without signing, the attacker simply pushes a new image with the same tag. With signing, the admission controller detects the signature mismatch and blocks the deployment.
Runtime Security: The Missing Layer
Even a perfectly scanned, properly signed image can be compromised at runtime. An application vulnerability (a deserialization flaw, an unauthenticated endpoint, a dependency with a remote code execution bug) can allow an attacker to execute code inside the container.
Runtime security tools monitor container behavior and alert on anomalies:
Unexpected process execution (e.g., a web server spawning a shell)
File system modifications outside expected paths
Network connections to unexpected IP addresses or domains
Privilege escalation attempts (e.g., attempts to modify capabilities or mount the host file system)
Loading of unexpected kernel modules
Tools in this category include Falco (open source, CNCF), Aqua Security, Sysdig Secure, and cloud-native solutions like AWS GuardDuty for EKS Runtime Monitoring and Microsoft Defender for Containers.
The key insight is that runtime security operates on behavior, not on known vulnerabilities. A scanner asks "Does this image contain CVE-2024-1234?" A runtime monitor asks "Is this container behaving the way it should, given what it is supposed to do?" These are different questions, and they require different tools.
The Full Container Security Model
A complete container security program addresses all four phases of the image lifecycle:
Phase
Control
Tool Examples
Build
Dockerfile linting, dependency scanning, secret detection
Hadolint, Trivy, gitleaks
Build
Image signing
Cosign, Notary
Storage
Registry access control, image tagging policy
ECR policies, ACR RBAC
Deployment
Admission control with signature verification
Kyverno, OPA Gatekeeper
Deployment
Vulnerability gate (block critical CVEs)
Trivy operator, Aqua admission controller
Runtime
Behavior monitoring, anomaly detection
Falco, Sysdig, Defender for Containers
Runtime
Pod security standards (restrict privileged containers)
Kubernetes Pod Security Admission
No single tool covers all phases. A practical approach combines:
A scanner for build-time and deployment-time vulnerability detection
A signing tool for provenance verification
An admission controller for deployment-time policy enforcement
A runtime monitor for behavioral anomaly detection
Kubernetes Pod Security Admission for baseline runtime restrictions
Practical Recommendations
Scan in the CI/CD pipeline, not just at the registry. Scanning at build time catches vulnerabilities before the image reaches the registry. Scanning at the registry catches newly published CVEs in images that have already been deployed. Both are necessary.
Sign every production image. Use Cosign with a key stored in your CI/CD secrets manager. Verify signatures at deployment time using an admission controller.
Enforce Pod Security Admission. Kubernetes removed PodSecurityPolicy in version 1.25 and replaced it with Pod Security Admission. Set your namespaces to restricted or baseline security levels to prevent containers from running as root or with excessive capabilities.
Monitor runtime behavior. Deploy Falco or an equivalent runtime monitor. Start with the default rule set and tune it over time. Alert on shell execution inside containers, unexpected network connections, and file system modifications.
Pin base image digests. Instead of pulling ubuntu:22.04 (a mutable tag), pull ubuntu@sha256:abc123... (an immutable digest). This ensures that your build always uses the exact same base image, preventing supply chain attacks that swap the contents of a tag.
Minimize the attack surface. Use minimal base images (distroless, Alpine, scratch). Remove unnecessary packages. Run as a non-root user. Every package you remove is a package that cannot be exploited.
FAQ
Is vulnerability scanning still worth doing?
Yes. Scanning is a necessary component of container security. It identifies known CVEs and misconfigurations. The mistake is treating scanning as sufficient. It is one layer of a multi-phase security model.
What is a distroless image?
A distroless image contains only the application and its runtime dependencies. It does not include a package manager, a shell, or system utilities. This dramatically reduces the attack surface because there are fewer binaries that an attacker can leverage after compromising the application.
How do I prevent secrets from leaking into container images?
Do not use ENV or ARG in Dockerfiles for secrets. Use multi-stage builds to exclude build-time secrets from the final image. Use runtime secret injection (Kubernetes Secrets, AWS Secrets Manager, Azure Key Vault) instead of baking secrets into the image. Scan images with tools like gitleaks or Trivy's secret scanning feature to detect leaked credentials.
Can Kubernetes Network Policies replace runtime monitoring?
No. Network Policies control which pods can communicate with each other. They do not monitor what processes are running inside a container, what files are being modified, or what system calls are being made. Runtime monitoring and network policies address different threat surfaces.
What is the difference between image signing and image scanning?
Signing verifies the image's origin and integrity — confirming that the image was built by your pipeline and has not been modified. Scanning analyzes the image's contents for known vulnerabilities. Signing answers "Is this the right image?" Scanning answers "Is this image safe to run?" Both are needed.
Conclusion
Vulnerability scanning is a necessary but insufficient component of container security. It identifies known CVEs at a point in time, but it does not verify image provenance, prevent supply chain attacks, or detect runtime compromise.
A complete container security model spans the entire image lifecycle: build-time scanning and signing, registry access control, deployment-time admission policies with signature verification, and runtime behavior monitoring. Each phase addresses a different threat, and skipping any phase leaves a gap that attackers can exploit.
The practical starting point is straightforward: scan in your CI/CD pipeline, sign production images with Cosign, enforce signature verification at deployment time, and deploy a runtime monitor. These four actions cover the most common attack paths and establish a foundation for a mature container security program.
Research Sources
Source: Sigstore / Cosign Documentation
Organization: Sigstore (Linux Foundation)
URL: https://docs.sigstore.dev/cosign/overview/
Why used: Authoritative documentation on container image signing, key management, and verification workflows.
Source: Falco Documentation
Organization: CNCF / Falco
URL: https://falco.org/docs/
Why used: Reference for runtime container security monitoring, anomaly detection rules, and Kubernetes integration.
Source: Trivy Documentation
Organization: Aqua Security
URL: https://trivy.dev/
Why used: Reference for container vulnerability scanning, secret detection, and CI/CD integration.
Source: Kubernetes Pod Security Admission
Organization: Kubernetes
URL: https://kubernetes.io/docs/concepts/security/pod-security-admission/
Why used: Authoritative documentation on the replacement for PodSecurityPolicy and the three security levels (privileged, baseline, restricted).
Source: NIST SP 800-190 — Application Container Security Guide
Organization: NIST
URL: https://csrc.nist.gov/publications/detail/sp/800-190/final
Why used: Federal guidance on container security risks, including image vulnerabilities, registry trust, and runtime threats.
Editorial Verification Notes
Verify that PodSecurityPolicy removal in Kubernetes 1.25 is still accurate and that no successor has been introduced. The article states it was removed in 1.25.
Confirm current Cosign version and whether the signing/verification workflow has changed. The article references the standard Cosign sign/verify commands.
The article does not reference specific CVE numbers to avoid time-sensitivity. Claude should verify whether any high-profile container supply chain incidents (e.g., Docker Hub compromise, registry poisoning) should be referenced as examples.
Verify whether distroless images are still the recommended minimal base image approach, or whether newer alternatives (e.g., Wolfi, Chainguard images) should be mentioned.
BATCH SUMMARY
#
Article ID
Title
Primary Keyword
Search Intent
Suggested Slug
Distinctness
1
TC-026
DNS Security in the Enterprise: DoH, DoT, and DNS Filtering
enterprise DNS security
Informational / Implementation
enterprise-dns-security-doh-dot-filtering
DNS security not previously covered. Distinct from networking articles (BGP, multi-cloud) which focus on routing, not name resolution security.
2
TC-027
BitLocker and TPM: What Actually Happens When Your Hardware Fails
BitLocker TPM failure recovery
Troubleshooting / Educational
bitlocker-tpm-failure-recovery-enterprise
Endpoint encryption not previously covered. Distinct from Intune/Autopilot articles which focus on device provisioning, not disk encryption recovery.
3
TC-028
Entra ID PIM: Why Most Implementations Fail
Entra ID PIM implementation
Implementation / Educational
entra-id-pim-implementation-failures
Privileged identity management not previously covered. Distinct from Conditional Access / step-up auth articles which focus on user access, not admin role activation.
4
TC-029
Kubernetes Gateway API vs Ingress: What Actually Changes
Kubernetes Gateway API vs Ingress
Comparison / Educational
kubernetes-gateway-api-vs-ingress-migration
Ingress/Gateway API not previously covered. Distinct from pod networking article (TC-004) which covers CNI and internal routing, not external traffic management.
5
TC-030
Container Image Security: Why Scanning Alone Fails
container image security
Educational / Implementation
container-image-security-beyond-scanning
Container security not previously covered. Distinct from K8s networking/storage articles which focus on cluster operations, not image lifecycle security.
Overlap risk assessment: Low. All five topics address distinct technical domains not covered in previous batches. The closest potential overlap is TC-029 (Gateway API) with the earlier Kubernetes Pod Networking article, but the search intent and technical content are fundamentally different — one covers internal CNI/packet flow, the other covers external ingress/egress routing architecture.
Remaining articles for this batch (TC-031 through TC-035):
TC-031: IPv6 in the Enterprise: The Migration You Can't Keep Delaying
TC-032: Microsoft 365 Tenant-to-Tenant Migration: The Technical Reality
TC-033: OpenTelemetry vs Proprietary APM: The Observability Decision
TC-034: Ransomware Recovery: Why Your Backups Probably Won't Save You
TC-035: AWS EKS Pod Identity vs IRSA: The Kubernetes IAM Simplification
These will be generated in the next response to maintain the 2,000+ word minimum per article without output truncation