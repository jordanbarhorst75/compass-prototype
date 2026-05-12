import type { Competency, EngagementBadge, Task, TaskCta } from "./types";

export const NEW_COMPETENCY_XP = 15;
export const RECURRING_XP = 5;
export const MILESTONE_XP = 10;

export function baseXpForCompetency(comp: Competency): number {
  if (comp.demonstrationCount === 0) return NEW_COMPETENCY_XP;
  return RECURRING_XP;
}

export function completionBreakdown(args: {
  competency: Competency;
  task: Task;
  uploadsCompletedBefore: number;
  badges: EngagementBadge[];
}): {
  baseXp: number;
  milestoneXp: number;
  newlyEarnedBadges: EngagementBadge[];
  competencyFirstEarn: boolean;
} {
  const competencyFirstEarn = args.competency.demonstrationCount === 0;
  const baseXp = baseXpForCompetency(args.competency);

  let milestoneXp = 0;
  const newlyEarnedBadges: EngagementBadge[] = [];

  if (args.task.ctaLabel === "Upload") {
    const n = args.uploadsCompletedBefore + 1;
    const tiers: (5 | 15 | 50)[] = [5, 15, 50];
    for (const t of tiers) {
      if (n === t) {
        milestoneXp += MILESTONE_XP;
        const b = args.badges.find((x) => x.threshold === t);
        if (b && !b.earned) newlyEarnedBadges.push(b);
      }
    }
  }

  return { baseXp, milestoneXp, newlyEarnedBadges, competencyFirstEarn };
}

export function isUploadTask(cta: TaskCta): boolean {
  return cta === "Upload";
}
