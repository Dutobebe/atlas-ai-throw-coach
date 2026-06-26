import { getImplementPresets, resolveImplementForDiscipline } from "@/lib/implement-options";
import { normalizeSeriesGoals } from "@/lib/goal-library";
import {
  DEFAULT_INTENSITY_PERCENT,
  IMI_IMPLEMENT_VALUE,
  isThrowSeries,
  isValidSeriesType,
  showsImplementField,
  uid,
} from "@/lib/training-utils";
import type { SeriesType, TrainingSeries } from "@/types/training";
import type { PlannedSeries } from "@/types/plan";

function resolvePlannedSeriesType(series: Partial<PlannedSeries>): SeriesType {
  if (isValidSeriesType(series.seriesType)) {
    return series.seriesType;
  }
  if (series.implementWeight?.trim().toUpperCase() === IMI_IMPLEMENT_VALUE) {
    return "Imitation";
  }
  return "Throw";
}

export function isPlannedThrowSeries(series: PlannedSeries): boolean {
  return isThrowSeries(series);
}

export function isPlannedImitationSeries(series: PlannedSeries): boolean {
  return series.seriesType === "Imitation";
}

export function getPlannedSeriesThrowCount(series: PlannedSeries): number {
  if (typeof series.throwCount === "number" && series.throwCount >= 0) {
    return series.throwCount;
  }
  return 0;
}

export function getPlannedSeriesIntensityPercent(series: PlannedSeries): number {
  if (typeof series.intensityPercent === "number" && !isNaN(series.intensityPercent)) {
    return Math.min(100, Math.max(0, Math.round(series.intensityPercent)));
  }
  return DEFAULT_INTENSITY_PERCENT;
}

export function emptyPlannedSeries(discipline = "disk"): PlannedSeries {
  return {
    id: uid(),
    seriesType: "Throw",
    discipline,
    technique: "",
    implementWeight: getImplementPresets(discipline)[0] ?? "",
    throwCount: 0,
    intensityPercent: DEFAULT_INTENSITY_PERCENT,
    purpose: "technique",
    note: "",
    goals: [],
  };
}

export function normalizePlannedSeries(
  series: Partial<PlannedSeries> & Partial<TrainingSeries>
): PlannedSeries {
  const seriesType = resolvePlannedSeriesType(series);
  const isImitation = seriesType === "Imitation";
  const discipline = series.discipline ?? "disk";
  const throwCount =
    typeof series.throwCount === "number" && series.throwCount >= 0 ? series.throwCount : 0;

  return {
    id: series.id ?? uid(),
    seriesType,
    discipline,
    technique: series.technique ?? "",
    implementWeight: isImitation
      ? IMI_IMPLEMENT_VALUE
      : showsImplementField({ seriesType })
        ? resolveImplementForDiscipline(discipline, series.implementWeight ?? "")
        : "",
    throwCount,
    intensityPercent: getPlannedSeriesIntensityPercent(series as PlannedSeries),
    purpose: series.purpose ?? "technique",
    note: series.note ?? "",
    goals: normalizeSeriesGoals(series.goals, discipline),
  };
}

/** Converts planned workload to training series — no bestThrow (actual results belong in Trénink). */
export function plannedSeriesToTrainingSeries(planned: PlannedSeries): TrainingSeries {
  return {
    id: uid(),
    seriesType: planned.seriesType,
    discipline: planned.discipline,
    technique: planned.technique,
    implementWeight: planned.implementWeight,
    throwCount: planned.throwCount,
    bestThrow: "",
    intensityPercent: getPlannedSeriesIntensityPercent(planned),
    purpose: planned.purpose,
    note: planned.note,
    goals: [...planned.goals],
  };
}
