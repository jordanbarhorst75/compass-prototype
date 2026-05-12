/**
 * Competency text for board pills — each string is tied to a single `competencyId`.
 * Variants mimic alternate phrasings you might see in a Compass competency PDF;
 * which variant a card shows is deterministic from `task.id` so labels stay stable.
 */
import { competencyCatalogName } from "./competencies";
import { competencyIdForSeedTaskTitle } from "./seed";

export const COMPETENCY_PILL_VARIANTS: Record<string, readonly string[]> = {
  inclusive_community: [
    "Inclusive Community",
    "Fosters inclusive community",
    "Belonging & inclusive relationships",
    "Every child seen in the group",
    "Warm, inclusive group climate",
  ],
  responsive_support: [
    "Responsive Support",
    "Responsive to children’s needs",
    "Sensitivity & consistent response",
    "Tuning in with warmth",
    "Trust-building responsiveness",
  ],
  child_centered: [
    "Child-Centered",
    "Child-centered practice",
    "Interests & voices lead learning",
    "Experiences reflect who children are",
    "Following the child’s lead",
  ],
  behavior_support: [
    "Behavior Support",
    "Proactive behavior support",
    "Teaching expectations with care",
    "Co-regulation & safe choices",
    "Kind, clear behavior guidance",
  ],
  intentional_experiences: [
    "Intentional Experiences",
    "Intentional routines & materials",
    "Purposeful pacing & access",
    "Materials that support learning",
    "Routines that protect learning time",
  ],
  active_engagement: [
    "Active Engagement",
    "Sustained active engagement",
    "Choice, novelty & facilitation",
    "Participation that sticks",
    "Inviting every child in",
  ],
  spark_curiosity: [
    "Spark Curiosity",
    "Sparking curiosity & inquiry",
    "Open-ended exploration",
    "Joyful questions across the day",
    "Curiosity-driven learning",
  ],
  personalized_scaffolding: [
    "Personalized Scaffolding",
    "Scaffolding just right for each child",
    "Stretch within reach",
    "Meeting children where they are",
    "Differentiated stretch & support",
  ],
  rich_communication: [
    "Rich Communication",
    "Language modeling & loops",
    "Back-and-forth exchanges",
    "Extending child language",
    "Meaningful classroom talk",
  ],
  whole_child_support: [
    "Whole-Child Support",
    "Whole-child perspective",
    "Development across domains",
    "Honoring the whole child",
    "Integrated child development",
  ],
};

const ALL_PILL_VARIANT_LABELS: string[] = (Object.values(COMPETENCY_PILL_VARIANTS) as string[][]).flat();

function stablePickIndex(seed: string, modulo: number): number {
  if (modulo <= 0) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % modulo;
}

/** Label for the task pill — tied to `competencyId` (with title fallback); variant pick varies per card. */
export function competencyBadgeLabel(task: { id: string; competencyId: unknown; title: string }): string {
  const raw = task.competencyId != null ? String(task.competencyId).trim() : "";
  const compId = raw || competencyIdForSeedTaskTitle(task.title) || "";
  const variants = compId ? COMPETENCY_PILL_VARIANTS[compId] : undefined;
  if (variants?.length) {
    const pick = stablePickIndex(`${compId}|${task.id}|${task.title}`, variants.length);
    return variants[pick]!;
  }
  const cat = compId ? competencyCatalogName(compId) : undefined;
  if (cat) return cat;
  return ALL_PILL_VARIANT_LABELS[stablePickIndex(`${task.id}|${task.title}`, ALL_PILL_VARIANT_LABELS.length)]!;
}
