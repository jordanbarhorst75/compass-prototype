import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flame } from "lucide-react";
import { ACHIEVEMENT_CATALOG, COMPETENCY_ORDER, getAchievementDef, type AchievementDef } from "../data/achievements";
import { SEED_CATEGORIES } from "../data/seed";
import { categoryTileClasses } from "../domain/competencyColors";
import {
  deriveDemonstrationLevel,
  demonstrationBarFill,
  nextDemonstrationThreshold,
} from "../domain/competencyProgress";
import type { Competency } from "../domain/types";
import { AchievementIcon } from "../components/AchievementIcon";
import { ProfileTour } from "../components/ProfileTour";
import { useCompass } from "../state/CompassProvider";
import { Link } from "react-router-dom";
import { HOW_IT_WORKS_PATH } from "../lib/routes";

type ProfileTab = "competencies" | "achievements" | "activity";

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "competencies", label: "Competencies" },
  { id: "achievements", label: "Achievements" },
  { id: "activity", label: "Activity" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function CompetencyMapTile({ c, onOpen }: { c: Competency; onOpen: (c: Competency) => void }) {
  const level = deriveDemonstrationLevel(c.demonstrationCount, c.demonstrationDates);
  const next = nextDemonstrationThreshold(c.demonstrationCount, level);
  const fill = demonstrationBarFill(c.demonstrationCount, level);
  const isMastery = level === "Mastery";
  const base = categoryTileClasses(c.color);

  return (
    <button
      type="button"
      onClick={() => onOpen(c)}
      className={`flex min-h-[120px] flex-col rounded-2xl p-3 text-left ring-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
        isMastery
          ? "bg-gradient-to-br from-amber-100 to-amber-200/90 text-amber-950 ring-amber-400 shadow-md"
          : `${base} hover:brightness-[1.02]`
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-600/90">{level}</span>
      <span className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-stone-900">{c.name}</span>
      <span className="mt-2 text-[11px] font-medium text-stone-600">
        {level === "Uncharted" ? "0 demonstrations" : next === null ? `${c.demonstrationCount} demonstrations` : `${c.demonstrationCount} / ${next}`}
      </span>
      <div className="mt-auto pt-3">
        <div className="h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${isMastery ? "bg-gradient-to-r from-amber-500 to-amber-700" : "bg-amber-500"}`}
            style={{ width: `${Math.round(fill * 100)}%` }}
          />
        </div>
      </div>
    </button>
  );
}

export function ProfilePage() {
  const { educator, xpView, competencies, xpHistory } = useCompass();
  const profileTourRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<ProfileTab>("competencies");
  const [open, setOpen] = useState<Competency | null>(null);

  const onTourStepChange = useCallback((step: number) => {
    if (step >= 3) setTab("competencies");
    if (step >= 4) setTab("achievements");
    if (step >= 5) setTab("activity");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const earnedSet = useMemo(() => new Set(educator.earnedAchievements.map((e) => e.id)), [educator.earnedAchievements]);

  const earnedById = useMemo(() => new Map(educator.earnedAchievements.map((e) => [e.id, e.earnedAt])), [educator.earnedAchievements]);

  const earnedDefs = useMemo(
    () => educator.earnedAchievements.map((e) => getAchievementDef(e.id)).filter((d): d is AchievementDef => Boolean(d)),
    [educator.earnedAchievements],
  );

  const earnedTier2 = useMemo(() => earnedDefs.filter((a) => a.tier === 2).sort((x, y) => x.name.localeCompare(y.name)), [earnedDefs]);
  const earnedTier3 = useMemo(() => earnedDefs.filter((a) => a.tier === 3).sort((x, y) => x.name.localeCompare(y.name)), [earnedDefs]);

  const tier1ByComp = useMemo(() => {
    const m = new Map<string, AchievementDef[]>();
    for (const slug of COMPETENCY_ORDER) {
      const row = ACHIEVEMENT_CATALOG.filter((a) => a.tier === 1 && a.id.startsWith(`${slug}_`));
      m.set(slug, row);
    }
    return m;
  }, []);

  const groupedComps = useMemo(() => {
    return SEED_CATEGORIES.map((cat) => ({
      cat,
      items: competencies.filter((c) => c.categoryId === cat.id),
    }));
  }, [competencies]);

  const earnedTier1Groups = useMemo(() => {
    return COMPETENCY_ORDER.map((slug) => {
      const comp = competencies.find((c) => c.id === slug);
      const row = (tier1ByComp.get(slug) ?? []).filter((def) => earnedSet.has(def.id));
      if (!comp || row.length === 0) return null;
      return { slug, comp, row };
    }).filter((g): g is NonNullable<typeof g> => g !== null);
  }, [competencies, earnedSet, tier1ByComp]);

  const earnedCount = educator.earnedAchievements.length;

  return (
    <div ref={profileTourRef} className="h-full overflow-y-auto pb-24">
      <div className="border-b border-stone-200 bg-[var(--color-compass-surface)] px-4 py-6">
        <div className="flex items-start gap-4" data-tour-profile-hero>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-lg font-bold text-amber-900 ring-1 ring-amber-200">
            {educator.avatarUrl ? (
              <img src={educator.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              initials(educator.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-stone-900">{educator.name}</h1>
            <p className="mt-1 text-sm font-medium text-stone-600">Level {xpView.level}</p>
            <div className="mt-3" data-tour-profile-xp>
              <div className="flex items-center justify-between text-xs font-medium text-stone-600">
                <span>XP in this level</span>
                {xpView.xpForNextLevel !== null ? (
                  <span>{xpView.xpForNextLevel} XP to go</span>
                ) : (
                  <span>Top level</span>
                )}
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.round(xpView.progress * 100)}%` }}
                />
              </div>
              <p className="mt-2">
                <Link
                  to={HOW_IT_WORKS_PATH}
                  state={{ from: "/profile" }}
                  className="text-xs font-medium text-amber-800 underline-offset-4 hover:underline"
                >
                  How does this work?
                </Link>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-orange-900">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 ring-1 ring-orange-200/80">
                <Flame className="h-4 w-4 text-orange-600" aria-hidden />
                {educator.streakDays} day streak
              </span>
              <span className="text-xs font-medium text-stone-500">
                {educator.totalUploads} uploads · {educator.lrVideosWatched} LR videos
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">Your coach can see this profile</p>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 border-b border-stone-200 bg-[var(--color-compass-surface)] px-2 pt-1" data-tour-profile-tabs>
        <div className="flex gap-1" role="tablist" aria-label="Profile sections">
          {TABS.map((t) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`profile-tab-${t.id}`}
                className={`min-h-[44px] flex-1 rounded-t-xl px-2 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
                  selected ? "bg-stone-50 text-stone-900 shadow-inner ring-1 ring-stone-200" : "text-stone-500 hover:bg-stone-50/80 hover:text-stone-800"
                }`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "competencies" && (
        <section
          role="tabpanel"
          aria-labelledby="profile-tab-competencies"
          className="border-b border-stone-200 bg-stone-50/50 px-4 py-8"
          data-tour-profile-competencies
        >
          <h2 className="text-lg font-bold text-stone-900">Competency map</h2>
          <p className="mt-2 text-sm text-stone-600">
            Demonstration levels build from your practice — every completion adds evidence.
          </p>
          <div className="mt-8 space-y-10">
            {groupedComps.map(({ cat, items }) => (
              <div key={cat.id}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">{cat.label}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map((c) => (
                    <CompetencyMapTile key={c.id} c={c} onOpen={setOpen} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "achievements" && (
        <section
          role="tabpanel"
          aria-labelledby="profile-tab-achievements"
          className="border-b border-stone-200 bg-stone-50/80 px-4 py-8"
          data-tour-profile-achievements
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-stone-900">Achievements</h2>
            <p className="text-sm font-semibold text-amber-800">{earnedCount} earned</p>
          </div>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-stone-600">
            Milestones you have unlocked — personal to you, with no comparisons.
          </p>

          {earnedTier2.length > 0 && (
            <>
              <h3 className="mt-8 text-xs font-bold uppercase tracking-wide text-stone-500">Collection</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {earnedTier2.map((def) => (
                  <div
                    key={def.id}
                    className="flex flex-col rounded-2xl bg-gradient-to-b from-amber-50 to-white p-4 text-stone-900 shadow-md ring-2 ring-amber-400"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
                      <AchievementIcon icon={def.icon} className="h-9 w-9" />
                    </div>
                    <p className="mt-4 text-center text-sm font-bold">{def.name}</p>
                    <p className="mt-2 text-center text-xs leading-relaxed text-stone-600">{def.description}</p>
                    <p className="mt-3 text-center text-[10px] font-medium text-stone-400">
                      Unlocked {new Date(earnedById.get(def.id) ?? 0).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {earnedTier1Groups.length > 0 && (
            <>
              <h3 className="mt-10 text-xs font-bold uppercase tracking-wide text-stone-500">Competency milestones</h3>
              <div className="mt-4 space-y-6">
                {earnedTier1Groups.map(({ comp, row }) => (
                  <div key={comp.id}>
                    <p className="text-xs font-semibold text-stone-600">{comp.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.map((def) => (
                        <div
                          key={def.id}
                          className="flex min-w-[112px] flex-col items-center rounded-xl bg-white px-2 py-2 ring-1 ring-amber-300"
                        >
                          <AchievementIcon icon={def.icon} className="h-5 w-5 text-amber-900" />
                          <span className="mt-1 text-center text-[10px] font-semibold leading-tight text-stone-900">
                            {def.name.replace(`${comp.name}: `, "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {earnedTier3.length > 0 && (
            <>
              <h3 className="mt-10 text-xs font-bold uppercase tracking-wide text-stone-500">Engagement & practice</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {earnedTier3.map((def) => (
                  <div
                    key={def.id}
                    className="flex w-[100px] flex-col items-center rounded-xl bg-white px-2 py-3 ring-1 ring-amber-300"
                  >
                    <div className="text-amber-800">
                      <AchievementIcon icon={def.icon} className="h-7 w-7" />
                    </div>
                    <span className="mt-2 text-center text-[10px] font-semibold leading-tight text-stone-900">{def.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {earnedCount === 0 && (
            <p className="mt-10 text-center text-sm text-stone-500">
              Complete tasks on your board to start earning achievements.
            </p>
          )}

          {earnedCount > 0 && earnedTier2.length === 0 && earnedTier1Groups.length === 0 && earnedTier3.length === 0 && (
            <p className="mt-6 text-center text-sm text-stone-500">No achievements to display.</p>
          )}
        </section>
      )}

      {tab === "activity" && (
        <section role="tabpanel" aria-labelledby="profile-tab-activity" className="px-4 py-8" data-tour-profile-activity>
          <h2 className="text-lg font-bold text-stone-900">XP history</h2>
          <p className="mt-2 text-sm text-stone-600">Recent activity and XP earned.</p>
          <ul className="mt-4 divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
            {xpHistory.slice(0, 15).map((e) => {
              const comp = competencies.find((c) => c.id === e.competencyId);
              return (
                <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                  <span className="min-w-0 flex-1 text-stone-700">
                    {e.activityLabel}
                    {comp && <span className="text-stone-500"> — {comp.name}</span>}
                  </span>
                  <span className="font-semibold text-amber-800">+{e.xpAmount} XP</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="comp-pop-title"
          onMouseDown={(ev) => {
            if (ev.target === ev.currentTarget) setOpen(null);
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-stone-200">
            <h2 id="comp-pop-title" className="text-xl font-bold text-stone-900">
              {open.name}
            </h2>
            <p className="mt-2 text-sm font-semibold text-stone-600">
              {deriveDemonstrationLevel(open.demonstrationCount, open.demonstrationDates)} · {open.demonstrationCount}{" "}
              demonstrations
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{open.description}</p>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-stone-900 py-3 text-sm font-semibold text-white"
              onClick={() => setOpen(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <ProfileTour profileRootRef={profileTourRef} onStepChange={onTourStepChange} />
    </div>
  );
}
