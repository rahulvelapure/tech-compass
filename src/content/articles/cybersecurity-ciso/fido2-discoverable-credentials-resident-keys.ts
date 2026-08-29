import type { Article } from "../../types";

export const article: Article = {
  slug: "fido2-discoverable-credentials-resident-keys",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Identity",
  title: "Username-less login is a storage decision, not a setting",
  seoTitle: "FIDO2 discoverable credentials and resident keys explained",
  metaDescription:
    "Discoverable credentials enable username-less sign-in by writing user data onto the authenticator. The slot limits, the PII trap, and when not to use them.",
  standfirst:
    "Turn on username-less sign-in and the key starts storing who your users are. That has limits. A shared key makes them plain.",
  excerpt:
    "A discoverable credential stores who you are on the authenticator itself. That is what makes username-less login possible, and what makes hardware keys run out of room.",
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
    "Written from the W3C Web Authentication specification, the FIDO Alliance CTAP specifications and Microsoft Entra ID FIDO2 documentation, verified August 2026. Field names, error conditions and the user handle constraint are quoted from those specifications. Slot capacities are described qualitatively rather than as numbers, because they vary by authenticator model and firmware and should be read from the vendor's own documentation.",
  body: [
    {
      type: "p",
      text: "Two sign-in flows look almost the same to a user. In one, they type a username, then touch a key. In the other, they just touch the key and the system already knows them.",
    },
    {
      type: "p",
      text: "The second is nicer, and it is what people mean by passwordless done well. It is also not a preference setting. It changes what gets written onto the authenticator, and that has consequences a policy screen does not mention.",
    },
    { type: "h2", id: "two-kinds", text: "Two kinds of credential" },
    {
      type: "p",
      text: "The difference is where the knowledge of who you are lives.",
    },
    {
      type: "p",
      text: "A **non-discoverable** credential keeps almost nothing on the authenticator. At registration the authenticator wraps the private key into a credential handle and gives it to the service, which stores it against your account. At sign-in the service hands that handle back, the authenticator unwraps it, signs, and returns the signature. The authenticator remembers nothing between visits.",
    },
    {
      type: "p",
      text: "A **discoverable** credential is kept on the key itself: the private key, the service it belongs to, and enough to show which account it is. Now the key can answer without being told who you are. That is what makes username-less sign-in work.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Resident key and discoverable credential are the same thing",
      text: "The specs now say discoverable credential. Hardware docs, admin tools and error messages often still say resident key. If a vendor sheet and a policy screen seem to differ, they are describing one feature under two names.",
    },
    {
      type: "table",
      caption: "What each type stores, and what follows from it",
      head: ["", "Non-discoverable", "Discoverable"],
      rows: [
        ["Stored on the authenticator", "Effectively nothing", "Key, service, and user metadata"],
        ["Sign-in flow", "Username first, then the key", "Key alone"],
        ["Storage consumed", "None", "One slot per credential"],
        ["Suits", "Shared or pooled devices", "A device belonging to one person"],
        ["If lost", "Reveals nothing about accounts", "Lists the services registered on it"],
      ],
    },
    { type: "h2", id: "slots", text: "Hardware keys run out of room" },
    {
      type: "p",
      text: "This is the constraint that surprises people, because software features do not usually have a physical ceiling.",
    },
    {
      type: "p",
      text: "A hardware security key has a fixed number of slots for discoverable credentials. It is a small number — dozens rather than thousands — and it varies by model and firmware. Every service registered this way consumes one.",
    },
    {
      type: "p",
      text: "Register enough services on one key and it fills. The failure is explicit rather than silent: the authenticator refuses to create another credential and reports that its store is full. Helpful, but only if whoever fields the ticket knows what it means.",
    },
    {
      type: "p",
      text: "Phones and laptops behave differently. They keep these in device storage, locked by hardware-backed keys. The limit is far higher. That is why consumer passkeys feel endless while a hardware rollout needs planning.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Check the model before you buy the fleet",
      text: "Slot capacity differs between authenticator models and between firmware versions of the same model. Read the vendor's figure for the exact part number you are procuring, and assume users will register more services than you planned for.",
    },
    { type: "h2", id: "shared", text: "The shared device problem" },
    {
      type: "p",
      text: "The clearest way to see why this is an architectural choice is a setting where the device does not belong to one person.",
    },
    {
      type: "p",
      text: "Picture a ward with a pool of security keys that staff pick up at the start of a shift. Someone enables username-less sign-in because it is faster, and faster matters here.",
    },
    {
      type: "p",
      text: "Now every key accumulates the accounts of everyone who used it. A nurse plugs one in and is asked to choose from a list of colleagues. It is slower than typing a username, not faster. And when someone leaves the organisation, their name stays on the physical token until an administrator clears that slot — the account can be disabled centrally, but the entry on the device is a separate thing.",
    },
    {
      type: "p",
      text: "The fix is not better configuration. Discoverable credentials assume one person with several services. A pooled device is several people with one service, which is the opposite shape. Non-discoverable credentials fit it: the user types a name, the service supplies the handle, and nothing accumulates on the token.",
    },
    { type: "h2", id: "user-handle", text: "The user handle is written to the hardware" },
    {
      type: "p",
      text: "This is the implementation detail most likely to cause a problem you cannot undo remotely.",
    },
    {
      type: "p",
      text: "When a discoverable credential is made, the service supplies a user handle. This is an opaque id that the key stores next to the private key. The spec is blunt about it: the value must not carry anything that identifies a person.",
    },
    {
      type: "p",
      text: "It is tempting to use an email address, because it is already unique and already available. Do that and the address is written into the secure storage of a physical object that people carry, lose and leave behind. Disabling the account later does not remove it.",
    },
    {
      type: "p",
      text: "Generate a random identifier instead and map it to the user in your own directory. If you are configuring a commercial identity provider this is handled for you; if anyone is writing a WebAuthn integration directly, it is worth checking rather than assuming.",
    },
    { type: "h2", id: "aaguid", text: "Controlling which authenticators are allowed" },
    {
      type: "p",
      text: "Every model of key reports an AAGUID, an id for its make and model. It does not name the single device, only the type.",
    },
    {
      type: "p",
      text: "That gives identity teams a useful control. You can restrict registration to models you have assessed, which matters more once credentials are being stored on the device. A certified key with tamper-resistant storage and an uncertified one bought online both present a working FIDO2 interface; the AAGUID is what lets you tell them apart at registration.",
    },
    {
      type: "p",
      text: "It also pairs with capacity planning. If you allow a fixed set of models, you know what slot capacity your users actually have.",
    },
    { type: "h2", id: "lifecycle", text: "Two operational realities" },
    {
      type: "p",
      text: "**A revoked credential still exists on the device.** Disabling it in the directory stops it working, which is the part that matters for security. The credential itself remains in the authenticator's storage, occupying a slot, until someone clears it. Later CTAP versions support credential management for exactly this, but it needs the physical device present and unlocked.",
    },
    {
      type: "p",
      text: "**A lost key is a list.** Without the PIN or biometric nobody can use the credentials, and the private keys are not extractable. What a finder may see is which services the owner has accounts with. That is a smaller risk than credential theft and a real one for some threat models.",
    },
    { type: "h2", id: "choosing", text: "Choosing between them" },
    {
      type: "table",
      caption: "Match the credential type to how the device is actually used",
      head: ["Discoverable when", "Non-discoverable when"],
      rows: [
        ["The device belongs to one person", "Devices are pooled, shared or hot-desked"],
        ["You are using platform authenticators", "Hardware keys have tight slot limits"],
        ["Username-less sign-in is the point", "Typing a username is an acceptable cost"],
        ["Users register a handful of services", "You want nothing user-identifying on the device"],
      ],
    },
    {
      type: "p",
      text: "Both are phishing-resistant. That property comes from origin binding, not from where the credential is stored, so choosing non-discoverable does not weaken the security guarantee — it only changes the sign-in flow.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Decide by who owns the device. One owner, discoverable. Shared, not.",
        "Check slot capacity for the exact model and firmware before committing to a fleet.",
        "Never put an email address or username in the user handle. Use a random identifier.",
        "Restrict registration by AAGUID so you know what storage your users actually have.",
        "Plan for clearing credentials from returned devices. Revoking centrally does not free the slot.",
      ],
    },
    {
      type: "p",
      text: "The wider rollout questions — which authenticator types to support, how recovery works when everything is lost, and what passkeys do not cover — are a separate matter, dealt with in [passkeys in the enterprise](/cybersecurity-ciso/passkeys-enterprise-deployment-reality). This one decision sits underneath all of that, and it is easy to make by accident by turning on a setting that sounds like an improvement.",
    },
  ],
  faq: [
    {
      question: "What is a discoverable credential?",
      answer:
        "One that lives on the authenticator, along with enough detail to show which account it is. That is what lets you sign in without typing a username first.",
    },
    {
      question: "Is a resident key the same thing?",
      answer:
        "Yes, the same thing. Resident key is the older name. The specs now say discoverable credential. Both turn up in hardware docs and error messages.",
    },
    {
      question: "Why did my security key refuse a new credential?",
      answer:
        "It has probably run out of slots. Hardware keys hold only a few dozen of these. The key says so plainly, but the message is easy to misread.",
    },
    {
      question: "Can I put an email address in the user handle?",
      answer:
        "You should not. It gets written onto the device and stays there. Use a random value and match it to the person in your own directory.",
    },
    {
      question: "Are shared security keys a bad idea?",
      answer:
        "They are fine. Use the non-discoverable kind with them. Otherwise every key builds up a list of everyone who has used it.",
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
