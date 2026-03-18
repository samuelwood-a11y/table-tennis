"use client";

import { useState, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassTabs } from "@/components/ui/GlassTabs";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { createSinglesMatch, createDoublesMatch } from "@/actions/matches";
import { getSportConfig } from "@/lib/sports";
import type { Player } from "@prisma/client";

type SetScore = { score1: number; score2: number };

export default function NewMatchPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sport, setSport] = useState("TABLE_TENNIS");
  const [matchType, setMatchType] = useState<string>("SINGLES");
  const [players, setPlayers] = useState<Player[]>([]);
  const [groupId, setGroupId] = useState("");
  const [player1, setPlayer1] = useState<string>("");
  const [player2, setPlayer2] = useState<string>("");
  const [team1, setTeam1] = useState<[string, string]>(["", ""]);
  const [team2, setTeam2] = useState<[string, string]>(["", ""]);
  const [sets, setSets] = useState<SetScore[]>([{ score1: 0, score2: 0 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/group/${groupCode}`)
      .then((r) => r.json())
      .then(({ groupId, group }) => {
        setGroupId(groupId);
        const grpSport = group?.sport ?? "TABLE_TENNIS";
        setSport(grpSport);
        const cfg = getSportConfig(grpSport);
        setMatchType(cfg.defaultMatchType);
        return fetch(`/api/group/${groupCode}/players`);
      })
      .then((r) => r.json())
      .then((data) => setPlayers((data.players || []).filter((p: any) => !p.isArchived)));
  }, [groupCode]);

  useEffect(() => {
    const p1 = searchParams.get("p1");
    const p2 = searchParams.get("p2");
    if (p1) setPlayer1(p1);
    if (p2) setPlayer2(p2);
  }, [searchParams]);

  const sportConfig = getSportConfig(sport);
  const setLabel = sportConfig.scoring.setLabel;

  function addSet() {
    setSets([...sets, { score1: 0, score2: 0 }]);
  }

  function updateSet(i: number, field: "score1" | "score2", val: string) {
    const updated = [...sets];
    updated[i] = { ...updated[i], [field]: parseInt(val) || 0 };
    setSets(updated);
  }

  function removeSet(i: number) {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (matchType === "SINGLES") {
        if (!player1 || !player2) throw new Error("Select both players");
        await createSinglesMatch(groupId, player1, player2, sets);
      } else {
        if (!team1[0] || !team1[1] || !team2[0] || !team2[1])
          throw new Error("Select all players");
        await createDoublesMatch(groupId, team1, team2, sets);
      }
      router.push(`/g/${groupCode}/matches`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  const selectedIds =
    matchType === "SINGLES"
      ? [player1, player2]
      : [team1[0], team1[1], team2[0], team2[1]];

  return (
    <div>
      <PageHeader title="Record Match" backHref={`/g/${groupCode}/matches`} />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">

        {sportConfig.allowedMatchTypes.length > 1 && (
          <GlassTabs
            tabs={sportConfig.allowedMatchTypes.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
            activeTab={matchType}
            onChange={(t) => setMatchType(t)}
          />
        )}

        {matchType === "SINGLES" ? (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Select Players</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["Player 1", "Player 2"] as const).map((label, idx) => (
                <div key={label}>
                  <p className="text-xs text-white/40 mb-2">{label}</p>
                  <div className="space-y-1.5">
                    {players.map((p) => {
                      const isSelected = idx === 0 ? player1 === p.id : player2 === p.id;
                      const isDisabled = idx === 0 ? player2 === p.id : player1 === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => idx === 0 ? setPlayer1(p.id) : setPlayer2(p.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                            isSelected
                              ? "bg-violet-500/30 border border-violet-400/50 text-white"
                              : isDisabled
                              ? "opacity-30 cursor-not-allowed"
                              : "glass glass-hover text-white/70"
                          }`}
                        >
                          <PlayerAvatar
                            name={p.name}
                            avatarColor={p.avatarColor}
                            emoji={(p as any).emoji}
                            imageUrl={(p as any).imageUrl}
                            size="xs"
                          />
                          <span className="truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        ) : (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Select Teams</h3>
            <div className="grid grid-cols-2 gap-4">
              {(["Team 1", "Team 2"] as const).map((teamLabel, teamIdx) => (
                <div key={teamLabel}>
                  <p className="text-xs text-white/40 mb-2">{teamLabel}</p>
                  {[0, 1].map((slot) => (
                    <div key={slot} className="mb-2">
                      <p className="text-xs text-white/30 mb-1">Player {slot + 1}</p>
                      <div className="space-y-1">
                        {players.map((p) => {
                          const cur = teamIdx === 0 ? team1[slot] : team2[slot];
                          const isSelected = cur === p.id;
                          const allSelected = [team1[0], team1[1], team2[0], team2[1]];
                          const isDisabled = !isSelected && allSelected.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (teamIdx === 0) {
                                  const t = [...team1] as [string, string];
                                  t[slot] = p.id;
                                  setTeam1(t);
                                } else {
                                  const t = [...team2] as [string, string];
                                  t[slot] = p.id;
                                  setTeam2(t);
                                }
                              }}
                              className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                                isSelected
                                  ? "bg-violet-500/30 border border-violet-400/50 text-white"
                                  : isDisabled
                                  ? "opacity-30 cursor-not-allowed"
                                  : "glass glass-hover text-white/70"
                              }`}
                            >
                              <PlayerAvatar
                                name={p.name}
                                avatarColor={p.avatarColor}
                                emoji={(p as any).emoji}
                                imageUrl={(p as any).imageUrl}
                                size="xs"
                              />
                              <span className="truncate">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Set/Game Scores */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">
            {setLabel} Scores
          </h3>
          <div className="space-y-3">
            {sets.map((set, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-16">{setLabel} {i + 1}</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={set.score1}
                  onChange={(e) => updateSet(i, "score1", e.target.value)}
                  className="w-16 text-center px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:border-violet-400/60"
                />
                <span className="text-white/30 text-sm">–</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={set.score2}
                  onChange={(e) => updateSet(i, "score2", e.target.value)}
                  className="w-16 text-center px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:border-violet-400/60"
                />
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(i)}
                    className="text-white/30 hover:text-red-400 transition-colors ml-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSet}
            className="mt-3 text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {setLabel}
          </button>
        </GlassCard>

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Save Match
        </GlassButton>
      </form>
    </div>
  );
}
