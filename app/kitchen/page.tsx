import { getDailyCalorieGoal, getMealPlan } from "@/lib/meals";
import Kitchen from "@/components/Kitchen";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Kitchen — Polymath Hub",
};

export default function KitchenPage() {
  const mealDays = getMealPlan();
  const defaultGoal = getDailyCalorieGoal();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Daily Practice"
        title="Kitchen"
        description="Your weekly menu and what's in stock, in one place. Both are fully editable right here — no file editing required."
      />
      <Kitchen mealDays={mealDays} defaultGoal={defaultGoal} />
    </div>
  );
}
