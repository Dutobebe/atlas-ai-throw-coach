"use client";

import { getPhasesForDate } from "@/lib/plan-utils";
import { getCompetitionsForDate } from "@/lib/season-utils";
import type { PlanPhase } from "@/types/plan";
import type { WeekDay } from "@/lib/plan-utils";
import type { Competition, Season } from "@/types/season";
import PlanPhaseRow from "./PlanPhaseRow";
import PlanCompetitionRow from "./PlanCompetitionRow";

interface PlanDayCardProps {
  day: WeekDay;
  phases: PlanPhase[];
  seasons: Season[];
  getPrepLabel: (competitionPrepId?: string) => string | null;
  onPhaseClick: (phase: PlanPhase) => void;
  onCompetitionClick?: (competition: Competition) => void;
  onAddPhase: (date: string) => void;
}

export default function PlanDayCard({
  day,
  phases,
  seasons,
  getPrepLabel,
  onPhaseClick,
  onCompetitionClick,
  onAddPhase,
}: PlanDayCardProps) {
  const dayPhases = getPhasesForDate(phases, day.iso);
  const dayCompetitions = getCompetitionsForDate(seasons, day.iso);
  const hasContent = dayPhases.length > 0 || dayCompetitions.length > 0;
  const todayColors = day.isToday ? { color: "#eab308", background: "rgba(234, 179, 8, 0.15)" } : null;

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

      {!hasContent ? (
        <div className="plan-day-empty-state">
          <span className="plan-day-empty">Bez plánu</span>
          <button type="button" className="btn btn-secondary btn-sm plan-add-btn" onClick={() => onAddPhase(day.iso)}>
            + Přidat
          </button>
        </div>
      ) : (
        <>
          <div className="plan-day-phases">
            {dayCompetitions.map((competition) => (
              <PlanCompetitionRow
                key={`comp-${competition.id}`}
                competition={competition}
                onClick={onCompetitionClick}
              />
            ))}
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
