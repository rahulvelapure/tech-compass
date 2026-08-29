import type { Article } from "../../types";

export const article: Article = {
  slug: "postgresql-pitr-wal-archiving-lsn-mechanics",
  category: "cloud",
  contentType: "explainer",
  title: "Your backup is only as good as the last WAL file that reached the archive",
  seoTitle: "PostgreSQL PITR: WAL Archiving and Recovery Targets",
  metaDescription:
    "How write-ahead logging, LSNs and recovery targets combine into point-in-time recovery, and why a silently failing archive command is the failure that matters.",
  standfirst:
    "A base backup gets you to a moment. The WAL stream gets you from there to any second you choose. Break the stream and you are back to the moment.",
  excerpt:
    "PITR is not a setting you switch on. It is a pipeline with a failure mode that stays invisible until you need it, and a recovery that pauses rather than finishing by default.",
  authorId: "rahul-velapure",
  publishedAt: "2026-05-25",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-02-26",
  readingMinutes: 5,
  primaryKeyword: "PostgreSQL PITR WAL archiving",
  secondaryKeywords: [
    "PostgreSQL log sequence number",
    "recovery_target_action",
    "archive_command failure",
    "pg_stat_archiver",
    "pgBackRest delta restore",
  ],
  tags: ["PostgreSQL", "Databases", "Resilience", "Cloud", "Operations"],
  reviewStatus: "research-based",
  relatedSlugs: ["backup-restore-testing", "database-connection-failover-mechanics-timeouts"],
  methodology:
    "Written from the PostgreSQL documentation on continuous archiving and on recovery target settings, and the pgBackRest user guide, verified August 2026. One correction was made to the source draft. It described promotion after reaching the target as an optional step, where `recovery_target_action` defaults to `pause` — recovery stops and waits, and `pg_wal_replay_resume()` is what ends it. The draft's IAM outage narrative was rewritten as the mechanism, and its restore timings were removed as unverifiable. The behaviour when `pg_wal` fills was corrected: PostgreSQL performs a PANIC shutdown and commits are not lost, rather than shutting down to prevent corruption.",
  body: [
    {
      type: "p",
      text: "A logical dump is a picture of the database at one moment. That is useful. It stops being a recovery plan once the database gets large.",
    },
    {
      type: "p",
      text: "The problem is the gap. If the dump finished at two in the morning and something goes wrong at three in the afternoon, everything in between is gone. The dump did nothing wrong. It just cannot represent a moment it was not taken at.",
    },
    {
      type: "p",
      text: "Point-in-time recovery closes the gap. It adds a steady stream on top of a snapshot taken now and then. You can then land on any second between the two.",
    },
    { type: "h2", id: "wal", text: "The write-ahead log is the source of truth" },
    {
      type: "p",
      text: "PostgreSQL does not write a change straight into the data files. It writes a record describing the change into the write-ahead log first, and the data files catch up later.",
    },
    {
      type: "p",
      text: "That ordering is what makes a crash survivable. On restart the server replays the log and brings the data files back to a consistent state. Recovery is a normal, well-exercised path rather than an exceptional one.",
    },
    {
      type: "p",
      text: "The log is an append-only stream cut into segments, 16 MB each by default. Normally the server recycles old segments once they are no longer needed for crash recovery. PITR works by keeping them instead.",
    },
    { type: "h2", id: "archiving", text: "Archiving, and the failure that hides" },
    {
      type: "p",
      text: "Turn on `archive_mode` and set an `archive_command`. When a segment fills, the server runs that command to copy it somewhere durable — object storage, another host, or a backup tool that manages the destination for you.",
    },
    {
      type: "p",
      text: "The contract is simple and strict. If the command succeeds, the segment can be recycled. If it fails, the server keeps the segment. It has to: discarding it would put a hole in the stream and make every later point unreachable.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "A broken archive is silent until the disk is full",
      text: "Nothing is refused while archiving fails. Transactions commit normally and the database looks healthy. What happens is that `pg_wal` stops draining and starts growing. When the file system fills, PostgreSQL performs a PANIC shutdown — no committed transaction is lost, but the database stays offline until you free space. The worse part is what you find afterwards: the archive is missing every segment since the failure began, so recovery cannot reach anything later than that point. The outage is loud. The data loss happened quietly, days earlier.",
    },
    {
      type: "p",
      text: "So the thing to monitor is not disk usage. It is the archiver itself. `pg_stat_archiver` publishes `archived_count`, `last_archived_wal` and `last_archived_time` alongside `failed_count`, `last_failed_wal` and `last_failed_time`.",
    },
    {
      type: "p",
      text: "Alert on two signals. Any movement in `failed_count` means the pipeline is broken now. And the distance between the current write position and `last_archived_wal` tells you how much data is not yet safe — which is the real recovery point objective, rather than the one in the policy document.",
    },
    {
      type: "p",
      text: "A proper backup tool helps here. It archives in the background and retries properly, rather than resting the whole thing on one shell command. You still have to watch it.",
    },
    { type: "h2", id: "lsn", text: "LSNs are how positions are named" },
    {
      type: "p",
      text: "Every record in the log carries a log sequence number, written as two hex parts such as `0/1A2B3C4D`. It is a byte offset into the stream. So you can compare them directly, and a larger one is later.",
    },
    {
      type: "p",
      text: "A base backup is a copy of the data directory, plus the LSN range it spans. Recovery starts at that position and replays forward through the archived segments. It stops where you told it to.",
    },
    {
      type: "p",
      text: "One rule constrains every recovery plan: the target must be after the base backup finished. You cannot recover to a moment while the backup was still running.",
    },
    { type: "h2", id: "recovery", text: "Running a recovery" },
    {
      type: "p",
      text: "The sequence is short. The detail that catches people is in the last step.",
    },
    {
      type: "ol",
      items: [
        "Stop the server and restore the base backup into the data directory.",
        "Set `restore_command` so the server can fetch archived segments, and set one recovery target.",
        "Create a `recovery.signal` file in the data directory.",
        "Start the server. It replays archived WAL until it reaches the target.",
      ],
    },
    {
      type: "p",
      text: "You have several ways to name the target: a timestamp, an LSN, a transaction ID, a named restore point, or `immediate` for as soon as the data is consistent. Timestamps and named restore points are the ones people can actually reason about. `recovery_target_inclusive` decides whether the server stops just after the target or just before it, and defaults to after.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Recovery pauses at the target rather than finishing",
      text: "`recovery_target_action` defaults to `pause`. The server reaches your target and stops there, still in recovery, so you can query the database and check you picked the right moment. Calling `pg_wal_replay_resume()` is what ends recovery and brings it up. Set the action to `promote` if you want it to come up unattended, or to `shutdown` to leave the instance parked at that exact point. Note that with `shutdown` the signal file is not removed, so the next start stops immediately unless you change the configuration.",
    },
    {
      type: "p",
      text: "One more thing to expect in the logs. The `restore_command` will be asked for files that do not exist in the archive, and it must return non-zero when that happens. That is how the server discovers it has reached the end of the stream, not an error. It will also ask for files ending in `.history`.",
    },
    { type: "h2", id: "restore-time", text: "Restore time is the number nobody measures" },
    {
      type: "p",
      text: "Everything above assumes you can get the base backup back. For a large database over a network, that copy is most of your recovery time, and it is the part least likely to have been tested.",
    },
    {
      type: "p",
      text: "Delta restore is the practical answer. It does not wipe the directory and pull everything down. Instead the tool compares what is on disk against the backup manifest. It fetches only the pages that differ, then replays WAL on top. On a host that already holds a recent copy, the saving is large.",
    },
    {
      type: "p",
      text: "It does nothing for a genuinely empty target, which is the case a disaster usually presents. Measure both, and write down which one your recovery objective assumes.",
    },
    { type: "h2", id: "scope", text: "What PITR will not do for you" },
    {
      type: "p",
      text: "Recovery operates on the whole cluster. There is no way to replay one table.",
    },
    {
      type: "p",
      text: "So getting back a table someone dropped takes several steps. Stand up a separate server. Recover it to the moment before the drop. Pull the table out. Load it back into production. That is a real procedure, and an incident is the wrong time to run it for the first time.",
    },
    {
      type: "p",
      text: "Which is the general point. An archive that has never been restored is a claim, not a backup, and the failure mode above is invisible from the primary. Restore on a schedule, to a real host, and check the row counts — the wider case for that is in [testing your restores](/cybersecurity-ciso/backup-restore-testing).",
    },
  ],
  faq: [
    {
      question: "What happens if archive_command keeps failing?",
      answer:
        "The server keeps every segment rather than reusing it. `pg_wal` grows. When the disk fills, PostgreSQL does a PANIC shutdown. No commits are lost.",
    },
    {
      question: "How do I monitor WAL archiving?",
      answer:
        "Watch `pg_stat_archiver`. Alert on any rise in `failed_count`, and on the gap between the current write position and `last_archived_wal`.",
    },
    {
      question: "Why has recovery stopped without coming up?",
      answer:
        "That is the default. `recovery_target_action` is `pause`, so you can check the target was right. Call `pg_wal_replay_resume()` to end recovery.",
    },
    {
      question: "Can I recover just one dropped table?",
      answer:
        "Not on its own. PITR replays the whole cluster. Recover to a second server, stop before the drop, pull the table out and load it back.",
    },
    {
      question: "Why is restore_command reporting missing files?",
      answer:
        "That is expected. The server asks for files past the end of the archive, and the command must return non-zero. It also asks for `.history` files.",
    },
    {
      question: "Does archiving slow down writes?",
      answer:
        "Barely. The log write already happens for crash safety, and archiving runs in the background. The risk is the disk filling when archiving breaks.",
    },
  ],
  sources: [
    {
      title: "Continuous archiving and point-in-time recovery",
      publisher: "PostgreSQL Global Development Group",
      url: "https://www.postgresql.org/docs/current/continuous-archiving.html",
    },
    {
      title: "Recovery target settings",
      publisher: "PostgreSQL Global Development Group",
      url: "https://www.postgresql.org/docs/current/runtime-config-wal.html",
    },
    {
      title: "The statistics collector: pg_stat_archiver",
      publisher: "PostgreSQL Global Development Group",
      url: "https://www.postgresql.org/docs/current/monitoring-stats.html",
    },
    {
      title: "pgBackRest user guide",
      publisher: "pgBackRest",
      url: "https://pgbackrest.org/user-guide.html",
    },
  ],
};
