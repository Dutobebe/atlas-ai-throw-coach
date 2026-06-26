"use client";

import { formatWeekRange, getWeekDays } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";
import PlanDayCard from "./PlanDayCard";

interface WeeklyPlannerProps {
  phases: PlanPhase[];
  getPrepLabel: (competitionPrepId?: string) => string | null;
  onPhaseClick: (phase: PlanPhase) => void;
  onAddPhase: (date: string) => void;
}

export default function WeeklyPlanner({
  phases,
  getPrepLabel,
  onPhaseClick,
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
            getPrepLabel={getPrepLabel}
            onPhaseClick={onPhaseClick}
            onAddPhase={onAddPhase}
          />
        ))}
      </div>
    </div>
  );
}
