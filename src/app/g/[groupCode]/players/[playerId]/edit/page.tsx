"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { ImageUpload } from "@/components/ui/ImageUpload";
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

  useEffect(() => {
    fetch(`/api/group/${groupCode}`)
      .then((r) => r.json())
      .then(({ groupId }) => {
        return fetch(`/api/group/${groupCode}/players`);
      })
      .then((r) => r.json())
      .then(({ players }) => {
        const p = players?.find((p: Player) => p.id === playerId);
        if (p) {
          setPlayer(p);
          setName(p.name);
          setNickname((p as any).nickname ?? "");
          setNotes((p as any).notes ?? "");
          setAvatarColor(p.avatarColor);
          setEmoji((p as any).emoji ?? null);
          setImageUrl((p as any).imageUrl ?? null);
        }
      });
  }, [groupCode, playerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
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
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  if (!player) {
    return (
      <div>
        <PageHeader title="Edit Player" backHref={`/g/${groupCode}/players/${playerId}`} />
        <div className="text-white/40 text-sm mt-8">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Player" backHref={`/g/${groupCode}/players/${playerId}`} />
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mt-6">

        {/* Photo upload */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Photo</h3>
          <div className="flex items-center gap-6">
            <ImageUpload
              currentUrl={imageUrl}
              onUpload={(url) => setImageUrl(url)}
              onRemove={() => setImageUrl(null)}
              shape="circle"
              size="lg"
            />
            {!imageUrl && (
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-3">Or choose an emoji avatar:</p>
                <EmojiPicker selected={emoji} onSelect={setEmoji} />
              </div>
            )}
          </div>
        </GlassCard>

        {/* Basic info */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Info</h3>
          <div className="space-y-3">
            <GlassInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <GlassInput
              label="Nickname (optional)"
              placeholder="e.g. The Hammer, Lefty..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Playing style, strengths, weaknesses..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-400/60 resize-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* Avatar color */}
        {!imageUrl && (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Avatar Colour</h3>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    avatarColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </GlassCard>
        )}

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Save Changes
        </GlassButton>
      </form>
    </div>
  );
}
