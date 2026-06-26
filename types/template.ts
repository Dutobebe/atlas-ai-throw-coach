import type { PhaseType } from "@/types/plan";
import type { SeriesPurpose, SeriesType } from "@/types/training";

export interface TemplateSeries {
  seriesType: SeriesType;
  discipline: string;
  technique: string;
  implementWeight: string;
  throwCount: number;
  intensityPercent: number;
  purpose: SeriesPurpose;
  note: string;
  goals?: string[];
}

export interface TemplatePhase {
  title: string;
  type: PhaseType;
  disciplines: string[];
  plannedSeries: TemplateSeries[];
}

export interface TrainingTemplate {
  id: string;
  name: string;
  description: string;
  phases: TemplatePhase[];
  createdAt: string;
  updatedAt: string;
}
