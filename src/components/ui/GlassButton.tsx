import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantMap = {
  primary: "bg-violet-500/80 hover:bg-violet-500 border-violet-400/40 text-white shadow-lg shadow-violet-500/20",
  ghost: "glass glass-hover text-white/80 hover:text-white",
  danger: "bg-red-500/70 hover:bg-red-500 border-red-400/40 text-white",
  success: "bg-emerald-500/70 hover:bg-emerald-500 border-emerald-400/40 text-white",
};

const sizeMap = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-sm rounded-2xl",
  lg: "px-7 py-3.5 text-base rounded-2xl",
};

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  loading,
  className,
  disabled,
  ...props
}: GlassButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium border backdrop-blur-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variantMap[variant],
        sizeMap[size],
        className
      )}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
