"use client";

import { useState } from "react";
import { applyTemplateToSession } from "@/lib/template-utils";
import { emptySeries } from "@/lib/training-utils";
import type { TrainingTemplate } from "@/types/template";
import type { TrainingSession } from "@/types/training";
import TemplatePicker from "@/components/templates/TemplatePicker";
import RPESelector from "./RPESelector";
import TrainingSeriesCard from "./TrainingSeriesCard";

interface TrainingFormProps {
  session: TrainingSession;
  isEditing: boolean;
  templates: TrainingTemplate[];
  onChange: (session: TrainingSession) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function TrainingForm({
  session,
  isEditing,
  templates,
  onChange,
  onSave,
  onCancel,
}: TrainingFormProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  function updateField<K extends keyof TrainingSession>(
    field: K,
    value: TrainingSession[K]
  ) {
    onChange({ ...session, [field]: value });
  }

  function updateSeries(index: number, series: TrainingSession["series"][number]) {
    onChange({
      ...session,
      series: session.series.map((s, i) => (i === index ? series : s)),
    });
  }

  function addSeries() {
    onChange({ ...session, series: [...session.series, emptySeries(undefined, { sessionType: session.sessionType })] });
  }

  function removeSeries(index: number) {
    const next = session.series.filter((_, i) => i !== index);
    onChange({
      ...session,
      series: next.length ? next : [emptySeries(undefined, { sessionType: session.sessionType })],
    });
  }

  return (
    <>
      <div className="form-group">
        <label className="form-label">Datum</label>
        <input
          type="date"
          className="form-input"
          value={session.date}
          onChange={(e) => updateField("date", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Název tréninku</label>
        <input
          type="text"
          className="form-input"
          placeholder="např. Ranní trénink"
          value={session.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Místo</label>
        <input
          type="text"
          className="form-input"
          placeholder="např. Stadion Strahov"
          value={session.location}
          onChange={(e) => updateField("location", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Počasí</label>
        <input
          type="text"
          className="form-input"
          placeholder="např. Slunečno, 18 °C"
          value={session.weather}
          onChange={(e) => updateField("weather", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Připravenost ({session.readiness} %)</label>
        <input
          type="range"
          className="form-range"
          min={0}
          max={100}
          step={5}
          value={session.readiness}
          onChange={(e) => updateField("readiness", Number(e.target.value))}
        />
        <div className="readiness-labels">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <RPESelector value={session.rpe} onChange={(rpe) => updateField("rpe", rpe)} />

      <div className="form-group">
        <label className="form-label">Poznámka k tréninku</label>
        <textarea
          className="form-textarea"
          placeholder="Celkový dojem z tréninku..."
          value={session.note}
          onChange={(e) => updateField("note", e.target.value)}
        />
      </div>

      <div className="section-header">
        <h3 className="section-title">Série ({session.series.length})</h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ width: "auto" }}
          onClick={() => setTemplateOpen(true)}
        >
          Použít šablonu
        </button>
      </div>

      <TemplatePicker
        open={templateOpen}
        templates={templates}
        onClose={() => setTemplateOpen(false)}
        onSelect={(template) => onChange(applyTemplateToSession(session, template))}
      />

      {session.series.map((series, idx) => (
        <TrainingSeriesCard
          key={series.id}
          series={series}
          index={idx}
          canRemove={session.series.length > 1}
          onChange={(updated) => updateSeries(idx, updated)}
          onRemove={() => removeSeries(idx)}
        />
      ))}

      <button type="button" className="btn btn-secondary" onClick={addSeries}>
        + Přidat sérii
      </button>

      <div className="actions-row">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Zrušit
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          {isEditing ? "Aktualizovat" : "Uložit trénink"}
        </button>
      </div>
    </>
  );
}
