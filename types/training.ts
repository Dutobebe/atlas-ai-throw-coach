import type { PhaseType } from "@/types/plan";

/** @deprecated legacy throw distance entry — use throwCount + bestThrow instead */
export interface Throw {
  id: string;
  value: string;
}

export type SeriesPurpose = "technique" | "speed" | "competition" | "warmup";

export type SeriesType = "Throw" | "Imitation" | "Drill" | "Exercise";

export interface TrainingSeries {
  id: string;
  seriesType: SeriesType;
  discipline: string;
  technique: string;
  implementWeight: string;
  throwCount: number;
  bestThrow: string;
  purpose: SeriesPurpose;
  note: string;
  /** Series focus goals from goal library (1–3 labels) */
  goals: string[];
  /** Training intensity 0–100, default 80 */
  intensityPercent?: number;
  /** @deprecated legacy distance list — migrated to throwCount / bestThrow on load */
  throws?: Throw[];
  /** @deprecated kept for History compat with older saved sessions */
  marks?: Throw[];
  /** @deprecated kept for History compat with older saved sessions */
  equipment?: string;
}

export interface TrainingSession {
  id: string;
  date: string;
  title: string;
  location: string;
  weather: string;
  readiness: number;
  rpe: number;
  note: string;
  /** Session-level disciplines selected in training wizard (step 2) */
  disciplines: string[];
  /** Session training type — mirrors plan phase types */
  sessionType: PhaseType;
  series: TrainingSeries[];
  createdAt: string;
  /** Set when session was created from a plan phase (Sprint 6.2) */
  createdFromPlanId?: string;
  /** Post-training self-evaluation (Sprint 11) */
  evaluation?: TrainingEvaluation;
}

export type GoalAchieved = "yes" | "partly" | "no";

export type TechniqueQuality = "excellent" | "average" | "poor";

export interface TrainingEvaluation {
  /** Overall satisfaction 1–5 stars */
  satisfaction: number;
  goalAchieved: GoalAchieved;
  techniqueQuality: TechniqueQuality;
  /** Perceived fatigue 1–5 */
  fatigue: number;
  hasPain: boolean;
  painLocation: string;
  bestThing: string;
  focusNext: string;
  /** ISO timestamp — set when evaluation is saved */
  savedAt?: string;
}

export interface SeriesStats {
  count: number;
  best: number | null;
  average: null;
}

export type Tab =
  | "dashboard"
  | "plan"
  | "season"
  | "training"
  | "quickCapture"
  | "live"
  | "evaluation"
  | "performance"
  | "history"
  | "statistics"
  | "profile";
