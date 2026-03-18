"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { useJoinedGroups } from "@/hooks/useJoinedGroups";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { groups, removeGroup } = useJoinedGroups();
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreateLoading(true);
    const res = await fetch("/api/groups/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: createName.trim() }),
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏓</div>
          <h1 className="text-4xl font-bold gradient-text">Table Tennis</h1>
          <p className="text-white/40 mt-1.5 text-sm">Tournament & League Manager</p>
        </div>

        {/* Your Groups */}
        {groups.length > 0 && (
          <div>
            <h2 className="text-xs text-white/40 uppercase tracking-wide font-semibold mb-3 px-1">
              Your Groups
            </h2>
            <div className="space-y-2">
              {groups.map((g) => (
                <GlassCard key={g.code} padding="sm" className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/g/${g.code}`} className="block">
                      <p className="font-semibold text-white truncate">{g.name}</p>
                      <p className="text-xs text-white/30 font-mono">{g.code}</p>
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
              ))}
            </div>
          </div>
        )}

        {/* Create Group */}
        <GlassCard>
          <h2 className="text-base font-semibold text-white mb-4">Create a Group</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <GlassInput
              placeholder="e.g. Holiday Extras, Friends..."
              label="Group Name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              required
            />
            <GlassButton type="submit" loading={createLoading} className="w-full" size="lg">
              Create Group
            </GlassButton>
          </form>
        </GlassCard>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">or join existing</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Join Group */}
        <GlassCard>
          <h2 className="text-base font-semibold text-white mb-4">Join a Group</h2>
          <form onSubmit={handleJoin} className="space-y-3">
            <GlassInput
              placeholder="Enter 6-letter code"
              label="Group Code"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}
              error={joinError}
              required
            />
            <GlassButton type="submit" loading={joinLoading} variant="ghost" className="w-full" size="lg">
              Join Group
            </GlassButton>
          </form>
          <div className="text-center mt-3">
            <Link href="/forgot-code" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Forgot group code?
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
