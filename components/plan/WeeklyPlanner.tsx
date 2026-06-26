"use client";

import { formatWeekRange, getWeekDays } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";
import type { Season, Competition } from "@/types/season";
import PlanDayCard from "./PlanDayCard";

interface WeeklyPlannerProps {
  phases: PlanPhase[];
  seasons: Season[];
  getPrepLabel: (competitionPrepId?: string) => string | null;
  onPhaseClick: (phase: PlanPhase) => void;
  onCompetitionClick?: (competition: Competition) => void;
  onAddPhase: (date: string) => void;
}

export default function WeeklyPlanner({
  phases,
  seasons,
  getPrepLabel,
  onPhaseClick,
  onCompetitionClick,
  onAddPhase,
}: WeeklyPlannerProps) {
  const weekDays = getWeekDays();

  return (
    <div className="plan-week">
      <div className="plan-week-header">
        <h2 className="plan-week-title">Tento týden</h2>
        <span className="plan-week-range">{formatWeekRange()}</span>
      </div>
      <div className="plan-week-days">
        {weekDays.map((day) => (
          <PlanDayCard
            key={day.iso}
            day={day}
            phases={phases}
            seasons={seasons}
            getPrepLabel={getPrepLabel}
            onPhaseClick={onPhaseClick}
            onCompetitionClick={onCompetitionClick}
            onAddPhase={onAddPhase}
          />
        ))}
      </div>
    </div>
  );
}
