"use client";

import {
  CUSTOM_IMPLEMENT_VALUE,
  getImplementPresets,
  isCustomImplementValue,
  isCustomOnlyDiscipline,
  isNoImplementDiscipline,
} from "@/lib/implement-options";

interface ImplementSelectorProps {
  discipline: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ImplementSelector({
  discipline,
  value,
  onChange,
}: ImplementSelectorProps) {
  const presets = getImplementPresets(discipline);
  const noImplement = isNoImplementDiscipline(discipline);
  const customOnly = isCustomOnlyDiscipline(discipline);
  const textOnly = customOnly || (presets.length === 0 && !noImplement);
  const customActive = isCustomImplementValue(discipline, value);

  function handleSelectChange(next: string) {
    if (next === CUSTOM_IMPLEMENT_VALUE) {
      onChange(customActive ? value : "");
      return;
    }
    onChange(next);
  }

  if (textOnly) {
    return (
      <div className="form-group">
        <label className="form-label">Nářadí</label>
        <input
          type="text"
          className="form-input"
          placeholder="vlastní text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  const selectValue = customActive
    ? CUSTOM_IMPLEMENT_VALUE
    : noImplement && value === ""
      ? ""
      : value || presets[0] || "";

  return (
    <div className="form-group">
      <label className="form-label">Nářadí</label>
      <select
        className="form-select"
        value={selectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
      >
        {noImplement && <option value="">Žádné nářadí</option>}
        {presets.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={CUSTOM_IMPLEMENT_VALUE}>Vlastní…</option>
      </select>

      {customActive && (
        <input
          type="text"
          className="form-input implement-custom-input"
          placeholder="vlastní hodnota"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
