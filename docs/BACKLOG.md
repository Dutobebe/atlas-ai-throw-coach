# Atlas — Backlog

> **Status:** Living document · **Last updated:** _TBD_  
> **Related:** [Roadmap](./ROADMAP.md) · [CHANGELOG.md](./CHANGELOG.md) · [ATLAS_SPEC.md](../ATLAS_SPEC.md)

## Table of contents

- [How to use this backlog](#how-to-use-this-backlog)
- [Priority legend](#priority-legend)
- [Sprint 1 — Planner foundation](#sprint-1--planner-foundation)
- [Ready](#ready)
- [In progress](#in-progress)
- [Icebox](#icebox)
- [Done (recent)](#done-recent)
- [Related documents](#related-documents)

---

## How to use this backlog

| Column | Meaning |
|--------|---------|
| **ID** | Stable ticket id (e.g. `A-001`) |
| **Priority** | P0 (critical) → P3 (nice-to-have) |
| **Status** | `Ready` · `In progress` · `Done` · `Icebox` |

Items must align with [Data Model](./DATA_MODEL.md) and [UX Guidelines](./UX_GUIDELINES.md) before implementation.

---

## Priority legend

| Level | Meaning |
|-------|---------|
| **P0** | Blocks release or data integrity |
| **P1** | Current sprint commitment |
| **P2** | Next sprint candidate |
| **P3** | Exploratory / future |

---

## Sprint 1 — Planner foundation

**Goal:** Weekly planner with navigation, strip, and daily cards ([Roadmap](./ROADMAP.md#phase-1--planner-in-progress)).

| ID | Title | Priority | Status | Notes |
|----|-------|----------|--------|-------|
| A-001 | Week navigation | P1 | Done | ← →, Dnes, ISO week, date range |
| A-002 | Week strip highlights | P1 | _TBD_ | Today · competition · planned · completed |
| A-003 | Daily item cards | P1 | _TBD_ | Priority, type, disciplines, badges |
| A-004 | Edit any week | P1 | _TBD_ | CRUD on navigated week |
| A-005 | Season competitions on plan | P1 | _TBD_ | Auto-appear on correct day |
| A-006 | Mobile 390px pass | P1 | _TBD_ | No horizontal scroll |

---

## Ready

<!-- TODO: Groomed items for next sprint -->

| ID | Title | Priority | Module | Acceptance criteria |
|----|-------|----------|--------|---------------------|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

---

## In progress

| ID | Title | Owner | Started | Notes |
|----|-------|-------|---------|-------|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

---

## Icebox

_Unprioritised ideas — not committed._

| ID | Title | Notes |
|----|-------|-------|
| _TBD_ | Drag & drop plan reorder | DnD prep in `components/plan/dnd/` |
| _TBD_ | Camp item type | Requires [Data Model](./DATA_MODEL.md) implementation |
| _TBD_ | PWA install | See [Roadmap Phase 3](./ROADMAP.md#phase-3--polish--pwa) |
| _TBD_ | Data export (JSON) | _TBD_ |
| _TBD_ | IndexedDB migration | _TBD_ |

---

## Done (recent)

| ID | Title | Version | Shipped |
|----|-------|---------|---------|
| A-001 | Week navigation | v0.4.5-test | _TBD date_ |
| — | Light / dark theme | v0.4.x | _TBD_ |
| — | Competition results model | v0.4.2+ | _TBD_ |
| — | Coach Framework v1 | v0.3.1 | _TBD_ |

_Full history: [CHANGELOG.md](./CHANGELOG.md)_

---

## Related documents

| Document | Purpose |
|----------|---------|
| [Roadmap](./ROADMAP.md) | Phases and milestones |
| [Product Vision](./PRODUCT_VISION.md) | Strategic context |
| [DATA_MODEL.md](./DATA_MODEL.md) | Entity rules for new items |
| [UX_GUIDELINES.md](./UX_GUIDELINES.md) | Mobile and interaction constraints |
