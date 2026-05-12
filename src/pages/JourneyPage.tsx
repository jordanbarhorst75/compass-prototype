import { useMemo, useRef, useState } from "react";
import {
  CLASS_DIMENSIONS,
  type ClassDimensionId,
  classDimensionForCompetency,
  classDimensionsByDomain,
} from "../data/classDimensions";
import {
  buildJourneyWindowsFromTimeline,
  formalBookendLayout,
  isDateInInclusiveWindow,
} from "../data/journeyWindows";
import { seedTimeline } from "../data/seed";
import { categoryTileClasses } from "../domain/competencyColors";
import type { TaskSource, TimelineEvent } from "../domain/types";
import { sourceLabel } from "../lib/sourceIcons";
import { JourneyTour } from "../components/JourneyTour";
import { useCompass } from "../state/CompassProvider";

type ActivityEvent = TimelineEvent & { type: "activity" };

function competencyInitial(name: string | undefined): string {
  const t = (name ?? "?").trim();
  if (!t) return "?";
  return t.charAt(0).toUpperCase();
}

function summarizeFiltered(acts: ActivityEvent[]) {
  const xp = acts.reduce((s, e) => s + (e.xpGained ?? 0), 0);
  const comps = new Set(acts.map((e) => e.competencyId).filter(Boolean));
  const days = new Set(acts.map((e) => e.date));
  return {
    totalXp: xp,
    competencies: comps.size,
    activities: acts.length,
    daysActive: days.size,
  };
}

/** SVG viewBox 0–100: x spans chart width; y uses bottom-heavy layout (first step bottom-left). */
function ladderNodeSvg(rows: { cumulativeXp: number }[], index: number): { x: number; y: number } {
  const n = rows.length;
  if (n === 0) return { x: 50, y: 88 };
  if (n === 1) return { x: 6, y: 88 };
  const x = 6 + (index / (n - 1)) * 88;
  const minC = rows[0]!.cumulativeXp;
  const maxC = rows[n - 1]!.cumulativeXp;
  const span = Math.max(1e-6, maxC - minC);
  const yFrac = (rows[index]!.cumulativeXp - minC) / span;
  const y = 88 - yFrac * 72;
  return { x, y };
}

/** Points per activity for callout (trim trailing zeros). */
function formatPerActivityPoints(delta: number, count: number): string {
  if (count <= 0) return "";
  const v = delta / count;
  const t = Math.round(v * 1000) / 1000;
  return String(t).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function FormalBookend({
  fo,
  dimensionLabel,
  score,
  align,
}: {
  fo: TimelineEvent & { type: "formalObs" };
  dimensionLabel: string;
  score: number | null | undefined;
  align: "start" | "end";
}) {
  const end = align === "end";
  return (
    <aside
      className={`flex w-full shrink-0 flex-col gap-2 sm:max-w-[13rem] ${end ? "items-end self-center text-right lg:max-w-[14rem]" : "items-start self-center text-left lg:max-w-[14rem]"}`}
      aria-label={`${fo.activityName ?? "Formal observation"}, ${dimensionLabel}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Formal CLASS</span>
      <h3 className={`text-sm font-bold leading-snug text-stone-900 ${end ? "text-right" : ""}`}>
        {fo.activityName ?? "Formal observation"}
      </h3>
      <p className={`text-xs font-medium leading-snug text-stone-600 ${end ? "text-right" : ""}`}>{dimensionLabel}</p>
      <div
        className={`mt-1 w-full max-w-[11.5rem] rounded-2xl bg-gradient-to-br from-violet-600 to-violet-900 px-4 py-4 shadow-xl ring-2 ring-violet-400/50 ${end ? "ml-auto" : ""}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-100/90">Dimension score</p>
        <p className="mt-1 text-5xl font-black tabular-nums leading-none tracking-tight text-white">
          {score != null ? score : "—"}
        </p>
      </div>
    </aside>
  );
}

function LadderPoint({
  letter,
  tileClasses,
  tooltipLines,
}: {
  letter: string;
  tileClasses: string;
  tooltipLines: string[];
}) {
  return (
    <div className="group relative z-20 flex h-10 w-10 shrink-0 items-center justify-center outline-none">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white shadow-md ${tileClasses}`}
        tabIndex={0}
      >
        {letter}
      </div>
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-[60] mb-2 w-56 -translate-x-1/2 rounded-xl bg-stone-900 px-3 py-2 text-left text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {tooltipLines.map((line, i) => (
          <p key={i} className={i > 0 ? "mt-1.5 text-stone-300" : "font-semibold text-white"}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export function JourneyPage() {
  const { competencies } = useCompass();
  const journeyTourRef = useRef<HTMLDivElement>(null);
  const events = useMemo(() => seedTimeline(), []);
  const windows = useMemo(() => buildJourneyWindowsFromTimeline(events), [events]);
  const preferredWindowId = useMemo(
    () => windows.find((w) => w.id.startsWith("between-"))?.id ?? windows[0]?.id ?? "all",
    [windows],
  );
  const [windowId, setWindowId] = useState("");
  const resolvedWindowId = windowId || preferredWindowId;
  const activeWindow = windows.find((w) => w.id === resolvedWindowId) ?? windows[0];

  const [dimension, setDimension] = useState<ClassDimensionId>("positive_climate");

  const competencyById = useMemo(() => new Map(competencies.map((c) => [c.id, c])), [competencies]);

  const formalById = useMemo(() => {
    const formal = events.filter((e): e is TimelineEvent & { type: "formalObs" } => e.type === "formalObs");
    return new Map(formal.map((e) => [e.id, e] as const));
  }, [events]);

  const filteredActivities = useMemo(() => {
    if (!activeWindow) return [];
    const acts = events.filter((e): e is ActivityEvent => e.type === "activity");
    return acts
      .filter((e) => isDateInInclusiveWindow(e.date, activeWindow.startDate, activeWindow.endDate))
      .filter((e) => classDimensionForCompetency(e.competencyId) === dimension)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, activeWindow, dimension]);

  const stats = useMemo(() => summarizeFiltered(filteredActivities), [filteredActivities]);

  const ladder = useMemo(() => {
    let cum = 0;
    return filteredActivities.map((e) => {
      cum += e.xpGained ?? 0;
      const comp = e.competencyId ? competencyById.get(e.competencyId) : undefined;
      return {
        event: e,
        cumulativeXp: cum,
        competencyName: comp?.name,
        colorToken: comp?.color ?? "connect",
        letter: competencyInitial(comp?.name),
      };
    });
  }, [filteredActivities, competencyById]);

  const cumRows = useMemo(() => ladder.map((r) => ({ cumulativeXp: r.cumulativeXp })), [ladder]);

  const polylinePoints = useMemo(() => {
    if (ladder.length < 2) return "";
    return ladder
      .map((_, i) => {
        const { x, y } = ladderNodeSvg(cumRows, i);
        return `${x},${y}`;
      })
      .join(" ");
  }, [ladder, cumRows]);

  const dimMeta = CLASS_DIMENSIONS.find((d) => d.id === dimension);

  const { leftFormalId, rightFormalId } = useMemo(() => {
    if (!activeWindow) return { leftFormalId: null as string | null, rightFormalId: null as string | null };
    return formalBookendLayout(activeWindow);
  }, [activeWindow]);

  const leftFo = leftFormalId ? formalById.get(leftFormalId) : undefined;
  const rightFo = rightFormalId ? formalById.get(rightFormalId) : undefined;

  const classScoreInsight = useMemo(() => {
    if (!leftFo || !rightFo) return null;
    const s1 = leftFo.classDimensionScores?.[dimension];
    const s2 = rightFo.classDimensionScores?.[dimension];
    if (typeof s1 !== "number" || typeof s2 !== "number") return null;
    const dimLabel = dimMeta?.label ?? "this dimension";
    const n = filteredActivities.length;
    const delta = s2 - s1;
    const actWord = n === 1 ? "activity" : "activities";

    if (n === 0) {
      if (delta === 0) {
        return `No activities are logged for ${dimLabel} in this window. Your formal CLASS score for this dimension was ${s1} at both observations.`;
      }
      return `No activities are logged for ${dimLabel} in this window. Your CLASS score still moved from ${s1} to ${s2} between these formals — rubric scores reflect the full lesson, not just Compass completions.`;
    }

    const perStr = formatPerActivityPoints(delta, n);
    if (delta > 0) {
      return `You completed ${n} ${actWord} in this window. Your CLASS score for ${dimLabel} improved by ${delta} (from ${s1} to ${s2}), so each activity here lines up with about ${perStr} points of that increase on average between these two formal observations.`;
    }
    if (delta < 0) {
      return `You completed ${n} ${actWord} for ${dimLabel} between these formals, while your CLASS score on the rubric went from ${s1} to ${s2}. Formal observations capture the whole classroom context, not individual completions alone.`;
    }
    return `You completed ${n} ${actWord} for ${dimLabel}; your CLASS score held steady at ${s1} across both formal observations.`;
  }, [leftFo, rightFo, dimension, dimMeta, filteredActivities.length]);

  return (
    <div ref={journeyTourRef} className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-stone-200 bg-[var(--color-compass-surface)] px-4 py-3 sm:px-5" data-tour-journey-header>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">Journey</h1>
        <p className="mt-1 max-w-3xl text-xs leading-snug text-stone-600 sm:text-[13px] sm:leading-snug">
          Choose a window and CLASS dimension — scores, stats, and activities below follow your selection.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
          <div className="min-w-0" data-tour-journey-window>
            <label htmlFor="journey-window" className="text-[11px] font-medium text-stone-500">
              Window
            </label>
            <select
              id="journey-window"
              className="mt-0.5 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-900 shadow-sm"
              value={resolvedWindowId}
              onChange={(ev) => setWindowId(ev.target.value)}
              title={activeWindow?.label}
            >
              {windows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
            {activeWindow && (
              <p className="mt-0.5 text-[10px] text-stone-500 tabular-nums">
                {activeWindow.startDate} — {activeWindow.endDate}
              </p>
            )}
          </div>

          <div className="min-w-0" data-tour-journey-dimension>
            <label htmlFor="journey-class-dimension" className="text-[11px] font-medium text-stone-500">
              CLASS dimension
            </label>
            <select
              id="journey-class-dimension"
              className="mt-0.5 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-900 shadow-sm"
              value={dimension}
              onChange={(e) => setDimension(e.target.value as ClassDimensionId)}
            >
              {classDimensionsByDomain().map(({ domain, dimensions }) => (
                <optgroup key={domain} label={domain}>
                  {dimensions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="mx-auto max-w-6xl">
          <section
            data-tour-journey-ladder
            className="overflow-visible rounded-3xl bg-gradient-to-b from-stone-50 to-amber-50/50 p-4 ring-1 ring-amber-200/40 sm:p-6"
            aria-labelledby="growth-ladder-heading"
          >
            <h2 id="growth-ladder-heading" className="text-base font-semibold text-stone-800">
              Growth ladder
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {dimMeta?.description} Each marker is cumulative XP in this window for competencies tied to{" "}
              <span className="font-medium text-stone-800">{dimMeta?.label ?? "this dimension"}</span>.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" data-tour-journey-stats>
              <div className="rounded-2xl bg-white/75 p-3 ring-1 ring-amber-200/50 backdrop-blur-[2px]">
                <p className="text-xs text-stone-500">XP in this view</p>
                <p className="mt-1 text-xl font-bold text-stone-900">{stats.totalXp}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-3 ring-1 ring-amber-200/50 backdrop-blur-[2px]">
                <p className="text-xs text-stone-500">Competencies touched</p>
                <p className="mt-1 text-xl font-bold text-stone-900">{stats.competencies}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-3 ring-1 ring-amber-200/50 backdrop-blur-[2px]">
                <p className="text-xs text-stone-500">Activities</p>
                <p className="mt-1 text-xl font-bold text-stone-900">{stats.activities}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-3 ring-1 ring-amber-200/50 backdrop-blur-[2px]">
                <p className="text-xs text-stone-500">Days active</p>
                <p className="mt-1 text-xl font-bold text-stone-900">{stats.daysActive}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-6">
              {leftFo ? (
                <FormalBookend
                  fo={leftFo}
                  dimensionLabel={dimMeta?.label ?? dimension}
                  score={leftFo.classDimensionScores?.[dimension]}
                  align="start"
                />
              ) : (
                <div className="hidden shrink-0 lg:block lg:w-2" aria-hidden />
              )}

              <div
                className={`relative z-10 min-h-[14rem] min-w-0 flex-1 overflow-visible rounded-2xl bg-white/60 p-3 pt-6 ring-1 ring-amber-100/80 lg:min-h-[15rem] ${ladder.length > 24 ? "min-h-[16rem]" : ""}`}
              >
                {!activeWindow ? null : ladder.length === 0 ? (
                  <p className="flex min-h-[12rem] items-center justify-center px-4 text-center text-sm text-stone-500">
                    No activities in this window for {dimMeta?.label ?? "this dimension"}. Try another window or
                    dimension.
                  </p>
                ) : (
                  <div className={`relative w-full ${ladder.length > 24 ? "h-64" : "h-56"}`}>
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id="journeyLine" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#d97706" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
                        </linearGradient>
                      </defs>
                      <line
                        x1="6"
                        y1="92"
                        x2="94"
                        y2="92"
                        stroke="#e7e5e4"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                      />
                      {polylinePoints ? (
                        <polyline
                          fill="none"
                          stroke="url(#journeyLine)"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={polylinePoints}
                          vectorEffect="non-scaling-stroke"
                        />
                      ) : null}
                    </svg>

                    <div className="pointer-events-none absolute inset-0">
                      {ladder.map((row, i) => {
                        const { x, y } = ladderNodeSvg(cumRows, i);
                        const src = row.event.source as TaskSource | undefined;
                        const tooltipLines = [
                          row.event.activityName ?? "Activity",
                          row.competencyName ?? "Competency",
                          `+${row.event.xpGained ?? 0} XP · ${row.event.date}`,
                          src ? sourceLabel(src) : "",
                        ].filter(Boolean);
                        return (
                          <div
                            key={row.event.id}
                            className="pointer-events-auto absolute"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <LadderPoint
                              letter={row.letter}
                              tileClasses={categoryTileClasses(row.colorToken)}
                              tooltipLines={tooltipLines}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {rightFo ? (
                <FormalBookend
                  fo={rightFo}
                  dimensionLabel={dimMeta?.label ?? dimension}
                  score={rightFo.classDimensionScores?.[dimension]}
                  align="end"
                />
              ) : (
                <div className="hidden shrink-0 lg:block lg:w-2" aria-hidden />
              )}
            </div>

            {classScoreInsight ? (
              <div
                className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-100/35 px-4 py-3 text-sm leading-relaxed text-stone-800 ring-1 ring-amber-200/40"
                role="note"
              >
                <p className="font-medium">{classScoreInsight}</p>
              </div>
            ) : null}

            <div className="mt-10 border-t border-amber-200/50 pt-8">
              <h3 id="activity-table-heading" className="text-base font-semibold text-stone-800">
                Activities
              </h3>
              <div className="mt-3 overflow-x-auto rounded-2xl bg-white/60 ring-1 ring-amber-100/80" data-tour-journey-activities>
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-amber-50/80 text-xs font-semibold uppercase tracking-wide text-stone-500">
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Competency</th>
                      <th className="px-4 py-3">Assigned by</th>
                      <th className="px-4 py-3 text-right">XP</th>
                      <th className="px-4 py-3">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                          No rows for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((e) => {
                        const comp = e.competencyId ? competencyById.get(e.competencyId) : undefined;
                        const src = e.source as TaskSource | undefined;
                        return (
                          <tr key={e.id} className="border-t border-amber-100/90 bg-white/50 hover:bg-white/90">
                            <td className="px-4 py-3 font-medium text-stone-900">{e.activityName}</td>
                            <td className="px-4 py-3 text-stone-700">{comp?.name ?? "—"}</td>
                            <td className="px-4 py-3 text-stone-600">{src ? sourceLabel(src) : "—"}</td>
                            <td className="px-4 py-3 text-right font-semibold text-amber-800">+{e.xpGained ?? 0}</td>
                            <td className="px-4 py-3 text-stone-600">{e.date}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
      <JourneyTour journeyRootRef={journeyTourRef} />
    </div>
  );
}
