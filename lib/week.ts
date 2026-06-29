import { getWeekBounds } from "@/lib/discipline-throw-stats";

const WEEKDAY_SHORT = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"] as const;

export type WeekDateInput = Date | string;

export interface WeekDay {
  iso: string;
  weekday: string;
  dayNumber: number;
  isToday: boolean;
}

function toISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toRefDate(date: WeekDateInput): Date {
  return typeof date === "string" ? parseISODateLocal(date) : date;
}

function todayISO(): string {
  return toISODateLocal(new Date());
}

/** Monday (ISO date) of the week containing `date`. */
export function getWeekStart(date: WeekDateInput): string {
  const { start } = getWeekBounds(toRefDate(date));
  return toISODateLocal(start);
}

/** Sunday (ISO date) of the week containing `date`. */
export function getWeekEnd(date: WeekDateInput): string {
  const { end } = getWeekBounds(toRefDate(date));
  return toISODateLocal(end);
}

/** Monday of the current calendar week. */
export function getCurrentWeek(): string {
  return getWeekStart(new Date());
}

/** Monday of the week before the week containing `date`. */
export function getPreviousWeek(date: WeekDateInput): string {
  const monday = parseISODateLocal(getWeekStart(date));
  monday.setDate(monday.getDate() - 7);
  return toISODateLocal(monday);
}

/** Monday of the week after the week containing `date`. */
export function getNextWeek(date: WeekDateInput): string {
  const monday = parseISODateLocal(getWeekStart(date));
  monday.setDate(monday.getDate() + 7);
  return toISODateLocal(monday);
}

/** ISO-8601 week number for the week containing `date`. */
export function getISOWeek(date: WeekDateInput): number {
  const monday = parseISODateLocal(getWeekStart(date));
  monday.setHours(0, 0, 0, 0);

  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);

  const isoYear = thursday.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const jan4Weekday = jan4.getDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - (jan4Weekday - 1));
  week1Monday.setHours(0, 0, 0, 0);

  const diffDays = Math.round((monday.getTime() - week1Monday.getTime()) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}

/** Compact Czech date range for the week containing `date`. */
export function formatWeekRange(date: WeekDateInput): string {
  const { start, end } = getWeekBounds(toRefDate(getWeekStart(date)));
  const endDay = end.getDate();
  const endMonth = end.getMonth() + 1;
  const endYear = end.getFullYear();
  const startDay = start.getDate();
  const startMonth = start.getMonth() + 1;
  const startYear = start.getFullYear();

  if (startYear === endYear) {
    return `${startDay}.${startMonth}.–${endDay}.${endMonth}.${endYear}`;
  }
  return `${startDay}.${startMonth}.${startYear}.–${endDay}.${endMonth}.${endYear}`;
}

/** Seven days (Mon–Sun) for the week starting on `weekStart`. */
export function getWeekDays(weekStart: WeekDateInput): WeekDay[] {
  const start = parseISODateLocal(getWeekStart(weekStart));
  const today = todayISO();

  return WEEKDAY_SHORT.map((weekday, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const iso = toISODateLocal(day);
    return {
      iso,
      weekday,
      dayNumber: day.getDate(),
      isToday: iso === today,
    };
  });
}
