"use client";

import { formatCompetitionDisciplinesLine } from "@/lib/season-utils";
import type { Competition } from "@/types/season";

interface CompetitionCardProps {
  competition: Competition;
  onClick?: (competition: Competition) => void;
}

/** Read-only competition card — data comes from Season (single source of truth). */
export default function CompetitionCard({ competition, onClick }: CompetitionCardProps) {
  const disciplinesLine = formatCompetitionDisciplinesLine(competition);

  return (
    <button
      type="button"
      className="planner-competition-card"
      onClick={() => onClick?.(competition)}
    >
      <span className="planner-competition-badge">🏆 Závod</span>

      <div className="planner-competition-card-body">
        <div className="planner-competition-name">
          {competition.name.trim() || "Závod bez názvu"}
        </div>

        {competition.location.trim() && (
          <div className="planner-competition-location">{competition.location.trim()}</div>
        )}

        {disciplinesLine && (
          <div className="planner-competition-disciplines">{disciplinesLine}</div>
        )}
      </div>
    </button>
  );
}
