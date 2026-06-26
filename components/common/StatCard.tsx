interface StatCardProps {
  value: number;
  label: string;
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
