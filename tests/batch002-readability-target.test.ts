import { describe, expect, it } from "vitest";
import { articles } from "@/content/articles";
import { measure } from "../scripts/readability";

const slugs = [
  "aws-transit-gateway-vs-vpc-peering",
  "fido2-discoverable-credentials-resident-keys",
  "wdac-vs-applocker-kernel-enforcement",
  "aurora-serverless-v2-scaling-connection-limits",
  "karpenter-vs-cluster-autoscaler-node-scaling",
  "service-mesh-mtls-operational-overhead",
  "aws-lambda-cold-start-optimization-snapstart",
  "entra-id-authentication-context-step-up-mfa",
  "terraform-state-locking-drift-enterprise-reality",
  "postgresql-connection-pooling-pgbouncer-rds-proxy",
];

describe("Batch 002 body readability", () => {
  it("meets the editorial Flesch target for every release candidate", () => {
    for (const slug of slugs) {
      const article = articles.find((candidate) => candidate.slug === slug);
      expect(article, `missing article ${slug}`).toBeDefined();
      const prose = article!.body
        .map((block) => {
          switch (block.type) {
            case "p":
            case "h2":
            case "h3":
            case "quote":
              return block.text;
            case "ul":
            case "ol":
              return block.items.join(" ");
            case "table":
              return [block.caption ?? "", ...block.head, ...block.rows.flat()].join(" ");
            case "callout":
              return `${block.title} ${block.text}`;
            default:
              return "";
          }
        })
        .join(" ");
      const result = measure(prose);
      console.log(`${slug}: Flesch=${result.flesch.toFixed(1)} ASL=${result.asl.toFixed(1)} ASW=${result.asw.toFixed(2)} words=${result.words}`);
      expect(result.flesch, `${slug} body Flesch`).toBeGreaterThanOrEqual(70);
    }
  });
});
