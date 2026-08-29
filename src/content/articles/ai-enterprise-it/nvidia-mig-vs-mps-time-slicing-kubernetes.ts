import type { Article } from "../../types";

export const article: Article = {
  slug: "nvidia-mig-vs-mps-time-slicing-kubernetes",
  category: "ai-enterprise-it",
  contentType: "comparison",
  title: "Three ways to put more than one workload on a GPU, isolating three different things",
  seoTitle: "GPU Sharing in Kubernetes: MIG vs MPS vs Time-Slicing",
  metaDescription:
    "Time-slicing shares turns, MPS shares the compute context, MIG partitions the silicon. What each isolates, what it does not, and which failures survive.",
  standfirst:
    "A GPU running one small model is mostly idle hardware. Sharing it is easy. Sharing it without one tenant taking down the rest is the real problem.",
  excerpt:
    "The question is not how to fit more pods on a GPU. It is what happens when one of them misbehaves — and only one of the three mechanisms contains that in hardware.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 4,
  primaryKeyword: "NVIDIA MIG vs MPS vs time-slicing Kubernetes",
  secondaryKeywords: [
    "Multi-Instance GPU Kubernetes",
    "NVIDIA MPS inference",
    "GPU time-slicing device plugin",
    "MIG profiles",
    "AI inference cost optimisation",
  ],
  tags: ["AI", "Kubernetes", "GPU", "Infrastructure", "Performance"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "ai-model-serving-infrastructure-kv-cache-vllm",
    "karpenter-vs-cluster-autoscaler-node-scaling",
  ],
  methodology:
    "Written from the NVIDIA MPS documentation, the MIG user guide and device-name reference, and the Kubernetes device plugin project documentation, verified August 2026. Two corrections were made to the source draft. It said MPS provides no memory isolation; from Volta onward each client has its own GPU address space, and CUDA 11.4 added a per-client memory cap and thread-percentage limit — what MPS still lacks is fault isolation, which is a different claim. And its example MIG layout for an 80 GB card required eight compute slices, where seven is the hardware maximum and profiles must fit a fixed geometry. The draft's multi-tenant crash narrative and its hardware prices were removed.",
  body: [
    {
      type: "p",
      text: "A modern GPU is a big, costly, highly parallel machine. Hand a whole one to a model that needs a slice of its memory and a slice of its compute. Most of what you bought then does nothing.",
    },
    {
      type: "p",
      text: "So you share it. NVIDIA offers three ways, and they are not three settings on one dial. They work at different layers and isolate different things.",
    },
    {
      type: "p",
      text: "The useful question is not how many pods fit. It is what happens when one of them goes wrong.",
    },
    { type: "h2", id: "time-slicing", text: "Time-slicing shares turns and nothing else" },
    {
      type: "p",
      text: "This is the simplest one, and the one people find first. You tell the Kubernetes device plugin to offer a single card as several. Several pods land on it, and the driver takes turns between them.",
    },
    {
      type: "p",
      text: "Nothing is partitioned. The pods share one memory pool, and each one sees the whole of it.",
    },
    {
      type: "p",
      text: "That is the first problem. Every pod believes it has the full card, so nothing stops one of them allocating most of the memory. The others then fail their allocations, and they fail at whatever point in their work they happened to reach.",
    },
    {
      type: "p",
      text: "The second problem is latency. Switching between contexts on a GPU is not the cheap register swap a CPU performs. Work in flight has to drain and state has to move, and the cost lands as jitter. Median latency can look fine while the tail becomes unusable.",
    },
    {
      type: "p",
      text: "So time-slicing fits the cases where neither problem matters. Dev environments. Notebooks. Batch work where throughput is the only number, and one team owns all of it.",
    },
    { type: "h2", id: "mps", text: "MPS shares the compute context" },
    {
      type: "p",
      text: "Multi-Process Service takes a different approach. A daemon on the host sits between the CUDA clients and the driver, and merges their work into a shared context.",
    },
    {
      type: "p",
      text: "With one context there is nothing to switch between. Kernels from different clients run side by side on the streaming multiprocessors, rather than taking turns. Most inference serving is many small requests at once. For that shape, this is a big throughput gain over time-slicing, and it has no jitter.",
    },
    {
      type: "callout",
      variant: "note",
      title: "MPS does more isolation than its reputation suggests",
      text: "The claim that MPS offers no memory isolation is out of date. From Volta onward each client gets its own GPU address space, so one client cannot read another's memory. CUDA 11.4 added two controls worth knowing: `CUDA_MPS_PINNED_DEVICE_MEM_LIMIT` caps how much device memory a client may allocate, and `CUDA_MPS_ACTIVE_THREAD_PERCENTAGE` caps the share of streaming multiprocessors it may use. So you can bound a noisy tenant. What you cannot do is contain its failures.",
    },
    {
      type: "p",
      text: "Fault isolation is the real limit, and it is structural rather than a missing feature. The clients share a context, so a fatal fault in one is a fault in the thing they all depend on. Take down the daemon and every client on that GPU goes with it.",
    },
    {
      type: "p",
      text: "MPS also does not support every CUDA feature. That tends to show up late. You find it during a framework upgrade, not during a trial.",
    },
    { type: "h2", id: "mig", text: "MIG partitions the silicon" },
    {
      type: "p",
      text: "Multi-Instance GPU is built into the hardware, from the Ampere generation onward. It splits the card into instances. Each one owns its own compute slices, cache and memory controllers.",
    },
    {
      type: "p",
      text: "An instance presents to a pod as an independent GPU, because at the hardware level that is close to what it is. There is no context switching between instances, because they are not sharing execution resources. A fault on one does not reach another.",
    },
    {
      type: "p",
      text: "Neither of the other two can offer that. It is why MIG is the answer when tenants are truly separate.",
    },
    { type: "h3", id: "profiles", text: "Profiles are a fixed geometry, not a free split" },
    {
      type: "p",
      text: "The first limit people meet is that you cannot carve the card up freely. A GPU offers a set list of profiles, named by compute slices and memory. The slices have to total seven or fewer.",
    },
    {
      type: "table",
      caption: "Representative profiles on an 80 GB card, and how many of each fit.",
      head: ["Profile", "Compute slices", "Maximum instances"],
      rows: [
        ["`1g.10gb`", "1", "7"],
        ["`2g.20gb`", "2", "3"],
        ["`3g.40gb`", "3", "2"],
        ["`4g.40gb`", "4", "1"],
        ["`7g.80gb`", "7", "1"],
      ],
    },
    {
      type: "p",
      text: "The arithmetic is unforgiving. One `3g.40gb` plus two `2g.20gb` plus one `1g.10gb` sounds like a sensible mix and needs eight slices, so it cannot be built. Layouts have to add up to seven or fewer, and the memory follows the compute rather than being chosen separately.",
    },
    {
      type: "p",
      text: "That brings the other MIG problem, which is fragmentation. Split the card into seven small instances. A model that needs more memory than one of them now fits nowhere, even though the card has plenty free. So plan the layout against the model sizes you really run. Then revisit it when they change.",
    },
    {
      type: "p",
      text: "MIG is also a whole-card choice. A card is split or it is not. So you cannot mix a full-GPU job with MIG instances on the same device. In practice you end up with node pools for each layout, and a provisioner that knows the difference — see [Karpenter versus Cluster Autoscaler](/devops/karpenter-vs-cluster-autoscaler-node-scaling).",
    },
    { type: "h2", id: "choosing", text: "Choosing" },
    {
      type: "table",
      caption: "What each mechanism actually isolates.",
      head: ["", "Time-slicing", "MPS", "MIG"],
      rows: [
        ["Memory pool", "Shared, no cap", "Shared, cap per client", "Dedicated"],
        ["Memory protection", "No", "Yes, from Volta", "Yes"],
        ["Fault isolation", "No", "No", "Yes"],
        ["Switching cost", "High", "None", "None"],
        ["Compute share control", "No", "Thread percentage", "By profile"],
        ["Fits", "Dev and batch", "Many small inference tasks", "Multi-tenant production"],
      ],
    },
    {
      type: "p",
      text: "Read the fault isolation row first. If the pods sharing a GPU belong to one team running one workload, a shared failure is an outage of something that was going to fail together anyway, and MPS gives you the best throughput. If they belong to different teams or different customers, a shared failure is one tenant taking down another, and only MIG prevents it.",
    },
    {
      type: "p",
      text: "There is a cost to partitioning, and it is worth stating. A MIG instance cannot use the whole card's cache or all its bandwidth, so a single large job runs better on an undivided GPU. Partition for inference, where the model fits in a slice and aggregate throughput is the goal. Keep whole GPUs for training. What the model needs from memory in the first place is the subject of [model serving infrastructure and the KV cache](/ai-enterprise-it/ai-model-serving-infrastructure-kv-cache-vllm).",
    },
  ],
  faq: [
    {
      question: "Does time-slicing limit GPU memory per pod?",
      answer:
        "No. Every pod sees the whole pool and nothing stops one taking most of it. The others then fail their allocations partway through their work.",
    },
    {
      question: "Does MPS isolate memory?",
      answer:
        "It protects it. From Volta each client has its own address space, and you can cap allocation per client. What it cannot do is contain a fatal fault.",
    },
    {
      question: "What happens if one MPS client crashes?",
      answer:
        "The clients share a context, so a fatal fault can take the daemon and every other client on that GPU with it. That is the structural limit.",
    },
    {
      question: "Can I split a GPU into any sizes I want?",
      answer:
        "No. Profiles come from a fixed set and the compute slices must total seven or fewer. A layout that needs eight simply cannot be built.",
    },
    {
      question: "Can I mix MIG and whole-GPU pods on one card?",
      answer:
        "No. MIG is set for the whole card. Plan one node pool for split cards and another for whole ones.",
    },
    {
      question: "Does MIG make the GPU slower?",
      answer:
        "For one large job, yes. An instance cannot use the full cache or bandwidth. For many small inference jobs, aggregate throughput goes up.",
    },
  ],
  sources: [
    {
      title: "Multi-Process Service",
      publisher: "NVIDIA",
      url: "https://docs.nvidia.com/deploy/mps/index.html",
    },
    {
      title: "MIG user guide",
      publisher: "NVIDIA",
      url: "https://docs.nvidia.com/datacenter/tesla/mig-user-guide/latest/index.html",
    },
    {
      title: "MIG device names",
      publisher: "NVIDIA",
      url: "https://docs.nvidia.com/datacenter/tesla/mig-user-guide/latest/mig-device-names.html",
    },
    {
      title: "NVIDIA device plugin for Kubernetes",
      publisher: "NVIDIA",
      url: "https://github.com/NVIDIA/k8s-device-plugin",
    },
  ],
};
