"use client";

import { useState } from "react";
import type { Domain } from "@/lib/curriculum";
import { filterOutDiscarded, getResourcesCompletedSince, mergeCustomResources } from "@/lib/curriculum";
import type { Habit } from "@/lib/habits";
import { countHabitDaysInRange, useHabitLog } from "@/lib/habit-store";
import { useCompletionTimestamps } from "@/lib/progress-store";
import { useDiscardedResources } from "@/lib/discard-store";
import { useCustomResources } from "@/lib/custom-resources-store";
import type { DayMenu } from "@/lib/meals";
import { countFullyLoggedDaysInRange, useMealLog } from "@/lib/meal-store";
import { addDays, parseDateString, toDateString, useTodayString } from "@/lib/date-utils";
import ProgressBar from "@/components/ProgressBar";

type Period = "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

function getPeriodStart(period: Period, today: Date): Date {
  if (period === "week") return addDays(today, -6);
  if (period === "month") return new Date(today.getFullYear(), today.getMonth(), 1);
  return new Date(today.getFullYear(), 0, 1);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function daysElapsed(start: Date, today: Date): number {
  return Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1;
}

export default function Review({
  domains,
  habits,
  mealDays,
}: {
  domains: Domain[];
  habits: Habit[];
  mealDays: DayMenu[];
}) {
  const [period, setPeriod] = useState<Period>("week");
  const habitLog = useHabitLog();
  const mealLog = useMealLog();
  const timestamps = useCompletionTimestamps();
  const discarded = useDiscardedResources();
  const custom = useCustomResources();
  const todayStr = useTodayString();
  const today = parseDateString(todayStr);

  const start = getPeriodStart(period, today);
  const elapsed = daysElapsed(start, today);
  const rangeLabel = `${formatDate(start)} – ${formatDate(today)}`;

  const visibleDomains = filterOutDiscarded(mergeCustomResources(domains, custom), discarded);
  const resourcesInPeriod = getResourcesCompletedSince(
    visibleDomains,
    timestamps,
    toDateString(start)
  );
  const mealDaysFollowed = countFullyLoggedDaysInRange(mealDays, mealLog, start, today);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={
              period === p
                ? "border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors"
                : "border border-border px-4 py-2 text-xs uppercase tracking-wide text-muted transition-colors hover:border-gold-dim hover:text-foreground"
            }
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <p className="text-xs uppercase tracking-wide text-muted">{rangeLabel}</p>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
          Habit Consistency
        </h2>
        <div className="flex flex-col divide-y divide-border">
          {habits.map((habit) => {
            const count = countHabitDaysInRange(habitLog[habit.id] ?? [], start, today);
            const percent = elapsed === 0 ? 0 : Math.round((count / elapsed) * 100);
            return (
              <div key={habit.id} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-foreground">{habit.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <ProgressBar percent={percent} />
                  </div>
                  <span className="whitespace-nowrap text-xs uppercase tracking-wide text-muted">
                    {count}/{elapsed} days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
          Meal Plan Adherence
        </h2>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-foreground">Days fully followed</span>
          <div className="flex items-center gap-3">
            <div className="w-24">
              <ProgressBar percent={elapsed === 0 ? 0 : Math.round((mealDaysFollowed / elapsed) * 100)} />
            </div>
            <span className="whitespace-nowrap text-xs uppercase tracking-wide text-muted">
              {mealDaysFollowed}/{elapsed} days
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
            Resources Completed
          </h2>
          <span className="text-sm text-muted">{resourcesInPeriod.length} in this period</span>
        </div>
        {resourcesInPeriod.length === 0 ? (
          <p className="text-sm italic text-muted">
            Nothing checked off yet — the Athenaeum is waiting.
          </p>
        ) : (
          <ul className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto">
            {resourcesInPeriod.map((resource) => (
              <li
                key={`${resource.topicId}-${resource.title}`}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">{resource.title}</span>
                  <span className="text-xs uppercase tracking-wide text-muted">
                    {resource.domainName} · {resource.topicTitle}
                  </span>
                </div>
                <span className="whitespace-nowrap text-xs uppercase tracking-wide text-muted">
                  {resource.completedAt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
