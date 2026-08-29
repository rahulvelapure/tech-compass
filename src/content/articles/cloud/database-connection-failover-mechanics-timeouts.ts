import type { Article } from "../../types";

export const article: Article = {
  slug: "database-connection-failover-mechanics-timeouts",
  category: "cloud",
  contentType: "troubleshooting",
  subcategory: "Database",
  title: "The database recovered in a minute. The application did not notice for fifteen",
  seoTitle: "Database Failover: Why Applications Hang After Recovery",
  metaDescription:
    "The primary is promoted in under a minute, but the application keeps hanging. The cause is a half-open socket, a cached DNS answer, and a timeout that never fires.",
  standfirst:
    "Failover is not done when the database is healthy. It is done when the app has noticed. Nothing makes that happen quickly.",
  excerpt:
    "When a primary dies without warning, the client's socket stays open and the kernel retransmits for a very long time. Keepalives do not rescue it, because keepalives only probe idle connections. Here is what actually does.",
  authorId: "rahul-velapure",
  publishedAt: "2026-03-30",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 6,
  primaryKeyword: "database connection failover mechanics",
  secondaryKeywords: [
    "TCP_USER_TIMEOUT database",
    "tcp_retries2 timeout",
    "half-open TCP connection",
    "libpq target_session_attrs",
    "DNS caching failover",
  ],
  tags: ["Databases", "Cloud", "Networking", "Reliability", "PostgreSQL"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "postgresql-connection-pooling-pgbouncer-rds-proxy",
    "aurora-serverless-v2-scaling-connection-limits",
  ],
  methodology:
    "Written from the Linux tcp(7) manual page, PostgreSQL libpq connection documentation and managed-database failover documentation, verified August 2026. The source draft's central recommendation — that aggressive TCP keepalives shorten failover detection — is corrected here: keepalives probe idle connections only, and a connection blocked mid-query is governed by retransmission instead. Invented failover durations, user counts and a fabricated incident narrative were removed.",
  body: [
    {
      type: "p",
      text: "The managed database does its job. The primary fails and the service spots it. A replica is promoted. The endpoint moves to the new node. The console goes green, well inside the window the vendor promised.",
    },
    {
      type: "p",
      text: "The application does not report healthy. It sits there, threads blocked, pool exhausted, long after there is a working database on the other end waiting to be asked something.",
    },
    {
      type: "p",
      text: "This is rarely a database fault. The mechanics that matter here belong to the network stack: a socket, a name lookup and a timeout. Each behaves exactly as documented. None of them knows a failover happened.",
    },
    { type: "h2", id: "half-open", text: "The socket nobody told" },
    {
      type: "p",
      text: "TCP is stateful at both ends. When a node dies cleanly it sends a FIN or a RST and the client learns immediately. When a node dies badly — power, hypervisor, a partition that isolates it — it sends nothing at all.",
    },
    {
      type: "p",
      text: "The client's connection is now half-open. The kernel still has an established socket. The peer no longer exists. Nothing has happened that would tell the client otherwise, because in TCP an absence of packets is not an event.",
    },
    {
      type: "p",
      text: "Send a query into that socket and the data goes unacknowledged, so the kernel retransmits with exponential backoff. How long it keeps trying is governed by `tcp_retries2`, which defaults to 15. The manual page puts the resulting timeout at roughly 13 to 30 minutes depending on the retransmission timeout in effect.",
    },
    {
      type: "p",
      text: "For that entire period the calling thread is blocked in the kernel, and the pooled connection it borrowed is gone. Enough of those and the pool is empty, at which point the application stops serving traffic that has nothing to do with the failed query.",
    },
    { type: "h2", id: "keepalive", text: "Why keepalives do not fix this" },
    {
      type: "p",
      text: "The standard advice is to turn TCP keepalives down from their two-hour default so dead peers are detected in a couple of minutes. The advice is not wrong, but it solves a different problem than the one most people are trying to solve with it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Keepalives probe idle connections only",
      text: "A keepalive probe is sent after a connection has been idle for `tcp_keepalive_time`. A connection with unacknowledged data in flight is not idle, so it is governed by retransmission and `tcp_retries2`, not by your keepalive settings. Tuned keepalives clean up pooled connections sitting unused between queries. They do nothing for the thread currently hanging on a query, which is the case people are usually trying to fix.",
    },
    {
      type: "p",
      text: "The control that does cover it is `TCP_USER_TIMEOUT`: the maximum time transmitted data may remain unacknowledged before TCP closes the connection itself. It applies to data in flight, which is exactly the gap keepalives leave.",
    },
    {
      type: "p",
      text: "It also interacts with keepalives usefully. Where both are set, `TCP_USER_TIMEOUT` determines when a connection is closed for keepalive failure. It does not change when a packet is retransmitted or when a probe is sent — it changes how long the stack will tolerate the silence before giving up.",
    },
    {
      type: "table",
      caption: "Which control governs which failure",
      head: ["Situation", "What governs it", "Default behaviour"],
      rows: [
        ["Idle pooled connection, peer gone", "Keepalive timers", "First probe after two hours"],
        ["Query in flight, peer gone", "`tcp_retries2` retransmission", "Roughly 13–30 minutes"],
        ["Query in flight, with the option set", "`TCP_USER_TIMEOUT`", "Whatever you chose"],
        ["Query running, database alive", "Statement timeout", "None unless you set one"],
      ],
    },
    {
      type: "p",
      text: "Set all three together. Keepalives stop idle connections going stale in the pool. A user timeout stops a blocked query outliving the incident. A statement timeout covers the rest, because a database you can reach is not always a quick one.",
    },
    { type: "h2", id: "dns", text: "The name that still points at a dead node" },
    {
      type: "p",
      text: "Managed services hide the topology behind one name, then move that name when they fail over. That works, so long as everyone in the resolution path notices.",
    },
    {
      type: "p",
      text: "Two things commonly stop them noticing. A resolver or cache holds the old answer past its time to live, so reconnection attempts return to the address that just died. Other drivers resolve the name once, when the pool is built, and never again. No time to live applies at all. The pool keeps dialling an address the provider stopped using.",
    },
    {
      type: "p",
      text: "On the JVM, check this rather than assume it. DNS caching there is a JVM setting, not an OS one. On any platform the test is simple. Fail something over on purpose, then watch where the reconnect attempts go.",
    },
    { type: "h2", id: "drivers", text: "What the driver can do about it" },
    {
      type: "p",
      text: "The PostgreSQL client library accepts several hosts in one connection string and tries them in turn. Add `target_session_attrs=read-write` and the driver also checks that the node it reached can accept writes. If it landed on a replica, it moves on. That check matters more than it looks. Reaching the wrong node fails later, and far less obviously, than not connecting at all.",
    },
    {
      type: "p",
      text: "That only helps when the driver can see the nodes. Behind a single cluster endpoint there is one host to try, so multi-host failover has nothing to work with and the DNS path becomes the whole story.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Automatic reconnection is not a feature",
      text: "Drivers that silently re-establish a dropped connection mid-transaction — MySQL's `autoReconnect` being the well-known example — trade an error you can handle for one you cannot see. The new connection has none of the previous transaction state, so statements that the application believes are inside a transaction are not. Prefer a clean failure and an explicit retry at a point where the application knows what it was doing.",
    },
    { type: "h2", id: "pools", text: "Where connection pools sit in this" },
    {
      type: "p",
      text: "A pool's timeouts live in the application. When the thread is blocked inside a kernel socket call, those settings never get a turn. That is how a pool with a thirty-second timeout stays stuck for far longer.",
    },
    {
      type: "p",
      text: "This is the best argument for putting a proxy between the app and the database. The proxy holds the client connection open. It deals with the reconnect itself, so the app never sees the half-open socket. That is a different job from the multiplexing and connection-limit work covered in [connection pooling with PgBouncer and RDS Proxy](/cloud/postgresql-connection-pooling-pgbouncer-rds-proxy), though the same components often do both.",
    },
    {
      type: "p",
      text: "It is not free. A proxy is another hop, another thing to run, and another component that can fail. The trade is real, and worth making deliberately rather than discovering during an incident.",
    },
    { type: "h2", id: "test", text: "The only way to know" },
    {
      type: "p",
      text: "Every setting here has a default that is wrong for failover and correct for the case it was designed for. None of them announce themselves. The way to find out what your stack does is to make a primary disappear, on purpose, while you are watching.",
    },
    {
      type: "ol",
      items: [
        "Force a failover outside production while traffic is running, not while the system is idle.",
        "Measure the gap between the database accepting writes again and the application serving requests again. That gap is the number that matters, and it is the one nobody has.",
        "Watch where reconnection attempts are addressed. If they go to the old IP, the problem is resolution, not TCP.",
        "Check whether threads are blocked in the kernel or failing fast. That tells you whether your timeouts are actually in effect.",
        "Do it again after any driver, pool or platform upgrade. These behaviours are tied to the version, and they change without fanfare.",
      ],
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "The database being healthy is not the end of a failover. The application noticing is.",
        "Keepalives cover idle sockets. `TCP_USER_TIMEOUT` covers a query in flight. Do not use one where you need the other.",
        "Untuned, a blocked query can wait far longer than the failover took — the manual page says 13 to 30 minutes.",
        "Confirm your driver re-resolves DNS on reconnect. Some never do.",
        "Set a statement timeout as well; a reachable database can still be slow.",
        "A proxy removes the problem from the application entirely, at the cost of another hop.",
        "Test by failing over with traffic running. Nothing else tells you what your stack does.",
      ],
    },
  ],
  faq: [
    {
      question: "Why does the application hang when the database recovered quickly?",
      answer:
        "Its socket is half-open. The other end vanished without a word. So the kernel keeps resending until it gives up. By default that takes many minutes.",
    },
    {
      question: "Will aggressive TCP keepalives fix it?",
      answer:
        "Only when the socket is idle. A socket waiting on a query is not idle. So those timers never touch it. Use a user timeout instead.",
    },
    {
      question: "Is a proxy the simplest answer?",
      answer:
        "Often yes. It keeps the client connection up and handles reconnection itself. You trade an app problem for an extra hop, and one more thing to run.",
    },
    {
      question: "What is wrong with automatic reconnection in the driver?",
      answer:
        "It reconnects without the transaction state. The app thinks it is mid-transaction. It is not. So failures go quiet instead of loud.",
    },
    {
      question: "How low should a statement timeout be?",
      answer:
        "Above your slowest real query, with margin. Go lower and you cancel real work. Set it from measured latency, not a round number that felt safe.",
    },
  ],
  sources: [
    {
      title: "tcp(7) — TCP protocol, socket options and timeouts",
      publisher: "Linux man-pages project",
      url: "https://man7.org/linux/man-pages/man7/tcp.7.html",
    },
    {
      title: "libpq connection strings and parameters",
      publisher: "PostgreSQL Global Development Group",
      url: "https://www.postgresql.org/docs/current/libpq-connect.html",
    },
    {
      title: "Amazon Aurora PostgreSQL: managing fault tolerance",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.Managing.FaultTolerance.html",
    },
    {
      title: "High availability and failover for Azure Database for PostgreSQL",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/azure/postgresql/flexible-server/concepts-high-availability",
    },
  ],
};
