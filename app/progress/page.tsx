import { getDomains } from "@/lib/curriculum";
import { getHabits } from "@/lib/habits";
import { getMealPlan } from "@/lib/meals";
import Progress from "@/components/Progress";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Progress — Polymath Hub",
};

export default function ProgressPage() {
  const domains = getDomains();
  const habits = getHabits();
  const mealDays = getMealPlan();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Daily Practice
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Progress
        </h1>
        <p className="mt-2 text-sm text-muted">
          Mark a habit done once per day under the <strong>Habits</strong> tab, or switch to{" "}
          <strong>Review</strong> for a Week/Month/Year retrospective on habits, meals, and
          curriculum resources completed. Nothing here is ever deleted — missing a day resets a
          streak, but the all-time totals and history keep counting.
        </p>
      </div>
      <Ornament />
      <Progress domains={domains} habits={habits} mealDays={mealDays} />
    </div>
  );
}
