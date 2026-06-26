"use client";

import { useMemo, useState } from "react";
import IntensityBadge from "@/components/common/IntensityBadge";
import ImplementSelector from "@/components/training/ImplementSelector";
import TechniqueSelector from "@/components/training/TechniqueSelector";
import { getDisciplineIcon } from "@/lib/design";
import {
  applyDisciplineToDraft,
  draftFromFavourite,
  draftToFavourite,
  emptyQuickCaptureDraft,
  favouritesMatch,
  getFavouriteLabel,
  getLastSeriesDraft,
  MAX_FAVOURITES,
} from "@/lib/quick-capture-utils";
import {
  DEFAULT_INTENSITY_PERCENT,
  DISCIPLINES,
  formatTechniqueDisplay,
  getDisciplineLabel,
} from "@/lib/training-utils";
import type { FavouriteSeries, QuickCaptureDraft } from "@/types/quick-capture";
import type { TrainingSession } from "@/types/training";

interface QuickCaptureScreenProps {
  sessions: TrainingSession[];
  favourites: FavouriteSeries[];
  onFavouritesChange: (favourites: FavouriteSeries[]) => void;
  onSave: (draft: QuickCaptureDraft) => void;
  onClose: () => void;
}

export default function QuickCaptureScreen({
  sessions,
  favourites,
  onFavouritesChange,
  onSave,
  onClose,
}: QuickCaptureScreenProps) {
  const [draft, setDraft] = useState<QuickCaptureDraft>(() => emptyQuickCaptureDraft());

  const lastSeries = useMemo(() => getLastSeriesDraft(sessions), [sessions]);
  const canPinFavourite =
    favourites.length < MAX_FAVOURITES &&
    !favourites.some((item) => favouritesMatch(draft, item));

  function updateDraft(partial: Partial<QuickCaptureDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function applyFavourite(favourite: FavouriteSeries) {
    setDraft(draftFromFavourite(favourite));
  }

  function applyLastSeries() {
    if (!lastSeries) return;
    setDraft({ ...lastSeries, bestThrow: "" });
  }

  function pinFavourite() {
    if (!canPinFavourite) return;
    onFavouritesChange([...favourites, draftToFavourite(draft)]);
  }

  function removeFavourite(id: string) {
    onFavouritesChange(favourites.filter((item) => item.id !== id));
  }

  function handleSave() {
    if (draft.throwCount <= 0) return;
    onSave(draft);
    setDraft((prev) => ({ ...prev, bestThrow: "" }));
  }

  return (
    <div className="quick-capture">
      <button type="button" className="btn btn-secondary btn-sm quick-capture-back" onClick={onClose}>
        ← Zpět
      </button>

      {favourites.length > 0 && (
        <section className="quick-capture-section">
          <h2 className="quick-capture-section-title">Oblíbené série</h2>
          <div className="quick-capture-favourites">
            {favourites.map((favourite) => (
              <div key={favourite.id} className="quick-capture-fav-wrap">
                <button
                  type="button"
                  className="quick-capture-fav-btn"
                  onClick={() => applyFavourite(favourite)}
                >
                  <span className="quick-capture-fav-icon" aria-hidden="true">
                    {getDisciplineIcon(favourite.discipline)}
                  </span>
                  <span className="quick-capture-fav-discipline">
                    {getDisciplineLabel(favourite.discipline)}
                  </span>
                  <span className="quick-capture-fav-meta">{getFavouriteLabel(favourite)}</span>
                  {favourite.technique && (
                    <span className="quick-capture-fav-technique">
                      {formatTechniqueDisplay(favourite.discipline, favourite.technique)}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="quick-capture-fav-remove"
                  aria-label="Odebrat oblíbenou sérii"
                  onClick={() => removeFavourite(favourite.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="quick-capture-section quick-capture-form">
        <div className="quick-capture-actions-top">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={applyLastSeries}
            disabled={!lastSeries}
          >
            Použít poslední sérii
          </button>
          {canPinFavourite && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={pinFavourite}>
              ⭐ Přidat do oblíbených
            </button>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Disciplína</label>
          <div className="plan-discipline-chips">
            {DISCIPLINES.map((discipline) => {
              const active = draft.discipline === discipline.value;
              return (
                <button
                  key={discipline.value}
                  type="button"
                  className={`plan-chip${active ? " plan-chip-active" : ""}`}
                  onClick={() => setDraft(applyDisciplineToDraft(draft, discipline.value))}
                >
                  {getDisciplineIcon(discipline.value) && (
                    <span className="plan-chip-icon">{getDisciplineIcon(discipline.value)}</span>
                  )}
                  {discipline.label}
                </button>
              );
            })}
          </div>
        </div>

        <TechniqueSelector
          discipline={draft.discipline}
          value={draft.technique}
          onChange={(technique) => updateDraft({ technique })}
        />

        <ImplementSelector
          discipline={draft.discipline}
          value={draft.implementWeight}
          onChange={(implementWeight) => updateDraft({ implementWeight })}
        />

        <div className="form-group">
          <label className="form-label">Hody / počet</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            className="form-input quick-capture-input-lg"
            value={draft.throwCount || ""}
            onChange={(e) =>
              updateDraft({ throwCount: Math.max(0, parseInt(e.target.value, 10) || 0) })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nejdelší hod (m)</label>
          <input
            type="text"
            inputMode="decimal"
            className="form-input quick-capture-input-lg"
            placeholder="volitelné"
            value={draft.bestThrow}
            onChange={(e) => updateDraft({ bestThrow: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label form-label-row">
            <span>Intenzita</span>
            <IntensityBadge value={draft.intensityPercent} />
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            step={5}
            className="form-input quick-capture-input-lg"
            value={draft.intensityPercent}
            onChange={(e) => {
              const raw = parseInt(e.target.value, 10);
              updateDraft({
                intensityPercent: isNaN(raw)
                  ? DEFAULT_INTENSITY_PERCENT
                  : Math.min(100, Math.max(0, raw)),
              });
            }}
          />
        </div>
      </section>

      <button
        type="button"
        className="btn btn-primary quick-capture-save"
        onClick={handleSave}
        disabled={draft.throwCount <= 0}
      >
        Uložit sérii
      </button>
    </div>
  );
}
