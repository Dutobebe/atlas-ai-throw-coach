import type { PhaseType } from "@/types/plan";
import type { SeriesPurpose, SeriesStats, SeriesType, Throw, TrainingSeries, TrainingSession } from "@/types/training";
import { getImplementPresets, resolveImplementForDiscipline } from "@/lib/implement-options";
import { normalizeSeriesGoals } from "@/lib/goal-library";
import { normalizeEvaluation } from "@/lib/evaluation-utils";
import {
  DEFAULT_RACE_INTENSITY_PERCENT,
  DEFAULT_TECHNIQUE_INTENSITY_PERCENT,
} from "@/lib/intensity-presets";

export const DISCIPLINES = [
  { value: "disk", label: "Disk" },
  { value: "kladivo", label: "Kladivo" },
  { value: "koule", label: "Koule" },
  { value: "ostep", label: "Oštěp" },
  { value: "medicinbal", label: "Medicinbal" },
  { value: "posilovna", label: "Posilovna" },
  { value: "kardio", label: "Kardio" },
  { value: "mobilita", label: "Mobilita" },
] as const;

export const SERIES_PURPOSES: { value: SeriesPurpose; label: string }[] = [
  { value: "technique", label: "Technika" },
  { value: "speed", label: "Rychlost" },
  { value: "competition", label: "Soutěž" },
  { value: "warmup", label: "Rozcvička" },
];

export const SERIES_TYPES: { value: SeriesType; label: string }[] = [
  { value: "Throw", label: "🎯 Hod" },
  { value: "Imitation", label: "🔄 Imitace (IMI)" },
  { value: "Drill", label: "⚙️ Drill" },
  { value: "Exercise", label: "🏋️ Cvičení" },
];

export const SERIES_TYPE_LABELS: Record<SeriesType, string> = {
  Throw: "🎯 Hod",
  Imitation: "🔄 IMI",
  Drill: "⚙️ Drill",
  Exercise: "🏋️ Cvičení",
};

export const IMI_IMPLEMENT_VALUE = "IMI";
export const DEFAULT_INTENSITY_PERCENT = DEFAULT_TECHNIQUE_INTENSITY_PERCENT;

export function getDefaultIntensityPercent(options?: {
  sessionType?: PhaseType;
  purpose?: SeriesPurpose;
}): number {
  if (options?.sessionType === "competition" || options?.purpose === "competition") {
    return DEFAULT_RACE_INTENSITY_PERCENT;
  }
  return DEFAULT_TECHNIQUE_INTENSITY_PERCENT;
}

export const TAB_LABELS = {
  dashboard: "Přehled",
  plan: "Plán",
  season: "Sezóna",
  training: "Trénink",
  live: "Aktivní trénink",
  evaluation: "Vyhodnocení tréninku",
  performance: "Výkony",
  history: "Historie",
  statistics: "Statistiky",
  profile: "Profil",
} as const;

export function uid(): string {
  return crypto.randomUUID();
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function parseThrowValue(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

export function getDisciplineLabel(value: string): string {
  return DISCIPLINES.find((d) => d.value === value)?.label ?? value;
}

export function getPurposeLabel(value: SeriesPurpose | string): string {
  return SERIES_PURPOSES.find((p) => p.value === value)?.label ?? value;
}

export function getSeriesIntensityPercent(series: TrainingSeries): number {
  if (typeof series.intensityPercent === "number" && !isNaN(series.intensityPercent)) {
    return Math.min(100, Math.max(0, Math.round(series.intensityPercent)));
  }
  return DEFAULT_INTENSITY_PERCENT;
}

export { formatTechniqueDisplay } from "@/lib/technique-library";

export function getSeriesTypeLabel(type: SeriesType | string | undefined): string {
  if (type === "Throw" || type === "Imitation" || type === "Drill" || type === "Exercise") {
    return SERIES_TYPE_LABELS[type];
  }
  return SERIES_TYPE_LABELS.Throw;
}

export function isValidSeriesType(value: unknown): value is SeriesType {
  return value === "Throw" || value === "Imitation" || value === "Drill" || value === "Exercise";
}

/** Only Throw series count toward throw totals and performance statistics. */
export function isThrowSeries(series: { seriesType?: SeriesType }): boolean {
  return (series.seriesType ?? "Throw") === "Throw";
}

export function isImitationSeries(series: { seriesType?: SeriesType }): boolean {
  return series.seriesType === "Imitation";
}

export function showsBestThrowField(series: { seriesType?: SeriesType }): boolean {
  return isThrowSeries(series);
}

export function showsImplementField(series: { seriesType?: SeriesType }): boolean {
  return series.seriesType !== "Imitation";
}

function resolveSeriesType(series: TrainingSeries): SeriesType {
  if (isValidSeriesType(series.seriesType)) {
    return series.seriesType;
  }
  if (series.implementWeight?.trim().toUpperCase() === IMI_IMPLEMENT_VALUE) {
    return "Imitation";
  }
  return "Throw";
}

/** @deprecated legacy throws/marks array — used only for migrating old sessions */
function getLegacyThrows(series: TrainingSeries): Throw[] {
  if (Array.isArray(series.throws)) return series.throws;
  if (Array.isArray(series.marks)) return series.marks;
  return [];
}

function legacyBestFromThrows(series: TrainingSeries): number | null {
  let best: number | null = null;
  for (const t of getLegacyThrows(series)) {
    const val = parseThrowValue(t.value);
    if (val !== null && (best === null || val > best)) {
      best = val;
    }
  }
  return best;
}

export function getSeriesThrowCount(series: TrainingSeries): number {
  if (typeof series.throwCount === "number" && series.throwCount >= 0) {
    return series.throwCount;
  }
  return getLegacyThrows(series).filter((t) => t.value.trim()).length;
}

export function getSeriesBestThrow(series: TrainingSeries): number | null {
  const fromField = parseThrowValue(series.bestThrow ?? "");
  if (fromField !== null) return fromField;
  return legacyBestFromThrows(series);
}

export function calculateSeriesStats(series: TrainingSeries): SeriesStats {
  const count = getSeriesThrowCount(series);
  return {
    count,
    best: isThrowSeries(series) ? getSeriesBestThrow(series) : null,
    average: null,
  };
}

export const SESSION_TYPES: { value: PhaseType; label: string }[] = [
  { value: "training", label: "Trénink" },
  { value: "rest", label: "Volno" },
  { value: "regeneration", label: "Regenerace" },
  { value: "competition", label: "Závod" },
  { value: "activation", label: "Aktivace" },
];

export function getSessionTypeLabel(value: PhaseType | string): string {
  return SESSION_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function emptySeries(
  discipline = "disk",
  options?: { sessionType?: PhaseType; purpose?: SeriesPurpose }
): TrainingSeries {
  const purpose = options?.purpose ?? "technique";
  return {
    id: uid(),
    seriesType: "Throw",
    discipline: discipline || "disk",
    technique: "",
    implementWeight: getImplementPresets(discipline || "disk")[0] ?? "",
    throwCount: 0,
    bestThrow: "",
    purpose,
    note: "",
    goals: [],
    intensityPercent: getDefaultIntensityPercent({ sessionType: options?.sessionType, purpose }),
  };
}

export function emptySession(): TrainingSession {
  return {
    id: uid(),
    date: todayISO(),
    title: "",
    location: "",
    weather: "",
    readiness: 70,
    rpe: 5,
    note: "",
    disciplines: [],
    sessionType: "training",
    series: [],
    createdAt: new Date().toISOString(),
  };
}

export function normalizeSeries(series: TrainingSeries): TrainingSeries {
  const seriesType = resolveSeriesType(series);
  const throwCount = getSeriesThrowCount(series);
  const isImitation = seriesType === "Imitation";
  const isThrow = seriesType === "Throw";

  const parsedBest = parseThrowValue(series.bestThrow ?? "");
  const legacyBest = legacyBestFromThrows(series);
  const bestThrow = isThrow
    ? parsedBest !== null
      ? series.bestThrow ?? String(parsedBest)
      : legacyBest !== null
        ? String(legacyBest)
        : series.bestThrow ?? ""
    : "";

  return {
    ...series,
    seriesType,
    discipline: series.discipline ?? "disk",
    implementWeight: isImitation
      ? IMI_IMPLEMENT_VALUE
      : showsImplementField({ seriesType })
        ? resolveImplementForDiscipline(series.discipline ?? "disk", series.implementWeight ?? "")
        : "",
    throwCount,
    bestThrow,
    purpose: series.purpose ?? "technique",
    intensityPercent: getSeriesIntensityPercent(series),
    goals: normalizeSeriesGoals(series.goals, series.discipline ?? "disk"),
  };
}

function isSessionType(value: unknown): value is PhaseType {
  return (
    value === "training" ||
    value === "rest" ||
    value === "regeneration" ||
    value === "competition" ||
    value === "activation"
  );
}

export function normalizeSession(session: TrainingSession): TrainingSession {
  const series = Array.isArray(session.series) ? session.series : [];
  const normalizedSeries = series.map(normalizeSeries);

  let disciplines = Array.isArray(session.disciplines) ? session.disciplines.filter(Boolean) : [];
  if (disciplines.length === 0 && normalizedSeries.length > 0) {
    disciplines = [
      ...new Set(normalizedSeries.map((item) => item.discipline).filter(Boolean)),
    ];
  }

  return {
    ...session,
    location: session.location ?? "",
    weather: session.weather ?? "",
    readiness: session.readiness ?? 70,
    disciplines,
    sessionType: isSessionType(session.sessionType) ? session.sessionType : "training",
    series: normalizedSeries,
    createdFromPlanId: session.createdFromPlanId || undefined,
    evaluation: normalizeEvaluation(session.evaluation),
  };
}

export function syncSessionForStorage(session: TrainingSession): TrainingSession {
  return normalizeSession(session);
}

export function countThrows(sessions: TrainingSession[]): number {
  return sessions.reduce(
    (total, s) =>
      total +
      (Array.isArray(s.series) ? s.series : []).reduce((st, ser) => {
        if (!isThrowSeries(ser)) return st;
        return st + getSeriesThrowCount(ser);
      }, 0),
    0
  );
}

export function countSeries(sessions: TrainingSession[]): number {
  return sessions.reduce(
    (total, s) => total + (Array.isArray(s.series) ? s.series.length : 0),
    0
  );
}

/** @deprecated use getDisciplineLabel — kept for History screen */
export function getEquipmentLabel(value: string): string {
  const legacy: Record<string, string> = {
    treningovy: "Tréninkový",
    soutezni: "Soutěžní",
    lehky: "Lehký",
    tezky: "Těžký",
  };
  return legacy[value] ?? value;
}
