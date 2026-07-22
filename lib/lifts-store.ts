import { useSyncExternalStore } from "react";

export interface LiftEntry {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

const KEY = "polymath-hub:lifts";
const EMPTY: readonly LiftEntry[] = [];

let listeners: (() => void)[] = [];
let cache: LiftEntry[] | null = null;

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function read(): LiftEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LiftEntry[]) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): LiftEntry[] {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): LiftEntry[] {
  return EMPTY as LiftEntry[];
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(next: LiftEntry[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export function addLift(exercise: string, weight: number, reps: number, date: string): string {
  const current = getSnapshot();
  const entry: LiftEntry = { id: makeId(), exercise, weight, reps, date };
  persist([...current, entry]);
  return entry.id;
}

export function deleteLift(id: string) {
  persist(getSnapshot().filter((entry) => entry.id !== id));
}

export function useLifts(): LiftEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function exportLifts(): LiftEntry[] {
  return getSnapshot();
}

export function replaceLifts(next: LiftEntry[]) {
  persist(next ?? []);
}
