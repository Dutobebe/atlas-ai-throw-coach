"use client";

import { useState } from "react";
import { applyTemplateToSession } from "@/lib/template-utils";
import { emptySeries } from "@/lib/training-utils";
import type { TrainingTemplate } from "@/types/template";
import type { TrainingSession } from "@/types/training";
import TemplatePicker from "@/components/templates/TemplatePicker";
import TrainingSeriesSummaryCard from "@/components/training/TrainingSeriesSummaryCard";

interface TrainingSeriesListStepProps {
  session: TrainingSession;
  templates: TrainingTemplate[];
  onChange: (session: TrainingSession) => void;
  onEditSeries: (index: number) => void;
}

export default function TrainingSeriesListStep({
  session,
  templates,
  onChange,
  onEditSeries,
}: TrainingSeriesListStepProps) {
  const [templateOpen, setTemplateOpen] = useState(false);

  function addSeries() {
    const defaultDiscipline = session.disciplines[0] ?? "disk";
    onChange({ ...session, series: [...session.series, emptySeries(defaultDiscipline, { sessionType: session.sessionType })] });
    onEditSeries(session.series.length);
  }

  return (
    <div className="training-wizard-step">
      <div className="section-header">
        <h2 className="training-wizard-step-title" style={{ marginBottom: 0 }}>
          Série ({session.series.length})
        </h2>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ width: "auto" }}
          onClick={() => setTemplateOpen(true)}
        >
          Šablona
        </button>
      </div>

      <TemplatePicker
        open={templateOpen}
        templates={templates}
        onClose={() => setTemplateOpen(false)}
        onSelect={(template) => onChange(applyTemplateToSession(session, template))}
      />

      {session.series.length === 0 ? (
        <div className="training-series-empty">
          <p className="training-wizard-hint">Přidej alespoň jednu sérii, než budeš pokračovat.</p>
        </div>
      ) : (
        <div className="training-series-list">
          {session.series.map((series, index) => (
            <TrainingSeriesSummaryCard
              key={series.id}
              series={series}
              index={index}
              onClick={() => onEditSeries(index)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        className={`btn btn-primary${session.series.length === 0 ? " active-training-add-first" : ""}`}
        onClick={addSeries}
      >
        {session.series.length === 0 ? "+ Přidat první sérii" : "+ Přidat sérii"}
      </button>
    </div>
  );
}
