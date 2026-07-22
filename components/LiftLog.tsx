"use client";

import { useMemo, useState } from "react";
import { addLift, deleteLift, useLifts, type LiftEntry } from "@/lib/lifts-store";
import { parseDateString, useTodayString } from "@/lib/date-utils";

function formatDate(dateStr: string): string {
  return parseDateString(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function Sparkline({ entries }: { entries: LiftEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return null;

  const weights = sorted.map((e) => e.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const w = 200;
  const h = 40;
  const stepX = w / (sorted.length - 1);

  const points = sorted.map((entry, i) => ({
    x: i * stepX,
    y: h - ((entry.weight - min) / range) * h,
  }));
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full max-w-[200px] shrink-0">
      <polyline
        points={linePoints}
        fill="none"
        style={{ stroke: "var(--gold)" }}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} style={{ fill: "var(--gold)" }} />
      ))}
    </svg>
  );
}

export default function LiftLog() {
  const lifts = useLifts();

  const exerciseNames = useMemo(
    () => Array.from(new Set(lifts.map((l) => l.exercise))).sort(),
    [lifts]
  );

  const groups = useMemo(() => {
    const map = new Map<string, LiftEntry[]>();
    for (const entry of lifts) {
      const list = map.get(entry.exercise) ?? [];
      list.push(entry);
      map.set(entry.exercise, list);
    }
    return Array.from(map.entries())
      .map(([exercise, entries]) => ({
        exercise,
        entries: [...entries].sort(
          (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
        ),
      }))
      .sort((a, b) => a.exercise.localeCompare(b.exercise));
  }, [lifts]);

  return (
    <div className="flex flex-col gap-5">
      <AddLiftForm existingExercises={exerciseNames} />
      {groups.length === 0 ? (
        <p className="text-sm italic text-muted">
          No lifts logged yet — add your first set below.
        </p>
      ) : (
        groups.map((group) => {
          const best = Math.max(...group.entries.map((e) => e.weight));
          return (
            <div key={group.exercise} className="panel flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg text-foreground">{group.exercise}</h2>
                  <span className="rounded-full border border-gold-dim px-3 py-1 text-xs uppercase tracking-wide text-gold">
                    Best {best} lb
                  </span>
                </div>
                <Sparkline entries={group.entries} />
              </div>
              <ul className="flex flex-col divide-y divide-border/70">
                {group.entries.map((entry) => (
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
                      aria-label={`Delete ${group.exercise} entry from ${entry.date}`}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}

function AddLiftForm({ existingExercises }: { existingExercises: string[] }) {
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
