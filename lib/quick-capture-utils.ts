import { resolveImplementForDiscipline } from "@/lib/implement-options";
import { resolveTechniqueForDiscipline } from "@/lib/technique-library";
import {
  DEFAULT_INTENSITY_PERCENT,
  emptySeries,
  getSeriesIntensityPercent,
  getSeriesThrowCount,
  isThrowSeries,
  normalizeSeries,
  normalizeSession,
  syncSessionForStorage,
  todayISO,
  uid,
} from "@/lib/training-utils";
import type { FavouriteSeries, QuickCaptureDraft } from "@/types/quick-capture";
import type { TrainingSeries, TrainingSession } from "@/types/training";

export const FAVOURITES_STORAGE_KEY = "atlas-quick-capture-favourites";
export const QUICK_CAPTURE_SESSION_TITLE = "Rychlý zápis";
export const MAX_FAVOURITES = 6;

export function emptyQuickCaptureDraft(): QuickCaptureDraft {
  const series = emptySeries();
  return seriesToDraft(series);
}

export function seriesToDraft(series: TrainingSeries): QuickCaptureDraft {
  return {
    discipline: series.discipline || "disk",
    technique: series.technique ?? "",
    implementWeight: series.implementWeight ?? "",
    throwCount: getSeriesThrowCount(series),
    bestThrow: series.bestThrow ?? "",
    intensityPercent: getSeriesIntensityPercent(series),
  };
}

export function draftToSeries(draft: QuickCaptureDraft): TrainingSeries {
  return normalizeSeries({
    ...emptySeries(),
    seriesType: "Throw",
    discipline: draft.discipline,
    technique: draft.technique,
    implementWeight: draft.implementWeight,
    throwCount: draft.throwCount,
    bestThrow: draft.bestThrow,
    intensityPercent: draft.intensityPercent,
    purpose: "technique",
    note: "",
    goals: [],
  });
}

export function draftFromFavourite(favourite: FavouriteSeries): QuickCaptureDraft {
  return {
    discipline: favourite.discipline,
    technique: favourite.technique,
    implementWeight: favourite.implementWeight,
    throwCount: favourite.throwCount,
    bestThrow: "",
    intensityPercent: favourite.intensityPercent,
  };
}

export function draftToFavourite(draft: QuickCaptureDraft): FavouriteSeries {
  return {
    id: uid(),
    discipline: draft.discipline,
    technique: draft.technique,
    implementWeight: draft.implementWeight,
    throwCount: draft.throwCount,
    intensityPercent: draft.intensityPercent,
  };
}

export function normalizeFavourite(raw: Partial<FavouriteSeries> & { id?: string }): FavouriteSeries {
  return {
    id: raw.id ?? uid(),
    discipline: raw.discipline ?? "disk",
    technique: raw.technique ?? "",
    implementWeight: raw.implementWeight ?? "",
    throwCount: Math.max(0, raw.throwCount ?? 0),
    intensityPercent:
      typeof raw.intensityPercent === "number" && !isNaN(raw.intensityPercent)
        ? Math.min(100, Math.max(0, raw.intensityPercent))
        : DEFAULT_INTENSITY_PERCENT,
  };
}

export function loadFavourites(): FavouriteSeries[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(FAVOURITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(0, MAX_FAVOURITES)
      .map((item) => normalizeFavourite(item as FavouriteSeries));
  } catch {
    return [];
  }
}

export function getLastSeriesDraft(sessions: TrainingSession[]): QuickCaptureDraft | null {
  if (sessions.length === 0) return null;

  const sorted = [...sessions].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  for (const session of sorted) {
    const seriesList = Array.isArray(session.series) ? session.series : [];
    for (let index = seriesList.length - 1; index >= 0; index -= 1) {
      const series = seriesList[index];
      if (!isThrowSeries(series)) continue;
      return seriesToDraft(normalizeSeries(series));
    }
  }

  return null;
}

export function applyDisciplineToDraft(
  draft: QuickCaptureDraft,
  discipline: string
): QuickCaptureDraft {
  return {
    ...draft,
    discipline,
    technique: resolveTechniqueForDiscipline(discipline, draft.technique),
    implementWeight: resolveImplementForDiscipline(discipline, draft.implementWeight),
  };
}

export function favouritesMatch(a: QuickCaptureDraft, b: FavouriteSeries): boolean {
  return (
    a.discipline === b.discipline &&
    a.technique === b.technique &&
    a.implementWeight === b.implementWeight &&
    a.throwCount === b.throwCount &&
    a.intensityPercent === b.intensityPercent
  );
}

export function appendQuickCaptureSeries(
  sessions: TrainingSession[],
  draft: QuickCaptureDraft
): { sessions: TrainingSession[]; sessionId: string } {
  const today = todayISO();
  const series = draftToSeries(draft);
  const existingIndex = sessions.findIndex(
    (session) =>
      session.date === today && session.title.trim() === QUICK_CAPTURE_SESSION_TITLE
  );

  if (existingIndex >= 0) {
    const existing = normalizeSession(sessions[existingIndex]);
    const updated = syncSessionForStorage({
      ...existing,
      series: [...existing.series, series],
    });

    return {
      sessions: sessions.map((session, index) =>
        index === existingIndex ? updated : session
      ),
      sessionId: updated.id,
    };
  }

  const newSession = syncSessionForStorage(
    normalizeSession({
      id: uid(),
      date: today,
      title: QUICK_CAPTURE_SESSION_TITLE,
      location: "",
      weather: "",
      readiness: 70,
      rpe: 5,
      note: "",
      disciplines: series.discipline ? [series.discipline] : [],
      sessionType: "training",
      series: [series],
      createdAt: new Date().toISOString(),
    })
  );

  return {
    sessions: [...sessions, newSession],
    sessionId: newSession.id,
  };
}

export function getFavouriteLabel(favourite: FavouriteSeries): string {
  const throws =
    favourite.throwCount > 0 ? `${favourite.throwCount}×` : "—";
  const implement = favourite.implementWeight.trim();
  return implement ? `${throws} · ${implement}` : throws;
}
