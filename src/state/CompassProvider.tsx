import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  COLUMN_CAPS,
  type ColumnStateRecord,
  type Competency,
  type Educator,
  type EngagementBadge,
  type LearningBucket,
  type Task,
  type XPEvent,
} from "../domain/types";
import { completionBreakdown } from "../domain/completion";
import { deriveDemonstrationLevel } from "../domain/competencyProgress";
import {
  clearAllPersisted,
  loadOnboardingFlag,
  loadPersistedWithLegacy,
  saveOnboardingFlag,
  savePersisted,
  type PersistedAppState,
} from "../domain/persistence";
import { newEducatorXPAfterGain, xpProgressInLevel } from "../domain/xp";
import { normalizePersistedState } from "../data/normalizePersistedState";
import type { GuideTourId } from "../domain/guideTour";
import {
  getAchievementDef,
  mergeEarned,
  scanNewlyEarnedAchievementIds,
  type AchievementEvalContext,
} from "../data/achievements";
import {
  mayaEducator,
  partitionColumns,
  seedEngagementBadges,
  seedMayaCompetencies,
  seedTaskPool,
  seedXPHistory,
} from "../data/seed";

export interface CelebrationPayload {
  competencyName: string;
  totalXpGained: number;
  baseXp: number;
  milestoneXp: number;
  isNewCompetency: boolean;
  educatorLeveledUp: boolean;
  newEducatorLevel: number;
  newBadges: EngagementBadge[];
  priorCompetencyLevel: string | null;
  newCompetencyLevel: string | null;
  competencyDemonstrationLevelChanged: boolean;
  newTier2Achievements: { id: string; name: string }[];
  newTier3Achievements: { id: string; name: string }[];
  masteryUnlocked: boolean;
  compassCompleteUnlocked: boolean;
}

interface CompletingPayload {
  task: Task;
  bucket: LearningBucket;
}

interface CompassContextValue {
  educator: Educator;
  xpView: ReturnType<typeof xpProgressInLevel>;
  competencies: Competency[];
  columns: ColumnStateRecord;
  xpHistory: XPEvent[];
  engagementBadges: EngagementBadge[];
  onboardingComplete: boolean;
  activeTour: GuideTourId | null;
  startGuideTour: (id: GuideTourId) => void;
  endGuideTour: () => void;
  completing: CompletingPayload | null;
  celebration: CelebrationPayload | null;
  activeActivityTask: Task | null;
  activityBucket: LearningBucket | null;
  finishOnboarding: () => void;
  skipOnboarding: () => void;
  startActivity: (task: Task, bucket: LearningBucket) => void;
  clearActivity: () => void;
  beginComplete: (task: Task, bucket: LearningBucket) => void;
  finalizeComplete: () => void;
  dismissCelebration: () => void;
  skipTask: (bucket: LearningBucket, taskId: string) => void;
  resetDemo: () => void;
  showDemoCelebration: (payload: CelebrationPayload) => void;
}

const CompassContext = createContext<CompassContextValue | null>(null);

function emptyCelebration(prevLevel: number): CelebrationPayload {
  return {
    competencyName: "",
    totalXpGained: 0,
    baseXp: 0,
    milestoneXp: 0,
    isNewCompetency: false,
    educatorLeveledUp: false,
    newEducatorLevel: prevLevel,
    newBadges: [],
    priorCompetencyLevel: null,
    newCompetencyLevel: null,
    competencyDemonstrationLevelChanged: false,
    newTier2Achievements: [],
    newTier3Achievements: [],
    masteryUnlocked: false,
    compassCompleteUnlocked: false,
  };
}

function syncEducatorLevel(ed: Educator): Educator {
  const { level } = xpProgressInLevel(ed.currentXP);
  return { ...ed, level };
}

function buildFreshState(): PersistedAppState {
  const pool = seedTaskPool();
  const columns = partitionColumns(pool);
  const educator = syncEducatorLevel(mayaEducator());
  return {
    educator,
    competencies: seedMayaCompetencies(),
    columns,
    xpHistory: seedXPHistory(educator.id),
    engagementBadges: seedEngagementBadges(),
  };
}

function pullNextIntoColumn(bucket: LearningBucket, cols: ColumnStateRecord): ColumnStateRecord {
  const col = cols[bucket];
  const max = COLUMN_CAPS[bucket];
  if (col.active.length >= max) return cols;
  if (col.queue.length === 0) return cols;
  const [next, ...rest] = col.queue;
  return {
    ...cols,
    [bucket]: { active: [...col.active, next!], queue: rest },
  };
}

function applyTaskCompletion(
  prev: PersistedAppState,
  task: Task,
  bucket: LearningBucket,
): { next: PersistedAppState; celebration: CelebrationPayload } {
  const comp = prev.competencies.find((c) => c.id === task.competencyId);
  if (!comp) {
    return { next: prev, celebration: emptyCelebration(prev.educator.level) };
  }

  const priorDemoLevel = deriveDemonstrationLevel(comp.demonstrationCount, comp.demonstrationDates);
  const nextCount = comp.demonstrationCount + 1;
  const nextDates = [...comp.demonstrationDates, new Date().toISOString()].slice(-120);
  const nextDemoLevel = deriveDemonstrationLevel(nextCount, nextDates);
  const competencyDemonstrationLevelChanged = priorDemoLevel !== nextDemoLevel;

  const uploadsBefore = prev.educator.totalUploads;
  const { baseXp, milestoneXp, newlyEarnedBadges, competencyFirstEarn } = completionBreakdown({
    competency: comp,
    task,
    uploadsCompletedBefore: uploadsBefore,
    badges: prev.engagementBadges,
  });

  const totalGain = baseXp + milestoneXp;
  const { leveledUp, newLevel, newTotal } = newEducatorXPAfterGain(prev.educator, totalGain);

  let nextUploads = uploadsBefore;
  let nextRecent = prev.educator.recentUploadFocusTags;
  let nextDistinct = prev.educator.distinctUploadFocusTags;
  if (task.ctaLabel === "Upload") {
    nextUploads = uploadsBefore + 1;
    const tag = task.competencyId;
    nextRecent = [...prev.educator.recentUploadFocusTags, tag].slice(-10);
    nextDistinct = [...new Set([...prev.educator.distinctUploadFocusTags, tag])];
  }

  const newCompetencies = prev.competencies.map((c) =>
    c.id === comp.id ? { ...c, demonstrationCount: nextCount, demonstrationDates: nextDates } : c,
  );

  const engagementBadges = prev.engagementBadges.map((b) =>
    newlyEarnedBadges.some((n) => n.id === b.id) ? { ...b, earned: true } : b,
  );

  const col = prev.columns[bucket];
  const active = col.active.filter((t) => t.id !== task.id);
  const cols: ColumnStateRecord = { ...prev.columns, [bucket]: { ...col, active } };
  const afterPull = pullNextIntoColumn(bucket, cols);

  const xpEvent: XPEvent = {
    id: `xp-${Date.now()}`,
    educatorId: prev.educator.id,
    taskId: task.id,
    competencyId: task.competencyId,
    xpAmount: totalGain,
    isNew: competencyFirstEarn,
    timestamp: Date.now(),
    activityLabel: task.title,
    taskSource: task.source,
  };

  const historyPrime = [xpEvent, ...prev.xpHistory].slice(0, 25);

  const educatorDraft: Educator = {
    ...prev.educator,
    currentXP: newTotal,
    level: newLevel,
    totalUploads: nextUploads,
    recentUploadFocusTags: nextRecent,
    distinctUploadFocusTags: nextDistinct,
  };

  const evalCtx: AchievementEvalContext = {
    educator: educatorDraft,
    competencies: newCompetencies,
    columns: afterPull,
    xpHistory: historyPrime,
  };

  const prevEarned = new Set(prev.educator.earnedAchievements.map((e) => e.id));
  const newIds = scanNewlyEarnedAchievementIds(prevEarned, evalCtx);
  const at = Date.now();
  const earnedAchievements = mergeEarned(
    prev.educator.earnedAchievements,
    newIds.map((id) => ({ id, earnedAt: at })),
  );

  const educator = syncEducatorLevel({ ...educatorDraft, earnedAchievements });

  const newTier2: { id: string; name: string }[] = [];
  const newTier3: { id: string; name: string }[] = [];
  for (const id of newIds) {
    const def = getAchievementDef(id);
    if (!def) continue;
    if (def.tier === 2) newTier2.push({ id, name: def.name });
    if (def.tier === 3) newTier3.push({ id, name: def.name });
  }

  const next: PersistedAppState = {
    ...prev,
    educator,
    competencies: newCompetencies,
    columns: afterPull,
    xpHistory: historyPrime,
    engagementBadges,
  };

  return {
    next,
    celebration: {
      competencyName: comp.name,
      totalXpGained: totalGain,
      baseXp,
      milestoneXp,
      isNewCompetency: competencyFirstEarn,
      educatorLeveledUp: leveledUp,
      newEducatorLevel: newLevel,
      newBadges: newlyEarnedBadges,
      priorCompetencyLevel: priorDemoLevel,
      newCompetencyLevel: nextDemoLevel,
      competencyDemonstrationLevelChanged,
      newTier2Achievements: newTier2,
      newTier3Achievements: newTier3,
      masteryUnlocked: nextDemoLevel === "Mastery" && priorDemoLevel !== "Mastery",
      compassCompleteUnlocked: newIds.includes("compass_complete"),
    },
  };
}

export function CompassProvider({ children }: { children: ReactNode }) {
  const [onboardingComplete, setOnboardingComplete] = useState(() => loadOnboardingFlag());
  const [activeTour, setActiveTour] = useState<GuideTourId | null>(() => (!loadOnboardingFlag() ? "board" : null));
  const [state, setState] = useState<PersistedAppState>(() => {
    const raw = loadPersistedWithLegacy();
    if (raw) {
      try {
        const normalized = normalizePersistedState(JSON.parse(raw) as unknown);
        if (normalized) return normalized;
      } catch {
        /* fallthrough */
      }
    }
    return buildFreshState();
  });

  const [completing, setCompleting] = useState<CompletingPayload | null>(null);
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);
  const [activeActivityTask, setActiveActivityTask] = useState<Task | null>(null);
  const [activityBucket, setActivityBucket] = useState<LearningBucket | null>(null);
  const pendingFinalize = useRef<CompletingPayload | null>(null);

  useEffect(() => {
    savePersisted(JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    saveOnboardingFlag(onboardingComplete);
  }, [onboardingComplete]);

  const finishOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    setActiveTour(null);
  }, []);

  const skipOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    setActiveTour(null);
  }, []);

  const startGuideTour = useCallback((id: GuideTourId) => {
    setActiveTour(id);
  }, []);

  const endGuideTour = useCallback(() => {
    setActiveTour(null);
  }, []);

  const resetDemo = useCallback(() => {
    clearAllPersisted();
    setState(buildFreshState());
    setOnboardingComplete(false);
    setActiveTour("board");
    setCompleting(null);
    setCelebration(null);
    setActiveActivityTask(null);
    setActivityBucket(null);
    pendingFinalize.current = null;
  }, []);

  const skipTask = useCallback((bucket: LearningBucket, taskId: string) => {
    setState((prev) => {
      const col = prev.columns[bucket];
      const active = col.active.filter((t) => t.id !== taskId);
      const cols: ColumnStateRecord = { ...prev.columns, [bucket]: { ...col, active } };
      return { ...prev, columns: pullNextIntoColumn(bucket, cols) };
    });
  }, []);

  const startActivity = useCallback((task: Task, bucket: LearningBucket) => {
    setActiveActivityTask(task);
    setActivityBucket(bucket);
  }, []);

  const clearActivity = useCallback(() => {
    setActiveActivityTask(null);
    setActivityBucket(null);
  }, []);

  const beginComplete = useCallback((task: Task, bucket: LearningBucket) => {
    pendingFinalize.current = { task, bucket };
    setCompleting({ task, bucket });
    setActiveActivityTask(null);
    setActivityBucket(null);
  }, []);

  const finalizeComplete = useCallback(() => {
    const payload = pendingFinalize.current;
    pendingFinalize.current = null;
    if (!payload) return;

    const { task, bucket } = payload;
    let nextCelebration: CelebrationPayload | null = null;
    setState((prev) => {
      const { next, celebration } = applyTaskCompletion(prev, task, bucket);
      nextCelebration = celebration;
      return next;
    });
    if (nextCelebration) setCelebration(nextCelebration);
    setCompleting(null);
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const showDemoCelebration = useCallback((payload: CelebrationPayload) => {
    setCelebration(payload);
  }, []);

  const educator = syncEducatorLevel(state.educator);
  const xpView = xpProgressInLevel(educator.currentXP);

  const value = useMemo<CompassContextValue>(
    () => ({
      educator,
      xpView,
      competencies: state.competencies,
      columns: state.columns,
      xpHistory: state.xpHistory,
      engagementBadges: state.engagementBadges,
      onboardingComplete,
      activeTour,
      startGuideTour,
      endGuideTour,
      completing,
      celebration,
      activeActivityTask,
      activityBucket,
      finishOnboarding,
      skipOnboarding,
      startActivity,
      clearActivity,
      beginComplete,
      finalizeComplete,
      dismissCelebration,
      skipTask,
      resetDemo,
      showDemoCelebration,
    }),
    [
      educator,
      xpView,
      state.competencies,
      state.columns,
      state.xpHistory,
      state.engagementBadges,
      onboardingComplete,
      activeTour,
      startGuideTour,
      endGuideTour,
      completing,
      celebration,
      activeActivityTask,
      activityBucket,
      finishOnboarding,
      skipOnboarding,
      startActivity,
      clearActivity,
      beginComplete,
      finalizeComplete,
      dismissCelebration,
      skipTask,
      resetDemo,
      showDemoCelebration,
    ],
  );

  return <CompassContext.Provider value={value}>{children}</CompassContext.Provider>;
}

export function useCompass(): CompassContextValue {
  const ctx = useContext(CompassContext);
  if (!ctx) throw new Error("useCompass must be used within CompassProvider");
  return ctx;
}
