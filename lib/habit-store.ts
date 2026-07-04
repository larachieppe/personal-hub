import { useSyncExternalStore } from "react";
import { addDays, toDateString } from "@/lib/date-utils";

const STORAGE_KEY = "polymath-hub:habit-log";
const EMPTY_LOG: Readonly<Record<string, string[]>> = {};

type HabitLog = Record<string, string[]>;
type Listener = () => void;

let listeners: Listener[] = [];
let cache: HabitLog | null = null;

function readFromStorage(): HabitLog {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HabitLog) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): HabitLog {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): HabitLog {
  return EMPTY_LOG;
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(next: HabitLog) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export function toggleHabitToday(habitId: string) {
  const today = toDateString(new Date());
  const current = getSnapshot();
  const dates = new Set(current[habitId] ?? []);
  if (dates.has(today)) {
    dates.delete(today);
  } else {
    dates.add(today);
  }
  persist({ ...current, [habitId]: Array.from(dates) });
}

export function useHabitLog(): HabitLog {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function exportHabitLog(): HabitLog {
  return getSnapshot();
}

export function replaceHabitLog(next: HabitLog) {
  persist(next ?? {});
}

export interface HabitStats {
  streak: number;
  total: number;
  isDoneToday: boolean;
  last7Days: boolean[];
}

export function computeHabitStats(dates: string[]): HabitStats {
  const set = new Set(dates);
  const today = new Date();
  const todayStr = toDateString(today);
  const yesterdayStr = toDateString(addDays(today, -1));

  let streak = 0;
  if (set.has(todayStr) || set.has(yesterdayStr)) {
    let cursor = set.has(todayStr) ? today : addDays(today, -1);
    while (set.has(toDateString(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  const last7Days: boolean[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    last7Days.push(set.has(toDateString(addDays(today, -i))));
  }

  return {
    streak,
    total: set.size,
    isDoneToday: set.has(todayStr),
    last7Days,
  };
}

export interface HeatmapDay {
  date: string;
  done: boolean;
}

export function computeHeatmap(dates: string[], weeks = 52): HeatmapDay[][] {
  const set = new Set(dates);
  const today = new Date();
  const totalDays = weeks * 7;
  const days: HeatmapDay[] = [];
  for (let i = totalDays - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    const dateStr = toDateString(date);
    days.push({ date: dateStr, done: set.has(dateStr) });
  }

  const weekColumns: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekColumns.push(days.slice(i, i + 7));
  }
  return weekColumns;
}

const STREAK_MILESTONES: { threshold: number; label: string }[] = [
  { threshold: 365, label: "Year Streak" },
  { threshold: 100, label: "Century Streak" },
  { threshold: 30, label: "Month Streak" },
  { threshold: 7, label: "Week Streak" },
];

export function getStreakMilestone(streak: number): string | null {
  const hit = STREAK_MILESTONES.find((m) => streak >= m.threshold);
  return hit ? hit.label : null;
}
