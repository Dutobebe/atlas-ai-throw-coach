/** Drag & drop types for future weekly planner reordering (not implemented in v0.4.4). */

export interface PlanPhaseDragItem {
  phaseId: string;
  sourceDate: string;
}

export interface PlanPhaseDropTarget {
  date: string;
}

export interface PlanPhaseMovePayload {
  phaseId: string;
  fromDate: string;
  toDate: string;
}

export type PlanPhaseMoveHandler = (payload: PlanPhaseMovePayload) => void;
