import type { Educator } from "./types";

/** PRD §6.4 — inclusive XP bands per level */
const LEVEL_RANGES: { level: number; min: number; max: number | null }[] = [
  { level: 1, min: 0, max: 30 },
  { level: 2, min: 31, max: 75 },
  { level: 3, min: 76, max: 150 },
  { level: 4, min: 151, max: 250 },
  { level: 5, min: 251, max: null },
];

export function computeLevel(totalXP: number): number {
  for (let i = LEVEL_RANGES.length - 1; i >= 0; i--) {
    const r = LEVEL_RANGES[i]!;
    if (totalXP >= r.min) return r.level;
  }
  return 1;
}

/** Progress within current level band for UI bar (0–1) */
export function xpProgressInLevel(totalXP: number): {
  level: number;
  xpForNextLevel: number | null;
  progress: number;
} {
  const level = computeLevel(totalXP);
  const range = LEVEL_RANGES.find((r) => r.level === level) ?? LEVEL_RANGES[0]!;
  if (range.max === null) {
    return { level, xpForNextLevel: null, progress: 1 };
  }
  const bandSize = range.max - range.min + 1;
  const posInBand = totalXP - range.min + 1;
  const progress = Math.min(1, Math.max(0, posInBand / bandSize));
  const xpForNextLevel = Math.max(0, range.max - totalXP + 1);
  return { level, xpForNextLevel, progress };
}

export function newEducatorXPAfterGain(
  ed: Educator,
  gain: number,
): { leveledUp: boolean; newLevel: number; newTotal: number } {
  const oldLevel = computeLevel(ed.currentXP);
  const newTotal = ed.currentXP + gain;
  const newLevel = computeLevel(newTotal);
  return { leveledUp: newLevel > oldLevel, newLevel, newTotal };
}
