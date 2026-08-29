import type { Article } from "../../types";

export const article: Article = {
  slug: "aurora-serverless-v2-scaling-connection-limits",
  category: "cloud",
  contentType: "explainer",
  subcategory: "Database",
  title: "Aurora Serverless v2 scales memory, and your connection limit rides along",
  seoTitle: "Aurora Serverless v2: scaling, connections and cost traps",
  metaDescription:
    "Capacity units are memory. Connection limits follow memory, so a small database refuses connections while the CPU sits idle. Why a proxy is not optional.",
  standfirst:
    "The database can be idle and still refuse to let you in. Connections are paid for in memory, and memory is what scales.",
  excerpt:
    "Aurora Serverless v2 scales capacity smoothly, but connection limits move with it. What that means for a spiky workload, why a connection proxy belongs in the design, and where the cost actually sits.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "Aurora Serverless v2 scaling",
  secondaryKeywords: [
    "Aurora capacity units ACU",
    "Aurora Serverless v2 connection limit",
    "RDS Proxy connection pooling",
    "too many connections Aurora",
    "Aurora minimum capacity cost",
  ],
  tags: ["AWS", "Cloud", "Database", "Architecture", "Serverless"],
  reviewStatus: "research-based",
  relatedSlugs: ["cloud-cost-controls", "kubernetes-storage-classes-costs-performance-traps"],
  methodology:
    "Written from AWS documentation on Aurora Serverless v2, capacity units, connection management and RDS Proxy, verified August 2026. Capacity figures, ACU ceilings, the ACU-to-memory ratio and connection formulas are deliberately not quoted: they differ by engine, engine version and hardware generation, and several have changed since the feature launched. Minimum-capacity behaviour in particular has changed, so it should be read from current documentation rather than from any article.",
  body: [
    {
      type: "p",
      text: "Serverless is a useful word that hides a lot. For Aurora Serverless v2 it does not mean there is no server, and it does not mean capacity planning has gone away.",
    },
    {
      type: "p",
      text: "What it means is that capacity moves on its own, quickly and in small steps, instead of you picking an instance size. That is genuinely valuable for traffic that spikes.",
    },
    {
      type: "p",
      text: "It also carries a constraint that catches teams out in production, and it is not a CPU constraint. It is memory, and it shows up as a database refusing connections while looking perfectly healthy.",
    },
    { type: "h2", id: "acu", text: "A capacity unit is mostly memory" },
    {
      type: "p",
      text: "In a provisioned database you choose an instance class and get a fixed amount of CPU and memory. Here you set a range instead — a minimum and a maximum in Aurora Capacity Units — and the engine moves between them.",
    },
    {
      type: "p",
      text: "The important thing about an ACU is that it is a bundle built around memory, with CPU and networking scaled alongside. When capacity goes up, memory goes up. When it drops, memory drops.",
    },
    {
      type: "p",
      text: "That sounds like an implementation detail. It is the whole article, because one of the things memory buys you is connections.",
    },
    { type: "h2", id: "connections", text: "Connections are paid for in memory" },
    {
      type: "p",
      text: "Every open connection to a relational database costs memory. In Aurora, the ceiling on concurrent connections is derived from how much memory the instance has.",
    },
    {
      type: "p",
      text: "Put those two facts together and the consequence is unavoidable. Capacity scales memory, memory sets the connection ceiling, so **the number of connections your database will accept changes as it scales**.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The failure looks nothing like the cause",
      text: "A database sitting at low capacity can refuse new connections while its CPU is almost idle. Every dashboard says there is headroom. The application is receiving connection errors. Nothing about the symptom points at memory, which is why this one costs people an afternoon.",
    },
    {
      type: "p",
      text: "The shape of the incident is consistent. Traffic is quiet, so capacity has scaled down. Something raises load — a campaign, a morning login rush, an autoscaler adding application instances. Each new instance opens its own pool of connections.",
    },
    {
      type: "p",
      text: "The database is still small, so the ceiling is still low. Connections are refused. The application retries, which produces more connection attempts, which consumes the capacity that would otherwise go into scaling up. It can settle into a loop that outlasts the traffic spike that started it.",
    },
    { type: "h2", id: "proxy", text: "Why a connection proxy belongs in the design" },
    {
      type: "p",
      text: "The fix is not a bigger minimum, though that helps. It is to stop the application's connection count from being the database's problem.",
    },
    {
      type: "p",
      text: "A connection proxy sits between them. Applications connect to the proxy, which keeps a smaller, stable set of connections to the database and multiplexes queries across them. When your application scales out and opens hundreds of connections, the proxy absorbs that. The database sees a steady number.",
    },
    {
      type: "p",
      text: "This decouples two things that should never have been coupled: how many application instances exist, and how much memory the database currently has.",
    },
    {
      type: "p",
      text: "It buys something else worth having. During a failover, the proxy can hold client connections while the underlying endpoint changes, so the disruption is shorter than it would otherwise be.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Treat it as part of the architecture",
      text: "For anything with variable load or an application tier that scales, plan the proxy in from the start rather than adding it after the first incident. Retrofitting it means changing connection strings across every service, which is a worse day than configuring it up front.",
    },
    { type: "h2", id: "minimum", text: "The minimum is a floor for cost and for behaviour" },
    {
      type: "p",
      text: "The minimum capacity setting does two jobs, and teams usually think about only one.",
    },
    {
      type: "p",
      text: "The obvious job is cost. Whatever floor you set is capacity you are paying for during quiet periods, so a low minimum looks like an easy saving.",
    },
    {
      type: "p",
      text: "The less obvious job is headroom. That floor is also the state the database is in when a spike arrives — the memory it has, the connections it will accept, and the work it can absorb while scaling up. Scaling is fast, but it is not instant, and a hard enough spike can saturate a small database before the extra capacity lands.",
    },
    {
      type: "p",
      text: "So the minimum is not really a cost dial. It is how much shock the database can take before autoscaling catches up, and it should be set from your traffic pattern rather than from your bill.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Minimum capacity behaviour has changed",
      text: "What the lowest setting is, and whether the database can idle down to nothing, have both changed since Aurora Serverless v2 launched. Plenty of writing about it, including the draft this article came from, describes the original behaviour as permanent. Check the current documentation for the engine and version you are running before designing around it.",
    },
    { type: "h2", id: "mistakes", text: "Three more that cost money or availability" },
    {
      type: "p",
      text: "**Expecting the first version's behaviour.** Aurora Serverless v1 and v2 are different architectures with different goals. Advice written for one frequently does not hold for the other, and v1 material is still widely circulated.",
    },
    {
      type: "p",
      text: "**Forgetting the second instance.** A highly available deployment runs more than one instance, and each has its own capacity and its own bill. Model both when estimating cost, and check how your reader capacity is configured rather than assuming it mirrors the writer.",
    },
    {
      type: "p",
      text: "**Hard-coding memory settings.** Parameter groups that pin memory allocations were written for a world where memory was fixed. Set a large fixed buffer and the database can exhaust its memory at low capacity, before scaling has a chance to react. Let the engine's dynamic values do their job.",
    },
    { type: "h2", id: "choosing", text: "When this is the right database" },
    {
      type: "table",
      caption: "Where the elasticity earns its cost, and where it does not",
      head: ["Good fit", "Poor fit"],
      rows: [
        ["Traffic is spiky or hard to predict", "Load is steady around the clock"],
        ["You would otherwise size for the peak", "You already run near full utilisation"],
        ["A connection proxy is in the design", "Applications connect directly and scale out"],
        [
          "Deep troughs let capacity genuinely fall",
          "The floor has to be high anyway for headroom",
        ],
      ],
    },
    {
      type: "p",
      text: "That last row is the one to check honestly. If the minimum you need for safe behaviour is close to what you would have provisioned anyway, the elasticity is not buying much, and a provisioned instance is usually cheaper at steady state.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Remember that capacity is memory, and memory sets your connection ceiling.",
        "Put a connection proxy between the application and the database before you need one.",
        "Set the minimum from the spike you need to absorb, not from the bill you want.",
        "Model every instance in a highly available deployment, not just the writer.",
        "Let the engine manage memory settings dynamically, and check the current documentation for capacity behaviour rather than trusting older writing.",
      ],
    },
    {
      type: "p",
      text: "Serverless here removes the chore of resizing instances. It does not remove the need to understand what capacity buys you, and it introduces a coupling between scale and connection limits that a provisioned database never had. Design for that coupling and it works well. Ignore it and the first busy morning finds it for you.",
    },
  ],
  faq: [
    {
      question: "Why does my database refuse connections when the CPU is idle?",
      answer:
        "Because connections cost memory, not CPU. When capacity drops, so does the ceiling. The graphs look fine and the database is still full.",
    },
    {
      question: "Do I really need a connection proxy?",
      answer:
        "If your load moves about, yes. It keeps the database seeing a steady number of connections while your app scales out. Add it later and you have to change every connection string. Best to plan it in.",
    },
    {
      question: "What should I set the minimum capacity to?",
      answer:
        "Enough to survive your worst spike while scaling catches up. It is a headroom setting, not just a cost setting. Too low and a busy morning takes you offline.",
    },
    {
      question: "Is it cheaper than a provisioned database?",
      answer:
        "Only if load really drops for long spells. If you need a high floor anyway, a fixed-size instance is often cheaper for steady work.",
    },
    {
      question: "Does advice about Aurora Serverless v1 still apply?",
      answer:
        "Mostly no. The two are built differently and aim at different things. A lot of older writing is still around and still wrong about v2.",
    },
  ],
  sources: [
    {
      title: "Using Aurora Serverless v2",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html",
    },
    {
      title: "Aurora Serverless v2 capacity and scaling",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-administration.html",
    },
    {
      title: "Managing connections with Amazon RDS Proxy",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/rds-proxy.html",
    },
    {
      title: "Maximum connections to an Aurora DB instance",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Managing.Performance.html",
    },
    {
      title: "Amazon Aurora DB instance classes",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.DBInstanceClass.html",
    },
  ],
};
