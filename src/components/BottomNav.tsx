import { FlaskConical, LayoutGrid, Route, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const linkClass =
  "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-stone-500 transition hover:text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600";

const activeClass = "text-amber-800";

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-stone-200/90 bg-[var(--color-compass-surface)]/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 backdrop-blur-md"
      aria-label="Primary"
    >
      <NavLink
        to="/board"
        end
        className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
      >
        {({ isActive }) => (
          <>
            <LayoutGrid className={`h-6 w-6 ${isActive ? "text-amber-700" : ""}`} strokeWidth={isActive ? 2.25 : 1.75} />
            <span className="max-w-[5.5rem] text-center leading-tight">Learning Plan</span>
          </>
        )}
      </NavLink>
      <NavLink to="/journey" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
        {({ isActive }) => (
          <>
            <Route className={`h-6 w-6 ${isActive ? "text-amber-700" : ""}`} strokeWidth={isActive ? 2.25 : 1.75} />
            <span>Journey</span>
          </>
        )}
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
        {({ isActive }) => (
          <>
            <UserRound className={`h-6 w-6 ${isActive ? "text-amber-700" : ""}`} strokeWidth={isActive ? 2.25 : 1.75} />
            <span>Profile</span>
          </>
        )}
      </NavLink>
      <NavLink to="/demo-tools" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
        {({ isActive }) => (
          <>
            <FlaskConical className={`h-6 w-6 ${isActive ? "text-amber-700" : ""}`} strokeWidth={isActive ? 2.25 : 1.75} />
            <span className="text-center leading-tight">Demo Tools</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
