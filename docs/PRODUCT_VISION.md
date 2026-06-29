# Atlas — Product Vision

> **Status:** Draft · **Last updated:** _TBD_  
> **Related:** [Roadmap](./ROADMAP.md) · [Backlog](./BACKLOG.md) · [UX Guidelines](./UX_GUIDELINES.md) · [ATLAS_SPEC.md](../ATLAS_SPEC.md)

## Table of contents

- [Mission](#mission)
- [Problem statement](#problem-statement)
- [Product vision](#product-vision)
- [Target users](#target-users)
- [Core principles](#core-principles)
- [What Atlas is not](#what-atlas-is-not)
- [Success metrics](#success-metrics)
- [Strategic pillars](#strategic-pillars)
- [Related documents](#related-documents)

---

## Mission

<!-- TODO: One sentence — why Atlas exists -->

_Atlas helps throwing athletes and coaches plan, execute, and learn from training — locally, on mobile, without friction._

---

## Problem statement

<!-- TODO: Expand with user research and coach interviews -->

| Pain | Today | Atlas direction |
|------|--------|-----------------|
| Planning vs reality | _TBD_ | Clear separation of **Plán** (intent) and **Trénink** (outcome) |
| Load awareness | _TBD_ | Rule-based coach and volume trends |
| Competition prep | _TBD_ | Season calendar linked to weekly plan |
| Data entry during training | _TBD_ | One-hand, fast series logging |

---

## Product vision

<!-- TODO: 2–3 year north star -->

**Atlas AI Throw Coach** is a **mobile-first, local-first decision support system** for athletics throwing disciplines. It is not only a diary — it helps answer:

- *What should this week look like?* ([Coach Framework](./COACH_FRAMEWORK.md) · Planning Engine)
- *What should I do today?* (Daily Coach Engine)
- *How am I progressing?* (History · Statistics · Výkony)

All data stays in the browser (`localStorage`). No account required for MVP.

---

## Target users

### Primary

| Persona | Needs | _Placeholder notes_ |
|---------|--------|---------------------|
| **Competitive thrower** | Plan weeks, log sessions, track PRs | _TBD_ |
| **Club coach** | Review athlete load, align plan with season | _TBD_ |

### Secondary

| Persona | Needs | _Placeholder notes_ |
|---------|--------|---------------------|
| **Recreational thrower** | Simple logging, minimal planning | _TBD_ |

---

## Core principles

1. **Mobile first** — optimised for ~390–430px; usable with one hand during training.
2. **Local first** — offline-capable; no backend dependency for core flows.
3. **Czech UI** — labels and copy in Czech unless noted otherwise.
4. **Plan ≠ execution** — planned workload does not pollute statistics until executed ([Data Model](./DATA_MODEL.md)).
5. **Throws only for stats** — throw totals and Výkony count `seriesType === "Throw"` only.
6. **Explain recommendations** — coach suggestions include rationale ([Coach Framework](./COACH_FRAMEWORK.md)).
7. **Dark, app-like UI** — see [UX Guidelines](./UX_GUIDELINES.md) and [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).

---

## What Atlas is not

<!-- TODO: Boundaries to prevent scope creep -->

- _Not a social network_
- _Not a cloud-synced team platform (MVP)_
- _Not a replacement for qualified medical or coaching certification_
- _Not an LLM chatbot in v1 — rule-based coach only_

---

## Success metrics

<!-- TODO: Define measurable outcomes per release -->

| Metric | Definition | Target |
|--------|------------|--------|
| Session log time | Time to save one training session | _TBD_ |
| Weekly plan usage | Athletes with ≥1 planned week | _TBD_ |
| Retention | Return within 7 days | _TBD_ |
| Data integrity | Zero localStorage migration failures | _TBD_ |

---

## Strategic pillars

| Pillar | Description | Doc reference |
|--------|-------------|---------------|
| **Record** | Fast capture — wizard, quick capture, live training | [ATLAS_SPEC.md](../ATLAS_SPEC.md) |
| **Plan** | Weekly planner — Season → Week → Day → Item | [Data Model](./DATA_MODEL.md) |
| **Decide** | Coach engines — load, prep phase, discipline rules | [Coach Framework](./COACH_FRAMEWORK.md) |
| **Review** | History, statistics, performance, evaluation | [Roadmap](./ROADMAP.md) |

---

## Related documents

| Document | Purpose |
|----------|---------|
| [ROADMAP.md](./ROADMAP.md) | Release phases and timeline |
| [BACKLOG.md](./BACKLOG.md) | Prioritised work items |
| [CHANGELOG.md](./CHANGELOG.md) | Shipped changes by version |
| [UX_GUIDELINES.md](./UX_GUIDELINES.md) | Interaction and layout rules |
| [DATA_MODEL.md](./DATA_MODEL.md) | Canonical entity hierarchy |
| [COACH_FRAMEWORK.md](./COACH_FRAMEWORK.md) | Decision support logic |
| [ATLAS_SPEC.md](../ATLAS_SPEC.md) | Technical product specification |
