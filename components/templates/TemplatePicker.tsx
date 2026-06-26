"use client";

import type { TrainingTemplate } from "@/types/template";

interface TemplatePickerProps {
  open: boolean;
  templates: TrainingTemplate[];
  onSelect: (template: TrainingTemplate) => void;
  onClose: () => void;
}

export default function TemplatePicker({
  open,
  templates,
  onSelect,
  onClose,
}: TemplatePickerProps) {
  if (!open) return null;

  return (
    <div className="template-picker-overlay" onClick={onClose}>
      <div className="template-picker-panel card" onClick={(e) => e.stopPropagation()}>
        <div className="section-header">
          <h3 className="section-title">Vybrat šablonu</h3>
          <button type="button" className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="template-picker-list">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="template-picker-item"
              onClick={() => {
                onSelect(template);
                onClose();
              }}
            >
              <div className="template-picker-name">{template.name}</div>
              {template.description && (
                <div className="template-picker-desc">{template.description}</div>
              )}
              <div className="template-picker-meta">
                {template.phases.length} fáze ·{" "}
                {template.phases.reduce((n, p) => n + p.plannedSeries.length, 0)} sérií
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
