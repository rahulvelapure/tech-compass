import type { Article } from "../../types";

export const article: Article = {
  slug: "raspberry-pi-home-server",
  category: "gadgets",
  contentType: "analysis",
  subcategory: "Home lab",
  title: "A small home server: what a single-board computer can and cannot do",
  seoTitle: "Single-board computer home servers",
  metaDescription:
    "An honest look at running a home server on a single-board computer: the workloads that fit, the storage problem, and when a used mini PC wins.",
  standfirst:
    "These boards are very good at a few always-on jobs. They are poor at almost anything that moves a lot of data.",
  excerpt:
    "Which home-server workloads genuinely suit a single-board computer, and where a used mini PC is the better purchase.",
  authorId: "rahul-velapure",
  publishedAt: "2026-06-06",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2028-08-28",
  readingMinutes: 3,
  primaryKeyword: "raspberry pi home server",
  secondaryKeywords: [
    "single board computer server",
    "sd card wear",
    "mini pc home lab",
    "low power always-on server",
  ],
  tags: ["Gadgets", "Home Lab", "Hardware"],
  reviewStatus: "research-based",
  draft: false,
  methodology:
    "Written from published board specifications, vendor storage guidance and standard home-lab practice, verified August 2026. No power or throughput measurements are quoted, because none were taken for this article.",
  body: [
    {
      type: "p",
      text: "The appeal is real. Low power draw, silence, and a board that costs less than a month of the cloud service it replaces.",
    },
    {
      type: "p",
      text: "The limits are equally real, and nearly all of them come back to two things: storage bandwidth and memory.",
    },
    { type: "h2", id: "fits", text: "What these boards are genuinely good at" },
    {
      type: "p",
      text: "The sweet spot is a job that runs constantly, uses little memory, and moves small amounts of data. That describes a surprising number of useful things.",
    },
    {
      type: "ul",
      items: [
        "Network-wide DNS filtering, which is mostly small lookups and a modest cache.",
        "A VPN endpoint back into the house, where the constraint is your internet connection rather than the board.",
        "Home automation coordination, which is thousands of tiny messages and almost no bulk data.",
        "Monitoring and alerting for the rest of the network, provided the retention window stays short.",
      ],
    },
    {
      type: "p",
      text: "What these share is a low duty cycle on storage. The board spends most of its time idle, waking to handle something small. That is exactly the shape the hardware suits.",
    },
    {
      type: "p",
      text: "The power argument is genuine here too. A device drawing a few watts continuously costs little to run, and for a job that must be always-on, that adds up over a year in a way a desktop does not.",
    },
    { type: "h2", id: "storage", text: "The storage problem is the real limit" },
    {
      type: "p",
      text: "Most of these boards boot from a memory card, and memory cards were designed for cameras. They hold occasional large writes well and constant small ones badly.",
    },
    {
      type: "p",
      text: "A database, a log file or a container writing steadily will wear a card out. The failure is rarely clean. You get corruption, then a filesystem that will not mount, usually at the least convenient moment.",
    },
    {
      type: "p",
      text: "Cards fail under sustained write load. Boot from an SSD over USB or a proper NVMe carrier if the board supports one.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "USB storage is not free performance",
      text: "Moving to an SSD removes the wear problem and usually improves speed, but on many boards the USB controller shares bandwidth with other peripherals, including the network interface. That ceiling is a property of the board, not the drive, so check the board's own documentation before assuming a faster disk gives you a faster server.",
    },
    { type: "h2", id: "memory", text: "Memory decides how many things you can run" },
    {
      type: "p",
      text: "Memory is the other wall, and it arrives sooner than people expect. A handful of containers, each with its own runtime, adds up quickly.",
    },
    {
      type: "p",
      text: "When it runs out, the board does not politely refuse. The kernel starts killing processes, and it picks whichever one it judges most expensive rather than whichever one you cared about.",
    },
    {
      type: "p",
      text: "Swap makes this worse rather than better on card-based storage. You have taken a memory shortage and turned it into constant small writes to the exact medium that handles them worst.",
    },
    { type: "h2", id: "doesnt", text: "What does not fit" },
    {
      type: "p",
      text: "Anything that moves real volumes of data is the wrong job for this hardware. That includes bulk file storage, backup targets and media libraries of any size.",
    },
    {
      type: "p",
      text: "Video transcoding is the clearest example. Without hardware acceleration for the formats you actually use, the processor does the work, and it will not keep up with more than a stream or two.",
    },
    {
      type: "p",
      text: "Databases under real write load belong elsewhere too. So does anything where an hour of downtime matters, because a single board with a single card is a single point of failure with no redundancy anywhere in it.",
    },
    { type: "h2", id: "minipc", text: "When to buy a used mini PC instead" },
    {
      type: "p",
      text: "If the plan involves several containers, a database, or anything transcoding video, a second-hand small-form-factor business PC gives more memory, real SATA or NVMe storage and hardware media acceleration for a similar total cost. The power draw is higher but rarely decisive.",
    },
    {
      type: "p",
      text: "Ex-corporate machines are the ones to look for. They were built for three years of continuous office use, they take standard memory and drives, and they turn up in volume when a fleet is refreshed.",
    },
    {
      type: "p",
      text: "The honest comparison is not board against PC. It is what you are trying to run. A DNS filter and a VPN endpoint on a board is a good design. A media server and three databases on the same board is a project you will be rebuilding in six months.",
    },
    { type: "h2", id: "build", text: "If you do build one, build it to survive" },
    {
      type: "ol",
      items: [
        "Boot from an SSD, not a card, for anything that writes regularly.",
        "Give it a wired network connection. Wireless adds a failure mode you cannot diagnose remotely.",
        "Back up the configuration somewhere else, and test restoring it onto a fresh device.",
        "Watch temperature and memory. Both fail quietly on passively cooled hardware in a warm cupboard.",
        "Keep one job per board where you can. It is cheaper to add a second board than to debug two workloads competing for the same memory.",
      ],
    },
    {
      type: "p",
      text: "Follow that and these boards are genuinely excellent. Ignore the storage advice in particular and you will meet the failure mode everyone else already has.",
    },
  ],
  faq: [
    {
      question: "Can I run a media server on one?",
      answer:
        "Only if the file plays as it is. Re-encoding needs chip support these boards mostly lack.",
    },
    {
      question: "Why do memory cards keep failing?",
      answer:
        "They were built for cameras, not for constant small writes. Boot from an SSD instead.",
    },
    {
      question: "Is the low power draw worth much?",
      answer: "For an always-on job, yes. Over a year it is real money against a desktop.",
    },
    {
      question: "How many containers can it run?",
      answer: "Fewer than you think. Memory runs out first. Then the kernel starts killing things.",
    },
    {
      question: "Is a used mini PC a better buy?",
      answer: "Often, yes. More memory, real disks, and it handles video. It just uses more power.",
    },
  ],
  sources: [
    {
      title: "Raspberry Pi documentation: hardware and boot options",
      publisher: "Raspberry Pi Ltd",
      url: "https://www.raspberrypi.com/documentation/computers/",
    },
    {
      title: "SD Standard specifications and application performance classes",
      publisher: "SD Association",
      url: "https://www.sdcard.org/developers/sd-standard-overview/",
    },
    {
      title: "Linux kernel documentation: the OOM killer",
      publisher: "Linux Kernel",
      url: "https://docs.kernel.org/admin-guide/mm/concepts.html",
    },
  ],
};
