"use client";

import { useState } from "react";
import type { DayMenu } from "@/lib/meals";
import {
  clearMealOverrides,
  computeMealPlanStats,
  mealKey,
  overrideKey,
  setMealOverride,
  toggleMeal,
  useMealLog,
  useMealOverrides,
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
  const overrides = useMealOverrides();
  const todayStr = useTodayString();
  const today = parseDateString(todayStr);
  const weekStart = getWeekStart(today);
  const stats = computeMealPlanStats(days, completed, today);
  const [isEditing, setIsEditing] = useState(false);

  const byDay = new Map(days.map((d) => [d.day, d]));
  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex items-center gap-3">
          {hasOverrides && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset the meal plan back to the default menu?")) {
                  clearMealOverrides();
                }
              }}
              className="text-xs uppercase tracking-wide text-muted transition-colors hover:text-foreground"
            >
              Reset to default
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing((e) => !e)}
            className={
              isEditing
                ? "whitespace-nowrap border border-green px-4 py-2 text-xs uppercase tracking-wide text-green transition-colors"
                : "whitespace-nowrap border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors hover:border-gold-dim hover:bg-gold-dim"
            }
          >
            {isEditing ? "Done editing" : "Edit plan"}
          </button>
        </div>
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
                  const resolvedName = overrides[overrideKey(dayKey, meal.id)] ?? meal.name;

                  return (
                    <li key={meal.id} className="flex items-start gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMeal(dateStr, meal.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                        aria-label={`Mark ${meal.label} as eaten`}
                      />
                      <span className="mt-0.5 shrink-0 text-xs uppercase tracking-wide text-gold-dim">
                        {meal.label}
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={resolvedName}
                          onBlur={(e) => setMealOverride(dayKey, meal.id, e.target.value)}
                          className="flex-1 border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none focus:border-gold"
                          aria-label={`Edit ${DAY_LABELS[dayKey]} ${meal.label}`}
                        />
                      ) : (
                        <span className={isChecked ? "text-muted line-through" : "text-foreground"}>
                          {resolvedName}
                        </span>
                      )}
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
