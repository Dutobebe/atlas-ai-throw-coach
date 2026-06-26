interface SeriesGoalsDisplayProps {
  goals: string[];
}

export default function SeriesGoalsDisplay({ goals }: SeriesGoalsDisplayProps) {
  if (!goals.length) return null;

  return (
    <div className="series-goals-display">
      {goals.map((goal) => (
        <span key={goal} className="series-goal-badge">
          {goal}
        </span>
      ))}
    </div>
  );
}
