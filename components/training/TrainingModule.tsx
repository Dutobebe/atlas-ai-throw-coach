"use client";

import { useEffect, useState } from "react";
import {
  WIZARD_STEPS,
  canAdvanceFromStep,
  getWizardStepIndex,
  getWizardStepLabel,
  type TrainingScreenView,
  type TrainingWizardStep,
} from "@/lib/training-wizard-utils";
import type { TrainingTemplate } from "@/types/template";
import type { TrainingEvaluation, TrainingSession } from "@/types/training";
import TrainingSeriesCard from "./TrainingSeriesCard";
import TrainingEvaluationScreen from "@/components/evaluation/TrainingEvaluationScreen";
import TrainingBasicsStep from "./wizard/TrainingBasicsStep";
import TrainingSeriesListStep from "./wizard/TrainingSeriesListStep";
import TrainingSummaryStep from "./wizard/TrainingSummaryStep";

interface TrainingModuleProps {
  session: TrainingSession;
  isEditing: boolean;
  templates: TrainingTemplate[];
  autoStartWizard?: boolean;
  onChange: (session: TrainingSession) => void;
  onSave: () => void;
  onSaveWithEvaluation: (evaluation: TrainingEvaluation) => void;
  onSkipEvaluation: () => void;
  onCancel: () => void;
  onResumeActive?: () => void;
  hasActiveTraining?: boolean;
  onStepTitleChange?: (title: string) => void;
}

export default function TrainingModule({
  session,
  isEditing,
  templates,
  autoStartWizard = false,
  onChange,
  onSave,
  onSaveWithEvaluation,
  onSkipEvaluation,
  onCancel,
  onResumeActive,
  hasActiveTraining = false,
  onStepTitleChange,
}: TrainingModuleProps) {
  const [view, setView] = useState<TrainingScreenView>("wizard");
  const [step, setStep] = useState<TrainingWizardStep>("basics");
  const [seriesEditorIndex, setSeriesEditorIndex] = useState<number | null>(null);

  useEffect(() => {
    setView("wizard");
    setStep("basics");
    setSeriesEditorIndex(null);
  }, [autoStartWizard, isEditing]);

  useEffect(() => {
    if (!onStepTitleChange) return;

    if (view === "series-editor") {
      onStepTitleChange("Upravit sérii");
      return;
    }

    if (step === "basics" && !isEditing) {
      onStepTitleChange("Nový trénink");
      return;
    }

    onStepTitleChange(isEditing ? `Upravit — ${getWizardStepLabel(step)}` : `Trénink — ${getWizardStepLabel(step)}`);
  }, [view, step, isEditing, onStepTitleChange]);

  function goBack() {
    if (view === "series-editor") {
      setSeriesEditorIndex(null);
      setView("wizard");
      return;
    }

    if (step === "evaluation") {
      setStep("summary");
      return;
    }

    const stepIndex = getWizardStepIndex(step);
    if (stepIndex > 0) {
      setStep(WIZARD_STEPS[stepIndex - 1].key);
      return;
    }

    onCancel();
  }

  function goNext() {
    if (view === "series-editor") {
      setSeriesEditorIndex(null);
      setView("wizard");
      return;
    }

    if (step === "summary") {
      if (isEditing) {
        onSave();
        return;
      }
      setStep("evaluation");
      return;
    }

    const stepIndex = getWizardStepIndex(step);
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setStep(WIZARD_STEPS[stepIndex + 1].key);
    }
  }

  function updateSeries(index: number, series: TrainingSession["series"][number]) {
    onChange({
      ...session,
      series: session.series.map((item, i) => (i === index ? series : item)),
    });
  }

  function removeSeries(index: number) {
    onChange({
      ...session,
      series: session.series.filter((_, i) => i !== index),
    });
    setSeriesEditorIndex(null);
    setView("wizard");
  }

  const canNext = view === "series-editor" || canAdvanceFromStep(step, session);
  const nextLabel =
    step === "summary" ? (isEditing ? "Uložit trénink" : "Pokračovat") : "Pokračovat";
  const showWizardNav = step !== "evaluation";

  return (
    <div className="training-module">
      <button type="button" className="btn btn-secondary btn-sm training-top-back" onClick={goBack}>
        ← Zpět
      </button>

      {view === "wizard" && (
        <div className="training-wizard-progress" aria-label="Průběh průvodce">
          {WIZARD_STEPS.map((item, index) => {
            const current = getWizardStepIndex(step);
            const active = index === current;
            const done = index < current;
            return (
              <div
                key={item.key}
                className={`training-wizard-dot${active ? " active" : ""}${done ? " done" : ""}`}
              >
                <span className="training-wizard-dot-num">{index + 1}</span>
                <span className="training-wizard-dot-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {hasActiveTraining && onResumeActive && step === "basics" && view === "wizard" && (
        <button type="button" className="btn btn-secondary training-resume-active" onClick={onResumeActive}>
          ▶ Pokračovat v aktivním tréninku
        </button>
      )}

      {view === "wizard" && step === "basics" && (
        <TrainingBasicsStep session={session} onChange={onChange} />
      )}

      {view === "wizard" && step === "series" && (
        <TrainingSeriesListStep
          session={session}
          templates={templates}
          onChange={onChange}
          onEditSeries={(index) => {
            setSeriesEditorIndex(index);
            setView("series-editor");
          }}
        />
      )}

      {view === "wizard" && step === "summary" && <TrainingSummaryStep session={session} />}

      {view === "wizard" && step === "evaluation" && (
        <TrainingEvaluationScreen
          session={session}
          onSave={onSaveWithEvaluation}
          onSkip={onSkipEvaluation}
        />
      )}

      {view === "series-editor" && seriesEditorIndex !== null && session.series[seriesEditorIndex] && (
        <div className="training-series-editor">
          <TrainingSeriesCard
            series={session.series[seriesEditorIndex]}
            index={seriesEditorIndex}
            canRemove
            onChange={(updated) => updateSeries(seriesEditorIndex, updated)}
            onRemove={() => removeSeries(seriesEditorIndex)}
          />
        </div>
      )}

      {showWizardNav && (
        <div className="training-wizard-nav">
          <button type="button" className="btn btn-secondary training-wizard-nav-btn" onClick={goBack}>
            Zpět
          </button>
          <button
            type="button"
            className="btn btn-primary training-wizard-nav-btn"
            onClick={goNext}
            disabled={!canNext}
          >
            {view === "series-editor" ? "Hotovo" : nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
