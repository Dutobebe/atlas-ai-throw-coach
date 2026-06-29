"use client";

import {
  createPlanPhaseDragItem,
  planPhaseDragDataAttributes,
} from "@/components/plan/dnd/plan-dnd-utils";
import type { PlanPhaseDragItem } from "@/components/plan/dnd/plan-dnd-types";
import {
  formatPhaseDisciplines,
  formatPhaseDuration,
  getPhasePriorityLabel,
  getPhaseTypeEmoji,
  isPhaseCompleted,
} from "@/lib/plan-display-utils";
import { getPhaseTypeLabel } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";
import PhaseStatusBadge from "./PhaseStatusBadge";

interface PlanPhaseCardProps {
  phase: PlanPhase;
  phaseIndex: number;
  prepLabel?: string | null;
  onClick: (phase: PlanPhase) => void;
  dnd?: PlanPhaseDragItem;
}

export default function PlanPhaseCard({
  phase,
  phaseIndex,
  prepLabel,
  onClick,
  dnd,
}: PlanPhaseCardProps) {
  const disciplines = formatPhaseDisciplines(phase);
  const duration = formatPhaseDuration(phase);
  const dragItem = dnd ?? createPlanPhaseDragItem(phase);
  const dragAttrs = planPhaseDragDataAttributes(dragItem);
  const completed = isPhaseCompleted(phase.status);

  return (
    <button
      type="button"
      className={`plan-phase-card${completed ? " plan-phase-card-completed" : ""}`}
      onClick={() => onClick(phase)}
      {...dragAttrs}
      data-phase-card="true"
    >
      <span className="plan-phase-card-icon" aria-hidden="true">
        {getPhaseTypeEmoji(phase.type)}
      </span>
      <span className="plan-phase-card-body">
        <span className="plan-phase-card-title">{phase.title || "Bez názvu"}</span>

        <span className="plan-phase-card-meta">
          <span className="plan-phase-priority">{getPhasePriorityLabel(phaseIndex)}</span>
          <span className="plan-phase-type">{getPhaseTypeLabel(phase.type)}</span>
          {prepLabel && <span className="plan-phase-competition-badge">🏆 Závod</span>}
          {completed && <span className="plan-phase-completed-badge">✓ Dokončeno</span>}
        </span>

        {disciplines && <span className="plan-phase-card-disciplines">{disciplines}</span>}
        {duration && <span className="plan-phase-card-duration">{duration}</span>}
      </span>
      <PhaseStatusBadge status={phase.status} />
    </button>
  );
}
