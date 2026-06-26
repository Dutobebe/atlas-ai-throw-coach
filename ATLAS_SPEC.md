# Atlas AI Throw Coach — Project Specification

## 1. Product goal

Atlas AI Throw Coach is a **mobile-first**, **local-first** training diary for athletics throwing disciplines. Athletes and coaches record training sessions offline in the browser, review history, and track throw volume and performance over time — without authentication or a backend.

Core principles:

- Fast one-hand data entry during training (~430px mobile width)
- Czech UI labels
- Data stored in `localStorage` only
- Dark, app-like UI with bottom navigation
- Clear separation between **Plán** (intended workload) and **Trénink** (actual workload)
- Throw statistics and **Výkony** include **only** `seriesType === "Throw"`

**Version:** v0.3.0 — see `CHANGELOG.md`

---

## 2. Current modules

| Module | Location | Responsibility |
|--------|----------|----------------|
| **App shell** | `app/page.tsx` | Tab routing, localStorage sync, Dashboard / History / Statistics / Profile |
| **Training module** | `components/training/TrainingModule.tsx` | Step-based training wizard + overview |
| **Training form (legacy)** | `components/training/TrainingForm.tsx` | Replaced by wizard; kept for reference |
| **Series card** | `components/training/TrainingSeriesCard.tsx` | Single série editor (discipline, implement, throws, notes) |
| **Implement selector** | `components/training/ImplementSelector.tsx` | Discipline-dependent nářadí picker |
| **RPE selector** | `components/training/RPESelector.tsx` | Session RPE (1–10) |
| **Bottom navigation** | `components/training/BottomNavigation.tsx` | Mobile tab bar |
| **Discipline stats table** | `components/statistics/DisciplineThrowsTable.tsx` | Počet hodů podle disciplíny |
| **Training utils** | `lib/training-utils.ts` | Types helpers, normalization, global statistics |
| **Implement options** | `lib/implement-options.ts` | Preset nářadí per discipline |
| **History display** | `lib/history-display.ts` | Discipline and implement summaries for History list |
| **Discipline throw stats** | `lib/discipline-throw-stats.ts` | Weekly / 30-day / yearly throw totals |
| **Plan module** | `components/plan/` | Weekly multi-phase training planner (Sprint 6.1) |
| **Dashboard** | `components/dashboard/` | Overview cards and quick actions |
| **Template picker** | `components/templates/TemplatePicker.tsx` | Apply training templates |
| **Technique library** | `lib/technique-library.ts` | Discipline technique abbreviations |
| **Goal library** | `lib/goal-library.ts` | Discipline + general series goals (Sprint 8) |
| **Series goal selector** | `components/training/SeriesGoalSelector.tsx` | Multi-select goal chips (1–3) |
| **Performance module** | `components/performance/PerformanceModule.tsx` | PR & season best (Sprint 9) |
| **Performance utils** | `lib/performance-utils.ts` | PR / season best calculation from sessions |
| **Active training** | `components/live/LiveTrainingScreen.tsx` | In-session tracking UI (**Aktivní trénink**) |
| **Training evaluation** | `components/evaluation/TrainingEvaluationScreen.tsx` | Post-training evaluation (Sprint 11) |
| **Season module** | `components/season/SeasonModule.tsx` | Season goals & competitions (Sprint 12) |
| **Season utils** | `lib/season-utils.ts` | Season/competition storage, next event, plan prep links |
| **Quick Capture** | `components/quick-capture/QuickCaptureScreen.tsx` | Fast single-series logging (Sprint 13) |
| **Quick Capture utils** | `lib/quick-capture-utils.ts` | Favourites, last series, append to daily session |
| **Coach Framework** | `lib/coach-framework.ts` | Rule-based coach analysis (v1) |
| **Templates** | `lib/template-utils.ts`, `lib/default-templates.ts` | Template storage and apply logic |

### App screens (tabs)

| Tab (Czech) | Key | In bottom nav | Purpose |
|-------------|-----|---------------|---------|
| Přehled | `dashboard` | Yes | Quick stats, recent sessions, start training |
| Plán | `plan` | Yes | Weekly multi-phase training plan |
| Sezóna | `season` | Yes | Season goals, competitions, prep linking |
| Trénink | `training` | Yes | New / edit training session |
| Rychlý zápis | `quickCapture` | No (opened from Přehled) | Quick single-series capture |
| Výkony | `performance` | Yes | PR and season best marks |
| Historie | `history` | Yes | Saved sessions list and detail |
| Statistiky | `statistics` | Yes | Aggregated throw statistics |
| Profil | `profile` | No (hidden from nav for now) | Athlete name, app info, clear data |

---

## 3. Training session data model

```typescript
interface TrainingSession {
  id: string;           // UUID
  date: string;         // ISO date YYYY-MM-DD
  title: string;
  location: string;
  weather: string;
  readiness: number;    // 0–100 (%)
  rpe: number;          // 1–10
  note: string;
  disciplines: string[];   // wizard step 2 — session-level discipline selection
  sessionType: PhaseType;  // wizard step 1 — typ tréninku (mirrors plan phase types)
  series: TrainingSeries[];
  createdAt: string;    // ISO timestamp
  createdFromPlanId?: string;  // UUID of source PlanPhase (Sprint 6.2)
  evaluation?: TrainingEvaluation;  // Sprint 11 — post-training self-evaluation
}

interface TrainingEvaluation {
  satisfaction: number;           // 1–5 stars
  goalAchieved: "yes" | "partly" | "no";
  techniqueQuality: "excellent" | "average" | "poor";
  fatigue: number;                // 1–5
  hasPain: boolean;
  painLocation: string;
  bestThing: string;
  focusNext: string;
  savedAt?: string;               // set when user saves evaluation
}
```

**Storage key:** `atlas-throw-coach-sessions`

**Session-level fields (Czech labels):**

| Field | Label |
|-------|-------|
| `date` | Datum |
| `title` | Název tréninku |
| `location` | Místo |
| `weather` | Počasí |
| `readiness` | Připravenost |
| `rpe` | RPE (1–10) |
| `note` | Poznámka k tréninku |
| `disciplines` | Disciplíny (wizard krok 2) |
| `sessionType` | Typ tréninku |
| `evaluation` | Vyhodnocení tréninku (volitelné) |

A session contains one or more **série** (never “blok”).

---

## 4. Series data model

```typescript
type SeriesType = "Throw" | "Imitation" | "Drill" | "Exercise";
type SeriesPurpose = "technique" | "speed" | "competition" | "warmup";

interface TrainingSeries {
  id: string;              // UUID
  seriesType: SeriesType;  // default: "Throw"
  discipline: string;
  technique: string;
  implementWeight: string;
  throwCount: number;      // hodů (Throw) or opakování (other types)
  bestThrow: string;       // Throw type only — nejdelší hod v metrech
  purpose: SeriesPurpose;
  note: string;
  intensityPercent?: number; // 0–100, default 80
  goals: string[];         // 1–3 labels from goal library
}
```

**Helper:** `isThrowSeries(series)` — `true` only when `seriesType === "Throw"`. Use this for all throw aggregations.

**Typ série options:**

| Value | Label | In throw stats | In Výkony |
|-------|-------|----------------|-----------|
| `Throw` | 🎯 Hod | Yes | Yes |
| `Imitation` | 🔄 Imitace (IMI) | No | No |
| `Drill` | ⚙️ Drill | No | No |
| `Exercise` | 🏋️ Cvičení | No | No |

**Účel options:** Technika · Rychlost · Soutěž · Rozcvička

**Disciplines:** Disk · Kladivo · Koule · Oštěp · Medicinbal · Posilovna · Kardio · Mobilita

### Critical field semantics

| Field | Meaning | Must NOT be confused with |
|-------|---------|---------------------------|
| `throwCount` | Number of throws performed | Distance, RPE, or best mark |
| `bestThrow` | Longest throw distance (m) | `throwCount`, implement weight, or number of series |

**Rule:** Never derive `bestThrow` from `throwCount`. They are independent inputs.

**Per-series UI stats (Throw type only):**

- **Hodů** = `throwCount`
- **Nejlepší** = parsed `bestThrow` (metres)
- Průměr is not calculated

Empty series (`throwCount === 0`) are ignored in aggregations.

---

## 5. Statistics rules

Statistics include **only series where `seriesType === "Throw"`** (`isThrowSeries()`).

Imitation, Drill, and Exercise series are **excluded** from throw volume and **Výkony**.

### Global statistics (Dashboard + Statistiky)

| Metric | Czech label | Calculation |
|--------|-------------|-------------|
| Total throws | Celkem hodů | Sum of `throwCount` across all Throw series (all sessions) |
| Session count | Počet tréninků / Tréninků | Number of saved sessions |
| Series count | Počet sérií / Sérií | Total series count (all types) |

**History list throw count:** Sum of `throwCount` for Throw series only (Imitation excluded).

### Discipline throw table (Statistiky)

Table: **Počet hodů podle disciplíny**

| Row | Disciplines |
|-----|-------------|
| 🥏 Disk | `disk` |
| 🔨 Kladivo | `kladivo` |
| ⚪ Koule | `koule` |
| 📊 Celkem | All Throw disciplines combined |

**Columns:**

| Column | Window |
|--------|--------|
| Tento týden | Current calendar week (Monday–Sunday) |
| Posledních 30 dní | Rolling 30-day window (today inclusive) |
| Letos | Current calendar year |

**Aggregation:** Sum `throwCount` per discipline per time window. Skip series with `throwCount <= 0`. Skip Imitation series.

### What is NOT counted in statistics

- Imitation series (`seriesType === "Imitation"`)
- Empty series (`throwCount === 0`)
- **Planned throws** from the Plan module (`atlas-plans`) — planning data only, not real training

---

## 8. Plan module (Sprint 6.1 + 6.2)

The Plan module stores **planned training phases** separately from completed training sessions. Plans help athletes prepare the week; they do not affect throw statistics until converted to a real session.

**Storage key:** `atlas-plans`  
**Legacy key (auto-migrated on load):** `atlas-training-plans`

### Plan phase data model

> **Naming:** Use **`PlanPhase`** and **`PlannedSeries`** — not “PlannedPhase”.

```typescript
type PhaseType = "training" | "rest" | "regeneration" | "competition" | "activation";
type PhaseStatus = "planned" | "started" | "completed" | "changed" | "skipped";

interface PlannedSeries {
  id: string;
  seriesType: SeriesType;   // Throw | Imitation | Drill | Exercise
  discipline: string;
  technique: string;
  implementWeight: string;
  throwCount: number;       // intended count — no bestThrow
  intensityPercent?: number;
  purpose: SeriesPurpose;
  note: string;
  goals: string[];
}

interface PlanPhase {
  id: string;
  date: string;              // ISO date YYYY-MM-DD
  title: string;
  type: PhaseType;
  disciplines: string[];
  plannedSeries: PlannedSeries[];  // planned workload (no bestThrow)
  goal: string;
  note: string;
  status: PhaseStatus;
  competitionPrepId?: string;  // Sprint 12 — link to Season competition prep
  lastTrainingId?: string;   // UUID of most recently created training from this phase
  createdAt: string;
}
```

**Phase type labels:** Trénink · Volno · Regenerace · Závod · Aktivace

**Phase status labels:** Plánováno · Zahájeno · Splněno · Změněno · Vynecháno

### Multi-phase day logic

- Weekly view shows **current calendar week** (Monday–Sunday) with Czech labels: Po, Út, St, Čt, Pá, So, Ne.
- Each day can contain **zero, one, or multiple** `PlanPhase` entries.
- Phases on the same day are ordered by `createdAt` and displayed as **Fáze 1**, **Fáze 2**, **Fáze 3**, …
- Empty days show **Bez plánu** and a **+ Přidat** button.
- Days with phases also show **+ Přidat** to append another phase.

### Planned series

Planned series use `PlannedSeries` — same workload fields as training except **no `bestThrow`** (plans record intent, not results):

- `seriesType`: Throw | Imitation | Drill | Exercise
- `discipline`, `technique`, `implementWeight`, `throwCount`, `intensityPercent`, `purpose`, `goals`, `note`

Planned `throwCount` values are **intent only** — they are displayed inside Plan and **must not** be summed into Dashboard or Statistiky.

### Status rules

| Status | Meaning | Badge color |
|--------|---------|-------------|
| `planned` | Default — scheduled but not yet started | Blue |
| `started` | Training created from this phase | Cyan |
| `completed` | Athlete marked phase as done | Green |
| `changed` | Plan was changed before/during execution | Orange |
| `skipped` | Phase was skipped | Gray |

Status `started` is set automatically when **▶ Zahájit trénink** converts a phase with status `planned`. Other statuses are set manually from phase detail.

### Phase actions

- Create, edit, delete, duplicate a phase
- Mark as Splněno / Vynecháno / Změněno
- Change disciplines and add/remove series before training
- **▶ Zahájit trénink** — converts phase to a real training session (Sprint 6.2)

### Sprint 6.2 — Plan to Training conversion

Clicking **▶ Zahájit trénink** on a phase:

1. Creates a new `TrainingSession` (independent copy)
2. Copies: `title`, `date`, `note`, and every `plannedSeries` entry
3. Each planned series becomes a normal editable training series with **new UUIDs** (deep copy)
4. Sets `TrainingSession.createdFromPlanId = phase.id`
5. Sets `PlanPhase.lastTrainingId = session.id`
6. Changes phase status from `planned` → `started` (only when current status is `planned`)
7. Opens the new session in the Trénink tab for editing

**Independence rule:** After creation, the training and plan are fully independent. Editing the training does not modify the plan. Editing the plan does not modify the training.

**History badge:** Sessions with `createdFromPlanId` show **📅 From Plan** in Historie list and detail.

**Not implemented yet:** Plan vs training comparison UI.

---

## 9. Technique library, intensity & templates (Sprint 7.1)

### Technique abbreviations

Stored in `lib/technique-library.ts`. New entries use abbreviations; legacy free-text values are preserved on load.

**Disk**

| Code | Meaning |
|------|---------|
| ST | z místa |
| SA | South African |
| HT | poloviční otočka |
| FT | plná otočka |
| PO | punchout |

**Koule**

| Code | Meaning |
|------|---------|
| PO | punchout |
| ST | z místa |
| HT | poloviční otočka |
| FT | otočka |
| GT | sun / glide turn |

**Kladivo**

Swing/turn combinations (nášvihy/otočky): `2/1`, `2/2`, `2/3`, `2/4`, `3/1`, `3/2`, `3/3`, `3/4`

Display format: `ST — z místa` (disk/koule), `2/2 (nášvihy/otočky)` (kladivo).

Used in: Trénink wizard, Plán form, Historie, Plán detail, šablony.

### Intensity percentage

Field: **Intenzita (%)** — `intensityPercent`

| Rule | Value |
|------|-------|
| Type | Integer 0–100 |
| Default | 80 (when missing on old data) |
| Storage | `intensityPercent` on `TrainingSeries` |
| Display | Series cards, plan detail, history |

### Training template model

**Storage key:** `atlas-training-templates`

```typescript
interface TrainingTemplate {
  id: string;
  name: string;
  description: string;
  phases: TemplatePhase[];
  createdAt: string;
  updatedAt: string;
}

interface TemplatePhase {
  title: string;
  type: PhaseType;
  disciplines: string[];
  plannedSeries: TemplateSeries[];
}

interface TemplateSeries {
  seriesType: SeriesType;
  discipline: string;
  technique: string;       // abbreviation code
  implementWeight: string;
  throwCount: number;
  intensityPercent: number;
  purpose: SeriesPurpose;
  note: string;
  goals?: string[];
}
```

### Built-in templates

1. Kladivo + Disk – technika  
2. Disk – technika  
3. Disk – závodní příprava  
4. Kladivo – technika  
5. Koule – technika  
6. Aktivace před závodem  
7. Regenerace  

### Template usage

- **Použít šablonu** button in Trénink and Plán (phase form)
- Selecting a template **appends** all series from all template phases to the current draft
- Title / goal filled from template when empty
- User can edit everything after insert
- Template series get new UUIDs when applied — independent copies

---

## 10. Goal library (Sprint 8)

Reusable **Cíl série** multi-select for both `TrainingSeries` and `PlannedSeries`.

**Library:** `lib/goal-library.ts`  
**UI:** `components/training/SeriesGoalSelector.tsx` (chips, not dropdown)  
**Display:** `components/training/SeriesGoalsDisplay.tsx` in Trénink, Plán detail, Historie detail

### Field

```typescript
goals: string[];  // up to 3 Czech labels from the goal library
```

| Rule | Value |
|------|-------|
| Min / max selection | 1–3 goals (0 allowed on save — optional field) |
| UI control | Toggle chips (`plan-chip` style) |
| On discipline change | Invalid goals for new discipline are removed |
| On load | `normalizeSeriesGoals()` filters unknown labels, dedupes, caps at 3 |
| Statistics | Not aggregated yet |

### Goal lists

**Disk:** Rytmus · Levá noha · Pravá ruka · Rotace · Blok · Výstup · Směr · Punchout · Rychlost · Uvolnění

**Kladivo:** Dlouhé ruce · Přechod na paty · Osa · Cupitání · Trpělivost · Zrychlení · Výstup · Rovnováha · Nízké paty

**Koule:** Blok · Punch · Výjezd · Dokrok · Rotace · Rychlost · Směr

**Oštěp:** Rozběh · Blok · Hodová paže · Přenos · Výhoz

**General** (all disciplines): Rozcvičení · Regenerace · Síla · Rychlost · Stabilita

Disciplines without a specific list (medicinbal, posilovna, kardio, mobilita) show **General** goals only.

Plan → Training conversion copies `goals` into the new session series.

---

## 11. Performance module (Sprint 9)

Tab: **🏆 Výkony** (`performance`)

**Component:** `components/performance/PerformanceModule.tsx`  
**Logic:** `lib/performance-utils.ts`

Data is **computed from saved sessions** in `atlas-throw-coach-sessions` — no separate localStorage key.

### Grouping

Each row = unique combination of:

| Field | Source |
|-------|--------|
| Disciplína | `series.discipline` |
| Nářadí | `series.implementWeight` |
| Technika | `series.technique` |

### Metrics per group

| Metric | Czech label | Calculation |
|--------|-------------|-------------|
| PR | PR | All-time best `bestThrow` (parsed metres) across Throw series |
| Season best | Sezónní nej. | Best `bestThrow` in selected calendar year |
| Date | (under each metric) | Session `date` when that mark was recorded |

Tie-break: same distance → earlier session date wins.

### Eligibility

**Included:** `seriesType === "Throw"` with a valid `bestThrow` > 0

**Excluded:** all non-Throw types (`Imitation`, `Drill`, `Exercise`) — use `!isThrowSeries(series)`

### Filters

| Filter | Options |
|--------|---------|
| Disciplína | Vše + disciplines present in data |
| Nářadí | Vše + implements present in data |
| Technika | Vše + techniques present in data |
| Rok | Calendar years from sessions (default: current year) — controls **Sezónní nej.** column |

PR is always all-time; year filter only affects season best.

---

## 12. Series type rules

### Throw (`seriesType === "Throw"`)

- Counted in **Hodů**, **Statistiky**, and **Výkony**
- Shows nářadí selector and **Nejdelší hod (m)**
- Default for new series

### Non-throw types (`Imitation`, `Drill`, `Exercise`)

| Type | Badge | Throw stats | Výkony | bestThrow |
|------|-------|-------------|--------|-----------|
| Imitation | 🔄 IMI | No | No | Hidden |
| Drill | ⚙️ Drill | No | No | Hidden |
| Exercise | 🏋️ Cvičení | No | No | Hidden |

All non-throw types are saved, visible in **Historie** and **Trénink**, and use **Počet opakování** instead of **Hody / počet** in forms.

### Imitation specifics

```typescript
seriesType === "Imitation"
```

Legacy migration: if `implementWeight === "IMI"` and `seriesType` is missing, treat as Imitation on load.

| Behavior | Detail |
|----------|--------|
| `implementWeight` | Auto-set to `"IMI"` |
| Nářadí selector | Hidden |

### When switching Typ série

- **→ Imitation:** set `implementWeight = "IMI"`, clear `bestThrow`
- **→ Throw / Drill / Exercise:** restore nářadí from discipline presets where applicable; clear `bestThrow` unless Throw

### Default

New series default to `seriesType: "Throw"`.

**Component:** `SeriesTypeBadge` — shown in Historie, Plán detail, Live trénink for non-Throw types.

---

## 13. UI terminology rules

### Always use

| Concept | Correct term (Czech) | Notes |
|---------|----------------------|-------|
| Training unit | **Série** | Never use “Blok” |
| Session | **Trénink** | |
| Throw count field | **Hody / počet** | Integer count, not distances |
| Longest throw field | **Nejdelší hod (m)** | Distance in metres |
| Equipment | **Nářadí** | Not “Hmotnost nástroje” |
| Imitation badge | **🔄 IMI** | Blue badge in History |
| Plan unit | **Fáze** | Multiple per day allowed |
| Intensity field | **Intenzita (%)** | 0–100, default 80 |
| Series goals | **Cíl série** | 1–3 chips from goal library |
| Technique | Abbreviation codes | See technique library |

### Navigation labels

Přehled · 📅 Plán · Trénink · 🏆 Výkony · Historie · Statistiky

### Design constraints

- **Mobile-first** layout (~430px max width)
- **Dark theme** (dark blue/black background)
- Large cards and buttons for one-hand use
- Bottom navigation (native app pattern)
- Dashboard and History **must remain mobile-first** in all future changes

### Discipline icons (History & stats)

| Discipline | Icon |
|------------|------|
| Disk | 🥏 |
| Kladivo | 🔨 |
| Koule | ⚪ |
| Oštěp | 🏹 |
| Medicinbal | 🏀 |
| Posilovna | 💪 |
| Kardio | 🏃 |
| Mobilita | 🤸 |

---

## 13.5 Training session workflow (MVP v0.4-test)

**Wizard:** `components/training/TrainingModule.tsx`  
**Active training:** `components/live/LiveTrainingScreen.tsx` (UI label **Aktivní trénink**)  
**Test checklist:** [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

### Entry flow (MVP)

**Začít trénink** (Dashboard) and **Trénink** tab (+ nav) open the wizard directly at step 1 — never an empty screen.

Step 1 (**Nový trénink**): datum, název, typ tréninku, disciplíny → **Pokračovat**

| Step | Label | Content |
|------|-------|---------|
| 1 | Základ | Date, title, type, disciplines |
| 2 | Série | Series cards; **+ Přidat první sérii** when empty |
| 3 | Souhrn | Throw totals, series count |
| 4 | Vyhodnocení | Embedded evaluation → Historie |

**← Zpět** on every step. Bottom navigation always visible (except evaluation/quick capture full-screen).

Plán **▶ Zahájit trénink** → **Aktivní trénink** (in-session tracking).

Save persists to `atlas-throw-coach-sessions` → Historie, Statistiky, Výkony.

---

## 14. Active Training Mode (Sprint 10)

Formerly “Live Training”. UI label: **Aktivní trénink**. Internal tab id: `live`.

**Component:** `components/live/LiveTrainingScreen.tsx`  
**Header:** `components/live/ActiveTrainingHeader.tsx`  
**Utils:** `lib/live-training-utils.ts`

**Storage key (draft state):** `atlas-live-training`

---

## 15. Training evaluation (Sprint 11)

After saving a session (live or classic form), app opens **Vyhodnocení tréninku**.

**Component:** `components/evaluation/TrainingEvaluationScreen.tsx`  
**Utils:** `lib/evaluation-utils.ts`

Evaluation is stored on `TrainingSession.evaluation` in `atlas-throw-coach-sessions`.

### Fields (Czech UI)

| Field | Type | Options |
|-------|------|---------|
| Celková spokojenost | 1–5 stars | — |
| Cíl splněn | chips | Ano · Částečně · Ne |
| Kvalita techniky | chips | Výborná · Průměrná · Slabá |
| Únava | slider | 1–5 |
| Bolest | chips + text | Ne · Ano + Místo |
| Největší plus dneška | textarea | — |
| Zaměření na příští trénink | textarea | — |

Saved when user taps **Uložit hodnocení** (`savedAt` timestamp set). **Později** skips without saving.

### History badges

| State | Badge |
|-------|-------|
| Evaluated | ✓ Vyhodnoceno |
| Not evaluated | ○ Bez hodnocení |

**Statistics:** Evaluation data does **not** affect throw statistics or performance metrics.

---

## 16. Season & Competition module (Sprint 12)

**Tab:** 🏆 **Sezóna** (`season`) — bottom navigation  
**Component:** `components/season/SeasonModule.tsx`  
**Utils:** `lib/season-utils.ts`  
**Storage key:** `atlas-seasons`

No backend — all data in `localStorage`. Legacy `atlas-next-competition` is migrated once on first load.

### Season data model

```typescript
interface Season {
  year: number;
  mainGoal: string;
  secondaryGoals: string[];   // one goal per line in UI
  competitions: Competition[];
}

interface Competition {
  id: string;
  date: string;             // YYYY-MM-DD
  name: string;
  location: string;
  disciplines: string[];
  targetPerformance: string;
  notes: string;
  status: "planned" | "completed";
}
```

Multiple seasons stored as `Season[]` keyed by `year`.

### Season module UI

- Year selector (‹ / ›)
- Main season goal (textarea)
- Secondary goals (textarea, one per line)
- Competition list (sorted by date) with add / edit / delete
- Competition form: date, name, location, discipline chips, target performance, status, notes

### Dashboard integration

`NextEventCard` shows the **next planned competition** (status `planned`, date ≥ today) with **countdown** (`Za N dní`, `Zítra`, `Dnes`). Tap opens **Sezóna** tab. Empty state links to season management.

### Plan integration

`PlanPhase.competitionPrepId?: string` links a plan phase to a planned competition.  
Phase form select **Příprava na závod**; week view and phase detail show 🏆 prep badge.

---

## 17. Quick Capture (Sprint 13)

**Entry:** ⚡ **Rychlý zápis** button on Dashboard (Today card)  
**Screen:** `components/quick-capture/QuickCaptureScreen.tsx`  
**Utils:** `lib/quick-capture-utils.ts`  
**Favourites storage key:** `atlas-quick-capture-favourites`

Minimal two-tap workflow: tap an **oblíbená série** shortcut → **Uložit sérii**. Best throw is optional so save works without extra fields.

Classic **Trénink** wizard and Live mode are unchanged aside from the wizard UX above.

### Quick Capture fields

| Field | Notes |
|-------|-------|
| Disciplína | Chip selector |
| Technika | Shared `TechniqueSelector` |
| Nářadí | Shared `ImplementSelector` |
| Hody / počet | Required for save |
| Nejdelší hod | Optional |
| Intenzita | 0–100 % |

### Actions

| Action | Behaviour |
|--------|-----------|
| **Použít poslední sérii** | Copies discipline, technique, implement, intensity, throwCount from the most recent Throw series in history |
| **Oblíbené série** | Up to 6 pinned shortcuts (large buttons); tap fills form |
| **⭐ Přidat do oblíbených** | Pins current form values (without best throw) |
| **Uložit sérii** | Appends to today’s session titled **Rychlý zápis** (creates if missing); skips evaluation flow |

Sessions from Quick Capture use default readiness/RPE and appear in Historie / Statistiky like any other training.

---

## 18. Core stabilization (Sprint 14) — v0.3.0

**Goal:** Stabilize data models and statistics before new features.

### Data model summary

| Entity | Storage key | Purpose |
|--------|-------------|---------|
| `TrainingSession` | `atlas-throw-coach-sessions` | Actual completed **Trénink** |
| `TrainingSeries` | (within session) | Actual série — may include `bestThrow` |
| `PlanPhase` | `atlas-plans` | Planned day phase in **Plán** |
| `PlannedSeries` | (within phase) | Intended workload — **no `bestThrow`** |
| `TrainingTemplate` | `atlas-training-templates` | Reusable plan templates |
| `Season` / `Competition` | `atlas-seasons` | Season goals and competitions |
| `FavouriteSeries` | `atlas-quick-capture-favourites` | Quick Capture shortcuts |

### Statistics rule (single source of truth)

```typescript
import { isThrowSeries } from "@/lib/training-utils";
// Only isThrowSeries(series) === true counts toward Hodů, Statistiky, Výkony
```

### Terminology (Czech UI)

| Use | Do not use |
|-----|------------|
| Série | Blok |
| Plán | — |
| Trénink | — |
| Výkony | — |

Technique goal labels like “Blok” in the goal library refer to **throwing technique focus**, not the training unit name.

### Verified screens

Přehled · Plán · Sezóna · Trénink · Rychlý zápis · Aktivní trénink · Vyhodnocení · Historie · Statistiky · Výkony

See `CHANGELOG.md` for release notes.

---

## 19. Coach Framework v1

**Doc:** [docs/COACH_FRAMEWORK.md](docs/COACH_FRAMEWORK.md) (framework spec) · `COACH_FRAMEWORK.md` (implementation pillars)  
**Engine:** `lib/coach-framework.ts`  
**Types:** `types/coach-framework.ts`  
**UI:** `components/dashboard/AICoachCard.tsx` on **Přehled**

Local rule-based coach (no backend, no LLM in v1). Analyses sessions, plan phases, and season data.

### Ten pillars

| # | Pilíř | Data source |
|---|-------|-------------|
| 1 | Cíl sezóny | `Season.mainGoal` |
| 2 | Fáze přípravy | `Competition`, `competitionPrepId` |
| 3 | Týdenní cíle | `PlanPhase.goal` (current week) |
| 4 | Kombinace disciplín | Weekly throw mix |
| 5 | Typy tréninku | Phase types, series purpose |
| 6 | Objem a intenzita | Weekly throws vs 4-week avg, intensity |
| 7 | Load score | Composite 0–100 score |
| 8 | Adaptace | Load + evaluation fatigue |
| 9 | Pravidla rozhodování | Priority rule engine |
| 10 | Vysvětlení doporučení | `explanation` on each recommendation |

### Dashboard display

- Load score + level badge
- Current prep phase label
- Season goal (if set)
- Top recommendation + **Proč?** explanation toggle

---

## Appendix: Storage & development

| Key | Content |
|-----|---------|
| `atlas-throw-coach-sessions` | `TrainingSession[]` JSON |
| `atlas-live-training` | Active live session meta JSON |
| `atlas-plans` | `PlanPhase[]` JSON |
| `atlas-seasons` | `Season[]` JSON |
| `atlas-quick-capture-favourites` | `FavouriteSeries[]` JSON (max 6) |
| `atlas-training-templates` | `TrainingTemplate[]` JSON |
| `atlas-throw-coach-profile` | Athlete display name |

**Dev note:** Run only one `npm run dev` instance on port 3000. After build/cache issues, delete `.next` or use `npm run dev:clean`.
