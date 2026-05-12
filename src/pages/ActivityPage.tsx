import { useNavigate } from "react-router-dom";
import { useCompass } from "../state/CompassProvider";

export function ActivityPage() {
  const navigate = useNavigate();
  const { activeActivityTask, activityBucket, beginComplete, clearActivity } = useCompass();

  if (!activeActivityTask || !activityBucket) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-stone-600">No activity selected.</p>
        <button
          type="button"
          className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white"
          onClick={() => navigate("/board")}
        >
          Back to Learning Plan
        </button>
      </div>
    );
  }

  const task = activeActivityTask;

  return (
    <div className="flex h-full flex-col bg-[var(--color-compass-surface)]">
      <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <button
          type="button"
          className="text-sm font-semibold text-stone-600 hover:text-stone-900"
          onClick={() => {
            clearActivity();
            navigate("/board");
          }}
        >
          Back
        </button>
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Placeholder</span>
        <span className="w-12" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="max-w-md rounded-3xl bg-stone-50 p-8 ring-1 ring-stone-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">{task.ctaLabel}</p>
          <h1 className="mt-3 text-2xl font-bold leading-snug text-stone-900">{task.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            This is a simplified stand-in for the real activity — video, upload, reading, or reflection — so you
            can feel the flow of marking something complete.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          onClick={() => {
            beginComplete(task, activityBucket);
            navigate("/board");
          }}
        >
          Mark Complete
        </button>
      </div>
    </div>
  );
}
