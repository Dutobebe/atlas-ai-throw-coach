# Changelog

All notable changes to Atlas AI Throw Coach are documented here.

## v0.3.1 – Coach Framework v1

Rule-based **AI Coach** on Přehled — local analysis, no backend.

- Ten-pillar framework documented in `COACH_FRAMEWORK.md`
- `lib/coach-framework.ts` — load score, prep phase, recommendations with explanations
- AI Coach card: load score, season goal, top recommendation, **Proč?** toggle

---

## v0.3.0 – Core MVP

**Core stabilization release** — data model cleanup, series type support, and documentation before new features.

### Data model

- **Series types:** `Throw`, `Imitation`, `Drill`, `Exercise` — only `Throw` counts toward throw totals and **Výkony**
- **Plan vs Trénink:** `PlannedSeries` (Plán) has no `bestThrow`; `TrainingSeries` (Trénink) may include achieved results
- Central helpers: `isThrowSeries()`, `showsBestThrowField()`, `showsImplementField()`
- Canonical plan entity: `PlanPhase` (not “PlannedPhase”)

### Modules (MVP)

| Module | Tab |
|--------|-----|
| Přehled | `dashboard` |
| Plán | `plan` |
| Sezóna | `season` |
| Trénink | `training` |
| Rychlý zápis | `quickCapture` |
| Live trénink | `live` |
| Vyhodnocení | `evaluation` |
| Historie | `history` |
| Statistiky | `statistics` |
| Výkony | `performance` |

### Terminology

- **Série** — training unit (never “Blok”)
- **Plán** — intended workload
- **Trénink** — actual workload
- **Výkony** — PR and season best marks

### Documentation

- Updated `ATLAS_SPEC.md` and `DESIGN_SYSTEM.md`
- Added `SeriesTypeBadge` component

---

## Prior sprints (summary)

| Sprint | Feature |
|--------|---------|
| 6.x | Plán — weekly multi-phase planner |
| 7.x | Templates, techniques, intensity |
| 8 | Goal library |
| 9 | Výkony (PR / season best) |
| 9.1–9.2 | Design system components |
| 10 | Live Training Mode |
| 11 | Training evaluation |
| 12 | Sezóna & competitions |
| 13 | Quick Capture |
| 14 | Core stabilization → **v0.3.0** |
