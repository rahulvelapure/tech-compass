import type { Article } from "../../types";

export const article: Article = {
  slug: "passkeys-enterprise-deployment-reality",
  category: "cybersecurity-ciso",
  contentType: "analysis",
  subcategory: "Identity",
  title: "Passkeys stop phishing. They do not stop the helpdesk calls",
  seoTitle: "Passkeys in the enterprise: what deployment actually involves",
  metaDescription:
    "Passkeys are genuinely phishing-resistant. Device-bound and synced keys differ, recovery is the hard part, and legacy apps still need an answer.",
  standfirst:
    "The hard part of passkeys is not the crypto. It is what you do when someone loses the phone and the laptop in the same week.",
  excerpt:
    "Passkeys end credential phishing, and that is worth having. But device-bound and synced keys are not the same thing, recovery replaces password resets, and legacy apps still need a plan.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-22",
  lastReviewedAt: "2026-08-22",
  nextReviewAt: "2027-02-22",
  readingMinutes: 6,
  primaryKeyword: "passkeys enterprise deployment",
  secondaryKeywords: [
    "device-bound passkeys",
    "synced passkeys",
    "FIDO2 WebAuthn enterprise",
    "phishing-resistant MFA",
    "passkey account recovery",
  ],
  tags: ["Security", "Identity", "Passkeys", "FIDO2", "Authentication", "Zero Trust"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "conditional-access-framework",
    "conditional-access-break-glass-accounts",
    "entra-id-vs-active-directory-differences",
  ],
  methodology:
    "Written from the W3C Web Authentication specification, FIDO Alliance material on passkey types, and Microsoft Learn documentation on passwordless authentication in Entra ID, verified August 2026. The distinction between device-bound and synced passkeys is drawn from the FIDO Alliance's own terminology, because vendor marketing frequently blurs it. Recovery and rollout guidance is labelled as recommendation, not documented product behaviour.",
  body: [
    {
      type: "p",
      text: "Passkeys get sold as the end of the password problem. The pitch is clean. Passwords get phished, so replace them with a key pair. No password, nothing to steal, no phishing.",
    },
    {
      type: "p",
      text: "For a personal account that is close to true. For a fleet of ten thousand staff it is the easy part of a much longer job. The cryptography works. What breaks is recovery, legacy applications, and the fact that not all passkeys are the same thing.",
    },
    { type: "h2", id: "how", text: "What a passkey actually is" },
    {
      type: "p",
      text: "A passkey is a FIDO2 credential. Two pieces make it work: the WebAuthn API that browsers and applications call, and CTAP, the protocol between the client and the authenticator.",
    },
    {
      type: "p",
      text: "Registration is simple enough. The site sends a challenge. Your authenticator creates a key pair, keeps the private key, and hands back the public key. The site stores it against your account.",
    },
    {
      type: "p",
      text: "Sign-in reverses it. The site sends a fresh challenge and the authenticator signs it. The signature covers the site's origin as well as the challenge, and that detail is the whole security story.",
    },
    {
      type: "p",
      text: "Send a user to a lookalike domain and the authenticator simply will not sign. It is not making a judgement about whether the site looks suspicious. The origin does not match the one the key was registered against, so no valid signature exists to produce. That is why passkeys resist phishing when training and one-time codes do not.",
    },
    { type: "h2", id: "two-kinds", text: "Two kinds of passkey, and the difference matters" },
    {
      type: "p",
      text: "You will often read that the private key never leaves the device. That was true when the phrase was coined. It is now true of only one of the two kinds in circulation.",
    },
    {
      type: "table",
      caption: "The FIDO Alliance's own distinction, and what each type means operationally",
      head: ["", "Device-bound", "Synced"],
      rows: [
        ["Private key", "Stays on one authenticator", "Replicated across the user's devices"],
        [
          "Examples",
          "FIDO2 security keys, Windows Hello for Business",
          "iCloud Keychain, Google Password Manager",
        ],
        [
          "Lose the device",
          "The credential is gone",
          "Still available on another signed-in device",
        ],
        ["Recovery anchor", "Your process", "The user's personal platform account"],
        ["Attestation", "Usually strong", "Often limited, by design"],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Windows Hello for Business is device-bound",
      text: "It is easy to file Windows Hello alongside iCloud Keychain because both feel like a built-in biometric prompt. They behave differently. A Windows Hello for Business credential is bound to that machine. Replace the machine and the credential does not follow.",
    },
    {
      type: "p",
      text: "Both types are phishing-resistant, because origin binding does not depend on where the key lives. What changes is who controls recovery. With a synced passkey, that is often the user's personal Apple or Google account — outside your tenant, outside your policy, and outside your leaver process.",
    },
    { type: "h2", id: "recovery", text: "The recovery problem" },
    {
      type: "p",
      text: "Here is the scenario that catches organisations out, and it is not exotic.",
    },
    {
      type: "p",
      text: "A CISO mandates passkeys. Staff register using the biometric prompt on their laptops and phones. It goes well for six months. Then somebody loses both devices in the same week and holds no hardware key.",
    },
    {
      type: "p",
      text: "In a password world this is a helpdesk call. Verify the person, reset the credential, move on. In a passkey world there is nothing to reset. The credential was the private key, and it is gone.",
    },
    {
      type: "p",
      text: "If the passkeys were synced to a personal account, they may technically still exist — on a personal account the user cannot reach from a fresh corporate device, and one your administrators have no rights over.",
    },
    {
      type: "p",
      text: "The fix is unglamorous. Require more than one credential per user before you switch anything off. A laptop, a phone, and a hardware key held somewhere sensible is the usual shape. That is a process design problem more than a technical one, and it needs solving before rollout rather than after the first lockout.",
    },
    {
      type: "p",
      text: "The same reasoning applies to administrative access. Passwordless does not remove the need for [break-glass accounts](/microsoft-365-entra-id/conditional-access-break-glass-accounts); it makes them more important, because there are now more ways to be locked out.",
    },
    { type: "h2", id: "mistakes", text: "Four mistakes worth avoiding" },
    { type: "h3", id: "service-accounts", text: "Pointing passkeys at service accounts" },
    {
      type: "p",
      text: "A passkey needs a human present to approve it. That is the point. Scripts, service accounts and background jobs have no one to touch the key, so they cannot use one. Those flows need managed identities, client credentials or certificates. Trying to force a passkey here does not fail subtly; it just fails.",
    },
    { type: "h3", id: "terminology", text: "Calling every FIDO2 rollout a passkey rollout" },
    {
      type: "p",
      text: "A FIDO2 security key used as a second factor after a password is phishing-resistant MFA. That is a real and worthwhile control. It is not passwordless, because the password is still there and still attackable.",
    },
    {
      type: "p",
      text: "The distinction matters when someone asks whether you removed passwords. If the answer is no, say so, and be clear about what you did achieve.",
    },
    { type: "h3", id: "legacy", text: "Assuming applications support WebAuthn" },
    {
      type: "p",
      text: "Modern SaaS generally does. Internal portals, older third-party tools and anything speaking legacy protocols generally do not.",
    },
    {
      type: "p",
      text: "There are two honest options. Keep a password path for those apps, and accept that you are not passwordless yet. Or put them behind a reverse proxy that handles WebAuthn and passes an assertion through. Both are real work. Neither is a checkbox.",
    },
    { type: "h3", id: "one-model", text: "Backing only one authenticator type" },
    {
      type: "p",
      text: "Hardware keys only, and the helpdesk drowns in replacements. Platform authenticators only, and device loss becomes a lockout. Most workable deployments use platform authenticators for daily sign-in and a hardware key as the backup that survives losing everything else.",
    },
    { type: "h2", id: "security", text: "What passkeys do not cover" },
    {
      type: "p",
      text: "Two gaps are worth stating plainly, because the marketing tends to skip them.",
    },
    {
      type: "p",
      text: "The first is the session. Passkeys protect authentication, not what follows it. Once a user signs in they hold a token, and a stolen token is as good as the sign-in it came from. Malware that lifts a session cookie does not care how strong your authentication was. Short session lifetimes and continuous access evaluation are what limit this, not the passkey.",
    },
    {
      type: "p",
      text: "The second is the device. A platform passkey is only as trustworthy as the machine holding it. An attacker with administrative control of the endpoint is inside the boundary the passkey assumes. That is why device compliance belongs in the same policy, and why passkeys sit inside [a Conditional Access framework](/microsoft-365-entra-id/conditional-access-framework) rather than replacing one.",
    },
    {
      type: "p",
      text: "Attestation is the third consideration, and it is a genuine trade-off. Attestation lets you verify what kind of authenticator was used — a specific hardware model, say. Consumer platform authenticators often provide little or none, deliberately, to avoid becoming a tracking mechanism. Requiring strong attestation is defensible, but it narrows your users to hardware keys. Decide that on purpose.",
    },
    { type: "h2", id: "when", text: "When passkeys fit, and when they do not" },
    {
      type: "table",
      caption: "A readiness check rather than a maturity model",
      head: ["Passkeys fit when", "Hold off when"],
      rows: [
        ["Users are on managed, modern devices", "The estate is largely unmanaged or BYOD"],
        ["Device management can handle loss and wipe", "There is no reliable recovery path yet"],
        [
          "The application portfolio is mostly modern SaaS",
          "Core systems cannot do WebAuthn or sit behind a proxy",
        ],
        ["Helpdesk workflows have been redesigned", "Recovery still assumes a password reset"],
      ],
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Decide which passkey types you accept, and write it down. Device-bound and synced are different controls with different recovery owners.",
        "Design recovery before rollout. Two credentials minimum per user, and a hardware key that survives losing the rest.",
        "Audit the application portfolio early. Split it into native WebAuthn, proxyable, and needs a password for now.",
        "Pair passkeys with device compliance and short sessions. The passkey secures the front door, not the room.",
        "Pilot with IT first, and deliberately test the lockout path. Registration always works in a pilot. Recovery is what you are actually testing.",
      ],
    },
    {
      type: "p",
      text: "Passkeys are a real improvement and the direction of travel is not in doubt. They remove an entire category of attack that training has never managed to fix. They also move the hard problem rather than removing it: from choosing and protecting a secret, to proving who someone is when every credential they had is gone. That problem lands on the helpdesk, and it is worth solving before the rollout rather than during it.",
    },
  ],
  faq: [
    {
      question: "Are passkeys really phishing-proof?",
      answer:
        "They stop credential phishing, which is the big win. The signature is tied to the site's origin, so a fake domain cannot get a valid one. They do not stop malware stealing a session token after you sign in.",
    },
    {
      question: "Does the private key ever leave the device?",
      answer:
        "It depends on the type. A device-bound passkey stays put. A synced passkey is copied to your other devices. Apple and Google both do this. Both types still block phishing.",
    },
    {
      question: "Is Windows Hello for Business a synced passkey?",
      answer:
        "No, it is device-bound. It feels like the biometric prompt on a phone, so people assume it syncs. It does not. Replace the machine and the credential is gone.",
    },
    {
      question: "What happens when a user loses every device?",
      answer:
        "Without a spare credential, they are locked out and there is nothing to reset. That is why a hardware key kept somewhere safe is worth the cost. Plan this before you turn passwords off.",
    },
    {
      question: "Can service accounts use passkeys?",
      answer:
        "No. A passkey needs a person to approve it. A script has nobody to tap the key. Use a managed identity, a client secret or a certificate for those jobs.",
    },
  ],
  sources: [
    {
      title: "Web Authentication: An API for accessing Public Key Credentials, Level 2",
      publisher: "W3C",
      url: "https://www.w3.org/TR/webauthn-2/",
    },
    {
      title: "Passkeys (passkey authentication)",
      publisher: "FIDO Alliance",
      url: "https://fidoalliance.org/passkeys/",
    },
    {
      title: "Passwordless authentication options for Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless",
    },
    {
      title: "Enable passkeys in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-enable-passkey-fido2",
    },
    {
      title: "Continuous access evaluation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation",
    },
  ],
};
