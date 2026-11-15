import type { Article } from "../../types";

export const article: Article = {
  slug: "enterprise-passkeys-passwordless-readiness",
  category: "microsoft-365-entra-id",
  contentType: "analysis",
  subcategory: "Identity",

  title:
    "Passkeys in the Enterprise: Are We Finally Ready to Remove Passwords?",

  seoTitle:
    "Enterprise Passkeys: Are We Ready to Remove Passwords?",

  metaDescription:
    "A practical enterprise guide to passkeys, phishing resistance, account recovery, Entra ID, shared devices and moving safely beyond passwords.",

  standfirst:
    "Passkeys can remove reusable passwords from sign-in. The harder enterprise work sits around enrolment, recovery, devices, privileged access and legacy systems.",

  excerpt:
    "Passkeys offer strong resistance to traditional credential phishing, but enterprise readiness involves much more than registering a new authentication method. IT leaders must design recovery, lifecycle, service-desk, shared-device, BYOD and privileged-access controls before passwords can safely disappear.",

  heroImage:
    "/images/articles/enterprise-passkeys-passwordless-readiness.webp",

  heroImageAlt:
    "Enterprise passkey authentication across managed devices, security keys and cloud applications with an account recovery path.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-15",
  lastReviewedAt: "2026-11-15",
  nextReviewAt: "2027-02-15",

  readingMinutes: 12,

  primaryKeyword: "enterprise passkeys",

  secondaryKeywords: [
    "passkeys for business",
    "passkeys vs passwords",
    "passwordless authentication",
    "Microsoft Entra passkeys",
    "FIDO2 enterprise",
    "phishing-resistant MFA",
    "synced vs device-bound passkeys",
    "Windows Hello for Business vs passkeys",
    "passkey deployment",
    "passkey account recovery",
  ],

  tags: [
    "Passkeys",
    "Passwordless",
    "Microsoft Entra",
    "FIDO2",
    "Identity Security",
    "Conditional Access",
    "Zero Trust",
    "Authentication",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "conditional-access-break-glass-accounts",
  ],

  draft: false,

  methodology:
    "This article is an independent enterprise analysis based on public documentation from the FIDO Alliance, W3C, Microsoft, NIST and CISA. It separates the security properties of passkeys from the operational decisions required for enrolment, recovery, shared devices, privileged identities and application compatibility. Product capabilities and terminology should be rechecked against current public documentation before publication because passkey support and identity-platform features continue to change.",

  body: [
    {
      type: "p",
      text: "An employee arrives on Monday morning with an identity problem. The phone that contained a passkey is gone. The laptop has failed. The employee still needs Microsoft 365, ERP and several SaaS applications.",
    },
    {
      type: "p",
      text: "There is no password to fall back to.",
    },
    {
      type: "p",
      text: "What happens next?",
    },
    {
      type: "p",
      text: "That question gets to the difficult part of enterprise passwordless authentication. Passkeys can remove one of the oldest weaknesses in corporate IT: the reusable password. They can also provide strong resistance to traditional credential phishing.",
    },
    {
      type: "p",
      text: "But removing the password does not remove identity operations. IT still needs to enrol people, replace devices, recover accounts, support shared workstations, handle departures and protect administrators.",
    },
    {
      type: "p",
      text: "In some areas, those processes become more important when the password disappears.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The real enterprise question",
      text: "The technology needed to move beyond passwords is becoming mature. The harder enterprise problem is everything surrounding authentication.",
    },

    {
      type: "h2",
      id: "why-remove-passwords",
      text: "Why enterprises want to remove passwords",
    },
    {
      type: "p",
      text: "Passwords have survived because almost every system understands them. That universality came at a cost.",
    },
    {
      type: "p",
      text: "Passwords can be phished. People reuse them. Attackers test stolen credentials against other services. Weak passwords can be guessed. Strong passwords are forgotten.",
    },
    {
      type: "p",
      text: "Organisations then build more controls around the password. MFA helps enormously, but the strength depends on the authentication methods used.",
    },
    {
      type: "p",
      text: "Passkeys offer a different model. Instead of improving the protection around a shared password, the organisation can remove that shared secret from the normal authentication flow.",
    },
    {
      type: "p",
      text: "That is an important change. It does not make identity risk disappear.",
    },

    {
      type: "h2",
      id: "what-is-a-passkey",
      text: "What a passkey actually is",
    },
    {
      type: "p",
      text: "A passkey uses public-key cryptography. During registration, the authenticator creates a pair of cryptographic keys.",
    },
    {
      type: "p",
      text: "The service receives the public key. The private key remains under the user's control through the device, authenticator or approved credential provider.",
    },
    {
      type: "p",
      text: "During authentication, the service sends a challenge. The authenticator uses the private key to prove possession without sending that private key to the service.",
    },
    {
      type: "p",
      text: "There is no reusable password for the user to type into a login page. That difference is central to the security value of passkeys.",
    },
    {
      type: "p",
      text: "It also changes what IT needs to protect. Instead of asking only whether a password is strong, IT must understand the device, authenticator, registration process, recovery process and identity policy around the credential.",
    },

    {
      type: "h2",
      id: "passkey-terminology",
      text: "Passkeys, FIDO2 and WebAuthn without the jargon",
    },
    {
      type: "p",
      text: "Passwordless discussions quickly collect overlapping terms. They are related, but they are not identical.",
    },
    {
      type: "table",
      caption: "Common passwordless terms",
      head: [
        "Term",
        "Practical meaning",
      ],
      rows: [
        [
          "WebAuthn",
          "A web standard that allows applications and browsers to use public-key credentials for authentication.",
        ],
        [
          "FIDO2",
          "A broader set of technologies for modern authentication, including WebAuthn and authenticator protocols.",
        ],
        [
          "Passkey",
          "A discoverable FIDO credential intended to provide a simpler passwordless sign-in experience.",
        ],
        [
          "Security key",
          "A physical authenticator that may support FIDO2 authentication.",
        ],
        [
          "Windows Hello for Business",
          "Microsoft's enterprise authentication approach that associates strong credentials with organisational identity and Windows devices.",
        ],
      ],
    },
    {
      type: "p",
      text: "For IT leaders, the precise terminology matters less than the architecture. Where does the private credential live? Who controls it? Can it move? How is it registered? How is it recovered?",
    },
    {
      type: "p",
      text: "Those questions determine the operating model.",
    },

    {
      type: "h2",
      id: "synced-vs-device-bound",
      text: "Synced and device-bound credentials are different enterprise choices",
    },
    {
      type: "p",
      text: "One of the most important passkey decisions is whether a credential stays tied to one authenticator or can be synchronised across devices.",
    },
    {
      type: "p",
      text: "A device-bound credential stays with a particular device or authenticator. That can be attractive for privileged access because the organisation has a clearer idea of where authentication authority resides.",
    },
    {
      type: "p",
      text: "The trade-off is operational. What happens when the device fails? What happens when it is replaced? How many authenticators should a user register? How does a travelling administrator recover access?",
    },
    {
      type: "p",
      text: "Synced passkeys address part of that problem by making credentials available across permitted devices through a credential ecosystem. That can produce a smoother user experience.",
    },
    {
      type: "p",
      text: "It also raises enterprise questions. Which account controls the synchronisation? Can a corporate passkey become available on an unmanaged device? What happens after the employee leaves? What visibility does IT retain?",
    },
    {
      type: "p",
      text: "The right answer does not have to be never sync. The organisation should make the choice deliberately.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Convenience changes control",
      text: "Convenience should not move part of the authentication control plane outside the organisation without anyone noticing.",
    },

    {
      type: "h2",
      id: "phishing-resistance",
      text: "Passkeys do something passwords cannot",
    },
    {
      type: "p",
      text: "Passkeys provide an important defence against traditional credential phishing because authentication is tied to the legitimate service rather than relying on the user to recognise whether a page looks trustworthy.",
    },
    {
      type: "p",
      text: "A fake login page cannot simply ask the employee to enter the same reusable secret used by the real service. There is no password secret to hand over in that authentication flow.",
    },
    {
      type: "p",
      text: "This is a major improvement. It does not mean a passkey prevents every form of compromise.",
    },
    {
      type: "ul",
      items: [
        "Malware can still compromise devices or data.",
        "Authenticated sessions can still be stolen or abused.",
        "Users can still approve malicious OAuth applications.",
        "Unlocked or poorly protected devices can still create risk.",
        "Applications can still grant excessive access.",
        "Recovery processes can still be socially engineered.",
      ],
    },
    {
      type: "p",
      text: "Phishing-resistant does not mean compromise-resistant. Passkeys strengthen one critical layer of identity security. The layers around it still matter.",
    },

    {
      type: "h2",
      id: "enrolment",
      text: "The real project begins with enrolment",
    },
    {
      type: "p",
      text: "A passkey has to be registered before it can be used. That first registration deserves as much attention as later authentication.",
    },
    {
      type: "p",
      text: "Suppose an attacker has already compromised a weaker sign-in method. If that method allows a new strong credential to be registered without enough additional verification, the organisation may convert temporary access into durable access.",
    },
    {
      type: "p",
      text: "The enrolment path therefore needs an appropriate level of trust. Depending on the environment, that might involve an existing strong method, a managed device, a temporary bootstrap credential, identity verification or a controlled administrator process.",
    },
    {
      type: "p",
      text: "Highly privileged identities may deserve a stricter process than normal users.",
    },
    {
      type: "p",
      text: "A strong authentication method enrolled through a weak process inherits some of the weakness of that process.",
    },

    {
      type: "h2",
      id: "account-recovery",
      text: "Account recovery is the real passwordless test",
    },
    {
      type: "p",
      text: "Return to the employee on Monday morning. The phone is missing. The laptop is dead. Perhaps the hardware security key is at home.",
    },
    {
      type: "p",
      text: "How should IT restore access?",
    },
    {
      type: "p",
      text: "This is where a passwordless strategy becomes an operating model. A resilient design may allow users to register more than one approved authenticator.",
    },
    {
      type: "p",
      text: "The organisation may have a controlled temporary-access mechanism. The service desk may have a recovery workflow. Highly privileged accounts may use a separate procedure.",
    },
    {
      type: "p",
      text: "Whatever approach is chosen, the recovery process has to establish identity strongly enough to justify issuing new authentication capability.",
    },
    {
      type: "p",
      text: "Otherwise the organisation removes phishing from the front door and recreates it at the help desk.",
    },
    {
      type: "p",
      text: "Attackers adapt to controls. When asking a user for a password becomes less useful, convincing support staff to register a new authenticator may become more attractive.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Recovery becomes a target",
      text: "Once passwords become harder to steal, recovery processes become more valuable targets.",
    },

    {
      type: "h2",
      id: "help-desk",
      text: "The help desk becomes part of the authentication system",
    },
    {
      type: "p",
      text: "Passwordless projects are often discussed as identity-platform projects. The service desk needs to be part of the design.",
    },
    {
      type: "p",
      text: "If support staff can enable a recovery method, register new authentication information or issue temporary access, the help desk participates in the authentication system.",
    },
    {
      type: "p",
      text: "Recovery roles therefore need appropriate control. Help-desk operators need strong authentication themselves. Important recovery actions should be logged. High-risk cases need escalation.",
    },
    {
      type: "p",
      text: "Identity verification also needs more thought than asking questions an attacker could learn from public information or a compromised mailbox.",
    },
    {
      type: "p",
      text: "An employee number is not a secret. A manager's name is not a secret. Caller ID is not strong proof of identity.",
    },
    {
      type: "p",
      text: "This concern is especially practical for organisations with centralised service desks supporting remote offices, plants and travelling employees. The process must work when the person seeking recovery cannot simply walk into the IT office.",
    },

    {
      type: "h2",
      id: "shared-devices",
      text: "Shared devices complicate the simple passwordless story",
    },
    {
      type: "p",
      text: "A knowledge worker with a company laptop and smartphone is the easiest passkey scenario. Not every enterprise user looks like that.",
    },
    {
      type: "p",
      text: "Think about factory-floor terminals, warehouse workstations, shared clinical systems, reception PCs, laboratories, call centres and training environments.",
    },
    {
      type: "p",
      text: "A user may not have a personal corporate device. Several people may use one workstation across shifts. The system may sometimes operate with poor connectivity. The organisation may need rapid user switching.",
    },
    {
      type: "p",
      text: "In these environments, IT needs to decide which authenticator model fits the work. A hardware security key may be practical for one workforce. A managed device credential may fit another. Some shared-device workflows may need broader redesign.",
    },
    {
      type: "p",
      text: "This is why enabling passkeys for everyone is not a deployment plan. Different operating populations may need different authentication designs.",
    },

    {
      type: "h2",
      id: "privileged-identities",
      text: "Privileged identities need a different policy",
    },
    {
      type: "p",
      text: "A Global Administrator should not automatically receive the same passkey policy as a normal knowledge worker. The impact of compromise is different.",
    },
    {
      type: "p",
      text: "Privileged identities may justify device-bound credentials, hardware security keys, dedicated administrative devices and tighter recovery procedures.",
    },
    {
      type: "p",
      text: "Administrator identities should be separated from ordinary daily-use accounts where the organisation's identity design supports that model.",
    },
    {
      type: "p",
      text: "Changes to authentication methods for privileged accounts deserve close monitoring. Emergency-access accounts also need special treatment.",
    },
    {
      type: "p",
      text: "The purpose of emergency access is to retain administrative access when normal controls fail. The same principle is covered in [Conditional Access break-glass accounts](/microsoft-365-entra-id/conditional-access-break-glass-accounts), where emergency identities need deliberate testing and protection rather than normal user treatment.",
    },
    {
      type: "p",
      text: "The easiest passkey experience is not always the right experience for a privileged identity.",
    },

    {
      type: "h2",
      id: "byod",
      text: "BYOD changes the ownership question",
    },
    {
      type: "p",
      text: "Personal devices create another decision. If a corporate passkey is available on an employee-owned phone, who controls the lifecycle?",
    },
    {
      type: "p",
      text: "Can the credential synchronise? Through which ecosystem? What happens when the employee replaces or sells the device? What happens at offboarding?",
    },
    {
      type: "p",
      text: "Can IT stop access without controlling the personal device?",
    },
    {
      type: "p",
      text: "These questions do not mean BYOD passkeys are automatically unsafe. They mean device ownership needs to be part of authentication policy.",
    },
    {
      type: "p",
      text: "A company may accept synced credentials for normal SaaS access while requiring stronger device-bound methods for privileged actions. The important point is to make that distinction intentionally.",
    },

    {
      type: "h2",
      id: "password-dependency",
      text: "Passwordless does not mean every password disappears",
    },
    {
      type: "p",
      text: "Enterprise IT rarely moves all systems at once. Passwords may remain in old applications, VPN systems, network devices, emergency processes, service accounts or protocols that cannot use modern authentication.",
    },
    {
      type: "p",
      text: "This transition can last much longer than the first passkey rollout. That creates a measurement problem.",
    },
    {
      type: "p",
      text: "The organisation may report that most users have passkeys while those users still have active passwords that work against important systems. From an attacker's perspective, the password has not disappeared.",
    },
    {
      type: "p",
      text: "A better metric is how many live authentication paths still accept a reusable password. That measures actual dependency rather than registration activity.",
    },

    {
      type: "h2",
      id: "legacy-applications",
      text: "Legacy applications can determine the timeline",
    },
    {
      type: "p",
      text: "Before setting a date for passwordless operation, inventory the applications that users actually need.",
    },
    {
      type: "p",
      text: "Include SaaS applications, internal web applications, VPN, VDI, mobile apps, privileged systems, network infrastructure and thick-client software.",
    },
    {
      type: "table",
      caption: "Classify the application estate before rollout",
      head: [
        "Class",
        "Meaning",
      ],
      rows: [
        [
          "Passkey capable",
          "The application can use an approved passwordless method directly.",
        ],
        [
          "Federated",
          "The application relies on the enterprise identity provider and can inherit stronger authentication.",
        ],
        [
          "Password dependent",
          "The application still requires a reusable password.",
        ],
        [
          "Exception",
          "The application cannot modernise yet and needs a named owner, risk treatment and review date.",
        ],
      ],
    },
    {
      type: "p",
      text: "This inventory often determines the real project timeline. The authentication platform may already be ready. The application estate may not be.",
    },

    {
      type: "h2",
      id: "passkeys-and-sso",
      text: "Passkeys and SSO solve different problems",
    },
    {
      type: "p",
      text: "Passkeys are sometimes discussed as though they replace Single Sign-On. They address different layers.",
    },
    {
      type: "p",
      text: "SSO reduces the number of authentication events a user encounters. Passkeys change how an authentication event is performed.",
    },
    {
      type: "p",
      text: "An organisation can have SSO that still relies on passwords. It can have SSO backed by phishing-resistant authentication. It can also have passkeys for some applications while others remain outside the central identity provider.",
    },
    {
      type: "p",
      text: "SSO reduces authentication events. Passkeys strengthen the authentication event itself. Most enterprises need both ideas working together.",
    },

    {
      type: "h2",
      id: "passkeys-and-mfa",
      text: "What happens to MFA?",
    },
    {
      type: "p",
      text: "Do passkeys replace MFA sounds like a simple question, but it invites an oversimplified answer.",
    },
    {
      type: "p",
      text: "Authentication assurance matters more than counting prompts. A properly implemented passkey can combine possession of an authenticator with local user verification, depending on the implementation and policy.",
    },
    {
      type: "p",
      text: "That can provide strong authentication without asking the user to enter one secret and then approve another prompt.",
    },
    {
      type: "p",
      text: "The enterprise question should be what assurance the method provides for this identity, device and resource.",
    },
    {
      type: "p",
      text: "A highly privileged action may need a stronger policy than access to a normal productivity application. Passwordless design should reduce unnecessary friction without reducing assurance.",
    },

    {
      type: "h2",
      id: "conditional-access",
      text: "Conditional Access still matters",
    },
    {
      type: "p",
      text: "Strong authentication does not eliminate access policy.",
    },
    {
      type: "p",
      text: "For organisations using Microsoft Entra, Conditional Access can evaluate more than the selected authentication method. Policy can consider the application, device state, platform, location, user risk, sign-in risk, authentication strength and resource sensitivity where supported.",
    },
    {
      type: "p",
      text: "This matters because authentication answers only part of the access question. The credential may be strong while the device is unmanaged. The requested resource may still be sensitive.",
    },
    {
      type: "p",
      text: "Strong authentication does not remove the need for strong authorization and access policy.",
    },

    {
      type: "h2",
      id: "measure-success",
      text: "Measure the programme differently",
    },
    {
      type: "p",
      text: "A passwordless programme needs better measures than passkey registration percentage. Registration matters, but it is an adoption metric. It does not prove that password dependency has fallen.",
    },
    {
      type: "table",
      caption: "Better measures for a passwordless programme",
      head: [
        "Measure",
        "Question",
      ],
      rows: [
        [
          "Adoption",
          "How many users have a usable phishing-resistant authentication method?",
        ],
        [
          "Password dependency",
          "How many live authentication paths still accept reusable passwords?",
        ],
        [
          "Privileged coverage",
          "How many sensitive identities require the strongest approved methods?",
        ],
        [
          "Recovery",
          "How often are accounts recovered and through which workflow?",
        ],
        [
          "Support",
          "Did authentication-related service-desk demand rise or fall?",
        ],
        [
          "Exceptions",
          "Which users or applications still cannot move, who owns the exception and when will it be reviewed?",
        ],
      ],
    },
    {
      type: "p",
      text: "These measures tell an IT leader whether the organisation is becoming meaningfully passwordless rather than merely accumulating passkeys.",
    },

    {
      type: "h2",
      id: "rollout-model",
      text: "A sensible rollout model",
    },
    {
      type: "p",
      text: "Start with a population IT can support closely. Administrators and IT staff provide useful early feedback because they understand the environment and are likely to encounter edge cases.",
    },
    {
      type: "ol",
      items: [
        "Phase 1: Use a small IT and security group. Test enrolment, replacement, recovery, multiple devices, logging and revocation.",
        "Phase 2: Expand to a technically capable business pilot with a wider range of devices and applications.",
        "Phase 3: Move to standard knowledge workers after the support model is proven.",
        "Phase 4: Design separately for frontline workers, shared-device users, contractors, external identities and specialist systems.",
      ],
    },
    {
      type: "p",
      text: "Do not force every user population through the same design. A controlled exception is safer than a rushed rollout followed by an uncontrolled return to passwords.",
    },

    {
      type: "h2",
      id: "thirty-day-assessment",
      text: "A 30-day passwordless readiness assessment",
    },
    {
      type: "p",
      text: "The first month does not need to end with every employee using passkeys. It should end with IT knowing whether the organisation is ready.",
    },
    {
      type: "ol",
      items: [
        "Week 1: Inventory authentication methods, privileged identities, password-dependent applications and unsupported protocols.",
        "Week 2: Design and test recovery for lost phones, failed laptops, new devices and the case where every normal authenticator is unavailable.",
        "Week 3: Run a controlled IT and security pilot. Measure enrolment failures, recovery events, device problems and application gaps.",
        "Week 4: Classify users and applications as ready now, ready after a defined change, approved exception or not suitable yet.",
      ],
    },
    {
      type: "p",
      text: "Test the help desk as well. Can support distinguish a real employee from a convincing impersonator without relying on weak personal information?",
    },

    {
      type: "h2",
      id: "cio-questions",
      text: "Questions a CIO should ask before approving passkeys",
    },
    {
      type: "ol",
      items: [
        "What percentage of the workforce can genuinely stop using passwords?",
        "Which applications still require a reusable password?",
        "Who controls synced corporate passkeys?",
        "What happens when an employee loses every registered device?",
        "Who can issue or register a replacement authentication method?",
        "How is recovery verified and audited?",
        "What stronger policy applies to administrators?",
        "How will shared workstations authenticate users?",
        "What happens to work credentials on personal devices after departure?",
        "How will IT measure falling password dependency?",
      ],
    },
    {
      type: "p",
      text: "If those answers are unclear, registering more passkeys is not yet the main problem.",
    },

    {
      type: "h2",
      id: "main-decision",
      text: "The decision is no longer simply whether passkeys are secure",
    },
    {
      type: "p",
      text: "Passkeys solve an important authentication problem. They can remove reusable credentials from normal sign-in and provide strong resistance to traditional phishing.",
    },
    {
      type: "p",
      text: "That is a significant improvement. Enterprise adoption, however, is not only a cryptography project.",
    },
    {
      type: "p",
      text: "It is a lifecycle project. A recovery project. An application-compatibility project. A service-desk project. A device-ownership project. And ultimately a governance project.",
    },
    {
      type: "p",
      text: "The password survived for decades partly because it was universal. Almost every system understood it. Employees understood it. Help desks knew how to reset it.",
    },
    {
      type: "p",
      text: "Passkeys offer a better model for authentication. Replacing a universal mechanism means replacing the processes that grew around it as well.",
    },
    {
      type: "p",
      text: "The organisations that succeed will not be those that register the most passkeys first.",
    },
    {
      type: "p",
      text: "They will be the organisations that can answer a harder question: when the password is finally gone, can identity still work safely on the worst possible Monday morning?",
    },
  ],

  faq: [
    {
      question: "What is an enterprise passkey?",
      answer:
        "A passkey is a public-key credential used for authentication without sending a reusable password to the service. Enterprise use adds policy around enrolment, devices, recovery, lifecycle, privileged access and approved authenticators.",
    },
    {
      question: "Are passkeys safer than passwords?",
      answer:
        "Passkeys can provide strong resistance to traditional credential phishing because there is no reusable password for a user to enter into a fake login page. They do not prevent every form of account, device, session or application compromise.",
    },
    {
      question: "Can passkeys replace MFA?",
      answer:
        "Passkeys can provide strong authentication and may combine possession with local user verification. Whether a method satisfies the organisation's required authentication strength depends on the implementation, identity platform and policy.",
    },
    {
      question:
        "What happens when an employee loses a device containing a passkey?",
      answer:
        "A well-designed enterprise deployment provides another approved authenticator or a controlled recovery process. Recovery should verify identity strongly and should be more tightly controlled for privileged users.",
    },
    {
      question:
        "What is the difference between passkeys and Windows Hello for Business?",
      answer:
        "Passkeys describe discoverable FIDO credentials used across supported services and authenticators. Windows Hello for Business is Microsoft's enterprise authentication approach for Windows devices. Both use public-key concepts, but their deployment, lifecycle and enterprise use cases are not identical.",
    },
    {
      question: "Should administrators use synced passkeys?",
      answer:
        "Privileged accounts may justify tighter controls than normal workforce accounts, including device-bound credentials or hardware authenticators. The appropriate design depends on the threat model, administrative workflow and recovery requirements.",
    },
  ],

  sources: [
    {
      title: "Passkeys",
      publisher: "FIDO Alliance",
      url: "https://fidoalliance.org/passkeys/",
    },
    {
      title: "Web Authentication: An API for accessing Public Key Credentials",
      publisher: "World Wide Web Consortium",
      url: "https://www.w3.org/TR/webauthn-3/",
    },
    {
      title:
        "Enable passkeys in Microsoft Authenticator for your organization",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-enable-authenticator-passkey",
    },
    {
      title: "Authentication strengths",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths",
    },
    {
      title: "Temporary Access Pass",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-temporary-access-pass",
    },
    {
      title: "Windows Hello for Business overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/",
    },
    {
      title: "Digital Identity Guidelines",
      publisher: "National Institute of Standards and Technology",
      url: "https://pages.nist.gov/800-63-4/",
    },
    {
      title: "Implementing Phishing-Resistant MFA",
      publisher: "Cybersecurity and Infrastructure Security Agency",
      url: "https://www.cisa.gov/resources-tools/resources/implementing-phishing-resistant-mfa",
    },
  ],
};