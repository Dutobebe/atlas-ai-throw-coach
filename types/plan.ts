import type { SeriesPurpose, SeriesType } from "@/types/training";

export type PhaseType =
  | "training"
  | "rest"
  | "regeneration"
  | "competition"
  | "activation";

export type PhaseStatus = "planned" | "started" | "completed" | "changed" | "skipped";

/** Planned workload in Plán — no achieved results (no bestThrow). */
export interface PlannedSeries {
  id: string;
  seriesType: SeriesType;
  discipline: string;
  technique: string;
  implementWeight: string;
  throwCount: number;
  intensityPercent?: number;
  purpose: SeriesPurpose;
  note: string;
  /** Series focus goals from goal library (1–3 labels) */
  goals: string[];
}

export interface PlanPhase {
  id: string;
  date: string;
  title: string;
  type: PhaseType;
  disciplines: string[];
  plannedSeries: PlannedSeries[];
  goal: string;
  note: string;
  status: PhaseStatus;
  /** Link plan phase to competition preparation (Season module) */
  competitionPrepId?: string;
  lastTrainingId?: string;
  createdAt: string;
}

export type PlanView = "week" | "form" | "detail";
