import type { PlanPhaseDragItem, PlanPhaseDropTarget } from "./plan-dnd-types";

/**
 * Future drag & drop integration point.
 * Wire react-dnd / @dnd-kit handlers through these helpers without changing card UI.
 */
export function createPlanPhaseDragItem(phase: { id: string; date: string }): PlanPhaseDragItem {
  return {
    phaseId: phase.id,
    sourceDate: phase.date,
  };
}

export function createPlanPhaseDropTarget(date: string): PlanPhaseDropTarget {
  return { date };
}

export function planPhaseDragDataAttributes(item: PlanPhaseDragItem): Record<string, string> {
  return {
    "data-draggable-phase-id": item.phaseId,
    "data-draggable-source-date": item.sourceDate,
  };
}

export function planDayDropDataAttributes(target: PlanPhaseDropTarget): Record<string, string> {
  return {
    "data-drop-date": target.date,
  };
}
