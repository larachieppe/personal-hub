"use client";

import { useState } from "react";
import type { DayMenu } from "@/lib/meals";
import MealPlan from "@/components/MealPlan";
import Pantry from "@/components/Pantry";

type Tab = "meals" | "pantry";

const TAB_LABELS: Record<Tab, string> = {
  meals: "Meal Plan",
  pantry: "Pantry",
};

export default function Kitchen({
  mealDays,
  defaultGoal,
}: {
  mealDays: DayMenu[];
  defaultGoal: number;
}) {
  const [tab, setTab] = useState<Tab>("meals");

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

      {tab === "meals" ? (
        <MealPlan days={mealDays} defaultGoal={defaultGoal} />
      ) : (
        <Pantry />
      )}
    </div>
  );
}
