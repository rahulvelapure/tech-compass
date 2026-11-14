import type { Article } from "../../types";

export const article: Article = {
  slug: "microsoft-365-outage-november-2026-admin-plane",
  category: "cybersecurity-ciso",
  contentType: "analysis",
  subcategory: "Resilience",

  title: "Microsoft 365 Outage, November 2026: When Your Admin Tools Fail With the Service",
  seoTitle: "Microsoft 365 Outage November 2026: Resilience Lessons for IT",
  metaDescription:
    "Interim analysis of the 12 November 2026 Microsoft 365 outage. What is confirmed, what is not, and how IT leaders can keep work moving when tools fail.",
  standfirst:
    "The 12 November 2026 Microsoft 365 outage was more than an email problem. Mail, chat, security alerts and device management share one cloud. Here is what we know, what we do not, and what to fix in your own plan.",
  excerpt:
    "An interim, fact-separated analysis of the November 2026 Microsoft 365 outage, with a practical resilience plan for admins and CISOs.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-14",
  lastReviewedAt: "2026-11-14",
  nextReviewAt: "2026-11-21",

  readingMinutes: 14,

  primaryKeyword: "Microsoft 365 admin plane resilience",

  secondaryKeywords: [
    "Microsoft 365 outage lessons",
    "Exchange Online outage",
    "Intune outage",
    "break-glass accounts",
    "Microsoft 365 business continuity",
  ],

  tags: [
    "Microsoft 365",
    "Exchange Online",
    "Intune",
    "Defender",
    "Outage",
    "Resilience",
    "Incident response",
    "Business continuity",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "microsoft-365-outage-november-2026",
    "conditional-access-break-glass-accounts",
    "conditional-access-framework",
    "iso-27001-microsoft-365-mapping",
  ],

  draft: false,

  methodology:
    "Interim analysis based on public reporting and Microsoft statements as quoted by media between 12 and 14 November 2026. Microsoft service health records and Microsoft 365 Status posts were not accessed directly, so the wording of vendor statements is as reported by the outlets listed. Some details on partial feature impact and recovery steps come from a single secondary write-up and are marked as reported. No Microsoft post-incident report was available at the time of writing. Engineering analysis is labelled as analysis and is not a root cause finding. Emergency access guidance is taken from Microsoft Learn. This article is set for review when Microsoft publishes its report.",

  body: [
    {
      type: "p",
      text: "The November 2026 Microsoft 365 outage has already been covered from the service-failure and business-continuity angle. This analysis looks at a narrower problem: what happens when the cloud tools used to investigate and manage an incident are affected at the same time as the service itself.",
    },
    {
      type: "p",
      text: "For the broader incident timeline, recovery behaviour and business impact, read [Microsoft 365 Outage of November 2026](/microsoft-365-entra-id/microsoft-365-outage-november-2026). Here, the focus is the admin plane: Intune, security visibility, emergency access, communications and the controls IT teams need when their normal management path is weak.",
    },

    {
      type: "h2",
      id: "short-version",
      text: "The short version",
    },
    {
      type: "p",
      text: "On 12 November 2026, a Microsoft 365 incident began with Exchange Online mailbox failures and then spread. Microsoft's list of affected services grew to include Teams, SharePoint Online, Copilot, Defender and Intune. Reports differ on the start time and on how long full recovery took. They agree that it lasted most of a day or longer.",
    },
    {
      type: "p",
      text: "As of 14 November 2026, I could not find a post-incident report from Microsoft. That matters. Everything below is interim analysis built on public statements and independent reports. It is not a root cause analysis.",
    },
    {
      type: "p",
      text: "My angle is simple. This was not only an email outage. Admins said that the tools they use to find and fix problems were hit too. When mail, chat, security alerts and device management share one cloud, one bad day can take away your ability to see and your ability to act at the same time.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Interim analysis",
      text: "Microsoft has promised a full post-incident report. This article will be reviewed when that report is out. Treat every statement about cause as Microsoft's wording, not as a proven engineering finding.",
    },

    {
      type: "h2",
      id: "what-is-confirmed",
      text: "What is confirmed so far",
    },
    {
      type: "p",
      text: "Incident coverage mixes facts, vendor statements and guesses. I keep them apart. Here is what several outlets and Microsoft's public statements agree on.",
    },
    {
      type: "ul",
      items: [
        "The incident began on 12 November 2026 and hit Exchange Online first. Early reports said mailbox access failed for users in the Americas.",
        "Impact then grew. Microsoft said users in any region could be affected, and it listed services that rely on Exchange Online.",
        "Media reports listed Teams, SharePoint Online, Copilot, Defender XDR, Defender for Office 365, Purview, Intune, Planner, To Do and Power BI. One write-up also listed Universal Print.",
        "Microsoft said affected servers were failing automated health checks and dropping out of service.",
        "Microsoft tested a configuration change and restarted affected servers. Some came back. Microsoft then warned that restored servers could stop responding again once traffic returned.",
        "Microsoft later said the incident was not caused by cyber activity or by AI agents. It said the issue was introduced during an earlier network capacity upgrade and came to light after a recent network change.",
        "Microsoft apologised and said a full post-incident report would follow once its review is done.",
      ],
    },
    {
      type: "p",
      text: "Some details are not settled. Start times in public reports range from about 16:17 UTC to about 18:26 UTC. Outlets cite more than one incident record, such as EX1550543 and MO1550821, and that may explain part of the gap. I would not publish a precise timeline until Microsoft's report fixes it. Duration claims also vary, from about 18 hours to a full day.",
    },

    {
      type: "h2",
      id: "partial-impact",
      text: "Up, but not working: how the impact looked",
    },
    {
      type: "p",
      text: "One of the most useful details is that the impact was uneven. According to one write-up, some Teams features kept working, such as core chat and online meetings in some updates. The same write-up said files stored in SharePoint Online could still be opened, while features that relied on Exchange Online did not behave as expected.",
    },
    {
      type: "p",
      text: "I could not confirm that detail in Microsoft's own wording, so treat it as reported. It fits what Microsoft said about services that rely on Exchange Online.",
    },
    {
      type: "p",
      text: "The point for IT leaders is this. A product can be up while one of its features is broken. A meeting may start, but the calendar details may not load. A file may open, but a sharing step may fail. A status page that says a service is available does not tell you what your staff can finish.",
    },

    {
      type: "h2",
      id: "how-the-explanation-changed",
      text: "How the explanation changed",
    },
    {
      type: "p",
      text: "Watch the wording of the status updates. It changed in stages, and each stage tells you something different.",
    },
    {
      type: "table",
      caption: "How Microsoft's public explanation developed, as reported by secondary sources",
      head: ["Stage", "What Microsoft said", "What it tells an admin"],
      rows: [
        [
          "Early",
          "Servers are failing automated health checks and becoming unavailable.",
          "A symptom. It says what servers did, not why.",
        ],
        [
          "Early",
          "No recent change lines up with the start of impact. The failed health checks may come from a component that handles server health.",
          "Microsoft was still narrowing the search. Do not treat this as a cause.",
        ],
        [
          "Mid",
          "A configuration change was being tested and affected servers were being restarted.",
          "Fix attempts. They are not proof of the cause.",
        ],
        [
          "Mid",
          "Restored servers could stop responding again once they got traffic.",
          "Recovery was fragile. A few green minutes did not mean stable.",
        ],
        [
          "Later",
          "The issue came from an earlier network capacity upgrade and showed up after a recent network change. Not cyber, not AI or agents.",
          "The first stated cause. Still short of a full post-incident report.",
        ],
      ],
    },
    {
      type: "p",
      text: "One write-up also says Microsoft reviewed a recent network change and began to reverse it. Another says Microsoft moved traffic, limited some connections and changed a component that handles sign-in and routing. I could not confirm those steps in Microsoft's words, so I leave them out of the table.",
    },
    {
      type: "p",
      text: "Early status text is a working note, not a finding. For a CISO the lesson is easy to state. Do not write a board note on the first explanation. Wait for the post-incident report, and mark every earlier statement as provisional.",
    },

    {
      type: "h2",
      id: "what-is-still-unknown",
      text: "What is still unknown",
    },
    {
      type: "ul",
      items: [
        "Which network capacity upgrade and which network change are involved.",
        "Why the fault stayed hidden until the later change.",
        "Why restored servers failed again under traffic.",
        "The exact start time, end time and regional impact.",
        "Which tenants had which features down, and for how long.",
        "What Microsoft will change to stop a repeat, including change control and safeguards.",
      ],
    },
    {
      type: "p",
      text: "I will not guess at these. Engineering analysis is useful, but it must be labelled. Where I give my own reading of the pattern below, I say so.",
    },

    {
      type: "h2",
      id: "admin-plane",
      text: "Why this is not just an email story",
    },
    {
      type: "p",
      text: "Many teams describe a Microsoft 365 incident by its loudest symptom. Email is down. Teams is slow. That hides the bigger problem.",
    },
    {
      type: "p",
      text: "The Register reported that admins could not reach Intune or the Microsoft 365 Apps Admin Center during the incident. Other coverage listed Defender XDR and Defender for Office 365 among the affected services. Features that did not rely on Exchange Online reportedly kept working.",
    },
    {
      type: "p",
      text: "Think about what that means in a real company. The tools you use to investigate, to talk to staff and to fix things were weak at the same time as the thing you needed to fix.",
    },
    {
      type: "p",
      text: "I call this the admin plane problem. The admin plane is the set of tools your team uses to run and protect your estate. In a Microsoft-first company, that plane is mostly Microsoft cloud services. That is efficient on a good day. On a bad day it is a single point of failure.",
    },
    {
      type: "p",
      text: "This is not an argument against Microsoft 365. It is an argument for knowing what you rely on before the incident, not during it.",
    },

    {
      type: "h2",
      id: "map-tasks-not-apps",
      text: "Map your work, not your apps",
    },
    {
      type: "p",
      text: "A list of apps will not help much here. Staff do not think in apps. They think in jobs. Take orders. Pay a supplier. Ship goods. Answer a call. Block a threat.",
    },
    {
      type: "p",
      text: "So start with the jobs that keep the business running. Ask each team to name its top five. For each job, write down every service it needs. Include mail, sign-in, files, network, phones, printers and third-party apps.",
    },
    {
      type: "p",
      text: "Then ask one question. What happens to this job if one of these services is gone for four hours?",
    },
    {
      type: "p",
      text: "Many teams find that mail is the glue for things they never listed. Look for these.",
    },
    {
      type: "ul",
      items: [
        "Security alerts. Defender and other tools often notify by email. If mail is down, alerts may arrive late or not at all. Some reports from this incident advised checking for delayed Defender alerts after recovery.",
        "Tickets and approvals. Service desk tools and approval flows often start from a mailbox.",
        "User notices. Some password reset and sign-in steps send links or codes by email.",
        "Automation. Power Automate flows, scheduled reports and scripts that send results by mail.",
        "Vendor and customer contact. Shared mailboxes for supply chain, finance and support.",
        "Incident messages. Teams and mail are the usual way to tell staff what is going on.",
      ],
    },
    {
      type: "p",
      text: "Then do the same for Intune. If Intune is weak, what happens to policy sync, app installs and compliance reports? What happens to access rules that need a compliant device? I cannot answer that for your tenant. You can, but only by testing.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Run it as a tabletop",
      text: "Pick a quiet morning. Say that Exchange Online and the admin centers are down for eight hours. Ask each team lead to write what they can still do, what they cannot do, and who they would call. Thirty minutes is enough to find real gaps.",
    },

    {
      type: "h2",
      id: "break-glass",
      text: "Break-glass accounts: what they fix and what they do not",
    },
    {
      type: "p",
      text: "After an incident like this, someone will say that break-glass accounts mean the organisation is covered. They are essential, but their purpose is narrower. The [break-glass account guidance](/microsoft-365-entra-id/conditional-access-break-glass-accounts) is about retaining emergency administrative access when the normal identity path fails.",
    },
    {
      type: "p",
      text: "Microsoft's guidance says emergency access accounts protect you from being locked out of your Microsoft Entra tenant. Microsoft advises at least two such accounts, and says to exclude them from Conditional Access policies that block or limit sign-in. A third-party guide that follows this adds a check at least every 90 days and an alert on every sign-in.",
    },
    {
      type: "p",
      text: "That is the right control for an identity lockout. It is not the right control for a service outage.",
    },
    {
      type: "p",
      text: "If Exchange Online servers fail health checks, a Global Administrator account does not bring them back. An admin who signs in with a break-glass account sees the same weak service. If the admin centers are down, the account may have nowhere useful to go.",
    },
    {
      type: "p",
      text: "So treat break-glass as one layer. It answers the question, can we get into the tenant when sign-in fails? It does not answer the question, can we run the business when a core service fails?",
    },
    {
      type: "p",
      text: "Microsoft also has guidance on a resilient access control plan for Entra ID. It splits admin lockout from user lockout. That split helps. This incident was neither. It was a service outage. Your plan needs a third box for it.",
    },
    {
      type: "p",
      text: "Emergency access also needs to fit the wider [Conditional Access framework](/microsoft-365-entra-id/conditional-access-framework). The goal is not simply to create powerful accounts. It is to ensure that emergency access remains available, monitored and tightly controlled.",
    },

    {
      type: "h2",
      id: "reading-status-updates",
      text: "How to read vendor status updates",
    },
    {
      type: "p",
      text: "I read vendor status pages the way I read a monitoring alert. The first message is a symptom. The cause comes later, if it comes at all. Use these rules during a live event.",
    },
    {
      type: "ol",
      items: [
        "Write down each update with its time. You will need the order for your own report.",
        "Label each statement as symptom, fix attempt, cause or recovery.",
        "Do not copy an early statement into an exec update as fact. Write, Microsoft reports.",
        "Note when the vendor narrows or drops a statement. That is useful information.",
        "Keep your own data. Measure what your users and services see, not only what the status page says.",
        "Treat green as provisional until it has held under normal load.",
      ],
    },
    {
      type: "p",
      text: "The last rule matters here. Microsoft itself warned that restored servers could stop responding again once traffic came back. A server that works at rest and fails under load often points to a deeper fault.",
    },
    {
      type: "p",
      text: "Microsoft's later explanation fits that pattern. A hidden fault from an earlier capacity upgrade came to light after a network change. That is my reading of public statements. It is analysis, not a confirmed account.",
    },

    {
      type: "h2",
      id: "security-angle",
      text: "The security angle",
    },
    {
      type: "p",
      text: "Microsoft said the incident was not a cyberattack and that it saw no sign of harmful activity. That should be your working view curity risk. Not because someone caused it, but because of what it does to your defences.",
    },
    {
      type: "ul",
      items: [
        "Detection gaps. If Defender alerts or logs were late, you may have a window with less visibility. Check after recovery.",
        "Late mail. Queued mail can arrive in bursts. Review quarantine and mail flow records for the window, including anything released late.",
        "Social engineering. Staff who cannot get mail may follow an odd request that comes by phone or chat. Outages create urgency, and attackers know it. I have no evidence of this in this event. It is a standard risk to plan for.",
        "Emergency changes. Teams under pressure make quick exceptions. Exclusions, temporary admin rights and disabled policies tend to stay. Track each one and undo it.",
        "Notice duties. If you must tell a regulator or customer about an event, check whether the outage hurt your ability to do so.",
      ],
    },
    {
      type: "p",
      text: "Do not weaken a security control just to get people working again. Any emergency change needs an owner, a reason, an approval and a record. Remove temporary access when the event ends.",
    },

    {
      type: "h2",
      id: "intune-questions",
      text: "Intune and device management during an outage",
    },
    {
      type: "p",
      text: "Many readers manage devices with Intune. Media reports said Intune was among the affected services, and Microsoft described it as potentially affected. I have not found a public statement of exactly which Intune functions failed.",
    },
    {
      type: "p",
      text: "So here I can give you questions, not answers. Test each one on a pilot group before you need the answer.",
    },
    {
      type: "ul",
      items: [
        "Do devices keep enforcing the policies they already have when the service cannot be reached?",
        "What happens to new enrolments, Autopilot setups and app installs while the service is weak?",
        "If Conditional Access needs a compliant device, what do users see when compliance cannot be refreshed?",
        "Can you push an urgent change, such as blocking a risky app, by another route?",
        "Who can approve and deploy an emergency fix if the admin center cannot be reached?",
      ],
    },
    {
      type: "p",
      text: "One report advised admins to check pending Intune policy syncs after recovery. That is sensible. Compare device check-in times and policy status before and after the window. Look for devices that missed key changes.",
    },

    {
      type: "h2",
      id: "reach-staff",
      text: "Reach staff when Teams and mail are both weak",
    },
    {
      type: "p",
      text: "Your incident plan probably says, tell staff by email and Teams. That fails in exactly this case.",
    },
    {
      type: "p",
      text: "Pick backup channels now. They must not depend on the same cloud service that is failing.",
    },
    {
      type: "ul",
      items: [
        "A status page or notice hosted outside Microsoft 365.",
        "SMS or a mass notice tool for the incident team and key managers.",
        "A contact list stored offline and checked every quarter.",
        "A phone bridge for the incident team, with a number everyone knows.",
        "A named person who owns messages to customers.",
      ],
    },
    {
      type: "p",
      text: "Microsoft-native tools are the right default for daily work. For incident messages, independence matters more than neatness. A backup that shares the same failure is not a backup.",
    },
    {
      type: "p",
      text: "Write the first messages before you need them. Each one should say what is affected, what staff should do, where to get news and when the next update will come. Even a short note, sent on time, calms a floor of worried staff.",
    },
    {
      type: "p",
      text: "Give the roles clear names. One person leads. One person owns staff updates. One person owns customer messages. IT shares facts in plain words and avoids guesses.",
    },

    {
      type: "h2",
      id: "manual-workarounds",
      text: "Agree safe ways to keep work moving",
    },
    {
      type: "p",
      text: "Not every job needs a full digital system to carry on. For a few hours, some jobs can run on a safe manual process.",
    },
    {
      type: "p",
      text: "A sales team may log urgent orders on an approved offline form. A finance team may keep a controlled log for payments that cannot wait. A service desk may take calls on a separate phone line.",
    },
    {
      type: "p",
      text: "These steps must be agreed in advance, and they must protect company and customer data. For each one, write down the following.",
    },
    {
      type: "ul",
      items: [
        "Who can start it.",
        "Which form or tool staff must use.",
        "Where the records are kept.",
        "Who checks and approves the work.",
        "How the records are entered into the real system later.",
        "How the team checks for errors and double entries.",
      ],
    },
    {
      type: "p",
      text: "Do not let staff fall back on personal email or file-sharing sites they picked themselves. A quick fix today can become a data leak or a record-keeping problem next month.",
    },

    {
      type: "h2",
      id: "ciso-questions",
      text: "Questions a CISO should ask",
    },
    {
      type: "p",
      text: "Take these to your leadership team now, and to your Microsoft account team once the report is out.",
    },
    {
      type: "ol",
      items: [
        "Which key business jobs stop when Exchange Online is down?",
        "Which security alerts reach us only by email?",
        "Can we reach our admin tools and our logs if the Microsoft 365 admin centers are down?",
        "Do we have a way to message staff that sits outside the Microsoft 365 tenant?",
        "What does the post-incident report say about the trigger, the time taken to spot it and the safeguards being added?",
        "What does the service level agreement give us for this event, and what proof do we need to keep?",
        "What is our recovery target for a day-long Microsoft 365 outage, and is it realistic?",
        "Who decides when we switch to manual steps, and what triggers that call?",
      ],
    },

    {
      type: "h2",
      id: "thirty-day-plan",
      text: "A practical 30-day plan",
    },
    {
      type: "p",
      text: "You do not need a big programme. You need a few clear steps, each with an owner.",
    },
    {
      type: "ol",
      items: [
        "Week 1: Map the top jobs in each team to the services they need. Include alerts, tickets, approvals and automation.",
        "Week 1: Review the incident in your own tenant. Check service health history, mail flow records, Defender alert delivery and Intune check-in data for 12 and 13 November.",
        "Week 2: Test your emergency access accounts. Confirm they sign in, that each sign-in raises an alert, and that the details are stored safely.",
        "Week 2: Set up a backup channel outside Microsoft 365. Test it with the incident team. Write the first outage messages.",
        "Week 3: Agree the manual steps for the jobs that cannot stop. Set rules for approval, data safety and later entry.",
        "Week 3: Find security alerts that depend only on email. Add a second route that does not use mail.",
        "Week 4: Run the eight-hour tabletop. Record what broke and who owned the fix.",
        "Week 4: Brief leadership. Show facts, vendor statements, unknowns and your actions as separate parts. When Microsoft publishes its report, compare it with your plan.",
      ],
    },
    {
      type: "p",
      text: "Repeat the test at least once a year, and after any big change to your systems or your business process.",
    },

    {
      type: "h2",
      id: "what-would-change-this",
      text: "What would change this analysis",
    },
    {
      type: "ul",
      items: [
        "If the report shows a long delay in spotting the fault, the case for independent monitoring gets stronger.",
        "If the admin center and Intune problems had a separate cause from the Exchange problem, I would split the two stories.",
        "If the report names customer controls that would have cut the impact, those move to the top of your list.",
        "If the cause is narrower than the network description suggests, parts of this article will need a fix.",
        "If Microsoft confirms or denies the partial impact details above, I will update that section.",
      ],
    },
    {
      type: "p",
      text: "This article is set for review when the report is out, and changes will be marked.",
    },

    {
      type: "h2",
      id: "closing-view",
      text: "Closing view",
    },
    {
      type: "p",
      text: "Cloud outages will happen. Microsoft's scale is big and its engineering is strong, and big systems still fail in ways that surprise their builders. The question for a company is not whether to trust the vendor. It is whether you can still work when the vendor has a bad day.",
    },
    {
      type: "p",
      text: "The best response is not panic and not a rush to leave the platform. It is plain preparation. Know what your jobs rely on. Keep a separate way to talk to people. Keep a second way to get key alerts. Test your emergency access. Wait for the facts before you name a root cause.",
    },
    {
      type: "p",
      text: "That work costs little. A day without mail, chat, alerts and device control costs much more.",
    },
  ],

  faq: [
    {
      question: "What caused the Microsoft 365 outage on 12 November 2026?",
      answer:
        "Microsoft said the incident was not a cyberattack and was not related to AI agents. It said the issue was introduced during an earlier network capacity upgrade and came to light after a recent network change. Earlier updates described servers failing automated health checks. A full post-incident report had not been published when this article was written.",
    },
    {
      question: "Which services were affected?",
      answer:
        "Media reports listed Exchange Online, Teams, SharePoint Online, Copilot, Defender XDR, Defender for Office 365, Purview, Intune, Planner, To Do and Power BI. The impact varied by feature. Check your own service health history for what your tenant saw.",
    },
    {
      question: "Did all Teams and SharePoint features stop working?",
      answer:
        "One write-up said some Teams features, such as core chat and meetings, kept working in some updates, and that files stored in SharePoint Online could still be opened. Features that relied on Exchange Online were hit. I could not confirm this in Microsoft's own words, so treat it as reported.",
    },
    {
      question: "Was Intune affected by the outage?",
      answer:
        "Microsoft and media reports listed Intune among the services that could be affected, and The Register reported that admins could not reach Intune or the Microsoft 365 Apps Admin Center. Public statements did not detail which Intune functions failed. Check your own tenant data for 12 and 13 November.",
    },
    {
      question: "Do break-glass accounts protect us from an outage like this?",
      answer:
        "Not directly. Emergency access accounts protect against admin lockout in Microsoft Entra ID. They do not bring back a failed service such as Exchange Online. Keep them, test them, and plan separately for service outages.",
    },
    {
      question: "How can we reach staff if Outlook and Teams are down?",
      answer:
        "Keep an approved backup channel, such as SMS, phone calls or a status page hosted outside Microsoft 365. Store contact details outside Microsoft 365 and test the process at least once a year.",
    },
    {
      question: "What should we check in our tenant after the outage?",
      answer:
        "Review service health history, mail flow and quarantine records for the incident window, Defender alert delivery, and Intune device check-in and policy status. Also review any emergency changes your team made and undo the ones you no longer need.",
    },
    {
      question: "Will this article be updated?",
      answer:
        "Yes. It is marked as interim analysis and is set for review when Microsoft publishes its post-incident report. Any change to the facts or the analysis will be marked.",
    },
  ],

  sources: [
    {
      title: "Microsoft struggling to fix massive cloud outage that's taken down email and Intune",
      publisher: "The Register",
      url: "https://www.theregister.com/saas/2026/11/12/microsoft-struggling-to-fix-massive-cloud-outage-thats-taken-down-email-and-intune/5309531",
    },
    {
      title: "Microsoft Deploys Configuration Patch to Stabilize Global Microsoft 365 Outage",
      publisher: "Petri",
      url: "https://petri.com/microsoft-deploys-patch-stabilize-microsoft-365-outage/",
    },
    {
      title: "Microsoft apologizes for outage affecting Outlook, Teams, and Microsoft 365",
      publisher: "Windows Central",
      url: "https://www.windowscentral.com/microsoft/we-are-deeply-sorry-microsoft-apologizes-for-major-outage-that-knocked-outlook-teams-and-microsoft-365-offline-for-24-hours-insists-it-wasnt-ai-that-caused-it",
    },
    {
      title: "Microsoft 365 Massive Outage - Fixes Fail as Restored Servers Keep Going Unresponsive",
      publisher: "Cyber Security News",
      url: "https://cybersecuritynews.com/microsoft-365-massive-outage-fixes-fail-as-restored-servers-keep-going-unresponsive/",
    },
    {
      title: "Microsoft outage live: Outlook and Teams returning to normal levels as tech giant says there is no indication of cyberattack",
      publisher: "TechRadar",
      url: "https://www.techradar.com/news/live/outlook-outage-nov-2026",
    },
    {
      title: "Microsoft 365 Outage (Nov 2026): What We Know About the Root Cause and What IT Admins Should Learn",
      publisher: "DEV Community",
      url: "https://dev.to/epifive/microsoft-365-outage-nov-2026-what-we-know-about-the-root-cause-and-what-it-admins-should-learn-4hld",
    },
    {
      title: "Manage emergency access accounts in Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/active-directory/roles/security-emergency-access",
    },
    {
      title: "Create a resilient access control management strategy with Microsoft Entra ID",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/entra/identity/authentication/concept-resilient-controls",
    },
    {
      title: "Break-glass (emergency access) accounts in Microsoft Entra ID",
      publisher: "Start with Identity",
      url: "https://startwithidentity.com/recipes/entra-break-glass-accounts/",
    },
  ],
};