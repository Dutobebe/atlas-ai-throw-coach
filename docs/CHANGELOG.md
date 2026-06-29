# Atlas — Changelog

> **Status:** Active · **Last updated:** _TBD_  
> **Format:** [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
> **Related:** [Roadmap](./ROADMAP.md) · [Backlog](./BACKLOG.md) · [Root CHANGELOG](../CHANGELOG.md)

## Table of contents

- [How to update](#how-to-update)
- [Unreleased](#unreleased)
- [v0.4.5-test](#v045-test)
- [v0.4.x](#v04x)
- [v0.3.x](#v03x)
- [Versioning policy](#versioning-policy)
- [Related documents](#related-documents)

---

## How to update

When shipping a user-visible change:

1. Add entry under **Unreleased** during development.
2. On release, move items to a new version section with date.
3. Update `lib/app-version.ts` and `package.json` in the same commit.
4. Mirror major releases in root [CHANGELOG.md](../CHANGELOG.md) if still maintained there.

Categories: **Added** · **Changed** · **Fixed** · **Removed** · **Deprecated** · **Security**

---

## Unreleased

<!-- TODO: Move to version section on release -->

### Added

- _TBD_

### Changed

- _TBD_

### Fixed

- _TBD_

---

## v0.4.5-test

_Sprint 1 — Planner foundation (partial)._

### Added

- Weekly planner header: week navigation (← Týden XX →), date range, Dnes button
- Week strip with day indicators (today, competition, planned, completed)
- Daily plan sections with phase cards (priority, type, disciplines, badges)
- Documentation: [DATA_MODEL.md](./DATA_MODEL.md) — canonical Season → Week → Day → Item hierarchy

### Changed

- Date range format: compact Czech (`30.6.–6.7.2026`)
- Plan header layout: stacked (nav → range → Dnes)

---

## v0.4.x

### Added

- Light / dark theme (`ThemeProvider`, Welcome screen, Appearance settings)
- Welcome screen with Atlas logo
- Single dev server script (`npm run dev` → `scripts/dev-single.ps1`)

### Changed

- Live training renamed to **Aktivní trénink**
- Training wizard step-based UX

### Fixed

- Plan competitions display
- Season goals persistence
- Competition model with `competitionResults[]`
- Performance filter and statistics mobile layout

---

## v0.3.x

### Added

- **Core MVP** — training wizard, plan, season, history, statistics, performance
- **Coach Framework v1** — rule-based recommendations on Přehled
- Quick capture, live training, post-training evaluation
- Goal library and series goals
- Template picker

### Changed

- Series types: Throw · Imitation · Drill · Exercise
- Canonical plan entity: `PlanPhase` (not PlannedPhase)
- Plan storage key: `atlas-plans` (migrated from legacy key)

---

## Versioning policy

| Segment | Meaning |
|---------|---------|
| **Major** | Breaking data migration or UX paradigm shift |
| **Minor** | New module or significant feature slice |
| **Patch** | Bug fixes, small improvements |
| **-test** | Internal / QA builds (current: `v0.4.5-test`) |

---

## Related documents

| Document | Purpose |
|----------|---------|
| [Roadmap](./ROADMAP.md) | What comes next |
| [Backlog](./BACKLOG.md) | Ticket-level tracking |
| [ATLAS_SPEC.md](../ATLAS_SPEC.md) | Field-level schemas |
| [Root CHANGELOG](../CHANGELOG.md) | Legacy changelog (consolidate over time) |
