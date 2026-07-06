import { useSyncExternalStore } from "react";

const STORAGE_KEY = "polymath-hub:plan-assignments";
const EMPTY_ASSIGNMENTS: Readonly<Record<string, string[]>> = {};

export type PlanAssignments = Record<string, string[]>;

type Listener = () => void;

let listeners: Listener[] = [];
let cache: PlanAssignments | null = null;

function readFromStorage(): PlanAssignments {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlanAssignments) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): PlanAssignments {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): PlanAssignments {
  return EMPTY_ASSIGNMENTS;
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(next: PlanAssignments) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export function usePlanAssignments(): PlanAssignments {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function exportPlanAssignments(): PlanAssignments {
  return getSnapshot();
}

export function replacePlanAssignments(next: PlanAssignments) {
  persist(next ?? {});
}

/**
 * For each given date, ensures it has an "active" (not yet completed/discarded)
 * assignment, pulling the next candidate from `eligiblePool` (already in
 * sequence order — see getNextResources). A resource already pending on
 * another date this week is skipped so it isn't suggested twice at once.
 * Completed/discarded history is left in place; this only ever appends.
 */
export function ensureAssignments(
  dateStrs: string[],
  eligiblePool: { key: string }[],
  completed: ReadonlySet<string>,
  discarded: ReadonlySet<string>
) {
  const current = getSnapshot();
  const next: PlanAssignments = { ...current };
  let changed = false;

  const pendingElsewhere = new Set<string>();
  for (const dateStr of dateStrs) {
    for (const key of next[dateStr] ?? []) {
      if (!completed.has(key) && !discarded.has(key)) pendingElsewhere.add(key);
    }
  }

  let poolIndex = 0;
  for (const dateStr of dateStrs) {
    const list = next[dateStr] ?? [];
    const last = list[list.length - 1];
    const needsNew = list.length === 0 || completed.has(last) || discarded.has(last);
    if (!needsNew) continue;

    while (poolIndex < eligiblePool.length) {
      const candidate = eligiblePool[poolIndex];
      poolIndex += 1;
      if (pendingElsewhere.has(candidate.key) || list.includes(candidate.key)) continue;
      next[dateStr] = [...list, candidate.key];
      pendingElsewhere.add(candidate.key);
      changed = true;
      break;
    }
  }

  if (changed) persist(next);
}
