"use client";

import { useMemo } from "react";
import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import { calculateDisciplineThrowStats } from "@/lib/discipline-throw-stats";
import type { TrainingSession } from "@/types/training";

interface DisciplineThrowsTableProps {
  sessions: TrainingSession[];
}

export default function DisciplineThrowsTable({ sessions }: DisciplineThrowsTableProps) {
  const { rows } = useMemo(
    () => calculateDisciplineThrowStats(sessions),
    [sessions]
  );

  return (
    <SectionCard className="discipline-table-card">
      <SectionTitle>Počet hodů podle disciplíny</SectionTitle>

      <div className="discipline-stats-mobile">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`discipline-stat-row${row.isTotal ? " discipline-stat-row-total" : ""}`}
          >
            <div className="discipline-stat-name">
              <span className="discipline-table-icon" aria-hidden>
                {row.icon}
              </span>
              {row.label}
            </div>
            <div className="discipline-stat-metrics">
              <div className="discipline-stat-metric">
                <span className="discipline-stat-label">Týden</span>
                <span className="discipline-stat-value">{row.periods.thisWeek}</span>
              </div>
              <div className="discipline-stat-metric">
                <span className="discipline-stat-label">30 dní</span>
                <span className="discipline-stat-value">{row.periods.last30Days}</span>
              </div>
              <div className="discipline-stat-metric">
                <span className="discipline-stat-label">Rok</span>
                <span className="discipline-stat-value">{row.periods.thisYear}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
