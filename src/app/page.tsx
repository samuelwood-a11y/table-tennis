"use client";

import { useState, useEffect, useRef } from "react";
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

  // ── Join state ──────────────────────────────────────────────────────────────
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  // ── Create modal state ──────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // drives CSS transition
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [createName, setCreateName] = useState("");
  const [createSport, setCreateSport] = useState("TABLE_TENNIS");
  const [clubName, setClubName] = useState("");
  const [showClubName, setShowClubName] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Animate in
  useEffect(() => {
    if (modalOpen) {
      requestAnimationFrame(() => setModalVisible(true));
      setTimeout(() => nameInputRef.current?.focus(), 80);
    } else {
      setModalVisible(false);
    }
  }, [modalOpen]);

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  function openModal() {
    setCreateStep(1);
    setCreateName("");
    setCreateSport("TABLE_TENNIS");
    setClubName("");
    setShowClubName(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalVisible(false);
    setTimeout(() => setModalOpen(false), 220);
  }

  function handleNameNext(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreateStep(2);
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

  // ── Club grouping ───────────────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 pb-10">
        <div className="w-full max-w-md space-y-4">

          {/* Brand */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🏆</div>
            <h1 className="text-3xl font-bold gradient-text">MatchHub</h1>
            <p className="text-white/40 mt-1 text-sm">Group Sport Competition Manager</p>
          </div>

          {/* Your Groups */}
          {groups.length > 0 && (
            <div>
              <h2 className="text-xs text-white/40 uppercase tracking-wide font-semibold mb-3 px-1">
                Your Groups
              </h2>
              {Object.entries(clubGroups).map(([club, list]) => (
                <div key={club} className="mb-4">
                  <p className="text-xs text-white/30 font-medium mb-2 px-1">{club}</p>
                  <div className="space-y-2 pl-2 border-l border-white/10">
                    {list.map(renderGroupCard)}
                  </div>
                </div>
              ))}
              {ungrouped.length > 0 && (
                <div className="space-y-2">{ungrouped.map(renderGroupCard)}</div>
              )}
            </div>
          )}

          {/* Join Group */}
          <GlassCard>
            <h2 className="text-base font-semibold text-white mb-4">Join a Group</h2>
            <form onSubmit={handleJoin} className="space-y-3">
              <GlassInput
                placeholder="Enter group code…"
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

          {/* Bottom actions */}
          <div className="space-y-2 pt-1">
            {/* Create Group CTA */}
            <button
              onClick={openModal}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl glass glass-hover text-white/50 hover:text-white/80 transition-all text-sm font-medium border border-dashed border-white/15 hover:border-white/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create a Group
            </button>

            <p className="text-center text-white/30 text-xs pt-1">
              <Link href="/forgot-code" className="hover:text-white/50 transition-colors">
                Forgot your group code?
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Create Group Sheet / Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
          style={{ pointerEvents: "auto" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: modalVisible ? 1 : 0 }}
            onClick={closeModal}
          />

          {/* Sheet */}
          <div
            className="relative w-full md:max-w-sm glass rounded-t-3xl md:rounded-2xl z-10 overflow-hidden transition-all duration-220"
            style={{
              transform: modalVisible
                ? "translateY(0)"
                : "translateY(24px)",
              opacity: modalVisible ? 1 : 0,
            }}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pt-3 pb-8 md:pb-6 md:pt-5">
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  {createStep === 2 && (
                    <button
                      onClick={() => setCreateStep(1)}
                      className="text-white/40 hover:text-white/70 transition-colors -ml-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <h2 className="text-base font-semibold text-white">
                    {createStep === 1 ? "Create a Group" : "Choose Sport"}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-1 rounded-full transition-colors ${createStep === 1 ? "bg-violet-400" : "bg-white/20"}`} />
                  <div className={`w-6 h-1 rounded-full transition-colors ${createStep === 2 ? "bg-violet-400" : "bg-white/20"}`} />
                </div>
              </div>

              {/* ── Step 1: Name ── */}
              {createStep === 1 && (
                <form onSubmit={handleNameNext} className="space-y-4">
                  <GlassInput
                    ref={nameInputRef}
                    label="Group Name"
                    placeholder="e.g. Holiday Extras, Friends, FFF…"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    autoComplete="off"
                  />
                  <GlassButton
                    type="submit"
                    className="w-full"
                    disabled={!createName.trim()}
                  >
                    Next →
                  </GlassButton>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors py-1"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* ── Step 2: Sport + optional club ── */}
              {createStep === 2 && (
                <form onSubmit={handleCreate} className="space-y-5">
                  {/* Sport grid */}
                  <div>
                    <p className="text-xs text-white/50 mb-3 font-medium">
                      What sport does this group play?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {SPORTS_LIST.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setCreateSport(s.id)}
                          className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all text-xs font-medium ${
                            createSport === s.id
                              ? "bg-white/20 border-white/40 text-white scale-[1.03]"
                              : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                          }`}
                        >
                          <span className="text-xl">{s.emoji}</span>
                          <span className="leading-tight text-center text-[10px]">
                            {s.name.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional club name */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowClubName(!showClubName)}
                      className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1.5"
                    >
                      <svg
                        className={`w-3 h-3 transition-transform ${showClubName ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Add to a club or community (optional)
                    </button>
                    {showClubName && (
                      <div className="mt-2 space-y-1">
                        <GlassInput
                          placeholder="e.g. FFF, Holiday Extras…"
                          label="Club / Community Name"
                          value={clubName}
                          onChange={(e) => setClubName(e.target.value)}
                        />
                        <p className="text-xs text-white/30">
                          Groups with the same club name appear together on the home screen.
                        </p>
                      </div>
                    )}
                  </div>

                  <GlassButton type="submit" loading={createLoading} className="w-full">
                    Create Group
                  </GlassButton>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
