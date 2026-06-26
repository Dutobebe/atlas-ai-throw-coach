"use client";

import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import { formatTodayLong } from "@/lib/dashboard-utils";

interface TodayCardProps {
  plannedTraining?: string | null;
  onStartTraining: () => void;
  onQuickCapture?: () => void;
}

export default function TodayCard({
  plannedTraining,
  onStartTraining,
  onQuickCapture,
}: TodayCardProps) {
  return (
    <SectionCard className="dashboard-card">
      <SectionTitle>Dnes</SectionTitle>
      <div className="dashboard-date">{formatTodayLong()}</div>
      {plannedTraining ? (
        <div className="dashboard-planned">
          <span className="dashboard-planned-label">Plánovaný trénink</span>
          <span className="dashboard-planned-title">{plannedTraining}</span>
        </div>
      ) : (
        <div className="dashboard-muted">Žádný plánovaný trénink</div>
      )}
      <button type="button" className="btn btn-primary dashboard-start-btn" onClick={onStartTraining}>
        ▶ Začít trénink
      </button>
      {onQuickCapture && (
        <button
          type="button"
          className="btn btn-secondary dashboard-quick-btn"
          onClick={onQuickCapture}
        >
          ⚡ Rychlý zápis
        </button>
      )}
    </SectionCard>
  );
}
