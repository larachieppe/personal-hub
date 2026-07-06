import { useSyncExternalStore } from "react";
import type { DayMenu, Meal } from "@/lib/meals";
import { addDays, toDateString } from "@/lib/date-utils";

const STORAGE_KEY = "polymath-hub:meal-log";
const OVERRIDES_KEY = "polymath-hub:meal-plan-overrides";
const GOAL_KEY = "polymath-hub:meal-calorie-goal-override";
const EMPTY_SET: ReadonlySet<string> = new Set();
const EMPTY_OVERRIDES: Readonly<Record<string, MealOverride>> = {};

export interface MealOverride {
  name?: string;
  calories?: number;
}

type Listener = () => void;
type Overrides = Record<string, MealOverride>;

let listeners: Listener[] = [];
let cache: ReadonlySet<string> | null = null;
let overridesCache: Readonly<Overrides> | null = null;
let goalCache: number | null | undefined;

function readFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function normalizeOverride(raw: unknown): MealOverride {
  if (typeof raw === "string") return { name: raw };
  if (raw && typeof raw === "object") return raw as MealOverride;
  return {};
}

function readOverridesFromStorage(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const normalized: Overrides = {};
    for (const key of Object.keys(parsed)) {
      normalized[key] = normalizeOverride(parsed[key]);
    }
    return normalized;
  } catch {
    return {};
  }
}

function readGoalFromStorage(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GOAL_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function getSnapshot(): ReadonlySet<string> {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_SET;
}

function getOverridesSnapshot(): Readonly<Overrides> {
  if (overridesCache === null) overridesCache = readOverridesFromStorage();
  return overridesCache;
}

function getServerOverridesSnapshot(): Readonly<Overrides> {
  return EMPTY_OVERRIDES;
}

function getGoalSnapshot(): number | null {
  if (goalCache === undefined) goalCache = readGoalFromStorage();
  return goalCache;
}

function getServerGoalSnapshot(): number | null {
  return null;
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

function persistOverrides(next: Overrides) {
  overridesCache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function persistGoal(value: number | null) {
  goalCache = value;
  if (typeof window !== "undefined") {
    if (value === null) {
      window.localStorage.removeItem(GOAL_KEY);
    } else {
      window.localStorage.setItem(GOAL_KEY, String(value));
    }
  }
  listeners.forEach((listener) => listener());
}

export function overrideKey(day: string, mealId: string): string {
  return `${day}/${mealId}`;
}

export function setMealOverride(day: string, mealId: string, patch: Partial<MealOverride>) {
  const key = overrideKey(day, mealId);
  const overrides = { ...getOverridesSnapshot() };
  const current = { ...(overrides[key] ?? {}) };

  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    if (trimmed) current.name = trimmed;
    else delete current.name;
  }
  if (patch.calories !== undefined) {
    if (Number.isFinite(patch.calories) && (patch.calories as number) > 0) {
      current.calories = patch.calories;
    } else {
      delete current.calories;
    }
  }

  if (Object.keys(current).length === 0) {
    delete overrides[key];
  } else {
    overrides[key] = current;
  }
  persistOverrides(overrides);
}

export function clearMealOverrides() {
  persistOverrides({});
}

export function useMealOverrides(): Readonly<Overrides> {
  return useSyncExternalStore(subscribe, getOverridesSnapshot, getServerOverridesSnapshot);
}

export function exportMealOverrides(): Overrides {
  return { ...getOverridesSnapshot() };
}

export function replaceMealOverrides(next: Overrides) {
  persistOverrides(next ?? {});
}

export interface ResolvedMeal {
  name: string;
  calories: number;
}

export function resolveMeal(
  day: string,
  meal: Meal,
  overrides: Readonly<Overrides>
): ResolvedMeal {
  const override = overrides[overrideKey(day, meal.id)];
  return {
    name: override?.name ?? meal.name,
    calories: override?.calories ?? meal.calories,
  };
}

export function setDailyGoalOverride(value: number) {
  if (Number.isFinite(value) && value > 0) {
    persistGoal(Math.round(value));
  }
}

export function clearDailyGoalOverride() {
  persistGoal(null);
}

export function useDailyGoalOverride(): number | null {
  return useSyncExternalStore(subscribe, getGoalSnapshot, getServerGoalSnapshot);
}

export function exportDailyGoalOverride(): number | null {
  return getGoalSnapshot();
}

export function replaceDailyGoalOverride(value: number | null) {
  persistGoal(value ?? null);
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

export function countFullyLoggedDaysInRange(
  days: DayMenu[],
  completed: ReadonlySet<string>,
  start: Date,
  end: Date
): number {
  let count = 0;
  let cursor = start;
  while (cursor <= end) {
    if (isDateFullyLogged(days, completed, cursor)) count += 1;
    cursor = addDays(cursor, 1);
  }
  return count;
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
