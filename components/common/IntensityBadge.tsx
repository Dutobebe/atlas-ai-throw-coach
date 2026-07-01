import { getIntensityColor } from "@/lib/design";
import { formatIntensityDisplay } from "@/lib/intensity-presets";

interface IntensityBadgeProps {
  value: number;
  className?: string;
}

export default function IntensityBadge({ value, className = "" }: IntensityBadgeProps) {
  const color = getIntensityColor(value);

  return (
    <span
      className={`badge badge-intensity${className ? ` ${className}` : ""}`}
      style={{ color, backgroundColor: `${color}22` }}
    >
      {formatIntensityDisplay(value)}
    </span>
  );
}
