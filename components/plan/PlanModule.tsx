"use client";

import { useCallback } from "react";
import { setDayPlanText } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";
import type { Season, Competition } from "@/types/season";
import WeeklyPlanner from "./WeeklyPlanner";

interface PlanModuleProps {
  planEntryKey: number;
  phases: PlanPhase[];
  seasons: Season[];
  onPhasesChange: (phases: PlanPhase[]) => void;
  onCompetitionClick?: (competition: Competition) => void;
}

export default function PlanModule({
  planEntryKey,
  phases,
  seasons,
  onPhasesChange,
  onCompetitionClick,
}: PlanModuleProps) {
  const handlePlanTextChange = useCallback(
    (date: string, text: string) => {
      onPhasesChange(setDayPlanText(phases, date, text));
    },
    [phases, onPhasesChange]
  );

  return (
    <WeeklyPlanner
      planEntryKey={planEntryKey}
      phases={phases}
      seasons={seasons}
      onPlanTextChange={handlePlanTextChange}
      onCompetitionClick={onCompetitionClick}
    />
  );
}
