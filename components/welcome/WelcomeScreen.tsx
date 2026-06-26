"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { APP_VERSION } from "@/lib/app-version";
import { saveThemePreference, type ThemePreference } from "@/lib/theme";

interface WelcomeScreenProps {
  onContinue: () => void;
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a6.5 6.5 0 0 0 11.5 11.5z" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [selected, setSelected] = useState<ThemePreference>(
    resolvedTheme === "light" ? "light" : "dark"
  );

  function selectTheme(preference: ThemePreference) {
    setSelected(preference);
    setTheme(preference);
    saveThemePreference(preference);
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo-wrap">
          <div className="welcome-logo-glow" aria-hidden="true" />
          <Image
            src="/atlas-logo.png"
            alt="Atlas Throwing Master"
            width={220}
            height={220}
            className="welcome-logo-image"
            priority
          />
        </div>

        <section className="welcome-theme-section">
          <h2 className="welcome-section-title">Vyber si vzhled</h2>

          <div className="welcome-theme-grid">
            <button
              type="button"
              className={`welcome-theme-card${selected === "dark" ? " welcome-theme-card-selected" : ""}`}
              onClick={() => selectTheme("dark")}
              aria-pressed={selected === "dark"}
            >
              <span className="welcome-theme-icon">
                <IconMoon />
              </span>
              <span className="welcome-theme-label">Tmavý režim</span>
            </button>

            <button
              type="button"
              className={`welcome-theme-card${selected === "light" ? " welcome-theme-card-selected" : ""}`}
              onClick={() => selectTheme("light")}
              aria-pressed={selected === "light"}
            >
              <span className="welcome-theme-icon">
                <IconSun />
              </span>
              <span className="welcome-theme-label">Světlý režim</span>
            </button>
          </div>
        </section>

        <button type="button" className="btn btn-primary welcome-continue" onClick={onContinue}>
          Pokračovat
        </button>

        <footer className="welcome-footer">Atlas AI Throw Coach • {APP_VERSION}</footer>
      </div>
    </div>
  );
}
