import type { TimelineEvent } from "../domain/types";
import { seedTimeline } from "./seed";

export interface JourneyWindowDef {
  id: string;
  label: string;
  /** Inclusive ISO date (yyyy-mm-dd) */
  startDate: string;
  /** Inclusive ISO date */
  endDate: string;
  /** Formal observation events whose CLASS scores anchor this window (0–2 entries). */
  anchorFormalIds: string[];
}

function addDaysIso(isoDate: string, deltaDays: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function compareIso(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Program narrative start (inclusive) — before first formal observation window. */
export const JOURNEY_PROGRAM_START = "2026-01-01";

/**
 * Build selectable windows from formal observations on the timeline:
 * between each consecutive pair, then after the last formal observation.
 */
export function buildJourneyWindowsFromTimeline(events: TimelineEvent[] = seedTimeline()): JourneyWindowDef[] {
  const formal = events
    .filter((e): e is TimelineEvent & { type: "formalObs" } => e.type === "formalObs")
    .sort((a, b) => compareIso(a.date, b.date));

  if (formal.length === 0) {
    return [
      {
        id: "all",
        label: "Current period",
        startDate: JOURNEY_PROGRAM_START,
        endDate: "2099-12-31",
        anchorFormalIds: [],
      },
    ];
  }

  const windows: JourneyWindowDef[] = [];

  for (let i = 0; i < formal.length - 1; i++) {
    const left = formal[i]!;
    const right = formal[i + 1]!;
    windows.push({
      id: `between-${left.id}-${right.id}`,
      label: `Between ${left.activityName ?? "Observation"} & ${right.activityName ?? "Observation"}`,
      startDate: addDaysIso(left.date, 1),
      endDate: addDaysIso(right.date, -1),
      anchorFormalIds: [left.id, right.id],
    });
  }

  const last = formal[formal.length - 1]!;
  windows.push({
    id: `post-${last.id}`,
    label: `After ${last.activityName ?? "Formal observation"}`,
    startDate: addDaysIso(last.date, 1),
    endDate: "2099-12-31",
    anchorFormalIds: [last.id],
  });

  return windows;
}

export function isDateInInclusiveWindow(isoDate: string, start: string, end: string): boolean {
  return compareIso(isoDate, start) >= 0 && compareIso(isoDate, end) <= 0;
}

/**
 * Places formal observation score cards as left/right bookends around the growth chart.
 * "Between" windows use chronological FO order (earlier left, later right). "After" uses a single left bookend.
 */
export function formalBookendLayout(w: JourneyWindowDef): { leftFormalId: string | null; rightFormalId: string | null } {
  const ids = w.anchorFormalIds;
  if (ids.length === 2) {
    return { leftFormalId: ids[0]!, rightFormalId: ids[1]! };
  }
  if (ids.length === 1) {
    const id = ids[0]!;
    if (w.id.startsWith("post-")) return { leftFormalId: id, rightFormalId: null };
    return { leftFormalId: id, rightFormalId: null };
  }
  return { leftFormalId: null, rightFormalId: null };
}
