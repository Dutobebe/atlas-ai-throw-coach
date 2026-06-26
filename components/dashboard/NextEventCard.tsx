"use client";

import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import { daysUntil, formatCountdown } from "@/lib/dashboard-utils";
import { formatDate, getDisciplineLabel } from "@/lib/training-utils";
import { getDisciplineIcon } from "@/lib/design";
import type { Competition } from "@/types/season";

interface NextEventCardProps {
  competition: Competition | null;
  onOpenSeason?: () => void;
}

export default function NextEventCard({ competition, onOpenSeason }: NextEventCardProps) {
  if (!competition) {
    return (
      <SectionCard className="dashboard-card">
        <SectionTitle>Další závod</SectionTitle>
        <div className="dashboard-muted">Žádný plánovaný závod</div>
        {onOpenSeason && (
          <button type="button" className="btn btn-secondary btn-sm dashboard-season-link" onClick={onOpenSeason}>
            Spravovat sezónu
          </button>
        )}
      </SectionCard>
    );
  }

  const remaining = daysUntil(competition.date);
  const countdown = remaining !== null ? formatCountdown(remaining) : null;

  return (
    <SectionCard className="dashboard-card dashboard-event-card">
      <SectionTitle>Další závod</SectionTitle>
      <button
        type="button"
        className="dashboard-event-btn"
        onClick={onOpenSeason}
        disabled={!onOpenSeason}
      >
        <div className="dashboard-event-name">{competition.name}</div>
        <div className="dashboard-event-date">{formatDate(competition.date)}</div>
        {competition.location && (
          <div className="dashboard-event-location">{competition.location}</div>
        )}
        {competition.competitionResults.length > 0 && (
          <div className="dashboard-event-disciplines">
            {competition.competitionResults.map((result, index) => (
              <span key={result.id} className="dashboard-event-discipline">
                {index > 0 && <span className="dashboard-event-discipline-sep"> • </span>}
                {getDisciplineIcon(result.discipline)} {getDisciplineLabel(result.discipline)}
              </span>
            ))}
          </div>
        )}
        {countdown && <div className="dashboard-countdown">{countdown}</div>}
      </button>
    </SectionCard>
  );
}
