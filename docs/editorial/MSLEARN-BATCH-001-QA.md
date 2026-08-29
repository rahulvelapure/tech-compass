# Microsoft Learn Batch 001 QA

This file records the release gate for the Microsoft Learn Batch 001 draft branch.

## Release set

The current candidate set contains the validated article work for AKS high availability, cloud BGP, enterprise passkeys, and Kubernetes pod networking. The Autopilot OOBE draft remains held because its intent overlaps existing Autopilot coverage and its original source contained unresolved technical claims.

## Gates

- Article index must be generated and clean.
- TypeScript typecheck must pass.
- ESLint must pass without errors.
- Secret, personal-data and local-path scan must pass.
- Content schema and metadata validation must pass with zero errors.
- Unit tests must pass.
- Production Node build must pass.
- Accessibility and route crawl checks must pass.
- Local preview Lighthouse performance results are advisory; deployed-origin Lighthouse performance and SEO budgets remain strict.

## Release rule

The branch stays a draft until the complete CI run is green. No production deployment is authorized by this QA record.
