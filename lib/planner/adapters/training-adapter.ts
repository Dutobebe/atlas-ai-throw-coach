import type { PlanPhase } from "@/types/plan";
import type { PlannerEvent } from "@/types/planner-event";
import { phaseTypeToPlannerEventKind } from "@/lib/planner/planner-event-kinds";

/** Converts a plan phase (atlas-plans) into a PlannerEvent without copying workload data. */
export function planPhaseToPlannerEvent(phase: PlanPhase): PlannerEvent {
  return {
    id: `planPhase:${phase.id}`,
    kind: phaseTypeToPlannerEventKind(phase.type),
    date: phase.date,
    source: { type: "planPhase", phaseId: phase.id },
    phaseStatus: phase.status,
  };
}

export function planPhasesToPlannerEvents(phases: PlanPhase[]): PlannerEvent[] {
  return phases.map(planPhaseToPlannerEvent);
}
