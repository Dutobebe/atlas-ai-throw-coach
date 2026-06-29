"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import PlannerHeader from "@/components/planner/PlannerHeader";
import WeekStrip from "@/components/planner/WeekStrip";
import { useSelectedWeek } from "@/hooks/useSelectedWeek";
import {
  buildPlannerEventsForDate,
  calculateDayStripState,
} from "@/lib/planner";
import {
  calculateWeekSummary,
  defaultAddTrainingDate,
} from "@/lib/planner/week-summary";
import { getPhasesForWeek } from "@/lib/plan-utils";
import { todayISO } from "@/lib/training-utils";
import type { PlanPhase } from "@/types/plan";
import type { Season, Competition } from "@/types/season";
import PlanDaySection from "@/components/plan/PlanDaySection";

export interface PlannerProps {
  planEntryKey: number;
  phases: PlanPhase[];
  seasons: Season[];
  getPrepLabel: (competitionPrepId?: string) => string | null;
  onPhaseClick: (phase: PlanPhase) => void;
  onCompetitionClick?: (competition: Competition) => void;
  onAddPhase: (date: string) => void;
}

export default function Planner({
  planEntryKey,
  phases,
  seasons,
  getPrepLabel,
  onPhaseClick,
  onCompetitionClick,
  onAddPhase,
}: PlannerProps) {
  const {
    selectedWeekStart,
    previousWeek,
    nextWeek,
    goToCurrentWeek,
    weekNumber,
    weekRange,
    weekDays,
  } = useSelectedWeek({ planEntryKey });

  const [focusedDate, setFocusedDate] = useState(() => todayISO());
  const dayRefs = useRef<Record<string, HTMLElement | null>>({});

  const weekPhases = useMemo(
    () => getPhasesForWeek(phases, selectedWeekStart),
    [phases, selectedWeekStart]
  );

  const weekSummary = useMemo(
    () => calculateWeekSummary(weekDays, weekPhases, seasons),
    [weekDays, weekPhases, seasons]
  );

  const stripStateByDate = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateDayStripState>> = {};
    for (const day of weekDays) {
      const events = buildPlannerEventsForDate(day.iso, weekPhases, seasons);
      map[day.iso] = calculateDayStripState(events);
    }
    return map;
  }, [weekDays, weekPhases, seasons]);

  const setDayRef = useCallback((iso: string, el: HTMLElement | null) => {
    dayRefs.current[iso] = el;
  }, []);

  const handleToday = useCallback(() => {
    goToCurrentWeek();
    setFocusedDate(todayISO());
    requestAnimationFrame(() => {
      dayRefs.current[todayISO()]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [goToCurrentWeek]);

  const handleAddTraining = useCallback(() => {
    onAddPhase(defaultAddTrainingDate(weekDays, todayISO()));
  }, [onAddPhase, weekDays]);

  const selectDay = useCallback((iso: string) => {
    setFocusedDate(iso);
    requestAnimationFrame(() => {
      dayRefs.current[iso]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="planner plan-week" data-week-start={selectedWeekStart}>
      <PlannerHeader
        weekNumber={weekNumber}
        weekRange={weekRange}
        summary={weekSummary}
        onPrevious={previousWeek}
        onNext={nextWeek}
        onToday={handleToday}
        onAddTraining={handleAddTraining}
      />

      <WeekStrip
        days={weekDays}
        stripStateByDate={stripStateByDate}
        focusedDate={focusedDate}
        onDaySelect={selectDay}
      />

      <div className="plan-week-days">
        {weekDays.map((day) => (
          <PlanDaySection
            key={day.iso}
            day={day}
            phases={weekPhases}
            seasons={seasons}
            getPrepLabel={getPrepLabel}
            onPhaseClick={onPhaseClick}
            onCompetitionClick={onCompetitionClick}
            onAddPhase={onAddPhase}
            sectionRef={(el) => setDayRef(day.iso, el)}
          />
        ))}
      </div>
    </div>
  );
}
