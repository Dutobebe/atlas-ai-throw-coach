"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import {
  addTrainingPhase,
  removeTrainingPhase,
  updatePhasePlanText,
} from "@/lib/plan-utils";
import type { PlanPhase, PlanTrainingCategory } from "@/types/plan";
import type { Season, Competition } from "@/types/season";
import WeeklyPlanner from "./WeeklyPlanner";

interface PlanModuleProps {
  planEntryKey: number;
  phases: PlanPhase[];
  seasons: Season[];
  onPhasesChange: Dispatch<SetStateAction<PlanPhase[]>>;
  onCompetitionClick?: (competition: Competition) => void;
}

export default function PlanModule({
  planEntryKey,
  phases,
  seasons,
  onPhasesChange,
  onCompetitionClick,
}: PlanModuleProps) {
  const handleAddTraining = useCallback(
    (date: string, category: PlanTrainingCategory) => {
      onPhasesChange(addTrainingPhase(phases, date, category));
    },
    [phases, onPhasesChange]
  );

  const handlePlanTextChange = useCallback(
    (phaseId: string, text: string) => {
      onPhasesChange((prev) => updatePhasePlanText(prev, phaseId, text));
    },
    [onPhasesChange]
  );

  const handleRemoveTraining = useCallback(
    (phaseId: string) => {
      onPhasesChange(removeTrainingPhase(phases, phaseId));
    },
    [phases, onPhasesChange]
  );

  return (
    <WeeklyPlanner
      planEntryKey={planEntryKey}
      phases={phases}
      seasons={seasons}
      onAddTraining={handleAddTraining}
      onPlanTextChange={handlePlanTextChange}
      onRemoveTraining={handleRemoveTraining}
      onCompetitionClick={onCompetitionClick}
    />
  );
}
