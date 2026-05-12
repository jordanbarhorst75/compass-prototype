import type { ColumnStateRecord, Educator } from "./types";

const PREFIX = "compass.";

export const STORAGE_KEYS = {
  onboardingComplete: `${PREFIX}onboardingComplete`,
  state: `${PREFIX}v3`,
} as const;

export const LEGACY_STATE_KEY_V1 = `${PREFIX}v1` as const;
export const LEGACY_STATE_KEY_V2 = `${PREFIX}v2` as const;

export interface PersistedAppState {
  educator: Educator;
  competencies: import("./types").Competency[];
  columns: ColumnStateRecord;
  xpHistory: import("./types").XPEvent[];
  engagementBadges: import("./types").EngagementBadge[];
}

export function loadPersisted(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.state);
  } catch {
    return null;
  }
}

/** Prefer v3; fall back to v2 then v1 once each, then remove legacy keys. */
export function loadPersistedWithLegacy(): string | null {
  const current = loadPersisted();
  if (current) return current;
  try {
    const v2 = localStorage.getItem(LEGACY_STATE_KEY_V2);
    if (v2) {
      localStorage.removeItem(LEGACY_STATE_KEY_V2);
      return v2;
    }
    const legacy = localStorage.getItem(LEGACY_STATE_KEY_V1);
    if (legacy) {
      localStorage.removeItem(LEGACY_STATE_KEY_V1);
      return legacy;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function savePersisted(json: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.state, json);
  } catch {
    /* ignore */
  }
}

export function loadOnboardingFlag(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.onboardingComplete) === "1";
  } catch {
    return false;
  }
}

export function saveOnboardingFlag(done: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.onboardingComplete, done ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function clearAllPersisted(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.state);
    localStorage.removeItem(STORAGE_KEYS.onboardingComplete);
    localStorage.removeItem(LEGACY_STATE_KEY_V1);
    localStorage.removeItem(LEGACY_STATE_KEY_V2);
  } catch {
    /* ignore */
  }
}
