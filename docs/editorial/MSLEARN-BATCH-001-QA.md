# Microsoft Learn Batch 001 QA

This file records the release gate for the ten-article Microsoft Learn production release candidate.

## Locked release set

The release set is intentionally assembled from the verified/refined editorial inventory across batches 001–003. The original Batch 001 source had five slots; four were refined and one Autopilot draft was held for duplicate intent. Rather than publish duplicate coverage, the release set uses the next eligible refined articles already present in the repository.

1. `entra-id-vs-active-directory-differences`
2. `bgp-in-the-cloud-why-it-matters`
3. `passkeys-enterprise-deployment-reality`
4. `kubernetes-pod-networking-packet-flow`
5. `cloud-egress-costs-architecture-problem`
6. `saml-federation-security-risks-trust-boundaries`
7. `enterprise-ai-agents-security-governance-reality`
8. `aws-vpc-lattice-vs-api-gateway-service-networking`
9. `oauth2-token-theft-dpop-mechanics`
10. `windows-laps-entra-id-architecture-deployment`

The held `windows-autopilot-troubleshooting-oobe-failure` draft is excluded because it overlaps existing published Autopilot coverage and is not part of the ten-article release set.

## Editorial/source status

All ten selected articles have refined TypeScript Article objects in `src/content/articles/` and matching refinement records in the editorial audit trail. Their published/refined status, source basis, technical corrections, overlap decisions and readability metrics are documented in `qwen-batch-001.refined.md`, `qwen-batch-002.refined.md`, and `qwen-batch-003.refined.md`.

## Readability gates

The repository's authoritative thresholds are:

- Standfirst: Flesch Reading Ease >= 70
- Opening paragraph: Flesch Reading Ease >= 65
- Worst FAQ answer: Flesch Reading Ease >= 70
- Technical body: Flesch Reading Ease >= 55
- Average sentence length <= 15 words
- Longest sentence <= 35 words

The refined records report passing measurements for all ten selected articles.

## Release gates

- Article index generated and clean.
- TypeScript typecheck passes.
- ESLint passes without errors.
- Secret, personal-data and local-path scan passes.
- Content schema and metadata validation passes with zero errors.
- Unit tests pass.
- Production Node build passes.
- Accessibility checks pass.
- Route crawl and HTML audit pass.
- Lighthouse and Core Web Vitals pass for the configured production audit.

## Draft/release metadata

The ten selected files are existing refined/published Article objects rather than the held draft. No temporary Batch 001 draft marker is being used to represent publication status. Publication is controlled by the repository's release/route conventions and the final PR merge/deployment gate.

## Release rule

The branch stays in review until the complete CI run for the locked ten-article set is green. No production deployment is authorized by this QA record before that point.
