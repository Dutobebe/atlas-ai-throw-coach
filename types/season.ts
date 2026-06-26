export type CompetitionStatus = "planned" | "completed";

export type CompetitionAttemptStatus = "valid" | "foul" | "empty";

export interface CompetitionAttempt {
  /** Distance in metres; empty for foul/skipped */
  distance: string;
  note: string;
  status: CompetitionAttemptStatus;
}

export interface Competition {
  id: string;
  date: string;
  name: string;
  location: string;
  disciplines: string[];
  /** Implement / weight used at the competition */
  implementWeight: string;
  targetPerformance: string;
  notes: string;
  resultLink: string;
  placement: string;
  official: boolean;
  status: CompetitionStatus;
  attempts: CompetitionAttempt[];
}

export interface Season {
  year: number;
  mainGoal: string;
  secondaryGoals: string[];
  competitions: Competition[];
}
