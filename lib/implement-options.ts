export const CUSTOM_IMPLEMENT_VALUE = "__custom__";

export const IMPLEMENT_PRESETS: Record<string, readonly string[]> = {
  disk: ["1 kg", "1,5 kg", "1,75 kg", "2 kg"],
  kladivo: ["3 kg", "4 kg", "5 kg", "6 kg", "7,26 kg"],
  koule: ["3 kg", "4 kg", "5 kg", "6 kg", "7,26 kg"],
  ostep: ["500 g", "600 g", "700 g", "800 g"],
  medicinbal: ["2 kg", "5 kg", "6 kg"],
  posilovna: [],
  kardio: [],
  mobilita: [],
};

export function getImplementPresets(discipline: string): string[] {
  return [...(IMPLEMENT_PRESETS[discipline] ?? [])];
}

export function isNoImplementDiscipline(discipline: string): boolean {
  return discipline === "kardio" || discipline === "mobilita";
}

export function isCustomOnlyDiscipline(discipline: string): boolean {
  return discipline === "posilovna";
}

export function isPresetValue(discipline: string, value: string): boolean {
  return getImplementPresets(discipline).includes(value);
}

export function resolveImplementForDiscipline(
  discipline: string,
  current: string
): string {
  if (isNoImplementDiscipline(discipline)) {
    return "";
  }

  if (isCustomOnlyDiscipline(discipline)) {
    return current;
  }

  const presets = getImplementPresets(discipline);
  if (current && presets.includes(current)) {
    return current;
  }

  if (presets.length > 0) {
    return presets[0];
  }

  return "";
}

export function isCustomImplementValue(discipline: string, value: string): boolean {
  if (!value.trim()) return false;
  if (isCustomOnlyDiscipline(discipline)) return true;
  return !isPresetValue(discipline, value);
}
