import type { Article } from "../../types";

export const article: Article = {
  slug: "win32-app-supersedence-dependencies",
  category: "microsoft-intune",
  subcategory: "App delivery",
  title: "Win32 app supersedence and dependencies: how the relationships actually behave",
  seoTitle: "Intune Win32 Supersedence and Dependencies Explained",
  metaDescription:
    "Supersedence needs explicit targeting and dependencies do not. What that difference causes, how update differs from replacement, and where the two collide.",
  standfirst:
    "One of these relationships installs things you never targeted. The other silently does nothing unless you target it. Knowing which is which explains most of the surprises.",
  excerpt:
    "Dependencies and supersedence look like two ways of relating apps. They follow different targeting rules, resolve in different orders, and produce a documented conflict state when combined carelessly.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-13",
  readingMinutes: 8,
  primaryKeyword: "intune win32 app supersedence",
  secondaryKeywords: [
    "intune app dependencies",
    "uninstall previous version intune",
    "intune supersedence not working",
    "intune app update vs replacement",
  ],
  tags: ["Intune", "Windows", "Endpoint Management", "App delivery", "Enterprise IT"],
  reviewStatus: "research-based",
  methodology:
    "Written from Microsoft's published Win32 app supersedence and app deployment documentation, including the documented behaviour matrix, scenario cases and stated relationship limits. Targeting rules, uninstall behaviour, retry logic, graph limits and the documented dependency and supersedence conflict cases are taken from those sources and cited below. Where the article recommends a design approach rather than describing documented behaviour, it says so. No customer environment is described.",
  body: [
    {
      type: "p",
      text: "Dependencies and supersedence both express a relationship between two applications, and the admin center presents them as adjacent steps in the same wizard. That framing invites people to treat them as variations of one idea. They are not, and the difference that matters most is not in the interface at all.",
    },
    {
      type: "p",
      text: "**Dependencies do not require targeting. Supersedence does.** Microsoft's documentation states this directly, and calls it a direct contrast between the two features. Almost every confusing behaviour in this area comes back to that one line.",
    },

    {
      type: "h2",
      id: "targeting-rule",
      text: "The targeting rule, and what it causes",
    },
    {
      type: "p",
      text: "A dependency is a prerequisite. If app A depends on app B, and A is assigned to a device, B is installed first whether or not B is assigned to anything. That is the point: you should not have to target a runtime, a redistributable or a framework separately just because something else needs it.",
    },
    {
      type: "p",
      text: "Supersedence is the opposite. Microsoft states that superseding apps do not get automatic targeting, that each app must have explicit targeting to take effect, and that **superseding apps that aren't targeted are ignored by the agent**. Create a beautifully constructed supersedence relationship, assign nothing, and precisely nothing happens.",
    },
    {
      type: "p",
      text: "This is the number one cause of \"supersedence isn't working\". The relationship is correct, the toggle is right, and the new app was never assigned to anyone. There is no error, because from the agent's point of view there is nothing to do.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The superseded app does not need targeting",
      text: "The asymmetry goes one level further. If the superseding app is targeted to a device that has the superseded app, supersedence takes place regardless of whether the superseded app has targeting. So an old version that was assigned years ago and later unassigned can still be uninstalled by a supersedence relationship — and because only targeted apps show install statuses in the admin center, the app doing the uninstalling may be the only one you can see.",
    },

    {
      type: "h2",
      id: "update-vs-replacement",
      text: "Update or replacement — one toggle, two behaviours",
    },
    {
      type: "p",
      text: "When you add a superseded app, you set **Uninstall previous version** for it. That single toggle selects between two documented scenarios.",
    },
    {
      type: "table",
      caption: "The documented meaning of the uninstall toggle",
      head: ["Setting", "Microsoft's scenario", "What happens on the device"],
      rows: [
        [
          "**Off** — app update",
          "You want to update an app with a newer version of the same app.",
          "The superseding app's installer handles the upgrade. Intune sends no uninstall command. Whether the old version disappears is entirely down to the installer's own behaviour.",
        ],
        [
          "**On** — app replacement",
          "You want to replace an app with an entirely different app.",
          "Intune uninstalls the superseded app using its configured uninstall command line, then installs the superseding app.",
        ],
      ],
    },
    {
      type: "p",
      text: "The decision is really a question about the installer, not about your intent. If the vendor's MSI upgrades in place — most well-behaved ones do — leave the toggle off and let it. If you are moving from one product to another, or from a vendor's own packaging to a repackaged build that will not upgrade cleanly over the top, turn it on.",
    },
    {
      type: "p",
      text: "Turning it on when the installer would have upgraded in place is not harmless. You have converted a single in-place upgrade into an uninstall followed by an install, which widens the window where the user has no working application and introduces a second command line that has to be correct.",
    },

    {
      type: "h2",
      id: "replacement-stall",
      text: "The replacement chain that stalls",
    },
    {
      type: "p",
      text: "This is the behaviour I would most want an engineer to know before enabling the uninstall toggle across a fleet, and it follows directly from Microsoft's documented resolution for the replacement case.",
    },
    {
      type: "p",
      text: "When the superseded app is present and the relationship is a replacement, the agent uninstalls the old app, waits until it detects the old app is no longer present, and only then installs the new one. Microsoft states the consequence plainly: **if detection continues to detect the old app as present, the agent will not install the new one.**",
    },
    {
      type: "p",
      text: "So a detection rule that is slightly too loose on the old app — matching a leftover folder, an orphaned registry key, a shared component the uninstaller deliberately leaves behind — does not cause a cosmetic reporting problem. It leaves the device with the old app uninstalled and the new one never installed. The user has no application at all, and the console shows an install that has not completed rather than an error.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Check the old app's detection rule before enabling replacement",
      text: "Before turning on **Uninstall previous version**, uninstall the old app manually on a test machine and confirm its own detection rule then returns false. If the rule still matches after a clean uninstall, fix the rule first. This is the check that prevents the stalled-replacement failure, and it takes about five minutes.",
    },

    {
      type: "h2",
      id: "collisions",
      text: "Where the two relationships collide",
    },
    {
      type: "p",
      text: "Both relationship types can exist in the same app graph, and Microsoft documents that enforcement prefers supersedence over dependency — but that genuine conflicts are reported rather than silently resolved. Three documented cases are worth knowing:",
    },
    {
      type: "ul",
      items: [
        "**A depends on B, and C supersedes B.** A reports a conflict state. The dependency points at an app that something else is replacing, and Intune will not guess.",
        "**A depends on B, and C replaces A.** C installs and A is replaced — but B is left behind. The dependency was satisfied for an app that no longer exists, and nothing cleans it up.",
        "**A depends on both B and C, and B supersedes C.** Supersedence does not go through. The graph is contradictory: one prerequisite is meant to replace another prerequisite of the same app.",
      ],
    },
    {
      type: "p",
      text: "The middle case is the one that quietly accumulates. Replace enough apps over a few years and you are left with a collection of runtimes and redistributables that were installed as prerequisites for applications nobody has anymore. None of it is broken. All of it is attack surface and patching obligation that no longer has a reason to exist, and no report will point at it because from Intune's perspective every one of those installs succeeded.",
    },

    {
      type: "h2",
      id: "limits",
      text: "The limits that shape the design",
    },
    {
      type: "p",
      text: "Supersedence allows a maximum of **10 nodes in a relationship**, and the counting is less generous than it sounds. Microsoft's wording is that there is a maximum of 10 updated or replaced apps *including references to other apps* — if your app references another app, which references others, that creates a graph, and every app in the graph counts toward the limit of 10.",
    },
    {
      type: "p",
      text: "In practice this rules out the tempting pattern of chaining every historical version: v1 superseded by v2, superseded by v3, and so on. That chain hits the ceiling in a couple of years, and each new version makes the graph one node deeper. The alternative that scales is to have the current version supersede the specific older versions that are actually still out there, and to retire relationships for versions that no longer exist on any device.",
    },
    {
      type: "p",
      text: "Dependencies have a different constraint. Each dependency follows the standard Win32 retry logic — three install attempts, five minutes apart — and the global re-evaluation cadence of roughly 24 hours. If you choose not to set a dependency to **Automatically install**, the app installation is not attempted at all, and reporting shows the dependency flagged as failed with a reason.",
    },
    {
      type: "p",
      text: "One user-facing consequence worth knowing before support asks: if an app has dependencies, or is itself a dependency of something else, the Company Portal does not show an uninstall button for it — even when **Allow available uninstall** is set to Yes. Dependencies are also not applicable when uninstalling an app, so removal does not walk the graph backwards.",
    },

    {
      type: "h2",
      id: "in-place",
      text: "When not to use supersedence at all",
    },
    {
      type: "p",
      text: "Supersedence is not the only way to move an estate to a newer build, and it is not always the cheapest. Microsoft documents an in-place app update as the alternative: swap the app content, update the metadata, and change the detection and install commands on the existing app object.",
    },
    {
      type: "table",
      caption: "Choosing between an in-place update and a supersedence update",
      head: ["Consideration", "In-place update", "Supersedence"],
      rows: [
        [
          "What you can change",
          "Content, metadata, detection and install commands only — nothing stored outside the app object.",
          "The app in its entirety, with a completely new set of configurations.",
        ],
        [
          "Targeting",
          "Cannot be changed at the same time as the update.",
          "New app object, so targeting is set independently.",
        ],
        [
          "Scale of operation",
          "One app at a time.",
          "One configuration can move devices carrying several different versions to the newest.",
        ],
        [
          "Access to the old version",
          "Gone. There is one object and you have changed it.",
          "Retained. The older app object still exists.",
        ],
        ["Uninstall of the old version", "Not applicable.", "Optional, via the uninstall toggle."],
      ],
    },
    {
      type: "p",
      text: "For a routine version bump of a well-behaved MSI where nothing about targeting or configuration changes, an in-place update is simpler and creates no graph to maintain. Reach for supersedence when you genuinely need the old object to survive, when several versions are in the field at once, or when you are replacing rather than upgrading. Microsoft's guidance in both cases is the same and easy to skip: **review the detection rules after either kind of update.**",
    },
    {
      type: "p",
      text: "If auto-update through the Company Portal is part of your plan, note a documented fragility: any application assignment change deletes the component responsible for auto-updating the app, that component cannot be configured manually, and it is only created when the app is installed via the Company Portal by the end user. The practical reading is to settle assignments before deployment rather than adjusting them afterwards.",
    },

    {
      type: "h2",
      id: "common-mistakes",
      text: "Common mistakes",
    },
    {
      type: "ul",
      items: [
        "**Building a supersedence relationship and not assigning the new app.** Untargeted superseding apps are ignored by the agent. Nothing happens and nothing errors.",
        "**Enabling the uninstall toggle when the installer upgrades in place.** You have replaced one upgrade with an uninstall plus an install, and doubled the number of command lines that must be correct.",
        "**Enabling replacement without testing the old app's detection rule.** If the old app is still detected after uninstall, the new one never installs.",
        "**Chaining every historical version.** The whole graph counts toward the 10-node limit.",
        "**Assuming dependencies are cleaned up when an app is replaced.** Documented behaviour is that the dependency is left behind.",
        "**Mixing a dependency and a supersedence on the same app without checking.** A depends on B while C supersedes B produces a documented conflict state.",
        "**Promising users an uninstall button on an app that participates in a dependency.** The Company Portal hides it regardless of the allow-uninstall setting.",
        "**Changing assignments after deployment when relying on Company Portal auto-update.** Assignment changes delete the component that performs it.",
      ],
    },

    {
      type: "h2",
      id: "recommendation",
      text: "Recommendation",
    },
    {
      type: "p",
      text: "Use dependencies for genuine prerequisites and nothing else — runtimes, frameworks, agents that must exist before the payload will run. Their value is precisely that they install without targeting, and that property becomes a liability the moment you use them to express something that is really sequencing or preference.",
    },
    {
      type: "p",
      text: "Use supersedence for version transitions, keep the uninstall toggle off unless the installer genuinely cannot upgrade in place, and treat the old app's detection rule as a prerequisite of enabling it. Keep graphs shallow: current version superseding the versions actually present in the estate, not a historical chain.",
    },
    {
      type: "p",
      text: "Then audit the leftovers periodically, because nothing else will. Dependencies survive the applications that required them, and the only way that surfaces is someone deliberately asking which runtimes are still installed and what still needs them.",
    },
    {
      type: "p",
      text: "Both relationships depend entirely on detection being accurate — the agent decides what to install, what to uninstall and whether a replacement can proceed based on what detection tells it. That is covered in [Win32 app detection rules](/microsoft-intune/win32-app-detection-rules), and the client-side order in which these relationships are resolved is visible in [the Intune Management Extension logs](/microsoft-intune/intune-management-extension-logs).",
    },
  ],
  faq: [
    {
      question: "Why is my Intune supersedence not doing anything?",
      answer:
        "The most common cause is that the superseding app has no assignment. Microsoft documents that superseding apps do not get automatic targeting, that each app must be explicitly targeted, and that untargeted superseding apps are ignored by the agent. This is the opposite of dependencies, which do not require targeting.",
    },
    {
      question:
        "What is the difference between an app update and an app replacement in supersedence?",
      answer:
        "It is the Uninstall previous version toggle. Left off, the superseding app's installer handles the upgrade and Intune sends no uninstall command — this is an app update. Turned on, Intune uninstalls the superseded app using its configured uninstall command and then installs the new one — this is an app replacement.",
    },
    {
      question: "Why did the old app get uninstalled but the new one never install?",
      answer:
        "In a replacement, the agent installs the superseding app only after it detects that the superseded app is no longer present. Microsoft documents that if detection continues to detect the old app, the agent will not install the new one. A detection rule that still matches leftovers after uninstall causes exactly this, leaving the device with neither application.",
    },
    {
      question: "How many apps can be in a supersedence relationship?",
      answer:
        "A maximum of 10 nodes. The limit counts the whole graph, including references to other apps — so a chain where each version supersedes the previous one consumes the budget quickly. Have the current version supersede the specific older versions still present rather than chaining every historical release.",
    },
    {
      question: "Are dependencies removed when the app that needed them is replaced?",
      answer:
        "No. Microsoft documents the case where A depends on B and C replaces A: C installs, A is replaced, and B is left behind. Dependencies are also not applicable when uninstalling an app, so removal does not walk the relationship backwards. Leftover runtimes accumulate unless someone audits them deliberately.",
    },
    {
      question: "Should I use supersedence or an in-place update for a new version?",
      answer:
        "An in-place update is simpler for a routine version bump where targeting and configuration do not change — you swap the content and update the detection and install commands on the existing app. Use supersedence when you need the old app object to survive, when several versions are in the field at once, or when you are replacing one product with a different one. Review detection rules after either.",
    },
  ],
  sources: [
    {
      title: "Add Win32 app supersedence",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/configure-win32-supersedence",
    },
    {
      title: "Add, Assign, and Monitor a Win32 App in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/add-win32",
    },
    {
      title: "Win32 app management in Microsoft Intune",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/win32",
    },
    {
      title: "Troubleshoot Win32 App Issues",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/intune/app-management/deployment/troubleshoot-win32",
    },
  ],
};
