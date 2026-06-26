/** Draft fields for the Quick Capture form (Throw series only) */
export interface QuickCaptureDraft {
  discipline: string;
  technique: string;
  implementWeight: string;
  throwCount: number;
  bestThrow: string;
  intensityPercent: number;
}

/** Pinned favourite series shortcut (no bestThrow — changes each session) */
export interface FavouriteSeries {
  id: string;
  discipline: string;
  technique: string;
  implementWeight: string;
  throwCount: number;
  intensityPercent: number;
}
