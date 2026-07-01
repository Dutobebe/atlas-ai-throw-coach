"use client";

import { getPlanTextPlaceholder, getTrainingCategoryLabel } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";

interface PlanTrainingItemProps {
  phase: PlanPhase;
  index: number;
  onPlanTextChange: (phaseId: string, text: string) => void;
  onRemove: (phaseId: string) => void;
}

export default function PlanTrainingItem({
  phase,
  index,
  onPlanTextChange,
  onRemove,
}: PlanTrainingItemProps) {
  const category = phase.trainingCategory ?? "Vrhy";
  const label = getTrainingCategoryLabel(category);
  const placeholder = getPlanTextPlaceholder(category);

  return (
    <div className="plan-training-item">
      <div className="plan-training-item-header">
        <span className="plan-training-item-badge">{label}</span>
        {index > 0 && (
          <span className="plan-training-item-index">Trénink {index + 1}</span>
        )}
        <button
          type="button"
          className="btn btn-danger btn-sm btn-icon plan-training-item-remove"
          onClick={() => onRemove(phase.id)}
          aria-label={`Smazat trénink ${label}`}
        >
          ✕
        </button>
      </div>
      <textarea
        className="form-input plan-day-textarea"
        rows={category === "Vrhy" ? 6 : 4}
        placeholder={placeholder}
        value={phase.planText ?? ""}
        onChange={(e) => onPlanTextChange(phase.id, e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={`Plán — ${label}`}
      />
    </div>
  );
}
