import { Link, useLocation } from "react-router-dom";
import { HOW_IT_WORKS_PATH } from "../lib/routes";
import { useCompass } from "../state/CompassProvider";

export function DemoToolsPage() {
  const { resetDemo } = useCompass();
  const location = useLocation();

  return (
    <div className="h-full overflow-y-auto px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Demo Tools</h1>
          <p className="mt-2 text-sm text-stone-600">
            Shortcuts for resetting prototype data and previewing celebration overlays.
          </p>
        </div>

        <ul className="space-y-3">
          <li>
            <Link
              to="/dev/celebrations"
              className="flex w-full items-center justify-center rounded-2xl bg-stone-900 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Prototype celebration demos
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={resetDemo}
              className="w-full rounded-2xl bg-white py-4 text-sm font-semibold text-stone-900 ring-1 ring-stone-200 transition hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Reset Demo
            </button>
          </li>
        </ul>

        <p className="text-center text-sm text-stone-600">
          <Link
            to={HOW_IT_WORKS_PATH}
            state={{ from: location.pathname }}
            className="font-medium text-amber-800 underline-offset-4 hover:underline"
          >
            About your growth
          </Link>
          <span className="text-stone-500"> — how XP, competencies, and achievements work</span>
        </p>
      </div>
    </div>
  );
}
