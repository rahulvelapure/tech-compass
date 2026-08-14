import type { Article } from "../../types";

export const article: Article = {
  slug: "local-llms-privacy",
  category: "ai",
  contentType: "analysis",
  subcategory: "Local AI",
  title: "Running local LLMs: what you gain, what you give up",
  metaDescription:
    "An honest assessment of local large language models: the privacy and cost arguments that hold, the hardware requirements, and the quality trade-off.",
  standfirst:
    "Local models solve a specific problem — data leaving your machine — and are worse than hosted models at almost everything else.",
  excerpt:
    "Where running a model locally genuinely helps, what hardware it needs, and the quality gap you should expect against hosted frontier models.",
  authorId: "rahul-velapure",
  publishedAt: "2026-07-25",
  draft: true,
  readingMinutes: 1,
  primaryKeyword: "local llm privacy",
  secondaryKeywords: ["run llm locally", "local ai vs cloud ai"],
  tags: ["AI", "Local AI", "Privacy", "Hardware"],
  reviewStatus: "research-based",
  methodology:
    "Written from published model documentation, quantisation formats and hardware specifications. Performance figures are not claimed because no standardised testing was performed for this article.",
  body: [
    {
      type: "p",
      text: "The case for a local model is narrow and legitimate: the text you send never leaves the machine. If that is your actual requirement — regulated data, client confidentiality, an air-gapped environment — nothing about a hosted service substitutes for it, regardless of the provider's data policy.",
    },
    {
      type: "p",
      text: "Everything else about the comparison currently favours hosted models.",
    },
    {
      type: "table",
      caption: "Local versus hosted, by requirement",
      head: ["Requirement", "Local", "Hosted"],
      rows: [
        ["Data never leaves the device", "Yes", "No"],
        ["Works offline", "Yes", "No"],
        ["Best available reasoning quality", "No", "Yes"],
        ["Predictable cost after hardware", "Yes", "Per-token"],
        ["Long context windows", "Constrained by memory", "Generally larger"],
        ["Setup and maintenance effort", "Ongoing", "Minimal"],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Memory is the binding constraint",
      text: "The practical limit is how much of the model fits in GPU or unified memory alongside the context. Quantisation reduces that requirement at some cost to output quality, and the cost grows as quantisation gets more aggressive.",
    },
    { type: "h2", id: "good-fit", text: "Tasks that suit local models" },
    {
      type: "ul",
      items: [
        "Summarising and reformatting documents that must not be uploaded anywhere.",
        "Classification and extraction over a fixed schema, where the task is narrow and verifiable.",
        "Drafting against internal documentation with retrieval, where the source material carries most of the weight.",
      ],
    },
    { type: "h2", id: "poor-fit", text: "Tasks that do not" },
    {
      type: "ul",
      items: [
        "Difficult multi-step reasoning, where the quality gap is most visible.",
        "Anything needing current information, unless you build the retrieval layer yourself.",
        "Workloads where several people need concurrent access — at that point you are operating inference infrastructure.",
      ],
    },
  ],
  faq: [
    {
      question: "Is a local LLM more private than a hosted one?",
      answer:
        "For the content of your prompts, yes — the data does not leave the device. That is a structural guarantee rather than a policy commitment, which is the whole point of the approach.",
    },
    {
      question: "What hardware do I need to run a local model?",
      answer:
        "It depends entirely on model size and quantisation. The determining factor is available GPU or unified memory; systems with more memory can hold larger models and longer contexts without falling back to slower paths.",
    },
  ],
};
