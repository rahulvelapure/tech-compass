import type { Article } from "../../types";
export const article: Article = {
  slug: "20-years-powershell-changed-enterprise-it",
  category: "devops",
  contentType: "analysis",
  subcategory: "Infrastructure as code",

  title: "20 Years of PowerShell: One Idea That Changed IT Forever",

  seoTitle: "20 Years of PowerShell: The Idea That Changed IT",



  metaDescription:
    "PowerShell is 20 years old. Its biggest legacy is not a better command line, but structured, repeatable administration that helped reshape enterprise IT.",

  standfirst:
    "PowerShell did more than give Windows administrators a new shell. It helped turn administration into structured, repeatable automation, and that idea still matters in the cloud and AI era.",

  excerpt:
    "Twenty years after PowerShell 1.0 arrived, its most important contribution is easy to miss. PowerShell changed how administrators interact with systems by making structured objects, automation and discoverability part of everyday Windows management. That design still influences cloud operations, DevOps and modern enterprise IT.",

  heroImage:
    "/images/articles/20-years-powershell-changed-enterprise-it.webp",

  heroImageAlt:
    "PowerShell object pipeline connecting Windows administration, servers, cloud APIs and modern enterprise automation.",

  authorId: "rahul-velapure",

  publishedAt: "2026-11-14",
  lastReviewedAt: "2026-11-14",
  nextReviewAt: "2027-11-14",

  readingMinutes: 11,

  primaryKeyword: "20 years of PowerShell",

  secondaryKeywords: [
    "PowerShell 20th anniversary",
    "PowerShell history",
    "why PowerShell changed Windows administration",
    "PowerShell objects vs text",
    "PowerShell automation",
    "PowerShell remoting",
    "Windows PowerShell vs PowerShell 7",
    "PowerShell enterprise automation",
    "PowerShell security",
    "future of PowerShell",
  ],

  tags: [
    "PowerShell",
    "Windows",
    "Automation",
    "DevOps",
    "Infrastructure as Code",
    "Microsoft",
    "IT Operations",
    "Windows Server",
  ],

  reviewStatus: "research-based",

  relatedSlugs: [
    "graph-api-intune-reporting",
  ],

  draft: false,

  methodology:
    "This article is an independent practitioner analysis of PowerShell's first twenty years. Historical claims are based on Microsoft's PowerShell documentation, Jeffrey Snover's Monad Manifesto, PowerShell's open-source project history, Microsoft Learn documentation for PowerShell remoting and Microsoft Graph PowerShell, and Microsoft's security guidance. The article focuses on PowerShell's architectural and operational influence rather than providing a complete version-by-version history.",

  body: [
    {
      type: "p",
      text: "Twenty years ago, Microsoft released a command-line shell that looked unusual inside Windows. Administrators already had CMD and batch files. Developers had scripting languages. Windows also had WMI, COM and several administrative tools. So why did it need another shell?",
    },
    {
      type: "p",
      text: "The answer explains why PowerShell still matters two decades later.",
    },
    {
      type: "p",
      text: "PowerShell was not mainly an attempt to build a better command prompt. Its more important idea was that administrators should manage systems through structured objects rather than spend their time cutting useful data out of formatted text.",
    },
    {
      type: "p",
      text: "A process, service, mailbox or user should not become a block of characters that another command must parse. The next command should receive useful information about the thing itself.",
    },
    {
      type: "p",
      text: "That sounds ordinary now. It was not ordinary when PowerShell began. The idea helped change Windows administration from a collection of interfaces and scripts into something much easier to discover, combine and automate.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The idea worth remembering",
      text: "PowerShell's lasting contribution was not a blue command window. It was the idea that administration should expose structured information that people and machines can reuse.",
    },

    {
      type: "h2",
      id: "before-powershell",
      text: "Windows automation existed before PowerShell",
    },
    {
      type: "p",
      text: "It is easy to exaggerate history. PowerShell did not invent Windows automation. Administrators had batch files, VBScript, WMI, COM interfaces, command-line tools and product-specific scripting systems long before PowerShell 1.0.",
    },
    {
      type: "p",
      text: "The problem was coherence.",
    },
    {
      type: "p",
      text: "One task might require a command-line utility. Another might need VBScript. A third might be available only through WMI. Important settings could live behind a graphical console, a registry key or a product-specific interface.",
    },
    {
      type: "p",
      text: "That made automation possible, but often harder than it needed to be. IT teams needed to know several technologies simply to perform routine administration across Microsoft products.",
    },
    {
      type: "p",
      text: "Text output created another problem. A command could show exactly what a human needed on screen, yet still be awkward for another script to consume. Scripts often depended on column positions, delimiters or labels that could change.",
    },
    {
      type: "p",
      text: "Unix shells had already shown the enormous value of composable command-line tools. Microsoft faced a different environment, however. Windows management exposed rich interfaces through .NET, WMI and other object-based technologies. Jeffrey Snover's answer was to build a shell designed around that structure.",
    },

    {
      type: "h2",
      id: "monad",
      text: "The Monad idea was bigger than a shell",
    },
    {
      type: "p",
      text: "Before it became PowerShell, the project was known as Monad. Jeffrey Snover's Monad Manifesto described a different administrative model for Windows.",
    },
    {
      type: "p",
      text: "The goal was not simply to copy an existing Unix shell. Microsoft needed an environment that could bring together command-line tools, scripts, APIs and Windows management systems while remaining discoverable to administrators.",
    },
    {
      type: "p",
      text: "That led to several ideas that now feel fundamental to PowerShell: consistent command names, command discovery, a common pipeline, access to .NET, strong scripting features and commands that return structured objects.",
    },
    {
      type: "p",
      text: "The consistency mattered. A command such as Get-Process, Get-Service or Get-ChildItem follows a pattern. Once an administrator understands the verb-noun model, an unfamiliar module becomes easier to explore.",
    },
    {
      type: "p",
      text: "Get-Command helps find commands. Get-Help explains them. Get-Member shows what an object contains. Those features reduced the need to memorise every detail before getting useful work done.",
    },

    {
      type: "h2",
      id: "objects-not-text",
      text: "The idea that changed administration: objects instead of text",
    },
    {
      type: "p",
      text: "The PowerShell pipeline looks familiar to anyone who has used another shell. One command sends output to another. The difference is what moves through that pipeline.",
    },
    {
      type: "p",
      text: "PowerShell commands can emit objects. Those objects have properties and, in many cases, methods. Formatting normally happens when PowerShell needs to display the result to a person.",
    },
    {
      type: "p",
      text: "That separation matters.",
    },
    {
      type: "p",
      text: "An administrator can ask for processes, filter them by a property, sort them by another property and select only the fields needed for a report. The script does not have to discover which column contains the process ID or where the CPU value begins.",
    },
    {
      type: "p",
      text: "This made automation more resilient and easier to understand. It also gave administrators an important mental model: inspect the object first, then decide what to do with it.",
    },
    {
      type: "p",
      text: "That same pattern survives far beyond local Windows commands. Modern administrators work with objects returned by REST APIs, JSON data, cloud SDKs and Microsoft Graph. The interfaces changed. Structured administration remained useful.",
    },

    {
      type: "h2",
      id: "discoverability",
      text: "Discoverability may be PowerShell's underrated feature",
    },
    {
      type: "p",
      text: "PowerShell has thousands of commands across Microsoft and third-party modules. Nobody needs to memorise all of them.",
    },
    {
      type: "p",
      text: "That is partly because PowerShell was designed to help an administrator discover the environment while working.",
    },
    {
      type: "p",
      text: "Get-Command answers what commands exist. Get-Help explains how one works. Get-Member shows the data returned. Tab completion reduces typing and helps expose available choices.",
    },
    {
      type: "p",
      text: "This matters more than convenience. Discoverable systems scale knowledge better. An administrator can approach an unfamiliar module with a method rather than depending only on memory.",
    },
    {
      type: "p",
      text: "That approach remains worth teaching today. The durable PowerShell skill is not remembering a long collection of cmdlets. It is knowing how to inspect the system and find the next step.",
    },

    {
      type: "h2",
      id: "exchange",
      text: "Exchange showed that PowerShell could run a major enterprise product",
    },
    {
      type: "p",
      text: "PowerShell became especially visible to enterprise administrators through Exchange. Exchange management embraced PowerShell deeply, which helped prove that the shell could be more than a workstation scripting tool.",
    },
    {
      type: "p",
      text: "That model mattered because graphical administration and automation no longer needed to represent separate worlds. Administrative tasks could be exposed through commands that were available to both people and automation.",
    },
    {
      type: "p",
      text: "The approach then spread across Microsoft's server and management ecosystem. Active Directory, Windows Server and many other products gained PowerShell modules.",
    },
    {
      type: "p",
      text: "For IT teams, this changed expectations. If a task had to be performed on one object, the interface should ideally let the same task be automated across one hundred or ten thousand objects.",
    },

    {
      type: "h2",
      id: "remoting",
      text: "PowerShell Remoting changed the unit of administration",
    },
    {
      type: "p",
      text: "Local scripting was only part of the story. Enterprise administration happens across fleets.",
    },
    {
      type: "p",
      text: "PowerShell Remoting allowed administrators to open remote sessions and run commands on other systems. On Windows, this became closely associated with Windows Remote Management and the WS-Management stack.",
    },
    {
      type: "p",
      text: "The operational shift was important. An administrator did not have to treat each server as a separate desktop session. A task could be expressed once and applied remotely.",
    },
    {
      type: "p",
      text: "That encouraged another useful discipline: administration as reusable code rather than a sequence of clicks.",
    },
    {
      type: "p",
      text: "Remote administration also raised security questions. Who can open a session? Which credentials are used? What can the remote identity do? Is activity logged? Those questions remain central to automation today.",
    },

    {
      type: "h2",
      id: "automation-to-code",
      text: "PowerShell helped turn administration into code",
    },
    {
      type: "p",
      text: "One of PowerShell's biggest effects was cultural rather than technical. Administrators increasingly began to save the procedure.",
    },
    {
      type: "p",
      text: "A command typed once solves one problem. A script captures the method. Put that script in source control and the team can review it. Add parameters and error handling and the process can become repeatable.",
    },
    {
      type: "p",
      text: "This fits naturally with modern DevOps practices. Infrastructure work can be stored in Git, peer-reviewed, tested and executed through controlled pipelines.",
    },
    {
      type: "p",
      text: "PowerShell is not the only infrastructure-as-code language, and it should not be forced into every problem. Terraform, Bicep, Ansible and cloud-native tools often provide better declarative models for infrastructure state.",
    },
    {
      type: "p",
      text: "PowerShell remains valuable around those tools. It handles orchestration, API calls, validation, reporting, administrative glue and tasks that do not fit neatly into a declarative template.",
    },
    {
      type: "p",
      text: "That is an important reason it survived. PowerShell adapted to new automation models rather than requiring everything to become a PowerShell problem.",
    },

    {
      type: "h2",
      id: "cross-platform",
      text: "PowerShell had to leave Windows to remain relevant",
    },
    {
      type: "p",
      text: "For its first decade, PowerShell was strongly identified with Windows. That made sense because Windows administration was the problem it had been created to solve.",
    },
    {
      type: "p",
      text: "The technology landscape changed. Infrastructure moved toward public cloud, Linux, containers, APIs and mixed operating environments.",
    },
    {
      type: "p",
      text: "Microsoft responded by open sourcing PowerShell and building modern PowerShell on cross-platform .NET. PowerShell Core became available beyond Windows, and the project later returned to the simpler PowerShell name with the PowerShell 7 generation.",
    },
    {
      type: "p",
      text: "This introduced an important distinction that still causes confusion. Windows PowerShell 5.1 remains part of Windows and uses the older Windows-focused .NET Framework environment. Modern PowerShell uses the pwsh executable and continues as the actively developed cross-platform line.",
    },
    {
      type: "p",
      text: "The move was bigger than supporting Linux and macOS. It showed that the PowerShell model was useful enough to survive outside the operating system that created it.",
    },

    {
      type: "h2",
      id: "cloud",
      text: "The cloud changed what PowerShell was managing",
    },
    {
      type: "p",
      text: "Early PowerShell administration often meant asking Windows for information about a local or remote system. Cloud administration changed that boundary.",
    },
    {
      type: "p",
      text: "Today a PowerShell command may ultimately call a remote service API. The object returned to the administrator may represent an Azure resource, an Entra identity, a Teams configuration or a Microsoft 365 object hosted far from the machine running the shell.",
    },
    {
      type: "p",
      text: "That shift is one reason the original design aged well. PowerShell did not depend on every managed object being local. The administrator still works with commands and structured results while modules handle communication with the service.",
    },
    {
      type: "p",
      text: "The management plane moved to the cloud. The automation model remained familiar.",
    },

    {
      type: "h2",
      id: "graph",
      text: "Microsoft Graph changed PowerShell again",
    },
    {
      type: "p",
      text: "Microsoft Graph now provides a common API surface across large parts of Microsoft cloud administration. The Microsoft Graph PowerShell SDK brings that API into PowerShell.",
    },
    {
      type: "p",
      text: "This is a different architecture from traditional Windows management. Many cmdlets are now convenient PowerShell interfaces over REST API operations.",
    },
    {
      type: "p",
      text: "That means modern PowerShell skills increasingly overlap with API skills. Administrators need to understand authentication, permissions, scopes, pagination, JSON and service limits as well as PowerShell syntax. A practical example is [building Intune reports with Microsoft Graph and PowerShell](/it-automation/graph-api-intune-reporting), where the real work includes permissions, paging and API behaviour as well as the PowerShell commands.",
    },
    {
      type: "p",
      text: "For a Microsoft 365 administrator, that change is significant. Knowing PowerShell is still useful, but understanding the API and identity model behind the command is becoming just as important.",
    },

    {
      type: "h2",
      id: "security",
      text: "PowerShell's strength became a security concern too",
    },
    {
      type: "p",
      text: "The same features that make PowerShell useful to administrators can also make it useful during an attack. It can inspect systems, call APIs, automate actions and operate remotely.",
    },
    {
      type: "p",
      text: "The wrong lesson is that PowerShell itself is dangerous. Powerful administration tools are valuable precisely because they can make important changes.",
    },
    {
      type: "p",
      text: "The better security question is who can use that power, under which identity, with what permissions and with how much visibility.",
    },
    {
      type: "p",
      text: "Microsoft added security and visibility features over time. Windows can provide PowerShell logging such as Script Block Logging and Module Logging. PowerShell also integrates with the Antimalware Scan Interface on supported Windows systems.",
    },
    {
      type: "p",
      text: "Security teams can combine those controls with endpoint protection, event collection, least privilege and privileged access controls.",
    },
    {
      type: "p",
      text: "Logging should still be designed carefully. Collecting everything without a use case can create noise and cost. High-risk administrative environments deserve stronger logging and retention than an ordinary user device.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Do not solve PowerShell risk by disabling administration",
      text: "The goal is not to remove a useful management tool. The goal is to control privileged use, reduce unnecessary access and retain enough evidence to investigate harmful activity.",
    },

    {
      type: "h2",
      id: "why-it-survived",
      text: "Why PowerShell survived while so many IT tools disappeared",
    },
    {
      type: "p",
      text: "Twenty years is a long life for an enterprise technology. PowerShell survived several changes that could easily have made it irrelevant.",
    },
    {
      type: "p",
      text: "Windows Server changed. Microsoft moved major products to SaaS. Public cloud became normal. Linux became central to Microsoft infrastructure. REST APIs expanded. DevOps changed deployment practices.",
    },
    {
      type: "p",
      text: "PowerShell found a role across each transition.",
    },
    {
      type: "p",
      text: "The reason is not simply syntax. The useful abstraction remained stable: discover commands, work with structured data, compose operations, automate the process and expose the result to another tool.",
    },
    {
      type: "p",
      text: "That abstraction can sit over local Windows APIs, remote management, .NET libraries, native executables or web services.",
    },
    {
      type: "p",
      text: "PowerShell survived because the thing underneath the command could change without forcing administrators to abandon the whole working model.",
    },

    {
      type: "h2",
      id: "skills",
      text: "The PowerShell skills worth learning after twenty years",
    },
    {
      type: "p",
      text: "Learning PowerShell should not mean memorising hundreds of cmdlets.",
    },
    {
      type: "p",
      text: "The long-lived skills are more general.",
    },
    {
      type: "ul",
      items: [
        "Find commands instead of trying to remember everything.",
        "Inspect objects and understand their properties.",
        "Filter, sort and select data in the pipeline.",
        "Write small functions for repeatable work.",
        "Handle errors rather than assuming every command succeeds.",
        "Understand modules and where commands come from.",
        "Work safely with credentials and authentication.",
        "Understand REST APIs and structured data such as JSON.",
        "Log important automation.",
        "Put reusable scripts in source control.",
        "Test changes before using them at scale.",
      ],
    },
    {
      type: "p",
      text: "Those skills transfer across products. A person who understands the method can learn a new module much faster than someone who only memorised commands for one platform.",
    },

    {
      type: "h2",
      id: "limits",
      text: "PowerShell is not the answer to every automation problem",
    },
    {
      type: "p",
      text: "A twenty-year anniversary should not become a claim that PowerShell belongs everywhere.",
    },
    {
      type: "p",
      text: "For large software applications, general-purpose development languages may be a better choice. For desired-state cloud infrastructure, declarative tools can provide clearer control. For data engineering, analytics and machine learning, Python has a much broader ecosystem.",
    },
    {
      type: "p",
      text: "PowerShell is strongest where administration, automation and systems integration meet.",
    },
    {
      type: "p",
      text: "Good IT architecture chooses the right tool for the task. PowerShell earned its longevity partly because it works alongside other tools rather than replacing all of them.",
    },

    {
      type: "h2",
      id: "ai",
      text: "AI does not make PowerShell obsolete",
    },
    {
      type: "p",
      text: "Generative AI can already write PowerShell, explain errors and turn a plain-language request into a plausible script. That lowers the barrier to automation.",
    },
    {
      type: "p",
      text: "It also creates a new risk. A script that looks reasonable is not necessarily correct or safe.",
    },
    {
      type: "p",
      text: "An administrator still needs to know which identity will run the command, which objects it will change, which permissions it requires and whether the action can be reversed.",
    },
    {
      type: "p",
      text: "Generated scripts also need review for error handling, unsafe defaults, destructive commands and broad permissions. This matters even more when AI is allowed to execute commands instead of merely suggesting them.",
    },
    {
      type: "p",
      text: "AI may make PowerShell easier to write. It does not make PowerShell easier to trust.",
    },
    {
      type: "p",
      text: "In that sense, the PowerShell skill becomes more important rather than less important. Someone must understand what the generated command will actually do.",
    },

    {
      type: "h2",
      id: "cio-view",
      text: "What a CIO should take from PowerShell's twenty years",
    },
    {
      type: "p",
      text: "The lesson is not that every IT professional needs to become a PowerShell expert.",
    },
    {
      type: "p",
      text: "The larger lesson is that repeatable administration scales better than knowledge locked inside one person's sequence of clicks.",
    },
    {
      type: "p",
      text: "Good automation reduces variation. It creates something that can be reviewed, tested, logged and improved. It also exposes weak processes. A badly understood manual process does not become good simply because someone turned it into a script.",
    },
    {
      type: "p",
      text: "For IT leaders, PowerShell is therefore part of a broader operating model. Teams need source control, peer review, privileged identity controls, testing and ownership around important automation.",
    },
    {
      type: "p",
      text: "The command line is only one part of that system.",
    },

    {
      type: "h2",
      id: "next-twenty-years",
      text: "The lesson for the next twenty years",
    },
    {
      type: "p",
      text: "PowerShell's most important achievement was not replacing CMD.",
    },
    {
      type: "p",
      text: "It changed the way many Windows administrators thought about management. The graphical console stopped being the only natural place to operate a system. Administration could become structured, discoverable and repeatable.",
    },
    {
      type: "p",
      text: "Twenty years later, the interface behind the command may be a REST API rather than a Windows subsystem. Tomorrow, an AI agent may choose the command on behalf of an administrator.",
    },
    {
      type: "p",
      text: "The underlying lesson still holds. Infrastructure should expose interfaces that machines can understand, people can inspect and organisations can automate safely.",
    },
    {
      type: "p",
      text: "That was a powerful idea in 2006.",
    },
    {
      type: "p",
      text: "It still is.",
    },
  ],

  faq: [
    {
      question: "When was PowerShell 1.0 released?",
      answer:
        "Microsoft released Windows PowerShell 1.0 in November 2006. The product grew from the earlier Monad project and became a core part of Windows and Microsoft enterprise administration.",
    },
    {
      question: "Why was PowerShell different from CMD?",
      answer:
        "CMD and many traditional command-line tools primarily exchange text. PowerShell was designed around structured .NET objects, allowing commands to pass properties and other useful information through the pipeline before formatting the result for display.",
    },
    {
      question: "What is the difference between Windows PowerShell and PowerShell 7?",
      answer:
        "Windows PowerShell 5.1 is the Windows-focused version built on the .NET Framework and ships with Windows. Modern PowerShell uses the pwsh executable, runs on modern .NET and supports Windows, Linux and macOS.",
    },
    {
      question: "Is PowerShell still worth learning?",
      answer:
        "Yes, especially for Microsoft administration, automation, cloud operations and systems integration. The most useful skills are command discovery, objects, pipelines, error handling, APIs, authentication, source control and safe automation rather than memorising large numbers of cmdlets.",
    },
    {
      question: "Will AI replace PowerShell scripting?",
      answer:
        "AI can generate and explain PowerShell scripts, but administrators still need to understand identity, permissions, scope, error handling and the effect of each command. AI can reduce typing; it does not remove the need to validate administrative automation.",
    },
  ],

  sources: [
    {
      title: "Monad Manifesto",
      publisher: "Jeffrey Snover",
      url: "https://www.jsnover.com/Docs/MonadManifesto.pdf",
    },
    {
      title: "PowerShell Documentation",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/powershell/",
    },
    {
      title: "about Pipelines",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pipelines",
    },
    {
      title: "PowerShell Remoting FAQ",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/powershell-remoting-faq",
    },
    {
      title: "Installing PowerShell on Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows",
    },
    {
      title: "Microsoft Graph PowerShell SDK overview",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/powershell/microsoftgraph/overview",
    },
    {
      title: "PowerShell",
      publisher: "GitHub",
      url: "https://github.com/PowerShell/PowerShell",
    },
    {
      title: "about Logging Windows",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_logging_windows",
    },
  ],
};