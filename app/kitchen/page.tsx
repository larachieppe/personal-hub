import { getDailyCalorieGoal, getMealPlan } from "@/lib/meals";
import Kitchen from "@/components/Kitchen";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Kitchen — Polymath Hub",
};

export default function KitchenPage() {
  const mealDays = getMealPlan();
  const defaultGoal = getDailyCalorieGoal();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Daily Practice
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Kitchen
        </h1>
        <p className="mt-2 text-sm text-muted">
          Your weekly menu and what&apos;s in stock, in one place. Both are fully
          editable right here — no file editing required.
        </p>
      </div>
      <Ornament />
      <Kitchen mealDays={mealDays} defaultGoal={defaultGoal} />
    </div>
  );
}
