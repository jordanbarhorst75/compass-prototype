import { Flame } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BoardTour } from "../components/BoardTour";
import { competencyBadgeLabel } from "../data/competencyPillLabels";
import { completionBreakdown } from "../domain/completion";
import { BUCKET_ORDER, type LearningBucket, type Task } from "../domain/types";
import { timeGreeting } from "../lib/greeting";
import { useCompass } from "../state/CompassProvider";
import { BoardColumn } from "../components/BoardColumn";

export function BoardPage() {
  const navigate = useNavigate();
  const {
    educator,
    xpView,
    competencies,
    columns,
    engagementBadges,
    completing,
    finalizeComplete,
    startActivity,
    skipTask,
  } = useCompass();

  const boardTourScopeRef = useRef<HTMLDivElement>(null);

  const [completePhase, setCompletePhase] = useState<"idle" | "stamp" | "out">("idle");

  useEffect(() => {
    if (!completing) {
      setCompletePhase("idle");
      return;
    }
    setCompletePhase("stamp");
    const tOut = window.setTimeout(() => setCompletePhase("out"), 220);
    const tDone = window.setTimeout(() => {
      finalizeComplete();
    }, 650);
    return () => {
      window.clearTimeout(tOut);
      window.clearTimeout(tDone);
    };
  }, [completing, finalizeComplete]);

  const resolvePillLabel = useCallback((task: Task) => competencyBadgeLabel(task), []);

  const augmentTask = useCallback(
    (task: Task): Task => {
      const comp = competencies.find((c) => c.id === task.competencyId);
      if (!comp) return task;
      const { baseXp, milestoneXp } = completionBreakdown({
        competency: comp,
        task,
        uploadsCompletedBefore: educator.totalUploads,
        badges: engagementBadges,
      });
      return { ...task, xpOnComplete: baseXp + milestoneXp };
    },
    [competencies, educator.totalUploads, engagementBadges],
  );

  const greeting = useMemo(() => timeGreeting(), []);

  const onOpen = (task: Task, bucket: LearningBucket) => {
    startActivity(task, bucket);
    navigate("/activity");
  };

  const onSkip = (task: Task, bucket: LearningBucket) => {
    skipTask(bucket, task.id);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-stone-200/80 bg-[var(--color-compass-surface)] px-4 py-4">
        <p className="text-lg font-semibold text-stone-900">
          {greeting}, {educator.name.split(" ")[0]}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <div className="flex items-center justify-between text-xs font-medium text-stone-600">
              <span>Level {xpView.level}</span>
              {xpView.xpForNextLevel !== null ? (
                <span>{xpView.xpForNextLevel} XP to next level</span>
              ) : (
                <span>Max level</span>
              )}
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-[width] duration-500"
                style={{ width: `${Math.round(xpView.progress * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-900 ring-1 ring-orange-200/80">
            <Flame className="h-4 w-4 text-orange-600" aria-hidden />
            <span>{educator.streakDays} day streak</span>
          </div>
        </div>
      </div>

      <div ref={boardTourScopeRef} className="relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-4 py-4">
        <div data-tour-board-grid className="flex h-full min-h-[480px] gap-4 pb-2">
          {BUCKET_ORDER.map((bucket) => (
            <div
              key={bucket}
              data-tour-column={bucket}
              className="flex h-full min-h-0 shrink-0 flex-col"
            >
              <BoardColumn
                bucket={bucket}
                tasks={columns[bucket].active.map(augmentTask)}
                resolvePillLabel={resolvePillLabel}
                completingTaskId={completing?.task.id ?? null}
                completePhase={completePhase}
                onOpen={onOpen}
                onSkip={onSkip}
              />
            </div>
          ))}
        </div>
      </div>
      <BoardTour boardRootRef={boardTourScopeRef} />
    </div>
  );
}
