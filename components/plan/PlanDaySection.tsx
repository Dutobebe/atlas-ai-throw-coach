"use client";

import { useMemo } from "react";
import CompetitionCard from "@/components/planner/CompetitionCard";
import {
  buildPlannerEventsForDate,
  calculateDayStatus,
  DAY_STATUS_LABELS,
  plannerEventsHaveCompetition,
  resolveCompetitionFromEvent,
} from "@/lib/planner";
import { getDayPlanText } from "@/lib/plan-utils";
import { getWeekdayFullName } from "@/lib/plan-display-utils";
import type { PlanPhase } from "@/types/plan";
import type { WeekDay } from "@/lib/plan-utils";
import type { Competition, Season } from "@/types/season";

interface PlanDaySectionProps {
  day: WeekDay;
  phases: PlanPhase[];
  seasons: Season[];
  onPlanTextChange: (date: string, text: string) => void;
  onCompetitionClick?: (competition: Competition) => void;
  sectionRef?: (el: HTMLElement | null) => void;
}

export default function PlanDaySection({
  day,
  phases,
  seasons,
  onPlanTextChange,
  onCompetitionClick,
  sectionRef,
}: PlanDaySectionProps) {
  const events = useMemo(
    () => buildPlannerEventsForDate(day.iso, phases, seasons),
    [day.iso, phases, seasons]
  );

  const planText = useMemo(() => getDayPlanText(phases, day.iso), [phases, day.iso]);
  const dayStatus = useMemo(() => calculateDayStatus(events), [events]);
  const hasCompetition = plannerEventsHaveCompetition(events);
  const competitionEvents = events.filter((event) => event.source.type === "competition");

  return (
    <section
      id={`plan-day-${day.iso}`}
      ref={sectionRef}
      className={`plan-day-section${day.isToday ? " plan-day-section-today" : ""}`}
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

      {competitionEvents.length > 0 && (
        <div className="plan-day-section-content plan-day-competitions">
          {competitionEvents.map((event) => {
            const competition = resolveCompetitionFromEvent(event, seasons);
            if (!competition) return null;
            return (
              <CompetitionCard
                key={event.id}
                competition={competition}
                onClick={onCompetitionClick}
              />
            );
          })}
        </div>
      )}

      <div className="plan-day-text-wrap">
        <label className="form-label plan-day-text-label" htmlFor={`plan-text-${day.iso}`}>
          Plán tréninku
        </label>
        <textarea
          id={`plan-text-${day.iso}`}
          className="form-input plan-day-textarea"
          rows={6}
          placeholder={`Kladivo:\n6kg 2/2 8 hodů\n7,26kg 2/1 6 hodů\n\nDisk:\n1,5kg z místa 8 hodů`}
          value={planText}
          onChange={(e) => onPlanTextChange(day.iso, e.target.value)}
        />
      </div>
    </section>
  );
}
