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
import { generateRandomPairs } from "@/lib/doubles-pairs";
import type { Player } from "@prisma/client";

type PlayerWithExtras = Player & { emoji?: string | null; imageUrl?: string | null };

// ─── Pair builder helpers ────────────────────────────────────────────────────

function getPairLabel(pair: [string, string], players: PlayerWithExtras[]) {
  const names = pair.map((id) => players.find((p) => p.id === id)?.name ?? "?");
  return names.join(" + ");
}

// ─── Component ───────────────────────────────────────────────────────────────

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
  const [players, setPlayers] = useState<PlayerWithExtras[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState(3);

  // Padel fixed/random pair state
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [pendingPartner, setPendingPartner] = useState<string | null>(null);

  // Entry fee / prizes
  const [entryFee, setEntryFee] = useState("");
  const [prizeRows, setPrizeRows] = useState([
    { position: 1, label: "1st Place", amount: "" },
    { position: 2, label: "2nd Place", amount: "" },
  ]);

  useEffect(() => {
    fetch(`/api/group/${groupCode}`)
      .then((r) => r.json())
      .then(({ groupId, group }) => {
        setGroupId(groupId);
        const grpSport = group?.sport ?? "TABLE_TENNIS";
        setSport(grpSport);
        const cfg = getSportConfig(grpSport);
        setFormat(cfg.defaultLeagueFormat);
      });
    fetch(`/api/group/${groupCode}/players`)
      .then((r) => r.json())
      .then(({ players }) =>
        setPlayers((players || []).filter((p: any) => !p.isArchived))
      );
  }, [groupCode]);

  // Reset pairs whenever format or selected players change
  useEffect(() => {
    setPairs([]);
    setPendingPartner(null);
  }, [format, selectedIds.join(",")]);

  const sportConfig = getSportConfig(sport);
  const formatTabs = sportConfig.allowedLeagueFormats;

  const isPadelFixedOrRandom = format === "FIXED_DOUBLES" || format === "RANDOM_DOUBLES";
  const isPadelRotating = format === "ROTATING_DOUBLES";
  const isSingles = format === "SINGLES";
  const isPadel = sport === "PADEL";

  // Players already assigned to a pair
  const pairedIds = new Set(pairs.flat());
  const unpairedSelectedIds = selectedIds.filter((id) => !pairedIds.has(id));

  function togglePlayer(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  // ── Fixed pair builder ──────────────────────────────────────────────────────
  function handlePairClick(id: string) {
    if (pendingPartner === null) {
      setPendingPartner(id);
    } else if (pendingPartner === id) {
      setPendingPartner(null);
    } else {
      setPairs((prev) => [...prev, [pendingPartner, id]]);
      setPendingPartner(null);
    }
  }

  function dissolvePair(index: number) {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Random pair builder ─────────────────────────────────────────────────────
  function handleGeneratePairs() {
    try {
      setPairs(generateRandomPairs(selectedIds));
    } catch {
      // odd count — validation message shown inline
    }
  }

  // ── Totals ──────────────────────────────────────────────────────────────────
  const n = selectedIds.length;
  const nPairs = pairs.length;

  const totalMatches = isPadelRotating
    ? n * cycles
    : isPadelFixedOrRandom
    ? (nPairs * (nPairs - 1)) / 2
    : (n * (n - 1)) / 2;

  const expectedPot = entryFee ? parseFloat(entryFee) * n : 0;
  const prizeTotal = prizeRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const prizeValid = !entryFee || Math.abs(prizeTotal - expectedPot) < 0.01;

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!name.trim()) return "Enter a league name";
    if (isPadelFixedOrRandom) {
      if (selectedIds.length < 4) return "Select at least 4 players for doubles";
      if (pairs.length < 2) return "Create at least 2 pairs";
      if (unpairedSelectedIds.length > 0)
        return `${unpairedSelectedIds.length} player${unpairedSelectedIds.length > 1 ? "s are" : " is"} not in a pair yet`;
    } else if (isPadelRotating || format === "ROTATING_DOUBLES") {
      if (n < 3) return "Select at least 5 players for rotating pairs";
      if (n % 2 === 0) return "Rotating pairs needs an odd number of players (e.g. 5, 7)";
    } else {
      if (n < 2) return "Select at least 2 players";
    }
    return null;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }

    setLoading(true);
    try {
      const fee = entryFee ? parseFloat(entryFee) : undefined;
      const prize = prizeRows
        .filter((r) => r.amount)
        .map((r) => ({ position: r.position, label: r.label, amount: parseFloat(r.amount) }));

      const allPlayerIds = isPadelFixedOrRandom ? [...new Set(pairs.flat())] : selectedIds;

      const league = await createLeague(groupId, name, allPlayerIds, {
        format,
        pairs: isPadelFixedOrRandom ? pairs : undefined,
        cycles,
        entryFee: fee,
        currency: "GBP",
        expectedPot: fee ? fee * allPlayerIds.length : undefined,
        prizeRows: prize.length > 0 ? prize : undefined,
      });
      router.push(`/g/${groupCode}/leagues/${league.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating league");
      setLoading(false);
    }
  }

  // ── Padel format descriptions ───────────────────────────────────────────────
  const formatDescriptions: Record<string, string> = {
    FIXED_DOUBLES:
      "You choose who partners who. Pairs stay the same for the whole league.",
    RANDOM_DOUBLES:
      "Select your players and the app generates balanced pairs automatically. You can reshuffle before confirming.",
    ROTATING_DOUBLES:
      "Partners rotate across matches. Standings are individual — perfect for groups where everyone should play with everyone.",
    SINGLES:
      "Standard one-on-one league. Every player plays every other player once.",
  };

  return (
    <div>
      <PageHeader title="New League" backHref={`/g/${groupCode}/leagues`} />
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">

        {/* Name */}
        <GlassCard>
          <GlassInput
            label="League Name"
            placeholder={isPadel ? "e.g. Summer Padel League, Season 1…" : "e.g. Summer 2025, Season 1…"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </GlassCard>

        {/* Format */}
        {formatTabs.length > 1 && (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
              {isPadel ? "Doubles Format" : "Format"}
            </h3>
            <GlassTabs
              tabs={formatTabs.map((f) => ({ id: f.id, label: f.label, icon: f.icon }))}
              activeTab={format}
              onChange={(f) => setFormat(f)}
            />
            {isPadel && formatDescriptions[format] && (
              <p className="text-xs text-white/40 mt-3 leading-relaxed">
                {formatDescriptions[format]}
              </p>
            )}
            {isPadelRotating && (
              <div className="mt-4">
                <p className="text-xs text-white/50 mb-2">Cycles (rounds of fixtures)</p>
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

        {/* Player selection */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
            {isPadelFixedOrRandom
              ? `Players ${n > 0 ? `(${n} selected)` : ""}`
              : `Players ${n > 0 ? `(${n} selected)` : ""}`}
          </h3>

          {/* Odd-count warning for rotating */}
          {(isPadelRotating || format === "ROTATING_DOUBLES") && n > 0 && n % 2 === 0 && (
            <p className="text-amber-400 text-xs mb-3">
              ⚠ Rotating pairs needs an odd number of players
            </p>
          )}
          {/* Even-count requirement for random */}
          {format === "RANDOM_DOUBLES" && n > 0 && n % 2 !== 0 && (
            <p className="text-amber-400 text-xs mb-3">
              ⚠ Random pairs needs an even number of players
            </p>
          )}
          {/* Minimum 4 for fixed/random */}
          {isPadelFixedOrRandom && n > 0 && n < 4 && (
            <p className="text-amber-400 text-xs mb-3">
              ⚠ Select at least 4 players for a doubles league
            </p>
          )}

          <div className="space-y-1.5">
            {players.map((p) => {
              const selected = selectedIds.includes(p.id);
              const inPair = pairedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  disabled={isPadelFixedOrRandom && inPair}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    inPair
                      ? "opacity-40 cursor-default glass"
                      : selected
                      ? "bg-violet-500/20 border border-violet-400/40 text-white"
                      : "glass glass-hover text-white/70"
                  }`}
                >
                  <PlayerAvatar
                    name={p.name}
                    avatarColor={p.avatarColor}
                    emoji={p.emoji}
                    imageUrl={p.imageUrl}
                    size="sm"
                  />
                  <span className="flex-1 text-left truncate">{p.name}</span>
                  {inPair && <span className="text-white/30 text-xs">paired</span>}
                  {selected && !inPair && <span className="text-violet-400 text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          {!isPadelFixedOrRandom && n >= 2 && (
            <p className="text-xs text-white/30 mt-3">
              {totalMatches} fixture{totalMatches !== 1 ? "s" : ""} will be generated
            </p>
          )}
        </GlassCard>

        {/* ── Fixed Pair Builder ── */}
        {format === "FIXED_DOUBLES" && n >= 2 && (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-1">
              Create Pairs
            </h3>
            <p className="text-xs text-white/40 mb-4">
              {pendingPartner
                ? `Select a partner for ${players.find((p) => p.id === pendingPartner)?.name}…`
                : "Tap a player to start a pair, then tap their partner."}
            </p>

            {/* Unpaired players */}
            {unpairedSelectedIds.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {unpairedSelectedIds.map((id) => {
                  const p = players.find((pl) => pl.id === id)!;
                  const isPending = pendingPartner === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePairClick(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                        isPending
                          ? "bg-emerald-500/20 border-emerald-400/50 text-white"
                          : "glass glass-hover text-white/70 border-white/10"
                      }`}
                    >
                      <PlayerAvatar
                        name={p.name}
                        avatarColor={p.avatarColor}
                        emoji={p.emoji}
                        imageUrl={p.imageUrl}
                        size="sm"
                      />
                      <span className="flex-1 text-left">{p.name}</span>
                      {isPending && (
                        <span className="text-emerald-400 text-xs font-medium">selecting partner…</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Created pairs */}
            {pairs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/30 uppercase tracking-wide font-medium mb-2">
                  {pairs.length} Pair{pairs.length !== 1 ? "s" : ""} created
                </p>
                {pairs.map((pair, i) => {
                  const [pa, pb] = pair.map((id) => players.find((p) => p.id === id)!);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-400/20"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <PlayerAvatar name={pa.name} avatarColor={pa.avatarColor} emoji={pa.emoji} imageUrl={pa.imageUrl} size="sm" />
                        <span className="text-xs text-white/40">+</span>
                        <PlayerAvatar name={pb.name} avatarColor={pb.avatarColor} emoji={pb.emoji} imageUrl={pb.imageUrl} size="sm" />
                        <span className="text-sm text-white truncate">{getPairLabel(pair, players)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => dissolvePair(i)}
                        className="text-white/30 hover:text-red-400 transition-colors p-1"
                        title="Dissolve pair"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
                {nPairs >= 2 && (
                  <p className="text-xs text-white/30 pt-1">
                    {totalMatches} fixture{totalMatches !== 1 ? "s" : ""} will be generated
                  </p>
                )}
              </div>
            )}
          </GlassCard>
        )}

        {/* ── Random Pair Builder ── */}
        {format === "RANDOM_DOUBLES" && n >= 4 && (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-1">
              Generate Pairs
            </h3>
            <p className="text-xs text-white/40 mb-4">
              {pairs.length === 0
                ? "Tap Generate to randomly pair your selected players."
                : "Happy with these pairs? Proceed to create the league, or reshuffle."}
            </p>

            {pairs.length === 0 ? (
              <GlassButton
                type="button"
                variant="ghost"
                className="w-full"
                disabled={n % 2 !== 0}
                onClick={handleGeneratePairs}
              >
                🔀 Generate Pairs
              </GlassButton>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {pairs.map((pair, i) => {
                    const [pa, pb] = pair.map((id) => players.find((p) => p.id === id)!);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-400/20"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <PlayerAvatar name={pa.name} avatarColor={pa.avatarColor} emoji={pa.emoji} imageUrl={pa.imageUrl} size="sm" />
                          <span className="text-xs text-white/40">+</span>
                          <PlayerAvatar name={pb.name} avatarColor={pb.avatarColor} emoji={pb.emoji} imageUrl={pb.imageUrl} size="sm" />
                          <span className="text-sm text-white truncate">{getPairLabel(pair, players)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <GlassButton type="button" variant="ghost" className="flex-1" onClick={handleGeneratePairs}>
                    🔀 Reshuffle
                  </GlassButton>
                  <p className="text-xs text-white/30 self-center">
                    {totalMatches} fixture{totalMatches !== 1 ? "s" : ""} will be generated
                  </p>
                </div>
              </>
            )}
          </GlassCard>
        )}

        {/* Entry fee + prizes */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
            Prize Pot (Optional)
          </h3>
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
