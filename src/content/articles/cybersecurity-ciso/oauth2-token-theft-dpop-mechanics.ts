import type { Article } from "../../types";

export const article: Article = {
  slug: "oauth2-token-theft-dpop-mechanics",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Identity",
  title: "A bearer token is cash. DPoP makes it a cheque with your name on it",
  seoTitle: "OAuth 2.0 token theft and how DPoP changes it",
  metaDescription:
    "Bearer tokens work for whoever holds them. How DPoP binds a token to a key the client holds, what that stops, and the one attack it does not.",
  standfirst:
    "Steal a bearer token and you are the user. No password, no MFA prompt, nothing to break. That is the design, not a bug.",
  excerpt:
    "OAuth bearer tokens authenticate the token, not the holder. DPoP binds the token to a key the client must prove it has — and it is worth knowing exactly which attack that closes.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  draft: false,
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "OAuth 2.0 token theft DPoP",
  secondaryKeywords: [
    "RFC 9449 DPoP",
    "proof of possession token",
    "bearer token theft XSS",
    "DPoP proof JWT",
    "sender-constrained tokens",
  ],
  tags: ["Security", "Identity", "OAuth", "API Security", "Authentication"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "saml-federation-security-risks-trust-boundaries",
    "passkeys-enterprise-deployment-reality",
  ],
  methodology:
    "Written from IETF RFC 9449 (DPoP), RFC 6750 (Bearer Token Usage) and RFC 6749, verified August 2026. Claim names, header names and validation steps are quoted from RFC 9449. The limits of DPoP against same-origin script injection are stated explicitly, because vendor material frequently implies more protection than the specification claims. No product availability dates are given, as provider support changes.",
  body: [
    {
      type: "p",
      text: "The word bearer is doing real work in OAuth 2.0, and it is worth reading literally. RFC 6750 defines a bearer token as one that any party holding it can use, in any way any other holder could.",
    },
    {
      type: "p",
      text: "That is cash. Whoever picks it up can spend it. An attacker with your token does not need your password, and will never see an MFA prompt, because the token already represents the outcome of all that.",
    },
    {
      type: "p",
      text: "The API cannot tell the difference either. It checks the signature, checks the expiry, and serves the request. Nothing in the protocol asks who is holding the token.",
    },
    { type: "h2", id: "theft", text: "How tokens actually get taken" },
    {
      type: "p",
      text: "Three routes account for most of it, and none require breaking any cryptography.",
    },
    {
      type: "ul",
      items: [
        "**Script injection.** A cross-site scripting flaw lets attacker code run in your page. If the token sits in local or session storage, that code can read it and send it away.",
        "**A compromised device.** Malware on the endpoint reads the token from storage or memory. The token was handled correctly and stolen anyway.",
        "**Interception in transit.** TLS covers the ordinary case. Termination proxies, misconfiguration and certificate problems still create places the token is visible.",
      ],
    },
    {
      type: "p",
      text: "After that it is one HTTP header. The attacker sends `Authorization: Bearer` with your token from their own machine, and the API has no basis to refuse.",
    },
    { type: "h2", id: "dpop", text: "What DPoP changes" },
    {
      type: "p",
      text: "DPoP — Demonstrating Proof of Possession, RFC 9449 — ties the token to a key pair the client generates. The private key stays with the client. Using the token now requires proving you hold that key.",
    },
    {
      type: "p",
      text: "The mechanism is a short-lived JWT called a proof, sent alongside every request in a `DPoP` header and signed with the client's private key. It carries a small set of claims.",
    },
    {
      type: "table",
      caption: "The claims in a DPoP proof, from RFC 9449, and what each one prevents",
      head: ["Claim", "Contents", "What it stops"],
      rows: [
        ["jti", "A unique id for this proof", "Replaying the identical proof"],
        ["htm", "The HTTP method of the request", "Reusing a proof on a different verb"],
        ["htu", "The target URI", "Reusing a proof against another endpoint"],
        ["iat", "When it was issued", "Accepting an old proof indefinitely"],
        ["jwk", "The client's public key", "Lets the server check the signature"],
      ],
    },
    {
      type: "p",
      text: "When the authorisation server issues the token, it records the key's thumbprint against it — in a JWT access token this appears as a `cnf` confirmation claim. The token now names the key it belongs to.",
    },
    {
      type: "p",
      text: "Calling the API changes accordingly. The scheme becomes `Authorization: DPoP` rather than `Bearer`, and a fresh proof accompanies each request, bound to that method and that URI. The resource server checks the proof signature against the thumbprint in the token. Matching means the caller holds the key.",
    },
    {
      type: "p",
      text: "So a stolen token alone is no longer enough. Presented from an attacker's machine without the matching private key, it fails.",
    },
    { type: "h2", id: "limits", text: "The attack DPoP does not stop" },
    {
      type: "p",
      text: "This is the part usually skipped, and skipping it leads to bad decisions.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "DPoP is not an answer to XSS",
      text: "Generate the key as non-extractable and injected script cannot read it or send it anywhere. It can still ask the browser to sign with it, because it is running in your origin with access to the same key handle. The attacker cannot move the token to their machine. They can still make authenticated requests from the victim's browser.",
    },
    {
      type: "p",
      text: "That is a real reduction in impact and not the same as prevention. It converts a portable credential into a local one. The attacker loses persistence and convenience; they do not lose access while the page is open.",
    },
    {
      type: "p",
      text: "The practical reading: DPoP raises the cost of token theft substantially, and it does not replace fixing the injection. Treat it as a limit on blast radius rather than a fix for the vulnerability that produced it.",
    },
    { type: "h2", id: "operational", text: "What adoption actually costs" },
    {
      type: "p",
      text: "The cryptography is settled. The friction is everywhere else.",
    },
    {
      type: "table",
      caption: "The four things that usually complicate a rollout",
      head: ["Area", "What to check"],
      rows: [
        [
          "Client capability",
          "The client must generate keys and sign proofs. It is code, not configuration — no drop-in swap for Bearer.",
        ],
        [
          "Edge infrastructure",
          "Firewalls and proxies must pass the DPoP header and its payload size rather than stripping unknown headers.",
        ],
        [
          "Replay protection",
          "The server needs a short-lived cache of seen jti values, which adds state to an otherwise stateless API.",
        ],
        [
          "Provider support",
          "Both the authorisation server and the resource server must support it, and it is rarely on by default.",
        ],
      ],
    },
    {
      type: "p",
      text: "That third row is the one architects underestimate. Replay protection means the API is no longer stateless, even if only for a few minutes at a time. On a single service that is a cache. Across a fleet behind a load balancer it is shared state, and it needs the same care as any other shared state.",
    },
    { type: "h2", id: "scenario", text: "The same flaw, before and after" },
    {
      type: "p",
      text: "A trading application holds a bearer token in session storage. A third-party charting library carries a script injection flaw.",
    },
    {
      type: "p",
      text: "Injected script reads the token and sends it out. The attacker calls the trade endpoint from their own machine and it works. The MFA the user completed at sign-in is irrelevant, because the token is the credential and it already exists.",
    },
    {
      type: "p",
      text: "Now the same application with DPoP and a non-extractable key. The script still steals the token, and the token is useless on the attacker's machine — no key, no valid proof, request refused.",
    },
    {
      type: "p",
      text: "But the script is still running in the page, and it can still sign proofs there. It can place trades from the victim's browser while the session lasts. The theft failed. The abuse did not.",
    },
    {
      type: "p",
      text: "The honest summary is that DPoP turned a durable, portable compromise into a transient, local one. That is worth having, and it is not the whole job.",
    },
    { type: "h2", id: "when", text: "When it is worth mandating" },
    {
      type: "table",
      caption: "A prompt for the decision, not a compliance rule",
      head: ["Worth mandating when", "Bearer with mitigations is reasonable when"],
      rows: [
        ["The API changes state or moves money", "The API is read-only and low-value"],
        [
          "Clients are modern apps that can hold keys",
          "Clients include constrained or legacy devices",
        ],
        [
          "Token theft would be severe and hard to detect",
          "Short lifetimes and tight scopes already bound the damage",
        ],
        [
          "Your provider supports it on both ends",
          "Provider support is absent and cannot move yet",
        ],
      ],
    },
    {
      type: "p",
      text: "Where DPoP is not available, the fallback is not nothing: short lifetimes, narrow scopes, strict origin policy, and getting the injection flaws out. Those are worth doing regardless, because they are what limits the damage in the case DPoP does not cover.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Treat bearer tokens as cash. Assume theft and design so a stolen one expires quickly and reaches little.",
        "Use DPoP where an API changes state and the client can hold a key properly.",
        "Generate keys as non-extractable. An extractable key gives away the one thing binding provides.",
        "Check the edge before rolling out. A proxy silently stripping the header produces a confusing outage.",
        "Plan replay protection as shared state, not as an afterthought in one service.",
      ],
    },
    {
      type: "p",
      text: "The broader point outlives the protocol. Bearer credentials authenticate the token rather than the holder, which is why the same pattern recurs — a signed assertion in [SAML federation](/cybersecurity-ciso/saml-federation-security-risks-trust-boundaries), a session cookie after [a passkey sign-in](/cybersecurity-ciso/passkeys-enterprise-deployment-reality). Binding the credential to something the legitimate holder has is the move that changes it, and DPoP is that move for OAuth.",
    },
  ],
  faq: [
    {
      question: "What is a bearer token?",
      answer:
        "A token that works for whoever holds it. The API checks the token, not the sender. That is why a stolen one is as good as the real thing.",
    },
    {
      question: "How does DPoP stop a stolen token being used?",
      answer:
        "The token is tied to a key the client holds. Each request carries a small signed proof. Without the private key, an attacker cannot make one, so the token fails.",
    },
    {
      question: "Does DPoP protect against XSS?",
      answer:
        "Only partly, and this matters. The attacker cannot take the token elsewhere. Their script still runs in your page and can sign requests there. Fix the injection as well.",
    },
    {
      question: "Does DPoP make my API stateful?",
      answer:
        "A little. The server has to remember proof ids for a few minutes to block replays. On several servers that becomes shared state you need to plan for.",
    },
    {
      question: "What if my identity provider does not support DPoP?",
      answer:
        "Then keep token lifetimes short, scopes narrow, and origin rules strict. Those help in the case DPoP does not cover anyway, so the work is not wasted.",
    },
  ],
  sources: [
    {
      title: "RFC 9449: OAuth 2.0 Demonstrating Proof of Possession (DPoP)",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc9449",
    },
    {
      title: "RFC 6750: The OAuth 2.0 Authorization Framework — Bearer Token Usage",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc6750",
    },
    {
      title: "RFC 6749: The OAuth 2.0 Authorization Framework",
      publisher: "IETF",
      url: "https://www.rfc-editor.org/rfc/rfc6749",
    },
    {
      title: "OAuth 2.0 Security Best Current Practice",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics",
    },
    {
      title: "SubtleCrypto: non-extractable keys",
      publisher: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey",
    },
  ],
};
