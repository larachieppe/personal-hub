import { useSyncExternalStore } from "react";

const STORAGE_KEY = "polymath-hub:weekly-todos";
const EMPTY_TODOS: Readonly<Record<string, Todo[]>> = {};

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export type TodosByDate = Record<string, Todo[]>;

type Listener = () => void;

let listeners: Listener[] = [];
let cache: TodosByDate | null = null;

function readFromStorage(): TodosByDate {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TodosByDate) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): TodosByDate {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): TodosByDate {
  return EMPTY_TODOS;
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persist(next: TodosByDate) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addTodo(dateStr: string, text: string) {
  const current = getSnapshot();
  const list = current[dateStr] ?? [];
  const todo: Todo = { id: makeId(), text, done: false };
  persist({ ...current, [dateStr]: [...list, todo] });
}

export function toggleTodo(dateStr: string, id: string) {
  const current = getSnapshot();
  const list = current[dateStr] ?? [];
  persist({
    ...current,
    [dateStr]: list.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
  });
}

export function deleteTodo(dateStr: string, id: string) {
  const current = getSnapshot();
  const list = current[dateStr] ?? [];
  persist({ ...current, [dateStr]: list.filter((todo) => todo.id !== id) });
}

export function useTodos(): TodosByDate {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function exportTodos(): TodosByDate {
  return getSnapshot();
}

export function replaceTodos(next: TodosByDate) {
  persist(next ?? {});
}
