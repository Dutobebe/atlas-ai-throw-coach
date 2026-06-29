import type { PhaseStatus, PhaseType, PlanPhase } from "@/types/plan";
import { getPlannedSeriesThrowCount } from "@/lib/planned-series-utils";
import { getDisciplineLabel } from "@/lib/training-utils";

export const WEEKDAY_FULL = [
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
  "Neděle",
] as const;

export type { PlanStripIndicator, PlanDayStripState } from "@/types/planner-strip";

export function getPhasePriorityLabel(index: number): string {
  if (index === 0) return "Hlavní";
  return `Vedlejší ${index + 1}`;
}

export function getWeekdayFullName(iso: string): string {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return iso;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayIndex = (date.getDay() + 6) % 7;
  return WEEKDAY_FULL[dayIndex] ?? iso;
}

export function getPhaseDisciplineLabels(phase: PlanPhase): string[] {
  const disciplines =
    phase.disciplines.length > 0
      ? phase.disciplines
      : [...new Set(phase.plannedSeries.map((item) => item.discipline).filter(Boolean))];

  return disciplines.map((d) => getDisciplineLabel(d));
}

export function formatPhaseDisciplines(phase: PlanPhase): string {
  const labels = getPhaseDisciplineLabels(phase);
  return labels.length > 0 ? labels.join(" + ") : "";
}

export function getPhaseTypeEmoji(type: PhaseType): string {
  switch (type) {
    case "rest":
      return "🌙";
    case "regeneration":
      return "💆";
    case "competition":
      return "🏆";
    case "activation":
      return "⚡";
    default:
      return "🏋";
  }
}

export function estimatePhaseDurationMinutes(phase: PlanPhase): number | null {
  if (phase.type === "rest") return null;

  if (phase.type === "regeneration") return 45;
  if (phase.type === "activation") return 30;

  const activeSeries = phase.plannedSeries.filter(
    (series) => series.discipline || series.technique || getPlannedSeriesThrowCount(series) > 0
  );

  if (activeSeries.length === 0) {
    return phase.type === "competition" ? 120 : 60;
  }

  let minutes = 15;
  for (const series of activeSeries) {
    const throws = getPlannedSeriesThrowCount(series);
    minutes += throws > 0 ? throws * 2 + 10 : 15;
  }

  return Math.min(Math.max(minutes, 30), 180);
}

export function formatPhaseDuration(phase: PlanPhase): string | null {
  const minutes = estimatePhaseDurationMinutes(phase);
  if (minutes === null) return null;
  return `${minutes} min`;
}

import type { PlanDayStripState } from "@/types/planner-strip";
import type { PlannerEvent } from "@/types/planner-event";
import { calculateDayStripState } from "@/lib/planner/dayStatus";

/** @deprecated Use calculateDayStripState from lib/planner/dayStatus with PlannerEvents. */
export function getDayStripState(
  phases: PlanPhase[],
  hasCompetition: boolean
): PlanDayStripState {
  const events: PlannerEvent[] = phases.map((phase) => ({
    id: `planPhase:${phase.id}`,
    kind: phase.type === "rest" ? "rest" : "training",
    date: phase.date,
    source: { type: "planPhase", phaseId: phase.id },
    phaseStatus: phase.status,
  }));

  if (hasCompetition) {
    events.unshift({
      id: "competition:legacy",
      kind: "competition",
      date: phases[0]?.date ?? "",
      source: { type: "competition", competitionId: "legacy", seasonYear: 0 },
    });
  }

  return calculateDayStripState(events);
}

export function isPhaseCompleted(status: PhaseStatus): boolean {
  return status === "completed";
}
