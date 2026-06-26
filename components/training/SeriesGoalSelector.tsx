"use client";

import {
  MAX_SERIES_GOALS,
  getGoalsForDiscipline,
} from "@/lib/goal-library";

interface SeriesGoalSelectorProps {
  discipline: string;
  value: string[];
  onChange: (goals: string[]) => void;
}

export default function SeriesGoalSelector({
  discipline,
  value,
  onChange,
}: SeriesGoalSelectorProps) {
  const options = getGoalsForDiscipline(discipline);
  const selected = new Set(value);
  const atMax = value.length >= MAX_SERIES_GOALS;

  function toggle(goal: string) {
    if (selected.has(goal)) {
      onChange(value.filter((item) => item !== goal));
      return;
    }
    if (atMax) return;
    onChange([...value, goal]);
  }

  return (
    <div className="form-group">
      <label className="form-label">
        Cíl série
        <span className="series-goal-hint"> (1–{MAX_SERIES_GOALS})</span>
      </label>
      <div className="plan-discipline-chips series-goal-chips">
        {options.map((goal) => {
          const active = selected.has(goal);
          const disabled = !active && atMax;
          return (
            <button
              key={goal}
              type="button"
              className={`plan-chip${active ? " plan-chip-active" : ""}${disabled ? " plan-chip-disabled" : ""}`}
              onClick={() => toggle(goal)}
              disabled={disabled}
              aria-pressed={active}
            >
              {goal}
            </button>
          );
        })}
      </div>
    </div>
  );
}
