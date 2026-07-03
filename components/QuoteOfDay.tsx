"use client";

import { useSyncExternalStore } from "react";
import quotesData from "@/data/motivation.json";

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function subscribe() {
  return () => {};
}

function getSnapshot(): string {
  const quotes = quotesData.quotes;
  const index = dayOfYear(new Date()) % quotes.length;
  return quotes[index];
}

function getServerSnapshot(): string {
  return quotesData.quotes[0];
}

export default function QuoteOfDay() {
  const quote = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <blockquote className="border-l-2 border-emerald-500 pl-4 text-sm italic text-zinc-600 dark:text-zinc-400">
      {quote}
    </blockquote>
  );
}
