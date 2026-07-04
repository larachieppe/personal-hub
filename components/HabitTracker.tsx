"use client";

import type { Habit } from "@/lib/habits";
import {
  computeHabitStats,
  computeHeatmap,
  getStreakMilestone,
  toggleHabitToday,
  useHabitLog,
} from "@/lib/habit-store";

export default function HabitTracker({ habits }: { habits: Habit[] }) {
  const log = useHabitLog();

  return (
    <div className="flex flex-col divide-y divide-border">
      {habits.map((habit) => {
        const dates = log[habit.id] ?? [];
        const stats = computeHabitStats(dates);
        const heatmap = computeHeatmap(dates);
        const milestone = getStreakMilestone(stats.streak);

        return (
          <div key={habit.id} className="flex flex-col gap-4 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-lg text-foreground">{habit.name}</h2>
                {habit.description && (
                  <p className="text-sm text-muted">{habit.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${
                      stats.streak > 0 ? "border-gold-dim text-gold" : "border-border text-muted"
                    }`}
                  >
                    {stats.streak} day streak
                  </span>
                  {milestone && (
                    <span className="text-[11px] uppercase tracking-wide text-gold">
                      ★ {milestone}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleHabitToday(habit.id)}
                  className={
                    stats.isDoneToday
                      ? "whitespace-nowrap border border-green px-4 py-2 text-xs uppercase tracking-wide text-green transition-colors"
                      : "whitespace-nowrap border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors hover:border-gold-dim hover:bg-gold-dim"
                  }
                >
                  {stats.isDoneToday ? "Done today" : "Mark done"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="overflow-x-auto">
                <div className="flex w-max gap-[3px]">
                  {heatmap.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {week.map((day) => (
                        <span
                          key={day.date}
                          title={day.date}
                          className={`h-[10px] w-[10px] rounded-[2px] ${
                            day.done ? "bg-gold" : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <span className="text-xs uppercase tracking-wide text-muted">
                {stats.total} total
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
