"use client";

interface TrainingEntryScreenProps {
  hasTodayPlan: boolean;
  onStartFromPlan: () => void;
  onStartWizard: () => void;
  onQuickCapture: () => void;
}

export default function TrainingEntryScreen({
  hasTodayPlan,
  onStartFromPlan,
  onStartWizard,
  onQuickCapture,
}: TrainingEntryScreenProps) {
  return (
    <div className="training-entry">
      <h2 className="training-entry-title">Nový trénink</h2>
      <p className="training-entry-lead">Vyber, jak chceš trénink zaznamenat.</p>

      <div className="training-entry-options">
        <button
          type="button"
          className="training-entry-option"
          onClick={onStartFromPlan}
          disabled={!hasTodayPlan}
        >
          <span className="training-entry-option-icon">📅</span>
          <span className="training-entry-option-label">Podle dnešního plánu</span>
          <span className="training-entry-option-hint">
            {hasTodayPlan
              ? "Vytvoří trénink z dnešních fází v plánu"
              : "Dnes není v plánu žádný trénink"}
          </span>
        </button>

        <button type="button" className="training-entry-option" onClick={onStartWizard}>
          <span className="training-entry-option-icon">✏️</span>
          <span className="training-entry-option-label">Nový trénink</span>
          <span className="training-entry-option-hint">
            Průvodce krok za krokem včetně vyhodnocení
          </span>
        </button>

        <button type="button" className="training-entry-option" onClick={onQuickCapture}>
          <span className="training-entry-option-icon">⚡</span>
          <span className="training-entry-option-label">Rychlý zápis</span>
          <span className="training-entry-option-hint">Jedna série bez průvodce</span>
        </button>
      </div>
    </div>
  );
}
