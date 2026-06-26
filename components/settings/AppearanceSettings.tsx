"use client";

import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: Array<{ value: ThemePreference; label: string; description: string }> = [
  { value: "light", label: "Světlý", description: "Světlé pozadí, tmavý text" },
  { value: "dark", label: "Tmavý", description: "Tmavé pozadí, světlý text" },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const active = theme === "system" ? "dark" : theme;

  return (
    <SectionCard>
      <SectionTitle>Vzhled</SectionTitle>
      <p className="settings-hint">Změna se projeví okamžitě v celé aplikaci.</p>
      <div className="theme-option-list" role="radiogroup" aria-label="Vzhled aplikace">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`theme-option${active === option.value ? " theme-option-active" : ""}`}
          >
            <input
              type="radio"
              name="appearance"
              value={option.value}
              checked={active === option.value}
              onChange={() => setTheme(option.value)}
            />
            <span className="theme-option-body">
              <span className="theme-option-label">{option.label}</span>
              <span className="theme-option-desc">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </SectionCard>
  );
}
