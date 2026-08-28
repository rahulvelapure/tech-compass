import type { Article } from "../../types";

export const article: Article = {
  slug: "post-quantum-cryptography-nist-migration-enterprise",
  category: "cybersecurity-ciso",
  contentType: "decision-framework",
  subcategory: "Resilience",
  title: "The traffic you cannot protect today is the traffic being recorded",
  seoTitle: "Post-Quantum Cryptography: NIST Standards and Migration",
  metaDescription:
    "NIST finalised ML-KEM, ML-DSA and SLH-DSA in 2024. What they replace, why key exchange moves before signatures, and how to sequence an enterprise migration.",
  standfirst:
    "Traffic taken today can be read later. That makes long-lived secrets a problem now. The rest is a long hunt for where your keys live.",
  excerpt:
    "The standards are finished, so the question is sequencing. Key exchange can move now and largely has. Signatures depend on certificate authorities, hardware and build systems you do not control.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-24",
  lastReviewedAt: "2026-08-24",
  nextReviewAt: "2027-02-24",
  readingMinutes: 6,
  primaryKeyword: "post-quantum cryptography migration",
  secondaryKeywords: [
    "NIST PQC standards",
    "ML-KEM ML-DSA",
    "hybrid key exchange TLS",
    "harvest now decrypt later",
    "crypto agility",
  ],
  tags: ["Cryptography", "Security", "Compliance", "TLS", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: ["oauth2-token-theft-dpop-mechanics", "passkeys-enterprise-deployment-reality"],
  draft: true,
  methodology:
    "Written from the NIST post-quantum cryptography project pages for FIPS 203, 204 and 205, CISA guidance on the harvest-now-decrypt-later threat, and the IETF work on hybrid key exchange in TLS 1.3, verified August 2026. Three corrections were made to the source draft: FIPS 206 is not finalised, the hybrid TLS group is not defined in RFC 9180, and library version claims were removed rather than restated. Qubit estimates are described as contested rather than quoted, because published figures have been revised substantially.",
  body: [
    {
      type: "p",
      text: "Most of what we do is about stopping an attack. This one is about an attack that may have happened already. You would have no way to know.",
    },
    {
      type: "p",
      text: "An adversary who records encrypted traffic today does not need to break it today. They need to store it and wait. When hardware capable of running Shor's algorithm at scale exists, the recording becomes readable.",
    },
    {
      type: "p",
      text: "That is harvest now, decrypt later, and it reorders the priorities. For data that stops mattering in a year, the risk is small. For anything with a decade of required confidentiality — medical records, legal files, source code, state secrets — the exposure started whenever it crossed the wire.",
    },
    { type: "h2", id: "what-breaks", text: "What actually breaks, and what does not" },
    {
      type: "p",
      text: "The scope is narrower than the coverage suggests. This is a public-key problem.",
    },
    {
      type: "table",
      caption: "Where the quantum threat lands",
      head: ["Primitive", "Status", "Action"],
      rows: [
        ["RSA", "Broken by Shor's algorithm", "Replace for exchange and signing"],
        ["Diffie-Hellman and ECDH", "Broken by Shor's algorithm", "Replace for key exchange"],
        ["ECDSA", "Broken by Shor's algorithm", "Replace for signing"],
        ["AES-256", "Weakened by Grover, not broken", "No migration needed"],
        ["SHA-2 and SHA-3", "Weakened by Grover, not broken", "Prefer longer digests"],
      ],
    },
    {
      type: "p",
      text: "Grover's algorithm gives a quadratic speedup on brute-force search, which is often summarised as halving effective key length. AES-256 at an effective 128 bits remains far out of reach. Your symmetric encryption and hashing are not the project.",
    },
    {
      type: "p",
      text: "This distinction is worth making early, because it is where budget gets wasted. Nobody needs to re-encrypt a data lake. They need to find every place a key is agreed or a signature verified.",
    },
    { type: "h2", id: "standards", text: "What NIST actually standardised" },
    {
      type: "p",
      text: "In August 2024 NIST released three standards, which replace different things.",
    },
    {
      type: "p",
      text: "**FIPS 203, ML-KEM** is a key-encapsulation mechanism, derived from CRYSTALS-Kyber. It replaces Diffie-Hellman and ECDH for agreeing a session key. Its keys and ciphertexts are considerably larger than elliptic-curve equivalents, but the operations are fast, and it is the piece already in production use.",
    },
    {
      type: "p",
      text: "**FIPS 204, ML-DSA** is a signature scheme derived from CRYSTALS-Dilithium. It replaces RSA and ECDSA for signing. Signatures are substantially larger than ECDSA signatures — enough to matter for protocols that carry many of them.",
    },
    {
      type: "p",
      text: "**FIPS 205, SLH-DSA** is a hash-based signature scheme derived from SPHINCS+. Its security rests only on the hash function, not on lattice assumptions. That makes it the conservative option, and its signatures are large enough that it suits firmware and root-of-trust signing rather than general TLS.",
    },
    {
      type: "callout",
      variant: "note",
      title: "The set is still growing",
      text: "Two things commonly get stated as finished when they are not. FN-DSA, based on FALCON and expected as FIPS 206, is still in standardisation rather than published. And HQC has been selected as an additional key-encapsulation mechanism, chosen for a different mathematical basis so that the KEM story does not rest entirely on lattices. Plan for a portfolio, not a single replacement algorithm.",
    },
    { type: "h2", id: "hybrid", text: "Why nobody is migrating directly" },
    {
      type: "p",
      text: "These algorithms are new. Lattice problems are well studied, but not with the decades of concentrated attack that RSA has survived. Replacing a proven algorithm with an unproven one is its own risk.",
    },
    {
      type: "p",
      text: "The answer is hybrid key exchange. Run a classical exchange and a post-quantum one in the same handshake, and derive the session key from both. The result holds as long as at least one remains unbroken. You are not betting on the new algorithm; you are adding it.",
    },
    {
      type: "p",
      text: "In TLS 1.3 the widely deployed group is X25519MLKEM768, combining X25519 with ML-KEM. It is specified in IETF work on hybrid ECDHE-MLKEM key agreement, with the general framework for hybrid exchange published separately. It is not defined in RFC 9180, which is a different document covering hybrid public key encryption — a citation error worth not repeating.",
    },
    {
      type: "p",
      text: "This is the part of the migration that has already happened at scale. Major browsers and content delivery networks turned it on some time ago, which is why key exchange is the easy half.",
    },
    { type: "h2", id: "signatures", text: "Signatures are the hard half" },
    {
      type: "p",
      text: "Key exchange is negotiated between two endpoints. If both support a group, they use it. Nobody else needs to agree.",
    },
    {
      type: "p",
      text: "Signatures are different, because a certificate is an assertion by a third party that a fourth party must be able to verify. Moving to ML-DSA certificates requires the certificate authority to issue them, the server to serve them, and every client to validate them. Each of those is somebody else's release schedule.",
    },
    {
      type: "p",
      text: "Size compounds it. Larger signatures and larger public keys mean larger certificate chains, and the chain is transmitted on every handshake. For most web traffic that is unremarkable. For constrained links, high-frequency connections, or protocols that were designed around small signatures, it is a genuine engineering constraint.",
    },
    {
      type: "p",
      text: "The practical consequence is that hybrid key exchange is a configuration change you can make this quarter, while certificate migration is a programme that waits on your CA and your client estate.",
    },
    { type: "h2", id: "inventory", text: "The inventory is the actual work" },
    {
      type: "p",
      text: "Every migration plan in this space converges on the same first step, and it is not a technical one. You cannot replace cryptography you cannot find.",
    },
    {
      type: "table",
      caption: "Where public-key cryptography hides",
      head: ["Surface", "What to look for", "Notes"],
      rows: [
        [
          "TLS endpoints",
          "Cipher suites and certificates",
          "Includes internal services, not just public",
        ],
        ["VPN and IPsec", "Key exchange in IKE", "Vendor firmware dependency"],
        ["SSH", "Host and user key algorithms", "Hybrid exchange is available in current OpenSSH"],
        [
          "Code and firmware signing",
          "Build and release pipelines",
          "Long-lived trust anchors; slow to change",
        ],
        ["Email and documents", "S/MIME and PGP", "Often forgotten entirely"],
        [
          "HSMs and secure elements",
          "Supported algorithms in firmware",
          "May require hardware replacement",
        ],
        [
          "Embedded and OT devices",
          "Anything that cannot be updated",
          "Compensating controls, not migration",
        ],
      ],
    },
    {
      type: "p",
      text: "The two rows that determine your timeline are the last ones. Software you can update on your own schedule. Hardware that cannot accept new algorithms has to be replaced or isolated, and that lands in a capital plan rather than a sprint.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Prioritise by confidentiality lifetime, not by system criticality",
      text: "The instinct is to start with the most important systems. For this threat the better sort is how long the data must stay secret. A payment authorisation that is worthless in an hour is low risk even on a critical path. A design document that must stay confidential for fifteen years is exposed right now. Rank by lifetime first, then by criticality within that.",
    },
    { type: "h2", id: "sequence", text: "A sequence that survives contact" },
    {
      type: "ol",
      items: [
        "**Inventory, and rank by confidentiality lifetime.** Nothing sensible happens before this.",
        "**Turn on hybrid key exchange where it is already supported.** Public endpoints, then internal ones. This is configuration, and it addresses harvest-now traffic today.",
        "**Enable hybrid exchange in SSH and VPN** where the software and appliances support it.",
        "**Ask vendors for dates, in writing.** Certificate authorities, HSMs, VPN appliances, load balancers. The answers shape everything after this point.",
        "**Test certificate chains in non-production.** Find the size and compatibility problems before they are urgent.",
        "**Build crypto agility into anything new.** Algorithms behind configuration, not compiled into application logic.",
        "**Plan for what cannot migrate.** Isolation, application-layer encryption, or replacement.",
      ],
    },
    {
      type: "p",
      text: "On timelines: the standards are published and the first half is deployable now, but signature migration depends on parties outside your control. Treat published multi-year projections as planning assumptions rather than commitments, and revisit them as CA and hardware support lands.",
    },
    {
      type: "p",
      text: "One number worth not quoting is how large a quantum computer needs to be. Published estimates for breaking RSA-2048 have moved by orders of magnitude as error-correction techniques improved, and they will move again. The estimate is not the input to your decision. The confidentiality lifetime of your data is.",
    },
    { type: "h2", id: "takeaways", text: "What to take away" },
    {
      type: "ul",
      items: [
        "This is a public-key problem. AES-256 and SHA-2 do not need replacing.",
        "Harvest now, decrypt later makes long-lived data an issue today rather than later.",
        "Three standards are final. FN-DSA is not, and HQC has been added — expect a portfolio.",
        "Hybrid key exchange is the transition mechanism, and it is already widely deployed.",
        "The hybrid TLS group is specified in IETF ECDHE-MLKEM work, not RFC 9180.",
        "Key exchange is a config change. Signatures wait on certificate authorities and clients.",
        "Rank by how long data must stay secret, not by system importance.",
        "Hardware that cannot take new algorithms sets your real timeline.",
      ],
    },
    {
      type: "p",
      text: "The organisations that finish this comfortably will be the ones that started the inventory while it was still boring. The work is not cryptographic sophistication. It is knowing where your keys are, and having designed systems where swapping an algorithm does not mean editing application code.",
    },
  ],
  faq: [
    {
      question: "Do I need to replace AES-256?",
      answer:
        "No. Grover's algorithm weakens symmetric ciphers, but it does not break them. AES-256 is still far out of reach. This is a public-key problem.",
    },
    {
      question: "What can I actually deploy today?",
      answer:
        "Hybrid key exchange. It runs a classical exchange and ML-KEM together, so the session holds if either one survives. Much of the public web already does this.",
    },
    {
      question: "Why not move straight to the post-quantum algorithm?",
      answer:
        "Because it is new. With hybrid, a flaw found later in the new scheme does not cost you the session. The classical half still has to be broken too.",
    },
    {
      question: "Is FIPS 206 finished?",
      answer:
        "No. FN-DSA, based on FALCON, is still going through the process. Three are final: ML-KEM, ML-DSA and SLH-DSA.",
    },
    {
      question: "When will I be able to buy post-quantum certificates?",
      answer:
        "That depends on your CA and on client support, and you control neither. Ask for dates in writing. Test the chains early.",
    },
    {
      question: "Where should I start?",
      answer:
        "Make a list of every place you use public-key crypto. Rank it by how long the data must stay secret. The rest follows from that list.",
    },
  ],
  sources: [
    {
      title: "Post-Quantum Cryptography project",
      publisher: "NIST",
      url: "https://csrc.nist.gov/projects/post-quantum-cryptography",
    },
    {
      title: "FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard",
      publisher: "NIST",
      url: "https://csrc.nist.gov/pubs/fips/203/final",
    },
    {
      title: "FIPS 204: Module-Lattice-Based Digital Signature Standard",
      publisher: "NIST",
      url: "https://csrc.nist.gov/pubs/fips/204/final",
    },
    {
      title: "FIPS 205: Stateless Hash-Based Digital Signature Standard",
      publisher: "NIST",
      url: "https://csrc.nist.gov/pubs/fips/205/final",
    },
    {
      title: "Post-Quantum Cryptography Initiative",
      publisher: "CISA",
      url: "https://www.cisa.gov/quantum",
    },
    {
      title: "Post-quantum hybrid ECDHE-MLKEM key agreement for TLS 1.3",
      publisher: "IETF",
      url: "https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/",
    },
  ],
};
