import {
  PLANNER_EVENT_KIND_ORDER,
  type PlannerEvent,
} from "@/types/planner-event";
import { competitionsToPlannerEvents } from "@/lib/planner/adapters/competition-adapter";
import { planPhasesToPlannerEvents } from "@/lib/planner/adapters/training-adapter";
import { getPhasesForDate, getPhasesForWeek } from "@/lib/plan-utils";
import { getCompetitionsForDate, getCompetitionsForWeek } from "@/lib/season-utils";
import type { PlanPhase } from "@/types/plan";
import type { Season } from "@/types/season";

function comparePlannerEvents(a: PlannerEvent, b: PlannerEvent): number {
  const kindDiff = PLANNER_EVENT_KIND_ORDER[a.kind] - PLANNER_EVENT_KIND_ORDER[b.kind];
  if (kindDiff !== 0) return kindDiff;

  if (a.kind === "competition" && b.kind === "competition") {
    return a.id.localeCompare(b.id, "cs");
  }

  if (a.source.type === "planPhase" && b.source.type === "planPhase") {
    return a.source.phaseId.localeCompare(b.source.phaseId, "cs");
  }

  return a.id.localeCompare(b.id, "cs");
}

export function sortPlannerEvents(events: PlannerEvent[]): PlannerEvent[] {
  return [...events].sort(comparePlannerEvents);
}

/** Build ordered PlannerEvents for one day — competitions before plan phases. */
export function buildPlannerEventsForDate(
  date: string,
  phases: PlanPhase[],
  seasons: Season[]
): PlannerEvent[] {
  const dayPhases = getPhasesForDate(phases, date);
  const dayCompetitions = getCompetitionsForDate(seasons, date);

  return [
    ...competitionsToPlannerEvents(dayCompetitions),
    ...planPhasesToPlannerEvents(dayPhases),
  ];
}

/** Build ordered PlannerEvents for a week (Mon–Sun). */
export function buildPlannerEventsForWeek(
  weekStart: string,
  phases: PlanPhase[],
  seasons: Season[]
): PlannerEvent[] {
  const weekPhases = getPhasesForWeek(phases, weekStart);
  const weekCompetitions = getCompetitionsForWeek(seasons, weekStart);

  const dates = new Set<string>();
  for (const phase of weekPhases) dates.add(phase.date);
  for (const competition of weekCompetitions) dates.add(competition.date);

  return [...dates]
    .sort((a, b) => a.localeCompare(b))
    .flatMap((date) => buildPlannerEventsForDate(date, weekPhases, seasons));
}

export function plannerEventsHaveCompetition(events: PlannerEvent[]): boolean {
  return events.some((event) => event.kind === "competition");
}

export function filterPlanPhaseEvents(events: PlannerEvent[]): PlannerEvent[] {
  return events.filter((event) => event.source.type === "planPhase");
}
