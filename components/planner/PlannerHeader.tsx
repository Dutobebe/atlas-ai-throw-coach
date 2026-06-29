"use client";

import type { PlannerWeekSummary } from "@/lib/planner/week-summary";

export interface PlannerHeaderProps {
  weekNumber: number;
  weekRange: string;
  summary: PlannerWeekSummary;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddTraining: () => void;
}

export default function PlannerHeader({
  weekNumber,
  weekRange,
  summary,
  onPrevious,
  onNext,
  onToday,
  onAddTraining,
}: PlannerHeaderProps) {
  return (
    <header className="planner-header">
      <div className="planner-header-nav">
        <button
          type="button"
          className="planner-header-nav-btn"
          onClick={onPrevious}
          aria-label="Předchozí týden"
        >
          ←
        </button>

        <div className="planner-header-nav-center">
          <div className="planner-header-title">Týden {weekNumber}</div>
          <p className="planner-header-range">{weekRange}</p>
        </div>

        <button
          type="button"
          className="planner-header-nav-btn"
          onClick={onNext}
          aria-label="Další týden"
        >
          →
        </button>
      </div>

      <div className="planner-header-actions">
        <button type="button" className="planner-header-today-btn" onClick={onToday}>
          Dnes
        </button>
        <button type="button" className="planner-header-add-btn" onClick={onAddTraining}>
          + Přidat trénink
        </button>
      </div>

      <div className="planner-header-summary" aria-label="Souhrn týdne">
        <span className="planner-summary-item">
          <span className="planner-summary-icon" aria-hidden="true">
            🏋
          </span>
          <span className="planner-summary-label">Tréninky</span>
          <span className="planner-summary-count">{summary.trainings}</span>
        </span>
        <span className="planner-summary-item">
          <span className="planner-summary-icon" aria-hidden="true">
            🏆
          </span>
          <span className="planner-summary-label">Závody</span>
          <span className="planner-summary-count">{summary.competitions}</span>
        </span>
        <span className="planner-summary-item">
          <span className="planner-summary-icon" aria-hidden="true">
            🛌
          </span>
          <span className="planner-summary-label">Volno</span>
          <span className="planner-summary-count">{summary.restDays}</span>
        </span>
      </div>
    </header>
  );
}
