"use client";

import { cn } from "@/lib/utils";

const EMOJIS = [
  "🏓","🏆","⚡","🔥","🦁","🐯","🦊","🐺","🦅","🦋",
  "🌟","💫","🎯","🎪","🎭","🎸","🎺","🎻","🥊","🤺",
  "🏹","🎳","🧨","💥","🌈","☄️","🌊","🍀","🌙","👑",
];

interface EmojiPickerProps {
  selected?: string | null;
  onSelect: (emoji: string | null) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {/* None option */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "w-9 h-9 rounded-xl text-xs font-medium transition-all border",
            !selected
              ? "bg-violet-500/30 border-violet-400/50 text-white"
              : "glass border-white/10 text-white/40 hover:text-white"
          )}
        >
          ABC
        </button>
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji === selected ? null : emoji)}
            className={cn(
              "w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all border",
              selected === emoji
                ? "bg-violet-500/30 border-violet-400/50 scale-110"
                : "glass border-white/10 hover:scale-105 hover:border-white/30"
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
