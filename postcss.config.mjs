import { TrainingSession } from "./types";

const STORAGE_KEY = "atlas_sessions_v2";

export function loadSessions(): TrainingSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: TrainingSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function parseMarks(value: string): number[] {
  return value
    .split(/\n|;|,/)
    .map((item) => Number(item.trim().replace(",", ".")))
    .filter((value) => !Number.isNaN(value) && value > 0);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${Number(day)}. ${Number(month)}. ${year}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
