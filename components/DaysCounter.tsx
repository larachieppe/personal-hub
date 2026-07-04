"use client";

import { useSyncExternalStore } from "react";
import motivation from "@/data/motivation.json";

const START = new Date(`${motivation.startDate}T00:00:00`);

function subscribe() {
  return () => {};
}

function getSnapshot(): number {
  const diff = Date.now() - START.getTime();
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
}

function getServerSnapshot(): number {
  return 1;
}

export default function DaysCounter() {
  const day = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold-dim px-3 py-1 text-xs uppercase tracking-[0.15em] text-gold">
      Day {day} of the pursuit
    </span>
  );
}
