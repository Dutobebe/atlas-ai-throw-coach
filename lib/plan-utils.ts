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
import type { PhaseStatus, PhaseType, PlanPhase, PlannedSeries } from "@/types/plan";

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

export function emptyPhase(date: string = todayISO()): PlanPhase {
  return {
    id: uid(),
    date,
    title: "",
    type: "training",
    disciplines: [],
    plannedSeries: [],
    planText: "",
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
  if (phase.planText?.trim()) return phase.planText.trim();
  if (phase.note?.trim() && !phase.plannedSeries?.length) return phase.note.trim();

  const fromSeries = plannedSeriesToPlanText(
    Array.isArray(phase.plannedSeries) ? phase.plannedSeries : []
  );
  if (fromSeries) return fromSeries;

  return phase.note?.trim() ?? "";
}

export function getDayPlanPhase(phases: PlanPhase[], date: string): PlanPhase | null {
  const dayPhases = getPhasesForDate(phases, date);
  return dayPhases.find((phase) => phase.type === "training") ?? null;
}

export function getDayPlanText(phases: PlanPhase[], date: string): string {
  const phase = getDayPlanPhase(phases, date);
  if (!phase) return "";
  return resolvePlanText(phase);
}

export function hasDayPlan(phases: PlanPhase[], date: string): boolean {
  return getDayPlanText(phases, date).trim().length > 0;
}

export function setDayPlanText(phases: PlanPhase[], date: string, text: string): PlanPhase[] {
  const existing = getDayPlanPhase(phases, date);
  const trimmed = text;

  if (!trimmed.trim()) {
    if (!existing) return phases;
    return phases.filter((phase) => phase.id !== existing.id);
  }

  if (existing) {
    return phases.map((phase) =>
      phase.id === existing.id
        ? normalizePhase({
            ...phase,
            planText: trimmed,
            plannedSeries: [],
            note: "",
            title: phase.title.trim() || "Trénink",
          })
        : phase
    );
  }

  return [
    ...phases,
    normalizePhase({
      ...emptyPhase(date),
      planText: trimmed,
      title: "Trénink",
    }),
  ];
}

export function normalizePhase(phase: PlanPhase): PlanPhase {
  const plannedSeries = Array.isArray(phase.plannedSeries) ? phase.plannedSeries : [];
  const planText =
    phase.planText?.trim() ||
    (plannedSeries.length > 0 ? plannedSeriesToPlanText(plannedSeries) : "") ||
    phase.note?.trim() ||
    "";

  return {
    ...phase,
    date: phase.date ?? todayISO(),
    title: phase.title ?? "",
    type: isPhaseType(phase.type) ? phase.type : "training",
    disciplines: Array.isArray(phase.disciplines) ? phase.disciplines : [],
    plannedSeries: plannedSeries.map((series) => normalizePlannedSeries(series)),
    planText,
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
  const planText = getDayPlanText(phases, date);
  if (!planText.trim()) {
    return { session: null, updatedPhases: phases };
  }

  const phase = getDayPlanPhase(phases, date);
  const sessionId = uid();
  const parsedSeries = parsePlanTextToSeries(planText);
  const disciplineSet = new Set(parsedSeries.map((item) => item.discipline).filter(Boolean));

  const session = normalizeSession({
    id: sessionId,
    date,
    title: phase?.title.trim() || "Trénink podle plánu",
    location: "",
    weather: "",
    readiness: 70,
    rpe: 5,
    note: "",
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
  const parsedSeries = planText
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
    note: phase.note ?? "",
    disciplines: [...disciplineSet],
    sessionType: phase.type,
    series: parsedSeries.length
      ? parsedSeries
      : [normalizeSeries(plannedSeriesToTrainingSeries(emptyPlannedSeries()))],
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
  const planText = getDayPlanText(phases, todayISO());
  if (!planText.trim()) return null;

  const firstLine = planText.split(/\r?\n/).find((line) => line.trim())?.trim();
  if (!firstLine) return "Plán na dnešek";

  return firstLine.length > 48 ? `${firstLine.slice(0, 45)}…` : firstLine;
}

/** @deprecated use getTodayPhaseSummary */
export function getTodayPlanTitle(phases: PlanPhase[]): string | null {
  return getTodayPhaseSummary(phases);
}
