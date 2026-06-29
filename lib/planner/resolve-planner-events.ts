import { findCompetition } from "@/lib/season-utils";
import type { PlanPhase } from "@/types/plan";
import type { PlannerEvent } from "@/types/planner-event";
import type { Competition, Season } from "@/types/season";

export function resolvePlanPhaseFromEvent(
  event: PlannerEvent,
  phases: PlanPhase[]
): PlanPhase | null {
  const source = event.source;
  if (source.type !== "planPhase") return null;
  return phases.find((phase) => phase.id === source.phaseId) ?? null;
}

export function resolveCompetitionFromEvent(
  event: PlannerEvent,
  seasons: Season[]
): (Competition & { year: number }) | null {
  const source = event.source;
  if (source.type !== "competition") return null;
  return findCompetition(seasons, source.competitionId);
}

export function resolvePlanPhasesFromEvents(
  events: PlannerEvent[],
  phases: PlanPhase[]
): PlanPhase[] {
  return events
    .map((event) => resolvePlanPhaseFromEvent(event, phases))
    .filter((phase): phase is PlanPhase => phase !== null);
}
