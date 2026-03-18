"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { EmojiPicker } from "@/components/players/EmojiPicker";
import { AVATAR_COLORS } from "@/lib/group";

export default function NewPlayerPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const groupRes = await fetch(`/api/group/${groupCode}`);
      const { groupId } = await groupRes.json();
      await fetch("/api/players/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, name: name.trim(), avatarColor: color, emoji }),
      });
      router.push(`/g/${groupCode}/players`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Add Player" backHref={`/g/${groupCode}/players`} />
      <GlassCard className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <PlayerAvatar name={name || "?"} avatarColor={color} emoji={emoji} size="lg" />
            <div>
              <p className="text-white font-medium">{name || "Player Name"}</p>
              <p className="text-white/40 text-sm">Preview</p>
            </div>
          </div>

          <GlassInput
            label="Name"
            placeholder="Enter player name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="text-sm font-medium text-white/70 block mb-2">Player Icon</label>
            <EmojiPicker selected={emoji} onSelect={setEmoji} />
          </div>

          <div>
            <label className="text-sm font-medium text-white/70 block mb-2">Avatar Color</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <GlassButton type="submit" loading={loading} className="w-full" size="lg">
            Add Player
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
