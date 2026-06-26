"use client";

import type { Tab } from "@/types/training";

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onNewTraining: () => void;
}

function IconHome({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z" />
    </svg>
  );
}

function IconPlus({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function IconHistory({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconStats({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
    </svg>
  );
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onNewTraining,
}: BottomNavigationProps) {
  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={`nav-item${activeTab === "dashboard" ? " active" : ""}`}
        onClick={() => onTabChange("dashboard")}
      >
        <IconHome active={activeTab === "dashboard"} />
        <span className="nav-label">Přehled</span>
      </button>
      <button
        type="button"
        className={`nav-item${activeTab === "plan" ? " active" : ""}`}
        onClick={() => onTabChange("plan")}
      >
        <span className="nav-emoji" aria-hidden="true">📅</span>
        <span className="nav-label">Plán</span>
      </button>
      <button
        type="button"
        className={`nav-item${activeTab === "season" ? " active" : ""}`}
        onClick={() => onTabChange("season")}
      >
        <span className="nav-emoji" aria-hidden="true">🏆</span>
        <span className="nav-label">Sezóna</span>
      </button>
      <button
        type="button"
        className={`nav-item${activeTab === "training" ? " active" : ""}`}
        onClick={() => {
          if (activeTab !== "training") onNewTraining();
          else onTabChange("training");
        }}
      >
        <IconPlus active={activeTab === "training"} />
        <span className="nav-label">Trénink</span>
      </button>
      <button
        type="button"
        className={`nav-item${activeTab === "performance" ? " active" : ""}`}
        onClick={() => onTabChange("performance")}
      >
        <span className="nav-emoji" aria-hidden="true">📈</span>
        <span className="nav-label">Výkony</span>
      </button>
      <button
        type="button"
        className={`nav-item${activeTab === "history" ? " active" : ""}`}
        onClick={() => onTabChange("history")}
      >
        <IconHistory active={activeTab === "history"} />
        <span className="nav-label">Historie</span>
      </button>
      <button
        type="button"
        className={`nav-item${activeTab === "statistics" ? " active" : ""}`}
        onClick={() => onTabChange("statistics")}
      >
        <IconStats active={activeTab === "statistics"} />
        <span className="nav-label">Statistiky</span>
      </button>
    </nav>
  );
}
