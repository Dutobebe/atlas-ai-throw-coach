# Coach Framework v1

> **Full framework spec:** [docs/COACH_FRAMEWORK.md](docs/COACH_FRAMEWORK.md) — decision support model, Planning/Daily engines, discipline combination rules, training type rules.

Logic layer for **Atlas AI Coach** recommendations. Implemented in `lib/coach-framework.ts`; types in `types/coach-framework.ts`.

All analysis is **local-first** — computed from `TrainingSession[]`, `PlanPhase[]`, and `Season[]`. No backend, no LLM in v1.

---

## 1. Cíl sezóny

**Source:** `Season.mainGoal`, `Season.secondaryGoals` (modul **Sezóna**)

The season goal anchors all decisions. If `mainGoal` is empty, the highest-priority recommendation asks the athlete to define it.

---

## 2. Fáze přípravy

**Source:** next planned `Competition`, `PlanPhase.competitionPrepId`, calendar distance

| Days to competition | Phase label |
|---------------------|-------------|
| > 56 | Obecná příprava |
| 28–56 | Specifická příprava |
| 8–21 | Příprava na závod |
| 0–7 | Týden závodu |
| none | Období mimo závodní vrchol |

Rules tighten volume when a competition is ≤ 14 days away and load score is high.

---

## 3. Týdenní cíle

**Source:** `PlanPhase` entries in the current calendar week (`goal` field)

If no phases exist this week → recommend planning in **Plán**.

---

## 4. Kombinace disciplín

**Source:** throw counts (`seriesType === "Throw"`) in the current week

If one discipline ≥ 80 % of weekly throws → recommend balancing disciplines.

---

## 5. Typy tréninku

**Source:** `PlanPhase.type` (Trénink, Volno, Regenerace, …) and `TrainingSeries.purpose` (Technika, Rychlost, …)

Example rule: ≥ 3 speed-purpose series and zero technique → add a technique series.

---

## 6. Objem a intenzita

**Source:** weekly throw total vs 4-week rolling average; average `intensityPercent`

Example rule: weekly throws > 130 % of 4-week average → flag volume spike.

---

## 7. Load score

**Scale:** 0–100

| Range | Label |
|-------|-------|
| 0–34 | Nízká |
| 35–59 | Střední |
| 60–79 | Vysoká |
| 80–100 | Velmi vysoká |

**Factors:**

| Factor | Max contribution |
|--------|------------------|
| Objem (vs 4-week avg) | 45 |
| Intenzita (avg %) | 25 |
| RPE (last session) | 20 |
| Únava (last evaluation) | 15 |

Displayed on **Přehled** in the AI Coach card.

---

## 8. Adaptace

Recommendations adapt when load score and subjective fatigue (evaluation) conflict — e.g. high fatigue + load ≥ 50 → prioritise regeneration.

Future: adjust planned `throwCount` / `intensityPercent` suggestions in Plán.

---

## 9. Pravidla rozhodování

Rules are evaluated in priority order in `generateRecommendations()`:

1. Missing season goal
2. High load before competition
3. Missing weekly plan
4. Volume spike
5. Discipline imbalance
6. Training-type imbalance (speed without technique)
7. Fatigue + load adaptation
8. Unlinked competition prep phases
9. Default: continue current direction

Each rule maps to a `CoachPillar` for traceability.

---

## 10. Vysvětlení doporučení

Every `CoachRecommendation` includes an `explanation` string referencing which pillar(s) and data triggered the rule.

UI: **Proč?** toggle on the AI Coach card (**Pilíř 10**).

---

## API

```typescript
import { analyzeCoachFramework } from "@/lib/coach-framework";

const snapshot = analyzeCoachFramework({ sessions, phases, seasons });
// snapshot.loadScore
// snapshot.primaryRecommendation
// snapshot.recommendations
```

See `ATLAS_SPEC.md` §19 for app integration.
