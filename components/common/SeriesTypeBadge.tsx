import { getSeriesTypeLabel } from "@/lib/training-utils";
import type { SeriesType } from "@/types/training";

interface SeriesTypeBadgeProps {
  seriesType: SeriesType;
  className?: string;
}

export default function SeriesTypeBadge({ seriesType, className = "" }: SeriesTypeBadgeProps) {
  if (seriesType === "Throw") return null;

  const badgeClass = `badge badge-series badge-series-${seriesType.toLowerCase()}${className ? ` ${className}` : ""}`;

  return (
    <span className={badgeClass}>{getSeriesTypeLabel(seriesType)}</span>
  );
}
