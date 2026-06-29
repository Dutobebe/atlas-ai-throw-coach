"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatWeekRange,
  getCurrentWeek,
  getISOWeek,
  getNextWeek,
  getPreviousWeek,
  getWeekDays,
  getWeekStart,
} from "@/lib/week";
import { clearStoredWeekStart } from "@/lib/week-storage";

interface UseSelectedWeekOptions {
  /** Increment when the user enters the Plan tab from another screen. */
  planEntryKey: number;
}

export function useSelectedWeek({ planEntryKey }: UseSelectedWeekOptions) {
  const [selectedWeekStart, setSelectedWeekStartState] = useState(getCurrentWeek);

  useEffect(() => {
    clearStoredWeekStart();
    setSelectedWeekStartState(getCurrentWeek());
  }, [planEntryKey]);

  const setSelectedWeekStart = useCallback((weekStart: string) => {
    setSelectedWeekStartState(getWeekStart(weekStart));
  }, []);

  const previousWeek = useCallback(() => {
    setSelectedWeekStart(getPreviousWeek(selectedWeekStart));
  }, [selectedWeekStart, setSelectedWeekStart]);

  const nextWeek = useCallback(() => {
    setSelectedWeekStart(getNextWeek(selectedWeekStart));
  }, [selectedWeekStart, setSelectedWeekStart]);

  const goToCurrentWeek = useCallback(() => {
    setSelectedWeekStart(getCurrentWeek());
  }, [setSelectedWeekStart]);

  const weekNumber = useMemo(() => getISOWeek(selectedWeekStart), [selectedWeekStart]);
  const weekRange = useMemo(() => formatWeekRange(selectedWeekStart), [selectedWeekStart]);
  const weekDays = useMemo(() => getWeekDays(selectedWeekStart), [selectedWeekStart]);
  const isCurrentWeek = selectedWeekStart === getCurrentWeek();

  return {
    selectedWeekStart,
    setSelectedWeekStart,
    previousWeek,
    nextWeek,
    goToCurrentWeek,
    weekNumber,
    weekRange,
    weekDays,
    isCurrentWeek,
  };
}
