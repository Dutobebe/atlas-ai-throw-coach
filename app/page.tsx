"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BottomNavigation from "@/components/training/BottomNavigation";
import Dashboard from "@/components/dashboard/Dashboard";
import PlanModule from "@/components/plan/PlanModule";
import TrainingModule from "@/components/training/TrainingModule";
import { APP_VERSION_LABEL } from "@/lib/app-version";
import DisciplineThrowsTable from "@/components/statistics/DisciplineThrowsTable";
import PerformanceModule from "@/components/performance/PerformanceModule";
import SeasonModule from "@/components/season/SeasonModule";
import QuickCaptureScreen from "@/components/quick-capture/QuickCaptureScreen";
import SummaryCards from "@/components/common/SummaryCards";
import SectionCard from "@/components/common/SectionCard";
import SectionTitle from "@/components/common/SectionTitle";
import IntensityBadge from "@/components/common/IntensityBadge";
import SeriesGoalsDisplay from "@/components/training/SeriesGoalsDisplay";
import {
  getSessionDisciplineSummary,
  getSessionImplementGroups,
} from "@/lib/history-display";
import {
  TAB_LABELS,
  countSeries,
  countThrows,
  emptySession,
  formatDate,
  formatTechniqueDisplay,
  getDisciplineLabel,
  getSeriesIntensityPercent,
  getEquipmentLabel,
  getSeriesBestThrow,
  getSeriesThrowCount,
  isThrowSeries,
  normalizeSession,
  syncSessionForStorage,
} from "@/lib/training-utils";
import LiveTrainingScreen from "@/components/live/LiveTrainingScreen";
import TrainingEvaluationScreen from "@/components/evaluation/TrainingEvaluationScreen";
import EvaluationBadge from "@/components/evaluation/EvaluationBadge";
import SeriesTypeBadge from "@/components/common/SeriesTypeBadge";
import type { TrainingEvaluation } from "@/types/training";
import {
  clearLiveTrainingMeta,
  createInitialLiveMeta,
  loadLiveTrainingMeta,
  prepareSessionForLive,
  saveLiveTrainingMeta,
  type LiveTrainingMeta,
} from "@/lib/live-training-utils";
import { convertPhaseToTraining, loadPlans, normalizePhase, PLANS_STORAGE_KEY } from "@/lib/plan-utils";
import {
  getNextCompetition,
  loadSeasons,
  normalizeSeason,
  SEASONS_STORAGE_KEY,
} from "@/lib/season-utils";
import { loadTemplates } from "@/lib/template-utils";
import {
  appendQuickCaptureSeries,
  FAVOURITES_STORAGE_KEY,
  loadFavourites,
  normalizeFavourite,
} from "@/lib/quick-capture-utils";
import type { FavouriteSeries, QuickCaptureDraft } from "@/types/quick-capture";
import type { Tab, TrainingSession } from "@/types/training";
import type { PlanPhase } from "@/types/plan";
import type { Season } from "@/types/season";
import type { TrainingTemplate } from "@/types/template";
import WelcomeScreen from "@/components/welcome/WelcomeScreen";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import { loadWelcomeComplete, saveWelcomeComplete } from "@/lib/theme";

const STORAGE_KEY = "atlas-throw-coach-sessions";
const PROFILE_KEY = "atlas-throw-coach-profile";

function loadSessions(): TrainingSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((session) => normalizeSession(session as TrainingSession));
  } catch {
    return [];
  }
}

function loadProfileName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PROFILE_KEY) ?? "";
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [phases, setPhases] = useState<PlanPhase[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [favourites, setFavourites] = useState<FavouriteSeries[]>([]);
  const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<TrainingSession>(() => emptySession());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewSession, setViewSession] = useState<TrainingSession | null>(null);
  const [profileName, setProfileName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [liveMeta, setLiveMeta] = useState<LiveTrainingMeta | null>(null);
  const [evaluationSessionId, setEvaluationSessionId] = useState<string | null>(null);
  const [trainingAutoStart, setTrainingAutoStart] = useState(false);
  const [trainingHeaderTitle, setTrainingHeaderTitle] = useState<string | null>(null);
  const [seasonFocusCompetitionId, setSeasonFocusCompetitionId] = useState<string | null>(null);
  const [seasonFocusYear, setSeasonFocusYear] = useState<number | null>(null);
  const [welcomeComplete, setWelcomeComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const loadedSessions = loadSessions();
    setSessions(loadedSessions);
    setPhases(loadPlans());
    setSeasons(loadSeasons());
    setFavourites(loadFavourites());
    setTemplates(loadTemplates());
    setProfileName(loadProfileName());
    setWelcomeComplete(loadWelcomeComplete());

    const meta = loadLiveTrainingMeta();
    if (meta && loadedSessions.some((s) => s.id === meta.sessionId)) {
      setLiveMeta(meta);
      setTab("live");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !liveMeta) return;
    saveLiveTrainingMeta(liveMeta);
  }, [liveMeta, loaded]);

  useEffect(() => {
    if (!loaded || tab !== "live" || liveMeta) return;
    setTrainingAutoStart(true);
    setTab("training");
  }, [loaded, tab, liveMeta]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions.map(syncSessionForStorage))
    );
  }, [sessions, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      PLANS_STORAGE_KEY,
      JSON.stringify(phases.map(normalizePhase))
    );
  }, [phases, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      SEASONS_STORAGE_KEY,
      JSON.stringify(seasons.map(normalizeSeason))
    );
  }, [seasons, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      FAVOURITES_STORAGE_KEY,
      JSON.stringify(favourites.map(normalizeFavourite))
    );
  }, [favourites, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(PROFILE_KEY, profileName);
  }, [profileName, loaded]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const stats = useMemo(
    () => ({
      throws: countThrows(sessions),
      sessionCount: sessions.length,
      seriesCount: countSeries(sessions),
    }),
    [sessions]
  );

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [sessions]
  );

  const nextCompetition = useMemo(() => getNextCompetition(seasons), [seasons]);

  function startActiveTraining(rawSession: TrainingSession) {
    const { session, seriesTargets } = prepareSessionForLive(rawSession);
    const meta = createInitialLiveMeta(session.id, seriesTargets);

    setSessions((prev) => {
      const without = prev.filter((s) => s.id !== session.id);
      return [...without, session];
    });
    setLiveMeta(meta);
    setDraft(emptySession());
    setEditingId(null);
    setViewSession(null);
    setTrainingAutoStart(false);
    setTab("live");
  }

  function openTrainingWizard() {
    setDraft(emptySession());
    setEditingId(null);
    setTrainingAutoStart(true);
    setTab("training");
  }

  function startNewTraining() {
    openTrainingWizard();
  }

  function handleTrainingNav() {
    if (liveMeta) {
      setTab("live");
      return;
    }
    openTrainingWizard();
  }

  function startQuickCapture() {
    setTab("quickCapture");
  }

  function saveQuickCapture(draft: QuickCaptureDraft) {
    const { sessions: nextSessions } = appendQuickCaptureSeries(sessions, draft);
    setSessions(nextSessions);
    showToast("Série uložena");
  }

  function startEdit(session: TrainingSession) {
    setDraft(normalizeSession(session));
    setEditingId(session.id);
    setViewSession(null);
    setTrainingAutoStart(true);
    setTab("training");
  }

  function openEvaluation(sessionId: string) {
    setEvaluationSessionId(sessionId);
    setViewSession(null);
    setTab("evaluation");
  }

  function saveSession() {
    const title = draft.title.trim() || "Trénink bez názvu";
    const session = syncSessionForStorage({ ...draft, title });

    if (editingId) {
      setSessions((prev) => prev.map((s) => (s.id === editingId ? session : s)));
      showToast("Trénink aktualizován");
      setDraft(emptySession());
      setEditingId(null);
      setTrainingAutoStart(false);
      setTab("history");
      return;
    }

    setSessions((prev) => [...prev, session]);
    showToast("Trénink uložen");
    setDraft(emptySession());
    setEditingId(null);
    setTrainingAutoStart(false);
    setTab("history");
  }

  function saveSessionWithEvaluation(evaluation: TrainingEvaluation) {
    const title = draft.title.trim() || "Trénink bez názvu";
    const session = syncSessionForStorage({ ...draft, title, evaluation });

    if (editingId) {
      setSessions((prev) => prev.map((s) => (s.id === editingId ? session : s)));
      showToast("Trénink aktualizován");
    } else {
      setSessions((prev) => [...prev, session]);
      showToast("Trénink uložen");
    }

    setDraft(emptySession());
    setEditingId(null);
    setTrainingAutoStart(false);
    setTab("history");
  }

  function skipWizardEvaluation() {
    saveSession();
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setViewSession(null);
    showToast("Trénink smazán");
  }

  function clearAllData() {
    if (confirm("Opravdu smazat všechna data? Tuto akci nelze vrátit.")) {
      setSessions([]);
      setPhases([]);
      setSeasons([]);
      setFavourites([]);
      setViewSession(null);
      setDraft(emptySession());
      setEditingId(null);
      showToast("Data smazána");
    }
  }

  function startTrainingFromPhase(phase: PlanPhase) {
    const { session, updatedPhase } = convertPhaseToTraining(phase);

    setPhases((prev) =>
      prev.map((item) => (item.id === phase.id ? updatedPhase : item))
    );
    startActiveTraining(session);
    showToast("Aktivní trénink zahájen");
  }

  function updateActiveSession(session: TrainingSession) {
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
  }

  function saveActiveSession(session: TrainingSession) {
    const title = session.title.trim() || "Trénink bez názvu";
    const saved = syncSessionForStorage({ ...session, title });
    setSessions((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
    clearLiveTrainingMeta();
    setLiveMeta(null);
    showToast("Trénink uložen");
    openEvaluation(saved.id);
  }

  function saveEvaluation(sessionId: string, evaluation: TrainingEvaluation) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? syncSessionForStorage({ ...s, evaluation })
          : s
      )
    );
    setEvaluationSessionId(null);
    showToast("Hodnocení uloženo");
    setTab("history");
  }

  function skipEvaluation() {
    setEvaluationSessionId(null);
    setTab("history");
  }

  function cancelActiveTraining() {
    if (liveMeta) {
      setSessions((prev) => prev.filter((s) => s.id !== liveMeta.sessionId));
    }
    clearLiveTrainingMeta();
    setLiveMeta(null);
    setTab("dashboard");
  }

  const liveSession = useMemo(() => {
    if (!liveMeta) return null;
    return sessions.find((s) => s.id === liveMeta.sessionId) ?? null;
  }, [liveMeta, sessions]);

  const evaluationSession = useMemo(() => {
    if (!evaluationSessionId) return null;
    return sessions.find((s) => s.id === evaluationSessionId) ?? null;
  }, [evaluationSessionId, sessions]);

  function handleTabChange(newTab: Tab) {
    if (newTab !== "history") setViewSession(null);
    if (newTab !== "evaluation") setEvaluationSessionId(null);
    if (newTab !== "training" && newTab !== "live" && !editingId) setDraft(emptySession());
    if (newTab !== "training") {
      setTrainingAutoStart(false);
      setTrainingHeaderTitle(null);
    }
    setTab(newTab);
  }

  function renderDashboard() {
    return (
      <Dashboard
        stats={stats}
        sessions={sessions}
        phases={phases}
        seasons={seasons}
        nextCompetition={nextCompetition}
        profileName={profileName || undefined}
        onStartTraining={startNewTraining}
        onQuickCapture={startQuickCapture}
        onOpenSeason={() => setTab("season")}
        onViewSession={(session) => {
          setViewSession(session);
          setTab("history");
        }}
      />
    );
  }

  function renderSessionDetail(session: TrainingSession) {
    return (
      <>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 16, width: "auto" }}
          onClick={() => setViewSession(null)}
        >
          ← Zpět
        </button>

        <div className="detail-header">
          <h2>{session.title}</h2>
          <div className="history-meta">
            <span>{formatDate(session.date)}</span>
            <span className="badge badge-rpe">RPE {session.rpe}</span>
            {session.createdFromPlanId && (
              <span className="badge badge-from-plan">📅 From Plan</span>
            )}
            <EvaluationBadge session={session} />
          </div>
        </div>

        {session.note && (
          <div className="card">
            <div className="card-subtitle">Poznámka</div>
            <p style={{ margin: "8px 0 0" }}>{session.note}</p>
          </div>
        )}

        {session.series.map((series, idx) => (
          <div key={series.id} className="card">
            <div className="card-title">
              Série {idx + 1} — {getDisciplineLabel(series.discipline)}
              <SeriesTypeBadge seriesType={series.seriesType ?? "Throw"} />
            </div>
            <div className="history-meta" style={{ marginTop: 4 }}>
              {series.technique && (
                <span>{formatTechniqueDisplay(series.discipline, series.technique)}</span>
              )}
              {series.equipment && <span>{getEquipmentLabel(series.equipment)}</span>}
              <span>
                {getSeriesThrowCount(series)}{" "}
                {isThrowSeries(series) ? "hodů" : "opakování"}
              </span>
              <IntensityBadge value={getSeriesIntensityPercent(series)} />
            </div>
            <SeriesGoalsDisplay goals={series.goals ?? []} />
            {isThrowSeries(series) && getSeriesBestThrow(series) !== null && (
              <div className="marks-display-row">
                <span className="mark-display">
                  {getSeriesBestThrow(series)} m
                </span>
              </div>
            )}
            {series.note && (
              <>
                <div className="divider" />
                <div className="card-subtitle">{series.note}</div>
              </>
            )}
          </div>
        ))}

        <div className="actions-row">
          <button type="button" className="btn btn-secondary" onClick={() => startEdit(session)}>
            Upravit
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => deleteSession(session.id)}
          >
            Smazat
          </button>
        </div>
      </>
    );
  }

  function renderHistory() {
    if (viewSession) return renderSessionDetail(viewSession);

    if (sortedSessions.length === 0) {
      return (
        <div className="empty-state">
          <p>Zatím žádné tréninky.</p>
          <button className="btn btn-primary" onClick={openTrainingWizard}>
            Vytvořit první trénink
          </button>
        </div>
      );
    }

    return (
      <>
        <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={startNewTraining}>
          + Nový trénink
        </button>
        {sortedSessions.map((s) => {
          const throwCount = s.series.reduce(
            (t, ser) => (isThrowSeries(ser) ? t + getSeriesThrowCount(ser) : t),
            0
          );
          const disciplineSummary = getSessionDisciplineSummary(s);
          const implementGroups = getSessionImplementGroups(s);

          return (
            <div
              key={s.id}
              className="card history-item"
              onClick={() => setViewSession(s)}
            >
              <div className="card-title">
                {s.title}
                {s.createdFromPlanId && (
                  <span className="badge badge-from-plan">📅 From Plan</span>
                )}
                <EvaluationBadge session={s} />
              </div>
              {disciplineSummary && (
                <div className="history-disciplines">{disciplineSummary}</div>
              )}
              {implementGroups.length > 0 && (
                <div className="history-implements">
                  {implementGroups.map((group) => (
                    <div key={group.discipline} className="history-implement-row">
                      {group.label} ({group.implements.join(", ")})
                    </div>
                  ))}
                </div>
              )}
              <div className="history-meta">
                <span>{formatDate(s.date)}</span>
                <span className="badge badge-rpe">RPE {s.rpe}</span>
                <EvaluationBadge session={s} />
                <span>{s.series.length} sérií</span>
                <span>{throwCount} hodů</span>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  function renderStatistics() {
    return (
      <>
        <SummaryCards stats={stats} />

        <DisciplineThrowsTable sessions={sessions} />

        {stats.sessionCount === 0 ? (
          <div className="empty-state">
            <p>Statistiky se zobrazí po prvním tréninku.</p>
          </div>
        ) : (
          <SectionCard>
            <SectionTitle>Průměr na trénink</SectionTitle>
            <div className="history-meta" style={{ marginTop: 8 }}>
              <span>
                {(stats.throws / stats.sessionCount).toFixed(1)} hodů / trénink
              </span>
              <span>
                {(stats.seriesCount / stats.sessionCount).toFixed(1)} sérií / trénink
              </span>
            </div>
          </SectionCard>
        )}
      </>
    );
  }

  function renderProfile() {
    return (
      <>
        <AppearanceSettings />

        <div className="card">
          <div className="profile-avatar">🏋</div>
          <div className="form-group">
            <label className="form-label">Jméno sportovce</label>
            <input
              type="text"
              className="form-input"
              placeholder="Tvé jméno"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>
          {profileName && (
            <>
              <div className="profile-name">{profileName}</div>
              <div className="profile-role">Atlet — hodní disciplíny</div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title">O aplikaci</div>
          <div className="card-subtitle" style={{ marginTop: 8, lineHeight: 1.6 }}>
            Atlas AI Throw Coach MVP — lokální záznamník tréninků hodů.
            Data jsou uložena pouze v tomto prohlížeči.
          </div>
        </div>

        <div className="card">
          <div className="card-title">Úložiště</div>
          <div className="history-meta" style={{ marginTop: 8 }}>
            <span>{stats.sessionCount} tréninků</span>
            <span>{stats.throws} hodů</span>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            style={{ marginTop: 16 }}
            onClick={clearAllData}
          >
            Smazat všechna data
          </button>
        </div>
      </>
    );
  }

  function renderContent() {
    switch (tab) {
      case "dashboard":
        return renderDashboard();
      case "plan":
        return (
          <PlanModule
            phases={phases}
            seasons={seasons}
            templates={templates}
            onPhasesChange={setPhases}
            onStartTrainingFromPhase={startTrainingFromPhase}
            onCompetitionClick={(competition) => {
              const year = Number(competition.date.slice(0, 4)) || new Date().getFullYear();
              setSeasonFocusYear(year);
              setSeasonFocusCompetitionId(competition.id);
              setTab("season");
            }}
            onToast={showToast}
          />
        );
      case "season":
        return (
          <SeasonModule
            seasons={seasons}
            onSeasonsChange={setSeasons}
            onToast={showToast}
            focusCompetitionId={seasonFocusCompetitionId}
            focusYear={seasonFocusYear}
            onFocusHandled={() => {
              setSeasonFocusCompetitionId(null);
              setSeasonFocusYear(null);
            }}
          />
        );
      case "quickCapture":
        return (
          <QuickCaptureScreen
            sessions={sessions}
            favourites={favourites}
            onFavouritesChange={setFavourites}
            onSave={saveQuickCapture}
            onClose={() => setTab("dashboard")}
          />
        );
      case "training":
        return (
          <TrainingModule
            key={trainingAutoStart ? `wizard-${draft.id}` : `training-${draft.id}`}
            session={draft}
            isEditing={editingId !== null}
            templates={templates}
            autoStartWizard={trainingAutoStart}
            hasActiveTraining={Boolean(liveMeta)}
            onChange={setDraft}
            onSave={saveSession}
            onSaveWithEvaluation={saveSessionWithEvaluation}
            onSkipEvaluation={skipWizardEvaluation}
            onCancel={() => {
              setDraft(emptySession());
              setEditingId(null);
              setTrainingAutoStart(false);
              setTab("dashboard");
            }}
            onResumeActive={() => setTab("live")}
            onStepTitleChange={setTrainingHeaderTitle}
          />
        );
      case "live":
        return liveSession && liveMeta ? (
          <LiveTrainingScreen
            session={liveSession}
            meta={liveMeta}
            onSessionChange={updateActiveSession}
            onMetaChange={setLiveMeta}
            onSave={saveActiveSession}
            onExit={cancelActiveTraining}
          />
        ) : null;
      case "evaluation":
        return evaluationSession ? (
          <TrainingEvaluationScreen
            session={evaluationSession}
            onSave={(evaluation) => saveEvaluation(evaluationSession.id, evaluation)}
            onSkip={skipEvaluation}
          />
        ) : (
          <div className="empty-state">
            <p>Žádný trénink k vyhodnocení.</p>
            <button type="button" className="btn btn-primary" onClick={() => setTab("history")}>
              Historie
            </button>
          </div>
        );
      case "performance":
        return <PerformanceModule sessions={sessions} seasons={seasons} />;
      case "history":
        return renderHistory();
      case "statistics":
        return renderStatistics();
      case "profile":
        return renderProfile();
    }
  }

  function handleWelcomeContinue() {
    saveWelcomeComplete();
    setWelcomeComplete(true);
  }

  if (!loaded || welcomeComplete === null) {
    return null;
  }

  if (!welcomeComplete) {
    return <WelcomeScreen onContinue={handleWelcomeContinue} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner app-header-row">
          <div className="app-header-titles">
            <h1>
              {tab === "profile"
                ? "Nastavení"
                : tab === "training" && trainingHeaderTitle
                  ? trainingHeaderTitle
                  : TAB_LABELS[tab]}
            </h1>
            <span className="app-version">{APP_VERSION_LABEL}</span>
          </div>
          <button
            type="button"
            className={`app-header-settings${tab === "profile" ? " app-header-settings-active" : ""}`}
            onClick={() => setTab("profile")}
            aria-label="Nastavení"
            title="Nastavení"
          >
            ⚙
          </button>
        </div>
      </header>

      <main
        className={`app-main${
          tab === "evaluation" || tab === "quickCapture" ? " app-main-live" : ""
        }`}
      >
        {renderContent()}
      </main>

      {tab !== "evaluation" && tab !== "quickCapture" && tab !== "profile" && (
        <BottomNavigation
          activeTab={tab === "live" ? "training" : tab}
          onTabChange={handleTabChange}
          onNewTraining={handleTrainingNav}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
