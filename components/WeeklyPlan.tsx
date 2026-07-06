"use client";

import { useEffect } from "react";
import type { Domain } from "@/lib/curriculum";
import {
  filterOutDiscarded,
  getAllResources,
  getNextResources,
  resourceKey,
} from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";
import { discardResource, useDiscardedResources } from "@/lib/discard-store";
import { ensureAssignments, usePlanAssignments } from "@/lib/plan-store";
import { addDays, getWeekStart, parseDateString, toDateString, useTodayString } from "@/lib/date-utils";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WeeklyPlan({ domains }: { domains: Domain[] }) {
  const completed = useCompletedResources();
  const discarded = useDiscardedResources();
  const assignments = usePlanAssignments();
  const todayStr = useTodayString();

  const today = parseDateString(todayStr);
  const weekStart = getWeekStart(today);

  useEffect(() => {
    const visibleDomains = filterOutDiscarded(domains, discarded);
    const pool = getNextResources(visibleDomains, completed).map((r) => ({
      key: resourceKey(r.domainId, r.topicId, r),
    }));
    const wStart = getWeekStart(parseDateString(todayStr));
    const dates = Array.from({ length: 5 }, (_, i) => toDateString(addDays(wStart, i)));
    ensureAssignments(dates, pool, completed, discarded);
  }, [domains, discarded, completed, todayStr]);

  const visibleDomains = filterOutDiscarded(domains, discarded);
  const resourceByKey = new Map(
    getAllResources(visibleDomains).map((r) => [resourceKey(r.domainId, r.topicId, r), r])
  );

  return (
    <div className="flex flex-col divide-y divide-border">
      {DAY_NAMES.map((dayName, index) => {
        const date = addDays(weekStart, index);
        const dateStr = toDateString(date);
        const isToday = dateStr === todayStr;
        const isRestDay = index >= 5;
        const assignedKeys = isRestDay ? [] : (assignments[dateStr] ?? []);

        return (
          <div
            key={dateStr}
            className={`flex flex-col gap-3 py-5 ${isToday ? "-mx-6 bg-surface px-6" : ""}`}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg text-foreground">
                {dayName}
                {isToday && (
                  <span className="ml-2 text-xs uppercase tracking-wide text-gold">
                    Today
                  </span>
                )}
              </h2>
              <span className="text-xs uppercase tracking-wide text-muted">{dateStr}</span>
            </div>
            {isRestDay ? (
              <p className="text-sm italic text-muted">
                Rest &amp; review — no new resource assigned. Keep the daily habits going.
              </p>
            ) : assignedKeys.length === 0 ? (
              <p className="text-sm italic text-muted">
                Every resource in the curriculum is checked off — add more in the Athenaeum.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {assignedKeys.map((key) => {
                  const resource = resourceByKey.get(key);
                  if (!resource) return null;
                  const isChecked = completed.has(key);
                  return (
                    <li key={key} className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleResourceCompleted(key)}
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                        aria-label={`Mark "${resource.title}" as done`}
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        {resource.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={
                              isChecked
                                ? "text-muted line-through hover:underline"
                                : "text-gold hover:text-foreground hover:underline"
                            }
                          >
                            {resource.title}
                          </a>
                        ) : (
                          <span className={isChecked ? "text-muted line-through" : "text-foreground"}>
                            {resource.title}
                          </span>
                        )}
                        <span className="text-xs uppercase tracking-wide text-muted">
                          {resource.domainName} · {resource.topicTitle} · {resource.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => discardResource(key)}
                        className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                        aria-label={`Discard "${resource.title}"`}
                      >
                        Discard
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
