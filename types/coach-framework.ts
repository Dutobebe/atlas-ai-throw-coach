/** The ten pillars of Coach Framework v1 */
import type { PlanPhase } from "@/types/plan";
import type { Season } from "@/types/season";
import type { TrainingSession } from "@/types/training";

export type CoachPillar =
  | "season-goal"
  | "prep-phase"
  | "weekly-goals"
  | "discipline-mix"
  | "training-types"
  | "volume-intensity"
  | "load-score"
  | "adaptation"
  | "decision-rules";

export type LoadLevel = "low" | "moderate" | "high" | "very-high";

export interface LoadFactor {
  key: string;
  label: string;
  contribution: number;
  detail: string;
}

export interface LoadScore {
  value: number;
  level: LoadLevel;
  label: string;
  factors: LoadFactor[];
}

export interface PrepPhaseContext {
  label: string;
  daysToCompetition: number | null;
  competitionName: string | null;
  linkedPlanPhases: number;
}

export interface WeeklyGoalsContext {
  phaseCount: number;
  goals: string[];
  hasPlan: boolean;
}

export interface DisciplineMixEntry {
  discipline: string;
  label: string;
  throws: number;
  sharePercent: number;
}

export interface TrainingTypeMix {
  phaseTypes: Record<string, number>;
  seriesPurposes: Record<string, number>;
}

export interface VolumeIntensityContext {
  weekThrows: number;
  avgWeeklyThrows: number;
  avgIntensity: number;
  sessionCount: number;
}

export interface CoachRecommendation {
  id: string;
  pillar: CoachPillar;
  priority: number;
  title: string;
  message: string;
  /** Vysvětlení doporučení — pillar 10 */
  explanation: string;
}

export interface CoachFrameworkSnapshot {
  seasonGoal: string | null;
  secondaryGoals: string[];
  prepPhase: PrepPhaseContext;
  weeklyGoals: WeeklyGoalsContext;
  disciplineMix: DisciplineMixEntry[];
  trainingTypes: TrainingTypeMix;
  volumeIntensity: VolumeIntensityContext;
  loadScore: LoadScore;
  recommendations: CoachRecommendation[];
  primaryRecommendation: CoachRecommendation | null;
}

export interface CoachFrameworkInput {
  sessions: TrainingSession[];
  phases: PlanPhase[];
  seasons: Season[];
  refDate?: Date;
}
