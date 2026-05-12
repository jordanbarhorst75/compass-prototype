import { type RefObject } from "react";
import { SpotlightTour, type SpotlightTourStep } from "./SpotlightTour";

const STEPS: readonly SpotlightTourStep[] = [
  {
    title: "Your journey between formal observations",
    body: "Journey shows how you’re growing in the windows between formal CLASS moments — so the story of your practice doesn’t get lost.",
    emoji: "🛤️",
    targetSelector: "[data-tour-journey-header]",
  },
  {
    title: "Pick a time window",
    body: "Choose the stretch between two formal observations (or another slice of time) to focus the timeline and stats.",
    emoji: "📅",
    targetSelector: "[data-tour-journey-window]",
  },
  {
    title: "Choose a CLASS dimension",
    body: "Each dimension maps to related competencies. Switch dimensions to see how your activities line up with different facets of teaching.",
    emoji: "🧭",
    targetSelector: "[data-tour-journey-dimension]",
  },
  {
    title: "Growth ladder",
    body: "Each dot is real work you logged — cumulative XP climbs as you go. Hover or focus a dot for the activity, competency, and date.",
    emoji: "📈",
    targetSelector: "[data-tour-journey-ladder]",
  },
  {
    title: "Quick stats",
    body: "These tiles summarize XP, breadth across competencies, activity count, and how many days you showed up in this view.",
    emoji: "✨",
    targetSelector: "[data-tour-journey-stats]",
  },
  {
    title: "Activities list",
    body: "The table is your paper trail — every row ties back to something you completed on Compass in this window.",
    emoji: "📋",
    targetSelector: "[data-tour-journey-activities]",
  },
];

export function JourneyTour({ journeyRootRef }: { journeyRootRef: RefObject<HTMLElement | null> }) {
  return (
    <SpotlightTour
      tourId="journey"
      rootRef={journeyRootRef}
      steps={STEPS}
      longBodyFromStep={4}
      lastStepPrimaryLabel="Explore Journey"
    />
  );
}
