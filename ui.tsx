"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Home, Plus, UserRound } from "lucide-react";
import { Card, Field, Pill, SectionTitle } from "@/components/ui";
import { Discipline, TrainingSeries, TrainingSession } from "@/lib/types";
import { formatDate, loadSessions, parseMarks, saveSessions, todayIso, uid } from "@/lib/storage";

type Screen = "home" | "training" | "history" | "stats" | "profile";

const disciplineOptions: Discipline[] = ["Disk", "Kladivo", "Koule", "Posilovna", "Kardio", "Mobilita"];

const techniqueOptions = [
  "Z místa",
  "South African",
  "Poloviční otočka",
  "Plná otočka",
  "1 otočka",
  "2 otočky",
  "3 otočky",
  "4 otočky",
  "Síla",
  "Regenerace",
];

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [date, setDate] = useState(todayIso());
  const [title, setTitle] = useState("Trénink vrhů");
  const [rpe, setRpe] = useState("6");
  const [sessionNote, setSessionNote] = useState("");
  const [draftSeries, setDraftSeries] = useState<TrainingSeries[]>([]);
  const [discipline, setDiscipline] = useState<Discipline>("Disk");
  const [technique, setTechnique] = useState("South African");
  const [equipment, setEquipment] = useState("Disk 1,5 kg");
  const [marksText, setMarksText] = useState("");
  const [seriesNote, setSeriesNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSessions(loadSessions().sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const allSeries = useMemo(() => sessions.flatMap((session) => session.series), [sessions]);
  const allMarks = useMemo(() => allSeries.flatMap((series) => series.marks), [allSeries]);
  const bestMark = allMarks.length ? Math.max(...allMarks) : null;
  const throwCount = allMarks.length;

  function addSeries() {
    const marks = parseMarks(marksText);
    const next: TrainingSeries = {
      id: uid(),
      discipline,
      technique,
      equipment,
      marks,
      note: seriesNote.trim() || undefined,
    };
    setDraftSeries((prev) => [...prev, next]);
    setMarksText("");
    setSeriesNote("");
  }

  function saveTraining() {
    const next: TrainingSession = {
      id: uid(),
      date,
      title,
      rpe: Number(rpe),
      note: sessionNote.trim() || undefined,
      series: draftSeries,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => [next, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setDraftSeries([]);
    setSessionNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] px-4 pb-28 pt-5">
      {screen === "home" && (
        <section className="space-y-3">
          <Header title="Atlas" subtitle="AI Throw Coach" emoji="🏋️" />

          <Card className="bg-gradient-to-br from-sky-300/20 to-emerald-400/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-slate-400">Readiness</div>
                <div className="mt-1 text-4xl font-black">84%</div>
              </div>
              <Pill>🟢 připraven</Pill>
            </div>
          </Card>

          <Card>
            <SectionTitle>Dnešní plán</SectionTitle>
            <PlanRow title="Disk" subtitle="South African" value="12 hodů" />
            <PlanRow title="Disk" subtitle="Plná otočka" value="16 hodů" />
            <PlanRow title="Kladivo" subtitle="2 otočky" value="18 hodů" />
          </Card>

          <button
            className="w-full rounded-[18px] bg-sky-300 p-4 font-black text-slate-950"
            onClick={() => setScreen("training")}
          >
            ➕ Začít trénink
          </button>

          <Card>
            <SectionTitle>Atlas Coach</SectionTitle>
            <p className="text-sky-100">
              Dnes drž objem pod kontrolou. Priorita je rytmus a čistý výstup z otočky.
            </p>
          </Card>
        </section>
      )}

      {screen === "training" && (
        <section className="space-y-3">
          <Header title="Nový trénink" subtitle="více sérií" emoji="➕" />

          <Card>
            <Field label="Datum tréninku">
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </Field>

            <Field label="Název">
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </Field>

            <Field label="RPE">
              <input type="number" min="1" max="10" value={rpe} onChange={(event) => setRpe(event.target.value)} />
            </Field>

            <Field label="Poznámka k tréninku">
              <textarea value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} placeholder="únava, počasí, bolest, hlavní technický pocit..." />
            </Field>
          </Card>

          <Card>
            <SectionTitle>Přidat sérii</SectionTitle>

            <Field label="Disciplína">
              <select value={discipline} onChange={(event) => setDiscipline(event.target.value as Discipline)}>
                {disciplineOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Technika">
              <select value={technique} onChange={(event) => setTechnique(event.target.value)}>
                {techniqueOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Nářadí">
              <input value={equipment} onChange={(event) => setEquipment(event.target.value)} />
            </Field>

            <Field label="Vzdálenosti">
              <textarea value={marksText} onChange={(event) => setMarksText(event.target.value)} placeholder={"24,10\n24,55\n25,02"} />
            </Field>

            <Field label="Poznámka k sérii">
              <textarea value={seriesNote} onChange={(event) => setSeriesNote(event.target.value)} placeholder="pravá ruka, přechod na paty, cupitání..." />
            </Field>

            <button className="w-full rounded-[18px] bg-white/10 p-4 font-black text-white" onClick={addSeries}>
              Přidat sérii
            </button>
          </Card>

          {draftSeries.length > 0 && (
            <Card>
              <SectionTitle>Série v tréninku</SectionTitle>
              {draftSeries.map((item, index) => (
                <PlanRow
                  key={item.id}
                  title={`${index + 1}. ${item.discipline}`}
                  subtitle={`${item.technique} · ${item.equipment}`}
                  value={`${item.marks.length} hodů`}
                />
              ))}

              <button className="mt-3 w-full rounded-[18px] bg-sky-300 p-4 font-black text-slate-950" onClick={saveTraining}>
                Uložit celý trénink
              </button>

              {saved && <div className="mt-3 rounded-2xl bg-emerald-400/20 p-3 text-emerald-100">Uloženo lokálně.</div>}
            </Card>
          )}
        </section>
      )}

      {screen === "history" && (
        <section className="space-y-3">
          <Header title="Historie" subtitle="uložené tréninky" emoji="📅" />
          <Card>
            <SectionTitle>Poslední tréninky</SectionTitle>
            {sessions.length === 0 && <p className="text-slate-400">Zatím žádný uložený trénink.</p>}

            {sessions.map((session) => (
              <div key={session.id} className="border-t border-white/10 py-3 first:border-t-0 first:pt-0">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-bold">{formatDate(session.date)} · {session.title}</div>
                    <div className="text-sm text-slate-400">RPE {session.rpe ?? "–"} · {session.series.length} sérií</div>
                  </div>
                  <div className="font-bold">{session.series.reduce((sum, item) => sum + item.marks.length, 0)} hodů</div>
                </div>

                <div className="mt-2 space-y-1">
                  {session.series.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                      {item.discipline} · {item.technique} · {item.equipment} · {item.marks.length} hodů
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </section>
      )}

      {screen === "stats" && (
        <section className="space-y-3">
          <Header title="Statistiky" subtitle="automatický souhrn" emoji="📈" />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Hody" value={throwCount.toString()} />
            <Stat label="PR" value={bestMark ? bestMark.toFixed(2).replace(".", ",") : "–"} />
            <Stat label="Tréninky" value={sessions.length.toString()} />
            <Stat label="Série" value={allSeries.length.toString()} />
          </div>
        </section>
      )}

      {screen === "profile" && (
        <section className="space-y-3">
          <Header title="Profil" subtitle="sportovec" emoji="👤" />
          <Card>
            <SectionTitle>Sportovec</SectionTitle>
            <div className="text-lg font-bold">Honza</div>
            <div className="mt-1 text-slate-400">Disk · Kladivo · Masters</div>
          </Card>
        </section>
      )}

      <BottomNav screen={screen} setScreen={setScreen} />
    </main>
  );
}

function Header({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-black">{title}</h1>
        <div className="text-slate-400">{subtitle}</div>
      </div>
      <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-slate-800">{emoji}</div>
    </div>
  );
}

function PlanRow({ title, subtitle, value }: { title: string; subtitle: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-t border-white/10 py-3 first:border-t-0 first:pt-0">
      <div>
        <div className="font-bold">{title}</div>
        <div className="mt-1 text-sm text-slate-400">{subtitle}</div>
      </div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </Card>
  );
}

function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  const items = [
    { id: "home" as Screen, icon: Home, label: "Domů" },
    { id: "training" as Screen, icon: Plus, label: "Trénink" },
    { id: "history" as Screen, icon: CalendarDays, label: "Historie" },
    { id: "stats" as Screen, icon: BarChart3, label: "Stats" },
    { id: "profile" as Screen, icon: UserRound, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 grid w-[min(410px,calc(100vw-24px))] -translate-x-1/2 grid-cols-5 gap-1 rounded-[24px] border border-white/10 bg-slate-950/90 p-2 backdrop-blur">
      {items.map((item) => {
        const Icon = item.icon;
        const active = screen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`rounded-[17px] px-1 py-2 text-center text-xs ${active ? "bg-sky-300/15 text-white" : "text-slate-400"}`}
          >
            <Icon className="mx-auto mb-1 h-5 w-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
