import { useEffect, useRef, useState } from "react";
import { CircleHelp, Clapperboard, Route, Sparkles, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { HOW_IT_WORKS_PATH } from "../lib/routes";
import { useCompass } from "../state/CompassProvider";

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { startGuideTour } = useCompass();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const replayLearningPlanTour = () => {
    setMenuOpen(false);
    startGuideTour("board");
  };

  const replayJourneyTour = () => {
    setMenuOpen(false);
    startGuideTour("journey");
  };

  const replayProfileTour = () => {
    setMenuOpen(false);
    startGuideTour("profile");
  };

  const growthGuide = (
    <Link
      to={HOW_IT_WORKS_PATH}
      state={{ from: location.pathname }}
      role="menuitem"
      onClick={() => setMenuOpen(false)}
      className="flex items-start gap-3 rounded-xl px-3 py-3 text-left text-sm text-stone-800 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
    >
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <span>
        <span className="block font-semibold">About your growth</span>
        <span className="mt-0.5 block text-xs font-normal leading-snug text-stone-600">
          How XP, competencies, achievements, and CLASS fit together
        </span>
      </span>
    </Link>
  );

  return (
    <header className="relative z-30 flex shrink-0 items-center justify-between border-b border-stone-200/80 bg-[var(--color-compass-surface)] px-4 py-3">
      <span className="text-sm font-semibold tracking-tight text-stone-800">Compass</span>
      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Help and guides"
        >
          <CircleHelp className="h-6 w-6" aria-hidden />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),18rem)] overflow-hidden rounded-2xl border border-stone-200/90 bg-white py-1 shadow-lg ring-1 ring-black/5"
            role="menu"
            aria-label="Help"
          >
            {growthGuide}
            <div className="mx-2 border-t border-stone-100" role="presentation" />
            <button
              type="button"
              role="menuitem"
              onClick={replayLearningPlanTour}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm text-stone-800 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <Clapperboard className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
              <span>
                <span className="block font-semibold">Replay Learning Plan tour</span>
                <span className="mt-0.5 block text-xs font-normal leading-snug text-stone-600">
                  Know, See, Try, Apply, and task details
                </span>
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={replayJourneyTour}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm text-stone-800 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <Route className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
              <span>
                <span className="block font-semibold">Journey tour</span>
                <span className="mt-0.5 block text-xs font-normal leading-snug text-stone-600">
                  Windows, dimensions, ladder, and activities
                </span>
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={replayProfileTour}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm text-stone-800 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
              <span>
                <span className="block font-semibold">Profile tour</span>
                <span className="mt-0.5 block text-xs font-normal leading-snug text-stone-600">
                  XP, tabs, competencies, achievements, and history
                </span>
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
