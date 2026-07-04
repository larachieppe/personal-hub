"use client";

import type { Habit } from "@/lib/habits";
import { computeHabitStats, toggleHabitToday, useHabitLog } from "@/lib/habit-store";

export default function HabitTracker({ habits }: { habits: Habit[] }) {
  const log = useHabitLog();

  return (
    <div className="flex flex-col divide-y divide-border">
      {habits.map((habit) => {
        const stats = computeHabitStats(log[habit.id] ?? []);
        return (
          <div
            key={habit.id}
            className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg text-foreground">{habit.name}</h2>
              {habit.description && (
                <p className="text-sm text-muted">{habit.description}</p>
              )}
              <div className="flex items-center gap-1.5">
                {stats.last7Days.map((done, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${done ? "bg-gold" : "bg-border"}`}
                  />
                ))}
                <span className="ml-2 text-xs uppercase tracking-wide text-muted">
                  {stats.total} total
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${
                  stats.streak > 0 ? "border-gold-dim text-gold" : "border-border text-muted"
                }`}
              >
                {stats.streak} day streak
              </span>
              <button
                type="button"
                onClick={() => toggleHabitToday(habit.id)}
                className={
                  stats.isDoneToday
                    ? "whitespace-nowrap border border-green px-4 py-2 text-xs uppercase tracking-wide text-green transition-colors"
                    : "whitespace-nowrap border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors hover:bg-gold-dim hover:border-gold-dim"
                }
              >
                {stats.isDoneToday ? "Done today" : "Mark done"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
