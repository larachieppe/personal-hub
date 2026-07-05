"use client";

import type { DayMenu } from "@/lib/meals";
import {
  computeMealPlanStats,
  mealKey,
  toggleMeal,
  useMealLog,
} from "@/lib/meal-store";
import { addDays, getWeekStart, parseDateString, toDateString, useTodayString } from "@/lib/date-utils";

const WEEKDAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function MealPlan({ days }: { days: DayMenu[] }) {
  const completed = useMealLog();
  const todayStr = useTodayString();
  const today = parseDateString(todayStr);
  const weekStart = getWeekStart(today);
  const stats = computeMealPlanStats(days, completed, today);

  const byDay = new Map(days.map((d) => [d.day, d]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${
            stats.streak > 0 ? "border-gold-dim text-gold" : "border-border text-muted"
          }`}
        >
          {stats.streak} day streak
        </span>
        <span className="text-xs uppercase tracking-wide text-muted">
          {stats.totalDaysCompleted} days fully followed
        </span>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {WEEKDAY_ORDER.map((dayKey, index) => {
          const menu = byDay.get(dayKey);
          if (!menu) return null;
          const date = addDays(weekStart, index);
          const dateStr = toDateString(date);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dayKey}
              className={`flex flex-col gap-3 py-5 ${isToday ? "-mx-6 bg-surface px-6" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg text-foreground">
                  {DAY_LABELS[dayKey]}
                  {isToday && (
                    <span className="ml-2 text-xs uppercase tracking-wide text-gold">
                      Today
                    </span>
                  )}
                </h2>
                <span className="text-xs uppercase tracking-wide text-muted">{dateStr}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {menu.meals.map((meal) => {
                  const key = mealKey(dateStr, meal.id);
                  const isChecked = completed.has(key);
                  return (
                    <li key={meal.id} className="flex items-start gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMeal(dateStr, meal.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                        aria-label={`Mark ${meal.label} as eaten`}
                      />
                      <span className={isChecked ? "text-muted line-through" : "text-foreground"}>
                        <span className="mr-2 text-xs uppercase tracking-wide text-gold-dim">
                          {meal.label}
                        </span>
                        {meal.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
