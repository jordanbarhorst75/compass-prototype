import type { Competency, Educator, TaskSource, XPEvent } from "../domain/types";
import type { ColumnStateRecord } from "../domain/types";
import {
  anyCoachTaskOnBoard,
  deriveDemonstrationLevel,
  demonstrationTierIndex,
  type DemonstrationLevel,
} from "../domain/competencyProgress";

export type AchievementTier = 1 | 2 | 3;

export type AchievementIconKey =
  | "crown"
  | "star"
  | "trophy"
  | "medal"
  | "spark"
  | "video"
  | "library"
  | "flame"
  | "shield"
  | "rotate"
  | "userCheck"
  | "clipboard"
  | "compass";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  icon: AchievementIconKey;
  isSecret: boolean;
}

export const COMPETENCY_ORDER = [
  "inclusive_community",
  "responsive_support",
  "child_centered",
  "behavior_support",
  "intentional_experiences",
  "active_engagement",
  "spark_curiosity",
  "personalized_scaffolding",
  "rich_communication",
  "whole_child_support",
] as const;

export type CompetencySlug = (typeof COMPETENCY_ORDER)[number];

const TIER1_LEVELS = ["aware", "developing", "practicing", "consistent", "mastery"] as const;

function compBySlug(comps: Competency[], slug: string): Competency | undefined {
  return comps.find((c) => c.id === slug);
}

function levelOf(c: Competency | undefined): DemonstrationLevel {
  if (!c) return "Uncharted";
  return deriveDemonstrationLevel(c.demonstrationCount, c.demonstrationDates);
}

function tierIdx(c: Competency | undefined): number {
  return demonstrationTierIndex(levelOf(c));
}

function hasEarnedId(ed: Educator, id: string): boolean {
  return ed.earnedAchievements.some((e) => e.id === id);
}

export interface AchievementEvalContext {
  educator: Educator;
  competencies: Competency[];
  columns: ColumnStateRecord;
  xpHistory: XPEvent[];
}

function countCompletionsWithSource(history: XPEvent[], source: TaskSource): number {
  return history.filter((e) => e.taskSource === source).length;
}

function categoryHasAwarePlus(
  comps: Competency[],
  slugs: readonly CompetencySlug[],
): boolean {
  return slugs.every((s) => tierIdx(compBySlug(comps, s)) >= 1);
}

function categoryAllPracticingPlus(comps: Competency[], slugs: readonly CompetencySlug[]): boolean {
  return slugs.every((s) => tierIdx(compBySlug(comps, s)) >= 3);
}

function categoryAllMastery(comps: Competency[], slugs: readonly CompetencySlug[]): boolean {
  return slugs.every((s) => levelOf(compBySlug(comps, s)) === "Mastery");
}

const CONNECT: CompetencySlug[] = ["inclusive_community", "responsive_support", "child_centered"];
const ENGAGE: CompetencySlug[] = ["behavior_support", "intentional_experiences", "active_engagement"];
const INSPIRE: CompetencySlug[] = ["spark_curiosity", "personalized_scaffolding", "rich_communication"];
const WHOLE: CompetencySlug[] = ["whole_child_support"];

function fullSpectrumMet(comps: Competency[]): boolean {
  return (
    CONNECT.some((s) => tierIdx(compBySlug(comps, s)) >= 1) &&
    ENGAGE.some((s) => tierIdx(compBySlug(comps, s)) >= 1) &&
    INSPIRE.some((s) => tierIdx(compBySlug(comps, s)) >= 1) &&
    WHOLE.some((s) => tierIdx(compBySlug(comps, s)) >= 1)
  );
}

function countPracticingPlus(comps: Competency[]): number {
  return COMPETENCY_ORDER.filter((s) => tierIdx(compBySlug(comps, s)) >= 3).length;
}

function countMastery(comps: Competency[]): number {
  return COMPETENCY_ORDER.filter((s) => levelOf(compBySlug(comps, s)) === "Mastery").length;
}

function buildTier1Defs(): AchievementDef[] {
  const names: Record<CompetencySlug, string> = {
    inclusive_community: "Inclusive Community",
    responsive_support: "Responsive Support",
    child_centered: "Child-Centered",
    behavior_support: "Behavior Support",
    intentional_experiences: "Intentional Experiences",
    active_engagement: "Active Engagement",
    spark_curiosity: "Spark Curiosity",
    personalized_scaffolding: "Personalized Scaffolding",
    rich_communication: "Rich Communication",
    whole_child_support: "Whole-Child Support",
  };
  const levelLabel: Record<(typeof TIER1_LEVELS)[number], string> = {
    aware: "Aware",
    developing: "Developing",
    practicing: "Practicing",
    consistent: "Consistent",
    mastery: "Mastery",
  };
  const out: AchievementDef[] = [];
  for (const slug of COMPETENCY_ORDER) {
    for (const lv of TIER1_LEVELS) {
      const id = `${slug}_${lv}`;
      out.push({
        id,
        name: `${names[slug]}: ${levelLabel[lv]}`,
        description: `Reach ${levelLabel[lv]} in ${names[slug]}.`,
        tier: 1,
        icon: lv === "mastery" ? "crown" : "star",
        isSecret: false,
      });
    }
  }
  return out;
}

const TIER2_STATIC: AchievementDef[] = [
  {
    id: "connected",
    name: "Connected",
    description: "Reached Aware in all 3 CONNECT competencies.",
    tier: 2,
    icon: "trophy",
    isSecret: false,
  },
  {
    id: "engaged",
    name: "Engaged",
    description: "Reached Aware in all 3 ENGAGE competencies.",
    tier: 2,
    icon: "trophy",
    isSecret: false,
  },
  {
    id: "inspired",
    name: "Inspired",
    description: "Reached Aware in all 3 INSPIRE LEARNING competencies.",
    tier: 2,
    icon: "trophy",
    isSecret: false,
  },
  {
    id: "whole",
    name: "Whole",
    description: "Reached Aware in Whole-Child Support.",
    tier: 2,
    icon: "trophy",
    isSecret: false,
  },
  {
    id: "full_spectrum",
    name: "Full Spectrum",
    description: "Demonstrated competencies across all 4 categories.",
    tier: 2,
    icon: "compass",
    isSecret: false,
  },
  {
    id: "deep_roots",
    name: "Deep Roots",
    description: "Reached Practicing in any 3 competencies.",
    tier: 2,
    icon: "medal",
    isSecret: false,
  },
  {
    id: "flourishing_connect",
    name: "Flourishing (Connect)",
    description: "Reached Practicing in all CONNECT competencies.",
    tier: 2,
    icon: "trophy",
    isSecret: false,
  },
  {
    id: "flourishing_engage",
    name: "Flourishing (Engage)",
    description: "Reached Practicing in all ENGAGE competencies.",
    tier: 2,
    icon: "trophy",
    isSecret: false,
  },
  {
    id: "flourishing_inspire",
    name: "Flourishing (Inspire)",
    description: "Reached Practicing in all INSPIRE LEARNING competencies.",
    tier: 2,
    icon: "trophy",
    isSecret: false,
  },
  {
    id: "all_in",
    name: "All In",
    description: "Reached Practicing in 7 of 10 competencies.",
    tier: 2,
    icon: "medal",
    isSecret: false,
  },
  {
    id: "category_master_connect",
    name: "Master: Connect",
    description: "Reached Mastery in all CONNECT competencies.",
    tier: 2,
    icon: "crown",
    isSecret: false,
  },
  {
    id: "category_master_engage",
    name: "Master: Engage",
    description: "Reached Mastery in all ENGAGE competencies.",
    tier: 2,
    icon: "crown",
    isSecret: false,
  },
  {
    id: "category_master_inspire",
    name: "Master: Inspire",
    description: "Reached Mastery in all INSPIRE LEARNING competencies.",
    tier: 2,
    icon: "crown",
    isSecret: false,
  },
  {
    id: "compass_complete",
    name: "Compass Complete",
    description: "Reached Mastery in all 10 competencies.",
    tier: 2,
    icon: "compass",
    isSecret: false,
  },
];

const TIER3_STATIC: AchievementDef[] = [
  { id: "first_take", name: "First Take", description: "Submitted your first Instant Insights video.", tier: 3, icon: "video", isSecret: false },
  { id: "bronze_lens", name: "Bronze Lens", description: "5 total video uploads.", tier: 3, icon: "video", isSecret: false },
  { id: "silver_lens", name: "Silver Lens", description: "15 total video uploads.", tier: 3, icon: "video", isSecret: false },
  { id: "gold_lens", name: "Gold Lens", description: "50 total video uploads.", tier: 3, icon: "video", isSecret: false },
  { id: "curious", name: "Curious", description: "Watched 5 Learning Resources videos.", tier: 3, icon: "library", isSecret: false },
  { id: "learner", name: "Learner", description: "Watched 15 Learning Resources videos.", tier: 3, icon: "library", isSecret: false },
  { id: "scholar", name: "Scholar", description: "Watched 30 Learning Resources videos.", tier: 3, icon: "library", isSecret: false },
  { id: "focused", name: "Focused", description: "Set the same Area of Focus 3 uploads in a row.", tier: 3, icon: "spark", isSecret: false },
  { id: "explorer", name: "Explorer", description: "Set 5 different Areas of Focus.", tier: 3, icon: "compass", isSecret: false },
  { id: "showing_up", name: "Showing Up", description: "Active 7 days in a row.", tier: 3, icon: "flame", isSecret: false },
  { id: "committed", name: "Committed", description: "Active 30 days in a row.", tier: 3, icon: "flame", isSecret: false },
  { id: "streak_saved", name: "Life Happens", description: "Streak protected during a week with no uploads.", tier: 3, icon: "shield", isSecret: true },
  { id: "comeback", name: "Comeback", description: "Returned after 14+ days away and completed an activity.", tier: 3, icon: "rotate", isSecret: true },
  { id: "coached", name: "Coached", description: "Had a coach-assigned task on your board.", tier: 3, icon: "userCheck", isSecret: false },
  { id: "assigned", name: "Assigned", description: "Completed a coach-assigned task.", tier: 3, icon: "userCheck", isSecret: false },
  { id: "program_strong", name: "Program Strong", description: "Completed an admin-prescribed task.", tier: 3, icon: "clipboard", isSecret: false },
];

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [...buildTier1Defs(), ...TIER2_STATIC, ...TIER3_STATIC];

const catalogById = new Map(ACHIEVEMENT_CATALOG.map((a) => [a.id, a]));

export function getAchievementDef(id: string): AchievementDef | undefined {
  return catalogById.get(id);
}

function threeSameFocusTail(tags: string[]): boolean {
  const t = tags.slice(-3);
  return t.length === 3 && t[0] === t[1] && t[1] === t[2];
}

export function evaluateAchievementTrigger(id: string, ctx: AchievementEvalContext): boolean {
  const { educator: ed, competencies: comps, columns, xpHistory } = ctx;
  const uploads = ed.totalUploads;
  const lr = ed.lrVideosWatched;

  if (id === "connected") return categoryHasAwarePlus(comps, CONNECT);
  if (id === "engaged") return categoryHasAwarePlus(comps, ENGAGE);
  if (id === "inspired") return categoryHasAwarePlus(comps, INSPIRE);
  if (id === "whole") return tierIdx(compBySlug(comps, "whole_child_support")) >= 1;
  if (id === "full_spectrum") return fullSpectrumMet(comps);
  if (id === "deep_roots") return countPracticingPlus(comps) >= 3;
  if (id === "flourishing_connect") return categoryAllPracticingPlus(comps, CONNECT);
  if (id === "flourishing_engage") return categoryAllPracticingPlus(comps, ENGAGE);
  if (id === "flourishing_inspire") return categoryAllPracticingPlus(comps, INSPIRE);
  if (id === "all_in") return countPracticingPlus(comps) >= 7;
  if (id === "category_master_connect") return categoryAllMastery(comps, CONNECT);
  if (id === "category_master_engage") return categoryAllMastery(comps, ENGAGE);
  if (id === "category_master_inspire") return categoryAllMastery(comps, INSPIRE);
  if (id === "compass_complete") return countMastery(comps) >= 10;

  if (id === "first_take") return uploads >= 1;
  if (id === "bronze_lens") return uploads >= 5;
  if (id === "silver_lens") return uploads >= 15 && (hasEarnedId(ed, "bronze_lens") || uploads >= 5);
  if (id === "gold_lens") return uploads >= 50 && (hasEarnedId(ed, "silver_lens") || uploads >= 15);
  if (id === "curious") return lr >= 5;
  if (id === "learner") return lr >= 15;
  if (id === "scholar") return lr >= 30 && (hasEarnedId(ed, "learner") || lr >= 15);
  if (id === "focused") return threeSameFocusTail(ed.recentUploadFocusTags);
  if (id === "explorer") return ed.distinctUploadFocusTags.length >= 5;
  if (id === "showing_up") return ed.streakDays >= 7;
  if (id === "committed") return ed.streakDays >= 30 && (hasEarnedId(ed, "showing_up") || ed.streakDays >= 7);
  if (id === "streak_saved") return ed.usedStreakProtection;
  if (id === "comeback") return ed.comebackAfterGapCompleted;
  if (id === "coached") return anyCoachTaskOnBoard(columns) || countCompletionsWithSource(xpHistory, "coach") > 0;
  if (id === "assigned") return countCompletionsWithSource(xpHistory, "coach") >= 1;
  if (id === "program_strong") return countCompletionsWithSource(xpHistory, "admin") >= 1;

  const m = id.match(/^(.+)_(aware|developing|practicing|consistent|mastery)$/);
  if (m) {
    const slug = m[1]!;
    const lv = m[2]! as (typeof TIER1_LEVELS)[number];
    const need: Record<string, DemonstrationLevel> = {
      aware: "Aware",
      developing: "Developing",
      practicing: "Practicing",
      consistent: "Consistent",
      mastery: "Mastery",
    };
    const c = compBySlug(comps, slug);
    const have = levelOf(c);
    return demonstrationTierIndex(have) >= demonstrationTierIndex(need[lv]!);
  }

  return false;
}

/** Achievements that should appear in profile when unearned (secrets hidden until earned). */
export function isProfileVisibleWhenUnearned(id: string, earnedIds: Set<string>): boolean {
  const def = getAchievementDef(id);
  if (!def) return false;
  if (def.isSecret && !earnedIds.has(id)) return false;
  return true;
}

export function syncEarnedAchievementsWithTriggers(ctx: AchievementEvalContext): { id: string; earnedAt: number }[] {
  const next: { id: string; earnedAt: number }[] = [];
  const prevById = new Map(
    ctx.educator.earnedAchievements.map((e: { id: string; earnedAt: number }) => [e.id, e.earnedAt]),
  );
  for (const def of ACHIEVEMENT_CATALOG) {
    const ok = evaluateAchievementTrigger(def.id, ctx);
    if (!ok) continue;
    const at = prevById.get(def.id) ?? Date.now();
    next.push({ id: def.id, earnedAt: at });
  }
  next.sort((a, b) => a.id.localeCompare(b.id));
  return next;
}

/** All achievement IDs that should now be earned but were not in `prevEarned`. */
export function scanNewlyEarnedAchievementIds(prevEarned: Set<string>, ctx: AchievementEvalContext): string[] {
  const out: string[] = [];
  for (const def of ACHIEVEMENT_CATALOG) {
    if (prevEarned.has(def.id)) continue;
    if (evaluateAchievementTrigger(def.id, ctx)) out.push(def.id);
  }
  return out;
}

export function mergeEarned(
  prev: { id: string; earnedAt: number }[],
  additions: { id: string; earnedAt: number }[],
): { id: string; earnedAt: number }[] {
  const byId = new Map(prev.map((e) => [e.id, e.earnedAt]));
  for (const a of additions) {
    if (!byId.has(a.id)) byId.set(a.id, a.earnedAt);
  }
  return [...byId.entries()].map(([id, earnedAt]) => ({ id, earnedAt })).sort((x, y) => x.id.localeCompare(y.id));
}
