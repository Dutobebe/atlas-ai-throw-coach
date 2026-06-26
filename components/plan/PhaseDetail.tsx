"use client";

import { formatDisciplineWithIcon } from "@/lib/history-display";
import {
  getPhaseTypeLabel,
  getPhasesForDate,
  PHASE_STATUS_LABELS,
} from "@/lib/plan-utils";
import {
  formatDate,
  formatTechniqueDisplay,
  getDisciplineLabel,
  getPurposeLabel,
} from "@/lib/training-utils";
import {
  getPlannedSeriesIntensityPercent,
  getPlannedSeriesThrowCount,
  isPlannedImitationSeries,
} from "@/lib/planned-series-utils";
import SeriesGoalsDisplay from "@/components/training/SeriesGoalsDisplay";
import SeriesTypeBadge from "@/components/common/SeriesTypeBadge";
import IntensityBadge from "@/components/common/IntensityBadge";
import type { PlanPhase } from "@/types/plan";
import PhaseStatusBadge from "./PhaseStatusBadge";

interface PhaseDetailProps {
  phase: PlanPhase;
  phases: PlanPhase[];
  competitionPrepLabel?: string | null;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMarkSkipped: () => void;
  onMarkChanged: () => void;
  onMarkCompleted: () => void;
  onStartTraining: () => void;
}

export default function PhaseDetail({
  phase,
  phases,
  competitionPrepLabel,
  onBack,
  onEdit,
  onDelete,
  onDuplicate,
  onMarkSkipped,
  onMarkChanged,
  onMarkCompleted,
  onStartTraining,
}: PhaseDetailProps) {
  const dayPhases = getPhasesForDate(phases, phase.date);
  const phaseNumber = dayPhases.findIndex((item) => item.id === phase.id) + 1;

  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm plan-back-btn" onClick={onBack}>
        ← Zpět
      </button>

      <div className="detail-header">
        <h2>
          Fáze {phaseNumber > 0 ? phaseNumber : 1} — {phase.title || "Bez názvu"}
        </h2>
        <div className="history-meta">
          <span>{formatDate(phase.date)}</span>
          <span>{getPhaseTypeLabel(phase.type)}</span>
          <PhaseStatusBadge status={phase.status} />
        </div>
      </div>

      {competitionPrepLabel && (
        <div className="card plan-prep-card">
          <div className="card-subtitle">Příprava na závod</div>
          <div className="plan-prep-label">🏆 {competitionPrepLabel}</div>
        </div>
      )}

      {phase.disciplines.length > 0 && (
        <div className="card">
          <div className="card-subtitle">Plánované disciplíny</div>
          <div className="plan-detail-icons">
            {phase.disciplines.map((discipline) => (
              <span key={discipline} className="plan-detail-discipline">
                {formatDisciplineWithIcon(discipline)}
              </span>
            ))}
          </div>
        </div>
      )}

      {phase.plannedSeries.length > 0 && (
        <div className="card">
          <div className="card-title">Plánované série</div>
          {phase.plannedSeries.map((series, index) => (
            <div key={series.id} className="plan-detail-series">
              <div className="plan-detail-series-title">
                Série {index + 1} — {getDisciplineLabel(series.discipline)}
                <SeriesTypeBadge seriesType={series.seriesType ?? "Throw"} />
              </div>
              <div className="history-meta" style={{ marginTop: 4 }}>
                {series.technique && (
                  <span>{formatTechniqueDisplay(series.discipline, series.technique)}</span>
                )}
                {series.implementWeight && !isPlannedImitationSeries(series) && (
                  <span>{series.implementWeight}</span>
                )}
                <span>{getPlannedSeriesThrowCount(series)} hodů plán</span>
                <IntensityBadge value={getPlannedSeriesIntensityPercent(series)} />
                {series.purpose && <span>{getPurposeLabel(series.purpose)}</span>}
              </div>
              <SeriesGoalsDisplay goals={series.goals ?? []} />
              {series.note && <div className="card-subtitle">{series.note}</div>}
            </div>
          ))}
        </div>
      )}

      {phase.goal && (
        <div className="card">
          <div className="card-subtitle">Cíl</div>
          <p className="plan-detail-text">{phase.goal}</p>
        </div>
      )}

      {phase.note && (
        <div className="card">
          <div className="card-subtitle">Poznámka</div>
          <p className="plan-detail-text">{phase.note}</p>
        </div>
      )}

      <button type="button" className="btn btn-primary" onClick={onStartTraining}>
        ▶ Zahájit trénink
      </button>

      <div className="card plan-status-actions">
        <div className="card-subtitle">Stav fáze</div>
        <div className="plan-status-buttons">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onMarkCompleted}>
            {PHASE_STATUS_LABELS.completed}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onMarkSkipped}>
            {PHASE_STATUS_LABELS.skipped}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onMarkChanged}>
            {PHASE_STATUS_LABELS.changed}
          </button>
        </div>
      </div>

      <div className="actions-row plan-detail-actions">
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          Upravit
        </button>
        <button type="button" className="btn btn-secondary" onClick={onDuplicate}>
          Duplikovat
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          Smazat
        </button>
      </div>
    </>
  );
}
