import type { TopicStatus } from "@/lib/curriculum";

const STYLES: Record<TopicStatus, string> = {
  "done": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "in-progress": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "not-started": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const LABELS: Record<TopicStatus, string> = {
  "done": "Done",
  "in-progress": "In progress",
  "not-started": "Not started",
};

export default function StatusBadge({ status }: { status: TopicStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
