import { getDomains } from "@/lib/curriculum";
import { getHabits } from "@/lib/habits";
import { getMealPlan } from "@/lib/meals";
import Progress from "@/components/Progress";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Progress — Polymath Hub",
};

export default function ProgressPage() {
  const domains = getDomains();
  const habits = getHabits();
  const mealDays = getMealPlan();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Daily Practice"
        title="Progress"
        description={
          <>
            Mark a habit done once per day under the <strong>Habits</strong> tab, log sets and
            weight under <strong>Lifts</strong>, or switch to <strong>Review</strong> for a
            Week/Month/Year retrospective on habits, meals, and curriculum resources completed.
            Nothing here is ever deleted — missing a day resets a streak, but the all-time totals
            and history keep counting.
          </>
        }
      />
      <Progress domains={domains} habits={habits} mealDays={mealDays} />
    </div>
  );
}
