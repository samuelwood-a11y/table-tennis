import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassBadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantMap = {
  default: "bg-white/10 text-white/70 border-white/20",
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  danger: "bg-red-500/20 text-red-300 border-red-400/30",
  info: "bg-blue-500/20 text-blue-300 border-blue-400/30",
};

export function GlassBadge({ children, variant = "default", className }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
