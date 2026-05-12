/**
 * Project Compass — competency catalog (Connect, Engage, Inspire learning, Whole child).
 * Demonstration levels are derived at runtime from counts + dates (see domain/competencyProgress).
 */
import type { Competency, CompetencyCategory } from "../domain/types";
import { syntheticDemonstrationDates } from "../domain/competencyProgress";

export const SEED_CATEGORIES: CompetencyCategory[] = [
  { id: "cat-connect", label: "CONNECT" },
  { id: "cat-engage", label: "ENGAGE" },
  { id: "cat-inspire", label: "INSPIRE LEARNING" },
  { id: "cat-whole", label: "WHOLE CHILD" },
];

const ROWS: {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  color: string;
}[] = [
  {
    id: "inclusive_community",
    categoryId: "cat-connect",
    name: "Inclusive Community",
    description: "Foster belonging and relationships so every child feels seen, valued, and part of the group.",
    color: "connect",
  },
  {
    id: "responsive_support",
    categoryId: "cat-connect",
    name: "Responsive Support",
    description: "Tune in to cues and needs; respond with warmth and consistency to build trust and safety.",
    color: "connect",
  },
  {
    id: "child_centered",
    categoryId: "cat-connect",
    name: "Child-Centered",
    description: "Let children’s interests and voices lead; design experiences that reflect who they are.",
    color: "connect",
  },
  {
    id: "behavior_support",
    categoryId: "cat-engage",
    name: "Behavior Support",
    description: "Teach expectations, co-regulate with care, and help children practice kind, safe choices.",
    color: "engage",
  },
  {
    id: "intentional_experiences",
    categoryId: "cat-engage",
    name: "Intentional Experiences",
    description: "Shape routines, materials, and pacing so learning stays purposeful and accessible.",
    color: "engage",
  },
  {
    id: "active_engagement",
    categoryId: "cat-engage",
    name: "Active Engagement",
    description: "Invite sustained participation through choice, novelty, and responsive facilitation.",
    color: "engage",
  },
  {
    id: "spark_curiosity",
    categoryId: "cat-inspire",
    name: "Spark Curiosity",
    description: "Invite questions, exploration, and joyful inquiry across the day.",
    color: "inspire",
  },
  {
    id: "personalized_scaffolding",
    categoryId: "cat-inspire",
    name: "Personalized Scaffolding",
    description: "Meet each child where they are and stretch learning just enough to keep growth within reach.",
    color: "inspire",
  },
  {
    id: "rich_communication",
    categoryId: "cat-inspire",
    name: "Rich Communication",
    description: "Model and extend language in back-and-forth exchanges that build meaning.",
    color: "inspire",
  },
  {
    id: "whole_child_support",
    categoryId: "cat-whole",
    name: "Whole-Child Support",
    description: "Honor development across social, emotional, cognitive, and physical domains together.",
    color: "whole",
  },
];

const COMPETENCY_NAME_BY_ID: Record<string, string> = Object.fromEntries(ROWS.map((r) => [r.id, r.name]));

/** Display name from the static catalog (fallback when persisted competencies omit a row). */
export function competencyCatalogName(competencyId: string | undefined): string | undefined {
  if (!competencyId) return undefined;
  return COMPETENCY_NAME_BY_ID[competencyId];
}

export function seedCompetencies(): Competency[] {
  return ROWS.map((r) => ({
    id: r.id,
    name: r.name,
    categoryId: r.categoryId,
    color: r.color,
    description: r.description,
    demonstrationCount: 0,
    demonstrationDates: [],
  }));
}

/** Maya Chen prototype — demonstration counts + synthetic dates (gaps &lt; 30d) for Mastery rule. */
export const MAYA_DEMONSTRATION_COUNTS: Record<string, number> = {
  inclusive_community: 18,
  responsive_support: 27,
  child_centered: 5,
  behavior_support: 1,
  intentional_experiences: 9,
  active_engagement: 3,
  spark_curiosity: 14,
  personalized_scaffolding: 0,
  rich_communication: 2,
  whole_child_support: 6,
};

export function seedMayaCompetencies(now = Date.now()): Competency[] {
  return ROWS.map((r) => {
    const demonstrationCount = MAYA_DEMONSTRATION_COUNTS[r.id] ?? 0;
    return {
      id: r.id,
      name: r.name,
      categoryId: r.categoryId,
      color: r.color,
      description: r.description,
      demonstrationCount,
      demonstrationDates: syntheticDemonstrationDates(demonstrationCount, now, 20),
    };
  });
}
