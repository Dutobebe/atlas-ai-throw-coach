import type { TrainingSession } from "@/types/training";
import { getDisciplineIcon } from "@/lib/design";
import { getSeriesThrowCount, isThrowSeries } from "@/lib/training-utils";

export interface DisciplineThrowPeriods {
  thisWeek: number;
  last30Days: number;
  thisYear: number;
}

export interface DisciplineThrowRow {
  key: string;
  label: string;
  icon: string;
  periods: DisciplineThrowPeriods;
  isTotal?: boolean;
}

export const DISCIPLINE_THROW_ROWS = [
  { key: "disk", label: "Disk" },
  { key: "kladivo", label: "Kladivo" },
  { key: "koule", label: "Koule" },
] as const;

function parseLocalDate(iso: string): Date | null {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Current calendar week: Monday through Sunday */
export function getWeekBounds(refDate: Date): { start: Date; end: Date } {
  const d = startOfDay(refDate);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = endOfDay(new Date(monday));
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

function emptyPeriods(): DisciplineThrowPeriods {
  return { thisWeek: 0, last30Days: 0, thisYear: 0 };
}

export function calculateDisciplineThrowStats(
  sessions: TrainingSession[],
  refDate: Date = new Date()
): { rows: DisciplineThrowRow[]; total: DisciplineThrowPeriods } {
  const today = startOfDay(refDate);
  const todayEnd = endOfDay(refDate);
  const week = getWeekBounds(refDate);

  const rolling30Start = new Date(today);
  rolling30Start.setDate(rolling30Start.getDate() - 29);

  const yearStart = startOfDay(new Date(refDate.getFullYear(), 0, 1));
  const yearEnd = endOfDay(new Date(refDate.getFullYear(), 11, 31));

  const byDiscipline: Record<string, DisciplineThrowPeriods> = {};
  const total = emptyPeriods();

  for (const key of DISCIPLINE_THROW_ROWS) {
    byDiscipline[key.key] = emptyPeriods();
  }

  for (const session of sessions) {
    const sessionDate = parseLocalDate(session.date);
    if (!sessionDate) continue;

    const inWeek = sessionDate >= week.start && sessionDate <= week.end;
    const in30 = sessionDate >= rolling30Start && sessionDate <= todayEnd;
    const inYear = sessionDate >= yearStart && sessionDate <= yearEnd;

    if (!inWeek && !in30 && !inYear) continue;

    for (const series of Array.isArray(session.series) ? session.series : []) {
      if (!isThrowSeries(series)) continue;
      const count = getSeriesThrowCount(series);
      if (count <= 0) continue;

      const bucket = byDiscipline[series.discipline] ?? null;

      if (inWeek) {
        total.thisWeek += count;
        if (bucket) bucket.thisWeek += count;
      }
      if (in30) {
        total.last30Days += count;
        if (bucket) bucket.last30Days += count;
      }
      if (inYear) {
        total.thisYear += count;
        if (bucket) bucket.thisYear += count;
      }
    }
  }

  const rows: DisciplineThrowRow[] = DISCIPLINE_THROW_ROWS.map((row) => ({
    ...row,
    icon: getDisciplineIcon(row.key),
    periods: byDiscipline[row.key],
  }));

  rows.push({
    key: "total",
    label: "Celkem",
    icon: "📊",
    periods: total,
    isTotal: true,
  });

  return { rows, total };
}
