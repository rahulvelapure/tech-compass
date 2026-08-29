import type { Article } from "../../types";

export const article: Article = {
  slug: "entra-id-authentication-context-step-up-mfa",
  category: "microsoft-365-entra-id",
  contentType: "explainer",
  subcategory: "Conditional Access",
  title: "Conditional Access decides at sign-in. Authentication context decides at the action",
  seoTitle: "Entra ID authentication context: step-up MFA explained",
  metaDescription:
    "A policy satisfied at sign-in says nothing about the transaction two hours later. How authentication context adds a check at the action, and what it costs to build.",
  standfirst:
    "A policy passed at nine in the morning is still passing at four. That is fine for reading email and not fine for moving money.",
  excerpt:
    "Conditional Access evaluates when a session starts. Authentication context lets an application demand a fresh check at the moment of a high-value action — and it is application work, not a portal setting.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "Entra ID authentication context",
  secondaryKeywords: [
    "step-up authentication Entra",
    "Conditional Access authentication context",
    "acrs claim",
    "claims challenge",
    "high-value transaction MFA",
  ],
  tags: ["Entra ID", "Security", "Identity", "Conditional Access", "Zero Trust"],
  reviewStatus: "research-based",
  relatedSlugs: ["conditional-access-framework", "oauth2-token-theft-dpop-mechanics"],
  methodology:
    "Written from Microsoft Learn documentation on Conditional Access target resources, the developer guide to authentication context, and claims challenges, verified August 2026. Claim names, limits and caveats are quoted from those pages, several of which correct widely repeated community guidance. Licensing requirements are stated because the feature is not available in every edition.",
  body: [
    {
      type: "p",
      text: "Conditional Access asks its questions when a session starts. Is this user known? Is the device healthy? Does the sign-in look risky?",
    },
    {
      type: "p",
      text: "Those answers then hold for as long as the session does. That is the design, and it is fine for most things a person does.",
    },
    {
      type: "p",
      text: "It is not fine for the small number of actions where the stakes jump. A session that was fine for reading a dashboard is the same session used to approve a payment, and nothing re-checks anything in between.",
    },
    { type: "h2", id: "gap", text: "The gap this closes" },
    {
      type: "p",
      text: "Two situations make the problem concrete, and neither requires anything exotic.",
    },
    {
      type: "p",
      text: "Someone walks away from an unlocked machine. The session is valid, the device is compliant, and whoever sits down next inherits all of it.",
    },
    {
      type: "p",
      text: "Or a session token is stolen. The attacker never authenticates, because they do not need to — they hold the outcome of an authentication that already happened.",
    },
    {
      type: "p",
      text: "In both cases the sign-in policy did its job correctly. It was simply asked at the wrong moment relative to the action that mattered.",
    },
    { type: "h2", id: "how", text: "How authentication context works" },
    {
      type: "p",
      text: "Authentication context lets you attach a policy to an action rather than to an application. The application then asks for it when that action is attempted.",
    },
    {
      type: "ol",
      items: [
        "You define a context in Entra ID and attach a Conditional Access policy to it — require a fresh sign-in, a compliant device, a phishing-resistant method.",
        "The application decides which of its operations need that context.",
        "A user attempts one of those operations with an ordinary token.",
        "The API sees the required context is missing and returns a **claims challenge** rather than simply refusing.",
        "The client sends the user back to Entra ID, asking for that context specifically.",
        "Entra evaluates the attached policy, prompts if needed, and issues a token carrying the context.",
        "The API checks it and lets the operation proceed.",
      ],
    },
    {
      type: "p",
      text: "The result is that a stolen session gets you as far as the ordinary parts of the application and no further. At the sensitive action, the attacker is asked for something they do not have.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The claim is acrs, not acr",
      text: "Entra's authentication context uses an `acrs` claim, and a great deal of community guidance says `acr` — the standard OIDC claim, which is a different thing. Validating the wrong one means either rejecting good tokens or, worse, accepting tokens that never satisfied your policy.",
    },
    { type: "h2", id: "opportunistic", text: "It does not always redirect" },
    {
      type: "p",
      text: "Most descriptions of this feature imply every sensitive action triggers a round trip to Entra ID. That is not quite how it behaves, and the difference matters for user experience.",
    },
    {
      type: "p",
      text: "Conditional Access can add the context to a token opportunistically. If the policies protecting that context are already satisfied by how the user signed in, the claim can be issued without a fresh prompt.",
    },
    {
      type: "p",
      text: "So a user who already authenticated with a strong method may reach the sensitive action and pass, with no interruption at all. The check still happened; it simply had nothing left to ask for.",
    },
    {
      type: "p",
      text: "There is a catch. A resource provider has to opt in to receiving the claim this way, and each token type is opted in separately. Without that, the only route is an explicit request, and every check becomes a round trip.",
    },
    { type: "h2", id: "building", text: "This is application work" },
    {
      type: "p",
      text: "The reason this feature is rare in the wild is not that people have not heard of it. It is that most of the work lands in the application rather than in the portal.",
    },
    {
      type: "ul",
      items: [
        "**The API must validate the claim.** Standard libraries check signature, issuer and audience. None of them check whether a specific context is present. That is code you write, per operation.",
        "**The API must issue a claims challenge.** A plain rejection tells the client nothing useful. The challenge has a defined format that says which context is required.",
        "**The client must handle it.** Catch the challenge, redirect for the specific context, come back, and resume what the user was doing without losing their work.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "The mistake that produces a redirect loop",
      text: "If the API demands a context but the client does not request that context on the redirect, Entra returns a token without it. The API rejects again, the client redirects again, and the browser spins. Both halves have to name the same context.",
    },
    { type: "h2", id: "gotchas", text: "Three things the documentation is explicit about" },
    {
      type: "p",
      text: "**Do not hard-code the context values.** They differ between tenants. An application should read the available contexts from Microsoft Graph and work from that mapping. Hard-coding works in one tenant and breaks the moment the application is used in another.",
    },
    {
      type: "p",
      text: "**There is room for far more contexts than you need.** A tenant can define up to ninety-nine. That is not an invitation. Every context is a redirect the user may experience, and Microsoft's own advice is to keep the set small and name them for what they mean rather than for individual applications.",
    },
    {
      type: "p",
      text: "**Do not use it where the whole application is already the target of a policy.** The feature is for raising the bar inside an application whose baseline is lower. If everything in the application needs the same strong check, apply that check to the application and skip the complexity.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Licensing and scope",
      text: "Conditional Access requires an Entra ID P1 licence, and authentication context values are not available in the free edition. The feature also applies to applications that sign users in — an application authenticating as itself cannot use it.",
    },
    { type: "h2", id: "using-it", text: "Where to point it" },
    {
      type: "p",
      text: "The temptation is to protect everything. That produces prompt fatigue, and users respond to prompt fatigue by approving things without reading them, which is worse than where you started.",
    },
    {
      type: "p",
      text: "A short list works better. Pick the operations where a mistaken or malicious action is expensive and hard to reverse.",
    },
    {
      type: "table",
      caption: "The kind of operation that justifies an interruption",
      head: ["Worth a step-up", "Leave alone"],
      rows: [
        ["Moving money, or changing where money goes", "Reading a report"],
        ["Changing another user's access or credentials", "Ordinary day-to-day work"],
        ["Destroying or exporting data at scale", "Anything easily undone"],
        ["Activating a privileged role", "Actions already behind a strong app-level policy"],
      ],
    },
    {
      type: "p",
      text: "That last row is worth noting. Role activation through Privileged Identity Management can be gated this way. It puts the strongest check on the moment someone takes administrative power, rather than on when they signed in.",
    },
    { type: "h2", id: "boundaries", text: "How this relates to the other answers" },
    {
      type: "p",
      text: "Three different controls address the same underlying problem — a valid session in the wrong hands — and they are not alternatives.",
    },
    {
      type: "p",
      text: "[A Conditional Access framework](/microsoft-365-entra-id/conditional-access-framework) decides what is required to establish a session at all. Authentication context adds a second decision point at specific actions. And [binding a token to the client that holds it](/cybersecurity-ciso/oauth2-token-theft-dpop-mechanics) attacks the theft itself rather than the use.",
    },
    {
      type: "p",
      text: "Step-up is the one that assumes the attacker may already hold a valid session, and asks for something they cannot produce.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Validate the `acrs` claim, and check you are not validating `acr` by mistake.",
        "Read context values from Graph rather than hard-coding them.",
        "Keep the set of contexts small and named for meaning, not per application.",
        "Enforce on the server. A client-side check protects nobody who is attacking you.",
        "Pick a handful of expensive, irreversible actions. Protecting everything trains users to click through.",
      ],
    },
    {
      type: "p",
      text: "The idea underneath is simple enough: a decision made once at the start of a session is a weak claim about what is happening later in it. Authentication context is the mechanism for asking again at the point where the answer actually matters. It costs real application work, which is why it stays rare — and why the handful of operations you point it at should be chosen carefully.",
    },
  ],
  faq: [
    {
      question: "What problem does authentication context solve?",
      answer:
        "Sign-in checks happen once, at the start. This lets an app ask again at a risky action. A stolen session then stops being enough.",
    },
    {
      question: "Is the claim called acr or acrs?",
      answer:
        "For Entra authentication context it is `acrs`. Plenty of guides say `acr`, which is a different claim. Checking the wrong one leaves a hole.",
    },
    {
      question: "Does every protected action prompt the user again?",
      answer:
        "Not always. If the sign-in already met the policy, the claim can be added without a prompt. Your API has to opt in to receive it that way.",
    },
    {
      question: "Can I turn this on in the portal?",
      answer:
        "Only half of it. You define the context and its policy there. The app still has to check the claim and handle the challenge in code.",
    },
    {
      question: "How many contexts should I create?",
      answer:
        "Far fewer than you are allowed. Each one is a possible extra prompt. Name them for what they mean, and share them across apps.",
    },
  ],
  sources: [
    {
      title: "Conditional Access: Target resources — authentication context",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps",
    },
    {
      title: "Developer guide to Conditional Access authentication context",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity-platform/developer-guide-conditional-access-authentication-context",
    },
    {
      title: "Claims challenges, claims requests and client capabilities",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/entra/identity-platform/claims-challenge",
    },
    {
      title: "List authenticationContextClassReferences",
      publisher: "Microsoft Graph",
      url: "https://learn.microsoft.com/en-us/graph/api/conditionalaccessroot-list-authenticationcontextclassreferences",
    },
    {
      title: "OpenID Connect Core 1.0",
      publisher: "OpenID Foundation",
      url: "https://openid.net/specs/openid-connect-core-1_0.html",
    },
  ],
};
