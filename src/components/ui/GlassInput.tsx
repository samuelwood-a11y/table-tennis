import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function GlassInput({ label, error, className, id, ...props }: GlassInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 backdrop-blur-sm focus:border-violet-400/60 focus:bg-white/15 focus:ring-1 focus:ring-violet-400/30 transition-all",
          error && "border-red-400/60",
          className
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
