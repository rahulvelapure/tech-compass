import type { Article } from "../../types";

export const article: Article = {
  slug: "oauth-2-device-authorization-grant-iot-cli",
  category: "cybersecurity-ciso",
  contentType: "explainer",
  subcategory: "Identity security",
  title: "The short code a user types is the weakest part of the device flow",
  seoTitle: "OAuth 2.0 Device Authorization Grant Explained",
  metaDescription:
    "How RFC 8628 authenticates a CLI or an IoT device with no browser, what the polling rules actually require, and why attackers like the flow as much as engineers do.",
  standfirst:
    "A device with no browser cannot run a redirect. RFC 8628 solves that by moving the login to a phone. It also hands attackers a phishing lure that looks like a real login.",
  excerpt:
    "The device code flow replaced pasted access tokens on headless devices. It works, and it is now a common phishing route — which is why Microsoft ships a policy to block it by default.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 6,
  primaryKeyword: "OAuth 2.0 Device Authorization Grant",
  secondaryKeywords: [
    "RFC 8628 device code flow",
    "headless authentication OAuth",
    "device code phishing",
    "slow_down polling interval",
    "CLI tool authentication",
  ],
  tags: ["OAuth", "Identity security", "Authentication", "IoT", "Zero Trust"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "oauth2-token-theft-dpop-mechanics",
    "entra-id-authentication-context-step-up-mfa",
  ],
  methodology:
    "Written from RFC 8628, the Microsoft Entra documentation on the device authorization grant and on blocking authentication flows with Conditional Access, and the GitHub CLI documentation, verified August 2026. Two corrections were made to the source draft. It said the flow is disabled by default for new Entra tenants; the control is a Conditional Access authentication-flows policy, and since 2025 Microsoft has rolled out a managed policy that blocks the flow for tenants not using it. And it suggested extending the flow with PKCE, which does not apply — there is no redirect and no authorization code to bind. The spec's `verification_uri_complete` option and its session-spying risk were added, since both change the security analysis.",
  body: [
    {
      type: "p",
      text: "The standard OAuth redirect assumes a browser. The user is sent to the identity provider, signs in, and comes back with a code. Take the browser away and the whole shape collapses.",
    },
    {
      type: "p",
      text: "That is the position a CLI over SSH is in. So is a smart TV, and so is a sensor with a four-line display. For years the workaround was a personal access token: generate it in a web UI, copy the string, paste it into the terminal. Those tokens were long-lived, widely shared and rarely revoked.",
    },
    {
      type: "p",
      text: "RFC 8628 defines a proper answer. It is called the device authorization grant, and most people call it the device code flow.",
    },
    { type: "h2", id: "mechanics", text: "How the flow works" },
    {
      type: "p",
      text: "The trick is to split the device that wants access from the device where the human signs in. Three parties are involved: the headless device, the authorization server, and a phone or laptop with a browser.",
    },
    { type: "h3", id: "step-one", text: "The device asks for a code" },
    {
      type: "p",
      text: "The device posts its `client_id` and the scopes it wants to the device authorization endpoint. The server answers with two codes and some instructions.",
    },
    {
      type: "table",
      caption: "The response fields, and who each one is for.",
      head: ["Field", "For", "What it does"],
      rows: [
        ["`device_code`", "The device", "Secret. Used to poll for the token"],
        ["`user_code`", "The human", "Short. Typed into a browser"],
        ["`verification_uri`", "The human", "Where to type the code"],
        ["`verification_uri_complete`", "The human", "Optional. Carries the code already"],
        ["`expires_in`", "Both", "Seconds until the codes die"],
        ["`interval`", "The device", "Minimum seconds between polls"],
      ],
    },
    {
      type: "p",
      text: "The two codes are not interchangeable, and confusing them is the classic implementation bug. The `device_code` is high-entropy and never shown to anyone. The `user_code` is short because a person has to read it off a screen and type it.",
    },
    { type: "h3", id: "step-two", text: "The human approves it somewhere else" },
    {
      type: "p",
      text: "The device displays the `user_code` and the `verification_uri`. The user opens that address on their phone, signs in, types the code, and approves the scopes.",
    },
    { type: "h3", id: "step-three", text: "The device polls" },
    {
      type: "p",
      text: "Meanwhile the device posts the `device_code` to the token endpoint, with `grant_type` set to `urn:ietf:params:oauth:grant-type:device_code`. Until the user finishes, the server answers with an error of `authorization_pending`. Once they approve, the same call returns an access token and usually a refresh token.",
    },
    { type: "h2", id: "polling", text: "The polling rules are stricter than they look" },
    {
      type: "p",
      text: "Aggressive polling is the most common mistake in device flow clients. A device that asks twice a second generates load the server should never have to absorb.",
    },
    {
      type: "p",
      text: "The server sets the pace with `interval`. If it omits the field, the default is five seconds. The client must wait at least that long between polls.",
    },
    {
      type: "callout",
      variant: "note",
      title: "slow_down is not generic backoff",
      text: "If the client polls too fast, the server returns `slow_down`. RFC 8628 is specific about the response: the client increases its interval by five seconds, and keeps the larger interval for every request after that. It is not an exponential backoff and it is not a one-off penalty. Get this wrong and the identity provider will rate limit or block your `client_id`.",
    },
    {
      type: "p",
      text: "Two other errors end the loop rather than extend it. `access_denied` means the user refused. `expired_token` means the codes timed out. Both should stop polling and start over.",
    },
    { type: "h2", id: "phishing", text: "Why attackers like this flow" },
    {
      type: "p",
      text: "The device flow has a property no other OAuth grant has. The person approving the request has no way to see the device making it.",
    },
    {
      type: "p",
      text: "So an attacker starts a device flow of their own, takes the `user_code` the server issues, and emails it to a target. The message says to visit the real provider URL and enter the code. Every part of that instruction is genuine. The user signs in to the real identity provider, over a real TLS connection, and approves. The token lands on the attacker's device.",
    },
    {
      type: "p",
      text: "Nothing here is a protocol flaw in the usual sense. There is no forged page and no stolen password. The flow is working as designed, and the design assumed the user knows which device they are authorizing.",
    },
    {
      type: "p",
      text: "`verification_uri_complete` makes this worse. It embeds the code in the link, so the user never types it and never has to look at it. RFC 8628 says that when you use it, showing the code and asking the user to confirm it matches becomes particularly important.",
    },
    {
      type: "p",
      text: "The spec names a second risk that gets less attention. Someone who can see the device screen can read the code and race the legitimate user to the approval page. On a shared display, the code is not a secret at all.",
    },
    { type: "h3", id: "code-guessing", text: "Rate limiting, not code length, is the defence" },
    {
      type: "p",
      text: "A `user_code` has to be typed by hand, so it is short. That makes brute force worth considering.",
    },
    {
      type: "p",
      text: "The spec works the numbers rather than demanding a longer code. An eight-character code over a twenty-symbol alphabet is safe enough if the server allows only about five attempts, which puts the odds of a guess near one in four billion. The strength comes from the limit on attempts. Drop the limit and the code length will not save you.",
    },
    {
      type: "p",
      text: "Two things follow. Exclude the characters people confuse — zero against O, one against I — because a user who mistypes burns an attempt. And rate limit the verification page hard, per client and per source address.",
    },
    { type: "h2", id: "pkce", text: "PKCE does not apply here" },
    {
      type: "p",
      text: "Devices and CLI tools are public clients. They cannot keep a `client_secret`, because anyone holding the binary holds the secret. So the flow has to work without one.",
    },
    {
      type: "p",
      text: "The usual answer for a public client is PKCE. It does not fit here. PKCE binds an authorization code to the client that started the request, and the device flow has no redirect and no authorization code to bind. Advice to add PKCE to the device flow is confusing it with the authorization code flow.",
    },
    {
      type: "p",
      text: "What the server does instead is bind the `device_code` to the `client_id` that requested it, and reject any token request where those do not match. Both endpoints must be TLS-only. The same reasoning about binding a token to its holder is explored in [OAuth token theft and DPoP](/cybersecurity-ciso/oauth2-token-theft-dpop-mechanics).",
    },
    { type: "h2", id: "entra", text: "What Microsoft did about it" },
    {
      type: "p",
      text: "Entra ID supports RFC 8628. It is not controlled by a tenant switch, which is what older guidance implies. You block it with a Conditional Access policy that targets authentication flows.",
    },
    {
      type: "p",
      text: "Microsoft went further in 2025. It began rolling out a managed Conditional Access policy that blocks the flow for tenants with no sign of using it. The reasoning is worth repeating. Few customers need the flow. Attackers use it a great deal.",
    },
    {
      type: "p",
      text: "That is the right default. If you do need it, scope it. Allow it for the specific applications that cannot use a browser, block it everywhere else, and require step-up at the approval point — see [authentication context and step-up MFA](/microsoft-365-entra-id/entra-id-authentication-context-step-up-mfa).",
    },
    { type: "h2", id: "checklist", text: "If you are implementing it" },
    {
      type: "p",
      text: "The client-side rules are short. The server-side ones are where the risk lives.",
    },
    {
      type: "ol",
      items: [
        "**Show the client and the scopes on the approval screen.** The user is being asked to trust a device they cannot see. Tell them which one.",
        "**Rate limit the verification page.** This is what makes a short code safe, so treat it as a security control rather than as capacity management.",
        "**Keep the codes short-lived.** Fifteen minutes is a reasonable ceiling for the `device_code`.",
        "**Restrict the scopes the flow may request.** Administrative and password-reset scopes have no business arriving through a code somebody typed on a phone.",
        "**Log every submission.** Record the address and the client. A phishing campaign shows up as many approvals for one client from unrelated users.",
      ],
    },
    {
      type: "p",
      text: "The GitHub CLI is the reference example of the flow done well. Running `gh auth login` offers the device flow, prints a code, and waits. The token that comes back goes into the operating system keychain and inherits the account's session and MFA state. Nobody pastes a long-lived token, and that was the point.",
    },
  ],
  faq: [
    {
      question: "Should mobile apps use the device code flow?",
      answer:
        "No. A phone has a browser built in. Use the authorization code flow with PKCE. Keep the device flow for hardware that cannot show a web page.",
    },
    {
      question: "Does PKCE work with the device code flow?",
      answer:
        "No. PKCE binds an authorization code to the client that asked for it. This flow has no redirect and no such code. The server binds the device code to the client instead.",
    },
    {
      question: "What must a client do when it gets slow_down?",
      answer:
        "Add five seconds to the polling interval. Then keep the new value for every later request. RFC 8628 is exact on this point. It is not a backoff curve.",
    },
    {
      question: "What is the default polling interval?",
      answer:
        "Five seconds, if the server does not send an `interval` field. Polling faster than the stated value is what triggers `slow_down`.",
    },
    {
      question: "Is the device code flow safe to leave on?",
      answer:
        "Usually not. Attackers use it far more than most tenants do. Block it by default and allow it only for the apps that need it.",
    },
    {
      question: "How do refresh tokens work here?",
      answer:
        "The token response can include one. A sensor may run for months with nobody there. So the server has to issue a long-lived refresh token, or rotate them.",
    },
    {
      question: "Why is a short user code acceptable?",
      answer:
        "Because the server caps the guesses. A few attempts over an eight-character code is enough. Remove the cap and the code becomes easy to guess.",
    },
  ],
  sources: [
    {
      title: "RFC 8628: OAuth 2.0 Device Authorization Grant",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/html/rfc8628",
    },
    {
      title: "Microsoft identity platform and the OAuth 2.0 device authorization grant",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity-platform/v2-oauth2-device-code",
    },
    {
      title: "Block authentication flows with Conditional Access policy",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/conditional-access/policy-block-authentication-flows",
    },
    {
      title: "gh auth login",
      publisher: "GitHub",
      url: "https://cli.github.com/manual/gh_auth_login",
    },
  ],
};
