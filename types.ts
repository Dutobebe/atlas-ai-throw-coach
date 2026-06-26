import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] border border-white/10 bg-[#141b2f]/90 p-4 shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-[15px] font-bold uppercase tracking-[.07em] text-slate-400">
      {children}
    </h2>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm text-slate-100">
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="text-sm text-slate-400">{label}</span>
      {children}
    </label>
  );
}
