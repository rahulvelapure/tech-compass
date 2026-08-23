import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-lambda-cold-start-optimization-snapstart",
  category: "cloud",
  contentType: "explainer",
  subcategory: "Serverless",
  title: "A cold start has phases, and only one of them responds to more memory",
  seoTitle: "AWS Lambda cold starts: SnapStart and provisioned concurrency",
  metaDescription:
    "Cold start latency comes from separate phases with separate fixes. What SnapStart changes, what it breaks, and when provisioned concurrency costs more than servers.",
  standfirst:
    "Adding memory is the usual advice. It helps with one part of a cold start and does nothing for the rest.",
  excerpt:
    "A cold start is several phases, not one number. Which fix applies depends on which phase dominates — and the two AWS-native answers each come with a catch worth knowing first.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-23",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "AWS Lambda cold start",
  secondaryKeywords: [
    "Lambda SnapStart",
    "provisioned concurrency cost",
    "Lambda init phase",
    "CRaC checkpoint restore",
    "lazy initialization Lambda",
  ],
  tags: ["AWS", "Cloud", "Serverless", "Performance", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["aurora-serverless-v2-scaling-connection-limits", "cloud-cost-controls"],
  methodology:
    "Written from AWS documentation on the Lambda execution environment lifecycle, SnapStart, provisioned concurrency and function scaling, plus the OpenJDK CRaC project, verified August 2026. Latency figures and cold start durations are deliberately not given: they depend on runtime, package size, dependencies and region. Two claims in the source draft had changed since it was written and are flagged as version-dependent rather than restated.",
  body: [
    {
      type: "p",
      text: "Cold starts are the thing people complain about most with Lambda. They are also the thing people get wrong most.",
    },
    {
      type: "p",
      text: "The usual advice is to add memory. Sometimes that works well. Often it does nothing, because the delay was never in the part that memory affects.",
    },
    {
      type: "p",
      text: "A cold start is several steps with different causes. Knowing which one dominates yours is the difference between a fix and a guess.",
    },
    { type: "h2", id: "phases", text: "What actually happens before your code runs" },
    {
      type: "p",
      text: "When Lambda needs a new execution environment, it works through a sequence.",
    },
    {
      type: "ol",
      items: [
        "**A microVM is provisioned.** Lambda allocates an isolated environment to run in.",
        "**Your package is fetched and unpacked.** Deployment package and any layers.",
        "**The runtime starts.** The language runtime boots.",
        "**Your initialisation code runs.** Global variables, SDK clients, connection pools — everything outside the handler.",
        "**The handler runs.** This is the part billed as duration for that request.",
      ],
    },
    {
      type: "p",
      text: "The user waits for all of it. You are only billed for the last part, which is why cold start pain often does not show up as a cost problem.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Why more memory sometimes does nothing",
      text: "Memory allocation also raises CPU, so it speeds up work the processor is doing — booting a runtime and running your initialisation. It cannot speed up fetching a large package over a network. If your delay is in step two, more memory buys you nothing and costs more per invocation.",
    },
    {
      type: "p",
      text: "So the first move is measurement, not tuning. Lambda reports initialisation duration separately from invocation duration. Those two numbers tell you which half of the problem you have.",
    },
    { type: "h2", id: "snapstart", text: "SnapStart skips the startup entirely" },
    {
      type: "p",
      text: "Some runtimes are slow to start by nature. A JVM booting an application framework does a great deal of work before it can serve anything.",
    },
    {
      type: "p",
      text: "SnapStart takes a different approach. Instead of doing that work on every cold start, it does it once at deployment: the runtime starts, your initialisation code runs, and the memory state is captured as a snapshot.",
    },
    {
      type: "p",
      text: "An invocation then restores that snapshot instead of starting from nothing. The application resumes in the state it was already in. Steps three and four effectively disappear.",
    },
    {
      type: "p",
      text: "It is a genuinely different mechanism from keeping something warm, and it is built on checkpoint and restore work from the OpenJDK project rather than being a Lambda trick.",
    },
    { type: "h3", id: "snapstart-limits", text: "Two things it breaks" },
    {
      type: "p",
      text: "Restoring a snapshot means restoring everything that was in memory, including things that should not have been frozen.",
    },
    {
      type: "p",
      text: "**Connections go stale.** A database connection opened during initialisation is captured in the snapshot. When that snapshot is restored later, the other end may have closed it long ago. The application holds something that looks like a connection and is not one. Drivers need to validate and reconnect, and this is the same reconnection discipline that [connection handling on a scaling database](/cloud/aurora-serverless-v2-scaling-connection-limits) already asks for.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Frozen randomness is the dangerous one",
      text: "If a random number generator is seeded during initialisation, that seed is captured in the snapshot. Every restore then starts from the identical seed. Thousands of invocations produce the same 'random' values, which quietly destroys anything depending on them being unpredictable. There is a restore hook for re-seeding, and using it is not optional.",
    },
    {
      type: "p",
      text: "That second one is worth dwelling on because nothing fails. No error, no alarm. The values look random until someone compares two invocations.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Which runtimes support it has changed",
      text: "SnapStart began as a Java feature, and much of the writing about it still says Java only. Runtime support has expanded since. Check the current documentation for the runtime you use rather than assuming it is unavailable.",
    },
    { type: "h2", id: "provisioned", text: "Provisioned concurrency, and the bill" },
    {
      type: "p",
      text: "The other native answer is to keep environments initialised and waiting. Requests land on something already warm, and there is no cold start.",
    },
    {
      type: "p",
      text: "It works. It also inverts the economics that made Lambda attractive.",
    },
    {
      type: "p",
      text: "You pay for those environments by the hour, whether or not they handle a request. Provision for a peak that lasts a couple of hours and you pay for that capacity the rest of the day too. At that point you are paying for idle compute, which is what containers do — often for less.",
    },
    {
      type: "p",
      text: "So it is worth comparing directly against running the same workload on a container platform before committing. If the answer is that containers are cheaper, that is useful information rather than a failure.",
    },
    {
      type: "p",
      text: "Scaling the provisioned count on a schedule helps for predictable traffic. It does not help for unpredictable traffic, because warming environments takes time. An unexpected spike arrives before the extra capacity does, and you get cold starts anyway.",
    },
    { type: "h2", id: "code", text: "The option that costs nothing" },
    {
      type: "p",
      text: "When SnapStart does not apply and provisioned concurrency is too expensive, there is still work worth doing in the function itself.",
    },
    {
      type: "ul",
      items: [
        "**Initialise lazily.** Move client construction out of global scope and build it on first use, caching it for later invocations. The first request pays; the rest do not, and cold starts get shorter.",
        "**Cut the package.** Everything in the deployment package is fetched before anything runs. Trimming unused dependencies attacks the phase memory cannot help with.",
        "**Watch your extensions.** Observability agents run as separate processes and initialise during the cold start. They are worth having and they are not free — check what yours adds.",
        "**Stream the response where it fits.** Sending headers early keeps a client from timing out while the body is still being produced. It does not make the function faster; it changes what the user experiences.",
      ],
    },
    { type: "h2", id: "traps", text: "Two limits that produce confusing failures" },
    {
      type: "p",
      text: "**Initialisation has its own timeout.** Heavy work in global scope — downloading a model, warming a large cache — can exceed it. The function then fails before your handler ever runs, and the logs point at initialisation rather than at anything you wrote in the handler.",
    },
    {
      type: "p",
      text: "**Throttling rejects, it does not queue.** Past the concurrency limit, requests are refused rather than held. A client that treats rejection as a reason to retry immediately makes the situation worse. Provisioned environments count toward the same limits.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Check the gateway timeout too",
      text: "The maximum time an API Gateway will wait used to be a fixed ceiling, and a lot of guidance still treats it as fixed. That has changed for some configurations. Confirm the current limit for the API type you use before designing around it.",
    },
    { type: "h2", id: "choosing", text: "Choosing a fix" },
    {
      type: "table",
      caption: "Match the fix to where the time is actually going",
      head: ["If the delay is", "The fix is"],
      rows: [
        ["Runtime and framework startup", "SnapStart, where your runtime supports it"],
        ["Fetching a large package", "Trim dependencies; memory will not help"],
        ["Work in your initialisation code", "Lazy initialisation, or SnapStart"],
        [
          "Unavoidable and latency is critical",
          "Provisioned concurrency, costed against containers",
        ],
        ["Only felt at the client", "Response streaming and sensible client timeouts"],
      ],
    },
    { type: "h2", id: "takeaways", text: "What to do with this" },
    {
      type: "ul",
      items: [
        "Measure initialisation separately from invocation before changing anything.",
        "If you use SnapStart, re-seed randomness on restore and validate connections. Both fail silently.",
        "Cost provisioned concurrency over a full day, then compare it with containers.",
        "Move heavy setup out of global scope, both for latency and to avoid the initialisation timeout.",
        "Check current runtime support and gateway limits rather than trusting older guidance, including this article's own framing.",
      ],
    },
    {
      type: "p",
      text: "Cold starts are treated as one problem with one fix, and that is why the standard advice disappoints so often. They are several problems that happen to share a symptom. Once you know which phase your latency lives in, the choice between snapshotting, pre-warming and simply writing the function differently becomes obvious — and one of those three is usually free.",
    },
  ],
  faq: [
    {
      question: "Will more memory fix my cold start?",
      answer:
        "Only if the time is going into work the CPU does. It will not speed up fetching a large package. Check the init duration first, then decide.",
    },
    {
      question: "What does SnapStart actually do?",
      answer:
        "It starts your function once at deploy time and saves the memory state. Later calls restore that state instead of starting up. The slow part happens once.",
    },
    {
      question: "Why would SnapStart break my random numbers?",
      answer:
        "Because the seed is saved in the snapshot too. Every restore then starts from the same one. Nothing errors, so you only find out by comparing runs.",
    },
    {
      question: "Is provisioned concurrency worth it?",
      answer:
        "Sometimes, but price it for a whole day, not the busy hour. You pay while it sits idle. Quite often a container works out cheaper.",
    },
    {
      question: "Why does my function fail before the handler runs?",
      answer:
        "Your setup code is probably taking too long. There is a time limit on that phase. Move heavy downloads and warm-ups into the handler.",
    },
  ],
  sources: [
    {
      title: "Lambda execution environment lifecycle",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html",
    },
    {
      title: "Improving startup performance with Lambda SnapStart",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html",
    },
    {
      title: "Lambda SnapStart uniqueness and runtime hooks",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/snapstart-uniqueness.html",
    },
    {
      title: "Configuring provisioned concurrency",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html",
    },
    {
      title: "CRaC: Coordinated Restore at Checkpoint",
      publisher: "OpenJDK",
      url: "https://openjdk.org/projects/crac/",
    },
  ],
};
