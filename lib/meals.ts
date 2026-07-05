import mealsData from "@/data/meals.json";

export interface Meal {
  id: string;
  label: string;
  name: string;
}

export interface DayMenu {
  day: string;
  meals: Meal[];
}

export function getMealPlan(): DayMenu[] {
  return mealsData.days;
}
