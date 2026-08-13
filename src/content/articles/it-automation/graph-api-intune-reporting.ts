import type { Article } from "../../types";

export const article: Article = {
  slug: "graph-api-intune-reporting",
  category: "it-automation",
  subcategory: "Microsoft Graph",
  title: "Building Intune reports with Microsoft Graph and PowerShell",
  metaDescription:
    "A maintainable pattern for Intune reporting with Microsoft Graph and PowerShell: least-privilege scopes, paging, and output that other people can use.",
  standfirst:
    "The script is the easy part. Making it re-runnable by someone else, with the right permissions, is what determines whether it survives.",
  excerpt:
    "A pattern for Graph-based Intune reporting that handles paging and permissions properly and produces output other teams can actually consume.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-30",
  draft: true,
  readingMinutes: 4,
  primaryKeyword: "microsoft graph intune reporting",
  secondaryKeywords: ["Graph PowerShell Intune", "Intune device report script"],
  tags: ["PowerShell", "Microsoft Graph", "Intune", "Automation"],
  reviewStatus: "lab-verified",
  methodology:
    "Commands written against the Microsoft.Graph PowerShell SDK and the documented Graph endpoints, and executed in a personal test tenant. No organisational data is shown.",
  body: [
    {
      type: "p",
      text: "Two things make a reporting script last: requesting only the scopes it needs, and handling paging correctly so the numbers are not silently truncated at the first page. Everything else is formatting.",
    },
    { type: "h2", id: "scopes", text: "Connect with least privilege" },
    {
      type: "code",
      language: "powershell",
      filename: "connect.ps1",
      code: `Import-Module Microsoft.Graph.Authentication\n\n# Read-only scopes are enough for reporting. Do not request write scopes\n# in a script that only reads.\nConnect-MgGraph -Scopes @(\n  "DeviceManagementManagedDevices.Read.All",\n  "DeviceManagementConfiguration.Read.All"\n) -NoWelcome`,
    },
    { type: "h2", id: "paging", text: "Page through every result" },
    {
      type: "code",
      language: "powershell",
      filename: "get-devices.ps1",
      code: `function Get-GraphCollection {\n  param([Parameter(Mandatory)][string]$Uri)\n\n  $items = [System.Collections.Generic.List[object]]::new()\n  $next  = $Uri\n\n  while ($next) {\n    $page = Invoke-MgGraphRequest -Method GET -Uri $next\n    if ($page.value) { $items.AddRange($page.value) }\n    $next = $page.'@odata.nextLink'\n  }\n\n  return $items\n}\n\n$devices = Get-GraphCollection \\\n  -Uri "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices"\n\n$devices |\n  Select-Object deviceName, operatingSystem, osVersion,\n                complianceState, lastSyncDateTime |\n  Sort-Object lastSyncDateTime |\n  Export-Csv -Path ".\\intune-devices.csv" -NoTypeInformation -Encoding UTF8`,
    },
    {
      type: "callout",
      variant: "tip",
      title: "Select only the properties you need",
      text: "Adding $select to the request reduces payload size substantially on large estates and makes throttling far less likely on repeated runs.",
    },
    { type: "h2", id: "output", text: "Make the output usable" },
    {
      type: "ul",
      items: [
        "Write CSV or JSON, not console text. Someone will want it in a spreadsheet or a pipeline.",
        "Include the run timestamp and the tenant identifier in the file so an old export cannot be mistaken for a current one.",
        "Fail loudly on an empty result rather than writing an empty file that looks like a clean report.",
      ],
    },
  ],
  sources: [
    {
      title: "Microsoft Graph PowerShell SDK",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/powershell/microsoftgraph/",
    },
  ],
};
