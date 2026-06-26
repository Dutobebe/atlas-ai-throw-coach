import { getDisciplineIcon, DISCIPLINE_ICONS } from "@/lib/design";
import { getDisciplineLabel, isThrowSeries } from "@/lib/training-utils";
import type { TrainingSeries, TrainingSession } from "@/types/training";

export { getDisciplineIcon, DISCIPLINE_ICONS };

export interface DisciplineImplementGroup {
  discipline: string;
  label: string;
  implements: string[];
}

export function formatDisciplineWithIcon(discipline: string): string {
  const icon = getDisciplineIcon(discipline);
  const name = getDisciplineLabel(discipline);
  return icon ? `${icon} ${name}` : name;
}

export function getUniqueDisciplinesInOrder(series: TrainingSeries[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of series) {
    if (!item.discipline || seen.has(item.discipline)) continue;
    seen.add(item.discipline);
    result.push(item.discipline);
  }

  return result;
}

function parseWeightForSort(value: string): number | null {
  const normalized = value.replace(",", ".").trim().toLowerCase();
  const match = normalized.match(/^([\d.]+)\s*(g|kg)?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return null;
  const unit = match[2] ?? "kg";
  return unit === "g" ? num : num * 1000;
}

function compareImplementNatural(a: string, b: string): number {
  const wa = parseWeightForSort(a);
  const wb = parseWeightForSort(b);

  if (wa !== null && wb !== null && wa !== wb) return wa - wb;
  if (wa !== null && wb === null) return -1;
  if (wa === null && wb !== null) return 1;
  return a.localeCompare(b, "cs");
}

const IMI_IMPLEMENT_VALUE = "IMI";

function isDisplayableImplement(value: string | undefined, series: TrainingSeries): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  if (trimmed.toUpperCase() === IMI_IMPLEMENT_VALUE) return false;
  if (!isThrowSeries(series)) return false;
  return true;
}

export function getSessionDisciplineSummary(session: TrainingSession): string {
  const series = Array.isArray(session.series) ? session.series : [];
  return getUniqueDisciplinesInOrder(series).map(formatDisciplineWithIcon).join(" • ");
}

export function getSessionImplementGroups(session: TrainingSession): DisciplineImplementGroup[] {
  const series = Array.isArray(session.series) ? session.series : [];
  const disciplineOrder = getUniqueDisciplinesInOrder(series);
  const byDiscipline = new Map<string, Set<string>>();

  for (const item of series) {
    if (!isDisplayableImplement(item.implementWeight, item)) continue;

    const weight = item.implementWeight.trim();
    if (!byDiscipline.has(item.discipline)) {
      byDiscipline.set(item.discipline, new Set());
    }
    byDiscipline.get(item.discipline)!.add(weight);
  }

  return disciplineOrder
    .filter((discipline) => byDiscipline.has(discipline))
    .map((discipline) => ({
      discipline,
      label: formatDisciplineWithIcon(discipline),
      implements: [...byDiscipline.get(discipline)!].sort(compareImplementNatural),
    }));
}
