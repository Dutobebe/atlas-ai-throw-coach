# Atlas Design System

Visual and UX rules for **Atlas AI Throw Coach**. Implementation helpers live in `lib/design.ts`.

---

## 1. Core principles

| Principle | Meaning |
|-----------|---------|
| **Mobile first** | Layout optimised for ~430px width; desktop is not a separate target |
| **One-hand use** | Large tap targets, bottom navigation, sticky header |
| **Dark theme** | Dark blue/black surfaces, light text, accent highlights |
| **Large cards** | Content grouped in rounded cards with clear hierarchy |
| **Minimal text** | Short Czech labels; numbers and icons over paragraphs |
| **Training-first UX** | Fast entry during training; stats and history are secondary views |

---

## 2. Discipline colors and icons

Use `getDisciplineIcon()` and `getDisciplineColor()` from `lib/design.ts`.

| Discipline | Icon | Color |
|------------|------|-------|
| Disk | 🥏 | Blue `#3b82f6` |
| Kladivo | 🔨 | Orange `#f97316` |
| Koule | ⚪ | Green `#22c55e` |
| Oštěp | 🏹 | Red `#ef4444` |
| Medicinbal | 🏀 | Purple `#a855f7` |
| Posilovna | 💪 | Slate `#64748b` |
| Kardio | 🏃 | Cyan `#06b6d4` |
| Mobilita | 🤸 | Lime `#84cc16` |

**Component:** `DisciplineBadge` — icon ± label with discipline tint.

---

## 3. Intensity colors

Use `getIntensityColor(percent)` from `lib/design.ts`.

| Range | Color |
|-------|-------|
| 0–60 % | Green `#22c55e` |
| 61–80 % | Yellow `#eab308` |
| 81–90 % | Orange `#f97316` |
| 91–100 % | Red `#ef4444` |

**Component:** `IntensityBadge` — coloured pill with `{value} %`.

---

## 4. Plan status colors

Use `getStatusColor(status)` from `lib/design.ts`.

| Status | Color | Usage |
|--------|-------|-------|
| `planned` | Gray `#94a3b8` | Phase not yet started |
| `today` | Yellow `#eab308` | Current day highlight in weekly planner |
| `started` | Blue `#3b82f6` | Training created from phase |
| `completed` | Green `#22c55e` | Phase marked done |
| `changed` | Orange `#f97316` | Plan modified |
| `skipped` | Red `#ef4444` | Phase skipped |

**Component:** `StatusBadge` — used by `PhaseStatusBadge` for plan phases.

---

## 5. Component rules

### SummaryCards
- **Path:** `components/common/SummaryCards.tsx`
- Three `StatCard`s in one row: **Hodů**, **Sérií**, **Tréninků**
- Grid: `repeat(3, minmax(0, 1fr))`, gap `12px`, never wrap
- Used on **Přehled** and **Statistiky**

### StatCard
- **Path:** `components/common/StatCard.tsx`
- Value: **36px**, label: **13px**
- Rounded corners: `var(--radius)` (16px)

### SectionCard
- **Path:** `components/common/SectionCard.tsx`
- Standard content container; same radius and padding as legacy `.card`
- Used for dashboard sections, statistics blocks, plan day cards

### SectionTitle
- **Path:** `components/common/SectionTitle.tsx`
- Section heading inside `SectionCard`

### BottomNavigation
- **Path:** `components/training/BottomNavigation.tsx`
- Fixed bottom bar; max width 430px
- Tabs: Přehled · Plán · Sezóna · Trénink · Výkony · Historie · Statistiky

### SeriesTypeBadge
- **Path:** `components/common/SeriesTypeBadge.tsx`
- Shown for non-Throw series types in Historie, Plán detail, Live trénink
- Colours: IMI (blue), Drill (orange), Exercise (purple)

### TrainingSeriesCard
- **Path:** `components/training/TrainingSeriesCard.tsx`
- Full série editor for completed training
- Uses `IntensityBadge`, technique/implement selectors

### PlanDayCard
- **Path:** `components/plan/PlanDayCard.tsx`
- One day in weekly planner; `SectionCard` with yellow border when `today`

### StatusBadge
- **Path:** `components/common/StatusBadge.tsx`
- Plan phase status pill; colours from `getStatusColor()`

### IntensityBadge
- **Path:** `components/common/IntensityBadge.tsx`
- Intensity percentage pill; colour from `getIntensityColor()`

### DisciplineBadge
- **Path:** `components/common/DisciplineBadge.tsx`
- Discipline icon/label with discipline colour tint

---

## 6. Terminology rules

### Always use

| Term | Context |
|------|---------|
| **Přehled** | Dashboard tab |
| **Plán** | Weekly training plan |
| **Trénink** | Training session |
| **Série** | Single series within a session (never “Blok”) |
| **Historie** | Saved sessions list |
| **Statistiky** | Throw volume statistics |
| **Výkony** | Personal records and season bests |
| **Sezóna** | Season goals and competitions |

### Series types (data)

| Type | UI badge | Counts as throw |
|------|----------|-----------------|
| Throw | (none) | Yes |
| Imitation | 🔄 IMI | No |
| Drill | ⚙️ Drill | No |
| Exercise | 🏋️ Cvičení | No |

Use `isThrowSeries()` from `lib/training-utils.ts` in all aggregations.

### Do not use

- **Blok** as a training unit name — use **Série** instead  
  (Technique goal chip “Blok” in goal library is OK — it describes technique focus)

---

## 7. Design tokens (CSS)

Defined in `app/globals.css`:

| Token | Value |
|-------|-------|
| `--radius` | 16px |
| `--radius-sm` | 12px |
| `--bg-primary` | `#060b14` |
| `--bg-card` | `#111c32` |
| `--accent` | `#3b82f6` |
| `--text-primary` | `#f0f4fc` |

All shared cards (`SectionCard`, `StatCard`) use `--radius` for consistent corners.

---

## 8. Code reference

```typescript
import {
  getDisciplineIcon,
  getDisciplineColor,
  getIntensityColor,
  getStatusColor,
} from "@/lib/design";
```

See also `ATLAS_SPEC.md` for data models and module behaviour.

**Version:** v0.3.0 — see `CHANGELOG.md`
