# Batch 002 readability remediation

This branch is a controlled editorial pass for the ten Batch 002 release candidates. The repository's established technical-prose gate is a body Flesch Reading Ease score of 55 or higher, while higher thresholds apply to standfirsts, opening paragraphs and FAQ answers.

The previous PR revision used a body target of 70. That target is not consistent with `scripts/readability.ts`, whose documentation notes that technical terminology raises average syllables per word and therefore makes a single 70-point body gate unsuitable for technical prose.

The existing article source remains the technical source of truth. Rewrites must preserve technical terminology, source links, architecture claims, and article intent. The pass improves sentence shape and plain-English flow without removing useful technical depth.
