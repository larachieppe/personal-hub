import { useSyncExternalStore } from "react";

const STORAGE_KEY = "polymath-hub:discarded-resources";
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

export function discardResource(key: string) {
  const next = new Set(getSnapshot());
  next.add(key);
  persist(next);
}

export function restoreResource(key: string) {
  const next = new Set(getSnapshot());
  next.delete(key);
  persist(next);
}

export function useDiscardedResources(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function exportDiscardedResources(): string[] {
  return Array.from(getSnapshot());
}

export function replaceDiscardedResources(next: string[]) {
  persist(new Set(next ?? []));
}
