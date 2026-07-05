import { getMealPlan } from "@/lib/meals";
import MealPlan from "@/components/MealPlan";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Meal Plan — Polymath Hub",
};

export default function MealsPage() {
  const days = getMealPlan();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Daily Practice
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Meal Plan
        </h1>
        <p className="mt-2 text-sm text-muted">
          Your weekly menu — check off each meal as you eat it. A day counts as
          fully followed once all three meals are checked. Click{" "}
          <span className="text-gold">Edit plan</span> to change what&apos;s planned
          right here — no file editing required.
        </p>
      </div>
      <Ornament />
      <MealPlan days={days} />
    </div>
  );
}
