import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { AchievementIcon } from "./AchievementIcon";
import { getAchievementDef } from "../data/achievements";
import { useCompass, type CelebrationPayload } from "../state/CompassProvider";

function ConfettiBurst({ gold }: { gold?: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: gold ? 48 : 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        rot: Math.random() * 360,
        delay: Math.random() * 0.08,
        hue: gold ? [45, 75, 55, 35][i % 4]! : [40, 85, 200, 330][i % 4]!,
      })),
    [gold],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/3 h-2 w-2 rounded-sm"
          style={{ backgroundColor: `oklch(${gold ? 0.78 : 0.72} 0.14 ${p.hue})` }}
          initial={{ opacity: 1, scale: 0.6, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: 0,
            scale: 1,
            x: p.x,
            y: 140 + Math.random() * 120,
            rotate: p.rot,
          }}
          transition={{ duration: gold ? 2 : 1.5, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function StandardPanel({
  celebration,
  primaryRef,
  onDismiss,
}: {
  celebration: CelebrationPayload;
  primaryRef: React.RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
}) {
  const firstTier2 = celebration.newTier2Achievements[0];
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--color-compass-surface)] px-8 py-10 text-center shadow-2xl ring-1 ring-stone-200"
    >
      <ConfettiBurst gold={celebration.masteryUnlocked} />
      <motion.div
        initial={{ scale: 0.4, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.05 }}
        className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full text-4xl shadow-inner ring-2 ${
          celebration.masteryUnlocked
            ? "bg-gradient-to-br from-amber-200 to-amber-500 text-amber-950 ring-amber-300"
            : "bg-amber-100 text-amber-900 ring-amber-200/80"
        }`}
        aria-hidden
      >
        {celebration.masteryUnlocked ? "👑" : "🪙"}
      </motion.div>
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">You earned</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
        +{celebration.totalXpGained} XP · {celebration.competencyName || "Compass"}
      </p>
      {celebration.milestoneXp > 0 && (
        <p className="mt-2 text-sm text-stone-600">
          Including {celebration.milestoneXp} XP for an engagement milestone
        </p>
      )}
      <AnimatePresence>
        {celebration.competencyDemonstrationLevelChanged && celebration.newCompetencyLevel && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-amber-950 ring-1 ring-amber-200"
          >
            <p className="text-sm font-semibold">Level up</p>
            <p className="text-lg font-bold">
              {celebration.newCompetencyLevel} <span aria-hidden>🎉</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {celebration.educatorLeveledUp && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: celebration.competencyDemonstrationLevelChanged ? 0.4 : 0.28, duration: 0.3 }}
            className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-violet-900 ring-1 ring-violet-200"
          >
            <p className="text-sm font-semibold">Program level up</p>
            <p className="text-lg font-bold">You reached Level {celebration.newEducatorLevel}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {firstTier2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 280, damping: 18 }}
            className="mt-6 flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-amber-50 to-white px-4 py-5 ring-2 ring-amber-300/80"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-inner ring-1 ring-amber-200">
              {(() => {
                const def = getAchievementDef(firstTier2.id);
                return def ? <AchievementIcon icon={def.icon} className="h-8 w-8" /> : <span className="text-2xl">🏆</span>;
              })()}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Achievement unlocked</p>
            <p className="text-lg font-bold text-stone-900">{firstTier2.name}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {celebration.newTier3Achievements.length > 0 && celebration.newTier2Achievements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.2 }}
            className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-stone-800 ring-1 ring-stone-200"
          >
            <p className="text-sm font-semibold">New recognition</p>
            {celebration.newTier3Achievements.map((a) => (
              <p key={a.id} className="text-base font-bold">
                {a.name}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {celebration.newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.2 }}
            className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-stone-800 ring-1 ring-stone-200"
          >
            <p className="text-sm font-semibold">Upload milestone</p>
            {celebration.newBadges.map((b) => (
              <p key={b.id} className="text-base font-bold">
                {b.label} — {b.threshold} uploads
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          ref={primaryRef}
          type="button"
          onClick={onDismiss}
          className="rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
        >
          Keep going
        </button>
        <Link
          to="/profile"
          onClick={onDismiss}
          className="rounded-full px-4 py-3 text-sm font-semibold text-amber-900 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
        >
          See my profile
        </Link>
      </div>
    </motion.div>
  );
}

function CompassCompletePanel({
  celebration,
  primaryRef,
  onDismiss,
}: {
  celebration: CelebrationPayload;
  primaryRef: React.RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-gradient-to-b from-amber-100 via-amber-50 to-white px-10 py-14 text-center shadow-2xl ring-2 ring-amber-400"
    >
      <ConfettiBurst gold />
      <motion.div
        animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-5xl shadow-lg ring-4 ring-amber-200/90"
        aria-hidden
      >
        🧭
      </motion.div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-900">Compass complete</p>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900">You reached Mastery across every competency</h2>
      <p className="mt-4 text-base leading-relaxed text-stone-700">
        This is a rare milestone — a full arc of growth you built one demonstration at a time.
      </p>
      <p className="mt-6 text-2xl font-bold text-amber-800">+{celebration.totalXpGained} XP</p>
      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          ref={primaryRef}
          type="button"
          onClick={onDismiss}
          className="rounded-full bg-stone-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
        >
          Celebrate and continue
        </button>
        <Link
          to="/profile"
          onClick={onDismiss}
          className="rounded-full px-4 py-3.5 text-sm font-semibold text-amber-950 underline-offset-4 hover:underline"
        >
          View achievements
        </Link>
      </div>
    </motion.div>
  );
}

function MasteryPanel({
  celebration,
  primaryRef,
  onDismiss,
}: {
  celebration: CelebrationPayload;
  primaryRef: React.RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-50/80 px-8 py-12 text-center shadow-2xl ring-2 ring-amber-400/70"
    >
      <ConfettiBurst gold />
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-4xl shadow-lg ring-2 ring-amber-200" aria-hidden>
        👑
      </div>
      <p className="text-sm font-bold uppercase tracking-wide text-amber-900">Mastery</p>
      <h2 className="mt-3 text-2xl font-extrabold text-stone-900">{celebration.competencyName}</h2>
      <p className="mt-4 text-base leading-relaxed text-stone-700">
        You sustained meaningful practice with fewer than 30 days between demonstrations — a career‑defining depth in this competency.
      </p>
      <p className="mt-6 text-3xl font-extrabold text-amber-800">+{celebration.totalXpGained} XP</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          ref={primaryRef}
          type="button"
          onClick={onDismiss}
          className="rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
        >
          Beautiful work
        </button>
        <Link to="/profile" onClick={onDismiss} className="rounded-full px-4 py-3 text-sm font-semibold text-amber-950 hover:underline">
          Profile
        </Link>
      </div>
    </motion.div>
  );
}

export function CelebrationOverlay() {
  const { celebration, dismissCelebration } = useCompass();
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (celebration) primaryRef.current?.focus();
  }, [celebration]);

  useEffect(() => {
    if (!celebration) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissCelebration();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [celebration, dismissCelebration]);

  const mode = celebration?.compassCompleteUnlocked
    ? "compass"
    : celebration?.masteryUnlocked
      ? "mastery"
      : "standard";

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          className={`fixed inset-0 z-[60] flex items-center justify-center p-6 ${
            mode === "compass" || mode === "mastery" ? "bg-black/80" : "bg-black/70"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Celebration"
        >
          {mode === "compass" && (
            <CompassCompletePanel celebration={celebration} primaryRef={primaryRef} onDismiss={dismissCelebration} />
          )}
          {mode === "mastery" && (
            <MasteryPanel celebration={celebration} primaryRef={primaryRef} onDismiss={dismissCelebration} />
          )}
          {mode === "standard" && (
            <StandardPanel celebration={celebration} primaryRef={primaryRef} onDismiss={dismissCelebration} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
