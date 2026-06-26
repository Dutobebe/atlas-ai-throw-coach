import { parseThrowValue } from "@/lib/training-utils";
import type {
  CompetitionAttempt,
  CompetitionAttemptStatus,
  CompetitionResult,
} from "@/types/season";

export const COMPETITION_ATTEMPT_COUNT = 6;

function isAttemptStatus(value: unknown): value is CompetitionAttemptStatus {
  return value === "valid" || value === "foul" || value === "empty";
}

export function emptyCompetitionAttempt(): CompetitionAttempt {
  return {
    distance: "",
    note: "",
    status: "empty",
  };
}

export function createDefaultAttempts(count = COMPETITION_ATTEMPT_COUNT): CompetitionAttempt[] {
  return Array.from({ length: count }, () => emptyCompetitionAttempt());
}

export function normalizeCompetitionAttempt(raw: Partial<CompetitionAttempt>): CompetitionAttempt {
  const status = isAttemptStatus(raw.status) ? raw.status : "empty";
  const distance = raw.distance?.trim() ?? "";

  if (status === "foul") {
    return {
      distance: "",
      note: raw.note?.trim() ?? "",
      status: "foul",
    };
  }

  if (status === "empty") {
    return {
      distance: "",
      note: raw.note?.trim() ?? "",
      status: "empty",
    };
  }

  return {
    distance,
    note: raw.note?.trim() ?? "",
    status: "valid",
  };
}

export function normalizeAttempts(raw: unknown): CompetitionAttempt[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return createDefaultAttempts();
  }

  const attempts = raw.map((item) =>
    normalizeCompetitionAttempt(item as Partial<CompetitionAttempt>)
  );

  while (attempts.length < COMPETITION_ATTEMPT_COUNT) {
    attempts.push(emptyCompetitionAttempt());
  }

  return attempts.slice(0, COMPETITION_ATTEMPT_COUNT);
}

export function getAttemptDisplay(attempt: CompetitionAttempt): string {
  if (attempt.status === "foul") return "X";
  if (attempt.status === "empty") return "—";
  return attempt.distance.trim() || "—";
}

export function getAttemptDistanceValue(attempt: CompetitionAttempt): number | null {
  if (attempt.status !== "valid") return null;
  return parseThrowValue(attempt.distance);
}

export function computeBestValidAttempt(attempts: CompetitionAttempt[]): number | null {
  let best: number | null = null;

  for (const attempt of attempts) {
    const value = getAttemptDistanceValue(attempt);
    if (value === null || value <= 0) continue;
    if (best === null || value > best) best = value;
  }

  return best;
}

export function getBestValidAttempt(result: CompetitionResult): number | null {
  if (result.bestAttempt !== null && result.bestAttempt > 0) {
    return result.bestAttempt;
  }
  return computeBestValidAttempt(result.attempts);
}

export function formatDistanceValue(distance: number): string {
  const rounded = Math.round(distance * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded} m` : `${rounded.toFixed(2)} m`;
}

export function formatBestValidAttempt(result: CompetitionResult): string | null {
  const best = getBestValidAttempt(result);
  if (best === null) return null;
  return formatDistanceValue(best);
}
