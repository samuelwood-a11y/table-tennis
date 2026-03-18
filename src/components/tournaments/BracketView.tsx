"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { getMatchWinner } from "@/lib/stats";
import { updateMatchSets } from "@/actions/matches";
import { useRouter } from "next/navigation";
import type { Match, Set, Player, Tournament, TournamentEntry } from "@prisma/client";

type TournamentWithDetails = Tournament & {
  entries: (TournamentEntry & { player: Player })[];
  matches: (Match & { sets: Set[]; player1: Player | null; player2: Player | null })[];
};

export function BracketView({
  tournament,
  groupCode,
}: {
  tournament: TournamentWithDetails;
  groupCode: string;
}) {
  const router = useRouter();
  const [scoringMatchId, setScoringMatchId] = useState<string | null>(null);
  const [sets, setSets] = useState([{ score1: 0, score2: 0 }]);
  const [loading, setLoading] = useState(false);

  // Group matches by round
  const maxRound = Math.max(...tournament.matches.map((m) => m.bracketRound ?? 0), 1);
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1).map((round) =>
    tournament.matches.filter((m) => m.bracketRound === round).sort(
      (a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0)
    )
  );

  async function saveScore(matchId: string) {
    setLoading(true);
    await updateMatchSets(matchId, sets);
    router.refresh();
    setScoringMatchId(null);
    setSets([{ score1: 0, score2: 0 }]);
    setLoading(false);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {rounds.map((roundMatches, roundIdx) => (
          <div key={roundIdx} className="flex flex-col gap-4">
            <h3 className="text-xs text-white/40 uppercase tracking-wide text-center font-semibold">
              {roundIdx === rounds.length - 1
                ? "Final"
                : roundIdx === rounds.length - 2
                ? "Semi-Finals"
                : roundIdx === rounds.length - 3
                ? "Quarter-Finals"
                : `Round ${roundIdx + 1}`}
            </h3>
            <div
              className="flex flex-col"
              style={{ gap: `${Math.pow(2, roundIdx) * 12}px` }}
            >
              {roundMatches.map((match) => {
                const winner = getMatchWinner(match.sets);
                const isScoring = scoringMatchId === match.id;

                return (
                  <div key={match.id} className="w-52">
                    <GlassCard padding="sm" className="relative">
                      {/* Player 1 */}
                      <BracketPlayer
                        player={match.player1}
                        isWinner={winner === 1}
                        isPending={match.status === "PENDING"}
                      />
                      <div className="h-px bg-white/10 my-1.5" />
                      {/* Player 2 */}
                      <BracketPlayer
                        player={match.player2}
                        isWinner={winner === 2}
                        isPending={match.status === "PENDING"}
                      />

                      {/* Score or Enter Score */}
                      {match.status === "COMPLETED" && match.sets.length > 0 && (
                        <div className="flex justify-center gap-3 mt-2 pt-2 border-t border-white/10">
                          <span className={`text-xs font-bold ${winner === 1 ? "text-emerald-400" : "text-white/40"}`}>
                            {match.sets.filter((s) => s.score1 > s.score2).length}
                          </span>
                          <span className="text-white/20 text-xs">–</span>
                          <span className={`text-xs font-bold ${winner === 2 ? "text-emerald-400" : "text-white/40"}`}>
                            {match.sets.filter((s) => s.score2 > s.score1).length}
                          </span>
                        </div>
                      )}

                      {match.status === "PENDING" && match.player1 && match.player2 && !isScoring && (
                        <button
                          onClick={() => { setScoringMatchId(match.id); setSets([{ score1: 0, score2: 0 }]); }}
                          className="w-full mt-2 text-xs text-violet-400 hover:text-violet-300 text-center transition-colors pt-2 border-t border-white/10"
                        >
                          Enter Score →
                        </button>
                      )}

                      {isScoring && (
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
                          {sets.map((set, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={set.score1}
                                onChange={(e) => {
                                  const u = [...sets];
                                  u[i] = { ...u[i], score1: parseInt(e.target.value) || 0 };
                                  setSets(u);
                                }}
                                className="w-10 text-center text-xs px-1 py-1 rounded bg-white/10 border border-white/20 text-white"
                              />
                              <span className="text-white/20 text-xs">–</span>
                              <input
                                type="number"
                                min="0"
                                value={set.score2}
                                onChange={(e) => {
                                  const u = [...sets];
                                  u[i] = { ...u[i], score2: parseInt(e.target.value) || 0 };
                                  setSets(u);
                                }}
                                className="w-10 text-center text-xs px-1 py-1 rounded bg-white/10 border border-white/20 text-white"
                              />
                            </div>
                          ))}
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => setSets([...sets, { score1: 0, score2: 0 }])}
                              className="text-xs text-violet-400"
                            >
                              +Set
                            </button>
                            <GlassButton
                              size="sm"
                              variant="success"
                              onClick={() => saveScore(match.id)}
                              loading={loading}
                              className="ml-auto text-xs px-2 py-0.5"
                            >
                              Save
                            </GlassButton>
                            <button
                              onClick={() => setScoringMatchId(null)}
                              className="text-xs text-white/30 hover:text-white/60"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketPlayer({
  player,
  isWinner,
  isPending,
}: {
  player: Player | null;
  isWinner: boolean;
  isPending: boolean;
}) {
  if (!player) {
    return (
      <div className="flex items-center gap-2 py-0.5 opacity-30">
        <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
        <span className="text-xs text-white/30">TBD</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 py-0.5 ${isWinner ? "" : isPending ? "" : "opacity-40"}`}>
      <PlayerAvatar name={player.name} avatarColor={player.avatarColor} size="xs" />
      <span className={`text-xs font-medium truncate ${isWinner ? "text-emerald-300" : "text-white"}`}>
        {player.name}
      </span>
      {isWinner && <span className="ml-auto text-emerald-400 text-xs">🏆</span>}
    </div>
  );
}
