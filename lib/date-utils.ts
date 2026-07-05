import { useSyncExternalStore } from "react";

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

export function parseDateString(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

const SERVER_TODAY = toDateString(new Date());

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): string {
  return toDateString(new Date());
}

function getServerSnapshot(): string {
  return SERVER_TODAY;
}

export function useTodayString(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
