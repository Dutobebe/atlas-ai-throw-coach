# Atlas Coach Framework

Atlas is a **decision support system**, not only a training diary. It records what happened, but its primary value is helping athletes and coaches decide **what to do next** — in the week, in the day, and in the session — based on season context, load, and throwing-specific rules.

The coach engine works in **two layers**:

| Layer | Horizon | Question it answers |
|-------|---------|---------------------|
| **1. Planning Engine** | Week · phase · season | *What should the training week look like?* |
| **2. Daily Coach Engine** | Today · this session | *What should today’s training be, given the plan and current load?* |

### Planning Engine

Uses **Sezóna** (season goal, competitions), **Plán** (phases, planned series, prep links), and rolling volume/intensity trends.

Responsibilities:

- Set weekly goals aligned with prep phase (general → specific → competition week)
- Propose discipline combinations and session order for the week
- Assign training types to days (technique, strength, performance, regeneration, …)
- Flag overload before it appears in daily training

**Data sources:** `Season`, `PlanPhase`, `PlannedSeries`, 4-week throw history, competition calendar.

### Daily Coach Engine

Uses today’s plan, recent sessions, load score, and last evaluation.

Responsibilities:

- Confirm or adapt today’s planned work
- Recommend discipline order within a session
- Suggest training type adjustments (e.g. downgrade performance → technique when load is high)
- Explain every recommendation (pillar 10)

**Data sources:** today’s `PlanPhase`, last 7 days of `TrainingSession`, `TrainingEvaluation`, load score.

**Implementation (v1):** `lib/coach-framework.ts` — Daily Coach Engine rules; Planning Engine rules expand in future sprints.

---

## Discipline Combination Rules

Discipline keys in Atlas: **disk** (discus), **kladivo** (hammer), **koule** (shot).

Rules apply to **Throw** series only. Imitation, Drill, and Exercise do not count toward throw-load between disciplines but may appear in the same session.

General principles:

- **Freshness first:** the discipline that needs the highest neural demand or the day’s primary focus goes first.
- **Split when:** total throw count would exceed ~24–30 competition-weight throws combined, load score is high, or technique quality dropped in the last combined session.
- **Avoid when:** competition within 48 h (except activation), acute pain, or two full-performance days back-to-back for both disciplines.

---

### Hammer / Discus (kladivo → disk)

| Aspect | Rule |
|--------|------|
| **When to use** | General and specific prep; multi-throw athletes; shared rotational themes (entry, orbit, separation). |
| **Preferred order** | **Hammer first**, then discus — hammer demands more timing and balance; discus benefits from warmed-up rotation without hammer-level fatigue. |
| **When to split into two phases** | Weekly throw target > 20 per discipline; hammer implements ≥ competition weight; discus full-stand series planned; load score ≥ 60. |
| **When to avoid** | Discus competition within 3 days (protect discus rhythm); lower-back or plant-leg issues; prior session RPE ≥ 9. |

---

### Discus / Hammer (disk → kladivo)

| Aspect | Rule |
|--------|------|
| **When to use** | Discus-primary blocks in season; using hammer as rotational primer at sub-max load; early-week technique emphasis on discus. |
| **Preferred order** | **Discus first**, then hammer — prioritises discus technique when discus is the weekly focus; hammer follows as secondary volume. |
| **When to split into two phases** | Discus is primary competition focus this month; hammer throw count would exceed 15 after discus; different implement progressions in same day. |
| **When to avoid** | Hammer competition week; discus already at high volume alone; athlete reports rotation confusion between planes (split days for pattern clarity). |

---

### Hammer / Shot (kladivo → koule)

| Aspect | Rule |
|--------|------|
| **When to use** | Strength–speed blocks; athletes combining rotational and linear work; general prep when shot volume is moderate. |
| **Preferred order** | **Hammer first**, then shot — rotational work first while hips and balance are fresh; shot as shorter, linear block after. |
| **When to split into two phases** | Combined throws > 25; shot uses full competition weight with full throws; hammer uses competition weight; different facility areas needed. |
| **When to avoid** | Shot competition within 5 days; shoulder or elbow overload; same-day max-effort in both (pick one performance discipline). |

---

### Shot / Hammer (koule → kladivo)

| Aspect | Rule |
|--------|------|
| **When to use** | Shot-primary phases; using hammer imitations or light hammer after shot technique; early session linear → rotational progression. |
| **Preferred order** | **Shot first**, then hammer — protects shot glide/s spin timing when shot is the priority; hammer added at reduced intensity. |
| **When to split into two phases** | Shot is season main goal; hammer would add > 12 full throws; load score ≥ 55 after shot block alone. |
| **When to avoid** | Hammer competition approaching; wrist/ finger fatigue from shot; combining two performance-intent sessions in one day. |

---

### Discus / Shot (disk → koule)

| Aspect | Rule |
|--------|------|
| **When to use** | Common double for throwers; shared leg drive themes; general prep and technique days. |
| **Preferred order** | **Discus first**, then shot — discus needs more setup and ring time; shot block is shorter and fits after discus warm-up. |
| **When to split into two phases** | Total throws > 28; both at competition implement; different technical focus (full vs stand discus + full shot). |
| **When to avoid** | Either discipline in competition week; low readiness (< 50 %); back-to-back performance sessions scheduled next day. |

---

### Shot / Discus (koule → disk)

| Aspect | Rule |
|--------|------|
| **When to use** | Shot-primary weeks; discus as secondary maintenance; activation-style discus after shot drills. |
| **Preferred order** | **Shot first**, then discus — shot focus preserved when fresh; discus at technique or reduced implement after. |
| **When to split into two phases** | Shot volume already high in week; discus needs full-stand work; load or fatigue elevated. |
| **When to avoid** | Discus competition within 4 days; combining max discus throws after heavy shot block; technique breakdown in either discipline last session. |

---

## Training Type Decision Rules

Framework training types map to Atlas as follows:

| Framework type | Atlas mapping |
|----------------|---------------|
| Technique | `purpose: technique` · phase type `training` |
| Strength | `discipline: posilovna` · low throw volume |
| Performance | `purpose: speed` or `competition` · high intent |
| Activation | `phase.type: activation` · short, sharp |
| Regeneration | `phase.type: regeneration` · recovery focus |
| Competition | `phase.type: competition` · meet simulation |

Intensity = `intensityPercent` (0–100). Volume = throw count per session (Throw series only) unless noted.

---

### Technique

| Aspect | Rule |
|--------|------|
| **Intensity range** | 55–75 % |
| **Volume range** | 12–24 throws (discus/hammer); 15–30 (shot); can exceed with stand/short-implement work |
| **Suitable techniques** | Full technique at sub-max implement; stand throws; half-turn / south-african (discus); winds (hammer); glide progression (shot) |
| **When to use** | Early week; after regeneration; when load score ≤ 55; when last evaluation technique quality was “average” or “poor”; far from competition (> 14 days) |

---

### Strength

| Aspect | Rule |
|--------|------|
| **Intensity range** | N/A for throws (gym RPE 6–8); throw series if any: 40–60 % |
| **Volume range** | 0–8 supplementary throws; primary work in posilovna / medicinbal |
| **Suitable techniques** | Olympic lifts variants, throws-specific pulls, med-ball; optional imitation series |
| **When to use** | General prep; 2–3× per week max; not day before competition; when throw load score already ≥ 65 (prefer strength without added throw volume) |

---

### Performance

| Aspect | Rule |
|--------|------|
| **Intensity range** | 80–95 % |
| **Volume range** | 8–18 throws at competition or near-competition implement |
| **Suitable techniques** | Full technique; competition implement; limited drill count; focus on best throw |
| **When to use** | Specific prep; 7–21 days to competition; load score moderate (35–65); after technique day; not after regeneration day only |

---

### Activation

| Aspect | Rule |
|--------|------|
| **Intensity range** | 70–85 % (sharp, not fatiguing) |
| **Volume range** | 4–10 throws; 1–2 series |
| **Suitable techniques** | Stand throws; 1–2 full throws; short imitations; no new technical experiments |
| **When to use** | 1–3 days before competition; day after light rest; competition week; when readiness ≥ 70 % and load score ≤ 45 |

---

### Regeneration

| Aspect | Rule |
|--------|------|
| **Intensity range** | 30–50 % |
| **Volume range** | 0–12 throws OR none (mobilita / kardio only) |
| **Suitable techniques** | Stand throws; light implement; imitation; mobilita work |
| **When to use** | Load score ≥ 70; evaluation fatigue ≥ 4; volume spike week; day after competition; planned rest day with optional movement |

---

### Competition

| Aspect | Rule |
|--------|------|
| **Intensity range** | 90–100 % |
| **Volume range** | 3–6 throws (meet) or 6–12 (simulation session) |
| **Suitable techniques** | Competition protocol only; no learning new patterns |
| **When to use** | Meet day; scheduled `Competition` phase; linked to `Season.competitions`; never stacked with performance session same day |

---

## Decision flow (summary)

```
Season goal + competition calendar
        ↓
Planning Engine → weekly plan (disciplines, types, volume)
        ↓
Daily Coach Engine → today (order, type tweak, load check)
        ↓
Recommendation + explanation (Proč?)
```

---

## Related documents

| Document | Content |
|----------|---------|
| `COACH_FRAMEWORK.md` (root) | v1 implementation pillars, load score, API |
| `lib/coach-framework.ts` | Daily Coach Engine (current code) |
| `ATLAS_SPEC.md` §19 | App integration |
