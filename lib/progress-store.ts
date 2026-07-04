import { useSyncExternalStore } from "react";
import { toDateString } from "@/lib/date-utils";

const STORAGE_KEY = "polymath-hub:completed-resources";
const TIMESTAMPS_KEY = "polymath-hub:completed-resources-timestamps";
const EMPTY_SET: ReadonlySet<string> = new Set();
const EMPTY_TIMESTAMPS: Readonly<Record<string, string>> = {};

type Timestamps = Record<string, string>;
type Listener = () => void;

let listeners: Listener[] = [];
let cache: ReadonlySet<string> | null = null;
let timestampCache: Readonly<Timestamps> | null = null;

function readSetFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function readTimestampsFromStorage(): Timestamps {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TIMESTAMPS_KEY);
    return raw ? (JSON.parse(raw) as Timestamps) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): ReadonlySet<string> {
  if (cache === null) cache = readSetFromStorage();
  return cache;
}

function getTimestampSnapshot(): Readonly<Timestamps> {
  if (timestampCache === null) timestampCache = readTimestampsFromStorage();
  return timestampCache;
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_SET;
}

function getServerTimestampSnapshot(): Readonly<Timestamps> {
  return EMPTY_TIMESTAMPS;
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(nextSet: Set<string>, nextTimestamps: Timestamps) {
  cache = nextSet;
  timestampCache = nextTimestamps;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(nextSet)));
    window.localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(nextTimestamps));
  }
  listeners.forEach((listener) => listener());
}

export function toggleResourceCompleted(key: string) {
  const nextSet = new Set(getSnapshot());
  const nextTimestamps = { ...getTimestampSnapshot() };
  if (nextSet.has(key)) {
    nextSet.delete(key);
    delete nextTimestamps[key];
  } else {
    nextSet.add(key);
    nextTimestamps[key] = toDateString(new Date());
  }
  persist(nextSet, nextTimestamps);
}

export function useCompletedResources(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCompletionTimestamps(): Readonly<Timestamps> {
  return useSyncExternalStore(subscribe, getTimestampSnapshot, getServerTimestampSnapshot);
}

export function exportProgressData(): { completedResources: string[]; completedTimestamps: Timestamps } {
  return {
    completedResources: Array.from(getSnapshot()),
    completedTimestamps: { ...getTimestampSnapshot() },
  };
}

export function replaceProgressData(nextResources: string[], nextTimestamps: Timestamps) {
  persist(new Set(nextResources ?? []), nextTimestamps ?? {});
}
