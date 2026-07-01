"use client";

import {
  DISCIPLINES,
  IMI_IMPLEMENT_VALUE,
  SERIES_PURPOSES,
  SERIES_TYPES,
  calculateSeriesStats,
  getSeriesIntensityPercent,
  isImitationSeries,
  isThrowSeries,
  showsBestThrowField,
  showsImplementField,
} from "@/lib/training-utils";
import { resolveImplementForDiscipline } from "@/lib/implement-options";
import { resolveTechniqueForDiscipline } from "@/lib/technique-library";
import { filterGoalsForDiscipline } from "@/lib/goal-library";
import type { SeriesType, TrainingSeries } from "@/types/training";
import IntensityBadge from "@/components/common/IntensityBadge";
import IntensitySelector from "./IntensitySelector";
import ImplementSelector from "./ImplementSelector";
import TechniqueSelector from "./TechniqueSelector";
import SeriesGoalSelector from "./SeriesGoalSelector";

interface TrainingSeriesCardProps {
  series: TrainingSeries;
  index: number;
  canRemove: boolean;
  onChange: (series: TrainingSeries) => void;
  onRemove: () => void;
}

export default function TrainingSeriesCard({
  series,
  index,
  canRemove,
  onChange,
  onRemove,
}: TrainingSeriesCardProps) {
  const isImitation = isImitationSeries(series);
  const isThrow = isThrowSeries(series);
  const stats = calculateSeriesStats(series);
  const showStats = isThrow && (stats.count > 0 || stats.best !== null);
  const intensity = getSeriesIntensityPercent(series);

  function updateField<K extends keyof TrainingSeries>(field: K, value: TrainingSeries[K]) {
    onChange({ ...series, [field]: value });
  }

  function handleSeriesTypeChange(seriesType: SeriesType) {
    if (seriesType === "Imitation") {
      onChange({
        ...series,
        seriesType,
        implementWeight: IMI_IMPLEMENT_VALUE,
        bestThrow: "",
      });
      return;
    }

    onChange({
      ...series,
      seriesType,
      implementWeight: resolveImplementForDiscipline(
        series.discipline,
        series.implementWeight === IMI_IMPLEMENT_VALUE ? "" : series.implementWeight
      ),
      bestThrow: seriesType === "Throw" ? series.bestThrow : "",
    });
  }

  function handleDisciplineChange(discipline: string) {
    onChange({
      ...series,
      discipline,
      technique: resolveTechniqueForDiscipline(discipline, series.technique),
      goals: filterGoalsForDiscipline(series.goals ?? [], discipline),
      implementWeight: isImitation
        ? IMI_IMPLEMENT_VALUE
        : resolveImplementForDiscipline(discipline, series.implementWeight),
    });
  }

  return (
    <div className="series-card">
      <div className="series-header">
        <span className="series-number">Série {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            className="btn btn-danger btn-sm btn-icon"
            onClick={onRemove}
            aria-label="Smazat sérii"
          >
            ✕
          </button>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Typ série</label>
        <select
          className="form-select"
          value={series.seriesType ?? "Throw"}
          onChange={(e) => handleSeriesTypeChange(e.target.value as SeriesType)}
        >
          {SERIES_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Disciplína</label>
        <select
          className="form-select"
          value={series.discipline}
          onChange={(e) => handleDisciplineChange(e.target.value)}
        >
          {DISCIPLINES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <TechniqueSelector
        discipline={series.discipline}
        value={series.technique}
        onChange={(technique) => updateField("technique", technique)}
      />

      {showsImplementField(series) && (
        <ImplementSelector
          discipline={series.discipline}
          value={series.implementWeight}
          onChange={(implementWeight) => updateField("implementWeight", implementWeight)}
        />
      )}

      <SeriesGoalSelector
        discipline={series.discipline}
        value={series.goals ?? []}
        onChange={(goals) => updateField("goals", goals)}
      />

      <div className="form-group">
        <label className="form-label">Účel</label>
        <select
          className="form-select"
          value={series.purpose}
          onChange={(e) => updateField("purpose", e.target.value as TrainingSeries["purpose"])}
        >
          {SERIES_PURPOSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label form-label-row">
          <span>Intenzita</span>
          <IntensityBadge value={intensity} />
        </label>
        <IntensitySelector
          value={intensity}
          onChange={(intensityPercent) => updateField("intensityPercent", intensityPercent)}
        />
      </div>

      {showsBestThrowField(series) && (
        <div className="form-group">
          <label className="form-label">Nejdelší hod (m)</label>
          <input
            type="text"
            inputMode="decimal"
            className="form-input"
            placeholder="např. 45.32"
            value={series.bestThrow}
            onChange={(e) => updateField("bestThrow", e.target.value)}
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">{isThrow ? "Hody / počet" : "Počet opakování"}</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          className="form-input"
          placeholder="např. 6"
          value={series.throwCount || ""}
          onChange={(e) =>
            updateField("throwCount", Math.max(0, parseInt(e.target.value, 10) || 0))
          }
        />
      </div>

      {showStats && (
        <div className="series-stats series-stats-two">
          <div className="series-stat">
            <span className="series-stat-value">{stats.count}</span>
            <span className="series-stat-label">Hodů</span>
          </div>
          <div className="series-stat">
            <span className="series-stat-value">
              {stats.best !== null ? `${stats.best} m` : "—"}
            </span>
            <span className="series-stat-label">Nejlepší</span>
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Poznámka ke sérii</label>
        <textarea
          className="form-textarea"
          placeholder="Poznámky k této sérii..."
          value={series.note}
          onChange={(e) => updateField("note", e.target.value)}
        />
      </div>
    </div>
  );
}
