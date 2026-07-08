"use client";

import { useEffect, useState } from "react";
import type { Domain } from "@/lib/curriculum";
import {
  filterOutDiscarded,
  getAllResources,
  getNextResources,
  mergeCustomResources,
} from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";
import { discardResource, useDiscardedResources } from "@/lib/discard-store";
import { useCustomResources } from "@/lib/custom-resources-store";
import { ensureAssignments, replaceAssignment, usePlanAssignments } from "@/lib/plan-store";
import { addTodo, deleteTodo, toggleTodo, useTodos } from "@/lib/todo-store";
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
  const custom = useCustomResources();
  const assignments = usePlanAssignments();
  const todosByDate = useTodos();
  const todayStr = useTodayString();
  const [openSwapId, setOpenSwapId] = useState<string | null>(null);

  const today = parseDateString(todayStr);
  const weekStart = getWeekStart(today);
  const weekDateStrs = Array.from({ length: 7 }, (_, i) => toDateString(addDays(weekStart, i)));

  useEffect(() => {
    const visibleDomains = filterOutDiscarded(mergeCustomResources(domains, custom), discarded);
    const pool = getNextResources(visibleDomains, completed).map((r) => ({ key: r.key }));
    const validKeys = new Set(getAllResources(visibleDomains).map((r) => r.key));
    const wStart = getWeekStart(parseDateString(todayStr));
    const dates = Array.from({ length: 7 }, (_, i) => toDateString(addDays(wStart, i)));
    ensureAssignments(dates, pool, completed, discarded, validKeys);
  }, [domains, custom, discarded, completed, todayStr]);

  const visibleDomains = filterOutDiscarded(mergeCustomResources(domains, custom), discarded);
  const resourceByKey = new Map(getAllResources(visibleDomains).map((r) => [r.key, r]));

  const swapCandidates = getNextResources(visibleDomains, completed).map((r) => ({
    key: r.key,
    resource: r,
  }));
  const pendingElsewhere = new Set<string>();
  for (const dateStr of weekDateStrs) {
    for (const key of assignments[dateStr] ?? []) {
      if (!completed.has(key) && !discarded.has(key)) pendingElsewhere.add(key);
    }
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {DAY_NAMES.map((dayName, index) => {
        const dateStr = weekDateStrs[index];
        const isToday = dateStr === todayStr;
        const assignedKeys = assignments[dateStr] ?? [];
        const todos = todosByDate[dateStr] ?? [];

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
            {assignedKeys.length === 0 ? (
              <p className="text-sm italic text-muted">
                Every resource in the curriculum is checked off — add more in the Athenaeum.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {assignedKeys.map((key) => {
                  const resource = resourceByKey.get(key);
                  if (!resource) return null;
                  const isChecked = completed.has(key);
                  const swapId = `${dateStr}::${key}`;
                  const isSwapping = openSwapId === swapId;
                  const options = swapCandidates.filter(
                    (c) => c.key === key || !pendingElsewhere.has(c.key)
                  );
                  return (
                    <li key={key} className="flex flex-col gap-2">
                      <div className="flex items-start gap-2.5">
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
                            {resource.domainName} · {resource.topicTitle}
                            {resource.courseTitle && <> · {resource.courseTitle}</>} · {resource.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenSwapId(isSwapping ? null : swapId)}
                          className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-gold"
                          aria-label={`Change "${resource.title}"`}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => discardResource(key)}
                          className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                          aria-label={`Discard "${resource.title}"`}
                        >
                          Discard
                        </button>
                      </div>
                      {isSwapping && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const newKey = e.target.value;
                            if (newKey) replaceAssignment(dateStr, key, newKey);
                            setOpenSwapId(null);
                          }}
                          className="ml-6 border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-gold focus:outline-none"
                          aria-label={`Choose a replacement for "${resource.title}"`}
                        >
                          <option value="" disabled>
                            Choose a replacement…
                          </option>
                          {options.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.resource.domainName} · {c.resource.topicTitle}
                              {c.resource.courseTitle ? ` · ${c.resource.courseTitle}` : ""}: {c.resource.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                To-Do
              </h3>
              {todos.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {todos.map((todo) => (
                    <li key={todo.id} className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => toggleTodo(dateStr, todo.id)}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-gold"
                        aria-label={`Mark "${todo.text}" as done`}
                      />
                      <span
                        className={
                          todo.done
                            ? "flex-1 text-sm text-muted line-through"
                            : "flex-1 text-sm text-foreground"
                        }
                      >
                        {todo.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteTodo(dateStr, todo.id)}
                        className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                        aria-label={`Remove "${todo.text}"`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <TodoAddForm dateStr={dateStr} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TodoAddForm({ dateStr }: { dateStr: string }) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addTodo(dateStr, trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a to-do…"
        className="flex-1 border border-border bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted transition-colors hover:border-gold-dim hover:text-foreground"
      >
        Add
      </button>
    </form>
  );
}
