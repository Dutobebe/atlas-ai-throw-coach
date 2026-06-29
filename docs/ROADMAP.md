# Atlas — Roadmap

> **Status:** Living document · **Last updated:** _TBD_  
> **Current version:** `v0.4.5-test` (see [CHANGELOG.md](./CHANGELOG.md))  
> **Related:** [Product Vision](./PRODUCT_VISION.md) · [Backlog](./BACKLOG.md) · [ATLAS_SPEC.md](../ATLAS_SPEC.md)

## Table of contents

- [Overview](#overview)
- [Release philosophy](#release-philosophy)
- [Phase 0 — Foundation (done)](#phase-0--foundation-done)
- [Phase 1 — Planner (in progress)](#phase-1--planner-in-progress)
- [Phase 2 — Coach & load](#phase-2--coach--load)
- [Phase 3 — Polish & PWA](#phase-3--polish--pwa)
- [Future horizons](#future-horizons)
- [Dependencies & risks](#dependencies--risks)
- [Related documents](#related-documents)

---

## Overview

The roadmap sequences **user-visible capability** ahead of infrastructure refactors. Architecture targets are defined in [DATA_MODEL.md](./DATA_MODEL.md); implementation may lag — track migration in [Backlog](./BACKLOG.md).

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Future
 Foundation   Planner     Coach        Polish      _TBD_
```

---

## Release philosophy

| Rule | Description |
|------|-------------|
| **Ship vertical slices** | Each sprint delivers a testable user flow |
| **Local-first always** | No feature that requires a backend for MVP |
| **Document before refactor** | Data model and UX docs precede large migrations |
| **Mobile gate** | No release that breaks 390px layout |

---

## Phase 0 — Foundation (done)

**Goal:** Core MVP — record training, view history, basic statistics.

| Milestone | Version | Status |
|-----------|---------|--------|
| Training wizard & series types | v0.3.0 | ✅ Done |
| Plan module (multi-phase days) | v0.3.x | ✅ Done |
| Season goals & competitions | v0.3.x | ✅ Done |
| Coach Framework v1 | v0.3.1 | ✅ Done |
| Performance (PR / season best) | v0.3.x | ✅ Done |
| Quick capture & evaluation | v0.3.x | ✅ Done |
| Light / dark theme | v0.4.x | ✅ Done |

_Details: [CHANGELOG.md](./CHANGELOG.md)_

---

## Phase 1 — Planner (in progress)

**Goal:** Real weekly planner aligned with [Data Model](./DATA_MODEL.md) hierarchy.

| Milestone | ID | Status | Notes |
|-----------|-----|--------|-------|
| Week navigation | A-001 | ✅ Done | ← Týden XX →, Dnes, date range |
| Week strip & day cards | _TBD_ | 🔄 In progress | Today / competition / planned / completed |
| Item type alignment | _TBD_ | ⏳ Planned | Training · Competition · Recovery · Camp · Rest |
| Drag & drop reorder | _TBD_ | ⏳ Planned | Architecture prep exists |
| Camp item type | _TBD_ | ⏳ Planned | New entity — no code yet |

_Prioritised items: [BACKLOG.md](./BACKLOG.md)_

---

## Phase 2 — Coach & load

**Goal:** Expand Planning Engine; deepen load-aware daily recommendations.

| Milestone | Status | Notes |
|-----------|--------|-------|
| Planning Engine rules (weekly) | ⏳ Planned | Extends [Coach Framework](./COACH_FRAMEWORK.md) |
| Weekly goal suggestions | ⏳ Planned | _TBD_ |
| Prep-phase automation | ⏳ Planned | Tie to Season competitions |
| Evaluation → coach feedback loop | ⏳ Planned | _TBD_ |

---

## Phase 3 — Polish & PWA

**Goal:** Installable app, performance, accessibility pass.

| Milestone | Status | Notes |
|-----------|--------|-------|
| PWA manifest & service worker | ⏳ Planned | _TBD_ |
| Offline indicator | ⏳ Planned | _TBD_ |
| Accessibility audit | ⏳ Planned | _TBD_ |
| Export / backup | ⏳ Planned | _TBD_ |

---

## Future horizons

<!-- TODO: Prioritise with product owner -->

| Theme | Description |
|-------|-------------|
| **Multi-athlete / coach view** | _TBD_ |
| **Cloud sync** | _TBD_ |
| **Template marketplace** | _TBD_ |
| **Video / technique notes** | _TBD_ |
| **Integrations ( federation results )** | _TBD_ |

---

## Dependencies & risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| localStorage limits | Data loss at scale | _TBD — export, IndexedDB migration_ |
| Data model drift | Plan vs Item refactor cost | Follow [DATA_MODEL.md](./DATA_MODEL.md) |
| Scope creep on coach | Delayed planner delivery | Phase gates in [Backlog](./BACKLOG.md) |

---

## Related documents

| Document | Purpose |
|----------|---------|
| [Product Vision](./PRODUCT_VISION.md) | Why we build Atlas |
| [Backlog](./BACKLOG.md) | Sprint-ready work items |
| [CHANGELOG.md](./CHANGELOG.md) | What shipped |
| [DATA_MODEL.md](./DATA_MODEL.md) | Target architecture |
| [UX_GUIDELINES.md](./UX_GUIDELINES.md) | Mobile UX constraints |
