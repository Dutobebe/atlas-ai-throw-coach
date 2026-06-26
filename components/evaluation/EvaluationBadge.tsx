import { hasTrainingEvaluation } from "@/lib/evaluation-utils";
import type { TrainingSession } from "@/types/training";

interface EvaluationBadgeProps {
  session: TrainingSession;
}

export default function EvaluationBadge({ session }: EvaluationBadgeProps) {
  if (hasTrainingEvaluation(session)) {
    return <span className="badge badge-eval-done">✓ Vyhodnoceno</span>;
  }
  return <span className="badge badge-eval-pending">○ Bez hodnocení</span>;
}
