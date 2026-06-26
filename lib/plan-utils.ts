import { getWeekBounds } from "@/lib/discipline-throw-stats";
import { getDisciplineIcon } from "@/lib/design";
import {
  emptyPlannedSeries,
  normalizePlannedSeries,
  plannedSeriesToTrainingSeries,
} from "@/lib/planned-series-utils";
import {
  formatDate,
  normalizeSession,
  normalizeSeries,
  todayISO,
  uid,
} from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";
import type { PhaseStatus, PhaseType, PlanPhase, PlannedSeries } from "@/types/plan";

export const PLANS_STORAGE_KEY = "atlas-plans";
const LEGACY_PLANS_STORAGE_KEY = "atlas-training-plans";

const WEEKDAY_SHORT = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"] as const;

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

export interface WeekDay {
  iso: string;
  weekday: string;
  dayNumber: number;
  isToday: boolean;
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

function toISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

export function getWeekDays(refDate: Date = new Date()): WeekDay[] {
  const { start } = getWeekBounds(refDate);
  const today = todayISO();

  return WEEKDAY_SHORT.map((weekday, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = toISODateLocal(date);
    return {
      iso,
      weekday,
      dayNumber: date.getDate(),
      isToday: iso === today,
    };
  });
}

export function formatWeekRange(refDate: Date = new Date()): string {
  const { start, end } = getWeekBounds(refDate);
  const endDay = end.getDate();
  const endMonth = end.getMonth() + 1;
  const endYear = end.getFullYear();
  const startDay = start.getDate();
  const startMonth = start.getMonth() + 1;
  const startYear = start.getFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}. – ${endDay}. ${endMonth}. ${endYear}`;
  }
  if (startYear === endYear) {
    return `${startDay}. ${startMonth}. – ${endDay}. ${endMonth}. ${endYear}`;
  }
  return `${formatDate(toISODateLocal(start))} – ${formatDate(toISODateLocal(end))}`;
}

export function emptyPhase(date: string = todayISO()): PlanPhase {
  return {
    id: uid(),
    date,
    title: "",
    type: "training",
    disciplines: [],
    plannedSeries: [emptyPlannedSeries()],
    goal: "",
    note: "",
    status: "planned",
    createdAt: new Date().toISOString(),
  };
}

export function normalizePhase(phase: PlanPhase): PlanPhase {
  const plannedSeries = Array.isArray(phase.plannedSeries) ? phase.plannedSeries : [];

  return {
    ...phase,
    date: phase.date ?? todayISO(),
    title: phase.title ?? "",
    type: isPhaseType(phase.type) ? phase.type : "training",
    disciplines: Array.isArray(phase.disciplines) ? phase.disciplines : [],
    plannedSeries: plannedSeries.length
      ? plannedSeries.map((series) => normalizePlannedSeries(series))
      : [emptyPlannedSeries()],
    goal: phase.goal ?? "",
    note: phase.note ?? "",
    status: isPhaseStatus(phase.status) ? phase.status : "planned",
    competitionPrepId: phase.competitionPrepId || undefined,
    lastTrainingId: phase.lastTrainingId || undefined,
    createdAt: phase.createdAt ?? new Date().toISOString(),
  };
}

export function convertPhaseToTraining(phase: PlanPhase): {
  session: TrainingSession;
  updatedPhase: PlanPhase;
} {
  const sessionId = uid();
  const plannedSeries = Array.isArray(phase.plannedSeries) ? phase.plannedSeries : [];

  const session = normalizeSession({
    id: sessionId,
    date: phase.date,
    title: phase.title.trim() || "Trénink bez názvu",
    location: "",
    weather: "",
    readiness: 70,
    rpe: 5,
    note: phase.note ?? "",
    disciplines: [...phase.disciplines],
    sessionType: phase.type,
    series: plannedSeries.length
      ? plannedSeries.map((s) => normalizeSeries(plannedSeriesToTrainingSeries(s)))
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
  return getTodayActivePlanPhases(phases).length > 0;
}

export function convertTodayPlanToTraining(phases: PlanPhase[]): {
  session: TrainingSession | null;
  updatedPhases: PlanPhase[];
} {
  const todayPhases = getTodayActivePlanPhases(phases);
  if (todayPhases.length === 0) {
    return { session: null, updatedPhases: phases };
  }

  if (todayPhases.length === 1) {
    const { session, updatedPhase } = convertPhaseToTraining(todayPhases[0]);
    return {
      session,
      updatedPhases: phases.map((phase) =>
        phase.id === updatedPhase.id ? updatedPhase : phase
      ),
    };
  }

  const sessionId = uid();
  const mergedSeries = todayPhases.flatMap((phase) =>
    phase.plannedSeries
      .filter((item) => item.discipline || item.technique || item.throwCount > 0)
      .map((item) => normalizeSeries(plannedSeriesToTrainingSeries(item)))
  );

  const disciplineSet = new Set<string>();
  for (const phase of todayPhases) {
    if (phase.disciplines.length > 0) {
      phase.disciplines.forEach((item) => disciplineSet.add(item));
    } else {
      phase.plannedSeries.forEach((item) => {
        if (item.discipline) disciplineSet.add(item.discipline);
      });
    }
  }

  const titles = todayPhases.map((phase) => phase.title.trim()).filter(Boolean);
  const notes = todayPhases.map((phase) => phase.note.trim()).filter(Boolean);

  const session = normalizeSession({
    id: sessionId,
    date: todayISO(),
    title: titles.join(" · ") || "Trénink podle plánu",
    location: "",
    weather: "",
    readiness: 70,
    rpe: 5,
    note: notes.join("\n"),
    disciplines: [...disciplineSet],
    sessionType: todayPhases[0].type,
    series: mergedSeries,
    createdAt: new Date().toISOString(),
    createdFromPlanId: todayPhases[0].id,
  });

  const todayPhaseIds = new Set(todayPhases.map((phase) => phase.id));
  const updatedPhases = phases.map((phase) => {
    if (!todayPhaseIds.has(phase.id)) return phase;
    return normalizePhase({
      ...phase,
      status: phase.status === "planned" ? "started" : phase.status,
      lastTrainingId: sessionId,
    });
  });

  return { session, updatedPhases };
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
  const todayPhases = getPhasesForDate(phases, todayISO());
  if (todayPhases.length === 0) return null;

  const titles = todayPhases
    .map((phase) => phase.title.trim())
    .filter(Boolean);

  return titles.length > 0 ? titles.join(" · ") : `${todayPhases.length} fáze`;
}

/** @deprecated use getTodayPhaseSummary */
export function getTodayPlanTitle(phases: PlanPhase[]): string | null {
  return getTodayPhaseSummary(phases);
}
