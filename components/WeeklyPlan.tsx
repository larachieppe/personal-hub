"use client";

import type { Domain } from "@/lib/curriculum";
import { resourceKey } from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";
import { parseDateString, useTodayString } from "@/lib/date-utils";
import { buildWeeklyPlan } from "@/lib/weekly-plan";

export default function WeeklyPlan({ domains }: { domains: Domain[] }) {
  const completed = useCompletedResources();
  const todayStr = useTodayString();
  const plan = buildWeeklyPlan(domains, completed, parseDateString(todayStr));

  return (
    <div className="flex flex-col divide-y divide-border">
      {plan.map((day) => {
        const isToday = day.date === todayStr;
        const resource = day.resource;
        return (
          <div
            key={day.date}
            className={`flex flex-col gap-2 py-5 ${isToday ? "-mx-6 bg-surface px-6" : ""}`}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg text-foreground">
                {day.dayName}
                {isToday && (
                  <span className="ml-2 text-xs uppercase tracking-wide text-gold">
                    Today
                  </span>
                )}
              </h2>
              <span className="text-xs uppercase tracking-wide text-muted">{day.date}</span>
            </div>
            {day.isRestDay ? (
              <p className="text-sm italic text-muted">
                Rest &amp; review — no new resource assigned. Keep the daily habits going.
              </p>
            ) : resource ? (
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() =>
                    toggleResourceCompleted(resourceKey(resource.domainId, resource.topicId, resource))
                  }
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                  aria-label={`Mark "${resource.title}" as done`}
                />
                <div className="flex flex-col gap-1">
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-foreground hover:underline"
                    >
                      {resource.title}
                    </a>
                  ) : (
                    <span className="text-foreground">{resource.title}</span>
                  )}
                  <span className="text-xs uppercase tracking-wide text-muted">
                    {resource.domainName} · {resource.topicTitle} · {resource.type}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-muted">
                Every resource in the curriculum is checked off — add more in the Athenaeum.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
