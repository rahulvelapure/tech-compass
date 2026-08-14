import type { Segment, Topic } from "./types";

import { segment as microsoftIntune } from "./segments/microsoft-intune";
import { segment as microsoft365EntraId } from "./segments/microsoft-365-entra-id";
import { segment as software } from "./segments/software";
import { segment as cybersecurityCiso } from "./segments/cybersecurity-ciso";
import { segment as cloud } from "./segments/cloud";
import { segment as ai } from "./segments/ai";
import { segment as windows } from "./segments/windows";

/**
 * The editorial backlog, one entry per planned segment.
 *
 * Segments are listed here explicitly rather than auto-discovered: the list is
 * short, changes rarely, and an explicit array makes it obvious which segments
 * have a backlog and which are still unplanned.
 */
export const segments: Segment[] = [
  microsoftIntune,
  microsoft365EntraId,
  cybersecurityCiso,
  cloud,
  ai,
  windows,
  software,
];

export const allTopics = (): Topic[] => segments.flatMap((s) => s.topics);

export type {
  ContentType,
  Priority,
  SearchIntent,
  Segment,
  Topic,
  TopicStatus,
  UpdateClass,
} from "./types";
export { TOPIC_STATUSES, statusOrder } from "./types";
