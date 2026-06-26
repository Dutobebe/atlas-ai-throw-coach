"use client";

import { useState } from "react";
import SectionCard from "@/components/common/SectionCard";
import {
  GOAL_ACHIEVED_OPTIONS,
  TECHNIQUE_QUALITY_OPTIONS,
  finalizeEvaluation,
  getEvaluationDraft,
} from "@/lib/evaluation-utils";
import { formatDate } from "@/lib/training-utils";
import type { TrainingEvaluation, TrainingSession } from "@/types/training";

interface TrainingEvaluationScreenProps {
  session: TrainingSession;
  onSave: (evaluation: TrainingEvaluation) => void;
  onSkip: () => void;
}

export default function TrainingEvaluationScreen({
  session,
  onSave,
  onSkip,
}: TrainingEvaluationScreenProps) {
  const [evaluation, setEvaluation] = useState<TrainingEvaluation>(() =>
    getEvaluationDraft(session)
  );

  function updateField<K extends keyof TrainingEvaluation>(
    field: K,
    value: TrainingEvaluation[K]
  ) {
    setEvaluation((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    const satisfaction = evaluation.satisfaction >= 1 ? evaluation.satisfaction : 3;
    onSave(finalizeEvaluation({ ...evaluation, satisfaction }));
  }

  return (
    <div className="evaluation-screen">
      <SectionCard>
        <p className="evaluation-session-kicker">Vyhodnocení tréninku</p>
        <h2 className="evaluation-session-title">{session.title || "Trénink bez názvu"}</h2>
        <p className="evaluation-session-date">{formatDate(session.date)}</p>
      </SectionCard>

      <SectionCard>
        <label className="form-label">Celková spokojenost</label>
        <div className="star-rating" role="group" aria-label="Celková spokojenost 1–5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn${evaluation.satisfaction >= star ? " star-btn-active" : ""}`}
              onClick={() => updateField("satisfaction", star)}
              aria-label={`${star} hvězdiček`}
              aria-pressed={evaluation.satisfaction >= star}
            >
              ★
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <label className="form-label">Cíl splněn</label>
        <div className="evaluation-chips">
          {GOAL_ACHIEVED_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`plan-chip${evaluation.goalAchieved === option.value ? " plan-chip-active" : ""}`}
              onClick={() => updateField("goalAchieved", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <label className="form-label">Kvalita techniky</label>
        <div className="evaluation-chips">
          {TECHNIQUE_QUALITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`plan-chip${evaluation.techniqueQuality === option.value ? " plan-chip-active" : ""}`}
              onClick={() => updateField("techniqueQuality", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <label className="form-label" htmlFor="evaluation-fatigue">
          Únava ({evaluation.fatigue})
        </label>
        <input
          id="evaluation-fatigue"
          type="range"
          min={1}
          max={5}
          step={1}
          className="evaluation-slider"
          value={evaluation.fatigue}
          onChange={(e) => updateField("fatigue", parseInt(e.target.value, 10))}
        />
        <div className="evaluation-slider-labels">
          <span>1</span>
          <span>5</span>
        </div>
      </SectionCard>

      <SectionCard>
        <label className="form-label">Bolest</label>
        <div className="evaluation-chips">
          <button
            type="button"
            className={`plan-chip${!evaluation.hasPain ? " plan-chip-active" : ""}`}
            onClick={() => updateField("hasPain", false)}
          >
            Ne
          </button>
          <button
            type="button"
            className={`plan-chip${evaluation.hasPain ? " plan-chip-active" : ""}`}
            onClick={() => updateField("hasPain", true)}
          >
            Ano
          </button>
        </div>
        {evaluation.hasPain && (
          <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
            <label className="form-label" htmlFor="evaluation-pain-location">
              Místo
            </label>
            <input
              id="evaluation-pain-location"
              type="text"
              className="form-input"
              placeholder="např. pravé rameno"
              value={evaluation.painLocation}
              onChange={(e) => updateField("painLocation", e.target.value)}
            />
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div className="form-group">
          <label className="form-label" htmlFor="evaluation-best">
            Největší plus dneška
          </label>
          <textarea
            id="evaluation-best"
            className="form-textarea"
            placeholder="Co dnes fungovalo nejlépe?"
            value={evaluation.bestThing}
            onChange={(e) => updateField("bestThing", e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="evaluation-focus">
            Zaměření na příští trénink
          </label>
          <textarea
            id="evaluation-focus"
            className="form-textarea"
            placeholder="Na co se příště zaměřit?"
            value={evaluation.focusNext}
            onChange={(e) => updateField("focusNext", e.target.value)}
          />
        </div>
      </SectionCard>

      <button type="button" className="btn btn-primary evaluation-save-btn" onClick={handleSave}>
        Uložit hodnocení
      </button>
      <button type="button" className="btn btn-secondary" onClick={onSkip}>
        Později
      </button>
    </div>
  );
}
