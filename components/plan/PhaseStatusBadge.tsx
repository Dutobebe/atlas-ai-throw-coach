import { PHASE_STATUS_LABELS } from "@/lib/plan-utils";
import StatusBadge from "@/components/common/StatusBadge";
import type { PhaseStatus } from "@/types/plan";

interface PhaseStatusBadgeProps {
  status: PhaseStatus;
}

export default function PhaseStatusBadge({ status }: PhaseStatusBadgeProps) {
  return <StatusBadge status={status} label={PHASE_STATUS_LABELS[status]} />;
}
