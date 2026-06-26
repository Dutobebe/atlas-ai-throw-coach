import StatCard from "./StatCard";

export interface SummaryCardsStats {
  throws: number;
  seriesCount: number;
  sessionCount: number;
}

interface SummaryCardsProps {
  stats: SummaryCardsStats;
}

const CARDS = [
  { key: "throws", label: "Hodů", getValue: (s: SummaryCardsStats) => s.throws },
  { key: "series", label: "Sérií", getValue: (s: SummaryCardsStats) => s.seriesCount },
  { key: "sessions", label: "Tréninků", getValue: (s: SummaryCardsStats) => s.sessionCount },
] as const;

export default function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="summary-cards">
      {CARDS.map((card) => (
        <StatCard key={card.key} value={card.getValue(stats)} label={card.label} />
      ))}
    </div>
  );
}
