import type { Segment, Topic } from "./types";

import { segment as microsoftIntune } from "./segments/microsoft-intune";
import { segment as microsoft365EntraId } from "./segments/microsoft-365-entra-id";
import { segment as software } from "./segments/software";
import { segment as cybersecurityCiso } from "./segments/cybersecurity-ciso";
import { segment as cloud } from "./segments/cloud";
import { segment as ai } from "./segments/ai";
import { segment as windows } from "./segments/windows";
import { segment as networking } from "./segments/networking";
import { segment as enterpriseNetworking } from "./segments/enterprise-networking";
import { segment as aiEnterpriseIt } from "./segments/ai-enterprise-it";
import { segment as itAutomation } from "./segments/it-automation";
import { segment as development } from "./segments/development";
import { segment as devops } from "./segments/devops";

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
  aiEnterpriseIt,
  windows,
  networking,
  enterpriseNetworking,
  itAutomation,
  development,
  devops,
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
