"use client";

import {
  getPlannedSeriesIntensityPercent,
  isPlannedImitationSeries,
  isPlannedThrowSeries,
} from "@/lib/planned-series-utils";
import {
  DISCIPLINES,
  IMI_IMPLEMENT_VALUE,
  SERIES_PURPOSES,
  SERIES_TYPES,
  DEFAULT_INTENSITY_PERCENT,
  showsImplementField,
} from "@/lib/training-utils";
import { resolveImplementForDiscipline } from "@/lib/implement-options";
import { resolveTechniqueForDiscipline } from "@/lib/technique-library";
import { filterGoalsForDiscipline } from "@/lib/goal-library";
import type { PlannedSeries } from "@/types/plan";
import type { SeriesType } from "@/types/training";
import IntensityBadge from "@/components/common/IntensityBadge";
import ImplementSelector from "@/components/training/ImplementSelector";
import TechniqueSelector from "@/components/training/TechniqueSelector";
import SeriesGoalSelector from "@/components/training/SeriesGoalSelector";

interface PlannedSeriesCardProps {
  series: PlannedSeries;
  index: number;
  canRemove: boolean;
  onChange: (series: PlannedSeries) => void;
  onRemove: () => void;
}

export default function PlannedSeriesCard({
  series,
  index,
  canRemove,
  onChange,
  onRemove,
}: PlannedSeriesCardProps) {
  const isImitation = isPlannedImitationSeries(series);
  const isThrow = isPlannedThrowSeries(series);
  const intensity = getPlannedSeriesIntensityPercent(series);

  function updateField<K extends keyof PlannedSeries>(field: K, value: PlannedSeries[K]) {
    onChange({ ...series, [field]: value });
  }

  function handleSeriesTypeChange(seriesType: SeriesType) {
    if (seriesType === "Imitation") {
      onChange({
        ...series,
        seriesType,
        implementWeight: IMI_IMPLEMENT_VALUE,
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
        <label className="form-label">{isThrow ? "Počet hodů" : "Počet opakování"}</label>
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

      <div className="form-group">
        <label className="form-label form-label-row">
          <span>Intenzita</span>
          <IntensityBadge value={intensity} />
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          step={5}
          className="form-input"
          value={intensity}
          onChange={(e) => {
            const raw = parseInt(e.target.value, 10);
            const next = isNaN(raw)
              ? DEFAULT_INTENSITY_PERCENT
              : Math.min(100, Math.max(0, raw));
            updateField("intensityPercent", next);
          }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Účel</label>
        <select
          className="form-select"
          value={series.purpose}
          onChange={(e) => updateField("purpose", e.target.value as PlannedSeries["purpose"])}
        >
          {SERIES_PURPOSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Poznámka</label>
        <textarea
          className="form-textarea"
          placeholder="Poznámky k plánované sérii..."
          value={series.note}
          onChange={(e) => updateField("note", e.target.value)}
        />
      </div>
    </div>
  );
}
