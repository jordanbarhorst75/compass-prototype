export type LearningBucket = "know" | "see" | "try" | "apply";

export type TaskSource = "system" | "coach" | "admin" | "self";

export type TaskCta = "Watch" | "Upload" | "Read" | "Reflect";

export type TaskStatus = "active" | "completed" | "skipped";

export interface EarnedAchievementRecord {
  id: string;
  earnedAt: number;
}

export interface Educator {
  id: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  currentXP: number;
  streakDays: number;
  /** Total Instant Insights / reflection video uploads (PRD engagement). */
  totalUploads: number;
  /** Learning Resources videos watched (prototype counter). */
  lrVideosWatched: number;
  earnedAchievements: EarnedAchievementRecord[];
  /** Most recent upload “area of focus” tags (newest last). */
  recentUploadFocusTags: string[];
  distinctUploadFocusTags: string[];
  usedStreakProtection: boolean;
  comebackAfterGapCompleted: boolean;
}

export interface CompetencyCategory {
  id: string;
  label: string;
}

export interface Competency {
  id: string;
  name: string;
  categoryId: string;
  /** Stable token for palette / tour wiring */
  color: string;
  description: string;
  demonstrationCount: number;
  /** ISO timestamps, sorted ascending; used for Mastery gap rule. */
  demonstrationDates: string[];
}

export interface Task {
  id: string;
  title: string;
  bucket: LearningBucket;
  source: TaskSource;
  competencyId: string;
  /** XP awarded on complete — set when resolving card for display / completion */
  xpOnComplete: number;
  ctaLabel: TaskCta;
  heroImageUrl: string;
  status: TaskStatus;
}

export interface XPEvent {
  id: string;
  educatorId: string;
  taskId: string;
  competencyId: string;
  xpAmount: number;
  isNew: boolean;
  timestamp: number;
  activityLabel: string;
  taskSource?: TaskSource;
}

export type EngagementBadgeTier = "Bronze" | "Silver" | "Gold";

export interface EngagementBadge {
  id: string;
  label: EngagementBadgeTier;
  threshold: 5 | 15 | 50;
  earned: boolean;
}

export type TimelineEventType = "activity" | "formalObs";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  activityName?: string;
  competencyId?: string;
  xpGained?: number;
  source?: TaskSource;
  hasScoreImprovement?: boolean;
  /**
   * Formal observations only — CLASS **dimension** scores (typical 1–7 scale) for Journey anchors.
   * Keys match `ClassDimensionId` in `src/data/classDimensions.ts` (e.g. positive_climate, regard_child_perspectives).
   */
  classDimensionScores?: Partial<Record<string, number>>;
}

export interface ColumnState {
  active: Task[];
  queue: Task[];
}

export type ColumnStateRecord = Record<LearningBucket, ColumnState>;

export const BUCKET_ORDER: LearningBucket[] = ["know", "see", "try", "apply"];

export const COLUMN_CAPS: Record<LearningBucket, number> = {
  know: 3,
  see: 2,
  try: 2,
  apply: 1,
};

export const SOURCE_PRIORITY: Record<TaskSource, number> = {
  admin: 0,
  coach: 1,
  self: 2,
  system: 3,
};

export function sortTasksBySourcePriority<T extends { source: TaskSource }>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source]);
}
