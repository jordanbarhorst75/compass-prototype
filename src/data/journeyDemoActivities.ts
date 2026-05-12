import { CLASS_DIMENSION_IDS, type ClassDimensionId } from "./classDimensions";
import type { TaskSource, TimelineEvent } from "../domain/types";

const BETWEEN_START = "2026-02-02";
const BETWEEN_END = "2026-04-30";
const POST_START = "2026-05-03";
const POST_END = "2026-06-18";

const COMP_BY_DIM: Record<ClassDimensionId, string> = {
  positive_climate: "inclusive_community",
  teacher_sensitivity: "responsive_support",
  regard_child_perspectives: "child_centered",
  behavior_management: "behavior_support",
  productivity: "active_engagement",
  instructional_learning_formats: "intentional_experiences",
  concept_development: "spark_curiosity",
  quality_feedback: "personalized_scaffolding",
  language_modeling: "rich_communication",
};

const SOURCES: TaskSource[] = ["admin", "coach", "self", "system"];
const CTAS = ["Read", "Watch", "Upload", "Reflect", "Try"];

const STEM: Record<ClassDimensionId, string> = {
  positive_climate: "warmth and connection in routines",
  teacher_sensitivity: "reading and responding to cues",
  regard_child_perspectives: "child voice and choice",
  behavior_management: "proactive expectations and cues",
  productivity: "pacing and engagement",
  instructional_learning_formats: "formats that maximize learning",
  concept_development: "questions that stretch thinking",
  quality_feedback: "feedback that scaffolds growth",
  language_modeling: "rich talk and back-and-forth",
};

function isoLerp(startIso: string, endIso: string, t: number): string {
  const s = new Date(`${startIso}T12:00:00Z`).getTime();
  const e = new Date(`${endIso}T12:00:00Z`).getTime();
  const clamped = Math.min(1, Math.max(0, t));
  return new Date(s + clamped * (e - s)).toISOString().slice(0, 10);
}

function competencyFor(dim: ClassDimensionId, salt: number): string {
  if (dim === "regard_child_perspectives") {
    return salt % 2 === 0 ? "child_centered" : "whole_child_support";
  }
  return COMP_BY_DIM[dim];
}

/**
 * ~5 activities per CLASS dimension between FO1 and FO2 (demo density).
 */
export function journeyBetweenFormalActivities(): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  let idx = 0;
  const rounds = 5;
  const total = CLASS_DIMENSION_IDS.length * rounds;

  for (let round = 0; round < rounds; round++) {
    for (let d = 0; d < CLASS_DIMENSION_IDS.length; d++) {
      const dim = CLASS_DIMENSION_IDS[d]!;
      const frac = (idx + 0.5) / total;
      const date = isoLerp(BETWEEN_START, BETWEEN_END, frac);
      const cta = CTAS[idx % CTAS.length]!;
      const stem = STEM[dim];
      const xp = 5 + (idx % 3) * 5;
      out.push({
        id: `journey-b-${idx}`,
        type: "activity",
        date,
        activityName: `${cta}: ${stem}`,
        competencyId: competencyFor(dim, idx),
        xpGained: xp,
        source: SOURCES[idx % SOURCES.length]!,
      });
      idx++;
    }
  }
  return out;
}

/** Additional practice after the last formal observation (lighter density). */
export function journeyAfterFormalActivities(): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  let idx = 0;
  const rounds = 2;
  const total = CLASS_DIMENSION_IDS.length * rounds;

  for (let round = 0; round < rounds; round++) {
    for (let d = 0; d < CLASS_DIMENSION_IDS.length; d++) {
      const dim = CLASS_DIMENSION_IDS[d]!;
      const frac = (idx + 0.5) / total;
      const date = isoLerp(POST_START, POST_END, frac);
      const cta = CTAS[(idx + 2) % CTAS.length]!;
      const stem = STEM[dim];
      const xp = 5 + (idx % 2) * 5;
      out.push({
        id: `journey-p-${idx}`,
        type: "activity",
        date,
        activityName: `${cta}: Post-observation — ${stem}`,
        competencyId: competencyFor(dim, idx + 1),
        xpGained: xp,
        source: SOURCES[(idx + 1) % SOURCES.length]!,
      });
      idx++;
    }
  }
  return out;
}
