import { daysUntil } from "@/lib/dashboard-utils";
import { getWeekBounds } from "@/lib/discipline-throw-stats";
import { getSeasonForYear, getNextCompetition } from "@/lib/season-utils";
import {
  getDisciplineLabel,
  getPurposeLabel,
  getSeriesIntensityPercent,
  getSeriesThrowCount,
  isThrowSeries,
} from "@/lib/training-utils";
import { getPhaseTypeLabel } from "@/lib/plan-utils";
import type { PlanPhase } from "@/types/plan";
import type { Season } from "@/types/season";
import type {
  CoachFrameworkInput,
  CoachFrameworkSnapshot,
  CoachPillar,
  CoachRecommendation,
  DisciplineMixEntry,
  LoadFactor,
  LoadLevel,
  LoadScore,
  PrepPhaseContext,
  TrainingTypeMix,
  VolumeIntensityContext,
  WeeklyGoalsContext,
} from "@/types/coach-framework";
import type { TrainingSession } from "@/types/training";

const LOAD_LABELS: Record<LoadLevel, string> = {
  low: "Nízká",
  moderate: "Střední",
  high: "Vysoká",
  "very-high": "Velmi vysoká",
};

function parseLocalDate(iso: string): Date | null {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function isDateInWeek(iso: string, start: Date, end: Date): boolean {
  const date = parseLocalDate(iso);
  if (!date) return false;
  return date >= start && date <= end;
}

function getSessionsInWeek(sessions: TrainingSession[], refDate: Date): TrainingSession[] {
  const { start, end } = getWeekBounds(refDate);
  return sessions.filter((session) => isDateInWeek(session.date, start, end));
}

function getPhasesInWeek(phases: PlanPhase[], refDate: Date): PlanPhase[] {
  const { start, end } = getWeekBounds(refDate);
  return phases.filter((phase) => isDateInWeek(phase.date, start, end));
}

function countThrowsInSessions(sessionList: TrainingSession[]): number {
  return sessionList.reduce(
    (total, session) =>
      total +
      (Array.isArray(session.series) ? session.series : []).reduce(
        (sum, series) => (isThrowSeries(series) ? sum + getSeriesThrowCount(series) : sum),
        0
      ),
    0
  );
}

function averageIntensity(sessionList: TrainingSession[]): number {
  const values: number[] = [];

  for (const session of sessionList) {
    for (const series of Array.isArray(session.series) ? session.series : []) {
      if (isThrowSeries(series)) {
        values.push(getSeriesIntensityPercent(series));
      }
    }
  }

  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function getAvgWeeklyThrows(sessions: TrainingSession[], refDate: Date): number {
  const ref = new Date(refDate);
  ref.setHours(0, 0, 0, 0);
  const fourWeeksStart = new Date(ref);
  fourWeeksStart.setDate(fourWeeksStart.getDate() - 27);

  let total = 0;
  for (let week = 0; week < 4; week += 1) {
    const weekStart = new Date(fourWeeksStart);
    weekStart.setDate(fourWeeksStart.getDate() + week * 7);
    total += countThrowsInSessions(getSessionsInWeek(sessions, weekStart));
  }

  return Math.round(total / 4);
}

function buildDisciplineMix(sessionList: TrainingSession[]): DisciplineMixEntry[] {
  const counts = new Map<string, number>();
  let total = 0;

  for (const session of sessionList) {
    for (const series of Array.isArray(session.series) ? session.series : []) {
      if (!isThrowSeries(series)) continue;
      const count = getSeriesThrowCount(series);
      if (count <= 0) continue;
      counts.set(series.discipline, (counts.get(series.discipline) ?? 0) + count);
      total += count;
    }
  }

  if (total === 0) return [];

  return [...counts.entries()]
    .map(([discipline, throws]) => ({
      discipline,
      label: getDisciplineLabel(discipline),
      throws,
      sharePercent: Math.round((throws / total) * 100),
    }))
    .sort((a, b) => b.throws - a.throws);
}

function buildTrainingTypeMix(
  weekPhases: PlanPhase[],
  weekSessions: TrainingSession[]
): TrainingTypeMix {
  const phaseTypes: Record<string, number> = {};
  const seriesPurposes: Record<string, number> = {};

  for (const phase of weekPhases) {
    const label = getPhaseTypeLabel(phase.type);
    phaseTypes[label] = (phaseTypes[label] ?? 0) + 1;
  }

  for (const session of weekSessions) {
    for (const series of Array.isArray(session.series) ? session.series : []) {
      if (!isThrowSeries(series)) continue;
      const label = getPurposeLabel(series.purpose);
      seriesPurposes[label] = (seriesPurposes[label] ?? 0) + 1;
    }
  }

  return { phaseTypes, seriesPurposes };
}

function buildPrepPhaseContext(
  seasons: Season[],
  phases: PlanPhase[],
  refDate: Date
): PrepPhaseContext {
  const competition = getNextCompetition(seasons);
  const daysToCompetition = competition ? daysUntil(competition.date, refDate) : null;
  const linkedPlanPhases = phases.filter((phase) => phase.competitionPrepId).length;

  let label = "Období mimo závodní vrchol";

  if (daysToCompetition !== null) {
    if (daysToCompetition <= 7) label = "Týden závodu";
    else if (daysToCompetition <= 21) label = "Příprava na závod";
    else if (daysToCompetition <= 56) label = "Specifická příprava";
    else label = "Obecná příprava";
  }

  return {
    label,
    daysToCompetition,
    competitionName: competition?.name.trim() || null,
    linkedPlanPhases,
  };
}

function buildWeeklyGoalsContext(weekPhases: PlanPhase[]): WeeklyGoalsContext {
  const goals = weekPhases
    .map((phase) => phase.goal.trim())
    .filter(Boolean);

  return {
    phaseCount: weekPhases.length,
    goals,
    hasPlan: weekPhases.length > 0,
  };
}

function resolveLoadLevel(value: number): LoadLevel {
  if (value < 35) return "low";
  if (value < 60) return "moderate";
  if (value < 80) return "high";
  return "very-high";
}

function calculateLoadScore(
  weekSessions: TrainingSession[],
  weekThrows: number,
  avgWeeklyThrows: number,
  avgIntensity: number,
  refDate: Date
): LoadScore {
  const factors: LoadFactor[] = [];

  const volumeRatio = avgWeeklyThrows > 0 ? weekThrows / avgWeeklyThrows : weekThrows > 0 ? 1.5 : 0;
  const volumeContribution = Math.min(45, Math.round(volumeRatio * 30));
  factors.push({
    key: "volume",
    label: "Objem",
    contribution: volumeContribution,
    detail: `${weekThrows} hodů tento týden${avgWeeklyThrows > 0 ? ` (průměr ${avgWeeklyThrows})` : ""}`,
  });

  const intensityContribution = Math.min(25, Math.round(avgIntensity * 0.25));
  if (avgIntensity > 0) {
    factors.push({
      key: "intensity",
      label: "Intenzita",
      contribution: intensityContribution,
      detail: `Průměrná intenzita ${avgIntensity} %`,
    });
  }

  const sorted = [...weekSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastSession = sorted[0] ?? null;
  const rpeContribution = lastSession ? Math.min(20, lastSession.rpe * 2) : 0;

  if (lastSession) {
    factors.push({
      key: "rpe",
      label: "RPE",
      contribution: rpeContribution,
      detail: `Poslední trénink RPE ${lastSession.rpe}/10`,
    });
  }

  const lastEvaluated = [...weekSessions]
    .filter((session) => session.evaluation?.savedAt)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const fatigue = lastEvaluated?.evaluation?.fatigue ?? 0;
  const fatigueContribution = fatigue > 0 ? Math.min(15, fatigue * 3) : 0;

  if (fatigue > 0) {
    factors.push({
      key: "fatigue",
      label: "Únava",
      contribution: fatigueContribution,
      detail: `Subjektivní únava ${fatigue}/5 z posledního vyhodnocení`,
    });
  }

  void refDate;

  const value = Math.min(
    100,
    factors.reduce((sum, factor) => sum + factor.contribution, 0)
  );
  const level = resolveLoadLevel(value);

  return {
    value,
    level,
    label: LOAD_LABELS[level],
    factors,
  };
}

function makeRecommendation(
  id: string,
  pillar: CoachPillar,
  priority: number,
  title: string,
  message: string,
  explanation: string
): CoachRecommendation {
  return { id, pillar, priority, title, message, explanation };
}

function generateRecommendations(input: {
  seasonGoal: string | null;
  prepPhase: PrepPhaseContext;
  weeklyGoals: WeeklyGoalsContext;
  disciplineMix: DisciplineMixEntry[];
  trainingTypes: TrainingTypeMix;
  volumeIntensity: VolumeIntensityContext;
  loadScore: LoadScore;
  weekSessions: TrainingSession[];
}): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = [];
  const {
    seasonGoal,
    prepPhase,
    weeklyGoals,
    disciplineMix,
    trainingTypes,
    volumeIntensity,
    loadScore,
    weekSessions,
  } = input;

  if (!seasonGoal) {
    recommendations.push(
      makeRecommendation(
        "season-goal-missing",
        "season-goal",
        1,
        "Nastav cíl sezóny",
        "V modulu Sezóna chybí hlavní cíl — bez něj nelze sladit trénink.",
        "Pilíř 1 (Cíl sezóny): Doporučení vychází z prázdného mainGoal v aktuální sezóně. Cíl určuje směr objemu, intenzity a fáze přípravy."
      )
    );
  }

  if (
    prepPhase.daysToCompetition !== null &&
    prepPhase.daysToCompetition <= 14 &&
    (loadScore.level === "high" || loadScore.level === "very-high")
  ) {
    recommendations.push(
      makeRecommendation(
        "prep-reduce-load",
        "prep-phase",
        2,
        "Sniž zátěž před závodem",
        prepPhase.competitionName
          ? `Do ${prepPhase.competitionName} zbývá ${prepPhase.daysToCompetition} dní — zvaž lehčí jednotku.`
          : "Blíží se závod — aktuální load score je vysoký.",
        "Pilíř 2 (Fáze přípravy) + 7 (Load score): V posledních 14 dnech před závodem roste priorita regenerace a aktivace. Vysoký load score signalizuje riziko přetrénění."
      )
    );
  }

  if (!weeklyGoals.hasPlan) {
    recommendations.push(
      makeRecommendation(
        "weekly-plan-missing",
        "weekly-goals",
        3,
        "Naplánuj tento týden",
        "V Plánu nejsou fáze pro aktuální týden.",
        "Pilíř 3 (Týdenní cíle): Bez fází v týdenním plánu chybí záměr tréninku. Přidej fáze s cílem (goal) pro každý tréninkový den."
      )
    );
  }

  if (
    volumeIntensity.avgWeeklyThrows > 0 &&
    volumeIntensity.weekThrows > volumeIntensity.avgWeeklyThrows * 1.3
  ) {
    recommendations.push(
      makeRecommendation(
        "volume-spike",
        "volume-intensity",
        4,
        "Objem nad průměrem",
        `${volumeIntensity.weekThrows} hodů tento týden — výrazně nad 4týdenním průměrem (${volumeIntensity.avgWeeklyThrows}).`,
        "Pilíř 6 (Objem a intenzita): Pravidlo adaptace — skok objemu nad 130 % průměru zvyšuje riziko únavy. Zvaž regenerační den."
      )
    );
  }

  const dominant = disciplineMix[0];
  if (dominant && dominant.sharePercent >= 80 && disciplineMix.length > 1) {
    recommendations.push(
      makeRecommendation(
        "discipline-imbalance",
        "discipline-mix",
        5,
        "Vyváž disciplíny",
        `${dominant.label} tvoří ${dominant.sharePercent} % hodů tento týden.`,
        "Pilíř 4 (Kombinace disciplín): Příliš jednostranný objem může vést k přetížení specifických struktur. Střídej disciplíny podle cíle sezóny."
      )
    );
  }

  const speedCount = trainingTypes.seriesPurposes["Rychlost"] ?? 0;
  const techniqueCount = trainingTypes.seriesPurposes["Technika"] ?? 0;
  if (speedCount >= 3 && techniqueCount === 0) {
    recommendations.push(
      makeRecommendation(
        "add-technique",
        "training-types",
        6,
        "Doplň technickou sérii",
        "Tento týden převažují rychlostní série bez techniky.",
        "Pilíř 5 (Typy tréninku): Pravidlo rozhodování — rychlost bez technické kvality snižuje efekt. Přidej sérii s účelem Technika."
      )
    );
  }

  const lastFatigue = [...weekSessions]
    .filter((session) => session.evaluation?.savedAt)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    ?.evaluation?.fatigue;

  if (lastFatigue !== undefined && lastFatigue >= 4 && loadScore.value >= 50) {
    recommendations.push(
      makeRecommendation(
        "adapt-recovery",
        "adaptation",
        7,
        "Prioritizuj regeneraci",
        "Poslední vyhodnocení ukazuje vysokou únavu při střední až vysoké zátěži.",
        "Pilíř 8 (Adaptace): Kombinace vysoké subjektivní únavy a load score ≥ 50 spouští pravidlo snížení intenzity nebo volno."
      )
    );
  }

  if (prepPhase.linkedPlanPhases === 0 && prepPhase.daysToCompetition !== null && prepPhase.daysToCompetition <= 28) {
    recommendations.push(
      makeRecommendation(
        "link-prep-phases",
        "prep-phase",
        8,
        "Propoj plán se závodem",
        "Žádná fáze není svázána s přípravou na závod.",
        "Pilíř 2 (Fáze přípravy): V Plánu použij pole Příprava na závod u fází vedoucích k soutěži."
      )
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      makeRecommendation(
        "continue-plan",
        "decision-rules",
        99,
        "Drž směr",
        seasonGoal
          ? `Pokračuj podle cíle: ${seasonGoal}`
          : "Tréninkový rytmus vypadá vyváženě — pokračuj v záznamu.",
        "Pilíř 9 (Pravidla rozhodování): Žádné varovné pravidlo nebylo porušeno. Load score a objem jsou v toleranci."
      )
    );
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

export function analyzeCoachFramework(input: CoachFrameworkInput): CoachFrameworkSnapshot {
  const refDate = input.refDate ?? new Date();
  const year = refDate.getFullYear();
  const season = getSeasonForYear(input.seasons, year);
  const weekSessions = getSessionsInWeek(input.sessions, refDate);
  const weekPhases = getPhasesInWeek(input.phases, refDate);
  const weekThrows = countThrowsInSessions(weekSessions);
  const avgWeeklyThrows = getAvgWeeklyThrows(input.sessions, refDate);
  const avgIntensity = averageIntensity(weekSessions);

  const prepPhase = buildPrepPhaseContext(input.seasons, input.phases, refDate);
  const weeklyGoals = buildWeeklyGoalsContext(weekPhases);
  const disciplineMix = buildDisciplineMix(weekSessions);
  const trainingTypes = buildTrainingTypeMix(weekPhases, weekSessions);

  const volumeIntensity: VolumeIntensityContext = {
    weekThrows,
    avgWeeklyThrows,
    avgIntensity,
    sessionCount: weekSessions.length,
  };

  const loadScore = calculateLoadScore(
    weekSessions,
    weekThrows,
    avgWeeklyThrows,
    avgIntensity,
    refDate
  );

  const recommendations = generateRecommendations({
    seasonGoal: season.mainGoal.trim() || null,
    prepPhase,
    weeklyGoals,
    disciplineMix,
    trainingTypes,
    volumeIntensity,
    loadScore,
    weekSessions,
  });

  return {
    seasonGoal: season.mainGoal.trim() || null,
    secondaryGoals: season.secondaryGoals,
    prepPhase,
    weeklyGoals,
    disciplineMix,
    trainingTypes,
    volumeIntensity,
    loadScore,
    recommendations,
    primaryRecommendation: recommendations[0] ?? null,
  };
}

export { LOAD_LABELS };
