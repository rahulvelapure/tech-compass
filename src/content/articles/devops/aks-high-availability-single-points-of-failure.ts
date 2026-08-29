import type { Article } from "../../types";
import { bodyPart1 } from "./aks-high-availability-body-part1";
import { bodyPart2 } from "./aks-high-availability-body-part2";
import { bodyPart3 } from "./aks-high-availability-body-part3";
import { bodyPart4 } from "./aks-high-availability-body-part4";

export const article: Article = {
  slug: "aks-high-availability-single-points-of-failure",
  category: "devops",
  contentType: "analysis",
  subcategory: "Kubernetes",
  title: "Your AKS app has three replicas. It can still have one failure that stops all three",
  seoTitle: "AKS High Availability: Finding Hidden Single Points of Failure",
  metaDescription: "Multiple AKS replicas do not guarantee application availability. Trace the critical request path, map shared failure domains, and design detection and recovery.",
  standfirst: "Three Pods can still share one bad database, one identity path, or one network link. To stay up, trace what each good request still needs.",
  excerpt: "Microsoft's AKS guidance starts with a better question than replica count: where can every valid request still fail together? That question exposes the dependencies Kubernetes cannot make redundant for you.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-28",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-08-28",
  readingMinutes: 12,
  primaryKeyword: "AKS high availability",
  secondaryKeywords: [
    "Kubernetes high availability",
    "AKS architecture",
    "AKS failure domains",
    "Kubernetes single points of failure",
    "AKS disaster recovery",
  ],
  tags: [
    "Azure",
    "AKS",
    "Kubernetes",
    "High Availability",
    "Architecture",
    "DevOps",
  ],
  reviewStatus: "research-based",
  draft: true,
  relatedSlugs: [
    "kubernetes-topology-spread-constraints-vs-pod-anti-affinity",
    "kubernetes-pod-disruption-budgets-eviction-mechanics",
    "kubernetes-statefulset-vs-deployment-storage-identity",
  ],
  methodology: "Written from Microsoft Learn guidance on high availability for multitier AKS applications, AKS reliability practices, and Azure monitoring guidance, reviewed August 2026. The article keeps Microsoft's application-level boundary: it explains HA within an AKS cluster and treats multicluster or multiregion recovery as a separate design problem. Examples are architecture scenarios, not reported incidents.",
  body: [...bodyPart1, ...bodyPart2, ...bodyPart3, ...bodyPart4],
  faq: [
    {"question": "Does running multiple replicas guarantee high availability?", "answer": "No. One shared part can stop all Pods."},
    {"question": "Is AKS high availability the same as disaster recovery?", "answer": "No. HA keeps a running system up. DR brings it back after a major loss."},
    {"question": "Why are readiness and liveness probes important?", "answer": "One probe stops traffic. The other can restart a Pod."},
    {"question": "Do all AKS workloads need multiregion deployment?", "answer": "No. Use more regions only when the business truly needs them."},
    {"question": "What should an AKS HA test prove?", "answer": "It should show that the team can spot, isolate, and fix a real failure."},
  ],
  sources: [
    {"title": "High availability for multitier AKS applications", "publisher": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/azure/architecture/guide/aks/aks-high-availability"},
    {"title": "AKS reliability best practices", "publisher": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/azure/aks/best-practices-app-cluster-reliability"},
    {"title": "Best practices for monitoring and diagnostics", "publisher": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/azure/architecture/best-practices/monitoring"},
    {"title": "Recommended active-active high availability solution for AKS", "publisher": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/azure/aks/active-active-solution"},
  ],
};
