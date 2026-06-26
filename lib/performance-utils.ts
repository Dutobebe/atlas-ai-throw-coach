import { getDisciplineIcon } from "@/lib/design";
import {
  formatTechniqueDisplay,
  getDisciplineLabel,
  getSeriesBestThrow,
  isThrowSeries,
} from "@/lib/training-utils";
import type { TrainingSession, TrainingSeries } from "@/types/training";

export interface PerformanceFilters {
  discipline: string;
  implement: string;
  technique: string;
  year: number;
}

export interface PerformanceRecord {
  distance: number;
  date: string;
}

export interface PerformanceGroupRow {
  key: string;
  discipline: string;
  disciplineLabel: string;
  disciplineIcon: string;
  implement: string;
  technique: string;
  techniqueDisplay: string;
  pr: PerformanceRecord | null;
  seasonBest: PerformanceRecord | null;
}

export interface PerformanceFilterOptions {
  disciplines: string[];
  implements: string[];
  techniques: string[];
  years: number[];
}

interface RawEntry {
  discipline: string;
  implement: string;
  technique: string;
  distance: number;
  date: string;
}

export function isPerformanceEligibleSeries(series: TrainingSeries): boolean {
  return isThrowSeries(series);
}

function parseSessionYear(date: string): number | null {
  const year = parseInt(date.slice(0, 4), 10);
  return isNaN(year) ? null : year;
}

function groupKey(discipline: string, implement: string, technique: string): string {
  return `${discipline}\0${implement}\0${technique}`;
}

function collectEntries(sessions: TrainingSession[]): RawEntry[] {
  const entries: RawEntry[] = [];

  for (const session of sessions) {
    if (!session.date?.trim()) continue;

    for (const series of Array.isArray(session.series) ? session.series : []) {
      if (!isPerformanceEligibleSeries(series)) continue;

      const distance = getSeriesBestThrow(series);
      if (distance === null || distance <= 0) continue;

      entries.push({
        discipline: series.discipline ?? "disk",
        implement: series.implementWeight?.trim() ?? "",
        technique: series.technique?.trim() ?? "",
        distance,
        date: session.date,
      });
    }
  }

  return entries;
}

function computeBest(entries: RawEntry[]): PerformanceRecord | null {
  let best: PerformanceRecord | null = null;

  for (const entry of entries) {
    if (!best || entry.distance > best.distance) {
      best = { distance: entry.distance, date: entry.date };
    } else if (entry.distance === best.distance && entry.date < best.date) {
      best = { distance: entry.distance, date: entry.date };
    }
  }

  return best;
}

export function formatPerformanceDistance(distance: number): string {
  const rounded = Math.round(distance * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded} m` : `${rounded.toFixed(2)} m`;
}

export function getPerformanceFilterOptions(
  sessions: TrainingSession[]
): PerformanceFilterOptions {
  const entries = collectEntries(sessions);
  const years = new Set<number>([new Date().getFullYear()]);

  for (const session of sessions) {
    const year = parseSessionYear(session.date);
    if (year) years.add(year);
  }

  return {
    disciplines: [...new Set(entries.map((e) => e.discipline))].sort((a, b) =>
      getDisciplineLabel(a).localeCompare(getDisciplineLabel(b), "cs")
    ),
    implements: [...new Set(entries.map((e) => e.implement).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "cs")
    ),
    techniques: [...new Set(entries.map((e) => e.technique).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "cs")
    ),
    years: [...years].sort((a, b) => b - a),
  };
}

export function calculatePerformanceGroups(
  sessions: TrainingSession[],
  filters: PerformanceFilters
): PerformanceGroupRow[] {
  const entries = collectEntries(sessions);
  const byGroup = new Map<string, RawEntry[]>();

  for (const entry of entries) {
    const key = groupKey(entry.discipline, entry.implement, entry.technique);
    const bucket = byGroup.get(key);
    if (bucket) bucket.push(entry);
    else byGroup.set(key, [entry]);
  }

  const rows: PerformanceGroupRow[] = [];

  for (const [key, groupEntries] of byGroup) {
    const [discipline, implement, technique] = key.split("\0");

    if (filters.discipline && discipline !== filters.discipline) continue;
    if (filters.implement && implement !== filters.implement) continue;
    if (filters.technique && technique !== filters.technique) continue;

    const pr = computeBest(groupEntries);
    const seasonEntries = groupEntries.filter(
      (entry) => parseSessionYear(entry.date) === filters.year
    );
    const seasonBest = seasonEntries.length > 0 ? computeBest(seasonEntries) : null;

    rows.push({
      key,
      discipline,
      disciplineLabel: getDisciplineLabel(discipline),
      disciplineIcon: getDisciplineIcon(discipline),
      implement: implement || "—",
      technique: technique || "—",
      techniqueDisplay: technique
        ? formatTechniqueDisplay(discipline, technique)
        : "—",
      pr,
      seasonBest,
    });
  }

  return rows.sort((a, b) => {
    const byDiscipline = a.disciplineLabel.localeCompare(b.disciplineLabel, "cs");
    if (byDiscipline !== 0) return byDiscipline;
    const byImplement = a.implement.localeCompare(b.implement, "cs");
    if (byImplement !== 0) return byImplement;
    return a.technique.localeCompare(b.technique, "cs");
  });
}

export function defaultPerformanceFilters(
  options: PerformanceFilterOptions
): PerformanceFilters {
  return {
    discipline: "",
    implement: "",
    technique: "",
    year: options.years[0] ?? new Date().getFullYear(),
  };
}
