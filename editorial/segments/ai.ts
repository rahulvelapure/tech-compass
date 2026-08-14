import type { Segment } from "../types";

/**
 * AI backlog.
 *
 * The highest-volatility subject on the site. Every topic here is `volatile`
 * unless it describes mathematics rather than a product, and every article must
 * name the model or specification version it describes — an AI article without
 * a version is wrong within a quarter rather than within a year.
 *
 * Researched August 2026. The Model Context Protocol specification is currently
 * `2026-07-28`, superseding `2025-11-25`; that release introduced a stateless
 * protocol core, multi round-trip requests, header-based routing, cacheable
 * list results and authorization hardening. Any MCP topic planned against the
 * older revision would describe a protocol that no longer works that way.
 *
 * Boundary with `ai-enterprise-it`: this segment is the technology — how it
 * works, how to build with it, how it fails. Deploying and governing it inside
 * an organisation belongs to `ai-enterprise-it`. AI *security* is owned by
 * `cybersecurity-ciso` (sec-90) and linked to, not duplicated here.
 */
export const segment: Segment = {
  name: "AI",
  category: "ai",
  topics: [
    /* ---------------- Hub and pillars ---------------- */
    {
      id: "ai-01",
      title: "How large language models actually work",
      category: "ai",
      subcategory: "Tools",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "how do large language models work",
      secondaryKeywords: ["what is a token llm", "context window explained"],
      requiredSources: [
        "https://platform.openai.com/docs/",
        "https://docs.anthropic.com/",
        "https://huggingface.co/docs/transformers/",
      ],
      updateClass: "annual",
      pillar: "AI",
      plannedSlug: "how-large-language-models-work",
      plannedInternalLinks: [
        "retrieval-augmented-generation-architecture",
        "ai-agents-and-tool-use",
      ],
      diagramOpportunity:
        "Tokenisation through embedding, attention and sampling — showing where the context window constrains everything downstream.",
      notes:
        "Subject hub. Mechanism rather than product, so it ages better than everything beneath it. Must explain tokens and context honestly, because most downstream confusion traces back to those two.",
    },
    {
      id: "ai-02",
      title: "Retrieval-augmented generation architecture",
      category: "ai",
      subcategory: "Tools",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "rag architecture",
      requiredSources: ["https://docs.anthropic.com/", "https://platform.openai.com/docs/"],
      updateClass: "volatile",
      pillar: "Retrieval",
      plannedSlug: "retrieval-augmented-generation-architecture",
      pillarSlug: "how-large-language-models-work",
      diagramOpportunity:
        "Ingestion, chunking, embedding, retrieval, reranking and grounded generation — with the failure point at each stage.",
      notes: "Cross-domain: links to sec-90 for the prompt-injection path through retrieval.",
    },
    {
      id: "ai-03",
      title: "AI agents and tool use",
      category: "ai",
      subcategory: "Agents",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "ai agents tool use",
      requiredSources: [
        "https://docs.anthropic.com/",
        "https://modelcontextprotocol.io/specification/2026-07-28",
      ],
      updateClass: "volatile",
      pillar: "Agents",
      plannedSlug: "ai-agents-and-tool-use",
      pillarSlug: "how-large-language-models-work",
      diagramOpportunity:
        "The agent loop: model, tool call, result, re-entry — and where loops fail to terminate.",
    },
    {
      id: "ai-04",
      title: "Running models locally: what it costs and what you gain",
      category: "ai",
      subcategory: "Local AI",
      contentType: "decision-framework",
      searchIntent: "decision",
      priority: "P1",
      status: "DRAFT",
      targetKeyword: "running local llms tradeoffs",
      requiredSources: ["https://huggingface.co/docs/", "https://docs.nvidia.com/"],
      updateClass: "volatile",
      pillar: "Local AI",
      plannedSlug: "local-llms-privacy",
      pillarSlug: "how-large-language-models-work",
      articleSlug: "local-llms-privacy",
      notes:
        "Existing 228-word draft with a good title and a real decision behind it. Natural pillar for the local-AI cluster once researched properly — quantisation, VRAM requirements and the honest quality gap.",
    },

    /* ---------------- Supporting ---------------- */
    {
      id: "ai-10",
      title: "Model Context Protocol: what MCP standardises",
      category: "ai",
      subcategory: "Agents",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P0",
      status: "RESEARCHED",
      targetKeyword: "what is model context protocol",
      requiredSources: [
        "https://modelcontextprotocol.io/specification/2026-07-28",
        "https://blog.modelcontextprotocol.io/posts/2026-07-28/",
      ],
      updateClass: "volatile",
      pillarSlug: "ai-agents-and-tool-use",
      relatedTopics: ["ai-03"],
      diagramOpportunity: "MCP client, server and transport, and what each side owns.",
      notes:
        "Verified August 2026: current specification is 2026-07-28, superseding 2025-11-25. That revision brought a stateless protocol core, multi round-trip requests, header-based routing, cacheable list results, authorization hardening and a formal extensions framework. The article must state which revision it describes. Cross-domain: development and devops.",
    },
    {
      id: "ai-11",
      title: "Embeddings and vector search, explained",
      category: "ai",
      subcategory: "Tools",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "embeddings vector search explained",
      updateClass: "annual",
      pillarSlug: "retrieval-augmented-generation-architecture",
      relatedTopics: ["ai-02"],
    },
    {
      id: "ai-12",
      title: "Choosing a vector database",
      category: "ai",
      subcategory: "Tools",
      contentType: "decision-framework",
      searchIntent: "decision",
      priority: "P2",
      status: "IDEA",
      targetKeyword: "vector database comparison",
      updateClass: "volatile",
      pillarSlug: "retrieval-augmented-generation-architecture",
      relatedTopics: ["ai-11"],
    },
    {
      id: "ai-13",
      title: "Why RAG returns the wrong chunk",
      category: "ai",
      subcategory: "Tools",
      contentType: "troubleshooting",
      searchIntent: "failure-mode",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "rag retrieval quality problems",
      updateClass: "annual",
      pillarSlug: "retrieval-augmented-generation-architecture",
      relatedTopics: ["ai-02"],
      notes: "The highest-value troubleshooting topic in the segment — chunking and reranking.",
    },
    {
      id: "ai-14",
      title: "Evaluating model output: building an eval set that means something",
      category: "ai",
      subcategory: "Tools",
      contentType: "how-to",
      searchIntent: "how-to",
      priority: "P0",
      status: "IDEA",
      targetKeyword: "llm evaluation eval set",
      updateClass: "annual",
      pillarSlug: "how-large-language-models-work",
      notes:
        "Under-covered relative to its importance. Vibes-based evaluation is the default failure.",
    },
    {
      id: "ai-15",
      title: "Inference cost: what actually drives the bill",
      category: "ai",
      subcategory: "Tools",
      contentType: "analysis",
      searchIntent: "decision",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "llm inference cost drivers",
      updateClass: "volatile",
      pillarSlug: "how-large-language-models-work",
      diagramOpportunity:
        "Cost model across input tokens, output tokens, caching and context reuse.",
    },
    {
      id: "ai-16",
      title: "GPUs, NPUs and what AI hardware actually accelerates",
      category: "ai",
      subcategory: "AI hardware",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "gpu vs npu ai acceleration",
      requiredSources: ["https://docs.nvidia.com/"],
      updateClass: "volatile",
      pillarSlug: "local-llms-privacy",
      notes: "Cross-domain: electronics and the AI PC topic in emerging-tech.",
    },
    {
      id: "ai-17",
      title: "Quantisation: trading precision for memory",
      category: "ai",
      subcategory: "Local AI",
      contentType: "explainer",
      searchIntent: "architecture",
      priority: "P2",
      status: "IDEA",
      targetKeyword: "llm quantisation explained",
      updateClass: "annual",
      pillarSlug: "local-llms-privacy",
      relatedTopics: ["ai-16"],
    },
    {
      id: "ai-18",
      title: "Fine-tuning or prompting: which problem needs which",
      category: "ai",
      subcategory: "Tools",
      contentType: "decision-framework",
      searchIntent: "decision",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "fine tuning vs prompting",
      updateClass: "volatile",
      pillarSlug: "how-large-language-models-work",
    },
    {
      id: "ai-19",
      title: "Context windows: why more is not always better",
      category: "ai",
      subcategory: "Tools",
      contentType: "analysis",
      searchIntent: "question",
      priority: "P1",
      status: "IDEA",
      targetKeyword: "llm context window limitations",
      updateClass: "volatile",
      pillarSlug: "how-large-language-models-work",
      relatedTopics: ["ai-01"],
    },
  ],
};
