import type { DayStatus } from "@/types/planner-day-status";
export { DAY_STATUS_LABELS, type DayStatus } from "@/types/planner-day-status";
import type { PlanDayStripState, PlanStripIndicator } from "@/types/planner-strip";
import type { PlannerEvent } from "@/types/planner-event";

/** Higher value = higher display priority when multiple events share a day. */
const DAY_STATUS_PRIORITY: Record<DayStatus, number> = {
  COMPETITION: 60,
  COMPLETED: 50,
  UPDATED: 40,
  PLANNED: 30,
  SKIPPED: 20,
  REST: 10,
};

function eventToDayStatus(event: PlannerEvent): DayStatus {
  if (event.kind === "competition") {
    return "COMPETITION";
  }

  if (event.source.type !== "planPhase") {
    return "REST";
  }

  if (event.kind === "rest") {
    return "REST";
  }

  switch (event.phaseStatus) {
    case "completed":
      return "COMPLETED";
    case "skipped":
      return "SKIPPED";
    case "changed":
      return "UPDATED";
    case "planned":
    case "started":
      return "PLANNED";
    default:
      return "PLANNED";
  }
}

/** Aggregate day status from planner events — no manual overrides. */
export function calculateDayStatus(events: PlannerEvent[]): DayStatus {
  if (events.length === 0) {
    return "REST";
  }

  let best: DayStatus = "REST";

  for (const event of events) {
    const status = eventToDayStatus(event);
    if (DAY_STATUS_PRIORITY[status] > DAY_STATUS_PRIORITY[best]) {
      best = status;
    }
  }

  return best;
}

export function dayStatusToStripState(status: DayStatus): PlanDayStripState {
  const indicators: PlanStripIndicator[] = [];

  if (status === "COMPETITION") {
    indicators.push("trophy");
  }

  if (status === "COMPLETED") {
    indicators.push("check");
  }

  if (status === "PLANNED" || status === "UPDATED") {
    indicators.push("dumbbell");
  }

  if (status === "REST" || status === "SKIPPED") {
    indicators.push("moon");
  }

  return {
    status,
    hasCompetition: status === "COMPETITION",
    hasCompleted: status === "COMPLETED",
    hasPlanned: status === "PLANNED" || status === "UPDATED",
    hasSkipped: status === "SKIPPED",
    hasUpdated: status === "UPDATED",
    indicators: [...new Set(indicators)],
  };
}

export function calculateDayStripState(events: PlannerEvent[]): PlanDayStripState {
  return dayStatusToStripState(calculateDayStatus(events));
}

export function dayStatusCssClass(status: DayStatus): string {
  switch (status) {
    case "COMPETITION":
      return "plan-week-strip-day-competition";
    case "COMPLETED":
      return "plan-week-strip-day-completed";
    case "PLANNED":
      return "plan-week-strip-day-planned";
    case "UPDATED":
      return "plan-week-strip-day-updated";
    case "SKIPPED":
      return "plan-week-strip-day-skipped";
    default:
      return "plan-week-strip-day-rest";
  }
}
