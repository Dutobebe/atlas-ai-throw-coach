"use client";

import { useMemo, useState } from "react";
import CompetitionCard from "@/components/planner/CompetitionCard";
import PlanTrainingItem from "@/components/plan/PlanTrainingItem";
import PlanTrainingTypePicker from "@/components/plan/PlanTrainingTypePicker";
import {
  buildPlannerEventsForDate,
  calculateDayStatus,
  DAY_STATUS_LABELS,
  plannerEventsHaveCompetition,
  resolveCompetitionFromEvent,
} from "@/lib/planner";
import { getDayTrainingPhases } from "@/lib/plan-utils";
import { getWeekdayFullName } from "@/lib/plan-display-utils";
import type { PlanPhase, PlanTrainingCategory } from "@/types/plan";
import type { WeekDay } from "@/lib/plan-utils";
import type { Competition, Season } from "@/types/season";

interface PlanDaySectionProps {
  day: WeekDay;
  phases: PlanPhase[];
  seasons: Season[];
  onAddTraining: (date: string, category: PlanTrainingCategory) => void;
  onPlanTextChange: (phaseId: string, text: string) => void;
  onRemoveTraining: (phaseId: string) => void;
  onCompetitionClick?: (competition: Competition) => void;
  sectionRef?: (el: HTMLElement | null) => void;
}

export default function PlanDaySection({
  day,
  phases,
  seasons,
  onAddTraining,
  onPlanTextChange,
  onRemoveTraining,
  onCompetitionClick,
  sectionRef,
}: PlanDaySectionProps) {
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const events = useMemo(
    () => buildPlannerEventsForDate(day.iso, phases, seasons),
    [day.iso, phases, seasons]
  );

  const dayTrainings = useMemo(
    () => getDayTrainingPhases(phases, day.iso),
    [phases, day.iso]
  );

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

      <div className="plan-day-trainings">
        {dayTrainings.length === 0 ? (
          <p className="plan-day-empty-hint">Zatím žádný trénink — přidej plán pro tento den.</p>
        ) : (
          dayTrainings.map((phase, index) => (
            <PlanTrainingItem
              key={phase.id}
              phase={phase}
              index={index}
              onPlanTextChange={onPlanTextChange}
              onRemove={onRemoveTraining}
            />
          ))
        )}

        <button
          type="button"
          className="btn btn-secondary btn-sm plan-day-add-training"
          onClick={() => setTypePickerOpen(true)}
        >
          + Přidat trénink
        </button>
      </div>

      <PlanTrainingTypePicker
        open={typePickerOpen}
        onClose={() => setTypePickerOpen(false)}
        onSelect={(category) => onAddTraining(day.iso, category)}
      />
    </section>
  );
}
