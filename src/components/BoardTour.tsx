import { type RefObject } from "react";
import { SpotlightTour, type SpotlightTourStep } from "./SpotlightTour";

const STEPS: readonly SpotlightTourStep[] = [
  {
    title: "Your growth journey, made visible.",
    body: "Compass helps you grow as a teacher — one small step at a time. Here's how your Learning Plan is organized.",
    emoji: "🧭",
  },
  {
    title: "Know",
    body: "Understand what great teaching looks like in your classroom — and where you have room to grow.",
    emoji: "💡",
    bucket: "know",
  },
  {
    title: "See",
    body: "Watch effective teaching in action so you can picture what it looks like before you try it yourself.",
    emoji: "👀",
    bucket: "see",
  },
  {
    title: "Try",
    body: "Practice new strategies in your classroom and capture those moments on video.",
    emoji: "🎯",
    bucket: "try",
  },
  {
    title: "Apply",
    body: "Make new habits stick by reflecting on what's working and building on your strengths.",
    emoji: "✨",
    bucket: "apply",
  },
  {
    title: "Competency",
    body: "See which competency this task will help you build.",
    emoji: "🏷️",
    targetSelector: "[data-tour-task-competency]",
  },
  {
    title: "Source",
    body: "Tasks can be assigned by your Program or Coach, suggested by us, or selected by you.",
    emoji: "📌",
    targetSelector: "[data-tour-task-source]",
  },
  {
    title: "XP",
    body: "Each task will earn you XP for that Competency. You'll earn more XP for exercising skills you haven't touched in a while. Level up and compete with other educators in your program for badges!",
    emoji: "🪙",
    targetSelector: "[data-tour-task-xp]",
  },
  {
    title: "Call to action",
    body: "This button will take you directly to the task.",
    emoji: "▶️",
    targetSelector: "[data-tour-task-cta]",
  },
];

export function BoardTour({ boardRootRef }: { boardRootRef: RefObject<HTMLElement | null> }) {
  return (
    <SpotlightTour
      tourId="board"
      rootRef={boardRootRef}
      steps={STEPS}
      initialTargetSelector="[data-tour-board-grid]"
      longBodyFromStep={5}
    />
  );
}
