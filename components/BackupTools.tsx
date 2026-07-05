"use client";

import { useState } from "react";
import { exportHabitLog, replaceHabitLog } from "@/lib/habit-store";
import {
  exportMealLog,
  exportMealOverrides,
  replaceMealLog,
  replaceMealOverrides,
} from "@/lib/meal-store";
import { exportProgressData, replaceProgressData } from "@/lib/progress-store";

interface BackupFile {
  version: 1;
  exportedAt: string;
  completedResources: string[];
  completedTimestamps: Record<string, string>;
  habitLog: Record<string, string[]>;
  mealLog: string[];
  mealOverrides: Record<string, string>;
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
        setMessage("Backup restored. Reload any open pages to see the change everywhere.");
      } catch {
        setMessage("That file couldn't be read as a valid backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleExport}
          className="border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors hover:border-gold-dim hover:bg-gold-dim"
        >
          Export backup
        </button>
        <label className="cursor-pointer border border-border px-4 py-2 text-center text-xs uppercase tracking-wide text-gold transition-colors hover:border-gold">
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
