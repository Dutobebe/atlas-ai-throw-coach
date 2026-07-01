"use client";

import { useEffect, useRef, useState } from "react";
import SectionCard from "@/components/common/SectionCard";
import DisciplineBadge from "@/components/common/DisciplineBadge";
import IntensityBadge from "@/components/common/IntensityBadge";
import SeriesTypeBadge from "@/components/common/SeriesTypeBadge";
import SeriesGoalsDisplay from "@/components/training/SeriesGoalsDisplay";
import TrainingSeriesCard from "@/components/training/TrainingSeriesCard";
import RPESelector from "@/components/training/RPESelector";
import ActiveTrainingHeader from "@/components/live/ActiveTrainingHeader";
import {
  countLiveSessionThrows,
  getLiveCompletedSeriesProgress,
  shouldPromptBestThrow,
  type LiveTrainingMeta,
} from "@/lib/live-training-utils";
import { formatDisciplineWithIcon } from "@/lib/history-display";
import {
  emptySeries,
  formatTechniqueDisplay,
  getDisciplineLabel,
  getSeriesIntensityPercent,
  normalizeSeries,
  showsImplementField,
  syncSessionForStorage,
} from "@/lib/training-utils";
import type { TrainingSeries, TrainingSession } from "@/types/training";

interface LiveTrainingScreenProps {
  session: TrainingSession;
  meta: LiveTrainingMeta;
  onSessionChange: (session: TrainingSession) => void;
  onMetaChange: (meta: LiveTrainingMeta) => void;
  onAutoSave: (session: TrainingSession) => void;
  onSave: (session: TrainingSession) => void;
  onExit: () => void;
  onDiscard: () => void;
}

function LiveSaveStatus({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return null;
  return (
    <p className="live-save-status" aria-live="polite">
      {state === "saving" ? "Ukládám…" : "Uloženo"}
    </p>
  );
}

export default function LiveTrainingScreen({
  session,
  meta,
  onSessionChange,
  onMetaChange,
  onAutoSave,
  onSave,
  onExit,
  onDiscard,
}: LiveTrainingScreenProps) {
  const totalSeries = session.series.length;
  const currentIndex = Math.min(meta.currentSeriesIndex, Math.max(0, totalSeries - 1));
  const currentSeries = session.series[currentIndex];
  const targetThrows = meta.seriesTargets[currentIndex] ?? 0;
  const [bestThrowInput, setBestThrowInput] = useState("");
  const [addingSeries, setAddingSeries] = useState<TrainingSeries | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throwTotal = countLiveSessionThrows(session);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function persistChange(
    nextSession: TrainingSession,
    nextMeta: LiveTrainingMeta,
    options?: { completedSeries?: boolean }
  ) {
    onSessionChange(nextSession);
    onMetaChange(nextMeta);
    setSaveState("saving");
    onAutoSave(syncSessionForStorage(nextSession));

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveState("saved");
    }, 150);

    if (options?.completedSeries) {
      setSaveState("saving");
      onAutoSave(syncSessionForStorage(nextSession));
    }
  }

  function updateSeriesThrowCount(delta: number) {
    if (!currentSeries) return;
    const nextSeries = session.series.map((item, index) => {
      if (index !== currentIndex) return item;
      return {
        ...item,
        throwCount: Math.max(0, item.throwCount + delta),
      };
    });
    persistChange({ ...session, series: nextSeries }, meta);
  }

  function goToStep(step: LiveTrainingMeta["step"]) {
    persistChange(session, { ...meta, step });
  }

  function advanceToNextSeries() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalSeries) {
      persistChange(
        session,
        { ...meta, step: "summary", currentSeriesIndex: currentIndex },
        { completedSeries: true }
      );
      setBestThrowInput("");
      return;
    }
    persistChange(
      session,
      { ...meta, currentSeriesIndex: nextIndex, step: "series" },
      { completedSeries: true }
    );
    setBestThrowInput("");
  }

  function handleNextSeries() {
    if (!currentSeries) return;
    if (shouldPromptBestThrow(session, currentIndex)) {
      setBestThrowInput(currentSeries.bestThrow ?? "");
      goToStep("best-throw");
      return;
    }
    advanceToNextSeries();
  }

  function confirmBestThrow() {
    const nextSeries = session.series.map((item, index) =>
      index === currentIndex ? { ...item, bestThrow: bestThrowInput.trim() } : item
    );
    const nextSession = { ...session, series: nextSeries };
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalSeries) {
      persistChange(
        nextSession,
        { ...meta, step: "summary", currentSeriesIndex: currentIndex },
        { completedSeries: true }
      );
    } else {
      persistChange(
        nextSession,
        { ...meta, currentSeriesIndex: nextIndex, step: "series" },
        { completedSeries: true }
      );
    }
    setBestThrowInput("");
  }

  function skipBestThrow() {
    advanceToNextSeries();
  }

  function handleSaveFinal() {
    const title = session.title.trim() || "Trénink bez názvu";
    onSave(syncSessionForStorage({ ...session, title }));
  }

  function startAddSeries() {
    const defaultDiscipline = session.disciplines[0] ?? "disk";
    setAddingSeries(emptySeries(defaultDiscipline, { sessionType: session.sessionType }));
  }

  function confirmAddSeries(series: TrainingSeries) {
    const normalized = normalizeSeries(series);
    const nextSession = { ...session, series: [...session.series, normalized] };
    const nextMeta: LiveTrainingMeta = {
      ...meta,
      seriesTargets: [...meta.seriesTargets, 0],
      currentSeriesIndex: session.series.length,
      step: "series",
    };
    persistChange(nextSession, nextMeta);
    setAddingSeries(null);
  }

  if (addingSeries) {
    return (
      <div className="live-training">
        <button type="button" className="btn btn-secondary btn-sm training-top-back" onClick={() => setAddingSeries(null)}>
          ← Zpět
        </button>
        <ActiveTrainingHeader session={session} throwTotal={throwTotal} seriesCount={totalSeries} />
        <LiveSaveStatus state={saveState} />
        <TrainingSeriesCard
          series={addingSeries}
          index={totalSeries}
          canRemove={false}
          onChange={setAddingSeries}
          onRemove={() => {}}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => confirmAddSeries(addingSeries)}
        >
          Přidat sérii
        </button>
      </div>
    );
  }

  if (totalSeries === 0) {
    return (
      <div className="live-training">
        <button type="button" className="btn btn-secondary btn-sm training-top-back" onClick={onExit}>
          ← Zpět
        </button>
        <ActiveTrainingHeader session={session} throwTotal={0} seriesCount={0} />
        <LiveSaveStatus state={saveState} />
        <button type="button" className="btn btn-primary active-training-add-first" onClick={startAddSeries}>
          + Přidat první sérii
        </button>
      </div>
    );
  }

  const completedForBar =
    meta.step === "summary"
      ? totalSeries
      : meta.step === "best-throw"
        ? currentIndex
        : currentIndex;
  const progressPercent = getLiveCompletedSeriesProgress(completedForBar, totalSeries);

  if (meta.step === "summary") {
    return (
      <div className="live-training">
        <button type="button" className="btn btn-secondary btn-sm training-top-back" onClick={onExit}>
          ← Zpět
        </button>
        <ActiveTrainingHeader session={session} throwTotal={throwTotal} seriesCount={totalSeries} />
        <LiveSaveStatus state={saveState} />

        <div className="live-progress-header">
          <span className="live-progress-label">Trénink dokončen</span>
          <div className="live-progress-bar">
            <div className="live-progress-fill" style={{ width: "100%" }} />
          </div>
        </div>

        <SectionCard>
          <RPESelector
            value={session.rpe}
            onChange={(rpe) =>
              persistChange({ ...session, rpe }, meta)
            }
          />
        </SectionCard>

        <button type="button" className="btn btn-primary live-save-btn" onClick={handleSaveFinal}>
          Uložit trénink
        </button>
        <button type="button" className="btn btn-secondary" onClick={onDiscard}>
          Zrušit bez uložení
        </button>
      </div>
    );
  }

  if (meta.step === "best-throw" && currentSeries) {
    return (
      <div className="live-training">
        <button type="button" className="btn btn-secondary btn-sm training-top-back" onClick={onExit}>
          ← Zpět
        </button>
        <ActiveTrainingHeader session={session} throwTotal={throwTotal} seriesCount={totalSeries} />
        <LiveSaveStatus state={saveState} />

        <div className="live-progress-header">
          <span className="live-progress-label">
            Série {currentIndex + 1} / {totalSeries}
          </span>
          <div className="live-progress-bar">
            <div className="live-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <SectionCard className="live-best-throw-card">
          <h2 className="live-series-title">Nejdelší hod (m)</h2>
          <p className="live-series-subtitle">
            Série {currentIndex + 1} — {getDisciplineLabel(currentSeries.discipline)}
          </p>
          <input
            type="text"
            inputMode="decimal"
            className="form-input live-best-throw-input"
            placeholder="např. 45.32"
            value={bestThrowInput}
            onChange={(e) => setBestThrowInput(e.target.value)}
            autoFocus
          />
          <div className="live-best-throw-actions">
            <button type="button" className="btn btn-primary live-save-btn" onClick={confirmBestThrow}>
              Potvrdit
            </button>
            <button type="button" className="btn btn-secondary" onClick={skipBestThrow}>
              Přeskočit
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (!currentSeries) {
    return (
      <div className="live-training">
        <button type="button" className="btn btn-secondary btn-sm training-top-back" onClick={onExit}>
          ← Zpět
        </button>
        <ActiveTrainingHeader session={session} throwTotal={throwTotal} seriesCount={totalSeries} />
        <LiveSaveStatus state={saveState} />
        <button type="button" className="btn btn-primary active-training-add-first" onClick={startAddSeries}>
          + Přidat první sérii
        </button>
      </div>
    );
  }

  const showImplement = showsImplementField(currentSeries);
  const intensity = getSeriesIntensityPercent(currentSeries);

  return (
    <div className="live-training">
      <button type="button" className="btn btn-secondary btn-sm training-top-back" onClick={onExit}>
        ← Zpět
      </button>
      <ActiveTrainingHeader session={session} throwTotal={throwTotal} seriesCount={totalSeries} />
      <LiveSaveStatus state={saveState} />

      <div className="live-progress-header">
        <span className="live-progress-label">
          Série {currentIndex + 1} / {totalSeries}
        </span>
        <div className="live-progress-bar">
          <div className="live-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <SectionCard className="live-series-card">
        <p className="live-series-kicker">Aktuální série</p>
        <h2 className="live-series-title">
          {formatDisciplineWithIcon(currentSeries.discipline)}
        </h2>
        {currentSeries.technique && (
          <p className="live-series-detail">
            {formatTechniqueDisplay(currentSeries.discipline, currentSeries.technique)}
          </p>
        )}
        {showImplement && currentSeries.implementWeight && (
          <p className="live-series-detail">{currentSeries.implementWeight}</p>
        )}
        <SeriesTypeBadge seriesType={currentSeries.seriesType ?? "Throw"} />
        <div className="live-series-badges">
          <DisciplineBadge discipline={currentSeries.discipline} />
          <IntensityBadge value={intensity} />
        </div>
        <SeriesGoalsDisplay goals={currentSeries.goals ?? []} />
      </SectionCard>

      <SectionCard className="live-counter-card">
        <p className="live-counter-label">Aktuální</p>
        <div className="live-counter-display">
          <span className="live-counter-current">{currentSeries.throwCount}</span>
          {targetThrows > 0 && (
            <>
              <span className="live-counter-sep">/</span>
              <span className="live-counter-target">{targetThrows}</span>
            </>
          )}
        </div>
        <div className="live-counter-actions">
          <button
            type="button"
            className="live-counter-btn live-counter-btn-minus"
            onClick={() => updateSeriesThrowCount(-1)}
            aria-label="Odebrat hod"
          >
            −1
          </button>
          <button
            type="button"
            className="live-counter-btn live-counter-btn-plus"
            onClick={() => updateSeriesThrowCount(1)}
            aria-label="Přidat hod"
          >
            +1
          </button>
        </div>
      </SectionCard>

      <button type="button" className="btn btn-primary live-next-btn" onClick={handleNextSeries}>
        Další série
      </button>
    </div>
  );
}
