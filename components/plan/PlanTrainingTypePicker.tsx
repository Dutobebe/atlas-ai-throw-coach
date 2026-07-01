"use client";

import { PLAN_TRAINING_CATEGORIES } from "@/lib/plan-utils";
import type { PlanTrainingCategory } from "@/types/plan";

interface PlanTrainingTypePickerProps {
  open: boolean;
  onSelect: (category: PlanTrainingCategory) => void;
  onClose: () => void;
}

export default function PlanTrainingTypePicker({
  open,
  onSelect,
  onClose,
}: PlanTrainingTypePickerProps) {
  if (!open) return null;

  return (
    <div className="template-picker-overlay" onClick={onClose}>
      <div className="template-picker-panel card" onClick={(e) => e.stopPropagation()}>
        <div className="section-header">
          <h3 className="section-title">Typ tréninku</h3>
          <button type="button" className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="template-picker-list">
          {PLAN_TRAINING_CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              className="template-picker-item"
              onClick={() => {
                onSelect(item.value);
                onClose();
              }}
            >
              <div className="template-picker-name">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
