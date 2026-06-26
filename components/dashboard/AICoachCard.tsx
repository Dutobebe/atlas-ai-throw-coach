"use client";

import { useMemo, useState } from "react";
import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import { analyzeCoachFramework } from "@/lib/coach-framework";
import type { PlanPhase } from "@/types/plan";
import type { Season } from "@/types/season";
import type { TrainingSession } from "@/types/training";

interface AICoachCardProps {
  sessions: TrainingSession[];
  phases: PlanPhase[];
  seasons: Season[];
}

export default function AICoachCard({ sessions, phases, seasons }: AICoachCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const analysis = useMemo(
    () => analyzeCoachFramework({ sessions, phases, seasons }),
    [sessions, phases, seasons]
  );

  const primary = analysis.primaryRecommendation;

  return (
    <SectionCard className="dashboard-card coach-card">
      <div className="dashboard-ai-header">
        <span className="dashboard-ai-icon" aria-hidden="true">
          🤖
        </span>
        <SectionTitle className="dashboard-ai-title">AI Coach</SectionTitle>
      </div>

      <div className="coach-load-row">
        <div className="coach-load-score">
          <span className="coach-load-value">{analysis.loadScore.value}</span>
          <span className="coach-load-label">Load score</span>
        </div>
        <div className="coach-load-meta">
          <span className={`coach-load-badge coach-load-${analysis.loadScore.level}`}>
            {analysis.loadScore.label}
          </span>
          <span className="coach-prep-phase">{analysis.prepPhase.label}</span>
        </div>
      </div>

      {analysis.seasonGoal && (
        <div className="coach-season-goal">
          <span className="coach-context-label">Cíl sezóny</span>
          <span className="coach-context-value">{analysis.seasonGoal}</span>
        </div>
      )}

      {primary ? (
        <div className="coach-recommendation">
          <div className="coach-rec-title">{primary.title}</div>
          <p className="coach-rec-message">{primary.message}</p>
          <button
            type="button"
            className="coach-why-btn"
            onClick={() => setShowExplanation((value) => !value)}
            aria-expanded={showExplanation}
          >
            {showExplanation ? "Skrýt vysvětlení" : "Proč?"}
          </button>
          {showExplanation && (
            <p className="coach-rec-explanation">{primary.explanation}</p>
          )}
        </div>
      ) : (
        <div className="dashboard-muted">Není k dispozici doporučení.</div>
      )}
    </SectionCard>
  );
}
