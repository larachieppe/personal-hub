"use client";

import { useState } from "react";
import type { CustomResourceMap } from "@/lib/curriculum";
import { exportCustomResources, replaceCustomResources } from "@/lib/custom-resources-store";
import { exportDiscardedResources, replaceDiscardedResources } from "@/lib/discard-store";
import { exportHabitLog, replaceHabitLog } from "@/lib/habit-store";
import type { MealOverride } from "@/lib/meal-store";
import {
  exportDailyGoalOverride,
  exportMealLog,
  exportMealOverrides,
  replaceDailyGoalOverride,
  replaceMealLog,
  replaceMealOverrides,
} from "@/lib/meal-store";
import type { PantryCategoryState } from "@/lib/pantry-store";
import { exportPantry, replacePantry } from "@/lib/pantry-store";
import type { PlanAssignments } from "@/lib/plan-store";
import { exportPlanAssignments, replacePlanAssignments } from "@/lib/plan-store";
import { exportProgressData, replaceProgressData } from "@/lib/progress-store";
import type { LiftEntry } from "@/lib/lifts-store";
import { exportLifts, replaceLifts } from "@/lib/lifts-store";
import type { Todo, TodoAssignments } from "@/lib/todo-store";
import {
  exportTodoAssignments,
  exportTodos,
  replaceTodoAssignments,
  replaceTodos,
} from "@/lib/todo-store";

interface BackupFile {
  version: 1;
  exportedAt: string;
  completedResources: string[];
  completedTimestamps: Record<string, string>;
  habitLog: Record<string, string[]>;
  mealLog: string[];
  mealOverrides: Record<string, MealOverride>;
  dailyCalorieGoalOverride: number | null;
  pantry: PantryCategoryState[];
  discardedResources: string[];
  planAssignments: PlanAssignments;
  todos: Todo[];
  todoAssignments: TodoAssignments;
  lifts: LiftEntry[];
  customResources: CustomResourceMap;
}

export default function BackupTools() {
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    const progress = exportProgressData();
    const payload: BackupFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      completedResources: progress.completedResources,
      completedTimestamps: progress.completedTimestamps,
      habitLog: exportHabitLog(),
      mealLog: exportMealLog(),
      mealOverrides: exportMealOverrides(),
      dailyCalorieGoalOverride: exportDailyGoalOverride(),
      pantry: exportPantry(),
      discardedResources: exportDiscardedResources(),
      planAssignments: exportPlanAssignments(),
      todos: exportTodos(),
      todoAssignments: exportTodoAssignments(),
      lifts: exportLifts(),
      customResources: exportCustomResources(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `polymath-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<BackupFile>;
        replaceProgressData(parsed.completedResources ?? [], parsed.completedTimestamps ?? {});
        replaceHabitLog(parsed.habitLog ?? {});
        replaceMealLog(parsed.mealLog ?? []);
        replaceMealOverrides(parsed.mealOverrides ?? {});
        replaceDailyGoalOverride(parsed.dailyCalorieGoalOverride ?? null);
        replacePantry(parsed.pantry ?? []);
        replaceDiscardedResources(parsed.discardedResources ?? []);
        replacePlanAssignments(parsed.planAssignments ?? {});
        replaceTodos(parsed.todos ?? []);
        replaceTodoAssignments(parsed.todoAssignments ?? {});
        replaceLifts(parsed.lifts ?? []);
        replaceCustomResources(parsed.customResources ?? {});
        setMessage("Backup restored. Reload any open pages to see the change everywhere.");
      } catch {
        setMessage("That file couldn't be read as a valid backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="panel flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={handleExport} className="btn-gold">
          Export backup
        </button>
        <label className="btn-outline cursor-pointer">
          Import backup
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
