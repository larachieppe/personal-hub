import type { TopicStatus } from "@/lib/curriculum";

const STYLES: Record<TopicStatus, string> = {
  "done": "border-green text-green",
  "in-progress": "border-gold text-gold",
  "not-started": "border-border text-muted",
};

const LABELS: Record<TopicStatus, string> = {
  "done": "Mastered",
  "in-progress": "In progress",
  "not-started": "Uncharted",
};

export default function StatusBadge({ status }: { status: TopicStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
