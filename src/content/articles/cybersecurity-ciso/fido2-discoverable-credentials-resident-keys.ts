import type { Article } from "../../types";

export const article: Article = {
  slug: "fido2-discoverable-credentials-resident-keys",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Identity",
  title: "Username-less login is a storage decision, not a setting",
  seoTitle: "FIDO2 discoverable credentials and resident keys explained",
  metaDescription:
    "Discoverable credentials allow username-less sign-in by storing user data on the authenticator. Learn about slot limits, privacy and good use cases.",
  standfirst:
    "Username-less sign-in puts more data on the key. That has limits. A shared key can turn into a shared account list.",
  excerpt:
    "A discoverable credential stores account data on the authenticator. That makes username-less login possible. It also makes storage a design choice.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "FIDO2 discoverable credentials",
  secondaryKeywords: [
    "resident keys FIDO2",
    "CTAP2 discoverable credential",
    "WebAuthn user handle PII",
    "AAGUID restriction",
    "username-less authentication",
  ],
  tags: ["Security", "Identity", "FIDO2", "Passkeys", "Authentication"],
  reviewStatus: "research-based",
  relatedSlugs: ["passkeys-enterprise-deployment-reality", "oauth2-token-theft-dpop-mechanics"],
  methodology:
    "Written from the W3C Web Authentication specification, the FIDO Alliance CTAP specifications and Microsoft Entra ID FIDO2 documentation, verified August 2026. Field names, error conditions and the user handle constraint are taken from those sources. Slot capacity is described in broad terms because it varies by authenticator model and firmware.",
  body: [
    {
      type: "p",
      text: "Two sign-in flows can look almost the same. In one, the user types a name and then touches a key. In the other, the user touches the key and the system finds the account.",
    },
    {
      type: "p",
      text: "The second flow is convenient. It is also more than a sign-in choice. It changes what the authenticator stores. That matters when you plan a hardware-key rollout.",
    },
    { type: "h2", id: "two-kinds", text: "Two kinds of credential" },
    {
      type: "p",
      text: "The main difference is where the service keeps the information needed to find the credential.",
    },
    {
      type: "p",
      text: "A **non-discoverable** credential does not keep the account record on the authenticator. During registration, the authenticator creates a credential and returns a handle. The service stores that handle with the user account. At sign-in, the service gives the handle back. The authenticator uses it to find the private key and signs the request.",
    },
    {
      type: "p",
      text: "A **discoverable** credential is stored on the authenticator. The device keeps the private key and data that helps it identify the account. The user can then sign in without typing a username first.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Resident key means discoverable credential",
      text: "The current specs use the term discoverable credential. Many hardware guides still say resident key. They mean the same feature. You may see both terms in the same deployment.",
    },
    {
      type: "table",
      caption: "How the two credential types differ",
      head: ["", "Non-discoverable", "Discoverable"],
      rows: [
        ["Stored on the authenticator", "No account record", "Key plus account metadata"],
        ["Sign-in flow", "Username first, then key", "Key can find the account"],
        ["Storage use", "No discoverable slot", "Uses one discoverable slot"],
        ["Best fit", "Shared or pooled devices", "A device used by one person"],
        ["Lost-device clue", "No account list on the key", "Service list may be stored"],
      ],
    },
    { type: "h2", id: "slots", text: "Hardware keys have finite storage" },
    {
      type: "p",
      text: "This is the limit that surprises teams. A software setting can feel endless. A hardware key is not.",
    },
    {
      type: "p",
      text: "A hardware authenticator has a finite number of slots for discoverable credentials. The exact capacity depends on the model and firmware. Think in tens, not thousands. Each registered service can consume another slot.",
    },
    {
      type: "p",
      text: "When the store is full, the key can reject a new registration. That is an expected capacity limit. It is not a directory failure.",
    },
    {
      type: "p",
      text: "Phones and laptops use a different storage model. They keep passkeys in device storage protected by platform security. Their practical capacity is much higher. That is why a consumer passkey rollout can feel easier than a fleet of physical keys.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Check the exact model",
      text: "Do not plan from a generic security-key limit. Check the vendor data for the exact model and firmware you will issue. Leave room for extra services that users add later.",
    },
    { type: "h2", id: "shared", text: "Shared devices change the answer" },
    {
      type: "p",
      text: "The best test is a device that does not belong to one person.",
    },
    {
      type: "p",
      text: "Imagine a pool of keys used by staff during each shift. Username-less sign-in sounds perfect. Fewer steps can save time.",
    },
    {
      type: "p",
      text: "But every user can leave a discoverable credential on the key. Soon one token holds many accounts. The next person may see a list of names and services. That is not the fast sign-in flow you wanted.",
    },
    {
      type: "p",
      text: "The account can also be disabled in the directory while its local record remains on the key. Central revocation stops use. It does not by itself erase the stored credential.",
    },
    {
      type: "p",
      text: "For a pooled device, non-discoverable credentials often fit better. The user supplies a name. The service supplies the right credential handle. Nothing builds up on the token.",
    },
    { type: "h2", id: "user-handle", text: "The user handle belongs on your design checklist" },
    {
      type: "p",
      text: "A discoverable credential has a user handle. The authenticator stores it with the credential.",
    },
    {
      type: "p",
      text: "The WebAuthn model expects the handle to be an opaque value. It should not identify the person. An email address is a bad fit because it puts a direct identifier on the physical key.",
    },
    {
      type: "p",
      text: "Use a random identifier instead. Keep the mapping to the user in your identity system. Managed identity products handle much of this for you. A custom WebAuthn service still needs the rule in its design.",
    },
    { type: "h2", id: "aaguid", text: "AAGUID gives you an authenticator control" },
    {
      type: "p",
      text: "Each authenticator model reports an AAGUID. It identifies the make and model. It does not identify one physical key.",
    },
    {
      type: "p",
      text: "That lets an identity team restrict registration to approved models. This matters when keys hold discoverable credentials. You can require a model that meets your security and management needs.",
    },
    {
      type: "p",
      text: "It also helps with capacity planning. Once the allowed models are known, you know which storage limits apply to your users.",
    },
    { type: "h2", id: "lifecycle", text: "Two lifecycle facts matter" },
    {
      type: "p",
      text: "**Revocation does not erase the credential.** Disabling a credential in the identity system stops it from working. The credential can still occupy storage on the authenticator until the device is cleared. Credential-management features exist for this, but the physical device must be present.",
    },
    {
      type: "p",
      text: "**A lost key can reveal a service list.** A locked key should protect the private keys from use without the PIN or other user verification. Still, the authenticator may contain data that shows which services have credentials on it. That is a smaller risk than key theft, but it is still a risk.",
    },
    { type: "h2", id: "choosing", text: "Choose from the device use case" },
    {
      type: "table",
      caption: "A simple choice guide",
      head: ["Discoverable", "Non-discoverable"],
      rows: [
        ["One person owns the device", "Device is shared or pooled"],
        ["Username-less sign-in matters", "Typing a username is fine"],
        ["Users have a small service set", "Hardware storage is tight"],
        ["Platform authenticator is the main option", "You want less account data on the key"],
      ],
    },
    {
      type: "p",
      text: "Both credential types can provide phishing-resistant sign-in. The storage model does not remove that property. It changes how the service finds the credential and where the account data lives.",
    },
    { type: "h2", id: "takeaways", text: "What to do" },
    {
      type: "ul",
      items: [
        "Choose the credential type from the real device use case.",
        "Check slot capacity for the exact key model and firmware.",
        "Keep direct user identifiers out of the user handle.",
        "Use AAGUID controls when you need an approved authenticator fleet.",
        "Plan how returned and revoked keys will have old credentials cleared.",
      ],
    },
    {
      type: "p",
      text: "Discoverable credentials are useful because the key can find the account for you. That feature has a cost. It uses local storage and puts more account data on the authenticator. Treat that as an architecture choice, not a box on a policy screen.",
    },
  ],
  faq: [
    {
      question: "What is a discoverable credential?",
      answer:
        "It is a credential stored on the authenticator with data that lets the device find the account. That enables username-less sign-in.",
    },
    {
      question: "Is resident key the same thing?",
      answer:
        "Yes. Resident key is the older term. Discoverable credential is the current term.",
    },
    {
      question: "Why did the key reject a new credential?",
      answer:
        "The discoverable credential store may be full. Hardware keys have limited storage, and capacity varies by model.",
    },
    {
      question: "Can I use an email address as the user handle?",
      answer:
        "Do not. The handle is stored on the device. Use an opaque random value and keep the user mapping in your identity system.",
    },
    {
      question: "Are shared security keys a bad idea?",
      answer:
        "Not by themselves. Shared keys are better suited to non-discoverable credentials, so the token does not build a list of users.",
    },
  ],
  sources: [
    {
      title: "Web Authentication: An API for accessing Public Key Credentials, Level 2",
      publisher: "W3C",
      url: "https://www.w3.org/TR/webauthn-2/",
    },
    {
      title: "Client to Authenticator Protocol (CTAP) specifications",
      publisher: "FIDO Alliance",
      url: "https://fidoalliance.org/specifications/",
    },
    {
      title: "Enable passkeys (FIDO2) for your organisation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-enable-passkey-fido2",
    },
    {
      title: "FIDO2 security key authentication in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-fido2-hardware-vendor",
    },
    {
      title: "Passkeys (passkey authentication)",
      publisher: "FIDO Alliance",
      url: "https://fidoalliance.org/passkeys/",
    },
  ],
};
