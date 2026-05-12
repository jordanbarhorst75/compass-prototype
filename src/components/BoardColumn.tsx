import { Info } from "lucide-react";
import { useState } from "react";
import type { LearningBucket, Task } from "../domain/types";
import { COLUMN_CAPS } from "../domain/types";
import { TaskCard } from "./TaskCard";

const BUCKET_META: Record<
  LearningBucket,
  { title: string; description: string }
> = {
  know: {
    title: "Know",
    description:
      "Understand what great teaching looks like in your classroom — and where you have room to grow.",
  },
  see: {
    title: "See",
    description:
      "Watch effective teaching in action so you can picture what it looks like before you try it yourself.",
  },
  try: {
    title: "Try",
    description: "Practice new strategies in your classroom and capture those moments on video.",
  },
  apply: {
    title: "Apply",
    description: "Make new habits stick by reflecting on what's working and building on your strengths.",
  },
};

interface BoardColumnProps {
  bucket: LearningBucket;
  tasks: Task[];
  resolvePillLabel: (task: Task) => string;
  completingTaskId: string | null;
  completePhase: "idle" | "stamp" | "out";
  onOpen: (task: Task, bucket: LearningBucket) => void;
  onSkip: (task: Task, bucket: LearningBucket) => void;
}

export function BoardColumn({
  bucket,
  tasks,
  resolvePillLabel,
  completingTaskId,
  completePhase,
  onOpen,
  onSkip,
}: BoardColumnProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const meta = BUCKET_META[bucket];
  const cap = COLUMN_CAPS[bucket];

  return (
    <section
      className="flex h-full min-h-0 w-[min(100%,320px)] shrink-0 flex-col rounded-2xl bg-stone-100/80 p-3 ring-1 ring-stone-200/80"
      aria-label={`${meta.title} column`}
    >
      <header className="mb-3 shrink-0 flex items-start justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900" title={meta.description}>
              {meta.title}
            </h2>
            <span className="relative">
              <button
                type="button"
                className="rounded-full p-1 text-stone-500 hover:bg-white hover:text-stone-800 md:hidden"
                aria-label={`About ${meta.title}`}
                onClick={() => setInfoOpen((v) => !v)}
              >
                <Info className="h-4 w-4" />
              </button>
              {infoOpen && (
                <p className="absolute left-0 top-8 z-20 w-56 rounded-xl bg-white p-3 text-xs leading-relaxed text-stone-600 shadow-lg ring-1 ring-stone-200 md:hidden">
                  {meta.description}
                </p>
              )}
            </span>
          </div>
          <p className="mt-1 hidden max-w-[260px] text-xs leading-relaxed text-stone-600 md:block">
            {meta.description}
          </p>
          <p className="mt-2 text-xs font-medium text-stone-500">
            {tasks.length} of {cap}
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2 pr-1">
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            bucket={bucket}
            competencyName={resolvePillLabel(task)}
            isCompleting={completingTaskId === task.id}
            completePhase={completePhase}
            onOpen={onOpen}
            onSkip={onSkip}
            tourAnchor={bucket === "know" && i === 0}
          />
        ))}
      </div>
    </section>
  );
}
