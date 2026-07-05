import pantryData from "@/data/pantry.json";

export interface PantryItem {
  id: string;
  name: string;
}

export interface PantryCategory {
  id: string;
  name: string;
  items: PantryItem[];
}

export function getDefaultPantry(): PantryCategory[] {
  return pantryData.categories;
}
