"use client";

import { getDisciplineIcon } from "@/lib/design";
import { DISCIPLINES, SESSION_TYPES } from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";

interface TrainingBasicsStepProps {
  session: TrainingSession;
  onChange: (session: TrainingSession) => void;
}

export default function TrainingBasicsStep({ session, onChange }: TrainingBasicsStepProps) {
  function updateField<K extends keyof TrainingSession>(field: K, value: TrainingSession[K]) {
    onChange({ ...session, [field]: value });
  }

  function toggleDiscipline(value: string) {
    const next = session.disciplines.includes(value)
      ? session.disciplines.filter((item) => item !== value)
      : [...session.disciplines, value];
    onChange({ ...session, disciplines: next });
  }

  return (
    <div className="training-wizard-step">
      <h2 className="training-wizard-step-title">Základ</h2>

      <div className="form-group">
        <label className="form-label">Datum</label>
        <input
          type="date"
          className="form-input"
          value={session.date}
          onChange={(e) => updateField("date", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Název tréninku</label>
        <input
          type="text"
          className="form-input"
          placeholder="např. Ranní trénink"
          value={session.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Typ tréninku</label>
        <select
          className="form-select"
          value={session.sessionType}
          onChange={(e) => updateField("sessionType", e.target.value as TrainingSession["sessionType"])}
        >
          {SESSION_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Disciplíny</label>
        <p className="training-wizard-hint">Vyber jednu nebo více disciplín.</p>
        <div className="plan-discipline-chips training-discipline-grid">
          {DISCIPLINES.map((discipline) => {
            const active = session.disciplines.includes(discipline.value);
            return (
              <button
                key={discipline.value}
                type="button"
                className={`plan-chip training-discipline-chip${active ? " plan-chip-active" : ""}`}
                onClick={() => toggleDiscipline(discipline.value)}
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
    </div>
  );
}
