import type { TrainingSession } from "@/types/training";
import { isThrowSeries, normalizeSession } from "@/lib/training-utils";

export const LIVE_TRAINING_STORAGE_KEY = "atlas-live-training";

export type LiveTrainingStep = "series" | "best-throw" | "summary";

export interface LiveTrainingMeta {
  sessionId: string;
  seriesTargets: number[];
  currentSeriesIndex: number;
  step: LiveTrainingStep;
}

export interface PreparedLiveSession {
  session: TrainingSession;
  seriesTargets: number[];
}

export function prepareSessionForLive(session: TrainingSession): PreparedLiveSession {
  const normalized = normalizeSession(session);
  const seriesTargets = normalized.series.map((item) =>
    Math.max(0, item.throwCount ?? 0)
  );

  const series = normalized.series.map((item) => ({
    ...item,
    throwCount: 0,
    bestThrow: isThrowSeries(item) ? "" : "",
  }));

  return {
    session: { ...normalized, series },
    seriesTargets,
  };
}

export function createInitialLiveMeta(sessionId: string, seriesTargets: number[]): LiveTrainingMeta {
  return {
    sessionId,
    seriesTargets,
    currentSeriesIndex: 0,
    step: "series",
  };
}

export function loadLiveTrainingMeta(): LiveTrainingMeta | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(LIVE_TRAINING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveTrainingMeta;
    if (!parsed.sessionId || !Array.isArray(parsed.seriesTargets)) return null;
    if (parsed.step !== "series" && parsed.step !== "best-throw" && parsed.step !== "summary") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveLiveTrainingMeta(meta: LiveTrainingMeta): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIVE_TRAINING_STORAGE_KEY, JSON.stringify(meta));
}

export function clearLiveTrainingMeta(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LIVE_TRAINING_STORAGE_KEY);
}

export function getLiveSeriesProgress(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((currentIndex / total) * 100));
}

export function getLiveCompletedSeriesProgress(completedCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completedCount / total) * 100));
}

export function countLiveSessionThrows(session: TrainingSession): number {
  return session.series.reduce(
    (total, series) => (isThrowSeries(series) ? total + series.throwCount : total),
    0
  );
}

export function shouldPromptBestThrow(session: TrainingSession, seriesIndex: number): boolean {
  const series = session.series[seriesIndex];
  if (!series) return false;
  return isThrowSeries(series);
}
