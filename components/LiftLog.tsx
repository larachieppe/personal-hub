"use client";

import { useMemo, useState } from "react";
import { addLift, deleteLift, useLifts, type LiftEntry } from "@/lib/lifts-store";
import { parseDateString, useTodayString } from "@/lib/date-utils";

interface ExerciseGroup {
  key: string;
  label: string;
  entries: LiftEntry[];
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

function formatDate(dateStr: string): string {
  return parseDateString(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function Sparkline({ entries }: { entries: LiftEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) {
    return (
      <p className="text-xs italic text-muted">
        Log this exercise again on another day to see a progression line.
      </p>
    );
  }

  const weights = sorted.map((e) => e.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const w = 480;
  const h = 100;
  const pad = 8;
  const stepX = sorted.length > 1 ? (w - pad * 2) / (sorted.length - 1) : 0;

  const points = sorted.map((entry, i) => ({
    x: pad + i * stepX,
    y: pad + (h - pad * 2) - ((entry.weight - min) / range) * (h - pad * 2),
  }));
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted">
        <span>{max} lb</span>
        {min !== max && <span>{min} lb</span>}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
        <polyline
          points={linePoints}
          fill="none"
          style={{ stroke: "var(--gold)" }}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} style={{ fill: "var(--gold)" }} />
        ))}
      </svg>
    </div>
  );
}

export default function LiftLog() {
  const lifts = useLifts();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const groups = useMemo<ExerciseGroup[]>(() => {
    const byInsertion = [...lifts].sort((a, b) => a.id.localeCompare(b.id));
    const labels = new Map<string, string>();
    const entriesByKey = new Map<string, LiftEntry[]>();
    for (const entry of byInsertion) {
      const key = normalize(entry.exercise);
      if (!labels.has(key)) labels.set(key, entry.exercise.trim());
      const list = entriesByKey.get(key) ?? [];
      list.push(entry);
      entriesByKey.set(key, list);
    }
    return Array.from(entriesByKey.entries())
      .map(([key, entries]) => ({
        key,
        label: labels.get(key) as string,
        entries: [...entries].sort(
          (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
        ),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [lifts]);

  const activeKey =
    selectedKey && groups.some((g) => g.key === selectedKey) ? selectedKey : (groups[0]?.key ?? null);
  const activeGroup = groups.find((g) => g.key === activeKey) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <AddLiftForm
        existingExercises={groups.map((g) => g.label)}
        onAdded={(exercise) => setSelectedKey(normalize(exercise))}
      />

      {groups.length === 0 ? (
        <p className="text-sm italic text-muted">
          No lifts logged yet — add your first set above.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <button
                key={group.key}
                type="button"
                onClick={() => setSelectedKey(group.key)}
                className={group.key === activeKey ? "pill-active" : "pill"}
              >
                {group.label}
              </button>
            ))}
          </div>

          {activeGroup && (
            <div className="panel flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg text-foreground">{activeGroup.label}</h2>
                  <span className="rounded-full border border-gold-dim px-3 py-1 text-xs uppercase tracking-wide text-gold">
                    Best {Math.max(...activeGroup.entries.map((e) => e.weight))} lb
                  </span>
                </div>
                <span className="text-xs uppercase tracking-wide text-muted">
                  {activeGroup.entries.length} {activeGroup.entries.length === 1 ? "set" : "sets"} logged
                </span>
              </div>

              <Sparkline entries={activeGroup.entries} />

              <ul className="flex flex-col divide-y divide-border/70">
                {activeGroup.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="w-16 shrink-0 text-xs uppercase tracking-wide text-muted">
                      {formatDate(entry.date)}
                    </span>
                    <span className="flex-1 text-foreground">
                      {entry.weight} lb
                      {entry.reps > 0 && <span className="text-muted"> &times; {entry.reps}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteLift(entry.id)}
                      className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                      aria-label={`Delete ${activeGroup.label} entry from ${entry.date}`}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddLiftForm({
  existingExercises,
  onAdded,
}: {
  existingExercises: string[];
  onAdded: (exercise: string) => void;
}) {
  const todayStr = useTodayString();
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [date, setDate] = useState("");
  const [dateTouched, setDateTouched] = useState(false);
  const effectiveDate = dateTouched ? date : todayStr;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = exercise.trim();
    const weightNum = Number(weight);
    if (!trimmed || !weightNum) return;
    addLift(trimmed, weightNum, Number(reps) || 0, effectiveDate);
    onAdded(trimmed);
    setExercise("");
    setWeight("");
    setReps("");
    setDate("");
    setDateTouched(false);
  }

  return (
    <form onSubmit={handleSubmit} className="panel flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          list="lift-exercise-options"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Exercise (e.g. Bench Press)"
          className="field min-w-[180px] flex-1"
          required
        />
        <datalist id="lift-exercise-options">
          {existingExercises.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (lb)"
          className="field w-28"
          min="0"
          step="0.5"
          required
        />
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
          className="field w-20"
          min="0"
        />
        <input
          type="date"
          value={effectiveDate}
          onChange={(e) => {
            setDate(e.target.value);
            setDateTouched(true);
          }}
          className="field"
          aria-label="Date"
        />
      </div>
      <button type="submit" className="btn-gold w-fit">
        Log set
      </button>
    </form>
  );
}
