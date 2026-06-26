import { getSessionDisciplineSummary } from "@/lib/history-display";
import { getSeriesThrowCount, isThrowSeries } from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";

const WEEKDAYS = [
  "neděle",
  "pondělí",
  "úterý",
  "středa",
  "čtvrtek",
  "pátek",
  "sobota",
] as const;

export interface DashboardStats {
  throws: number;
  seriesCount: number;
  sessionCount: number;
}

export function getSessionThrowCount(session: TrainingSession): number {
  const series = Array.isArray(session.series) ? session.series : [];
  return series.reduce(
    (total, item) => (isThrowSeries(item) ? total + getSeriesThrowCount(item) : total),
    0
  );
}

export function getLastTraining(sessions: TrainingSession[]): TrainingSession | null {
  if (sessions.length === 0) return null;
  return [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

export function formatTodayLong(date: Date = new Date()): string {
  const weekday = WEEKDAYS[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${weekday} ${day}. ${month}. ${year}`;
}

export function daysUntil(isoDate: string, refDate: Date = new Date()): number | null {
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;

  const [y, m, d] = parts;
  const target = new Date(y, m - 1, d);
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatCountdown(days: number): string {
  if (days < 0) return "Proběhl";
  if (days === 0) return "Dnes";
  if (days === 1) return "Zítra";
  return `Za ${days} dní`;
}

export { getSessionDisciplineSummary };
