"use client";

import { useState } from "react";
import {
  addTodo,
  deleteTodo,
  toggleTodo,
  useTodoAssignments,
  useTodos,
} from "@/lib/todo-store";
import { addDays, getWeekStart, parseDateString, toDateString, useTodayString } from "@/lib/date-utils";

const DAY_ABBREVIATIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TodoList() {
  const todos = useTodos();
  const assignments = useTodoAssignments();
  const todayStr = useTodayString();

  const weekStart = getWeekStart(parseDateString(todayStr));
  const weekDateStrs = Array.from({ length: 7 }, (_, i) => toDateString(addDays(weekStart, i)));

  function daysAssignedThisWeek(todoId: string): string[] {
    return weekDateStrs
      .map((dateStr, i) => ((assignments[dateStr] ?? []).includes(todoId) ? DAY_ABBREVIATIONS[i] : null))
      .filter((label): label is string => label !== null);
  }

  return (
    <div className="flex flex-col gap-4">
      <AddTaskForm />
      {todos.length === 0 ? (
        <p className="text-sm italic text-muted">
          No tasks yet — add one above, then assign it to a day on the Plan page.
        </p>
      ) : (
        <ul className="panel flex flex-col divide-y divide-border/70">
          {todos.map((todo) => {
            const assignedDays = daysAssignedThisWeek(todo.id);
            return (
              <li key={todo.id} className="flex items-center gap-2.5 py-3">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-gold"
                  aria-label={`Mark "${todo.text}" as done`}
                />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className={todo.done ? "text-sm text-muted line-through" : "text-sm text-foreground"}>
                    {todo.text}
                  </span>
                  {assignedDays.length > 0 && (
                    <span className="text-xs uppercase tracking-wide text-gold">
                      This week: {assignedDays.join(", ")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                  aria-label={`Delete "${todo.text}"`}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AddTaskForm() {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task…"
        className="field flex-1"
      />
      <button type="submit" className="btn-gold shrink-0">
        Add
      </button>
    </form>
  );
}
