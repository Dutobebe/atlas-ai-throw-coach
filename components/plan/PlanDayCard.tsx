"use client";

import { getStatusColor } from "@/lib/design";
import { getPhasesForDate } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";
import type { WeekDay } from "@/lib/plan-utils";
import PlanPhaseRow from "./PlanPhaseRow";

interface PlanDayCardProps {
  day: WeekDay;
  phases: PlanPhase[];
  getPrepLabel: (competitionPrepId?: string) => string | null;
  onPhaseClick: (phase: PlanPhase) => void;
  onAddPhase: (date: string) => void;
}

export default function PlanDayCard({
  day,
  phases,
  getPrepLabel,
  onPhaseClick,
  onAddPhase,
}: PlanDayCardProps) {
  const dayPhases = getPhasesForDate(phases, day.iso);
  const todayColors = day.isToday ? getStatusColor("today") : null;

  return (
    <div
      className={`section-card plan-day-card${day.isToday ? " plan-day-today" : ""}`}
      style={
        todayColors
          ? {
              borderColor: todayColors.color,
              boxShadow: `0 0 0 1px ${todayColors.background}`,
            }
          : undefined
      }
    >
      <div className="plan-day-card-header">
        <div className="plan-day-left">
          <span className="plan-day-weekday">{day.weekday}</span>
          <span className="plan-day-date">{day.dayNumber}.</span>
        </div>
      </div>

      {dayPhases.length === 0 ? (
        <div className="plan-day-empty-state">
          <span className="plan-day-empty">Bez plánu</span>
          <button type="button" className="btn btn-secondary btn-sm plan-add-btn" onClick={() => onAddPhase(day.iso)}>
            + Přidat
          </button>
        </div>
      ) : (
        <>
          <div className="plan-day-phases">
            {dayPhases.map((phase, index) => (
              <PlanPhaseRow
                key={phase.id}
                phase={phase}
                phaseNumber={index + 1}
                prepLabel={getPrepLabel(phase.competitionPrepId)}
                onClick={onPhaseClick}
              />
            ))}
          </div>
          <button type="button" className="btn btn-secondary btn-sm plan-add-btn" onClick={() => onAddPhase(day.iso)}>
            + Přidat
          </button>
        </>
      )}
    </div>
  );
}
