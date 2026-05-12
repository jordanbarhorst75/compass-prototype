import { type RefObject } from "react";
import { SpotlightTour, type SpotlightTourStep } from "./SpotlightTour";

const STEPS: readonly SpotlightTourStep[] = [
  {
    title: "This is your Compass profile",
    body: "A calm snapshot of who you are as a learner — your level, streak, and how you’re showing up for growth.",
    emoji: "👋",
    targetSelector: "[data-tour-profile-hero]",
  },
  {
    title: "XP in your current level",
    body: "XP rewards engagement, not perfection. The bar shows progress toward the next Educator Level — small steps that add up.",
    emoji: "🪙",
    targetSelector: "[data-tour-profile-xp]",
  },
  {
    title: "Three views of the same story",
    body: "Competencies, Achievements, and Activity each highlight a different angle on how you’re growing.",
    emoji: "🔖",
    targetSelector: "[data-tour-profile-tabs]",
  },
  {
    title: "Competency map",
    body: "Each tile is a teaching competency. Levels reflect demonstrations over time — where you’re thriving and where you’re still building.",
    emoji: "🗺️",
    targetSelector: "[data-tour-profile-competencies]",
  },
  {
    title: "Achievements",
    body: "Milestones worth celebrating — from single-competency breakthroughs to collection wins and everyday engagement.",
    emoji: "🏅",
    targetSelector: "[data-tour-profile-achievements]",
  },
  {
    title: "XP history",
    body: "A recent ledger of what you completed and the XP each moment earned — transparent and yours to revisit.",
    emoji: "📜",
    targetSelector: "[data-tour-profile-activity]",
  },
];

export function ProfileTour({
  profileRootRef,
  onStepChange,
}: {
  profileRootRef: RefObject<HTMLElement | null>;
  onStepChange?: (step: number) => void;
}) {
  return (
    <SpotlightTour
      tourId="profile"
      rootRef={profileRootRef}
      steps={STEPS}
      longBodyFromStep={4}
      lastStepPrimaryLabel="Back to profile"
      onStepChange={onStepChange}
    />
  );
}
