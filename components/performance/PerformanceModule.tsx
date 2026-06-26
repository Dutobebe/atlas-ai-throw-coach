"use client";

import { useMemo, useState } from "react";
import { formatDisciplineWithIcon } from "@/lib/history-display";
import {
  calculatePerformanceGroups,
  defaultPerformanceFilters,
  formatPerformanceDistance,
  getPerformanceFilterOptions,
  hasAnyPerformanceData,
  type PerformanceFilters,
  type PerformanceSourceFilter,
} from "@/lib/performance-utils";
import { formatDate, formatTechniqueDisplay } from "@/lib/training-utils";
import type { Season } from "@/types/season";
import type { TrainingSession } from "@/types/training";

interface PerformanceModuleProps {
  sessions: TrainingSession[];
  seasons: Season[];
}

const SOURCE_FILTER_OPTIONS: { value: PerformanceSourceFilter; label: string }[] = [
  { value: "", label: "Vše" },
  { value: "official", label: "Závodní / oficiální" },
  { value: "unofficial", label: "Nezávodní / tréninkové" },
];

export default function PerformanceModule({ sessions, seasons }: PerformanceModuleProps) {
  const filterOptions = useMemo(
    () => getPerformanceFilterOptions(sessions, seasons),
    [sessions, seasons]
  );

  const [filters, setFilters] = useState<PerformanceFilters>(() =>
    defaultPerformanceFilters(filterOptions)
  );

  const activeFilters = useMemo(() => {
    const year = filterOptions.years.includes(filters.year)
      ? filters.year
      : filterOptions.years[0] ?? new Date().getFullYear();

    return { ...filters, year };
  }, [filters, filterOptions.years]);

  const rows = useMemo(
    () => calculatePerformanceGroups(sessions, seasons, activeFilters),
    [sessions, seasons, activeFilters]
  );

  function updateFilter<K extends keyof PerformanceFilters>(
    field: K,
    value: PerformanceFilters[K]
  ) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  if (!hasAnyPerformanceData(sessions, seasons)) {
    return (
      <div className="empty-state">
        <p>Zatím žádné výkony.</p>
        <p className="card-subtitle" style={{ marginTop: 8 }}>
          PR a sezónní nejlepší výsledky se zobrazí po zadání hodů typu Throw s nejdelším hodem
          nebo oficiálních výsledků ze závodu.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card performance-filters-card">
        <div className="card-title">Filtry</div>
        <div className="performance-filters">
          <div className="form-group performance-filter-field performance-filter-field-wide">
            <label className="form-label">Typ výkonu</label>
            <div className="performance-source-chips">
              {SOURCE_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  className={`performance-source-chip${activeFilters.source === option.value ? " performance-source-chip-active" : ""}`}
                  onClick={() => updateFilter("source", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group performance-filter-field">
            <label className="form-label" htmlFor="perf-filter-discipline">
              Disciplína
            </label>
            <select
              id="perf-filter-discipline"
              className="form-select"
              value={activeFilters.discipline}
              onChange={(e) => updateFilter("discipline", e.target.value)}
            >
              <option value="">Vše</option>
              {filterOptions.disciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {formatDisciplineWithIcon(discipline)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group performance-filter-field">
            <label className="form-label" htmlFor="perf-filter-implement">
              Nářadí
            </label>
            <select
              id="perf-filter-implement"
              className="form-select"
              value={activeFilters.implement}
              onChange={(e) => updateFilter("implement", e.target.value)}
            >
              <option value="">Vše</option>
              {filterOptions.implements.map((implement) => (
                <option key={implement} value={implement}>
                  {implement}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group performance-filter-field">
            <label className="form-label" htmlFor="perf-filter-technique">
              Technika
            </label>
            <select
              id="perf-filter-technique"
              className="form-select"
              value={activeFilters.technique}
              onChange={(e) => updateFilter("technique", e.target.value)}
            >
              <option value="">Vše</option>
              {filterOptions.techniques.map((technique) => (
                <option key={technique} value={technique}>
                  {technique}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group performance-filter-field">
            <label className="form-label" htmlFor="perf-filter-year">
              Rok (sezónní nej.)
            </label>
            <select
              id="perf-filter-year"
              className="form-select"
              value={activeFilters.year}
              onChange={(e) => updateFilter("year", parseInt(e.target.value, 10))}
            >
              {filterOptions.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <p>Pro zvolené filtry nejsou žádné výkony.</p>
        </div>
      ) : (
        rows.map((row) => (
          <div key={row.key} className="card performance-row-card">
            <div className="performance-row-header">
              <span className="performance-row-discipline">
                {row.disciplineIcon && (
                  <span className="performance-row-icon" aria-hidden>
                    {row.disciplineIcon}
                  </span>
                )}
                {row.disciplineLabel}
                {row.hasOfficial && (
                  <span className="performance-official-badge">Oficiální</span>
                )}
              </span>
              <span className="performance-row-meta">{row.implement}</span>
            </div>
            <div className="performance-row-technique">
              {row.technique !== "—"
                ? formatTechniqueDisplay(row.discipline, row.technique)
                : "—"}
            </div>

            <div className="performance-metrics">
              <div className="performance-metric">
                <span className="performance-metric-label">PR</span>
                <span className="performance-metric-value">
                  {row.pr ? formatPerformanceDistance(row.pr.distance) : "—"}
                </span>
                <span className="performance-metric-date">
                  {row.pr ? formatDate(row.pr.date) : "—"}
                </span>
              </div>
              <div className="performance-metric">
                <span className="performance-metric-label">Sezónní nej. ({activeFilters.year})</span>
                <span className="performance-metric-value">
                  {row.seasonBest
                    ? formatPerformanceDistance(row.seasonBest.distance)
                    : "—"}
                </span>
                <span className="performance-metric-date">
                  {row.seasonBest ? formatDate(row.seasonBest.date) : "—"}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
