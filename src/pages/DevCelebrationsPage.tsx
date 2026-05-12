import { Link } from "react-router-dom";
import { useCompass, type CelebrationPayload } from "../state/CompassProvider";

const baseCelebration = (): CelebrationPayload => ({
  competencyName: "Inclusive Community",
  totalXpGained: 15,
  baseXp: 15,
  milestoneXp: 0,
  isNewCompetency: false,
  educatorLeveledUp: false,
  newEducatorLevel: 4,
  newBadges: [],
  priorCompetencyLevel: "Practicing",
  newCompetencyLevel: "Practicing",
  competencyDemonstrationLevelChanged: false,
  newTier2Achievements: [],
  newTier3Achievements: [],
  masteryUnlocked: false,
  compassCompleteUnlocked: false,
});

export function DevCelebrationsPage() {
  const { showDemoCelebration, dismissCelebration } = useCompass();

  return (
    <div className="h-full overflow-y-auto px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-4">
        <div>
          <Link to="/demo-tools" className="text-sm font-semibold text-amber-800 hover:underline">
            ← Demo Tools
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Celebration prototypes</h1>
          <p className="mt-2 text-sm text-stone-600">
            Opens the same overlay used after card completion. Dismiss with Escape or the primary button.
          </p>
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-stone-900 py-3 text-sm font-semibold text-white"
          onClick={() => dismissCelebration()}
        >
          Dismiss overlay if open
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-stone-900 ring-1 ring-stone-200"
          onClick={() => showDemoCelebration(baseCelebration())}
        >
          Standard — XP only
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-stone-900 ring-1 ring-stone-200"
          onClick={() =>
            showDemoCelebration({
              ...baseCelebration(),
              priorCompetencyLevel: "Developing",
              newCompetencyLevel: "Practicing",
              competencyDemonstrationLevelChanged: true,
            })
          }
        >
          Competency demonstration level up
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-stone-900 ring-1 ring-stone-200"
          onClick={() =>
            showDemoCelebration({
              ...baseCelebration(),
              educatorLeveledUp: true,
              newEducatorLevel: 5,
            })
          }
        >
          Program (XP) level up
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-stone-900 ring-1 ring-stone-200"
          onClick={() =>
            showDemoCelebration({
              ...baseCelebration(),
              priorCompetencyLevel: "Practicing",
              newCompetencyLevel: "Consistent",
              competencyDemonstrationLevelChanged: true,
              newTier2Achievements: [{ id: "deep_roots", name: "Deep Roots" }],
            })
          }
        >
          Level up + Tier 2 achievement
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-stone-900 ring-1 ring-stone-200"
          onClick={() =>
            showDemoCelebration({
              ...baseCelebration(),
              newTier3Achievements: [{ id: "curious", name: "Curious" }],
            })
          }
        >
          Tier 3 achievement only
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-amber-100 py-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-300"
          onClick={() =>
            showDemoCelebration({
              ...baseCelebration(),
              competencyName: "Spark Curiosity",
              priorCompetencyLevel: "Consistent",
              newCompetencyLevel: "Mastery",
              competencyDemonstrationLevelChanged: true,
              masteryUnlocked: true,
            })
          }
        >
          Mastery (single competency)
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-gradient-to-r from-amber-200 to-amber-400 py-3 text-sm font-bold text-amber-950 ring-2 ring-amber-500"
          onClick={() =>
            showDemoCelebration({
              ...baseCelebration(),
              totalXpGained: 20,
              baseXp: 15,
              milestoneXp: 5,
              competencyName: "Whole-Child Support",
              compassCompleteUnlocked: true,
            })
          }
        >
          Compass Complete (special)
        </button>
      </div>
    </div>
  );
}
