"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { createTournament } from "@/actions/tournaments";
import type { Player } from "@prisma/client";

export default function NewTournamentPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/group/${groupCode}`)
      .then((r) => r.json())
      .then(({ groupId }) => setGroupId(groupId));
    fetch(`/api/group/${groupCode}/players`)
      .then((r) => r.json())
      .then(({ players }) => setPlayers(players || []));
  }, [groupCode]);

  function togglePlayer(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  // next power of 2
  function nextPow2(n: number) {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }

  const bracketSize = nextPow2(selectedIds.length);
  const byes = bracketSize - selectedIds.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedIds.length < 2) {
      alert("Enter a name and select at least 2 players");
      return;
    }
    setLoading(true);
    try {
      const tournament = await createTournament(groupId, name, selectedIds);
      router.push(`/g/${groupCode}/tournaments/${tournament.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="New Tournament" backHref={`/g/${groupCode}/tournaments`} />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <GlassCard>
          <GlassInput
            label="Tournament Name"
            placeholder="e.g. Summer Cup, Office Championship..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">
            Select Players ({selectedIds.length} selected)
          </h3>
          <div className="space-y-2">
            {players.map((p) => {
              const selected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    selected
                      ? "bg-violet-500/30 border border-violet-400/50 text-white"
                      : "glass glass-hover text-white/70"
                  }`}
                >
                  <PlayerAvatar name={p.name} avatarColor={p.avatarColor} size="sm" />
                  <span className="text-sm font-medium">{p.name}</span>
                  {selected && (
                    <span className="ml-auto text-xs text-white/50">
                      Seed {selectedIds.indexOf(p.id) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {selectedIds.length >= 2 && (
          <GlassCard>
            <div className="text-sm text-white/50 text-center space-y-1">
              <p>
                <span className="text-white font-semibold">{bracketSize}</span>-player bracket
              </p>
              {byes > 0 && (
                <p className="text-white/30">{byes} bye{byes > 1 ? "s" : ""} in round 1</p>
              )}
              <p className="text-white/30">
                {Math.ceil(Math.log2(bracketSize))} rounds to win
              </p>
            </div>
          </GlassCard>
        )}

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Create Tournament
        </GlassButton>
      </form>
    </div>
  );
}
