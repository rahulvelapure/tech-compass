import type { Article } from "../../types";

export const article: Article = {
  slug: "microsoft-365-outage-november-2026",
  category: "microsoft-365-entra-id",
  contentType: "analysis",
  subcategory: "Collaboration",

  title:
    "Microsoft 365 Outage of November 2026: What Failed, Why It Happened, and What IT Teams Should Learn",

  seoTitle:
    "Microsoft 365 Outage November 2026: What Happened",

  metaDescription:
    "A clear analysis of the November 2026 Microsoft 365 outage, why services failed, why recovery took time, and how IT teams can reduce outage risk.",

  standfirst:
    "A major Microsoft 365 outage disrupted email and connected services worldwide. Here is what happened, why recovery was hard, and what IT teams can learn.",

  excerpt:
    "The November 2026 Microsoft 365 outage disrupted Outlook, Exchange Online, Teams features, Copilot, and other connected services. This analysis explains the known cause, the difficult recovery, the business impact, and the practical steps IT teams can take before the next major cloud outage.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-13",
  lastReviewedAt: "2026-11-13",
  nextReviewAt: "2027-05-13",

  readingMinutes: 12,

  primaryKeyword: "Microsoft 365 outage November 2026",

  secondaryKeywords: [
    "Microsoft outage November 2026",
    "Microsoft 365 outage",
    "Outlook outage",
    "Exchange Online outage",
    "Microsoft Teams outage",
  ],

  tags: [
    "Microsoft 365",
    "Exchange Online",
    "Outlook",
    "Teams",
    "Cloud Resilience",
    "Business Continuity",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "microsoft-365-tenant-to-tenant-migration",
    "conditional-access-framework",
    "iso-27001-microsoft-365-mapping",
  ],

  draft: false,

  methodology:
    "This article is based on Microsoft service updates and public reporting available on November 14, 2026. Confirmed facts are separated from engineering analysis where the final Microsoft post-incident report is not yet available.",

  body: [
    {
      type: "p",
      text: "A major Microsoft 365 outage began on November 12, 2026 and continued into November 13. The most visible problem was email. Many users could not open Exchange Online mailboxes, send mail, receive mail, or use Outlook as normal. The effects then appeared across other Microsoft 365 services that depend on the same platform.",
    },
    {
      type: "p",
      text: "The incident is useful for IT teams because it shows how a failure in a large cloud platform can spread. It also shows why fixing the first technical fault does not always restore a service at once. A system may remain unstable after the original trigger is removed.",
    },

    {
      type: "h2",
      id: "short-version",
      text: "The short version",
    },
    {
      type: "p",
      text: "Microsoft said that a large number of servers became unexpectedly unavailable. This moved more work onto the servers that were still running. Those systems then had to carry more load than planned.",
    },
    {
      type: "p",
      text: "Microsoft also found that a process used to establish secure connections was becoming overwhelmed. Engineers paused deployments, restarted servers, shifted traffic, tested different health checks, and investigated recent network changes.",
    },
    {
      type: "p",
      text: "Recovery was difficult because some servers that returned to service became unresponsive again after normal traffic reached them. This created a cycle in which capacity could be restored but could not always remain stable.",
    },
    {
      type: "callout",
      variant: "note",
      title: "What Microsoft has ruled out",
      text: "Microsoft said it found no evidence of malicious activity linked to the incident. It also said the incident was not related to cyber activity or AI agents.",
    },

    {
      type: "h2",
      id: "what-happened",
      text: "What happened?",
    },
    {
      type: "p",
      text: "The first clear problem involved Exchange Online. Users had trouble reaching their mailboxes through several connection methods. Outlook on the web and Outlook desktop were affected, and some users saw delayed email.",
    },
    {
      type: "p",
      text: "Exchange Online is more than an email server. It provides mail and calendar data to many parts of Microsoft 365. A problem there can therefore have an effect outside Outlook.",
    },
    {
      type: "p",
      text: "Microsoft first described elevated load across parts of its infrastructure. That wording could suggest an unusual rise in customer traffic. Microsoft later gave an important detail: the higher load was caused by servers becoming unavailable, not by a sudden increase in normal demand.",
    },
    {
      type: "p",
      text: "When servers disappear from a pool, their work does not simply disappear. Requests are sent to the systems that remain available. If too much capacity is lost, those remaining systems can become stressed as well.",
    },

    {
      type: "h2",
      id: "simple-example",
      text: "A simple way to understand the failure",
    },
    {
      type: "p",
      text: "Imagine a road with six lanes. Traffic is moving well. Four lanes then close, but the same number of vehicles still need to travel. The two remaining lanes become congested.",
    },
    {
      type: "p",
      text: "A large cloud system can face the same basic problem. If many servers leave service, the surviving servers receive more requests. They may become slow. Health checks may then mark more servers as unhealthy. Capacity falls again, which adds yet more pressure to the remaining systems.",
    },
    {
      type: "p",
      text: "This is how a local fault can develop into a larger service problem.",
    },

    {
      type: "h2",
      id: "known-cause",
      text: "What do we know about the cause?",
    },
    {
      type: "p",
      text: "Microsoft said later in the incident that the problem was introduced during an earlier network capacity upgrade and surfaced after a recent network change. The company said it had addressed the underlying issue while recovery work continued.",
    },
    {
      type: "p",
      text: "Earlier service updates had also described a process on affected servers that establishes secure connections becoming overwhelmed. Microsoft investigated recent configuration changes and began reverting network changes while it worked to restore stable capacity.",
    },
    {
      type: "p",
      text: "These facts give us a useful picture of the failure. They do not yet provide every engineering detail. A final post-incident report is still needed to explain the full chain of events.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not confuse the failure mechanism with the final root cause",
      text: "Server overload, failed health checks, and secure connection problems describe how the incident developed. A complete root cause should also explain why the original condition was introduced, why safeguards did not contain it, and why recovery took so long.",
    },

    {
      type: "h2",
      id: "why-many-services",
      text: "Why did one problem affect so many Microsoft services?",
    },
    {
      type: "p",
      text: "Microsoft 365 is a group of connected services. Outlook, Teams, SharePoint, Copilot, Defender, Intune, Purview, and Microsoft Graph do not operate as completely separate islands.",
    },
    {
      type: "p",
      text: "Services can share identity, network, routing, application programming interfaces, security controls, and data. Some Microsoft 365 features also depend directly on Exchange Online.",
    },
    {
      type: "p",
      text: "For example, Teams uses Exchange data for calendar functions. Microsoft Graph can provide access to mail and calendar information. Copilot can work with Microsoft 365 data when a user and tenant allow it.",
    },
    {
      type: "p",
      text: "This integration is one reason Microsoft 365 is useful. It is also why a problem in an important shared service can produce symptoms across several products.",
    },

    {
      type: "h2",
      id: "why-recovery-took-time",
      text: "Why did recovery take so long?",
    },
    {
      type: "p",
      text: "Restarting a server is easy. Restoring a large distributed service safely is harder.",
    },
    {
      type: "p",
      text: "Microsoft reported that some servers returned to service but became unresponsive again when traffic reached them. This meant that simply restarting more servers was not enough.",
    },
    {
      type: "p",
      text: "The recovery process had to restore capacity while also preventing that capacity from falling over again.",
    },
    {
      type: "ol",
      items: [
        "Identify unhealthy infrastructure.",
        "Return enough servers to service.",
        "Confirm that health checks are reliable.",
        "Limit traffic while recovering servers become stable.",
        "Watch whether secure connections complete successfully.",
        "Increase traffic in a controlled way.",
        "Reduce email and request backlogs.",
        "Repeat the process across affected regions.",
      ],
    },
    {
      type: "p",
      text: "This explains why large cloud outages can remain visible long after engineers have found an important part of the problem.",
    },

    {
      type: "h2",
      id: "health-checks",
      text: "Why health checks matter",
    },
    {
      type: "p",
      text: "Large services use automated health checks to decide whether a server can receive traffic. If a server fails its check, the platform can remove it from service.",
    },
    {
      type: "p",
      text: "This normally improves reliability. A bad server is removed before it can affect more users.",
    },
    {
      type: "p",
      text: "But health checks form part of the control system. If servers are slow because they are overloaded, more failed health checks can remove more capacity. That sends additional work to the remaining servers.",
    },
    {
      type: "p",
      text: "Good design therefore needs health checks, load balancing, capacity controls, and recovery logic to work together.",
    },

    {
      type: "h2",
      id: "retry-storms",
      text: "The hidden danger of retry storms",
    },
    {
      type: "p",
      text: "When a request fails, software will often try again. That is useful during a short network error. At very large scale, it can also make an overloaded service worse.",
    },
    {
      type: "p",
      text: "Suppose 100,000 clients send requests and many fail. If every client retries at once, the service receives another wave of requests while it is already struggling.",
    },
    {
      type: "p",
      text: "Modern systems reduce this risk with exponential backoff, random delay, retry limits, circuit breakers, queues, and load shedding.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Important distinction",
      text: "Microsoft has not said that customer retry traffic caused this outage. Retry storms are discussed here because they are a common recovery risk when capacity is already under pressure.",
    },

    {
      type: "h2",
      id: "cyberattack",
      text: "Was this a cyberattack?",
    },
    {
      type: "p",
      text: "Microsoft said it found no evidence of malicious activity linked to the incident. It later stated that the outage was a technical issue and was not related to cyber activity or AI agents.",
    },
    {
      type: "p",
      text: "This matters because a large service outage can look similar to an attack from the user's point of view. Email stops. Security tools may become hard to reach. Authentication can fail. Cloud applications may not load.",
    },
    {
      type: "p",
      text: "IT and security teams should not guess. During a major event, both operational and security causes should be considered until evidence allows the incident team to rule them in or out.",
    },

    {
      type: "h2",
      id: "business-impact",
      text: "Why this became a business continuity problem",
    },
    {
      type: "p",
      text: "Email is still part of many critical business processes. It is used for customer messages, approvals, alerts, purchase orders, vendor communication, incident escalation, and automated workflow.",
    },
    {
      type: "p",
      text: "The outage also affected services and features connected to Exchange Online. Public reporting described problems involving Teams, Copilot, SharePoint, security tools, and other Microsoft 365 functions.",
    },
    {
      type: "p",
      text: "Government bodies, companies, and other organisations reported disruption. The exact effect varied by region and service.",
    },
    {
      type: "p",
      text: "For an IT leader, this is the key lesson. A cloud service outage is not only a technical availability event. It can quickly become an operational business event.",
    },

    {
      type: "h2",
      id: "could-it-have-been-avoided",
      text: "Could the outage have been avoided?",
    },
    {
      type: "p",
      text: "Only Microsoft's final engineering review can answer whether one specific control would have prevented this exact outage.",
    },
    {
      type: "p",
      text: "We can still identify engineering practices that reduce the chance that a network or configuration problem becomes a global incident.",
    },

    {
      type: "h3",
      id: "smaller-blast-radius",
      text: "1. Keep the change blast radius small",
    },
    {
      type: "p",
      text: "Infrastructure changes should normally move through controlled deployment rings. A change can start with a small test group, then one production group, then a region, and then wider infrastructure.",
    },
    {
      type: "p",
      text: "Each stage should have clear stop conditions. A rise in connection failures, latency, unhealthy servers, or resource use should pause the rollout before the change reaches more systems.",
    },
    {
      type: "p",
      text: "The basic rule is simple: a bad change should fail small.",
    },

    {
      type: "h3",
      id: "automatic-rollback",
      text: "2. Make rollback fast and safe",
    },
    {
      type: "p",
      text: "Finding a harmful change is only half the job. Engineers also need a safe way to return to the last known good configuration.",
    },
    {
      type: "p",
      text: "Rollback should be tested before an emergency. A rollback process that exists only in a document may fail when engineers need it most.",
    },

    {
      type: "h3",
      id: "failure-isolation",
      text: "3. Improve failure isolation",
    },
    {
      type: "p",
      text: "Large systems use regions, zones, clusters, cells, or other boundaries to contain faults. A change that harms one group should not easily remove the same type of capacity everywhere.",
    },
    {
      type: "p",
      text: "Good isolation reduces the blast radius and gives operators healthy capacity from which to recover.",
    },

    {
      type: "h3",
      id: "recovery-aware-routing",
      text: "4. Return traffic slowly",
    },
    {
      type: "p",
      text: "A repaired server should not always receive full production traffic at once. Capacity can be warmed in stages.",
    },
    {
      type: "ol",
      items: [
        "Restart or repair the server.",
        "Pass health and dependency tests.",
        "Allow a small share of traffic.",
        "Measure connection success, errors, and latency.",
        "Increase traffic slowly.",
        "Remove the server again if stability falls.",
      ],
    },
    {
      type: "p",
      text: "This approach can prevent a recovered server from failing again as soon as users return.",
    },

    {
      type: "h3",
      id: "protect-secure-connections",
      text: "5. Protect the secure connection path",
    },
    {
      type: "p",
      text: "Microsoft's reports about an overwhelmed secure-connection process are important. A service may have computing power available but still be unusable if new secure sessions cannot be created.",
    },
    {
      type: "p",
      text: "Critical connection components need capacity headroom, saturation monitoring, timeouts, backpressure, resource isolation, and tested recovery behaviour.",
    },

    {
      type: "h3",
      id: "test-cascading-failures",
      text: "6. Test cascading failures",
    },
    {
      type: "p",
      text: "Normal performance tests ask how a service behaves under expected load. Resilience tests ask what happens when part of the system disappears.",
    },
    {
      type: "ul",
      items: [
        "What happens if 30 percent of a server pool suddenly fails?",
        "What happens if secure connection setup becomes slow?",
        "What happens if health checks remove healthy but overloaded servers?",
        "What happens when failed servers return?",
        "What happens if large numbers of clients retry together?",
        "Can one region stay healthy while another region fails?",
      ],
    },
    {
      type: "p",
      text: "These tests can expose dangerous feedback loops before a real incident does.",
    },

    {
      type: "h2",
      id: "customer-actions",
      text: "What should Microsoft 365 customers do differently?",
    },
    {
      type: "p",
      text: "A customer cannot prevent a failure inside Microsoft's global infrastructure. A customer can reduce the business effect of that failure.",
    },
    {
      type: "p",
      text: "That is the difference between service resilience and business resilience.",
    },

    {
      type: "h3",
      id: "independent-communication",
      text: "Keep an independent incident communication channel",
    },
    {
      type: "p",
      text: "If Exchange and Teams are the normal communication tools, they should not also be the only emergency communication tools.",
    },
    {
      type: "p",
      text: "Critical teams should have an approved fallback such as phone, SMS, a separate emergency notification service, or a documented call tree.",
    },
    {
      type: "p",
      text: "The fallback should not depend on the same Microsoft 365 services that the incident team is trying to recover from.",
    },

    {
      type: "h3",
      id: "offline-contacts",
      text: "Keep critical contacts available outside Microsoft 365",
    },
    {
      type: "p",
      text: "An emergency contact list stored only in SharePoint or Exchange may not help when those services cannot be reached.",
    },
    {
      type: "p",
      text: "Key contacts should be available through a secure and approved offline or independent method. This can include IT leaders, cybersecurity, business continuity, telecom providers, internet providers, important vendors, and senior management.",
    },

    {
      type: "h3",
      id: "manual-fallback",
      text: "Define manual fallback procedures",
    },
    {
      type: "p",
      text: "Every critical process should answer one question: what happens if Microsoft 365 is unavailable for one working day?",
    },
    {
      type: "p",
      text: "Purchase approvals, customer support, logistics, plant communication, user onboarding, security response, and executive approvals may all need a basic fallback.",
    },
    {
      type: "p",
      text: "The aim is not to reproduce Microsoft 365 by hand. The aim is to keep the most important business work moving.",
    },

    {
      type: "h3",
      id: "independent-monitoring",
      text: "Monitor Microsoft services independently",
    },
    {
      type: "p",
      text: "Microsoft 365 Service Health is important, but it should not be the only signal used by a large enterprise.",
    },
    {
      type: "p",
      text: "IT teams can combine Microsoft service information with synthetic checks, site network monitoring, help-desk volume, and direct user reports.",
    },
    {
      type: "p",
      text: "A simple independent check from important office locations can tell IT whether users can reach a critical service even before the full cause is known.",
    },

    {
      type: "h3",
      id: "dependency-map",
      text: "Know what depends on Microsoft 365",
    },
    {
      type: "p",
      text: "Many companies know that they use Microsoft 365. They may not know every business process that depends on it. A /microsoft-365-entra-id/microsoft-365-tenant-to-tenant-migration shows how identity, collaboration, data, and recovery choices can cross the same business services.",
    },
    {
      type: "table",
      caption: "Examples of Microsoft 365 dependencies to map",
      head: ["Service", "Possible business dependency"],
      rows: [
        [
          "Exchange Online",
          "Business email, calendars, and automated messages",
        ],
        [
          "Microsoft Teams",
          "Meetings, chat, and calendar-based collaboration",
        ],
        [
          "Microsoft Entra ID",
          "Authentication to Microsoft and connected applications",
        ],
        [
          "Microsoft Graph",
          "Automation, integrations, mail, and calendar workflows",
        ],
        ["SharePoint Online", "Documents, portals, and approval workflows"],
        ["Microsoft Intune", "Cloud endpoint administration"],
        ["Microsoft Defender", "Security investigation and response"],
        [
          "Microsoft 365 Copilot",
          "AI workflows that depend on Microsoft 365 data",
        ],
      ],
    },
    {
      type: "p",
      text: "A dependency map helps the incident team predict which functions may fail next and which business owners need to be informed.",
    },

    {
      type: "h2",
      id: "should-you-leave-microsoft",
      text: "Should companies move away from Microsoft 365?",
    },
    {
      type: "p",
      text: "One large outage is not, by itself, a good reason to replace Microsoft 365.",
    },
    {
      type: "p",
      text: "Every large cloud provider can fail. Moving to another provider changes the failure modes. It does not remove failure.",
    },
    {
      type: "p",
      text: "Running two complete collaboration platforms also creates cost and complexity. A company may need duplicate licenses, security controls, identity processes, retention policies, integrations, monitoring, and user training.",
    },
    {
      type: "p",
      text: "For many enterprises, selective resilience is more practical. Identify the processes that cannot stop and provide an independent fallback only where the business impact justifies it.",
    },

    {
      type: "h2",
      id: "ciso-lessons",
      text: "What CISOs should learn from the outage",
    },
    {
      type: "p",
      text: "Modern security teams rely on cloud control planes too. Identity, email, endpoint management, security alerts, collaboration, and incident communication may all depend on the same supplier.",
    },
    {
      type: "p",
      text: "That creates concentration risk. The risk does not always require a second full cloud platform. It does require an incident plan that works when the primary platform does not.",
    },
    {
      type: "p",
      text: "The same dependency review should be part of a wider /cybersecurity-ciso/iso-27001-microsoft-365-mapping. This links service availability with access control, evidence, incident response, and business continuity.",
    },
    {
      type: "ul",
      items: [
        "Can administrators reach emergency credentials during an outage?",
        "Can the incident team communicate without Teams and Exchange?",
        "Are key phone numbers available outside Microsoft 365?",
        "Which security controls continue working without cloud connectivity?",
        "Can important logs still be accessed?",
        "Can IT distinguish a provider outage from a security attack?",
        "Is there a tested path for communicating with senior management?",
      ],
    },
    {
      type: "p",
      text: "These questions should be tested in an exercise. A written plan alone does not prove that the business can use it.",
    },

    {
      type: "h2",
      id: "practical-checklist",
      text: "A practical Microsoft 365 outage checklist",
    },

    {
      type: "h3",
      id: "before-outage",
      text: "Before an outage",
    },
    {
      type: "ul",
      items: [
        "Map critical Microsoft 365 dependencies.",
        "Agree business impact and outage tolerance with business owners.",
        "Keep emergency contacts outside the primary cloud platform.",
        "Define an independent incident communication method.",
        "Document manual procedures for critical business processes.",
        "Set up independent service monitoring.",
        "Test emergency administrator access.",
        "Review emergency access and exclusions against the /microsoft-365-entra-id/conditional-access-framework.",
        "Train the help desk for major cloud incidents.",
        "Run a Microsoft 365 outage tabletop exercise at least once a year.",
      ],
    },

    {
      type: "h3",
      id: "during-outage",
      text: "During an outage",
    },
    {
      type: "ul",
      items: [
        "Confirm the scope before changing internal systems.",
        "Check Microsoft 365 Service Health.",
        "Compare Microsoft status with independent monitoring.",
        "Record key times, errors, and affected services.",
        "Avoid mass configuration changes made only as experiments.",
        "Activate the fallback communication method if needed.",
        "Tell employees which functions work and which do not.",
        "Give a time for the next status update.",
        "Use one trusted status message to reduce duplicate help-desk tickets.",
        "Watch for phishing messages that use the outage as a lure.",
      ],
    },

    {
      type: "h3",
      id: "after-outage",
      text: "After recovery",
    },
    {
      type: "ul",
      items: [
        "Confirm email queues and delayed messages have cleared.",
        "Check failed automation and Microsoft Graph workflows.",
        "Review missed approvals and business notifications.",
        "Confirm security alerts and audit feeds are current.",
        "Record the actual business impact.",
        "Update the Microsoft 365 dependency map.",
        "Capture lessons from the incident.",
        "Read Microsoft's final post-incident report when it is published.",
        "Update resilience controls based on the confirmed root cause.",
      ],
    },

    {
      type: "h2",
      id: "main-lesson",
      text: "The main lesson",
    },
    {
      type: "p",
      text: "This incident is not just a story about Outlook going offline.",
    },
    {
      type: "p",
      text: "Modern enterprises gain a great deal from connected cloud services. Email, identity, collaboration, automation, endpoint management, security, and AI can work together as one platform.",
    },
    {
      type: "p",
      text: "The same integration creates shared dependencies.",
    },
    {
      type: "p",
      text: "The answer is not to avoid the cloud. The answer is to understand those dependencies and decide in advance how the business will operate when an important service is unavailable.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "A useful resilience question",
      text: "Ask each business owner: If Microsoft 365 disappeared for one working day, what would stop? The answer tells IT where independent fallback plans matter most.",
    },

    {
      type: "h2",
      id: "what-happens-next",
      text: "What happens next?",
    },
    {
      type: "p",
      text: "Microsoft reported signs of sustained recovery on November 13 and said that email queues were approaching normal levels. Recovery work continued for remaining customers and regions.",
    },
    {
      type: "p",
      text: "A full post-incident report will be important because several technical questions remain. We need to know the exact change that exposed the issue, why the secure-connection process became overwhelmed, how widely the change was deployed, and why restored servers became unstable under traffic.",
    },
    {
      type: "p",
      text: "We also need to know which safeguards worked, which did not, and what Microsoft will change to stop the same type of incident from happening again.",
    },
    {
      type: "p",
      text: "Until that report is available, the safest conclusion is also the simplest: Microsoft is responsible for the resilience of its cloud platform. Customers are responsible for planning how their businesses continue when that platform fails.",
    },
  ],

  faq: [
    {
      question: "What caused the Microsoft 365 outage in November 2026?",
      answer:
        "Microsoft said the incident was introduced during an earlier network capacity upgrade and surfaced after a recent network change. The company also reported overwhelmed secure-connection processes and unexpectedly unavailable servers. A full post-incident report is still needed for the complete root-cause chain.",
    },
    {
      question: "Was the Microsoft outage caused by a cyberattack?",
      answer:
        "Microsoft said it found no evidence of malicious activity associated with the incident and said the event was not related to cyber activity or AI agents.",
    },
    {
      question: "Which Microsoft services were affected?",
      answer:
        "Exchange Online and Outlook were central to the outage. Connected Microsoft 365 services and features were also affected, including parts of Teams, Copilot, SharePoint, Defender, Intune, and other Exchange-dependent functions.",
    },
    {
      question: "Why did Microsoft 365 recovery take so long?",
      answer:
        "Microsoft reported that some restored servers became unresponsive when traffic returned. Engineers had to restore capacity while also controlling load and repairing the underlying infrastructure problem.",
    },
    {
      question: "How can companies prepare for another Microsoft 365 outage?",
      answer:
        "Companies should map critical Microsoft 365 dependencies, maintain an independent emergency communication method, keep critical contacts available outside Microsoft 365, monitor services independently, document manual fallbacks, and test the plan through regular exercises.",
    },
  ],

  sources: [
    {
      title: "Microsoft Outage Latest News: What You Need to Know",
      publisher: "TIME",
      url: "https://time.com/article/2026/11/13/microsoft-outage-worldwide-disruption-teams-outlook-emails/",
    },
    {
      title:
        "Global Microsoft outage affects Outlook and Teams users, with company restarting servers",
      publisher: "The Guardian",
      url: "https://www.theguardian.com/technology/2026/nov/13/microsoft-outage-outlook-teams-word-excel-reports",
    },
    {
      title:
        "Microsoft's Outlook Outage Is in Its 2nd Day. Here's What We Know.",
      publisher: "Business Insider",
      url: "https://www.businessinsider.com/microsoft-365-outage-outlook-teams-down-claude-what-we-know-2026-11",
    },
    {
      title:
        "Microsoft outage hits companies and governments worldwide as it struggles to restore services",
      publisher: "Associated Press via Spectrum News",
      url: "https://ny1.com/nyc/all-boroughs/ap-top-news/2026/11/13/microsoft-outage-hits-companies-and-governments-worldwide-as-it-struggles-to-restore-services",
    },
    {
      title: "Microsoft hit by global outages: What happened and why?",
      publisher: "Al Jazeera",
      url: "https://www.aljazeera.com/news/2026/11/13/microsoft-hit-by-global-outages-what-happened-and-why",
    },
  ],
};