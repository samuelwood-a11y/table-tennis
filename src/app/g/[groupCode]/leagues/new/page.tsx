"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassTabs } from "@/components/ui/GlassTabs";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { createLeague } from "@/actions/leagues";
import { getSportConfig } from "@/lib/sports";
import type { Player } from "@prisma/client";

export default function NewLeaguePage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();
  const [sport, setSport] = useState("TABLE_TENNIS");
  const [name, setName] = useState("");
  const [format, setFormat] = useState("SINGLES");
  const [players, setPlayers] = useState<(Player & { emoji?: string | null; imageUrl?: string | null })[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState(3);

  const [entryFee, setEntryFee] = useState("");
  const [prizeRows, setPrizeRows] = useState([
    { position: 1, label: "1st Place", amount: "" },
    { position: 2, label: "2nd Place", amount: "" },
  ]);

  useEffect(() => {
    fetch(`/api/group/${groupCode}`).then((r) => r.json()).then(({ groupId, group }) => {
      setGroupId(groupId);
      const grpSport = group?.sport ?? "TABLE_TENNIS";
      setSport(grpSport);
      const cfg = getSportConfig(grpSport);
      setFormat(cfg.defaultLeagueFormat);
    });
    fetch(`/api/group/${groupCode}/players`).then((r) => r.json()).then(({ players }) =>
      setPlayers((players || []).filter((p: any) => !p.isArchived))
    );
  }, [groupCode]);

  const sportConfig = getSportConfig(sport);
  const formatTabs = sportConfig.allowedLeagueFormats;

  function togglePlayer(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  const n = selectedIds.length;
  const totalMatches =
    format === "ROTATING_DOUBLES"
      ? n * cycles
      : (n * (n - 1)) / 2;

  const expectedPot = entryFee ? parseFloat(entryFee) * n : 0;
  const prizeTotal = prizeRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const prizeValid = !entryFee || Math.abs(prizeTotal - expectedPot) < 0.01;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || n < 2) { alert("Name and at least 2 players required"); return; }
    if (format === "ROTATING_DOUBLES" && n % 2 === 0) {
      alert("Rotating doubles requires an odd number of players (e.g. 3, 5, 7)");
      return;
    }
    setLoading(true);
    try {
      const fee = entryFee ? parseFloat(entryFee) : undefined;
      const prize = prizeRows
        .filter((r) => r.amount)
        .map((r) => ({ position: r.position, label: r.label, amount: parseFloat(r.amount) }));

      const league = await createLeague(groupId, name, selectedIds, {
        format,
        entryFee: fee,
        currency: "GBP",
        expectedPot: fee ? fee * n : undefined,
        prizeRows: prize.length > 0 ? prize : undefined,
        cycles,
      });
      router.push(`/g/${groupCode}/leagues/${league.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="New League" backHref={`/g/${groupCode}/leagues`} />
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">

        <GlassCard>
          <GlassInput
            label="League Name"
            placeholder="e.g. Summer 2025, Season 1..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </GlassCard>

        {/* Format — only show if sport has multiple options */}
        {formatTabs.length > 1 && (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Format</h3>
            <GlassTabs
              tabs={formatTabs.map((f) => ({ id: f.id, label: f.label, icon: f.icon }))}
              activeTab={format}
              onChange={setFormat}
            />
            {format === "ROTATING_DOUBLES" && (
              <div className="mt-4">
                <p className="text-xs text-white/50 mb-2">Cycles (rounds of 5 fixtures)</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCycles(c)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        cycles === c
                          ? "bg-violet-500/30 border border-violet-400/50 text-white"
                          : "glass text-white/50 hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {/* Players */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
            Players {n > 0 && <span className="text-violet-400 normal-case font-normal">({n} selected)</span>}
          </h3>
          {format === "ROTATING_DOUBLES" && n > 0 && n % 2 === 0 && (
            <p className="text-amber-400 text-xs mb-3">⚠ Rotating doubles needs an odd number of players</p>
          )}
          <div className="space-y-1.5">
            {players.map((p) => {
              const selected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    selected
                      ? "bg-violet-500/20 border border-violet-400/40 text-white"
                      : "glass glass-hover text-white/70"
                  }`}
                >
                  <PlayerAvatar name={p.name} avatarColor={p.avatarColor} emoji={p.emoji} imageUrl={p.imageUrl} size="sm" />
                  <span className="flex-1 text-left truncate">{p.name}</span>
                  {selected && <span className="text-violet-400 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
          {n >= 2 && (
            <p className="text-xs text-white/30 mt-3">
              {totalMatches} fixture{totalMatches !== 1 ? "s" : ""} will be generated
            </p>
          )}
        </GlassCard>

        {/* Entry fee + prizes */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Prize Pot (Optional)</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-sm">Entry Fee (£)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                placeholder="0.00"
                className="w-24 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:border-violet-400/60"
              />
              {entryFee && n > 0 && (
                <span className="text-white/40 text-xs">= £{expectedPot.toFixed(2)} pot</span>
              )}
            </div>
            {entryFee && (
              <div className="space-y-2">
                <p className="text-xs text-white/40">Prize breakdown</p>
                {prizeRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-20">{row.label}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...prizeRows];
                        updated[i] = { ...updated[i], amount: e.target.value };
                        setPrizeRows(updated);
                      }}
                      placeholder="0.00"
                      className="w-24 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:border-violet-400/60"
                    />
                  </div>
                ))}
                {!prizeValid && (
                  <p className="text-amber-400 text-xs">Prize total doesn't match pot</p>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Create League
        </GlassButton>
      </form>
    </div>
  );
}
