import { getDomains } from "@/lib/curriculum";
import { getHabits } from "@/lib/habits";
import WeeklyReview from "@/components/WeeklyReview";

export const metadata = {
  title: "Weekly Review — Polymath Hub",
};

export default function ReviewPage() {
  const domains = getDomains();
  const habits = getHabits();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Retrospective
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          This Week
        </h1>
        <p className="mt-2 text-sm text-muted">
          A quick look back at the last seven days.
        </p>
      </div>
      <WeeklyReview domains={domains} habits={habits} />
    </div>
  );
}
