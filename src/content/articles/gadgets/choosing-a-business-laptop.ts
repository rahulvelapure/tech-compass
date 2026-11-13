import type { Article } from "../../types";

export const article: Article = {
  slug: "choosing-a-business-laptop",
  category: "gadgets",
  contentType: "buying-guide",
  subcategory: "Laptops",
  title: "How to choose a business laptop fleet without regretting it",
  seoTitle: "Choosing a business laptop fleet",
  metaDescription:
    "A buying guide for laptop fleets: the specifications that matter for managed devices, the ones that do not, and the costs people forget.",
  standfirst:
    "The spec sheet decides very little. What decides it is how easy the machine is to fix, to manage, and to buy again next year.",
  excerpt:
    "The criteria that actually determine whether a laptop fleet is cheap to run over three years.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-08",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-08-28",
  readingMinutes: 4,
  primaryKeyword: "business laptop buying guide",
  secondaryKeywords: [
    "laptop fleet procurement",
    "zero-touch provisioning",
    "firmware management fleet",
    "laptop total cost of ownership",
  ],
  tags: ["Laptops", "Hardware", "Procurement", "Endpoint Management"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "bitlocker-tpm-failure-recovery-enterprise",
    "windows-11-vs-windows-10-enterprise",
  ],
  draft: false,
  methodology:
    "Written from published vendor specifications, firmware management documentation and standard enterprise procurement criteria, verified August 2026. No pricing is quoted, because it varies by region and contract, and no brand is recommended.",
  body: [
    {
      type: "p",
      text: "Buying a fleet ties you in for three years. And the questions that matter are the ones a spec sheet cannot answer.",
    },
    {
      type: "p",
      text: "Can you get the same model for the whole refresh window? Can you manage firmware centrally? And how long does a warranty repair actually take, in the places your people actually work?",
    },
    {
      type: "p",
      text: "Those three decide what the fleet costs to run. The processor tier barely registers next to them.",
    },
    { type: "h2", id: "supply", text: "Supply consistency beats specification" },
    {
      type: "p",
      text: "A model that changes silently mid-year is expensive in a way that never shows on the invoice. The panel supplier changes, or the wireless card, and suddenly your image has two driver sets and your test matrix has doubled.",
    },
    {
      type: "p",
      text: "Ask the vendor directly how long the exact configuration will be available, and get it in writing. Business lines usually offer a stability commitment that consumer lines do not, and that commitment is most of what you are paying the premium for.",
    },
    {
      type: "p",
      text: "The same goes for accessories. A dock that is discontinued a year in leaves you supporting two docking standards, which is a support cost disguised as a hardware purchase.",
    },
    { type: "h2", id: "manage", text: "The three management questions" },
    {
      type: "ul",
      items: [
        "Firmware and BIOS settings must be manageable from your existing tooling, not a separate console with its own agent.",
        "Zero-touch provisioning support with your identity provider â€” otherwise every device gets touched by a person.",
        "A published, stable model line so the image and driver set do not fork mid-refresh.",
      ],
    },
    {
      type: "p",
      text: "The first one is worth pressing on. Every vendor will say firmware is manageable. The question is whether it is manageable from the tool you already run, or whether it needs another console, another agent and another set of credentials.",
    },
    {
      type: "p",
      text: "The second decides whether a new starter can be productive without IT touching the machine. If a device has to be unboxed, imaged and handed over by a person, you have added a step to every hire, every replacement and every failure.",
    },
    { type: "h2", id: "security", text: "Security features that need checking before purchase" },
    {
      type: "p",
      text: "Some security capabilities are firmware and hardware properties. You cannot add them later, and a fleet bought without them is a fleet you cannot bring up to standard.",
    },
    {
      type: "p",
      text: "Check the TPM version, and check that disk encryption behaves the way you expect on that hardware. Recovery-key handling in particular is worth testing on a sample before you commit, because [BitLocker recovery prompts](/windows/bitlocker-tpm-failure-recovery-enterprise) are usually the TPM doing its job rather than a fault.",
    },
    {
      type: "p",
      text: "If you are standardising on a Windows baseline, confirm the hardware clears it. The requirements changed with Windows 11, and [the enterprise differences](/windows/windows-11-vs-windows-10-enterprise) are the place to check what your estate needs.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Firmware settings are part of the build",
      text: "Secure Boot state, virtualisation extensions and TPM configuration are set in firmware, and a device that arrives with the wrong defaults needs touching before it can be enrolled. Ask whether the vendor will ship with your settings applied. Some will, and it removes a manual step from every device.",
    },
    { type: "h2", id: "service", text: "Serviceability is the cost nobody models" },
    {
      type: "p",
      text: "Next-business-day onsite support changes the user experience of a failure far more than one processor tier does.",
    },
    {
      type: "p",
      text: "Work out what a failure actually costs you. A person without a laptop for a week is a week of salary against a machine that might have cost a little more with better cover. That arithmetic almost always favours the better warranty.",
    },
    {
      type: "p",
      text: "Then check where that cover applies. Onsite service means something different in a capital city and in a regional office, and international cover is a separate line worth confirming if people travel.",
    },
    {
      type: "p",
      text: "Ask about parts too. A machine where the battery and SSD are replaceable can be repaired locally and kept in service. One where they are not becomes a whole-unit swap, which is slower and more expensive at the end of life.",
    },
    { type: "h2", id: "specs", text: "The specifications that do and do not matter" },
    {
      type: "p",
      text: "Memory matters, and it is the one people under-buy. A machine that is short on memory feels slow for three years, and on many current designs it is soldered, so you cannot fix it later.",
    },
    {
      type: "p",
      text: "Storage matters less than people think, given how much sits in cloud services now. Buy enough for the local cache and the tooling, not for an archive nobody keeps locally any more.",
    },
    {
      type: "p",
      text: "Processor tier matters least. Between two adjacent tiers, the difference is rarely visible in the work most people do, and the money is better spent on memory, warranty or a better screen.",
    },
    { type: "h2", id: "evaluate", text: "How to run the evaluation" },
    {
      type: "ol",
      items: [
        "Get one sample of each finalist. Not a specification sheet â€” a machine.",
        "Enrol it through your real provisioning path, end to end, with no manual steps you would not scale.",
        "Push a firmware setting and a driver update from your existing tooling. Note whether it needed another console.",
        "Confirm the encryption and recovery behaviour, including what a user sees when it goes wrong.",
        "Ask the vendor for the configuration availability date in writing, and for the repair turnaround in your actual locations.",
      ],
    },
    {
      type: "p",
      text: "Those five steps take a fortnight and will separate the candidates far more reliably than any comparison table. Four of them are about operations rather than hardware, which is the point.",
    },
  ],
  faq: [
    {
      question: "Is a business laptop worth the premium?",
      answer:
        "Usually, yes. You get the same model next year. You get to set the firmware. And a broken one comes back faster.",
    },
    {
      question: "How much memory should we buy?",
      answer: "More than feels necessary. It is often soldered, so you cannot add it later.",
    },
    {
      question: "Does the processor tier matter much?",
      answer: "Less than people think. Put the money into memory, cover or the screen.",
    },
    {
      question: "What is the most common mistake?",
      answer: "Buying on the spec sheet. Then the model changes halfway through the refresh.",
    },
    {
      question: "Should we standardise on one model?",
      answer: "One or two. Every extra model adds an image, a driver set and a test pass.",
    },
  ],
  sources: [
    {
      title: "Windows Autopilot documentation",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/autopilot/",
    },
    {
      title: "Windows 11 minimum hardware requirements",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/windows-hardware/design/minimum/minimum-hardware-requirements-overview",
    },
    {
      title: "BitLocker device encryption overview",
      publisher: "Microsoft",
      url: "https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/",
    },
  ],
};
