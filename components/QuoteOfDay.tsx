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
    <blockquote className="relative border-l-2 border-gold pl-6">
      <span className="font-display absolute -left-2 -top-4 text-5xl text-gold-dim opacity-40">
        &ldquo;
      </span>
      <p className="text-base italic text-muted">{quote}</p>
    </blockquote>
  );
}
