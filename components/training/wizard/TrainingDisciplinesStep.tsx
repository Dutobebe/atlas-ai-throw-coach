"use client";

import { getDisciplineIcon } from "@/lib/design";
import { DISCIPLINES } from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";

interface TrainingDisciplinesStepProps {
  session: TrainingSession;
  onChange: (session: TrainingSession) => void;
}

export default function TrainingDisciplinesStep({
  session,
  onChange,
}: TrainingDisciplinesStepProps) {
  function toggleDiscipline(value: string) {
    const next = session.disciplines.includes(value)
      ? session.disciplines.filter((item) => item !== value)
      : [...session.disciplines, value];
    onChange({ ...session, disciplines: next });
  }

  return (
    <div className="training-wizard-step">
      <h2 className="training-wizard-step-title">Disciplíny</h2>
      <p className="training-wizard-hint">Vyber jednu nebo více disciplín pro tento trénink.</p>

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
  );
}
