import { getDomains } from "@/lib/curriculum";
import { getHabits } from "@/lib/habits";
import { getMealPlan } from "@/lib/meals";
import Review from "@/components/Review";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Review — Polymath Hub",
};

export default function ReviewPage() {
  const domains = getDomains();
  const habits = getHabits();
  const mealDays = getMealPlan();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Retrospective
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Review
        </h1>
        <p className="mt-2 text-sm text-muted">
          Nothing here is ever deleted — habit check-ins, completed resources, and
          meal logs are kept indefinitely. Switch between Week, Month, and Year to
          look back further.
        </p>
      </div>
      <Ornament />
      <Review domains={domains} habits={habits} mealDays={mealDays} />
    </div>
  );
}
