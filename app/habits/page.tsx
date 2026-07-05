import { getHabits } from "@/lib/habits";
import HabitTracker from "@/components/HabitTracker";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Habits — Polymath Hub",
};

export default function HabitsPage() {
  const habits = getHabits();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Daily Practice
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Habits
        </h1>
        <p className="mt-2 text-sm text-muted">
          Mark a habit done once per day. Missing a day resets the streak, but your
          all-time total keeps counting.
        </p>
      </div>
      <Ornament />
      <HabitTracker habits={habits} />
    </div>
  );
}
