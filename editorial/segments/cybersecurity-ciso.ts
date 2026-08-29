import type { Segment } from "../types";

/**
 * Cybersecurity and security leadership backlog.
 *
 * Researched against NIST, CISA, CIS, OWASP, MITRE and Microsoft Security in
 * August 2026. Three currency findings shaped what is planned here:
 *
 * 1. NIST CSF 2.0 has six functions — Govern, Identify, Protect, Detect,
 *    Respond, Recover. Govern was added in the 2024 revision, the framework's
 *    first major update since 2014, and it is the change that matters most to a
 *    CISO audience.
 * 2. OWASP Top 10:2025 is current, superseding 2021. A01 Broken Access Control
 *    remains first; A03 Software Supply Chain Failures is new, expanded from
 *    A06:2021 Vulnerable and Outdated Components; Cryptographic Failures fell
 *    from second to fourth. A backlog planned around the 2021 list would be
 *    stale on arrival.
 * 3. CIS Controls v8.1 defines 153 Safeguards across three Implementation
 *    Groups — IG1 56, IG2 74, IG3 the remaining 23. IG1 is framed as essential
 *    cyber hygiene and is the practical on-ramp for most organisations.
 *
 * CSF 2.0 informs the structure without dictating it. Mirroring the six
 * functions as clusters would produce poor editorial boundaries — "Protect"
 * alone would swallow identity, endpoint, network and data security. The
 * clusters below follow how a practitioner actually specialises; CSF is used as
 * a mapping layer inside articles instead.
 */
export const segment: Segment = {
  name: "Cybersecurity / CISO",
  category: "cybersecurity-ciso",
  topics: [
    /* The rest of this generated segment is unchanged. */
  ],
};
