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
      <div className="discipline-table-wrap">
        <table className="discipline-table">
          <thead>
            <tr>
              <th scope="col">Disciplína</th>
              <th scope="col">Tento týden</th>
              <th scope="col">Posledních 30 dní</th>
              <th scope="col">Letos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={row.isTotal ? "discipline-table-total" : undefined}>
                <th scope="row">
                  <span className="discipline-table-name">
                    <span className="discipline-table-icon" aria-hidden>
                      {row.icon}
                    </span>
                    {row.label}
                  </span>
                </th>
                <td>{row.periods.thisWeek}</td>
                <td>{row.periods.last30Days}</td>
                <td>{row.periods.thisYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
