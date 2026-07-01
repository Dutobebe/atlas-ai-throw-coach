"use client";

import { useState } from "react";
import { applyTemplateToSession } from "@/lib/template-utils";
import { emptySeries } from "@/lib/training-utils";
import type { TrainingTemplate } from "@/types/template";
import type { TrainingSession } from "@/types/training";
import TemplatePicker from "@/components/templates/TemplatePicker";
import TrainingSeriesSummaryCard from "@/components/training/TrainingSeriesSummaryCard";

export interface ThrowingPlanOption {
  id: string;
  preview: string;
}

export interface OtherPlanNote {
  id: string;
  category: string;
  planText: string;
}

interface TrainingSeriesListStepProps {
  session: TrainingSession;
  templates: TrainingTemplate[];
  throwingPlans: ThrowingPlanOption[];
  otherPlanNotes: OtherPlanNote[];
  onImportThrowingPlan: (phaseId: string) => void;
  onStartLiveRecording: () => void;
  onChange: (session: TrainingSession) => void;
  onEditSeries: (index: number) => void;
}

export default function TrainingSeriesListStep({
  session,
  templates,
  throwingPlans,
  otherPlanNotes,
  onImportThrowingPlan,
  onStartLiveRecording,
  onChange,
  onEditSeries,
}: TrainingSeriesListStepProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  function addSeries() {
    const defaultDiscipline = session.disciplines[0] ?? "disk";
    onChange({
      ...session,
      series: [
        ...session.series,
        emptySeries(defaultDiscipline, { sessionType: session.sessionType }),
      ],
    });
    onEditSeries(session.series.length);
  }

  const showThrowingImport = throwingPlans.length > 0 && !manualMode;

  return (
    <div className="training-wizard-step">
      <div className="section-header">
        <h2 className="training-wizard-step-title" style={{ marginBottom: 0 }}>
          Série ({session.series.length})
        </h2>
        <div className="training-series-list-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: "auto" }}
            onClick={() => setTemplateOpen(true)}
          >
            Šablona
          </button>
        </div>
      </div>

      {showThrowingImport && (
        <div className="training-plan-import">
          <p className="training-plan-import-title">Plán — Vrhy</p>
          <p className="training-wizard-hint">
            Můžeš převzít vrhačský plán a převést ho do sérií, nebo zapsat trénink ručně.
          </p>
          <div className="training-plan-import-actions">
            {throwingPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className="btn btn-primary btn-sm training-plan-import-btn"
                onClick={() => onImportThrowingPlan(plan.id)}
              >
                Převzít plán a převést do sérií
                {throwingPlans.length > 1 && plan.preview ? (
                  <span className="training-plan-import-preview">{plan.preview}</span>
                ) : null}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm training-plan-import-btn"
              onClick={() => setManualMode(true)}
            >
              Zapsat trénink manuálně
            </button>
          </div>
        </div>
      )}

      {otherPlanNotes.length > 0 && (
        <div className="training-plan-notes">
          <p className="training-plan-import-title">Plán — ostatní tréninky</p>
          {otherPlanNotes.map((note) => (
            <div key={note.id} className="training-plan-note-card">
              <span className="training-plan-note-category">{note.category}</span>
              <pre className="training-plan-note-text">{note.planText}</pre>
            </div>
          ))}
        </div>
      )}

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

      {session.series.length > 0 && (
        <button
          type="button"
          className="btn btn-secondary training-start-live-btn"
          onClick={onStartLiveRecording}
        >
          ▶ Spustit záznam tréninku
        </button>
      )}
    </div>
  );
}
