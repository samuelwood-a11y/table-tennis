import { cn } from "@/lib/utils";
import { getSportConfig } from "@/lib/sports";

interface SportBadgeProps {
  sport: string;
  size?: "sm" | "md";
  className?: string;
}

export function SportBadge({ sport, size = "sm", className }: SportBadgeProps) {
  const config = getSportConfig(sport);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
        "bg-white/10 border border-white/20 text-white/70",
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.name}</span>
    </span>
  );
}
