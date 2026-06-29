# Atlas Data Model

> **Status:** Active · **Last updated:** _TBD_  
> **Related:** [Product Vision](./PRODUCT_VISION.md) · [Coach Framework](./COACH_FRAMEWORK.md) · [UX Guidelines](./UX_GUIDELINES.md) · [ATLAS_SPEC.md](../ATLAS_SPEC.md)

This document defines the **canonical data architecture** for Project Atlas. It is architecture only — no code changes are implied by this file.

Future implementations (Plan, Season, Training, Coach, Statistics) **must align with this hierarchy and these responsibilities**. When existing code diverges, treat this document as the target model and migrate incrementally.

## Table of contents

- [Hierarchy](#hierarchy)
- [Entity responsibilities](#entity-responsibilities)
  - [Season](#season)
  - [Week](#week)
  - [Day](#day)
  - [Item](#item)
- [Item types](#item-types)
  - [Training](#training)
  - [Competition](#competition)
  - [Recovery](#recovery)
  - [Camp](#camp)
  - [Rest](#rest)
- [Cross-cutting concerns](#cross-cutting-concerns)
- [Mapping from current implementation](#mapping-from-current-implementation)
- [Module boundaries](#module-boundaries)
- [Implementation rules (future sprints)](#implementation-rules-future-sprints)
- [Related documents](#related-documents)

---

## Hierarchy

Atlas organizes athletic planning and execution in four nested levels:

```
Season
 └── Week
      └── Day
           └── Item
```

| Level | Scope | Primary question |
|-------|--------|------------------|
| **Season** | Calendar year | *What are we preparing for this year?* |
| **Week** | ISO week (Mon–Sun) | *What does this training week look like?* |
| **Day** | Single calendar date | *What happens on this day?* |
| **Item** | One schedulable unit on a day | *What is this block of work or recovery?* |

A **Season** contains many **Weeks**. A **Week** contains exactly seven **Days** (Monday through Sunday). A **Day** contains zero or more **Items**, ordered within the day.

Items are the atomic unit of planning. Multiple items on the same day represent separate phases (e.g. morning technique + afternoon strength).

---

## Entity responsibilities

### Season

The top-level container for one competitive year.

**Owns:**

- Season identity (`year`)
- Strategic direction (`mainGoal`, secondary goals)
- Competition calendar (`Competition` entries with dates, results, status)
- Context for prep-phase logic (general → specific → competition week)

**Does not own:**

- Daily workload detail (that lives in Days and Items)
- Executed throw data (that lives in completed Training records)

**Used by:** Sezóna module, Coach Planning Engine, Performance/Statistics (season bests), Plan (competitions appear automatically on matching days).

---

### Week

A navigable slice of the season aligned to **ISO week number** and **Monday–Sunday** bounds.

**Owns:**

- Week number and date range (e.g. Týden 27 · `30.6.–6.7.2026`)
- The set of seven Days for that range
- Weekly roll-ups used by coach and statistics (throw volume, load, discipline mix)

**Does not own:**

- Season goals or competition definitions (references Season)
- Persistent storage as a separate document — Weeks are **derived views** over Days and Items, keyed by week start date

**Used by:** Plan (week navigation, weekly planner UI), Coach Planning Engine (weekly goals, volume rules).

---

### Day

One calendar date within a Week.

**Owns:**

- Date (`YYYY-MM-DD`)
- Ordered list of Items scheduled for that date
- Day-level indicators (today, has competition, has planned work, has completed work)
- Optional link to Season competitions occurring on this date (read from Season, displayed on the Day)

**Does not own:**

- Cross-day logic (Week and Season provide that context)
- Throw results (those belong to executed Training items / sessions)

**Used by:** Plan (daily sections, week strip), Daily Coach Engine (today’s plan).

---

### Item

The smallest schedulable unit on a Day. Every planned or recorded activity is an Item.

**Owns:**

- Unique id
- Item type (see below)
- Title, notes, goal
- Type-specific payload (e.g. planned series, competition link, camp details)
- Lifecycle status (`planned` · `started` · `completed` · `changed` · `skipped`)
- Optional link to an executed record (e.g. completed Training → `TrainingSession`)

**Does not own:**

- Season-level competition definitions (may **reference** them)
- Week-level aggregation (computed upward)

**Used by:** Plan (create, edit, delete, reorder), Training wizard (start from planned item), History/Statistics (when linked to completed sessions).

---

## Item types

Every Item has exactly one type. Types are mutually exclusive.

| Type | Purpose |
|------|---------|
| **Training** | Structured throwing or preparation work with planned or executed series |
| **Competition** | Competition day — may mirror a Season competition or mark a local meet |
| **Recovery** | Regeneration, mobility, light activation without full training load |
| **Camp** | Multi-day or intensive block (training camp, clinic, team gathering) |
| **Rest** | Explicit rest day — no planned workload |

### Training

**Responsibility:** Represent planned or completed athletic work with measurable workload.

**Typical content:**

- Disciplines (disk, kladivo, koule, …)
- Planned or executed series (throws, imitations, drills, exercises)
- Session goal, intensity, purpose (technique, speed, competition, warmup)
- Link to `TrainingSession` when executed

**Rules:**

- Planned series describe **intent** (no best throw).
- Executed series describe **outcome** (throw count, best mark, RPE, evaluation).
- One planned Training item may spawn one or more sessions; retain `lastTrainingId` / `createdFromPlanId` linkage.

---

### Competition

**Responsibility:** Mark a day (or phase within a day) as competition-focused and connect planning to the Season calendar.

**Typical content:**

- Reference to Season `Competition` (date, name, location, results)
- Prep link (`competitionPrepId`) for phases leading into the meet
- Status: planned vs completed
- Optional same-day Training items (activation, warm-up) as separate Items

**Rules:**

- Competitions defined in **Season** automatically appear on the correct **Day** in Plan.
- Results and attempts live on the Season competition; the Day Item is the planning lens.

---

### Recovery

**Responsibility:** Schedule deliberate low-load work — regeneration, physio, easy movement, activation before competition.

**Typical content:**

- Title and note (what to do)
- Optional light series or checklist (no performance targets)
- May overlap conceptually with “activation” in current UI — under this model, activation is a **Recovery** subtype or tag, not a separate top-level type

**Rules:**

- Does not contribute throw statistics unless linked to a logged session explicitly marked as training.
- Coach engine may recommend Recovery when load score is high.

---

### Camp

**Responsibility:** Represent an intensive block that spans one or more days but is managed as a distinct planning concept.

**Typical content:**

- Camp name, location, date range
- Daily sub-schedule (optional Items per Day within the camp)
- Notes, travel, accommodation (future fields)

**Rules:**

- A Camp Item on a Day signals the athlete is in camp mode; related Days may reference the same camp id.
- Throw volume rules may relax or tighten during camp weeks (Coach Planning Engine).

---

### Rest

**Responsibility:** Explicitly schedule no training — protects recovery and makes empty days intentional.

**Typical content:**

- Title (optional), note
- Status only — no series, no disciplines

**Rules:**

- Distinct from “empty day” (no items). Rest is a **positive** plan decision.
- Weekly balance: Rest + Recovery + Training + Competition must align with Season phase.

---

## Cross-cutting concerns

### Planned vs executed

| Concept | Layer | Storage role |
|---------|--------|--------------|
| Plan | Item (planned) | Intent — what should happen |
| Session | Training execution | Outcome — what happened |

Items hold plan state. Completed Training items link to `TrainingSession` records. Statistics and Performance read **executed** data, not plan drafts.

### Ordering on a Day

Items on the same Day are ordered (e.g. by `createdAt` or explicit `sortOrder`). Display priority: **Hlavní** (first) · **Vedlejší 2** · …

### Identifiers and dates

- All dates: ISO `YYYY-MM-DD` (local calendar).
- All entities: stable UUID `id`.
- Week boundaries: Monday 00:00 – Sunday 23:59 (local), ISO week number for display.

### localStorage (current)

Until a unified store exists, persistence is split:

| Key | Current content | Target alignment |
|-----|-----------------|------------------|
| `atlas-plans` | `PlanPhase[]` | Items (Training, Recovery, Rest, …) keyed by `date` |
| Season storage | `Season[]` | Season + Competition calendar |
| `atlas-throw-coach-sessions` | `TrainingSession[]` | Executed Training outcomes |

Future refactors should migrate toward Items without breaking existing keys until a explicit migration sprint.

---

## Mapping from current implementation

This section documents **today’s code** vs the target model. No refactor is required to read this document.

| Target | Current type / location | Notes |
|--------|-------------------------|--------|
| Season | `Season` in `types/season.ts` | Direct match |
| Week | Derived in `lib/plan-utils.ts` (`getWeekDays`, `shiftWeek`) | Not persisted; computed from `weekAnchor` |
| Day | Date string + `PlanDaySection` | Grouping by `PlanPhase.date` |
| Item | `PlanPhase` in `types/plan.ts` | One phase ≈ one Item |
| Item · Training | `PlanPhase.type === "training"` | + `TrainingSession` when executed |
| Item · Competition | Season `Competition` + `PlanPhase.type === "competition"` | Calendar from Season; phase links via `competitionPrepId` |
| Item · Recovery | `PlanPhase.type === "regeneration"` · `"activation"` | Activation folds into Recovery in target model |
| Item · Camp | *Not implemented* | New type for future sprints |
| Item · Rest | `PlanPhase.type === "rest"` | Direct match |

---

## Module boundaries

```
┌─────────────────────────────────────────────────────────┐
│  Season          goals, competitions, results           │
└──────────────────────────┬──────────────────────────────┘
                           │ competitions → Day
┌──────────────────────────▼──────────────────────────────┐
│  Plan (Week / Day / Item)    planning & week navigation │
└──────────────────────────┬──────────────────────────────┘
                           │ start training
┌──────────────────────────▼──────────────────────────────┐
│  Training / History      executed Training sessions     │
└──────────────────────────┬──────────────────────────────┘
                           │ aggregates
┌──────────────────────────▼──────────────────────────────┐
│  Statistics / Performance / Coach                       │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation rules (future sprints)

1. **New Plan features** add or edit **Items** on **Days** within a **Week**; never bypass the hierarchy.
2. **Competitions** remain authored in **Season**; Plan only displays and links them on the correct **Day**.
3. **Camp** must be introduced as a first-class Item type, not as a special-case Training title.
4. **Recovery** and **Rest** stay distinct — Recovery may include light work; Rest must not include series.
5. **Week navigation** changes the active Week view; all CRUD applies to Items on Days in that Week (any week editable).
6. **Mobile layout** (≥ 390px) must not assume desktop-only structures when rendering Week / Day / Item UI.

---

## Related documents

| Document | Purpose |
|----------|---------|
| [Product Vision](./PRODUCT_VISION.md) | Strategic context and principles |
| [Roadmap](./ROADMAP.md) | When data model migrations are scheduled |
| [Backlog](./BACKLOG.md) | Item-type and planner tickets |
| [UX Guidelines](./UX_GUIDELINES.md) | How Week / Day / Item appear in UI |
| [Coach Framework](./COACH_FRAMEWORK.md) | Engines that consume this model |
| [CHANGELOG.md](./CHANGELOG.md) | Schema and migration history |
| [ATLAS_SPEC.md](../ATLAS_SPEC.md) | Current field-level schemas |
