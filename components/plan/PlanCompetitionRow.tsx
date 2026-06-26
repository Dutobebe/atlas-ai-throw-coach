"use client";

import StatusBadge from "@/components/common/StatusBadge";
import { formatBestValidAttempt } from "@/lib/competition-utils";
import { COMPETITION_STATUS_LABELS } from "@/lib/season-utils";
import { getDisciplineIcon } from "@/lib/design";
import { getDisciplineLabel } from "@/lib/training-utils";
import type { Competition } from "@/types/season";

interface PlanCompetitionRowProps {
  competition: Competition;
  onClick?: (competition: Competition) => void;
}

export default function PlanCompetitionRow({ competition, onClick }: PlanCompetitionRowProps) {
  const officialResults = competition.competitionResults.filter((result) => result.official);
  const bestResults = competition.competitionResults
    .map((result) => ({ result, best: formatBestValidAttempt(result) }))
    .filter((item) => item.best);

  return (
    <button
      type="button"
      className="plan-competition-row"
      onClick={() => onClick?.(competition)}
    >
      <div className="plan-competition-row-main">
        <div className="plan-competition-row-title">
          🏆 {competition.name || "Závod bez názvu"}
        </div>
        <div className="plan-competition-row-meta">
          <span className="plan-competition-type-badge">Závod</span>
          {competition.location && <span>{competition.location}</span>}
        </div>
        {competition.competitionResults.length > 0 && (
          <div className="plan-competition-disciplines-compact">
            {competition.competitionResults.map((result, index) => (
              <span key={result.id} className="plan-competition-discipline-item">
                {index > 0 && <span className="plan-competition-discipline-sep">•</span>}
                {getDisciplineIcon(result.discipline)} {getDisciplineLabel(result.discipline)}
              </span>
            ))}
          </div>
        )}
        {bestResults.length > 0 && (
          <div className="plan-competition-best">
            {bestResults.map(({ result, best }) => (
              <span key={result.id} className="plan-competition-best-item">
                {getDisciplineLabel(result.discipline)}: {best}
              </span>
            ))}
          </div>
        )}
        {officialResults.length > 0 && (
          <span className="performance-official-badge plan-competition-official">Oficiální</span>
        )}
      </div>
      <StatusBadge
        status={competition.status === "completed" ? "completed" : "planned"}
        label={COMPETITION_STATUS_LABELS[competition.status]}
      />
    </button>
  );
}
