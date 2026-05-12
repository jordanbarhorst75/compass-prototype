import type {
  ColumnState,
  Educator,
  EngagementBadge,
  LearningBucket,
  Task,
  TaskCta,
  TaskSource,
  TimelineEvent,
  XPEvent,
} from "../domain/types";
import { COLUMN_CAPS, sortTasksBySourcePriority } from "../domain/types";
import { stockPlaceholderUrl } from "../lib/placeholderStock";
import { journeyAfterFormalActivities, journeyBetweenFormalActivities } from "./journeyDemoActivities";

export { SEED_CATEGORIES, seedCompetencies, seedMayaCompetencies, MAYA_DEMONSTRATION_COUNTS } from "./competencies";

const MAYA_EARNED_AT = 1_700_000_000_000;

/** Logically consistent with Maya seed counts, uploads, streak, and LR views. */
export const MAYA_EARNED_ACHIEVEMENT_IDS: string[] = [
  "inclusive_community_aware",
  "inclusive_community_developing",
  "inclusive_community_practicing",
  "responsive_support_aware",
  "responsive_support_developing",
  "responsive_support_practicing",
  "responsive_support_consistent",
  "child_centered_aware",
  "child_centered_developing",
  "behavior_support_aware",
  "intentional_experiences_aware",
  "intentional_experiences_developing",
  "intentional_experiences_practicing",
  "active_engagement_aware",
  "active_engagement_developing",
  "spark_curiosity_aware",
  "spark_curiosity_developing",
  "spark_curiosity_practicing",
  "rich_communication_aware",
  "whole_child_support_aware",
  "whole_child_support_developing",
  "connected",
  "engaged",
  "whole",
  "full_spectrum",
  "deep_roots",
  "first_take",
  "bronze_lens",
  "silver_lens",
  "curious",
  "showing_up",
  "coached",
  "assigned",
];


export function mayaEducator(): Educator {
  return {
    id: "ed-maya",
    name: "Maya Chen",
    avatarUrl: null,
    level: 4,
    currentXP: 187,
    streakDays: 12,
    totalUploads: 17,
    lrVideosWatched: 11,
    earnedAchievements: MAYA_EARNED_ACHIEVEMENT_IDS.map((id) => ({ id, earnedAt: MAYA_EARNED_AT })),
    recentUploadFocusTags: ["focus-a", "focus-b", "focus-c"],
    distinctUploadFocusTags: ["focus-a", "focus-b", "focus-c", "focus-d"],
    usedStreakProtection: false,
    comebackAfterGapCompleted: false,
  };
}

let taskSeq = 0;
function mkTask(
  bucket: LearningBucket,
  source: TaskSource,
  competencyId: string,
  title: string,
  cta: TaskCta,
): Task {
  taskSeq += 1;
  const salt = taskSeq * 17 + competencyId.length * 31 + (bucket.charCodeAt(0) ?? 0);
  return {
    id: `task-${taskSeq}`,
    title,
    bucket,
    source,
    competencyId,
    xpOnComplete: 15,
    ctaLabel: cta,
    heroImageUrl: stockPlaceholderUrl(salt),
    status: "active",
  };
}

/** Pool of tasks — PRD source priority applied when filling columns */
export function seedTaskPool(): Task[] {
  taskSeq = 0;
  return [
    mkTask("know", "admin", "inclusive_community", "Read: Your latest Instant Insights highlights", "Read"),
    mkTask("know", "coach", "responsive_support", "Reflect: Where you want to grow this month", "Reflect"),
    mkTask("know", "self", "spark_curiosity", "Watch: Back-and-forth exchanges in a Pre-K classroom", "Watch"),
    mkTask("know", "system", "rich_communication", "Read: What effective feedback feels like", "Read"),
    mkTask("know", "admin", "child_centered", "Reflect: A moment of effectiveness from last week", "Reflect"),
    mkTask("know", "system", "active_engagement", "Watch: Open-ended questions in circle time", "Watch"),
    mkTask("see", "coach", "responsive_support", "Watch: Teacher language that extends learning", "Watch"),
    mkTask("see", "admin", "intentional_experiences", "Watch: Routines that build belonging", "Watch"),
    mkTask("see", "self", "whole_child_support", "Read: Exemplar clip — peer conversations", "Read"),
    mkTask("see", "system", "personalized_scaffolding", "Watch: Scaffolding during centers", "Watch"),
    mkTask("try", "admin", "spark_curiosity", "Upload: Focus on open-ended questions", "Upload"),
    mkTask("try", "coach", "child_centered", "Upload: A small group moment you are proud of", "Upload"),
    mkTask("try", "self", "behavior_support", "Upload: Transitions that feel smooth", "Upload"),
    mkTask("try", "system", "inclusive_community", "Reflect: One tweak you tried after last feedback", "Reflect"),
    mkTask("apply", "coach", "intentional_experiences", "Reflect: What is sticking from your last practice", "Reflect"),
    mkTask("apply", "admin", "whole_child_support", "Read: Habits that reinforce positive climate", "Read"),
    mkTask("apply", "system", "active_engagement", "Reflect: Build on a strength you noticed today", "Reflect"),
    mkTask("know", "system", "rich_communication", "Read: Spiral learning — Know again, deeper", "Read"),
    mkTask("see", "self", "intentional_experiences", "Watch: Language loops in story time", "Watch"),
    mkTask("try", "admin", "spark_curiosity", "Upload: Capturing wait time", "Upload"),
    mkTask("apply", "coach", "personalized_scaffolding", "Reflect: Partnering with families", "Reflect"),
  ];
}

function normalizeTaskTitleKey(title: string): string {
  return title
    .trim()
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2212/g, "-")
    .replace(/\s+/g, " ");
}

/** Title → competency id for the canonical seed task pool (repairs persisted tasks missing `competencyId`). */
const SEED_TITLE_TO_COMPETENCY_ID = (() => {
  const m = new Map<string, string>();
  for (const t of seedTaskPool()) {
    m.set(t.title, t.competencyId);
    m.set(normalizeTaskTitleKey(t.title), t.competencyId);
  }
  return m;
})();

export function competencyIdForSeedTaskTitle(title: string): string | undefined {
  return SEED_TITLE_TO_COMPETENCY_ID.get(title) ?? SEED_TITLE_TO_COMPETENCY_ID.get(normalizeTaskTitleKey(title));
}

export function partitionColumns(pool: Task[]): Record<LearningBucket, ColumnState> {
  const byBucket: Record<LearningBucket, Task[]> = {
    know: [],
    see: [],
    try: [],
    apply: [],
  };
  for (const t of pool) {
    byBucket[t.bucket].push(t);
  }
  const out: Record<LearningBucket, ColumnState> = {
    know: { active: [], queue: [] },
    see: { active: [], queue: [] },
    try: { active: [], queue: [] },
    apply: { active: [], queue: [] },
  };
  (Object.keys(byBucket) as LearningBucket[]).forEach((b) => {
    const sorted = sortTasksBySourcePriority(byBucket[b]);
    const cap = COLUMN_CAPS[b];
    out[b] = {
      active: sorted.slice(0, cap),
      queue: sorted.slice(cap),
    };
  });
  return out;
}

export function seedEngagementBadges(): EngagementBadge[] {
  return [
    { id: "b-bronze", label: "Bronze", threshold: 5, earned: true },
    { id: "b-silver", label: "Silver", threshold: 15, earned: true },
    { id: "b-gold", label: "Gold", threshold: 50, earned: false },
  ];
}

export function seedXPHistory(educatorId: string): XPEvent[] {
  const now = Date.now();
  return [
    {
      id: "xp-seed-1",
      educatorId,
      taskId: "task-seed-1",
      competencyId: "responsive_support",
      xpAmount: 5,
      isNew: false,
      timestamp: now - 1000 * 60 * 60 * 24 * 9,
      activityLabel: "Watched: Teacher language that extends learning",
      taskSource: "coach",
    },
    {
      id: "xp-seed-2",
      educatorId,
      taskId: "task-seed-2",
      competencyId: "inclusive_community",
      xpAmount: 15,
      isNew: true,
      timestamp: now - 1000 * 60 * 60 * 24 * 8,
      activityLabel: "Read: Your latest Instant Insights highlights",
      taskSource: "admin",
    },
    {
      id: "xp-seed-3",
      educatorId,
      taskId: "task-seed-3",
      competencyId: "child_centered",
      xpAmount: 5,
      isNew: false,
      timestamp: now - 1000 * 60 * 60 * 24 * 6,
      activityLabel: "Reflect: Where you want to grow this month",
      taskSource: "coach",
    },
  ];
}

export function seedTimeline(): TimelineEvent[] {
  return [
    {
      id: "fo-1",
      type: "formalObs",
      date: "2026-02-01",
      activityName: "Formal Observation 1",
      hasScoreImprovement: false,
      classDimensionScores: {
        positive_climate: 4,
        teacher_sensitivity: 5,
        regard_child_perspectives: 3,
        behavior_management: 5,
        productivity: 4,
        instructional_learning_formats: 5,
        concept_development: 3,
        quality_feedback: 4,
        language_modeling: 4,
      },
    },
    ...journeyBetweenFormalActivities(),
    {
      id: "fo-2",
      type: "formalObs",
      date: "2026-05-01",
      activityName: "Formal Observation 2",
      hasScoreImprovement: true,
      classDimensionScores: {
        positive_climate: 6,
        teacher_sensitivity: 6,
        regard_child_perspectives: 5,
        behavior_management: 6,
        productivity: 5,
        instructional_learning_formats: 6,
        concept_development: 5,
        quality_feedback: 5,
        language_modeling: 6,
      },
    },
    ...journeyAfterFormalActivities(),
  ];
}
