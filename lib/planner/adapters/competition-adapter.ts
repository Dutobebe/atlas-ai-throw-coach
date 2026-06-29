import type { Competition } from "@/types/season";
import type { PlannerEvent } from "@/types/planner-event";

type SeasonCompetition = Competition & { year: number };

/** Converts a Season competition into a PlannerEvent without copying competition data. */
export function competitionToPlannerEvent(competition: SeasonCompetition): PlannerEvent {
  return {
    id: `competition:${competition.id}`,
    kind: "competition",
    date: competition.date,
    source: {
      type: "competition",
      competitionId: competition.id,
      seasonYear: competition.year,
    },
  };
}

export function competitionsToPlannerEvents(
  competitions: SeasonCompetition[]
): PlannerEvent[] {
  return competitions.map(competitionToPlannerEvent);
}
