import type { Article } from "../../types";

export const article: Article = {
  slug: "wifi-troubleshooting",
  category: "windows",
  contentType: "troubleshooting",
  subcategory: "Troubleshooting",
  title: "Windows 11 Wi-Fi problems: a diagnostic order that finds the cause",
  metaDescription:
    "Fix Windows 11 Wi-Fi problems methodically: isolate the layer, check the adapter and driver state, and reset only the setting that is actually broken.",
  standfirst:
    "Resetting the network stack fixes some problems and hides others. Work down the layers instead.",
  excerpt:
    "A layered diagnostic order for Windows 11 wireless problems — from radio and driver state to DNS — so you fix the cause instead of the symptom.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-14",
  draft: true,
  readingMinutes: 2,
  primaryKeyword: "windows 11 wifi troubleshooting",
  secondaryKeywords: ["windows 11 wifi keeps disconnecting", "windows 11 no internet"],
  tags: ["Windows", "Networking", "Troubleshooting"],
  reviewStatus: "research-based",
  methodology:
    "Procedures written against Windows 11 as documented by Microsoft and verified against the commands' documented behaviour. Commands are shown so results can be reproduced.",
  body: [
    {
      type: "p",
      text: "Wireless faults fall into a small number of layers, and each layer has a cheap test. Running the tests in order takes about five minutes and usually removes the need to guess.",
    },
    { type: "h2", id: "layer-1", text: "1. Is the radio actually associated?" },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: `netsh wlan show interfaces`,
    },
    {
      type: "p",
      text: "Check State, Signal and Receive rate. A state of disconnected with a strong signal points at authentication; a low signal points at placement or interference; a good association with no traffic moves you down a layer.",
    },
    { type: "h2", id: "layer-2", text: "2. Is the address configuration sane?" },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: `ipconfig /all\nGet-NetIPAddress -AddressFamily IPv4 | Format-Table InterfaceAlias, IPAddress, PrefixLength`,
    },
    {
      type: "p",
      text: "An address in 169.254.x.x means DHCP never answered — that is a network problem, not a Windows problem. A valid address with no gateway means the same thing.",
    },
    { type: "h2", id: "layer-3", text: "3. Separate name resolution from connectivity" },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: `ping 1.1.1.1\nResolve-DnsName example.com`,
    },
    {
      type: "p",
      text: "If the first works and the second does not, the fault is DNS and nothing else needs changing. Flushing the resolver cache is the correct fix here and only here.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Network reset is a last resort",
      text: "netsh winsock reset and the Settings network reset remove VPN clients, static configuration and saved networks. Use them when you have identified a corrupt stack, not as the first move.",
    },
    { type: "h2", id: "layer-4", text: "4. Driver and power management" },
    {
      type: "ul",
      items: [
        "In Device Manager, open the wireless adapter's Power Management tab and clear the option that allows Windows to turn off the device to save power. This is a common cause of drops after sleep.",
        "Install the adapter driver from the laptop manufacturer rather than the generic chipset driver where both exist.",
        "Under battery saver, confirm the wireless adapter power mode is not set to maximum power saving.",
      ],
    },
  ],
  faq: [
    {
      question: "Why does Windows 11 Wi-Fi disconnect after sleep?",
      answer:
        "Most commonly the adapter's power management setting allows Windows to power the device down, and the driver does not re-associate cleanly on resume. Disabling that setting and updating the vendor driver resolves the majority of cases.",
    },
    {
      question: "Does forgetting and re-adding the network help?",
      answer:
        "Only when the stored profile is wrong — for example after the network's security type or password changed. It does nothing for driver, DHCP or DNS problems.",
    },
  ],
};
