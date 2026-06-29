import type { PhaseType } from "@/types/plan";
import type { PlannerEventKind } from "@/types/planner-event";

/** Maps stored plan phase types to planner event kinds. */
export function phaseTypeToPlannerEventKind(type: PhaseType): PlannerEventKind {
  switch (type) {
    case "rest":
      return "rest";
    case "regeneration":
    case "activation":
      return "recovery";
    case "competition":
      return "training";
    default:
      return "training";
  }
}

export function isPlanPhaseEventKind(kind: PlannerEventKind): boolean {
  return kind !== "competition";
}
