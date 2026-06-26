import { getStatusColor, type StatusColorKey } from "@/lib/design";

interface StatusBadgeProps {
  status: StatusColorKey;
  label: string;
  className?: string;
}

export default function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const { color, background } = getStatusColor(status);

  return (
    <span
      className={`badge badge-status badge-status-${status}${className ? ` ${className}` : ""}`}
      style={{ color, backgroundColor: background }}
    >
      {label}
    </span>
  );
}
