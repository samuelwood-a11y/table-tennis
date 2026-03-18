"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { SportBadge } from "@/components/ui/SportBadge";
import { useJoinedGroups } from "@/hooks/useJoinedGroups";
import { SPORTS_LIST } from "@/lib/sports";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { groups, removeGroup } = useJoinedGroups();
  const [createName, setCreateName] = useState("");
  const [createSport, setCreateSport] = useState("TABLE_TENNIS");
  const [clubName, setClubName] = useState("");
  const [showClubName, setShowClubName] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Group clubs for display
  const clubGroups: Record<string, typeof groups> = {};
  const ungrouped: typeof groups = [];
  for (const g of groups) {
    if (g.clubName) {
      clubGroups[g.clubName] = clubGroups[g.clubName] ?? [];
      clubGroups[g.clubName].push(g);
    } else {
      ungrouped.push(g);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreateLoading(true);
    const res = await fetch("/api/groups/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createName.trim(),
        sport: createSport,
        clubName: clubName.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (data.code) router.push(`/g/${data.code}`);
    else setCreateLoading(false);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinLoading(true);
    setJoinError("");
    const res = await fetch(`/api/group/${code}`);
    if (res.ok) {
      router.push(`/g/${code}`);
    } else {
      setJoinError("Group not found. Check the code and try again.");
      setJoinLoading(false);
    }
  }

  function renderGroupCard(g: (typeof groups)[0]) {
    return (
      <GlassCard key={g.code} padding="sm" className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <Link href={`/g/${g.code}`} className="block">
            <p className="font-semibold text-white truncate">{g.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <SportBadge sport={g.sport ?? "TABLE_TENNIS"} size="sm" />
              <p className="text-xs text-white/30 font-mono">{g.code}</p>
            </div>
          </Link>
        </div>
        <Link href={`/g/${g.code}`}>
          <GlassButton size="sm">Enter →</GlassButton>
        </Link>
        <button
          onClick={() => removeGroup(g.code)}
          className="text-white/20 hover:text-white/50 transition-colors p-1"
          title="Remove from list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎾</div>
          <h1 className="text-4xl font-bold gradient-text">Racket Sports</h1>
          <p className="text-white/40 mt-1.5 text-sm">Tournament & League Manager</p>
        </div>

        {/* Your Groups */}
        {groups.length > 0 && (
          <div>
            <h2 className="text-xs text-white/40 uppercase tracking-wide font-semibold mb-3 px-1">
              Your Groups
            </h2>

            {/* Club groups */}
            {Object.entries(clubGroups).map(([club, clubGroupList]) => (
              <div key={club} className="mb-4">
                <p className="text-xs text-white/30 font-medium mb-2 px-1">{club}</p>
                <div className="space-y-2 pl-2 border-l border-white/10">
                  {clubGroupList.map(renderGroupCard)}
                </div>
              </div>
            ))}

            {/* Standalone groups */}
            {ungrouped.length > 0 && (
              <div className="space-y-2">
                {ungrouped.map(renderGroupCard)}
              </div>
            )}
          </div>
        )}

        {/* Create Group */}
        <GlassCard>
          <h2 className="text-base font-semibold text-white mb-4">Create a Group</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <GlassInput
              placeholder="e.g. Holiday Extras, Friends..."
              label="Group Name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />

            {/* Sport selector */}
            <div>
              <p className="text-xs text-white/50 mb-2 font-medium">Sport</p>
              <div className="grid grid-cols-3 gap-2">
                {SPORTS_LIST.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCreateSport(s.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-sm font-medium ${
                      createSport === s.id
                        ? "bg-white/20 border-white/40 text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-xs leading-tight text-center">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional club name */}
            <div>
              <button
                type="button"
                onClick={() => setShowClubName(!showClubName)}
                className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
              >
                <span>{showClubName ? "▾" : "▸"}</span>
                <span>Add to a club or community (optional)</span>
              </button>
              {showClubName && (
                <div className="mt-2">
                  <GlassInput
                    placeholder="e.g. FFF, Holiday Extras..."
                    label="Club / Community Name"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                  <p className="text-xs text-white/30 mt-1">
                    Groups with the same club name are shown together on the home screen.
                  </p>
                </div>
              )}
            </div>

            <GlassButton type="submit" loading={createLoading} className="w-full">
              Create Group
            </GlassButton>
          </form>
        </GlassCard>

        {/* Join Group */}
        <GlassCard>
          <h2 className="text-base font-semibold text-white mb-4">Join a Group</h2>
          <form onSubmit={handleJoin} className="space-y-3">
            <GlassInput
              placeholder="Enter group code..."
              label="Group Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
            {joinError && <p className="text-red-400 text-xs">{joinError}</p>}
            <GlassButton type="submit" loading={joinLoading} className="w-full" variant="ghost">
              Join Group
            </GlassButton>
          </form>
        </GlassCard>

        <p className="text-center text-white/30 text-xs">
          <Link href="/forgot-code" className="hover:text-white/50 transition-colors">
            Forgot your group code?
          </Link>
        </p>
      </div>
    </div>
  );
}
