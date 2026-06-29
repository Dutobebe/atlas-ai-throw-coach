import type { DayStatus } from "@/types/planner-day-status";

export type PlanStripIndicator = "trophy" | "moon" | "check" | "dumbbell";

export interface PlanDayStripState {
  /** Computed day status — read-only, from calculateDayStatus. */
  status?: DayStatus;
  hasCompetition: boolean;
  hasCompleted: boolean;
  hasPlanned: boolean;
  hasSkipped?: boolean;
  hasUpdated?: boolean;
  indicators: PlanStripIndicator[];
}
