# Microsoft Learn Batch 002 — QA and release record

Status: locked for controlled production QA.

This batch contains the ten refined articles from editorial refinement batches 004 and 005. The articles already exist in `src/content/articles/` on `master`; this record locks the release set and its acceptance gates without rewriting already-refined article objects.

## Locked release set

### Refinement batch 004

1. `aws-transit-gateway-vs-vpc-peering`
2. `fido2-discoverable-credentials-resident-keys`
3. `wdac-vs-applocker-kernel-enforcement`
4. `aurora-serverless-v2-scaling-connection-limits`
5. `karpenter-vs-cluster-autoscaler-node-scaling`

### Refinement batch 005

6. `service-mesh-mtls-operational-overhead`
7. `aws-lambda-cold-start-optimization-snapstart`
8. `entra-id-authentication-context-step-up-mfa`
9. `terraform-state-locking-drift-enterprise-reality`
10. `postgresql-connection-pooling-pgbouncer-rds-proxy`

## Readability gate

Refinement records report all ten passing the repository editorial thresholds:

- technical body Flesch Reading Ease >= 55
- standfirst >= 70
- opening >= 65
- worst FAQ >= 70
- average sentence length <= 15 words
- longest sentence <= 35 words

Batch 004 measured body scores: 59.0, 58.6, 58.3, 55.2, 65.4.
Batch 005 measured body scores: 57.9, 59.4, 61.4, 64.5, 58.3.

## Technical/source gate

The refinement records document source verification and corrections for each article. Examples include AWS Transit Gateway appliance-mode routing and address overlap, FIDO2 discoverable credential terminology and slot variability, App Control for Business/AppLocker terminology, Aurora Serverless v2 version-dependent capacity behavior, Karpenter versus Cluster Autoscaler scope, Istio versus Linkerd proxy architecture, Lambda SnapStart restore semantics, Entra authentication context claims and limits, Terraform state/refactoring behavior, and RDS Proxy session pinning.

## Release gates

1. Generate the article index and confirm it is current.
2. Run `bun run validate:content` with zero errors.
3. Run `bun run verify` with zero errors.
4. Run `bun run build:node` successfully.
5. Run the production Cloudflare build/deploy path with `bun run build` followed by `bunx nitro deploy --prebuilt`.
6. Validate the deployed production origin.
7. Do not introduce draft-state changes solely to manufacture release status; these are existing refined production Article objects.

## Held items

No article in this ten-article set is the previously held duplicate-intent material from batches 001–003. Held topics remain excluded from this release.

## Source records

- `docs/editorial/qwen-batch-004.refined.md`
- `docs/editorial/qwen-batch-005.refined.md`
- `docs/editorial/batch-004.md`
- `docs/editorial/batch-005.md`

## Release rule

No production release is considered complete until the current branch passes the complete repository validation and the live-origin deployment validation against the deployed site.

<!-- release-candidate: Batch 002 locked 2026-08-30 -->