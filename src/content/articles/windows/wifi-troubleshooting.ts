import type { Article } from "../../types";

export const article: Article = {
  slug: "wifi-troubleshooting",
  category: "windows",
  contentType: "troubleshooting",
  subcategory: "Troubleshooting",
  title: "Windows 11 Wi-Fi problems: a diagnostic order that finds the cause",
  seoTitle: "Windows 11 Wi-Fi troubleshooting order",
  metaDescription:
    "Fix Windows 11 Wi-Fi problems methodically: isolate the layer, check adapter and driver state, and reset only the setting that is actually broken.",
  standfirst:
    "Resetting the network stack fixes some problems and hides others. Work down the layers instead.",
  excerpt:
    "A layered diagnostic order for Windows 11 wireless problems — from radio and driver state to DNS — so you fix the cause instead of the symptom.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-14",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-08-28",
  readingMinutes: 4,
  primaryKeyword: "windows 11 wifi troubleshooting",
  secondaryKeywords: [
    "netsh wlan show interfaces",
    "adapter power management wifi",
    "apipa 169.254 address",
    "netsh winsock reset",
  ],
  tags: ["Windows", "Networking", "Troubleshooting"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "enterprise-dns-security-doh-dot-filtering",
    "windows-11-vs-windows-10-enterprise",
  ],
  draft: false,
  methodology:
    "Written from Microsoft's published networking and adapter documentation and standard diagnostic practice, verified August 2026. Command behaviour was checked against the current reference. No failure rates or timings are quoted.",
  body: [
    {
      type: "p",
      text: "Wireless faults fall into a small number of layers, and each layer has a cheap test. Running the tests in order takes about five minutes and usually removes the need to guess.",
    },
    {
      type: "p",
      text: "The order matters because the fixes overlap. Reset the stack first and you may clear the symptom while destroying the evidence, which means the same fault returns next week with nothing to go on.",
    },
    { type: "h2", id: "radio", text: "Layer one: is the radio actually associated?" },
    {
      type: "p",
      text: "Start at the adapter. One command tells you whether the machine is connected, how well, and at what rate.",
    },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: "netsh wlan show interfaces",
    },
    {
      type: "p",
      text: "Check State, Signal and Receive rate. A state of disconnected with a strong signal points at authentication; a low signal points at placement or interference; a good association with no traffic moves you down a layer.",
    },
    {
      type: "p",
      text: "That last case is the useful one. If the adapter says connected and nothing works, the radio is fine and you can stop looking at it.",
    },
    { type: "h2", id: "address", text: "Layer two: did the machine get an address?" },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: "ipconfig /all",
    },
    {
      type: "p",
      text: "An address in 169.254.x.x means DHCP never answered — that is a network problem, not a Windows problem. A valid address with no gateway means the same thing.",
    },
    {
      type: "p",
      text: "This is where a lot of time gets wasted. The machine looks broken, the settings look wrong, and the actual fault is a DHCP scope that is full or a VLAN that is not serving addresses.",
    },
    { type: "h2", id: "dns", text: "Layer three: is it routing, or is it DNS?" },
    {
      type: "p",
      text: "Two tests separate these cleanly. Ping something by address, then resolve something by name.",
    },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: "ping 1.1.1.1\nResolve-DnsName www.microsoft.com",
    },
    {
      type: "p",
      text: "If the first works and the second does not, the fault is DNS and nothing else needs changing. Flushing the resolver cache is the correct fix here and only here.",
    },
    {
      type: "p",
      text: "On a managed estate, check what the machine is resolving through before you change anything. Encrypted DNS and filtering policy can send queries somewhere other than the network's own resolver, which is worth knowing about — the [DoH and DoT filtering article](/enterprise-networking/enterprise-dns-security-doh-dot-filtering) covers how that plays out.",
    },
    { type: "h2", id: "driver", text: "The adapter settings that cause repeat faults" },
    {
      type: "p",
      text: "If the connection works and then drops, especially after sleep, the cause is usually power management rather than the network.",
    },
    {
      type: "ul",
      items: [
        "In Device Manager, open the wireless adapter's Power Management tab and clear the option that allows Windows to turn off the device to save power. This is a common cause of drops after sleep.",
        "Install the adapter driver from the laptop manufacturer rather than the generic chipset driver where both exist.",
        "Under battery saver, confirm the wireless adapter power mode is not set to maximum power saving.",
      ],
    },
    {
      type: "p",
      text: "The second point catches people out. Windows Update will happily install a generic driver that works, and the vendor's own build often handles roaming and power states better on that specific hardware.",
    },
    { type: "h2", id: "reset", text: "Resets, and why they come last" },
    {
      type: "p",
      text: "netsh winsock reset and the Settings network reset remove VPN clients, static configuration and saved networks. Use them when you have identified a corrupt stack, not as the first move.",
    },
    {
      type: "p",
      text: "On a managed device the cost is higher than it looks. A network reset can strip a configuration that came from policy, and the machine will then look fixed until it next needs the setting that was removed.",
    },
    {
      type: "code",
      language: "powershell",
      command: true,
      code: "netsh winsock reset\nnetsh int ip reset",
    },
    {
      type: "p",
      text: "Both need a restart to take effect. Write down what was configured before you run them, because you will be putting some of it back.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Forgetting the network is not a general fix",
      text: "Removing a saved profile helps in one situation: the stored profile no longer matches the network, usually after a password or security-type change. It does nothing for driver faults, DHCP problems or DNS, and on a managed device the profile may simply be pushed back by policy.",
    },
    { type: "h2", id: "many", text: "When it is more than one machine" },
    {
      type: "p",
      text: "One machine is a device problem. Several machines in the same place, at the same time, is not — and the diagnostic order changes.",
    },
    {
      type: "p",
      text: "Look at what they share. The same access point, the same band, the same VLAN, or the same recent update. Channel congestion and access point capacity produce symptoms that look exactly like a client fault on each individual laptop.",
    },
    {
      type: "p",
      text: "That distinction is worth making early. Fifteen minutes on one laptop is wasted if the answer is an access point that is out of capacity at eleven every morning.",
    },
  ],
  faq: [
    {
      question: "Why does Wi-Fi drop after sleep?",
      answer:
        "Windows is allowed to power the adapter down, and the driver does not come back cleanly. Clear that setting. Then update the driver.",
    },
    {
      question: "Should I forget the network and rejoin?",
      answer:
        "Only if the saved profile is wrong, say after a password change. It fixes nothing else.",
    },
    {
      question: "What does a 169.254 address mean?",
      answer: "No DHCP server answered. That is a network fault, not a Windows one.",
    },
    {
      question: "Is a network reset safe to run?",
      answer: "It works, and it clears your VPN and saved networks too. Use it last, not first.",
    },
    {
      question: "How do I know it is DNS?",
      answer: "Ping an address and then resolve a name. If only the name fails, it is DNS.",
    },
  ],
  sources: [
    {
      title: "netsh wlan commands",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-wlan",
    },
    {
      title: "Advanced troubleshooting for Windows network connection issues",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/troubleshoot-tcpip-connectivity",
    },
    {
      title: "Resolve-DnsName reference",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/powershell/module/dnsclient/resolve-dnsname",
    },
  ],
};
