const DISK_GOALS = [
  "Rytmus",
  "Levá noha",
  "Pravá ruka",
  "Rotace",
  "Blok",
  "Výstup",
  "Směr",
  "Punchout",
  "Rychlost",
  "Uvolnění",
] as const;

const KLADIVO_GOALS = [
  "Dlouhé ruce",
  "Přechod na paty",
  "Osa",
  "Cupitání",
  "Trpělivost",
  "Zrychlení",
  "Výstup",
  "Rovnováha",
  "Nízké paty",
] as const;

const KOULE_GOALS = [
  "Blok",
  "Punch",
  "Výjezd",
  "Dokrok",
  "Rotace",
  "Rychlost",
  "Směr",
] as const;

const OSTEP_GOALS = [
  "Rozběh",
  "Blok",
  "Hodová paže",
  "Přenos",
  "Výhoz",
] as const;

export const GENERAL_GOALS = [
  "Rozcvičení",
  "Regenerace",
  "Síla",
  "Rychlost",
  "Stabilita",
] as const;

const GOALS_BY_DISCIPLINE: Record<string, readonly string[]> = {
  disk: DISK_GOALS,
  kladivo: KLADIVO_GOALS,
  koule: KOULE_GOALS,
  ostep: OSTEP_GOALS,
};

export const MAX_SERIES_GOALS = 3;

/** Discipline-specific goals plus GENERAL goals (deduplicated order). */
export function getGoalsForDiscipline(discipline: string): string[] {
  const specific = GOALS_BY_DISCIPLINE[discipline] ?? [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const goal of [...specific, ...GENERAL_GOALS]) {
    if (seen.has(goal)) continue;
    seen.add(goal);
    result.push(goal);
  }

  return result;
}

/** Normalize stored goals: valid for discipline, unique, max 3. */
export function normalizeSeriesGoals(
  goals: string[] | undefined,
  discipline: string
): string[] {
  const allowed = new Set(getGoalsForDiscipline(discipline));
  if (!Array.isArray(goals)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const goal of goals) {
    const trimmed = goal?.trim();
    if (!trimmed || !allowed.has(trimmed) || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
    if (result.length >= MAX_SERIES_GOALS) break;
  }

  return result;
}

export function filterGoalsForDiscipline(goals: string[], discipline: string): string[] {
  return normalizeSeriesGoals(goals, discipline);
}

export function formatSeriesGoalsDisplay(goals: string[] | undefined): string {
  if (!Array.isArray(goals) || goals.length === 0) return "";
  return goals.join(" · ");
}
