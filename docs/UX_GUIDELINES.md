# Atlas — UX Guidelines

> **Status:** Draft · **Last updated:** _TBD_  
> **Related:** [Product Vision](./PRODUCT_VISION.md) · [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) · [DATA_MODEL.md](./DATA_MODEL.md)

## Table of contents

- [Design goals](#design-goals)
- [Layout & breakpoints](#layout--breakpoints)
- [Navigation](#navigation)
- [Language & copy](#language--copy)
- [Planning UX (Plán)](#planning-ux-plán)
- [Training UX (Trénink)](#training-ux-trénink)
- [Feedback & states](#feedback--states)
- [Accessibility](#accessibility)
- [Theming](#theming)
- [Anti-patterns](#anti-patterns)
- [Related documents](#related-documents)

---

## Design goals

| Goal | Guideline |
|------|-----------|
| **Train with one hand** | Primary actions in thumb reach; bottom nav |
| **Minimal friction** | Fewest taps to log a series; sensible defaults |
| **Scan, don't read** | Cards, badges, numbers — short Czech labels |
| **Trust the data** | Clear planned vs completed states |
| **No surprise loss** | Confirm destructive actions; preserve localStorage |

Visual tokens and discipline colours: [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).

---

## Layout & breakpoints

### Primary target

- **Width:** 390px minimum (iPhone 12/13/14 class devices)
- **Shell:** ~430px max content width centred on larger screens
- **Rule:** No horizontal scrolling on Plan, Training, or Dashboard

### Spacing & touch

| Element | Minimum |
|---------|---------|
| Tap target | 44 × 44 px |
| Card padding | _TBD — follow CSS tokens_ |
| Bottom nav clearance | Safe area inset respected |

### Placeholder — responsive checklist

- [ ] Plan week strip fits 7 columns at 390px
- [ ] Training wizard steps scroll vertically only
- [ ] Statistics tables stack on narrow screens
- [ ] Modals and sheets use full viewport height

---

## Navigation

### Bottom tab bar

Primary modules only — see [ATLAS_SPEC.md](../ATLAS_SPEC.md) § App screens.

| Tab | Key | Entry pattern |
|-----|-----|---------------|
| Přehled | `dashboard` | Default home |
| Plán | `plan` | Week planner |
| Sezóna | `season` | Season & competitions |
| Trénink | `training` | Wizard / overview |
| _…_ | _TBD_ | _See spec_ |

### Secondary flows

- **Rychlý zápis** — opened from Přehled, not a tab
- **Profil / Nastavení** — _TBD entry point_
- **Form overlays** — Plan phase form, training wizard: back returns to previous view without reload

---

## Language & copy

- **UI language:** Czech (cs)
- **Tone:** Direct, athletic, no marketing fluff
- **Numbers:** Decimal comma optional; dates `DD.MM.YYYY` in display
- **Empty states:** Explain what to do next (e.g. „+ Přidat trénink“)

### Placeholder — glossary

| Term | Usage |
|------|--------|
| Plán | Planned workload |
| Trénink | Executed session |
| Fáze / Item | Single schedulable unit on a day |
| Aktivní trénink | In-session live mode (not „Live“) |

---

## Planning UX (Plán)

Aligned with [Data Model](./DATA_MODEL.md): **Week → Day → Item**.

### Week header

```
←      Týden XX      →
DD.M.–DD.M.YYYY
        [Dnes]
```

- Previous / next: instant client-side week change
- **Dnes:** jump to current ISO week and scroll to today

### Week strip

- Seven columns: Po–Ne
- Highlight: today · competition · planned · completed
- Tap day → scroll to day section

### Day sections

- Show items in order (Hlavní, Vedlejší 2, …)
- Competition badge when Season event on that date
- Empty day: „+ Přidat trénink“ — intentional entry point

### Placeholder — future interactions

- Drag & drop reorder: _TBD_
- Camp multi-day indicator: _TBD_

---

## Training UX (Trénink)

### Wizard

- Step-based flow with bottom navigation
- Back preserves entered data
- Series summary cards before save

### During training

- **Aktivní trénink** for in-session logging
- Large inputs; minimise keyboard switching
- RPE and readiness on session level

### Plan → Training

- Starting from a plan phase pre-fills wizard
- Link retained: `createdFromPlanId` / `lastTrainingId`

---

## Feedback & states

| State | Treatment |
|-------|-----------|
| Loading | _TBD — skeleton vs spinner_ |
| Success | Toast (short Czech message) |
| Error | Inline + toast; never silent fail on save |
| Empty | Illustration optional; always a CTA |

### Plan item status

| Status | Label | Visual |
|--------|-------|--------|
| planned | Plánováno | _TBD_ |
| started | Zahájeno | _TBD_ |
| completed | Splněno / ✓ Dokončeno | Green accent |
| skipped | Vynecháno | _TBD_ |
| changed | Změněno | _TBD_ |

---

## Accessibility

<!-- TODO: WCAG target level -->

| Area | Guideline |
|------|-----------|
| Contrast | Meet AA in dark and light themes |
| Focus | Visible focus rings on interactive elements |
| Labels | `aria-label` on icon-only buttons (← →) |
| Motion | Respect `prefers-reduced-motion` — _TBD implementation_ |

---

## Theming

- **Dark** — default athletic UI
- **Light** — optional via Welcome / Appearance settings
- Use semantic CSS tokens (`--accent`, `--surface`, …) — never hardcode colours in components

---

## Anti-patterns

| Avoid | Why |
|-------|-----|
| Horizontal carousels for core week view | Hides days; fails 390px rule |
| Full page reload on week change | Breaks app-like feel |
| Counting non-Throw series in Výkony | Documented in [Product Vision](./PRODUCT_VISION.md) |
| Mixing plan data into statistics | Plan is intent only |
| English UI strings in production | Czech-first product |

---

## Related documents

| Document | Purpose |
|----------|---------|
| [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) | Colours, typography, components |
| [DATA_MODEL.md](./DATA_MODEL.md) | Plan hierarchy and item types |
| [COACH_FRAMEWORK.md](./COACH_FRAMEWORK.md) | Recommendation copy patterns |
| [Product Vision](./PRODUCT_VISION.md) | Principles and scope |
