import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { LearningBucket, Task } from "../domain/types";
import { competencyPillClasses } from "../domain/competencyColors";
import { SourceBadge } from "./SourceBadge";

interface TaskCardProps {
  task: Task;
  competencyName: string;
  bucket: LearningBucket;
  isCompleting: boolean;
  completePhase: "idle" | "stamp" | "out";
  onOpen: (task: Task, bucket: LearningBucket) => void;
  onSkip: (task: Task, bucket: LearningBucket) => void;
  /** First card in the Know column — board tour spotlights these regions */
  tourAnchor?: boolean;
}

export function TaskCard({
  task,
  competencyName,
  bucket,
  isCompleting,
  completePhase,
  onOpen,
  onSkip,
  tourAnchor = false,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <motion.article
      layout
      initial={{ y: 24, opacity: 0 }}
      animate={
        isCompleting && completePhase === "out"
          ? { y: -8, opacity: 0, scale: 0.96, rotate: -1 }
          : { y: 0, opacity: 1, scale: 1, rotate: 0 }
      }
      transition={
        isCompleting && completePhase === "out"
          ? { duration: 0.4, ease: "easeInOut" }
          : { type: "spring", stiffness: 420, damping: 32 }
      }
      className="relative flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-stone-200/90"
    >
      <AnimatePresence>
        {isCompleting && completePhase === "stamp" && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg"
              aria-hidden
            >
              ✓
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <img
          src={task.heroImageUrl}
          alt=""
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="absolute right-2 top-2">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label="Card options"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div
                id={menuId}
                role="menu"
                className="absolute right-0 mt-1 w-44 overflow-hidden rounded-xl bg-white py-1 text-left text-sm shadow-lg ring-1 ring-stone-200"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50"
                  onClick={() => {
                    setMenuOpen(false);
                    onSkip(task, bucket);
                  }}
                >
                  Skip for now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <span
          {...(tourAnchor ? { "data-tour-task-competency": "" } : {})}
          className={`inline-flex w-fit max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${competencyPillClasses(task.competencyId)}`}
        >
          {competencyName}
        </span>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-stone-900">{task.title}</h3>
        <div {...(tourAnchor ? { "data-tour-task-source": "" } : {})}>
          <SourceBadge source={task.source} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div
            {...(tourAnchor ? { "data-tour-task-xp": "" } : {})}
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-800"
          >
            <span aria-hidden>🪙</span>
            <span>+{task.xpOnComplete} XP</span>
          </div>
          <button
            {...(tourAnchor ? { "data-tour-task-cta": "" } : {})}
            type="button"
            onClick={() => onOpen(task, bucket)}
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
          >
            {task.ctaLabel}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
