import type { Domain, ResourceWithContext } from "@/lib/curriculum";
import { getAllResources, resourceKey } from "@/lib/curriculum";
import { addDays, getWeekStart, toDateString } from "@/lib/date-utils";

export interface DayPlan {
  date: string;
  dayName: string;
  isRestDay: boolean;
  resource: ResourceWithContext | null;
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildWeeklyPlan(
  domains: Domain[],
  completed: ReadonlySet<string>,
  today: Date
): DayPlan[] {
  const weekStart = getWeekStart(today);
  const weekStartStr = toDateString(weekStart);

  const unchecked = getAllResources(domains).filter(
    (resource) => !completed.has(resourceKey(resource.domainId, resource.topicId, resource))
  );
  const random = seededRandom(hashString(weekStartStr));
  const shuffled = shuffle(unchecked, random);

  return DAY_NAMES.map((dayName, index) => {
    const date = toDateString(addDays(weekStart, index));
    const isRestDay = index >= 5;
    return {
      date,
      dayName,
      isRestDay,
      resource: isRestDay ? null : shuffled[index] ?? null,
    };
  });
}
