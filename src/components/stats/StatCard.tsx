import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: string;
  className?: string;
}

export function StatCard({ label, value, sub, icon, color = "text-violet-400", className }: StatCardProps) {
  return (
    <GlassCard className={cn("text-center", className)}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/50 mt-1 font-medium uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </GlassCard>
  );
}
