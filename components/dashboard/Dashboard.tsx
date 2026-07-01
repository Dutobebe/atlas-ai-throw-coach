"use client";

import { useMemo } from "react";
import type { DashboardStats } from "@/lib/dashboard-utils";
import { getLastTraining } from "@/lib/dashboard-utils";
import type { TrainingSession } from "@/types/training";
import type { PlanPhase } from "@/types/plan";
import type { Season, Competition } from "@/types/season";
import { getTodayPhaseSummary } from "@/lib/plan-utils";
import AICoachCard from "./AICoachCard";
import SummaryCards from "@/components/common/SummaryCards";
import LastTrainingCard from "./LastTrainingCard";
import NextEventCard from "./NextEventCard";
import TodayCard from "./TodayCard";

interface DashboardProps {
  stats: DashboardStats;
  sessions: TrainingSession[];
  phases: PlanPhase[];
  seasons: Season[];
  nextCompetition: Competition | null;
  profileName?: string;
  onStartTraining: () => void;
  onViewSession?: (session: TrainingSession) => void;
  onOpenSeason?: () => void;
}

export default function Dashboard({
  stats,
  sessions,
  phases,
  seasons,
  nextCompetition,
  profileName,
  onStartTraining,
  onViewSession,
  onOpenSeason,
}: DashboardProps) {
  const lastTraining = useMemo(() => getLastTraining(sessions), [sessions]);
  const todayPlanTitle = useMemo(() => getTodayPhaseSummary(phases), [phases]);

  return (
    <div className="dashboard">
      {profileName && (
        <p className="dashboard-greeting">Ahoj, {profileName}!</p>
      )}

      <SummaryCards stats={stats} />

      <TodayCard
        plannedTraining={todayPlanTitle}
        onStartTraining={onStartTraining}
      />
      <NextEventCard competition={nextCompetition} onOpenSeason={onOpenSeason} />
      <LastTrainingCard session={lastTraining} onView={onViewSession} />
      <AICoachCard sessions={sessions} phases={phases} seasons={seasons} />
    </div>
  );
}
