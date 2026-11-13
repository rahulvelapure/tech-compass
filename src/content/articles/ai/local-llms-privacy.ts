import type { Article } from "../../types";

export const article: Article = {
  slug: "local-llms-privacy",
  category: "ai",
  contentType: "analysis",
  subcategory: "Local AI",
  title: "Running local LLMs: what you gain, what you give up",
  seoTitle: "Local LLMs: privacy gains and real trade-offs",
  metaDescription:
    "An honest assessment of local large language models: the privacy argument that holds, the hardware you need, and the quality gap against hosted models.",
  standfirst:
    "A local model solves one problem well. Your text never leaves the machine. It is worse than a hosted model at nearly everything else.",
  excerpt:
    "Where running a model locally genuinely helps, what hardware it needs, and the quality gap you should expect against hosted frontier models.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-25",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-02-28",
  readingMinutes: 3,
  primaryKeyword: "local llm privacy",
  secondaryKeywords: [
    "run llm locally",
    "model quantisation memory",
    "local model hardware requirements",
    "air-gapped AI",
  ],
  tags: ["AI", "Local AI", "Privacy", "Hardware"],
  reviewStatus: "research-based",
  pillar: "Local AI",
  relatedSlugs: [
    "ai-model-serving-infrastructure-kv-cache-vllm",
    "model-context-protocol-explained",
  ],
  draft: true,
  methodology:
    "Written from published model documentation, quantisation formats and hardware specifications, verified August 2026. Performance figures are not claimed, because no standardised testing was performed for this article and published benchmarks measure specific models on specific hardware.",
  body: [
    {
      type: "p",
      text: "The case for a local model is narrow and legitimate. The text you send never leaves the machine.",
    },
    {
      type: "p",
      text: "If that is your actual requirement — regulated data, client confidentiality, an air-gapped site — no hosted service substitutes for it, whatever the provider's data policy says. A policy is a promise. Not sending the data is a property of the system.",
    },
    {
      type: "p",
      text: "Everything else about the comparison currently favours hosted models. That is worth saying plainly, because the gap is where most disappointment comes from.",
    },
    { type: "h2", id: "guarantee", text: "What the privacy claim actually covers" },
    {
      type: "p",
      text: "Be precise about the boundary. A local model keeps your prompt and its output on the device. It says nothing about the rest of your setup.",
    },
    {
      type: "p",
      text: "The tool around the model can still reach the network. Some desktop apps check for updates, fetch model files, or offer an optional cloud fallback when a request is too large. Each of those is reasonable on its own. None of them is covered by the phrase “runs locally”.",
    },
    {
      type: "p",
      text: "So if the requirement is regulatory rather than a preference, test it rather than trusting the label. Block the process at the firewall and confirm the thing still works. That is a five-minute check and it is the only one that proves anything.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Weights are not the same as training",
      text: "Open weights mean you can download and run the model. They do not tell you what it was trained on, and they are not the same as an open-source licence. Read the model's licence before it goes anywhere near commercial work, because several popular ones carry use restrictions.",
    },
    { type: "h2", id: "memory", text: "Memory is the constraint, not the GPU" },
    {
      type: "p",
      text: "The practical limit is how much of the model fits in GPU or unified memory alongside the context. Everything else follows from that number.",
    },
    {
      type: "p",
      text: "Weights are the bulk of it. A model's parameter count and its precision decide how much space they take. The context takes more, and it grows as the conversation does, because the key-value cache holds the attention state for every token so far.",
    },
    {
      type: "p",
      text: "Miss that budget and the system does not refuse. It spills to slower memory, and generation drops to a crawl. Most people meet the limit as a speed problem and never realise it was a capacity problem.",
    },
    {
      type: "p",
      text: "The same arithmetic drives server-side inference, where the cache is the thing you plan around. The [KV cache and serving article](/ai-enterprise-it/ai-model-serving-infrastructure-kv-cache-vllm) covers that side in detail.",
    },
    { type: "h2", id: "quantisation", text: "Quantisation buys room, and it costs something" },
    {
      type: "p",
      text: "Quantisation stores the weights at lower precision so they take less memory. It is what makes a large model fit on a desktop at all.",
    },
    {
      type: "p",
      text: "It is not free. Output quality degrades as the precision drops, and the loss grows as quantisation gets more aggressive. Mild quantisation is usually hard to notice on ordinary work. Very aggressive quantisation is not.",
    },
    {
      type: "p",
      text: "The useful rule is to prefer a smaller model at moderate precision over a larger model squeezed hard. A heavily quantised large model often performs worse than a mid-sized one with more room to work in.",
    },
    { type: "h2", id: "fits", text: "Workloads that suit a local model" },
    {
      type: "ul",
      items: [
        "Summarising and reformatting documents that must not be uploaded anywhere.",
        "Classification and extraction over a fixed schema, where the task is narrow and verifiable.",
        "Drafting against internal documentation with retrieval, where the source material carries most of the weight.",
      ],
    },
    {
      type: "p",
      text: "The pattern behind all three is that the model is doing shaping rather than thinking. The hard content comes from your documents, and the model arranges it. That is where a smaller model holds up well.",
    },
    { type: "h2", id: "doesnt", text: "Workloads that do not" },
    {
      type: "ul",
      items: [
        "Difficult multi-step reasoning, where the quality gap is most visible.",
        "Anything needing current information, unless you build the retrieval layer yourself.",
        "Workloads where several people need concurrent access — at that point you are operating inference infrastructure.",
      ],
    },
    {
      type: "p",
      text: "That last one catches teams out. One person running a model on a workstation is a desktop tool. Ten people sharing it is a service, with queuing, capacity planning and an on-call rota attached.",
    },
    { type: "h2", id: "decide", text: "How to decide" },
    {
      type: "p",
      text: "Start with the requirement, not the hardware. If nothing legally or contractually stops you sending the text to a provider, a hosted model will almost certainly give you better output for less effort.",
    },
    {
      type: "p",
      text: "If something does stop you, then local is the answer, and the question becomes which model fits your memory budget at a precision you can live with. Test it on your real documents before buying anything.",
    },
    {
      type: "p",
      text: "The mistake worth avoiding is choosing local for the feeling of control and then being disappointed by the output. The privacy property is real and worth paying for. It is the only thing you are buying.",
    },
  ],
  faq: [
    {
      question: "Is a local model really private?",
      answer:
        "For your prompts, yes. The text stays on the device. Just check the app around it is not calling home.",
    },
    {
      question: "How much memory do I need?",
      answer:
        "It depends on the model size, and on how hard it is squeezed. Memory is the limit. The context eats into it as you go.",
    },
    {
      question: "Is a bigger model always better?",
      answer:
        "No. A smaller model with room to work often beats a large one squeezed hard. Try both on your own task.",
    },
    {
      question: "Can a local model replace a hosted one?",
      answer:
        "For narrow, checkable jobs, often yes. For hard reasoning, not yet. The gap is real.",
    },
    {
      question: "Can several people share one?",
      answer:
        "They can. But then you are running a service. Expect queues, capacity plans, and someone on call.",
    },
  ],
  sources: [
    {
      title: "llama.cpp: quantisation formats and memory requirements",
      publisher: "ggml-org",
      url: "https://github.com/ggml-org/llama.cpp",
    },
    {
      title: "Ollama documentation",
      publisher: "Ollama",
      url: "https://github.com/ollama/ollama/tree/main/docs",
    },
    {
      title: "Transformers: quantization",
      publisher: "Hugging Face",
      url: "https://huggingface.co/docs/transformers/en/quantization/overview",
    },
  ],
};
