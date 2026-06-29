/**
 * Unified planner event model — architecture layer only.
 * Source data remains in Season (competitions) and atlas-plans (plan phases).
 */

import type { PhaseStatus } from "@/types/plan";

export type PlannerEventKind =
  | "training"
  | "competition"
  | "recovery"
  | "rest"
  | "camp"
  | "testing";

export interface PlannerEventSourcePlanPhase {
  type: "planPhase";
  phaseId: string;
}

export interface PlannerEventSourceCompetition {
  type: "competition";
  competitionId: string;
  seasonYear: number;
}

export type PlannerEventSource =
  | PlannerEventSourcePlanPhase
  | PlannerEventSourceCompetition;

/** Lightweight view model — references source entities, no duplicated payload. */
export interface PlannerEvent {
  id: string;
  kind: PlannerEventKind;
  date: string;
  source: PlannerEventSource;
  /** Derived plan phase status — set by training adapter only. */
  phaseStatus?: PhaseStatus;
}

/** Default sort priority within a day (lower = earlier). */
export const PLANNER_EVENT_KIND_ORDER: Record<PlannerEventKind, number> = {
  competition: 0,
  camp: 1,
  testing: 2,
  training: 3,
  recovery: 4,
  rest: 5,
};
