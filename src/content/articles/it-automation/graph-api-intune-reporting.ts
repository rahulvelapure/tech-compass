import type { Article } from "../../types";

export const article: Article = {
  slug: "graph-api-intune-reporting",
  category: "it-automation",
  contentType: "how-to",
  subcategory: "Microsoft Graph",
  title: "Building Intune reports with Microsoft Graph and PowerShell",
  seoTitle: "Intune reporting with Microsoft Graph",
  metaDescription:
    "A maintainable pattern for Intune reporting with Microsoft Graph and PowerShell: least-privilege scopes, paging, throttling and output others can use.",
  standfirst:
    "The script is the easy part. What decides if it lasts is whether someone else can run it, with the right rights.",
  excerpt:
    "A pattern for Graph-based Intune reporting that handles paging and permissions properly and produces output other teams can actually consume.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-30",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-02-28",
  readingMinutes: 4,
  primaryKeyword: "microsoft graph intune reporting",
  secondaryKeywords: [
    "graph powershell paging",
    "least privilege graph scopes",
    "graph api throttling",
    "intune device report script",
  ],
  tags: ["PowerShell", "Microsoft Graph", "Intune", "Automation"],
  reviewStatus: "lab-verified",
  relatedSlugs: [
    "intune-compliance-policy-design",
    "windows-laps-entra-id-architecture-deployment",
  ],
  draft: false,
  methodology:
    "Written against the Microsoft Graph documentation and the Microsoft Graph PowerShell SDK, verified August 2026. Permission names and paging behaviour were checked against the current reference. No tenant data or device counts are quoted.",
  body: [
    {
      type: "p",
      text: "Two things make a reporting script last. It asks only for the scopes it needs, and it handles paging correctly so the numbers are not silently truncated at the first page.",
    },
    {
      type: "p",
      text: "Everything else is formatting. Get those two wrong and you will produce a report that looks right and is not, which is worse than producing nothing.",
    },
    { type: "h2", id: "scopes", text: "Ask for the smallest scope that works" },
    {
      type: "p",
      text: "Graph permissions come in read and read-write pairs. Reporting needs the read one, and it is worth being deliberate about that.",
    },
    {
      type: "p",
      text: "A script that connects with write access will eventually be run by someone who does not need it, from a machine you did not expect. The scope is the only thing standing between a reporting job and a change.",
    },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: "Connect-MgGraph -Scopes 'DeviceManagementManagedDevices.Read.All'",
    },
    {
      type: "p",
      text: "Check what you actually got, rather than assuming. The context tells you which scopes were granted, and consent may have given you fewer than you asked for.",
    },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: "(Get-MgContext).Scopes",
    },
    {
      type: "callout",
      variant: "note",
      title: "Delegated and application permissions behave differently",
      text: "Running interactively, you get the intersection of your rights and the granted scope, so an admin sees more than a helpdesk user running the same script. Running unattended as an app registration, you get exactly what was consented, every time. Test in the mode the job will actually run in, or the results will differ from the pilot.",
    },
    { type: "h2", id: "paging", text: "Paging is where reports quietly go wrong" },
    {
      type: "p",
      text: "Graph returns collections a page at a time. A response carries a page of results and, if there is more, a link to the next page.",
    },
    {
      type: "p",
      text: "Read the first page only and you get a plausible-looking answer that is a fraction of the estate. Nothing errors. The count is simply wrong, and it stays wrong every time the report runs.",
    },
    {
      type: "p",
      text: "The SDK will follow the pages for you if you ask it to. That single switch is the difference between a correct report and a confident one.",
    },
    {
      type: "code",
      language: "powershell",
      filename: "device-report.ps1",
      code: "$devices = Get-MgDeviceManagementManagedDevice -All -Property \\\n  'id,deviceName,operatingSystem,osVersion,complianceState,lastSyncDateTime'\n\n$devices |\n  Select-Object deviceName, operatingSystem, osVersion, complianceState, lastSyncDateTime |\n  Export-Csv -Path \"intune-devices-$(Get-Date -Format 'yyyyMMdd').csv\" -NoTypeInformation",
    },
    {
      type: "p",
      text: "Adding a property selection to the request reduces payload size substantially on large estates and makes throttling far less likely on repeated runs.",
    },
    { type: "h2", id: "throttling", text: "Throttling is normal, not an error" },
    {
      type: "p",
      text: "Graph throttles. On a large tenant, a report that walks every device will meet a limit at some point, and that is expected behaviour rather than a fault in your script.",
    },
    {
      type: "p",
      text: "The service tells you what to do about it. A throttled response carries a Retry-After header, and the correct handling is to wait that long and try again rather than retrying immediately.",
    },
    {
      type: "p",
      text: "Two habits keep you well clear of it. Select only the fields you need, and do not run the same broad report on a tight loop while you are developing it.",
    },
    { type: "h2", id: "output", text: "Write output someone else can use" },
    {
      type: "ul",
      items: [
        "Write CSV or JSON, not console text. Someone will want it in a spreadsheet or a pipeline.",
        "Include the run timestamp and the tenant identifier in the file so an old export cannot be mistaken for a current one.",
        "Fail loudly on an empty result rather than writing an empty file that looks like a clean report.",
      ],
    },
    {
      type: "p",
      text: "The third one matters more than it sounds. An empty file reads as good news. A compliance report that returns nothing because the scope was wrong looks identical to one where every device is compliant.",
    },
    {
      type: "code",
      language: "powershell",
      code: "if (-not $devices) {\n  throw 'No devices returned. Check the granted scopes before trusting this run.'\n}",
    },
    { type: "h2", id: "survive", text: "Making it survive its author" },
    {
      type: "p",
      text: "Most of these scripts die because the person who wrote them left, and nobody else could run them. That is a documentation problem more than a code problem.",
    },
    {
      type: "ol",
      items: [
        "Put the required scopes in a comment at the top, in the exact form Connect-MgGraph expects.",
        "State which module versions it was written against. The SDK's cmdlet names have changed across major versions.",
        "Keep the query and the formatting separate, so someone can change the columns without touching the Graph call.",
        "Store it in source control with the other operational scripts, not in a personal folder.",
        "Run it once from a clean machine before you call it finished. That is what catches missing modules and assumed consent.",
      ],
    },
    {
      type: "p",
      text: "None of that is clever. It is the difference between a script that produces a report next year and one that produces an error message and a shrug.",
    },
  ],
  faq: [
    {
      question: "Why does my report show fewer devices than the portal?",
      answer:
        "You are almost certainly reading the first page only. Ask the SDK to follow all of them.",
    },
    {
      question: "Which scope do I need for device reporting?",
      answer:
        "The read one, not the read-write one. Check what you were granted after you connect.",
    },
    {
      question: "What should I do when Graph throttles me?",
      answer:
        "Wait for as long as the Retry-After header says, then try again. Do not retry at once.",
    },
    {
      question: "Should the script run as me or as an app?",
      answer: "As an app for anything scheduled. Test it that way too, because the rights differ.",
    },
    {
      question: "Why select only some fields?",
      answer:
        "Smaller responses are faster and get throttled less. On a big tenant the difference is large.",
    },
  ],
  sources: [
    {
      title: "Paging Microsoft Graph data in your app",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/graph/paging",
    },
    {
      title: "Microsoft Graph permissions reference",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/graph/permissions-reference",
    },
    {
      title: "Microsoft Graph throttling guidance",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/graph/throttling",
    },
    {
      title: "Microsoft Graph PowerShell SDK overview",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/powershell/microsoftgraph/overview",
    },
  ],
};
