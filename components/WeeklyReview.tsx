"use client";

import type { Domain } from "@/lib/curriculum";
import { filterOutDiscarded, getResourcesCompletedSince } from "@/lib/curriculum";
import type { Habit } from "@/lib/habits";
import { computeHabitStats, useHabitLog } from "@/lib/habit-store";
import { useCompletionTimestamps } from "@/lib/progress-store";
import { useDiscardedResources } from "@/lib/discard-store";
import { addDays, parseDateString, toDateString, useTodayString } from "@/lib/date-utils";

function formatShort(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function WeeklyReview({
  domains,
  habits,
}: {
  domains: Domain[];
  habits: Habit[];
}) {
  const habitLog = useHabitLog();
  const timestamps = useCompletionTimestamps();
  const discarded = useDiscardedResources();
  const todayStr = useTodayString();

  const today = parseDateString(todayStr);
  const sevenDaysAgo = addDays(today, -6);
  const sinceStr = toDateString(sevenDaysAgo);
  const rangeLabel = `${formatShort(sevenDaysAgo)} – ${formatShort(today)}`;

  const visibleDomains = filterOutDiscarded(domains, discarded);
  const resourcesThisWeek = getResourcesCompletedSince(visibleDomains, timestamps, sinceStr);

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xs uppercase tracking-wide text-muted">{rangeLabel}</p>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
          Habit Consistency
        </h2>
        <div className="flex flex-col divide-y divide-border">
          {habits.map((habit) => {
            const stats = computeHabitStats(habitLog[habit.id] ?? []);
            const thisWeekCount = stats.last7Days.filter(Boolean).length;
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="text-sm text-foreground">{habit.name}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {stats.last7Days.map((done, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${done ? "bg-gold" : "bg-border"}`}
                      />
                    ))}
                  </div>
                  <span className="whitespace-nowrap text-xs uppercase tracking-wide text-muted">
                    {thisWeekCount}/7 days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
            Resources Completed
          </h2>
          <span className="text-sm text-muted">{resourcesThisWeek.length} this week</span>
        </div>
        {resourcesThisWeek.length === 0 ? (
          <p className="text-sm italic text-muted">
            Nothing checked off yet this week — the Athenaeum is waiting.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {resourcesThisWeek.map((resource) => (
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
                <span className="text-xs uppercase tracking-wide text-muted">
                  {resource.type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
