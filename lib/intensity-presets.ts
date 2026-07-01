export const INTENSITY_PRESET_VALUES = [70, 80, 90, 100] as const;

export type IntensityPresetValue = (typeof INTENSITY_PRESET_VALUES)[number];

export const INTENSITY_PRESETS: { value: IntensityPresetValue; label: string }[] = [
  { value: 70, label: "Lehce technicky" },
  { value: 80, label: "Středně" },
  { value: 90, label: "Submaximálně" },
  { value: 100, label: "Race" },
];

export const DEFAULT_TECHNIQUE_INTENSITY_PERCENT = 70;
export const DEFAULT_RACE_INTENSITY_PERCENT = 100;

const presetByValue = new Map(INTENSITY_PRESETS.map((preset) => [preset.value, preset]));

export function isIntensityPresetValue(value: number): value is IntensityPresetValue {
  return presetByValue.has(value as IntensityPresetValue);
}

export function getIntensityPreset(value: number) {
  return presetByValue.get(value as IntensityPresetValue);
}

export function formatIntensityDisplay(value: number): string {
  const preset = getIntensityPreset(value);
  if (preset) {
    return `${preset.label} · ${preset.value} %`;
  }
  return `Vlastní · ${value} %`;
}

export function formatIntensityShortLabel(value: number): string {
  const preset = getIntensityPreset(value);
  return preset?.label ?? "Vlastní";
}
