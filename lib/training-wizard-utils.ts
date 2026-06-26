import type { TrainingSession } from "@/types/training";
import type { SeriesType } from "@/types/training";
import {
  getDisciplineLabel,
  getSeriesThrowCount,
  isThrowSeries,
} from "@/lib/training-utils";

export type TrainingWizardStep = "basics" | "series" | "summary" | "evaluation";

export type TrainingScreenView = "wizard" | "series-editor";

export const WIZARD_STEPS: { key: TrainingWizardStep; label: string }[] = [
  { key: "basics", label: "Základ" },
  { key: "series", label: "Série" },
  { key: "summary", label: "Souhrn" },
  { key: "evaluation", label: "Vyhodnocení" },
];

export function getWizardStepIndex(step: TrainingWizardStep): number {
  return WIZARD_STEPS.findIndex((item) => item.key === step);
}

export function getWizardStepLabel(step: TrainingWizardStep): string {
  return WIZARD_STEPS.find((item) => item.key === step)?.label ?? step;
}

export function getSeriesTypeShortLabel(type: SeriesType): string {
  switch (type) {
    case "Throw":
      return "Hod";
    case "Imitation":
      return "IMI";
    case "Drill":
      return "Drill";
    case "Exercise":
      return "Cvičení";
    default:
      return "Hod";
  }
}

export interface SessionThrowSummaryRow {
  discipline: string;
  label: string;
  throws: number;
}

export interface SessionDraftSummary {
  throwRows: SessionThrowSummaryRow[];
  totalThrows: number;
  totalSeries: number;
  throwSeriesCount: number;
  nonThrowSeriesCount: number;
  nonThrowLabels: string[];
}

export function summarizeSessionDraft(session: TrainingSession): SessionDraftSummary {
  const throwCounts = new Map<string, number>();
  let throwSeriesCount = 0;
  let nonThrowSeriesCount = 0;
  const nonThrowTypes = new Set<string>();

  for (const series of session.series) {
    if (isThrowSeries(series)) {
      throwSeriesCount += 1;
      const count = getSeriesThrowCount(series);
      if (count > 0) {
        throwCounts.set(
          series.discipline,
          (throwCounts.get(series.discipline) ?? 0) + count
        );
      }
    } else {
      nonThrowSeriesCount += 1;
      nonThrowTypes.add(getSeriesTypeShortLabel(series.seriesType));
    }
  }

  const throwRows = [...throwCounts.entries()]
    .map(([discipline, throws]) => ({
      discipline,
      label: getDisciplineLabel(discipline),
      throws,
    }))
    .sort((a, b) => b.throws - a.throws);

  const totalThrows = throwRows.reduce((sum, row) => sum + row.throws, 0);

  return {
    throwRows,
    totalThrows,
    totalSeries: session.series.length,
    throwSeriesCount,
    nonThrowSeriesCount,
    nonThrowLabels: [...nonThrowTypes],
  };
}

export function canAdvanceFromStep(
  step: TrainingWizardStep,
  session: TrainingSession
): boolean {
  switch (step) {
    case "basics":
      return Boolean(session.date) && session.disciplines.length > 0;
    case "series":
      return session.series.length > 0;
    case "summary":
      return session.series.length > 0;
    case "evaluation":
      return true;
    default:
      return true;
  }
}
