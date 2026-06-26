import { getBestValidAttempt } from "@/lib/competition-utils";
import { getDisciplineIcon } from "@/lib/design";
import {
  formatTechniqueDisplay,
  getDisciplineLabel,
  getSeriesBestThrow,
  isThrowSeries,
} from "@/lib/training-utils";
import type { Season } from "@/types/season";
import type { TrainingSession, TrainingSeries } from "@/types/training";

export type PerformanceSourceFilter = "" | "official" | "unofficial";

export interface PerformanceFilters {
  discipline: string;
  implement: string;
  technique: string;
  year: number;
  source: PerformanceSourceFilter;
}

export interface PerformanceRecord {
  distance: number;
  date: string;
  official: boolean;
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
  hasOfficial: boolean;
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
  official: boolean;
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

function collectTrainingEntries(sessions: TrainingSession[]): RawEntry[] {
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
        official: false,
      });
    }
  }

  return entries;
}

function collectCompetitionEntries(seasons: Season[]): RawEntry[] {
  const entries: RawEntry[] = [];

  for (const season of seasons) {
    for (const competition of season.competitions) {
      for (const result of competition.competitionResults) {
        if (!result.official) continue;

        const distance = getBestValidAttempt(result);
        if (distance === null || distance <= 0) continue;

        entries.push({
          discipline: result.discipline || "disk",
          implement: result.implement?.trim() ?? "",
          technique: "",
          distance,
          date: competition.date,
          official: true,
        });
      }
    }
  }

  return entries;
}

function collectEntries(sessions: TrainingSession[], seasons: Season[]): RawEntry[] {
  return [...collectTrainingEntries(sessions), ...collectCompetitionEntries(seasons)];
}

function computeBest(entries: RawEntry[]): PerformanceRecord | null {
  let best: PerformanceRecord | null = null;

  for (const entry of entries) {
    if (!best || entry.distance > best.distance) {
      best = {
        distance: entry.distance,
        date: entry.date,
        official: entry.official,
      };
    } else if (entry.distance === best.distance && entry.date < best.date) {
      best = {
        distance: entry.distance,
        date: entry.date,
        official: entry.official,
      };
    }
  }

  return best;
}

export function formatPerformanceDistance(distance: number): string {
  const rounded = Math.round(distance * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded} m` : `${rounded.toFixed(2)} m`;
}

export function getPerformanceFilterOptions(
  sessions: TrainingSession[],
  seasons: Season[] = []
): PerformanceFilterOptions {
  const entries = collectEntries(sessions, seasons);
  const years = new Set<number>([new Date().getFullYear()]);

  for (const session of sessions) {
    const year = parseSessionYear(session.date);
    if (year) years.add(year);
  }

  for (const season of seasons) {
    for (const competition of season.competitions) {
      const year = parseSessionYear(competition.date);
      if (year) years.add(year);
    }
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
  seasons: Season[],
  filters: PerformanceFilters
): PerformanceGroupRow[] {
  const entries = collectEntries(sessions, seasons).filter((entry) => {
    if (filters.source === "official") return entry.official;
    if (filters.source === "unofficial") return !entry.official;
    return true;
  });

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
    const hasOfficial = groupEntries.some((entry) => entry.official);

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
      hasOfficial,
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
    source: "",
  };
}

export function hasAnyPerformanceData(sessions: TrainingSession[], seasons: Season[]): boolean {
  return collectEntries(sessions, seasons).length > 0;
}
