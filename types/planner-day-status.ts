export type DayStatus =
  | "REST"
  | "PLANNED"
  | "COMPLETED"
  | "COMPETITION"
  | "SKIPPED"
  | "UPDATED";

export const DAY_STATUS_LABELS: Record<DayStatus, string> = {
  REST: "Volno",
  PLANNED: "Plánováno",
  COMPLETED: "Splněno",
  COMPETITION: "Závod",
  SKIPPED: "Vynecháno",
  UPDATED: "Změněno",
};
