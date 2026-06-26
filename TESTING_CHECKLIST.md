# Atlas MVP — Manual Testing Checklist

**Version:** Atlas v0.4.1-test  
**Purpose:** Real-world validation before further development. Focus on core training flow and data persistence.

---

## Setup

- [ ] Start the app with `npm run dev:single` (stops stale dev servers, verifies Local URL, opens browser)
- [ ] Open app in mobile viewport (~430px) or on a phone
- [ ] Confirm header shows **Atlas v0.4.1-test**
- [ ] Confirm bottom navigation is visible on main tabs
- [ ] Start with empty data (Profil → Smazat všechna data) OR use existing test data

---

## 1. Training entry (critical)

### Dashboard — Začít trénink

- [ ] Tap **▶ Začít trénink** on Přehled
- [ ] Screen title is **Nový trénink** (not empty)
- [ ] Step 1 shows: Datum, Název, Typ tréninku, Disciplíny
- [ ] Bottom **Pokračovat** is disabled until date + ≥1 discipline selected
- [ ] **← Zpět** returns to Přehled
- [ ] Bottom navigation remains visible

### Bottom nav — Trénink

- [ ] From another tab, tap **Trénink** (+ icon)
- [ ] Opens same wizard step 1 (not empty screen)
- [ ] If aktivní trénink is in progress, banner **Pokračovat v aktivním tréninku** appears

---

## 2. Wizard flow

### Step 1 — Základ

- [ ] Set date, title, training type
- [ ] Select at least one discipline (e.g. Disk)
- [ ] **Pokračovat** advances to Série

### Step 2 — Série

- [ ] Empty state shows hint + **+ Přidat první sérii**
- [ ] Tap **+ Přidat první sérii** → series editor opens
- [ ] Fill: discipline, technique, implement, throw count, intensity
- [ ] **Hotovo** returns to series list with summary card
- [ ] **Pokračovat** disabled until ≥1 series exists
- [ ] **← Zpět** returns to Základ

### Step 3 — Souhrn

- [ ] Throw totals by discipline match entered series
- [ ] Non-throw series (IMI/Drill/Cvičení) noted as not counted
- [ ] **Pokračovat** goes to Vyhodnocení

### Step 4 — Vyhodnocení

- [ ] Evaluation form loads with session title
- [ ] **← Zpět** returns to Souhrn
- [ ] Save evaluation → redirects to Historie with toast
- [ ] Skip evaluation → saves session without evaluation → Historie

---

## 3. Data persistence (History / Statistics / Performance)

After completing one full training with Throw series (e.g. 10 throws Disk):

### Historie

- [ ] Session appears in list with correct date and title
- [ ] Detail shows all series, throw counts, best throw if entered
- [ ] RPE and evaluation badge visible if set

### Statistiky

- [ ] Total throws increased by saved throw count
- [ ] Session count increased by 1
- [ ] Discipline breakdown includes Disk throws

### Výkony

- [ ] Best throws / performance data reflects saved session (Throw series only)

### Persistence

- [ ] Refresh browser — data still present
- [ ] localStorage key `atlas-throw-coach-sessions` contains saved session JSON

---

## 4. Aktivní trénink (from Plán)

- [ ] Create a plan phase for today with planned series
- [ ] Tap **▶ Zahájit trénink** on phase detail
- [ ] Aktivní trénink screen shows title, disciplines, type, throw/series stats
- [ ] If no series: **+ Přidat první sérii** (never blank screen)
- [ ] Increment throws with +1/−1, complete series, save
- [ ] Save → evaluation flow → data in Historie/Statistiky

---

## 5. Quick Capture

- [ ] Dashboard **⚡ Rychlý zápis** opens capture screen
- [ ] Save one series → toast **Série uložena**
- [ ] Session **Rychlý zápis** appears in Historie for today
- [ ] Throw counts appear in Statistiky (Throw type only)

---

## 6. Edit & delete

- [ ] Historie → open session → **Upravit** → wizard opens at Základ
- [ ] Change title/series → **Uložit trénink** on Souhrn (skips evaluation in edit mode)
- [ ] Changes reflected in Historie and Statistiky
- [ ] **Smazat** removes session and updates stats

---

## 7. Series type rules

- [ ] Add IMI series — not counted in throw totals on Souhrn
- [ ] Add Drill/Cvičení — same exclusion
- [ ] Only **Hod** (Throw) counts in Statistiky and Výkony

---

## 8. Navigation & UX

- [ ] Bottom nav visible on: Přehled, Plán, Sezóna, Trénink wizard, Aktivní trénink, Historie, Statistiky, Výkony
- [ ] Bottom nav hidden on: Vyhodnocení (standalone), Rychlý zápis
- [ ] No empty screens on Začít trénink or Trénink tab
- [ ] All **← Zpět** buttons behave predictably

---

## 9. Regression smoke

- [ ] Plán: create/edit phase, week view
- [ ] Sezóna: season goal, competition
- [ ] Profil: name saves to localStorage
- [ ] Dashboard AI coach card renders without error

---

## 10. Season & Plan (v0.4.1)

### Season goals

- [ ] Edit **Hlavní cíl sezóny** with spaces and multiple lines — formatting preserved after save
- [ ] Goal displays correctly on Dashboard AI Coach card (multiline)

### Competition in Plan

- [ ] Create competition in **Sezóna** for a date in current week
- [ ] Open **Plán** — competition appears on that day with **Závod** badge
- [ ] Shows name, disciplines, status (not empty day if only competition exists)
- [ ] Tap competition card → opens edit in **Sezóna**
- [ ] Competition does **not** increase throw counts in **Statistiky**

### Competition results

- [ ] Edit competition — fill 6 attempts (valid distance, X, empty)
- [ ] Best valid attempt shown on competition card
- [ ] Mark **Oficiální závod** + save → appears in **Výkony** with **Oficiální** badge
- [ ] Filter **Závodní / oficiální** shows only official results
- [ ] Filter **Nezávodní / tréninkové** shows only training best throws

### Statistics mobile layout

- [ ] Open **Statistiky** at 390px width
- [ ] **Počet hodů podle disciplíny** shows stacked rows (Týden / 30 dní / Rok)
- [ ] No horizontal scroll or overflow

---

## Sign-off

| Tester | Date | Device / Browser | Pass / Fail | Notes |
|--------|------|------------------|-------------|-------|
|        |      |                  |             |       |

**Known MVP scope:** No backend sync. Data is localStorage only. Stop adding new modules until this checklist passes.
