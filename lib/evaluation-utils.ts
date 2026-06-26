import type {
  GoalAchieved,
  TechniqueQuality,
  TrainingEvaluation,
  TrainingSession,
} from "@/types/training";

export const GOAL_ACHIEVED_OPTIONS: { value: GoalAchieved; label: string }[] = [
  { value: "yes", label: "Ano" },
  { value: "partly", label: "Částečně" },
  { value: "no", label: "Ne" },
];

export const TECHNIQUE_QUALITY_OPTIONS: { value: TechniqueQuality; label: string }[] = [
  { value: "excellent", label: "Výborná" },
  { value: "average", label: "Průměrná" },
  { value: "poor", label: "Slabá" },
];

export function emptyEvaluation(): TrainingEvaluation {
  return {
    satisfaction: 0,
    goalAchieved: "partly",
    techniqueQuality: "average",
    fatigue: 3,
    hasPain: false,
    painLocation: "",
    bestThing: "",
    focusNext: "",
  };
}

function isGoalAchieved(value: unknown): value is GoalAchieved {
  return value === "yes" || value === "partly" || value === "no";
}

function isTechniqueQuality(value: unknown): value is TechniqueQuality {
  return value === "excellent" || value === "average" || value === "poor";
}

export function normalizeEvaluation(
  evaluation: Partial<TrainingEvaluation> | undefined
): TrainingEvaluation | undefined {
  if (!evaluation) return undefined;

  const satisfaction =
    typeof evaluation.satisfaction === "number"
      ? Math.min(5, Math.max(0, Math.round(evaluation.satisfaction)))
      : 0;
  const fatigue =
    typeof evaluation.fatigue === "number"
      ? Math.min(5, Math.max(1, Math.round(evaluation.fatigue)))
      : 3;

  return {
    satisfaction,
    goalAchieved: isGoalAchieved(evaluation.goalAchieved)
      ? evaluation.goalAchieved
      : "partly",
    techniqueQuality: isTechniqueQuality(evaluation.techniqueQuality)
      ? evaluation.techniqueQuality
      : "average",
    fatigue,
    hasPain: Boolean(evaluation.hasPain),
    painLocation: evaluation.painLocation ?? "",
    bestThing: evaluation.bestThing ?? "",
    focusNext: evaluation.focusNext ?? "",
    savedAt: evaluation.savedAt || undefined,
  };
}

export function hasTrainingEvaluation(session: TrainingSession): boolean {
  return Boolean(session.evaluation?.savedAt);
}

export function getEvaluationDraft(session: TrainingSession): TrainingEvaluation {
  if (session.evaluation?.savedAt) {
    return normalizeEvaluation(session.evaluation) ?? emptyEvaluation();
  }
  if (session.evaluation) {
    return normalizeEvaluation(session.evaluation) ?? emptyEvaluation();
  }
  return emptyEvaluation();
}

export function finalizeEvaluation(evaluation: TrainingEvaluation): TrainingEvaluation {
  const normalized = normalizeEvaluation(evaluation)!;
  return {
    ...normalized,
    satisfaction: Math.min(5, Math.max(1, normalized.satisfaction || 3)),
    savedAt: new Date().toISOString(),
  };
}
