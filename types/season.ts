export type CompetitionStatus = "planned" | "completed";

export interface Competition {
  id: string;
  date: string;
  name: string;
  location: string;
  disciplines: string[];
  targetPerformance: string;
  notes: string;
  status: CompetitionStatus;
}

export interface Season {
  year: number;
  mainGoal: string;
  secondaryGoals: string[];
  competitions: Competition[];
}
