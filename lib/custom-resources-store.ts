import { useSyncExternalStore } from "react";
import type { CustomResourceMap, Resource } from "@/lib/curriculum";

const STORAGE_KEY = "polymath-hub:custom-resources";
const EMPTY: Readonly<CustomResourceMap> = {};

type Listener = () => void;

let listeners: Listener[] = [];
let cache: CustomResourceMap | null = null;

function readFromStorage(): CustomResourceMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomResourceMap) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): CustomResourceMap {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): CustomResourceMap {
  return EMPTY;
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(next: CustomResourceMap) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export function addCustomResource(domainId: string, topicId: string, resource: Resource) {
  const current = getSnapshot();
  const domainMap = current[domainId] ?? {};
  const list = domainMap[topicId] ?? [];
  persist({
    ...current,
    [domainId]: { ...domainMap, [topicId]: [...list, resource] },
  });
}

export function removeCustomResource(domainId: string, topicId: string, title: string) {
  const current = getSnapshot();
  const domainMap = current[domainId];
  const list = domainMap?.[topicId];
  if (!domainMap || !list) return;
  persist({
    ...current,
    [domainId]: { ...domainMap, [topicId]: list.filter((r) => r.title !== title) },
  });
}

export function useCustomResources(): CustomResourceMap {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function exportCustomResources(): CustomResourceMap {
  return getSnapshot();
}

export function replaceCustomResources(next: CustomResourceMap) {
  persist(next ?? {});
}
