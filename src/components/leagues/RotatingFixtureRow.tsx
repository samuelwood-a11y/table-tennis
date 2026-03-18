"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { updateMatchSets } from "@/actions/matches";
import { useRouter } from "next/navigation";
import type { Match, Set, Player, DoublesTeam, DoublesTeamPlayer } from "@prisma/client";

type MatchWithDetails = Match & {
  sets: Set[];
  team1: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player & { emoji?: string | null } })[] }) | null;
  team2: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player & { emoji?: string | null } })[] }) | null;
  referee: (Player & { emoji?: string | null }) | null;
};

export function RotatingFixtureRow({
  match,
  fixtureNumber,
}: {
  match: MatchWithDetails;
  fixtureNumber: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState([{ score1: 0, score2: 0 }]);
  const [loading, setLoading] = useState(false);

  const team1Players = match.team1?.players.map((p) => p.player) ?? [];
  const team2Players = match.team2?.players.map((p) => p.player) ?? [];
  const ref = match.referee;

  async function handleSave() {
    setLoading(true);
    await updateMatchSets(match.id, sets);
    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  return (
    <GlassCard padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-white/30 font-mono">#{fixtureNumber}</span>
            {ref && (
              <div className="flex items-center gap-1.5">
                <PlayerAvatar name={ref.name} avatarColor={ref.avatarColor} emoji={ref.emoji} size="xs" />
                <span className="text-xs text-blue-300">Ref: {ref.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {team1Players.map((p) => (
                <div key={p.id} className="flex items-center gap-1">
                  <PlayerAvatar name={p.name} avatarColor={p.avatarColor} emoji={p.emoji} size="xs" />
                  <span className="text-sm text-white">{p.name}</span>
                </div>
              ))}
            </div>
            <span className="text-white/30 text-xs font-bold">vs</span>
            <div className="flex items-center gap-1.5">
              {team2Players.map((p) => (
                <div key={p.id} className="flex items-center gap-1">
                  <PlayerAvatar name={p.name} avatarColor={p.avatarColor} emoji={p.emoji} size="xs" />
                  <span className="text-sm text-white">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <GlassButton size="sm" variant="ghost" onClick={() => setOpen(!open)}>
          {open ? "Cancel" : "Score"}
        </GlassButton>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="space-y-2 mb-3">
            {sets.map((set, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-12">Game {i + 1}</span>
                <input
                  type="number"
                  min="0"
                  value={set.score1}
                  onChange={(e) => {
                    const u = [...sets];
                    u[i] = { ...u[i], score1: parseInt(e.target.value) || 0 };
                    setSets(u);
                  }}
                  className="w-14 text-center px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                />
                <span className="text-white/30">–</span>
                <input
                  type="number"
                  min="0"
                  value={set.score2}
                  onChange={(e) => {
                    const u = [...sets];
                    u[i] = { ...u[i], score2: parseInt(e.target.value) || 0 };
                    setSets(u);
                  }}
                  className="w-14 text-center px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSets([...sets, { score1: 0, score2: 0 }])}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              + Add Game
            </button>
            <GlassButton size="sm" variant="success" onClick={handleSave} loading={loading} className="ml-auto">
              Save Result
            </GlassButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
