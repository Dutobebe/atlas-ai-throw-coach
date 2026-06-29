/** Legacy key — week is reset to current on each Plan tab entry (A-001.1). */
const LEGACY_SELECTED_WEEK_KEY = "atlas-selected-week";

/** Remove obsolete persisted week from localStorage. */
export function clearStoredWeekStart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_SELECTED_WEEK_KEY);
}
