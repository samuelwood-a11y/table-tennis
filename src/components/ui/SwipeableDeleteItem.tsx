"use client";

import { useRef, useState } from "react";

interface SwipeableDeleteItemProps {
  onDelete: () => void;
  children: React.ReactNode;
}

export function SwipeableDeleteItem({ onDelete, children }: SwipeableDeleteItemProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const TRIGGER_THRESHOLD = 80;

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startOffset.current = offset;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current + startOffset.current;
    setOffset(Math.min(0, Math.max(-TRIGGER_THRESHOLD, dx)));
  }

  function handleTouchEnd() {
    if (offset < -TRIGGER_THRESHOLD / 2) {
      // Snapped open — show red zone then fire callback
      setOffset(-TRIGGER_THRESHOLD);
    } else {
      setOffset(0);
    }
  }

  // When fully open and user taps the red zone
  function handleRedZoneClick() {
    setOffset(0);
    onDelete();
  }

  // Tapping content while open collapses it
  function handleContentClick(e: React.MouseEvent) {
    if (offset !== 0) {
      e.preventDefault();
      e.stopPropagation();
      setOffset(0);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Red delete zone revealed behind */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500/80 rounded-r-2xl"
        style={{ width: TRIGGER_THRESHOLD }}
        onClick={handleRedZoneClick}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      {/* Slideable content */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: offset === 0 || offset === -TRIGGER_THRESHOLD ? "transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94)" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
}
