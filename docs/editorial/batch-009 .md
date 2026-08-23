
ARTICLE 1
ID: TC-041
Title: Linux eBPF for Security: Observability, Kernel Probes, and the Rootkit Risk
Primary keyword: eBPF security monitoring
Secondary keywords: eBPF kernel observability, Falco eBPF runtime security, eBPF verifier, kernel probing security risks, Cilium eBPF networking
Search intent: Educational / Implementation
Suggested slug: linux-ebpf-security-monitoring-kernel-probes
Meta title: eBPF Security: Kernel Observability, Runtime Threats, and the Rootkit Risk
Meta description: eBPF gives security teams unprecedented kernel-level visibility, but it also creates a new attack surface. Learn how eBPF works, how security tools use it, and what can go wrong.
Article:
Extended Berkeley Packet Filter (eBPF) has quietly become the most important technology in Linux kernel observability over the past decade. It allows user-space programs to attach custom code directly to kernel events — system calls, network packet processing, file operations, process scheduling — without modifying the kernel source code or loading traditional kernel modules.
For security teams, this is transformative. eBPF provides the ability to observe and react to kernel-level activity in real time, with minimal performance overhead. Tools like Falco, Cilium, Tetragon, and Tracee use eBPF to detect container escapes, identify privilege escalation, monitor network flows, and enforce runtime security policies.
But eBPF is a double-edged sword. The same mechanism that allows a security tool to monitor kernel activity can be exploited by an attacker who gains root access. A malicious eBPF program can hide processes, intercept credentials, manipulate network traffic, and render traditional security tools blind — effectively functioning as a kernel-level rootkit that is extremely difficult to detect.
This article explains how eBPF works at the kernel level, how security tools use it, and what the security implications are for organizations deploying eBPF-based monitoring.
How eBPF Works at the Kernel Level
eBPF is not a single tool. It is a virtual machine embedded in the Linux kernel. Programs written in a restricted subset of C (or compiled from higher-level languages like Rust or Go via frameworks like libbpf and bcc) are compiled into eBPF bytecode. This bytecode is then submitted to the kernel through the bpf() system call.
Before the bytecode is allowed to execute, it passes through the eBPF verifier. The verifier performs static analysis on the program to ensure:
Termination: The program cannot contain infinite loops. All loops must have a bounded maximum iteration count (verified at load time).
Memory safety: The program cannot read or write outside the bounds of allocated memory regions. All pointer arithmetic is validated.
No kernel crashes: The program cannot call arbitrary kernel functions. It can only call a whitelist of kernel helper functions (e.g., bpf_probe_read, bpf_map_lookup_elem, bpf_trace_printk).
Bounded stack usage: The eBPF program's stack is limited to 512 bytes.
If the verifier approves the program, the kernel's JIT compiler translates the bytecode into native machine code. This code is then attached to a specific hook point in the kernel.
Hook points include:
kprobes/kretprobes: Attach to the entry and return of any kernel function.
tracepoints: Attach to static tracing points defined in the kernel source code.
XDP (eXpress Data Path): Attach to the earliest point in the network stack, before the kernel allocates a socket buffer (skb). Used by Cilium for high-performance packet filtering.
TC (Traffic Control): Attach to the traffic control layer for packet manipulation.
LSM hooks: Attach to Linux Security Module hooks (introduced in kernel 5.7) to enforce mandatory access control decisions.
cgroup hooks: Attach to control group events for container-level monitoring.
When the kernel hits the hook point, it executes the attached eBPF program. The program can read kernel data structures, make decisions, update eBPF maps (shared data structures between kernel and user space), and send events to user-space agents.
How Security Tools Use eBPF
The security tooling ecosystem has converged on eBPF because it provides kernel visibility without the instability and security risks of traditional kernel modules.
Runtime Threat Detection (Falco, Tetragon, Tracee):
These tools attach eBPF programs to system call tracepoints (e.g., sys_enter_execve, sys_enter_openat, sys_enter_connect). When a process executes a binary, opens a file, or makes a network connection, the eBPF program captures the event and sends it to user space.
The user-space agent (e.g., Falco's engine) evaluates the event against a ruleset. For example:
yaml

1234567
If a web server container suddenly spawns /bin/bash, the eBPF hook captures the execve syscall, and Falco generates a high-severity alert. This detection happens at the kernel level, making it extremely difficult for an attacker to bypass without detecting the eBPF program itself.
Network Security (Cilium):
Cilium uses eBPF at the XDP and TC layers to implement network policies, load balancing, and encryption. Instead of relying on iptables (which has O(n) rule matching complexity), Cilium compiles Kubernetes NetworkPolicy objects into eBPF bytecode that runs directly in the kernel's packet processing path. This provides microsecond-level policy enforcement with constant-time lookups.
Forensics and Incident Response (bpftrace, bcc):
During an incident, security engineers can use bpftrace to write ad-hoc eBPF scripts that trace specific kernel behavior. For example, to identify which process is opening a specific file:
bash

1
This provides real-time forensic visibility without requiring a full EDR agent deployment.
The eBPF Verifier: Security Feature and Limitation
The eBPF verifier is the primary security mechanism that prevents eBPF programs from crashing the kernel or performing dangerous operations. However, the verifier has limitations that security teams must understand.
1. Verifier bypasses are possible.
The verifier performs static analysis on the bytecode. It does not execute the program. This means certain complex control flow patterns can pass verification but behave unexpectedly at runtime. Over the years, several CVEs have been assigned to verifier bypass vulnerabilities that allowed crafted eBPF programs to read or write arbitrary kernel memory.
For example, CVE-2021-3490 (fixed in kernel 5.11) allowed an attacker to exploit a bug in the ALU32 bounds tracking to read kernel memory. An attacker with the ability to load eBPF programs (which requires CAP_BPF or CAP_SYS_ADMIN) could leverage such vulnerabilities to escalate privileges.
2. The CAP_BPF capability.
Starting with Linux kernel 5.8, the monolithic CAP_SYS_ADMIN capability was split. Loading eBPF programs now requires CAP_BPF (for most eBPF operations) and CAP_PERFMON (for tracing and performance monitoring). This is a meaningful improvement because it allows an administrator to grant a monitoring tool the ability to load eBPF programs without granting full root access.
However, if an attacker gains CAP_BPF and CAP_PERFMON, they can load arbitrary eBPF programs into the kernel. This is functionally equivalent to loading a kernel module.
The Rootkit Risk: Malicious eBPF
The same capabilities that make eBPF valuable for security monitoring make it dangerous in the hands of an attacker. A malicious eBPF program can:
1. Hide processes.
By attaching to the seq_file operations that the /proc filesystem uses to list processes, a malicious eBPF program can filter out specific PIDs. When a system administrator runs ps aux or top, the hidden process simply does not appear in the output. The kernel is lying to user space.
2. Intercept credentials.
By attaching to the pam_authenticate or sys_enter_write tracepoints, a malicious eBPF program can capture plaintext passwords as they are typed or transmitted to authentication services. The data can be written to an eBPF map and exfiltrated by a user-space process.
3. Manipulate network traffic.
By attaching to XDP or TC hooks, a malicious eBPF program can silently redirect, modify, or drop network packets. It can exfiltrate data by encoding it in DNS queries or ICMP packets, all while the network appears normal to user-space monitoring tools.
4. Disable security tools.
A sophisticated eBPF-based rootkit can detect the eBPF programs loaded by security tools (like Falco) and either detach them, corrupt their data, or feed them false events. This is the digital equivalent of cutting the alarm wire before breaking into a building.
Real-World Evidence:
Security researchers at Datadog and Aqua Security have published proof-of-concept eBPF rootkits that demonstrate these capabilities. The "BPFDoor" malware family, discovered in 2024, used eBPF to implement a stealthy backdoor on Linux servers that was invisible to traditional process monitoring.
Practical Security Controls for eBPF
Organizations deploying eBPF-based security tools must also protect the eBPF subsystem itself.
1. Lock down the kernel.
Enable Kernel Lockdown mode (available since kernel 5.4). Lockdown mode restricts access to kernel features that could be used to modify the running kernel, including bpf() syscall access. In "confidentiality" lockdown mode, even root cannot load eBPF programs that read kernel memory.
bash

12
2. Restrict CAP_BPF and CAP_PERFMON.
Only grant these capabilities to processes that explicitly require them. Use Linux Security Modules (SELinux or AppArmor) to confine the processes that load eBPF programs. For example, the Falco daemon should run with a specific SELinux context that limits its capabilities.
3. Monitor eBPF program loading.
Use auditd rules to log every invocation of the bpf() system call:
bash

1
This generates an audit event every time a new eBPF program is loaded. Security teams should alert on unexpected bpf() syscalls, especially those originating from non-monitoring processes.
4. Use signed eBPF programs (BPF Token, kernel 6.9+).
Recent kernel versions introduce the concept of BPF tokens and signed programs. This allows the kernel to verify that an eBPF program was compiled and signed by a trusted entity before loading it. This is analogous to code signing for user-space applications.
5. Enable kernel.unprivileged_bpf_disabled.
Historically, unprivileged users could load certain eBPF programs (e.g., for socket filtering). This was a significant attack surface. Modern kernels default to disabling unprivileged eBPF:
bash

1
Ensure this is set to 1 (or 2, which makes it immutable until reboot) in production environments.
FAQ
Does eBPF replace traditional EDR agents?
No. eBPF provides kernel-level telemetry, but a full EDR solution requires user-space correlation, threat intelligence, and response capabilities. eBPF is the data source; the EDR is the analysis engine. Tools like Falco and Tetragon use eBPF as their primary detection mechanism but still require a user-space component for rule evaluation and alerting.
Can eBPF programs crash the kernel?
The verifier is designed to prevent this. However, verifier bugs have historically allowed crafted programs to trigger kernel panics. This is why unprivileged eBPF is disabled by default and why kernel lockdown mode is recommended. In practice, well-written eBPF programs from reputable tools (Falco, Cilium, Datadog Agent) do not crash kernels.
What is the performance overhead of eBPF security monitoring?
Minimal for well-optimized programs. eBPF programs execute in nanoseconds. Cilium's XDP-based packet filtering can process millions of packets per second with lower latency than iptables. However, attaching eBPF programs to high-frequency tracepoints (e.g., every sys_enter_write) can generate significant event volume. Security tools use sampling and filtering in the eBPF program itself to reduce user-space overhead.
Can eBPF detect kernel-level rootkits?
eBPF can detect some kernel-level anomalies, but a sufficiently sophisticated rootkit that has compromised the kernel can hide from eBPF just as it can hide from any other monitoring mechanism. eBPF raises the bar significantly because it operates at the same privilege level as the kernel, but it is not a silver bullet against a fully compromised kernel. Hardware-based attestation (Intel SGX, AMD SEV, TPM) provides stronger guarantees.
What kernel version is required for modern eBPF security features?
Kernel 5.8 introduced CAP_BPF and CAP_PERFMON. Kernel 5.7 introduced LSM hooks for eBPF. Kernel 5.4 introduced Kernel Lockdown. For full-featured eBPF security monitoring (including LSM-based enforcement and BTF type information), kernel 5.10 or later is recommended. Most modern distributions (Ubuntu 22.04+, RHEL 9, Debian 12) ship with suitable kernels.
Conclusion
eBPF has fundamentally changed Linux security observability. It provides kernel-level visibility that was previously only achievable through invasive kernel modules, without the associated stability and security risks. Security tools built on eBPF — Falco, Cilium, Tetragon, Tracee — are now the standard for container runtime detection, network policy enforcement, and kernel forensics.
But eBPF is not inherently safe. The verifier protects against accidental kernel crashes, but it does not protect against a determined attacker with CAP_BPF. Organizations must treat eBPF as a privileged subsystem: restrict the capabilities required to load programs, enable kernel lockdown, monitor bpf() syscalls via auditd, and ensure that only trusted, signed eBPF programs run in production. The same technology that gives you eyes into the kernel can, in the wrong hands, make the kernel lie to you.
Research Sources
Source: eBPF Documentation and Specification
Organization: eBPF.io / Linux Kernel
URL: https://ebpf.io/what-is-ebpf/
Why used: Authoritative overview of eBPF architecture, verifier mechanics, and hook points.
Source: BPF LSM and Kernel Lockdown
Organization: Linux Kernel Documentation
URL: https://www.kernel.org/doc/html/latest/admin-guide/lockdown.html
Why used: Documentation on kernel lockdown mode and its interaction with eBPF program loading.
Source: Cilium eBPF Networking
Organization: Isovalent / CNCF Cilium Project
URL: https://docs.cilium.io/en/stable/network/ebpf/
Why used: Technical documentation on how Cilium uses eBPF at the XDP and TC layers for network policy enforcement.
Source: Falco eBPF Runtime Security
Organization: CNCF Falco Project
URL: https://falco.org/docs/concepts/data-sources/kernel/
Why used: Documentation on how Falco attaches eBPF programs to system call tracepoints for runtime threat detection.
Source: BPFDoor Malware Analysis
Organization: Datadog Security Labs
URL: https://www.datadoghq.com/blog/bpfdoor-malware-analysis/
Why used: Real-world analysis of eBPF-based malware, demonstrating the rootkit risk.
Editorial Verification Notes
Verify current kernel version requirements for BPF tokens and signed programs. The article references kernel 6.9+. Confirm the exact version where BPF token support was merged.
Confirm the CVE-2021-3490 details. The article cites it as an ALU32 bounds tracking bypass fixed in 5.11. Verify the fix version.
The article references kernel.unprivileged_bpf_disabled sysctl. Verify the default value in current RHEL 9 and Ubuntu 24.04 kernels.
Consider whether to mention the eBPF Foundation's role in standardizing eBPF across kernel versions, as this affects enterprise adoption timelines.
ARTICLE 2
ID: TC-042
Title: Microsoft Entra External ID: B2B, B2C, and the Cross-Tenant Access Problem
Primary keyword: Microsoft Entra External ID architecture
Secondary keywords: Entra ID B2B collaboration, cross-tenant access settings, Entra External ID B2C, guest user access management, external identity governance
Search intent: Educational / Implementation
Suggested slug: entra-external-id-b2b-b2c-cross-tenant-access
Meta title: Microsoft Entra External ID: B2B, B2C, and Cross-Tenant Access Explained
Meta description: Entra External ID handles guest access, partner collaboration, and customer identity. Learn the architectural differences between B2B, B2C, and cross-tenant access settings, and where the security gaps are.
Article:
Every enterprise needs to grant access to people outside the organization. Contractors need to access project files. Partners need to collaborate on shared documents. Customers need to create accounts and access services. Each of these scenarios requires a different identity model, a different governance posture, and a different set of security controls.
Microsoft Entra External ID is the umbrella platform that handles all three scenarios. But "External ID" is not a single product. It encompasses Entra ID B2B Collaboration (guest access for business partners), Cross-Tenant Access Settings (the policy layer that governs B2B), and Entra External ID for Customers (formerly Azure AD B2C, for consumer-facing applications). These are architecturally distinct, and conflating them leads to misconfigurations, over-permissive access, and governance blind spots.
This article breaks down the three components, explains how they actually work, and identifies the security controls that most organizations overlook.
Entra ID B2B Collaboration: Guest Access
B2B Collaboration is the mechanism that allows an external user to access resources in your tenant while retaining their identity from their home tenant. The external user is invited as a guest user in your directory.
The technical flow:
An administrator or resource owner in your tenant sends an invitation to the external user's email address.
The external user receives the invitation email and clicks the redemption link.
The user authenticates with their home identity provider (their own Entra ID tenant, a federated IdP, or a personal Microsoft account).
Upon successful authentication, a guest user object is created in your tenant. The user's userType attribute is set to Guest.
The guest user can now be assigned to groups, granted access to SharePoint sites, added to Teams channels, and assigned application roles — subject to the access policies configured in your tenant.
What the guest user object contains:
The guest user object in your tenant is a shadow representation. It stores the external user's display name, email, and a reference to their home tenant (the issuer claim in their token). It does not store their password. Authentication is always delegated to the home tenant. This means you cannot enforce your own password policy on a guest user. If their home tenant allows weak passwords, that weak password grants access to your resources.
The governance problem:
Guest users accumulate. A contractor is invited for a 6-month project. The project ends. The guest account remains active indefinitely. Over years, an enterprise tenant can accumulate thousands of stale guest accounts, each with access to various SharePoint sites, Teams channels, and applications.
Microsoft provides Access Reviews (part of Entra ID Governance, requiring Entra ID P2) to address this. Access Reviews can be configured to automatically review guest user memberships in groups and applications on a recurring schedule. If the guest user does not self-certify their continued need for access, the membership can be automatically removed. Without Access Reviews, guest access sprawl is inevitable.
Cross-Tenant Access Settings: The Policy Layer
Cross-Tenant Access Settings (CTAS) is the policy framework that governs how B2B collaboration works between your tenant and specific external tenants. It replaced the older, simpler "External collaboration settings" and provides granular, per-tenant control.
CTAS has two dimensions:
Inbound access (who can come in):
Controls which external tenants can send guest users to your tenant, and what those guests can do. You can configure:
B2B collaboration: Allow or block guest access entirely for specific tenants.
B2B direct connect: Allow users from specific tenants to access your Teams channels without a full guest account (using their home credentials directly).
Trust settings: Automatically trust Multi-Factor Authentication (MFA) and device compliance from specific partner tenants. If you trust a partner's Entra ID, a guest user who has already completed MFA in their home tenant will not be prompted for MFA again in your tenant.
Outbound access (who can go out):
Controls which external tenants your users can access as guests. This is often overlooked. If your users are invited as guests to a partner's tenant, your Conditional Access policies do not apply to their activity in the partner's tenant. CTAS outbound settings can restrict which domains or tenants your users are allowed to collaborate with.
The default configuration problem:
By default, CTAS is permissive. If no specific policy is configured for a tenant, the default settings apply, which typically allow B2B collaboration with any external domain. Organizations that do not explicitly configure CTAS are effectively allowing guest access from any email domain on the internet. This is a significant security gap.
Recommended configuration:
For most enterprises, CTAS should be configured as follows:
Default inbound: Block all external tenants.
Explicit allow: Create specific inbound policies for each trusted partner tenant.
MFA trust: Enable MFA trust only for tenants where you have verified their identity assurance level.
Default outbound: Restrict outbound B2B collaboration to approved partner domains.
Entra External ID for Customers (formerly Azure AD B2C)
Entra External ID for Customers is architecturally different from B2B Collaboration. It is not designed for business partner collaboration. It is designed for consumer-facing applications where you need to manage millions of external user identities.
In the B2C model, you create a separate customer tenant (or use the "External ID" tenant type in the Entra portal). Your application (e.g., a customer portal, a mobile app) authenticates users against this tenant. Users can sign up with email/password, social identity providers (Google, Facebook, Apple), or federated enterprise IdPs.
Key architectural differences from B2B:
Feature
B2B Collaboration
External ID for Customers
User type
Guest in your corporate tenant
Native user in a separate customer tenant
Authentication
Delegated to home tenant
Managed by the customer tenant or social IdP
Governance
Access Reviews, Conditional Access
Custom policies (Identity Experience Framework)
Licensing
Entra ID P1/P2 per admin; guests free
Monthly Active Users (MAU) billing model
Customization
Limited (standard sign-in pages)
Fully customizable (HTML/CSS, custom JavaScript)
API access
Microsoft Graph (limited for guests)
Microsoft Graph (full access to customer tenant)
The billing model is a critical operational consideration. B2C charges based on Monthly Active Users (MAU). The first 50,000 MAU per month are free. Beyond that, pricing is tiered. For a consumer application with 2 million monthly users, the cost can be substantial. Organizations must model this cost carefully before committing to the B2C architecture.
Custom Policies (Identity Experience Framework):
For complex consumer identity flows (e.g., step-up authentication for high-value transactions, custom attribute collection during sign-up, integration with legacy identity systems), B2C provides Custom Policies. These are XML-based policy files that define the user journey, claims transformation, and technical profiles. They are extremely powerful but also extremely complex. A misconfigured custom policy can expose sensitive user attributes or allow authentication bypass. Most organizations should use the built-in user flows unless they have a specific requirement that cannot be met otherwise.
The Security Gap: Guest Users and Conditional Access
The most common security misconfiguration in Entra External ID is the failure to apply Conditional Access policies to guest users.
Conditional Access policies in your tenant apply to guest users, but only if the policy explicitly includes them. Many organizations create Conditional Access policies scoped to "All users" but then exclude guest users to avoid friction for partners. This creates a gap: guest users can access your SharePoint sites, Teams channels, and applications without MFA, without device compliance checks, and without session controls.
Recommended Conditional Access for guests:
Create a dedicated Conditional Access policy for guest users.
Require MFA for all guest access. Since guest authentication is delegated to the home tenant, you can use Cross-Tenant Access Settings to trust the home tenant's MFA. If the home tenant is not trusted, the guest will be prompted for MFA in your tenant.
Apply session controls. Use "Sign-in frequency" to force re-authentication every 4 hours for guest users, reducing the window of opportunity for session hijacking.
Restrict access by application. Do not grant guest users blanket access to all applications. Scope their access to specific SharePoint sites, Teams teams, and applications.
Real-World Scenario: The Stale Guest Access Breach
A consulting firm with 2,000 employees uses Microsoft 365 and collaborates extensively with clients via SharePoint and Teams. Over five years, the IT team has invited approximately 8,000 guest users for various projects.
One of the guest accounts belongs to a contractor who worked on a project three years ago. The project ended. The contractor's company went out of business. The contractor's email domain expired and was registered by a malicious actor.
The malicious actor discovers that the expired domain is associated with guest accounts in multiple organizations. They register the domain, set up a new Entra ID tenant, and configure the email address to receive authentication requests. When the guest user attempts to access the consulting firm's SharePoint site, the authentication is delegated to the malicious actor's tenant. The attacker now has access to the SharePoint site, which contains sensitive client financial data.
The fix:
The firm implemented quarterly Access Reviews for all guest users, configured CTAS to block B2B collaboration with unverified domains, and set up an Azure AD alert for guest users from domains that had not authenticated in over 90 days. They also enabled the "Guest user access restrictions" setting in Entra ID, which limits what guest users can see in the directory (they cannot enumerate other users or groups by default).
FAQ
Can I prevent guest users from seeing my organization's directory?
Yes. In Entra ID External collaboration settings, configure "Guest user access restrictions." Set it to "Guest user access is restricted to properties and memberships of their own directory objects." This prevents guests from using the Microsoft Graph API to enumerate users, groups, or applications in your tenant.
What happens when a guest user's home tenant is deleted?
If the guest user's home tenant is deleted, the guest user can no longer authenticate. Their access to your tenant is effectively revoked. However, the guest user object remains in your directory as an orphaned object. You should run periodic cleanup scripts to identify and remove guest users whose issuer tenant no longer exists.
Can I use Conditional Access to require a compliant device for guest users?
You can, but it is complex. Guest users' devices are managed by their home organization, not by your Intune. You cannot enforce your Intune compliance policies on a guest's device. However, you can use Conditional Access to require that the guest's device is "hybrid joined" or "compliant" according to their home tenant's device registration. This requires Cross-Tenant Access Settings with device trust configured.
Is Entra External ID for Customers the same as Azure AD B2C?
Microsoft rebranded Azure AD B2C to "Entra External ID for Customers" in 2023. The underlying technology is the same, but the management experience has been updated in the Entra admin center. Existing Azure AD B2C tenants continue to function, but new deployments should use the External ID tenant type.
Conclusion
Microsoft Entra External ID is not a single feature. It is three distinct architectural patterns — B2B Collaboration for partner access, Cross-Tenant Access Settings for policy governance, and External ID for Customers for consumer identity — each with different security models, licensing implications, and operational requirements.
The most common failure is treating guest access as a convenience rather than a security boundary. Guest users inherit the authentication strength of their home tenant. If you do not explicitly configure Cross-Tenant Access Settings, enforce Conditional Access on guest accounts, and run regular Access Reviews, you are accumulating an ungoverned attack surface that grows with every invitation.
The practical starting point is to lock down the defaults: block all inbound B2B collaboration, explicitly allow trusted partner tenants, require MFA for all guest access, and implement quarterly access reviews. These four actions close the majority of external identity security gaps.
Research Sources
Source: What is external ID in Microsoft Entra ID?
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/entra/external-id/external-identities-overview
Why used: Authoritative overview of the External ID platform, covering B2B, B2C, and cross-tenant access.
Source: Cross-tenant access settings
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/entra/external-id/cross-tenant-access-overview
Why used: Detailed documentation on inbound/outbound B2B policies, MFA trust, and device trust configuration.
Source: Entra External ID for Customers
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/entra/external-id/customers/
Why used: Documentation on the customer-facing identity platform, including MAU billing and custom policies.
Source: Conditional Access for external users
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/entra/external-id/conditional-access
Why used: Guidance on applying Conditional Access policies to guest users and configuring authentication context for external access.
Editorial Verification Notes
Verify the current MAU pricing tiers for Entra External ID for Customers. Microsoft adjusts these periodically.
Confirm whether Cross-Tenant Access Settings now support automatic discovery of partner tenants via Microsoft Graph API federation.
The article references the "Guest user access restrictions" setting. Verify the exact portal path in the current Entra admin center UI.
Consider adding a note about Entra Verified ID (decentralized identity) and whether it is relevant to the External ID architecture.
ARTICLE 3
ID: TC-043
Title: Kubernetes Network Policies: Why Default-Deny Is Harder Than It Looks
Primary keyword: Kubernetes NetworkPolicy default deny
Secondary keywords: Calico vs Cilium network policy, Kubernetes micro-segmentation, network policy implementation gap, pod-to-pod traffic control
Search intent: Educational / Implementation
Suggested slug: kubernetes-network-policy-default-deny-implementation
Meta title: Kubernetes Network Policies: The Default-Deny Problem and CNI Reality
Meta description: Kubernetes NetworkPolicy is declarative, but enforcement depends entirely on the CNI plugin. Learn why default-deny is operationally difficult and how Calico, Cilium, and native implementations differ.
Article:
Kubernetes, by default, has no network isolation. Every pod in a cluster can communicate with every other pod, across all namespaces, on any port. There is no built-in firewall between services. A compromised web frontend in the staging namespace can freely query the production database in the prod namespace.
The Kubernetes NetworkPolicy resource is the native mechanism for imposing network segmentation. It allows you to declare which pods can communicate with which other pods, on which ports, using which protocols. The concept is straightforward. The implementation is where the complexity lives.
The fundamental issue is that the NetworkPolicy API is a specification, not an implementation. Kubernetes defines the YAML schema, but the actual enforcement is delegated entirely to the Container Network Interface (CNI) plugin. If your CNI does not implement NetworkPolicy enforcement, the policies you create are silently ignored. This gap between specification and enforcement is the source of most Kubernetes network security failures.
The NetworkPolicy Model
A NetworkPolicy selects pods using label selectors and defines ingress (inbound) and egress (outbound) rules. The policy applies to all pods that match the selector in the specified namespace.
yaml

12345678910111213141516171819
This policy states: pods labeled app: api-server in the production namespace will accept inbound TCP traffic on port 8080 only from pods labeled app: web-frontend in the same namespace, or from any pod in the namespace labeled kubernetes.io/metadata.name: monitoring. All other inbound traffic to api-server pods is dropped.
The critical semantics:
If no NetworkPolicy selects a pod, all traffic is allowed (both ingress and egress).
If at least one NetworkPolicy selects a pod, all traffic not explicitly allowed by a policy is denied. This is the "default-deny" behavior, but it only applies to pods that are selected by at least one policy.
A pod can be selected by multiple NetworkPolicies. The rules are additive (union). If any policy allows the traffic, it is allowed.
The Default-Deny Problem
To implement a true default-deny posture, you must create a policy that selects all pods and allows no traffic. This is typically done with an empty ingress or egress rule:
yaml

123456789
This looks simple. The operational reality is not.
Problem 1: DNS breaks.
If you apply a default-deny egress policy, pods can no longer resolve DNS names. Kubernetes DNS (CoreDNS) runs as a pod in the kube-system namespace. A default-deny egress policy in the production namespace will block the DNS query from production pods to the CoreDNS pod. Every application that uses hostnames will fail.
The fix requires an explicit egress rule allowing DNS:
yaml

12345678910111213
Problem 2: Cloud metadata services break.
Applications that need to access cloud provider metadata services (e.g., 169.254.169.254 on AWS, Azure, and GCP) to obtain IAM credentials will fail under default-deny egress. You must add an explicit egress rule for the link-local metadata IP.
Problem 3: Service mesh sidecars break.
If you are running a service mesh (Istio, Linkerd), the sidecar proxy (Envoy) intercepts all inbound and outbound traffic. A NetworkPolicy that does not account for the sidecar's port (typically 15001 for Istio's outbound listener) will break mesh communication.
Problem 4: Operator and controller traffic breaks.
Kubernetes operators, Helm controllers, and CI/CD agents need to communicate with the Kubernetes API server (kube-apiserver). Default-deny egress policies will block this communication unless explicitly allowed.
CNI Implementation Differences
The NetworkPolicy API is implemented differently by each CNI plugin, and the differences are significant.
Calico:
Calico implements NetworkPolicy using Linux iptables (or eBPF in its newer dataplane mode). In iptables mode, Calico generates a chain of iptables rules for each NetworkPolicy. For clusters with hundreds of policies, the iptables rule count can grow to thousands, and the linear matching complexity of iptables can introduce measurable latency.
Calico's eBPF dataplane mode replaces iptables with eBPF programs attached to the TC (Traffic Control) hooks on each node's network interfaces. This provides O(1) policy lookup and significantly lower latency. However, eBPF mode requires kernel 5.3+ and has different operational characteristics (e.g., it bypasses kube-proxy for service routing).
Calico also supports GlobalNetworkPolicy, a Calico-specific resource (not part of the Kubernetes API) that allows policies to span namespaces and target host-level endpoints. This is useful for controlling traffic between pods and the node's own network interfaces.
Cilium:
Cilium is built entirely on eBPF. It compiles NetworkPolicy rules into eBPF bytecode and loads them into the kernel. Policy enforcement happens at the socket level or the TC level, depending on the configuration.
Cilium provides several extensions beyond the standard NetworkPolicy API:
CiliumNetworkPolicy: Supports Layer 7 (HTTP method/path) filtering. For example, you can allow GET requests to /api/v1/public but deny POST requests to /api/v1/admin.
CiliumClusterwideNetworkPolicy: Applies policies across all namespaces without namespace scoping.
FQDN filtering: Allows egress rules based on domain names (e.g., allow traffic to *.amazonaws.com) rather than just IP addresses. Cilium resolves the FQDN and dynamically updates the eBPF map with the corresponding IP addresses.
Kube-router and Antrea:
Kube-router uses IPVS for service routing and iptables for NetworkPolicy enforcement. Antrea (a CNCF project) uses OVS (Open vSwitch) with OpenFlow rules for policy enforcement. Both are less commonly deployed in production than Calico or Cilium but are viable options for specific use cases.
The no-op CNI problem:
Some CNI plugins (Flannel in its default mode, AWS VPC CNI without the Network Policy add-on, Azure CNI without Network Policy support) do not implement NetworkPolicy enforcement. If you apply a NetworkPolicy in a cluster using one of these CNIs, the policy is accepted by the API server but silently ignored. Traffic flows as if the policy does not exist.
This is the most dangerous failure mode because it is silent. There is no error, no warning, no event. The policy appears to be applied (you can kubectl get networkpolicy and see it), but it has no effect. Organizations must verify that their CNI actually enforces policies before relying on them for security.
Verifying Policy Enforcement
Before trusting any NetworkPolicy, verify that the CNI is actually enforcing it.
Step 1: Deploy a test pod.
bash

1
Step 2: Apply a default-deny ingress policy for a target pod.
Step 3: From the test pod, attempt to connect to the target pod on the blocked port.
bash

1
Step 4: If the connection succeeds, the NetworkPolicy is not being enforced. Check the CNI plugin documentation and verify that the NetworkPolicy feature is enabled. For AWS EKS, this requires deploying the AWS Network Policy Agent (based on Cilium). For Azure AKS, you must enable the azure network policy addon at cluster creation time.
Practical Implementation Sequence
Deploying NetworkPolicies in a production cluster requires a phased approach to avoid breaking existing traffic.
Phase 1: Audit existing traffic.
Deploy a traffic monitoring tool (Cilium Hubble, Calico Flow Logs, or a service mesh) to observe all pod-to-pod traffic for 2-4 weeks. Build a map of which pods communicate with which other pods, on which ports.
Phase 2: Deploy default-deny in non-production namespaces.
Apply default-deny ingress and egress policies in staging and development namespaces. Add explicit allow rules for DNS, metadata services, and known application dependencies. Monitor for breakage.
Phase 3: Deploy per-application policies in production.
Do not apply a cluster-wide default-deny in production. Instead, create allow policies for each application's known dependencies. Start with the most critical applications (databases, payment services).
Phase 4: Apply default-deny to production namespaces.
Once all application dependencies are covered by explicit allow policies, apply the default-deny policy to the production namespace. Monitor for 48 hours. Any traffic that is now being dropped represents a dependency that was not identified in Phase 1.
Phase 5: Enforce egress controls.
Egress policies are harder than ingress because they require knowing every external service the application calls (APIs, SaaS endpoints, package registries). Start with logging-only egress rules (using Cilium's FQDN visibility or Calico's flow logs) before switching to enforcement.
FAQ
Do NetworkPolicies work across nodes?
Yes. NetworkPolicy enforcement is applied at the pod level, regardless of which node the pod is running on. The CNI plugin ensures that policy rules are applied on every node. However, the implementation mechanism differs: Calico uses iptables/eBPF on each node, Cilium uses eBPF maps that are synchronized across nodes.
Can NetworkPolicy block traffic to external IPs?
Yes, through egress rules. You can specify an ipBlock in the to field of an egress rule. For example, to allow egress only to a specific subnet:
yaml

1234
For FQDN-based egress filtering, you need Cilium's CiliumNetworkPolicy or a dedicated egress proxy.
What is the performance overhead of NetworkPolicy enforcement?
In iptables-based CNIs (Calico iptables mode, kube-router), the overhead increases linearly with the number of policies. At scale (hundreds of policies), the iptables chain evaluation can add 100-500 microseconds per packet. In eBPF-based CNIs (Cilium, Calico eBPF mode), the overhead is constant-time and typically adds less than 50 microseconds per packet.
Can I use NetworkPolicy with a service mesh?
Yes, but they serve different purposes. NetworkPolicy operates at Layer 3/4 (IP, port, protocol). A service mesh operates at Layer 7 (HTTP method, path, headers). They are complementary. NetworkPolicy provides coarse network segmentation. The service mesh provides fine-grained, application-level authorization. In practice, many organizations use NetworkPolicy for namespace-level isolation and service mesh policies (Istio AuthorizationPolicy) for application-level access control.
Conclusion
Kubernetes NetworkPolicy is the native mechanism for pod-level network segmentation, but it is only as effective as the CNI plugin that enforces it. The gap between the specification and the implementation is the primary source of misconfiguration. Organizations that apply NetworkPolicies without verifying CNI enforcement are operating under a false sense of security.
The path to effective network segmentation in Kubernetes is incremental: audit traffic, deploy allow policies first, verify enforcement with test pods, and only then apply default-deny. The operational cost of maintaining explicit allow rules is the price of a secure network. There is no shortcut.
Research Sources
Source: Kubernetes Network Policies
Organization: Kubernetes Documentation
URL: https://kubernetes.io/docs/concepts/services-networking/network-policies/
Why used: Authoritative specification for the NetworkPolicy API, including podSelector, namespaceSelector, and policyTypes semantics.
Source: Cilium Network Policy
Organization: Isovalent / CNCF Cilium Project
URL: https://docs.cilium.io/en/stable/security/policy/
Why used: Documentation on Cilium's eBPF-based policy enforcement, including CiliumNetworkPolicy, FQDN filtering, and Layer 7 policies.
Source: Calico Network Policy
Organization: Tigera
URL: https://docs.tigera.io/calico/latest/network-policy
Why used: Documentation on Calico's iptables and eBPF dataplane modes, GlobalNetworkPolicy, and policy performance characteristics.
Source: AWS VPC CNI Network Policy
Organization: Amazon Web Services
URL: https://docs.aws.amazon.com/eks/latest/userguide/cni-network-policy.html
Why used: Documentation on enabling NetworkPolicy enforcement in Amazon EKS, which requires the AWS Network Policy Agent.
Editorial Verification Notes
Verify the current status of AWS Network Policy Agent for EKS. Confirm whether it is based on Cilium and whether it is now GA.
Confirm the kernel version requirement for Calico eBPF mode. The article states 5.3+. Verify this is still accurate for the latest Calico release.
The article mentions Flannel does not support NetworkPolicy. Verify whether the latest Flannel release has added any NetworkPolicy support.
Consider adding a note about Kubernetes NetworkPolicy v2 (the Gateway API-based approach) if it has progressed beyond alpha.
ARTICLE 4
ID: TC-044
Title: Post-Quantum Cryptography: NIST Standards and the Enterprise Migration Timeline
Primary keyword: post-quantum cryptography migration
Secondary keywords: NIST PQC standards, ML-KEM CRYSTALS-Kyber, quantum computing threat RSA, hybrid TLS post-quantum, harvest now decrypt later
Search intent: Educational / Implementation
Suggested slug: post-quantum-cryptography-nist-migration-enterprise
Meta title: Post-Quantum Cryptography: NIST Standards and the Enterprise Reality
Meta description: Quantum computers will break RSA and ECC. NIST has finalized the replacement algorithms. Learn what ML-KEM, ML-DSA, and SLH-DSA actually change, and what enterprises need to do now.
Article:
The cryptographic systems that secure the internet — RSA, Elliptic Curve Cryptography (ECC), Diffie-Hellman — are mathematically vulnerable to a sufficiently powerful quantum computer. Shor's algorithm, published in 1994, demonstrates that a quantum computer with enough stable qubits can factor large integers and compute discrete logarithms in polynomial time, breaking the mathematical foundations of public-key cryptography.
This is not a hypothetical future problem. The threat model is called "Harvest Now, Decrypt Later" (HNDL). An adversary can intercept and store encrypted traffic today, and decrypt it years from now when quantum hardware matures. Data that must remain confidential for decades — government secrets, healthcare records, intellectual property, financial infrastructure — is already at risk.
In August 2024, NIST finalized the first three Post-Quantum Cryptography (PQC) standards: FIPS 203 (ML-KEM, based on CRYSTALS-Kyber), FIPS 204 (ML-DSA, based on CRYSTALS-Dilithium), and FIPS 205 (SLH-DSA, based on SPHINCS+). These standards define the algorithms that will replace RSA and ECC in digital signatures and key exchange.
For enterprise IT and security teams, the question is no longer "if" but "when and how." This article explains what the NIST standards actually define, what changes in the TLS stack, and what a realistic enterprise migration timeline looks like.
What Quantum Computers Break
To understand the migration, it helps to understand exactly what is vulnerable.
Broken by Shor's Algorithm (requires large-scale quantum computer):
RSA: Based on the difficulty of factoring large integers. Shor's algorithm factors integers in polynomial time.
Diffie-Hellman (DH) and Elliptic Curve Diffie-Hellman (ECDH): Based on the discrete logarithm problem. Shor's algorithm solves discrete logarithms.
Elliptic Curve Digital Signature Algorithm (ECDSA): Based on the elliptic curve discrete logarithm problem.
Not broken by Shor's Algorithm:
Symmetric cryptography (AES-256, ChaCha20): Grover's algorithm provides a quadratic speedup for brute-force search, effectively halving the key length. AES-256 remains secure with an effective strength of 128 bits. No migration is needed for symmetric encryption, though AES-256 should be preferred over AES-128 for long-term security.
SHA-256 / SHA-3 hash functions: Grover's algorithm reduces the collision resistance, but SHA-256 remains adequate. SHA-384 or SHA-512 provide additional margin.
The implication: The migration is specifically about public-key cryptography — key exchange and digital signatures. Symmetric encryption and hashing are largely unaffected.
The NIST PQC Standards
NIST's PQC standardization process began in 2016 and concluded with three finalized standards in 2024. Each standard addresses a specific cryptographic function.
FIPS 203: ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)
Based on the CRYSTALS-Kyber algorithm. ML-KEM replaces Diffie-Hellman and ECDH for key exchange. It is used in TLS handshakes to establish a shared secret between client and server.
Security basis: The hardness of the Module Learning With Errors (MLWE) problem.
Key sizes: Public keys are 800-1568 bytes (depending on security level). Ciphertexts are 768-1568 bytes. These are significantly larger than ECDH keys (32-64 bytes) but manageable for most protocols.
Performance: ML-KEM is fast. Key generation and encapsulation/decapsulation operations are comparable in speed to ECDH.
FIPS 204: ML-DSA (Module-Lattice-Based Digital Signature Algorithm)
Based on the CRYSTALS-Dilithium algorithm. ML-DSA replaces RSA and ECDSA for digital signatures. It is used for TLS server authentication, code signing, document signing, and certificate validation.
Security basis: The hardness of the Module Short Integer Solution (MSIS) problem.
Signature sizes: 2420-4595 bytes (depending on security level). This is 10-50x larger than ECDSA signatures (64 bytes). This has implications for protocols that transmit many signatures (e.g., blockchain, DNSSEC).
Performance: Signing and verification are fast, but the larger signature size increases bandwidth consumption.
FIPS 205: SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)
Based on the SPHINCS+ algorithm. SLH-DSA is a conservative, hash-based signature scheme. It relies only on the security of the underlying hash function, making it resistant to attacks that exploit lattice structure.
Security basis: The security of the underlying hash function (SHA-256 or SHAKE256).
Signature sizes: 7856-49856 bytes. These are very large.
Use case: SLH-DSA is intended as a backup for high-security applications where the mathematical assumptions of lattice-based schemes (ML-KEM, ML-DSA) are considered too risky. It is not recommended for general TLS due to the large signature size.
Pending: FIPS 206 (FN-DSA)
Based on the FALCON algorithm. NIST expects to finalize FN-DSA in 2025. It provides smaller signatures than ML-DSA but is more complex to implement correctly. It is intended for applications where signature size is critical.
The Hybrid Approach: Classical + PQC
No enterprise should migrate directly from ECDH to ML-KEM without a transition period. The risk is that a newly standardized algorithm contains an undiscovered mathematical weakness. The industry consensus is to use hybrid key exchange, where both a classical algorithm (ECDH) and a PQC algorithm (ML-KEM) are used simultaneously. The shared secret is derived from both, and the session key is secure as long as at least one of the two algorithms is unbroken.
TLS 1.3 supports hybrid key exchange through the X25519MLKEM768 key exchange group (defined in RFC 9180 and subsequent drafts). Cloudflare, Google Chrome, and several CDN providers deployed hybrid key exchange in production in 2023 and 2024.
For digital signatures, hybrid signatures are more complex because TLS 1.3 does not natively support multiple signatures in a single handshake. The approach is to use a composite signature scheme that combines an ECDSA signature with an ML-DSA signature. This is being standardized by the IETF.
The Enterprise Impact: What Actually Changes
1. TLS certificates.
X.509 certificates signed by a Certificate Authority (CA) use RSA or ECDSA signatures. These certificates must be reissued with ML-DSA or SLH-DSA signatures. This requires CAs to support PQC algorithms. As of 2025, major CAs (DigiCert, Let's Encrypt, GlobalSign) are piloting PQC certificate chains, but widespread support is not yet available. Enterprises should not expect to obtain PQC certificates for public-facing websites before 2026-2027.
2. TLS handshake performance.
ML-KEM public keys are larger than ECDH keys. ML-DSA signatures are 10-50x larger than ECDSA signatures. This increases the size of the TLS handshake messages. For most applications, the additional bandwidth is negligible (a few kilobytes per handshake). For high-frequency, low-latency applications (financial trading, IoT devices with constrained bandwidth), the increase may be measurable.
3. Hardware Security Modules (HSMs).
HSMs that perform cryptographic operations (key generation, signing, TLS termination) must be updated with firmware that supports PQC algorithms. Most major HSM vendors (Thales, Entrust, AWS CloudHSM, Azure Dedicated HSM) have announced PQC support timelines, but firmware updates are not yet universally available. Enterprises with HSMs should verify their vendor's PQC roadmap.
4. Code signing and document signing.
Software updates, firmware images, and legal documents are signed using RSA or ECDSA. These signatures must be migrated to ML-DSA or SLH-DSA. Code signing pipelines (CI/CD systems, build servers) need to be updated to use PQC signing keys.
5. VPN and IPsec.
IKEv2 (the key exchange protocol for IPsec) uses Diffie-Hellman for key agreement. This must be migrated to ML-KEM. The IETF is standardizing hybrid key exchange for IKEv2. Enterprises using IPsec VPNs should track their VPN vendor's PQC support timeline.
6. SSH.
SSH uses Diffie-Hellman or ECDH for key exchange and RSA/ECDSA/Ed25519 for host and user authentication. OpenSSH 9.9 (released 2024) added support for mlkem768x25519-sha256 hybrid key exchange. Enterprises managing large SSH fleets should plan to update SSH clients and servers.
The Migration Timeline
There is no single cutover date. The migration will be gradual, spanning 5-10 years. A realistic enterprise timeline:
Now (2025-2026): Inventory and Awareness
Inventory all systems that use public-key cryptography: TLS endpoints, VPNs, SSH, code signing, email encryption (S/MIME, PGP), database encryption, HSMs.
Identify data with long-term confidentiality requirements (10+ years). This data is vulnerable to HNDL attacks today.
Track vendor PQC roadmaps: web servers (NGINX, Apache), load balancers, HSMs, VPN appliances, operating systems.
Near-term (2026-2028): Hybrid Deployment
Deploy hybrid key exchange (X25519MLKEM768) on public-facing web servers and CDNs.
Enable hybrid key exchange in SSH and VPN configurations where supported.
Begin testing PQC certificate chains in non-production environments.
Update cryptographic libraries (OpenSSL 3.2+, BoringSSL, Java 21+) to versions that support PQC algorithms.
Medium-term (2028-2030): PQC-Primary
Transition from hybrid to PQC-primary for new deployments.
Reissue TLS certificates with ML-DSA signatures as CA support matures.
Migrate code signing pipelines to ML-DSA.
Decommission RSA and ECC key exchange for new systems.
Long-term (2030+): Legacy Decommission
Decommission RSA and ECC for all remaining systems.
Address legacy systems that cannot be updated (embedded devices, SCADA/ICS, mainframes). These may require network-level isolation or application-layer encryption as a compensating control.
FAQ
Do I need to replace my AES-256 encryption?
No. AES-256 is not broken by quantum computers. Grover's algorithm reduces its effective strength to 128 bits, which is still secure for the foreseeable future. The migration is specifically about public-key cryptography (RSA, ECDH, ECDSA).
How large of a quantum computer is needed to break RSA-2048?
Current estimates suggest that breaking RSA-2048 requires approximately 20 million physical qubits (or roughly 4,000-10,000 logical qubits with error correction). As of 2025, the largest quantum computers have approximately 1,000-1,500 physical qubits. However, the timeline for reaching the required qubit count is uncertain. NIST recommends migrating now because the migration itself takes years.
Can I use PQC algorithms today?
Yes, for key exchange. OpenSSL 3.2+ supports ML-KEM. Chrome and Cloudflare have deployed hybrid key exchange in production. For digital signatures, ML-DSA support is available in OpenSSL 3.2+ but is not yet widely deployed in TLS certificates.
What about blockchain and cryptocurrency?
Most blockchain systems (Bitcoin, Ethereum) use ECDSA for transaction signing. These are vulnerable to quantum attacks. The blockchain community is actively researching PQC migration, but it is a complex consensus-level change. Enterprises using blockchain for critical transactions should track the PQC migration plans of their specific platforms.
What is the "crypto agility" principle?
Crypto agility is the practice of designing systems so that cryptographic algorithms can be swapped without rewriting the application. This means using configuration-driven cipher suites, abstracting cryptographic operations behind a library interface, and avoiding hardcoded algorithm identifiers. Organizations that build crypto agility now will find the PQC migration significantly easier.
Conclusion
Post-quantum cryptography is not a future problem. The NIST standards are finalized. The algorithms are defined. The migration tools are being built into TLS libraries, SSH clients, and HSM firmware. The question for enterprise security teams is not whether to migrate, but how to sequence the migration to minimize disruption while addressing the immediate HNDL threat to long-lived data.
The practical starting point is an inventory of all public-key cryptography in your environment, prioritized by data sensitivity and system criticality. Hybrid key exchange can be deployed on public-facing systems within months. Certificate reissuance and code signing migration will take years. The organizations that begin the inventory now will complete the migration before the threat materializes. The organizations that wait will find themselves in a multi-year emergency remediation.
Research Sources
Source: FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism
Organization: NIST
URL: https://csrc.nist.gov/pubs/fips/203/final
Why used: The authoritative standard for ML-KEM (CRYSTALS-Kyber), including parameter sets, security levels, and implementation guidance.
Source: FIPS 204 — Module-Lattice-Based Digital Signature Standard
Organization: NIST
URL: https://csrc.nist.gov/pubs/fips/204/final
Why used: The authoritative standard for ML-DSA (CRYSTALS-Dilithium), including signature generation, verification, and key sizes.
Source: FIPS 205 — Stateless Hash-Based Digital Signature Standard
Organization: NIST
URL: https://csrc.nist.gov/pubs/fips/205/final
Why used: The authoritative standard for SLH-DSA (SPHINCS+), including the hash-based security model.
Source: Post-Quantum Cryptography
Organization: CISA
URL: https://www.cisa.gov/quantum
Why used: Federal guidance on HNDL threat model, migration timelines, and prioritization of high-value data.
Source: X25519MLKEM768 Hybrid Key Exchange
Organization: IETF / Cloudflare
URL: https://datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design/
Why used: Documentation on the hybrid key exchange mechanism deployed in TLS 1.3 for transitional PQC support.
Editorial Verification Notes
Verify the current status of FIPS 206 (FN-DSA / FALCON). The article states it is expected in 2025. Confirm whether it has been finalized.
Confirm the current qubit count estimates for breaking RSA-2048. The article cites 20 million physical qubits. This is a widely referenced estimate but should be verified against recent academic publications.
Verify that OpenSSL 3.2+ supports ML-KEM and ML-DSA. Check the exact version where support was added.
Consider adding a note about the NSA's CNSA 2.0 suite, which specifies specific PQC algorithms for national security systems and may differ from NIST's general recommendations.
ARTICLE 5
ID: TC-045
Title: Windows 365 vs Azure Virtual Desktop: The Cloud Desktop Architecture Decision
Primary keyword: Windows 365 vs Azure Virtual Desktop
Secondary keywords: cloud PC architecture, AVD session host, Windows 365 Frontline, cloud desktop cost comparison, hybrid desktop management
Search intent: Comparison / Commercial Investigation
Suggested slug: windows-365-vs-azure-virtual-desktop-architecture
Meta title: Windows 365 vs Azure Virtual Desktop: Architecture, Cost, and When to Use Each
Meta description: Windows 365 and Azure Virtual Desktop serve different use cases. Learn the architectural differences, the cost models, and which approach fits your organization's desktop strategy.
Article:
Microsoft offers two distinct platforms for delivering Windows desktops from the cloud. Windows 365 provides a dedicated, always-on "Cloud PC" for each user. Azure Virtual Desktop (AVD) provides a shared, session-based virtual desktop infrastructure that can be configured for personal or pooled desktops.
The marketing materials present them as complementary. In practice, they are architecturally different products with different operational models, different cost structures, and different use cases. Choosing the wrong one leads to either overpaying for dedicated resources that users do not need, or underprovisioning shared resources that cannot handle the workload.
This article breaks down the architectural differences, the operational implications, and the decision framework for choosing between them.
The Architectural Difference
Windows 365: The Dedicated Cloud PC
Windows 365 is a fully managed, dedicated virtual machine for each user. When a user is assigned a Windows 365 Cloud PC, Microsoft provisionses a Hyper-V virtual machine in Microsoft's infrastructure (hosted in Azure, but managed entirely by Microsoft). The VM is assigned a fixed amount of CPU, RAM, and storage based on the purchased SKU (e.g., 2 vCPU / 4 GB RAM, 4 vCPU / 16 GB RAM, up to 16 vCPU / 64 GB RAM).
The user connects to their Cloud PC via the Remote Desktop Protocol (RDP) from any device — a physical PC, a Mac, a tablet, a thin client, or a web browser. The Cloud PC is always on and always available. It behaves exactly like a physical Windows PC: the user installs applications, saves files to the desktop, and picks up where they left off.
Key architectural characteristics:
One VM per user. No sharing.
Microsoft manages the underlying infrastructure (hypervisor, networking, storage, patching of the host OS).
The user manages the Cloud PC OS (Windows 11) through standard Windows management tools (Intune, GPO).
No Azure subscription is required. Windows 365 is purchased as a per-user-per-month subscription through Microsoft 365.
Azure Virtual Desktop: The Session Host Farm
AVD is a virtual desktop infrastructure (VDI) platform. You deploy virtual machines (session hosts) in your own Azure subscription. These VMs run Windows 10/11 Enterprise multi-session or Windows Server. Users connect to a pool of session hosts, and the AVD broker service assigns them to an available session.
AVD supports two deployment models:
Personal desktops: Each user is assigned a specific session host VM. Similar to Windows 365, but you manage the infrastructure.
Pooled desktops: Multiple users share a pool of session host VMs. Each user gets a separate session (user profile) on the VM, but the compute resources are shared. This is the most cost-effective model for task workers.
Key architectural characteristics:
You provision, configure, and manage the session host VMs in your Azure subscription.
You are responsible for VM sizing, scaling, patching, and image management.
AVD supports multi-session Windows, allowing multiple users to share a single VM.
You pay for Azure compute, storage, and networking resources (IaaS pricing), plus Microsoft 365 licensing for the Windows OS and management.
The Operational Difference
The operational burden is the primary differentiator.
Windows 365:
Microsoft manages the infrastructure. You do not create VMs, configure virtual networks, manage storage accounts, or configure load balancers. You assign a Cloud PC SKU to a user through the Windows 365 admin portal or Microsoft Intune, and the Cloud PC is provisioned automatically.
Your IT team manages the Cloud PC OS through Intune, just as they would manage a physical laptop. You deploy applications, configure security policies, and push updates through the same Intune console. The Cloud PC appears in the Intune device inventory as a managed Windows device.
This is a significant operational advantage for organizations that do not have deep Azure or VDI expertise. The learning curve is minimal. The operational model is essentially "manage a Windows PC, but it is in the cloud."
Azure Virtual Desktop:
You are responsible for the full VDI stack. This includes:
Image management: Creating and maintaining a master image (Golden Image) with the OS, applications, and configurations. Updating the image, capturing it, and deploying new session hosts.
Scaling: Configuring autoscaling rules to add or remove session hosts based on user demand. Over-provisioning wastes money. Under-provisioning degrades user experience.
Storage: Configuring FSLogix for user profile management. FSLogix stores user profiles in VHD/VHDX files on Azure Files or Azure NetApp Files. Misconfigured FSLogix causes slow logons and profile corruption.
Networking: Configuring virtual networks, NSGs, and peering to connect session hosts to on-premises resources (file servers, domain controllers).
Monitoring: Configuring Azure Monitor and Log Analytics to track session host health, user sessions, and resource utilization.
This is a substantial operational investment. Organizations without existing Azure and VDI expertise will need to hire or train staff, or engage a managed service provider.
The Cost Model
The cost structures are fundamentally different.
Windows 365:
Per-user, per-month subscription. The price is fixed and predictable. As of current pricing, a Windows 365 Enterprise Cloud PC with 2 vCPU / 4 GB RAM costs approximately $31/user/month. A 4 vCPU / 16 GB RAM configuration costs approximately $66/user/month. [VERIFY — pricing changes frequently]
This includes the Windows OS license, the compute, the storage, and the management infrastructure. There are no separate Azure compute charges.
Azure Virtual Desktop:
You pay for:
Azure compute: The session host VMs. A D4s v5 VM (4 vCPU, 16 GB RAM) costs approximately $0.20/hour. If you run 10 session hosts for 10 hours/day, 22 days/month, the compute cost is approximately $440/month.
Azure storage: FSLogix profile storage on Azure Files or NetApp Files. Typically $50-200/month depending on user count.
Azure networking: Egress charges if users connect from outside Azure.
Microsoft 365 licensing: Users need Microsoft 365 E3/E5 or Windows 10/11 Enterprise E3/E5 for the OS license. This is typically already included in enterprise agreements.
For pooled desktops, AVD can be significantly cheaper than Windows 365 because multiple users share a single VM. A 4 vCPU / 16 GB VM can support 4-8 concurrent users for typical office workloads (email, web, Office apps). This means the per-user cost can be $8-15/user/month for compute, plus storage and networking.
For personal desktops (1:1), AVD is typically more expensive than Windows 365 because you bear the full Azure IaaS cost plus the operational overhead.
When to Use Each
Use Windows 365 when:
You need dedicated, always-on desktops for knowledge workers who require a consistent, personalized environment.
Your IT team does not have deep Azure or VDI expertise.
You want predictable, per-user pricing without Azure consumption billing.
You need to provision desktops quickly for contractors, temporary staff, or new hires without building VDI infrastructure.
You want to manage cloud desktops through the same Intune policies you use for physical laptops.
Use Azure Virtual Desktop when:
You need pooled (multi-session) desktops for task workers, call centers, or shift-based environments where users do not need a persistent desktop.
You have specific application requirements that need custom VM configurations, GPU acceleration, or specialized hardware (e.g., CAD, video editing).
You have an existing Azure infrastructure team and want full control over the VDI environment.
You need to integrate with on-premises Active Directory (hybrid join) or specific network configurations that require custom VNet topology.
You need to run Windows Server-based session hosts (Remote Desktop Session Host) for legacy application compatibility.
Use Windows 365 Frontline when:
You have shift workers who share devices and do not need a persistent desktop.
Windows 365 Frontline allows multiple users to share a single Cloud PC, but only one user can be actively connected at a time. The Cloud PC is paused when the user disconnects.
This is suitable for retail, healthcare, and manufacturing environments where workers use shared kiosks.
Real-World Scenario: The Hybrid Workforce
A 2,000-person professional services firm has three user populations:
Consultants (1,200 users): Travel frequently, work from client sites, need access to internal applications and files. They use laptops provided by the firm.
Finance team (200 users): Work with large Excel models, need consistent performance and a persistent desktop. They work primarily from the office.
Call center agents (600 users): Work in shifts, use thin clients, need access to a CRM application and a web-based phone system. They do not need persistent desktops.
The architecture decision:
Consultants: Windows 365 (2 vCPU / 8 GB RAM). They need a persistent, personalized desktop that they can access from any device at any location. The per-user cost is justified by the productivity gain.
Finance team: Azure Virtual Desktop with personal desktops (D4s v5 VMs). They need guaranteed performance for large Excel workbooks. The IT team can configure the VMs with specific performance tuning and install specialized financial software.
Call center agents: Azure Virtual Desktop with pooled multi-session desktops (D8s v5 VMs, 6 users per VM). They need access to a single CRM application. Pooling provides the lowest per-user cost. FSLogix handles profile management.
This hybrid approach uses each platform where it provides the best operational and cost outcome.
FAQ
Can Windows 365 Cloud PCs join an on-premises Active Directory domain?
Yes, but with limitations. Windows 365 Cloud PCs can be Entra ID joined (cloud-only) or Hybrid Entra ID joined. For Hybrid join, the Cloud PC must have network connectivity to an on-premises domain controller, typically through Azure VPN or ExpressRoute. Microsoft recommends Entra ID join for new deployments.
Can I use my own Windows license with Windows 365?
No. Windows 365 includes the Windows 11 Enterprise license as part of the subscription. You cannot bring your own license. For AVD, you need Windows 10/11 Enterprise E3/E5 or Microsoft 365 E3/E5 licensing.
What happens to a Windows 365 Cloud PC when the user leaves the organization?
The Cloud PC is deprovisioned and the data is deleted after a retention period (typically 7 days). If the user's data needs to be preserved, it must be backed up to OneDrive for Business or SharePoint before the Cloud PC is deprovisioned.
Does AVD support GPU-accelerated workloads?
Yes. AVD supports NVIDIA A-series and NV-series GPUs on Azure VMs. This is required for workloads like CAD, 3D rendering, and video editing. Windows 365 does not currently support GPU-accelerated Cloud PCs. [VERIFY — this may have changed]
Can I use Intune to manage both Windows 365 and AVD session hosts?
Yes. Both Windows 365 Cloud PCs and AVD session hosts (running Windows 10/11 Enterprise) can be enrolled in Intune and managed with the same policies. For AVD session hosts running Windows Server, you manage them through GPO or Azure Arc, not Intune.
Conclusion
Windows 365 and Azure Virtual Desktop are not interchangeable. Windows 365 is a managed, dedicated Cloud PC service optimized for simplicity and predictable cost. Azure Virtual Desktop is a flexible VDI platform optimized for scale, customization, and cost efficiency through multi-session pooling.
The decision framework is straightforward: if your users need dedicated, persistent desktops and your IT team wants minimal infrastructure management, use Windows 365. If you need pooled multi-session desktops, GPU acceleration, or deep customization of the VDI environment, use Azure Virtual Desktop. For most enterprises, the answer is a combination of both, matched to the specific needs of each user population.
Research Sources
Source: Windows 365 overview
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/windows-365/overview
Why used: Authoritative documentation on Windows 365 architecture, Cloud PC provisioning, and management model.
Source: Azure Virtual Desktop architecture
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/azure/virtual-desktop/
Why used: Documentation on AVD session hosts, host pools, FSLogix, and the multi-session Windows model.
Source: Windows 365 Frontline
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/windows-365/frontline/
Why used: Documentation on the shared Cloud PC model for shift workers, including concurrency limits and pricing model.
Source: Azure Virtual Desktop pricing
Organization: Microsoft Azure
URL: https://azure.microsoft.com/en-us/pricing/details/virtual-desktop/
Why used: Reference for AVD compute, storage, and networking cost components.
Editorial Verification Notes
[VERIFY] Windows 365 pricing. The article cites approximate per-user monthly costs. Microsoft adjusts these periodically. Confirm current pricing for 2 vCPU/4GB and 4 vCPU/16GB SKUs.
[VERIFY] GPU support in Windows 365. The article states GPU is not supported. Confirm whether Microsoft has introduced GPU-accelerated Cloud PCs.
Confirm the current maximum vCPU/RAM configuration for Windows 365 Enterprise. The article cites 16 vCPU / 64 GB RAM. Verify if higher SKUs are available.
Consider adding a note about Windows 365 Link (the dedicated thin client device) and its role in the architecture.
BATCH SUMMARY
#
Article ID
Title
Primary Keyword
Search Intent
Suggested Slug
Distinctness
1
TC-041
eBPF for Security: Observability, Kernel Probes, Rootkit Risk
eBPF security monitoring
Educational / Implementation
linux-ebpf-security-monitoring-kernel-probes
Kernel-level observability and security. Distinct from all previous articles; no prior coverage of eBPF.
2
TC-042
Entra External ID: B2B, B2C, Cross-Tenant Access
Microsoft Entra External ID architecture
Educational / Implementation
entra-external-id-b2b-b2c-cross-tenant-access
External identity management. Distinct from Entra ID PIM (TC-028) and Conditional Access (TC-023) which focus on internal identity.
3
TC-043
Kubernetes Network Policies: Default-Deny Reality
Kubernetes NetworkPolicy default deny
Educational / Implementation
kubernetes-network-policy-default-deny-implementation
Pod-level network segmentation. Distinct from K8s Pod Networking (TC-004) which covers CNI/packet flow, and Gateway API (TC-029) which covers ingress routing.
4
TC-044
Post-Quantum Cryptography: NIST Standards & Migration
post-quantum cryptography migration
Educational / Implementation
post-quantum-cryptography-nist-migration-enterprise
Cryptographic migration strategy. Entirely new domain; no prior coverage of quantum threat or PQC.
5
TC-045
Windows 365 vs Azure Virtual Desktop
Windows 365 vs Azure Virtual Desktop
Comparison / Commercial Investigation
windows-365-vs-azure-virtual-desktop-architecture
Cloud desktop architecture decision. Distinct from Intune/Autopilot articles which focus on endpoint management, not virtual desktop delivery.
Overlap risk assessment: Low. All five topics address distinct technical domains not covered in previous batches. TC-043 (K8s NetworkPolicy) is closest to TC-004 (K8s Pod Networking), but the search intent is fundamentally different — TC-004 covers the CNI packet flow mechanics, while TC-043 covers security policy enforcement and the CNI implementation gap. TC-042 (External ID) is adjacent to TC-028 (PIM), but PIM focuses on internal privileged role management while External ID focuses on guest/partner/customer identity.
Remaining planned articles for future batches:
TC-046: Apache Kafka Consumer Groups, Rebalancing, and Exactly-Once Semantics
TC-047: Istio Ambient Mesh: The Sidecar Problem and the Path to Sidecarless
TC-048: Linux Security Modules: SELinux vs AppArmor vs seccomp in Containers
TC-049: Azure Managed Identities vs App Registrations: Eliminating Service Principal Secrets
TC-050: TCP Congestion Control: BBR vs CUBIC in High-Latency Cloud Networks