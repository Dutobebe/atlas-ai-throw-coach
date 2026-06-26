"use client";

import { formatDisciplineWithIcon } from "@/lib/history-display";
import { getSeriesTypeShortLabel } from "@/lib/training-wizard-utils";
import {
  formatTechniqueDisplay,
  getSeriesBestThrow,
  getSeriesIntensityPercent,
  getSeriesThrowCount,
  isThrowSeries,
} from "@/lib/training-utils";
import SeriesGoalsDisplay from "@/components/training/SeriesGoalsDisplay";
import IntensityBadge from "@/components/common/IntensityBadge";
import type { TrainingSeries } from "@/types/training";

interface TrainingSeriesSummaryCardProps {
  series: TrainingSeries;
  index: number;
  onClick: () => void;
}

export default function TrainingSeriesSummaryCard({
  series,
  index,
  onClick,
}: TrainingSeriesSummaryCardProps) {
  const isThrow = isThrowSeries(series);
  const best = getSeriesBestThrow(series);
  const throwCount = getSeriesThrowCount(series);
  const typeLabel = getSeriesTypeShortLabel(series.seriesType);

  return (
    <button type="button" className="training-series-summary" onClick={onClick}>
      <div className="training-series-summary-top">
        <span className="training-series-summary-title">
          Série {index + 1} — {formatDisciplineWithIcon(series.discipline)}
        </span>
        <span className={`training-series-type-badge training-series-type-${series.seriesType.toLowerCase()}`}>
          {typeLabel}
        </span>
      </div>

      <div className="training-series-summary-meta">
        {series.technique && (
          <span>{formatTechniqueDisplay(series.discipline, series.technique)}</span>
        )}
        {series.implementWeight && series.implementWeight !== "IMI" && (
          <span>{series.implementWeight}</span>
        )}
        <span>
          {throwCount} {isThrow ? "hodů" : "opakování"}
        </span>
        <IntensityBadge value={getSeriesIntensityPercent(series)} />
      </div>

      {isThrow && best !== null && (
        <div className="training-series-summary-best">Nejlepší: {best} m</div>
      )}

      <SeriesGoalsDisplay goals={series.goals ?? []} />

      <span className="training-series-summary-edit">Upravit →</span>
    </button>
  );
}
