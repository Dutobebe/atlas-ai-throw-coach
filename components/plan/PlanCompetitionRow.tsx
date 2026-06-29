"use client";

import CompetitionCard from "@/components/planner/CompetitionCard";
import type { Competition } from "@/types/season";

interface PlanCompetitionRowProps {
  competition: Competition;
  onClick?: (competition: Competition) => void;
}

/** @deprecated Use CompetitionCard from components/planner — kept for PlanDayCard compat. */
export default function PlanCompetitionRow({ competition, onClick }: PlanCompetitionRowProps) {
  return <CompetitionCard competition={competition} onClick={onClick} />;
}
