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
  const best = formatBestValidAttempt(competition);

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
          {competition.implementWeight && <span>{competition.implementWeight}</span>}
        </div>
        {competition.disciplines.length > 0 && (
          <div className="plan-competition-disciplines">
            {competition.disciplines.map((discipline) => (
              <span key={discipline} className="plan-competition-discipline">
                {getDisciplineIcon(discipline)} {getDisciplineLabel(discipline)}
              </span>
            ))}
          </div>
        )}
        {best && <div className="plan-competition-best">Nejlepší: {best}</div>}
      </div>
      <StatusBadge
        status={competition.status === "completed" ? "completed" : "planned"}
        label={COMPETITION_STATUS_LABELS[competition.status]}
      />
    </button>
  );
}
