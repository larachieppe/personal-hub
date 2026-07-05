import { useSyncExternalStore } from "react";
import type { DayMenu } from "@/lib/meals";
import { addDays, toDateString } from "@/lib/date-utils";

const STORAGE_KEY = "polymath-hub:meal-log";
const EMPTY_SET: ReadonlySet<string> = new Set();

type Listener = () => void;

let listeners: Listener[] = [];
let cache: ReadonlySet<string> | null = null;

function readFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function getSnapshot(): ReadonlySet<string> {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_SET;
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(next: Set<string>) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
  }
  listeners.forEach((listener) => listener());
}

export function mealKey(dateStr: string, mealId: string): string {
  return `${dateStr}/${mealId}`;
}

export function toggleMeal(dateStr: string, mealId: string) {
  const key = mealKey(dateStr, mealId);
  const next = new Set(getSnapshot());
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  persist(next);
}

export function useMealLog(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function exportMealLog(): string[] {
  return Array.from(getSnapshot());
}

export function replaceMealLog(next: string[]) {
  persist(new Set(next ?? []));
}

const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function menuForDate(days: DayMenu[], date: Date): DayMenu | undefined {
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return days.find((d) => d.day === weekday);
}

export function isDateFullyLogged(
  days: DayMenu[],
  completed: ReadonlySet<string>,
  date: Date
): boolean {
  const menu = menuForDate(days, date);
  if (!menu || menu.meals.length === 0) return false;
  const dateStr = toDateString(date);
  return menu.meals.every((meal) => completed.has(mealKey(dateStr, meal.id)));
}

export interface MealPlanStats {
  streak: number;
  totalDaysCompleted: number;
}

export function computeMealPlanStats(
  days: DayMenu[],
  completed: ReadonlySet<string>,
  today: Date
): MealPlanStats {
  let streak = 0;
  const yesterday = addDays(today, -1);
  const todayComplete = isDateFullyLogged(days, completed, today);
  const yesterdayComplete = isDateFullyLogged(days, completed, yesterday);

  if (todayComplete || yesterdayComplete) {
    let cursor = todayComplete ? today : yesterday;
    while (isDateFullyLogged(days, completed, cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  const dateStrs = new Set<string>();
  for (const key of completed) {
    const [dateStr] = key.split("/");
    dateStrs.add(dateStr);
  }

  let totalDaysCompleted = 0;
  for (const dateStr of dateStrs) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (isDateFullyLogged(days, completed, date)) totalDaysCompleted += 1;
  }

  return { streak, totalDaysCompleted };
}
