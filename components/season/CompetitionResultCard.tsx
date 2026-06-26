"use client";

import SectionCard from "@/components/common/SectionCard";
import { getDisciplineIcon } from "@/lib/design";
import { formatBestValidAttempt } from "@/lib/competition-utils";
import { normalizeCompetitionResult } from "@/lib/season-utils";
import { DISCIPLINES, getDisciplineLabel } from "@/lib/training-utils";
import type { CompetitionResult } from "@/types/season";
import CompetitionAttemptsEditor from "./CompetitionAttemptsEditor";

interface CompetitionResultCardProps {
  result: CompetitionResult;
  index: number;
  onChange: (result: CompetitionResult) => void;
  onDelete: () => void;
}

export default function CompetitionResultCard({
  result,
  index,
  onChange,
  onDelete,
}: CompetitionResultCardProps) {
  const best = formatBestValidAttempt(result);

  function update(patch: Partial<CompetitionResult>) {
    onChange(normalizeCompetitionResult({ ...result, ...patch }));
  }

  function handleDelete() {
    if (!confirm(`Opravdu smazat disciplínu ${getDisciplineLabel(result.discipline)}?`)) return;
    onDelete();
  }

  return (
    <SectionCard className="competition-result-card">
      <div className="competition-result-header">
        <div className="competition-result-title">
          {getDisciplineIcon(result.discipline) && (
            <span className="competition-result-icon">{getDisciplineIcon(result.discipline)}</span>
          )}
          <span>
            {index + 1}. {getDisciplineLabel(result.discipline) || "Disciplína"}
          </span>
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
          Smazat
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Disciplína</label>
        <div className="plan-discipline-chips">
          {DISCIPLINES.map((discipline) => {
            const active = result.discipline === discipline.value;
            return (
              <button
                key={discipline.value}
                type="button"
                className={`plan-chip${active ? " plan-chip-active" : ""}`}
                onClick={() => update({ discipline: discipline.value })}
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

      <div className="form-group">
        <label className="form-label">Nářadí / hmotnost</label>
        <input
          type="text"
          className="form-input"
          placeholder="např. 2 kg, 7,26 kg"
          value={result.implement}
          onChange={(e) => update({ implement: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Umístění</label>
        <input
          type="text"
          className="form-input"
          placeholder="např. 3. místo"
          value={result.placement}
          onChange={(e) => update({ placement: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <input
            type="checkbox"
            checked={result.official}
            onChange={(e) => update({ official: e.target.checked })}
          />{" "}
          Oficiální výsledek (počítá se do Výkonů)
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Odkaz na výsledek</label>
        <input
          type="url"
          className="form-input"
          placeholder="https://…"
          value={result.resultLink}
          onChange={(e) => update({ resultLink: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Pokusy</label>
        <CompetitionAttemptsEditor
          attempts={result.attempts}
          onChange={(attempts) => update({ attempts })}
        />
      </div>

      {best && (
        <div className="competition-result-best">
          Nejlepší platný pokus: <strong>{best}</strong>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Poznámky</label>
        <textarea
          className="form-textarea season-goal-input"
          placeholder="Technika, taktika, podmínky…"
          value={result.notes}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </div>
    </SectionCard>
  );
}
