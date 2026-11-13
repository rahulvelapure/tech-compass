import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-lambda-concurrency-reserved-provisioned-throttling",
  category: "cloud",
  contentType: "explainer",
  subcategory: "Serverless",
  title: "Your function is fine. The account it lives in ran out of room",
  seoTitle: "Lambda Concurrency: Reserved, Provisioned and Throttling",
  metaDescription:
    "How Lambda concurrency, the requests-per-second ceiling and the scaling rate interact, and why reserved concurrency is a cap as well as a floor.",
  standfirst:
    "Throttling is not a code problem. It is a capacity limit, and there are three of them, not one.",
  excerpt:
    "Most teams know the 1,000 concurrency limit. Fewer know about the requests-per-second ceiling sitting above it, which is the one that catches short functions first.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-27",
  nextReviewAt: "2027-02-27",
  readingMinutes: 6,
  primaryKeyword: "AWS Lambda concurrency reserved provisioned throttling",
  secondaryKeywords: [
    "Lambda requests per second limit",
    "concurrency scaling rate",
    "TooManyRequestsException",
    "unreserved concurrency",
    "Lambda event source mapping MaximumConcurrency",
  ],
  tags: ["AWS", "Serverless", "Cloud", "Capacity", "Reliability"],
  reviewStatus: "research-based",
  relatedSlugs: ["aws-lambda-cold-start-optimization-snapstart", "cloud-cost-controls"],
  methodology:
    "Written from the AWS Lambda documentation on function scaling, reserved concurrency, provisioned concurrency and event source mappings, verified August 2026. Three corrections were made against the source draft. The draft omits the requests-per-second ceiling entirely, which is ten times the concurrency quota and binds first on functions under 100 ms. It omits the per-function scaling rate. It also warns against reserving the whole account limit, which Lambda does not permit: 100 units always stay unreserved. No pricing, latency figures or cost comparisons are quoted, because the draft's examples are illustrative rather than measured.",
  body: [
    {
      type: "p",
      text: "The function is healthy. The code has not changed. The logs show no errors at all, and callers are still getting rejected.",
    },
    {
      type: "p",
      text: "That is throttling, and it is a capacity decision made above your function. Lambda enforces several limits at once, and the one that bites is often not the one people watch.",
    },
    { type: "h2", id: "what", text: "Concurrency is not requests per second" },
    {
      type: "p",
      text: "Concurrency is the number of requests in flight at once. Each one needs its own execution environment. So concurrency is really a count of environments.",
    },
    {
      type: "p",
      text: "It follows from throughput and duration together:",
    },
    {
      type: "code",
      language: "text",
      code: "concurrency = requests per second x average duration in seconds",
    },
    {
      type: "p",
      text: "A function handling 100 requests a second at one second each needs 100. Halve the duration and the same traffic needs 50. Duration is half the equation, which is why a slow dependency raises concurrency without raising traffic.",
    },
    { type: "h2", id: "ceiling", text: "The ceiling most teams have never read" },
    {
      type: "p",
      text: "A new account gets 1,000 concurrent executions per region, shared by every function in it. That number is well known.",
    },
    {
      type: "p",
      text: "The second limit is not. Lambda also enforces a requests-per-second cap equal to ten times your concurrency quota. At the default, that is 10,000 requests a second.",
    },
    {
      type: "p",
      text: "For most functions this never matters, because concurrency runs out first. For short functions it is the opposite, and the arithmetic is worth doing once.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Where the two limits cross",
      text: "Take a function averaging 50 ms at 20,000 requests a second. Concurrency works out at 1,000, which looks like it just fits the default quota. It does not run, because 20,000 requests a second is over the 10,000 cap. The fix is a quota increase, not a code change, and no amount of reserved concurrency will move it.",
    },
    {
      type: "p",
      text: "A rule of thumb. Under about 100 ms, check the request rate first. Above that, concurrency is usually what binds.",
    },
    { type: "h2", id: "reserved", text: "Reserved concurrency cuts both ways" },
    {
      type: "p",
      text: "Reserved concurrency takes a slice of the account pool and gives it to one function. Nothing else can use that slice.",
    },
    {
      type: "p",
      text: "It is also a hard cap. The function cannot exceed its reservation, and it cannot borrow from the unreserved pool either. People set it as a guarantee and then discover it is a ceiling.",
    },
    {
      type: "p",
      text: "That cuts both ways on purpose. A reservation shields a critical function from noisy neighbours. It also shields a fragile database from that function.",
    },
    {
      type: "table",
      caption: "What reserved concurrency does",
      head: ["Effect", "Consequence"],
      rows: [
        ["Guarantees capacity", "Other functions cannot take it, even when yours is idle"],
        [
          "Caps the function",
          "Traffic above the reservation is throttled while the account has room",
        ],
        ["Counts against the account quota", "Reserving reduces what everything else can share"],
        ["Set to zero", "Every invocation is throttled, which makes it a usable stop switch"],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "You cannot reserve all of it",
      text: "Lambda always keeps 100 units unreserved for functions with no reservation of their own. At the default quota you can reserve up to 900 across all functions, not 1,000. The common warning about accidentally reserving the entire account limit describes something the service will not let you do.",
    },
    { type: "h2", id: "provisioned", text: "Provisioned concurrency is a different lever" },
    {
      type: "p",
      text: "Provisioned concurrency starts environments early, so they are warm when traffic lands. It removes cold starts. It does not raise any limit.",
    },
    {
      type: "p",
      text: "It counts against the account quota like everything else. If the function has a reservation too, the warm pool must fit inside it.",
    },
    {
      type: "p",
      text: "Two details cause most of the confusion. The first is where it attaches. You set it on a version or an alias, never on the unpublished latest version. Ship new code without moving the alias and the warm pool stays on the old one.",
    },
    {
      type: "p",
      text: "The second is that a version cannot use a warm pool and SnapStart at the same time. They fix different parts of the same delay, and the [cold start breakdown](/cloud/aws-lambda-cold-start-optimization-snapstart) sets out which part each one reaches.",
    },
    { type: "h2", id: "rate", text: "How fast you are allowed to grow" },
    {
      type: "p",
      text: "There is a third limit, and it is about speed rather than size. Each function can add up to 1,000 environments every 10 seconds.",
    },
    {
      type: "p",
      text: "That rate is per function, so one function scaling hard no longer slows the others down. It also means a step change in traffic is absorbed in stages, not instantly.",
    },
    {
      type: "p",
      text: "A marketing send or a batch job can create a vertical wall of traffic. The early seconds then throttle, even though the account has room. A warm pool is the usual answer. It puts the environments in place before the wall arrives.",
    },
    { type: "h2", id: "shape", text: "Throttling looks different per trigger" },
    {
      type: "p",
      text: "What a throttle does to your data depends entirely on how the function was invoked. This is the part worth knowing before an incident.",
    },
    {
      type: "table",
      caption: "Throttle behaviour by invocation type",
      head: ["Invocation", "What happens", "What you lose"],
      rows: [
        [
          "Synchronous (API Gateway, ALB, SDK)",
          "TooManyRequestsException, HTTP 429",
          "Nothing, if the caller retries. The caller owns the retry",
        ],
        [
          "Asynchronous (S3, SNS, EventBridge)",
          "Lambda retries, then sends the event to a destination or dead-letter queue",
          "The event, if neither is configured",
        ],
        [
          "Poll-based (SQS, Kinesis, DynamoDB Streams)",
          "Lambda backs off and keeps polling",
          "Nothing immediately. SQS messages can still expire or hit the redrive limit",
        ],
      ],
    },
    {
      type: "p",
      text: "The asynchronous row is where silent data loss lives. Without a failure destination or a dead-letter queue, a throttled event that exhausts its retries is simply gone, and nothing in the function's metrics records it as a loss.",
    },
    {
      type: "p",
      text: "The poll-based row hides a different trap. During a backlog, a queue-driven function can eat the whole unreserved pool. Bound it with MaximumConcurrency on the event source mapping. That caps the queue path alone, where a reservation would cap the function everywhere.",
    },
    { type: "h2", id: "metrics", text: "The four metrics that tell you the truth" },
    {
      type: "p",
      text: "Lambda publishes enough to diagnose this without guessing. Four metrics carry almost all of the signal.",
    },
    {
      type: "ul",
      items: [
        "Throttles. Any value above zero means requests were refused. This is the alarm you cannot skip.",
        "ConcurrentExecutions. Watch it against the reservation, not against the account quota, if the function has one.",
        "UnreservedConcurrentExecutions. This is the shared pool. When it runs dry, every unreserved function suffers at once.",
        "ProvisionedConcurrencySpilloverInvocations. Calls that ran past the warm pool. A steady number here means the pool is too small.",
      ],
    },
    {
      type: "p",
      text: "One command gives you the account picture before you start reading graphs. It reports the quota and how much of it is still available to reserve.",
    },
    {
      type: "code",
      language: "bash",
      command: true,
      code: "aws lambda get-account-settings --query AccountLimit",
    },
    {
      type: "p",
      text: "The unreserved figure in that output is the headroom left for new reservations. Watch it fall as teams add their own. Nobody tracks that total across an account until the day it runs out.",
    },
    { type: "h2", id: "practice", text: "What to actually configure" },
    {
      type: "ol",
      items: [
        "Work out concurrency from your own metrics, using peak request rate and average duration, not a guess.",
        "Check the request rate against the ten-times ceiling before anything else if the function runs under 100 ms.",
        "Reserve concurrency for functions that must not be starved, and for those that must not overwhelm a database.",
        "Leave real headroom in the unreserved pool. Everything without a reservation shares it.",
        "Add provisioned concurrency only where cold starts are unacceptable or traffic arrives as a wall.",
        "Alarm on Throttles above zero, and on ConcurrentExecutions approaching the reservation.",
        "Configure a failure destination for every asynchronous function.",
      ],
    },
    {
      type: "p",
      text: "Review the numbers when traffic shape changes, not on a calendar. A release that cuts duration in half also halves concurrency, and the reservation you set last quarter is now twice the size you need. That spare capacity is not free. It is capacity no other function can reach.",
    },
    {
      type: "p",
      text: "Throttling is silent by design. Lambda has done exactly what it was configured to do, so nothing reports an error. The alarm on Throttles is the only thing that tells you, and it is the one most accounts do not have.",
    },
  ],
  faq: [
    {
      question: "Is the 1,000 limit per account or per region?",
      answer: "Per region, in each account. Ask for more and AWS can raise it.",
    },
    {
      question: "Does reserved concurrency cost anything?",
      answer:
        "No. It only shifts capacity between functions. The warm pool is the part you pay for.",
    },
    {
      question: "What error does a caller see?",
      answer: "A 429, and the call is refused. The caller has to send it again.",
    },
    {
      question: "Can I stop one function without deleting it?",
      answer: "Yes. Set its reserved limit to zero. Every call is then turned away.",
    },
    {
      question: "Why do I still get cold starts with a warm pool?",
      answer:
        "Check which version it points at. If you shipped new code, the pool may be on the old one.",
    },
    {
      question: "My queue is backing up but nothing runs. Why?",
      answer:
        "The function is likely throttled, so Lambda slows its polling. Check the throttle count first.",
    },
  ],
  sources: [
    {
      title: "Understanding Lambda function scaling",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html",
    },
    {
      title: "Configuring reserved concurrency for a function",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html",
    },
    {
      title: "Configuring provisioned concurrency",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html",
    },
    {
      title: "Lambda scaling behavior",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/scaling-behavior.html",
    },
    {
      title: "Asynchronous invocation",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html",
    },
    {
      title: "Lambda quotas",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html",
    },
  ],
};
