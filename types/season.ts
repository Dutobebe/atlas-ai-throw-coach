export type CompetitionStatus = "planned" | "completed";

export type CompetitionAttemptStatus = "valid" | "foul" | "empty";

export interface CompetitionAttempt {
  /** Distance in metres; empty for foul/skipped */
  distance: string;
  note: string;
  status: CompetitionAttemptStatus;
}

export interface CompetitionResult {
  id: string;
  discipline: string;
  implement: string;
  official: boolean;
  placement: string;
  resultLink: string;
  attempts: CompetitionAttempt[];
  /** Best valid attempt distance in metres; computed from attempts */
  bestAttempt: number | null;
  notes: string;
}

export interface Competition {
  id: string;
  date: string;
  name: string;
  location: string;
  status: CompetitionStatus;
  notes: string;
  competitionResults: CompetitionResult[];
}

export interface Season {
  year: number;
  mainGoal: string;
  secondaryGoals: string[];
  competitions: Competition[];
}
