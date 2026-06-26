import { daysUntil } from "@/lib/dashboard-utils";
import {
  computeBestValidAttempt,
  createDefaultAttempts,
  normalizeAttempts,
} from "@/lib/competition-utils";
import { uid, formatDate, getDisciplineLabel } from "@/lib/training-utils";
import type {
  Competition,
  CompetitionResult,
  CompetitionStatus,
  Season,
} from "@/types/season";

export const SEASONS_STORAGE_KEY = "atlas-seasons";
const LEGACY_COMPETITION_KEY = "atlas-next-competition";

export const COMPETITION_STATUS_LABELS: Record<CompetitionStatus, string> = {
  planned: "Plánovaný",
  completed: "Dokončený",
};

export interface CompetitionPrepOption {
  id: string;
  label: string;
}

interface LegacyCompetitionFields {
  disciplines?: string[];
  implementWeight?: string;
  implement?: string;
  targetPerformance?: string;
  resultLink?: string;
  placement?: string;
  official?: boolean;
  attempts?: unknown;
}

function isCompetitionStatus(value: unknown): value is CompetitionStatus {
  return value === "planned" || value === "completed";
}

export function emptyCompetitionResult(discipline = "disk"): CompetitionResult {
  return {
    id: uid(),
    discipline,
    implement: "",
    official: false,
    placement: "",
    resultLink: "",
    attempts: createDefaultAttempts(),
    bestAttempt: null,
    notes: "",
  };
}

export function emptyCompetition(): Competition {
  return {
    id: uid(),
    date: new Date().toISOString().slice(0, 10),
    name: "",
    location: "",
    status: "planned",
    notes: "",
    competitionResults: [],
  };
}

export function emptySeason(year: number = new Date().getFullYear()): Season {
  return {
    year,
    mainGoal: "",
    secondaryGoals: [],
    competitions: [],
  };
}

export function normalizeCompetitionResult(
  raw: Partial<CompetitionResult> & { id?: string; implementWeight?: string }
): CompetitionResult {
  const attempts = normalizeAttempts(raw.attempts);
  const implement = raw.implement?.trim() ?? raw.implementWeight?.trim() ?? "";

  return {
    id: raw.id ?? uid(),
    discipline: raw.discipline?.trim() || "disk",
    implement,
    official: Boolean(raw.official),
    placement: raw.placement?.trim() ?? "",
    resultLink: raw.resultLink?.trim() ?? "",
    attempts,
    bestAttempt: computeBestValidAttempt(attempts),
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function hasLegacyResultData(raw: LegacyCompetitionFields): boolean {
  return Boolean(
    raw.implementWeight?.trim() ||
      raw.implement?.trim() ||
      raw.placement?.trim() ||
      raw.resultLink?.trim() ||
      raw.official ||
      raw.targetPerformance?.trim() ||
      (Array.isArray(raw.attempts) &&
        raw.attempts.some((item) => {
          const attempt = item as { status?: string; distance?: string };
          return attempt.status === "valid" && Boolean(attempt.distance?.trim());
        }))
  );
}

function migrateLegacyCompetitionResults(
  raw: Partial<Competition> & LegacyCompetitionFields
): CompetitionResult[] {
  if (Array.isArray(raw.competitionResults) && raw.competitionResults.length > 0) {
    return raw.competitionResults.map((item) => normalizeCompetitionResult(item));
  }

  const legacyDisciplines = Array.isArray(raw.disciplines)
    ? raw.disciplines.filter(Boolean)
    : [];

  if (legacyDisciplines.length === 0 && !hasLegacyResultData(raw)) {
    return [];
  }

  const disciplines = legacyDisciplines.length > 0 ? legacyDisciplines : ["disk"];

  return disciplines.map((discipline, index) =>
    normalizeCompetitionResult({
      discipline,
      implement: raw.implementWeight ?? raw.implement ?? "",
      official: raw.official,
      placement: raw.placement,
      resultLink: raw.resultLink,
      attempts: index === 0 ? normalizeAttempts(raw.attempts) : createDefaultAttempts(),
      notes: index === 0 && raw.targetPerformance?.trim() ? raw.targetPerformance.trim() : "",
    })
  );
}

export function normalizeCompetition(
  raw: Partial<Competition> & LegacyCompetitionFields & { id?: string }
): Competition {
  return {
    id: raw.id ?? uid(),
    date: raw.date ?? new Date().toISOString().slice(0, 10),
    name: raw.name?.trim() ?? "",
    location: raw.location?.trim() ?? "",
    status: isCompetitionStatus(raw.status) ? raw.status : "planned",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    competitionResults: migrateLegacyCompetitionResults(raw),
  };
}

export function normalizeSeason(raw: Partial<Season> & { year?: number }): Season {
  const year = typeof raw.year === "number" && !isNaN(raw.year)
    ? raw.year
    : new Date().getFullYear();

  return {
    year,
    mainGoal: typeof raw.mainGoal === "string" ? raw.mainGoal : "",
    secondaryGoals: Array.isArray(raw.secondaryGoals)
      ? raw.secondaryGoals.map((g) => g.trim()).filter(Boolean)
      : [],
    competitions: Array.isArray(raw.competitions)
      ? raw.competitions.map((item) => normalizeCompetition(item))
      : [],
  };
}

function migrateLegacyCompetition(seasons: Season[]): Season[] {
  if (typeof window === "undefined") return seasons;

  try {
    const raw = localStorage.getItem(LEGACY_COMPETITION_KEY);
    if (!raw) return seasons;

    const parsed = JSON.parse(raw) as { name?: string; date?: string };
    if (!parsed?.date || !parsed?.name?.trim()) {
      localStorage.removeItem(LEGACY_COMPETITION_KEY);
      return seasons;
    }

    const year = Number(parsed.date.split("-")[0]) || new Date().getFullYear();
    const season = getSeasonForYear(seasons, year);
    const name = parsed.name.trim();
    const exists = season.competitions.some(
      (item) => item.date === parsed.date && item.name === name
    );

    let next = seasons;
    if (!exists) {
      next = upsertSeason(seasons, {
        ...season,
        competitions: [
          ...season.competitions,
          normalizeCompetition({
            date: parsed.date,
            name,
            status: "planned",
          }),
        ],
      });
    }

    localStorage.removeItem(LEGACY_COMPETITION_KEY);
    return next;
  } catch {
    return seasons;
  }
}

export function loadSeasons(): Season[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(SEASONS_STORAGE_KEY);
    let seasons: Season[] = [];

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        seasons = parsed.map((item) => normalizeSeason(item as Season));
      }
    }

    return migrateLegacyCompetition(seasons);
  } catch {
    return migrateLegacyCompetition([]);
  }
}

export function getSeasonForYear(seasons: Season[], year: number): Season {
  return seasons.find((item) => item.year === year) ?? emptySeason(year);
}

export function upsertSeason(seasons: Season[], season: Season): Season[] {
  const normalized = normalizeSeason(season);
  const index = seasons.findIndex((item) => item.year === normalized.year);

  if (index >= 0) {
    return seasons.map((item, i) => (i === index ? normalized : item));
  }

  return [...seasons, normalized].sort((a, b) => b.year - a.year);
}

export function getAllCompetitions(seasons: Season[]): Array<Competition & { year: number }> {
  return seasons.flatMap((season) =>
    season.competitions.map((competition) => ({ ...competition, year: season.year }))
  );
}

export function findCompetition(
  seasons: Season[],
  competitionId: string | undefined
): (Competition & { year: number }) | null {
  if (!competitionId) return null;

  for (const season of seasons) {
    const match = season.competitions.find((item) => item.id === competitionId);
    if (match) return { ...match, year: season.year };
  }

  return null;
}

export function getCompetitionPrepLabel(
  seasons: Season[],
  competitionId: string | undefined
): string | null {
  const competition = findCompetition(seasons, competitionId);
  if (!competition?.name.trim()) return null;
  return competition.name.trim();
}

export function getCompetitionPrepOptions(seasons: Season[]): CompetitionPrepOption[] {
  return getAllCompetitions(seasons)
    .filter((item) => item.status === "planned" && item.name.trim())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      id: item.id,
      label: `${formatDate(item.date)} — ${item.name.trim()}${item.location ? ` (${item.location})` : ""}`,
    }));
}

export function getNextCompetition(seasons: Season[]): Competition | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = getAllCompetitions(seasons)
    .filter((item) => {
      if (item.status !== "planned" || !item.name.trim()) return false;
      const remaining = daysUntil(item.date, today);
      return remaining !== null && remaining >= 0;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) return null;

  const { year, ...competition } = upcoming[0];
  void year;
  return competition;
}

export function sortCompetitions(competitions: Competition[]): Competition[] {
  return [...competitions].sort((a, b) => a.date.localeCompare(b.date));
}

export function parseSecondaryGoals(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatSecondaryGoals(goals: string[]): string {
  return goals.join("\n");
}

export function getCompetitionsForDate(
  seasons: Season[],
  iso: string
): Array<Competition & { year: number }> {
  return getAllCompetitions(seasons)
    .filter((item) => item.date === iso && item.name.trim())
    .sort((a, b) => a.name.localeCompare(b.name, "cs"));
}

export function formatCompetitionDisciplinesCompact(competition: Competition): string {
  return competition.competitionResults
    .map((result) => getDisciplineLabel(result.discipline))
    .join(" • ");
}

export function competitionHasOfficialResults(competition: Competition): boolean {
  return competition.competitionResults.some((result) => result.official);
}
