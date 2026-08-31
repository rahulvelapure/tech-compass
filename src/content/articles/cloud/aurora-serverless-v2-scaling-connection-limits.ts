import type { Article } from "../../types";

export const article: Article = {
  slug: "aurora-serverless-v2-scaling-connection-limits",
  category: "cloud",
  contentType: "explainer",
  subcategory: "Database",
  title: "Aurora Serverless v2 scales memory, and your connection limit rides along",
  seoTitle: "Aurora Serverless v2: scaling, connections and cost traps",
  metaDescription:
    "Capacity units are memory. Connection limits follow memory, so a small database can refuse connections while CPU is idle. Learn why a proxy helps.",
  standfirst:
    "The database can be idle and still refuse a login. Connections use memory, and memory is what scales.",
  excerpt:
    "Aurora Serverless v2 changes capacity as load changes. Connection limits change with it. Learn how that affects spikes, proxies and cost.",
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
    "Written from AWS documentation on Aurora Serverless v2, capacity units, connection management and RDS Proxy, verified August 2026. Capacity figures, ACU ceilings, the ACU-to-memory ratio and connection formulas are not quoted. They can vary by engine, engine version and hardware. Some have changed since launch. Minimum-capacity behaviour has also changed. Readers should use current AWS documentation for the exact engine and version they run.",
  body: [
    {
      type: "p",
      text: "Serverless is a useful word, but it can hide the hard parts. Aurora Serverless v2 still has servers. Capacity planning still matters.",
    },
    {
      type: "p",
      text: "The key change is simple. You set a range of capacity. Aurora can move inside that range as load changes. That helps when traffic is hard to predict.",
    },
    {
      type: "p",
      text: "There is one limit that often surprises teams. It is not CPU. It is memory. A database can look calm and still refuse new connections.",
    },
    { type: "h2", id: "acu", text: "A capacity unit is mostly memory" },
    {
      type: "p",
      text: "With a normal database, you pick an instance class. That gives you a fixed amount of CPU and memory. With Aurora Serverless v2, you set a minimum and maximum in Aurora Capacity Units.",
    },
    {
      type: "p",
      text: "An ACU is a capacity bundle built around memory. CPU and network capacity scale with it. When capacity rises, memory rises too. When capacity falls, memory falls.",
    },
    {
      type: "p",
      text: "That may sound like a low-level detail. It is not. Memory is also what supports open database connections.",
    },
    { type: "h2", id: "connections", text: "Connections are paid for in memory" },
    {
      type: "p",
      text: "Each open database connection uses memory. The limit for concurrent connections is tied to the memory available to the database.",
    },
    {
      type: "p",
      text: "Now join the two facts. Aurora changes memory as capacity changes. Memory affects the connection ceiling. So **the number of connections the database can accept can change as the database scales**.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The symptom hides the cause",
      text: "A database at low capacity can refuse new connections while CPU stays low. Dashboards can show plenty of CPU headroom. The app still gets connection errors. That is why the incident can be hard to explain.",
    },
    {
      type: "p",
      text: "The pattern is common. Traffic drops. Aurora scales down. Later, a spike starts. A campaign can do it. A morning login rush can do it. An app autoscaler can do it too.",
    },
    {
      type: "p",
      text: "Each new app instance may open its own pool. The database is still small, so its connection ceiling is still low. Some connection attempts fail.",
    },
    {
      type: "p",
      text: "The app may retry. That creates more connection attempts. Those retries can add pressure just when the database needs time to scale. A short spike can then turn into a longer incident.",
    },
    { type: "h2", id: "proxy", text: "Why a connection proxy helps" },
    {
      type: "p",
      text: "A bigger minimum can help, but it does not solve the core coupling. The better question is this: should the database have to track every app connection? Usually, no.",
    },
    {
      type: "p",
      text: "A connection proxy sits between the app and the database. Apps connect to the proxy. The proxy keeps a smaller set of database connections. It can reuse those connections across clients.",
    },
    {
      type: "p",
      text: "Now the app tier can grow without forcing the same growth on the database. The database sees a steadier connection load. This is the main reason a proxy belongs in the design.",
    },
    {
      type: "p",
      text: "A proxy can help during failover too. Clients keep talking to the proxy while the database endpoint changes behind it. That can reduce the visible break in service.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Plan the proxy early",
      text: "For a variable workload, design the proxy in from the start. Adding it later means changing connection settings in many services. It is easier to make the proxy part of the first design.",
    },
    { type: "h2", id: "minimum", text: "The minimum is a cost floor and a safety floor" },
    {
      type: "p",
      text: "The minimum capacity has two jobs. Teams often think about only the first.",
    },
    {
      type: "p",
      text: "The first job is cost. A higher minimum means you pay for more capacity during quiet periods. A lower minimum can cut idle spend.",
    },
    {
      type: "p",
      text: "The second job is headroom. The minimum is the state of the database when a spike starts. It is the memory available at that moment. It also affects the number of connections the database can accept.",
    },
    {
      type: "p",
      text: "Aurora can scale fast, but it still needs time. A hard spike can fill a small database before extra capacity arrives. That makes the minimum more than a price choice.",
    },
    {
      type: "p",
      text: "Set the minimum from the load you must survive. Do not pick it from the bill alone.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Minimum capacity has changed over time",
      text: "Aurora Serverless v2 has changed since launch. Some older articles describe an old minimum and old scale-down behaviour. Do not copy those values into a new design. Check the current AWS documentation for your engine and version.",
    },
    { type: "h2", id: "mistakes", text: "Three mistakes to avoid" },
    {
      type: "p",
      text: "**Mixing v1 advice with v2 advice.** Aurora Serverless v1 and v2 use different designs. They also solve different problems. Old v1 guidance is still easy to find. Check the version before you follow it.",
    },
    {
      type: "p",
      text: "**Forgetting the second instance.** A highly available setup has more than one instance. Each instance has capacity and cost. Model the full setup. Do not model only the writer.",
    },
    {
      type: "p",
      text: "**Pinning memory settings.** A fixed memory setting may make sense on a fixed-size database. It can be a poor fit when capacity moves. Let the engine use dynamic values where AWS supports them. A bad fixed setting can exhaust memory before scaling can help.",
    },
    { type: "h2", id: "choosing", text: "When Serverless v2 fits" },
    {
      type: "table",
      caption: "Where the elasticity helps, and where it may not",
      head: ["Good fit", "Poor fit"],
      rows: [
        ["Traffic is spiky or hard to predict", "Load is steady all day"],
        ["You would size for the peak", "You already run near full use"],
        ["A connection proxy is part of the design", "Apps open many direct connections"],
        ["Long quiet periods allow scale-down", "The minimum must stay high for safety"],
      ],
    },
    {
      type: "p",
      text: "Check the last row with care. If the safe minimum is close to a normal provisioned size, the elastic model may not save much. A fixed instance may be the better choice for steady work.",
    },
    { type: "h2", id: "takeaways", text: "What to do" },
    {
      type: "ul",
      items: [
        "Treat memory as a key part of connection capacity.",
        "Put a connection proxy between apps and the database when app load can change fast.",
        "Set the minimum from the spike you must survive, not only from cost.",
        "Include every instance when you model a highly available design.",
        "Use current AWS documentation for engine, version and capacity behaviour.",
      ],
    },
    {
      type: "p",
      text: "Aurora Serverless v2 removes the need to resize an instance by hand. It does not remove capacity limits. One of the most useful limits to understand is the link between memory and connections. Design for that link and the service is easier to run. Ignore it and a busy morning may expose it for you.",
    },
  ],
  faq: [
    {
      question: "Why can Aurora refuse connections when CPU is idle?",
      answer:
        "Connections use memory. A low capacity level can mean a low connection ceiling. CPU can still look normal.",
    },
    {
      question: "Do I need a connection proxy?",
      answer:
        "A proxy is useful when app load changes fast. It keeps the database connection count more stable while the app tier grows.",
    },
    {
      question: "How should I choose the minimum capacity?",
      answer:
        "Choose a floor that can handle the start of your main traffic spikes. Treat it as a safety setting as well as a cost setting.",
    },
    {
      question: "Is Serverless v2 always cheaper?",
      answer:
        "No. It helps when load falls for real. For steady load, a fixed-size database can cost less.",
    },
    {
      question: "Can I reuse Aurora Serverless v1 advice?",
      answer:
        "Do not assume so. The two versions use different designs. Use current guidance for v2.",
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
