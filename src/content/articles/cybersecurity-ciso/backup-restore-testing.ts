import type { Article } from "../../types";

export const article: Article = {
  slug: "backup-restore-testing",
  category: "cybersecurity-ciso",
  contentType: "how-to",
  subcategory: "Resilience",
  title: "How to test backups properly: a restore drill you can run quarterly",
  seoTitle: "How to test backups: a restore drill",
  metaDescription:
    "A repeatable quarterly restore drill: choose a realistic scenario, restore to an isolated environment, measure the time, and record what broke.",
  standfirst:
    "An untested backup is a guess. A drill is what turns it into something you can count on.",
  excerpt:
    "A concrete restore drill you can run every quarter, including what to measure and what evidence to keep.",
  authorId: "rahul-velapure",
  publishedAt: "2026-02-16",
  lastReviewedAt: "2026-08-28",
  nextReviewAt: "2027-08-28",
  readingMinutes: 4,
  primaryKeyword: "backup restore testing",
  secondaryKeywords: [
    "restore drill procedure",
    "test backups regularly",
    "recovery time objective",
    "recovery point objective",
    "isolated recovery environment",
  ],
  tags: ["Resilience", "Security", "Operations", "Troubleshooting"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "bitlocker-tpm-failure-recovery-enterprise",
    "kubernetes-storage-classes-costs-performance-traps",
  ],
  methodology:
    "Built from NIST SP 800-34 Rev. 1 on contingency planning and testing, NIST SP 800-184 on cybersecurity event recovery, and standard resilience testing practice, verified August 2026. No client environment is described, and no recovery times, failure rates or costs are quoted, because any such figure would be specific to one estate rather than general.",
  body: [
    {
      type: "p",
      text: "A backup job reports success against its own definition of it. Bytes were written. The job exited zero.",
    },
    {
      type: "p",
      text: "That tells you a file exists. It does not tell you a service can be rebuilt from it, and it does not tell you how long that would take. Only a restore answers those.",
    },
    {
      type: "p",
      text: "So the drill is not a formality. It is the only test that measures the thing the business actually assumes.",
    },
    { type: "h2", id: "objectives", text: "The two numbers you are testing against" },
    {
      type: "p",
      text: "Two objectives frame every drill, and they measure different failures.",
    },
    {
      type: "ul",
      items: [
        "**Recovery time objective (RTO).** How long the business will accept the service being down. The drill measures your real recovery time against it.",
        "**Recovery point objective (RPO).** How much data the business will accept losing. The drill measures the gap between the restored state and the moment of failure.",
      ],
    },
    {
      type: "p",
      text: "Both are business decisions, not technical ones. Your job is to find out whether the estate can meet them, and to say so plainly when it cannot.",
    },
    {
      type: "callout",
      variant: "note",
      title: "An objective nobody has tested is a wish",
      text: "A four-hour RTO written in a policy document costs nothing to promise. It becomes real only once someone has restored the system and stopped a clock. Until then it is an assumption that has never met the estate it describes.",
    },
    { type: "h2", id: "scenario", text: "Pick one realistic scenario" },
    {
      type: "p",
      text: "Do not try to rehearse everything at once. Pick one scenario, run it properly, and rotate through the others over the year.",
    },
    {
      type: "ul",
      items: [
        "A single deleted record set, restored to a point in time. This is the most common real request, and the one teams practise least.",
        "A whole system lost, restored to different hardware or a different region. This is where hidden platform dependencies show up.",
        "A ransomware scenario, where you assume the most recent backups are compromised and restore from an earlier known-good point.",
      ],
    },
    {
      type: "p",
      text: "The third one changes the shape of the exercise. If recent backups cannot be trusted, the question is no longer how fast you restore. It is how far back you have to go, and whether anyone can tell you which point is clean.",
    },
    { type: "h2", id: "procedure", text: "The drill" },
    {
      type: "ol",
      items: [
        "Restore into an isolated network. Never restore over the live system to test it, and never let a possibly compromised restore reach production.",
        "Start the clock when the decision is made, not when the restore command runs. The delay before that is part of your real recovery time, and it is usually the largest part.",
        "Work from the runbook as written. If someone has to improvise, that is a finding, and it is worth more than a fast result.",
        "Validate at the application layer. Log in, run a transaction, check integrity and row counts. A mounted volume is not a restored service.",
        "Record the measured recovery time against the stated objective, and note every manual step that was needed.",
      ],
    },
    {
      type: "p",
      text: "That third step is the one teams skip. A drill run by the person who built the system proves that person can recover it. It does not prove the runbook works, and the runbook is what you will have at three in the morning.",
    },
    { type: "h2", id: "dependencies", text: "The dependency trap" },
    {
      type: "p",
      text: "Most drills stall in the same place. The restore needs something that is itself part of the outage.",
    },
    {
      type: "p",
      text: "The pattern is circular. You need a credential to start the recovery, and the credential lives in the system you are recovering. Or the backup catalogue is on the failed platform. Or the decryption key sits in a vault that authenticates against the identity provider that is down.",
    },
    {
      type: "ul",
      items: [
        "Credentials and break-glass accounts, held somewhere outside the estate they unlock.",
        "Encryption and recovery keys. [BitLocker recovery keys](/windows/bitlocker-tpm-failure-recovery-enterprise) are the everyday example of a key you cannot reach from the machine that needs it.",
        "The backup catalogue or index, which is often the single point of failure nobody lists.",
        "DNS, certificates and licence servers, each of which can quietly block a service from starting.",
        "The runbook itself, if it only exists on the wiki that is currently offline.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Test the credentials too",
      text: "Recovery frequently stalls because the restore requires access to a system that is itself down, or a credential stored only in the environment being recovered. Print it, vault it elsewhere, or accept that the drill will find it for you at the worst moment.",
    },
    { type: "h2", id: "ransomware", text: "The ransomware variant is a different exercise" },
    {
      type: "p",
      text: "Ordinary recovery assumes the backup is good and the platform is trustworthy. A ransomware drill assumes neither.",
    },
    {
      type: "p",
      text: "Three things change. You need backups an attacker could not alter, which is what immutability and offline copies are for. You need a way to choose a restore point from before the intrusion, which needs detection data, not just backup data. And you need somewhere clean to rebuild, because restoring into the compromised environment simply hands the estate back.",
    },
    {
      type: "p",
      text: "NIST SP 800-184 is worth reading here. It treats recovery as something you plan, rehearse and improve, rather than a procedure you write once and file.",
    },
    { type: "h2", id: "measure", text: "What to write down" },
    {
      type: "p",
      text: "Measure a few things consistently, and the drills become comparable over time.",
    },
    {
      type: "ul",
      items: [
        "Time from decision to service restored, split out from time spent on the restore itself.",
        "The actual data loss window, and how it compares with the RPO.",
        "Every manual step, and every point where someone had to ask a question the runbook did not answer.",
        "What failed. A drill that finds nothing usually means the scenario was too easy.",
      ],
    },
    {
      type: "p",
      text: "A dated record of each drill — scenario, measured time, failures found, fixes made — is the artefact auditors ask for. It is also the argument that funds the next improvement, which is the part that matters more.",
    },
    { type: "h2", id: "cadence", text: "Cadence, and when to break it" },
    {
      type: "p",
      text: "Quarterly suits most critical systems. The interval matters less than the fact that it is fixed and the results are written down.",
    },
    {
      type: "p",
      text: "Run an extra drill after anything that changes the shape of recovery. A platform migration, a change of backup tooling, a new region, or a significant change to identity. Those are the moments when a runbook silently stops being true.",
    },
  ],
  faq: [
    {
      question: "How often should restores be tested?",
      answer:
        "Quarterly works for critical systems. Add a drill after any big change to the platform or tooling. A fixed interval matters more than the exact number.",
    },
    {
      question: "Is a backup job that says success good enough?",
      answer:
        "No. It tells you bytes were written. It says nothing about whether the service comes back, or how long that takes.",
    },
    {
      question: "Can we test by restoring over the live system?",
      answer:
        "No. Restore into a network of its own. Test over the live one and the drill becomes the outage you were trying to avoid.",
    },
    {
      question: "What is the difference between RTO and RPO?",
      answer:
        "RTO is how long you may be down. RPO is how much data you may lose. A drill measures both, and they can fail on their own.",
    },
    {
      question: "Who should run the drill?",
      answer:
        "Not the person who built the system. Hand the runbook to someone else. If they get stuck, you have found the gap.",
    },
    {
      question: "What if we miss the objective?",
      answer:
        "Write it down and say so. A missed target with evidence is useful. A target nobody has measured is worth nothing.",
    },
  ],
  sources: [
    {
      title: "SP 800-34 Rev. 1, Contingency Planning Guide for Federal Information Systems",
      publisher: "NIST",
      url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final",
    },
    {
      title: "SP 800-184, Guide for Cybersecurity Event Recovery",
      publisher: "NIST",
      url: "https://csrc.nist.gov/pubs/sp/800/184/final",
    },
  ],
};
