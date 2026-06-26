"use client";

import { formatDisciplineWithIcon } from "@/lib/history-display";
import { summarizeSessionDraft } from "@/lib/training-wizard-utils";
import { formatDate, getSessionTypeLabel } from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";
import SectionCard from "@/components/common/SectionCard";

interface TrainingSummaryStepProps {
  session: TrainingSession;
}

export default function TrainingSummaryStep({ session }: TrainingSummaryStepProps) {
  const summary = summarizeSessionDraft(session);

  return (
    <div className="training-wizard-step">
      <h2 className="training-wizard-step-title">Souhrn</h2>

      <SectionCard>
        <div className="training-summary-row">
          <span className="training-summary-label">Datum</span>
          <span>{formatDate(session.date)}</span>
        </div>
        <div className="training-summary-row">
          <span className="training-summary-label">Typ</span>
          <span>{getSessionTypeLabel(session.sessionType)}</span>
        </div>
        {session.title.trim() && (
          <div className="training-summary-row">
            <span className="training-summary-label">Název</span>
            <span>{session.title}</span>
          </div>
        )}
        {session.disciplines.length > 0 && (
          <div className="training-summary-row">
            <span className="training-summary-label">Disciplíny</span>
            <span>{session.disciplines.map((d) => formatDisciplineWithIcon(d)).join(" · ")}</span>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <h3 className="training-summary-section">Hody podle disciplíny</h3>
        {summary.throwRows.length === 0 ? (
          <p className="training-wizard-hint">Žádné hody (pouze série typu Hod se počítají).</p>
        ) : (
          summary.throwRows.map((row) => (
            <div key={row.discipline} className="training-summary-throw-row">
              <span>{formatDisciplineWithIcon(row.discipline)}</span>
              <strong>{row.throws}</strong>
            </div>
          ))
        )}
        <div className="training-summary-total">
          <span>Celkem hodů</span>
          <strong>{summary.totalThrows}</strong>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="training-summary-row">
          <span className="training-summary-label">Počet sérií</span>
          <strong>{summary.totalSeries}</strong>
        </div>
        {summary.nonThrowSeriesCount > 0 && (
          <p className="training-summary-note">
            {summary.nonThrowSeriesCount} série ({summary.nonThrowLabels.join(", ")}) se nepočítají
            do statistik hodů.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
