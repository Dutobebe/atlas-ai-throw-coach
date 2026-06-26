import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import {
  getSessionDisciplineSummary,
  getSessionThrowCount,
} from "@/lib/dashboard-utils";
import { formatDate } from "@/lib/training-utils";
import type { TrainingSession } from "@/types/training";

interface LastTrainingCardProps {
  session: TrainingSession | null;
  onView?: (session: TrainingSession) => void;
}

export default function LastTrainingCard({ session, onView }: LastTrainingCardProps) {
  if (!session) {
    return (
      <SectionCard className="dashboard-card">
        <SectionTitle>Poslední trénink</SectionTitle>
        <div className="dashboard-muted">Zatím žádný trénink</div>
      </SectionCard>
    );
  }

  const throwCount = getSessionThrowCount(session);
  const disciplines = getSessionDisciplineSummary(session);

  return (
    <SectionCard
      className={`dashboard-card${onView ? " history-item" : ""}`}
      onClick={onView ? () => onView(session) : undefined}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
      onKeyDown={
        onView
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onView(session);
              }
            }
          : undefined
      }
    >
      <SectionTitle>Poslední trénink</SectionTitle>
      <div className="dashboard-training-title">{session.title}</div>
      <div className="history-meta dashboard-training-meta">
        <span>{formatDate(session.date)}</span>
        <span className="badge badge-rpe">RPE {session.rpe}</span>
        <span>{throwCount} hodů</span>
      </div>
      {disciplines && <div className="history-disciplines">{disciplines}</div>}
    </SectionCard>
  );
}
