"use client";

import {
  INTENSITY_PRESETS,
  formatIntensityDisplay,
  isIntensityPresetValue,
} from "@/lib/intensity-presets";

interface IntensitySelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function IntensitySelector({ value, onChange }: IntensitySelectorProps) {
  const isCustom = !isIntensityPresetValue(value);

  return (
    <div className="intensity-selector">
      {isCustom && (
        <p className="intensity-selector-custom" aria-live="polite">
          Aktuálně: {formatIntensityDisplay(value)}
        </p>
      )}
      <div className="intensity-options" role="group" aria-label="Intenzita">
        {INTENSITY_PRESETS.map((preset) => {
          const selected = value === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              className={`intensity-option-btn${selected ? " active" : ""}`}
              aria-pressed={selected}
              onClick={() => onChange(preset.value)}
            >
              {formatIntensityDisplay(preset.value)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
