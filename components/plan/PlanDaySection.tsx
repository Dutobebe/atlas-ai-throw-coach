"use client";

import { useMemo } from "react";
import CompetitionCard from "@/components/planner/CompetitionCard";
import {
  buildPlannerEventsForDate,
  calculateDayStatus,
  DAY_STATUS_LABELS,
  plannerEventsHaveCompetition,
  resolveCompetitionFromEvent,
  resolvePlanPhaseFromEvent,
} from "@/lib/planner";
import { getWeekdayFullName } from "@/lib/plan-display-utils";
import { planDayDropDataAttributes, createPlanPhaseDropTarget } from "@/components/plan/dnd/plan-dnd-utils";
import type { PlanPhase } from "@/types/plan";
import type { WeekDay } from "@/lib/plan-utils";
import type { Competition, Season } from "@/types/season";
import PlanPhaseCard from "./PlanPhaseCard";

interface PlanDaySectionProps {
  day: WeekDay;
  phases: PlanPhase[];
  seasons: Season[];
  getPrepLabel: (competitionPrepId?: string) => string | null;
  onPhaseClick: (phase: PlanPhase) => void;
  onCompetitionClick?: (competition: Competition) => void;
  onAddPhase: (date: string) => void;
  sectionRef?: (el: HTMLElement | null) => void;
}

export default function PlanDaySection({
  day,
  phases,
  seasons,
  getPrepLabel,
  onPhaseClick,
  onCompetitionClick,
  onAddPhase,
  sectionRef,
}: PlanDaySectionProps) {
  const events = useMemo(
    () => buildPlannerEventsForDate(day.iso, phases, seasons),
    [day.iso, phases, seasons]
  );

  const dayStatus = useMemo(() => calculateDayStatus(events), [events]);
  const hasContent = events.length > 0;
  const hasCompetition = plannerEventsHaveCompetition(events);
  const dropAttrs = planDayDropDataAttributes(createPlanPhaseDropTarget(day.iso));

  let phaseIndex = 0;

  return (
    <section
      id={`plan-day-${day.iso}`}
      ref={sectionRef}
      className={`plan-day-section${day.isToday ? " plan-day-section-today" : ""}`}
      {...dropAttrs}
      data-plan-day-section="true"
      data-day-status={dayStatus}
    >
      <header className="plan-day-section-header">
        <h3 className="plan-day-section-title">{getWeekdayFullName(day.iso)}</h3>
        {day.isToday && <span className="plan-day-section-today-badge">Dnes</span>}
        {hasCompetition && <span className="plan-day-competition-badge">🏆 Závod</span>}
        {dayStatus !== "REST" && dayStatus !== "COMPETITION" && (
          <span className="plan-day-status-badge" data-status={dayStatus}>
            {DAY_STATUS_LABELS[dayStatus]}
          </span>
        )}
      </header>

      {!hasContent ? (
        <button
          type="button"
          className="plan-day-add-empty"
          onClick={() => onAddPhase(day.iso)}
        >
          + Přidat trénink
        </button>
      ) : (
        <div className="plan-day-section-content">
          {events.map((event) => {
            if (event.source.type === "competition") {
              const competition = resolveCompetitionFromEvent(event, seasons);
              if (!competition) return null;
              return (
                <CompetitionCard
                  key={event.id}
                  competition={competition}
                  onClick={onCompetitionClick}
                />
              );
            }

            const phase = resolvePlanPhaseFromEvent(event, phases);
            if (!phase) return null;
            const index = phaseIndex;
            phaseIndex += 1;

            return (
              <PlanPhaseCard
                key={event.id}
                phase={phase}
                phaseIndex={index}
                prepLabel={getPrepLabel(phase.competitionPrepId)}
                onClick={onPhaseClick}
              />
            );
          })}
          <button
            type="button"
            className="plan-day-add-link"
            onClick={() => onAddPhase(day.iso)}
          >
            + Přidat trénink
          </button>
        </div>
      )}
    </section>
  );
}
