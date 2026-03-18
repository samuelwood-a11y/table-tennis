"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { EmojiPicker } from "@/components/players/EmojiPicker";
import { updatePlayer } from "@/actions/players";
import type { Player } from "@prisma/client";

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

export default function EditPlayerPage({
  params,
}: {
  params: Promise<{ groupCode: string; playerId: string }>;
}) {
  const { groupCode, playerId } = use(params);
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [notes, setNotes] = useState("");
  const [avatarColor, setAvatarColor] = useState("#6366f1");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/group/${groupCode}/players`)
      .then((r) => r.json())
      .then(({ players }) => {
        const p = players?.find((p: any) => p.id === playerId);
        if (p) {
          setPlayer(p);
          setName(p.name ?? "");
          setNickname(p.nickname ?? "");
          setNotes(p.notes ?? "");
          setAvatarColor(p.avatarColor ?? "#6366f1");
          setEmoji(p.emoji ?? null);
          setImageUrl(p.imageUrl ?? null);
        }
      });
  }, [groupCode, playerId]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      await updatePlayer(playerId, {
        name: name.trim(),
        nickname: nickname.trim() || null,
        notes: notes.trim() || null,
        avatarColor,
        emoji: emoji || null,
        imageUrl: imageUrl || null,
      });
      router.push(`/g/${groupCode}/players/${playerId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving");
      setLoading(false);
    }
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-white/10 px-4 py-3 flex items-center gap-3 md:static md:border-none md:bg-transparent md:mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-white/60 hover:text-white transition-colors p-1 -ml-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Edit Player</h1>
      </div>

      <div className="px-4 space-y-4 max-w-lg mx-auto">

        {/* Photo hero */}
        <GlassCard>
          <div className="flex flex-col items-center py-4 gap-4">
            <div className="relative">
              <PlayerAvatar
                name={name || player.name}
                avatarColor={avatarColor}
                emoji={!imageUrl ? emoji : undefined}
                imageUrl={imageUrl}
                size="xl"
              />
            </div>
            <ImageUpload
              currentUrl={imageUrl}
              onUpload={(url) => { setImageUrl(url); setEmoji(null); }}
              onRemove={() => setImageUrl(null)}
              shape="circle"
              size="sm"
              placeholder="📷"
            />
          </div>
        </GlassCard>

        {/* Emoji (only if no photo) */}
        {!imageUrl && (
          <GlassCard>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
              Emoji Avatar
            </h3>
            <EmojiPicker selected={emoji} onSelect={setEmoji} />
          </GlassCard>
        )}

        {/* Name */}
        <GlassCard>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                placeholder="Player name"
                className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/15 transition-all"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. The Hammer, Lefty..."
                className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/15 transition-all"
              />
            </div>
          </div>
        </GlassCard>

        {/* Notes */}
        <GlassCard>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Playing style, strengths, weaknesses..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/15 transition-all resize-none"
          />
        </GlassCard>

        {/* Avatar colour (only if no photo) */}
        {!imageUrl && (
          <GlassCard>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
              Avatar Colour
            </h3>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    avatarColor === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-black/20 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 px-4 py-3 md:relative md:border-none md:bg-transparent md:px-0 md:pt-4 md:max-w-lg md:mx-auto">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 h-12 rounded-xl glass text-white/60 hover:text-white transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <GlassButton
            onClick={handleSave}
            loading={loading}
            className="flex-1 h-12"
            size="lg"
          >
            Save Changes
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
