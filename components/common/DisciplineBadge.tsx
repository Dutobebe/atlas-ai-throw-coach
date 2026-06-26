import { getDisciplineColor, getDisciplineIcon } from "@/lib/design";
import { getDisciplineLabel } from "@/lib/training-utils";

interface DisciplineBadgeProps {
  discipline: string;
  showLabel?: boolean;
  className?: string;
}

export default function DisciplineBadge({
  discipline,
  showLabel = false,
  className = "",
}: DisciplineBadgeProps) {
  const icon = getDisciplineIcon(discipline);
  const color = getDisciplineColor(discipline);

  if (!icon && !showLabel) return null;

  return (
    <span
      className={`badge badge-discipline${className ? ` ${className}` : ""}`}
      style={{ color, borderColor: color, backgroundColor: `${color}22` }}
    >
      {icon && (
        <span className="badge-discipline-icon" aria-hidden>
          {icon}
        </span>
      )}
      {showLabel && <span>{getDisciplineLabel(discipline)}</span>}
    </span>
  );
}
