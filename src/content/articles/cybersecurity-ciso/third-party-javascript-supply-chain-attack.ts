import type { Article } from "../../types";

export const article: Article = {
  slug: "third-party-javascript-supply-chain-attack",
  category: "cybersecurity-ciso",
  contentType: "analysis",
  subcategory: "Security operations",

  title: "The Websites You Trust Could Be Stealing Your Data",
  seoTitle: "Optimizely JavaScript Supply Chain Attack: What CISOs Need to Know",
  metaDescription:
    "The Optimizely attack exposed 178 organisations through trusted JavaScript. Learn how it worked, what data was at risk, and how CISOs should respond.",

  standfirst:
    "A trusted website can use HTTPS, hold a valid certificate and still send malicious code to your browser. The November 2026 Optimizely incident exposed this uncomfortable reality when attackers injected JavaScript into a platform used by major organisations worldwide.",

  excerpt:
    "Attackers abused Optimizely Web Experimentation to deliver malicious JavaScript through trusted websites. Researchers identified 188 infected scripts linked to 178 organisations. The malware could redirect cryptocurrency payments, skim card data, access cookies, capture screenshots and attempt iOS exploitation. The incident shows why third-party browser code needs the same security attention as any other software dependency.",

  heroImage: "/images/third-party-javascript-supply-chain-attack.webp",
  heroImageAlt:
    "Browser loading compromised third-party JavaScript from a trusted web service, illustrating a software supply chain attack.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-18",
  lastReviewedAt: "2026-11-18",
  nextReviewAt: "2026-11-25",

  readingMinutes: 16,

  primaryKeyword: "third-party JavaScript security",

  secondaryKeywords: [
    "Optimizely supply chain attack",
    "JavaScript supply chain attack",
    "Optimizely security incident",
    "malicious JavaScript injection",
    "third-party script security",
    "client-side security",
    "browser-side security",
    "Content Security Policy",
    "Subresource Integrity",
    "web supply chain security",
    "CISO website security",
  ],

  tags: [
    "Cybersecurity",
    "Supply Chain Security",
    "JavaScript",
    "Website Security",
    "Third-Party Risk",
    "Security Operations",
    "CISO",
    "Incident Response",
    "Optimizely",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [],

  draft: false,

  methodology:
    "This analysis is based on public reporting and technical research available as of 18 November 2026, including findings published by Report URI, the Optimizely incident update and reporting from multiple security and news organisations. Technical recommendations are also informed by established web security practices from OWASP and MDN. Confirmed findings are separated from claims that remain under investigation.",

  body: [
    {
      type: "p",
      text: "You open a website you trust. The address is correct. HTTPS is active. The certificate is valid. Nothing looks wrong.",
    },
    {
      type: "p",
      text: "Then you enter a payment card number, copy a cryptocurrency address or sign in to your account. At the same time, JavaScript running inside the page watches what you are doing.",
    },
    {
      type: "p",
      text: "The website itself may not have been hacked.",
    },
    {
      type: "p",
      text: "Instead, one of the third-party services trusted by the website has been compromised.",
    },
    {
      type: "p",
      text: "That is what made the November 2026 Optimizely incident important. Researchers found **188 infected JavaScript snippets linked to 178 organisations** after attackers inserted malicious code into Optimizely Web Experimentation projects. The affected organisations included well-known names across media, technology, finance and retail.",
    },

    {
      type: "h2",
      text: "Executive summary",
      id: "executive-summary",
    },
    {
      type: "ul",
      items: [
        "Attackers inserted malicious JavaScript into projects using the Optimizely Web Experimentation platform.",
        "Report URI examined 1,611 Optimizely snippets and identified 188 infected scripts associated with 178 organisations.",
        "The compromised code continued to arrive through Optimizely's trusted infrastructure, including `cdn.optimizely.com`.",
        "The malware could replace cryptocurrency wallet addresses, skim payment card data, access readable cookies and capture screenshots.",
        "Researchers also observed code intended to deliver iOS exploit kits to some iPhone and iPad users.",
        "About US$7,000 reached attacker-linked cryptocurrency wallets during the period studied, although researchers noted that not every transaction could necessarily be tied to this incident.",
        "The incident does not mean the core infrastructure of every listed organisation was breached.",
        "The main lesson for CISOs is simple: third-party JavaScript should be treated as executable software, not as harmless website content.",
      ],
    },
    {
      type: "p",
      text: "The incident exposes a security gap that many businesses still underestimate. We spend heavily on endpoint security, identity protection, firewalls and server monitoring. Yet a marketing, analytics or experimentation script may execute inside a customer's browser with access to sensitive parts of the page.",
    },
    {
      type: "p",
      text: "If that trusted script changes, the customer's browser may become the attack surface.",
    },

    {
      type: "h2",
      text: "What happened in the Optimizely attack?",
      id: "what-happened-in-the-optimizely-attack",
    },
    {
      type: "p",
      text: "The attack became public on 16 November 2026. Optimizely later confirmed that an unauthorised party had exploited a vulnerability affecting its Experimentation platform and added malicious JavaScript to customer projects.",
    },
    {
      type: "p",
      text: "Optimizely said it fixed the vulnerability, removed the injected code and took steps to secure affected accounts. Those actions included revoking tokens and terminating active sessions.",
    },
    {
      type: "p",
      text: "Independent research gave the incident more scale. Scott Helme and the Report URI team analysed **1,611 Optimizely JavaScript snippets**. They found **188 infected snippets belonging to 178 organisations**.",
    },
    {
      type: "p",
      text: "Reported affected sites included organisations such as BBC, CNN, Zoom, Salesforce, GitLab, IKEA, HSBC, Equifax, Ledger and Air France-KLM. Inclusion in that list should not be read as proof that each organisation's internal network, servers or customer databases were compromised. The confirmed issue was malicious code being served through affected web scripts.",
    },
    {
      type: "p",
      text: "That distinction matters. A supply chain incident can expose users even when the organisation they are visiting has not suffered a traditional server breach.",
    },

    {
      type: "h2",
      text: "How the malicious JavaScript reached trusted websites",
      id: "how-the-malicious-javascript-reached-trusted-websites",
    },
    {
      type: "p",
      text: "Optimizely Web Experimentation lets organisations test page layouts, features and customer experiences. To do this, a website loads an Optimizely JavaScript snippet. That code can run across pages where the service is enabled.",
    },
    {
      type: "p",
      text: "Optimizely also provides a feature known as **Project JavaScript**. It lets authorised users add JavaScript that runs as part of the project.",
    },
    {
      type: "p",
      text: "The attacker abused this trust path.",
    },
    {
      type: "p",
      text: "Instead of compromising each website separately, malicious code was inserted into affected Optimizely projects. Visitors then received the altered JavaScript as part of the normal website experience.",
    },
    {
      type: "p",
      text: "Researchers found infected snippets that loaded an attacker-controlled payload from `1688360.cc/track.js`. Other versions tried to hide the destination through Base64 encoding, while some payloads were embedded more directly.",
    },
    {
      type: "p",
      text: "The important point is that the initial script could still come from infrastructure the website deliberately trusted.",
    },
    {
      type: "p",
      text: "The browser therefore saw something that appeared normal: a script requested by the website, delivered from an expected source over an encrypted connection.",
    },

    {
      type: "h2",
      text: "This was a trust failure, not an HTTPS failure",
      id: "this-was-a-trust-failure-not-an-https-failure",
    },
    {
      type: "p",
      text: "Users have been taught to look for HTTPS before entering sensitive information. That remains good advice, but HTTPS solves a different problem.",
    },
    {
      type: "p",
      text: "HTTPS protects the connection between the browser and the server. It helps confirm that the browser is talking to the expected domain and prevents someone on the network from quietly changing the traffic.",
    },
    {
      type: "p",
      text: "It does **not** prove that every piece of JavaScript returned by that trusted server is safe.",
    },
    {
      type: "p",
      text: "If a legitimate service sends malicious code, TLS can deliver that malicious code securely.",
    },
    {
      type: "p",
      text: "That sounds contradictory, but it is an important security concept. Transport security protects the delivery path. It does not automatically establish the integrity or intent of the application code being delivered.",
    },

    {
      type: "h2",
      text: "What could the malware do?",
      id: "what-could-the-malware-do",
    },
    {
      type: "p",
      text: "The payload was more than a simple website defacement tool. Researchers found several functions aimed at stealing money or information directly from browser sessions.",
    },

    {
      type: "h3",
      text: "1. Replace cryptocurrency addresses",
      id: "replace-cryptocurrency-addresses",
    },
    {
      type: "p",
      text: "The malware searched pages and browser activity for cryptocurrency wallet addresses. When it found one, it could replace the legitimate address with an address controlled by the attacker.",
    },
    {
      type: "p",
      text: "That is dangerous because cryptocurrency addresses are long and difficult for users to recognise. A user may copy a valid address, paste it into a payment workflow and fail to notice that it changed.",
    },
    {
      type: "p",
      text: "Researchers reported roughly US$7,000 reaching attacker-linked cryptocurrency wallets during the period they observed. The amount is less important than the technique. The attack modified information at the point where the user trusted the browser to show the correct destination.",
    },

    {
      type: "h3",
      text: "2. Skim payment card data",
      id: "skim-payment-card-data",
    },
    {
      type: "p",
      text: "Later versions of the malware included payment-card skimming capability. The code could monitor form data for card numbers, expiry information and security codes.",
    },
    {
      type: "p",
      text: "This type of browser-side attack is similar in principle to web-skimming campaigns seen against online stores. Instead of attacking the payment processor itself, the attacker steals information before the browser submits it.",
    },
    {
      type: "p",
      text: "There is an important limit. A script on the parent page normally cannot read sensitive fields placed inside a properly isolated cross-origin payment iframe. Hosted payment components can therefore reduce exposure compared with collecting card details directly in merchant-controlled page fields.",
    },

    {
      type: "h3",
      text: "3. Access cookies and page information",
      id: "access-cookies-and-page-information",
    },
    {
      type: "p",
      text: "JavaScript can access cookies that are available to client-side code. A malicious script running with the same browser privileges can abuse that access.",
    },
    {
      type: "p",
      text: "Cookies protected with the `HttpOnly` attribute are not readable through JavaScript. That makes `HttpOnly` an important control for sensitive session cookies, although it does not solve every form of client-side compromise.",
    },

    {
      type: "h3",
      text: "4. Capture screenshots",
      id: "capture-screenshots",
    },
    {
      type: "p",
      text: "Researchers also observed screenshot capability. This creates another path for information loss because sensitive information may be visible on screen even when it is not stored in an easily accessible form field.",
    },

    {
      type: "h3",
      text: "5. Target some iOS devices",
      id: "target-some-ios-devices",
    },
    {
      type: "p",
      text: "Researchers reported that the malware could attempt to deliver the Coruna and DarkSword exploit kits to targeted iPhone and iPad users.",
    },
    {
      type: "p",
      text: "This finding should be stated carefully. Delivery of exploit code does not prove that a device was successfully compromised. At the time of this analysis, public reporting had not established how many devices, if any, were successfully exploited through this part of the campaign.",
    },

    {
      type: "h2",
      text: "Why this attack matters to enterprise security",
      id: "why-this-attack-matters-to-enterprise-security",
    },
    {
      type: "p",
      text: "Most enterprises no longer build a website from code they fully control.",
    },
    {
      type: "p",
      text: "A modern site may load analytics tools, consent managers, advertising platforms, chat widgets, tag managers, payment services, customer-support tools and experimentation engines. Each integration adds functionality. Each can also add another party to the trust chain.",
    },
    {
      type: "p",
      text: "From a CISO perspective, the risk model should therefore change.",
    },
    {
      type: "p",
      text: "**If JavaScript can execute on your page, it is part of your application security boundary, regardless of who wrote it.**",
    },
    {
      type: "p",
      text: "That is especially important on login, checkout, account, support and payment pages.",
    },

    {
      type: "h2",
      text: "The browser has privileges that attackers want",
      id: "the-browser-has-privileges-that-attackers-want",
    },
    {
      type: "p",
      text: "Once JavaScript is allowed to run in a page, it can interact with the Document Object Model, observe user actions, initiate network requests and work with data exposed to the page.",
    },
    {
      type: "p",
      text: "That is what makes client-side supply chain attacks attractive. Attackers do not always need to penetrate the target company's internal servers. They may be able to attack customers through software the company has already authorised.",
    },
    {
      type: "p",
      text: "Traditional controls may also have limited visibility. The malicious activity happens inside the visitor's browser, often outside the enterprise endpoint or network controlled by the website owner.",
    },

    {
      type: "h2",
      text: "What is confirmed and what remains unclear",
      id: "what-is-confirmed-and-what-remains-unclear",
    },
    {
      type: "table",
      caption: "Optimizely incident: confirmed findings and open questions",
      head: ["Item", "Current position"],
      rows: [
        ["Initial incident", "Malicious activity was identified on 16 November 2026."],
        ["Affected service", "Optimizely Web Experimentation."],
        ["Scripts examined", "Report URI analysed 1,611 Optimizely snippets."],
        ["Infected scripts", "188 infected snippets were identified."],
        ["Organisations", "The infected snippets were linked to 178 organisations."],
        ["Delivery path", "Malicious code was introduced through affected Optimizely project JavaScript."],
        ["Crypto theft", "Attacker-linked wallets received roughly US$7,000 during the period studied."],
        ["Card skimming", "Card-skimming capability was present; the number of cards actually stolen is not publicly established."],
        ["Cookie access", "The malware included the ability to collect browser information and readable cookies."],
        ["Screenshots", "Screenshot capability was identified in the malicious code."],
        ["iOS targeting", "Exploit code was delivered to some iOS targets; successful device compromise has not been publicly established."],
        ["Customer breaches", "Being on the affected list does not prove each organisation's internal systems were compromised."],
        ["Full impact", "The total number of affected visitors and stolen records remains unclear."],
      ],
    },

    {
      type: "h2",
      text: "What security teams should do now",
      id: "what-security-teams-should-do-now",
    },
    {
      type: "p",
      text: "The immediate lesson should not be to block every third-party service. That is rarely practical. The better response is to understand which external code is trusted, reduce unnecessary exposure and build controls around the remaining dependencies.",
    },

    {
      type: "h3",
      text: "1. Build an inventory of third-party JavaScript",
      id: "build-an-inventory-of-third-party-javascript",
    },
    {
      type: "p",
      text: "Start with a simple question: **What code runs in our customers' browsers?**",
    },
    {
      type: "p",
      text: "Security teams should maintain an inventory of third-party scripts, the pages where they run, their business owner and the external company that controls them.",
    },
    {
      type: "p",
      text: "Do not assume the development team knows every dependency. Marketing teams often add analytics, advertising or experimentation scripts through tag-management platforms without changing application source code.",
    },
    {
      type: "p",
      text: "The inventory should therefore cover source code, content-management systems, tag managers and externally managed website components.",
    },

    {
      type: "h3",
      text: "2. Remove scripts that no longer provide business value",
      id: "remove-scripts-that-no-longer-provide-business-value",
    },
    {
      type: "p",
      text: "Old third-party integrations often survive because nobody wants to remove them.",
    },
    {
      type: "p",
      text: "Challenge that habit.",
    },
    {
      type: "p",
      text: "If a script supports an A/B test that ended months ago, remove it. If an analytics platform has been replaced, remove its old code. If a marketing widget adds little value but runs on checkout pages, question whether it belongs there.",
    },
    {
      type: "p",
      text: "Reducing dependencies is one of the simplest ways to reduce the client-side attack surface.",
    },

    {
      type: "h3",
      text: "3. Protect sensitive pages first",
      id: "protect-sensitive-pages-first",
    },
    {
      type: "p",
      text: "Not every page carries the same risk.",
    },
    {
      type: "p",
      text: "A third-party script on a public product page is different from the same script running beside a login form or payment workflow.",
    },
    {
      type: "p",
      text: "Classify pages by sensitivity and minimise third-party JavaScript on authentication, checkout, account-management and other high-risk pages. Where practical, isolate external components rather than giving them direct access to the main page context.",
    },

    {
      type: "h3",
      text: "4. Use a strong Content Security Policy",
      id: "use-a-strong-content-security-policy",
    },
    {
      type: "p",
      text: "Content Security Policy, or CSP, tells the browser which sources are allowed to provide scripts, images, frames and network connections.",
    },
    {
      type: "p",
      text: "A well-designed CSP can block unexpected external resources and make many injection attacks harder.",
    },
    {
      type: "p",
      text: "However, CSP is not magic. If your policy explicitly trusts a compromised script source, the browser may still execute code from it.",
    },
    {
      type: "p",
      text: "That does not make CSP ineffective. It means CSP should be used as **defence in depth**. Controls such as restrictive `script-src`, carefully designed nonces or hashes and a limited `connect-src` policy can reduce what malicious JavaScript is able to load or where stolen information can be sent.",
    },
    {
      type: "p",
      text: "For an existing website, begin with `Content-Security-Policy-Report-Only`. Review legitimate violations, correct the policy and move to enforcement once the business impact is understood.",
    },

    {
      type: "h3",
      text: "5. Use Subresource Integrity where it fits",
      id: "use-subresource-integrity-where-it-fits",
    },
    {
      type: "p",
      text: "Subresource Integrity, or SRI, allows a website to define a cryptographic hash for an external static resource.",
    },
    {
      type: "p",
      text: "The browser downloads the resource and checks its hash. If the file has changed, the browser refuses to use it.",
    },
    {
      type: "p",
      text: "SRI works well for fixed JavaScript libraries where the expected content does not change. It is less suitable for dynamic scripts whose contents are expected to change frequently.",
    },
    {
      type: "p",
      text: "So SRI should be applied where technically appropriate, not presented as a universal fix for every third-party script.",
    },

    {
      type: "h3",
      text: "6. Monitor what trusted scripts become",
      id: "monitor-what-trusted-scripts-become",
    },
    {
      type: "p",
      text: "Security review at onboarding is not enough.",
    },
    {
      type: "p",
      text: "A script that was safe when approved can change tomorrow.",
    },
    {
      type: "p",
      text: "Monitor important third-party scripts for unexpected content changes, new domains, new network destinations and changes in behaviour. At minimum, teams should be able to tell when a critical dependency changed and determine whether that change was expected.",
    },
    {
      type: "p",
      text: "This is continuous third-party monitoring at the browser layer, rather than a supplier questionnaire completed once a year.",
    },

    {
      type: "h3",
      text: "7. Harden access to third-party platforms",
      id: "harden-access-to-third-party-platforms",
    },
    {
      type: "p",
      text: "A supplier platform that can change production JavaScript is effectively a production administration system.",
    },
    {
      type: "p",
      text: "Treat it accordingly.",
    },
    {
      type: "ul",
      items: [
        "Require phishing-resistant MFA where the platform supports it.",
        "Use single sign-on where practical.",
        "Restrict administrative roles.",
        "Remove dormant users quickly.",
        "Review API keys and service accounts.",
        "Log configuration changes.",
        "Alert on important project changes.",
        "Use formal approval for code that can execute on sensitive pages.",
      ],
    },

    {
      type: "h2",
      text: "If your organisation uses Optimizely",
      id: "if-your-organisation-uses-optimizely",
    },
    {
      type: "p",
      text: "Organisations using Optimizely Web Experimentation should determine exposure rather than assume they were or were not affected.",
    },
    {
      type: "ol",
      items: [
        "Identify every production site that loads an Optimizely Web snippet.",
        "Confirm which Optimizely projects were active on 16 and 17 November 2026.",
        "Contact Optimizely for project-specific information about exposure and remediation.",
        "Review historical Project JavaScript and configuration changes for unauthorised modifications.",
        "Search available web, proxy, DNS, WAF and security telemetry for connections to known attacker infrastructure such as `1688360.cc`.",
        "Preserve relevant logs before normal retention processes remove them.",
        "Review Optimizely administrators, API credentials, tokens and service accounts.",
        "Reset credentials or tokens where the investigation shows this is required.",
        "Check whether affected scripts ran on authentication, payment or other sensitive pages.",
        "Work with privacy, legal and payment teams if evidence shows customer information may have been exposed.",
        "Do not restore disabled integrations until the project configuration and vendor remediation have been verified.",
      ],
    },
    {
      type: "p",
      text: "The goal is not to panic or assume compromise. The goal is to establish evidence.",
    },

    {
      type: "h2",
      text: "Do not confuse exposure with confirmed compromise",
      id: "do-not-confuse-exposure-with-confirmed-compromise",
    },
    {
      type: "p",
      text: "This is one of the most important points when discussing the incident with management.",
    },
    {
      type: "p",
      text: "If a company's affected Optimizely snippet contained malicious code, its web visitors may have been exposed. That does not automatically mean the company's internal network was breached, its servers were controlled by the attacker or every visitor lost data.",
    },
    {
      type: "p",
      text: "Security teams should report these states separately:",
    },
    {
      type: "ul",
      items: [
        "**Affected dependency:** an organisation used a project or script identified as malicious.",
        "**Visitor exposure:** users loaded the malicious code in their browsers.",
        "**Data access:** evidence shows the code reached information of interest.",
        "**Data exfiltration:** evidence shows information left the browser.",
        "**Confirmed loss or compromise:** investigation confirms stolen data, fraudulent transactions or successful exploitation.",
      ],
    },
    {
      type: "p",
      text: "Separating these stages keeps incident reporting accurate and prevents both understatement and exaggeration.",
    },

    {
      type: "h2",
      text: "A practical CISO checklist",
      id: "a-practical-ciso-checklist",
    },
    {
      type: "p",
      text: "The Optimizely incident is a useful reason to review the browser-side controls already in place.",
    },
    {
      type: "ul",
      items: [
        "Do we have a current inventory of third-party JavaScript used on public websites?",
        "Can we identify the business and technical owner for each script?",
        "Do we know which scripts execute on login, checkout and account pages?",
        "Who is authorised to add or modify production scripts?",
        "Can marketing tools introduce JavaScript without a security review?",
        "Is CSP deployed and enforced rather than permanently left in report-only mode?",
        "Is `connect-src` restricted to destinations the application actually needs?",
        "Do we use SRI for suitable static third-party resources?",
        "Are sensitive session cookies protected with appropriate attributes such as `HttpOnly`, `Secure` and `SameSite`?",
        "Can we detect an unexpected change to an important external script?",
        "Do we have logs from tag managers and experimentation platforms?",
        "Is MFA mandatory for supplier administration portals?",
        "Can we disable a third-party integration quickly during an incident?",
        "Are supplier security obligations included in contracts and incident-notification requirements?",
        "Do we know who makes the decision to restore a third-party service after a security incident?",
      ],
    },
    {
      type: "p",
      text: "If several answers are unclear, the problem is likely governance as much as technology.",
    },

    {
      type: "h2",
      text: "A realistic 30-day improvement plan",
      id: "a-realistic-30-day-improvement-plan",
    },
    {
      type: "table",
      caption: "30-day third-party JavaScript security improvement plan",
      head: ["Period", "Action", "Expected result"],
      rows: [
        [
          "Days 1–5",
          "Inventory third-party scripts, domains, tag-manager entries and their owners.",
          "A documented view of the browser-side attack surface.",
        ],
        [
          "Days 6–10",
          "Remove unused scripts and identify external code running on sensitive pages.",
          "Reduced attack surface and clear priority areas.",
        ],
        [
          "Days 11–15",
          "Review CSP, cookie controls and SRI coverage. Test changes before enforcement.",
          "Stronger browser-side technical controls without avoidable service disruption.",
        ],
        [
          "Days 16–20",
          "Review privileged access, MFA, API tokens and audit logging on major third-party platforms.",
          "Reduced risk of unauthorised supplier-platform changes.",
        ],
        [
          "Days 21–25",
          "Implement monitoring for critical script changes and unexpected external connections.",
          "Faster detection of changes in trusted client-side code.",
        ],
        [
          "Days 26–30",
          "Run an incident exercise that includes disabling a third-party script and assessing customer exposure.",
          "A tested response process with clear ownership and escalation.",
        ],
      ],
    },

    {
      type: "h2",
      text: "What should leadership ask?",
      id: "what-should-leadership-ask",
    },
    {
      type: "p",
      text: "Senior management does not need a detailed explanation of JavaScript loaders or browser internals. The discussion should focus on business exposure and control.",
    },
    {
      type: "p",
      text: "Three questions are enough to start:",
    },
    {
      type: "ol",
      items: [
        "**Which external companies can change code that runs on our customer-facing websites?**",
        "**Which of those integrations can access sensitive customer journeys or data?**",
        "**How quickly can we detect, disable and investigate one if the supplier is compromised?**",
      ],
    },
    {
      type: "p",
      text: "If those questions cannot be answered quickly, the organisation has a blind spot worth fixing.",
    },

    {
      type: "h2",
      text: "Third-party risk has moved into the browser",
      id: "third-party-risk-has-moved-into-the-browser",
    },
    {
      type: "p",
      text: "Traditional third-party risk programmes often focus on contracts, questionnaires, certifications and vendor assessments. Those controls remain useful, but they do not tell you what a supplier's JavaScript is doing in a customer's browser right now.",
    },
    {
      type: "p",
      text: "That requires technical visibility.",
    },
    {
      type: "p",
      text: "Security teams should connect supplier governance with application security. A service that can execute code on a production website should have an owner, an approved purpose, appropriate access control, monitoring and an exit plan.",
    },
    {
      type: "p",
      text: "That is particularly important for tag management and experimentation systems because they are designed to change website behaviour quickly. The same flexibility that makes them useful to the business can make them powerful attack paths if control is lost.",
    },

    {
      type: "h2",
      text: "The real lesson from the Optimizely incident",
      id: "the-real-lesson-from-the-optimizely-incident",
    },
    {
      type: "p",
      text: "The most useful lesson is not that Optimizely had a security incident. Every technology provider can face one.",
    },
    {
      type: "p",
      text: "The larger issue is how much trust organisations place in code they do not fully control.",
    },
    {
      type: "p",
      text: "A website can have a valid certificate. Its servers can be patched. Its endpoint tools can be healthy. Its firewall can show no intrusion. Yet customers can still receive malicious code through a trusted third-party dependency.",
    },
    {
      type: "p",
      text: "For a CISO, that changes the question.",
    },
    {
      type: "p",
      text: "Instead of asking only, **'Is our website secure?'**, ask:",
    },
    {
      type: "p",
      text: "**'Who else have we allowed to execute code inside it?'**",
    },
    {
      type: "p",
      text: "Then ask what that code can access, who can change it, how you would notice a change and how quickly you could switch it off.",
    },
    {
      type: "p",
      text: "That is the security boundary modern websites now require.",
    },
  ],

  faq: [
    {
      question: "What is a third-party JavaScript supply chain attack?",
      answer:
        "A third-party JavaScript supply chain attack happens when attackers compromise or abuse external code that a website trusts. The malicious code then runs in visitors' browsers as part of the legitimate website experience. The website's own servers do not always need to be breached.",
    },
    {
      question: "What happened in the November 2026 Optimizely incident?",
      answer:
        "Attackers inserted malicious JavaScript into projects using Optimizely Web Experimentation. Report URI analysed 1,611 Optimizely snippets and identified 188 infected scripts linked to 178 organisations. The injected code could redirect cryptocurrency payments, skim card information, collect browser data and attempt to target some iOS devices.",
    },
    {
      question: "How many organisations were affected by the Optimizely attack?",
      answer:
        "Report URI identified infected Optimizely snippets linked to 178 organisations. This describes exposure through affected web scripts. It does not mean that the internal systems of all 178 organisations were breached.",
    },
    {
      question: "Which organisations were linked to affected Optimizely scripts?",
      answer:
        "Public research and reporting named organisations including BBC, CNN, Zoom, Salesforce, GitLab, IKEA, HSBC, Equifax, Ledger and Air France-KLM. Inclusion means an affected web script was identified. It should not be interpreted as proof that every organisation suffered an internal network or server compromise.",
    },
    {
      question: "Can malicious JavaScript steal payment card details?",
      answer:
        "Yes. JavaScript running in a webpage may be able to read payment information entered into fields controlled by that page. Properly isolated cross-origin payment frames can reduce this risk because the parent page normally cannot directly read the sensitive fields inside the hosted frame.",
    },
    {
      question: "Does HTTPS stop malicious third-party JavaScript?",
      answer:
        "No. HTTPS protects data while it travels between the browser and server and helps verify the server's identity. It does not prove that the JavaScript returned by a trusted server is safe. A compromised trusted service can therefore deliver malicious code over a valid HTTPS connection.",
    },
    {
      question: "Can Content Security Policy prevent third-party script attacks?",
      answer:
        "CSP can reduce the attack surface by limiting which scripts and network destinations a browser may use. However, a policy that already trusts a compromised script source may still allow code from that source. CSP is therefore an important defence-in-depth control rather than a complete solution.",
    },
    {
      question: "What is Subresource Integrity?",
      answer:
        "Subresource Integrity, or SRI, lets a website specify the expected cryptographic hash of a static external resource. The browser checks the downloaded file against the hash and blocks it if the contents have changed. SRI is useful for fixed libraries but is harder to apply to scripts designed to change dynamically.",
    },
    {
      question: "Were iPhones compromised in the Optimizely attack?",
      answer:
        "Researchers observed code intended to deliver the Coruna and DarkSword iOS exploit kits to some targets. Public reporting at the time of this analysis had not established how many devices, if any, were successfully compromised through that part of the attack.",
    },
    {
      question: "What should organisations using Optimizely do?",
      answer:
        "They should identify active Optimizely projects, obtain project-specific information from the vendor, review Project JavaScript changes, preserve relevant logs, search security telemetry for known attacker infrastructure, review privileged accounts and tokens, and establish whether affected scripts ran on sensitive pages.",
    },
    {
      question: "Is removing an infected JavaScript snippet enough?",
      answer:
        "No. Removing malicious code stops that copy from executing, but the organisation should also establish how the code was introduced, confirm vendor remediation, check for continued access, review credentials and tokens, preserve evidence and monitor for further unauthorised changes.",
    },
    {
      question: "What is the biggest lesson for CISOs?",
      answer:
        "Treat third-party JavaScript as part of the production software supply chain. Know which external scripts run, who owns them, what data they can access, who can change them, how changes are detected and how quickly each integration can be disabled during an incident.",
    },
  ],

  sources: [
    {
      title: "World's Largest Brands Infected With Malware Via Optimizely",
      publisher: "Report URI (Scott Helme)",
      url: "https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/",
    },
    {
      title: "Web Experimentation Security Incident",
      publisher: "Optimizely Status",
      url: "https://status.optimizely.com/incidents/ftw0fh9wx43z",
    },
    {
      title:
        "Popular websites subverted in bid to steal crypto, target iPhone users",
      publisher: "Reuters",
      url: "https://www.reuters.com/legal/government/popular-websites-subverted-bid-steal-crypto-target-iphone-users-2026-11-17/",
    },
    {
      title:
        "Optimizely hack infected CNN, Fox News, BBC, Salesforce sites with malware",
      publisher: "BleepingComputer",
      url: "https://www.bleepingcomputer.com/news/security/optimizely-supply-chain-attack-delivers-malware-to-cnn-fox-news-bbc-salesforce-sites/",
    },
    {
      title:
        "Hijacked Optimizely Scripts Served Card Skimmer and iOS Exploit Kits to CNN, BBC and Zoom Visitors",
      publisher: "The Hacker News",
      url: "https://thehackernews.com/2026/11/hijacked-optimizely-scripts-served-card.html",
    },
    {
      title:
        "Hackers used Optimizely to plant malware on Zoom, BBC, CNN and HSBC sites",
      publisher: "The Next Web",
      url: "https://thenextweb.com/news/optimizely-hack-malware-zoom-bbc-cnn-hsbc-178-sites",
    },
    {
      title:
        "Malware spread through Optimizely hits 178 organizations, including BBC, CNN and Zoom",
      publisher: "Help Net Security",
      url: "https://www.helpnetsecurity.com/2026/11/17/optimizely-vulnerability-malicious-javascript/",
    },
    {
      title:
        "Optimizely Vulnerability Exploited to Serve Malware on Major Websites",
      publisher: "SecurityWeek",
      url: "https://www.securityweek.com/optimizely-vulnerability-exploited-to-serve-malware-on-major-websites/",
    },
    {
      title: "Third Party JavaScript Management Cheat Sheet",
      publisher: "OWASP",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html",
    },
    {
      title: "Subresource Integrity",
      publisher: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity",
    },
    {
      title: "Content Security Policy",
      publisher: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy",
    },
  ],
};