"use client";

import { useCallback, useMemo, useState } from "react";
import {
  duplicatePhase,
  emptyPhase,
  normalizePhase,
  PHASE_STATUS_LABELS,
  syncDisciplinesFromSeries,
} from "@/lib/plan-utils";
import {
  getCompetitionPrepLabel,
  getCompetitionPrepOptions,
} from "@/lib/season-utils";
import type { PhaseStatus, PlanPhase, PlanView } from "@/types/plan";
import type { Season, Competition } from "@/types/season";
import type { TrainingTemplate } from "@/types/template";
import PhaseDetail from "./PhaseDetail";
import PhaseForm from "./PhaseForm";
import WeeklyPlanner from "./WeeklyPlanner";

interface PlanModuleProps {
  planEntryKey: number;
  phases: PlanPhase[];
  seasons: Season[];
  templates: TrainingTemplate[];
  onPhasesChange: (phases: PlanPhase[]) => void;
  onStartTrainingFromPhase: (phase: PlanPhase) => void;
  onCompetitionClick?: (competition: Competition) => void;
  onToast: (message: string) => void;
}

export default function PlanModule({
  planEntryKey,
  phases,
  seasons,
  templates,
  onPhasesChange,
  onStartTrainingFromPhase,
  onCompetitionClick,
  onToast,
}: PlanModuleProps) {
  const [view, setView] = useState<PlanView>("week");
  const [draft, setDraft] = useState<PlanPhase>(() => emptyPhase());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  const selectedPhase = selectedPhaseId
    ? phases.find((phase) => phase.id === selectedPhaseId) ?? null
    : null;

  const competitionOptions = useMemo(
    () => getCompetitionPrepOptions(seasons),
    [seasons]
  );

  const getPrepLabel = useCallback(
    (competitionPrepId?: string) => getCompetitionPrepLabel(seasons, competitionPrepId),
    [seasons]
  );

  const selectedPrepLabel = selectedPhase
    ? getPrepLabel(selectedPhase.competitionPrepId)
    : null;

  const resetToWeek = useCallback(() => {
    setView("week");
    setDraft(emptyPhase());
    setEditingId(null);
    setSelectedPhaseId(null);
  }, []);

  function startNewPhase(date?: string) {
    setDraft(emptyPhase(date));
    setEditingId(null);
    setSelectedPhaseId(null);
    setView("form");
  }

  function startEdit(phase: PlanPhase) {
    setDraft(normalizePhase(phase));
    setEditingId(phase.id);
    setView("form");
  }

  function savePhase() {
    const title = draft.title.trim() || "Fáze bez názvu";
    const phase = normalizePhase(syncDisciplinesFromSeries({ ...draft, title }));

    if (editingId) {
      onPhasesChange(phases.map((item) => (item.id === editingId ? phase : item)));
      onToast("Fáze aktualizována");
      setSelectedPhaseId(phase.id);
      setView("detail");
    } else {
      onPhasesChange([...phases, phase]);
      onToast("Fáze uložena");
      resetToWeek();
    }

    setDraft(emptyPhase());
    setEditingId(null);
  }

  function deletePhase(id: string) {
    if (!confirm("Opravdu smazat tuto fázi?")) return;
    onPhasesChange(phases.filter((phase) => phase.id !== id));
    onToast("Fáze smazána");
    resetToWeek();
  }

  function handleDuplicate(phase: PlanPhase) {
    const copy = duplicatePhase(phase);
    setDraft(copy);
    setEditingId(null);
    setSelectedPhaseId(null);
    setView("form");
    onToast("Fáze duplikována — upravte a uložte");
  }

  function updatePhaseStatus(id: string, status: PhaseStatus) {
    onPhasesChange(
      phases.map((phase) => (phase.id === id ? { ...phase, status } : phase))
    );
    onToast(`Stav: ${PHASE_STATUS_LABELS[status]}`);
  }

  if (view === "form") {
    return (
      <PhaseForm
        phase={draft}
        templates={templates}
        competitionOptions={competitionOptions}
        onChange={setDraft}
        onSave={savePhase}
        onCancel={resetToWeek}
      />
    );
  }

  if (view === "detail" && selectedPhase) {
    return (
      <PhaseDetail
        phase={selectedPhase}
        phases={phases}
        competitionPrepLabel={selectedPrepLabel}
        onBack={resetToWeek}
        onEdit={() => startEdit(selectedPhase)}
        onDelete={() => deletePhase(selectedPhase.id)}
        onDuplicate={() => handleDuplicate(selectedPhase)}
        onMarkSkipped={() => updatePhaseStatus(selectedPhase.id, "skipped")}
        onMarkChanged={() => updatePhaseStatus(selectedPhase.id, "changed")}
        onMarkCompleted={() => updatePhaseStatus(selectedPhase.id, "completed")}
        onStartTraining={() => onStartTrainingFromPhase(selectedPhase)}
      />
    );
  }

  return (
    <WeeklyPlanner
      planEntryKey={planEntryKey}
      phases={phases}
      seasons={seasons}
      getPrepLabel={getPrepLabel}
      onPhaseClick={(phase) => {
        setSelectedPhaseId(phase.id);
        setView("detail");
      }}
      onCompetitionClick={onCompetitionClick}
      onAddPhase={startNewPhase}
    />
  );
}
