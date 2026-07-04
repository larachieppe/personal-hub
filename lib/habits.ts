import habitsData from "@/data/habits.json";

export interface Habit {
  id: string;
  name: string;
  description?: string;
}

export function getHabits(): Habit[] {
  return habitsData.habits;
}
