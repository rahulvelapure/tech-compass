import type { Article } from "../../types";

export const article: Article = {
  slug: "aws-efs-vs-fsx-lustre-s3-mountpoint",
  category: "cloud",
  contentType: "comparison",
  title: "Three ways to share files in AWS, and only one of them is really a file system",
  seoTitle: "EFS vs FSx for Lustre vs Mountpoint for S3",
  metaDescription:
    "EFS speaks NFS, Lustre splits metadata from data, and Mountpoint turns object calls into file calls. What each one guarantees, and where each one falls over.",
  standfirst:
    "The protocol under the mount point decides everything. Pick the wrong one and you get the right data at the wrong speed, or an app that fails on a rename.",
  excerpt:
    "EFS gives you POSIX and pays for it in metadata. Lustre gives you parallel throughput and gives up some POSIX. Mountpoint gives you S3 with file paths, and the rules changed when directory buckets arrived.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "AWS EFS vs FSx Lustre vs S3 Mountpoint",
  secondaryKeywords: [
    "AWS shared file storage",
    "EFS elastic throughput",
    "FSx for Lustre metadata",
    "Mountpoint for Amazon S3 semantics",
    "POSIX compliance AWS",
  ],
  tags: ["AWS", "Storage", "Cloud", "Performance", "Architecture"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "kubernetes-storage-classes-costs-performance-traps",
    "cloud-egress-costs-architecture-problem",
  ],
  methodology:
    "Written from the Amazon EFS performance specifications, the FSx for Lustre user guide, and the Mountpoint for Amazon S3 semantics document, verified August 2026. Two corrections were made to the source draft. It presented Bursting as the EFS default; Elastic is the recommended and default throughput mode, and Max I/O is a previous generation that AWS advises against. And it said Mountpoint cannot rename or append at all — both are supported on S3 Express One Zone directory buckets, with appends requiring the incremental upload flag. The draft's GPU training incident and its throughput figures were removed.",
  body: [
    {
      type: "p",
      text: "Block storage covers most work. Then something needs a shared mount. Containers reading one config file. A training job over one data set. An old app that will only talk to a path.",
    },
    {
      type: "p",
      text: "AWS offers three answers. They look similar from the mount point and they are not alike underneath. One speaks NFS, one is a parallel file system built for supercomputers, and one is object storage wearing a file system costume.",
    },
    {
      type: "p",
      text: "The protocol decides what you get. Everything else follows from it.",
    },
    { type: "h2", id: "efs", text: "EFS: real POSIX, and a metadata bill" },
    {
      type: "p",
      text: "EFS is managed NFSv4.1. It behaves like a Linux file system because it is one. You can lock a file, append to it, rename it, and mount it on hundreds of instances at once.",
    },
    {
      type: "p",
      text: "You do not provision capacity. It grows as you write and you pay for what you store.",
    },
    { type: "h3", id: "efs-throughput", text: "Pick the throughput mode deliberately" },
    {
      type: "p",
      text: "EFS has three throughput modes, and the guidance has moved. Elastic is the recommended default now. It scales with demand, accrues no credits, and bills on the data and metadata you actually read and write.",
    },
    {
      type: "table",
      caption: "EFS throughput modes and when each fits.",
      head: ["Mode", "Behaviour", "Use it when"],
      rows: [
        ["Elastic", "Scales automatically, no credits", "Spiky or unpredictable load"],
        ["Provisioned", "Fixed rate you pay for", "You know the requirement"],
        ["Bursting", "Baseline by size, plus credits", "Throughput should track stored size"],
      ],
    },
    {
      type: "p",
      text: "Bursting is the one with the trap, and it is worth understanding because plenty of older file systems still run it. Baseline throughput comes from how much you store. Idle time earns credits; heavy use spends them. Run the credits down and you drop to baseline, which on a small file system is very little. The workload does not fail. It just gets slow, and stays slow.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Do not reach for Max I/O",
      text: "Performance mode is a separate setting from throughput mode. Max I/O is a previous generation. AWS recommends General Purpose for every file system, because Max I/O costs you more latency per operation. It also cannot be used with Elastic throughput, or on One Zone file systems. If an old runbook tells you to switch to Max I/O for a parallel job, that advice has expired.",
    },
    { type: "h3", id: "efs-metadata", text: "Small files are the real limit" },
    {
      type: "p",
      text: "EFS handles large files well. Millions of small ones are a different story.",
    },
    {
      type: "p",
      text: "Every NFS request is metered as at least 4 KB of throughput, whatever its actual size. A directory listing over a hundred thousand files, or an extract that creates them, becomes a very long sequence of small round trips. The bytes are trivial and the operations are not.",
    },
    {
      type: "p",
      text: "That is the shape to watch for. If your workload is dominated by opens, stats and creates rather than by reads, EFS will disappoint you no matter which throughput mode you choose.",
    },
    { type: "h2", id: "lustre", text: "FSx for Lustre: throughput, at the cost of some POSIX" },
    {
      type: "p",
      text: "Lustre is not NFS. It is a parallel file system from high-performance computing, and AWS runs it as a managed service.",
    },
    {
      type: "p",
      text: "Its central idea is separation. A metadata target handles names and directories. Object storage targets hold the bytes. Clients talk to both, so many nodes can stream from many targets at once instead of queueing behind one server.",
    },
    {
      type: "p",
      text: "That is why it beats EFS on the work it suits. It is also why the metadata path is a part you can size, rather than a bottleneck you inherit.",
    },
    {
      type: "p",
      text: "It is mostly POSIX, not strictly. Some locking semantics differ from NFS. It is built for write-once, read-many and for large parallel jobs. Thousands of processes appending to one log file is not the shape it was designed for.",
    },
    {
      type: "p",
      text: "The S3 link is what makes it practical. Attach a bucket as a data repository and Lustre pulls objects in on first access, caches them on fast local storage, and serves them at speed. Export changed files back when the job ends. Your durable copy stays in S3 and Lustre is a fast working set over it.",
    },
    {
      type: "p",
      text: "Check the deployment type before you plan around durability. Scratch does not replicate at all, and is meant for temporary data. Persistent replicates inside one zone. That is not the same promise as a regional EFS file system.",
    },
    {
      type: "h2",
      id: "mountpoint",
      text: "Mountpoint for S3: a file interface, not a file system",
    },
    {
      type: "p",
      text: "S3 has no directories, no locks and no partial appends. Plenty of software insists on a path anyway. Mountpoint bridges that with FUSE, turning file operations into S3 API calls.",
    },
    {
      type: "p",
      text: "It is not fully POSIX, on purpose. That is the part to read closely before you deploy it.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "What it supports now depends on the bucket type",
      text: "On a general purpose bucket, Mountpoint reads files and writes new ones. It will not rename. It will not append to an object that already exists. On an S3 Express One Zone directory bucket it does both. Rename works. Append works too, when you mount with the incremental upload flag, and writes go in order from the end of the file. Directory renames, symlinks, hard links and random writes are unsupported everywhere. Advice written before directory buckets says none of this is possible, and that is now too broad.",
    },
    {
      type: "p",
      text: "Performance follows the same logic. Every operation is an HTTP call, so listing a directory means listing objects and latency is measured against an API rather than a disk. For large sequential reads that is fine, and Mountpoint can pull hard enough to saturate the network interface. For many small operations it is the slowest of the three by a wide margin.",
    },
    { type: "h2", id: "choosing", text: "Choosing" },
    {
      type: "table",
      caption: "The dimensions that actually decide it.",
      head: ["", "EFS", "FSx for Lustre", "Mountpoint for S3"],
      rows: [
        ["Protocol", "NFSv4.1", "Lustre", "FUSE over the S3 API"],
        ["POSIX", "Full", "Mostly", "Partial, bucket-dependent"],
        ["Metadata cost", "High", "Low, dedicated target", "Very high"],
        ["Best at", "Shared app state", "Parallel reads at scale", "Large sequential reads"],
        ["Durability scope", "Regional or One Zone", "One zone", "S3 durability"],
      ],
    },
    {
      type: "p",
      text: "Work from the access pattern rather than the size. Many small operations point at EFS, and away from Mountpoint entirely. Many readers over one large dataset point at Lustre. One application that only needs to read objects through a path points at Mountpoint, and costs you nothing to try.",
    },
    {
      type: "p",
      text: "Then check where the data has to travel. Reading a dataset repeatedly across a zone boundary is a transfer cost as well as a latency one, which is covered in [cloud egress costs](/cloud/cloud-egress-costs-architecture-problem). If the mount is destined for Kubernetes, the class and driver choices are set out in [Kubernetes storage classes](/devops/kubernetes-storage-classes-costs-performance-traps).",
    },
  ],
  faq: [
    {
      question: "Which EFS throughput mode should I pick?",
      answer:
        "Elastic, unless you know your load well. It scales on demand and earns no credits. Provisioned suits a steady, known rate.",
    },
    {
      question: "Why is EFS slow with lots of small files?",
      answer:
        "Every request is metered as at least 4 KB, whatever its real size. Opens, stats and creates dominate, and the bytes barely matter.",
    },
    {
      question: "Should I use Max I/O performance mode?",
      answer:
        "No. AWS says use General Purpose for all of them. Max I/O is an older mode. It has higher latency, and Elastic throughput will not work with it.",
    },
    {
      question: "Can Mountpoint for S3 append to a file?",
      answer:
        "Only on a directory bucket. You also need the incremental upload flag when you mount it. Writes must be in order and start at the end. A plain bucket cannot do it.",
    },
    {
      question: "Is FSx for Lustre highly available?",
      answer:
        "Not across zones. Scratch does not replicate at all. Persistent replicates inside one zone. Your durable copy should live in S3.",
    },
    {
      question: "Can I keep my data in S3 and still get speed?",
      answer:
        "Yes. Link the bucket to a Lustre file system. It pulls objects on first read, caches them locally, and exports changes back when you are done.",
    },
  ],
  sources: [
    {
      title: "Amazon EFS performance specifications",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/efs/latest/ug/performance.html",
    },
    {
      title: "What is Amazon FSx for Lustre?",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/fsx/latest/LustreGuide/what-is.html",
    },
    {
      title: "Mountpoint for Amazon S3 file system semantics",
      publisher: "Amazon Web Services",
      url: "https://github.com/awslabs/mountpoint-s3/blob/main/doc/SEMANTICS.md",
    },
    {
      title: "Mount an Amazon S3 bucket as a local file system",
      publisher: "Amazon Web Services",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/mountpoint.html",
    },
  ],
};
