"use client";

import {
  COMPETITION_ATTEMPT_COUNT,
  getAttemptDisplay,
} from "@/lib/competition-utils";
import type { CompetitionAttempt, CompetitionAttemptStatus } from "@/types/season";

interface CompetitionAttemptsEditorProps {
  attempts: CompetitionAttempt[];
  onChange: (attempts: CompetitionAttempt[]) => void;
}

export default function CompetitionAttemptsEditor({
  attempts,
  onChange,
}: CompetitionAttemptsEditorProps) {
  function updateAttempt(index: number, patch: Partial<CompetitionAttempt>) {
    onChange(
      attempts.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function setAttemptStatus(index: number, status: CompetitionAttemptStatus) {
    if (status === "foul") {
      updateAttempt(index, { status: "foul", distance: "" });
      return;
    }
    if (status === "empty") {
      updateAttempt(index, { status: "empty", distance: "" });
      return;
    }
    updateAttempt(index, { status: "valid" });
  }

  return (
    <div className="competition-attempts">
      <p className="season-hint">6 pokusů — vlož vzdálenost, X (faul) nebo nech prázdné.</p>
      <div className="competition-attempts-grid">
        {attempts.slice(0, COMPETITION_ATTEMPT_COUNT).map((attempt, index) => (
          <div key={index} className="competition-attempt-card">
            <div className="competition-attempt-header">
              <span className="competition-attempt-num">#{index + 1}</span>
              <span className="competition-attempt-preview">{getAttemptDisplay(attempt)}</span>
            </div>
            <div className="competition-attempt-status-chips">
              {(
                [
                  { value: "valid" as const, label: "Platný" },
                  { value: "foul" as const, label: "X" },
                  { value: "empty" as const, label: "—" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`competition-attempt-chip${attempt.status === option.value ? " competition-attempt-chip-active" : ""}`}
                  onClick={() => setAttemptStatus(index, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {attempt.status === "valid" && (
              <input
                type="text"
                inputMode="decimal"
                className="form-input competition-attempt-input"
                placeholder="m"
                value={attempt.distance}
                onChange={(e) => updateAttempt(index, { distance: e.target.value, status: "valid" })}
              />
            )}
            <input
              type="text"
              className="form-input competition-attempt-note"
              placeholder="Poznámka (volitelné)"
              value={attempt.note}
              onChange={(e) => updateAttempt(index, { note: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
