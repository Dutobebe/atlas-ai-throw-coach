"use client";

import { getPhaseDisciplineIcons, getPhaseTypeLabel } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";
import PhaseStatusBadge from "./PhaseStatusBadge";

interface PlanPhaseRowProps {
  phase: PlanPhase;
  phaseNumber: number;
  prepLabel?: string | null;
  onClick: (phase: PlanPhase) => void;
}

export default function PlanPhaseRow({ phase, phaseNumber, prepLabel, onClick }: PlanPhaseRowProps) {
  const icons = getPhaseDisciplineIcons(phase);

  return (
    <button type="button" className="plan-phase-row" onClick={() => onClick(phase)}>
      <div className="plan-phase-row-main">
        <div className="plan-phase-row-title">
          Fáze {phaseNumber} — {phase.title || "Bez názvu"}
        </div>
        <div className="plan-phase-row-meta">
          <span>{getPhaseTypeLabel(phase.type)}</span>
          {prepLabel && <span className="plan-prep-badge">🏆 {prepLabel}</span>}
          {icons.length > 0 && (
            <span className="plan-day-icons" aria-label="Disciplíny">
              {icons.map((icon, index) => (
                <span key={`${icon}-${index}`} className="plan-day-icon">
                  {icon}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
      <PhaseStatusBadge status={phase.status} />
    </button>
  );
}
