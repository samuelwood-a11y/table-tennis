"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassTabs } from "@/components/ui/GlassTabs";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { createLeague } from "@/actions/leagues";
import type { Player } from "@prisma/client";

const FORMAT_TABS = [
  { id: "SINGLES", label: "Singles", icon: "🏓" },
  { id: "DOUBLES", label: "Doubles", icon: "👥" },
  { id: "ROTATING_DOUBLES", label: "Rotating", icon: "🔄" },
];

export default function NewLeaguePage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [format, setFormat] = useState("SINGLES");
  const [players, setPlayers] = useState<(Player & { emoji?: string | null })[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState(3);

  // Prize fields
  const [entryFee, setEntryFee] = useState("");
  const [prizeRows, setPrizeRows] = useState([
    { position: 1, label: "1st Place", amount: "" },
    { position: 2, label: "2nd Place", amount: "" },
  ]);

  useEffect(() => {
    fetch(`/api/group/${groupCode}`).then((r) => r.json()).then(({ groupId }) => setGroupId(groupId));
    fetch(`/api/group/${groupCode}/players`).then((r) => r.json()).then(({ players }) => setPlayers(players || []));
  }, [groupCode]);

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

        {/* Name */}
        <GlassCard>
          <GlassInput
            label="League Name"
            placeholder="e.g. Summer 2025, Office Cup..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </GlassCard>

        {/* Format */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Format</h3>
          <GlassTabs tabs={FORMAT_TABS} activeTab={format} onChange={setFormat} />
          {format === "ROTATING_DOUBLES" && (
            <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-400/20">
              <p className="text-xs text-violet-300 font-medium mb-1">🔄 Rotating Partner Doubles</p>
              <p className="text-xs text-white/50">
                Players earn individual standings but play as rotating doubles pairs. One player sits out each match as referee.
                Requires an <strong className="text-white">odd number of players</strong> (e.g. 5).
              </p>
              <div className="mt-3">
                <label className="text-xs text-white/50 block mb-1">Cycles (repeats of base schedule)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCycles(c)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        cycles === c ? "bg-violet-500/40 text-white border border-violet-400/50" : "glass text-white/50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Players */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">
            Players ({n} selected)
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
                    selected ? "bg-violet-500/30 border border-violet-400/50 text-white" : "glass glass-hover text-white/70"
                  }`}
                >
                  <PlayerAvatar name={p.name} avatarColor={p.avatarColor} emoji={p.emoji} size="sm" />
                  <span className="text-sm font-medium">{p.name}</span>
                  {selected && <span className="ml-auto text-violet-300">✓</span>}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Fixture preview */}
        {n >= 2 && (
          <GlassCard>
            <p className="text-sm text-white/50 text-center">
              <span className="text-white font-semibold">{totalMatches}</span> {format === "ROTATING_DOUBLES" ? `matches (${n} per cycle × ${cycles})` : "round-robin fixtures"}
              {format === "ROTATING_DOUBLES" && n % 2 === 0 && (
                <span className="block text-amber-400 text-xs mt-1">⚠️ Need odd number of players</span>
              )}
            </p>
          </GlassCard>
        )}

        {/* Entry fee + prizes */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">
            Prize & Entry Fee <span className="text-white/30 normal-case font-normal">(optional)</span>
          </h3>
          <div className="space-y-4">
            <GlassInput
              label="Entry Fee per Player (£)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
            />
            {entryFee && n >= 2 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Expected pot</span>
                  <span className="text-emerald-300 font-semibold">£{expectedPot.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-white/70 block mb-2">Payout Structure</label>
              <div className="space-y-2">
                {prizeRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-20 shrink-0">{row.label}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="£0.00"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...prizeRows];
                        updated[i] = { ...updated[i], amount: e.target.value };
                        setPrizeRows(updated);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>
                ))}
              </div>
              {entryFee && prizeRows.some((r) => r.amount) && (
                <div className={`mt-2 text-xs ${prizeValid ? "text-emerald-400" : "text-amber-400"}`}>
                  {prizeValid
                    ? `✓ Payout (£${prizeTotal.toFixed(2)}) matches expected pot`
                    : `⚠️ Payout (£${prizeTotal.toFixed(2)}) doesn't match pot (£${expectedPot.toFixed(2)})`}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Create League
        </GlassButton>
      </form>
    </div>
  );
}
