"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassTabs } from "@/components/ui/GlassTabs";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { generateRandomSinglesMatch, generateRandomDoublesMatch } from "@/lib/generate";
import type { Player } from "@prisma/client";

export default function GeneratorPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();

  const [mode, setMode] = useState<"SINGLES" | "DOUBLES">("SINGLES");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{
    singles?: [Player, Player];
    doubles?: [[Player, Player], [Player, Player]];
  } | null>(null);
  const [history, setHistory] = useState<typeof result[]>([]);

  useEffect(() => {
    fetch(`/api/group/${groupCode}/players`)
      .then((r) => r.json())
      .then(({ players }) => {
        setPlayers(players || []);
        // Default: select all
        setSelectedIds(new Set((players || []).map((p: Player) => p.id)));
      });
  }, [groupCode]);

  function togglePlayer(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function generate() {
    const pool = players.filter((p) => selectedIds.has(p.id));
    let newResult: typeof result = null;

    if (mode === "SINGLES") {
      const match = generateRandomSinglesMatch(pool);
      if (match) newResult = { singles: match };
      else alert("Need at least 2 players selected");
    } else {
      const match = generateRandomDoublesMatch(pool);
      if (match) newResult = { doubles: match };
      else alert("Need at least 4 players selected for doubles");
    }

    if (newResult) {
      setResult(newResult);
      setHistory((prev) => [newResult, ...prev].slice(0, 5));
    }
  }

  function recordMatch() {
    if (!result) return;
    if (result.singles) {
      const [p1, p2] = result.singles;
      router.push(`/g/${groupCode}/matches/new?p1=${p1.id}&p2=${p2.id}`);
    }
  }

  const minPlayers = mode === "SINGLES" ? 2 : 4;
  const canGenerate = selectedIds.size >= minPlayers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Match Generator"
        subtitle="Randomly pair players for a match"
      />

      <GlassTabs
        tabs={[
          { id: "SINGLES", label: "Singles", icon: "🏓" },
          { id: "DOUBLES", label: "Doubles", icon: "👥" },
        ]}
        activeTab={mode}
        onChange={(t) => { setMode(t as "SINGLES" | "DOUBLES"); setResult(null); }}
      />

      {/* Result Display */}
      {result && (
        <GlassCard className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-wide mb-4">Generated Match</div>
          {result.singles && (
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <PlayerAvatar name={result.singles[0].name} avatarColor={result.singles[0].avatarColor} size="xl" className="mx-auto mb-2" />
                <p className="text-white font-semibold">{result.singles[0].name}</p>
              </div>
              <div className="text-2xl text-white/30 font-bold">VS</div>
              <div className="text-center">
                <PlayerAvatar name={result.singles[1].name} avatarColor={result.singles[1].avatarColor} size="xl" className="mx-auto mb-2" />
                <p className="text-white font-semibold">{result.singles[1].name}</p>
              </div>
            </div>
          )}
          {result.doubles && (
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-white/40 mb-2">Team 1</p>
                {result.doubles[0].map((p) => (
                  <div key={p.id} className="flex items-center gap-2 mb-1.5">
                    <PlayerAvatar name={p.name} avatarColor={p.avatarColor} size="sm" />
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-xl text-white/30 font-bold">VS</div>
              <div className="text-center">
                <p className="text-xs text-white/40 mb-2">Team 2</p>
                {result.doubles[1].map((p) => (
                  <div key={p.id} className="flex items-center gap-2 mb-1.5">
                    <PlayerAvatar name={p.name} avatarColor={p.avatarColor} size="sm" />
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <GlassButton variant="ghost" onClick={generate}>
              🔀 Regenerate
            </GlassButton>
            {result.singles && (
              <GlassButton onClick={recordMatch}>
                🏓 Record Match
              </GlassButton>
            )}
          </div>
        </GlassCard>
      )}

      {/* Generate Button */}
      {!result && (
        <GlassButton
          onClick={generate}
          disabled={!canGenerate}
          className="w-full"
          size="lg"
        >
          🎲 Generate {mode === "SINGLES" ? "Match" : "Teams"}
        </GlassButton>
      )}

      {/* Player Pool */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide">
            Player Pool
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set(players.map((p) => p.id)))}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              All
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-white/40 hover:text-white/60"
            >
              None
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {players.map((p) => {
            const selected = selectedIds.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  selected
                    ? "bg-violet-500/30 border border-violet-400/50 text-white"
                    : "glass glass-hover text-white/50"
                }`}
              >
                <PlayerAvatar name={p.name} avatarColor={p.avatarColor} size="sm" />
                <span className="text-sm font-medium">{p.name}</span>
                {selected && <span className="ml-auto text-violet-300 text-xs">✓ In pool</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-white/30 mt-3 text-center">
          {selectedIds.size} of {players.length} players in pool · Need {minPlayers}+
        </p>
      </GlassCard>

      {/* History */}
      {history.length > 1 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Recent Generations</h3>
          <div className="space-y-2">
            {history.slice(1).map((h, i) => (
              <div key={i} className="text-xs text-white/40 py-1 border-b border-white/5">
                {h?.singles
                  ? `${h.singles[0].name} vs ${h.singles[1].name}`
                  : h?.doubles
                  ? `${h.doubles[0].map((p) => p.name).join(" & ")} vs ${h.doubles[1].map((p) => p.name).join(" & ")}`
                  : ""}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
