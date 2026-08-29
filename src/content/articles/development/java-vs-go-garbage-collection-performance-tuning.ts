import type { Article } from "../../types";

export const article: Article = {
  slug: "java-vs-go-garbage-collection-performance-tuning",
  category: "development",
  contentType: "comparison",
  subcategory: "Languages",
  title: "Two runtimes, two very different bargains with the garbage collector",
  seoTitle: "Java vs Go GC: Tuning for Low-Latency APIs",
  metaDescription:
    "Java pauses less than it used to, and Go never paused much. What each collector charges you instead, and which knobs actually move a P99 latency figure.",
  standfirst:
    "Java fixed the long pause with generations and barriers. Go avoided it by never letting garbage pile up. You still pay. The bill just arrives in a different currency.",
  excerpt:
    "Generational ZGC is the default in modern JDKs, and the flag the old advice tells you to set now warns. Go pays for its collector in CPU, and GOGC is the lever that moves it.",
  authorId: "rahul-velapure",
  publishedAt: "2026-05-04",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 7,
  primaryKeyword: "Java vs Go garbage collection performance",
  secondaryKeywords: [
    "generational ZGC",
    "Go GC pacing GOGC",
    "GOMEMLIMIT soft limit",
    "escape analysis",
    "stop-the-world pauses",
  ],
  tags: ["Java", "Go", "Performance", "Languages", "Runtime"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "aws-lambda-cold-start-optimization-snapstart",
    "opentelemetry-vs-proprietary-apm-observability-cost",
  ],
  methodology:
    "Written from JEP 439, JEP 474 and JEP 490 on ZGC, JEP 307 on G1, the Go GC guide, and the Go 1.26 release notes, verified August 2026. Three corrections were made to the source draft. It described a G1 full collection as single-threaded, which has not been true since JDK 10. It recommended `-XX:+UseZGC -XX:+ZGenerational`, but generational mode became the default in JDK 23 and the flag was obsoleted in JDK 24, where it now only produces a warning. And it said the Go team was researching a generational collector; the collector that actually shipped, Green Tea, is span-based rather than generational. The draft's trading-platform incident and its latency figures were removed.",
  body: [
    {
      type: "p",
      text: "Pick a runtime for a low-latency service and you are picking a garbage collector. Most other choices can be changed later. This one cannot. The collector is the one part that can stop your code without asking.",
    },
    {
      type: "p",
      text: "Java and Go arrived at opposite answers. Java kept generations and spent years making the pauses shorter. Go dropped generations and ran the collector alongside the program from the start.",
    },
    {
      type: "p",
      text: "Neither approach is free. They just send the bill to different places.",
    },
    { type: "h2", id: "three-way", text: "Every collector trades three things" },
    {
      type: "p",
      text: "There are three quantities, and you cannot have all of them.",
    },
    {
      type: "ul",
      items: [
        "**Throughput.** The share of CPU that runs your code rather than the collector.",
        "**Pause time.** How long threads stop so the collector can work safely.",
        "**Footprint.** How much heap you need to stay stable.",
      ],
    },
    {
      type: "p",
      text: "Chase throughput and garbage builds up, so the pauses get rare and long. Chase pause time and the collector runs constantly, so it eats CPU. Give it more heap and both improve, which is why footprint is the lever people forget.",
    },
    { type: "h2", id: "java", text: "Java: generations, then barriers" },
    {
      type: "p",
      text: "The JVM is built on the weak generational hypothesis. Most objects die young. So the heap splits into a young generation and an old one, and the young half gets collected far more often.",
    },
    { type: "h3", id: "g1", text: "G1 and the full collection" },
    {
      type: "p",
      text: "G1 divides the heap into many equal regions and aims at a pause target you set with `-XX:MaxGCPauseMillis`. Young collections are frequent and short. When the old generation fills, you get a mixed collection, and sometimes a full one.",
    },
    {
      type: "p",
      text: "The full collection is the one that hurts. It is still stop-the-world. It is not, however, single-threaded: JEP 307 made it parallel back in JDK 10, and `-XX:ParallelGCThreads` controls how many threads it uses. Old advice that calls it single-threaded predates that change.",
    },
    { type: "h3", id: "zgc", text: "ZGC moves objects without stopping you" },
    {
      type: "p",
      text: "ZGC exists to cut the link between pause length and heap size. It does its work concurrently. Pauses are typically under a millisecond, even on very large heaps.",
    },
    {
      type: "p",
      text: "It gets there with coloured pointers. Metadata about an object rides in the unused bits of its 64-bit address. A load barrier sits on every reference read. If the object has moved, the barrier fixes the pointer as the thread reads it, so nothing has to stop while the collector relocates.",
    },
    {
      type: "p",
      text: "JDK 21 added generations to ZGC. It runs minor cycles over the young generation and major cycles over both, and the two can overlap. Marking moved out of the load barrier onto a store barrier, which matters because reads outnumber writes by a wide margin.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The flag in most tuning guides is now wrong",
      text: "On JDK 21 you had to opt in with `-XX:+ZGenerational`. JDK 23 made generational mode the default, and JDK 24 removed the non-generational mode entirely. The flag no longer does anything there and produces a warning, and it will eventually stop the JVM from starting. On a current JDK the whole setting is `-XX:+UseZGC`.",
    },
    {
      type: "p",
      text: "Give it headroom. ZGC works by staying ahead of your allocation rate. Starve it and you get allocation stalls, where a thread waits for memory the collector has not freed yet. That failure looks like a latency spike and reads like a pause, but the cure is heap, not tuning.",
    },
    { type: "h2", id: "go", text: "Go: no generations, and a pacer instead" },
    {
      type: "p",
      text: "Go went the other way. There are no generations. Every object lives in the same heap, whether it was allocated a microsecond ago or an hour ago.",
    },
    {
      type: "p",
      text: "The collector is concurrent mark-and-sweep, and it is non-moving. It stops the world twice per cycle, briefly, to set up marking and to finish it. Everything between those points runs alongside your goroutines. A write barrier catches pointers your code changes mid-cycle, so the collector cannot lose a reference it has already passed.",
    },
    {
      type: "p",
      text: "Because there is no young generation to sweep cheaply, Go has to walk the live heap each cycle. A service that allocates hard — parsing thousands of requests a second — makes the collector work hard.",
    },
    { type: "h3", id: "pacer", text: "GOGC decides how often that happens" },
    {
      type: "p",
      text: "The pacer aims to finish marking just as the heap reaches a target. That target is not simply double the live heap. It is the live heap plus a share of the live heap and roots together, scaled by `GOGC`.",
    },
    {
      type: "code",
      language: "text",
      code: "target = live heap + (live heap + GC roots) * GOGC / 100\n\n# GOGC=100 (default)  -> collect about twice as often, half the memory\n# GOGC=200            -> half the GC CPU, roughly double the heap",
    },
    {
      type: "p",
      text: "The trade is close to linear. Double `GOGC` and you roughly halve the CPU the collector spends, while roughly doubling heap overhead. On a latency-sensitive service with spare RAM, that is usually the right direction, and the default is tuned for memory rather than for you.",
    },
    {
      type: "p",
      text: "During marking the collector targets about a quarter of available CPU. Treat that as a design point, not as a measurement of what your service pays. What you pay depends on your allocation rate, and that is the number worth profiling.",
    },
    { type: "h3", id: "mark-assist", text: "Mark assist is what a spike usually is" },
    {
      type: "p",
      text: "If your code allocates faster than the collector can mark, Go conscripts it. The allocating goroutine stops doing your work and marks objects instead until it has paid off its debt.",
    },
    {
      type: "p",
      text: "This is not a pause, so it does not show up as one. It shows up as tail latency. Look for `runtime.gcAssistAlloc` in a CPU profile: more than about five percent of cumulative time there means you are outrunning the collector.",
    },
    {
      type: "p",
      text: "The fix is upstream of the collector. Reuse buffers with `sync.Pool`. Pre-size slices. Swap a parser that allocates per field for one that decodes into a struct you already own. Raising `GOGC` buys headroom, but it does not stop you allocating.",
    },
    { type: "h3", id: "green-tea", text: "Green Tea, and what Go did not build" },
    {
      type: "p",
      text: "Go has looked at generations more than once and said no each time. Generations mean more barriers, more spaces and a runtime that is harder to reason about. Go trades those away on purpose.",
    },
    {
      type: "p",
      text: "The collector that did ship is Green Tea. It was an experiment in Go 1.25 and became the default in Go 1.26. It is span-based rather than generational: it improves locality when scanning small objects, and it uses vector instructions on recent CPUs. The release notes put the improvement at 10 to 40 percent of garbage collection overhead in programs that lean on the collector.",
    },
    {
      type: "p",
      text: "You can turn it off with `GOEXPERIMENT=nogreenteagc` at build time. That escape hatch is expected to disappear in Go 1.27, so treat it as a way to bisect a regression rather than as a setting.",
    },
    { type: "h2", id: "memlimit", text: "GOMEMLIMIT is soft, and that is deliberate" },
    {
      type: "p",
      text: "`GOMEMLIMIT` arrived in Go 1.19 and gives the pacer a ceiling. As the heap approaches it, the collector runs harder to stay under. In a container that is what stops the process reaching the hard limit and being killed.",
    },
    {
      type: "p",
      text: "It is a soft limit on purpose. The runtime caps the collector at roughly half the CPU over a rolling window. If holding the limit would need more than that, Go lets the heap exceed the limit instead.",
    },
    {
      type: "p",
      text: "That choice is the right one. A process that grinds forever at ninety-nine percent GC is worse than a process that dies quickly and restarts. Set the limit somewhat below your container limit and keep watching memory. You have traded an out-of-memory kill for a slowdown, not removed the risk.",
    },
    {
      type: "h2",
      id: "escape",
      text: "The cheapest object is the one that never reaches the heap",
    },
    {
      type: "p",
      text: "Both compilers try to keep objects off the heap, and both call it escape analysis. They do it at different times, and the difference matters when you are reading a profile.",
    },
    {
      type: "table",
      caption: "Where each runtime decides, and how you inspect the decision.",
      head: ["", "Java", "Go"],
      rows: [
        ["When it runs", "In the JIT, at runtime", "In the compiler, at build time"],
        ["What it does", "Scalar replacement of fields", "Allocates on the stack frame"],
        ["How to see it", "JIT compilation logs", "`go build -gcflags=-m`"],
        [
          "Common leak",
          "Object handed to an unpredictable call site",
          "Returning a pointer, or passing to an interface",
        ],
      ],
    },
    {
      type: "p",
      text: "The Java row is often described loosely. HotSpot does not usually put the whole object on the stack. It breaks the object into its fields and keeps those in registers or stack slots. That is why an object can vanish from an allocation profile without ever showing up as a stack allocation.",
    },
    {
      type: "p",
      text: "In Go the usual culprits are visible from the compiler. Returning a pointer to a local escapes. So does passing a value to anything that takes an interface, because the compiler can no longer see what happens to it.",
    },
    { type: "h2", id: "practice", text: "What to actually change" },
    {
      type: "ol",
      items: [
        "**Measure before tuning.** A P99 spike is usually allocation rate, not collector configuration. Profile first — the tooling trade-offs are covered in [OpenTelemetry versus proprietary APM](/devops/opentelemetry-vs-proprietary-apm-observability-cost).",
        "**On a current JDK, use the ZGC flag on its own.** The whole setting is `-XX:+UseZGC`, because generational mode is already on. Then leave headroom above your live set so ZGC is not fighting for room.",
        "**In Go, cut allocations first.** Only then raise `GOGC`. Buffer reuse and pre-sized slices beat any flag.",
        "**Set the soft memory limit below the container limit.** `GOMEMLIMIT` protects you from a late collection, not from a real leak.",
      ],
    },
    {
      type: "p",
      text: "One caveat applies to both. Everything here concerns a warm, long-running process. Short-lived workloads face a different problem, and the startup side of the JVM is covered in [Lambda cold starts and SnapStart](/cloud/aws-lambda-cold-start-optimization-snapstart).",
    },
  ],
  faq: [
    {
      question: "Does ZGC remove stop-the-world pauses?",
      answer:
        "Not quite. Short pauses remain, but they usually run under a millisecond. They no longer grow with the heap, which is what made the old long tail so painful.",
    },
    {
      question: "Should I still set the ZGenerational flag?",
      answer:
        "No. JDK 23 made generational mode the default. JDK 24 dropped the other mode, so the flag only warns now. Use `-XX:+UseZGC` on its own.",
    },
    {
      question: "Is a G1 full collection single-threaded?",
      answer:
        "It has not been since JDK 10. JEP 307 made it parallel, and `-XX:ParallelGCThreads` sets the thread count. It is still stop-the-world.",
    },
    {
      question: "Is Go getting a generational collector?",
      answer:
        "No. The Go team looked at generations and chose not to. What shipped is Green Tea, a span-based design, which is the default from Go 1.26.",
    },
    {
      question: "What should I set GOGC to?",
      answer:
        "Raise it if you have spare memory and care about tail latency. Doubling it roughly halves the CPU the collector uses and roughly doubles the heap.",
    },
    {
      question: "Can GOMEMLIMIT stop an out-of-memory kill?",
      answer:
        "Not reliably. It is a soft limit. If holding it would cost too much CPU, the runtime lets memory go over rather than grind. It trades a kill for a slowdown.",
    },
    {
      question: "Can I free memory by hand in either language?",
      answer:
        "No. You can only drop references. Go has `debug.FreeOSMemory` to hand unused heap back to the system, but it collects nothing that is still live.",
    },
  ],
  sources: [
    {
      title: "JEP 439: Generational ZGC",
      publisher: "OpenJDK",
      url: "https://openjdk.org/jeps/439",
    },
    {
      title: "JEP 490: ZGC: Remove the Non-Generational Mode",
      publisher: "OpenJDK",
      url: "https://openjdk.org/jeps/490",
    },
    {
      title: "JEP 307: Parallel Full GC for G1",
      publisher: "OpenJDK",
      url: "https://openjdk.org/jeps/307",
    },
    {
      title: "A guide to the Go garbage collector",
      publisher: "The Go Programming Language",
      url: "https://go.dev/doc/gc-guide",
    },
    {
      title: "Go 1.26 release notes",
      publisher: "The Go Programming Language",
      url: "https://go.dev/doc/go1.26",
    },
  ],
};
