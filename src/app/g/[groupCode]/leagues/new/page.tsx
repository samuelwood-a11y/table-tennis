"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { createLeague } from "@/actions/leagues";
import type { Player } from "@prisma/client";

export default function NewLeaguePage({
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedIds.length < 2) {
      alert("Enter a name and select at least 2 players");
      return;
    }
    setLoading(true);
    try {
      const league = await createLeague(groupId, name, selectedIds);
      router.push(`/g/${groupCode}/leagues/${league.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="New League" backHref={`/g/${groupCode}/leagues`} />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <GlassCard>
          <GlassInput
            label="League Name"
            placeholder="e.g. Summer 2025, Office Cup..."
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
                  {selected && <span className="ml-auto text-violet-300">✓</span>}
                </button>
              );
            })}
            {players.length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">No players in this group</p>
            )}
          </div>
        </GlassCard>

        {selectedIds.length >= 2 && (
          <GlassCard>
            <p className="text-sm text-white/50 text-center">
              This will generate{" "}
              <span className="text-white font-semibold">
                {(selectedIds.length * (selectedIds.length - 1)) / 2}
              </span>{" "}
              round-robin fixtures
            </p>
          </GlassCard>
        )}

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Create League
        </GlassButton>
      </form>
    </div>
  );
}
