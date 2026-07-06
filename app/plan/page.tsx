import { getDomains } from "@/lib/curriculum";
import WeeklyPlan from "@/components/WeeklyPlan";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Weekly Plan — Polymath Hub",
};

export default function PlanPage() {
  const domains = getDomains();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          This Week
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Weekly Plan
        </h1>
        <p className="mt-2 text-sm text-muted">
          One resource a day, Monday through Friday, picked in order — a later lesson
          is never suggested ahead of an earlier one in the same topic. Check
          something off and it stays marked right there, with the next one appearing
          below it. Weekends are for rest and review, and a new week starts fresh.
        </p>
      </div>
      <Ornament />
      <WeeklyPlan domains={domains} />
    </div>
  );
}
