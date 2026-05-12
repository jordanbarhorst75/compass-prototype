import { xpProgressInLevel } from "../domain/xp";
import type { ColumnState, ColumnStateRecord, Competency, Educator, Task } from "../domain/types";
import { BUCKET_ORDER } from "../domain/types";
import type { PersistedAppState } from "../domain/persistence";
import { stockPlaceholderUrl } from "../lib/placeholderStock";
import { seedMayaCompetencies } from "./competencies";
import { seedEngagementBadges, competencyIdForSeedTaskTitle } from "./seed";
import { syncEarnedAchievementsWithTriggers, type AchievementEvalContext } from "./achievements";

function taskHeroSalt(task: Task): number {
  const n = Number(String(task.id).replace(/\D/g, "")) || 0;
  return n * 17 + (task.competencyId?.length ?? 0);
}

function fixTaskHero(t: Task): Task {
  const u = t.heroImageUrl;
  if (!u || !u.includes("/placeholders/")) return t;
  if (u.endsWith(".svg")) {
    return { ...t, heroImageUrl: stockPlaceholderUrl(taskHeroSalt(t)) };
  }
  return t;
}

function repairTask(t: Task): Task {
  const x = fixTaskHero(t);
  const cid = typeof x.competencyId === "string" ? x.competencyId.trim() : "";
  if (cid) return { ...x, competencyId: cid };
  const inferred = competencyIdForSeedTaskTitle(x.title);
  if (inferred) return { ...x, competencyId: inferred };
  return x;
}

function fixColumn(col: ColumnState): ColumnState {
  return {
    active: col.active.map(repairTask),
    queue: col.queue.map(repairTask),
  };
}

function isLegacyCompetency(c: unknown): c is { id: string; status?: string; demonstrationCount?: number } {
  return typeof c === "object" && c !== null && "id" in c && !("demonstrationCount" in c);
}

function migrateEducator(raw: unknown): Educator | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Partial<Educator> & { uploadsCompleted?: number };
  const currentXP = typeof e.currentXP === "number" ? e.currentXP : 0;
  const synced = { ...e, level: xpProgressInLevel(currentXP).level } as Educator;
  if (typeof synced.totalUploads !== "number") {
    synced.totalUploads = typeof e.uploadsCompleted === "number" ? e.uploadsCompleted : 0;
  }
  if (typeof synced.lrVideosWatched !== "number") synced.lrVideosWatched = 0;
  if (!Array.isArray(synced.earnedAchievements)) synced.earnedAchievements = [];
  if (!Array.isArray(synced.recentUploadFocusTags)) synced.recentUploadFocusTags = [];
  if (!Array.isArray(synced.distinctUploadFocusTags)) synced.distinctUploadFocusTags = [];
  if (typeof synced.usedStreakProtection !== "boolean") synced.usedStreakProtection = false;
  if (typeof synced.comebackAfterGapCompleted !== "boolean") synced.comebackAfterGapCompleted = false;
  return synced;
}

function syncEducator(ed: Educator): Educator {
  return { ...ed, level: xpProgressInLevel(ed.currentXP).level };
}

export function normalizePersistedState(parsed: unknown): PersistedAppState | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Partial<PersistedAppState> & { uploadsCompleted?: number };
  if (!p.educator || !p.columns || typeof p.educator !== "object") return null;

  const cols = p.columns as Partial<ColumnStateRecord>;
  const nextCols: ColumnStateRecord = {} as ColumnStateRecord;
  for (const b of BUCKET_ORDER) {
    const col = cols[b];
    if (!col || !Array.isArray(col.active) || !Array.isArray(col.queue)) return null;
    nextCols[b] = fixColumn(col);
  }

  const educator = migrateEducator(p.educator);
  if (!educator) return null;

  let competencies: Competency[];
  if (Array.isArray(p.competencies) && p.competencies.length > 0 && isLegacyCompetency(p.competencies[0])) {
    competencies = seedMayaCompetencies();
  } else if (
    Array.isArray(p.competencies) &&
    p.competencies.length > 0 &&
    p.competencies.every(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof (c as Competency).demonstrationCount === "number" &&
        Array.isArray((c as Competency).demonstrationDates),
    )
  ) {
    competencies = p.competencies as Competency[];
  } else {
    competencies = seedMayaCompetencies();
  }

  const xpHistory = Array.isArray(p.xpHistory) ? (p.xpHistory as PersistedAppState["xpHistory"]) : [];
  const achievementCtx: AchievementEvalContext = {
    educator: { ...educator, earnedAchievements: educator.earnedAchievements },
    competencies,
    columns: nextCols,
    xpHistory,
  };
  const prunedEarned = syncEarnedAchievementsWithTriggers(achievementCtx);

  return {
    educator: syncEducator({ ...educator, earnedAchievements: prunedEarned }),
    competencies,
    columns: nextCols,
    xpHistory,
    engagementBadges: Array.isArray(p.engagementBadges)
      ? (p.engagementBadges as PersistedAppState["engagementBadges"])
      : seedEngagementBadges(),
  };
}
