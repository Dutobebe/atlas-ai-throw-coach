"use client";

interface RPESelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RPESelector({ value, onChange }: RPESelectorProps) {
  return (
    <div className="form-group">
      <label className="form-label">RPE (1–10)</label>
      <div className="rpe-row">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={`rpe-btn${value === n ? " active" : ""}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
