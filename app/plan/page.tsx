import { getDomains } from "@/lib/curriculum";
import WeeklyPlan from "@/components/WeeklyPlan";

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
          One resource a day, Monday through Friday, picked from whatever&apos;s still
          unchecked in the curriculum — weekends are for rest and review. This
          regenerates every week and skips anything you&apos;ve already completed, so
          there&apos;s nothing to edit by hand.
        </p>
      </div>
      <WeeklyPlan domains={domains} />
    </div>
  );
}
