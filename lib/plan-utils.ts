import { getWeekBounds } from "@/lib/discipline-throw-stats";
import { getWeekDays, getWeekStart } from "@/lib/week";
import { getDisciplineIcon } from "@/lib/design";
import { parsePlanTextToSeries } from "@/lib/plan-text-parser";
import {
  emptyPlannedSeries,
  normalizePlannedSeries,
  plannedSeriesToTrainingSeries,
} from "@/lib/planned-series-utils";
import {
  normalizeSession,
  normalizeSeries,
  todayISO,
  uid,
  getDisciplineLabel,
} from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";
import type { PhaseStatus, PhaseType, PlanPhase, PlannedSeries, PlanTrainingCategory } from "@/types/plan";

export const PLANS_STORAGE_KEY = "atlas-plans";
const LEGACY_PLANS_STORAGE_KEY = "atlas-training-plans";

export type { WeekDay } from "@/lib/week";
export {
  formatWeekRange,
  getCurrentWeek,
  getISOWeek,
  getISOWeek as getISOWeekNumber,
  getNextWeek,
  getPreviousWeek,
  getWeekDays,
  getWeekEnd,
  getWeekStart,
  getWeekStart as getWeekStartISO,
} from "@/lib/week";

export const PHASE_TYPES: { value: PhaseType; label: string }[] = [
  { value: "training", label: "Trénink" },
  { value: "rest", label: "Volno" },
  { value: "regeneration", label: "Regenerace" },
  { value: "competition", label: "Závod" },
  { value: "activation", label: "Aktivace" },
];

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  planned: "Plánováno",
  started: "Zahájeno",
  completed: "Splněno",
  skipped: "Vynecháno",
  changed: "Změněno",
};

export const PLAN_TRAINING_CATEGORIES: { value: PlanTrainingCategory; label: string }[] = [
  { value: "Vrhy", label: "Vrhy" },
  { value: "Kardio", label: "Kardio" },
  { value: "Síla", label: "Síla" },
  { value: "Jiné", label: "Jiné" },
];

function isTrainingCategory(value: unknown): value is PlanTrainingCategory {
  return value === "Vrhy" || value === "Kardio" || value === "Síla" || value === "Jiné";
}

export function getTrainingCategoryLabel(category?: PlanTrainingCategory): string {
  return PLAN_TRAINING_CATEGORIES.find((item) => item.value === category)?.label ?? "Vrhy";
}

export function getPlanTextPlaceholder(category: PlanTrainingCategory): string {
  switch (category) {
    case "Vrhy":
      return "Kladivo:\n6kg 2/2 8 hodů\n7,26kg 2/1 6 hodů\n\nDisk:\n1,5kg z místa 8 hodů";
    case "Kardio":
      return "např. 45 min běh v tempu, intervaly 6×3 min…";
    case "Síla":
      return "např. dřep 4×6, bench 3×8, shyby 3×10…";
    default:
      return "Volný popis tréninku…";
  }
}

interface LegacyPlannedSeriesItem {
  id?: string;
  discipline?: string;
  note?: string;
}

interface LegacyTrainingPlan {
  id: string;
  date: string;
  title?: string;
  disciplines?: string[];
  plannedSeries?: LegacyPlannedSeriesItem[];
  goal?: string;
  notes?: string;
  note?: string;
  completed?: boolean;
  createdAt?: string;
}

function isPhaseType(value: unknown): value is PhaseType {
  return (
    value === "training" ||
    value === "rest" ||
    value === "regeneration" ||
    value === "competition" ||
    value === "activation"
  );
}

function isPhaseStatus(value: unknown): value is PhaseStatus {
  return (
    value === "planned" ||
    value === "started" ||
    value === "completed" ||
    value === "skipped" ||
    value === "changed"
  );
}

function migrateLegacySeries(items: LegacyPlannedSeriesItem[] | undefined): PlannedSeries[] {
  if (!Array.isArray(items) || items.length === 0) {
    return [emptyPlannedSeries()];
  }

  return items.map((item) =>
    normalizePlannedSeries({
      ...emptyPlannedSeries(item.discipline ?? "disk"),
      id: item.id ?? uid(),
      discipline: item.discipline ?? "disk",
      note: item.note ?? "",
    })
  );
}

function migrateLegacyPlan(plan: LegacyTrainingPlan): PlanPhase {
  return normalizePhase({
    id: plan.id,
    date: plan.date,
    title: plan.title ?? "",
    type: "training",
    disciplines: Array.isArray(plan.disciplines) ? plan.disciplines : [],
    plannedSeries: migrateLegacySeries(plan.plannedSeries),
    planText: "",
    goal: plan.goal ?? "",
    note: plan.notes ?? plan.note ?? "",
    status: plan.completed ? "completed" : "planned",
    createdAt: plan.createdAt ?? new Date().toISOString(),
  });
}

function parseStoredPhases(raw: unknown): PlanPhase[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const record = item as Partial<PlanPhase> & LegacyTrainingPlan;

    if (isPhaseType(record.type) && isPhaseStatus(record.status)) {
      return normalizePhase(record as PlanPhase);
    }

    return migrateLegacyPlan(record);
  });
}

export function getPhasesForWeek(phases: PlanPhase[], weekStart: string): PlanPhase[] {
  const days = getWeekDays(weekStart);
  const daySet = new Set(days.map((day) => day.iso));
  return phases.filter((phase) => daySet.has(phase.date));
}

export function formatWeekRangeShort(weekStart: string): string {
  const ref = parseISODateFromISO(getWeekStart(weekStart));
  const { start, end } = getWeekBounds(ref);
  const startDay = start.getDate();
  const startMonth = start.getMonth() + 1;
  const endDay = end.getDate();
  const endMonth = end.getMonth() + 1;

  if (startMonth === endMonth) {
    return `${startDay}. – ${endDay}. ${endMonth}.`;
  }
  return `${startDay}. ${startMonth}. – ${endDay}. ${endMonth}.`;
}

function parseISODateFromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shiftWeek(refDate: Date, weeks: number): Date {
  const next = new Date(refDate);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

export function isSameWeek(a: Date, b: Date): boolean {
  const { start: startA } = getWeekBounds(a);
  const { start: startB } = getWeekBounds(b);
  return startA.getTime() === startB.getTime();
}

export function emptyPhase(date: string = todayISO(), category: PlanTrainingCategory = "Vrhy"): PlanPhase {
  return {
    id: uid(),
    date,
    title: getTrainingCategoryLabel(category),
    type: "training",
    disciplines: [],
    plannedSeries: [],
    planText: "",
    trainingCategory: category,
    goal: "",
    note: "",
    status: "planned",
    createdAt: new Date().toISOString(),
  };
}

function plannedSeriesToPlanText(series: PlannedSeries[]): string {
  const lines: string[] = [];
  let lastDiscipline = "";

  for (const item of series) {
    if (!item.discipline && !item.technique && item.throwCount <= 0 && !item.note) {
      continue;
    }

    if (item.discipline && item.discipline !== lastDiscipline) {
      if (lines.length > 0) lines.push("");
      lines.push(`${getDisciplineLabel(item.discipline)}:`);
      lastDiscipline = item.discipline;
    }

    const parts: string[] = [];
    if (item.implementWeight) {
      parts.push(item.implementWeight.replace(/\s+/g, ""));
    }
    if (item.technique) parts.push(item.technique);
    if (item.throwCount > 0) parts.push(`${item.throwCount} hodů`);
    if (parts.length > 0) {
      lines.push(parts.join(" "));
    } else if (item.note) {
      lines.push(item.note);
    }
  }

  return lines.join("\n").trim();
}

function resolvePlanText(phase: PlanPhase): string {
  if (typeof phase.planText === "string") {
    return phase.planText;
  }

  const fromSeries = plannedSeriesToPlanText(
    Array.isArray(phase.plannedSeries) ? phase.plannedSeries : []
  );
  if (fromSeries) return fromSeries;

  return phase.note ?? "";
}

export function getPhasePlanText(phase: PlanPhase): string {
  return resolvePlanText(phase);
}

export function getDayTrainingPhases(phases: PlanPhase[], date: string): PlanPhase[] {
  return phases
    .filter((phase) => phase.date === date && phase.type === "training")
    .sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        a.createdAt.localeCompare(b.createdAt)
    );
}

export function getDayThrowingPlans(phases: PlanPhase[], date: string): PlanPhase[] {
  return getDayTrainingPhases(phases, date).filter(
    (phase) => (phase.trainingCategory ?? "Vrhy") === "Vrhy"
  );
}

export function addTrainingPhase(
  phases: PlanPhase[],
  date: string,
  category: PlanTrainingCategory
): PlanPhase[] {
  const dayPhases = getDayTrainingPhases(phases, date);
  return [
    ...phases,
    normalizePhase({
      ...emptyPhase(date, category),
      sortOrder: dayPhases.length,
    }),
  ];
}

export function updatePhasePlanText(
  phases: PlanPhase[],
  phaseId: string,
  text: string
): PlanPhase[] {
  return phases.map((phase) =>
    phase.id === phaseId
      ? {
          ...phase,
          planText: text,
          plannedSeries: [],
        }
      : phase
  );
}

export function removeTrainingPhase(phases: PlanPhase[], phaseId: string): PlanPhase[] {
  return phases.filter((phase) => phase.id !== phaseId);
}

/** @deprecated first training phase only — use getDayTrainingPhases */
export function getDayPlanPhase(phases: PlanPhase[], date: string): PlanPhase | null {
  const dayPhases = getDayTrainingPhases(phases, date);
  return dayPhases[0] ?? null;
}

export function getDayPlanText(phases: PlanPhase[], date: string): string {
  const throwing = getDayThrowingPlans(phases, date).find((phase) => resolvePlanText(phase).trim());
  if (throwing) return resolvePlanText(throwing);
  const first = getDayTrainingPhases(phases, date).find((phase) => resolvePlanText(phase).trim());
  return first ? resolvePlanText(first) : "";
}

export function hasDayPlan(phases: PlanPhase[], date: string): boolean {
  return getDayTrainingPhases(phases, date).some((phase) => resolvePlanText(phase).trim().length > 0);
}

export function hasThrowingDayPlan(phases: PlanPhase[], date: string): boolean {
  return getDayThrowingPlans(phases, date).some((phase) => resolvePlanText(phase).trim().length > 0);
}

/** @deprecated use addTrainingPhase + updatePhasePlanText */
export function setDayPlanText(phases: PlanPhase[], date: string, text: string): PlanPhase[] {
  const existing = getDayPlanPhase(phases, date);
  const trimmed = text;

  if (!trimmed.trim()) {
    if (!existing) return phases;
    return phases.filter((phase) => phase.id !== existing.id);
  }

  if (existing) {
    return updatePhasePlanText(phases, existing.id, trimmed);
  }

  const withNew = addTrainingPhase(phases, date, "Vrhy");
  const added = withNew.find((phase) => !phases.some((old) => old.id === phase.id));
  if (!added) return withNew;
  return updatePhasePlanText(withNew, added.id, trimmed);
}

export function normalizePhase(phase: PlanPhase): PlanPhase {
  const plannedSeries = Array.isArray(phase.plannedSeries) ? phase.plannedSeries : [];
  let planText = typeof phase.planText === "string" ? phase.planText : "";

  // Legacy: derive free text only when planText was never stored
  if (planText === "" && plannedSeries.length > 0) {
    planText = plannedSeriesToPlanText(plannedSeries);
  } else if (planText === "" && phase.note?.trim()) {
    planText = phase.note;
  }

  return {
    ...phase,
    date: phase.date ?? todayISO(),
    title: phase.title ?? "",
    type: isPhaseType(phase.type) ? phase.type : "training",
    disciplines: Array.isArray(phase.disciplines) ? phase.disciplines : [],
    plannedSeries: plannedSeries.map((series) => normalizePlannedSeries(series)),
    planText,
    trainingCategory:
      (isPhaseType(phase.type) ? phase.type : "training") === "training"
        ? isTrainingCategory(phase.trainingCategory)
          ? phase.trainingCategory
          : "Vrhy"
        : undefined,
    sortOrder: typeof phase.sortOrder === "number" ? phase.sortOrder : undefined,
    goal: phase.goal ?? "",
    note: phase.note ?? "",
    status: isPhaseStatus(phase.status) ? phase.status : "planned",
    competitionPrepId: phase.competitionPrepId || undefined,
    lastTrainingId: phase.lastTrainingId || undefined,
    createdAt: phase.createdAt ?? new Date().toISOString(),
  };
}

export function convertDayPlanToTraining(
  phases: PlanPhase[],
  date: string
): {
  session: TrainingSession | null;
  updatedPhases: PlanPhase[];
} {
  const phase =
    getDayThrowingPlans(phases, date).find((item) => resolvePlanText(item).trim()) ??
    getDayTrainingPhases(phases, date).find((item) => resolvePlanText(item).trim()) ??
    null;
  const planText = phase ? resolvePlanText(phase) : "";
  if (!planText.trim()) {
    return { session: null, updatedPhases: phases };
  }

  const sessionId = uid();
  const parsedSeries =
    (phase?.trainingCategory ?? "Vrhy") === "Vrhy"
      ? parsePlanTextToSeries(planText)
      : [];
  const disciplineSet = new Set(parsedSeries.map((item) => item.discipline).filter(Boolean));

  const session = normalizeSession({
    id: sessionId,
    date,
    title: phase?.title.trim() || "Trénink podle plánu",
    location: "",
    weather: "",
    readiness: 70,
    rpe: 5,
    note:
      (phase?.trainingCategory ?? "Vrhy") !== "Vrhy"
        ? planText
        : "",
    disciplines: [...disciplineSet],
    sessionType: phase?.type ?? "training",
    series: parsedSeries,
    createdAt: new Date().toISOString(),
    createdFromPlanId: phase?.id,
  });

  if (!phase) {
    return { session, updatedPhases: phases };
  }

  const updatedPhases = phases.map((item) =>
    item.id === phase.id
      ? normalizePhase({
          ...item,
          status: item.status === "planned" ? "started" : item.status,
          lastTrainingId: sessionId,
        })
      : item
  );

  return { session, updatedPhases };
}

export function convertPhaseToTraining(phase: PlanPhase): {
  session: TrainingSession;
  updatedPhase: PlanPhase;
} {
  const planText = resolvePlanText(phase);
  const sessionId = uid();
  const isThrowing = (phase.trainingCategory ?? "Vrhy") === "Vrhy";
  const parsedSeries = isThrowing && planText
    ? parsePlanTextToSeries(planText)
    : (Array.isArray(phase.plannedSeries) ? phase.plannedSeries : []).map((s) =>
        normalizeSeries(plannedSeriesToTrainingSeries(s))
      );

  const disciplineSet = new Set<string>(phase.disciplines);
  parsedSeries.forEach((item) => {
    if (item.discipline) disciplineSet.add(item.discipline);
  });

  const session = normalizeSession({
    id: sessionId,
    date: phase.date,
    title: phase.title.trim() || "Trénink bez názvu",
    location: "",
    weather: "",
    readiness: 70,
    rpe: 5,
    note: !isThrowing && planText ? planText : phase.note ?? "",
    disciplines: [...disciplineSet],
    sessionType: phase.type,
    series: parsedSeries.length
      ? parsedSeries
      : isThrowing
        ? [normalizeSeries(plannedSeriesToTrainingSeries(emptyPlannedSeries()))]
        : [],
    createdAt: new Date().toISOString(),
    createdFromPlanId: phase.id,
  });

  const updatedPhase = normalizePhase({
    ...phase,
    status: phase.status === "planned" ? "started" : phase.status,
    lastTrainingId: sessionId,
  });

  return { session, updatedPhase };
}

const ACTIVE_PLAN_PHASE_TYPES: PhaseType[] = ["training", "activation", "competition"];

export function getTodayActivePlanPhases(phases: PlanPhase[]): PlanPhase[] {
  return getPhasesForDate(phases, todayISO()).filter((phase) =>
    ACTIVE_PLAN_PHASE_TYPES.includes(phase.type)
  );
}

export function hasTodayActivePlan(phases: PlanPhase[]): boolean {
  return hasDayPlan(phases, todayISO());
}

export function convertTodayPlanToTraining(phases: PlanPhase[]): {
  session: TrainingSession | null;
  updatedPhases: PlanPhase[];
} {
  return convertDayPlanToTraining(phases, todayISO());
}

export function loadPlans(): PlanPhase[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    if (raw) {
      return parseStoredPhases(JSON.parse(raw));
    }

    const legacyRaw = localStorage.getItem(LEGACY_PLANS_STORAGE_KEY);
    if (legacyRaw) {
      return parseStoredPhases(JSON.parse(legacyRaw));
    }

    return [];
  } catch {
    return [];
  }
}

export function getPhasesForDate(phases: PlanPhase[], iso: string): PlanPhase[] {
  return phases
    .filter((phase) => phase.date === iso)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getPhaseDisciplineIcons(phase: PlanPhase): string[] {
  const disciplines =
    phase.disciplines.length > 0
      ? phase.disciplines
      : [...new Set(phase.plannedSeries.map((item) => item.discipline).filter(Boolean))];

  return disciplines.map((d) => getDisciplineIcon(d)).filter(Boolean);
}

export function getPhaseTypeLabel(type: PhaseType): string {
  return PHASE_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function syncDisciplinesFromSeries(phase: PlanPhase): PlanPhase {
  const fromSeries = phase.plannedSeries.map((item) => item.discipline).filter(Boolean);
  const merged = [...new Set([...phase.disciplines, ...fromSeries])];
  return { ...phase, disciplines: merged };
}

export function duplicatePhase(phase: PlanPhase, date?: string): PlanPhase {
  return normalizePhase({
    ...phase,
    id: uid(),
    date: date ?? phase.date,
    title: phase.title ? `${phase.title} (kopie)` : "Kopie fáze",
    status: "planned",
    lastTrainingId: undefined,
    createdAt: new Date().toISOString(),
    plannedSeries: phase.plannedSeries.map((series) => ({
      ...normalizePlannedSeries(series),
      id: uid(),
    })),
  });
}

export function getTodayPhaseSummary(phases: PlanPhase[]): string | null {
  const todayTrainings = getDayTrainingPhases(phases, todayISO());
  if (todayTrainings.length === 0) return null;

  if (todayTrainings.length > 1) {
    return `${todayTrainings.length} tréninků dnes`;
  }

  const phase = todayTrainings[0];
  const category = getTrainingCategoryLabel(phase.trainingCategory);
  const planText = resolvePlanText(phase);
  const firstLine = planText.split(/\r?\n/).find((line) => line.trim())?.trim();

  if (!firstLine) return category;

  const preview = firstLine.length > 40 ? `${firstLine.slice(0, 37)}…` : firstLine;
  return `${category}: ${preview}`;
}

/** @deprecated use getTodayPhaseSummary */
export function getTodayPlanTitle(phases: PlanPhase[]): string | null {
  return getTodayPhaseSummary(phases);
}
