"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { updateMatchSets } from "@/actions/matches";
import { useRouter } from "next/navigation";
import type { Match, Set, Player, DoublesTeam, DoublesTeamPlayer } from "@prisma/client";

type MatchWithDetails = Match & {
  sets: Set[];
  player1: Player | null;
  player2: Player | null;
  team1: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player })[] }) | null;
  team2: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player })[] }) | null;
};

export function LeagueMatchRow({
  match,
  groupCode,
  leagueId,
}: {
  match: MatchWithDetails;
  groupCode: string;
  leagueId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState([{ score1: 0, score2: 0 }]);
  const [loading, setLoading] = useState(false);

  const side1 = match.player1?.name ?? "TBD";
  const side2 = match.player2?.name ?? "TBD";
  const side1Color = match.player1?.avatarColor ?? "#6366f1";
  const side2Color = match.player2?.avatarColor ?? "#8b5cf6";

  async function handleSave() {
    setLoading(true);
    await updateMatchSets(match.id, sets);
    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  return (
    <GlassCard padding="sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <PlayerAvatar name={side1} avatarColor={side1Color} size="xs" />
            <span className="text-sm text-white">{side1}</span>
          </div>
          <span className="text-white/30 text-xs">vs</span>
          <div className="flex items-center gap-2">
            <PlayerAvatar name={side2} avatarColor={side2Color} size="xs" />
            <span className="text-sm text-white">{side2}</span>
          </div>
        </div>
        <GlassButton size="sm" variant="ghost" onClick={() => setOpen(!open)}>
          {open ? "Cancel" : "Enter Score"}
        </GlassButton>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="space-y-2 mb-3">
            {sets.map((set, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-12">Set {i + 1}</span>
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSets([...sets, { score1: 0, score2: 0 }])}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              + Add Set
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
