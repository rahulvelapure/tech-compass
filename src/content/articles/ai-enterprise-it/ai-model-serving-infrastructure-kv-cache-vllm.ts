import type { Article } from "../../types";

export const article: Article = {
  slug: "ai-model-serving-infrastructure-kv-cache-vllm",
  category: "ai-enterprise-it",
  contentType: "explainer",
  subcategory: "Readiness",
  title: "Serving a model is a memory problem wearing a compute problem's clothes",
  seoTitle: "AI Model Serving: KV Cache, VRAM Limits and How vLLM Works",
  metaDescription:
    "LLM inference spends its life waiting on memory, not maths. Why the KV cache decides concurrency, and what PagedAttention and continuous batching change.",
  standfirst:
    "Buying a faster GPU rarely fixes slow inference. What decides throughput is how much KV cache fits in VRAM and how little of it you waste.",
  excerpt:
    "Generation is memory-bandwidth bound, and every concurrent request holds cache proportional to its context. Understanding that explains low GPU utilisation, sudden out-of-memory errors, and why long context is so expensive.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-23",
  nextReviewAt: "2027-02-23",
  readingMinutes: 5,
  primaryKeyword: "AI model serving infrastructure vLLM",
  secondaryKeywords: [
    "LLM KV cache memory",
    "PagedAttention",
    "continuous batching",
    "GPU VRAM inference",
    "prefill vs decode",
  ],
  tags: ["AI", "Infrastructure", "GPU", "LLM", "Capacity Planning"],
  reviewStatus: "research-based",
  relatedSlugs: ["enterprise-ai-agents-security-governance-reality", "ai-agents-it-operations"],
  methodology:
    "Written from the PagedAttention paper (SOSP 2023), vLLM project documentation and NVIDIA inference documentation, verified August 2026. Throughput figures are given only as the paper reports them, against the baselines it names. The source draft's invented utilisation percentages, concurrent-user counts and single-vendor bandwidth figures were removed; the remaining hardware numbers are described by magnitude rather than quoted as specifications.",
  body: [
    {
      type: "p",
      text: "Most capacity planning for model serving starts with the wrong number. Someone compares tensor cores and precision support. They pick the faster chip. Then throughput barely moves, and nobody can say why.",
    },
    {
      type: "p",
      text: "That figure is the right one for training. For serving, it describes a phase that is over in a fraction of a second.",
    },
    { type: "h2", id: "phases", text: "Two phases with opposite bottlenecks" },
    {
      type: "p",
      text: "A request has two phases. They stress completely different parts of the machine.",
    },
    {
      type: "p",
      text: "**Prefill** processes the whole prompt at once. It is large, parallel matrix work. It fills the compute units, and it sets your time to first token. This phase is compute-bound. A faster chip genuinely helps here.",
    },
    {
      type: "p",
      text: "**Decode** produces the answer one token at a time. Each step is tiny arithmetic. But to do it, the chip must read the model weights and the stored attention state out of memory. Every step. For every sequence in flight.",
    },
    {
      type: "p",
      text: "Moving that data takes longer than the maths does. So decode is bound by memory bandwidth, not compute. This is why the phase that writes nearly all of your output barely improves with a faster chip. The tensor cores are already waiting.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The ratio that explains the surprise",
      text: 'Memory on a current data-centre chip delivers on the order of terabytes per second. The PCIe link to host memory is one to two orders of magnitude slower. Move attention state off the chip during decode and you pay that gap on every token. That is why the answer to "can we just use system RAM" is no.',
    },
    { type: "h2", id: "kv-cache", text: "What the KV cache is, and why it dominates" },
    {
      type: "p",
      text: "To write each new token, the model looks back over everything before it. Recomputing the attention keys and values every step would be wasteful. So it keeps them. That stored state is the Key-Value cache, usually shortened to KV cache.",
    },
    {
      type: "p",
      text: "Two properties matter for infrastructure. It grows with sequence length, which is the prompt plus everything written so far. And there is one per request. Serving many users at once means holding many caches at once.",
    },
    {
      type: "p",
      text: "So your memory budget is weights plus every active request's cache. Weights are fixed once you pick the model. The cache is the variable. It decides how many users you can serve at once.",
    },
    {
      type: "p",
      text: "That leads somewhere counter-intuitive. Shrinking the weights is often a throughput decision, not a cost one. Smaller weights do not mainly make the model faster. They free memory for more cache, and more cache means more concurrent users.",
    },
    { type: "h2", id: "fragmentation", text: "The waste that PagedAttention removed" },
    {
      type: "p",
      text: "Early serving implementations reserved cache space contiguously, sized for the longest response a request might produce. A request permitted eight thousand tokens got room for eight thousand tokens the moment it arrived.",
    },
    {
      type: "p",
      text: "Most requests never come close to their maximum. The rest sat reserved and unused. Because it was reserved in one block, the free space broke into pieces too small to admit anyone new. The chip could report memory nearly full while much of it held nothing.",
    },
    {
      type: "p",
      text: "PagedAttention borrows the fix from operating systems. Divide cache memory into small fixed-size blocks. Hand them out on demand as the sequence grows. A block table then maps each request's sequence onto blocks that are scattered around memory. In vLLM the default block holds sixteen tokens.",
    },
    {
      type: "p",
      text: "A sequence now uses blocks in proportion to what it actually wrote. Waste falls to at most one partial block per sequence. And nothing needs to sit in one piece, so nothing fragments.",
    },
    {
      type: "callout",
      variant: "note",
      title: "What the paper claims, and against what",
      text: "The PagedAttention paper reports two to four times the throughput of FasterTransformer and Orca at similar latency. It credits near-zero cache waste. Those are the baselines, and that is the claim. Your own gain depends on how much your current setup wastes. A stack that already pages will not gain fourfold by moving to another that does.",
    },
    { type: "h2", id: "batching", text: "Continuous batching keeps the slot full" },
    {
      type: "p",
      text: "Memory efficiency creates room for concurrency. Scheduling decides whether that room is used.",
    },
    {
      type: "p",
      text: "Static batching groups requests, runs them together, and waits for all of them to finish. Responses vary enormously in length. So the batch runs at the pace of its slowest member, while the slots of finished requests sit idle.",
    },
    {
      type: "p",
      text: "Continuous batching rebuilds the batch at every decode step. NVIDIA calls the same idea in-flight batching. A finished sequence leaves at once, and a queued request takes its slot for the next step. No slot waits on an unrelated request.",
    },
    {
      type: "p",
      text: "The two depend on each other. Paged memory without continuous batching leaves capacity unused. Continuous batching without paged memory has nowhere to put the arrivals. Production engines do both. That is the practical reason not to serve from a bare inference loop.",
    },
    { type: "h2", id: "context", text: "Why long context costs more than it looks" },
    {
      type: "p",
      text: "Context length degrades serving economics from two directions at once.",
    },
    {
      type: "table",
      caption: "Two independent penalties for longer sequences",
      head: ["Phase", "How cost scales", "What it limits"],
      rows: [
        [
          "Prefill",
          "Attention over the prompt scales quadratically with prompt length",
          "Time to first token",
        ],
        [
          "Decode",
          "KV cache grows linearly with sequence length",
          "How many requests fit concurrently",
        ],
      ],
    },
    {
      type: "p",
      text: "The decode-side effect is the one that hurts throughput. Longer sequences mean larger caches. Larger caches mean fewer concurrent requests. Fewer requests mean fewer tokens per second overall. Per-token latency for one user can still look fine, which is what makes this easy to miss.",
    },
    {
      type: "p",
      text: "So a workload built on very long contexts is a low-concurrency workload. No amount of scheduling changes that. Decide it at design time. It is not a tuning problem to discover in production.",
    },
    { type: "h2", id: "operations", text: "What to actually watch" },
    {
      type: "p",
      text: "Chip utilisation is the wrong headline metric here. A server can report high utilisation while waiting on memory. It can also report low utilisation while turning requests away for lack of cache space.",
    },
    {
      type: "ul",
      items: [
        "**KV cache utilisation.** The number that predicts admission failures. As it approaches full, the engine starts to preempt or queue. Latency then degrades sharply rather than gradually.",
        "**Time to first token and inter-token latency, separately.** They belong to different phases and different bottlenecks. One averaged latency figure hides which one moved.",
        "**Queue depth and preemption counts.** These say whether you are short of capacity or short of memory, which lead to different purchases.",
        "**Throughput at your real context lengths.** A benchmark run on short prompts says nothing about a workload that pastes in documents.",
      ],
    },
    {
      type: "p",
      text: "Two structural options exist when one chip is not enough. Tensor parallelism splits the model, and its cache, across devices. That is necessary for models that do not fit, but it adds interconnect traffic to every attention step. Disaggregated serving runs prefill and decode on separate pools, each sized for its own bottleneck. It works, and it is a lot to operate. Treat it as a scale-driven choice, not a starting point.",
    },
    {
      type: "p",
      text: "None of this changes the governance work above it. What a model may reach, and what it does with that access, is a separate discipline. It is covered in [AI agents, security and governance](/ai-enterprise-it/enterprise-ai-agents-security-governance-reality).",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "Prefill is compute-bound and short. Decode is memory-bandwidth-bound and is nearly all of the work.",
        "VRAM is weights plus every active request's KV cache. The cache is what sets concurrency.",
        "Quantising weights buys concurrency by freeing cache space, which matters more than the speed-up.",
        "Paged cache and continuous batching are a pair. Do not run production inference without both.",
        "Long context costs twice: quadratically in prefill, linearly in cache. Plan for low concurrency there.",
        "Watch KV cache utilisation, not accelerator utilisation. Only one of them predicts failures.",
      ],
    },
  ],
  faq: [
    {
      question: "Why is my GPU utilisation low while requests queue?",
      answer:
        "You are probably out of KV cache, not out of compute. The engine cannot admit more sequences. The maths units still have room to spare.",
    },
    {
      question: "Can the KV cache live in system RAM?",
      answer:
        "Only at a steep cost. The link to host memory is far slower than memory on the chip. Decode reads that state on every token.",
    },
    {
      question: "Does tensor parallelism solve cache pressure?",
      answer:
        "It adds memory across devices, which helps. It also adds interconnect traffic to every attention step. Use it for models that do not fit. It is not a substitute for using cache well.",
    },
    {
      question: "Is quantisation about cost or speed?",
      answer:
        "Mostly neither. Its main gain is freeing memory for more KV cache. More cache means more users at once, and that is what throughput is made of.",
    },
    {
      question: "Why does a long prompt hurt so much?",
      answer:
        "Prefill work rises with the square of the prompt length. The cache it leaves behind is larger too. So fewer requests fit at once. Two penalties, one cause.",
    },
  ],
  sources: [
    {
      title: "Efficient Memory Management for Large Language Model Serving with PagedAttention",
      publisher: "SOSP 2023",
      url: "https://arxiv.org/abs/2309.06180",
    },
    {
      title: "vLLM documentation",
      publisher: "vLLM Project",
      url: "https://docs.vllm.ai/en/latest/",
    },
    {
      title: "TensorRT-LLM: in-flight batching and KV cache management",
      publisher: "NVIDIA",
      url: "https://nvidia.github.io/TensorRT-LLM/",
    },
  ],
};
