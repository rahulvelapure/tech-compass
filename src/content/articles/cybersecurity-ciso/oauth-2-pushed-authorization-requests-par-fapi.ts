import type { Article } from "../../types";

export const article: Article = {
  slug: "oauth-2-pushed-authorization-requests-par-fapi",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Identity security",
  title: "Move the authorization request off the browser and most of the attacks stop working",
  seoTitle: "OAuth 2.0 PAR: Securing the Authorization Request",
  metaDescription:
    "RFC 9126 sends authorization parameters over an authenticated back channel and leaves an opaque reference in the URL. What that fixes, and what it does not.",
  standfirst:
    "An OAuth redirect carries the whole request in a URL. Whoever owns the browser can read it and change it. PAR sends that request another way, and leaves only a handle behind.",
  excerpt:
    "PAR is a small change with a wide blast radius: the client authenticates before the user is redirected, so parameters are checked once, on a channel an attacker cannot reach.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "OAuth 2.0 Pushed Authorization Requests PAR",
  secondaryKeywords: [
    "RFC 9126",
    "FAPI 2.0 security profile",
    "OAuth request_uri",
    "JWT-secured authorization request",
    "OAuth front-channel security",
  ],
  tags: ["OAuth", "Identity security", "Authentication", "Zero Trust", "Standards"],
  reviewStatus: "research-based",
  relatedSlugs: ["oauth2-token-theft-dpop-mechanics", "oauth-2-device-authorization-grant-iot-cli"],
  methodology:
    "Written from RFC 9126, RFC 9101 on JWT-secured authorization requests, the OpenID Foundation FAPI 2.0 security profile, and the IETF OAuth 2.0 Security Best Current Practice, verified August 2026. One correction was made to the source draft. It said PAR lets public clients be required to authenticate using DPoP or mTLS; a public client is by definition one that holds no credential, and what PAR actually gives it is a validated, authenticated-channel request whose parameters cannot be altered in the browser. The draft's open-redirector incident was rewritten as the mechanism, and the distinction between PAR and JAR was made explicit throughout.",
  body: [
    {
      type: "p",
      text: "The authorization code flow has one structural weakness, and it is not the code. It is the request that comes before it. The client builds a long URL and hands it to the browser, which means it hands it to whoever controls the browser.",
    },
    {
      type: "p",
      text: "That URL carries the `client_id`, the `redirect_uri`, the scopes, the `state` and the PKCE `code_challenge`. All of it is readable. All of it is editable.",
    },
    {
      type: "p",
      text: "RFC 9126 defines Pushed Authorization Requests, and the idea is simple. Send the parameters to the server first, over a channel the browser is not part of. Send the browser a reference instead.",
    },
    { type: "h2", id: "front-channel", text: "What the front channel actually exposes" },
    {
      type: "p",
      text: "Three problems follow from putting the request in a URL, and they are different in kind.",
    },
    {
      type: "ul",
      items: [
        "**The parameters can be modified.** Anything that sits between the client and the identity provider can rewrite them. The server sees only what arrives, and it has no way to know what was sent.",
        "**The parameters leak.** URLs land in browser history, proxy logs and, if the login page loads anything external, in a referrer header.",
        "**The URL runs out of room.** A signed request object or a rich authorization detail can exceed what browsers and gateways will carry, and truncation shows up as a validation error nowhere near its cause.",
      ],
    },
    {
      type: "p",
      text: "The first is the one that matters most, because the parameter that decides where the code goes is in the payload the attacker can edit.",
    },
    { type: "h2", id: "flow", text: "How PAR reorders the flow" },
    {
      type: "p",
      text: "PAR adds one endpoint to the authorization server, and the server advertises it as `pushed_authorization_request_endpoint` in its metadata. Only clients reach it. Browsers never do.",
    },
    { type: "h3", id: "push", text: "The client pushes first" },
    {
      type: "p",
      text: "Before any redirect, the client posts the full parameter set from its backend to that endpoint. It authenticates while doing so, using whatever method it is registered for: a client secret, a private key JWT, or mutual TLS.",
    },
    { type: "h3", id: "request-uri", text: "The server validates and issues a handle" },
    {
      type: "p",
      text: "The server checks the client's identity, matches the `redirect_uri` against the registered set, and validates the scopes. If everything holds, it stores the request and returns a `request_uri` with an `expires_in`.",
    },
    {
      type: "p",
      text: "The value takes the form `urn:ietf:params:oauth:request_uri:` followed by a random string. It is a handle. It carries no meaning and reveals nothing about the request behind it.",
    },
    { type: "h3", id: "redirect", text: "The redirect gets very short" },
    {
      type: "p",
      text: "The client now redirects the browser to the authorization endpoint with two parameters: the `client_id` and the `request_uri`. That is the whole URL.",
    },
    {
      type: "p",
      text: "The server looks up the handle, retrieves the parameters it validated a moment ago, and renders the consent screen. Nothing in the browser fed that decision.",
    },
    { type: "h2", id: "benefits", text: "What this actually fixes" },
    {
      type: "p",
      text: "The gain is not that the parameters are hidden. It is that they were validated on an authenticated channel, and the thing in the browser is only a reference.",
    },
    {
      type: "p",
      text: "Editing the `request_uri` gets you nothing. Change it and the lookup fails. There is no parameter to tamper with, because the parameters are not there.",
    },
    {
      type: "p",
      text: "Consider the open redirector, which is the classic version of this attack. An application hosts a legacy endpoint on its own domain that forwards to any URL you give it. An attacker builds an authorization request whose `redirect_uri` points at that endpoint, with their own server as the onward destination. A server validating the domain rather than the exact URI accepts it, and the code arrives at the attacker.",
    },
    {
      type: "p",
      text: "With PAR the `redirect_uri` is checked on the back channel, against the registered value, before the user is anywhere near the flow. The redirector is still a bug on the web server. It is no longer a route to a token.",
    },
    {
      type: "callout",
      variant: "note",
      title: "PAR and PKCE solve different halves",
      text: "PAR protects the authorization request. PKCE protects the code exchange that follows it. In a PAR flow the `code_challenge` travels in the pushed request and the `code_verifier` still goes to the token endpoint. Neither replaces the other, and FAPI requires both.",
    },
    { type: "h2", id: "jar", text: "PAR is not JAR, and FAPI wants both" },
    {
      type: "p",
      text: "These get conflated constantly. They are separate specifications doing separate jobs.",
    },
    {
      type: "table",
      caption: "Two specifications, two properties.",
      head: ["", "PAR (RFC 9126)", "JAR (RFC 9101)"],
      rows: [
        ["Moves the request off the browser", "Yes", "No"],
        ["Signs the request", "No", "Yes"],
        ["Gives non-repudiation", "No", "Yes"],
        ["What the browser carries", "An opaque handle", "A signed request object"],
      ],
    },
    {
      type: "p",
      text: "JAR wraps the parameters in a signed JWT, so the server can prove the client authored them. It does not move them anywhere. Used alone, that signed object still travels through the browser.",
    },
    {
      type: "p",
      text: "Put them together and you get both properties: the request is signed, and it never reaches the front channel. That is the combination the FAPI 2.0 security profile requires, which is why regulated deployments describe PAR as mandatory rather than recommended.",
    },
    { type: "h2", id: "clients", text: "Where public clients land" },
    {
      type: "p",
      text: "A single-page application holds no credential. Anything shipped to a browser is public by definition, so an SPA cannot authenticate to the PAR endpoint on its own.",
    },
    {
      type: "p",
      text: "The usual answer is a backend for frontend. A small server-side component holds the client credential, makes the pushed request, and hands the SPA the `request_uri` to redirect with. That is the same architecture that keeps refresh tokens out of browser storage, so most teams adopting PAR have already built it.",
    },
    {
      type: "p",
      text: "Be precise about what PAR buys a public client. It does not turn one into a confidential client. What it gives is a request the browser cannot alter — a real gain, and a different one from proving who the caller is. Binding the resulting token to its holder is a separate problem, covered in [OAuth token theft and DPoP](/cybersecurity-ciso/oauth2-token-theft-dpop-mechanics).",
    },
    { type: "h2", id: "operating", text: "Operating it" },
    {
      type: "ol",
      items: [
        "**Require it, do not merely enable it.** Check the server's metadata for the endpoint and configure clients to fail closed if it is missing. A flow that silently falls back to the plain redirect has none of the benefit.",
        "**Keep the handle short-lived.** A minute or so is plenty. It only has to survive one redirect, and a long window is a window for replay.",
        "**Plan for the store.** The pushed request lives server-side between the push and the redirect. If that store is distributed and loses the entry, the user gets an invalid request error and must start again. Size it and monitor it like the session store it is.",
        "**Log the push, not just the redirect.** The push is where validation happens, so it is where a rejected `redirect_uri` or an unexpected scope first shows up.",
      ],
    },
    {
      type: "p",
      text: "PAR is a small change to make and hard to reverse the value of. It removes an entire category of attack by moving one message off a channel that was never trustworthy. Compare that with the [device authorization grant](/cybersecurity-ciso/oauth-2-device-authorization-grant-iot-cli), where no back channel to the user exists at all and the same guarantees are simply unavailable.",
    },
  ],
  faq: [
    {
      question: "Does PAR replace PKCE?",
      answer:
        "No. PAR protects the authorization request. PKCE protects the code exchange. The `code_challenge` goes in the pushed request and the verifier still goes to the token endpoint.",
    },
    {
      question: "What is the difference between PAR and JAR?",
      answer:
        "PAR moves the request off the browser. JAR signs it. JAR alone still sends a signed object through the front channel. FAPI 2.0 asks for both.",
    },
    {
      question: "Can a single-page app use PAR?",
      answer:
        "Not directly. It has no credential to authenticate with. Put a backend for frontend in front of it to make the pushed request and return the handle.",
    },
    {
      question: "What does the request_uri look like?",
      answer:
        "It starts with `urn:ietf:params:oauth:request_uri:` and ends in a random string. It is an opaque handle, so it tells an attacker nothing.",
    },
    {
      question: "What if the server loses the pushed request?",
      answer:
        "The user sees an invalid request and has to start over. The request lives in a server-side store between the push and the redirect, so treat that store as production state.",
    },
    {
      question: "Does PAR stop open redirector attacks?",
      answer:
        "Yes, as a route to a token. The `redirect_uri` is validated on the back channel against the registered value. The redirector is still a bug worth fixing.",
    },
  ],
  sources: [
    {
      title: "RFC 9126: OAuth 2.0 Pushed Authorization Requests",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc9126",
    },
    {
      title: "RFC 9101: The OAuth 2.0 Authorization Framework — JWT-Secured Authorization Request",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc9101",
    },
    {
      title: "FAPI 2.0 Security Profile",
      publisher: "OpenID Foundation",
      url: "https://openid.net/specs/fapi-security-profile-2_0-final.html",
    },
    {
      title: "OAuth 2.0 Security Best Current Practice",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc9700",
    },
  ],
};
