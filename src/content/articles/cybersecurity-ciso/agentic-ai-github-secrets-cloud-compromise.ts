import type { Article } from "../../types";

export const article: Article = {
  slug: "agentic-ai-github-secrets-cloud-compromise",
  category: "cybersecurity-ciso",
  contentType: "analysis",
  subcategory: "Security operations",

  title:
    "Agentic AI Is Turning Exposed GitHub Secrets Into Five-Minute Cloud Compromises",

  seoTitle:
    "Agentic AI, GitHub Secrets and Cloud Credential Theft",

  metaDescription:
    "Microsoft observed agentic AI moving from exposed GitHub secrets to Azure Key Vault data theft in minutes. Here is how enterprises should respond.",

  standfirst:
    "AI is shrinking the time between exposing a credential and an attacker using it. The answer is not only faster secret scanning. Enterprises need fewer reusable secrets.",

  excerpt:
    "Microsoft Threat Intelligence has observed attackers using agentic AI to search public GitHub repositories for exposed credentials and automate follow-on cloud attacks. In one case, an agent progressed from finding secrets to exfiltrating Azure Key Vault data in five minutes. This analysis explains what changed, why service principals matter, and how enterprises can reduce the attack window.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-14",
  lastReviewedAt: "2026-11-14",
  nextReviewAt: "2027-02-14",

  readingMinutes: 11,

  primaryKeyword: "AI agent credential theft",

  secondaryKeywords: [
    "agentic AI cyberattack",
    "GitHub exposed secrets",
    "GitHub secret scanning",
    "GitHub push protection",
    "Azure credential theft",
    "service principal compromise",
    "Azure Key Vault security",
    "workload identity federation",
    "application credential security",
    "ARTEX AI",
    "cloud credential theft",
  ],

  tags: [
    "Agentic AI",
    "GitHub",
    "Credential Theft",
    "Microsoft Entra",
    "Azure",
    "Service Principals",
    "Key Vault",
    "Cloud Security",
    "DevSecOps",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "azure-managed-identities-vs-app-registrations-secrets",
    "github-actions-self-hosted-runner-security",
    "oidc-workload-identity-federation-cross-cloud",
  ],

  draft: false,

  methodology:
    "This article is based on Microsoft Threat Intelligence and Microsoft Security Research reporting published in November 2026, supported by current GitHub secret scanning and push protection documentation and Microsoft documentation for workload identity federation, service principal sign-in logging and Azure Key Vault authentication. Confirmed observed activity is separated from wider security analysis and recommendations. No claim is made that every exposed secret will be exploited in minutes or that the five-minute Microsoft-observed case represents a universal attack time.",

  body: [
    {
      type: "p",
      text: "For years, security teams have warned developers not to put passwords, API keys and application secrets into source code. The advice has not changed. What has changed is the speed of the attacker waiting on the other side.",
    },
    {
      type: "p",
      text: "Microsoft Threat Intelligence has observed attackers using an agentic AI offensive framework called ARTEX to search public GitHub repositories for exposed secrets. The agents can analyse what they find and use valid credentials for follow-on attacks. In one case observed by Microsoft, an AI agent moved from scanning GitHub for secrets to exfiltrating data from Azure Key Vault in five minutes.",
    },
    {
      type: "p",
      text: "That five-minute example should change how enterprises think about secret exposure. The problem is no longer only whether a security scanner eventually finds the credential. The question is whether the credential should have existed in reusable form at all.",
    },
    {
      type: "p",
      text: "This is the larger lesson from agentic attacks. AI has not invented credential theft. It has reduced the amount of human work needed between discovery, validation, cloud access, reconnaissance and data theft.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The security window is shrinking",
      text: "A secret committed to a public repository should be treated as compromised. Removing it from the file is not enough. Revoke or rotate the credential first, then investigate how it was used.",
    },

    {
      type: "h2",
      id: "what-microsoft-observed",
      text: "What Microsoft actually observed",
    },
    {
      type: "p",
      text: "Microsoft reported that threat actors were using ARTEX to search public GitHub repositories for credentials, application credentials and AI inference API keys. The framework reduced the need for an operator to review every repository and manually decide what to do with each secret.",
    },
    {
      type: "p",
      text: "The agent could find authentication material, analyse it and continue the attack. Microsoft also investigated abuse of valid application credentials against cloud environments.",
    },
    {
      type: "p",
      text: "Microsoft said that, from October 28, it observed successful service principal sign-ins involving multiple application IDs across some affected customers. In some cases, the compromised credential belonged to a multitenant application owned by a vendor and was then used against downstream tenants.",
    },
    {
      type: "p",
      text: "The follow-on activity included cloud resource discovery and credential and data exfiltration. Microsoft specifically reported access involving Azure Key Vault and Azure Storage, as well as abuse of Azure AI services.",
    },
    {
      type: "p",
      text: "A separate Microsoft report on November 6 said the financially motivated group Microsoft tracks as Storm-3358 had begun using ARTEX against financial organisations. Microsoft observed ARTEX being used alongside conventional tools for scanning, exploitation, credential theft, persistence and lateral movement.",
    },
    {
      type: "p",
      text: "The important point is not that AI created a new type of credential. The applications, service principals, API keys and cloud resources were already there. AI reduced the attacker's manual workload.",
    },

    {
      type: "h2",
      id: "why-five-minutes-matters",
      text: "Why the five-minute example matters",
    },
    {
      type: "p",
      text: "Five minutes is not a universal time-to-compromise. Microsoft described it as one observed case. We should not turn one incident into a statistic for every environment.",
    },
    {
      type: "p",
      text: "It is still an important warning. Many enterprise security processes are built on the assumption that defenders have more time.",
    },
    {
      type: "p",
      text: "A secret-scanning product finds a credential. An alert is opened. Someone reviews it. The development team is contacted. An owner is found. The credential is rotated. The ticket is closed.",
    },
    {
      type: "p",
      text: "That workflow can take hours. In some companies it takes days.",
    },
    {
      type: "p",
      text: "An automated attacker does not need to wait for office hours, find the application owner or obtain approval for a change. It can test the credential as soon as it finds it.",
    },
    {
      type: "p",
      text: "This creates a speed mismatch. Improving alert handling helps, but the stronger control is to remove reusable credentials from workflows where a secretless identity can do the same job.",
    },

    {
      type: "h2",
      id: "service-principals",
      text: "Why service principals deserve more attention",
    },
    {
      type: "p",
      text: "Human identities receive a great deal of security attention. Companies deploy MFA, Conditional Access, privileged identity management and sign-in risk controls.",
    },
    {
      type: "p",
      text: "Software needs identities too. In Microsoft Entra, applications may authenticate as service principals. They may use a certificate or client secret to prove their identity.",
    },
    {
      type: "p",
      text: "That creates a different risk. A client secret is reusable authentication material. If an attacker obtains an active secret and the associated application details, the attacker may be able to authenticate as the application from another system.",
    },
    {
      type: "p",
      text: "The impact then depends on the permissions assigned to that identity. A service principal with narrow access has a smaller blast radius. One with broad rights to Key Vault, storage, Microsoft Graph or Azure management can expose much more.",
    },
    {
      type: "p",
      text: "This is why service principal governance cannot be left only to the development team. Application identities are part of the enterprise identity estate.",
    },

    {
      type: "h2",
      id: "multitenant-risk",
      text: "The multitenant application problem",
    },
    {
      type: "p",
      text: "Microsoft's reporting adds another important scenario. A credential may be compromised at a software vendor rather than inside the customer's own tenant.",
    },
    {
      type: "p",
      text: "A multitenant application can be designed to operate across customer tenants. If a vendor-owned application credential is compromised, the risk may extend to downstream organisations that trust the application.",
    },
    {
      type: "p",
      text: "This changes the third-party conversation. Asking whether a SaaS supplier uses MFA for employees is not enough. Security reviews should also ask how the supplier protects application credentials, whether it uses long-lived secrets, how quickly credentials can be revoked and how customers will be notified.",
    },
    {
      type: "p",
      text: "For critical integrations, the enterprise should also understand the permissions granted to the vendor's enterprise application. The potential blast radius is determined by what the application can actually access.",
    },

    {
      type: "h2",
      id: "github-controls",
      text: "GitHub can stop many secrets before they are committed",
    },
    {
      type: "p",
      text: "GitHub Secret Scanning searches repositories and Git history for hardcoded credentials. It can identify API keys, passwords, tokens and other supported secret types.",
    },
    {
      type: "p",
      text: "Push Protection moves the control earlier. Instead of only alerting after a credential reaches the repository, GitHub can block a push when it detects a supported secret.",
    },
    {
      type: "p",
      text: "GitHub supports provider patterns, generic patterns and organisation-defined custom patterns. It also has AI-based detection for some unstructured secrets, although GitHub currently describes AI-detected secret push protection as public preview.",
    },
    {
      type: "p",
      text: "The important operational point is that blocking is better than detecting later. If the secret never reaches the repository, an attacker scanning the public repository cannot collect it from that commit.",
    },
    {
      type: "p",
      text: "Push Protection also has bypass workflows. Organisations should monitor bypasses rather than treating them as an administrative detail. Frequent bypasses may show that developers are working around the control or that a workflow still depends on storing credentials in code.",
    },

    {
      type: "h2",
      id: "secret-scanning-not-enough",
      text: "Secret scanning is necessary, but it is not the end state",
    },
    {
      type: "p",
      text: "Secret scanning is a valuable detective control. Push Protection is a stronger preventive control. Neither changes the basic fact that a reusable credential remains valuable if an attacker obtains it somewhere else.",
    },
    {
      type: "p",
      text: "Secrets can leak from build logs, developer laptops, issue trackers, configuration files, backup copies, CI/CD variables, support bundles and chat messages.",
    },
    {
      type: "p",
      text: "The long-term objective should therefore be to reduce the number of reusable secrets, not merely scan more places for them.",
    },

    {
      type: "h2",
      id: "workload-federation",
      text: "Workload identity federation changes the model",
    },
    {
      type: "p",
      text: "Microsoft Entra Workload Identity Federation allows a software workload to access Entra-protected resources without storing a Microsoft Entra application secret. The same design choice is covered in [OIDC workload identity federation](/cybersecurity-ciso/oidc-workload-identity-federation-cross-cloud), including the trust boundary created when one platform accepts identity claims from another.",
    },
    {
      type: "p",
      text: "The external workload obtains a token from a trusted identity provider. Microsoft Entra checks the federation relationship and exchanges the external token for a Microsoft access token.",
    },
    {
      type: "p",
      text: "Microsoft documents this model for scenarios including GitHub Actions, Kubernetes and workloads running on platforms outside Azure.",
    },
    {
      type: "p",
      text: "For Azure-hosted applications, managed identities provide another strong option. Azure manages the underlying credential rather than asking the application team to store a secret in configuration. The practical differences are covered in [managed identities versus app registrations and secrets](/cloud/azure-managed-identities-vs-app-registrations-secrets).",
    },
    {
      type: "p",
      text: "This does not make identity risk disappear. A badly scoped federated identity can still have excessive permissions. But it removes a reusable application secret that can be copied out of source code and used somewhere else.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The better question",
      text: "Do not ask only, where should we store this secret? Ask whether this workload needs a stored secret at all.",
    },

    {
      type: "h2",
      id: "key-vault",
      text: "Key Vault protects secrets, but identity still decides who can read them",
    },
    {
      type: "p",
      text: "Azure Key Vault is designed to protect keys, certificates and secrets. Access still depends on identity and authorization.",
    },
    {
      type: "p",
      text: "Microsoft recommends managed identities for supported Azure application scenarios. A service principal can also authenticate to Key Vault, but its credentials and permissions then become part of the attack surface.",
    },
    {
      type: "p",
      text: "If a compromised application identity can read large parts of Key Vault, one credential leak can expose additional credentials. That can turn one compromised identity into a path toward several systems.",
    },
    {
      type: "p",
      text: "Key Vault therefore needs least privilege at the identity level. Applications should receive access only to the vaults and operations they need.",
    },

    {
      type: "h2",
      id: "detect-service-principal-abuse",
      text: "Can your SOC see service principal abuse?",
    },
    {
      type: "p",
      text: "Microsoft Entra records service principal sign-ins separately from normal user sign-ins. These events can show the application identity, IP address, target resource, client credential type and other useful investigation fields.",
    },
    {
      type: "p",
      text: "Azure Monitor also exposes the AADServicePrincipalSignInLogs table. Relevant fields include ServicePrincipalId, AppId, IPAddress, ClientCredentialType, ResourceDisplayName and FederatedCredentialId.",
    },
    {
      type: "p",
      text: "That data gives a SOC a way to answer practical questions. Did an application suddenly authenticate from a new IP address? Did it access a resource it normally never uses? Was a client secret used where the application normally uses a federated credential?",
    },
    {
      type: "p",
      text: "Log collection must be configured before the incident. A five-minute attack is a poor time to discover that application sign-in data was never sent to the SIEM.",
    },

    {
      type: "h2",
      id: "five-minute-response",
      text: "Build a five-minute response for leaked credentials",
    },
    {
      type: "p",
      text: "If attackers can move in minutes, the first response steps must be simple and rehearsed.",
    },
    {
      type: "ol",
      items: [
        "Identify the credential type and owning application.",
        "Revoke or rotate the exposed credential immediately.",
        "Do not wait for the secret to be removed from Git history before revoking it.",
        "Identify the service principal, application ID and permissions.",
        "Review service principal sign-ins from the exposure window.",
        "Review the source IP addresses and resources accessed by the application.",
        "Check Azure Key Vault, storage, Microsoft Graph and other resources the identity can reach.",
        "Look for new credentials, role changes and persistence.",
        "Preserve logs and the original secret-scanning alert.",
        "Determine how the secret entered the repository.",
        "Replace the secret with a managed or federated identity where possible.",
        "Document the incident and improve the preventive control.",
      ],
    },
    {
      type: "p",
      text: "The exact five-minute target may not be achievable for every organisation. The principle still matters. Credential revocation should not depend on finding three people and arranging a meeting.",
    },

    {
      type: "h2",
      id: "developer-controls",
      text: "What development teams should change",
    },
    {
      type: "ul",
      items: [
        "Enable GitHub secret scanning for repositories that can contain company credentials.",
        "Enable Push Protection where licensing and repository settings allow it.",
        "Use custom patterns for internal credential formats that standard detectors do not recognise.",
        "Monitor and review Push Protection bypasses.",
        "Never use example production credentials in sample code.",
        "Keep secrets out of source code, documentation and test fixtures.",
        "Prefer GitHub Actions federation over stored Azure client secrets where supported.",
        "Use separate identities for development, test and production.",
        "Remove unused credentials and stale service principals.",
      ],
    },

    {
      type: "h2",
      id: "identity-controls",
      text: "What identity teams should change",
    },
    {
      type: "ul",
      items: [
        "Inventory applications and service principals with active credentials.",
        "Identify long-lived client secrets.",
        "Find credentials approaching expiry and applications with multiple overlapping secrets.",
        "Review high-privilege application permissions.",
        "Reduce access to Key Vault, storage and Microsoft Graph.",
        "Use managed identities for Azure workloads where supported.",
        "Use workload identity federation for GitHub Actions, Kubernetes and other supported external workloads.",
        "Review service principal sign-ins as part of normal identity monitoring.",
        "Define a rapid process for disabling an application identity during an incident.",
      ],
    },

    {
      type: "h2",
      id: "soc-controls",
      text: "What the SOC should monitor",
    },
    {
      type: "p",
      text: "Service principal activity should not be treated as background noise. Non-human identities can hold powerful permissions and operate without a person signing in.",
    },
    {
      type: "ul",
      items: [
        "Service principal sign-ins from new IP addresses or regions.",
        "Sudden increases in application authentication volume.",
        "Access to resources not normally used by the application.",
        "Client-secret authentication by workloads expected to use federation.",
        "Key Vault reads outside the application's normal pattern.",
        "Storage access or enumeration by unusual applications.",
        "New application credentials.",
        "Changes to privileged application permissions.",
        "Activity shortly after a GitHub secret alert.",
      ],
    },

    {
      type: "h2",
      id: "ciso-questions",
      text: "Questions a CISO should ask",
    },
    {
      type: "ol",
      items: [
        "How many active application secrets exist in our environment?",
        "How many are stored in source-code platforms or CI/CD systems?",
        "Which service principals can read Key Vault or sensitive storage?",
        "Which applications have broad Microsoft Graph permissions?",
        "Can developers push secrets into repositories without a preventive control?",
        "Who can bypass Push Protection?",
        "How quickly can we revoke an exposed application credential?",
        "Do our SIEM logs include service principal sign-ins?",
        "Can we identify the owner of every privileged application?",
        "Which stored secrets could be replaced by federation or managed identity this quarter?",
      ],
    },
    {
      type: "p",
      text: "The answers should produce actions, not only an audit spreadsheet. The best metric is not the number of secrets discovered. It is the number of unnecessary reusable secrets removed.",
    },

    {
      type: "h2",
      id: "thirty-day-plan",
      text: "A practical 30-day plan",
    },
    {
      type: "p",
      text: "An enterprise does not need to redesign every workload at once. Start with the credentials that create the largest blast radius.",
    },
    {
      type: "ol",
      items: [
        "Week 1: Enable or review GitHub secret scanning and Push Protection. Identify repositories with the most bypasses and alerts.",
        "Week 1: Export a list of application registrations, service principals and active credentials.",
        "Week 2: Rank application identities by privilege and access to Key Vault, storage, Microsoft Graph and Azure management.",
        "Week 2: Confirm that service principal sign-in logs reach the SOC or SIEM.",
        "Week 3: Migrate one high-value GitHub Actions workflow from a stored Azure secret to workload identity federation.",
        "Week 3: Move eligible Azure-hosted applications to managed identities.",
        "Week 4: Run a tabletop exercise. Assume an application secret has appeared in a public repository and measure how long revocation and investigation take.",
        "Week 4: Present management with the remaining high-risk reusable credentials and a migration plan.",
      ],
    },

    {
      type: "h2",
      id: "what-ai-changes",
      text: "What AI changes, and what it does not",
    },
    {
      type: "p",
      text: "Agentic AI changes speed, scale and the amount of manual work required to run an attack. Microsoft and other threat researchers are observing more AI use across reconnaissance, vulnerability discovery, credential abuse and post-compromise activity.",
    },
    {
      type: "p",
      text: "It does not make established security controls obsolete. In many cases, it makes them more important.",
    },
    {
      type: "p",
      text: "A secret that does not exist cannot be stolen from a repository. A service principal with narrow permissions creates less damage when compromised. A Key Vault that limits access exposes fewer secrets. A SOC that collects application sign-ins can investigate faster.",
    },
    {
      type: "p",
      text: "The fundamentals remain identity, least privilege, logging, segmentation and rapid incident response. AI puts those fundamentals on a much faster clock.",
    },

    {
      type: "h2",
      id: "main-lesson",
      text: "The main lesson",
    },
    {
      type: "p",
      text: "The right response to agentic credential attacks is not panic about AI. It is to remove the conditions that make automation powerful.",
    },
    {
      type: "p",
      text: "Public repositories should not contain active credentials. Development pipelines should not depend on permanent secrets when federation is available. Service principals should not receive broad access merely because nobody has reviewed them recently.",
    },
    {
      type: "p",
      text: "Microsoft's five-minute observation is useful because it changes the time assumption. A credential leak can move from development mistake to cloud incident before a normal ticket reaches an analyst.",
    },
    {
      type: "p",
      text: "Secret scanning remains important. Push Protection is better. Secretless authentication is better still.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "The question to take back to the team",
      text: "If one of our application credentials became public right now, how much could an attacker reach in the next five minutes? Then ask the harder question: why does that reusable credential still exist?",
    },
  ],

  faq: [
    {
      question: "Are attackers really using AI agents to steal cloud credentials?",
      answer:
        "Yes. Microsoft Threat Intelligence reported threat actors using the ARTEX agentic AI framework to search public GitHub repositories for secrets and automate follow-on activity. Microsoft observed one case that progressed from secret discovery to Azure Key Vault data exfiltration in five minutes.",
    },
    {
      question: "Does five minutes represent the normal time to cloud compromise?",
      answer:
        "No. Microsoft described five minutes as one observed case. It should not be treated as a universal benchmark. It demonstrates that automation can greatly reduce the time defenders have after a credential is exposed.",
    },
    {
      question: "Does deleting a secret from GitHub make it safe?",
      answer:
        "No. If a usable credential was exposed, revoke or rotate it. Removing it from the current file does not invalidate copies in Git history, attacker systems, logs or other locations.",
    },
    {
      question: "What is GitHub Push Protection?",
      answer:
        "Push Protection is part of GitHub secret scanning. It can block a push when supported credentials are detected, helping prevent secrets from reaching the repository in the first place.",
    },
    {
      question: "What is workload identity federation?",
      answer:
        "Workload identity federation lets supported external workloads exchange a trusted identity-provider token for a Microsoft Entra access token. This removes the need to store a reusable Microsoft Entra client secret in supported scenarios.",
    },
    {
      question: "Why are service principals important in cloud attacks?",
      answer:
        "Service principals represent applications and services rather than human users. They can hold permissions to cloud resources. A compromised credential for an over-privileged service principal can therefore provide significant access without compromising a normal user account.",
    },
    {
      question: "What should an organisation do first after finding a public application secret?",
      answer:
        "Revoke or rotate the credential immediately, identify the associated application and permissions, review service principal sign-ins and resource activity, investigate for persistence, and then replace the stored secret with a managed or federated identity where practical.",
    },
  ],

  sources: [
    {
      title:
        "Threat actors use agentic AI tooling to find and abuse exposed secrets",
      publisher: "Microsoft Security Blog",
      url: "https://www.microsoft.com/en-us/security/blog/2026/11/05/threat-actors-use-agentic-ai-tooling-to-find-and-abuse-exposed-secrets/",
    },
    {
      title:
        "ARTEX abuse expands as cybercriminals target financial sector",
      publisher: "Microsoft Security Blog",
      url: "https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/",
    },
    {
      title: "Push protection",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/code-security/concepts/secret-security/push-protection",
    },
    {
      title: "Secret scanning",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning",
    },
    {
      title: "Bypass requests for push protection",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/code-security/concepts/secret-security/bypass-requests",
    },
    {
      title: "Workload Identity Federation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation",
    },
    {
      title: "Service principal sign-in logs",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-service-principal-sign-ins",
    },
    {
      title: "AADServicePrincipalSignInLogs",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadserviceprincipalsigninlogs",
    },
    {
      title: "Authenticate to Azure Key Vault",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/azure/key-vault/general/authentication",
    },
    {
      title: "AI Is Both Target and Tool for Threat Actors",
      publisher: "Recorded Future",
      url: "https://www.recordedfuture.com/research/ai-cyber-threat-trends-2026",
    },
  ],
};