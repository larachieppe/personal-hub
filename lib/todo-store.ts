import { useSyncExternalStore } from "react";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export type TodoAssignments = Record<string, string[]>;

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * The master to-do pool (managed on the To-Do page): every task the user has
 * ever created, regardless of whether it's scheduled to any day yet. Marking
 * one done is global — the same task shown on multiple days is one entity,
 * not a per-day copy.
 */
const TODOS_KEY = "polymath-hub:todos";
const EMPTY_TODOS: readonly Todo[] = [];

let todoListeners: (() => void)[] = [];
let todoCache: Todo[] | null = null;

function readTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TODOS_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

function getTodoSnapshot(): Todo[] {
  if (todoCache === null) todoCache = readTodos();
  return todoCache;
}

function getTodoServerSnapshot(): Todo[] {
  return EMPTY_TODOS as Todo[];
}

function subscribeTodos(listener: () => void): () => void {
  todoListeners.push(listener);
  return () => {
    todoListeners = todoListeners.filter((l) => l !== listener);
  };
}

function persistTodos(next: Todo[]) {
  todoCache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TODOS_KEY, JSON.stringify(next));
  }
  todoListeners.forEach((listener) => listener());
}

export function addTodo(text: string): string {
  const current = getTodoSnapshot();
  const todo: Todo = { id: makeId(), text, done: false };
  persistTodos([...current, todo]);
  return todo.id;
}

export function toggleTodo(id: string) {
  const current = getTodoSnapshot();
  persistTodos(current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
}

export function deleteTodo(id: string) {
  const current = getTodoSnapshot();
  persistTodos(current.filter((todo) => todo.id !== id));
  // A deleted task can't still be scheduled anywhere.
  const assignments = getAssignmentSnapshot();
  let changed = false;
  const nextAssignments: TodoAssignments = {};
  for (const [dateStr, ids] of Object.entries(assignments)) {
    const filtered = ids.filter((todoId) => todoId !== id);
    if (filtered.length !== ids.length) changed = true;
    nextAssignments[dateStr] = filtered;
  }
  if (changed) persistAssignments(nextAssignments);
}

export function useTodos(): Todo[] {
  return useSyncExternalStore(subscribeTodos, getTodoSnapshot, getTodoServerSnapshot);
}

export function exportTodos(): Todo[] {
  return getTodoSnapshot();
}

export function replaceTodos(next: Todo[]) {
  persistTodos(next ?? []);
}

/**
 * Which task ids are scheduled on which calendar date — set from the Weekly
 * Plan page, where you pick existing pool tasks onto specific days rather
 * than typing a new task straight into a day.
 */
const ASSIGNMENTS_KEY = "polymath-hub:todo-assignments";
const EMPTY_ASSIGNMENTS: Readonly<TodoAssignments> = {};

let assignmentListeners: (() => void)[] = [];
let assignmentCache: TodoAssignments | null = null;

function readAssignments(): TodoAssignments {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? (JSON.parse(raw) as TodoAssignments) : {};
  } catch {
    return {};
  }
}

function getAssignmentSnapshot(): TodoAssignments {
  if (assignmentCache === null) assignmentCache = readAssignments();
  return assignmentCache;
}

function getAssignmentServerSnapshot(): TodoAssignments {
  return EMPTY_ASSIGNMENTS;
}

function subscribeAssignments(listener: () => void): () => void {
  assignmentListeners.push(listener);
  return () => {
    assignmentListeners = assignmentListeners.filter((l) => l !== listener);
  };
}

function persistAssignments(next: TodoAssignments) {
  assignmentCache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next));
  }
  assignmentListeners.forEach((listener) => listener());
}

export function assignTodoToDate(dateStr: string, todoId: string) {
  const current = getAssignmentSnapshot();
  const list = current[dateStr] ?? [];
  if (list.includes(todoId)) return;
  persistAssignments({ ...current, [dateStr]: [...list, todoId] });
}

export function unassignTodoFromDate(dateStr: string, todoId: string) {
  const current = getAssignmentSnapshot();
  const list = current[dateStr] ?? [];
  persistAssignments({ ...current, [dateStr]: list.filter((id) => id !== todoId) });
}

export function useTodoAssignments(): TodoAssignments {
  return useSyncExternalStore(subscribeAssignments, getAssignmentSnapshot, getAssignmentServerSnapshot);
}

export function exportTodoAssignments(): TodoAssignments {
  return getAssignmentSnapshot();
}

export function replaceTodoAssignments(next: TodoAssignments) {
  persistAssignments(next ?? {});
}
