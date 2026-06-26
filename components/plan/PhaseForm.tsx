"use client";

import { useState } from "react";
import { applyTemplateToPhase } from "@/lib/template-utils";
import { getDisciplineIcon } from "@/lib/design";
import { PHASE_TYPES, syncDisciplinesFromSeries } from "@/lib/plan-utils";
import { emptyPlannedSeries } from "@/lib/planned-series-utils";
import { DISCIPLINES } from "@/lib/training-utils";
import type { TrainingTemplate } from "@/types/template";
import type { CompetitionPrepOption } from "@/lib/season-utils";
import type { PlanPhase } from "@/types/plan";
import TemplatePicker from "@/components/templates/TemplatePicker";
import PlannedSeriesCard from "./PlannedSeriesCard";

interface PhaseFormProps {
  phase: PlanPhase;
  templates: TrainingTemplate[];
  competitionOptions: CompetitionPrepOption[];
  onChange: (phase: PlanPhase) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function PhaseForm({
  phase,
  templates,
  competitionOptions,
  onChange,
  onSave,
  onCancel,
}: PhaseFormProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  function updateField<K extends keyof PlanPhase>(field: K, value: PlanPhase[K]) {
    onChange({ ...phase, [field]: value });
  }

  function toggleDiscipline(value: string) {
    const next = phase.disciplines.includes(value)
      ? phase.disciplines.filter((d) => d !== value)
      : [...phase.disciplines, value];
    updateField("disciplines", next);
  }

  function updateSeries(index: number, series: PlanPhase["plannedSeries"][number]) {
    const plannedSeries = phase.plannedSeries.map((item, i) => (i === index ? series : item));
    onChange(syncDisciplinesFromSeries({ ...phase, plannedSeries }));
  }

  function addSeries() {
    onChange(
      syncDisciplinesFromSeries({
        ...phase,
        plannedSeries: [...phase.plannedSeries, emptyPlannedSeries()],
      })
    );
  }

  function removeSeries(index: number) {
    const next = phase.plannedSeries.filter((_, i) => i !== index);
    onChange(
      syncDisciplinesFromSeries({
        ...phase,
        plannedSeries: next.length ? next : [emptyPlannedSeries()],
      })
    );
  }

  return (
    <>
      <div className="form-group">
        <label className="form-label">Datum</label>
        <input
          type="date"
          className="form-input"
          value={phase.date}
          onChange={(e) => updateField("date", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Název</label>
        <input
          type="text"
          className="form-input"
          placeholder="např. Ranní technika"
          value={phase.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Typ</label>
        <select
          className="form-select"
          value={phase.type}
          onChange={(e) => updateField("type", e.target.value as PlanPhase["type"])}
        >
          {PHASE_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Příprava na závod</label>
        <select
          className="form-select"
          value={phase.competitionPrepId ?? ""}
          onChange={(e) =>
            updateField("competitionPrepId", e.target.value || undefined)
          }
        >
          <option value="">Bez vazby na závod</option>
          {competitionOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Plánované disciplíny</label>
        <div className="plan-discipline-chips">
          {DISCIPLINES.map((d) => {
            const active = phase.disciplines.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                className={`plan-chip${active ? " plan-chip-active" : ""}`}
                onClick={() => toggleDiscipline(d.value)}
              >
                {getDisciplineIcon(d.value) && (
                  <span className="plan-chip-icon">{getDisciplineIcon(d.value)}</span>
                )}
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <div className="section-header">
          <label className="form-label" style={{ marginBottom: 0 }}>
            Plánované série
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: "auto" }}
              onClick={() => setTemplateOpen(true)}
            >
              Použít šablonu
            </button>
            <button type="button" className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={addSeries}>
              + Série
            </button>
          </div>
        </div>
        <TemplatePicker
          open={templateOpen}
          templates={templates}
          onClose={() => setTemplateOpen(false)}
          onSelect={(template) => onChange(applyTemplateToPhase(phase, template))}
        />
        {phase.plannedSeries.map((series, index) => (
          <PlannedSeriesCard
            key={series.id}
            series={series}
            index={index}
            canRemove={phase.plannedSeries.length > 1}
            onChange={(next) => updateSeries(index, next)}
            onRemove={() => removeSeries(index)}
          />
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">Cíl</label>
        <textarea
          className="form-textarea"
          placeholder="Co chceš z tréninku dosáhnout?"
          value={phase.goal}
          onChange={(e) => updateField("goal", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Poznámka</label>
        <textarea
          className="form-textarea"
          placeholder="Další poznámky k fázi"
          value={phase.note}
          onChange={(e) => updateField("note", e.target.value)}
        />
      </div>

      <div className="actions-row">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Zrušit
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Uložit fázi
        </button>
      </div>
    </>
  );
}
