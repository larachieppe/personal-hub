"use client";

import { useState } from "react";
import type { Domain } from "@/lib/curriculum";
import type { Habit } from "@/lib/habits";
import type { DayMenu } from "@/lib/meals";
import HabitTracker from "@/components/HabitTracker";
import Review from "@/components/Review";

type Tab = "habits" | "review";

const TAB_LABELS: Record<Tab, string> = {
  habits: "Habits",
  review: "Review",
};

export default function Progress({
  domains,
  habits,
  mealDays,
}: {
  domains: Domain[];
  habits: Habit[];
  mealDays: DayMenu[];
}) {
  const [tab, setTab] = useState<Tab>("habits");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors"
                : "border border-border px-4 py-2 text-xs uppercase tracking-wide text-muted transition-colors hover:border-gold-dim hover:text-foreground"
            }
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "habits" ? (
        <HabitTracker habits={habits} />
      ) : (
        <Review domains={domains} habits={habits} mealDays={mealDays} />
      )}
    </div>
  );
}
