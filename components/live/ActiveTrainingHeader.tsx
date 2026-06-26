"use client";

import { formatDisciplineWithIcon } from "@/lib/history-display";
import { getSessionTypeLabel } from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";
import SectionCard from "@/components/common/SectionCard";

interface ActiveTrainingHeaderProps {
  session: TrainingSession;
  throwTotal: number;
  seriesCount: number;
}

export default function ActiveTrainingHeader({
  session,
  throwTotal,
  seriesCount,
}: ActiveTrainingHeaderProps) {
  return (
    <SectionCard className="active-training-header">
      <p className="active-training-kicker">Aktivní trénink</p>
      <h2 className="active-training-title">{session.title || "Trénink bez názvu"}</h2>
      <div className="active-training-meta">
        <span className="active-training-type">{getSessionTypeLabel(session.sessionType)}</span>
        {session.disciplines.length > 0 && (
          <span className="active-training-disciplines">
            {session.disciplines.map((item) => formatDisciplineWithIcon(item)).join(" · ")}
          </span>
        )}
      </div>
      <div className="active-training-stats">
        <div className="active-training-stat">
          <span className="active-training-stat-value">{throwTotal}</span>
          <span className="active-training-stat-label">Hodů</span>
        </div>
        <div className="active-training-stat">
          <span className="active-training-stat-value">{seriesCount}</span>
          <span className="active-training-stat-label">Sérií</span>
        </div>
      </div>
    </SectionCard>
  );
}
