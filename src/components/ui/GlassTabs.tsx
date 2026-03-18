"use client";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface GlassTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function GlassTabs({ tabs, activeTab, onChange, className }: GlassTabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 glass rounded-2xl", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            activeTab === tab.id
              ? "bg-white/20 text-white shadow-sm"
              : "text-white/50 hover:text-white/80"
          )}
        >
          {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
