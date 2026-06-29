import { buildPlannerEventsForDate } from "@/lib/planner/build-planner-events";
import { calculateDayStatus } from "@/lib/planner/dayStatus";
import type { WeekDay } from "@/lib/week";
import type { PlanPhase } from "@/types/plan";
import type { Season } from "@/types/season";

export interface PlannerWeekSummary {
  trainings: number;
  competitions: number;
  restDays: number;
}

function isTrainingEvent(event: ReturnType<typeof buildPlannerEventsForDate>[number]): boolean {
  return (
    event.source.type === "planPhase" &&
    event.kind !== "rest" &&
    event.kind !== "competition"
  );
}

/** Aggregate counts for the selected week — derived from planner events. */
export function calculateWeekSummary(
  weekDays: WeekDay[],
  phases: PlanPhase[],
  seasons: Season[]
): PlannerWeekSummary {
  let trainings = 0;
  let competitions = 0;
  let restDays = 0;

  for (const day of weekDays) {
    const events = buildPlannerEventsForDate(day.iso, phases, seasons);
    const status = calculateDayStatus(events);

    if (status === "REST") {
      restDays += 1;
    }

    competitions += events.filter((event) => event.kind === "competition").length;
    trainings += events.filter(isTrainingEvent).length;
  }

  return { trainings, competitions, restDays };
}

/** Default date when adding training from the header. */
export function defaultAddTrainingDate(weekDays: WeekDay[], today: string): string {
  if (weekDays.some((day) => day.iso === today)) {
    return today;
  }
  return weekDays[0]?.iso ?? today;
}
