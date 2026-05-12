/**
 * CLASS Pre-K **dimensions** (not domains). Each competency maps to one primary dimension for Journey.
 * Domains are used only for grouping in the UI (Emotional support, Classroom organization, Instructional support).
 */
export const CLASS_DIMENSION_IDS = [
  "positive_climate",
  "teacher_sensitivity",
  "regard_child_perspectives",
  "behavior_management",
  "productivity",
  "instructional_learning_formats",
  "concept_development",
  "quality_feedback",
  "language_modeling",
] as const;

export type ClassDimensionId = (typeof CLASS_DIMENSION_IDS)[number];

export type ClassDomainGroup = "Emotional support" | "Classroom organization" | "Instructional support";

export const CLASS_DIMENSIONS: {
  id: ClassDimensionId;
  label: string;
  shortLabel: string;
  domain: ClassDomainGroup;
  description: string;
}[] = [
  {
    id: "positive_climate",
    label: "Positive Climate",
    shortLabel: "Positive Climate",
    domain: "Emotional support",
    description: "Warmth, connection, and enjoyment reflected in the emotional tone of the classroom.",
  },
  {
    id: "teacher_sensitivity",
    label: "Teacher Sensitivity",
    shortLabel: "Sensitivity",
    domain: "Emotional support",
    description: "Awareness of and responsiveness to children’s academic and emotional needs.",
  },
  {
    id: "regard_child_perspectives",
    label: "Regard for Child Perspectives",
    shortLabel: "Regard",
    domain: "Emotional support",
    description: "How much children’s ideas, autonomy, and leadership are supported and encouraged.",
  },
  {
    id: "behavior_management",
    label: "Behavior Management",
    shortLabel: "Behavior mgmt",
    domain: "Classroom organization",
    description: "Proactive strategies that maximize learning time and minimize disruptive behavior.",
  },
  {
    id: "productivity",
    label: "Productivity",
    shortLabel: "Productivity",
    domain: "Classroom organization",
    description: "How well time is used so children stay engaged in meaningful learning.",
  },
  {
    id: "instructional_learning_formats",
    label: "Instructional Learning Formats",
    shortLabel: "Learning formats",
    domain: "Classroom organization",
    description: "How activities and materials support engagement and maximize learning.",
  },
  {
    id: "concept_development",
    label: "Concept Development",
    shortLabel: "Concept development",
    domain: "Instructional support",
    description: "How teachers use discussions and activities to promote higher-order thinking.",
  },
  {
    id: "quality_feedback",
    label: "Quality of Feedback",
    shortLabel: "Feedback",
    domain: "Instructional support",
    description: "How teachers extend learning through feedback that scaffolds and stretches thinking.",
  },
  {
    id: "language_modeling",
    label: "Language Modeling",
    shortLabel: "Language",
    domain: "Instructional support",
    description: "The frequency and quality of teachers’ language that models and extends communication.",
  },
];

const DOMAIN_ORDER: ClassDomainGroup[] = [
  "Emotional support",
  "Classroom organization",
  "Instructional support",
];

export function classDimensionsByDomain(): { domain: ClassDomainGroup; dimensions: (typeof CLASS_DIMENSIONS)[number][] }[] {
  return DOMAIN_ORDER.map((domain) => ({
    domain,
    dimensions: CLASS_DIMENSIONS.filter((d) => d.domain === domain),
  }));
}

/** Primary CLASS dimension for each competency id (prototype mapping). */
export const COMPETENCY_CLASS_DIMENSION: Record<string, ClassDimensionId> = {
  inclusive_community: "positive_climate",
  responsive_support: "teacher_sensitivity",
  child_centered: "regard_child_perspectives",
  behavior_support: "behavior_management",
  intentional_experiences: "instructional_learning_formats",
  active_engagement: "productivity",
  spark_curiosity: "concept_development",
  personalized_scaffolding: "quality_feedback",
  rich_communication: "language_modeling",
  whole_child_support: "regard_child_perspectives",
};

export function classDimensionForCompetency(competencyId: string | undefined): ClassDimensionId | null {
  if (!competencyId) return null;
  return COMPETENCY_CLASS_DIMENSION[competencyId] ?? null;
}
