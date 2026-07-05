import { useSyncExternalStore } from "react";
import { getDefaultPantry } from "@/lib/pantry";
import type { PantryItem } from "@/lib/pantry";

const STORAGE_KEY = "polymath-hub:pantry";

export interface PantryItemState extends PantryItem {
  checked: boolean;
}

export interface PantryCategoryState {
  id: string;
  name: string;
  items: PantryItemState[];
}

type Listener = () => void;

let listeners: Listener[] = [];
let cache: PantryCategoryState[] | null = null;

function seedFromDefault(): PantryCategoryState[] {
  return getDefaultPantry().map((category) => ({
    id: category.id,
    name: category.name,
    items: category.items.map((item) => ({ ...item, checked: false })),
  }));
}

const SERVER_SNAPSHOT = seedFromDefault();

function readFromStorage(): PantryCategoryState[] {
  if (typeof window === "undefined") return seedFromDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedFromDefault();
    return JSON.parse(raw) as PantryCategoryState[];
  } catch {
    return seedFromDefault();
  }
}

function getSnapshot(): PantryCategoryState[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): PantryCategoryState[] {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(next: PantryCategoryState[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function makeId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return `${slug || "item"}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export function usePantry(): PantryCategoryState[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleItem(categoryId: string, itemId: string) {
  const next = getSnapshot().map((category) =>
    category.id !== categoryId
      ? category
      : {
          ...category,
          items: category.items.map((item) =>
            item.id !== itemId ? item : { ...item, checked: !item.checked }
          ),
        }
  );
  persist(next);
}

export function renameItem(categoryId: string, itemId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const next = getSnapshot().map((category) =>
    category.id !== categoryId
      ? category
      : {
          ...category,
          items: category.items.map((item) =>
            item.id !== itemId ? item : { ...item, name: trimmed }
          ),
        }
  );
  persist(next);
}

export function addItem(categoryId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const next = getSnapshot().map((category) =>
    category.id !== categoryId
      ? category
      : {
          ...category,
          items: [...category.items, { id: makeId(trimmed), name: trimmed, checked: false }],
        }
  );
  persist(next);
}

export function removeItem(categoryId: string, itemId: string) {
  const next = getSnapshot().map((category) =>
    category.id !== categoryId
      ? category
      : { ...category, items: category.items.filter((item) => item.id !== itemId) }
  );
  persist(next);
}

export function renameCategory(categoryId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const next = getSnapshot().map((category) =>
    category.id !== categoryId ? category : { ...category, name: trimmed }
  );
  persist(next);
}

export function addCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const next = [...getSnapshot(), { id: makeId(trimmed), name: trimmed, items: [] }];
  persist(next);
}

export function removeCategory(categoryId: string) {
  const next = getSnapshot().filter((category) => category.id !== categoryId);
  persist(next);
}

export function resetPantryToDefault() {
  persist(seedFromDefault());
}

export function exportPantry(): PantryCategoryState[] {
  return getSnapshot();
}

export function replacePantry(next: PantryCategoryState[]) {
  persist(next && next.length > 0 ? next : seedFromDefault());
}
