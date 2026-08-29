import type { Article } from "../../types";

export const article: Article = {
  slug: "postgresql-connection-pooling-pgbouncer-rds-proxy",
  category: "cloud",
  contentType: "explainer",
  subcategory: "Database",
  title: "Postgres gives every connection a process, and that decides your architecture",
  seoTitle: "PostgreSQL connection pooling: PgBouncer and RDS Proxy",
  metaDescription:
    "Postgres forks a process per connection, so connections are expensive. What transaction pooling breaks, why prepared statements fail, and when sessions pin.",
  standfirst:
    "Each connection to Postgres gets a whole process of its own. That single design choice is why pooling is not optional.",
  excerpt:
    "Postgres connections are processes, not threads, so they cost real memory. Pooling is how you survive that — and transaction pooling quietly breaks assumptions your application probably makes.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-08-23",
  readingMinutes: 5,
  primaryKeyword: "PostgreSQL connection pooling",
  secondaryKeywords: [
    "PgBouncer transaction pooling",
    "RDS Proxy pinning",
    "prepared statement does not exist",
    "max_connections PostgreSQL",
    "too many clients already",
  ],
  tags: ["Database", "PostgreSQL", "Cloud", "AWS", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "aurora-serverless-v2-scaling-connection-limits",
    "aws-lambda-cold-start-optimization-snapstart",
  ],
  methodology:
    "Written from PostgreSQL documentation on connections and resource limits, the PgBouncer documentation on pooling modes and prepared statements, and AWS documentation on RDS Proxy including pinning behaviour, verified August 2026. Per-connection memory figures, safe connection counts and latency figures are not quoted: they depend on workload, version and instance. Behaviour that differs between PostgreSQL versions is flagged rather than stated flatly.",
  body: [
    {
      type: "p",
      text: "Most databases handle a new connection with a thread. Postgres forks a process.",
    },
    {
      type: "p",
      text: "That is a real architectural difference, not a detail. A process has its own memory and its own scheduling cost. A thousand connections means a thousand processes, and the machine spends its time switching between them rather than answering queries.",
    },
    {
      type: "p",
      text: "So connections to Postgres are expensive in a way they are not everywhere else. Everything below follows from that.",
    },
    { type: "h2", id: "limit", text: "Why raising the limit makes it worse" },
    {
      type: "p",
      text: "The first instinct when connections run out is to allow more of them. It is one setting, and it appears to fix the error immediately.",
    },
    {
      type: "p",
      text: "It moves the failure rather than removing it. A refused connection is an obvious error with an obvious message. A database drowning in context switches is a slow, confusing degradation where every query is late and nothing looks broken.",
    },
    {
      type: "p",
      text: "The workable pattern is the opposite. Keep the number of real connections modest, and put something in front that lets many clients share them.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Application pools are necessary and not sufficient",
      text: "A pool inside your application avoids a handshake on every query, and you should have one. It only pools for that process. Twenty replicas with a twenty-connection pool each will present hundreds of connections to the database, and the database has no idea they came from one system. You need a pool for the fleet as well as one per process.",
    },
    { type: "h2", id: "modes", text: "Three pooling modes, and what each costs" },
    {
      type: "p",
      text: "PgBouncer is the usual answer, and the mode you choose matters more than anything else about it.",
    },
    {
      type: "table",
      caption: "How long a client holds a real database connection",
      head: ["Mode", "Connection is held for", "Trade"],
      rows: [
        ["Session", "The whole client session", "Everything works; you barely multiplex"],
        ["Transaction", "One transaction", "Multiplexes well; breaks session state"],
        ["Statement", "One statement", "Multi-statement transactions cannot work"],
      ],
    },
    {
      type: "p",
      text: "Session mode is completely safe and largely pointless. If clients hold connections open while idle, the pooler is holding real connections open too, and you have added a hop without solving anything.",
    },
    {
      type: "p",
      text: "Transaction mode is where the benefit is. A connection is borrowed for a transaction and returned immediately, so a small number of real connections can serve a large number of clients.",
    },
    {
      type: "p",
      text: "It also changes an assumption your application probably makes without knowing it.",
    },
    { type: "h2", id: "session-state", text: "Anything you set on a session is gone" },
    {
      type: "p",
      text: "In transaction mode, consecutive statements from one client may run on different backend connections. Anything set on a connection outside a transaction does not follow the client.",
    },
    {
      type: "p",
      text: "A search path set at connection time. A time zone. A session variable your ORM sets during initialisation. All of it applies to a connection you will not necessarily get back.",
    },
    {
      type: "p",
      text: "The failure is nasty because it is intermittent and looks like a data problem. Reports come back in the wrong time zone sometimes. A query cannot find a table sometimes. It depends entirely on which backend served the request.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Prepared statements are the usual casualty",
      text: "A named prepared statement is prepared on one backend connection. Under transaction pooling, the next call can land somewhere else, and that backend has never heard of it. You get an error saying the prepared statement does not exist — from an application that worked yesterday and changed nothing.",
    },
    {
      type: "p",
      text: "This bites hardest with ORMs, because they use prepared statements by default and rarely make it obvious.",
    },
    {
      type: "p",
      text: "There are three ways out. Configure the driver not to use server-side prepared statements. Use a driver mode that avoids naming them. Or use a PgBouncer version that tracks prepared statements across backends, which is supported in recent releases and needs configuring rather than assuming.",
    },
    { type: "h2", id: "rds-proxy", text: "RDS Proxy, and the pinning behaviour to know about" },
    {
      type: "p",
      text: "AWS RDS Proxy solves the same problem as a managed service, which removes the job of running poolers yourself. It also handles failover by holding client connections while the database endpoint changes, and supports authenticating with IAM rather than a stored password.",
    },
    {
      type: "p",
      text: "It multiplexes like transaction pooling, so the session-state caveats apply in the same way. But it has one behaviour worth understanding before you rely on it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Session state causes pinning, and pinning removes the benefit",
      text: "When RDS Proxy sees something that makes a connection stateful, it pins that client to one backend connection for the rest of the session rather than breaking your application. That is the safe choice, and it means the connection is no longer shared. Enough pinning and you are paying for a proxy that has quietly stopped pooling.",
    },
    {
      type: "p",
      text: "This is the important operational point: it does not fail, it degrades. Watch the pinning metrics rather than assuming multiplexing is happening. If pinning is high, find what is triggering it in the application.",
    },
    {
      type: "p",
      text: "Not every Postgres feature is supported through the proxy either. If you depend on anything unusual, check before designing around it.",
    },
    { type: "h2", id: "scenario", text: "How this arrives in production" },
    {
      type: "p",
      text: "The sequence is consistent enough to be predictable.",
    },
    {
      type: "p",
      text: "An application scales out under load. Each replica opens its own pool. Total connections cross the limit, and the database starts refusing new clients. Replicas fail health checks, get restarted, and reconnect — which produces more connection attempts at exactly the wrong moment.",
    },
    {
      type: "p",
      text: "A pooler goes in, in transaction mode, and the outage ends. Then the errors start: prepared statements that do not exist, and a reporting job returning wrong time zones because it set one at connection time.",
    },
    {
      type: "p",
      text: "Both problems were always there. Transaction pooling just stopped hiding them. That is worth knowing in advance, because discovering it during an incident means changing driver configuration under pressure.",
    },
    { type: "h2", id: "replication", text: "One thing to check on your version" },
    {
      type: "p",
      text: "Replication and change-data-capture connections need their own headroom, and how they interact with the general connection limit has differed between PostgreSQL versions.",
    },
    {
      type: "p",
      text: "The consequence, if you get it wrong, is worth avoiding: connection exhaustion that also stops replication, so a busy period silently produces replica lag. Check the settings for the version you run rather than trusting a blog post — including this one.",
    },
    { type: "h2", id: "choosing", text: "Choosing a pooler" },
    {
      type: "table",
      caption: "Both are reasonable; the choice is mostly operational",
      head: ["PgBouncer when", "RDS Proxy when"],
      rows: [
        [
          "You need different modes for different applications",
          "You are on AWS and want it managed",
        ],
        [
          "You run outside AWS, or on your own instances",
          "Failover handling matters more than tuning",
        ],
        [
          "You want no per-hour cost for the pooler",
          "You want IAM authentication instead of passwords",
        ],
        ["You are comfortable operating it", "You would rather not operate one"],
      ],
    },
    {
      type: "p",
      text: "Either way, keep the application-level pool as well. Your application pools to the proxy; the proxy pools to Postgres. Removing the first one just adds a handshake to every query.",
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Keep the real connection limit modest and put a pooler in front. Raising the limit trades a clear error for a slow one.",
        "Use transaction pooling, and check what your application sets on a session before you do.",
        "Fix prepared statements deliberately — driver setting, driver mode, or a pooler version that handles them.",
        "Watch pinning on RDS Proxy. It fails quietly by working less well.",
        "Never rely on application pools alone once you have more than a couple of replicas.",
      ],
    },
    {
      type: "p",
      text: "None of this is a criticism of Postgres. The process model buys real isolation, and the cost only shows up at a scale most systems never reach. But once many replicas share one database, connections become a resource you manage deliberately. The pooling mode that makes that work is the same one that quietly changes what a session means. Similar reasoning applies wherever [capacity and connection limits move together](/cloud/aurora-serverless-v2-scaling-connection-limits).",
    },
  ],
  faq: [
    {
      question: "Why not just raise max_connections?",
      answer:
        "Because each one is a process. Allow thousands and the machine spends its time switching between them. You swap a clear error for slow queries everywhere.",
    },
    {
      question: "Why do I get 'prepared statement does not exist'?",
      answer:
        "Transaction pooling moved you to a different backend. That one never saw the statement. Change the driver setting, or use a pooler version that tracks them.",
    },
    {
      question: "Do I still need a pool inside my application?",
      answer:
        "Yes. It saves a handshake on every query. Your app pools to the proxy, and the proxy pools to the database. The two do different jobs.",
    },
    {
      question: "What is pinning on RDS Proxy?",
      answer:
        "When it spots session state, it ties you to one backend so your app keeps working. Sharing stops for that client. Nothing errors, so watch the metric.",
    },
    {
      question: "Which pooling mode should I use?",
      answer:
        "Transaction mode, in almost every case. Session mode is safe but barely pools. Check what your app sets on a session before you switch.",
    },
  ],
  sources: [
    {
      title: "PostgreSQL: Connections and Authentication",
      publisher: "PostgreSQL",
      url: "https://www.postgresql.org/docs/current/runtime-config-connection.html",
    },
    {
      title: "PgBouncer configuration: pooling modes",
      publisher: "PgBouncer",
      url: "https://www.pgbouncer.org/config.html",
    },
    {
      title: "PgBouncer FAQ: prepared statements and transaction pooling",
      publisher: "PgBouncer",
      url: "https://www.pgbouncer.org/faq.html",
    },
    {
      title: "Using Amazon RDS Proxy",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html",
    },
    {
      title: "Avoiding pinning with RDS Proxy",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy-managing.html",
    },
  ],
};
