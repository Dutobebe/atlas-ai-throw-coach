"use client";

import { useEffect, useMemo, useState } from "react";
import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import StatusBadge from "@/components/common/StatusBadge";
import { getDisciplineIcon } from "@/lib/design";
import {
  COMPETITION_STATUS_LABELS,
  emptyCompetition,
  formatSecondaryGoals,
  getSeasonForYear,
  normalizeCompetition,
  parseSecondaryGoals,
  sortCompetitions,
  upsertSeason,
} from "@/lib/season-utils";
import { formatBestValidAttempt } from "@/lib/competition-utils";
import { DISCIPLINES, formatDate, getDisciplineLabel } from "@/lib/training-utils";
import type { Competition, CompetitionStatus, Season } from "@/types/season";
import CompetitionAttemptsEditor from "./CompetitionAttemptsEditor";

interface SeasonModuleProps {
  seasons: Season[];
  onSeasonsChange: (seasons: Season[]) => void;
  onToast: (message: string) => void;
  focusCompetitionId?: string | null;
  focusYear?: number | null;
  onFocusHandled?: () => void;
}

type SeasonView = "overview" | "competition";

export default function SeasonModule({
  seasons,
  onSeasonsChange,
  onToast,
  focusCompetitionId,
  focusYear,
  onFocusHandled,
}: SeasonModuleProps) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [view, setView] = useState<SeasonView>("overview");
  const [competitionDraft, setCompetitionDraft] = useState<Competition>(() => emptyCompetition());
  const [editingCompetitionId, setEditingCompetitionId] = useState<string | null>(null);

  const season = useMemo(() => getSeasonForYear(seasons, year), [seasons, year]);
  const sortedCompetitions = useMemo(
    () => sortCompetitions(season.competitions),
    [season.competitions]
  );

  useEffect(() => {
    if (!focusCompetitionId) return;

    const targetYear = focusYear ?? new Date().getFullYear();
    setYear(targetYear);

    const targetSeason = getSeasonForYear(seasons, targetYear);
    const competition = targetSeason.competitions.find((item) => item.id === focusCompetitionId);
    if (competition) {
      setCompetitionDraft({ ...competition });
      setEditingCompetitionId(competition.id);
      setView("competition");
    }

    onFocusHandled?.();
  }, [focusCompetitionId, focusYear, seasons, onFocusHandled]);

  function saveSeason(nextSeason: Season) {
    onSeasonsChange(upsertSeason(seasons, nextSeason));
  }

  function updateSeasonGoals(partial: Pick<Season, "mainGoal" | "secondaryGoals">) {
    saveSeason({ ...season, ...partial });
  }

  function startNewCompetition() {
    setCompetitionDraft(emptyCompetition());
    setEditingCompetitionId(null);
    setView("competition");
  }

  function startEditCompetition(competition: Competition) {
    setCompetitionDraft({ ...competition });
    setEditingCompetitionId(competition.id);
    setView("competition");
  }

  function cancelCompetitionForm() {
    setView("overview");
    setEditingCompetitionId(null);
    setCompetitionDraft(emptyCompetition());
  }

  function saveCompetition() {
    const normalized = normalizeCompetition(competitionDraft);
    if (!normalized.name.trim()) {
      onToast("Zadej název závodu");
      return;
    }

    const nextCompetitions = editingCompetitionId
      ? season.competitions.map((item) =>
          item.id === editingCompetitionId ? normalized : item
        )
      : [...season.competitions, normalized];

    saveSeason({ ...season, competitions: nextCompetitions });
    onToast(editingCompetitionId ? "Závod upraven" : "Závod přidán");
    cancelCompetitionForm();
  }

  function deleteCompetition(id: string) {
    if (!confirm("Opravdu smazat tento závod?")) return;
    saveSeason({
      ...season,
      competitions: season.competitions.filter((item) => item.id !== id),
    });
    onToast("Závod smazán");
    if (editingCompetitionId === id) cancelCompetitionForm();
  }

  function toggleCompetitionDiscipline(value: string) {
    setCompetitionDraft((prev) => {
      const disciplines = prev.disciplines.includes(value)
        ? prev.disciplines.filter((item) => item !== value)
        : [...prev.disciplines, value];
      return { ...prev, disciplines };
    });
  }

  function updateCompetitionStatus(status: CompetitionStatus) {
    setCompetitionDraft((prev) => ({ ...prev, status }));
  }

  if (view === "competition") {
    return (
      <div className="season-module">
        <button type="button" className="btn btn-secondary btn-sm season-back-btn" onClick={cancelCompetitionForm}>
          ← Zpět
        </button>

        <SectionCard className="season-form-card">
          <SectionTitle>{editingCompetitionId ? "Upravit závod" : "Nový závod"}</SectionTitle>

          <div className="form-group">
            <label className="form-label">Datum</label>
            <input
              type="date"
              className="form-input"
              value={competitionDraft.date}
              onChange={(e) => setCompetitionDraft((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Název</label>
            <input
              type="text"
              className="form-input"
              placeholder="např. MČR, Memoriál"
              value={competitionDraft.name}
              onChange={(e) => setCompetitionDraft((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Místo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Město / stadion"
              value={competitionDraft.location}
              onChange={(e) => setCompetitionDraft((prev) => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Disciplíny</label>
            <div className="plan-discipline-chips">
              {DISCIPLINES.map((discipline) => {
                const active = competitionDraft.disciplines.includes(discipline.value);
                return (
                  <button
                    key={discipline.value}
                    type="button"
                    className={`plan-chip${active ? " plan-chip-active" : ""}`}
                    onClick={() => toggleCompetitionDiscipline(discipline.value)}
                  >
                    {getDisciplineIcon(discipline.value) && (
                      <span className="plan-chip-icon">{getDisciplineIcon(discipline.value)}</span>
                    )}
                    {discipline.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nářadí / hmotnost</label>
            <input
              type="text"
              className="form-input"
              placeholder="např. 2 kg, 7,26 kg"
              value={competitionDraft.implementWeight}
              onChange={(e) =>
                setCompetitionDraft((prev) => ({ ...prev, implementWeight: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cílový výkon</label>
            <input
              type="text"
              className="form-input"
              placeholder="např. 62 m / 18,50 m"
              value={competitionDraft.targetPerformance}
              onChange={(e) =>
                setCompetitionDraft((prev) => ({ ...prev, targetPerformance: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Umístění</label>
            <input
              type="text"
              className="form-input"
              placeholder="např. 3. místo"
              value={competitionDraft.placement}
              onChange={(e) =>
                setCompetitionDraft((prev) => ({ ...prev, placement: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Odkaz na výsledek</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://…"
              value={competitionDraft.resultLink}
              onChange={(e) =>
                setCompetitionDraft((prev) => ({ ...prev, resultLink: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={competitionDraft.official}
                onChange={(e) =>
                  setCompetitionDraft((prev) => ({ ...prev, official: e.target.checked }))
                }
              />{" "}
              Oficiální závod (počítá se do Výkonů)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Stav</label>
            <div className="season-status-chips">
              {(["planned", "completed"] as CompetitionStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`season-status-chip${competitionDraft.status === status ? " season-status-chip-active" : ""}`}
                  onClick={() => updateCompetitionStatus(status)}
                >
                  {COMPETITION_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Poznámky</label>
            <textarea
              className="form-textarea season-goal-input"
              placeholder="Taktika, cíle, vybavení…"
              value={competitionDraft.notes}
              onChange={(e) => setCompetitionDraft((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pokusy</label>
            <CompetitionAttemptsEditor
              attempts={competitionDraft.attempts}
              onChange={(attempts) => setCompetitionDraft((prev) => ({ ...prev, attempts }))}
            />
          </div>

          <div className="actions-row">
            {editingCompetitionId && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => deleteCompetition(editingCompetitionId)}
              >
                Smazat
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={cancelCompetitionForm}>
              Zrušit
            </button>
            <button type="button" className="btn btn-primary" onClick={saveCompetition}>
              Uložit závod
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="season-module">
      <div className="season-year-nav">
        <button
          type="button"
          className="btn btn-secondary btn-sm season-year-btn"
          onClick={() => setYear((value) => value - 1)}
          aria-label="Předchozí rok"
        >
          ‹
        </button>
        <h2 className="season-year-title">Sezóna {year}</h2>
        <button
          type="button"
          className="btn btn-secondary btn-sm season-year-btn"
          onClick={() => setYear((value) => value + 1)}
          aria-label="Další rok"
        >
          ›
        </button>
      </div>

      <SectionCard>
        <SectionTitle>Hlavní cíl sezóny</SectionTitle>
        <textarea
          className="form-textarea season-goal-input"
          placeholder="Co je hlavním cílem této sezóny?"
          value={season.mainGoal}
          onChange={(e) =>
            updateSeasonGoals({ mainGoal: e.target.value, secondaryGoals: season.secondaryGoals })
          }
        />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Vedlejší cíle</SectionTitle>
        <p className="season-hint">Jeden cíl na řádek</p>
        <textarea
          className="form-textarea season-goal-input"
          placeholder={"Zlepšit techniku\nStabilní sérii 60 m"}
          value={formatSecondaryGoals(season.secondaryGoals)}
          onChange={(e) =>
            updateSeasonGoals({
              mainGoal: season.mainGoal,
              secondaryGoals: parseSecondaryGoals(e.target.value),
            })
          }
        />
      </SectionCard>

      <div className="season-comp-header">
        <SectionTitle>Závody</SectionTitle>
        <button type="button" className="btn btn-secondary btn-sm" onClick={startNewCompetition}>
          + Závod
        </button>
      </div>

      {sortedCompetitions.length === 0 ? (
        <SectionCard>
          <div className="empty-state season-empty">
            <p>Žádné závody pro rok {year}.</p>
            <button type="button" className="btn btn-primary" onClick={startNewCompetition}>
              Přidat první závod
            </button>
          </div>
        </SectionCard>
      ) : (
        sortedCompetitions.map((competition) => {
          const best = formatBestValidAttempt(competition);
          return (
          <SectionCard key={competition.id} className="season-comp-card">
            <button
              type="button"
              className="season-comp-card-btn"
              onClick={() => startEditCompetition(competition)}
            >
              <div className="season-comp-card-top">
                <div>
                  <div className="season-comp-name">{competition.name || "Bez názvu"}</div>
                  <div className="season-comp-meta">
                    <span>{formatDate(competition.date)}</span>
                    {competition.location && <span>{competition.location}</span>}
                    {competition.official && (
                      <span className="performance-official-badge">Oficiální</span>
                    )}
                  </div>
                </div>
                <StatusBadge
                  status={competition.status === "completed" ? "completed" : "planned"}
                  label={COMPETITION_STATUS_LABELS[competition.status]}
                />
              </div>

              {competition.disciplines.length > 0 && (
                <div className="season-comp-disciplines">
                  {competition.disciplines.map((discipline) => (
                    <span key={discipline} className="season-comp-discipline">
                      {getDisciplineIcon(discipline)} {getDisciplineLabel(discipline)}
                    </span>
                  ))}
                </div>
              )}

              {competition.implementWeight && (
                <div className="season-comp-target">Nářadí: {competition.implementWeight}</div>
              )}

              {competition.targetPerformance && (
                <div className="season-comp-target">
                  Cíl: {competition.targetPerformance}
                </div>
              )}

              {best && <div className="season-comp-target">Nejlepší pokus: {best}</div>}

              {competition.placement && (
                <div className="season-comp-target">Umístění: {competition.placement}</div>
              )}

              {competition.notes && (
                <div className="season-comp-notes">{competition.notes}</div>
              )}
            </button>
          </SectionCard>
        );
        })
      )}

      {seasons.every((item) => item.year !== year) && sortedCompetitions.length === 0 && (
        <p className="season-hint season-hint-center">
          Cíle a závody se ukládají automaticky po první úpravě.
        </p>
      )}
    </div>
  );
}
