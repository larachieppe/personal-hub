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
          One resource a day, every day of the week including weekends, picked in
          order — a later lesson is never suggested ahead of an earlier one in the
          same topic. Check something off and it stays marked right there, with the
          next one appearing below it, or click <strong>Change</strong> to swap in a
          different one. Each day also has a Tasks section — pick from the tasks
          you&rsquo;ve created on the <strong>To-Do</strong> page and assign them to
          whichever days you like, and a new week starts fresh.
        </p>
      </div>
      <Ornament />
      <WeeklyPlan domains={domains} />
    </div>
  );
}
