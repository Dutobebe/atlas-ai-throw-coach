import type { PlanPhase } from "@/types/plan";
import type { TemplateSeries, TrainingTemplate } from "@/types/template";
import type { TrainingSession } from "@/types/training";
import {
  emptyPlannedSeries,
  normalizePlannedSeries,
} from "@/lib/planned-series-utils";
import { normalizePhase, syncDisciplinesFromSeries } from "@/lib/plan-utils";
import { normalizeSeriesGoals } from "@/lib/goal-library";
import {
  emptySeries,
  normalizeSeries,
  uid,
} from "@/lib/training-utils";
import { getDefaultTemplates } from "@/lib/default-templates";

export const TEMPLATES_STORAGE_KEY = "atlas-training-templates";

function templateSeriesToPlannedSeries(item: TemplateSeries) {
  return normalizePlannedSeries({
    ...emptyPlannedSeries(item.discipline),
    id: uid(),
    seriesType: item.seriesType,
    discipline: item.discipline,
    technique: item.technique,
    implementWeight: item.implementWeight,
    throwCount: item.throwCount,
    intensityPercent: item.intensityPercent,
    purpose: item.purpose,
    note: item.note,
    goals: item.goals ?? [],
  });
}

function templateSeriesToTrainingSeries(item: TemplateSeries) {
  return normalizeSeries({
    ...emptySeries(),
    id: uid(),
    seriesType: item.seriesType,
    discipline: item.discipline,
    technique: item.technique,
    implementWeight: item.implementWeight,
    throwCount: item.throwCount,
    bestThrow: "",
    intensityPercent: item.intensityPercent,
    purpose: item.purpose,
    note: item.note,
    goals: item.goals ?? [],
  });
}

function hasSeriesContent(series: { throwCount?: number; technique?: string; note?: string }) {
  return (
    (series.throwCount ?? 0) > 0 ||
    Boolean(series.technique?.trim()) ||
    Boolean(series.note?.trim())
  );
}

export function normalizeTemplate(template: TrainingTemplate): TrainingTemplate {
  return {
    ...template,
    name: template.name ?? "",
    description: template.description ?? "",
    phases: Array.isArray(template.phases)
      ? template.phases.map((phase) => ({
          title: phase.title ?? "",
          type: phase.type ?? "training",
          disciplines: Array.isArray(phase.disciplines) ? phase.disciplines : [],
          plannedSeries: Array.isArray(phase.plannedSeries)
            ? phase.plannedSeries.map((s) => ({
                seriesType: s.seriesType ?? "Throw",
                discipline: s.discipline ?? "disk",
                technique: s.technique ?? "",
                implementWeight: s.implementWeight ?? "",
                throwCount: s.throwCount ?? 0,
                intensityPercent: s.intensityPercent ?? 80,
                purpose: s.purpose ?? "technique",
                note: s.note ?? "",
                goals: normalizeSeriesGoals(s.goals, s.discipline ?? "disk"),
              }))
            : [],
        }))
      : [],
    createdAt: template.createdAt ?? new Date().toISOString(),
    updatedAt: template.updatedAt ?? new Date().toISOString(),
  };
}

export function loadTemplates(): TrainingTemplate[] {
  if (typeof window === "undefined") return getDefaultTemplates();

  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultTemplates();
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultTemplates();
    }
    return parsed.map((item) => normalizeTemplate(item as TrainingTemplate));
  } catch {
    return getDefaultTemplates();
  }
}

export function applyTemplateToSession(
  session: TrainingSession,
  template: TrainingTemplate
): TrainingSession {
  const newSeries = template.phases.flatMap((phase) =>
    phase.plannedSeries.map(templateSeriesToTrainingSeries)
  );

  const existing = session.series.filter(hasSeriesContent);
  const baseSeries = existing.length > 0 ? existing : [];

  const disciplines = [
    ...new Set([
      ...session.disciplines,
      ...template.phases.flatMap((phase) => phase.disciplines),
    ]),
  ];

  return {
    ...session,
    title: session.title.trim() || template.name,
    note: session.note.trim() || template.description || session.note,
    disciplines: disciplines.length ? disciplines : session.disciplines,
    series: [...baseSeries, ...newSeries],
  };
}

export function applyTemplateToPhase(
  phase: PlanPhase,
  template: TrainingTemplate
): PlanPhase {
  const firstPhase = template.phases[0];
  const newSeries = template.phases.flatMap((p) =>
    p.plannedSeries.map(templateSeriesToPlannedSeries)
  );

  const mergedDisciplines = [
    ...new Set([
      ...phase.disciplines,
      ...template.phases.flatMap((p) => p.disciplines),
    ]),
  ];

  const existing = phase.plannedSeries.filter(hasSeriesContent);

  return normalizePhase(
    syncDisciplinesFromSeries({
      ...phase,
      title: phase.title.trim() || firstPhase?.title || template.name,
      type: firstPhase?.type ?? phase.type,
      disciplines: mergedDisciplines.length ? mergedDisciplines : phase.disciplines,
      goal: phase.goal.trim() || template.description || phase.goal,
      plannedSeries: [...existing, ...newSeries],
    })
  );
}
