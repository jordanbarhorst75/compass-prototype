import type { ColumnStateRecord } from "./types";
import { BUCKET_ORDER } from "./types";

export const DEMONSTRATION_LEVELS = [
  "Uncharted",
  "Aware",
  "Developing",
  "Practicing",
  "Consistent",
  "Mastery",
] as const;

export type DemonstrationLevel = (typeof DEMONSTRATION_LEVELS)[number];

const MS_PER_DAY = 86_400_000;

/** Longest gap (days) between consecutive ISO timestamps (sorted). */
export function maxGapDaysBetweenConsecutive(sortedIso: string[]): number {
  if (sortedIso.length < 2) return 0;
  const sorted = [...sortedIso].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  let maxGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]!).getTime();
    const cur = new Date(sorted[i]!).getTime();
    maxGap = Math.max(maxGap, (cur - prev) / MS_PER_DAY);
  }
  return maxGap;
}

export function meetsMasteryGapRule(dates: string[]): boolean {
  if (dates.length < 2) return true;
  return maxGapDaysBetweenConsecutive(dates) <= 30;
}

export function deriveDemonstrationLevel(count: number, demonstrationDates: string[]): DemonstrationLevel {
  if (count <= 0) return "Uncharted";
  if (count < 3) return "Aware";
  if (count < 9) return "Developing";
  if (count < 27) return "Practicing";
  if (count < 60) return "Consistent";
  if (count >= 60 && meetsMasteryGapRule(demonstrationDates)) return "Mastery";
  return "Consistent";
}

/** 0 = Uncharted … 5 = Mastery — used for achievement thresholds ("Level 3+" = Practicing+). */
export function demonstrationTierIndex(level: DemonstrationLevel): number {
  return DEMONSTRATION_LEVELS.indexOf(level);
}

/** Next rung count to reach the *following* named band (for labels like "9 / 27"). */
export function nextDemonstrationThreshold(_count: number, level: DemonstrationLevel): number | null {
  if (level === "Uncharted") return 1;
  if (level === "Aware") return 3;
  if (level === "Developing") return 9;
  if (level === "Practicing") return 27;
  if (level === "Consistent") return 60;
  return null;
}

/**
 * Raw fill (0–1) toward the *next* level band within the current band's span.
 * Uncharted → 0; Mastery → 1.
 */
export function intralevelProgressRaw(count: number, level: DemonstrationLevel): number {
  if (level === "Uncharted") return 0;
  if (level === "Mastery") return 1;
  if (level === "Aware") return (count - 1) / (3 - 1);
  if (level === "Developing") return (count - 3) / (9 - 3);
  if (level === "Practicing") return (count - 9) / (27 - 9);
  if (level === "Consistent") return (count - 27) / (60 - 27);
  return 0;
}

const MIN_VISIBLE_FILL = 0.06;

/** Bar fill for UI: Uncharted empty; non‑Uncharted never reads as empty (except Mastery uses full gold elsewhere). */
export function demonstrationBarFill(count: number, level: DemonstrationLevel): number {
  if (level === "Uncharted") return 0;
  if (level === "Mastery") return 1;
  return Math.min(1, Math.max(MIN_VISIBLE_FILL, intralevelProgressRaw(count, level)));
}

export function anyCoachTaskOnBoard(columns: ColumnStateRecord): boolean {
  for (const b of BUCKET_ORDER) {
    const col = columns[b];
    for (const t of [...col.active, ...col.queue]) {
      if (t.source === "coach") return true;
    }
  }
  return false;
}

export function anyAdminTaskOnBoard(columns: ColumnStateRecord): boolean {
  for (const b of BUCKET_ORDER) {
    const col = columns[b];
    for (const t of [...col.active, ...col.queue]) {
      if (t.source === "admin") return true;
    }
  }
  return false;
}

/** Synthetic evenly spaced dates, gaps < maxGapDays, ending near `endMs`. */
export function syntheticDemonstrationDates(count: number, endMs: number, maxGapDays = 20): string[] {
  if (count <= 0) return [];
  const out: string[] = [];
  const step = Math.min(maxGapDays, 28) * MS_PER_DAY;
  const base = endMs - (count - 1) * step;
  for (let i = 0; i < count; i++) {
    out.push(new Date(base + i * step).toISOString());
  }
  return out;
}
