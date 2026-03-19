"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassModal } from "@/components/ui/GlassModal";
import { SwipeableDeleteItem } from "@/components/ui/SwipeableDeleteItem";
import { removeLeague } from "@/actions/leagues";

type League = {
  id: string;
  name: string;
  status: string;
  format: string;
  _count: { players: number; matches: number };
  matches: { id: string }[]; // completed matches
};

type ConfirmState = {
  league: League;
} | null;

export function DeletableLeagueList({
  initialLeagues,
  groupCode,
}: {
  initialLeagues: League[];
  groupCode: string;
}) {
  const [leagues, setLeagues] = useState(initialLeagues);
  const [confirming, setConfirming] = useState<ConfirmState>(null);
  const [loading, setLoading] = useState(false);

  function openConfirm(league: League) {
    setConfirming({ league });
  }

  async function handleConfirm() {
    if (!confirming) return;
    setLoading(true);
    try {
      const result = await removeLeague(confirming.league.id, groupCode);
      if (result.action === "archived") {
        setLeagues((prev) =>
          prev.map((l) =>
            l.id === confirming.league.id ? { ...l, status: "ARCHIVED" } : l
          )
        );
      } else {
        setLeagues((prev) => prev.filter((l) => l.id !== confirming.league.id));
      }
    } finally {
      setLoading(false);
      setConfirming(null);
    }
  }

  const hasResults = (confirming?.league.matches.length ?? 0) > 0;
  const completedCount = confirming?.league.matches.length ?? 0;

  return (
    <>
      <div className="space-y-3">
        {leagues.map((league) => (
          <SwipeableDeleteItem key={league.id} onDelete={() => openConfirm(league)}>
            <div className="flex items-center rounded-2xl glass overflow-hidden">
              {/* Main tappable area → navigate */}
              <Link
                href={`/g/${groupCode}/leagues/${league.id}`}
                className="flex-1 flex items-center gap-3 p-5 min-w-0"
              >
                <span className="text-2xl flex-shrink-0">📊</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{league.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {league._count.players} players · {league._count.matches} fixtures
                  </p>
                </div>
                <GlassBadge variant={league.status === "ACTIVE" ? "success" : "default"} className="flex-shrink-0">
                  {league.status}
                </GlassBadge>
              </Link>

              {/* Trash button — always visible, taps open modal */}
              <button
                onClick={() => openConfirm(league)}
                className="flex-shrink-0 flex items-center justify-center w-12 h-full border-l border-white/5 text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors self-stretch px-3"
                title="Remove league"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </SwipeableDeleteItem>
        ))}
      </div>

      {/* Delete / Archive confirmation modal */}
      <GlassModal
        open={!!confirming}
        onClose={() => !loading && setConfirming(null)}
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-3">{hasResults ? "📦" : "🗑️"}</div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {hasResults ? "Archive league?" : "Delete league?"}
          </h3>
          <p className="text-white/60 font-medium text-sm mb-1 truncate px-4">
            "{confirming?.league.name}"
          </p>

          <p className="text-white/40 text-sm mt-3 leading-relaxed">
            {hasResults ? (
              <>
                This league already has{" "}
                <span className="text-white/70 font-medium">{completedCount} recorded result{completedCount !== 1 ? "s" : ""}</span>.
                It will be <span className="text-amber-400 font-medium">archived</span> and hidden
                from the main list, but all results and history will be preserved.
              </>
            ) : (
              <>
                This league has no recorded results. It will be{" "}
                <span className="text-red-400 font-medium">permanently deleted</span> — this cannot
                be undone.
              </>
            )}
          </p>

          <div className="flex gap-3 mt-6">
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => setConfirming(null)}
              disabled={loading}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant={hasResults ? "ghost" : "danger"}
              className={`flex-1 ${hasResults ? "text-amber-400 border-amber-400/30 hover:bg-amber-500/20" : ""}`}
              onClick={handleConfirm}
              loading={loading}
            >
              {hasResults ? "Archive Competition" : "Delete Permanently"}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </>
  );
}
