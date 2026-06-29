"use client";

import type { PlanDayStripState } from "@/types/planner-strip";
import { dayStatusCssClass } from "@/lib/planner/dayStatus";
import type { WeekDay } from "@/lib/week";

interface WeekStripProps {
  days: WeekDay[];
  stripStateByDate: Record<string, PlanDayStripState>;
  focusedDate: string;
  onDaySelect: (iso: string) => void;
}

export default function WeekStrip({
  days,
  stripStateByDate,
  focusedDate,
  onDaySelect,
}: WeekStripProps) {
  return (
    <div className="plan-week-strip" role="tablist" aria-label="Dny v týdnu">
      {days.map((day) => {
        const state = stripStateByDate[day.iso];
        const isFocused = day.iso === focusedDate;
        const statusClass = state?.status ? dayStatusCssClass(state.status) : "";
        const classNames = [
          "plan-week-strip-day",
          day.isToday ? "plan-week-strip-day-today" : "",
          isFocused ? "plan-week-strip-day-focused" : "",
          statusClass,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={day.iso}
            type="button"
            role="tab"
            aria-selected={isFocused}
            aria-label={`${day.weekday} ${day.dayNumber}, ${state?.status ?? "REST"}`}
            className={classNames}
            data-day-status={state?.status ?? "REST"}
            onClick={() => onDaySelect(day.iso)}
          >
            <span className="plan-week-strip-weekday">{day.weekday}</span>
            <span className="plan-week-strip-date">{day.dayNumber}</span>
            {state && state.indicators.length > 0 && (
              <span className="plan-week-strip-dots" aria-hidden="true">
                {state.hasCompetition && (
                  <span className="plan-week-strip-dot plan-week-strip-dot-competition" />
                )}
                {state.hasPlanned && (
                  <span className="plan-week-strip-dot plan-week-strip-dot-planned" />
                )}
                {state.hasCompleted && (
                  <span className="plan-week-strip-dot plan-week-strip-dot-completed" />
                )}
                {state.hasUpdated && (
                  <span className="plan-week-strip-dot plan-week-strip-dot-updated" />
                )}
                {state.hasSkipped && (
                  <span className="plan-week-strip-dot plan-week-strip-dot-skipped" />
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
