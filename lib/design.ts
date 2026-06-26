/**
 * Atlas visual design tokens and helpers.
 * See DESIGN_SYSTEM.md for usage guidelines.
 */

export interface DisciplineDesign {
  icon: string;
  color: string;
}

export const DISCIPLINE_DESIGN: Record<string, DisciplineDesign> = {
  disk: { icon: "🥏", color: "#3b82f6" },
  kladivo: { icon: "🔨", color: "#f97316" },
  koule: { icon: "⚪", color: "#22c55e" },
  ostep: { icon: "🏹", color: "#ef4444" },
  medicinbal: { icon: "🏀", color: "#a855f7" },
  posilovna: { icon: "💪", color: "#64748b" },
  kardio: { icon: "🏃", color: "#06b6d4" },
  mobilita: { icon: "🤸", color: "#84cc16" },
};

export type StatusColorKey =
  | "planned"
  | "today"
  | "started"
  | "completed"
  | "changed"
  | "skipped";

export interface BadgeColors {
  color: string;
  background: string;
}

const DEFAULT_DISCIPLINE_COLOR = "#8b9dc3";

export function getDisciplineIcon(discipline: string): string {
  return DISCIPLINE_DESIGN[discipline]?.icon ?? "";
}

export function getDisciplineColor(discipline: string): string {
  return DISCIPLINE_DESIGN[discipline]?.color ?? DEFAULT_DISCIPLINE_COLOR;
}

export function getIntensityColor(percent: number): string {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  if (value <= 60) return "#22c55e";
  if (value <= 80) return "#eab308";
  if (value <= 90) return "#f97316";
  return "#ef4444";
}

export function getStatusColor(status: StatusColorKey): BadgeColors {
  const colors: Record<StatusColorKey, BadgeColors> = {
    planned: { color: "#94a3b8", background: "rgba(148, 163, 184, 0.18)" },
    today: { color: "#eab308", background: "rgba(234, 179, 8, 0.15)" },
    started: { color: "#3b82f6", background: "rgba(59, 130, 246, 0.15)" },
    completed: { color: "#22c55e", background: "rgba(34, 197, 94, 0.15)" },
    changed: { color: "#f97316", background: "rgba(249, 115, 22, 0.15)" },
    skipped: { color: "#ef4444", background: "rgba(239, 68, 68, 0.15)" },
  };
  return colors[status];
}

/** @deprecated use getDisciplineIcon — kept for legacy imports */
export const DISCIPLINE_ICONS = Object.fromEntries(
  Object.entries(DISCIPLINE_DESIGN).map(([key, value]) => [key, value.icon])
) as Record<string, string>;
