"use client";

import {
  formatTechniqueDisplay,
  getTechniquesForDiscipline,
  hasTechniqueLibrary,
} from "@/lib/technique-library";

interface TechniqueSelectorProps {
  discipline: string;
  value: string;
  onChange: (technique: string) => void;
}

export default function TechniqueSelector({
  discipline,
  value,
  onChange,
}: TechniqueSelectorProps) {
  const options = getTechniquesForDiscipline(discipline);
  const hasLibrary = hasTechniqueLibrary(discipline);
  const isCustom =
    hasLibrary && value.trim() !== "" && !options.some((o) => o.code === value.trim());

  if (!hasLibrary) {
    return (
      <div className="form-group">
        <label className="form-label">Technika</label>
        <input
          type="text"
          className="form-input"
          placeholder="Vlastní technika"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  const selectValue = isCustom ? "__custom__" : value || options[0]?.code || "";

  return (
    <div className="form-group">
      <label className="form-label">Technika</label>
      <select
        className="form-select"
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === "__custom__") {
            onChange("");
            return;
          }
          onChange(next);
        }}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {discipline === "kladivo"
              ? `${option.code} (${option.label})`
              : `${option.code} — ${option.label}`}
          </option>
        ))}
        <option value="__custom__">Vlastní…</option>
      </select>
      {(isCustom || selectValue === "__custom__") && (
        <input
          type="text"
          className="form-input technique-custom-input"
          placeholder="Vlastní technika"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {value && !isCustom && selectValue !== "__custom__" && (
        <div className="technique-preview">{formatTechniqueDisplay(discipline, value)}</div>
      )}
    </div>
  );
}
